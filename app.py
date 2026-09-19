from flask import Flask, render_template, jsonify, request
import sqlite3
from database import DATABASE, init_db
import datetime
import calendar
import time
import os

# ============================================================================
#   RECURRING TASK ("Routine") DATE MATH
# ============================================================================
# A routine repeats on a fixed weekday (weekly/biweekly, recurrence_day 0=Mon..6=Sun)
# or a fixed day-of-month (monthly/quarterly/yearly, recurrence_day 1-31, clamped to
# the month's actual length). recurrence_day is optional for backward compatibility:
# with none set, a routine just repeats at a fixed interval, as it always has.

RECURRENCE_STEP_DAYS = {'daily': 1, 'weekly': 7, 'biweekly': 14}
RECURRENCE_STEP_MONTHS = {'monthly': 1, 'quarterly': 3, 'yearly': 12}


def _snap_day_of_month(d, day):
    if not day:
        return d
    last = calendar.monthrange(d.year, d.month)[1]
    return d.replace(day=min(day, last))


def _add_months(d, months):
    m = d.month - 1 + months
    y = d.year + m // 12
    m = m % 12 + 1
    return d.replace(year=y, month=m, day=min(d.day, calendar.monthrange(y, m)[1]))


def _recurrence_step(base_date, rtype, rday):
    """One step forward from base_date, snapped onto the fixed weekday / day-of-month."""
    if rtype in RECURRENCE_STEP_DAYS:
        step = base_date + datetime.timedelta(days=RECURRENCE_STEP_DAYS[rtype])
        if rday is not None and rtype != 'daily':
            step += datetime.timedelta(days=(rday - step.weekday()) % 7)
        return step
    if rtype in RECURRENCE_STEP_MONTHS:
        step = _add_months(base_date, RECURRENCE_STEP_MONTHS[rtype])
        return _snap_day_of_month(step, rday) if rday else step
    return base_date


def compute_next_due_date(base_date, rtype, rday, today=None):
    """Next due date after base_date, rolled forward past `today` so completing a
    backlogged routine late doesn't leave it (or create it) already overdue again."""
    today = today or datetime.date.today()
    next_date = _recurrence_step(base_date, rtype, rday)
    guard = 0
    while next_date < today and guard < 1000:
        next_date = _recurrence_step(next_date, rtype, rday)
        guard += 1
    return next_date


def snap_initial_due_date(base_date, rtype, rday):
    """When a routine is first created, move its due date onto the chosen weekday /
    day-of-month if needed. Only ever moves the date later, never earlier."""
    if rday is None or rtype not in RECURRENCE_STEP_DAYS and rtype not in RECURRENCE_STEP_MONTHS:
        return base_date
    if rtype in RECURRENCE_STEP_DAYS:
        if rtype == 'daily':
            return base_date
        return base_date + datetime.timedelta(days=(rday - base_date.weekday()) % 7)
    snapped = _snap_day_of_month(base_date, rday)
    if snapped < base_date:
        return _snap_day_of_month(_add_months(base_date, RECURRENCE_STEP_MONTHS[rtype]), rday)
    return snapped

# --- 1. App Initialization ---

app = Flask(__name__, static_folder='static', template_folder='templates')

# Function to easily get a database connection
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    # Set row_factory to sqlite3.Row for dictionary-like access to columns
    conn.row_factory = sqlite3.Row
    return conn

# Helper function to execute and commit SQL (Used for C, U, D)
def execute_crud_sql(sql, params):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"Database CRUD Error: {e}")
        conn.close()
        return False

# --- 2. Database Initialization on Startup ---

with app.app_context():
    # CRITICAL FIX: Only initialize if DB doesn't exist
    if not os.path.exists(DATABASE):
        init_db()
    else:
        # Verify schema even if DB exists
        init_db()


# --- 3. API Routes ---

# A. Frontend Route: Serves the main HTML file
@app.route('/')
def index():
    """Serves the main application shell (index.html)."""
    return render_template('index.html')


# B. API Route: Fetches all required lookup data for dropdowns
@app.route('/api/lookups', methods=['GET'])
def get_all_lookups():
    """Returns a JSON object containing all static lookup tables."""
    data = {}
    conn = get_db_connection()
    cursor = conn.cursor()

    tables = [
        'lkp_status', 'lkp_stage', 'lkp_priority', 'lkp_environment', 
        'categories', 'projects', 'subcategories', 'project_groups'
    ]

    for table in tables:
        try:
            # Filter out deleted projects
            if table == 'projects':
                cursor.execute("SELECT * FROM projects WHERE is_deleted = 0 OR is_deleted IS NULL")
            elif table == 'project_groups':
                cursor.execute("SELECT * FROM project_groups ORDER BY sort_order, name")
            elif table in ('lkp_status', 'lkp_stage', 'lkp_priority'):
                cursor.execute(f"SELECT * FROM {table} ORDER BY sort_order, name")
            else:
                cursor.execute(f"SELECT * FROM {table}")
            rows = [dict(row) for row in cursor.fetchall()]
            data[table] = rows
        except sqlite3.Error as e:
            print(f"Error fetching data from table {table}: {e}")
            data[table] = []

    conn.close()
    return jsonify(data)


# C. API Route: Fetches subcategories filtered by category (required for dynamic dropdowns)
@app.route('/api/subcategories/<category_id>', methods=['GET'])
def get_subcategories_by_category(category_id):
    """Returns subcategories linked to the given category ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT scat_id, name, status FROM subcategories WHERE category_id = ?", 
        (category_id,)
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(subcategories=rows)


# D. API Route: Get Task Table Column Settings (ADMIN)
@app.route('/api/admin/columns', methods=['GET'])
def get_column_settings():
    """Returns the current visibility, type, and default settings for Task table columns."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch all relevant column setting fields including is_locked and is_filterable
    sql = "SELECT column_name, display_name, column_type, is_visible, is_default, is_locked, is_filterable, sort_order FROM column_settings ORDER BY sort_order"
    cursor.execute(sql)
    
    columns = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(columns)


