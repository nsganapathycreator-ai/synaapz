// ========================================================================
//  PROJECT TEMPLATE EDITING ENHANCEMENTS
// ========================================================================

// Global state for template editing
window.isEditingTemplate = false;
window.currentTemplateTaskIdx = null;
window.hasUnsavedTemplateChanges = false;
window.templateTasksData = window.templateTasksData || [];

/**
 * Open template task modal using modern 3-column layout
 * Uses the EXACT same form generation as Edit Task modal
 */
function openTemplateTaskModal(task, taskIdx) {
    console.log('[openTemplateTaskModal] Called with:', {task, taskIdx});
    
    try {
        console.log('[openTemplateTaskModal] Creating modal element...');
        const modal = document.createElement('div');
        modal.id = 'template-task-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999;';
        
        console.log('[openTemplateTaskModal] Checking allColumnSettings...', {
            exists: !!allColumnSettings,
            length: allColumnSettings ? allColumnSettings.length : 0
        });
        
        if (!allColumnSettings || allColumnSettings.length === 0) {
            console.error('[openTemplateTaskModal] allColumnSettings not available!');
            alert('Column settings not loaded. Please refresh the page.');
            return;
        }
        
        console.log('[openTemplateTaskModal] Grouping columns by section...');
        // Group columns by section - EXACT same logic as Add Task modal
        const sections = {
            'Primary': [],
            'Task Content': [],
            'Task Data': [],
            'Task Category': [],
            'Task Dates': [],
            'Others': []
        };
        
        allColumnSettings.forEach(col => {
            if (col.column_name === 'id') return;
            if (col.column_name === 'created_at') return; // Skip created_at from UI
            
            // Categorize into sections - EXACT same as Add Task modal
            if (['title', 'status_name'].includes(col.column_name)) {
                sections['Primary'].push(col);
            } else if (['task_description', 'comments', 'url', 'file'].includes(col.column_name)) {
                sections['Task Content'].push(col);
            } else if (['stage_name', 'assigned_to', 'priority_name', 'environment_name', 'service_component'].includes(col.column_name)) {
                sections['Task Data'].push(col);
            } else if (['task_group', 'category_id', 'subcategory_id', 'project_id'].includes(col.column_name)) {
                sections['Task Category'].push(col);
            } else if (['due_date', 'reminder_date'].includes(col.column_name)) {
                sections['Task Dates'].push(col);
            } else {
                sections['Others'].push(col);
            }
        });
        
        console.log('[openTemplateTaskModal] Sections:', Object.keys(sections).map(k => `${k}:${sections[k].length}`));
        
        // Generate field HTML - EXACT same logic as Edit modal
        const generateFieldHTML = (col) => {
            const name = col.column_name;
            const label = col.display_name;
            const currentValue = task[name] !== undefined && task[name] !== null ? task[name] : '';
            const inputStyle = 'width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;';
            
            let fieldHtml = '';
            
            // SPECIAL: Blocked By for templates - only show tasks in template
            if (name === 'blocked_by') {
                const templateTaskIds = window.templateTasksData.map((t, idx) => idx);
                const options = templateTaskIds
                    .filter(idx => idx !== taskIdx) // Exclude current task
                    .map(idx => {
                        const t = window.templateTasksData[idx];
                        const title = t.title || `Task ${idx + 1}`;
                        return `<option value="${idx}">${idx + 1}: ${title}</option>`;
                    }).join('');
                
                fieldHtml = `
                    <select multiple id="tmpl-task-${name}" style="${inputStyle} height: 120px;">
                        ${options}
                    </select>
                    <small style="color: var(--fg-6c757d); font-size: 0.85em;">Hold Ctrl/Cmd to select multiple</small>
                `;
                
                // Pre-select current values
                setTimeout(() => {
                    const select = document.getElementById(`tmpl-task-${name}`);
                    if (select && currentValue) {
                        const selected = currentValue.toString().split(',').map(v => v.trim());
                        Array.from(select.options).forEach(opt => {
                            if (selected.includes(opt.value)) {
                                opt.selected = true;
                            }
                        });
                    }
                }, 100);
            }
            // All other fields - same as Edit modal
            else if (col.column_type === 'lookup_status' && lookupData.lkp_status) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">`;
                lookupData.lkp_status.forEach(item => {
                    fieldHtml += `<option value="${item.name}" ${currentValue === item.name ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'lookup_priority' && lookupData.lkp_priority) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">`;
                lookupData.lkp_priority.forEach(item => {
                    fieldHtml += `<option value="${item.name}" ${currentValue === item.name ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'lookup_stage' && lookupData.lkp_stage) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">`;
                lookupData.lkp_stage.forEach(item => {
                    fieldHtml += `<option value="${item.name}" ${currentValue === item.name ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'lookup_environment' && lookupData.lkp_environment) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">
                    <option value="">None</option>`;
                lookupData.lkp_environment.forEach(item => {
                    fieldHtml += `<option value="${item.name}" ${currentValue === item.name ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'lookup_category' && lookupData.categories) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">
                    <option value="">None</option>`;
                lookupData.categories.forEach(item => {
                    fieldHtml += `<option value="${item.cat_id}" ${currentValue === item.cat_id ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'lookup_subcategory' && lookupData.subcategories) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">
                    <option value="">None</option>`;
                lookupData.subcategories.forEach(item => {
                    fieldHtml += `<option value="${item.scat_id}" ${currentValue === item.scat_id ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'lookup_project' && lookupData.projects) {
                fieldHtml = `<select id="tmpl-task-${name}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">
                    <option value="">None</option>`;
                lookupData.projects.forEach(item => {
                    fieldHtml += `<option value="${item.prj_id}" ${currentValue === item.prj_id ? 'selected' : ''}>${item.name}</option>`;
                });
                fieldHtml += `</select>`;
            }
            else if (col.column_type === 'textarea') {
                fieldHtml = `<textarea id="tmpl-task-${name}" rows="4" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">${currentValue}</textarea>`;
            }
            else if (col.column_type === 'date') {
                fieldHtml = `<input type="date" id="tmpl-task-${name}" value="${currentValue}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">`;
            }
            else if (col.column_type === 'number') {
                fieldHtml = `<input type="number" id="tmpl-task-${name}" value="${currentValue}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">`;
            }
            else if (col.column_type === 'checkbox') {
                fieldHtml = `<input type="checkbox" id="tmpl-task-${name}" ${currentValue ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" onchange="window.hasUnsavedTemplateChanges=true">`;
            }
            else {
                // Default text input
                fieldHtml = `<input type="text" id="tmpl-task-${name}" value="${currentValue}" style="${inputStyle}" onchange="window.hasUnsavedTemplateChanges=true">`;
            }
            
            return `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #007bff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${label}${col.is_required ? ' *' : ''}
                    </label>
                    ${fieldHtml}
                </div>
            `;
        };
        
        // Build section HTML - EXACT same as Edit modal
        const buildSectionHTML = (sectionName, columns) => {
            if (!columns || columns.length === 0) return '';
            
            return `
                <div style="background: var(--bg-f8f9fa); border-radius: 8px; padding: 20px; border: 1px solid var(--bd-dee2e6);">
                    <h3 style="margin: 0 0 20px 0; font-size: 15px; font-weight: 700; color: var(--fg-495057); border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        ${sectionName}
                    </h3>
                    ${columns.map(col => generateFieldHTML(col)).join('')}
                </div>
            `;
        };
        
        console.log('[openTemplateTaskModal] Building modal HTML...');
        
        modal.innerHTML = `
            <div style="background: var(--bg-fff); border-radius: 12px; padding: 0; max-width: 1400px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                <!-- Header -->
                <div style="padding: 25px 30px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
                        <i class="fa-solid fa-edit"></i> Edit Template Task #${taskIdx + 1}
                    </h2>
                    <div style="display: flex; gap: 12px;">
                        <button type="button" onclick="window.saveTemplateTask(${taskIdx})" style="padding: 10px 20px; background: var(--bg-fff); color: #007bff; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;">
                            <i class="fa-solid fa-save"></i> Save Changes
                        </button>
                        <button type="button" onclick="window.closeTemplateTaskModal()" style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
                            <i class="fa-solid fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
                
                <!-- Form Content -->
                <div style="flex: 1; overflow-y: auto; padding: 30px;">
                    <form id="template-task-form">
                        <!-- Multi-Column Grid Layout - EXACT same as Add Task -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 25px;">
                            <!-- Column 1: Primary + Task Content -->
                            <div style="display: flex; flex-direction: column; gap: 25px;">
                                ${buildSectionHTML('Primary', sections['Primary'])}
                                ${buildSectionHTML('Task Content', sections['Task Content'])}
                            </div>
                            
                            <!-- Column 2: Task Category + Task Dates -->
                            <div style="display: flex; flex-direction: column; gap: 25px;">
                                ${buildSectionHTML('Task Category', sections['Task Category'])}
                                ${buildSectionHTML('Task Dates', sections['Task Dates'])}
                            </div>
                            
                            <!-- Column 3: Task Data + Others -->
                            <div style="display: flex; flex-direction: column; gap: 25px;">
                                ${buildSectionHTML('Task Data', sections['Task Data'])}
                                ${buildSectionHTML('Others', sections['Others'])}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        console.log('[openTemplateTaskModal] Modal HTML generated, length:', modal.innerHTML.length);
        console.log('[openTemplateTaskModal] Appending modal to body...');
        
        document.body.appendChild(modal);
        
        console.log('[openTemplateTaskModal] Modal appended successfully!');
        console.log('[openTemplateTaskModal] Modal in DOM:', !!document.getElementById('template-task-modal'));
        
    } catch (error) {
        console.error('[openTemplateTaskModal] ERROR:', error);
        console.error('[openTemplateTaskModal] Error stack:', error.stack);
        alert('Error opening template editor: ' + error.message);
    }
}
/**
 * Save template task changes
 */
function saveTemplateTask(taskIdx) {
    console.log('[saveTemplateTask] Saving task index:', taskIdx);
    const formData = {};
    
    allColumnSettings.forEach(col => {
        if (col.column_name === 'id') return;
        
        const field = document.getElementById(`tmpl-task-${col.column_name}`);
        if (field) {
            if (field.type === 'select-multiple') {
                // Handle multi-select for blocked_by
                const selected = Array.from(field.selectedOptions).map(opt => opt.value);
                formData[col.column_name] = selected.join(', ');
                console.log(`[saveTemplateTask] Multi-select ${col.column_name}:`, selected, '→', formData[col.column_name]);
            } else {
                formData[col.column_name] = field.value;
            }
        }
    });
    
    console.log('[saveTemplateTask] Form data collected:', formData);
    console.log('[saveTemplateTask] blocked_by value:', formData.blocked_by);
    
    // Update the template task
    window.templateTasksData[taskIdx] = formData;
    window.hasUnsavedTemplateChanges = false;
    
    console.log('[saveTemplateTask] Updated templateTasksData[' + taskIdx + ']:', window.templateTasksData[taskIdx]);
    
    // Close modal and refresh display
    closeTemplateTaskModal();
    if (typeof renderTemplateEditor === 'function') {
        renderTemplateEditor();
    }
    
    showNotification('Template task updated', 'success');
}

/**
 * Close template task modal with confirmation if unsaved changes
 */
function closeTemplateTaskModal() {
    if (window.hasUnsavedTemplateChanges) {
        if (!confirm('You have unsaved changes. Discard them?')) {
            return;
        }
    }
    
    const modal = document.getElementById('template-task-modal');
    if (modal) {
        modal.remove();
    }
    
    window.isEditingTemplate = false;
    window.currentTemplateTaskIdx = null;
    window.hasUnsavedTemplateChanges = false;
}

// Expose functions globally
window.openTemplateTaskModal = openTemplateTaskModal;
window.saveTemplateTask = saveTemplateTask;
window.closeTemplateTaskModal = closeTemplateTaskModal;
