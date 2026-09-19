import sqlite3
import os
import shutil
from datetime import datetime

# SynAppz database file.
# On first launch, if only the legacy Synaapz database exists, it is COPIED
# (never moved) to the new name, so the original file stays as a backup.
DATABASE = 'synappz.db'
LEGACY_DATABASE = 'synaapz.db'

if not os.path.exists(DATABASE) and os.path.exists(LEGACY_DATABASE):
    shutil.copy2(LEGACY_DATABASE, DATABASE)
    print(f"📦 Copied legacy database '{LEGACY_DATABASE}' -> '{DATABASE}' (original left untouched)")

# Subtasks table for checklist items
SUBTASKS_TABLE = """
CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_task_id INTEGER NOT NULL,
    parent_subtask_id INTEGER DEFAULT NULL,
    title TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE
);
"""

# Causes table for problem pages (fishbone diagram)
CAUSES_TABLE = """
CREATE TABLE IF NOT EXISTS causes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    branch_position TEXT NOT NULL,
    cause_text TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    comments TEXT,
    project_id TEXT,
    task_group TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES projects(prj_id) ON DELETE CASCADE
);
"""

STATUS_LOOKUPS = """
CREATE TABLE IF NOT EXISTS lkp_status (
    name TEXT PRIMARY KEY NOT NULL,
    sort_order INTEGER
);
"""

STAGE_LOOKUPS = """
CREATE TABLE IF NOT EXISTS lkp_stage (
    name TEXT PRIMARY KEY NOT NULL,
    sort_order INTEGER,
    color TEXT
);
"""

PRIORITY_LOOKUPS = """
CREATE TABLE IF NOT EXISTS lkp_priority (
    name TEXT PRIMARY KEY NOT NULL,
    sort_order INTEGER
);
"""

ENVIRONMENT_LOOKUPS = """
CREATE TABLE IF NOT EXISTS lkp_environment (
    name TEXT PRIMARY KEY NOT NULL,
    status TEXT
);
"""

CATEGORIES_TABLE = """
CREATE TABLE IF NOT EXISTS categories (
    cat_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    status TEXT
);
"""

SUBCATEGORIES_TABLE = """
CREATE TABLE IF NOT EXISTS subcategories (
    scat_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    status TEXT,
    category_id TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (cat_id)
);
"""

PROJECTS_TABLE = """
CREATE TABLE IF NOT EXISTS projects (
    prj_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    project_type TEXT,
    start_date TEXT,
    end_date TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    group_id TEXT,
    problem_project_id TEXT,
    task_group TEXT,
    category_id TEXT,
    subcategory_id TEXT
);
"""

USER_PREFERENCES_TABLE = """
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    preference_key TEXT NOT NULL,
    preference_value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);
"""

COLUMN_SETTINGS_TABLE = """
CREATE TABLE IF NOT EXISTS column_settings (
    column_name TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    column_type TEXT NOT NULL,
    is_visible INTEGER NOT NULL DEFAULT 1,
    is_default INTEGER NOT NULL DEFAULT 1,
    is_locked INTEGER NOT NULL DEFAULT 0,
    is_filterable INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);
"""