# E. API Route: Save Task Table Column Settings (ADMIN)
@app.route('/api/admin/columns', methods=['POST'])
def save_column_settings():
    """Updates the display_name, visibility, filterable status, and sort_order for columns."""
    if not request.json:
        return jsonify({"error": "Invalid request: JSON data required"}), 400
    
    updated_columns = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # First, count how many columns are marked as filterable
        filterable_count = sum(1 for col in updated_columns if col.get('is_filterable') == 1)
        if filterable_count > 5:
            return jsonify({"error": "Cannot have more than 5 filterable columns"}), 400
        
        for item in updated_columns:
            # Check if column is locked - locked columns cannot change visibility
            if item.get('is_locked') == 1:
                # Only update display_name, is_filterable, and sort_order for locked columns
                sql = """
                UPDATE column_settings 
                SET sort_order = ?, display_name = ?, is_filterable = ? 
                WHERE column_name = ?
                """
                cursor.execute(sql, (
                    item['sort_order'], 
                    item['display_name'],
                    item.get('is_filterable', 0),
                    item['column_name']
                ))
            else:
                # Update all editable fields for non-locked columns
                sql = """
                UPDATE column_settings 
                SET is_visible = ?, sort_order = ?, display_name = ?, is_filterable = ? 
                WHERE column_name = ?
                """
                cursor.execute(sql, (
                    item['is_visible'], 
                    item['sort_order'], 
                    item['display_name'],
                    item.get('is_filterable', 0),
                    item['column_name']
                ))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Column settings updated successfully"}), 200

    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error during update: {e}"}), 500

# F. API Route: Add a new generic column (ADMIN)
@app.route('/api/admin/columns/add', methods=['POST'])
def add_new_column():
    """Adds a new user-defined column using the next available generic text_col_X slot."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Find the next available generic text_col_X
        # Note: We check columns that are marked as NOT default (is_default = 0)
        cursor.execute("SELECT column_name, is_visible FROM column_settings WHERE column_name LIKE 'text_col_%' AND is_default = 0 ORDER BY sort_order")
        
        existing_generic_cols = [dict(row) for row in cursor.fetchall()]
        
        available_col = None
        for i in range(1, 11): # Check text_col_1 through text_col_10
            col_name_i = f'text_col_{i}'
            
            # Check if this column name exists in settings
            existing_col = next((c for c in existing_generic_cols if c['column_name'] == col_name_i), None)

            if existing_col:
                # If it exists but is currently not visible (was "deleted"), reuse it
                if existing_col['is_visible'] == 0:
                    available_col = col_name_i
                    break
            else:
                # If it doesn't exist at all, this is the first available slot
                available_col = col_name_i
                break
        
        if not available_col:
            return jsonify({"error": "All 10 generic columns are currently in use."}), 400

        # 2. Get the next sort order
        cursor.execute("SELECT MAX(sort_order) FROM column_settings")
        max_sort_order = cursor.fetchone()[0] or 0
        new_sort_order = max_sort_order + 1

        # 3. Insert or Update the column setting
        new_display_name = request.json.get('display_name', f'Custom Field {available_col.split("_")[-1]}')
        
        if existing_col:
            # Update (reactivate) existing generic column
            sql = """
            UPDATE column_settings 
            SET display_name = ?, is_visible = 1, sort_order = ?
            WHERE column_name = ?
            """
            cursor.execute(sql, (new_display_name, new_sort_order, available_col))
        else:
            # Insert new generic column
            sql = """
            INSERT INTO column_settings 
            (column_name, display_name, column_type, is_visible, is_default, is_locked, is_filterable, sort_order) 
            VALUES (?, ?, ?, 1, 0, 0, 0, ?)
            """
            cursor.execute(sql, (available_col, new_display_name, 'text', new_sort_order))

        conn.commit()
        conn.close()
        return jsonify({
            "message": "Column added successfully", 
            "column_name": available_col, 
            "display_name": new_display_name
        }), 201

    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# G. API Route: Delete/Hide a column (ADMIN)
@app.route('/api/admin/columns/delete/<column_name>', methods=['DELETE'])
def delete_column(column_name):
    """Deletes a user-defined column by setting its visibility to 0 and resetting its name."""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if it's a locked column - locked columns cannot be deleted
        cursor.execute("SELECT is_default, is_locked FROM column_settings WHERE column_name = ?", (column_name,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"error": "Column not found."}), 404
        
        is_default = result['is_default']
        is_locked = result['is_locked']

        if is_locked == 1:
            return jsonify({"error": "Cannot delete locked columns (Task ID, Task Name, Status)."}), 403

        if is_default == 1:
            # For default columns (not locked), we only set is_visible to 0
            sql = "UPDATE column_settings SET is_visible = 0 WHERE column_name = ?"
            cursor.execute(sql, (column_name,))
            message = "Default column hidden successfully."
        else:
            # For user-added columns, we set is_visible to 0 and reset the display name.
            # We don't physically delete the row to save the text_col_X slot.
            new_display_name = f'Custom Field {column_name.split("_")[-1]}'
            sql = "UPDATE column_settings SET is_visible = 0, display_name = ? WHERE column_name = ?"
            cursor.execute(sql, (new_display_name, column_name))
            message = "User-defined column deleted (hidden) successfully."
            
        conn.commit()
        conn.close()
        return jsonify({"message": message}), 200

    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Auto-generate project ID if not provided or empty
        prj_id = data.get('prj_id', '').strip()
        if not prj_id:
            # Generate ID from name: "My Project" -> "prj-my-project"
            name = data.get('name', '').strip()
            if not name:
                return jsonify({"error": "Project name is required"}), 400
            
            # Create base ID from name
            base_id = 'prj-' + name.lower().replace(' ', '-').replace('_', '-')
            # Remove any special characters except hyphens
            base_id = ''.join(c for c in base_id if c.isalnum() or c == '-')
            
            # Check if this ID exists, if so, add number suffix
            prj_id = base_id
            counter = 1
            while True:
                cursor.execute("SELECT COUNT(*) FROM projects WHERE prj_id = ?", (prj_id,))
                if cursor.fetchone()[0] == 0:
                    break
                prj_id = f"{base_id}-{counter}"
                counter += 1
        else:
            # Validate provided ID doesn't have spaces
            if ' ' in prj_id:
                return jsonify({"error": "Project ID cannot contain spaces"}), 400
            
            # Check if ID already exists
            cursor.execute("SELECT COUNT(*) FROM projects WHERE prj_id = ?", (prj_id,))
            if cursor.fetchone()[0] > 0:
                return jsonify({"error": "Project ID already exists"}), 400
        
        # Get other fields
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        status = data.get('status', 'Active')
        project_type = data.get('project_type')
        group_id = data.get('group_id') or None
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not name:
            return jsonify({"error": "Project name is required"}), 400
        
        # Insert project
        cursor.execute("""
            INSERT INTO projects (prj_id, name, description, status, project_type, start_date, end_date, group_id,
                                  problem_project_id, task_group, category_id, subcategory_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (prj_id, name, description, status, project_type, start_date, end_date, group_id,
              data.get('problem_project_id') or None, (data.get('task_group') or '').strip() or None,
              data.get('category_id') or None, data.get('subcategory_id') or None))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Project created successfully",
            "prj_id": prj_id,
            "name": name
        }), 201
        
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/projects/<string:prj_id>', methods=['DELETE'])
def delete_project(prj_id):
    """Soft delete a project (marks as deleted, doesn't remove from DB) or hard delete if ?hard=true"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if project exists
        cursor.execute("SELECT COUNT(*) FROM projects WHERE prj_id = ?", (prj_id,))
        if cursor.fetchone()[0] == 0:
            conn.close()
            return jsonify({"error": "Project not found"}), 404
        
        # Check if hard delete is requested
        hard_delete = request.args.get('hard', 'false').lower() == 'true'
        
        if hard_delete:
            # Permanently delete the project from database
            cursor.execute("DELETE FROM projects WHERE prj_id = ?", (prj_id,))
        else:
            # Soft delete the project - mark as deleted but keep in database
            from datetime import datetime
            deleted_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                "UPDATE projects SET is_deleted = 1, deleted_at = ? WHERE prj_id = ?",
                (deleted_at, prj_id)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Project permanently deleted" if hard_delete else "Project marked as deleted",
            "prj_id": prj_id
        }), 200
        
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500

@app.route('/api/admin/projects/deleted', methods=['GET'])
def get_deleted_projects():
    """Get all deleted projects for trash view"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM projects WHERE is_deleted = 1 ORDER BY deleted_at DESC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(rows), 200
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500

