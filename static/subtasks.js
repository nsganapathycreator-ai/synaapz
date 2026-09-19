// ========================================================================
//                      SUBTASKS / CHECKLIST SYSTEM
// ========================================================================

/**
 * Load and render subtasks for a task
 */
async function loadSubtasks(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/subtasks`);
        const subtasks = await response.json();
        return subtasks;
    } catch (error) {
        console.error('Error loading subtasks:', error);
        return [];
    }
}

/**
 * Render subtasks section in task modal
 */
function renderSubtasksSection(taskId, subtasks) {
    const completedCount = subtasks.filter(s => s.is_completed).length;
    const totalCount = subtasks.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount * 100) : 0;
    
    // Build nested structure
    const rootSubtasks = subtasks.filter(s => !s.parent_subtask_id);
    
    function renderSubtaskTree(parentId = null, level = 0) {
        const children = subtasks.filter(s => s.parent_subtask_id === parentId);
        if (children.length === 0) return '';
        
        return children.map(subtask => `
            <div style="margin-left: ${level * 20}px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; padding: 8px; background: ${subtask.is_completed ? 'var(--bg-f8f9fa)' : 'var(--bg-fff)'}; border-radius: 4px; border: 1px solid var(--bd-e9ecef);">
                <input type="checkbox" 
                       ${subtask.is_completed ? 'checked' : ''}
                       onchange="toggleSubtask(${subtask.id}, this.checked)"
                       style="width: 18px; height: 18px; cursor: pointer;">
                <span style="flex: 1; ${subtask.is_completed ? 'text-decoration: line-through; color: var(--fg-6c757d);' : ''}"
                      ondblclick="editSubtask(${subtask.id}, '${subtask.title.replace(/'/g, "\\'")}')">
                    ${subtask.title}
                </span>
                <div style="display: flex; gap: 4px;">
                    <button onclick="addNestedSubtask(${taskId}, ${subtask.id})" 
                            title="Add nested subtask"
                            style="padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <button onclick="convertSubtaskToTask(${subtask.id})" 
                            title="Convert to full task"
                            style="padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                    <button onclick="deleteSubtask(${subtask.id}, ${taskId})" 
                            title="Delete"
                            style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                ${renderSubtaskTree(subtask.id, level + 1)}
            </div>
        `).join('');
    }
    
    return `
        <div style="background: var(--bg-f8f9fa); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--fg-495057);">
                    <i class="fa-solid fa-list-check"></i> Subtasks
                </h3>
                <span style="font-size: 14px; color: var(--fg-6c757d); font-weight: 500;">
                    ${completedCount} / ${totalCount} complete
                </span>
            </div>
            
            <!-- Progress Bar -->
            <div style="background: var(--bg-e9ecef); height: 8px; border-radius: 4px; margin-bottom: 15px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #28a745 0%, #20c997 100%); height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
            </div>
            
            <!-- Subtasks List -->
            <div id="subtasks-list-${taskId}" style="margin-bottom: 15px;">
                ${renderSubtaskTree(null, 0)}
            </div>
            
            <!-- Add Subtask Input -->
            <div style="display: flex; gap: 8px;">
                <input type="text" 
                       id="new-subtask-input-${taskId}"
                       placeholder="Add a subtask..."
                       style="flex: 1; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;"
                       onkeypress="if(event.key==='Enter') addSubtask(${taskId})">
                <button onclick="addSubtask(${taskId})"
                        style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">
                    <i class="fa-solid fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;
}

/**
 * Add new subtask
 */
async function addSubtask(taskId, parentSubtaskId = null) {
    const inputId = parentSubtaskId ? `nested-subtask-input-${parentSubtaskId}` : `new-subtask-input-${taskId}`;
    const input = document.getElementById(inputId);
    const title = input.value.trim();
    
    if (!title) {
        showNotification('Please enter a subtask title', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                title: title,
                parent_subtask_id: parentSubtaskId
            })
        });
        
        if (response.ok) {
            input.value = '';
            await refreshSubtasks(taskId);
            showNotification('Subtask added', 'success');
        }
    } catch (error) {
        showNotification('Error adding subtask', 'error');
        console.error(error);
    }
}