FAQ_PAGES_TABLE = """
CREATE TABLE IF NOT EXISTS faq_pages (
    page_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""

# Project groups (used to organise projects on the All Projects page)
PROJECT_GROUPS_TABLE = """
CREATE TABLE IF NOT EXISTS project_groups (
    group_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    scope TEXT NOT NULL DEFAULT 'project',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""

TASKS_TABLE = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status_name TEXT NOT NULL,
    project_id TEXT,
    category_id TEXT,
    subcategory_id TEXT,
    environment_name TEXT,
    priority_name TEXT,
    stage_name TEXT DEFAULT 'Backlog',
    created_at TEXT NOT NULL,
    due_date TEXT,
    reminder_date TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    archived_at TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    service_component TEXT,
    assigned_to TEXT,
    text_col_3 TEXT,
    template_source TEXT,
    blocked_by TEXT,
    file TEXT,
    url TEXT,
    task_group TEXT,
    comments TEXT,
    task_description TEXT,
    recurrence_type TEXT,
    recurrence_day INTEGER,
    recurrence_parent_id INTEGER,
    recurrence_instance_date TEXT,
    branch_name TEXT,
    FOREIGN KEY (project_id) REFERENCES projects (prj_id),
    FOREIGN KEY (category_id) REFERENCES categories (cat_id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories (scat_id),
    FOREIGN KEY (environment_name) REFERENCES lkp_environment (name),
    FOREIGN KEY (priority_name) REFERENCES lkp_priority (name),
    FOREIGN KEY (status_name) REFERENCES lkp_status (name),
    FOREIGN KEY (stage_name) REFERENCES lkp_stage (name),
    FOREIGN KEY (recurrence_parent_id) REFERENCES tasks (id)
);
"""

INITIAL_STATUS = [
    # Default Status lookup values (only inserted when the status table is empty)
    ('To Do', 1),
    ('In Progress', 2),
    ('Waiting', 3),
    ('On-Hold', 4),
    ('Cancelled', 5),
    ('Done', 6),
]

INITIAL_PRIORITY = [
    # No default data - user will add their own
]

INITIAL_STAGE = [
    # Default Stage lookup values: (name, sort_order, color)
    ('Backlog', 1, '#6c757d'),
    ('Analyze', 2, '#17a2b8'),
    ('Build', 3, '#007bff'),
    ('Test', 4, '#fd7e14'),
    ('Document', 5, '#6f42c1'),
    ('Release', 6, '#28a745'),
    ('Announce', 7, '#20c997'),
]

INITIAL_ENVIRONMENT = [
    # No default data - user will add their own
]

INITIAL_CATEGORIES = [
    # No default data - user will add their own
]

INITIAL_PROJECTS = [
    # No default data - user will add their own
]

INITIAL_SUBCATEGORIES = [
    # No default data - user will add their own
]

INITIAL_COLUMN_SETTINGS = [
    # Primary (always visible, locked)
    ('id', 'Task ID', 'number', 1, 1, 1, 0, 0),
    ('title', 'Task Name', 'text', 1, 1, 1, 0, 1),
    ('status_name', 'Status', 'lookup_status', 1, 1, 1, 1, 2),
    
    # Task Content
    ('task_description', 'Task Description', 'text', 1, 1, 0, 0, 3),
    ('comments', 'Comments', 'text', 1, 1, 0, 0, 4),
    ('url', 'URL', 'text', 1, 1, 0, 0, 5),
    ('file', 'File', 'text', 1, 1, 0, 0, 6),
    
    # Task Category
    ('task_group', 'Task Group', 'text', 1, 1, 0, 0, 7),
    ('project_id', 'Task Project', 'lookup_projects', 1, 1, 0, 1, 8),
    ('subcategory_id', 'Sub-Category', 'lookup_subcategories', 1, 1, 0, 1, 9),
    ('category_id', 'Category', 'lookup_categories', 0, 1, 0, 1, 10),
    
    # Task Data
    ('stage_name', 'Stage', 'lookup_stage', 1, 1, 0, 0, 11),
    ('assigned_to', 'Assigned To', 'text', 1, 1, 0, 0, 12),
    ('priority_name', 'Priority', 'lookup_priority', 1, 1, 0, 1, 13),
    ('environment_name', 'Environment', 'lookup_environment', 0, 1, 0, 0, 14),
    ('service_component', 'Service/Component', 'text', 0, 1, 0, 0, 15),
    
    # Task Dates
    ('due_date', 'Due Date', 'date', 1, 1, 0, 0, 16),
    ('reminder_date', 'Reminder Date', 'date', 0, 1, 0, 0, 17),
    ('created_at', 'Created Date', 'date', 0, 1, 0, 0, 18),
    
    # Column Section (all other properties)
    ('text_col_3', 'Stakeholders', 'text', 0, 0, 0, 0, 19),
    ('template_source', 'Template Source', 'text', 0, 0, 0, 0, 20),
    ('blocked_by', 'Blocked By', 'text', 0, 0, 0, 0, 21),
    ('recurrence_type', 'Recurrence', 'text', 1, 0, 0, 0, 22),
]

def _table_exists(cursor, name):
    cursor.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,))
    return cursor.fetchone() is not None


def _column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def _slug(text):
    base = ''.join(c if c.isalnum() else '-' for c in (text or '').lower())
    while '--' in base:
        base = base.replace('--', '-')
    return base.strip('-') or 'group'


def move_done_status_last_once(cursor):
    """
    One-time (v31): if the Status list still has the original default order
    (To Do, In Progress, Done, Waiting, On-Hold, Cancelled), move Done to the end
    so dropdowns match the boards. Custom status lists are left alone.
    """
    marker = 'status_done_last_v31'
    cursor.execute("SELECT 1 FROM user_preferences WHERE preference_key = ?", (marker,))
    if cursor.fetchone():
        return
    cursor.execute("SELECT name FROM lkp_status ORDER BY sort_order")
    names = [r[0] for r in cursor.fetchall()]
    if names == ['To Do', 'In Progress', 'Done', 'Waiting', 'On-Hold', 'Cancelled']:
        for i, name in enumerate(['To Do', 'In Progress', 'Waiting', 'On-Hold', 'Cancelled', 'Done'], 1):
            cursor.execute("UPDATE lkp_status SET sort_order = ? WHERE name = ?", (i, name))
        print("✅ Moved 'Done' to the end of the Status list")
    cursor.execute("INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES ('default', ?, 'done')", (marker,))


def seed_default_stages_once(cursor):
    """
    One-time (v30): make sure the default stages exist in databases that already had stages.
    Missing defaults are appended after the existing stages. Runs only once, so stages you
    delete or rename later are not added back.
    """
    marker = 'seed_default_stages_v30'
    cursor.execute("SELECT 1 FROM user_preferences WHERE preference_key = ?", (marker,))
    if cursor.fetchone():
        return
    cursor.execute("SELECT COUNT(*) FROM lkp_stage")
    if cursor.fetchone()[0] > 0:
        cursor.execute("SELECT name FROM lkp_stage")
        existing = {r[0].strip().lower() for r in cursor.fetchall()}
        cursor.execute("SELECT COALESCE(MAX(sort_order), 0) FROM lkp_stage")
        next_order = cursor.fetchone()[0] + 1
        added = []
        for name, _, color in INITIAL_STAGE:
            if name.lower() not in existing:
                cursor.execute("INSERT INTO lkp_stage (name, sort_order, color) VALUES (?, ?, ?)", (name, next_order, color))
                next_order += 1
                added.append(name)
        if added:
            print(f"✅ Added default stages: {', '.join(added)}")
    cursor.execute("INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES ('default', ?, 'done')", (marker,))


def migrate_to_synappz_v20(cursor):
    """
    One-time, idempotent migration from Synaapz (wiki + custom groups/pages) to SynAppz.

    1. Custom PROJECT pages -> project groups (projects keep their membership).
    2. Custom PROBLEM pages -> projects get project_type = 'Problem' (shown on All Problems).
    3. Drops custom page tables, wiki tables, wiki/page task columns and their column settings.
    """
    if not _column_exists(cursor, 'projects', 'group_id'):
        cursor.execute("ALTER TABLE projects ADD COLUMN group_id TEXT")
        print("✅ Added group_id column to projects table")
    # Problem properties (problems are projects with project_type = 'Problem')
    for col in ('problem_project_id', 'task_group', 'category_id', 'subcategory_id'):
        if not _column_exists(cursor, 'projects', col):
            cursor.execute(f"ALTER TABLE projects ADD COLUMN {col} TEXT")
            print(f"✅ Added {col} column to projects table")
    # Root cause properties
    if _table_exists(cursor, 'causes'):
        for col in ('project_id', 'task_group'):
            if not _column_exists(cursor, 'causes', col):
                cursor.execute(f"ALTER TABLE causes ADD COLUMN {col} TEXT")
                print(f"✅ Added {col} column to causes table")
    if not _column_exists(cursor, 'tasks', 'recurrence_day'):
        cursor.execute("ALTER TABLE tasks ADD COLUMN recurrence_day INTEGER")
        print("✅ Added recurrence_day column to tasks table (specific weekday / day-of-month for routines)")
    if not _column_exists(cursor, 'project_groups', 'scope'):
        cursor.execute("ALTER TABLE project_groups ADD COLUMN scope TEXT NOT NULL DEFAULT 'project'")
        print("✅ Added scope column to project_groups (project / problem groups)")

    legacy_tables = ['custom_pages', 'custom_page_groups', 'wiki_categories', 'wiki_subcategories',
                     'wiki_projects', 'wiki_groups', 'wiki_tags', 'wiki_pages', 'wiki_button_labels']
    has_legacy = any(_table_exists(cursor, t) for t in legacy_tables) or \
        _column_exists(cursor, 'tasks', 'wiki_links') or _column_exists(cursor, 'tasks', 'page_name')
    if not has_legacy:
        return

    # Safety backup before any destructive change
    try:
        cursor.connection.commit()
        stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup = f"synappz_backup_before_v20_{stamp}.db"
        shutil.copy2(DATABASE, backup)
        print(f"💾 Backup created: {backup}")
    except Exception as e:
        print(f"⚠️  Could not create backup before migration: {e}")

    if _table_exists(cursor, 'custom_pages'):
        cursor.execute("SELECT name, page_type, sort_order FROM custom_pages")
        for name, page_type, sort_order in cursor.fetchall():
            cursor.execute("SELECT COUNT(*) FROM projects WHERE project_type = ?", (name,))
            if cursor.fetchone()[0] == 0:
                continue
            if page_type == 'problem':
                cursor.execute("UPDATE projects SET project_type = 'Problem' WHERE project_type = ?", (name,))
                print(f"✅ Problem page '{name}' -> All Problems")
            elif page_type == 'project':
                group_id = 'grp-' + _slug(name)
                cursor.execute("SELECT 1 FROM project_groups WHERE group_id = ?", (group_id,))
                if cursor.fetchone() is None:
                    cursor.execute(
                        "INSERT INTO project_groups (group_id, name, sort_order, created_at) VALUES (?, ?, ?, ?)",
                        (group_id, name, sort_order or 0, datetime.now().isoformat()))
                cursor.execute("UPDATE projects SET group_id = ?, project_type = NULL WHERE project_type = ?",
                               (group_id, name))
                print(f"✅ Project page '{name}' -> project group '{name}'")

    for t in legacy_tables:
        cursor.execute(f"DROP TABLE IF EXISTS {t}")

    for col in ('wiki_links', 'page_name'):
        if _column_exists(cursor, 'tasks', col):
            try:
                cursor.execute(f"ALTER TABLE tasks DROP COLUMN {col}")
            except sqlite3.OperationalError as e:
                cursor.execute(f"UPDATE tasks SET {col} = NULL")
                print(f"⚠️  Could not drop tasks.{col} ({e}); values cleared instead")

    cursor.execute("DELETE FROM column_settings WHERE column_name IN ('wiki_links', 'page_name')")
    if _table_exists(cursor, 'user_preferences'):
        cursor.execute("DELETE FROM user_preferences WHERE preference_key = 'default_wiki_tab'")
    print("✅ Wiki, custom groups and custom pages removed (SynAppz v20)")


def init_db():
    conn = None
    try:
        db_exists = os.path.exists(DATABASE)
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()

        def insert_data_if_empty(table_name, data, columns):
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            
            if count == 0:
                print(f"Inserting initial data into {table_name}...")
                placeholders = ', '.join(['?'] * len(columns))
                sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
                cursor.executemany(sql, data)

        cursor.execute(STATUS_LOOKUPS)
        cursor.execute(STAGE_LOOKUPS)
        cursor.execute(PRIORITY_LOOKUPS)
        cursor.execute(ENVIRONMENT_LOOKUPS)
        cursor.execute(CATEGORIES_TABLE)
        cursor.execute(PROJECTS_TABLE)
        cursor.execute(SUBCATEGORIES_TABLE)
        cursor.execute(USER_PREFERENCES_TABLE)
        cursor.execute(COLUMN_SETTINGS_TABLE)
        cursor.execute(TASKS_TABLE)
        cursor.execute(SUBTASKS_TABLE)
        cursor.execute(CAUSES_TABLE)
        
        cursor.execute(FAQ_PAGES_TABLE)
        cursor.execute(PROJECT_GROUPS_TABLE)

        # Migration: rename legacy text_col_* task columns (replaces the old migrate_columns.py script)
        legacy_renames = {
            'text_col_1': 'service_component', 'text_col_2': 'assigned_to', 'text_col_4': 'template_source',
            'text_col_5': 'blocked_by', 'text_col_6': 'file', 'text_col_7': 'url', 'text_col_8': 'task_group',
            'text_col_9': 'comments', 'text_col_10': 'task_description'
        }
        for old_col, new_col in legacy_renames.items():
            if _column_exists(cursor, 'tasks', old_col) and not _column_exists(cursor, 'tasks', new_col):
                cursor.execute(f"ALTER TABLE tasks RENAME COLUMN {old_col} TO {new_col}")
                print(f"✅ Renamed tasks.{old_col} -> {new_col}")

        # Migration: Add color column to lkp_stage if it doesn't exist
        try:
            cursor.execute("SELECT color FROM lkp_stage LIMIT 1")
        except sqlite3.OperationalError:
            # Column doesn't exist, add it
            cursor.execute("ALTER TABLE lkp_stage ADD COLUMN color TEXT")
            print("✅ Added color column to lkp_stage table")
        
        # Migration: Add reminder_date column to tasks if it doesn't exist
        try:
            cursor.execute("SELECT reminder_date FROM tasks LIMIT 1")
        except sqlite3.OperationalError:
            # Column doesn't exist, add it
            cursor.execute("ALTER TABLE tasks ADD COLUMN reminder_date TEXT")
            print("✅ Added reminder_date column to tasks table")
        
        # Migration: Add is_deleted and deleted_at columns to projects if they don't exist
        try:
            cursor.execute("SELECT is_deleted FROM projects LIMIT 1")
        except sqlite3.OperationalError:
            # Columns don't exist, add them
            cursor.execute("ALTER TABLE projects ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0")
            cursor.execute("ALTER TABLE projects ADD COLUMN deleted_at TEXT")
            print("✅ Added is_deleted and deleted_at columns to projects table")
        
        # Migration: Add reminder_date to column_settings if it doesn't exist
        # Only for EXISTING databases (check if other columns exist first)
        cursor.execute("SELECT COUNT(*) FROM column_settings")
        column_count = cursor.fetchone()[0]
        
        if column_count > 0:  # Existing database with columns
            cursor.execute("SELECT COUNT(*) FROM column_settings WHERE column_name = 'reminder_date'")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                    INSERT INTO column_settings (column_name, display_name, column_type, is_visible, is_default, is_locked, is_filterable, sort_order)
                    VALUES ('reminder_date', 'Reminder Date', 'date', 0, 1, 0, 0, 17)
                """)
                # Update sort_order for created_at and others
                cursor.execute("UPDATE column_settings SET sort_order = 18 WHERE column_name = 'created_at'")
                cursor.execute("UPDATE column_settings SET sort_order = 19 WHERE column_name = 'text_col_3'")
                cursor.execute("UPDATE column_settings SET sort_order = 20 WHERE column_name = 'template_source'")
                cursor.execute("UPDATE column_settings SET sort_order = 21 WHERE column_name = 'blocked_by'")
                print("✅ Added reminder_date to column_settings")
        # For new databases, reminder_date is already in INITIAL_COLUMN_SETTINGS
        
        # Migration: Add project_type column to projects if it doesn't exist
        try:
            cursor.execute("SELECT project_type FROM projects LIMIT 1")
        except sqlite3.OperationalError:
            # Column doesn't exist, add it
            cursor.execute("ALTER TABLE projects ADD COLUMN project_type TEXT")
            print("✅ Added project_type column to projects table")
        
        # Migration: Add branch_name column to tasks if it doesn't exist
        try:
            cursor.execute("SELECT branch_name FROM tasks LIMIT 1")
        except sqlite3.OperationalError:
            # Column doesn't exist, add it
            cursor.execute("ALTER TABLE tasks ADD COLUMN branch_name TEXT")
            print("✅ Added branch_name column to tasks table")
        
        # Migration: Reorganize column sort orders to match new section structure
        # This updates existing databases to have proper ordering
        if column_count > 0:  # Existing database
            print("✅ Reorganizing column sort orders...")
            # Task Content
            cursor.execute("UPDATE column_settings SET sort_order = 3 WHERE column_name = 'task_description'")
            cursor.execute("UPDATE column_settings SET sort_order = 4 WHERE column_name = 'comments'")
            cursor.execute("UPDATE column_settings SET sort_order = 5 WHERE column_name = 'url'")
            cursor.execute("UPDATE column_settings SET sort_order = 6 WHERE column_name = 'file'")
            
            # Task Category
            cursor.execute("UPDATE column_settings SET sort_order = 7 WHERE column_name = 'task_group'")
            cursor.execute("UPDATE column_settings SET sort_order = 8 WHERE column_name = 'project_id'")
            cursor.execute("UPDATE column_settings SET sort_order = 9 WHERE column_name = 'subcategory_id'")
            cursor.execute("UPDATE column_settings SET sort_order = 10 WHERE column_name = 'category_id'")
            
            # Task Data
            cursor.execute("UPDATE column_settings SET sort_order = 11 WHERE column_name = 'stage_name'")
            cursor.execute("UPDATE column_settings SET sort_order = 12 WHERE column_name = 'assigned_to'")
            cursor.execute("UPDATE column_settings SET sort_order = 13 WHERE column_name = 'priority_name'")
            cursor.execute("UPDATE column_settings SET sort_order = 14 WHERE column_name = 'environment_name'")
            cursor.execute("UPDATE column_settings SET sort_order = 15 WHERE column_name = 'service_component'")
            
            # Task Dates
            cursor.execute("UPDATE column_settings SET sort_order = 16 WHERE column_name = 'due_date'")
            cursor.execute("UPDATE column_settings SET sort_order = 17 WHERE column_name = 'reminder_date'")
            cursor.execute("UPDATE column_settings SET sort_order = 18 WHERE column_name = 'created_at'")
            
            # Column Section
            cursor.execute("UPDATE column_settings SET sort_order = 19 WHERE column_name = 'text_col_3'")
            cursor.execute("UPDATE column_settings SET sort_order = 20 WHERE column_name = 'template_source'")
            cursor.execute("UPDATE column_settings SET sort_order = 21 WHERE column_name = 'blocked_by'")
            
            # Update visibility and filter flags
            cursor.execute("UPDATE column_settings SET is_visible = 1 WHERE column_name = 'stage_name'")
            cursor.execute("UPDATE column_settings SET is_visible = 1 WHERE column_name = 'due_date'")
            cursor.execute("UPDATE column_settings SET is_filterable = 0 WHERE column_name = 'stage_name'")
            cursor.execute("UPDATE column_settings SET is_filterable = 0 WHERE column_name = 'environment_name'")
            print("✅ Column sort orders reorganized")
        
        # Migration: Add recurrence fields to tasks table
        try:
            cursor.execute("SELECT recurrence_type FROM tasks LIMIT 1")
        except sqlite3.OperationalError:
            # Columns don't exist, add them
            cursor.execute("ALTER TABLE tasks ADD COLUMN recurrence_type TEXT")
            cursor.execute("ALTER TABLE tasks ADD COLUMN recurrence_parent_id INTEGER")
            cursor.execute("ALTER TABLE tasks ADD COLUMN recurrence_instance_date TEXT")
            print("✅ Added recurrence fields to tasks table")

        # Migration: Add focus_date to tasks table
        try:
            cursor.execute("SELECT focus_date FROM tasks LIMIT 1")
        except sqlite3.OperationalError:
            cursor.execute("ALTER TABLE tasks ADD COLUMN focus_date TEXT")
            print("✅ Added focus_date column to tasks table")
        
        # Migration: Add recurrence_type to column_settings if it doesn't exist
        if column_count > 0:
            cursor.execute("SELECT COUNT(*) FROM column_settings WHERE column_name = 'recurrence_type'")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                    INSERT INTO column_settings (column_name, display_name, column_type, is_visible, is_default, is_locked, is_filterable, sort_order)
                    VALUES ('recurrence_type', 'Recurrence', 'text', 1, 0, 0, 0, 22)
                """)
                print("✅ Added recurrence_type to column_settings")
            else:
                # If it exists, make sure it's visible
                cursor.execute("UPDATE column_settings SET is_visible = 1 WHERE column_name = 'recurrence_type'")
                print("✅ Updated recurrence_type to be visible")
        
        # SynAppz v20 migration: project groups, All Problems page, wiki/pages removal
        migrate_to_synappz_v20(cursor)

        insert_data_if_empty('lkp_status', INITIAL_STATUS, ['name', 'sort_order'])
        insert_data_if_empty('lkp_priority', INITIAL_PRIORITY, ['name', 'sort_order'])
        seed_default_stages_once(cursor)
        move_done_status_last_once(cursor)
        insert_data_if_empty('lkp_stage', INITIAL_STAGE, ['name', 'sort_order', 'color'])
        insert_data_if_empty('lkp_environment', INITIAL_ENVIRONMENT, ['name', 'status'])
        insert_data_if_empty('categories', INITIAL_CATEGORIES, ['cat_id', 'name', 'status'])
        insert_data_if_empty('projects', INITIAL_PROJECTS, ['prj_id', 'name', 'description', 'status', 'start_date', 'end_date'])
        insert_data_if_empty('subcategories', INITIAL_SUBCATEGORIES, ['scat_id', 'name', 'status', 'category_id'])
        insert_data_if_empty('column_settings', INITIAL_COLUMN_SETTINGS, 
                           ['column_name', 'display_name', 'column_type', 'is_visible', 'is_default', 'is_locked', 'is_filterable', 'sort_order'])

        conn.commit()
        
        if not db_exists:
            print("✅ Database initialized successfully!")
        else:
            print("✅ Database schema verified.")
            
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        if conn:
            conn.rollback()
            conn.close()
        raise

if __name__ == '__main__':
    init_db()