@app.route('/api/admin/projects/<string:prj_id>/restore', methods=['POST'])
def restore_project(prj_id):
    """Restore a deleted project"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if project exists and is deleted
        cursor.execute("SELECT COUNT(*) FROM projects WHERE prj_id = ? AND is_deleted = 1", (prj_id,))
        if cursor.fetchone()[0] == 0:
            conn.close()
            return jsonify({"error": "Deleted project not found"}), 404
        
        # Restore the project
        cursor.execute(
            "UPDATE projects SET is_deleted = 0, deleted_at = NULL WHERE prj_id = ?",
            (prj_id,)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Project restored successfully",
            "prj_id": prj_id
        }), 200
        
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# ========================================================================
#                        TASK CRUD API ROUTES
# ========================================================================

# 1. GET all tasks
@app.route('/api/tasks', methods=['GET'])
def get_all_tasks():
    """Returns all tasks (non-archived, non-deleted by default) with all their fields."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get filter parameters (optional)
        include_archived = request.args.get('include_archived', 'false').lower() == 'true'
        include_deleted = request.args.get('include_deleted', 'false').lower() == 'true'
        
        # Query the tasks table directly
        if include_archived and include_deleted:
            sql = """
                SELECT t.*, p.name as project_name, c.name as category_name, sc.name as subcategory_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.prj_id
                LEFT JOIN categories c ON t.category_id = c.cat_id
                LEFT JOIN subcategories sc ON t.subcategory_id = sc.scat_id
                ORDER BY t.created_at DESC
            """
        elif include_deleted:
            sql = """
                SELECT t.*, p.name as project_name, c.name as category_name, sc.name as subcategory_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.prj_id
                LEFT JOIN categories c ON t.category_id = c.cat_id
                LEFT JOIN subcategories sc ON t.subcategory_id = sc.scat_id
                WHERE t.is_deleted = 1
                ORDER BY t.created_at DESC
            """
        elif include_archived:
            sql = """
                SELECT t.*, p.name as project_name, c.name as category_name, sc.name as subcategory_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.prj_id
                LEFT JOIN categories c ON t.category_id = c.cat_id
                LEFT JOIN subcategories sc ON t.subcategory_id = sc.scat_id
                WHERE t.is_archived = 1 AND t.is_deleted = 0
                ORDER BY t.created_at DESC
            """
        else:
            sql = """
                SELECT t.*, p.name as project_name, c.name as category_name, sc.name as subcategory_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.prj_id AND p.is_deleted = 0
                LEFT JOIN categories c ON t.category_id = c.cat_id
                LEFT JOIN subcategories sc ON t.subcategory_id = sc.scat_id
                WHERE t.is_archived = 0 AND t.is_deleted = 0
                ORDER BY t.created_at DESC
            """
        
        cursor.execute(sql)
        tasks = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(tasks), 200
        
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# 2. GET a single task by ID
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Returns a single task by its ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        task = cursor.fetchone()
        conn.close()
        
        if task:
            return jsonify(dict(task)), 200
        else:
            return jsonify({"error": "Task not found"}), 404
            
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# 3. CREATE a new task
@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Creates a new task. Requires at minimum: title and status_name."""
    if not request.json:
        return jsonify({"error": "Invalid request: JSON data required"}), 400
    
    data = request.json
    
    # Validate required fields
    if 'title' not in data or not data['title'].strip():
        return jsonify({"error": "Title is required"}), 400
    
    if 'status_name' not in data or not data['status_name'].strip():
        return jsonify({"error": "Status is required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Build the INSERT statement dynamically based on provided fields
        # Always include created_at
        fields = ['title', 'status_name', 'created_at']
        values = [data['title'], data['status_name'], datetime.datetime.now().isoformat()]
        
        # Optional fields that might be provided
        optional_fields = [
            'project_id', 'category_id', 'subcategory_id', 'environment_name',
            'priority_name', 'stage_name', 'due_date', 'reminder_date', 'is_archived',
            'service_component', 'assigned_to', 'text_col_3', 'template_source', 'blocked_by',
            'file', 'url', 'task_group', 'comments', 'task_description',
            'recurrence_type', 'recurrence_day', 'recurrence_parent_id', 'recurrence_instance_date', 'branch_name'
        ]
        
        for field in optional_fields:
            if field in data and data[field] is not None:
                fields.append(field)
                values.append(data[field])
        
        # Routines: snap the due date onto the chosen weekday / day-of-month, and fill in
        # recurrence_day from the due date when the caller didn't provide one explicitly.
        rtype = data.get('recurrence_type')
        if rtype:
            rday = data.get('recurrence_day')
            try:
                rday = int(rday) if rday not in (None, '') else None
            except (TypeError, ValueError):
                rday = None
            if 'due_date' in fields and values[fields.index('due_date')]:
                try:
                    due_obj = datetime.datetime.strptime(values[fields.index('due_date')], '%Y-%m-%d').date()
                except ValueError:
                    due_obj = None
                if due_obj:
                    if rday is None and rtype in RECURRENCE_STEP_DAYS and rtype != 'daily':
                        rday = due_obj.weekday()
                    elif rday is None and rtype in RECURRENCE_STEP_MONTHS:
                        rday = due_obj.day
                    values[fields.index('due_date')] = snap_initial_due_date(due_obj, rtype, rday).strftime('%Y-%m-%d')
            if rday is not None:
                if 'recurrence_day' in fields:
                    values[fields.index('recurrence_day')] = rday
                else:
                    fields.append('recurrence_day')
                    values.append(rday)
        
        # Construct SQL
        placeholders = ', '.join(['?'] * len(fields))
        sql = f"INSERT INTO tasks ({', '.join(fields)}) VALUES ({placeholders})"
        
        cursor.execute(sql, values)
        task_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Task created successfully",
            "task_id": task_id
        }), 201
        
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# 4. UPDATE an existing task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Updates an existing task. Only updates fields that are provided in the request."""
    if not request.json:
        return jsonify({"error": "Invalid request: JSON data required"}), 400
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # First check if task exists
        cursor.execute("SELECT id FROM tasks WHERE id = ?", (task_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Task not found"}), 404
        
        # Build UPDATE statement dynamically
        updatable_fields = [
            'title', 'status_name', 'project_id', 'category_id', 'subcategory_id',
            'environment_name', 'priority_name', 'stage_name', 'due_date', 'reminder_date', 'is_archived', 'is_deleted',
            'service_component', 'assigned_to', 'text_col_3', 'template_source', 'blocked_by',
            'file', 'url', 'task_group', 'comments', 'task_description',
            'recurrence_type', 'recurrence_day', 'recurrence_parent_id', 'recurrence_instance_date', 'branch_name'
        ]
        
        update_fields = []
        update_values = []
        
        for field in updatable_fields:
            if field in data:
                update_fields.append(f"{field} = ?")
                update_values.append(data[field])
        
        # Auto-set timestamps
        from datetime import datetime
        if 'is_archived' in data and data['is_archived'] == 1:
            update_fields.append("archived_at = ?")
            update_values.append(datetime.now().isoformat())
        elif 'is_archived' in data and data['is_archived'] == 0:
            update_fields.append("archived_at = ?")
            update_values.append(None)
            
        if 'is_deleted' in data and data['is_deleted'] == 1:
            update_fields.append("deleted_at = ?")
            update_values.append(datetime.now().isoformat())
        elif 'is_deleted' in data and data['is_deleted'] == 0:
            update_fields.append("deleted_at = ?")
            update_values.append(None)
        
        if not update_fields:
            conn.close()
            return jsonify({"error": "No valid fields to update"}), 400
        
        # Add task_id to the end for the WHERE clause
        update_values.append(task_id)
        
        sql = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(sql, update_values)
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Task updated successfully"}), 200
        
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# 5. DELETE a task (soft delete by default, hard delete optional)
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Deletes a task. By default, soft delete (move to trash). Use ?hard=true for permanent deletion."""
    hard_delete = request.args.get('hard', 'false').lower() == 'true'
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if task exists
        cursor.execute("SELECT id FROM tasks WHERE id = ?", (task_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Task not found"}), 404
        
        if hard_delete:
            # Permanent deletion
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            message = "Task permanently deleted"
        else:
            # Soft delete (move to trash)
            cursor.execute("UPDATE tasks SET is_deleted = 1 WHERE id = ?", (task_id,))
            message = "Task moved to trash successfully"
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": message}), 200
        
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# ========================================================================
#                    LOOKUP TABLE CRUD APIs - ADMIN
# ========================================================================

ALLOWED_LOOKUP_TABLES = ['categories', 'projects', 'lkp_status', 'lkp_priority', 'lkp_environment', 'subcategories', 'lkp_stage']

# 1. READ (Get all items in a lookup table)
@app.route('/api/data_model/<table_name>', methods=['GET'])
def get_lookup_data(table_name):
    if table_name not in ALLOWED_LOOKUP_TABLES:
        return jsonify({"error": "Invalid lookup table name"}), 400

    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # For subcategories, we join to get the parent category name for display
        if table_name == 'subcategories':
            sql = """
            SELECT 
                s.scat_id, s.name, s.status, s.category_id, c.name AS category_name
            FROM subcategories s
            JOIN categories c ON s.category_id = c.cat_id
            ORDER BY s.name
            """
        elif table_name in ['lkp_status', 'lkp_priority', 'lkp_stage']:
            sql = f"SELECT * FROM {table_name} ORDER BY sort_order"
        else:
            sql = f"SELECT * FROM {table_name} ORDER BY name"
            
        cursor.execute(sql)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(rows)
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


# 2. CREATE (Add a new item to a lookup table)
@app.route('/api/data_model/<table_name>', methods=['POST'])
def create_lookup_item(table_name):
    if table_name not in ALLOWED_LOOKUP_TABLES or 'name' not in request.json:
        return jsonify({"error": "Invalid request or missing name field"}), 400
    
    name = request.json.get('name')
    status = request.json.get('status', 'Active')
    sort_order = request.json.get('sort_order', 99)
    category_id = request.json.get('category_id') # For subcategories

    if table_name == 'categories':
        item_id = name.lower().replace(' ', '-').replace('/', '').replace('.', '')[:10]
        sql = "INSERT INTO categories (cat_id, name, status) VALUES (?, ?, ?)"
        if execute_crud_sql(sql, (item_id, name, status)):
            return jsonify({"message": f"{table_name} created", "cat_id": item_id}), 201
    
    elif table_name == 'projects':
        item_id = name.lower().replace(' ', '-').replace('/', '').replace('.', '')[:10]
        sql = "INSERT INTO projects (prj_id, name, status) VALUES (?, ?, ?)"
        if execute_crud_sql(sql, (item_id, name, status)):
            return jsonify({"message": f"{table_name} created", "prj_id": item_id}), 201
    
    elif table_name == 'subcategories' and category_id:
        item_id = name.lower().replace(' ', '-').replace('/', '').replace('.', '')[:10]
        sql = "INSERT INTO subcategories (scat_id, name, status, category_id) VALUES (?, ?, ?, ?)"
        if execute_crud_sql(sql, (item_id, name, status, category_id)):
            return jsonify({"message": f"{table_name} created", "scat_id": item_id}), 201

    elif table_name in ['lkp_environment']:
         sql = f"INSERT INTO {table_name} (name, status) VALUES (?, ?)"
         if execute_crud_sql(sql, (name, status)):
            return jsonify({"message": f"{table_name} created"}), 201
            
    elif table_name in ['lkp_status', 'lkp_priority', 'lkp_stage']:
         sql = f"INSERT INTO {table_name} (name, sort_order) VALUES (?, ?)"
         if execute_crud_sql(sql, (name, sort_order)):
            return jsonify({"message": f"{table_name} created"}), 201

    return jsonify({"error": "Failed to create item or missing required fields"}), 500


# 3. UPDATE (Edit an existing item)
@app.route('/api/data_model/<table_name>/<item_id>', methods=['PUT'])
def update_lookup_item(table_name, item_id):
    if table_name not in ALLOWED_LOOKUP_TABLES or not request.json:
        return jsonify({"error": "Invalid request or unsupported table"}), 400
    
    name = request.json.get('name')
    status = request.json.get('status')
    sort_order = request.json.get('sort_order')
    category_id = request.json.get('category_id') # For subcategories

    if table_name == 'categories':
        sql = "UPDATE categories SET name = ?, status = ? WHERE cat_id = ?"
        params = (name, status, item_id)
    elif table_name == 'projects':
        sql = "UPDATE projects SET name = ?, status = ? WHERE prj_id = ?"
        params = (name, status, item_id)
    elif table_name == 'subcategories':
        sql = "UPDATE subcategories SET name = ?, status = ?, category_id = ? WHERE scat_id = ?"
        params = (name, status, category_id, item_id)
    elif table_name in ['lkp_environment']:
         sql = f"UPDATE {table_name} SET name = ?, status = ? WHERE name = ?"
         params = (name, status, item_id)
    elif table_name in ['lkp_status', 'lkp_priority', 'lkp_stage']:
         sql = f"UPDATE {table_name} SET name = ?, sort_order = ? WHERE name = ?"
         params = (name, sort_order, item_id)
    else:
        return jsonify({"error": "Failed to update item"}), 500

    if execute_crud_sql(sql, params):
        return jsonify({"message": f"{table_name} updated"}), 200

    return jsonify({"error": "Failed to update item"}), 500


# 4. DELETE (Remove an item)
@app.route('/api/data_model/<table_name>/<item_id>', methods=['DELETE'])
def delete_lookup_item(table_name, item_id):
    if table_name not in ALLOWED_LOOKUP_TABLES:
        return jsonify({"error": "Unsupported table for deletion"}), 400
    
    if table_name == 'categories':
        sql = "DELETE FROM categories WHERE cat_id = ?"
    elif table_name == 'projects':
        sql = "DELETE FROM projects WHERE prj_id = ?"
    elif table_name == 'subcategories':
        sql = "DELETE FROM subcategories WHERE scat_id = ?"
    elif table_name in ['lkp_status', 'lkp_priority', 'lkp_environment', 'lkp_stage']:
        # Simple lookups use 'name' as PK
        sql = f"DELETE FROM {table_name} WHERE name = ?"
    else:
        return jsonify({"error": "Failed to delete item"}), 500

    if execute_crud_sql(sql, (item_id,)):
        return jsonify({"message": f"{table_name} deleted"}), 200

    return jsonify({"error": "Failed to delete item"}), 500


# ========================================================================
# FILE UPLOAD API
# ========================================================================

@app.route('/api/upload/image', methods=['POST'])
def upload_image():
    """Upload an image file"""
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Create uploads directory if not exists
    upload_dir = os.path.join(app.static_folder, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = int(time.time() * 1000)
    ext = os.path.splitext(file.filename)[1]
    filename = f"img_{timestamp}{ext}"
    
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)
    
    # Return URL path
    url = f"/static/uploads/{filename}"
    return jsonify({"url": url}), 201

# ========================================================================
#                      FAQ PAGES API
# ========================================================================

@app.route('/api/faq/<page_name>', methods=['GET'])
def get_faq_page(page_name):
    """Get FAQ page content"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT content FROM faq_pages WHERE title = ?",
        (page_name,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return jsonify({"content": row['content']})
    return jsonify({"content": ""})

@app.route('/api/faq/<page_name>', methods=['POST'])
def save_faq_page(page_name):
    """Save FAQ page content"""
    content = request.json.get('content', '')
    now = datetime.datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if page exists
    cursor.execute("SELECT page_id FROM faq_pages WHERE title = ?", (page_name,))
    existing = cursor.fetchone()
    
    if existing:
        # Update existing
        cursor.execute(
            "UPDATE faq_pages SET content = ?, updated_at = ? WHERE title = ?",
            (content, now, page_name)
        )
    else:
        # Insert new
        cursor.execute(
            "INSERT INTO faq_pages (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (page_name, content, now, now)
        )
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True})

# ========================================================================
#                      PROJECT UPDATE + PROJECT GROUPS API
# ========================================================================

@app.route('/api/admin/projects/<string:prj_id>', methods=['PUT'])
def update_project(prj_id):
    """Partially update a project (name, description, status, dates, group_id, project_type)."""
    data = request.get_json() or {}
    allowed = ['name', 'description', 'status', 'start_date', 'end_date', 'group_id', 'project_type',
               'problem_project_id', 'task_group', 'category_id', 'subcategory_id']
    fields = [f for f in allowed if f in data]
    if not fields:
        return jsonify({"error": "No updatable fields provided"}), 400
    if 'name' in data and not (data.get('name') or '').strip():
        return jsonify({"error": "Project name cannot be empty"}), 400

    values = []
    for f in fields:
        v = data[f]
        if isinstance(v, str):
            v = v.strip()
        if f in ('group_id', 'problem_project_id', 'task_group', 'category_id', 'subcategory_id') and not v:
            v = None
        values.append(v)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if 'group_id' in fields and values[fields.index('group_id')]:
            cursor.execute("SELECT 1 FROM project_groups WHERE group_id = ?", (values[fields.index('group_id')],))
            if cursor.fetchone() is None:
                conn.close()
                return jsonify({"error": "Group not found"}), 404
        cursor.execute(f"UPDATE projects SET {', '.join(f + ' = ?' for f in fields)} WHERE prj_id = ?",
                       values + [prj_id])
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Project not found"}), 404
        conn.commit()
        conn.close()
        return jsonify({"message": "Project updated", "prj_id": prj_id}), 200
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/project-groups', methods=['GET'])
def get_project_groups():
    scope = request.args.get('scope')
    conn = get_db_connection()
    cursor = conn.cursor()
    if scope:
        cursor.execute("SELECT * FROM project_groups WHERE scope = ? ORDER BY sort_order, name", (scope,))
    else:
        cursor.execute("SELECT * FROM project_groups ORDER BY sort_order, name")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(rows)


@app.route('/api/project-groups', methods=['POST'])
def create_project_group():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    scope = data.get('scope') or 'project'
    if not name:
        return jsonify({"error": "Group name is required"}), 400
    if scope not in ('project', 'problem'):
        return jsonify({"error": "scope must be 'project' or 'problem'"}), 400

    base = 'grp-' + ''.join(c if c.isalnum() else '-' for c in name.lower()).strip('-')
    while '--' in base:
        base = base.replace('--', '-')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        group_id, n = base, 1
        while True:
            cursor.execute("SELECT 1 FROM project_groups WHERE group_id = ?", (group_id,))
            if cursor.fetchone() is None:
                break
            group_id = f"{base}-{n}"
            n += 1
        cursor.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM project_groups WHERE scope = ?", (scope,))
        sort_order = cursor.fetchone()[0]
        cursor.execute(
            "INSERT INTO project_groups (group_id, name, sort_order, scope, created_at) VALUES (?, ?, ?, ?, ?)",
            (group_id, name, sort_order, scope, datetime.datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return jsonify({"group_id": group_id, "name": name, "sort_order": sort_order, "scope": scope}), 201
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/project-groups/<group_id>', methods=['PUT'])
def update_project_group(group_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if 'name' in data:
            name = (data.get('name') or '').strip()
            if not name:
                conn.close()
                return jsonify({"error": "Group name cannot be empty"}), 400
            cursor.execute("UPDATE project_groups SET name = ? WHERE group_id = ?", (name, group_id))
        if 'sort_order' in data:
            cursor.execute("UPDATE project_groups SET sort_order = ? WHERE group_id = ?",
                           (int(data['sort_order']), group_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Group updated"}), 200
    except (sqlite3.Error, ValueError) as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500


@app.route('/api/project-groups/reorder', methods=['POST'])
def reorder_project_groups():
    order = (request.get_json() or {}).get('order', [])
    conn = get_db_connection()
    cursor = conn.cursor()
    for i, gid in enumerate(order):
        cursor.execute("UPDATE project_groups SET sort_order = ? WHERE group_id = ?", (i + 1, gid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Groups reordered"}), 200


@app.route('/api/project-groups/<group_id>', methods=['DELETE'])
def delete_project_group(group_id):
    """Delete a group. Its projects are kept and become ungrouped."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE projects SET group_id = NULL WHERE group_id = ?", (group_id,))
        cursor.execute("DELETE FROM project_groups WHERE group_id = ?", (group_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Group deleted; projects moved to Ungrouped"}), 200
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500

# ========================================================================
#                      DATABASE MIGRATION
# ========================================================================

def ensure_is_deleted_column():
    """Ensure is_deleted column exists in tasks table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_deleted' not in columns:
            print("=" * 70)
            print("DATABASE MIGRATION: Adding is_deleted column to tasks table...")
            print("=" * 70)
            cursor.execute("ALTER TABLE tasks ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0")
            conn.commit()
            print("✅ is_deleted column added successfully!")
            print("=" * 70)
        else:
            print("✅ Database is up to date (is_deleted column exists)")
        
        conn.close()
    except Exception as e:
        print(f"❌ Migration error: {e}")
        conn.close()

# --- User Preferences API ---

@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    """Get all user preferences"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT preference_key, preference_value FROM user_preferences WHERE user_id = 'default'")
    prefs = {row['preference_key']: row['preference_value'] for row in cursor.fetchall()}
    conn.close()
    return jsonify(prefs)

@app.route('/api/preferences/<key>', methods=['GET'])
def get_preference(key):
    """Get a specific preference"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT preference_value FROM user_preferences WHERE user_id = 'default' AND preference_key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({"key": key, "value": row['preference_value']})
    return jsonify({"key": key, "value": None})

@app.route('/api/preferences', methods=['POST'])
def set_preference():
    """Set a preference (upsert)"""
    data = request.get_json()
    key = data.get('key')
    value = data.get('value')
    
    if not key:
        return jsonify({"error": "Missing key"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_preferences (user_id, preference_key, preference_value, updated_at)
        VALUES ('default', ?, ?, datetime('now'))
        ON CONFLICT(user_id, preference_key) 
        DO UPDATE SET preference_value = ?, updated_at = datetime('now')
    """, (key, value, value))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "key": key, "value": value})



# ========================================================================
# RECURRING TASKS ENDPOINTS
# ========================================================================

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
def complete_task(task_id):
    """Complete a task and create next instance if recurring"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        task = cursor.fetchone()
        
        if not task:
            conn.close()
            return jsonify({"error": "Task not found"}), 404
        
        # Mark as Done
        cursor.execute("UPDATE tasks SET status_name = 'Done' WHERE id = ?", (task_id,))
        
        # Handle recurring tasks ("routines")
        if task['recurrence_type'] and task['due_date']:
            from datetime import datetime, timedelta
            
            parent_id = task['recurrence_parent_id']
            
            # If no parent exists yet, this is the first completion
            if not parent_id:
                # Create a hidden parent template from this task
                cursor.execute("""
                    INSERT INTO tasks (
                        title, status_name, project_id, category_id, subcategory_id,
                        environment_name, priority_name, stage_name, due_date,
                        reminder_date, service_component, assigned_to, text_col_3,
                        blocked_by, file, url, task_group, comments, task_description,
                        recurrence_type, recurrence_day, is_deleted, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    task['title'] + ' [TEMPLATE]', 'Done', task['project_id'],
                    task['category_id'], task['subcategory_id'],
                    task['environment_name'], task['priority_name'],
                    task['stage_name'], task['due_date'], task['reminder_date'],
                    task['service_component'], task['assigned_to'],
                    task['text_col_3'], task['blocked_by'], task['file'],
                    task['url'], task['task_group'], task['comments'],
                    task['task_description'], task['recurrence_type'], task['recurrence_day'], 1,
                    datetime.now().isoformat()
                ))
                parent_id = cursor.lastrowid
                
                # Update current task to point to the template
                cursor.execute("""
                    UPDATE tasks SET recurrence_parent_id = ?, recurrence_instance_date = ?
                    WHERE id = ?
                """, (parent_id, task['due_date'], task_id))
            
            # Get parent template
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (parent_id,))
            parent = cursor.fetchone()
            
            if parent:
                current = datetime.strptime(task['due_date'], '%Y-%m-%d').date()
                
                next_date = compute_next_due_date(current, parent['recurrence_type'], parent['recurrence_day'],
                                                   today=datetime.now().date())
                next_date_str = next_date.strftime('%Y-%m-%d')
                
                # Carry the reminder forward at the same distance from the due date
                # (this is what previously reset to no reminder on every occurrence).
                next_reminder_str = None
                if task['reminder_date']:
                    try:
                        old_due = datetime.strptime(task['due_date'], '%Y-%m-%d').date()
                        old_reminder = datetime.strptime(task['reminder_date'], '%Y-%m-%d').date()
                        offset_days = (old_due - old_reminder).days
                        next_reminder_str = (next_date - timedelta(days=offset_days)).strftime('%Y-%m-%d')
                    except ValueError:
                        next_reminder_str = None
                
                # Create next instance
                cursor.execute("""
                    INSERT INTO tasks (
                        title, status_name, project_id, category_id, subcategory_id,
                        environment_name, priority_name, stage_name, due_date,
                        reminder_date, service_component, assigned_to, text_col_3,
                        blocked_by, file, url, task_group, comments, task_description,
                        recurrence_type, recurrence_day, recurrence_parent_id, recurrence_instance_date, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    parent['title'].replace(' [TEMPLATE]', ''), 'To Do', parent['project_id'],
                    parent['category_id'], parent['subcategory_id'],
                    parent['environment_name'], parent['priority_name'],
                    parent['stage_name'], next_date_str, next_reminder_str,
                    parent['service_component'], parent['assigned_to'],
                    parent['text_col_3'], parent['blocked_by'], parent['file'],
                    parent['url'], parent['task_group'], parent['comments'],
                    parent['task_description'], parent['recurrence_type'], parent['recurrence_day'],
                    parent_id, next_date_str,
                    datetime.now().isoformat()
                ))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>/edit-future-instances', methods=['POST'])
def edit_future_instances(task_id):
    """Edit a recurring task and all future instances"""
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400
    
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT recurrence_parent_id FROM tasks WHERE id = ?", (task_id,))
        task = cursor.fetchone()
        
        if not task or not task['recurrence_parent_id']:
            conn.close()
            return jsonify({'error': 'Not a recurring task instance'}), 400
        
        parent_id = task['recurrence_parent_id']
        
        updatable_fields = [
            'title', 'project_id', 'category_id', 'subcategory_id',
            'environment_name', 'priority_name', 'stage_name',
            'service_component', 'assigned_to', 'text_col_3',
            'blocked_by', 'file', 'url', 'task_group', 'comments', 'task_description'
        ]
        
        update_fields = []
        update_values = []
        
        for field in updatable_fields:
            if field in data:
                update_fields.append(f"{field} = ?")
                update_values.append(data[field])
        
        if update_fields:
            update_values.append(parent_id)
            cursor.execute(f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?", update_values)
            
            update_values_current = update_values[:-1] + [task_id]
            cursor.execute(f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?", update_values_current)
        
        conn.commit()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500

# ========================================================================
# BULK OPERATIONS ENDPOINTS
# ========================================================================

@app.route('/api/tasks/bulk-update', methods=['POST'])
def bulk_update_tasks():
    """Bulk update multiple tasks"""
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400
    
    data = request.json
    task_ids = data.get('task_ids', [])
    updates = data.get('updates', {})
    
    if not task_ids or not updates:
        return jsonify({"error": "task_ids and updates required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        updatable_fields = [
            'status_name', 'project_id', 'category_id', 'subcategory_id',
            'environment_name', 'priority_name', 'stage_name', 'due_date',
            'assigned_to', 'is_archived', 'is_deleted'
        ]
        
        update_fields = []
        update_values = []
        
        from datetime import datetime
        
        for field in updatable_fields:
            if field in updates:
                update_fields.append(f"{field} = ?")
                update_values.append(updates[field])
        
        if 'is_archived' in updates and updates['is_archived'] == 1:
            update_fields.append("archived_at = ?")
            update_values.append(datetime.now().isoformat())
        
        if 'is_deleted' in updates and updates['is_deleted'] == 1:
            update_fields.append("deleted_at = ?")
            update_values.append(datetime.now().isoformat())
        
        if not update_fields:
            conn.close()
            return jsonify({"error": "No valid fields to update"}), 400
        
        placeholders = ','.join('?' * len(task_ids))
        query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id IN ({placeholders})"
        
        cursor.execute(query, update_values + task_ids)
        updated_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'updated_count': updated_count}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/bulk-delete', methods=['POST'])
def bulk_delete_tasks():
    """Bulk delete multiple tasks"""
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400
    
    task_ids = request.json.get('task_ids', [])
    
    if not task_ids:
        return jsonify({"error": "task_ids required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        placeholders = ','.join('?' * len(task_ids))
        cursor.execute(f"DELETE FROM tasks WHERE id IN ({placeholders})", task_ids)
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'deleted_count': deleted_count}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({'error': str(e)}), 500


# ========================================================================
#                      SUBTASKS API ENDPOINTS
# ========================================================================

@app.route('/api/tasks/<int:task_id>/subtasks', methods=['GET'])
def get_subtasks(task_id):
    """Get all subtasks for a task"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, parent_task_id, parent_subtask_id, title, is_completed, sort_order, created_at, updated_at
        FROM subtasks
        WHERE parent_task_id = ?
        ORDER BY sort_order ASC, id ASC
    ''', (task_id,))
    
    columns = [col[0] for col in cursor.description]
    subtasks = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(subtasks)

@app.route('/api/tasks/<int:task_id>/subtasks', methods=['POST'])
def create_subtask(task_id):
    """Create a new subtask"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get max sort_order
    cursor.execute('SELECT MAX(sort_order) FROM subtasks WHERE parent_task_id = ?', (task_id,))
    max_order = cursor.fetchone()[0] or 0
    
    cursor.execute('''
        INSERT INTO subtasks (parent_task_id, parent_subtask_id, title, is_completed, sort_order)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        task_id,
        data.get('parent_subtask_id'),
        data.get('title', ''),
        data.get('is_completed', 0),
        max_order + 1
    ))
    
    subtask_id = cursor.lastrowid
    conn.commit()
    
    # Return created subtask
    cursor.execute('SELECT * FROM subtasks WHERE id = ?', (subtask_id,))
    columns = [col[0] for col in cursor.description]
    subtask = dict(zip(columns, cursor.fetchone()))
    
    conn.close()
    return jsonify(subtask), 201

@app.route('/api/subtasks/<int:subtask_id>', methods=['PUT'])
def update_subtask(subtask_id):
    """Update a subtask"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    update_fields = []
    update_values = []
    
    if 'title' in data:
        update_fields.append('title = ?')
        update_values.append(data['title'])
    
    if 'is_completed' in data:
        update_fields.append('is_completed = ?')
        update_values.append(data['is_completed'])
    
    if 'sort_order' in data:
        update_fields.append('sort_order = ?')
        update_values.append(data['sort_order'])
    
    if 'parent_subtask_id' in data:
        update_fields.append('parent_subtask_id = ?')
        update_values.append(data['parent_subtask_id'])
    
    update_fields.append('updated_at = ?')
    update_values.append(datetime.datetime.now().isoformat())
    
    update_values.append(subtask_id)
    
    cursor.execute(f'''
        UPDATE subtasks 
        SET {', '.join(update_fields)}
        WHERE id = ?
    ''', update_values)
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Subtask updated"}), 200

@app.route('/api/subtasks/<int:subtask_id>', methods=['DELETE'])
def delete_subtask(subtask_id):
    """Delete a subtask and all its children"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM subtasks WHERE id = ?', (subtask_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Subtask deleted"}), 200

@app.route('/api/subtasks/<int:subtask_id>/convert', methods=['POST'])
def convert_subtask_to_task(subtask_id):
    """Convert a subtask to a full task"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get subtask details
    cursor.execute('SELECT * FROM subtasks WHERE id = ?', (subtask_id,))
    subtask = dict(zip([col[0] for col in cursor.description], cursor.fetchone()))
    
    if not subtask:
        conn.close()
        return jsonify({"error": "Subtask not found"}), 404
    
    # Get parent task details
    cursor.execute('SELECT * FROM tasks WHERE id = ?', (subtask['parent_task_id'],))
    parent_task = dict(zip([col[0] for col in cursor.description], cursor.fetchone()))
    
    # Create new task with subtask title and parent task properties
    cursor.execute('''
        INSERT INTO tasks (
            title, status_name, project_id, category_id, subcategory_id,
            environment_name, priority_name, stage_name, task_group
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        subtask['title'],
        'To Do',
        parent_task.get('project_id'),
        parent_task.get('category_id'),
        parent_task.get('subcategory_id'),
        parent_task.get('environment_name'),
        parent_task.get('priority_name'),
        parent_task.get('stage_name'),
        parent_task.get('task_group')
    ))
    
    new_task_id = cursor.lastrowid
    
    # Delete the subtask
    cursor.execute('DELETE FROM subtasks WHERE id = ?', (subtask_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": "Subtask converted to task",
        "task_id": new_task_id
    }), 200

@app.route('/api/subtasks/reorder', methods=['POST'])
def reorder_subtasks():
    """Reorder subtasks"""
    data = request.json
    subtask_orders = data.get('subtasks', [])  # [{id, sort_order}, ...]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for item in subtask_orders:
        cursor.execute('''
            UPDATE subtasks 
            SET sort_order = ?, updated_at = ?
            WHERE id = ?
        ''', (item['sort_order'], datetime.datetime.now().isoformat(), item['id']))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Subtasks reordered"}), 200




# ============================================================================
# CAUSES API (for Problem Pages Fishbone Diagram)
# ============================================================================

@app.route('/api/causes', methods=['GET'])
def get_causes():
    """Get all causes, optionally filtered by problem_id"""
    problem_id = request.args.get('problem_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if problem_id:
        cursor.execute("SELECT * FROM causes WHERE problem_id = ? ORDER BY branch_name, id", (problem_id,))
    else:
        cursor.execute("SELECT * FROM causes ORDER BY problem_id, branch_name, id")
    
    causes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(causes)

@app.route('/api/causes', methods=['POST'])
def create_cause():
    """Create a new cause"""
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO causes (problem_id, branch_name, branch_position, cause_text, status, comments, project_id, task_group)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('problem_id'),
        data.get('branch_name'),
        data.get('branch_position', 'top'),
        data.get('cause_text'),
        data.get('status', 'Open'),
        data.get('comments', ''),
        data.get('project_id') or None,
        (data.get('task_group') or '').strip() or None
    ))
    
    cause_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Cause created", "id": cause_id}), 201

@app.route('/api/causes/<int:cause_id>', methods=['PUT'])
def update_cause(cause_id):
    """Update a cause"""
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    
    for field in ['cause_text', 'status', 'comments', 'branch_name', 'branch_position', 'project_id', 'task_group']:
        if field in data:
            value = data[field]
            if field in ('project_id', 'task_group'):
                value = (value or '').strip() or None
            updates.append(f"{field} = ?")
            values.append(value)
    
    if updates:
        values.append(cause_id)
        cursor.execute(f"UPDATE causes SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)
        conn.commit()
    
    conn.close()
    return jsonify({"message": "Cause updated"})

@app.route('/api/causes/<int:cause_id>', methods=['DELETE'])
def delete_cause(cause_id):
    """Delete a cause"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM causes WHERE id = ?", (cause_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Cause deleted"})


# ─── FOCUS BOARD API ───────────────────────────────────────────────────────────

@app.route('/api/focus', methods=['GET'])
def get_focus_tasks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, pr.name as project_name
        FROM tasks t
        LEFT JOIN projects pr ON t.project_id = pr.prj_id
        WHERE t.focus_date IS NOT NULL AND t.focus_date != ''
          AND (t.is_deleted IS NULL OR t.is_deleted = 0)
        ORDER BY t.focus_date ASC, t.id ASC
    """)
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(tasks)

@app.route('/api/focus/<int:task_id>', methods=['PUT'])
def set_focus_date(task_id):
    data = request.get_json()
    focus_date = data.get('focus_date')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET focus_date = ? WHERE id = ?", (focus_date, task_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Focus date updated", "task_id": task_id, "focus_date": focus_date})

@app.route('/api/focus/<int:task_id>/done', methods=['PUT'])
def focus_mark_done(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Get 'Done' status name
    cursor.execute("SELECT name FROM lkp_status WHERE LOWER(name) = 'done' LIMIT 1")
    row = cursor.fetchone()
    done_status = row['name'] if row else 'Done'
    cursor.execute(
        "UPDATE tasks SET focus_date = NULL, status_name = ? WHERE id = ?",
        (done_status, task_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Task marked done and removed from Focus Board"})


import os

if __name__ == '__main__':
    # Ensure user_preferences table exists
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT DEFAULT 'default',
                preference_key TEXT NOT NULL,
                preference_value TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, preference_key)
            )
        """)
        conn.commit()
        conn.close()
        print("[STARTUP] user_preferences table verified")
    except Exception as e:
        print(f"[STARTUP ERROR] Could not create user_preferences table: {e}")
    
    # Run migration before starting the app
    ensure_is_deleted_column()

    # Get port from Render environment (defaults to 5000 locally)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