/**
 * Add nested subtask
 */
function addNestedSubtask(taskId, parentSubtaskId) {
    const input = prompt('Enter nested subtask title:');
    if (input && input.trim()) {
        addSubtask(taskId, parentSubtaskId);
    }
}

/**
 * Toggle subtask completion
 */
async function toggleSubtask(subtaskId, isCompleted) {
    try {
        const response = await fetch(`/api/subtasks/${subtaskId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ is_completed: isCompleted ? 1 : 0 })
        });
        
        if (response.ok) {
            // Find parent task ID from the DOM
            const taskId = getCurrentEditingTaskId();
            if (taskId) {
                await refreshSubtasks(taskId);
            }
        }
    } catch (error) {
        showNotification('Error updating subtask', 'error');
        console.error(error);
    }
}

/**
 * Edit subtask title
 */
async function editSubtask(subtaskId, currentTitle) {
    const newTitle = prompt('Edit subtask:', currentTitle);
    if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
        try {
            const response = await fetch(`/api/subtasks/${subtaskId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ title: newTitle.trim() })
            });
            
            if (response.ok) {
                const taskId = getCurrentEditingTaskId();
                if (taskId) {
                    await refreshSubtasks(taskId);
                }
                showNotification('Subtask updated', 'success');
            }
        } catch (error) {
            showNotification('Error updating subtask', 'error');
            console.error(error);
        }
    }
}

/**
 * Delete subtask
 */
async function deleteSubtask(subtaskId, taskId) {
    if (!confirm('Delete this subtask?')) return;
    
    try {
        const response = await fetch(`/api/subtasks/${subtaskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await refreshSubtasks(taskId);
            showNotification('Subtask deleted', 'success');
        }
    } catch (error) {
        showNotification('Error deleting subtask', 'error');
        console.error(error);
    }
}

/**
 * Convert subtask to full task
 */
async function convertSubtaskToTask(subtaskId) {
    if (!confirm('Convert this subtask to a full task?')) return;
    
    try {
        const response = await fetch(`/api/subtasks/${subtaskId}/convert`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            const taskId = getCurrentEditingTaskId();
            if (taskId) {
                await refreshSubtasks(taskId);
            }
            showNotification(`Subtask converted to Task #${data.task_id}`, 'success');
            await initializeTasksTable(); // Refresh tasks list
        }
    } catch (error) {
        showNotification('Error converting subtask', 'error');
        console.error(error);
    }
}

/**
 * Refresh subtasks display
 */
async function refreshSubtasks(taskId) {
    const subtasks = await loadSubtasks(taskId);
    const container = document.getElementById(`subtasks-container-${taskId}`);
    if (container) {
        container.innerHTML = renderSubtasksSection(taskId, subtasks);
    }
}

/**
 * Get currently editing task ID from modal
 */
function getCurrentEditingTaskId() {
    const modal = document.getElementById('edit-task-modal');
    if (modal) {
        const form = modal.querySelector('form');
        if (form && form.id === 'edit-task-form') {
            // Extract task ID from form or modal context
            const taskIdMatch = modal.innerHTML.match(/Edit Task #(\d+)/);
            if (taskIdMatch) {
                return parseInt(taskIdMatch[1]);
            }
        }
    }
    return null;
}

// Expose functions globally
window.loadSubtasks = loadSubtasks;
window.renderSubtasksSection = renderSubtasksSection;
window.addSubtask = addSubtask;
window.addNestedSubtask = addNestedSubtask;
window.toggleSubtask = toggleSubtask;
window.editSubtask = editSubtask;
window.deleteSubtask = deleteSubtask;
window.convertSubtaskToTask = convertSubtaskToTask;
window.refreshSubtasks = refreshSubtasks;
