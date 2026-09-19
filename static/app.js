// app.js - SynAppz v35 (mobile-friendly: whole app)

console.log('🚀 SynAppz v35 loaded');

// Theme (light/dark) is applied before first paint by an inline script in index.html,
// then synced with the saved preference - see THEME section below.

// ========================================================================
//                    GLOBAL NOTIFICATION SYSTEM
// ========================================================================

/**
 * Show a notification message (replaces alert/confirm popups)
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms (default 4000, 0 for permanent)
 */
function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        min-width: 300px;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;
    
    // Add icon based on type
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <i class="${icon}" style="font-size: 18px; flex-shrink: 0;"></i>
        <span style="flex: 1;">${message}</span>
        <i class="fa-solid fa-times" style="font-size: 14px; opacity: 0.8; flex-shrink: 0;"></i>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Auto-remove after duration (if not permanent)
    if (duration > 0) {
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // Remove on click
    notification.onclick = () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 300);
    };
}

function getNotificationColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#007bff'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-solid fa-circle-check',
        'error': 'fa-solid fa-circle-exclamation',
        'warning': 'fa-solid fa-triangle-exclamation',
        'info': 'fa-solid fa-circle-info'
    };
    return icons[type] || icons.info;
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================================================

// Sidebar state
let sidebarMinimized = false;

/**
 * Toggle sidebar minimize/expand
 */
function toggleSidebar() {
    const toggleIcon = document.getElementById('toggle-icon');
    
    sidebarMinimized = !sidebarMinimized;
    
    if (sidebarMinimized) {
        // Minimize - use CSS class
        document.body.classList.add('sidebar-minimized');
        toggleIcon.className = 'fa-solid fa-angles-right';
    } else {
        // Expand - remove CSS class
        document.body.classList.remove('sidebar-minimized');
        toggleIcon.className = 'fa-solid fa-angles-left';
    }
}

// Define the content and title for each page route
const pageRoutes = {
    'nav-home': {
        title: '',
        content: `<div id="home-container"></div>`
    },
    'nav-search': {
        title: '',
        content: `<div id="search-container"></div>`
    },
    'nav-data': {
        title: '',
        content: `<div id="data-management-container"></div>`
    },
    'nav-tasks': {
        title: '',
        content: `<div id="tasks-table-container" style="margin: 0; padding: 0;"></div>` // Will be dynamically populated
    },
    'nav-projects': {
        title: '',
        content: `<div id="projects-kanban-container"></div>`
    },
    'nav-calendar': {
        title: '',
        content: `<div id="calendar-container"></div>`
    },
    'nav-focus': {
        title: '',
        content: `<div id="focus-board-container"></div>`
    },
    'nav-problems': {
        title: '',
        content: `<div id="problems-page-container"></div>`
    },
    'nav-routines': {
        title: '',
        content: `<div id="routines-container"></div>`
    },
    'nav-faq-quicklinks': {
        title: '',
        content: `<div id="faq-quicklinks-container"></div>`
    },
    'nav-faq-quickinfo': {
        title: '',
        content: `<div id="faq-quickinfo-container"></div>`
    },
    'nav-faq-logs': {
        title: '',
        content: `<div id="faq-logs-container"></div>`
    },
    'nav-dashboard': {
        title: '',
        content: `<div id="dashboard-container" style="height: 100%; padding: 20px;"></div>`
    },
    'nav-archive': {
        title: '',
        content: `<div id="archive-container" style="height: 100%; padding: 20px;"></div>`
    },
    'nav-trash': {
        title: '',
        content: `<div id="trash-container"></div>`
    },
    'nav-settings': {
        title: 'Admin Settings',
        content: `
            <div class="admin-tabs">
                <button class="admin-tab-button active" data-tab="general">General</button>
                <button class="admin-tab-button" data-tab="task-table">Customize Task Table</button>
                <button class="admin-tab-button" data-tab="task-model">Task Data Model</button>
                <button class="admin-tab-button" data-tab="control">Control</button>
            </div>
            <div id="admin-content-area">
                <!-- Content will be dynamically loaded here -->
            </div>
        `
    }
};

// Pages hidden unless the user turns them on in Settings > Page Visibility
const DEFAULT_PAGE_VISIBILITY = {
    'data': false,
    'quick-links': false,
    'logs': false,
    'dashboard': false,
    'archive': false
};

/**
 * Hide separator lines that would sit next to an empty section
 * (e.g. when every page between two lines is hidden).
 */
function updateNavSeparators() {
    const nav = document.getElementById('nav-links');
    if (!nav) return;
    const children = Array.from(nav.children);
    let seenVisibleItem = false;
    let pendingSeparator = null;
    children.forEach(el => {
        if (el.classList.contains('nav-separator')) {
            el.style.display = 'none';
            if (seenVisibleItem) pendingSeparator = el;
        } else if (el.style.display !== 'none') {
            if (pendingSeparator) {
                pendingSeparator.style.display = '';
                pendingSeparator = null;
            }
            seenVisibleItem = true;
        }
    });
}

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');
let columnSettings = []; // Global variable to hold column state (VISIBLE columns only for table)
let allColumnSettings = []; // ALL columns including hidden ones (for forms and export)
let categoryLookups = []; // Global variable to hold categories for subcategory dropdowns
let currentLookupTable = 'categories'; // Default lookup table to display

// Global variables for tasks table
let allTasks = [];
let filteredTasks = [];
let lookupData = {};
let currentSortColumn = null;
let currentSortDirection = 'asc';
let activeFilters = {}; // {column_name: selected_value}
let currentView = 'table'; // 'table' or 'kanban'
let hideCompletedProjects = false;
let checkboxMode = false;
let selectedTasks = new Set();
let showBulkActionsBar = false;
let hideCompletedTasks = false;
let hideTemplateTasks = false;
let projectGroupBy = 'status'; // 'status' or 'stage'
let projectView = 'kanban'; // 'kanban' or 'gantt'
let generalSearchTerm = '';
let projectTaskGroupFilter = ''; // Filter by task group on Projects page
let projectCategoryFilter = ''; // Filter by category on Projects page
let projectSubcategoryFilter = ''; // Filter by subcategory on Projects page

// Calendar page state
let calendarCurrentDate = new Date();
let calendarShowDueDate = true;
let calendarShowReminderDate = true;
let calendarCategoryFilter = '';
let calendarSubcategoryFilter = '';
let calendarProjectFilter = '';
let calendarGroupFilter = '';
let calendarSearchTerm = '';
let calendarHideCompleted = true; // Hide completed tasks by default

/**
 * Global function to reload lookup data from API
 * Call this after any changes to categories, projects, subcategories, etc.
 */
function reloadLookupData() {
    return fetch('/api/lookups')
        .then(r => r.json())
        .then(data => {
            lookupData = data;
            console.log('Lookup data reloaded:', Object.keys(lookupData));
        })
        .catch(err => {
            console.error('Error reloading lookup data:', err);
        });
}

/**
 * Renders the content for the selected page.
 */
function renderPage(pageId) {
    const route = pageRoutes[pageId];
    if (!route) return;

    // Save current page to localStorage for refresh persistence
    try {
        localStorage.setItem('synaapz_current_page', pageId);
    } catch (e) {
        console.warn('Could not save current page:', e);
    }

    // 1. Update the main content area
    mainContent.innerHTML = `
        <h2>${route.title}</h2>
        ${route.content}
    `;

    // 2. Manage the active navigation state
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    // 3. SPECIAL CASE: Admin Page Initialization
    if (pageId === 'nav-settings') {
        setTimeout(setupAdminPage, 0); 
    }
    
    // 4. SPECIAL CASE: Tasks Table Page Initialization
    if (pageId === 'nav-tasks') {
        setTimeout(initializeTasksTable, 0);
    }
    
    // 5. SPECIAL CASE: Projects Kanban Page Initialization
    if (pageId === 'nav-projects') {
        setTimeout(initializeProjectsKanban, 0);
    }
    
    // 5.5. SPECIAL CASE: Calendar Page Initialization
    if (pageId === 'nav-calendar') {
        setTimeout(initializeCalendarPage, 0);
    }
    
    // 5.6. SPECIAL CASE: Focus Board Page Initialization
    if (pageId === 'nav-focus') {
        setTimeout(initializeFocusBoard, 0);
    }
    
    // 6. SPECIAL CASE: Home Page Initialization
    if (pageId === 'nav-home') {
        setTimeout(initializeHomePage, 0);
    }
    
    // 7. SPECIAL CASE: Search Page Initialization
    if (pageId === 'nav-search') {
        setTimeout(initializeSearchPage, 0);
    }
    
    // All Problems page (fishbone root-cause tracking)
    if (pageId === 'nav-problems') {
        setTimeout(initializeProblemsPage, 0);
    }
    
    // Routines page (recurring tasks, grouped by frequency)
    if (pageId === 'nav-routines') {
        setTimeout(initializeRoutinesPage, 0);
    }
    
    // Initialize Quick Links / Quick Info / Logs pages (rich text editor)
    if (pageId === 'nav-faq-quicklinks') {
        setTimeout(() => initializeFAQPage('quicklinks', 'Quick Links'), 0);
    } else if (pageId === 'nav-faq-quickinfo') {
        setTimeout(() => initializeFAQPage('quickinfo', 'Quick Info'), 0);
    } else if (pageId === 'nav-faq-logs') {
        setTimeout(() => initializeFAQPage('logs', 'Logs'), 0);
    }
    
    // Initialize Dashboard page
    if (pageId === 'nav-dashboard') {
        setTimeout(initializeDashboard, 0);
    }
    
    // Initialize Archive page
    if (pageId === 'nav-archive') {
        setTimeout(initializeArchivePage, 0);
    }
    
    // Initialize Trash page
    if (pageId === 'nav-trash') {
        setTimeout(initializeTrashPage, 0);
    }
    
    // Initialize Data Management page
    if (pageId === 'nav-data') {
        setTimeout(initializeDataManagementPage, 0);
    }
}

/**
 * Initialize the event listeners for all navigation links.
 */
function initializeNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); 
            const pageId = item.id;
            renderPage(pageId);
            closeMobileNav();
        });
    });

    // Load all preferences from database
    loadPreferences().then(prefs => {
        console.log('[Init] Loaded preferences from database:', prefs);
        
        // Bug-34: Restore page visibility
        const idMap = {
            'quick-links': 'nav-faq-quicklinks',
            'quick-info': 'nav-faq-quickinfo',
            'logs': 'nav-faq-logs'
        };
        
        // Data page is hidden by default until enabled in Settings > Page Visibility
        const pageVisibility = Object.assign({ ...DEFAULT_PAGE_VISIBILITY }, prefs.page_visibility ? JSON.parse(prefs.page_visibility) : {});
        Object.entries(pageVisibility).forEach(([pageName, visible]) => {
            const navId = idMap[pageName] || `nav-${pageName}`;
            const navItem = document.getElementById(navId);
            const checkbox = document.getElementById(`page-${pageName}`);
            if (navItem) {
                navItem.style.display = visible ? 'flex' : 'none';
            }
            if (checkbox) {
                checkbox.checked = visible;
            }
        });
        updateNavSeparators();
        
        // Bug-35: Restore nav text hidden state
        const navTextHidden = prefs.nav_text_hidden === 'true';
        if (navTextHidden) {
            const navSpans = document.querySelectorAll('.nav-item span, #nav-toggle-text');
            const sidebar = document.getElementById('sidebar');
            navSpans.forEach(span => span.style.display = 'none');
            const icon = document.getElementById('nav-text-icon');
            if (icon) icon.className = 'fa-solid fa-eye';
            if (sidebar) sidebar.style.width = '70px';
        }
        
        // Feature-24: Determine initial page
        let initialPage = 'nav-home';
        const defaultLanding = prefs.default_landing_page;
        const savedPage = localStorage.getItem('synaapz_current_page'); // Keep session state in localStorage
        
        const isNavVisible = (id) => {
            const el = document.getElementById(id);
            return !el || el.style.display !== 'none';
        };
        
        if (savedPage && pageRoutes[savedPage] && isNavVisible(savedPage)) {
            initialPage = savedPage;
            console.log('[Init] Restoring last page:', initialPage);
        } else if (defaultLanding && pageRoutes[defaultLanding]) {
            initialPage = defaultLanding;
            console.log('[Init] Using default landing page:', initialPage);
        }
        
        renderPage(initialPage);
    }).catch(err => {
        console.error('[Init] Error loading preferences, using defaults:', err);
        renderPage('nav-home');
    });
}

document.addEventListener('DOMContentLoaded', initializeNavigation);

/**
 * Toggle navigation text visibility (Feature-3)
 */
function toggleNavText() {
    const navSpans = document.querySelectorAll('.nav-item span, #nav-toggle-text');
    const icon = document.getElementById('nav-text-icon');
    const sidebar = document.getElementById('sidebar');
    const isHidden = navSpans[0].style.display === 'none';
    
    navSpans.forEach(span => {
        span.style.display = isHidden ? 'inline' : 'none';
    });
    
    icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    
    // Bug-35: Resize sidebar to fit icons only
    if (sidebar) {
        sidebar.style.width = isHidden ? '250px' : '70px';
    }
    
    // Save to database
    savePreference('nav_text_hidden', !isHidden);
}



// ========================================================================
//                           ADMIN SETTINGS LOGIC  
// ========================================================================

function setupAdminPage() {
    const tabButtons = document.querySelectorAll('.admin-tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            document.querySelectorAll('.admin-tabs .admin-tab-button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            renderAdminTab(event.target.dataset.tab);
        });
    });

    renderAdminTab('general');
}

function renderAdminTab(tabName) {
    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = ''; 

    if (tabName === 'task-table') {
        fetchColumnSettings();
    } else if (tabName === 'task-model') {
        fetch('/api/lookups')
            .then(res => res.json())
            .then(data => {
                categoryLookups = data.categories || [];
                setupTaskDataModelCustomization(contentArea);
            })
            .catch(error => {
                contentArea.innerHTML = `<p style="color:red;">Error loading lookup data: ${error.message}</p>`;
                console.error('Error fetching lookups for Task Data Model:', error);
            });
    } else if (tabName === 'control') {
        renderControlTabContent(contentArea);
    } else { // 'general'
        contentArea.innerHTML = `
            <div style="max-width: 1200px;">
                <h3><i class="fa-solid fa-gear"></i> General Settings</h3>
                
                <!-- Feature-21: Dark Mode -->
                <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                        <i class="fa-solid fa-moon"></i> Dark Mode
                    </h4>
                    <p style="margin: 0 0 15px 0; color: var(--fg-6c757d);">
                        Dark mode changes the entire interface to dark theme with light text for reduced eye strain.
                    </p>
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px;">
                        <input type="checkbox" id="dark-mode-toggle" onchange="toggleDarkMode(this.checked)" style="width: 20px; height: 20px; cursor: pointer;">
                        <span style="font-weight: 500;">Enable Dark Mode</span>
                    </label>
                </div>
                
                <!-- Feature-24: Default Landing Page -->
                <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                        <i class="fa-solid fa-door-open"></i> Default Landing Page
                    </h4>
                    <p style="margin: 0 0 15px 0; color: var(--fg-6c757d);">
                        Choose which page opens when you launch the application.
                    </p>
                    <select id="default-landing-page" onchange="setDefaultLandingPage(this.value)" style="padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; width: 100%; max-width: 400px; font-size: 14px;">
                        <option value="nav-home">Home</option>
                        <option value="nav-search">Search</option>
                        <option value="nav-focus">Focus Board</option>
                        <option value="nav-data">Data</option>
                        <option value="nav-projects">Projects</option>
                        <option value="nav-tasks">Tasks</option>
                        <option value="nav-problems">Problems</option>
                        <option value="nav-routines">Routines</option>
                        <option value="nav-calendar">Calendar</option>
                        <option value="nav-dashboard">Dashboard</option>
                    </select>
                </div>
                
                <!-- Page Visibility -->
                <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                        <i class="fa-solid fa-eye"></i> Page Visibility
                    </h4>
                    <p style="margin: 0 0 15px 0; color: var(--fg-6c757d);">
                        Control which pages appear in navigation. Tasks page is always visible.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px;">
                            <input type="checkbox" checked disabled style="width: 18px; height: 18px;"> 
                            <span>Tasks (Always Visible)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-home" checked onchange="togglePageVisibility('home', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Home</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-projects" checked onchange="togglePageVisibility('projects', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Projects</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-data" onchange="togglePageVisibility('data', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Data</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-search" checked onchange="togglePageVisibility('search', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Search</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-problems" checked onchange="togglePageVisibility('problems', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Problems</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-routines" checked onchange="togglePageVisibility('routines', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Routines</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-calendar" checked onchange="togglePageVisibility('calendar', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Calendar</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-focus" checked onchange="togglePageVisibility('focus', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Focus Board</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-quick-links" onchange="togglePageVisibility('quick-links', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Quick Links</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-quick-info" checked onchange="togglePageVisibility('quick-info', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Quick Info</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-logs" onchange="togglePageVisibility('logs', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Logs</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-dashboard" onchange="togglePageVisibility('dashboard', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Dashboard</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-archive" onchange="togglePageVisibility('archive', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Archive</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;">
                            <input type="checkbox" id="page-trash" checked onchange="togglePageVisibility('trash', this.checked)" style="width: 18px; height: 18px; cursor: pointer;"> 
                            <span>Trash</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Restore settings from database
        getPreference('dark_mode', false).then(darkMode => {
            // Parse dark mode value correctly
            const isDarkMode = darkMode === true || darkMode === 'true' || darkMode === '1' || darkMode === 1;
            const checkbox = document.getElementById('dark-mode-toggle');
            if (checkbox) {
                checkbox.checked = isDarkMode;
            }
            // Keep page theme in sync with the saved preference
            applyTheme(isDarkMode);
        });
        
        getPreference('default_landing_page', 'nav-home').then(defaultLanding => {
            const dropdown = document.getElementById('default-landing-page');
            if (dropdown) dropdown.value = defaultLanding;
        });
        
        getPreference('page_visibility', {}).then(visibility => {
            Object.entries(Object.assign({ ...DEFAULT_PAGE_VISIBILITY }, visibility || {})).forEach(([pageName, visible]) => {
                const checkbox = document.getElementById(`page-${pageName}`);
                if (checkbox) checkbox.checked = visible;
            });
        });
    }
}

function renderControlTabContent(contentArea) {
    console.log('[DEBUG] Rendering Control tab in Admin Settings');
    
    // Load data and preferences
    Promise.all([
        fetch('/api/admin/columns').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json()),
        Promise.resolve(loadArchiveRules()),
        fetch('/api/preferences').then(r => r.json()).catch(() => ({}))
    ])
    .then(([cols, lookups, rules, prefs]) => {
        const filterableColumns = cols.filter(c => c.is_filterable === 1 && c.column_name !== 'id');
        const lookupValues = lookups;
        const archiveRules = rules;
        
        // Get current preferences
        const defaultDataTab = prefs.default_data_tab || 'category';
        const defaultTasksView = prefs.default_tasks_view || 'table';
        
        // Render Control content
        let html = `
            <div style="max-width: 1200px;">
                <h3><i class="fa-solid fa-sliders"></i> Default Page Settings</h3>
                <div style="background: var(--bg-e7f3ff); border-left: 4px solid #007bff; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0;">Configure which tabs and views should be active by default when opening pages.</p>
                </div>
                
                <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <!-- Default Data Page Tab -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 500; margin-bottom: 8px; color: var(--fg-212529);">
                            <i class="fa-solid fa-database"></i> Default Data Page Tab
                        </label>
                        <select id="default-data-tab" onchange="saveDefaultTab('default_data_tab', this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 14px;">
                            <option value="category" ${defaultDataTab === 'category' ? 'selected' : ''}>Category</option>
                            <option value="subcategory" ${defaultDataTab === 'subcategory' ? 'selected' : ''}>Sub-Category</option>
                            <option value="project" ${defaultDataTab === 'project' ? 'selected' : ''}>Task Projects</option>
                            <option value="group" ${defaultDataTab === 'group' ? 'selected' : ''}>Task Groups</option>
                            <option value="tasks" ${defaultDataTab === 'tasks' ? 'selected' : ''}>Tasks</option>
                        </select>
                    </div>
                    
                    <!-- Default Tasks Page View -->
                    <div style="margin-bottom: 0;">
                        <label style="display: block; font-weight: 500; margin-bottom: 8px; color: var(--fg-212529);">
                            <i class="fa-solid fa-list-check"></i> Default Tasks Page View
                        </label>
                        <select id="default-tasks-view" onchange="saveDefaultTab('default_tasks_view', this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 14px;">
                            <option value="table" ${defaultTasksView === 'table' ? 'selected' : ''}>Table View</option>
                            <option value="kanban" ${defaultTasksView === 'kanban' ? 'selected' : ''}>Kanban Board</option>
                        </select>
                    </div>
                </div>
                
                <hr style="margin: 40px 0; border: none; border-top: 2px solid var(--bd-dee2e6);">
                
                <h3><i class="fa-solid fa-box-archive"></i> Auto-Archive Control</h3>
                <div style="background: var(--bg-e7f3ff); border-left: 4px solid #007bff; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0;">Configure rules to automatically archive tasks. Tasks matching ANY enabled rule will be archived.</p>
                </div>
                
                <div id="control-rules-list" style="margin-bottom: 20px;">
        `;
        
        archiveRules.forEach((rule, idx) => {
            const values = getValuesForField(rule.field, lookupValues);
            const hasLookup = values.length > 0;
            
            html += `
                <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 4px; padding: 15px; margin-bottom: 4px;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleControlRule(${idx})" style="width: 20px; height: 20px;">
                        <select onchange="updateControlRule(${idx}, 'field', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                            ${filterableColumns.map(c => `<option value="${c.column_name}" ${rule.field === c.column_name ? 'selected' : ''}>${c.display_name}</option>`).join('')}
                        </select>
                        <select onchange="updateControlRule(${idx}, 'operator', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                            <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Equals</option>
                            <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Not Equals</option>
                            <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Contains</option>
                        </select>
                        ${hasLookup ? `
                            <select onchange="updateControlRule(${idx}, 'value', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                                ${values.map(v => `<option value="${v}" ${rule.value === v ? 'selected' : ''}>${v}</option>`).join('')}
                            </select>
                        ` : `
                            <input type="text" value="${rule.value || ''}" onchange="updateControlRule(${idx}, 'value', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                        `}
                        <button onclick="deleteControlRule(${idx})" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button onclick="addControlRule()" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                        <i class="fa-solid fa-plus"></i> Add Rule
                    </button>
                    <button onclick="runAutoArchiveFromControl()" style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                        <i class="fa-solid fa-play"></i> Run Auto-Archive
                    </button>
                </div>
                
                <div id="archive-results"></div>
                
                <hr style="margin: 40px 0; border: none; border-top: 2px solid var(--bd-dee2e6);">
                
                <!-- Feature-23: Hide Tasks Configuration -->
                <h3><i class="fa-solid fa-filter-circle-xmark"></i> Hide Tasks (Global Filters)</h3>
                <div style="background: var(--bg-e7f3ff); border-left: 4px solid #007bff; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0;">Configure rules to hide tasks globally across the entire app. Tasks matching ANY enabled rule will be hidden.</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.9em;">Examples: Hide all Done tasks, Hide tasks in specific projects, Multiple property combinations</p>
                </div>
                
                <div id="hide-tasks-rules-list" style="margin-bottom: 20px;">
                    <!-- Rules will be rendered here -->
                </div>
                
                <button onclick="addHideTaskRule()" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-plus"></i> Add Rule
                </button>
            </div>
        `;
        
        contentArea.innerHTML = html;
        
        // Feature-23: Render hide tasks rules
        renderHideTasksRules();
    })
    .catch(err => {
        console.error('[DEBUG] Control tab load error:', err);
        contentArea.innerHTML = '<p style="color:red;">Error loading control panel</p>';
    });
}



// --- 1. Customize Task Table (Column Visibility, Ordering, CRUD) ---

/**
 * Fetches column settings from the backend API.
 */
function fetchColumnSettings() {
    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = '<h3>Customize Task Table</h3><p>Loading settings...</p>';

    fetch('/api/admin/columns')
        .then(response => response.json())
        .then(data => {
            columnSettings = data; 
            renderColumnCustomizationUI(data);
        })
        .catch(error => {
            contentArea.innerHTML = `<p style="color:red;">Error loading column settings: ${error.message}</p>`;
            console.error('Error fetching column settings:', error);
        });
}

/**
 * Renders the UI for column customization, including drag-and-drop.
 */
function renderColumnCustomizationUI(columns) {
    const contentArea = document.getElementById('admin-content-area');
    
    let html = `
        <style>
            .admin-table-fixed { 
                width: 100% !important; 
                table-layout: auto !important; 
                border-collapse: collapse !important; 
            }
            .admin-table-fixed tbody { 
                display: table-row-group !important; 
            }
            .admin-table-fixed tr { 
                display: table-row !important; 
            }
            .admin-table-fixed th, 
            .admin-table-fixed td { 
                display: table-cell !important; 
                padding: 12px 10px !important; 
                vertical-align: middle !important; 
            }
            .admin-table-fixed col:nth-child(1) { width: 5% !important; }
            .admin-table-fixed col:nth-child(2) { width: 35% !important; }
            .admin-table-fixed col:nth-child(3) { width: 12% !important; }
            .admin-table-fixed col:nth-child(4) { width: 12% !important; }
            .admin-table-fixed col:nth-child(5) { width: 18% !important; }
            .admin-table-fixed col:nth-child(6) { width: 18% !important; }
            .admin-table-fixed th:nth-child(1), .admin-table-fixed td:nth-child(1) { text-align: center !important; }
            .admin-table-fixed th:nth-child(2), .admin-table-fixed td:nth-child(2) { text-align: left !important; }
            .admin-table-fixed th:nth-child(3), .admin-table-fixed td:nth-child(3) { text-align: center !important; }
            .admin-table-fixed th:nth-child(4), .admin-table-fixed td:nth-child(4) { text-align: center !important; }
            .admin-table-fixed th:nth-child(5), .admin-table-fixed td:nth-child(5) { text-align: center !important; }
            .admin-table-fixed th:nth-child(6), .admin-table-fixed td:nth-child(6) { text-align: center !important; }
        </style>
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <h3 style="margin-bottom: 10px; color: var(--fg-212529);">Customize Task Table</h3>
            <p style="color: var(--fg-6c757d); margin-bottom: 20px;">Configure column visibility, filtering, and lookup tables for your task management system.</p>
            
            <!-- Add New Column Section -->
            <div style="background-color: var(--bg-f8f9fa); padding: 15px; border-radius: 6px; margin-bottom: 25px; border: 1px solid var(--bd-dee2e6);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="text" id="new-column-name" placeholder="New Column Display Name" 
                           style="padding: 10px 14px; border: 1px solid var(--bd-ced4da); border-radius: 6px; flex: 1; font-size: 14px;">
                    <button style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;"margin: 0; font-size: 14px;" 
                            onclick="addNewColumn()">
                        <i class="fa-solid fa-plus"></i> Add New Column
                    </button>
                </div>
                <small style="color: var(--fg-6c757d); display: block; margin-top: 8px;">
                    <i class="fa-solid fa-info-circle"></i> You can add up to 10 custom text fields. 
                    Maximum 5 columns can have filtering enabled.
                </small>
            </div>
            
            <!-- Column Configuration Table -->
            <div style="background: var(--bg-fff); border-radius: 6px; overflow-x: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <table class="admin-table-fixed">
                    <colgroup>
                        <col>
                        <col>
                        <col>
                        <col>
                        <col>
                        <col>
                    </colgroup>
                    <thead>
                        <tr style="background: linear-gradient(to bottom, var(--bg-f8f9fa) 0%, var(--bg-e9ecef) 100%); border-bottom: 2px solid var(--bd-dee2e6);">
                            <th style="font-weight: 600; color: var(--fg-495057); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                <i class="fa-solid fa-grip-vertical" style="color: var(--fg-adb5bd);"></i>
                            </th>
                            <th style="font-weight: 600; color: var(--fg-495057); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                COLUMN
                            </th>
                            <th style="font-weight: 600; color: var(--fg-495057); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                VISIBILITY
                            </th>
                            <th style="font-weight: 600; color: var(--fg-495057); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ADD FILTER
                            </th>
                            <th style="font-weight: 600; color: var(--fg-495057); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                LOOKUP TABLE
                            </th>
                            <th style="font-weight: 600; color: var(--fg-495057); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>
                    <tbody id="column-list">
    `;
    
    // Group columns by category
    const groupedColumns = {
        'Primary': [],
        'Task Content': [],
        'Task Category': [],
        'Task Data': [],
        'Task Dates': [],
        'Column Section': []
    };
    
    // Sort columns by sort_order
    columns.sort((a, b) => a.sort_order - b.sort_order);
    
    columns.forEach(col => {
        // Categorize columns based on new organization
        if (['id', 'title', 'project_id', 'task_group', 'status_name'].includes(col.column_name)) {
            groupedColumns['Primary'].push(col);
        } else if (['task_description', 'comments', 'url', 'file'].includes(col.column_name)) {
            groupedColumns['Task Content'].push(col);
        } else if (['category_id', 'subcategory_id'].includes(col.column_name)) {
            groupedColumns['Task Category'].push(col);
        } else if (['stage_name', 'assigned_to', 'priority_name', 'environment_name', 'service_component'].includes(col.column_name)) {
            groupedColumns['Task Data'].push(col);
        } else if (['due_date', 'reminder_date', 'created_at'].includes(col.column_name)) {
            groupedColumns['Task Dates'].push(col);
        } else {
            // All other properties: stakeholders, template_source, blocked_by, etc.
            groupedColumns['Column Section'].push(col);
        }
    });
    
    // Render grouped columns
    Object.entries(groupedColumns).forEach(([groupName, groupCols]) => {
        if (groupCols.length === 0) return;
        
        // Group header row
        html += `
            <tr style="background: var(--bg-f1f3f5); border-top: 2px solid var(--bd-dee2e6); border-bottom: 1px solid var(--bd-dee2e6);">
                <td colspan="6" style="padding: 10px 20px; font-weight: 600; color: var(--fg-212529); font-size: 13px;">
                    ${groupName}
                </td>
            </tr>
        `;
        
        // Column rows
        groupCols.forEach(col => {
            const isLocked = col.is_locked === 1;
            const checked = col.is_visible ? 'checked' : '';
            const filterableChecked = col.is_filterable ? 'checked' : '';
            const disabled = isLocked ? 'disabled' : '';
            const hasLookup = col.column_type.startsWith('lookup_');
            const lookupType = hasLookup ? col.column_type.replace('lookup_', '') : '';
            
            html += `
                <tr data-column="${col.column_name}" draggable="${!isLocked}" 
                    style="border-bottom: 1px solid var(--bd-e9ecef);"
                    onmouseover="if(!${isLocked}) this.style.background='var(--bg-f8f9fa)'"
                    onmouseout="this.style.background='var(--bg-fff)'">
                    
                    <td>
                        ${!isLocked ? '<i class="fa-solid fa-grip-vertical handle" style="color: var(--fg-adb5bd); cursor: grab;"></i>' : ''}
                    </td>
                    
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <input type="text" value="${col.display_name}" 
                                   data-field="display_name" data-column="${col.column_name}" 
                                   style="padding: 6px 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 14px; width: 100%; box-sizing: border-box;"
                                   onchange="handleColumnNameChange(this)">
                            <small style="color: var(--fg-6c757d); font-size: 11px;">
                                ${isLocked ? '<i class="fa-solid fa-lock"></i> LOCKED ' : ''}${col.column_type} | ${col.column_name}
                            </small>
                        </div>
                    </td>
                    
                    <td>
                        <input type="checkbox" data-column="${col.column_name}" 
                               ${checked} ${disabled} 
                               class="column-visibility-toggle" 
                               onchange="handleColumnToggle(this)" 
                               style="width: 18px; height: 18px; cursor: ${isLocked ? 'not-allowed' : 'pointer'};">
                    </td>
                    
                    <td>
                        <input type="checkbox" data-column="${col.column_name}" 
                               ${filterableChecked}
                               class="column-filterable-toggle" 
                               onchange="handleFilterableToggle(this)" 
                               style="width: 18px; height: 18px; cursor: pointer;">
                    </td>
                    
                    <td>
                        ${hasLookup ? 
                            `<div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                                <span style="color: #28a745; font-weight: 600; font-size: 16px;">Y</span>
                                <small style="color: var(--fg-6c757d); font-size: 11px;">${lookupType}</small>
                             </div>` : 
                            ''}
                    </td>
                    
                    <td>
                        ${isLocked ? 
                            '<i class="fa-solid fa-lock" style="color: var(--fg-6c757d); font-size: 16px;"></i>'
                            : (!col.is_visible ? 
                                `<button onclick="deleteColumn('${col.column_name}')" 
                                        style="padding: 6px 12px; background: #ffc107; color: var(--fg-000); border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                    Reset
                                </button>`
                                : 
                                `<button onclick="deleteColumn('${col.column_name}')" 
                                        style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                    Hide
                                </button>`
                            )
                        }
                    </td>
                </tr>
            `;
        });
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <!-- Save Button -->
            <div style="margin-top: 25px; display: flex; justify-content: flex-end;">
                <button class="save-button" id="save-column-settings" 
                        style="padding: 12px 30px; font-size: 15px;">
                    <i class="fa-solid fa-save"></i> Save All Changes
                </button>
            </div>
        </div>
    `;
    
    contentArea.innerHTML = html;
    
    // Attach event listeners after rendering
    document.getElementById('save-column-settings').addEventListener('click', saveColumnSettings);
    setupDragAndDrop();
}

/**
 * Handles the filterable checkbox toggle and updates the global state.
 */
function handleFilterableToggle(checkbox) {
    const columnName = checkbox.dataset.column;
    const isChecked = checkbox.checked;
    const col = columnSettings.find(c => c.column_name === columnName);
    
    if (col) {
        // Count current filterable columns
        const currentFilterableCount = columnSettings.filter(c => c.is_filterable === 1).length;
        
        if (isChecked && currentFilterableCount >= 5) {
            alert('Maximum 5 columns can be filterable. Please uncheck another column first.');
            checkbox.checked = false;
            return;
        }
        
        col.is_filterable = isChecked ? 1 : 0;
        updateFilterableCount();
    }
}

/**
 * Updates the filterable count display
 */
function updateFilterableCount() {
    const count = columnSettings.filter(c => c.is_filterable === 1).length;
    const countElement = document.getElementById('filterable-count');
    if (countElement) {
        countElement.textContent = count;
        countElement.style.color = count >= 5 ? '#dc3545' : '#28a745';
    }
}

/**
 * Handles the column display name change and updates the global state.
 */
function handleColumnNameChange(input) {
    const columnName = input.dataset.column;
    const col = columnSettings.find(c => c.column_name === columnName);
    if (col) {
        col.display_name = input.value.trim();
    }
}

/**
 * Handles the checkbox toggle change and updates the global state.
 */
function handleColumnToggle(checkbox) {
    const columnName = checkbox.dataset.column;
    const isChecked = checkbox.checked;
    const col = columnSettings.find(c => c.column_name === columnName);
    
    if (col) {
        col.is_visible = isChecked ? 1 : 0;
        
        // Update button appearance immediately to reflect state
        const itemElement = checkbox.closest('.settings-list-item');
        const deleteButton = itemElement.querySelector('.delete-button');

        if (!col.is_default && deleteButton) {
            if (isChecked) {
                // Was reset/hidden, now visible again
                deleteButton.textContent = 'Hide';
                deleteButton.style.backgroundColor = '#dc3545';
                deleteButton.onclick = () => deleteColumn(col.column_name);
            } else {
                // Now hidden, can be permanently reset/removed
                deleteButton.textContent = 'Reset Slot';
                deleteButton.style.backgroundColor = '#ffc107';
                deleteButton.onclick = () => deleteColumn(col.column_name);
            }
        }
    }
}

/**
 * Sends a request to the backend to add a new generic column.
 */
function addNewColumn() {
    const nameInput = document.getElementById('new-column-name');
    const newName = nameInput.value.trim();
    
    if (!newName) {
        alert("Please enter a display name for the new column.");
        return;
    }

    fetch('/api/admin/columns/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: newName })
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to add column'); });
        return response.json();
    })
    .then(data => {
        alert(`New column "${data.display_name}" added!`);
        nameInput.value = '';
        fetchColumnSettings(); // Reload the UI
    })
    .catch(error => {
        showNotification('Error adding column: ' + error.message, 'error');
        console.error('Add column error:', error);
    });
}

/**
 * Sends a request to the backend to hide/reset a column.
 */
function deleteColumn(columnName) {
    const col = columnSettings.find(c => c.column_name === columnName);
    
    if (col.is_locked === 1) {
        alert("Locked columns (Task ID, Task Name, Status) cannot be deleted or hidden.");
        return;
    }
    
    let confirmationMessage = '';
    if (col.is_default === 1) {
        confirmationMessage = `Are you sure you want to hide the default column "${col.display_name}"?`;
    } else if (col.is_visible === 1) {
        confirmationMessage = `Are you sure you want to hide the custom column "${col.display_name}"?`;
    } else {
        confirmationMessage = `Are you sure you want to permanently reset the custom field slot for "${col.display_name}"? Any data in this column will remain, but the header will be permanently removed/reset.`;
    }

    if (!confirm(confirmationMessage)) return;

    fetch(`/api/admin/columns/delete/${columnName}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to delete column'); });
        return response.json();
    })
    .then(data => {
        alert(data.message);
        fetchColumnSettings(); // Reload the UI
    })
    .catch(error => {
        showNotification('Error deleting column: ' + error.message, 'error');
        console.error('Delete column error:', error);
    });
}


/**
 * Sends the updated column settings (including new order and visibility) to the backend.
 */
function saveColumnSettings() {
    const button = document.getElementById('save-column-settings');
    const originalText = button.textContent;
    button.textContent = 'Saving...';
    button.disabled = true;
    
    const columnListElement = document.getElementById('column-list');
    const updatedSettings = [];
    
    // 1. Determine the new order from the DOM
    Array.from(columnListElement.children).forEach((item, index) => {
        const columnName = item.dataset.column;
        const col = columnSettings.find(c => c.column_name === columnName);
        
        if (col) {
            // Update the state object with the current values from the DOM
            const nameInput = item.querySelector('input[data-field="display_name"]');
            col.display_name = nameInput ? nameInput.value.trim() : col.display_name;
            
            // Visibility might have changed in the checkbox (except for locked columns)
            if (col.is_locked !== 1) {
                const visibilityToggle = item.querySelector('.column-visibility-toggle');
                col.is_visible = visibilityToggle ? (visibilityToggle.checked ? 1 : 0) : col.is_visible;
            }
            
            // Filterable might have changed
            const filterableToggle = item.querySelector('.column-filterable-toggle');
            col.is_filterable = filterableToggle ? (filterableToggle.checked ? 1 : 0) : (col.is_filterable || 0);
            
            // Update the sort_order from the position in the list
            col.sort_order = index;
            
            updatedSettings.push(col);
        }
    });
    
    // 2. Send the updated settings to the backend
    fetch('/api/admin/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to save'); });
        return response.json();
    })
    .then(data => {
        showNotification('Column settings saved successfully!', 'success');
        button.textContent = originalText;
        button.disabled = false;
    })
    .catch(error => {
        showNotification('Error saving column settings: ' + error.message, 'error');
        console.error('Save error:', error);
        button.textContent = originalText;
        button.disabled = false;
    });
}


/**
 * Setup drag-and-drop for column reordering.
 */
function setupDragAndDrop() {
    const items = document.querySelectorAll('#column-list tr[draggable="true"]');
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            setTimeout(() => {
                item.style.opacity = '0.5';
            }, 0);
        });

        item.addEventListener('dragend', (e) => {
            setTimeout(() => {
                item.style.opacity = '1';
                draggedItem = null;
            }, 0);
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            // Add visual indicator
            item.style.borderTop = '2px solid #007bff';
        });
        
        item.addEventListener('dragleave', (e) => {
            item.style.borderTop = '1px solid var(--bd-e9ecef)';
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderTop = '1px solid var(--bd-e9ecef)';
            
            if (draggedItem !== item) {
                const allItems = [...document.querySelectorAll('#column-list tr[draggable="true"]')];
                const draggedIndex = allItems.indexOf(draggedItem);
                const targetIndex = allItems.indexOf(item);

                if (draggedIndex < targetIndex) {
                    item.parentNode.insertBefore(draggedItem, item.nextSibling);
                } else {
                    item.parentNode.insertBefore(draggedItem, item);
                }
            }
        });
    });
}


// --- 2. Customize Data Model (Lookup Tables CRUD) ---

function setupTaskDataModelCustomization(container) {
    // Table Configuration Object
    const tableConfigs = {
        'categories': { name: 'Categories', id_field: 'cat_id', requires_status: true, is_sortable: false, requires_category: false },
        'projects': { name: 'Projects', id_field: 'prj_id', requires_status: true, is_sortable: false, requires_category: false },
        'subcategories': { name: 'Sub-Categories', id_field: 'scat_id', requires_status: true, is_sortable: false, requires_category: true },
        'lkp_status': { name: 'Status Lookup', id_field: 'name', requires_status: false, is_sortable: true, requires_category: false },
        'lkp_priority': { name: 'Priority Lookup', id_field: 'name', requires_status: false, is_sortable: true, requires_category: false },
        'lkp_stage': { name: 'Stage Lookup', id_field: 'name', requires_status: false, is_sortable: true, requires_category: false },
        'lkp_environment': { name: 'Environment Lookup', id_field: 'name', requires_status: true, is_sortable: false, requires_category: false }
    };

    let html = `<h3>Task Data Model</h3>`;
    html += `<p>Manage lookup tables and reference data used for tasks.</p>`;

    // Dropdown to select table
    html += `
        <div style="margin-bottom: 20px;">
            <label for="table-selector" style="font-weight: 500; margin-right: 10px;">Select Lookup Table:</label>
            <select id="table-selector" onchange="loadLookupTable(this.value)" style="padding: 8px; border: 1px solid var(--bd-ccc); border-radius: 4px;">
                ${Object.keys(tableConfigs).map(key => 
                    `<option value="${key}" ${key === currentLookupTable ? 'selected' : ''}>${tableConfigs[key].name}</option>`
                ).join('')}
            </select>
        </div>
    `;

    html += `<div id="lookup-table-content"></div>`;
    container.innerHTML = html;

    // Load the default table
    loadLookupTable(currentLookupTable);
}

// Load and display a specific lookup table
function loadLookupTable(tableName) {
    currentLookupTable = tableName;

    fetch(`/api/data_model/${tableName}`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch ${tableName}`);
            return response.json();
        })
        .then(data => {
            renderLookupTableCRUD(tableName, data);
        })
        .catch(error => {
            document.getElementById('lookup-table-content').innerHTML = `<p style="color:red;">Error loading ${tableName}: ${error.message}</p>`;
            console.error(`Error fetching ${tableName}:`, error);
        });
}

// Render CRUD interface for a lookup table
function renderLookupTableCRUD(tableName, data) {
    const container = document.getElementById('lookup-table-content');
    
    const tableConfigs = {
        'categories': { name: 'Categories', id_field: 'cat_id', requires_status: true, is_sortable: false, requires_category: false },
        'projects': { name: 'Projects', id_field: 'prj_id', requires_status: true, is_sortable: false, requires_category: false },
        'subcategories': { name: 'Sub-Categories', id_field: 'scat_id', requires_status: true, is_sortable: false, requires_category: true },
        'lkp_status': { name: 'Status Lookup', id_field: 'name', requires_status: false, is_sortable: true, requires_category: false },
        'lkp_priority': { name: 'Priority Lookup', id_field: 'name', requires_status: false, is_sortable: true, requires_category: false },
        'lkp_stage': { name: 'Stage Lookup', id_field: 'name', requires_status: false, is_sortable: true, requires_category: false },
        'lkp_environment': { name: 'Environment Lookup', id_field: 'name', requires_status: true, is_sortable: false, requires_category: false }
    };

    const config = tableConfigs[tableName];
    if (!config) {
        container.innerHTML = `<p style="color:red;">Unknown table: ${tableName}</p>`;
        return;
    }

    const itemType = config.name;
    const idField = config.id_field;
    let html = `<h4>${itemType}</h4>`;

    const requiresStatus = config.requires_status;
    const isSortable = config.is_sortable;
    const requiresCategory = config.requires_category;

    html += `
        <div style="background-color: var(--bg-e9f5ff); padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <h5>Add New ${itemType}</h5>
            
            <input type="text" id="${tableName}-new-name" placeholder="Name" style="padding: 8px; margin-right: 10px; border: 1px solid var(--bd-ccc); border-radius: 4px;">
            
            ${requiresCategory ? `
                <select id="${tableName}-new-category" style="padding: 8px; margin-right: 10px; border: 1px solid var(--bd-ccc); border-radius: 4px;">
                    <option value="">-- Select Parent Category --</option>
                    ${categoryLookups.map(c => `<option value="${c.cat_id}">${c.name}</option>`).join('')}
                </select>` : ''}

            ${requiresStatus ? `
                <select id="${tableName}-new-status" style="padding: 8px; margin-right: 10px; border: 1px solid var(--bd-ccc); border-radius: 4px;">
                    <option value="Active">Active</option>
                    <option value="InActive">InActive</option>
                </select>` : ''}

            ${isSortable ? `
                <input type="number" id="${tableName}-new-sort" placeholder="Sort Order" value="99" style="width: 100px; padding: 8px; margin-right: 10px; border: 1px solid var(--bd-ccc); border-radius: 4px;">` : ''}

            <button class="save-button" style="margin-top: 0; padding: 8px 15px; font-size: 1em;" 
                    onclick="createLookupItem('${tableName}', '${idField}')">Add</button>
        </div>
    `;

    html += `<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
            <tr style="background-color: var(--bg-f0f0f0);">
                <th style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: left;">${idField.toUpperCase()}</th>
                <th style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: left;">Name</th>
                ${requiresCategory ? '<th style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: left;">Parent Category</th>' : ''}
                ${requiresStatus ? '<th style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: left;">Status</th>' : ''}
                ${isSortable ? '<th style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: left;">Sort</th>' : ''}
                <th style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: center;">Actions</th>
            </tr>
        </thead>
        <tbody>`;
    
    data.forEach(item => {
        const itemId = item[idField] || item.name; 
        
        html += `
            <tr id="row-${tableName}-${itemId}">
                <td style="padding: 10px; border: 1px solid var(--bd-ccc); font-family: monospace;">${itemId}</td>
                <td style="padding: 10px; border: 1px solid var(--bd-ccc);">
                    <input type="text" value="${item.name}" data-field="name" data-id="${itemId}" style="width: 90%; padding: 5px; border: 1px solid var(--bd-eee); border-radius: 3px;">
                </td>

                ${requiresCategory ? 
                    `<td style="padding: 10px; border: 1px solid var(--bd-ccc);">
                        <select data-field="category_id" data-id="${itemId}" style="padding: 5px; border: 1px solid var(--bd-eee); border-radius: 3px;">
                            ${categoryLookups.map(c => 
                                `<option value="${c.cat_id}" ${item.category_id === c.cat_id ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                    </td>` : ''}
                
                ${requiresStatus ? 
                    `<td style="padding: 10px; border: 1px solid var(--bd-ccc);">
                        <select data-field="status" data-id="${itemId}" style="padding: 5px; border: 1px solid var(--bd-eee); border-radius: 3px;">
                            <option value="Active" ${item.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="InActive" ${item.status === 'InActive' ? 'selected' : ''}>InActive</option>
                        </select>
                    </td>` : ''}

                ${isSortable ? 
                    `<td style="padding: 10px; border: 1px solid var(--bd-ccc);">
                        <input type="number" value="${item.sort_order}" data-field="sort_order" data-id="${itemId}" style="width: 80px; padding: 5px; border: 1px solid var(--bd-eee); border-radius: 3px;">
                    </td>` : ''}
                
                <td style="padding: 10px; border: 1px solid var(--bd-ccc); text-align: center;">
                    <button style="background-color: #007bff; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px; border-radius: 3px;" 
                            onclick="updateLookupItem('${tableName}', '${idField}', '${itemId}')">Update</button>
                    <button style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;" 
                            onclick="deleteLookupItem('${tableName}', '${idField}', '${itemId}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// CRUD: Create
function createLookupItem(tableName, idField) {
    const nameInput = document.getElementById(`${tableName}-new-name`);
    const statusSelect = document.getElementById(`${tableName}-new-status`);
    const sortInput = document.getElementById(`${tableName}-new-sort`);
    const categorySelect = document.getElementById(`${tableName}-new-category`);

    if (!nameInput.value.trim()) {
        alert("Name cannot be empty.");
        return;
    }
    if (categorySelect && !categorySelect.value) {
        alert("Please select a Parent Category.");
        return;
    }
    
    const newItem = {
        name: nameInput.value,
        status: statusSelect ? statusSelect.value : undefined,
        sort_order: sortInput ? parseInt(sortInput.value) : undefined,
        category_id: categorySelect ? categorySelect.value : undefined
    };

    fetch(`/api/data_model/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to create item'); });
        return response.json();
    })
    .then(() => {
        nameInput.value = '';
        if (statusSelect) statusSelect.value = 'Active';
        if (sortInput) sortInput.value = 99;
        if (categorySelect) categorySelect.value = '';
        
        // Reload lookup data globally
        reloadLookupData().then(() => {
            loadLookupTable(tableName);
        });
    })
    .catch(error => {
        showNotification('Error creating item: ' + error.message, 'error');
        console.error('Create error:', error);
    });
}

// CRUD: Update
function updateLookupItem(tableName, idField, itemId) {
    const row = document.getElementById(`row-${tableName}-${itemId}`);
    const name = row.querySelector(`input[data-field="name"]`).value;
    const statusElement = row.querySelector(`select[data-field="status"]`);
    const sortElement = row.querySelector(`input[data-field="sort_order"]`);
    const categoryElement = row.querySelector(`select[data-field="category_id"]`);

    const updatedItem = { 
        name, 
        status: statusElement ? statusElement.value : undefined,
        sort_order: sortElement ? parseInt(sortElement.value) : undefined,
        category_id: categoryElement ? categoryElement.value : undefined
    };

    fetch(`/api/data_model/${tableName}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to update item'); });
        showNotification('Item updated successfully!', 'success');
        
        // Reload lookup data globally
        reloadLookupData().then(() => {
            loadLookupTable(tableName);
        });
    })
    .catch(error => {
        showNotification('Error updating item: ' + error.message, 'error');
        console.error('Update error:', error);
    });
}

// CRUD: Delete
function deleteLookupItem(tableName, idField, itemId) {
    if (!confirm(`Are you sure you want to delete this item (${itemId})? This action cannot be undone.`)) return;

    fetch(`/api/data_model/${tableName}/${itemId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.error || 'Failed to delete item'); });
        
        document.getElementById(`row-${tableName}-${itemId}`).remove();
        showNotification('Item deleted successfully!', 'success');
        
        // Reload lookup data globally
        reloadLookupData().then(() => {
            if (tableName === 'categories') {
                loadLookupTable(tableName); 
            }
        });
    })
    .catch(error => {
        showNotification('Error deleting item: ' + error.message, 'error');
        console.error('Delete error:', error);
    });
}


// ========================================================================
//                        TASKS TABLE VIEW
// ========================================================================

/**
 * Initialize the Tasks Table page
 */
function initializeTasksTable() {
    const container = document.getElementById('tasks-table-container');
    container.innerHTML = '<p>Loading tasks...</p>';
    
    // Fetch both column settings and tasks data
    return Promise.all([
        fetch('/api/admin/columns').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json())
    ])
    .then(([columns, tasks, lookups]) => {
        // Store ALL columns for forms and export
        allColumnSettings = columns.sort((a, b) => a.sort_order - b.sort_order);
        // Store only VISIBLE columns for table display
        columnSettings = columns.filter(c => c.is_visible === 1).sort((a, b) => a.sort_order - b.sort_order);
        // Filter out template tasks (hidden parent tasks marked with is_deleted=1)
        // but show all regular recurring tasks and instances
        allTasks = tasks.filter(t => {
            // Hide deleted templates
            if (t.is_deleted === 1 && t.recurrence_type && !t.recurrence_parent_id) {
                return false;
            }
            return true;
        });
        // Feature-23: Apply hide tasks filter
        filteredTasks = applyHideTasksFilter(allTasks);
        lookupData = lookups;
        renderTasksTable();
    })
    .catch(error => {
        container.innerHTML = `<p style="color:red;">Error loading tasks: ${error.message}</p>`;
        console.error('Error loading tasks table:', error);
    });
}

/**
 * Render the tasks table with search and filters
 */
function renderTasksTable() {
    const container = document.getElementById('tasks-table-container');
    
    if (currentView === 'kanban') {
        renderKanbanView();
        return;
    }
    
    // Recalculate filtered tasks based on current filters
    filteredTasks = applyFilters(allTasks);
    
    // Get filterable columns
    const filterableColumns = columnSettings.filter(c => c.is_filterable === 1);
    
    let html = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button style="padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="toggleKanbanView()">
                <i class="fa-solid fa-table-columns"></i> Kanban
            </button>
            <button style="padding: 8px 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="openAddTaskModal()" title="Add Task">
                <i class="fa-solid fa-plus"></i>
            </button>
            <button style="padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="handleBulkEdit()" title="Edit Selected">
                <i class="fa-solid fa-edit"></i>
            </button>
            <button style="padding: 8px 12px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="handleBulkDuplicate()" title="Duplicate Selected">
                <i class="fa-solid fa-copy"></i>
            </button>
            <button style="padding: 8px 12px; background-color: #ffc107; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="handleBulkArchiveButton()" title="Archive Selected">
                <i class="fa-solid fa-box-archive"></i>
            </button>
            <button style="padding: 8px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="handleBulkDeleteButton()" title="Delete Selected">
                <i class="fa-solid fa-trash"></i>
            </button>
            <button style="padding: 8px 15px; background-color: ${showBulkActionsBar ? '#007bff' : '#6c757d'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; margin-left: 10px;" onclick="toggleBulkActionsBar()">
                <i class="fa-solid fa-${showBulkActionsBar ? 'eye-slash' : 'eye'}"></i> Bulk Actions
            </button>
            <button onclick="toggleHideCompletedTasks()" 
                    style="padding: 8px 15px; background-color: ${hideCompletedTasks ? '#28a745' : '#6c757d'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">
                <i class="fa-solid fa-eye${hideCompletedTasks ? '-slash' : ''}"></i> Completed Tasks
            </button>
            <button onclick="toggleHideTemplateTasks()" 
                    style="padding: 8px 15px; background-color: ${hideTemplateTasks ? '#6f42c1' : '#6c757d'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">
                <i class="fa-solid fa-eye${hideTemplateTasks ? '-slash' : ''}"></i> Template Tasks
            </button>
    `;
    
    if (showBulkActionsBar && selectedTasks.size > 0) {
        html += `
            <div id="bulk-actions-bar" style="width: 100%; display: flex; gap: 10px; padding: 15px; background: var(--bg-e7f3ff); border-radius: 6px; margin-top: 10px; border: 2px solid #007bff; align-items: center; flex-wrap: wrap;">
                <span class="selected-count" style="font-weight: 600; color: var(--fg-495057);">${selectedTasks.size} task(s) selected</span>
                <button onclick="bulkChangeStatus()" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-flag"></i> Status</button>
                <button onclick="bulkAssign()" style="padding: 8px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-user"></i> Assign</button>
                <button onclick="bulkReschedule()" style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-calendar"></i> Reschedule</button>
                <button onclick="bulkChangeCategory()" style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-folder"></i> Category</button>
                <button onclick="bulkChangeProject()" style="padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-diagram-project"></i> Project</button>
                <button onclick="bulkArchive()" style="padding: 8px 12px; background: #ffc107; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-box-archive"></i> Archive</button>
                <button onclick="bulkDelete()" style="padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-trash"></i> Delete</button>
                <button onclick="clearSelection()" style="margin-left: auto; padding: 8px 12px; background: var(--bg-fff); color: var(--fg-6c757d); border: 2px solid var(--bd-dee2e6); border-radius: 4px; cursor: pointer; font-size: 0.85em;"><i class="fa-solid fa-times"></i> Clear</button>
            </div>
        `;
    }
    
    
    // Add filter dropdowns inline if there are filterable columns
    if (filterableColumns.length > 0) {
        filterableColumns.forEach(col => {
            const filterValue = activeFilters[col.column_name] || '';
            
            html += `<select onchange="handleFilterChange('${col.column_name}', this.value)" 
                            style="padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 120px;">`;
            html += `<option value="">${col.display_name}: All</option>`;
            html += `<option value="__NONE__" ${filterValue === '__NONE__' ? 'selected' : ''}>${col.display_name}: None</option>`;
            
            // Get unique values for this column
            const uniqueValues = [...new Set(allTasks.map(t => t[col.column_name]).filter(v => v))];
            
            // For lookup columns, get the display names
            uniqueValues.forEach(value => {
                let displayValue = value;
                
                if (col.column_type === 'lookup_projects' && lookupData.projects) {
                    const project = lookupData.projects.find(p => p.prj_id === value);
                    displayValue = project ? project.name : value;
                } else if (col.column_type === 'lookup_categories' && lookupData.categories) {
                    const category = lookupData.categories.find(c => c.cat_id === value);
                    displayValue = category ? category.name : value;
                } else if (col.column_type === 'lookup_subcategories' && lookupData.subcategories) {
                    const subcategory = lookupData.subcategories.find(sc => sc.scat_id === value);
                    displayValue = subcategory ? subcategory.name : value;
                }
                
                const selected = filterValue === value ? 'selected' : '';
                html += `<option value="${value}" ${selected}>${displayValue}</option>`;
            });
            
            html += `</select>`;
        });
        
        html += `
            <button onclick="clearAllFilters()" 
                    style="padding: 10px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">
                <i class="fa-solid fa-times"></i> Clear
            </button>
        `;
    }
    
    html += `
            <input type="text" id="task-search" placeholder="Search tasks..." 
                   style="flex-grow: 1; min-width: 200px; padding: 10px; border: 1px solid var(--bd-ccc); border-radius: 4px;"
                   oninput="handleTaskSearch(this.value)">
        `;
    
    html += `</div>`;
    
    html += `
        <div style="overflow-x: auto; background: var(--bg-fff); border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <table id="tasks-table" class="data-table" style="width: 100%; border-collapse: collapse; min-width: 800px; table-layout: fixed;">
                <colgroup>
                    <col style="width: 50px;">
    `;
    
    // Default column widths (the table uses table-layout: fixed, so <col> needs width, not min-width).
    // Task Name gets the most room; anything not listed falls back to 140px.
    const TASK_COLUMN_WIDTHS = {
        title: '420px',
        id: '90px',
        task_description: '240px',
        comments: '200px'
    };
    columnSettings.forEach(col => {
        html += `<col style="width: ${TASK_COLUMN_WIDTHS[col.column_name] || '140px'};">`;
    });
    
    html += `
                </colgroup>
                <thead>
                    <tr style="background-color: var(--bg-f8f9fa); border-bottom: 2px solid var(--bd-dee2e6);">
                        <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 0.9em;">
                            <input type="checkbox" id="select-all-checkbox" onchange="toggleSelectAll(this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                        </th>
    `;
    // Render table headers based on visible columns
    columnSettings.forEach(col => {
        html += `
            <th style="padding: 12px; text-align: left; font-weight: 600; cursor: pointer; user-select: none; position: relative; font-size: 0.9em; min-width: 100px; resize: horizontal; overflow: auto;"
                onclick="sortTable('${col.column_name}')">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${col.display_name}
                    <span id="sort-${col.column_name}" style="margin-left: 5px; color: var(--fg-6c757d); font-size: 0.8em;"></span>
                </div>
            </th>
        `;
    });
    
    html += `
                    </tr>
                </thead>
                <tbody id="tasks-table-body">
    `;
    
    // Render task rows
    if (filteredTasks.length === 0) {
        html += `
            <tr>
                <td colspan="${columnSettings.length + 1}" style="padding: 40px; text-align: center; color: var(--fg-6c757d);">
                    No tasks found
                </td>
            </tr>
        `;
    } else {
        filteredTasks.forEach(task => {
            const isSelected = selectedTasks.has(task.id);
            html += `<tr data-task-id="${task.id}" style="border-bottom: 1px solid var(--bd-e9ecef); transition: background-color 0.2s;" 
                         onmouseover="this.style.backgroundColor='var(--bg-f8f9fa)'" 
                         onmouseout="this.style.backgroundColor='var(--bg-fff)'">`;
            
            html += `
                <td style="padding: 10px; text-align: center;">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" 
                           ${isSelected ? 'checked' : ''}
                           onchange="handleTaskSelection(${task.id}, this.checked)" 
                           style="width: 18px; height: 18px; cursor: pointer;">
                </td>
            `;
            
            columnSettings.forEach(col => {
                let value = formatCellValue(task[col.column_name], col.column_type, col.column_name);
                
                if (col.column_name === 'title' && task.recurrence_parent_id) {
                    value += getRecurringIcon(task);
                }
                
                const plainText = String(value || '').replace(/<[^>]*>/g, '');
                html += `<td style="padding: 10px; vertical-align: top; font-size: 0.85em; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${plainText}"><div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${value}</div></td>`;
            });
            
            html += `</tr>`;
        });
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    html += `
        <div style="margin-top: 15px; color: var(--fg-6c757d); font-size: 0.9em;">
            Showing ${filteredTasks.length} of ${allTasks.length} tasks
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Format cell value based on column type
 */
function formatCellValue(value, columnType, columnName) {
    if (value === null || value === undefined || value === '') {
        return '<span style="color: var(--fg-adb5bd);">—</span>';
    }
    
    // Special handling for blocked_by - color code by task status
    if (columnName === 'blocked_by' && value && typeof value === 'string' && value.trim() !== '') {
        console.log('=== BLOCKED BY FORMATTING ===');
        console.log('columnName:', columnName);
        console.log('value:', value);
        console.log('value type:', typeof value);
        
        // Try to parse task IDs
        const taskIds = value.split(',').map(id => id.trim()).filter(id => id && !isNaN(parseInt(id)));
        console.log('Parsed task IDs:', taskIds);
        console.log('allTasks available:', allTasks ? allTasks.length : 'NO');
        
        if (taskIds.length > 0 && allTasks && allTasks.length > 0) {
            // Get tasks and format with status colors
            const blockedByTasks = taskIds.map(id => {
                const task = allTasks.find(t => t.id == id);
                console.log(`Looking for task ${id}:`, task ? `Found - status: ${task.status_name}` : 'NOT FOUND');
                
                if (!task) {
                    return `<span style="display: inline-block; margin: 2px; padding: 3px 8px; background-color: #6c757d; color: white; border-radius: 3px; font-size: 0.8em; font-weight: 500;">#${id}</span>`;
                }
                
                const color = getStatusColor(task.status_name);
                console.log(`Task ${id} color:`, color);
                
                return `<span style="display: inline-block; margin: 2px; padding: 3px 8px; background-color: ${color}; color: white; border-radius: 3px; font-size: 0.8em; font-weight: 500;" title="${task.title} - ${task.status_name}">#${task.id}</span>`;
            });
            
            const result = blockedByTasks.join('');
            console.log('Final HTML:', result);
            console.log('=== END BLOCKED BY ===');
            return result;
        } else {
            console.log('Skipping formatting - no valid task IDs or allTasks not available');
            console.log('=== END BLOCKED BY ===');
        }
    }
    
    // Handle lookup types - display the name instead of ID
    if (columnType === 'lookup_projects' && lookupData.projects) {
        const project = lookupData.projects.find(p => p.prj_id === value);
        return project ? project.name : value;
    }
    if (columnType === 'lookup_categories' && lookupData.categories) {
        const category = lookupData.categories.find(c => c.cat_id === value);
        return category ? category.name : value;
    }
    if (columnType === 'lookup_subcategories' && lookupData.subcategories) {
        const subcategory = lookupData.subcategories.find(sc => sc.scat_id === value);
        return subcategory ? subcategory.name : value;
    }
    if (columnType === 'lookup_status') {
        // Status badge uses the same colour as kanban headers and cards
        const color = getStatusColor(value);
        return `<span style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 0.85em; font-weight: 500;">${value}</span>`;
    }
    if (columnType === 'lookup_priority') {
        const priorityColors = {
            'Low': '#28a745',
            'Medium': '#ffc107',
            'High': '#fd7e14',
            'Critical': '#dc3545'
        };
        const color = priorityColors[value] || '#6c757d';
        return `<span style="color: ${color}; font-weight: 500;">${value}</span>`;
    }
    
    // Handle dates
    if (columnType === 'date' && value) {
        try {
            const date = new Date(value);
            return date.toLocaleDateString();
        } catch (e) {
            return value;
        }
    }
    
    return value;
}

/**
 * Handle search input
 */
function handleTaskSearch(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();
    
    // Start with all tasks
    let tasks = allTasks;
    
    // Apply filters first
    tasks = applyFilters(tasks);
    
    // Then apply search
    if (searchTerm) {
        filteredTasks = tasks.filter(task => {
            return columnSettings.some(col => {
                const value = task[col.column_name];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchTerm);
            });
        });
    } else {
        filteredTasks = tasks;
    }
    
    // Update only the content, not the entire page (to preserve search input focus)
    if (currentView === 'kanban') {
        updateKanbanContent();
    } else {
        updateTableContent();
    }
}

/**
 * Update only table content (not controls) - prevents search input recreation
 */
function updateTableContent() {
    const tbody = document.getElementById('tasks-table-body');
    if (!tbody) {
        // If tbody doesn't exist, do full render
        renderTasksTable();
        return;
    }
    
    let html = '';
    
    if (filteredTasks.length === 0) {
        html = `
            <tr>
                <td colspan="${columnSettings.length + 1}" style="padding: 40px; text-align: center; color: var(--fg-6c757d);">
                    No tasks found
                </td>
            </tr>
        `;
    } else {
        filteredTasks.forEach(task => {
            const isSelected = selectedTasks.has(task.id);
            html += `<tr data-task-id="${task.id}" style="border-bottom: 1px solid var(--bd-e9ecef); transition: background-color 0.2s;" 
                         onmouseover="this.style.backgroundColor='var(--bg-f8f9fa)'" 
                         onmouseout="this.style.backgroundColor='var(--bg-fff)'">`;
            
            // Checkbox column
            html += `
                <td style="padding: 10px; text-align: center;">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" 
                           ${isSelected ? 'checked' : ''}
                           onchange="handleTaskSelection(${task.id}, this.checked)" 
                           style="width: 18px; height: 18px; cursor: pointer;">
                </td>
            `;
            
            // Data columns
            columnSettings.forEach(col => {
                let value = formatCellValue(task[col.column_name], col.column_type, col.column_name);
                
                if (col.column_name === 'title' && task.recurrence_parent_id) {
                    value += getRecurringIcon(task);
                }
                
                const plainText = String(value || '').replace(/<[^>]*>/g, '');
                html += `<td style="padding: 10px; vertical-align: top; font-size: 0.85em; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${plainText}"><div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${value}</div></td>`;
            });
            
            html += `</tr>`;
        });
    }
    
    tbody.innerHTML = html;
}

/**
 * Update only kanban content (not controls) - prevents search input recreation
 */
function updateKanbanContent() {
    const statuses = lookupData.lkp_status || [];
    
    statuses.forEach(status => {
        const statusName = status.name;
        const column = document.querySelector(`.kanban-column[data-status="${statusName}"]`);
        if (!column) return;
        
        const cardsContainer = column.querySelector('.kanban-cards');
        if (!cardsContainer) return;
        
        const tasksInStatus = filteredTasks.filter(t => t.status_name === statusName);
        
        let html = '';
        tasksInStatus.forEach(task => {
            html += renderKanbanCard(task);
        });
        
        cardsContainer.innerHTML = html;
        
        // Update count in header
        const header = column.querySelector('div');
        if (header) {
            const headerColor = header.style.backgroundColor;
            header.innerHTML = `${statusName} (${tasksInStatus.length})`;
            header.style.backgroundColor = headerColor;
        }
    });
}

/**
 * Handle filter change
 */
function handleFilterChange(columnName, value) {
    if (value) {
        activeFilters[columnName] = value;
    } else {
        delete activeFilters[columnName];
    }
    
    // Apply filters and re-render
    filteredTasks = applyFilters(allTasks);
    renderTasksTable();
}

/**
 * Apply active filters to tasks
 */
function applyFilters(tasks) {
    let filtered = tasks;
    
    // Apply hide completed tasks filter
    if (hideCompletedTasks) {
        filtered = filtered.filter(task => task.status_name !== 'Done');
    }
    
    // Apply hide template tasks filter
    if (hideTemplateTasks) {
        filtered = filtered.filter(task => !task.template_source); // template_source = Template Source
    }
    
    Object.keys(activeFilters).forEach(columnName => {
        const filterValue = activeFilters[columnName];
        if (filterValue === '__NONE__') {
            // Filter for empty/null values
            filtered = filtered.filter(task => !task[columnName] || task[columnName] === '');
        } else {
            // Normal equality filter
            filtered = filtered.filter(task => task[columnName] === filterValue);
        }
    });
    
    return filtered;
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    activeFilters = {};
    filteredTasks = allTasks;
    renderTasksTable();
}

/**
 * Toggle hide completed tasks
 */
function toggleHideCompletedTasks() {
    hideCompletedTasks = !hideCompletedTasks;
    filteredTasks = applyFilters(allTasks);
    renderTasksTable();
}

/**
 * Toggle hide template tasks
 */
function toggleHideTemplateTasks() {
    hideTemplateTasks = !hideTemplateTasks;
    filteredTasks = applyFilters(allTasks);
    renderTasksTable();
}

/**
 * Sort table by column
 */
function sortTable(columnName) {
    // Toggle sort direction if clicking same column
    if (currentSortColumn === columnName) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = columnName;
        currentSortDirection = 'asc';
    }
    
    // Sort the filtered tasks
    filteredTasks.sort((a, b) => {
        let aVal = a[columnName];
        let bVal = b[columnName];
        
        // Handle null/undefined
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        // Convert to strings for comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Update sort indicators
    document.querySelectorAll('[id^="sort-"]').forEach(el => {
        el.textContent = '';
    });
    
    const sortIcon = currentSortDirection === 'asc' ? '▲' : '▼';
    const sortElement = document.getElementById(`sort-${columnName}`);
    if (sortElement) {
        sortElement.textContent = sortIcon;
    }
    
    renderTasksTable();
}

// ========================================================================
//                        KANBAN VIEW
// ========================================================================

/**
 * Toggle between table and kanban view
 */
function toggleKanbanView() {
    currentView = currentView === 'table' ? 'kanban' : 'table';
    renderTasksTable();
}

/**
 * Toggle Kanban grouping between status and stage
 */
function toggleKanbanGroupBy() {
    projectGroupBy = projectGroupBy === 'status' ? 'stage' : 'status';
    renderTasksTable();
}

// ========================================================================
//        STATUS / STAGE COLOURS (one source for headers, cards and badges)
// ========================================================================
const STATUS_COLORS = {
    'To Do': '#6c757d', 'TBD': '#6c757d', 'Not Started': '#6c757d',
    'In Progress': '#007bff', 'In-Progress': '#007bff', 'WIP': '#007bff', 'Doing': '#007bff',
    'Waiting': '#ffc107',
    'On-Hold': '#fd7e14', 'On Hold': '#fd7e14',
    'Done': '#28a745', 'Completed': '#28a745',
    'Cancelled': '#dc3545', 'Canceled': '#dc3545'
};
const COLOR_PALETTE = ['#6c757d', '#17a2b8', '#007bff', '#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1', '#20c997', '#e83e8c'];

function getStatusColor(statusName) {
    const lkp = (lookupData.lkp_status || []).find(s => s.name === statusName);
    if (lkp && lkp.color) return lkp.color;
    if (STATUS_COLORS[statusName]) return STATUS_COLORS[statusName];
    const idx = (lookupData.lkp_status || []).findIndex(s => s.name === statusName);
    return idx >= 0 ? COLOR_PALETTE[idx % COLOR_PALETTE.length] : '#6c757d';
}

/**
 * Status columns on every board follow the Status sort order, with Done always last.
 */
function orderStatusesDoneLast(statuses) {
    const isDone = s => (s.name || '').trim().toLowerCase() === 'done';
    return [...statuses].sort((a, b) => {
        if (isDone(a) !== isDone(b)) return isDone(a) ? 1 : -1;
        return (a.sort_order || 0) - (b.sort_order || 0);
    });
}

function getStageColor(stageName) {
    const lkp = (lookupData.lkp_stage || []).find(s => s.name === stageName);
    if (lkp && lkp.color) return lkp.color;
    const idx = (lookupData.lkp_stage || []).findIndex(s => s.name === stageName);
    return idx >= 0 ? COLOR_PALETTE[idx % COLOR_PALETTE.length] : '#6c757d';
}

/**
 * Kanban columns always fit the available width: one equal-width column per
 * status/stage, no horizontal scrolling. Long card text wraps / is clamped.
 */
function kanbanGridStyle(columnCount, paddingBottom = 20) {
    const n = Math.max(columnCount, 1);
    return `display: grid; grid-template-columns: repeat(${n}, minmax(0, 1fr)); gap: 10px; padding-bottom: ${paddingBottom}px; width: 100%;`;
}

/**
 * Render Kanban view
 */
function renderKanbanView() {
    const container = document.getElementById('tasks-table-container');
    
    // Get all status or stage values from lookup based on projectGroupBy
    const groupByField = projectGroupBy === 'stage' ? 'stage_name' : 'status_name';
    const groups = projectGroupBy === 'stage' ? (lookupData.lkp_stage || []) : orderStatusesDoneLast(lookupData.lkp_status || []);
    
    // Get filterable columns
    const filterableColumns = columnSettings.filter(c => c.is_filterable === 1);
    
    let html = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button style="padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="toggleKanbanView()">
                <i class="fa-solid fa-table"></i> Table View
            </button>
            <button style="padding: 8px 15px; background-color: ${projectGroupBy === 'stage' ? '#28a745' : '#007bff'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="toggleKanbanGroupBy()">
                <i class="fa-solid fa-layer-group"></i> Group by ${projectGroupBy === 'stage' ? 'Status' : 'Stage'}
            </button>
            <button style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" onclick="openAddTaskModal()">
                <i class="fa-solid fa-plus"></i> Add Task
            </button>
            <input type="text" id="task-search" placeholder="Search tasks..." 
                   style="flex-grow: 1; min-width: 200px; padding: 10px; border: 1px solid var(--bd-ccc); border-radius: 4px;"
                   oninput="handleTaskSearch(this.value)">
    `;
    
    // Add filter dropdowns inline if there are filterable columns
    if (filterableColumns.length > 0) {
        filterableColumns.forEach(col => {
            const filterValue = activeFilters[col.column_name] || '';
            
            html += `<select onchange="handleFilterChange('${col.column_name}', this.value)" 
                            style="padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 120px;">`;
            html += `<option value="">${col.display_name}: All</option>`;
            
            // Get unique values for this column
            const uniqueValues = [...new Set(allTasks.map(t => t[col.column_name]).filter(v => v))];
            
            // For lookup columns, get the display names
            uniqueValues.forEach(value => {
                let displayValue = value;
                
                if (col.column_type === 'lookup_projects' && lookupData.projects) {
                    const project = lookupData.projects.find(p => p.prj_id === value);
                    displayValue = project ? project.name : value;
                } else if (col.column_type === 'lookup_categories' && lookupData.categories) {
                    const category = lookupData.categories.find(c => c.cat_id === value);
                    displayValue = category ? category.name : value;
                }
                
                const selected = filterValue === value ? 'selected' : '';
                html += `<option value="${value}" ${selected}>${displayValue}</option>`;
            });
            
            html += `</select>`;
        });
        
        html += `
            <button onclick="clearAllFilters()" 
                    style="padding: 10px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;">
                <i class="fa-solid fa-times"></i> Clear
            </button>
        `;
    }
    
    html += `</div>`;
    
    html += `
        <div class="kanban-grid" style="${kanbanGridStyle(groups.length)}">
    `;
    
    // Create a column for each group (status or stage)
    groups.forEach(group => {
        const groupName = group.name;
        const tasksInGroup = filteredTasks.filter(t => t[groupByField] === groupName);
        
        // Same colour source as the cards in this column
        const headerColor = projectGroupBy === 'status' ? getStatusColor(groupName) : getStageColor(groupName);
        
        html += `
            <div class="kanban-column" data-${projectGroupBy === 'stage' ? 'stage' : 'status'}="${groupName}" 
                 style="min-width: 0; background-color: var(--bg-f8f9fa); border-radius: 8px; padding: 8px;"
                 ondrop="handleKanbanDrop(event)" 
                 ondragover="handleKanbanDragOver(event)">
                
                <div title="${escapeHtml(groupName)} (${tasksInGroup.length})" style="background-color: ${headerColor}; color: white; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(groupName)} (${tasksInGroup.length})
                </div>
                
                <div class="kanban-cards" style="min-height: 100px;">
        `;
        
        // Render cards for this group
        tasksInGroup.forEach(task => {
            html += renderKanbanCard(task);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    html += `
        <div style="margin-top: 15px; color: var(--fg-6c757d); font-size: 0.9em;">
            Showing ${filteredTasks.length} of ${allTasks.length} tasks
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render a single Kanban card
 */
function renderKanbanCard(task, groupBy) {
    // The left border matches the column header colour of the current grouping
    const mode = groupBy || projectGroupBy;
    const borderColor = mode === 'stage' ? getStageColor(task.stage_name) : getStatusColor(task.status_name);
    
    // Keep cards white background - no stage tints
    let backgroundColor = 'var(--bg-fff)';
    
    // Tags: Project and Task Group
    const taskGroup = task.task_group || '';
    const projectName = task.project_id
        ? (((lookupData.projects || []).find(p => p.prj_id === task.project_id) || {}).name || task.project_name || '')
        : '';
    
    return `
        <div class="kanban-card" 
             draggable="true"
             data-task-id="${task.id}"
             data-current-status="${task.status_name}"
             ondragstart="handleKanbanDragStart(event)"
             onclick="checkRecurringTaskBeforeEdit(${task.id})"
             oncontextmenu="showKanbanCardMenu(event, ${task.id}); return false;"
             style="position: relative; min-width: 0; background: ${backgroundColor}; border-radius: 6px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; border-left: 4px solid ${borderColor}; transition: transform 0.2s, box-shadow 0.2s;"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
             onmouseout="this.style.transform=''; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
            
            <div class="kanban-card-title" title="${escapeHtml(task.title)}" style="font-weight: 600; margin-bottom: 8px; font-size: 0.9em; color: var(--fg-212529);">
                ${task.recurrence_parent_id || task.recurrence_type ? '<i class="fa-solid fa-rotate" style="color: var(--fg-6f42c1); font-size: 0.85em; margin-right: 6px;" title="Recurring Task"></i>' : ''}${escapeHtml(task.title)}
            </div>
            
            ${projectName || taskGroup ? `<div class="kanban-card-tags" style="${task.blocked_by ? 'padding-right: 20px;' : ''}">
                ${projectName ? `<span class="kanban-tag kanban-tag-project" title="Project: ${escapeHtml(projectName)}"><i class="fa-solid fa-diagram-project"></i><span>${escapeHtml(projectName)}</span></span>` : ''}
                ${taskGroup ? `<span class="kanban-tag kanban-tag-group" title="Task Group: ${escapeHtml(taskGroup)}"><i class="fa-solid fa-tag"></i><span>${escapeHtml(taskGroup)}</span></span>` : ''}
            </div>` : ''}
            
            ${task.blocked_by ? `<div style="position: absolute; bottom: 8px; right: 8px; color: #007bff; font-size: 14px;" title="Has dependencies: ${task.blocked_by}">
                <i class="fa-solid fa-link"></i>
            </div>` : ''}
        </div>
    `;
}

/**
 * Handle drag start for Kanban cards
 */
function handleKanbanDragStart(event) {
    const taskId = event.target.dataset.taskId;
    const currentStatus = event.target.dataset.currentStatus;
    event.dataTransfer.setData('taskId', taskId);
    event.dataTransfer.setData('currentStatus', currentStatus);
    event.target.style.opacity = '0.5';
}

/**
 * Handle drag over for Kanban columns
 */
function handleKanbanDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drop on Kanban column
 */
function handleKanbanDrop(event) {
    event.preventDefault();
    
    const taskId = event.dataTransfer.getData('taskId');
    const currentStatus = event.dataTransfer.getData('currentStatus');
    
    // Find the column element
    let column = event.target;
    while (column && !column.classList.contains('kanban-column')) {
        column = column.parentElement;
    }
    
    if (!column) return;
    
    const newStatus = column.dataset.status;
    
    // Reset opacity
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.style.opacity = '1';
    });
    
    // If status hasn't changed, do nothing
    if (currentStatus === newStatus) return;
    
    // Update task status via API
    updateTaskStatus(taskId, newStatus);
}

/**
 * Update task status via API
 */
function updateTaskStatus(taskId, newStatus) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_name: newStatus })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    })
    .then(() => {
        // Update local data
        const task = allTasks.find(t => t.id == taskId);
        if (task) {
            task.status_name = newStatus;
        }
        const filteredTask = filteredTasks.find(t => t.id == taskId);
        if (filteredTask) {
            filteredTask.status_name = newStatus;
        }
        
        // Re-render
        renderKanbanView();
    })
    .catch(error => {
        showNotification('Error updating task: ' + error.message, 'error');
        console.error('Update error:', error);
    });
}

// ========================================================================
//                        ADD TASK MODAL
// ========================================================================

// ========================================================================
//            TASK FORM LAYOUT (shared by Add / Edit / Duplicate)
// ========================================================================
// Visible by default: Primary (Task Name, Task Project, Task Group, Status) + Task Dates.
// Everything else sits in a collapsible "More details" panel.

const TASK_FORM_PRIMARY = ['title', 'project_id', 'task_group', 'status_name'];
const TASK_FORM_DATES = ['due_date', 'reminder_date'];

function categorizeTaskFormColumns(allColumns) {
    const sections = {
        'Primary': [],
        'Task Dates': [],
        'Task Content': [],
        'Task Category': [],
        'Task Data': [],
        'Others': []
    };
    allColumns.forEach(col => {
        const name = col.column_name;
        if (name === 'id' || name === 'created_at') return;
        if (TASK_FORM_PRIMARY.includes(name)) {
            sections['Primary'].push(col);
        } else if (TASK_FORM_DATES.includes(name)) {
            sections['Task Dates'].push(col);
        } else if (['task_description', 'comments', 'url', 'file'].includes(name)) {
            sections['Task Content'].push(col);
        } else if (['category_id', 'subcategory_id'].includes(name)) {
            sections['Task Category'].push(col);
        } else if (['stage_name', 'assigned_to', 'priority_name', 'environment_name', 'service_component'].includes(name)) {
            sections['Task Data'].push(col);
        } else {
            sections['Others'].push(col);
        }
    });
    sections['Primary'].sort((a, b) => TASK_FORM_PRIMARY.indexOf(a.column_name) - TASK_FORM_PRIMARY.indexOf(b.column_name));
    sections['Task Dates'].sort((a, b) => TASK_FORM_DATES.indexOf(a.column_name) - TASK_FORM_DATES.indexOf(b.column_name));
    return sections;
}

function buildTaskFormLayout(sections, buildSectionHTML, task) {
    const hiddenNames = ['Task Content', 'Task Category', 'Task Data', 'Others'];
    const hiddenCols = hiddenNames.flatMap(n => sections[n]);
    const filled = task
        ? hiddenCols.filter(c => {
            const v = task[c.column_name];
            return v !== null && v !== undefined && String(v).trim() !== '';
        }).length
        : 0;
    const hiddenHtml = hiddenNames.map(n => buildSectionHTML(n, sections[n])).filter(Boolean);

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; margin-bottom: 20px;">
            ${buildSectionHTML('Primary', sections['Primary'])}
            ${buildSectionHTML('Task Dates', sections['Task Dates'])}
        </div>
        ${hiddenHtml.length === 0 ? '' : `
        <details class="task-form-more" style="margin-bottom: 25px; border: 1px solid var(--bd-dee2e6); border-radius: 8px; background: var(--bg-fff);">
            <summary style="padding: 12px 16px; cursor: pointer; font-weight: 600; color: var(--fg-495057); user-select: none; list-style: none; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-chevron-right task-form-more-icon" style="transition: transform 0.2s; font-size: 0.85em;"></i>
                More details
                <span style="font-weight: 400; color: var(--fg-6c757d); font-size: 0.9em;">
                    (${hiddenCols.length} fields${filled ? ` · ${filled} filled` : ''})
                </span>
            </summary>
            <div style="padding: 0 16px 16px 16px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
                    ${hiddenHtml.join('')}
                </div>
            </div>
        </details>`}
    `;
}

// ========================================================================
//        RECURRENCE HELPERS (shared by Add / Edit / Duplicate Task,
//        and the Routines page)
// ========================================================================
const RECURRENCE_TYPE_LABELS = {
    daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-Weekly',
    monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly'
};
const RECURRENCE_WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function recurrenceTypeOptionsHtml(currentValue) {
    const opts = [['', 'None (One-time task)'], ...Object.entries(RECURRENCE_TYPE_LABELS)];
    return opts.map(([v, label]) => `<option value="${v}" ${currentValue === v ? 'selected' : ''}>${label}</option>`).join('');
}

/**
 * The small "on which day" control shown next to Recurrence. Weekly/Bi-Weekly get a
 * weekday dropdown; Monthly/Quarterly/Yearly get a day-of-month number. Left on
 * "(same as due date)" it's not sent, and the server derives it from the due date.
 */
function recurrenceDayPickerHtml(prefix, currentType, currentDay) {
    const wrapStyle = `margin-top: 8px; ${['weekly', 'biweekly'].includes(currentType) || ['monthly', 'quarterly', 'yearly'].includes(currentType) ? '' : 'display: none;'}`;
    const isWeekly = ['weekly', 'biweekly'].includes(currentType);
    const weekdayOpts = RECURRENCE_WEEKDAY_NAMES.map((name, i) => `<option value="${i}" ${currentDay === i ? 'selected' : ''}>${name}</option>`).join('');
    return `
        <div id="${prefix}recurrence-day-wrap" style="${wrapStyle}">
            <label style="display: block; font-size: 0.82em; color: var(--fg-6c757d); margin-bottom: 4px;">Repeats on</label>
            <select id="${prefix}recurrence-day-weekday" style="width: 100%; padding: 8px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 13px; ${isWeekly ? '' : 'display: none;'}">
                <option value="">(same weekday as due date)</option>
                ${weekdayOpts}
            </select>
            <input type="number" id="${prefix}recurrence-day-month" min="1" max="31" value="${currentDay != null && !isWeekly ? currentDay : ''}" placeholder="Day of month (same as due date if left blank)"
                   style="width: 100%; padding: 8px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 13px; ${!isWeekly ? '' : 'display: none;'}">
        </div>`;
}

function updateRecurrenceDayPicker(prefix) {
    const type = document.getElementById(`${prefix}recurrence_type`)?.value || '';
    const wrap = document.getElementById(`${prefix}recurrence-day-wrap`);
    const weekdaySel = document.getElementById(`${prefix}recurrence-day-weekday`);
    const monthInput = document.getElementById(`${prefix}recurrence-day-month`);
    if (!wrap) return;
    const isWeekly = ['weekly', 'biweekly'].includes(type);
    const isMonthly = ['monthly', 'quarterly', 'yearly'].includes(type);
    wrap.style.display = (isWeekly || isMonthly) ? '' : 'none';
    if (weekdaySel) weekdaySel.style.display = isWeekly ? '' : 'none';
    if (monthInput) monthInput.style.display = isMonthly ? '' : 'none';
}
window.updateRecurrenceDayPicker = updateRecurrenceDayPicker;

/**
 * Reads the day-picker for a task form. Returns null when the picker isn't present,
 * isn't applicable (daily / one-time), or was left on its default - in all those
 * cases the server derives the day from the due date instead.
 */
function readRecurrenceDay(prefix, recurrenceType) {
    if (!recurrenceType) return null;
    if (['weekly', 'biweekly'].includes(recurrenceType)) {
        const v = document.getElementById(`${prefix}recurrence-day-weekday`)?.value;
        return v ? parseInt(v, 10) : null;
    }
    if (['monthly', 'quarterly', 'yearly'].includes(recurrenceType)) {
        const v = document.getElementById(`${prefix}recurrence-day-month`)?.value;
        const n = parseInt(v, 10);
        return (v && n >= 1 && n <= 31) ? n : null;
    }
    return null;
}

/**
 * Open Add Task Modal
 */
function openAddTaskModal() {
    renderAddTaskModal();
}

function renderAddTaskModal() {
    const modal = document.createElement('div');
    modal.id = 'add-task-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background-color: rgba(0,0,0,0.5); display: flex; align-items: center; 
        justify-content: center; z-index: 1000;
    `;
    
    // Get ALL columns (including hidden ones) for the form
    const allColumns = allColumnSettings;
    
    if (!allColumns || allColumns.length === 0) {
        console.error('[openAddTaskModal] allColumnSettings not loaded!');
        alert('Error: Column settings not loaded. Please refresh the page and try again.');
        return;
    }
    
    // Group fields by section (same as edit form)
    const sections = categorizeTaskFormColumns(allColumns);
    
    // Generate form HTML (same styling as edit form)
    const generateFieldHTML = (col) => {
        const label = col.display_name;
        const name = col.column_name;
        let fieldHtml = '';
        
        // Determine if this is the title field for bold styling
        const isTitleField = name === 'title';
        const inputStyle = isTitleField 
            ? "width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; font-weight: 700;" 
            : "width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;";
        
        // Same field generation logic as edit form
        if (col.column_type === 'text') {
            if (name === 'blocked_by') {
                fieldHtml = `
                    <div style="position: relative;">
                        <input type="text" 
                               id="task-${name}-search" 
                               placeholder="Search tasks by ID or title..." 
                               style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;"
                               oninput="searchBlockedByTasks(this.value, '${name}')"
                               onfocus="document.getElementById('blockedby-results').style.display='block'"
                               >
                        <div id="blockedby-results" style="display: none; position: absolute; top: 42px; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 4px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
                        <input type="hidden" id="task-${name}" value="">
                        <div id="blocked-by-tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;"></div>
                    </div>
                `;
            } else if (name === 'recurrence_type') {
                fieldHtml = `<select id="task-${name}" onchange="updateRecurrenceDayPicker('task-')" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                    ${recurrenceTypeOptionsHtml('')}
                </select>
                ${recurrenceDayPickerHtml('task-', '', null)}`;
            } else {
                fieldHtml = `<input type="text" id="task-${name}" style="${inputStyle}">`;
            }
        } else if (col.column_type === 'date') {
            fieldHtml = `<input type="date" id="task-${name}" style="${inputStyle}">`;
        } else if (col.column_type === 'number') {
            fieldHtml = `<input type="number" id="task-${name}" style="${inputStyle}">`;
        } else if (col.column_type === 'lookup_status') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">`;
            (lookupData.lkp_status || []).forEach(s => {
                const selected = s.name === 'To Do' ? 'selected' : '';
                fieldHtml += `<option value="${s.name}" ${selected}>${s.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_priority') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_priority || []).forEach(p => {
                fieldHtml += `<option value="${p.name}">${p.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_stage') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_stage || []).forEach(s => {
                fieldHtml += `<option value="${s.name}">${s.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_environment') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_environment || []).forEach(e => {
                fieldHtml += `<option value="${e.name}">${e.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_projects') {
            let activeProjects = (lookupData.projects || []).filter(p => (p.status && p.status.toLowerCase() === 'active'));
            if (activeProjects.length === 0) {
                activeProjects = lookupData.projects || [];
            }
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeProjects.forEach(p => {
                fieldHtml += `<option value="${p.prj_id}">${p.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_categories') {
            let activeCategories = (lookupData.categories || []).filter(c => (c.status && c.status.toLowerCase() === 'active'));
            if (activeCategories.length === 0) {
                activeCategories = lookupData.categories || [];
            }
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeCategories.forEach(c => {
                fieldHtml += `<option value="${c.cat_id}">${c.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_subcategories') {
            let activeSubcategories = (lookupData.subcategories || []).filter(sc => (!sc.status || sc.status.toLowerCase() === 'active'));
            if (activeSubcategories.length === 0) {
                activeSubcategories = lookupData.subcategories || [];
            }
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeSubcategories.forEach(sc => {
                fieldHtml += `<option value="${sc.scat_id}" data-category="${sc.category_id || sc.cat_id}">${sc.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else {
            fieldHtml = `<input type="text" id="task-${name}" value="${currentValue}" style="${inputStyle}">`;
        }
        
        return `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #28a745; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${label}${col.column_name === 'title' || col.column_name === 'status_name' ? ' *' : ''}
                </label>
                ${fieldHtml}
            </div>
        `;
    };
    
    // Build section HTML
    const buildSectionHTML = (sectionName, columns) => {
        if (columns.length === 0) return '';
        
        return `
            <div style="background: var(--bg-f8f9fa); border-radius: 8px; padding: 20px; border: 1px solid var(--bd-dee2e6);">
                <h3 style="margin: 0 0 20px 0; font-size: 15px; font-weight: 700; color: var(--fg-495057); border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                    ${sectionName}
                </h3>
                ${columns.map(col => generateFieldHTML(col)).join('')}
            </div>
        `;
    };
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 0; max-width: 1400px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <!-- Header with integrated buttons -->
            <div style="padding: 25px 30px; background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
                    <i class="fa-solid fa-plus"></i> Create New Task
                </h2>
                <div style="display: flex; gap: 12px;">
                    <button type="submit" form="add-task-form" style="padding: 10px 20px; background: var(--bg-fff); color: #28a745; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;"
                            onmouseover="this.style.background='var(--bg-f8f9fa)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                            onmouseout="this.style.background='var(--bg-fff)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'">
                        <i class="fa-solid fa-save"></i> Create Task
                    </button>
                    <button type="button" onclick="closeAddTaskModal()" style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                        <i class="fa-solid fa-times"></i> Cancel
                    </button>
                </div>
            </div>
            
            <!-- Form Content (Scrollable) -->
            <div style="flex: 1; overflow-y: auto; padding: 30px;">
                <form id="add-task-form" onsubmit="handleAddTaskSubmit(event)">
                    ${buildTaskFormLayout(sections, buildSectionHTML, null)}
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
function filterSubcategories(prefix) {
    const categorySelect = document.getElementById(`${prefix}-category_id`);
    const subcategorySelect = document.getElementById(`${prefix}-subcategory_id`);
    
    if (!categorySelect || !subcategorySelect) return;
    
    const selectedCategory = categorySelect.value;
    const allOptions = Array.from(subcategorySelect.options);
    
    // Show/hide options based on category
    allOptions.forEach(option => {
        if (option.value === '') {
            option.style.display = '';
            option.textContent = selectedCategory ? 'None' : 'None (select category first)';
        } else {
            const optionCategory = option.getAttribute('data-category');
            if (!selectedCategory || optionCategory === selectedCategory) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        }
    });
    
    // Reset selection if current value is now hidden
    const currentOption = subcategorySelect.options[subcategorySelect.selectedIndex];
    if (currentOption && currentOption.style.display === 'none') {
        subcategorySelect.value = '';
    }
}

/**
 * Close Add Task Modal
 */
function closeAddTaskModal() {
    const modal = document.getElementById('add-task-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Handle Add Task Form Submission
 */
function handleAddTaskSubmit(event) {
    event.preventDefault();
    
    const taskData = {};
    const allColumns = allColumnSettings; // Use ALL columns, not just visible ones
    
    allColumns.forEach(col => {
        if (col.column_name === 'id') return;
        
        const field = document.getElementById(`task-${col.column_name}`);
        if (field) {
            const value = field.value.trim();
            // Always add the field to taskData, even if empty (for validation)
            taskData[col.column_name] = value || null;
        }
    });
    taskData.recurrence_day = readRecurrenceDay('task-', taskData.recurrence_type);
    
    // Validate required fields
    if (!taskData.title || taskData.title === null) {
        alert('Task Name is required');
        return;
    }
    if (!taskData.status_name || taskData.status_name === null) {
        alert('Status is required');
        return;
    }
    
    // Set default stage to first stage (Backlog) if empty
    if (!taskData.stage_name || taskData.stage_name === null) {
        const stages = lookupData.lkp_stage || [];
        if (stages.length > 0) {
            taskData.stage_name = stages[0].name; // First stage (should be Backlog)
        }
    }
    
    // Submit to API
    fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    })
    .then(newTask => {
        showNotification('Task created successfully!', 'success');
        closeAddTaskModal();
        
        // Refresh appropriate page
        const currentPage = localStorage.getItem('synaapz_current_page');
        if (currentPage === 'nav-projects') {
            renderProjectsKanban();
        } else if (currentPage === 'nav-data') {
            initializeDataManagementPage();
        } else if (currentPage === 'nav-home') {
            initializeHomePage();
        } else {
            // Tasks page or fallback
            initializeTasksTable();
        }
        
        // Also refresh allTasks
        fetch('/api/tasks').then(r => r.json()).then(tasks => {
            allTasks = tasks;
        });
    })
    .catch(error => {
        alert('Error creating task: ' + error.message);
        console.error('Create task error:', error);
    });
}

/**
 * Edit existing task
 */
function editTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) {
        alert('Task not found');
        return;
    }
    
    // Check if columnSettings is loaded
    if (!columnSettings || columnSettings.length === 0) {
        console.log('[editTask] columnSettings empty, fetching...');
        fetch('/api/admin/columns')
            .then(r => r.json())
            .then(columns => {
                columnSettings = columns;
                console.log('[editTask] Loaded columnSettings:', columns.length, 'columns');
                openEditTaskModal(task);
            })
            .catch(err => {
                console.error('[editTask] Error loading columns:', err);
                alert('Error loading form. Please try again.');
            });
        return;
    }
    
    openEditTaskModal(task);
}

/**
 * Open edit task modal with form
 */
/**
 * Open Edit Task Modal by ID - wrapper that fetches task then opens modal
 */
function openEditTaskModalById(taskId) {
    console.log('[openEditTaskModalById] Called with ID:', taskId);
    console.log('[openEditTaskModalById] allTasks length:', allTasks.length);
    
    // Find the task in allTasks array
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
        console.error('[openEditTaskModalById] Task not found for ID:', taskId);
        alert('Task not found');
        return;
    }
    
    console.log('[openEditTaskModalById] Found task:', task);
    openEditTaskModal(task);
}
window.openEditTaskModalById = openEditTaskModalById;

/**
 * Open Edit Task Modal
 */
function openEditTaskModal(task) {
    console.log('[openEditTaskModal] Opening modal for task:', task.id);
    console.log('[openEditTaskModal] allColumnSettings:', allColumnSettings ? allColumnSettings.length : 'null/undefined');
    
    const modal = document.createElement('div');
    modal.id = 'edit-task-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background-color: rgba(0,0,0,0.5); display: flex; align-items: center; 
        justify-content: center; z-index: 1000;
    `;
    
    // Get ALL columns (including hidden ones) for the form
    const allColumns = allColumnSettings;
    
    if (!allColumns || allColumns.length === 0) {
        console.error('[openEditTaskModal] allColumnSettings not loaded!');
        alert('Error: Column settings not loaded. Please refresh the page and try again.');
        return;
    }
    
    console.log('[openEditTaskModal] Generating form with', allColumns.length, 'columns');
    
    // Group fields by section
    const sections = categorizeTaskFormColumns(allColumns);
    
    // Generate form HTML with modern multi-column layout
    const generateFieldHTML = (col) => {
        const label = col.display_name;
        const name = col.column_name;
        const currentValue = task[name] || '';
        let fieldHtml = '';
        
        // Determine if this is the title field for bold styling
        const isTitleField = name === 'title';
        const inputStyle = isTitleField 
            ? "width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; font-weight: 700;" 
            : "width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;";
        
        if (col.column_type === 'text') {
            // Special handling for "Blocked By" field (blocked_by)
            if (name === 'blocked_by') {
                const blockedByIds = currentValue ? currentValue.split(',').map(id => id.trim()).filter(id => id) : [];
                const blockedByTasks = blockedByIds.map(id => allTasks.find(t => t.id == id)).filter(t => t);
                
                fieldHtml = `
                    <div style="position: relative;">
                        <input type="text" 
                               id="task-${name}-search" 
                               placeholder="Search tasks by ID or title..." 
                               style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;"
                               oninput="searchBlockedByTasks(this.value, '${name}')"
                               onfocus="document.getElementById('blockedby-results').style.display='block'"
                               >
                        <div id="blockedby-results" style="display: none; position: absolute; top: 42px; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 4px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
                        <input type="hidden" id="task-${name}" value="${currentValue}">
                        <div id="blocked-by-tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            ${blockedByTasks.map(bt => `
                                <span style="padding: 6px 12px; background: var(--bg-e7f3ff); border: 1px solid #007bff; border-radius: 6px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                    #${bt.id}: ${bt.title}
                                    <i class="fa-solid fa-times" onclick="removeBlockedBy(${bt.id})" style="cursor: pointer; color: #dc3545;"></i>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else if (name === 'recurrence_type') {
                fieldHtml = `<select id="task-${name}" onchange="updateRecurrenceDayPicker('task-')" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                    ${recurrenceTypeOptionsHtml(currentValue)}
                </select>
                ${recurrenceDayPickerHtml('task-', currentValue, task.recurrence_day != null && task.recurrence_day !== '' ? parseInt(task.recurrence_day, 10) : null)}`;
            } else {
                fieldHtml = `<input type="text" id="task-${name}" value="${currentValue}" style="${inputStyle}">`;
            }
        } else if (col.column_type === 'date') {
            // Fix: Extract only YYYY-MM-DD from datetime string
            let dateValue = currentValue;
            if (dateValue && dateValue.includes('T')) {
                dateValue = dateValue.split('T')[0];
            }
            fieldHtml = `<input type="date" id="task-${name}" value="${dateValue}" style="${inputStyle}">`;
        } else if (col.column_type === 'number') {
            fieldHtml = `<input type="number" id="task-${name}" value="${currentValue}" style="${inputStyle}">`;
        } else if (col.column_type === 'lookup_status') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">`;
            (lookupData.lkp_status || []).forEach(s => {
                const selected = s.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${s.name}" ${selected}>${s.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_priority') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_priority || []).forEach(p => {
                const selected = p.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${p.name}" ${selected}>${p.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_stage') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_stage || []).forEach(s => {
                const selected = s.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${s.name}" ${selected}>${s.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_environment') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_environment || []).forEach(e => {
                const selected = e.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${e.name}" ${selected}>${e.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_projects') {
            let activeProjects = (lookupData.projects || []).filter(p => (p.status && p.status.toLowerCase() === 'active'));
            if (activeProjects.length === 0) {
                activeProjects = lookupData.projects || [];
            }
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeProjects.forEach(p => {
                const selected = p.prj_id === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${p.prj_id}" ${selected}>${p.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_categories') {
            let activeCategories = (lookupData.categories || []).filter(c => (c.status && c.status.toLowerCase() === 'active'));
            if (activeCategories.length === 0) {
                activeCategories = lookupData.categories || [];
            }
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeCategories.forEach(c => {
                const selected = c.cat_id === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${c.cat_id}" ${selected}>${c.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_subcategories') {
            let activeSubcategories = (lookupData.subcategories || []).filter(sc => {
                return (!sc.status || sc.status.toLowerCase() === 'active') || sc.scat_id === currentValue;
            });
            if (activeSubcategories.length === 0) {
                activeSubcategories = lookupData.subcategories || [];
            }
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeSubcategories.forEach(sc => {
                const selected = sc.scat_id === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${sc.scat_id}" data-category="${sc.category_id || sc.cat_id}" ${selected}>${sc.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (name === 'recurrence_type') {
            fieldHtml = `<select id="task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None (One-time task)</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>`;
        } else {
            fieldHtml = `<input type="text" id="task-${name}" value="${currentValue}" style="${inputStyle}">`;
        }
        
        return `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #007bff; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${label}${col.column_name === 'title' || col.column_name === 'status_name' ? ' *' : ''}
                </label>
                ${fieldHtml}
            </div>
        `;
    };
    
    // Build section HTML
    const buildSectionHTML = (sectionName, columns) => {
        if (columns.length === 0) return '';
        
        return `
            <div style="background: var(--bg-f8f9fa); border-radius: 8px; padding: 20px; border: 1px solid var(--bd-dee2e6);">
                <h3 style="margin: 0 0 20px 0; font-size: 15px; font-weight: 700; color: var(--fg-495057); border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    ${sectionName}
                </h3>
                ${columns.map(col => generateFieldHTML(col)).join('')}
            </div>
        `;
    };
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 0; max-width: 1400px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <!-- Header with integrated buttons -->
            <div style="padding: 25px 30px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
                    <i class="fa-solid fa-edit"></i> Edit Task #${task.id}
                </h2>
                <div style="display: flex; gap: 12px;">
                    <button type="submit" form="edit-task-form" style="padding: 10px 20px; background: var(--bg-fff); color: #007bff; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;"
                            onmouseover="this.style.background='var(--bg-f8f9fa)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                            onmouseout="this.style.background='var(--bg-fff)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'">
                        <i class="fa-solid fa-save"></i> Save Changes
                    </button>
                    <button type="button" onclick="closeEditTaskModal()" style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                        <i class="fa-solid fa-times"></i> Cancel
                    </button>
                </div>
            </div>
            
            <!-- Form Content (Scrollable) -->
            <div style="flex: 1; overflow-y: auto; padding: 30px;">
                <form id="edit-task-form" onsubmit="handleEditTaskSubmit(event, ${task.id})">
                    ${buildTaskFormLayout(sections, buildSectionHTML, task)}
                    
                    <!-- Subtasks Section -->
                    <div id="subtasks-container-${task.id}">
                        <!-- Will be populated by loadSubtasks() -->
                    </div>
                    
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load subtasks after modal is added to DOM
    loadSubtasks(task.id).then(subtasks => {
        const container = document.getElementById(`subtasks-container-${task.id}`);
        if (container) {
            container.innerHTML = renderSubtasksSection(task.id, subtasks);
        }
    });

}

/**
 * Close edit task modal
 */
function closeEditTaskModal() {
    const modal = document.getElementById('edit-task-modal');
    if (modal) modal.remove();
}

/**
 * Handle edit task form submission
 */
function handleEditTaskSubmit(event, taskId) {
    event.preventDefault();
    
    const taskData = {};
    const allColumns = allColumnSettings; // Use ALL columns, not just visible ones
    
    allColumns.forEach(col => {
        if (col.column_name === 'id') return;
        
        const field = document.getElementById(`task-${col.column_name}`);
        if (field) {
            const value = field.value.trim();
            taskData[col.column_name] = value || null;
        }
    });
    taskData.recurrence_day = readRecurrenceDay('task-', taskData.recurrence_type);
    
    // Validate required fields
    if (!taskData.title || taskData.title === null) {
        alert('Task Name is required');
        return;
    }
    if (!taskData.status_name || taskData.status_name === null) {
        alert('Status is required');
        return;
    }
    
    // Submit to API
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    })
    .then(() => {
        showNotification('Task updated successfully!', 'success');
        closeEditTaskModal();
        
        // Refresh appropriate page
        const currentPage = localStorage.getItem('synaapz_current_page');
        if (currentPage === 'nav-tasks') {
            initializeTasksTable();
        } else if (currentPage === 'nav-home') {
            initializeHomePage();
        } else if (currentPage === 'nav-projects') {
            renderProjectsKanban();
        } else if (currentPage === 'nav-data') {
            initializeDataManagementPage();
        } else if (currentPage === 'nav-calendar') {
            // Refresh calendar grid
            fetch('/api/tasks').then(r => r.json()).then(tasks => {
                allTasks = tasks;
                const year = calendarCurrentDate.getFullYear();
                const month = calendarCurrentDate.getMonth();
                const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
                if (gridContainer) {
                    gridContainer.innerHTML = renderCalendarGrid(year, month);
                }
            });
        }
        
        // Also refresh allTasks for other pages
        if (currentPage !== 'nav-calendar') {
            fetch('/api/tasks').then(r => r.json()).then(tasks => {
                allTasks = tasks;
            });
        }
    })
    .catch(error => {
        showNotification('Error updating task: ' + error.message, 'error');
        console.error('Update task error:', error);
    });
}

/**
 * Duplicate task
 */
function duplicateTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) {
        alert('Task not found');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'duplicate-task-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background-color: rgba(0,0,0,0.5); display: flex; align-items: center; 
        justify-content: center; z-index: 1000;
    `;
    
    const allColumns = allColumnSettings;
    
    if (!allColumns || allColumns.length === 0) {
        console.error('[duplicateTask] allColumnSettings not loaded!');
        alert('Error: Column settings not loaded. Please refresh the page and try again.');
        return;
    }
    
    // Group fields by section (same as edit form)
    const sections = categorizeTaskFormColumns(allColumns);
    
    // Generate form HTML with modern multi-column layout
    const generateFieldHTML = (col) => {
        const label = col.display_name;
        const name = col.column_name;
        const currentValue = task[name] || '';
        let fieldHtml = '';
        
        // Determine if this is the title field for bold styling
        const isTitleField = name === 'title';
        const inputStyle = isTitleField 
            ? "width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; font-weight: 700;" 
            : "width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;";
        
        if (col.column_type === 'text') {
            // Special handling for "Blocked By" field
            if (name === 'blocked_by') {
                const blockedByIds = currentValue ? currentValue.split(',').map(id => id.trim()).filter(id => id) : [];
                const blockedByTasks = blockedByIds.map(id => allTasks.find(t => t.id == id)).filter(t => t);
                
                fieldHtml = `
                    <div style="position: relative;">
                        <input type="text" 
                               id="dup-task-${name}-search" 
                               placeholder="Search tasks by ID or title..." 
                               style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px;"
                               oninput="searchBlockedByTasksDup(this.value, '${name}')"
                               onfocus="document.getElementById('blockedby-results-dup').style.display='block'"
                               >
                        <div id="blockedby-results-dup" style="display: none; position: absolute; top: 42px; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 4px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
                        <input type="hidden" id="dup-task-${name}" value="${currentValue}">
                        <div id="blocked-by-tags-dup" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            ${blockedByTasks.map(bt => `
                                <span style="padding: 6px 12px; background: var(--bg-e7f3ff); border: 1px solid #007bff; border-radius: 6px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                                    #${bt.id}: ${bt.title}
                                    <i class="fa-solid fa-times" onclick="removeBlockedByDup(${bt.id})" style="cursor: pointer; color: #dc3545;"></i>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else if (name === 'recurrence_type') {
                fieldHtml = `<select id="dup-task-${name}" onchange="updateRecurrenceDayPicker('dup-task-')" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                    ${recurrenceTypeOptionsHtml(currentValue)}
                </select>
                ${recurrenceDayPickerHtml('dup-task-', currentValue, task.recurrence_day != null && task.recurrence_day !== '' ? parseInt(task.recurrence_day, 10) : null)}`;
            } else {
                fieldHtml = `<input type="text" id="dup-task-${name}" value="${currentValue}" style="${inputStyle}">`;
            }
        } else if (col.column_type === 'date') {
            let dateValue = currentValue;
            if (dateValue && dateValue.includes('T')) {
                dateValue = dateValue.split('T')[0];
            }
            fieldHtml = `<input type="date" id="dup-task-${name}" value="${dateValue}" style="${inputStyle}">`;
        } else if (col.column_type === 'number') {
            fieldHtml = `<input type="number" id="dup-task-${name}" value="${currentValue}" style="${inputStyle}">`;
        } else if (col.column_type === 'lookup_status') {
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">`;
            (lookupData.lkp_status || []).forEach(s => {
                const selected = s.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${s.name}" ${selected}>${s.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_priority') {
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_priority || []).forEach(p => {
                const selected = p.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${p.name}" ${selected}>${p.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_stage') {
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_stage || []).forEach(s => {
                const selected = s.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${s.name}" ${selected}>${s.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_environment') {
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            (lookupData.lkp_environment || []).forEach(e => {
                const selected = e.name === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${e.name}" ${selected}>${e.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_projects') {
            let activeProjects = (lookupData.projects || []).filter(p => (p.status && p.status.toLowerCase() === 'active'));
            if (activeProjects.length === 0) {
                activeProjects = lookupData.projects || [];
            }
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeProjects.forEach(p => {
                const selected = p.prj_id === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${p.prj_id}" ${selected}>${p.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_categories') {
            let activeCategories = (lookupData.categories || []).filter(c => (c.status && c.status.toLowerCase() === 'active'));
            if (activeCategories.length === 0) {
                activeCategories = lookupData.categories || [];
            }
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeCategories.forEach(c => {
                const selected = c.cat_id === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${c.cat_id}" ${selected}>${c.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else if (col.column_type === 'lookup_subcategories') {
            let activeSubcategories = (lookupData.subcategories || []).filter(sc => {
                return (!sc.status || sc.status.toLowerCase() === 'active') || sc.scat_id === currentValue;
            });
            if (activeSubcategories.length === 0) {
                activeSubcategories = lookupData.subcategories || [];
            }
            fieldHtml = `<select id="dup-task-${name}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
                <option value="">None</option>`;
            activeSubcategories.forEach(sc => {
                const selected = sc.scat_id === currentValue ? 'selected' : '';
                fieldHtml += `<option value="${sc.scat_id}" data-category="${sc.category_id || sc.cat_id}" ${selected}>${sc.name}</option>`;
            });
            fieldHtml += `</select>`;
        } else {
            fieldHtml = `<input type="text" id="dup-task-${name}" value="${currentValue}" style="${inputStyle}">`;
        }
        
        return `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--fg-6f42c1); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${label}${col.column_name === 'title' || col.column_name === 'status_name' ? ' *' : ''}
                </label>
                ${fieldHtml}
            </div>
        `;
    };
    
    // Build section HTML
    const buildSectionHTML = (sectionName, columns) => {
        if (columns.length === 0) return '';
        
        return `
            <div style="background: var(--bg-f8f9fa); border-radius: 8px; padding: 20px; border: 1px solid var(--bd-dee2e6);">
                <h3 style="margin: 0 0 20px 0; font-size: 15px; font-weight: 700; color: var(--fg-495057); border-bottom: 2px solid #6f42c1; padding-bottom: 10px;">
                    ${sectionName}
                </h3>
                ${columns.map(col => generateFieldHTML(col)).join('')}
            </div>
        `;
    };
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 0; max-width: 1400px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <!-- Header with integrated buttons -->
            <div style="padding: 25px 30px; background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
                    <i class="fa-solid fa-copy"></i> Duplicate Task #${task.id}
                </h2>
                <div style="display: flex; gap: 12px;">
                    <button type="submit" form="duplicate-task-form" style="padding: 10px 20px; background: var(--bg-fff); color: var(--fg-6f42c1); border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;"
                            onmouseover="this.style.background='var(--bg-f8f9fa)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                            onmouseout="this.style.background='var(--bg-fff)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'">
                        <i class="fa-solid fa-save"></i> Create Duplicate
                    </button>
                    <button type="button" onclick="closeDuplicateTaskModal()" style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                        <i class="fa-solid fa-times"></i> Cancel
                    </button>
                </div>
            </div>
            
            <!-- Form Content (Scrollable) -->
            <div style="flex: 1; overflow-y: auto; padding: 30px;">
                <form id="duplicate-task-form" onsubmit="handleDuplicateTaskSubmit(event)">
                    ${buildTaskFormLayout(sections, buildSectionHTML, task)}
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
function closeDuplicateTaskModal() {
    const modal = document.getElementById('duplicate-task-modal');
    if (modal) modal.remove();
}

/**
 * Handle duplicate task form submission
 */
function handleDuplicateTaskSubmit(event) {
    event.preventDefault();
    
    const taskData = {};
    const allColumns = columnSettings;
    
    allColumns.forEach(col => {
        if (col.column_name === 'id') return;
        
        const field = document.getElementById(`dup-task-${col.column_name}`);
        if (field) {
            const value = field.value.trim();
            // Always add the field to taskData, even if empty (for validation)
            taskData[col.column_name] = value || null;
        }
    });
    taskData.recurrence_day = readRecurrenceDay('dup-task-', taskData.recurrence_type);
    
    // Validate required fields
    if (!taskData.title || taskData.title === null) {
        alert('Task Name is required');
        return;
    }
    if (!taskData.status_name || taskData.status_name === null) {
        alert('Status is required');
        return;
    }
    
    // Set default stage to first stage (Backlog) if empty
    if (!taskData.stage_name || taskData.stage_name === null) {
        const stages = lookupData.lkp_stage || [];
        if (stages.length > 0) {
            taskData.stage_name = stages[0].name; // First stage (should be Backlog)
        }
    }
    
    // Submit to API
    fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to duplicate task');
        return response.json();
    })
    .then(() => {
        showNotification('Task duplicated successfully!', 'success');
        closeDuplicateTaskModal();
        initializeTasksTable();
    })
    .catch(error => {
        alert('Error duplicating task: ' + error.message);
        console.error('Duplicate task error:', error);
    });
}

/**
 * Delete task
 */
/**
 * Archive a task
 */
function archiveTask(taskId) {
    if (!confirm('Archive this task? You can restore it from the Archive page.')) {
        return;
    }
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: 1 })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to archive task');
        return response.json();
    })
    .then(() => {
        showNotification('Task archived successfully!', 'success');
        initializeTasksTable();
    })
    .catch(error => {
        alert('Error archiving task: ' + error.message);
        console.error('Archive task error:', error);
    });
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
    if (!confirm('Move this task to trash?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({is_deleted: 1})
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        showNotification('Task moved to trash!', 'success');
        await initializeTasksTable();
    } catch (error) {
        showNotification('Error deleting task: ' + error.message, 'error');
        console.error('Delete task error:', error);
    }
}

// ========================================================================
//                        PROJECTS KANBAN VIEW
// ========================================================================

let selectedProjectId = null;

/**
 * Initialize Projects Kanban page
 */
function initializeProjectsKanban() {
    const container = document.getElementById('projects-kanban-container');
    container.innerHTML = '<p>Loading projects...</p>';
    
    // Fetch tasks, lookups, and column settings
    Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json()),
        fetch('/api/admin/columns').then(r => r.json())
    ])
    .then(([tasks, lookups, colSettings]) => {
        allTasks = tasks;
        lookupData = lookups;
        allColumnSettings = colSettings;
        console.log('[Projects] Loaded data - tasks:', tasks.length, 'columns:', colSettings.length);
        
        // Select first (non-problem) project by default
        const projects = (lookupData.projects || []).filter(p => !isProblemProject(p));
        if (!selectedProjectId || !projects.some(p => p.prj_id === selectedProjectId)) {
            selectedProjectId = projects.length > 0 ? projects[0].prj_id : 'all-projects';
        }
        
        renderProjectsKanban();
    })
    .catch(error => {
        container.innerHTML = `<p style="color:red;">Error loading projects: ${error.message}</p>`;
        console.error('Error loading projects:', error);
    });
}

/**
 * Render Projects Kanban with left navigation
 */
function renderProjectsKanban() {
    const container = document.getElementById('projects-kanban-container');
    const projects = lookupData.projects || [];
    
    // Check if panel is minimized (stored in state)
    const isMinimized = window.projectNavMinimized || false;
    
    let html = `
        <div class="two-panel-layout" style="display: flex; height: calc(100vh - 120px); gap: 0;">
            <!-- Left Navigation Panel -->
            <div id="projects-nav-panel" class="two-panel-nav" style="width: ${isMinimized ? '50px' : '250px'}; background-color: var(--bg-f8f9fa); border-right: 1px solid var(--bd-dee2e6); overflow-y: auto; flex-shrink: 0; transition: width 0.3s ease;">
                <div style="padding: 15px; border-bottom: 1px solid var(--bd-dee2e6); background-color: #007bff; display: flex; justify-content: space-between; align-items: center;">
                    ${!isMinimized ? `
                        <h3 style="margin: 0; font-size: 1.1em; color: white;">
                            <i class="fa-solid fa-diagram-project"></i> Projects
                        </h3>
                    ` : ''}
                    <button onclick="toggleProjectNav()" 
                            style="background: none; border: none; cursor: pointer; font-size: 1.2em; color: white; padding: 5px;"
                            title="${isMinimized ? 'Expand' : 'Minimize'} Panel">
                        <i class="fa-solid fa-${isMinimized ? 'chevron-right' : 'chevron-left'}"></i>
                    </button>
                </div>
                
                <div style="display: ${isMinimized ? 'none' : 'block'};">
                    <div style="padding: 10px 15px;">
                        <input type="text" id="project-search" placeholder="Search projects..." 
                               style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 0.9em;">
                    </div>
                    
                    <!-- Checkboxes -->
                    <div style="padding: 10px; background-color: var(--bg-fff); border-bottom: 1px solid var(--bd-dee2e6);">
                        <label style="display: flex; align-items: center; font-size: 0.9em; margin-bottom: 8px; cursor: pointer;">
                            <input type="checkbox" id="hide-completed-projects" onchange="toggleHideCompletedProjects(this.checked)" ${hideCompletedProjects ? 'checked' : ''} style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer;">
                            <span style="font-weight: 500;">Hide Completed Projects</span>
                        </label>
                        <label style="display: flex; align-items: center; font-size: 0.9em; margin-bottom: 10px; cursor: pointer;">
                            <input type="checkbox" id="hide-completed-tasks" onchange="toggleHideCompletedTasks(this.checked)" ${hideCompletedTasks ? 'checked' : ''} style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer;">
                            <span style="font-weight: 500;">Hide Completed Tasks</span>
                        </label>
                        <div style="display: flex; gap: 6px; margin-top: 4px;">
                            <button onclick="openCreateProjectGroupPrompt()" title="Create a project group"
                                    style="flex: 1; padding: 6px 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.82em;">
                                <i class="fa-solid fa-folder-plus"></i> New Group
                            </button>
                            <button onclick="openManageProjectGroupsModal()" title="Rename, reorder or delete groups"
                                    style="flex: 1; padding: 6px 8px; background: var(--bg-fff); color: #007bff; border: 1px solid #007bff; border-radius: 4px; cursor: pointer; font-size: 0.82em;">
                                <i class="fa-solid fa-folder-tree"></i> Manage
                            </button>
                        </div>
                    </div>
                    
                    <div id="project-results" style="padding: 10px;"></div>
                    <div id="project-list" style="padding: 10px; display: none;">
    `;
    
    if (!isMinimized) {
        // Filter projects based on search and hide completed
        let filteredProjects = projects.filter(p => {
            const searchTerm = (document.getElementById('project-search')?.value || '').toLowerCase();
            const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return false;
            
            const hideCompleted = document.getElementById('hide-completed-projects')?.checked;
            if (hideCompleted) {
                const tasksInProject = allTasks.filter(t => t.project_id === p.prj_id && t.is_archived === 0);
                const hasPendingTasks = tasksInProject.some(t => t.status_name !== 'Done');
                return hasPendingTasks;
            }
            
            return true;
        });
        
        // Render project list
        filteredProjects.forEach(project => {
            const tasksInProject = allTasks.filter(t => t.project_id === project.prj_id && t.is_archived === 0);
            const isSelected = selectedProjectId === project.prj_id;
            
            html += `
                <div onclick="selectProject('${project.prj_id}')" 
                     style="padding: 12px; margin-bottom: 8px; border-radius: 6px; cursor: pointer; 
                            background-color: ${isSelected ? '#007bff' : 'var(--bg-fff)'}; 
                            color: ${isSelected ? 'white' : 'var(--fg-212529)'};
                            border: 1px solid ${isSelected ? '#007bff' : 'var(--bd-dee2e6)'};
                            transition: all 0.2s;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${project.name}</div>
                    <div style="font-size: 0.85em; opacity: 0.8;">
                        ${tasksInProject.length} tasks
                    </div>
                </div>
            `;
        });
    }
    
    html += `
                    </div>
                </div>
            </div>
            
            <!-- Right Kanban Board -->
            <div id="project-kanban-board" class="two-panel-content" style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column;">
                <!-- General Search Bar with Add Task Button -->
                <div style="padding: 15px; background-color: var(--bg-fff); border-bottom: 1px solid var(--bd-dee2e6); display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                    <button onclick="toggleProjectGroupBy()" 
                            style="padding: 10px 20px; background: ${projectGroupBy === 'status' ? '#007bff' : '#28a745'}; color: white; border: none; border-radius: 6px; 
                                   cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap;
                                   box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;"
                            onmouseover="this.style.background='${projectGroupBy === 'status' ? '#0056b3' : '#218838'}'"
                            onmouseout="this.style.background='${projectGroupBy === 'status' ? '#007bff' : '#28a745'}'">
                        <i class="fa-solid fa-arrows-rotate"></i> Group by ${projectGroupBy === 'status' ? 'Stage' : 'Status'}
                    </button>
                    <button onclick="toggleProjectView()" 
                            style="padding: 10px 20px; background: ${projectView === 'gantt' ? '#6f42c1' : '#6c757d'}; color: white; border: none; border-radius: 6px; 
                                   cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap;
                                   box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;"
                            onmouseover="this.style.background='${projectView === 'gantt' ? '#5a32a3' : '#5a6268'}'"
                            onmouseout="this.style.background='${projectView === 'gantt' ? '#6f42c1' : '#6c757d'}'">
                        <i class="fa-solid fa-chart-gantt"></i> ${projectView === 'gantt' ? 'Kanban View' : 'Gantt Chart'}
                    </button>
                    <button onclick="openCreateProjectModal()" 
                            style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; 
                                   cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap;
                                   box-shadow: 0 2px 4px rgba(0,123,255,0.2); transition: all 0.2s;"
                            onmouseover="this.style.background='#0056b3'; this.style.boxShadow='0 4px 8px rgba(0,123,255,0.3)'"
                            onmouseout="this.style.background='#007bff'; this.style.boxShadow='0 2px 4px rgba(0,123,255,0.2)'">
                        <i class="fa-solid fa-diagram-project"></i> Create Project
                    </button>
                    <button onclick="openProjectAddTaskModal()" 
                            style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; 
                                   cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap;
                                   box-shadow: 0 2px 4px rgba(40,167,69,0.2); transition: all 0.2s;"
                            onmouseover="this.style.background='#218838'; this.style.boxShadow='0 4px 8px rgba(40,167,69,0.3)'"
                            onmouseout="this.style.background='#28a745'; this.style.boxShadow='0 2px 4px rgba(40,167,69,0.2)'">
                        <i class="fa-solid fa-plus"></i> Add Task
                    </button>
                    <input type="text" id="general-search" placeholder="Search tasks..." 
                           style="flex: 1; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px;"
                           oninput="handleGeneralSearch(this.value)">
                    
                    <!-- Filter Dropdowns -->
                    <select id="project-taskgroup-filter" onchange="handleProjectTaskGroupFilter(this.value)"
                            style="padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px;">
                        <option value="">All Task Groups</option>
                        ${[...new Set(allTasks.map(t => t.task_group).filter(g => g))].sort().map(g => 
                            `<option value="${g}" ${projectTaskGroupFilter === g ? 'selected' : ''}>${g}</option>`
                        ).join('')}
                    </select>
                    
                    <select id="project-category-filter" onchange="handleProjectCategoryFilter(this.value)"
                            style="padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px;">
                        <option value="">All Categories</option>
                        ${(lookupData.categories || []).map(c => 
                            `<option value="${c.cat_id}" ${projectCategoryFilter === c.cat_id ? 'selected' : ''}>${c.name}</option>`
                        ).join('')}
                    </select>
                    
                    <select id="project-subcategory-filter" onchange="handleProjectSubcategoryFilter(this.value)"
                            style="padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px;">
                        <option value="">All Sub-Categories</option>
                        ${(lookupData.subcategories || []).map(sc => 
                            `<option value="${sc.scat_id}" ${projectSubcategoryFilter === sc.scat_id ? 'selected' : ''}>${sc.name}</option>`
                        ).join('')}
                    </select>
                    
                    <button onclick="openTemplateLibrary()" 
                            style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 6px; 
                                   cursor: pointer; font-weight: 500; font-size: 14px; white-space: nowrap;
                                   box-shadow: 0 2px 4px rgba(111,66,193,0.2); transition: all 0.2s; margin-left: auto;"
                            onmouseover="this.style.background='#5a32a3'; this.style.boxShadow='0 4px 8px rgba(111,66,193,0.3)'"
                            onmouseout="this.style.background='#6f42c1'; this.style.boxShadow='0 2px 4px rgba(111,66,193,0.2)'">
                        <i class="fa-solid fa-layer-group"></i> Templates
                    </button>
                </div>
                
                <div style="flex-grow: 1; padding: 20px; overflow-x: auto;">
    `;
    
    if (selectedProjectId) {
        if (projectView === 'gantt') {
            html += renderGanttChart(selectedProjectId);
        } else {
            html += renderProjectKanbanBoard(selectedProjectId);
        }
    } else {
        html += '<p style="text-align: center; color: var(--fg-6c757d); margin-top: 50px;">Select a project to view its tasks</p>';
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Attach event listener to project search input
    const projectSearchInput = document.getElementById('project-search');
    if (projectSearchInput) {
        projectSearchInput.addEventListener('input', (e) => {
            updateProjectResults(e.target.value);
        });
    }
    
    // Initial render of project list
    updateProjectResults('');
}

/**
 * Update project results without re-rendering entire page.
 * SynAppz: projects are shown inside collapsible, drag-and-drop project groups.
 */
function updateProjectResults(searchTerm) {
    const resultsContainer = document.getElementById('project-results');
    if (!resultsContainer) return;

    searchTerm = searchTerm || '';
    const term = searchTerm.toLowerCase();
    const hideCompleted = document.getElementById('hide-completed-projects')?.checked;
    const groups = groupsForScope('project');
    const groupIds = new Set(groups.map(g => g.group_id));

    const passesCompletedFilter = (project) => {
        if (!hideCompleted) return true;
        const projectStatus = (project.status || '').toLowerCase();
        if (projectStatus === 'completed' || projectStatus === 'cancelled') return false;
        const tasksInProject = allTasks.filter(t => t.project_id === project.prj_id && t.is_archived === 0);
        return tasksInProject.some(t => t.status_name !== 'Done');
    };

    // Problems live on the All Problems page, not here
    const visibleProjects = (lookupData.projects || []).filter(p => !isProblemProject(p) && passesCompletedFilter(p));

    const taskCounts = (projects) => {
        const ids = new Set(projects.map(p => p.prj_id));
        const tasks = allTasks.filter(t => ids.has(t.project_id) && t.is_archived === 0);
        return { open: tasks.filter(t => t.status_name !== 'Done').length, total: tasks.length };
    };

    let html = '';

    // "All Projects" virtual entry
    const allTasksCount = allTasks.filter(t => t.is_archived === 0).length;
    const allPendingTasks = allTasks.filter(t => t.is_archived === 0 && t.status_name !== 'Done').length;
    if ((!hideCompleted || allPendingTasks > 0) && (!searchTerm || 'all projects'.includes(term))) {
        html += renderVirtualProjectRow('all-projects', 'fa-diagram-project', '#2196F3', 'All Projects', `${allPendingTasks}/${allTasksCount}`);
    }

    // "Unassigned" virtual entry (tasks without a project)
    const unassignedTasks = allTasks.filter(t => (!t.project_id || t.project_id === '') && t.is_archived === 0);
    const unassignedPending = unassignedTasks.filter(t => t.status_name !== 'Done').length;
    if (unassignedTasks.length > 0 && (!hideCompleted || unassignedPending > 0) && (!searchTerm || 'unassigned'.includes(term))) {
        html += renderVirtualProjectRow('unassigned', 'fa-inbox', '#6c757d', 'Unassigned', `${unassignedPending}/${unassignedTasks.length}`);
    }

    let shownProjects = 0;

    // Groups
    groups.forEach(group => {
        const members = visibleProjects.filter(p => p.group_id === group.group_id);
        const groupNameMatches = !searchTerm || group.name.toLowerCase().includes(term);
        const matchingMembers = searchTerm
            ? members.filter(p => groupNameMatches || p.name.toLowerCase().includes(term))
            : members;
        if (searchTerm && matchingMembers.length === 0 && !groupNameMatches) return;

        // While searching, groups are expanded so matches are visible
        const collapsed = !searchTerm && !!projectGroupCollapsed[group.group_id];
        const counts = taskCounts(members);
        shownProjects += matchingMembers.length;

        html += `
            <div class="project-group-section" data-group-id="${group.group_id}"
                 ondragover="handleProjectGroupDragOver(event)" ondragleave="handleProjectGroupDragLeave(event)"
                 ondrop="handleProjectGroupDrop(event, '${group.group_id}')"
                 style="margin-bottom: 10px; border-radius: 8px; transition: background-color 0.15s;">
                <div onclick="toggleProjectGroupCollapse('${group.group_id}')"
                     style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; user-select: none;
                            background: var(--bg-e7f1ff); border-left: 4px solid #007bff; border-radius: 6px; margin-bottom: 6px;"
                     title="Click to ${collapsed ? 'expand' : 'collapse'} · drop projects here to move them into this group">
                    <i class="fa-solid fa-chevron-${collapsed ? 'right' : 'down'}" style="font-size: 0.75em; color: var(--fg-0056b3); width: 12px;"></i>
                    <i class="fa-solid fa-folder${collapsed ? '' : '-open'}" style="color: #007bff;"></i>
                    <span style="flex: 1; font-weight: 600; font-size: 0.9em; color: var(--fg-0b3d91); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(group.name)}</span>
                    <span style="font-size: 0.75em; color: var(--fg-495057); white-space: nowrap;" title="Projects · open/total tasks">${members.length} · ${counts.open}/${counts.total}</span>
                </div>
                ${collapsed ? '' : `
                    <div style="padding-left: 10px;">
                        ${matchingMembers.map(p => renderProjectNavRow(p)).join('')}
                        ${members.length === 0 ? '<div style="font-size: 0.8em; color: var(--fg-6c757d); padding: 6px 10px; border: 1px dashed var(--bd-ced4da); border-radius: 6px;">Drag projects here</div>' : ''}
                    </div>
                `}
            </div>
        `;
    });

    // Ungrouped projects
    const ungrouped = visibleProjects
        .filter(p => !p.group_id || !groupIds.has(p.group_id))
        .filter(p => !searchTerm || p.name.toLowerCase().includes(term));
    shownProjects += ungrouped.length;

    if (groups.length === 0) {
        html += ungrouped.map(p => renderProjectNavRow(p)).join('');
    } else if (ungrouped.length > 0 || !searchTerm) {
        const collapsed = !searchTerm && !!projectGroupCollapsed['__ungrouped__'];
        html += `
            <div class="project-group-section" data-group-id=""
                 ondragover="handleProjectGroupDragOver(event)" ondragleave="handleProjectGroupDragLeave(event)"
                 ondrop="handleProjectGroupDrop(event, '')"
                 style="margin-bottom: 10px; border-radius: 8px;">
                <div onclick="toggleProjectGroupCollapse('__ungrouped__')"
                     style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; user-select: none;
                            background: var(--bg-f1f3f5); border-left: 4px solid var(--bd-adb5bd); border-radius: 6px; margin-bottom: 6px;">
                    <i class="fa-solid fa-chevron-${collapsed ? 'right' : 'down'}" style="font-size: 0.75em; color: var(--fg-6c757d); width: 12px;"></i>
                    <i class="fa-regular fa-folder" style="color: var(--fg-6c757d);"></i>
                    <span style="flex: 1; font-weight: 600; font-size: 0.9em; color: var(--fg-495057);">Ungrouped</span>
                    <span style="font-size: 0.75em; color: var(--fg-6c757d);">${ungrouped.length}</span>
                </div>
                ${collapsed ? '' : `<div style="padding-left: 10px;">${ungrouped.map(p => renderProjectNavRow(p)).join('')}</div>`}
            </div>
        `;
    }

    if (shownProjects === 0 && !html) {
        html = '<p style="color: var(--fg-6c757d); padding: 20px; text-align: center;">No projects found</p>';
    }

    resultsContainer.innerHTML = html;
}

function isProblemProject(project) {
    return (project && project.project_type || '') === 'Problem';
}

function renderVirtualProjectRow(id, icon, iconColor, label, countText) {
    const isSelected = selectedProjectId === id;
    return `
        <div onclick="selectProject('${id}')"
             style="padding: 12px; margin-bottom: 8px; border-radius: 6px; cursor: pointer;
                    background-color: ${isSelected ? 'var(--bg-e3f2fd)' : 'var(--bg-fff)'};
                    border: 2px solid ${isSelected ? '#2196F3' : 'var(--bd-dee2e6)'};
                    transition: all 0.2s; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: ${isSelected ? '600' : '500'}; font-size: 0.95em;">
                <i class="fa-solid ${icon}" style="color: ${iconColor}; margin-right: 8px;"></i>${label}
            </div>
            <div style="font-size: 0.8em; color: var(--fg-6c757d); white-space: nowrap; margin-left: 10px;">${countText}</div>
        </div>
    `;
}

function renderProjectNavRow(project) {
    const tasksInProject = allTasks.filter(t => t.project_id === project.prj_id && t.is_archived === 0);
    const openTasks = tasksInProject.filter(t => t.status_name !== 'Done').length;
    const isSelected = selectedProjectId === project.prj_id;
    return `
        <div draggable="true" ondragstart="handleProjectNavDragStart(event, '${project.prj_id}')"
             onclick="selectProject('${project.prj_id}')"
             class="project-nav-row"
             style="padding: 10px 12px; margin-bottom: 6px; border-radius: 6px; cursor: pointer;
                    background-color: ${isSelected ? 'var(--bg-e3f2fd)' : 'var(--bg-fff)'};
                    border: 2px solid ${isSelected ? '#2196F3' : 'var(--bd-dee2e6)'};
                    transition: all 0.2s; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-grip-vertical" style="color: var(--fg-ced4da); font-size: 0.8em; cursor: grab;" title="Drag onto a group"></i>
            <div style="flex: 1; min-width: 0; font-weight: ${isSelected ? '600' : '500'}; font-size: 0.92em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(project.name)}">
                ${escapeHtml(project.name)}
            </div>
            <div style="font-size: 0.78em; color: var(--fg-6c757d); white-space: nowrap;">
                ${openTasks}/${tasksInProject.length}${project.status && project.status.toLowerCase() === 'inactive' ? ' • Inactive' : ''}
            </div>
            <button onclick="event.stopPropagation(); openMoveProjectToGroupModal('${project.prj_id}')"
                    title="Move to group"
                    style="background: none; border: none; color: var(--fg-6c757d); cursor: pointer; padding: 2px 4px;">
                <i class="fa-solid fa-folder-tree"></i>
            </button>
        </div>
    `;
}

// ========================================================================
//          GROUPS (shared by All Projects and All Problems pages)
// ========================================================================
// Each group has a scope: 'project' (All Projects) or 'problem' (All Problems).

let projectGroupCollapsed = {};
try {
    projectGroupCollapsed = JSON.parse(localStorage.getItem('synappz_project_groups_collapsed') || '{}');
} catch (e) {
    projectGroupCollapsed = {};
}

function groupsForScope(scope) {
    return (lookupData.project_groups || [])
        .filter(g => (g.scope || 'project') === scope)
        .slice()
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));
}

function scopeOfProject(project) {
    return isProblemProject(project) ? 'problem' : 'project';
}

function groupScopeLabel(scope, plural) {
    if (scope === 'problem') return plural ? 'problems' : 'problem';
    return plural ? 'projects' : 'project';
}

function rerenderGroupScope(scope) {
    if (scope === 'problem') {
        if (typeof renderProblemsList === 'function') renderProblemsList();
    } else {
        updateProjectResults(document.getElementById('project-search')?.value || '');
    }
}

function toggleProjectGroupCollapse(groupId, scope = 'project') {
    projectGroupCollapsed[groupId] = !projectGroupCollapsed[groupId];
    try {
        localStorage.setItem('synappz_project_groups_collapsed', JSON.stringify(projectGroupCollapsed));
    } catch (e) { /* ignore */ }
    rerenderGroupScope(scope);
}

function handleProjectNavDragStart(event, prjId) {
    event.dataTransfer.setData('text/synappz-project', prjId);
    event.dataTransfer.effectAllowed = 'move';
}

function handleProjectGroupDragOver(event) {
    if (!Array.from(event.dataTransfer.types || []).includes('text/synappz-project')) return;
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '#d0e4ff';
}

function handleProjectGroupDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    event.currentTarget.style.backgroundColor = '';
}

function handleProjectGroupDrop(event, groupId) {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '';
    const prjId = event.dataTransfer.getData('text/synappz-project');
    if (prjId) moveProjectToGroup(prjId, groupId);
}

async function refreshProjectGroups() {
    const groups = await fetch('/api/project-groups').then(r => r.json());
    lookupData.project_groups = groups;
    return groups;
}

async function moveProjectToGroup(prjId, groupId) {
    const project = (lookupData.projects || []).find(p => p.prj_id === prjId);
    if (!project) return;
    const scope = scopeOfProject(project);
    if ((project.group_id || '') === (groupId || '')) return;

    const group = groupsForScope(scope).find(g => g.group_id === groupId);
    if (groupId && !group) {
        showNotification(`That group belongs to the other page`, 'error');
        return;
    }

    const res = await fetch(`/api/admin/projects/${encodeURIComponent(prjId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId || null })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showNotification('Could not move: ' + (err.error || res.status), 'error');
        return;
    }
    project.group_id = groupId || null;
    if (groupId) delete projectGroupCollapsed[groupId];
    showNotification(`"${project.name}" moved to ${group ? group.name : 'Ungrouped'}`, 'success');
    rerenderGroupScope(scope);
}

async function createProjectGroup(name, scope = 'project') {
    name = (name || '').trim();
    if (!name) return null;
    const res = await fetch('/api/project-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scope })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        showNotification('Could not create group: ' + (data.error || res.status), 'error');
        return null;
    }
    await refreshProjectGroups();
    return data;
}

async function openCreateProjectGroupPrompt(scope = 'project') {
    const name = prompt(`New ${groupScopeLabel(scope)} group name:`);
    if (!name || !name.trim()) return;
    const group = await createProjectGroup(name, scope);
    if (group) {
        showNotification(`Group "${group.name}" created`, 'success');
        rerenderGroupScope(scope);
    }
}

function openMoveProjectToGroupModal(prjId) {
    const project = (lookupData.projects || []).find(p => p.prj_id === prjId);
    if (!project) return;
    const scope = scopeOfProject(project);
    document.getElementById('move-project-group-modal')?.remove();

    const groups = groupsForScope(scope);
    const modal = document.createElement('div');
    modal.id = 'move-project-group-modal';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 10px; padding: 25px; width: 420px; max-width: 92%;">
            <h3 style="margin: 0 0 6px 0;"><i class="fa-solid fa-folder-tree" style="color: #007bff;"></i> Move to Group</h3>
            <p style="margin: 0 0 15px 0; color: var(--fg-6c757d); font-size: 0.9em;">${escapeHtml(project.name)}</p>
            <label style="display: block; font-weight: 500; margin-bottom: 5px;">Group</label>
            <select id="move-project-group-select" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 6px; margin-bottom: 12px;">
                <option value="">— Ungrouped —</option>
                ${groups.map(g => `<option value="${g.group_id}" ${g.group_id === project.group_id ? 'selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}
            </select>
            <label style="display: block; font-weight: 500; margin-bottom: 5px;">…or create a new group</label>
            <input id="move-project-new-group" type="text" placeholder="New group name (optional)"
                   style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 6px;">
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="confirmMoveProjectToGroup('${prjId}')" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Move</button>
                <button onclick="document.getElementById('move-project-group-modal').remove()" style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}

async function confirmMoveProjectToGroup(prjId) {
    const project = (lookupData.projects || []).find(p => p.prj_id === prjId);
    if (!project) return;
    const newName = document.getElementById('move-project-new-group')?.value.trim();
    let groupId = document.getElementById('move-project-group-select')?.value || '';
    if (newName) {
        const group = await createProjectGroup(newName, scopeOfProject(project));
        if (!group) return;
        groupId = group.group_id;
    }
    document.getElementById('move-project-group-modal')?.remove();
    await moveProjectToGroup(prjId, groupId);
    rerenderGroupScope(scopeOfProject(project));
}

let manageGroupsScope = 'project';

function openManageProjectGroupsModal(scope = 'project') {
    manageGroupsScope = scope;
    document.getElementById('manage-project-groups-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'manage-project-groups-modal';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 10px; padding: 25px; width: 560px; max-width: 94%; max-height: 85vh; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;"><i class="fa-solid fa-folder-tree" style="color: #007bff;"></i> ${scope === 'problem' ? 'Problem' : 'Project'} Groups</h3>
                <button onclick="closeManageProjectGroupsModal()" style="background: none; border: none; font-size: 1.3em; cursor: pointer; color: var(--fg-6c757d);">&times;</button>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                <input id="manage-new-group-name" type="text" placeholder="New group name"
                       onkeydown="if(event.key==='Enter') addGroupFromManager()"
                       style="flex: 1; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 6px;">
                <button onclick="addGroupFromManager()" style="padding: 10px 16px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap;">
                    <i class="fa-solid fa-plus"></i> Add Group
                </button>
            </div>
            <div id="manage-groups-list" style="overflow-y: auto; flex: 1;"></div>
            <p style="margin: 15px 0 0 0; font-size: 0.85em; color: var(--fg-6c757d);">
                Tip: drag a ${groupScopeLabel(scope)} in the left panel onto a group header to move it. Deleting a group keeps its ${groupScopeLabel(scope, true)} (they become Ungrouped).
            </p>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) closeManageProjectGroupsModal(); });
    document.body.appendChild(modal);
    renderManageGroupsList();
}

function closeManageProjectGroupsModal() {
    document.getElementById('manage-project-groups-modal')?.remove();
    rerenderGroupScope(manageGroupsScope);
}

function renderManageGroupsList() {
    const list = document.getElementById('manage-groups-list');
    if (!list) return;
    const scope = manageGroupsScope;
    const groups = groupsForScope(scope);
    if (groups.length === 0) {
        list.innerHTML = '<p style="color: var(--fg-6c757d); text-align: center; padding: 20px;">No groups yet. Add one above.</p>';
        return;
    }
    list.innerHTML = groups.map((g, i) => {
        const count = (lookupData.projects || []).filter(p => p.group_id === g.group_id && scopeOfProject(p) === scope).length;
        return `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; margin-bottom: 8px;">
                <i class="fa-solid fa-folder" style="color: #007bff;"></i>
                <input type="text" value="${escapeHtml(g.name)}" data-original="${escapeHtml(g.name)}"
                       onkeydown="if(event.key==='Enter') this.blur()"
                       onblur="renameProjectGroup('${g.group_id}', this)"
                       style="flex: 1; padding: 6px 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <span style="font-size: 0.8em; color: var(--fg-6c757d); white-space: nowrap;">${count} ${groupScopeLabel(scope, count !== 1)}</span>
                <button onclick="moveProjectGroupOrder('${g.group_id}', -1)" ${i === 0 ? 'disabled' : ''} title="Move up"
                        style="padding: 5px 8px; border: 1px solid var(--bd-ced4da); background: var(--bg-fff); border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-up"></i></button>
                <button onclick="moveProjectGroupOrder('${g.group_id}', 1)" ${i === groups.length - 1 ? 'disabled' : ''} title="Move down"
                        style="padding: 5px 8px; border: 1px solid var(--bd-ced4da); background: var(--bg-fff); border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-down"></i></button>
                <button onclick="deleteProjectGroup('${g.group_id}')" title="Delete group"
                        style="padding: 5px 8px; border: none; background: var(--bg-fee2e2); color: #dc3545; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    }).join('');
}

async function addGroupFromManager() {
    const input = document.getElementById('manage-new-group-name');
    const group = await createProjectGroup(input?.value, manageGroupsScope);
    if (group) {
        input.value = '';
        renderManageGroupsList();
    }
}

async function renameProjectGroup(groupId, input) {
    const name = input.value.trim();
    if (!name) { input.value = input.dataset.original; return; }
    if (name === input.dataset.original) return;
    const res = await fetch(`/api/project-groups/${encodeURIComponent(groupId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    if (!res.ok) {
        showNotification('Could not rename group', 'error');
        input.value = input.dataset.original;
        return;
    }
    input.dataset.original = name;
    await refreshProjectGroups();
    showNotification('Group renamed', 'success');
}

async function moveProjectGroupOrder(groupId, direction) {
    const groups = groupsForScope(manageGroupsScope);
    const idx = groups.findIndex(g => g.group_id === groupId);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= groups.length) return;
    [groups[idx], groups[target]] = [groups[target], groups[idx]];
    await fetch('/api/project-groups/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: groups.map(g => g.group_id) })
    });
    await refreshProjectGroups();
    renderManageGroupsList();
}

async function deleteProjectGroup(groupId) {
    const group = (lookupData.project_groups || []).find(g => g.group_id === groupId);
    if (!group) return;
    const scope = group.scope || 'project';
    if (!confirm(`Delete group "${group.name}"?\n\nIts ${groupScopeLabel(scope, true)} are NOT deleted; they move to Ungrouped.`)) return;
    const res = await fetch(`/api/project-groups/${encodeURIComponent(groupId)}`, { method: 'DELETE' });
    if (!res.ok) {
        showNotification('Could not delete group', 'error');
        return;
    }
    (lookupData.projects || []).forEach(p => { if (p.group_id === groupId) p.group_id = null; });
    delete projectGroupCollapsed[groupId];
    await refreshProjectGroups();
    renderManageGroupsList();
    showNotification(`Group "${group.name}" deleted`, 'success');
}

window.toggleProjectGroupCollapse = toggleProjectGroupCollapse;
window.handleProjectNavDragStart = handleProjectNavDragStart;
window.handleProjectGroupDragOver = handleProjectGroupDragOver;
window.handleProjectGroupDragLeave = handleProjectGroupDragLeave;
window.handleProjectGroupDrop = handleProjectGroupDrop;
window.openCreateProjectGroupPrompt = openCreateProjectGroupPrompt;
window.openMoveProjectToGroupModal = openMoveProjectToGroupModal;
window.confirmMoveProjectToGroup = confirmMoveProjectToGroup;
window.openManageProjectGroupsModal = openManageProjectGroupsModal;
window.closeManageProjectGroupsModal = closeManageProjectGroupsModal;
window.addGroupFromManager = addGroupFromManager;
window.renameProjectGroup = renameProjectGroup;
window.moveProjectGroupOrder = moveProjectGroupOrder;
window.deleteProjectGroup = deleteProjectGroup;

/**
 * Render Kanban board for selected project
 */
function renderProjectKanbanBoard(projectId) {
    let project, projectTasks;
    
    if (projectId === 'all-projects') {
        // Virtual "All Projects" view
        project = { prj_id: 'all-projects', name: 'All Projects', description: 'All tasks across all projects' };
        projectTasks = allTasks.filter(t => t.is_archived === 0);
        
        // Bug-17 FIX: When hideCompletedProjects is on, exclude tasks from completed/cancelled projects
        if (hideCompletedProjects) {
            projectTasks = projectTasks.filter(t => {
                if (!t.project_id) return true; // Keep unassigned tasks
                const taskProject = lookupData.projects.find(p => p.prj_id === t.project_id);
                if (!taskProject) return true;
                const projectStatus = (taskProject.status || '').toLowerCase();
                return projectStatus !== 'completed' && projectStatus !== 'cancelled';
            });
        }
    } else if (projectId === 'unassigned') {
        // Virtual "Unassigned" project
        project = { prj_id: 'unassigned', name: 'Unassigned', description: 'Tasks without a project' };
        projectTasks = allTasks.filter(t => (!t.project_id || t.project_id === '') && t.is_archived === 0);
    } else {
        project = lookupData.projects.find(p => p.prj_id === projectId);
        projectTasks = allTasks.filter(t => t.project_id === projectId && t.is_archived === 0);
    }
    
    // Apply hide completed tasks filter
    if (hideCompletedTasks) {
        projectTasks = projectTasks.filter(t => t.status_name && t.status_name.toLowerCase() !== 'done');
    }
    
    // Apply general search filter
    if (generalSearchTerm) {
        projectTasks = projectTasks.filter(t => {
            return Object.values(t).some(val => 
                val && String(val).toLowerCase().includes(generalSearchTerm)
            );
        });
    }
    
    // Apply task group filter
    if (projectTaskGroupFilter) {
        projectTasks = projectTasks.filter(t => t.task_group === projectTaskGroupFilter);
    }
    
    // Apply category filter
    if (projectCategoryFilter) {
        projectTasks = projectTasks.filter(t => t.category_id === projectCategoryFilter);
    }
    
    // Apply subcategory filter
    if (projectSubcategoryFilter) {
        projectTasks = projectTasks.filter(t => t.subcategory_id === projectSubcategoryFilter);
    }
    
    const statuses = lookupData.lkp_status || [];
    const stages = lookupData.lkp_stage || [];
    
    // Determine which grouping to use
    let groupByValues = projectGroupBy === 'stage' ? stages : statuses;
    const groupByField = projectGroupBy === 'stage' ? 'stage_name' : 'status_name';
    
    // Done is always the last status column
    if (projectGroupBy === 'status') {
        groupByValues = orderStatusesDoneLast(groupByValues);
    }
    
    let html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin: 0 0 10px 0; color: var(--fg-212529);">${project ? project.name : 'Project'}</h2>
                <p style="color: var(--fg-6c757d); margin: 0;">${projectTasks.length} active tasks</p>
            </div>
            ${projectId !== 'all-projects' && projectId !== 'unassigned' ? `
                <button onclick="deleteProjectWithOptions('${projectId}')" 
                        style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;
                               transition: all 0.2s;"
                        onmouseover="this.style.background='#c82333'"
                        onmouseout="this.style.background='#dc3545'">
                    <i class="fa-solid fa-trash"></i>
                    Delete Project
                </button>
            ` : ''}
        </div>
        
        <div class="kanban-grid" style="${kanbanGridStyle(groupByValues.length)}">
    `;
    
    // Create a column for each group value
    groupByValues.forEach((groupValue, index) => {
        const groupName = groupValue.name;
        const tasksInGroup = projectTasks.filter(t => t[groupByField] === groupName);
        
        // Same colour source as the cards in this column
        const headerColor = projectGroupBy === 'stage' ? getStageColor(groupName) : getStatusColor(groupName);
        
        html += `
            <div class="kanban-column" data-status="${groupName}" data-field="${groupByField}"
                 style="min-width: 0; background-color: var(--bg-f8f9fa); border-radius: 8px; padding: 8px;"
                 ondrop="handleProjectKanbanDrop(event)" 
                 ondragover="handleKanbanDragOver(event)">
                
                <div title="${escapeHtml(groupName)} (${tasksInGroup.length})" style="background-color: ${headerColor}; color: white; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(groupName)} (${tasksInGroup.length})
                </div>
                
                <div class="kanban-cards" style="min-height: 100px;">
        `;
        
        // Render cards for this status
        tasksInGroup.forEach(task => {
            html += renderKanbanCard(task);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    return html;
}

/**
 * Select a project
 */
function selectProject(projectId) {
    selectedProjectId = projectId;
    renderProjectsKanban();
}

/**
 * Handle drop on Project Kanban column
 */
function handleProjectKanbanDrop(event) {
    event.preventDefault();
    
    const taskId = event.dataTransfer.getData('taskId');
    const currentStatus = event.dataTransfer.getData('currentStatus');
    
    // Find the column element
    let column = event.target;
    while (column && !column.classList.contains('kanban-column')) {
        column = column.parentElement;
    }
    
    if (!column) return;
    
    const newValue = column.dataset.status;
    const fieldName = column.dataset.field; // 'status_name' or 'stage_name'
    
    // Reset opacity
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.style.opacity = '1';
    });
    
    // If value hasn't changed, do nothing
    if (currentStatus === newValue) return;
    
    // Update task with correct field
    updateProjectTaskStatus(taskId, newValue, fieldName);
}

/**
 * Update task status/stage for project kanban
 */
function updateProjectTaskStatus(taskId, newValue, fieldName) {
    const updateData = {};
    updateData[fieldName] = newValue;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    })
    .then(() => {
        // Update local data
        const task = allTasks.find(t => t.id == taskId);
        if (task) {
            task[fieldName] = newValue;
        }
        
        // Re-render
        renderProjectsKanban();
    })
    .catch(error => {
        showNotification('Error updating task: ' + error.message, 'error');
        console.error('Update error:', error);
    });
}

/**
 * Handle project search
 */
function handleProjectSearch(searchTerm) {
    updateProjectResults(searchTerm);
}

/**
 * Handle general search (tasks and projects)
 */
function handleGeneralSearch(searchTerm) {
    generalSearchTerm = searchTerm.toLowerCase();
    // Only re-render the kanban board, not the entire page (which would lose focus)
    const kanbanContainer = document.querySelector('#project-kanban-board > div:last-child');
    if (kanbanContainer && selectedProjectId) {
        kanbanContainer.innerHTML = renderProjectKanbanBoard(selectedProjectId);
    } else if (kanbanContainer) {
        kanbanContainer.innerHTML = '<p style="text-align: center; color: var(--fg-6c757d); margin-top: 50px;">Select a project to view its tasks</p>';
    }
}

/**
 * Handle project page task group filter
 */
function handleProjectTaskGroupFilter(value) {
    projectTaskGroupFilter = value;
    renderProjectsKanban();
}

/**
 * Handle project page category filter
 */
function handleProjectCategoryFilter(value) {
    projectCategoryFilter = value;
    // Reset subcategory if category changes
    if (value) {
        projectSubcategoryFilter = '';
    }
    renderProjectsKanban();
}

/**
 * Handle project page subcategory filter
 */
function handleProjectSubcategoryFilter(value) {
    projectSubcategoryFilter = value;
    renderProjectsKanban();
}

/**
 * Toggle hide completed projects
 */
function toggleHideCompletedProjects(checked) {
    hideCompletedProjects = checked;
    // Bug-17 FIX: Don't automatically hide all completed tasks
    // Only hide tasks in COMPLETED projects, not all tasks with status=Done
    // Keep the checkboxes independent
    const searchTerm = document.getElementById('project-search')?.value || '';
    updateProjectResults(searchTerm);
    // Re-render kanban board to apply task filter
    if (selectedProjectId) {
        const kanbanContainer = document.querySelector('#project-kanban-board > div:last-child');
        if (kanbanContainer) {
            kanbanContainer.innerHTML = renderProjectKanbanBoard(selectedProjectId);
        }
    }
}

/**
 * Toggle project navigation panel minimize/maximize
 */
function toggleProjectNav() {
    window.projectNavMinimized = !window.projectNavMinimized;
    renderProjectsKanban();
}

/**
 * Delete project with options
 */
function deleteProjectWithOptions(projectId) {
    const project = lookupData.projects.find(p => p.prj_id === projectId);
    if (!project) {
        showNotification('Project not found', 'error');
        return;
    }
    
    const tasksInProject = allTasks.filter(t => t.project_id === projectId);
    
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.id = 'delete-project-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: #dc3545;"></i>
                <div>
                    <h2 style="margin: 0 0 8px 0; color: var(--fg-212529); font-size: 1.5em;">Delete Project</h2>
                    <p style="margin: 0; color: var(--fg-6c757d);">This action cannot be undone</p>
                </div>
            </div>
            
            <div style="background: var(--bg-f8f9fa); border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: var(--fg-212529);">Project: ${project.name}</p>
                <p style="margin: 0; color: var(--fg-6c757d);">${tasksInProject.length} task(s) in this project</p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 15px 0; font-weight: 600; color: var(--fg-212529);">What would you like to do with the tasks?</p>
                
                <label style="display: flex; align-items: center; padding: 15px; background: var(--bg-fff); border: 2px solid var(--bd-dee2e6); border-radius: 8px; cursor: pointer; margin-bottom: 12px; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='#dc3545'; this.style.background='var(--bg-fff5f5)'"
                       onmouseout="this.style.borderColor='var(--bd-dee2e6)'; this.style.background='var(--bg-fff)'">
                    <input type="radio" name="delete-option" value="with-tasks" checked 
                           style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                    <div>
                        <div style="font-weight: 600; color: var(--fg-212529); margin-bottom: 4px;">Delete project and all tasks</div>
                        <div style="font-size: 0.9em; color: var(--fg-6c757d);">Permanently remove the project and ${tasksInProject.length} task(s)</div>
                    </div>
                </label>
                
                <label style="display: flex; align-items: center; padding: 15px; background: var(--bg-fff); border: 2px solid var(--bd-dee2e6); border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='#007bff'; this.style.background='var(--bg-f0f8ff)'"
                       onmouseout="this.style.borderColor='var(--bd-dee2e6)'; this.style.background='var(--bg-fff)'">
                    <input type="radio" name="delete-option" value="keep-tasks" 
                           style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                    <div>
                        <div style="font-weight: 600; color: var(--fg-212529); margin-bottom: 4px;">Delete project only</div>
                        <div style="font-size: 0.9em; color: var(--fg-6c757d);">Keep tasks as unassigned (can be moved to other projects)</div>
                    </div>
                </label>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="closeDeleteProjectModal()" 
                        style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s;"
                        onmouseover="this.style.background='#5a6268'"
                        onmouseout="this.style.background='#6c757d'">
                    Cancel
                </button>
                <button onclick="confirmDeleteProject('${projectId}')" 
                        style="padding: 12px 24px; background: #dc3545; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;
                               transition: all 0.2s;"
                        onmouseover="this.style.background='#c82333'"
                        onmouseout="this.style.background='#dc3545'">
                    <i class="fa-solid fa-trash"></i>
                    Delete Project
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeDeleteProjectModal() {
    const modal = document.getElementById('delete-project-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmDeleteProject(projectId) {
    const modal = document.getElementById('delete-project-modal');
    const selectedOption = modal.querySelector('input[name="delete-option"]:checked').value;
    const deleteTasks = selectedOption === 'with-tasks';
    
    // Close modal
    closeDeleteProjectModal();
    
    // Show loading
    showNotification('Deleting project...', 'info');
    
    // Delete tasks first if requested
    const deletePromises = [];
    
    if (deleteTasks) {
        const tasksInProject = allTasks.filter(t => t.project_id === projectId);
        tasksInProject.forEach(task => {
            deletePromises.push(
                fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
            );
        });
    } else {
        // Unassign tasks from project
        const tasksInProject = allTasks.filter(t => t.project_id === projectId);
        tasksInProject.forEach(task => {
            deletePromises.push(
                fetch(`/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: null })
                })
            );
        });
    }
    
    // Wait for all task operations, then delete project
    Promise.all(deletePromises)
        .then(() => {
            return fetch(`/api/admin/projects/${projectId}`, { method: 'DELETE' });
        })
        .then(response => response.json())
        .then(() => {
            showNotification(`Project deleted successfully${deleteTasks ? ' with tasks' : ' (tasks kept)'}`, 'success');
            // Refresh projects view
            initializeProjectsKanban();
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            showNotification('Error deleting project', 'error');
        });
}

/**
 * Toggle hide completed tasks
 */
/**
 * Toggle project grouping between Status and Stage
 */
function toggleProjectGroupBy() {
    projectGroupBy = projectGroupBy === 'status' ? 'stage' : 'status';
    // Re-render entire Projects page to update button and kanban board
    renderProjectsKanban();
}

/**
 * Open Create Project modal
 */
function openCreateProjectModal(preselectGroupId) {
    document.getElementById('create-project-modal')?.remove();
    const groups = groupsForScope('project');

    const modal = document.createElement('div');
    modal.id = 'create-project-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background-color: rgba(0,0,0,0.5); display: flex; align-items: center; 
        justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 8px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 20px 0; color: var(--fg-212529);">
                <i class="fa-solid fa-diagram-project"></i> Create New Project
            </h2>
            
            <form id="create-project-form" onsubmit="handleCreateProject(event); return false;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">Project Name *</label>
                    <input type="text" id="new-project-name" required placeholder="e.g., Mobile App Development"
                           style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">
                        Project ID <span style="font-weight: normal; color: var(--fg-6c757d);">(optional - auto-generated)</span>
                    </label>
                    <input type="text" id="new-project-id" placeholder="Leave empty to auto-generate from name"
                           style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                    <small style="color: var(--fg-6c757d);">Custom ID if needed (no spaces)</small>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">Description</label>
                    <textarea id="new-project-description" rows="3" placeholder="Brief project description..."
                              style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; resize: vertical;"></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">Status</label>
                    <select id="new-project-status" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">Group</label>
                    <select id="new-project-group" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                        <option value="">— Ungrouped —</option>
                        ${groups.map(g => `<option value="${g.group_id}" ${g.group_id === preselectGroupId ? 'selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}
                    </select>
                    <small style="color: var(--fg-6c757d);">Groups are managed from the left panel of Projects</small>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="save-button" style="flex: 1; margin: 0; padding: 12px;">
                        <i class="fa-solid fa-check"></i> Create Project
                    </button>
                    <button type="button" onclick="closeCreateProjectModal()" 
                            style="flex: 1; margin: 0; padding: 12px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-times"></i> Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('new-project-name')?.focus();
}

/**
 * Close Create Project modal
 */
function closeCreateProjectModal() {
    const modal = document.getElementById('create-project-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Handle Create Project form submission
 */
function handleCreateProject(event) {
    event.preventDefault();
    
    const projectData = {
        name: document.getElementById('new-project-name').value.trim(),
        prj_id: document.getElementById('new-project-id').value.trim(), // Optional, can be empty
        description: document.getElementById('new-project-description').value.trim(),
        status: document.getElementById('new-project-status').value,
        group_id: document.getElementById('new-project-group').value || null
    };
    
    // Validate name is not empty
    if (!projectData.name) {
        alert('Project name is required.');
        return;
    }
    
    // If custom ID provided, validate format (no spaces)
    if (projectData.prj_id && projectData.prj_id.includes(' ')) {
        alert('Project ID cannot contain spaces. Use hyphens or underscores instead.');
        return;
    }
    
    // If custom ID provided, check if it already exists
    if (projectData.prj_id && lookupData.projects.some(p => p.prj_id === projectData.prj_id)) {
        alert('A project with this ID already exists. Please use a unique ID or leave empty for auto-generation.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#create-project-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
    
    fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || 'Failed to create project');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Project created:', data);
        
        // Close modal
        closeCreateProjectModal();
        
        // Refresh lookups to get new project
        fetch('/api/lookups')
            .then(r => r.json())
            .then(lookups => {
                lookupData = lookups;
                
                // Refresh projects page
                renderProjectsKanban();
                
                // Show success message
                alert(`Project "${data.name}" created successfully!\nProject ID: ${data.prj_id}`);
            });
    })
    .catch(error => {
        console.error('Error creating project:', error);
        alert('Error creating project: ' + error.message);
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

// ========================================================================
//                        HOME PAGE
// ========================================================================

/**
 * Initialize Home Page
 */
function initializeHomePage() {
    const container = document.getElementById('home-container');
    container.innerHTML = '<p>Loading dashboard...</p>';
    
    Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json())
    ])
    .then(([tasks, lookups]) => {
        allTasks = tasks;
        lookupData = lookups;
        renderHomePage();
    })
    .catch(error => {
        container.innerHTML = `<p style="color:red;">Error loading dashboard: ${error.message}</p>`;
        console.error('Error:', error);
    });
}

/**
 * Render Home Page
 */
function renderHomePage() {
    const container = document.getElementById('home-container');
    
    // Get recent tasks (last 5 modified)
    const recentTasks = [...allTasks]
        .filter(t => t.is_archived === 0)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    // Get projects with recent task activity
    const projectsMap = new Map();
    allTasks.filter(t => t.is_archived === 0 && t.project_id).forEach(task => {
        const existing = projectsMap.get(task.project_id);
        if (!existing || new Date(task.created_at) > new Date(existing.lastModified)) {
            const project = lookupData.projects?.find(p => p.prj_id === task.project_id);
            if (project) {
                projectsMap.set(task.project_id, {
                    ...project,
                    lastModified: task.created_at,
                    taskCount: allTasks.filter(t => t.project_id === task.project_id && t.is_archived === 0).length
                });
            }
        }
    });
    
    const recentProjects = Array.from(projectsMap.values())
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5);
    
    // Get overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('[Overdue] Today:', today.toISOString());
    
    const overdueTasks = allTasks.filter(t => {
        if (!t.due_date || t.is_archived === 1 || t.status_name === 'Done') return false;
        const dueDate = new Date(t.due_date);
        const isOverdue = dueDate < today;
        
        // Debug first few tasks
        if (allTasks.indexOf(t) < 5) {
            console.log(`[Overdue] Task "${t.title}": due_date=${t.due_date}, parsed=${dueDate.toISOString()}, isOverdue=${isOverdue}, status=${t.status_name}, archived=${t.is_archived}`);
        }
        
        return isOverdue;
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    console.log('[Overdue] Found', overdueTasks.length, 'overdue tasks');
    
    // Get reminder tasks
    const reminderTasks = allTasks.filter(t => {
        if (!t.reminder_date || t.is_archived === 1 || t.status_name === 'Done') return false;
        const reminderDate = new Date(t.reminder_date);
        reminderDate.setHours(0, 0, 0, 0);
        const isReminder = reminderDate <= today;
        
        // Debug first few tasks with reminder_date
        if (t.reminder_date && allTasks.filter(x => x.reminder_date).indexOf(t) < 3) {
            console.log(`[Reminders] Task "${t.title}": reminder_date=${t.reminder_date}, parsed=${reminderDate.toISOString()}, isReminder=${isReminder}, status=${t.status_name}, archived=${t.is_archived}`);
        }
        
        return isReminder;
    }).sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));
    
    console.log('[Reminders] Found', reminderTasks.length, 'reminder tasks out of', allTasks.filter(t => t.reminder_date).length, 'tasks with reminder dates');
    
    let html = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; height: calc(100vh - 120px); width: 100%; max-width: 100%; box-sizing: border-box;">
            <!-- Recent Tasks Panel - 2fr (40%) -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow-y: auto;">
                <h3 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                    <i class="fa-solid fa-clock-rotate-left"></i> Recently Modified Tasks
                </h3>
                ${recentTasks.length === 0 ? '<p style="color: var(--fg-6c757d);">No tasks yet</p>' : ''}
                ${recentTasks.map(task => `
                    <div onclick="openEditTaskModalById(${task.id})" style="padding: 12px; margin-bottom: 10px; border-left: 4px solid #007bff; background-color: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer; transition: all 0.2s;"
                         onmouseover="this.style.backgroundColor='var(--bg-e9ecef)'; this.style.transform='translateX(5px)'"
                         onmouseout="this.style.backgroundColor='var(--bg-f8f9fa)'; this.style.transform='translateX(0)'">
                        <div style="font-weight: 600; margin-bottom: 5px;">${task.title}</div>
                        <div style="font-size: 0.85em; color: var(--fg-6c757d);">
                            <span style="background-color: ${task.status_name === 'Done' ? '#28a745' : '#007bff'}; color: white; padding: 2px 8px; border-radius: 3px; margin-right: 8px;">
                                ${task.status_name}
                            </span>
                            ${task.due_date ? `<i class="fa-solid fa-calendar"></i> ${new Date(task.due_date).toLocaleDateString()}` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Active Projects Panel - 1fr (20%) -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow-y: auto;">
                <h3 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                    <i class="fa-solid fa-diagram-project"></i> Active Projects
                </h3>
                ${recentProjects.length === 0 ? '<p style="color: var(--fg-6c757d);">No projects yet</p>' : ''}
                ${recentProjects.map(project => `
                    <div style="padding: 12px; margin-bottom: 10px; border-left: 4px solid #28a745; background-color: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;"
                         onclick="navigateToProject('${project.prj_id}')">
                        <div style="font-weight: 600; margin-bottom: 5px;">${project.name}</div>
                        <div style="font-size: 0.85em; color: var(--fg-6c757d);">
                            ${project.taskCount} tasks • Last activity: ${new Date(project.lastModified).toLocaleDateString()}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Overdue Tasks Panel - 20% -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow-y: auto;">
                <h3 style="margin: 0 0 15px 0; color: #dc3545;">
                    <i class="fa-solid fa-bell"></i> Overdue Tasks
                </h3>
                ${overdueTasks.length === 0 ? 
                    '<p style="color: #28a745;"><i class="fa-solid fa-check-circle"></i> No overdue tasks!</p>' : 
                    overdueTasks.map(task => `
                        <div onclick="openEditTaskModalById(${task.id})" style="padding: 10px; margin-bottom: 10px; border: 1px solid #dc3545; background-color: var(--bg-fff5f5); border-radius: 4px; cursor: pointer;">
                            <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 3px; color: #dc3545;">${task.title}</div>
                            <div style="font-size: 0.75em; color: var(--fg-6c757d);">
                                Due: ${new Date(task.due_date).toLocaleDateString()}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
            
            <!-- Reminders Panel - 20% -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow-y: auto;">
                <h3 style="margin: 0 0 15px 0; color: #ff9800;">
                    <i class="fa-solid fa-clock"></i> Reminders
                </h3>
                ${reminderTasks.length === 0 ? 
                    '<p style="color: var(--fg-6c757d);"><i class="fa-solid fa-check-circle"></i> No reminders!</p>' : 
                    reminderTasks.map(task => `
                        <div onclick="openEditTaskModalById(${task.id})" style="padding: 10px; margin-bottom: 10px; border: 1px solid #ff9800; background-color: var(--bg-fff8e1); border-radius: 4px; cursor: pointer;">
                            <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 3px; color: #ff9800;">${task.title}</div>
                            <div style="font-size: 0.75em; color: var(--fg-6c757d);">
                                Reminder: ${new Date(task.reminder_date).toLocaleDateString()}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Navigate to project from home page
 */
function navigateToProject(projectId) {
    // First navigate to projects page
    renderPage('nav-projects');
    // Then select the specific project (slight delay to ensure page is rendered)
    setTimeout(() => {
        selectProject(projectId);
    }, 50);
}
window.navigateToProject = navigateToProject;

// ========================================================================
//              QUICK LINKS / QUICK INFO / LOGS (RICH TEXT EDITOR)
// ========================================================================

/**
 * Initialize Quick Links / Quick Info / Logs page with rich text editor
 */
function initializeFAQPage(pageName, pageTitle) {
    const container = document.getElementById(`faq-${pageName}-container`);
    
    // Load from database instead of localStorage
    fetch(`/api/faq/${pageName}`)
        .then(response => response.json())
        .then(data => {
            const content = data.content || `<p>Click Edit to add content for ${pageTitle}...</p>`;
            renderFAQContent(pageName, pageTitle, content);
        })
        .catch(error => {
            console.error('Error loading FAQ page:', error);
            renderFAQContent(pageName, pageTitle, `<p>Click Edit to add content for ${pageTitle}...</p>`);
        });
}

/**
 * Render FAQ page content with edit/view modes
 */
function renderFAQContent(pageName, pageTitle, content) {
    const container = document.getElementById(`faq-${pageName}-container`);
    const storageKey = `faq_${pageName}_content`;
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">${pageTitle}</h2>
                <button onclick="editFAQPage('${pageName}', '${pageTitle}')" style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-edit"></i> Edit
                </button>
            </div>
            <div id="faq-${pageName}-view" style="padding: 20px; background: var(--bg-fff); border-radius: 8px; min-height: 200px;">
                ${content}
            </div>
        </div>
    `;
    
    // Don't strip controls - just let CSS hide them
    // Fix links to open in new tab
    const viewContainer = document.getElementById(`faq-${pageName}-view`);
    if (viewContainer) {
        const links = viewContainer.querySelectorAll('a');
        links.forEach(link => {
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
}

/**
 * Edit FAQ page
 */
function editFAQPage(pageName, pageTitle) {
    const container = document.getElementById(`faq-${pageName}-container`);
    const storageKey = `faq_${pageName}_content`;
    
    // Read content from the view div (already rendered HTML)
    const viewDiv = document.getElementById(`faq-${pageName}-view`);
    const currentContent = viewDiv ? viewDiv.innerHTML : (localStorage.getItem(storageKey) || '');
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="margin-bottom: 20px;">${pageTitle} - Editing</h2>
            
            <!-- Toolbar (full rich text toolbar) -->
            <div id="faq-toolbar" style="position: sticky; top: 0; z-index: 100; padding: 10px; background-color: var(--bg-f8f9fa); border: 1px solid var(--bd-dee2e6); margin-bottom: 10px; display: flex; gap: 5px; flex-wrap: wrap; align-items: center;">
                <button onclick="saveFAQPage('${pageName}', '${pageTitle}')" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;"margin: 0; padding: 8px 15px;">
                    <i class="fa-solid fa-save"></i> Save
                </button>
                <button onclick="cancelFAQEdit('${pageName}', '${pageTitle}')" style="padding: 8px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" style="margin: 0; padding: 8px 15px;">
                    <i class="fa-solid fa-times"></i> Cancel
                </button>
                <div style="width: 1px; background-color: var(--bg-dee2e6); margin: 0 5px;"></div>
                <button onclick="document.execCommand('undo')" title="Undo (Ctrl+Z)" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fa-solid fa-undo"></i>
                </button>
                <button onclick="document.execCommand('redo')" title="Redo (Ctrl+Y)" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fa-solid fa-redo"></i>
                </button>
                <div style="width: 1px; background-color: var(--bg-dee2e6); margin: 0 5px;"></div>
                <button onclick="formatFAQText('bold')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Bold"><i class="fa-solid fa-bold"></i></button>
                <button onclick="formatFAQText('italic')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Italic"><i class="fa-solid fa-italic"></i></button>
                <button onclick="formatFAQText('underline')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Underline"><i class="fa-solid fa-underline"></i></button>
                <div style="width: 1px; background-color: var(--bg-dee2e6); margin: 0 5px;"></div>
                <button onclick="formatFAQText('formatBlock', 'h1')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Heading 1">H1</button>
                <button onclick="formatFAQText('formatBlock', 'h2')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Heading 2">H2</button>
                <button onclick="formatFAQText('formatBlock', 'h3')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Heading 3">H3</button>
                <div style="width: 1px; background-color: var(--bg-dee2e6); margin: 0 5px;"></div>
                <button onclick="formatFAQText('insertUnorderedList')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Bullet List"><i class="fa-solid fa-list-ul"></i></button>
                <button onclick="formatFAQText('insertOrderedList')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Numbered List"><i class="fa-solid fa-list-ol"></i></button>
                <div style="width: 1px; background-color: var(--bg-dee2e6); margin: 0 5px;"></div>
                <button onclick="insertFAQLink('${pageName}')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Insert Link"><i class="fa-solid fa-link"></i></button>
                <label style="margin: 0; padding: 8px 15px; background-color: #007bff; color: white; border-radius: 4px; cursor: pointer;" title="Insert Image">
                    <i class="fa-solid fa-image"></i>
                    <input type="file" id="faq-${pageName}-image-upload" accept="image/*" style="display: none;" onchange="handleFAQImageUpload(event, '${pageName}')">
                </label>
                <button onclick="insertFAQTable('${pageName}')" style="margin: 0; padding: 8px 12px; background-color: #495057; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Insert Table"><i class="fa-solid fa-table"></i></button>
            </div>
            
            <!-- Editor -->
            <div id="faq-${pageName}-editor" contenteditable="true" style="min-height: 400px; padding: 20px; border: 1px solid var(--bd-ced4da); border-radius: 4px; background: var(--bg-fff); outline: none;">
                ${currentContent}
            </div>
        </div>
    `;
    
    // Focus editor and add editing-mode class to any table controls
    setTimeout(() => {
        const editor = document.getElementById(`faq-${pageName}-editor`);
        if (editor) {
            editor.focus();
            
            // Add editing-mode class to any table controls
            const tableControls = editor.querySelectorAll('.table-controls');
            tableControls.forEach(control => {
                control.classList.add('editing-mode');
            });
        }
    }, 100);
}

/**
 * Format text in FAQ editor
 */
function formatFAQText(command, value = null) {
    document.execCommand(command, false, value);
}

/**
 * Insert link in FAQ editor
 */
function insertFAQLink(pageName) {
    const url = prompt('Enter URL:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

/**
 * Handle image upload for FAQ editor
 */
function handleFAQImageUpload(event, pageName) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('/api/upload/image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            const editor = document.getElementById(`faq-${pageName}-editor`);
            editor.focus();
            
            // Use insertHTML - this works reliably in contenteditable
            const html = `<img src="${data.url}" style="max-width: 100%; height: auto;" alt="Uploaded image">`;
            document.execCommand('insertHTML', false, html);
            
            // Reset file input
            event.target.value = '';
            
            console.log('[FAQ] Image inserted:', data.url);
            showNotification('Image uploaded successfully!', 'success');
        } else {
            showNotification('Error uploading image', 'error');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        showNotification('Failed to upload image: ' + error.message, 'error');
    });
}

/**
 * Insert table in FAQ editor
 */
function insertFAQTable(pageName) {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (!rows || !cols) return;
    
    const numRows = parseInt(rows);
    const numCols = parseInt(cols);
    
    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
        showNotification('Please enter valid numbers', 'warning');
        return;
    }
    
    // Generate unique table ID
    const tableId = 'table-' + Date.now();
    
    let tableHTML = `
        <div class="editable-table-wrapper" style="margin: 20px 0; position: relative;">
            <div class="table-controls editing-mode" style="margin-bottom: 10px; display: flex; gap: 5px;">
                <button onclick="addTableRow('${tableId}')" style="padding: 5px 10px; background-color: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                    <i class="fa-solid fa-plus"></i> Add Row
                </button>
                <button onclick="addTableColumn('${tableId}')" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                    <i class="fa-solid fa-plus"></i> Add Column
                </button>
                <button onclick="removeTableRow('${tableId}')" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                    <i class="fa-solid fa-minus"></i> Remove Row
                </button>
                <button onclick="removeTableColumn('${tableId}')" style="padding: 5px 10px; background-color: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                    <i class="fa-solid fa-minus"></i> Remove Column
                </button>
            </div>
            <table id="${tableId}" border="1" style="border-collapse: collapse; width: 100%;" contenteditable="false">`;
    
    // Header row
    tableHTML += '<tr>';
    for (let c = 0; c < numCols; c++) {
        tableHTML += '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;" contenteditable="true">Header ' + (c + 1) + '</th>';
    }
    tableHTML += '</tr>';
    
    // Data rows
    for (let r = 1; r < numRows; r++) {
        tableHTML += '<tr>';
        for (let c = 0; c < numCols; c++) {
            tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;" contenteditable="true">Cell</td>';
        }
        tableHTML += '</tr>';
    }
    
    tableHTML += '</table></div><p><br></p>';
    
    const editor = document.getElementById(`faq-${pageName}-editor`);
    editor.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.createContextualFragment(tableHTML);
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Table editing helper functions
window.addTableRow = function(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const numCols = table.rows[0].cells.length;
    const newRow = table.insertRow(-1);
    
    for (let i = 0; i < numCols; i++) {
        const cell = newRow.insertCell(i);
        cell.style.cssText = 'border: 1px solid #ddd; padding: 8px;';
        cell.contentEditable = 'true';
        cell.textContent = 'Cell';
    }
    showNotification('Row added', 'success');
};

window.addTableColumn = function(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    for (let i = 0; i < table.rows.length; i++) {
        const cell = i === 0 ? document.createElement('th') : document.createElement('td');
        cell.style.cssText = i === 0 ? 
            'border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;' : 
            'border: 1px solid #ddd; padding: 8px;';
        cell.contentEditable = 'true';
        cell.textContent = i === 0 ? 'Header' : 'Cell';
        table.rows[i].appendChild(cell);
    }
    showNotification('Column added', 'success');
};

window.removeTableRow = function(tableId) {
    const table = document.getElementById(tableId);
    if (!table || table.rows.length <= 2) {
        showNotification('Cannot remove - table must have at least 2 rows', 'warning');
        return;
    }
    table.deleteRow(-1);
    showNotification('Row removed', 'success');
};

window.removeTableColumn = function(tableId) {
    const table = document.getElementById(tableId);
    if (!table || table.rows[0].cells.length <= 1) {
        showNotification('Cannot remove - table must have at least 1 column', 'warning');
        return;
    }
    const colIndex = table.rows[0].cells.length - 1;
    for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].deleteCell(colIndex);
    }
    showNotification('Column removed', 'success');
};

/**
 * Save FAQ page
 */
function saveFAQPage(pageName, pageTitle) {
    const editor = document.getElementById(`faq-${pageName}-editor`);
    
    // Remove editing-mode class from all table controls
    const tableControls = editor.querySelectorAll('.table-controls.editing-mode');
    tableControls.forEach(control => {
        control.classList.remove('editing-mode');
    });
    
    let content = editor.innerHTML;
    
    // Auto-linkify plain text URLs (www.example.com, http://example.com, etc.)
    const urlPattern = /(^|[^"'])((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
    content = content.replace(urlPattern, function(match, prefix, url) {
        // Don't linkify if already inside an href attribute
        if (prefix === 'href="' || prefix === "href='") {
            return match;
        }
        // Add https:// if no protocol
        const fullUrl = url.match(/^https?:\/\//i) ? url : 'https://' + url;
        return prefix + '<a href="' + fullUrl + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });
    
    // Save to database instead of localStorage
    fetch(`/api/faq/${pageName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderFAQContent(pageName, pageTitle, content);
        }
    })
    .catch(error => {
        console.error('Error saving FAQ page:', error);
        alert('Failed to save FAQ page');
    });
}

/**
 * Cancel FAQ edit
 */
function cancelFAQEdit(pageName, pageTitle) {
    // Reload from database
    initializeFAQPage(pageName, pageTitle);
}

// ========================================================================
//                        SEARCH PAGE
// ========================================================================

/**
 * Initialize Search Page
 */
function initializeSearchPage() {
    const container = document.getElementById('search-container');
    container.innerHTML = '<p>Loading search...</p>';
    
    Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json())
    ])
    .then(([tasks, lookups]) => {
        allTasks = tasks;
        lookupData = lookups;
        renderSearchPage('');
    })
    .catch(error => {
        container.innerHTML = `<p style="color:red;">Error loading search: ${error.message}</p>`;
        console.error('Error:', error);
    });
}

/**
 * Render Search Page
 */
function renderSearchPage(searchTerm) {
    const container = document.getElementById('search-container');
    
    let html = `
        <div style="margin-bottom: 30px;">
            <input type="text" id="global-search-input" placeholder="Search tasks, projects, problems, Quick Links / Info / Logs..." 
                   value="${searchTerm}"
                   style="width: 100%; padding: 15px; border: 2px solid #007bff; border-radius: 8px; font-size: 1.1em;">
        </div>
        <div id="search-results"></div>
    `;
    
    container.innerHTML = html;
    
    // Attach event listener AFTER rendering
    const searchInput = document.getElementById('global-search-input');
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
    
    // Perform initial search if term provided
    if (searchTerm) {
        performSearch(searchTerm);
    }
}

/**
 * Perform search and update results
 */
function performSearch(searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--fg-6c757d); margin-top: 50px;">Enter a search term to find tasks, projects, problems, and Quick Links / Quick Info / Logs</p>';
        return;
    }
    
    const term = searchTerm.toLowerCase();
    
    // Show loading
    resultsContainer.innerHTML = '<p style="text-align: center; color: var(--fg-6c757d); margin-top: 50px;"><i class="fa-solid fa-spinner fa-spin"></i> Searching...</p>';
    
    // Fetch all data in parallel
    Promise.all([
        // Tasks (already in memory)
        Promise.resolve(allTasks.filter(t => 
            t.is_archived === 0 && (
                (t.title && t.title.toLowerCase().includes(term)) ||
                (t.status_name && t.status_name.toLowerCase().includes(term)) ||
                Object.values(t).some(v => v && String(v).toLowerCase().includes(term))
            )
        )),
        // Projects (already in memory)
        Promise.resolve((lookupData.projects || []).filter(p =>
            !isProblemProject(p) && p.name.toLowerCase().includes(term)
        )),
        // Problems (projects with type 'Problem')
        Promise.resolve((lookupData.projects || []).filter(p =>
            isProblemProject(p) && ((p.name || '').toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term))
        )),
        // FAQ pages from API
        Promise.all([
            fetch('/api/faq/quicklinks').then(r => r.json()).catch(() => ({content: ''})),
            fetch('/api/faq/quickinfo').then(r => r.json()).catch(() => ({content: ''})),
            fetch('/api/faq/logs').then(r => r.json()).catch(() => ({content: ''}))
        ]).then(results => {
            const faqPages = [
                { id: 'nav-faq-quicklinks', name: 'Quick Links', content: results[0].content || '' },
                { id: 'nav-faq-quickinfo', name: 'Quick Info', content: results[1].content || '' },
                { id: 'nav-faq-logs', name: 'Logs', content: results[2].content || '' }
            ];
            return faqPages.filter(p => 
                p.name.toLowerCase().includes(term) ||
                p.content.toLowerCase().includes(term)
            );
        })
    ]).then(([matchingTasks, matchingProjects, matchingProblems, matchingFAQ]) => {
        
        let html = `<div style="display: flex; flex-direction: column; gap: 30px;">`;
        
        // Tasks Results
        html += `
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                    <i class="fa-solid fa-list-check"></i> Tasks (${matchingTasks.length})
                </h3>
                ${matchingTasks.length === 0 ? '<p style="color: var(--fg-6c757d);">No matching tasks</p>' : ''}
                ${matchingTasks.slice(0, 10).map(task => `
                    <div style="padding: 8px 12px; margin-bottom: 6px; border-left: 4px solid #007bff; background-color: var(--bg-f8f9fa); border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                         onclick="renderPage('nav-tasks'); setTimeout(() => { const row = document.querySelector('tr[data-task-id=\\\'${task.id}\\\']'); if(row) { row.scrollIntoView({behavior: 'smooth', block: 'center'}); row.style.backgroundColor = '#fff3cd'; setTimeout(() => row.style.backgroundColor = 'var(--bg-fff)', 2000); } }, 1000);">
                        <div style="font-weight: 600;">${task.title}</div>
                        <div style="font-size: 0.85em; color: var(--fg-6c757d); white-space: nowrap; margin-left: 15px;">
                            ${task.status_name}${task.priority_name ? ` • ${task.priority_name}` : ''}
                        </div>
                    </div>
                `).join('')}
                ${matchingTasks.length > 10 ? `<p style="color: var(--fg-6c757d); font-size: 0.9em;">...and ${matchingTasks.length - 10} more</p>` : ''}
            </div>
        `;
        
        // Projects Results
        html += `
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                    <i class="fa-solid fa-diagram-project"></i> Projects (${matchingProjects.length})
                </h3>
                ${matchingProjects.length === 0 ? '<p style="color: var(--fg-6c757d);">No matching projects</p>' : ''}
                ${matchingProjects.map(project => {
                    const projectTasks = allTasks.filter(t => t.project_id === project.prj_id && t.is_archived === 0);
                    return `
                        <div style="padding: 12px; margin-bottom: 10px; border-left: 4px solid #28a745; background-color: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;"
                             onclick="navigateToProject('${project.prj_id}')">
                            <div style="font-weight: 600; margin-bottom: 5px;">${project.name}</div>
                            <div style="font-size: 0.85em; color: var(--fg-6c757d);">
                                ${projectTasks.length} tasks
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Problems Results
        html += `
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                    <i class="fa-solid fa-circle-exclamation"></i> Problems (${matchingProblems.length})
                </h3>
                ${matchingProblems.length === 0 ? '<p style="color: var(--fg-6c757d);">No matching problems</p>' : ''}
                ${matchingProblems.map(problem => `
                    <div style="padding: 12px; margin-bottom: 10px; border-left: 4px solid #dc3545; background-color: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;"
                         onclick="window.selectedProblemId='${problem.prj_id}'; renderPage('nav-problems');">
                        <div style="font-weight: 600; margin-bottom: 5px;">${escapeHtml(problem.name)}</div>
                        ${problem.description ? `<div style="font-size: 0.85em; color: var(--fg-6c757d);">${escapeHtml(problem.description).substring(0, 120)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        // FAQ Results
        html += `
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: var(--fg-212529);">
                    <i class="fa-solid fa-circle-info"></i> Quick Links / Quick Info / Logs (${matchingFAQ.length})
                </h3>
                ${matchingFAQ.length === 0 ? '<p style="color: var(--fg-6c757d);">No matches</p>' : ''}
                ${matchingFAQ.map(page => {
                    const preview = page.content ? page.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '';
                    return `
                        <div style="padding: 12px; margin-bottom: 10px; border-left: 4px solid #ffc107; background-color: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer;"
                             onclick="renderPage('${page.id}')">
                            <div style="font-weight: 600; margin-bottom: 5px;">${page.name}</div>
                            ${preview ? `<div style="font-size: 0.85em; color: var(--fg-6c757d);">${preview}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        html += `</div>`;
        
        resultsContainer.innerHTML = html;
    });
}

/**
 * Handle global search input (deprecated - kept for compatibility)
 */
function handleGlobalSearch(searchTerm) {
    performSearch(searchTerm);
}

let dataManagementState = {
    currentHierarchy: 'category',
    selectedTask: null,
    currentTab: 'properties', // properties, category, dates
    isEditMode: false, // Track if in edit mode
    tasks: [],
    navWidth: 300,
    isResizing: false,
    collapsed: {}, // Track which sections are collapsed
    searchQuery: '', // Search query for navigation tree
    projectFilter: '', // Filter tasks by project ID
    taskGroupFilter: '', // Filter tasks by task group
    hideCompleted: false, // Hide completed tasks
    navigationContext: {  // Track current selection context for Add Task
        categoryId: null,
        categoryName: null,
        subcategoryId: null,
        subcategoryName: null,
        projectId: null,
        projectName: null,
        groupId: null,
        groupName: null
    }
};

/**
 * Initialize Data Management Page
 */
function initializeDataManagementPage() {
    console.log('Initializing Data Management Page...');
    
    // Load both tasks and lookups
    Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json())
    ])
        .then(([tasks, lookups]) => {
            dataManagementState.tasks = tasks;
            lookupData = lookups; // Ensure lookupData is loaded
            console.log('Data Management loaded:', { 
                tasks: tasks.length, 
                statuses: lookupData.lkp_status?.length,
                priorities: lookupData.lkp_priority?.length
            });
            renderDataManagementPage();
            initializeResizer();
        })
        .catch(error => {
            console.error('Error loading data management page:', error);
            document.getElementById('data-management-container').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p style="color: red;">Error loading data management page</p>
                </div>
            `;
        });
}

/**
 * Render the Data Management Page with resizable 3-panel layout
 */
function renderDataManagementPage() {
    const container = document.getElementById('data-management-container');
    
    if (!container) {
        console.error('data-management-container not found!');
        return;
    }
    
    // Normal 3-panel layout
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; background: var(--bg-f5f7fa); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <!-- Top Bar with Hierarchy Tabs -->
            <div style="background: var(--bg-fff); border-bottom: 1px solid var(--bd-dee2e6); padding: 12px 20px; display: flex; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); align-items: center;">
                <button onclick="changeHierarchy('category')" 
                        class="hierarchy-tab"
                        style="padding: 10px 18px; border: none; background: ${dataManagementState.currentHierarchy === 'category' ? '#007bff' : 'var(--bg-fff)'}; 
                               color: ${dataManagementState.currentHierarchy === 'category' ? 'white' : 'var(--fg-6c757d)'}; 
                               border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; 
                               border: 1px solid ${dataManagementState.currentHierarchy === 'category' ? '#007bff' : 'var(--bd-dee2e6)'};
                               transition: all 0.2s;">
                    Category
                </button>
                <button onclick="changeHierarchy('subcategory')" 
                        class="hierarchy-tab"
                        style="padding: 10px 18px; border: none; background: ${dataManagementState.currentHierarchy === 'subcategory' ? '#007bff' : 'var(--bg-fff)'}; 
                               color: ${dataManagementState.currentHierarchy === 'subcategory' ? 'white' : 'var(--fg-6c757d)'}; 
                               border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; 
                               border: 1px solid ${dataManagementState.currentHierarchy === 'subcategory' ? '#007bff' : 'var(--bd-dee2e6)'};
                               transition: all 0.2s;">
                    Sub-Category
                </button>
                <button onclick="changeHierarchy('project')" 
                        class="hierarchy-tab"
                        style="padding: 10px 18px; border: none; background: ${dataManagementState.currentHierarchy === 'project' ? '#007bff' : 'var(--bg-fff)'}; 
                               color: ${dataManagementState.currentHierarchy === 'project' ? 'white' : 'var(--fg-6c757d)'}; 
                               border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; 
                               border: 1px solid ${dataManagementState.currentHierarchy === 'project' ? '#007bff' : 'var(--bd-dee2e6)'};
                               transition: all 0.2s;">
                    Task Projects
                </button>
                <button onclick="changeHierarchy('group')" 
                        class="hierarchy-tab"
                        style="padding: 10px 18px; border: none; background: ${dataManagementState.currentHierarchy === 'group' ? '#007bff' : 'var(--bg-fff)'}; 
                               color: ${dataManagementState.currentHierarchy === 'group' ? 'white' : 'var(--fg-6c757d)'}; 
                               border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; 
                               border: 1px solid ${dataManagementState.currentHierarchy === 'group' ? '#007bff' : 'var(--bd-dee2e6)'};
                               transition: all 0.2s;">
                    Task Groups
                </button>
                <button onclick="changeHierarchy('tasks')" 
                        class="hierarchy-tab"
                        style="padding: 10px 18px; border: none; background: ${dataManagementState.currentHierarchy === 'tasks' ? '#007bff' : 'var(--bg-fff)'}; 
                               color: ${dataManagementState.currentHierarchy === 'tasks' ? 'white' : 'var(--fg-6c757d)'}; 
                               border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; 
                               border: 1px solid ${dataManagementState.currentHierarchy === 'tasks' ? '#007bff' : 'var(--bd-dee2e6)'};
                               transition: all 0.2s;">
                    Tasks
                </button>
                
                <!-- Spacer to push controls to the right -->
                <div style="flex: 1;"></div>
                
                <!-- Task Group Filter -->
                <div style="position: relative;">
                    <select id="data-taskgroup-filter" 
                            onchange="filterByTaskGroup(this.value)"
                            style="padding: 10px 35px 10px 15px; border: 1px solid var(--bd-ced4da); border-radius: 6px; 
                                   font-size: 14px; cursor: pointer; background: var(--bg-fff); appearance: none;
                                   background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e');
                                   background-repeat: no-repeat; background-position: right 10px center; background-size: 16px;">
                        <option value="">All Task Groups</option>
                        ${[...new Set(allTasks.map(t => t.task_group).filter(g => g))].sort().map(g => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                </div>
                
                <!-- Project Filter with Search -->
                <div style="position: relative;">
                    <select id="data-project-filter" 
                            onchange="filterByProject(this.value)"
                            style="padding: 10px 35px 10px 15px; border: 1px solid var(--bd-ced4da); border-radius: 6px; 
                                   font-size: 14px; cursor: pointer; background: var(--bg-fff); appearance: none;
                                   background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e');
                                   background-repeat: no-repeat; background-position: right 10px center; background-size: 16px;">
                        <option value="">All Projects</option>
                        ${(lookupData.projects || []).sort((a, b) => a.name.localeCompare(b.name)).map(p => `<option value="${p.prj_id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                
                <!-- Hide Completed Tasks Button -->
                <button onclick="toggleHideCompletedData()" 
                        style="padding: 10px 20px; background: ${dataManagementState.hideCompleted ? '#28a745' : '#6c757d'}; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;
                               transition: all 0.2s;"
                        onmouseover="this.style.opacity='0.9'"
                        onmouseout="this.style.opacity='1'">
                    <i class="fa-solid fa-eye${dataManagementState.hideCompleted ? '-slash' : ''}"></i>
                    Completed Tasks
                </button>
                
                <!-- Add Task Button -->
                <button onclick="openDataAddTaskModal()" 
                        style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;
                               box-shadow: 0 2px 4px rgba(40,167,69,0.2); transition: all 0.2s;"
                        onmouseover="this.style.background='#218838'; this.style.boxShadow='0 4px 8px rgba(40,167,69,0.3)'" 
                        onmouseout="this.style.background='#28a745'; this.style.boxShadow='0 2px 4px rgba(40,167,69,0.2)'">
                    <i class="fa-solid fa-plus"></i> Add Task
                </button>
            </div>
            
            <!-- Main 3-Panel Layout -->
            <div style="display: flex; flex: 1; overflow: hidden;">
                <!-- Left: Navigation Tree (Resizable) with Search -->
                <div style="width: ${dataManagementState.navWidth}px; background: var(--bg-fff); border-right: 1px solid var(--bd-dee2e6); display: flex; flex-direction: column;">
                    <!-- Search Bar -->
                    <div style="padding: 15px; border-bottom: 1px solid var(--bd-dee2e6); background: var(--bg-f8f9fa);">
                        <input type="text" 
                               id="data-nav-search" 
                               placeholder="Search tasks and categories..." 
                               oninput="filterNavigationTree(this.value)"
                               style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-ced4da); border-radius: 6px; 
                                      font-size: 14px; outline: none; transition: border-color 0.2s;"
                               onfocus="this.style.borderColor='#007bff'" 
                               onblur="this.style.borderColor='var(--bd-ced4da)'">
                    </div>
                    
                    <!-- Navigation Tree Content -->
                    <div id="data-nav-tree" style="flex: 1; overflow-y: auto; padding: 20px;">
                        ${renderNavigationTree()}
                    </div>
                </div>
                
                <!-- Resizer Handle -->
                <div id="data-resizer" style="width: 5px; background: var(--bg-e9ecef); cursor: col-resize; position: relative; z-index: 10;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 2px; height: 40px; background: #adb5bd; border-radius: 1px;"></div>
                </div>
                
                <!-- Center: Detail View (Editable) -->
                <div id="data-detail-view" style="flex: 1; background: var(--bg-fff); overflow-y: auto; padding: 30px;">
                    ${renderDetailView()}
                </div>
                
                <!-- Right: Properties Panel with Tabs -->
                <div id="data-properties-panel" style="width: 300px; background: var(--bg-fff); border-left: 1px solid var(--bd-dee2e6); overflow-y: auto;">
                    ${renderPropertiesPanel()}
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize resizer for navigation panel
 */
function initializeResizer() {
    const resizer = document.getElementById('data-resizer');
    const navTree = document.getElementById('data-nav-tree');
    
    if (!resizer || !navTree) return;
    
    resizer.addEventListener('mousedown', (e) => {
        dataManagementState.isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!dataManagementState.isResizing) return;
        
        const newWidth = e.clientX - navTree.getBoundingClientRect().left;
        if (newWidth >= 200 && newWidth <= 600) {
            dataManagementState.navWidth = newWidth;
            navTree.style.width = newWidth + 'px';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (dataManagementState.isResizing) {
            dataManagementState.isResizing = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    });
}

/**
 * Change hierarchy view
 */
function changeHierarchy(hierarchy) {
    dataManagementState.currentHierarchy = hierarchy;
    dataManagementState.selectedTask = null;
    renderDataManagementPage();
    initializeResizer();
}

/**
 * Render navigation tree based on current hierarchy
 */
function renderNavigationTree() {
    let tasks = dataManagementState.tasks.filter(t => !t.is_deleted && !t.is_archived);
    
    // Apply hide completed filter
    if (dataManagementState.hideCompleted) {
        tasks = tasks.filter(t => t.status_name !== 'Done');
    }
    
    // Apply project filter
    const projectFilter = dataManagementState.projectFilter;
    if (projectFilter) {
        tasks = tasks.filter(t => t.project_id === projectFilter);
    }
    
    // Apply task group filter
    const taskGroupFilter = dataManagementState.taskGroupFilter;
    if (taskGroupFilter) {
        tasks = tasks.filter(t => t.task_group === taskGroupFilter);
    }
    
    // Apply search filter
    const searchQuery = dataManagementState.searchQuery;
    if (searchQuery) {
        tasks = tasks.filter(t => taskMatchesSearch(t, searchQuery));
    }
    
    if (dataManagementState.currentHierarchy === 'category') {
        return renderCategoryTree(tasks);
    } else if (dataManagementState.currentHierarchy === 'subcategory') {
        return renderSubcategoryTree(tasks);
    } else if (dataManagementState.currentHierarchy === 'project') {
        return renderProjectTree(tasks);
    } else if (dataManagementState.currentHierarchy === 'group') {
        return renderGroupTree(tasks);
    } else {
        return renderTasksList(tasks);
    }
}

/**
 * Render Category > Subcategory > Project > Group > Tasks tree
 * Skips levels that don't exist for a task
 */
function renderCategoryTree(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
        const catId = task.category_id || 'uncategorized';
        const catName = lookupData.categories?.find(c => c.cat_id === catId)?.name || 'Uncategorized';
        
        if (!grouped[catId]) grouped[catId] = { name: catName, items: {} };
        
        // Build full path: cat > subcat > proj > group
        const subCatId = task.subcategory_id || 'none';
        const subCatName = lookupData.subcategories?.find(sc => sc.scat_id === subCatId)?.name || 'No Subcategory';
        
        const projectId = task.project_id || 'none';
        const projectName = lookupData.projects?.find(p => p.prj_id === projectId)?.name || 'No Project';
        
        const groupId = task.task_group || 'none';
        const groupName = groupId !== 'none' ? groupId : 'No Group';
        
        // Create nested structure
        const pathKey = `${subCatId}|${projectId}|${groupId}`;
        if (!grouped[catId].items[pathKey]) {
            grouped[catId].items[pathKey] = {
                subCatId, subCatName,
                projectId, projectName,
                groupId, groupName,
                tasks: []
            };
        }
        
        grouped[catId].items[pathKey].tasks.push(task);
    });
    
    let html = '<div style="font-size: 14px; color: var(--fg-212529);">';
    
    Object.entries(grouped).forEach(([catId, category]) => {
        const catCollapsed = dataManagementState.collapsed[`cat-${catId}`] !== undefined ? dataManagementState.collapsed[`cat-${catId}`] : true;
        html += `
            <div style="margin-bottom: 6px;">
                <div onclick="setContextCategory('${catId}', '${category.name.replace(/'/g, "\\'")}'); toggleCollapse('cat-${catId}');" 
                     style="font-weight: 600; color: var(--fg-212529); margin-bottom: 4px; cursor: pointer; 
                            display: flex; align-items: center; gap: 8px; padding: 4px; border-radius: 4px;
                            transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                     onmouseout="this.style.background='transparent'">
                    <i class="fa-solid fa-chevron-${catCollapsed ? 'right' : 'down'}" style="font-size: 10px; color: var(--fg-6c757d);"></i>
                    <i class="fa-solid fa-folder" style="color: #007bff;"></i>
                    <span>${category.name}</span>
                </div>
                <div id="cat-${catId}" style="margin-left: 20px; display: ${catCollapsed ? 'none' : 'block'};">
        `;
        
        // Group by subcategory first
        const bySubcat = {};
        Object.entries(category.items).forEach(([pathKey, item]) => {
            if (!bySubcat[item.subCatId]) bySubcat[item.subCatId] = { name: item.subCatName, items: [] };
            bySubcat[item.subCatId].items.push(item);
        });
        
        Object.entries(bySubcat).forEach(([subCatId, subcat]) => {
            const subCatCollapsed = dataManagementState.collapsed[`subcat-${subCatId}`] !== undefined ? dataManagementState.collapsed[`subcat-${subCatId}`] : true;
            html += `
                <div style="margin-bottom: 4px;">
                    <div onclick="setContextSubcategory('${subCatId}', '${subcat.name.replace(/'/g, "\\'")}', '${catId}', '${category.name.replace(/'/g, "\\'")}'); toggleCollapse('subcat-${subCatId}');" 
                         style="font-weight: 500; color: var(--fg-495057); margin-bottom: 4px; cursor: pointer; 
                                display: flex; align-items: center; gap: 7px; padding: 3px; border-radius: 4px;
                                transition: background 0.2s;"
                         onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                         onmouseout="this.style.background='transparent'">
                        <i class="fa-solid fa-chevron-${subCatCollapsed ? 'right' : 'down'}" style="font-size: 9px; color: var(--fg-6c757d);"></i>
                        <i class="fa-solid fa-folder-open" style="color: #28a745;"></i>
                        <span>${subcat.name}</span>
                    </div>
                    <div id="subcat-${subCatId}" style="margin-left: 20px; display: ${subCatCollapsed ? 'none' : 'block'};">
            `;
            
            // Group by project
            const byProject = {};
            subcat.items.forEach(item => {
                if (!byProject[item.projectId]) byProject[item.projectId] = { name: item.projectName, items: [] };
                byProject[item.projectId].items.push(item);
            });
            
            Object.entries(byProject).forEach(([projectId, proj]) => {
                const projCollapsed = dataManagementState.collapsed[`proj-${projectId}`] !== undefined ? dataManagementState.collapsed[`proj-${projectId}`] : true;
                
                // Skip "No Project" level if only one group with "No Group"
                if (projectId === 'none' && proj.items.length === 1 && proj.items[0].groupId === 'none') {
                    // Render tasks directly
                    proj.items[0].tasks.forEach(task => {
                        const isSelected = dataManagementState.selectedTask?.id === task.id;
                        html += `
                            <div onclick="selectTask(${task.id})" 
                                 style="cursor: pointer; padding: 6px 8px; border-radius: 4px; 
                                        background: ${isSelected ? 'var(--bg-e7f3ff)' : 'transparent'}; 
                                        color: ${isSelected ? 'var(--fg-0056b3)' : 'var(--fg-495057)'}; 
                                        margin-bottom: 3px; display: flex; align-items: center; gap: 6px;
                                        transition: all 0.2s; font-weight: ${isSelected ? '500' : '400'};"
                                 onmouseover="if(!${isSelected}) this.style.background='var(--bg-f8f9fa)'"
                                 onmouseout="if(!${isSelected}) this.style.background='transparent'">
                                <i class="fa-solid fa-file" style="font-size: 12px;"></i>
                                <span>${task.title}</span>
                            </div>
                        `;
                    });
                } else {
                    html += `
                        <div style="margin-bottom: 8px;">
                            <div onclick="setContextProject('${projectId}', '${proj.name.replace(/'/g, "\\'")}', '${subCatId}', '${subcat.name.replace(/'/g, "\\'")}', '${catId}', '${category.name.replace(/'/g, "\\'")}'); toggleCollapse('proj-${projectId}');" 
                                 style="font-weight: 500; color: var(--fg-6c757d); margin-bottom: 3px; cursor: pointer; 
                                        display: flex; align-items: center; gap: 6px; padding: 2px; border-radius: 4px;
                                        transition: background 0.2s;"
                                 onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                                 onmouseout="this.style.background='transparent'">
                                <i class="fa-solid fa-chevron-${projCollapsed ? 'right' : 'down'}" style="font-size: 9px;"></i>
                                <i class="fa-solid fa-diagram-project" style="color: #fd7e14;"></i>
                                <span>${proj.name}</span>
                            </div>
                            <div id="proj-${projectId}" style="margin-left: 20px; display: ${projCollapsed ? 'none' : 'block'};">
                    `;
                    
                    // Now groups
                    proj.items.forEach(item => {
                        const groupCollapsed = dataManagementState.collapsed[`group-${item.groupId}`] !== undefined ? dataManagementState.collapsed[`group-${item.groupId}`] : true;
                        
                        // Skip "No Group" level if no group
                        if (item.groupId === 'none') {
                            item.tasks.forEach(task => {
                                const isSelected = dataManagementState.selectedTask?.id === task.id;
                                html += `
                                    <div onclick="selectTask(${task.id})" 
                                         style="cursor: pointer; padding: 6px 8px; border-radius: 4px; 
                                                background: ${isSelected ? 'var(--bg-e7f3ff)' : 'transparent'}; 
                                                color: ${isSelected ? 'var(--fg-0056b3)' : 'var(--fg-495057)'}; 
                                                margin-bottom: 3px; display: flex; align-items: center; gap: 6px;
                                                transition: all 0.2s; font-weight: ${isSelected ? '500' : '400'};"
                                         onmouseover="if(!${isSelected}) this.style.background='var(--bg-f8f9fa)'"
                                         onmouseout="if(!${isSelected}) this.style.background='transparent'">
                                        <i class="fa-solid fa-file" style="font-size: 12px;"></i>
                                        <span>${task.title}</span>
                                    </div>
                                `;
                            });
                        } else {
                            html += `
                                <div style="margin-bottom: 6px;">
                                    <div onclick="setContextGroup('${item.groupId}', '${item.groupName.replace(/'/g, "\\'")}', '${projectId}', '${proj.name.replace(/'/g, "\\'")}', '${subCatId}', '${subcat.name.replace(/'/g, "\\'")}', '${catId}', '${category.name.replace(/'/g, "\\'")}'); toggleCollapse('group-${item.groupId}');" 
                                         style="font-weight: 400; color: var(--fg-868e96); margin-bottom: 2px; cursor: pointer; 
                                                display: flex; align-items: center; gap: 6px; padding: 2px; border-radius: 4px;
                                                transition: background 0.2s;"
                                         onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                                         onmouseout="this.style.background='transparent'">
                                        <i class="fa-solid fa-chevron-${groupCollapsed ? 'right' : 'down'}" style="font-size: 8px;"></i>
                                        <i class="fa-solid fa-layer-group" style="color: var(--fg-6f42c1);"></i>
                                        <span>${item.groupName}</span>
                                    </div>
                                    <div id="group-${item.groupId}" style="margin-left: 18px; display: ${groupCollapsed ? 'none' : 'block'};">
                            `;
                            
                            item.tasks.forEach(task => {
                                const isSelected = dataManagementState.selectedTask?.id === task.id;
                                html += `
                                    <div onclick="selectTask(${task.id})" 
                                         style="cursor: pointer; padding: 6px 8px; border-radius: 4px; 
                                                background: ${isSelected ? 'var(--bg-e7f3ff)' : 'transparent'}; 
                                                color: ${isSelected ? 'var(--fg-0056b3)' : 'var(--fg-495057)'}; 
                                                margin-bottom: 3px; display: flex; align-items: center; gap: 6px;
                                                transition: all 0.2s; font-weight: ${isSelected ? '500' : '400'};"
                                         onmouseover="if(!${isSelected}) this.style.background='var(--bg-f8f9fa)'"
                                         onmouseout="if(!${isSelected}) this.style.background='transparent'">
                                        <i class="fa-solid fa-file" style="font-size: 12px;"></i>
                                        <span>${task.title}</span>
                                    </div>
                                `;
                            });
                            
                            html += '</div></div>';
                        }
                    });
                    
                    html += '</div></div>';
                }
            });
            
            html += '</div></div>';
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    return html;
}

/**
 * Render Subcategory > Project > Tasks tree
 */
function renderSubcategoryTree(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
        const subCatId = task.subcategory_id || 'none';
        const subCatName = lookupData.subcategories?.find(sc => sc.scat_id === subCatId)?.name || 'No Subcategory';
        
        if (!grouped[subCatId]) grouped[subCatId] = { name: subCatName, projects: {} };
        
        const projectId = task.project_id || 'none';
        const projectName = lookupData.projects?.find(p => p.prj_id === projectId)?.name || 'No Project';
        
        const groupId = task.task_group || 'none';
        const groupName = groupId !== 'none' ? groupId : 'No Group';
        
        const pathKey = `${projectId}|${groupId}`;
        if (!grouped[subCatId].projects[pathKey]) {
            grouped[subCatId].projects[pathKey] = { 
                projectId, projectName, 
                groupId, groupName,
                tasks: [] 
            };
        }
        
        grouped[subCatId].projects[pathKey].tasks.push(task);
    });
    
    let html = '<div style="font-size: 14px;">';
    
    Object.entries(grouped).forEach(([subCatId, subcategory]) => {
        const subCatCollapsed = dataManagementState.collapsed[`subcat-${subCatId}`] !== undefined ? dataManagementState.collapsed[`subcat-${subCatId}`] : true;
        html += `
            <div style="margin-bottom: 4px;">
                <div onclick="setContextSubcategory('${subCatId}', '${subcategory.name.replace(/'/g, "\\'")}', null, null); toggleCollapse('subcat-${subCatId}');" 
                     style="font-weight: bold; color: var(--fg-2c3e50); margin-bottom: 5px; cursor: pointer; 
                            display: flex; align-items: center; gap: 8px; padding: 4px; border-radius: 4px;
                            transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                     onmouseout="this.style.background='transparent'">
                    <i class="fa-solid fa-chevron-${subCatCollapsed ? 'right' : 'down'}" style="font-size: 10px; color: var(--fg-6c757d);"></i>
                    <i class="fa-solid fa-folder-open" style="color: #28a745;"></i>
                    <span>${subcategory.name}</span>
                </div>
                <div id="subcat-${subCatId}" style="margin-left: 20px; display: ${subCatCollapsed ? 'none' : 'block'};">
        `;
        
        // Group by project first
        const byProject = {};
        Object.values(subcategory.projects).forEach(item => {
            if (!byProject[item.projectId]) byProject[item.projectId] = { name: item.projectName, groups: [] };
            byProject[item.projectId].groups.push(item);
        });
        
        Object.entries(byProject).forEach(([projectId, project]) => {
            const projCollapsed = dataManagementState.collapsed[`proj-${projectId}`] !== undefined ? dataManagementState.collapsed[`proj-${projectId}`] : true;
            html += `
                <div style="margin-bottom: 5px;">
                    <div onclick="setContextProject('${projectId}', '${project.name.replace(/'/g, "\\'")}', '${subCatId}', '${subcategory.name.replace(/'/g, "\\'")}', null, null); toggleCollapse('proj-${projectId}');" 
                         style="color: var(--fg-34495e); margin-bottom: 2px; cursor: pointer; 
                                display: flex; align-items: center; gap: 6px; padding: 3px; border-radius: 4px;
                                transition: background 0.2s;"
                         onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                         onmouseout="this.style.background='transparent'">
                        <i class="fa-solid fa-chevron-${projCollapsed ? 'right' : 'down'}" style="font-size: 9px; color: var(--fg-6c757d);"></i>
                        <i class="fa-solid fa-diagram-project" style="color: #fd7e14;"></i>
                        <span>${project.name}</span>
                    </div>
                    <div id="proj-${projectId}" style="margin-left: 20px; display: ${projCollapsed ? 'none' : 'block'};">
            `;
            
            // Now render groups
            project.groups.forEach(item => {
                if (item.groupId === 'none') {
                    // No group - render tasks directly
                    item.tasks.forEach(task => {
                        const isSelected = dataManagementState.selectedTask?.id === task.id;
                        html += `
                            <div onclick="selectTask(${task.id})" 
                                 style="cursor: pointer; padding: 3px 5px; border-radius: 3px; 
                                        background: ${isSelected ? 'var(--bg-e3f2fd)' : 'transparent'}; 
                                        color: ${isSelected ? 'var(--fg-1976d2)' : 'var(--fg-7f8c8d)'}; margin-bottom: 2px;">
                                <i class="fa-solid fa-file"></i> ${task.title}
                            </div>
                        `;
                    });
                } else {
                    // Has group - render group level
                    const groupCollapsed = dataManagementState.collapsed[`group-${item.groupId}`] !== undefined ? dataManagementState.collapsed[`group-${item.groupId}`] : true;
                    html += `
                        <div style="margin-bottom: 4px;">
                            <div onclick="toggleCollapse('group-${item.groupId}');" 
                                 style="color: var(--fg-868e96); margin-bottom: 2px; cursor: pointer; 
                                        display: flex; align-items: center; gap: 6px; padding: 2px; border-radius: 4px;
                                        transition: background 0.2s;"
                                 onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                                 onmouseout="this.style.background='transparent'">
                                <i class="fa-solid fa-chevron-${groupCollapsed ? 'right' : 'down'}" style="font-size: 8px; color: var(--fg-6c757d);"></i>
                                <i class="fa-solid fa-layer-group" style="color: var(--fg-6f42c1);"></i>
                                <span>${item.groupName}</span>
                            </div>
                            <div id="group-${item.groupId}" style="margin-left: 18px; display: ${groupCollapsed ? 'none' : 'block'};">
                    `;
                    
                    item.tasks.forEach(task => {
                        const isSelected = dataManagementState.selectedTask?.id === task.id;
                        html += `
                            <div onclick="selectTask(${task.id})" 
                                 style="cursor: pointer; padding: 3px 5px; border-radius: 3px; 
                                        background: ${isSelected ? 'var(--bg-e3f2fd)' : 'transparent'}; 
                                        color: ${isSelected ? 'var(--fg-1976d2)' : 'var(--fg-7f8c8d)'}; margin-bottom: 2px;">
                                <i class="fa-solid fa-file"></i> ${task.title}
                            </div>
                        `;
                    });
                    
                    html += '</div></div>';
                }
            });
            
            html += '</div></div>';
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    return html;
}

/**
 * Render Project > Tasks tree
 */
function renderProjectTree(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
        const projectId = task.project_id || 'none';
        const projectName = lookupData.projects?.find(p => p.prj_id === projectId)?.name || 'No Project';
        
        const groupId = task.task_group || 'none';
        const groupName = groupId !== 'none' ? groupId : 'No Group';
        
        const pathKey = `${projectId}|${groupId}`;
        if (!grouped[pathKey]) {
            grouped[pathKey] = { 
                projectId, projectName,
                groupId, groupName,
                tasks: []
            };
        }
        grouped[pathKey].tasks.push(task);
    });
    
    let html = '<div style="font-size: 14px;">';
    
    // Group by project first
    const byProject = {};
    Object.values(grouped).forEach(item => {
        if (!byProject[item.projectId]) byProject[item.projectId] = { name: item.projectName, groups: [] };
        byProject[item.projectId].groups.push(item);
    });
    
    Object.entries(byProject).forEach(([projectId, project]) => {
        const projCollapsed = dataManagementState.collapsed[`proj-${projectId}`] !== undefined ? dataManagementState.collapsed[`proj-${projectId}`] : true;
        html += `
            <div style="margin-bottom: 4px;">
                <div onclick="setContextProject('${projectId}', '${project.name.replace(/'/g, "\\'")}', null, null, null, null); toggleCollapse('proj-${projectId}');" 
                     style="font-weight: bold; color: var(--fg-2c3e50); margin-bottom: 5px; cursor: pointer; 
                            display: flex; align-items: center; gap: 8px; padding: 4px; border-radius: 4px;
                            transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                     onmouseout="this.style.background='transparent'">
                    <i class="fa-solid fa-chevron-${projCollapsed ? 'right' : 'down'}" style="font-size: 10px; color: var(--fg-6c757d);"></i>
                    <i class="fa-solid fa-diagram-project" style="color: #fd7e14;"></i>
                    <span>${project.name}</span>
                </div>
                <div id="proj-${projectId}" style="margin-left: 20px; display: ${projCollapsed ? 'none' : 'block'};">
        `;
        
        // Now render groups
        project.groups.forEach(item => {
            if (item.groupId === 'none') {
                // No group - render tasks directly
                item.tasks.forEach(task => {
                    const isSelected = dataManagementState.selectedTask?.id === task.id;
                    html += `
                        <div onclick="selectTask(${task.id})" 
                             style="cursor: pointer; padding: 3px 5px; border-radius: 3px; 
                                    background: ${isSelected ? 'var(--bg-e3f2fd)' : 'transparent'}; 
                                    color: ${isSelected ? 'var(--fg-1976d2)' : 'var(--fg-7f8c8d)'}; margin-bottom: 2px;">
                            <i class="fa-solid fa-file"></i> ${task.title}
                        </div>
                    `;
                });
            } else {
                // Has group - render group level
                const groupCollapsed = dataManagementState.collapsed[`group-${item.groupId}`] !== undefined ? dataManagementState.collapsed[`group-${item.groupId}`] : true;
                html += `
                    <div style="margin-bottom: 4px;">
                        <div onclick="toggleCollapse('group-${item.groupId}');" 
                             style="color: var(--fg-868e96); margin-bottom: 2px; cursor: pointer; 
                                    display: flex; align-items: center; gap: 6px; padding: 2px; border-radius: 4px;
                                    transition: background 0.2s;"
                             onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                             onmouseout="this.style.background='transparent'">
                            <i class="fa-solid fa-chevron-${groupCollapsed ? 'right' : 'down'}" style="font-size: 8px; color: var(--fg-6c757d);"></i>
                            <i class="fa-solid fa-layer-group" style="color: var(--fg-6f42c1);"></i>
                            <span>${item.groupName}</span>
                        </div>
                        <div id="group-${item.groupId}" style="margin-left: 18px; display: ${groupCollapsed ? 'none' : 'block'};">
                `;
                
                item.tasks.forEach(task => {
                    const isSelected = dataManagementState.selectedTask?.id === task.id;
                    html += `
                        <div onclick="selectTask(${task.id})" 
                             style="cursor: pointer; padding: 3px 5px; border-radius: 3px; 
                                    background: ${isSelected ? 'var(--bg-e3f2fd)' : 'transparent'}; 
                                    color: ${isSelected ? 'var(--fg-1976d2)' : 'var(--fg-7f8c8d)'}; margin-bottom: 2px;">
                            <i class="fa-solid fa-file"></i> ${task.title}
                        </div>
                    `;
                });
                
                html += '</div></div>';
            }
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    return html;
}

/**
 * Render Task Groups > Tasks tree (using service_component as group field)
 */
function renderGroupTree(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
        const groupName = task.task_group || 'No Group';
        
        if (!grouped[groupName]) grouped[groupName] = [];
        grouped[groupName].push(task);
    });
    
    let html = '<div style="font-size: 14px;">';
    
    Object.entries(grouped).forEach(([groupName, groupTasks]) => {
        const groupCollapsed = dataManagementState.collapsed[`group-${groupName}`] !== undefined ? dataManagementState.collapsed[`group-${groupName}`] : true;
        html += `
            <div style="margin-bottom: 4px;">
                <div onclick="setContextGroup(null, '${groupName.replace(/'/g, "\\'")}', null, null, null, null, null, null); toggleCollapse('group-${groupName}');" 
                     style="font-weight: bold; color: var(--fg-2c3e50); margin-bottom: 5px; cursor: pointer; 
                            display: flex; align-items: center; gap: 8px; padding: 4px; border-radius: 4px;
                            transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'" 
                     onmouseout="this.style.background='transparent'">
                    <i class="fa-solid fa-chevron-${groupCollapsed ? 'right' : 'down'}" style="font-size: 10px; color: var(--fg-6c757d);"></i>
                    <i class="fa-solid fa-layer-group" style="color: var(--fg-6f42c1);"></i>
                    <span>${groupName}</span>
                </div>
                <div id="group-${groupName}" style="margin-left: 20px; display: ${groupCollapsed ? 'none' : 'block'};">
        `;
        
        groupTasks.forEach(task => {
            const isSelected = dataManagementState.selectedTask?.id === task.id;
            html += `
                <div onclick="selectTask(${task.id})" 
                     style="cursor: pointer; padding: 3px 5px; border-radius: 3px; 
                            background: ${isSelected ? 'var(--bg-e3f2fd)' : 'transparent'}; 
                            color: ${isSelected ? 'var(--fg-1976d2)' : 'var(--fg-7f8c8d)'}; margin-bottom: 2px;">
                    <i class="fa-solid fa-file"></i> ${task.title}
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    return html;
}

/**
 * Render flat tasks list
 */
function renderTasksList(tasks) {
    let html = '<div style="font-size: 14px;">';
    
    tasks.forEach(task => {
        const isSelected = dataManagementState.selectedTask?.id === task.id;
        html += `
            <div onclick="selectTask(${task.id})" 
                 style="cursor: pointer; padding: 5px 8px; border-radius: 3px; 
                        background: ${isSelected ? 'var(--bg-e3f2fd)' : 'transparent'}; 
                        color: ${isSelected ? 'var(--fg-1976d2)' : 'var(--fg-2c3e50)'}; margin-bottom: 3px; 
                        border-left: 3px solid ${isSelected ? '#1976d2' : 'transparent'};">
                <i class="fa-solid fa-file" style="color: var(--fg-6c757d);"></i> ${task.title}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Select a task
 */
function selectTask(taskId) {
    const task = dataManagementState.tasks.find(t => t.id === taskId);
    dataManagementState.selectedTask = task;
    
    // Capture navigation context from the selected task
    if (task) {
        const category = lookupData.categories?.find(c => c.cat_id === task.category_id);
        const subcategory = lookupData.subcategories?.find(sc => sc.scat_id === task.subcategory_id);
        const project = lookupData.projects?.find(p => p.prj_id === task.project_id);
        
        dataManagementState.navigationContext = {
            categoryId: task.category_id || null,
            categoryName: category?.name || null,
            subcategoryId: task.subcategory_id || null,
            subcategoryName: subcategory?.name || null,
            projectId: task.project_id || null,
            projectName: project?.name || null,
            groupId: task.group_id || null,
            groupName: task.task_group || null
        };
    }
    
    document.getElementById('data-detail-view').innerHTML = renderDetailView();
    document.getElementById('data-properties-panel').innerHTML = renderPropertiesPanel();
    
    const navTree = document.getElementById('data-nav-tree');
    navTree.innerHTML = renderNavigationTree();
}

/**
 * Render detail view with inline editing - Only Description and Comments
 */
function renderDetailView() {
    if (!dataManagementState.selectedTask) {
        return `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--fg-95a5a6);">
                <div style="text-align: center;">
                    <i class="fa-solid fa-hand-pointer fa-3x" style="margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; font-weight: 400;">Select a task from the navigation tree</p>
                </div>
            </div>
        `;
    }
    
    const task = dataManagementState.selectedTask;
    
    return `
        <div style="max-width: 900px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <!-- Header with Title and Action Buttons -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--bd-e9ecef);">
                <h2 style="margin: 0; color: var(--fg-212529); font-size: 24px; font-weight: 600;">${task.title}</h2>
                <div style="display: flex; gap: 10px;">
                    <button id="edit-toggle-btn" onclick="toggleEditMode()" 
                            style="padding: 10px 18px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; transition: background 0.2s;">
                        <i class="fa-solid fa-edit"></i> Edit
                    </button>
                    <button id="save-btn" onclick="saveDataTaskChanges()" 
                            style="padding: 10px 18px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; display: none; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; transition: background 0.2s;">
                        <i class="fa-solid fa-save"></i> Save
                    </button>
                    <button onclick="deleteDataTask(${task.id})" 
                            style="padding: 10px 18px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; transition: background 0.2s;">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            
            <!-- Description, Comments, URL, File Fields -->
            <div style="padding-top: 10px;">
                <!-- Description Field -->
                <div style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; color: var(--fg-495057); margin-bottom: 8px; font-size: 15px;">
                        Description
                    </label>
                    <textarea id="edit-description" 
                              readonly
                              style="width: 100%; min-height: 80px; padding: 0; border: none; border-radius: 0; 
                                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                     font-size: 14px; line-height: 1.6; resize: none; background: transparent; color: var(--fg-495057); outline: none;"
                              placeholder="No description">${task.task_description || ''}</textarea>
                </div>
                
                <!-- Comments Field -->
                <div style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; color: var(--fg-495057); margin-bottom: 8px; font-size: 15px;">
                        Comments
                    </label>
                    <textarea id="edit-comments" 
                              readonly
                              style="width: 100%; min-height: 80px; padding: 0; border: none; border-radius: 0; 
                                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                     font-size: 14px; line-height: 1.6; resize: none; background: transparent; color: var(--fg-495057); outline: none;"
                              placeholder="No comments">${task.comments || ''}</textarea>
                </div>
                
                <!-- URL Field -->
                <div style="margin-bottom: 25px;">
                    <label style="display: block; font-weight: 600; color: var(--fg-495057); margin-bottom: 8px; font-size: 15px;">
                        URL
                    </label>
                    <div id="url-display-container">
                        ${task.url ? 
                            `<a href="${task.url}" target="_blank" rel="noopener noreferrer" 
                                style="color: #007bff; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 5px;"
                                onmouseover="this.style.textDecoration='underline'" 
                                onmouseout="this.style.textDecoration='none'">
                                ${task.url} <i class="fa-solid fa-external-link-alt" style="font-size: 12px;"></i>
                             </a>` : 
                            '<span style="color: var(--fg-6c757d); font-size: 14px;">No URL</span>'}
                    </div>
                    <input type="text" id="edit-url" 
                           readonly
                           value="${task.url || ''}"
                           style="width: 100%; padding: 0; border: none; border-radius: 0; display: none;
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                  font-size: 14px; background: transparent; color: #007bff; outline: none;"
                           placeholder="Enter URL">
                </div>
                
                <!-- File Field -->
                <div style="margin-bottom: 0;">
                    <label style="display: block; font-weight: 600; color: var(--fg-495057); margin-bottom: 8px; font-size: 15px;">
                        File
                    </label>
                    <input type="text" id="edit-file" 
                           readonly
                           value="${task.file || ''}"
                           style="width: 100%; padding: 0; border: none; border-radius: 0; 
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                  font-size: 14px; background: transparent; color: var(--fg-495057); outline: none;"
                           placeholder="No file">
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle edit mode for task information
 */
function toggleEditMode() {
    const descField = document.getElementById('edit-description');
    const commentsField = document.getElementById('edit-comments');
    const urlField = document.getElementById('edit-url');
    const urlDisplay = document.getElementById('url-display-container');
    const fileField = document.getElementById('edit-file');
    const editBtn = document.getElementById('edit-toggle-btn');
    const saveBtn = document.getElementById('save-btn');
    const propertyInputs = document.querySelectorAll('.property-input');
    
    const isReadOnly = descField.hasAttribute('readonly');
    
    if (isReadOnly) {
        // Switch to EDIT mode
        dataManagementState.isEditMode = true;  // Track edit state
        
        descField.removeAttribute('readonly');
        commentsField.removeAttribute('readonly');
        urlField.removeAttribute('readonly');
        fileField.removeAttribute('readonly');
        
        // Show URL input, hide display
        urlField.style.display = 'block';
        urlDisplay.style.display = 'none';
        
        // Show borders and padding in edit mode
        descField.style.padding = '14px';
        descField.style.border = '1px solid var(--bd-dee2e6)';
        descField.style.borderRadius = '6px';
        descField.style.background = 'var(--bg-fff)';
        descField.style.resize = 'vertical';
        descField.style.minHeight = '150px';
        
        commentsField.style.padding = '14px';
        commentsField.style.border = '1px solid var(--bd-dee2e6)';
        commentsField.style.borderRadius = '6px';
        commentsField.style.background = 'var(--bg-fff)';
        commentsField.style.resize = 'vertical';
        commentsField.style.minHeight = '150px';
        
        urlField.style.padding = '10px 14px';
        urlField.style.border = '1px solid var(--bd-dee2e6)';
        urlField.style.borderRadius = '6px';
        urlField.style.background = 'var(--bg-fff)';
        
        fileField.style.padding = '10px 14px';
        fileField.style.border = '1px solid var(--bd-dee2e6)';
        fileField.style.borderRadius = '6px';
        fileField.style.background = 'var(--bg-fff)';
        
        // Enable property inputs
        propertyInputs.forEach(input => input.removeAttribute('disabled'));
        
        // Show Save button, hide Edit button
        editBtn.style.display = 'none';
        saveBtn.style.display = 'flex';
    } else {
        // Switch to READ-ONLY mode
        dataManagementState.isEditMode = false;  // Track edit state
        
        descField.setAttribute('readonly', 'true');
        commentsField.setAttribute('readonly', 'true');
        urlField.setAttribute('readonly', 'true');
        fileField.setAttribute('readonly', 'true');
        
        // Hide URL input, show display
        urlField.style.display = 'none';
        urlDisplay.style.display = 'block';
        
        // Update URL display with new value
        const urlValue = urlField.value;
        if (urlValue) {
            urlDisplay.innerHTML = `<a href="${urlValue}" target="_blank" rel="noopener noreferrer" 
                style="color: #007bff; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 5px;"
                onmouseover="this.style.textDecoration='underline'" 
                onmouseout="this.style.textDecoration='none'">
                ${urlValue} <i class="fa-solid fa-external-link-alt" style="font-size: 12px;"></i>
             </a>`;
        } else {
            urlDisplay.innerHTML = '<span style="color: var(--fg-6c757d); font-size: 14px;">No URL</span>';
        }
        
        // Hide borders and padding in readonly mode
        descField.style.padding = '0';
        descField.style.border = 'none';
        descField.style.borderRadius = '0';
        descField.style.background = 'transparent';
        descField.style.resize = 'none';
        descField.style.minHeight = '80px';
        
        commentsField.style.padding = '0';
        commentsField.style.border = 'none';
        commentsField.style.borderRadius = '0';
        commentsField.style.background = 'transparent';
        commentsField.style.resize = 'none';
        commentsField.style.minHeight = '80px';
        
        urlField.style.padding = '0';
        urlField.style.border = 'none';
        urlField.style.borderRadius = '0';
        urlField.style.background = 'transparent';
        
        fileField.style.padding = '0';
        fileField.style.border = 'none';
        fileField.style.borderRadius = '0';
        fileField.style.background = 'transparent';
        
        // Disable property inputs
        propertyInputs.forEach(input => input.setAttribute('disabled', 'true'));
        
        // Show Edit button, hide Save button
        editBtn.style.display = 'flex';
        saveBtn.style.display = 'none';
    }
}

/**
 * Save task changes from data management page
 */
function saveDataTaskChanges() {
    if (!dataManagementState.selectedTask) return;
    
    const taskId = dataManagementState.selectedTask.id;
    const description = document.getElementById('edit-description')?.value || '';
    const comments = document.getElementById('edit-comments')?.value || '';
    const url = document.getElementById('edit-url')?.value || '';
    const file = document.getElementById('edit-file')?.value || '';
    
    // Get property values
    const status = document.getElementById('edit-status')?.value;
    const priority = document.getElementById('edit-priority')?.value;
    const environment = document.getElementById('edit-environment')?.value;
    const stage = document.getElementById('edit-stage')?.value;
    const assignedTo = document.getElementById('edit-assigned-to')?.value || '';
    const service = document.getElementById('edit-service')?.value || '';
    
    // Get category tab values (use existing task values if fields not in DOM)
    const categoryField = document.getElementById('edit-category');
    const subcategoryField = document.getElementById('edit-subcategory');
    const projectField = document.getElementById('edit-project');
    const taskGroupField = document.getElementById('edit-task-group');
    
    const category = categoryField ? (categoryField.value || null) : dataManagementState.selectedTask.category_id;
    const subcategory = subcategoryField ? (subcategoryField.value || null) : dataManagementState.selectedTask.subcategory_id;
    const project = projectField ? (projectField.value || null) : dataManagementState.selectedTask.project_id;
    const taskGroup = taskGroupField ? (taskGroupField.value || '') : dataManagementState.selectedTask.task_group;
    
    // Get dates tab values (use existing task values if fields not in DOM)
    const dueDateField = document.getElementById('edit-due-date');
    const reminderDateField = document.getElementById('edit-reminder-date');
    
    const dueDate = dueDateField ? (dueDateField.value || null) : dataManagementState.selectedTask.due_date;
    const reminderDate = reminderDateField ? (reminderDateField.value || null) : dataManagementState.selectedTask.reminder_date;
    
    const updates = {
        task_description: description,
        comments: comments,
        url: url,
        file: file,
        assigned_to: assignedTo,
        service_component: service,
        task_group: taskGroup,  // Task group
        due_date: dueDate,
        reminder_date: reminderDate
    };
    
    // Add properties (allow null values)
    updates.status_name = status;
    updates.priority_name = priority;
    updates.environment_name = environment;
    updates.stage_name = stage;
    updates.category_id = category;
    updates.subcategory_id = subcategory;
    updates.project_id = project;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    })
    .then(response => response.json())
    .then(() => {
        // Update local state
        dataManagementState.selectedTask.task_description = description;
        dataManagementState.selectedTask.comments = comments;
        dataManagementState.selectedTask.task_group = taskGroup;
        dataManagementState.selectedTask.due_date = dueDate;
        dataManagementState.selectedTask.reminder_date = reminderDate;
        if (status) dataManagementState.selectedTask.status_name = status;
        if (priority) dataManagementState.selectedTask.priority_name = priority;
        if (environment) dataManagementState.selectedTask.environment_name = environment;
        if (stage) dataManagementState.selectedTask.stage_name = stage;
        if (category) dataManagementState.selectedTask.category_id = category;
        if (subcategory) dataManagementState.selectedTask.subcategory_id = subcategory;
        if (project) dataManagementState.selectedTask.project_id = project;
        
        // Update in tasks array
        const taskIndex = dataManagementState.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            Object.assign(dataManagementState.tasks[taskIndex], updates);
        }
        
        // Switch back to read-only mode
        toggleEditMode();
        
        // Refresh properties panel to show updated values
        document.getElementById('data-properties-panel').innerHTML = renderPropertiesPanel();
        
        // Refresh navigation tree since category/project may have changed
        document.getElementById('data-nav-tree').innerHTML = renderNavigationTree();
        
        showNotification('Task updated successfully!', 'success');
    })
    .catch(error => {
        console.error('Error saving task:', error);
        alert('Failed to save task');
    });
}

/**
 * Switch tabs in properties panel
 */
function switchDataTab(tab) {
    dataManagementState.currentTab = tab;
    document.getElementById('data-properties-panel').innerHTML = renderPropertiesPanel();
}

/**
 * Render properties panel with tabs
 */
function renderPropertiesPanel() {
    if (!dataManagementState.selectedTask) return '';
    
    const task = dataManagementState.selectedTask;
    const currentTab = dataManagementState.currentTab;
    
    return `
        <div style="padding: 0;">
            <!-- Tab Headers -->
            <div style="display: flex; border-bottom: 1px solid var(--bd-dee2e6); background: var(--bg-fff);">
                <div onclick="switchDataTab('properties')" 
                     style="flex: 1; padding: 14px; text-align: center; cursor: pointer; font-weight: 500; font-size: 13px;
                            background: ${currentTab === 'properties' ? 'var(--bg-fff)' : 'var(--bg-f8f9fa)'}; 
                            color: ${currentTab === 'properties' ? '#007bff' : 'var(--fg-6c757d)'};
                            border-bottom: ${currentTab === 'properties' ? '2px solid #007bff' : 'none'}; 
                            margin-bottom: ${currentTab === 'properties' ? '-1px' : '0'};
                            transition: all 0.2s;">
                    Properties
                </div>
                <div onclick="switchDataTab('category')" 
                     style="flex: 1; padding: 14px; text-align: center; cursor: pointer; font-weight: 500; font-size: 13px;
                            background: ${currentTab === 'category' ? 'var(--bg-fff)' : 'var(--bg-f8f9fa)'}; 
                            color: ${currentTab === 'category' ? '#007bff' : 'var(--fg-6c757d)'};
                            border-bottom: ${currentTab === 'category' ? '2px solid #007bff' : 'none'}; 
                            margin-bottom: ${currentTab === 'category' ? '-1px' : '0'};
                            transition: all 0.2s;">
                    Category
                </div>
                <div onclick="switchDataTab('dates')" 
                     style="flex: 1; padding: 14px; text-align: center; cursor: pointer; font-weight: 500; font-size: 13px;
                            background: ${currentTab === 'dates' ? 'var(--bg-fff)' : 'var(--bg-f8f9fa)'}; 
                            color: ${currentTab === 'dates' ? '#007bff' : 'var(--fg-6c757d)'};
                            border-bottom: ${currentTab === 'dates' ? '2px solid #007bff' : 'none'}; 
                            margin-bottom: ${currentTab === 'dates' ? '-1px' : '0'};
                            transition: all 0.2s;">
                    Dates
                </div>
            </div>
            
            <!-- Tab Content -->
            <div style="padding: 20px;">
                ${currentTab === 'properties' ? renderPropertiesTab(task) : ''}
                ${currentTab === 'category' ? renderCategoryTab(task) : ''}
                ${currentTab === 'dates' ? renderDatesTab(task) : ''}
            </div>
        </div>
    `;
}

/**
 * Render Properties Tab
 */
function renderPropertiesTab(task) {
    const statuses = lookupData.lkp_status || [];
    const priorities = lookupData.lkp_priority || [];
    const environments = lookupData.lkp_environment || [];
    const stages = lookupData.lkp_stage || [];
    const isEditMode = dataManagementState.isEditMode;  // Check edit state
    
    return `
        <!-- Status Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Status</div>
            <select id="edit-status" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;">
                ${statuses.map(s => `<option value="${s.name}" ${s.name === task.status_name ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Priority Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Priority</div>
            <select id="edit-priority" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;">
                <option value="">None</option>
                ${priorities.map(p => `<option value="${p.name}" ${p.name === task.priority_name ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Assigned To Input -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Assigned To</div>
            <input type="text" id="edit-assigned-to" ${isEditMode ? '' : 'disabled'} class="property-input" value="${task.assigned_to || ''}"
                   style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529);"
                   placeholder="Not assigned">
        </div>
        
        <!-- Service/Component Input -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Service/Component</div>
            <input type="text" id="edit-service" ${isEditMode ? '' : 'disabled'} class="property-input" value="${task.service_component || ''}"
                   style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529);"
                   placeholder="None">
        </div>
        
        <!-- Environment Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Environment</div>
            <select id="edit-environment" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;">
                <option value="">None</option>
                ${environments.map(e => `<option value="${e.name}" ${e.name === task.environment_name ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Stage Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Stage</div>
            <select id="edit-stage" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;">
                <option value="">None</option>
                ${stages.map(s => `<option value="${s.name}" ${s.name === task.stage_name ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
        </div>
    `;
}

/**
 * Render Category Tab
 */
function renderCategoryTab(task) {
    const category = lookupData.categories?.find(c => c.cat_id === task.category_id);
    const subcategory = lookupData.subcategories?.find(sc => sc.scat_id === task.subcategory_id);
    const project = lookupData.projects?.find(p => p.prj_id === task.project_id);
    const taskGroup = task.task_group || '';  // Task Group stored in task_group
    const isEditMode = dataManagementState.isEditMode;  // Check edit state
    
    return `
        <!-- Category Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Category</div>
            <select id="edit-category" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;"
                    onchange="updateSubcategoryOptions()">
                <option value="">None</option>
                ${(lookupData.categories || []).map(c => `<option value="${c.cat_id}" ${c.cat_id === task.category_id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Subcategory Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Sub-Category</div>
            <select id="edit-subcategory" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;">
                <option value="">None</option>
                ${(lookupData.subcategories || [])
                    .filter(sc => !task.category_id || sc.category_id === task.category_id)
                    .map(sc => `<option value="${sc.scat_id}" ${sc.scat_id === task.subcategory_id ? 'selected' : ''}>${sc.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Project Dropdown -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Task Project</div>
            <select id="edit-project" ${isEditMode ? '' : 'disabled'} class="property-input"
                    style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529); font-weight: 400; cursor: pointer;">
                <option value="">None</option>
                ${(lookupData.projects || []).map(p => `<option value="${p.prj_id}" ${p.prj_id === task.project_id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
        </div>
        
        <!-- Task Group Input -->
        <div style="margin-bottom: 18px;">
            <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Task Group</div>
            <input type="text" id="edit-task-group" ${isEditMode ? '' : 'disabled'} class="property-input" value="${taskGroup}"
                   style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529);"
                   placeholder="None">
        </div>
    `;
}

/**
 * Render Dates Tab
 */
function renderDatesTab(task) {
    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };
    const isEditMode = dataManagementState.isEditMode;  // Check edit state
    
    return `
        <div style="font-size: 13px;">
            <div style="margin-bottom: 15px;">
                <div style="font-size: 11px; color: var(--fg-7f8c8d); margin-bottom: 3px; text-transform: uppercase; font-weight: 600;">Created Date</div>
                <div style="color: var(--fg-2c3e50); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-calendar-plus" style="color: #28a745;"></i>
                    <span>${task.created_at ? new Date(task.created_at).toLocaleString() : 'Not set'}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 18px;">
                <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Due Date</div>
                <input type="date" id="edit-due-date" ${isEditMode ? '' : 'disabled'} class="property-input" value="${formatDateForInput(task.due_date)}"
                       style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529);">
            </div>
            
            <div style="margin-bottom: 18px;">
                <div style="font-size: 12px; color: var(--fg-6c757d); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Reminder Date</div>
                <input type="date" id="edit-reminder-date" ${isEditMode ? '' : 'disabled'} class="property-input" value="${formatDateForInput(task.reminder_date)}"
                       style="width: 100%; padding: 10px 14px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff); color: var(--fg-212529);">
            </div>
        </div>
    `;
}

/**
 * Get priority color
 */
function getPriorityColor(priority) {
    if (!priority) return '#95a5a6';
    const p = priority.toLowerCase();
    if (p === 'critical') return '#e74c3c';
    if (p === 'high') return '#e67e22';
    if (p === 'medium') return '#f39c12';
    if (p === 'low') return '#27ae60';
    return '#95a5a6';
}

/**
 * Toggle collapse state of navigation sections
 */
function toggleCollapse(sectionId) {
    dataManagementState.collapsed[sectionId] = !dataManagementState.collapsed[sectionId];
    document.getElementById('data-nav-tree').innerHTML = renderNavigationTree();
}

/**
 * Set navigation context when clicking on a category
 */
function setContextCategory(catId, catName) {
    dataManagementState.navigationContext = {
        categoryId: catId !== 'uncategorized' ? catId : null,
        categoryName: catId !== 'uncategorized' ? catName : null,
        subcategoryId: null,
        subcategoryName: null,
        projectId: null,
        projectName: null,
        groupId: null,
        groupName: null
    };
}

/**
 * Set navigation context when clicking on a subcategory
 */
function setContextSubcategory(subCatId, subCatName, catId, catName) {
    dataManagementState.navigationContext = {
        categoryId: catId !== 'uncategorized' ? catId : null,
        categoryName: catId !== 'uncategorized' ? catName : null,
        subcategoryId: subCatId !== 'none' ? subCatId : null,
        subcategoryName: subCatId !== 'none' ? subCatName : null,
        projectId: null,
        projectName: null,
        groupId: null,
        groupName: null
    };
}

/**
 * Set navigation context when clicking on a project
 */
function setContextProject(projectId, projectName, subCatId, subCatName, catId, catName) {
    dataManagementState.navigationContext = {
        categoryId: catId !== 'uncategorized' ? catId : null,
        categoryName: catId !== 'uncategorized' ? catName : null,
        subcategoryId: subCatId !== 'none' ? subCatId : null,
        subcategoryName: subCatId !== 'none' ? subCatName : null,
        projectId: projectId !== 'none' ? projectId : null,
        projectName: projectId !== 'none' ? projectName : null,
        groupId: null,
        groupName: null
    };
}

/**
 * Set navigation context when clicking on a group
 */
function setContextGroup(groupId, groupName, projectId, projectName, subCatId, subCatName, catId, catName) {
    dataManagementState.navigationContext = {
        categoryId: catId !== 'uncategorized' ? catId : null,
        categoryName: catId !== 'uncategorized' ? catName : null,
        subcategoryId: subCatId !== 'none' ? subCatId : null,
        subcategoryName: subCatId !== 'none' ? subCatName : null,
        projectId: projectId !== 'none' ? projectId : null,
        projectName: projectId !== 'none' ? projectName : null,
        groupId: groupId !== 'none' ? groupId : null,
        groupName: groupId !== 'none' ? groupName : null
    };
}

/**
 * Delete task from data management page
 */
/**
 * Open Add Task modal from Data Management page with pre-filled context
 */
function openDataAddTaskModal() {
    const ctx = dataManagementState.navigationContext;
    
    console.log('Add Task clicked! Navigation context:', ctx);
    
    // Check if we have openAddTaskModal available
    if (typeof openAddTaskModal !== 'function') {
        console.error('openAddTaskModal function not found!');
        alert('Unable to open task creation form. Please navigate to Tasks page manually.');
        return;
    }
    
    // Open the modal directly
    openAddTaskModal();
    
    // Pre-fill form fields based on navigation context
    setTimeout(() => {
        console.log('Attempting to pre-fill form fields...');
        
        if (ctx.categoryId) {
            const catField = document.getElementById('task-category_id');
            console.log('Category field found:', catField, 'Setting value:', ctx.categoryId);
            if (catField) {
                catField.value = ctx.categoryId;
                // Trigger change event to update dependent fields
                catField.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        if (ctx.subcategoryId) {
            const subcatField = document.getElementById('task-subcategory_id');
            console.log('Subcategory field found:', subcatField, 'Setting value:', ctx.subcategoryId);
            if (subcatField) {
                subcatField.value = ctx.subcategoryId;
                subcatField.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        if (ctx.projectId) {
            const projField = document.getElementById('task-project_id');
            console.log('Project field found:', projField, 'Setting value:', ctx.projectId);
            if (projField) {
                projField.value = ctx.projectId;
                projField.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        if (ctx.groupName) {
            const groupField = document.getElementById('task-task_group');
            console.log('Group field found:', groupField, 'Setting value:', ctx.groupName);
            if (groupField) {
                groupField.value = ctx.groupName;
                groupField.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        console.log('Form pre-fill complete!');
    }, 200);
}

/**
 * Open Add Task modal from Projects page with pre-filled project
 */
function openProjectAddTaskModal() {
    console.log('Add Task clicked from Projects page! Selected project:', selectedProjectId);
    
    // Check if we have openAddTaskModal available
    if (typeof openAddTaskModal !== 'function') {
        console.error('openAddTaskModal function not found!');
        alert('Unable to open task creation form. Please try again.');
        return;
    }
    
    // Open the modal directly
    openAddTaskModal();
    
    // Pre-fill project field based on selected project
    setTimeout(() => {
        console.log('Attempting to pre-fill project field...');
        
        if (selectedProjectId) {
            const projField = document.getElementById('task-project_id');
            console.log('Project field found:', projField, 'Setting value:', selectedProjectId);
            if (projField) {
                projField.value = selectedProjectId;
                projField.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        console.log('Form pre-fill complete!');
    }, 200);
}

/**
 * Filter tasks by selected project
 */
function filterByProject(projectId) {
    dataManagementState.projectFilter = projectId;
    document.getElementById('data-nav-tree').innerHTML = renderNavigationTree();
}

/**
 * Filter navigation tree by task group
 */
function filterByTaskGroup(taskGroup) {
    dataManagementState.taskGroupFilter = taskGroup;
    document.getElementById('data-nav-tree').innerHTML = renderNavigationTree();
}
window.filterByTaskGroup = filterByTaskGroup;

/**
 * Toggle hide completed tasks in Data page
 */
function toggleHideCompletedData() {
    dataManagementState.hideCompleted = !dataManagementState.hideCompleted;
    renderDataManagementPage();
}
window.toggleHideCompletedData = toggleHideCompletedData;

/**
 * Filter navigation tree based on search query
 */
function filterNavigationTree(query) {
    dataManagementState.searchQuery = query.toLowerCase().trim();
    document.getElementById('data-nav-tree').innerHTML = renderNavigationTree();
}

/**
 * Check if a task matches the search query
 */
function taskMatchesSearch(task, query) {
    if (!query) return true;
    
    // Search in task title
    if (task.title && task.title.toLowerCase().includes(query)) return true;
    
    // Search in category
    const category = lookupData.categories?.find(c => c.cat_id === task.category_id);
    if (category && category.name.toLowerCase().includes(query)) return true;
    
    // Search in subcategory
    const subcategory = lookupData.subcategories?.find(sc => sc.scat_id === task.subcategory_id);
    if (subcategory && subcategory.name.toLowerCase().includes(query)) return true;
    
    // Search in project
    const project = lookupData.projects?.find(p => p.prj_id === task.project_id);
    if (project && project.name.toLowerCase().includes(query)) return true;
    
    // Search in task group
    if (task.task_group && task.task_group.toLowerCase().includes(query)) return true;
    
    return false;
}

/**
 * Delete task from data management page
 */
function deleteDataTask(taskId) {
    if (!confirm('Move this task to trash?')) return;
    
    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(() => {
        initializeDataManagementPage();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    });
}

// ========================================================================
//                    AUTO-ARCHIVE CONTROL PANEL
// ========================================================================

/**
 * Load archive rules from localStorage
 */
function loadArchiveRules() {
    const saved = localStorage.getItem('archiveRules');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing archive rules:', e);
        }
    }
    // Default: archive tasks with status "Done" (disabled by default - user must enable)
    return [
        { field: 'status_name', operator: 'equals', value: 'Done', enabled: false }
    ];
}

/**
 * Save archive rules to localStorage
 */
function saveArchiveRules(rules) {
    localStorage.setItem('archiveRules', JSON.stringify(rules));
}

// ========================================================================
//                     CONTROL TAB HELPER FUNCTIONS (Admin Settings)
// ========================================================================

function toggleControlRule(idx) {
    const rules = loadArchiveRules();
    rules[idx].enabled = !rules[idx].enabled;
    saveArchiveRules(rules);
    // Re-render Control tab
    const contentArea = document.getElementById('admin-content-area');
    if (contentArea) renderControlTabContent(contentArea);
}

function updateControlRule(idx, field, value) {
    const rules = loadArchiveRules();
    rules[idx][field] = value;
    saveArchiveRules(rules);
    // Re-render Control tab if field changed (to update dropdown)
    if (field === 'field') {
        const contentArea = document.getElementById('admin-content-area');
        if (contentArea) renderControlTabContent(contentArea);
    }
}

function deleteControlRule(idx) {
    const rules = loadArchiveRules();
    rules.splice(idx, 1);
    saveArchiveRules(rules);
    // Re-render Control tab
    const contentArea = document.getElementById('admin-content-area');
    if (contentArea) renderControlTabContent(contentArea);
}

function addControlRule() {
    const rules = loadArchiveRules();
    rules.push({ field: 'status_name', operator: 'equals', value: '', enabled: false });
    saveArchiveRules(rules);
    // Re-render Control tab
    const contentArea = document.getElementById('admin-content-area');
    if (contentArea) renderControlTabContent(contentArea);
}

function runAutoArchiveFromControl() {
    const rules = loadArchiveRules();
    const enabled = rules.filter(r => r.enabled);
    
    if (enabled.length === 0) {
        alert('No rules are enabled. Please enable at least one rule.');
        return;
    }
    
    // Show loading state
    const resultDiv = document.getElementById('archive-results');
    if (resultDiv) {
        resultDiv.innerHTML = '<div style="padding: 15px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; margin-top: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Processing...</div>';
    }
    
    fetch('/api/tasks')
        .then(r => r.json())
        .then(tasks => {
            console.log('[DEBUG] Auto-archive - Total active tasks:', tasks.length);
            
            // Get lookups for name-to-ID conversion
            return fetch('/api/lookups')
                .then(r => r.json())
                .then(lookups => ({ tasks, lookups }));
        })
        .then(({ tasks, lookups }) => {
            const toArchive = tasks.filter(t => {
                if (t.is_archived || t.is_deleted) return false;
                return enabled.some(rule => {
                    const taskValue = t[rule.field];
                    let ruleValue = rule.value;
                    
                    // For ID fields, convert name to ID for comparison
                    if (rule.field === 'project_id') {
                        const project = lookups.projects.find(p => p.name === rule.value);
                        ruleValue = project ? project.prj_id : rule.value;
                    } else if (rule.field === 'category_id') {
                        const category = lookups.categories.find(c => c.name === rule.value);
                        ruleValue = category ? category.cat_id : rule.value;
                    } else if (rule.field === 'subcategory_id') {
                        const subcategory = lookups.subcategories.find(s => s.name === rule.value);
                        ruleValue = subcategory ? subcategory.scat_id : rule.value;
                    }
                    
                    console.log('[DEBUG] Checking task', t.id, 'field', rule.field, '=', taskValue, 'against', ruleValue);
                    if (rule.operator === 'equals') return taskValue == ruleValue;
                    if (rule.operator === 'not_equals') return taskValue != ruleValue;
                    if (rule.operator === 'contains') return taskValue && taskValue.toString().includes(ruleValue);
                    return false;
                });
            });
            
            console.log('[DEBUG] Auto-archive - Tasks to archive:', toArchive.length);
            console.log('[DEBUG] Auto-archive - Task IDs:', toArchive.map(t => t.id));
            
            if (toArchive.length === 0) {
                if (resultDiv) {
                    resultDiv.innerHTML = '<div style="padding: 15px; background: #d1ecf1; border: 1px solid #0dcaf0; border-radius: 4px; margin-top: 20px;"><i class="fa-solid fa-info-circle"></i> No tasks match the enabled rules.</div>';
                }
                return;
            }
            
            const promises = toArchive.map(t => {
                console.log('[DEBUG] Archiving task', t.id);
                return fetch(`/api/tasks/${t.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_archived: 1 })
                }).then(response => {
                    console.log('[DEBUG] Archive response for task', t.id, ':', response.status);
                    return response;
                });
            });
            
            Promise.all(promises)
                .then(() => {
                    if (resultDiv) {
                        resultDiv.innerHTML = `
                            <div style="padding: 15px; background: #d1e7dd; border: 1px solid #28a745; border-radius: 4px; margin-top: 20px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="fa-solid fa-check-circle" style="color: #28a745; font-size: 1.2em;"></i>
                                    <strong>Successfully archived ${toArchive.length} task(s)</strong>
                                </div>
                                <div style="margin-top: 10px;">
                                    <a href="#" onclick="event.preventDefault(); document.getElementById('nav-archive').click();" style="color: #0d6efd;">View in Archive →</a>
                                </div>
                            </div>
                        `;
                    }
                    
                    // Refresh Tasks page if it's currently open
                    if (document.getElementById('nav-tasks').classList.contains('active')) {
                        initializeTasksTable();
                    }
                })
                .catch(err => {
                    if (resultDiv) {
                        resultDiv.innerHTML = `<div style="padding: 15px; background: #f8d7da; border: 1px solid #dc3545; border-radius: 4px; margin-top: 20px;"><i class="fa-solid fa-exclamation-circle"></i> Error: ${err.message}</div>`;
                    }
                });
        })
        .catch(err => {
            if (resultDiv) {
                resultDiv.innerHTML = `<div style="padding: 15px; background: #f8d7da; border: 1px solid #dc3545; border-radius: 4px; margin-top: 20px;"><i class="fa-solid fa-exclamation-circle"></i> Error: ${err.message}</div>`;
            }
        });
}

function getValuesForField(fieldName, lookups) {
    if (!lookups) return [];
    
    const mapping = {
        'status_name': (lookups.lkp_status || []).map(s => s.name),
        'priority_name': (lookups.lkp_priority || []).map(p => p.name),
        'environment_name': (lookups.lkp_environment || []).map(e => e.name),
        'stage_name': (lookups.lkp_stage || []).map(s => s.name),
        'project_id': (lookups.projects || []).map(p => p.name),
        'category_id': (lookups.categories || []).map(c => c.name),
        'subcategory_id': (lookups.subcategories || []).map(s => s.name)
    };
    
    return mapping[fieldName] || [];
}

// Expose Control tab functions to global scope for onclick handlers
window.toggleControlRule = toggleControlRule;
window.updateControlRule = updateControlRule;
window.deleteControlRule = deleteControlRule;
window.addControlRule = addControlRule;
window.runAutoArchiveFromControl = runAutoArchiveFromControl;

/**
 * Save default tab preference
 */
function saveDefaultTab(key, value) {
    fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
    })
    .then(response => response.json())
    .then(() => {
        showNotification('Default tab setting saved', 'success');
    })
    .catch(error => {
        console.error('Error saving preference:', error);
        showNotification('Failed to save setting', 'error');
    });
}
window.saveDefaultTab = saveDefaultTab;

// Expose Data Management functions to global scope
window.toggleEditMode = toggleEditMode;
window.saveDataTaskChanges = saveDataTaskChanges;
window.deleteDataTask = deleteDataTask;
window.selectTask = selectTask;
window.switchDataTab = switchDataTab;
window.toggleCollapse = toggleCollapse;
window.changeHierarchy = changeHierarchy;
window.openDataAddTaskModal = openDataAddTaskModal;
window.openProjectAddTaskModal = openProjectAddTaskModal;
window.setContextCategory = setContextCategory;
window.setContextSubcategory = setContextSubcategory;
window.setContextProject = setContextProject;
window.setContextGroup = setContextGroup;
window.filterNavigationTree = filterNavigationTree;
window.filterByProject = filterByProject;


// ========================================================================
//                        ARCHIVE PAGE  
// ========================================================================

function initializeArchivePage() {
    console.log('[DEBUG] Archive page initializing...');
    fetch('/api/tasks?include_archived=true')
        .then(r => r.json())
        .then(tasks => {
            console.log('[DEBUG] Archive - Total tasks:', tasks.length);
            console.log('[DEBUG] Archive - Sample task:', tasks[0]);
            const archived = tasks.filter(t => t.is_archived === 1 && t.is_deleted === 0);
            console.log('[DEBUG] Archive - Archived tasks found:', archived.length);
            if (archived.length > 0) {
                console.log('[DEBUG] Archive - First archived task:', archived[0]);
            }
            renderArchivePage(archived);
        })
        .catch(err => {
            console.error('[DEBUG] Archive load error:', err);
            document.getElementById('archive-container').innerHTML = '<p style="color:red;">Error loading archive</p>';
        });
}

function renderArchivePage(archived) {
    console.log('[DEBUG] renderArchivePage called with', archived.length, 'tasks');
    const container = document.getElementById('archive-container');
    console.log('[DEBUG] Container found:', !!container);
    if (!container) {
        console.error('[DEBUG] Archive container not found!');
        return;
    }
    
    let html = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <h2 style="margin: 0;"><i class="fa-solid fa-box-archive"></i> Archive (${archived.length})</h2>
            <div style="display: flex; gap: 10px;">
                <button onclick="unarchiveAll()" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-rotate-left"></i> Unarchive All
                </button>
                <button onclick="deleteAllArchived()" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-trash"></i> Delete All
                </button>
            </div>
        </div>
        
        <!-- Filters -->
        <div style="background: var(--bg-fff); padding: 15px; border-radius: 4px; margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <select id="archive-category-filter" onchange="filterArchiveTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <option value="">All Categories</option>
            </select>
            <select id="archive-project-filter" onchange="filterArchiveTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <option value="">All Projects</option>
            </select>
            <select id="archive-status-filter" onchange="filterArchiveTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <option value="">All Statuses</option>
            </select>
            <input type="text" id="archive-search" placeholder="Search..." onkeyup="filterArchiveTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1; min-width: 200px;">
        </div>
    `;
    
    if (archived.length === 0) {
        html += '<p style="color: var(--fg-6c757d);"><i class="fa-solid fa-box-open"></i> No archived tasks</p>';
    } else {
        html += `
            <table style="width: 100%; border-collapse: collapse; background: var(--bg-fff);">
                <thead>
                    <tr style="background: var(--bg-f8f9fa); border-bottom: 2px solid var(--bd-dee2e6);">
                        <th style="padding: 12px; text-align: left;">ID</th>
                        <th style="padding: 12px; text-align: left;">Title</th>
                        <th style="padding: 12px; text-align: left;">Description</th>
                        <th style="padding: 12px; text-align: left;">Category</th>
                        <th style="padding: 12px; text-align: left;">Project</th>
                        <th style="padding: 12px; text-align: left;">Status</th>
                        <th style="padding: 12px; text-align: left;">Priority</th>
                        <th style="padding: 12px; text-align: left;">Archived On</th>
                        <th style="padding: 12px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody id="archive-table-body">
        `;
        
        archived.forEach(task => {
            const archivedDate = task.archived_at ? new Date(task.archived_at).toLocaleString() : 'N/A';
            html += `
                <tr style="border-bottom: 1px solid var(--bd-dee2e6);" data-task-id="${task.id}" data-category="${task.category_id || ''}" data-project="${task.project_id || ''}" data-status="${task.status_name || ''}">
                    <td style="padding: 12px;">${task.id}</td>
                    <td style="padding: 12px;">${task.title || ''}</td>
                    <td style="padding: 12px;">${task.service_component || ''}</td>
                    <td style="padding: 12px;">${task.category_name || ''}</td>
                    <td style="padding: 12px;">${task.project_name || ''}</td>
                    <td style="padding: 12px;">${task.status_name || ''}</td>
                    <td style="padding: 12px;">${task.priority_name || ''}</td>
                    <td style="padding: 12px;">${archivedDate}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="unarchiveTask(${task.id})" style="padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;"padding: 6px 12px; margin-right: 5px;">
                            <i class="fa-solid fa-rotate-left"></i> Unarchive
                        </button>
                        <button onclick="deleteArchivedTask(${task.id})" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" style="padding: 6px 12px;">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
    }
    
    container.innerHTML = html;
    
    // Populate filter dropdowns
    if (archived.length > 0) {
        const categoryFilter = document.getElementById('archive-category-filter');
        const projectFilter = document.getElementById('archive-project-filter');
        const statusFilter = document.getElementById('archive-status-filter');
        
        const categories = [...new Set(archived.map(t => t.category_name).filter(Boolean))];
        const projects = [...new Set(archived.map(t => t.project_name).filter(Boolean))];
        const statuses = [...new Set(archived.map(t => t.status_name).filter(Boolean))];
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        
        projects.forEach(prj => {
            const option = document.createElement('option');
            option.value = prj;
            option.textContent = prj;
            projectFilter.appendChild(option);
        });
        
        statuses.forEach(st => {
            const option = document.createElement('option');
            option.value = st;
            option.textContent = st;
            statusFilter.appendChild(option);
        });
    }
}

function filterArchiveTasks() {
    const categoryFilter = document.getElementById('archive-category-filter')?.value.toLowerCase();
    const projectFilter = document.getElementById('archive-project-filter')?.value.toLowerCase();
    const statusFilter = document.getElementById('archive-status-filter')?.value.toLowerCase();
    const searchTerm = document.getElementById('archive-search')?.value.toLowerCase();
    
    const tbody = document.getElementById('archive-table-body');
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
        const category = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
        const project = row.querySelector('td:nth-child(5)')?.textContent.toLowerCase() || '';
        const status = row.querySelector('td:nth-child(6)')?.textContent.toLowerCase() || '';
        const title = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const description = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        
        const matchesCategory = !categoryFilter || category.includes(categoryFilter);
        const matchesProject = !projectFilter || project.includes(projectFilter);
        const matchesStatus = !statusFilter || status.includes(statusFilter);
        const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
        
        if (matchesCategory && matchesProject && matchesStatus && matchesSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
window.filterArchiveTasks = filterArchiveTasks;

function unarchiveTask(taskId) {
    if (!confirm('Unarchive this task?')) return;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: 0 })
    })
    .then(() => initializeArchivePage())
    .catch(err => alert('Error: ' + err.message));
}

function unarchiveAll() {
    if (!confirm('Unarchive all tasks?')) return;
    
    fetch('/api/tasks?include_archived=true')
        .then(r => r.json())
        .then(tasks => {
            const archived = tasks.filter(t => t.is_archived === 1 && t.is_deleted === 0);
            const promises = archived.map(t => 
                fetch(`/api/tasks/${t.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_archived: 0 })
                })
            );
            return Promise.all(promises);
        })
        .then(() => initializeArchivePage())
        .catch(err => alert('Error: ' + err.message));
}

function deleteAllArchived() {
    if (!confirm('Move all archived tasks to trash?')) return;
    
    fetch('/api/tasks?include_archived=true')
        .then(r => r.json())
        .then(tasks => {
            const archived = tasks.filter(t => t.is_archived === 1 && t.is_deleted === 0);
            const promises = archived.map(t => 
                fetch(`/api/tasks/${t.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_deleted: 1 })
                })
            );
            return Promise.all(promises);
        })
        .then(() => initializeArchivePage())
        .catch(err => alert('Error: ' + err.message));
}

function deleteArchivedTask(taskId) {
    if (!confirm('Move to trash?')) return;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: 1 })
    })
    .then(() => initializeArchivePage())
    .catch(err => alert('Error: ' + err.message));
}

// ========================================================================
//                        TRASH PAGE
// ========================================================================

// Add trash page route
pageRoutes['nav-trash'] = {
    title: 'Trash',
    content: '<div id="trash-container"></div>'
};

/**
 * Initialize Trash Page
 */
// ========================================================================
// ========================================================================
//                        TRASH PAGE
// ========================================================================

function initializeTrashPage() {
    // Initialize trash view state
    window.trashViewState = {
        currentTab: 'tasks', // 'tasks' or 'projects'
        deletedTasks: [],
        deletedProjects: []
    };
    
    // Load both deleted tasks and projects
    Promise.all([
        fetch('/api/tasks?include_deleted=true').then(r => r.json()),
        fetch('/api/admin/projects/deleted').then(r => r.json())
    ])
    .then(([tasks, projects]) => {
        window.trashViewState.deletedTasks = tasks.filter(t => t.is_deleted === 1);
        window.trashViewState.deletedProjects = projects;
        renderTrashPage();
    })
    .catch(err => {
        console.error('Trash load error:', err);
        document.getElementById('trash-container').innerHTML = '<p style="color:red;">Error loading trash</p>';
    });
}

function renderTrashPage() {
    const container = document.getElementById('trash-container');
    const { currentTab, deletedTasks, deletedProjects } = window.trashViewState;
    
    const taskCount = deletedTasks.length;
    const projectCount = deletedProjects.length;
    
    let html = `
        <!-- Tabs -->
        <div style="display: flex; gap: 0; border-bottom: 2px solid var(--bd-dee2e6); margin-bottom: 20px;">
            <button onclick="switchTrashTab('tasks')" 
                    style="padding: 12px 24px; background: ${currentTab === 'tasks' ? '#007bff' : 'transparent'}; 
                           color: ${currentTab === 'tasks' ? 'white' : 'var(--fg-495057)'}; border: none; 
                           border-bottom: ${currentTab === 'tasks' ? 'none' : '2px solid transparent'};
                           cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
                <i class="fa-solid fa-tasks"></i> Tasks (${taskCount})
            </button>
            <button onclick="switchTrashTab('projects')" 
                    style="padding: 12px 24px; background: ${currentTab === 'projects' ? '#007bff' : 'transparent'}; 
                           color: ${currentTab === 'projects' ? 'white' : 'var(--fg-495057)'}; border: none; 
                           border-bottom: ${currentTab === 'projects' ? 'none' : '2px solid transparent'};
                           cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
                <i class="fa-solid fa-diagram-project"></i> Projects (${projectCount})
            </button>
        </div>
        
        <div id="trash-tab-content">
    `;
    
    if (currentTab === 'tasks') {
        html += renderTrashTasksTab(deletedTasks);
    } else {
        html += renderTrashProjectsTab(deletedProjects);
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Populate filters if tasks tab
    if (currentTab === 'tasks') {
        populateTrashFilters(deletedTasks);
    }
}

function switchTrashTab(tab) {
    window.trashViewState.currentTab = tab;
    renderTrashPage();
}

function renderTrashTasksTab(deleted) {
    let html = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <h2 style="margin: 0;"><i class="fa-solid fa-trash"></i> Deleted Tasks (${deleted.length})</h2>
            <div style="display: flex; gap: 10px;">
                <button onclick="restoreAllTasks()" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-rotate-left"></i> Restore All
                </button>
                <button onclick="emptyTrashTasks()" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-times"></i> Empty Trash
                </button>
            </div>
        </div>
        
        <!-- Filters -->
        <div style="background: var(--bg-fff); padding: 15px; border-radius: 4px; margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <select id="trash-category-filter" onchange="filterTrashTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <option value="">All Categories</option>
            </select>
            <select id="trash-project-filter" onchange="filterTrashTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <option value="">All Projects</option>
            </select>
            <select id="trash-status-filter" onchange="filterTrashTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                <option value="">All Statuses</option>
            </select>
            <input type="text" id="trash-search" placeholder="Search..." onkeyup="filterTrashTasks()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1; min-width: 200px;">
        </div>
    `;
    
    if (deleted.length === 0) {
        html += '<p style="color: var(--fg-6c757d);"><i class="fa-solid fa-check-circle"></i> No deleted tasks</p>';
    } else {
        html += `
            <table style="width: 100%; border-collapse: collapse; background: var(--bg-fff);">
                <thead>
                    <tr style="background: var(--bg-f8f9fa); border-bottom: 2px solid var(--bd-dee2e6);">
                        <th style="padding: 12px; text-align: left;">ID</th>
                        <th style="padding: 12px; text-align: left;">Title</th>
                        <th style="padding: 12px; text-align: left;">Description</th>
                        <th style="padding: 12px; text-align: left;">Category</th>
                        <th style="padding: 12px; text-align: left;">Project</th>
                        <th style="padding: 12px; text-align: left;">Status</th>
                        <th style="padding: 12px; text-align: left;">Priority</th>
                        <th style="padding: 12px; text-align: left;">Deleted On</th>
                        <th style="padding: 12px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody id="trash-table-body">
        `;
        
        deleted.forEach(task => {
            const deletedDate = task.deleted_at ? new Date(task.deleted_at).toLocaleString() : 'N/A';
            html += `
                <tr style="border-bottom: 1px solid var(--bd-dee2e6);">
                    <td style="padding: 12px;">${task.id}</td>
                    <td style="padding: 12px;">${task.title || ''}</td>
                    <td style="padding: 12px;">${task.service_component || ''}</td>
                    <td style="padding: 12px;">${task.category_name || ''}</td>
                    <td style="padding: 12px;">${task.project_name || ''}</td>
                    <td style="padding: 12px;">${task.status_name || ''}</td>
                    <td style="padding: 12px;">${task.priority_name || ''}</td>
                    <td style="padding: 12px;">${deletedDate}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="restoreTask(${task.id})" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;"padding: 6px 12px; margin-right: 5px;">
                            <i class="fa-solid fa-rotate-left"></i> Restore
                        </button>
                        <button onclick="permanentlyDeleteTask(${task.id})" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;" style="padding: 6px 12px;">
                            <i class="fa-solid fa-times"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
    }
    
    return html;
}

function renderTrashProjectsTab(deleted) {
    let html = `
        <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <h2 style="margin: 0;"><i class="fa-solid fa-diagram-project"></i> Deleted Projects (${deleted.length})</h2>
            <div style="display: flex; gap: 10px;">
                <button onclick="restoreAllProjects()" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-rotate-left"></i> Restore All
                </button>
                <button onclick="emptyTrashProjects()" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                    <i class="fa-solid fa-times"></i> Empty Trash
                </button>
            </div>
        </div>
    `;
    
    if (deleted.length === 0) {
        html += '<p style="color: var(--fg-6c757d);"><i class="fa-solid fa-check-circle"></i> No deleted projects</p>';
    } else {
        html += `
            <table style="width: 100%; border-collapse: collapse; background: var(--bg-fff);">
                <thead>
                    <tr style="background: var(--bg-f8f9fa); border-bottom: 2px solid var(--bd-dee2e6);">
                        <th style="padding: 12px; text-align: left;">ID</th>
                        <th style="padding: 12px; text-align: left;">Name</th>
                        <th style="padding: 12px; text-align: left;">Description</th>
                        <th style="padding: 12px; text-align: left;">Status</th>
                        <th style="padding: 12px; text-align: left;">Deleted On</th>
                        <th style="padding: 12px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        deleted.forEach(project => {
            const deletedDate = project.deleted_at ? new Date(project.deleted_at).toLocaleString() : 'N/A';
            html += `
                <tr style="border-bottom: 1px solid var(--bd-dee2e6);">
                    <td style="padding: 12px;">${project.prj_id}</td>
                    <td style="padding: 12px; font-weight: 600;">${project.name || ''}</td>
                    <td style="padding: 12px;">${project.description || ''}</td>
                    <td style="padding: 12px;">${project.status || ''}</td>
                    <td style="padding: 12px;">${deletedDate}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="restoreProject('${project.prj_id}')" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; margin-right: 5px;">
                            <i class="fa-solid fa-rotate-left"></i> Restore
                        </button>
                        <button onclick="permanentlyDeleteProject('${project.prj_id}')" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                            <i class="fa-solid fa-times"></i> Delete Forever
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
    }
    
    return html;
}

function populateTrashFilters(deleted) {
    // Populate filter dropdowns
    if (deleted.length > 0) {
        const categoryFilter = document.getElementById('trash-category-filter');
        const projectFilter = document.getElementById('trash-project-filter');
        const statusFilter = document.getElementById('trash-status-filter');
        
        const categories = [...new Set(deleted.map(t => t.category_name).filter(Boolean))];
        const projects = [...new Set(deleted.map(t => t.project_name).filter(Boolean))];
        const statuses = [...new Set(deleted.map(t => t.status_name).filter(Boolean))];
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        
        projects.forEach(prj => {
            const option = document.createElement('option');
            option.value = prj;
            option.textContent = prj;
            projectFilter.appendChild(option);
        });
        
        statuses.forEach(st => {
            const option = document.createElement('option');
            option.value = st;
            option.textContent = st;
            statusFilter.appendChild(option);
        });
    }
}

function filterTrashTasks() {
    const categoryFilter = document.getElementById('trash-category-filter')?.value.toLowerCase();
    const projectFilter = document.getElementById('trash-project-filter')?.value.toLowerCase();
    const statusFilter = document.getElementById('trash-status-filter')?.value.toLowerCase();
    const searchTerm = document.getElementById('trash-search')?.value.toLowerCase();
    
    const tbody = document.getElementById('trash-table-body');
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
        const category = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
        const project = row.querySelector('td:nth-child(5)')?.textContent.toLowerCase() || '';
        const status = row.querySelector('td:nth-child(6)')?.textContent.toLowerCase() || '';
        const title = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const description = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        
        const matchesCategory = !categoryFilter || category.includes(categoryFilter);
        const matchesProject = !projectFilter || project.includes(projectFilter);
        const matchesStatus = !statusFilter || status.includes(statusFilter);
        const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
        
        if (matchesCategory && matchesProject && matchesStatus && matchesSearch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
window.filterTrashTasks = filterTrashTasks;

function restoreTask(taskId) {
    if (!confirm('Restore this task?')) return;
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: 0 })
    })
    .then(() => initializeTrashPage())
    .catch(err => alert('Error: ' + err.message));
}

function restoreAll() {
    restoreAllTasks(); // Redirect to new function
}

function restoreAllTasks() {
    if (!confirm('Restore all tasks from trash?')) return;
    
    fetch('/api/tasks?include_deleted=true')
        .then(r => r.json())
        .then(tasks => {
            const deleted = tasks.filter(t => t.is_deleted === 1);
            const promises = deleted.map(t => 
                fetch(`/api/tasks/${t.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_deleted: 0 })
                })
            );
            return Promise.all(promises);
        })
        .then(() => initializeTrashPage())
        .catch(err => alert('Error: ' + err.message));
}

function permanentlyDeleteTask(taskId) {
    if (!confirm('Permanently delete this task? This cannot be undone!')) return;
    
    fetch(`/api/tasks/${taskId}?hard=true`, {
        method: 'DELETE'
    })
    .then(() => initializeTrashPage())
    .catch(err => alert('Error: ' + err.message));
}

function emptyTrash() {
    emptyTrashTasks(); // Redirect to new function
}

function emptyTrashTasks() {
    if (!confirm('Permanently delete ALL tasks in trash? This cannot be undone!')) return;
    
    fetch('/api/tasks?include_deleted=true')
        .then(r => r.json())
        .then(tasks => {
            const deleted = tasks.filter(t => t.is_deleted === 1);
            const promises = deleted.map(t => 
                fetch(`/api/tasks/${t.id}?hard=true`, { method: 'DELETE' })
            );
            return Promise.all(promises);
        })
        .then(() => initializeTrashPage())
        .catch(err => alert('Error: ' + err.message));
}

// Project trash functions
function restoreAllProjects() {
    if (!confirm('Restore all deleted projects?')) return;
    
    fetch('/api/admin/projects/deleted')
        .then(r => r.json())
        .then(projects => {
            const promises = projects.map(project => 
                fetch(`/api/admin/projects/${project.prj_id}/restore`, {
                    method: 'POST'
                })
            );
            return Promise.all(promises);
        })
        .then(() => {
            showNotification('All projects restored!', 'success');
            initializeTrashPage();
            // Refresh lookups
            return fetch('/api/lookups');
        })
        .then(r => r.json())
        .then(data => {
            lookupData = data;
        })
        .catch(err => alert('Error: ' + err.message));
}

function emptyTrashProjects() {
    if (!confirm('Permanently delete all projects in trash? This will only delete the project records, not their tasks. This cannot be undone!')) return;
    
    fetch('/api/admin/projects/deleted')
        .then(r => r.json())
        .then(projects => {
            const promises = projects.map(project => 
                fetch(`/api/admin/projects/${project.prj_id}?hard=true`, {
                    method: 'DELETE'
                })
            );
            return Promise.all(promises);
        })
        .then(() => {
            showNotification('Project trash emptied!', 'success');
            initializeTrashPage();
        })
        .catch(err => alert('Error: ' + err.message));
}

function restoreProject(prjId) {
    // Create confirmation modal with options
    const modal = document.createElement('div');
    modal.id = 'restore-project-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <i class="fa-solid fa-rotate-left" style="font-size: 40px; color: #28a745;"></i>
                <div>
                    <h2 style="margin: 0 0 8px 0; color: var(--fg-212529); font-size: 1.5em;">Restore Project</h2>
                    <p style="margin: 0; color: var(--fg-6c757d);">Choose what to restore</p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: flex; align-items: center; padding: 15px; background: var(--bg-fff); border: 2px solid var(--bd-dee2e6); border-radius: 8px; cursor: pointer; margin-bottom: 12px; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='#28a745'; this.style.background='var(--bg-f0fff4)'"
                       onmouseout="this.style.borderColor='var(--bd-dee2e6)'; this.style.background='var(--bg-fff)'">
                    <input type="radio" name="restore-option" value="with-tasks" checked 
                           style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                    <div>
                        <div style="font-weight: 600; color: var(--fg-212529); margin-bottom: 4px;">Restore project and all its tasks</div>
                        <div style="font-size: 0.9em; color: var(--fg-6c757d);">Restore the project and all deleted tasks that belong to it</div>
                    </div>
                </label>
                
                <label style="display: flex; align-items: center; padding: 15px; background: var(--bg-fff); border: 2px solid var(--bd-dee2e6); border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                       onmouseover="this.style.borderColor='#007bff'; this.style.background='var(--bg-f0f8ff)'"
                       onmouseout="this.style.borderColor='var(--bd-dee2e6)'; this.style.background='var(--bg-fff)'">
                    <input type="radio" name="restore-option" value="project-only" 
                           style="margin-right: 12px; width: 20px; height: 20px; cursor: pointer;">
                    <div>
                        <div style="font-weight: 600; color: var(--fg-212529); margin-bottom: 4px;">Restore project only</div>
                        <div style="font-size: 0.9em; color: var(--fg-6c757d);">Tasks remain in trash (can be restored separately)</div>
                    </div>
                </label>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="closeRestoreProjectModal()" 
                        style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s;"
                        onmouseover="this.style.background='#5a6268'"
                        onmouseout="this.style.background='#6c757d'">
                    Cancel
                </button>
                <button onclick="confirmRestoreProject('${prjId}')" 
                        style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; 
                               cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px;
                               transition: all 0.2s;"
                        onmouseover="this.style.background='#218838'"
                        onmouseout="this.style.background='#28a745'">
                    <i class="fa-solid fa-rotate-left"></i>
                    Restore
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeRestoreProjectModal() {
    const modal = document.getElementById('restore-project-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmRestoreProject(prjId) {
    const modal = document.getElementById('restore-project-modal');
    const selectedOption = modal.querySelector('input[name="restore-option"]:checked').value;
    const restoreTasks = selectedOption === 'with-tasks';
    
    closeRestoreProjectModal();
    
    // First restore the project
    fetch(`/api/admin/projects/${prjId}/restore`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(() => {
            if (restoreTasks) {
                // Restore all deleted tasks for this project
                return fetch('/api/tasks?include_deleted=true')
                    .then(r => r.json())
                    .then(tasks => {
                        const projectTasks = tasks.filter(t => t.is_deleted === 1 && t.project_id === prjId);
                        if (projectTasks.length === 0) {
                            return Promise.resolve();
                        }
                        const promises = projectTasks.map(t => 
                            fetch(`/api/tasks/${t.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ is_deleted: 0 })
                            })
                        );
                        return Promise.all(promises);
                    });
            }
            return Promise.resolve();
        })
        .then(() => {
            showNotification(`Project restored${restoreTasks ? ' with tasks' : ''}!`, 'success');
            initializeTrashPage();
            // Refresh lookups
            return fetch('/api/lookups');
        })
        .then(r => r.json())
        .then(data => {
            lookupData = data;
        })
        .catch(err => {
            console.error('Restore project error:', err);
            alert('Error: ' + err.message);
        });
}

function permanentlyDeleteProject(prjId) {
    if (!confirm('Permanently delete this project record? Tasks will remain in the database with their project references intact. This cannot be undone.')) return;
    
    fetch(`/api/admin/projects/${prjId}?hard=true`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(() => {
            showNotification('Project permanently deleted', 'success');
            initializeTrashPage();
        })
        .catch(err => alert('Error: ' + err.message));
}

// ========================================================================
//                        IMPORT TASKS FROM CSV/EXCEL
// ========================================================================

/**
 * Open import tasks modal
 */
function openImportTasksModal() {
    // Ensure lookupData is loaded before allowing import
    if (!lookupData.projects || !lookupData.categories) {
        console.log('Loading lookup data for import...');
        fetch('/api/lookups')
            .then(r => r.json())
            .then(data => {
                lookupData = data;
                console.log('Lookup data loaded:', {
                    projects: lookupData.projects?.length || 0,
                    categories: lookupData.categories?.length || 0
                });
                showImportModal();
            })
            .catch(error => {
                console.error('Failed to load lookup data:', error);
                alert('Failed to load projects/categories. Please refresh and try again.');
            });
    } else {
        showImportModal();
    }
}

/**
 * Show the import modal (called after lookupData is loaded)
 */
function showImportModal() {
    const modal = document.createElement('div');
    modal.id = 'import-tasks-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 8px; padding: 30px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin: 0 0 20px 0; color: var(--fg-212529);">
                <i class="fa-solid fa-file-import"></i> Import Tasks
            </h2>
            
            <div style="margin-bottom: 20px; padding: 15px; background-color: var(--bg-e7f3ff); border-left: 4px solid #007bff; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-weight: 600;">Required Columns:</p>
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>title</strong> - Task title (required)</li>
                </ul>
                <p style="margin: 10px 0 0 0; font-weight: 600;">Optional Columns:</p>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>description, status, priority, start_date, due_date, project, category, etc.</li>
                </ul>
                <p style="margin: 10px 0 0 0; font-size: 0.85em; color: #28a745;">
                    <strong>✓ Loaded:</strong> ${lookupData.projects?.length || 0} projects, ${lookupData.categories?.length || 0} categories
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Upload CSV or Excel File:</label>
                <input type="file" id="import-file-input" accept=".csv,.xlsx,.xls" 
                       style="width: 100%; padding: 10px; border: 2px dashed var(--bd-ced4da); border-radius: 4px; cursor: pointer;">
                <p style="margin: 5px 0 0 0; font-size: 0.85em; color: var(--fg-6c757d);">Supported: CSV, Excel (.xlsx, .xls)</p>
            </div>
            
            <div id="import-preview" style="margin-bottom: 20px; display: none;">
                <h3 style="margin: 0 0 10px 0;">Preview (First 5 rows):</h3>
                <div id="import-preview-content" style="overflow-x: auto; border: 1px solid var(--bd-dee2e6); border-radius: 4px;"></div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeImportTasksModal()" 
                        style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fa-solid fa-times"></i> Cancel
                </button>
                <button id="confirm-import-btn" onclick="confirmImportTasks()" disabled
                        style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; opacity: 0.5;">
                    <i class="fa-solid fa-check"></i> Import Tasks
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle file selection
    document.getElementById('import-file-input').addEventListener('change', handleImportFileSelect);
}

/**
 * Close import modal
 */
function closeImportTasksModal() {
    const modal = document.getElementById('import-tasks-modal');
    if (modal) modal.remove();
}

// Store parsed data globally
let importedTasksData = null;

/**
 * Bug-18: Validate imported data against lookup tables
 */
function validateImportData(data) {
    const warnings = [];
    const lookupFields = {
        'status': { values: (lookupData.lkp_status || []).map(s => s.name.toLowerCase()), label: 'Status' },
        'Status': { values: (lookupData.lkp_status || []).map(s => s.name.toLowerCase()), label: 'Status' },
        'status_name': { values: (lookupData.lkp_status || []).map(s => s.name.toLowerCase()), label: 'Status' },
        'priority': { values: (lookupData.lkp_priority || []).map(p => p.name.toLowerCase()), label: 'Priority' },
        'Priority': { values: (lookupData.lkp_priority || []).map(p => p.name.toLowerCase()), label: 'Priority' },
        'priority_name': { values: (lookupData.lkp_priority || []).map(p => p.name.toLowerCase()), label: 'Priority' },
        'stage': { values: (lookupData.lkp_stage || []).map(s => s.name.toLowerCase()), label: 'Stage' },
        'Stage': { values: (lookupData.lkp_stage || []).map(s => s.name.toLowerCase()), label: 'Stage' },
        'stage_name': { values: (lookupData.lkp_stage || []).map(s => s.name.toLowerCase()), label: 'Stage' }
    };
    
    data.forEach((row, idx) => {
        Object.keys(row).forEach(field => {
            if (lookupFields[field] && row[field]) {
                const value = String(row[field]).trim().toLowerCase();
                const validValues = lookupFields[field].values;
                
                if (value && !validValues.includes(value)) {
                    warnings.push({
                        row: idx + 1,
                        field: lookupFields[field].label,
                        value: row[field],
                        validValues: validValues.join(', ')
                    });
                }
            }
        });
    });
    
    return { warnings, totalRows: data.length };
}

/**
 * Handle file selection for import
 */
function handleImportFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    const fileExt = fileName.split('.').pop();
    
    if (fileExt === 'csv') {
        parseCSVFile(file);
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        parseExcelFile(file);
    } else {
        alert('Unsupported file format. Please upload CSV or Excel file.');
    }
}

/**
 * Parse CSV file
 */
function parseCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        
        if (rows.length < 2) {
            alert('File is empty or has no data rows.');
            return;
        }
        
        // Parse CSV
        const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];
        
        for (let i = 1; i < rows.length; i++) {
            const values = parseCSVRow(rows[i]);
            const obj = {};
            headers.forEach((header, idx) => {
                obj[header] = values[idx] || '';
            });
            data.push(obj);
        }
        
        importedTasksData = data;
        
        // Bug-18: Validate lookup values before preview
        const validationResults = validateImportData(data);
        displayImportPreview(headers, data, validationResults);
    };
    reader.readAsText(file);
}

/**
 * Parse CSV row handling quotes
 */
function parseCSVRow(row) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    return values;
}

/**
 * Parse Excel file using SheetJS
 */
function parseExcelFile(file) {
    // Check if SheetJS is available
    if (typeof XLSX === 'undefined') {
        alert('Excel parsing library not loaded. Please use CSV format instead.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
                alert('Excel file is empty or has no data rows.');
                return;
            }
            
            const headers = Object.keys(jsonData[0]);
            importedTasksData = jsonData;
            
            // Bug-18: Validate lookup values before preview
            const validationResults = validateImportData(jsonData);
            displayImportPreview(headers, jsonData, validationResults);
        } catch (error) {
            console.error('Error parsing Excel:', error);
            alert('Failed to parse Excel file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Display preview of imported data
 */
function displayImportPreview(headers, data, validationResults) {
    const preview = document.getElementById('import-preview');
    const content = document.getElementById('import-preview-content');
    
    // Check if 'title' column exists
    const hasTitle = headers.some(h => h.toLowerCase() === 'title');
    if (!hasTitle) {
        alert('Error: CSV/Excel must have a "title" column!');
        return;
    }
    
    let html = '';
    
    // Bug-18: Show validation warnings if any
    if (validationResults && validationResults.warnings.length > 0) {
        html += `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">
                    <i class="fa-solid fa-exclamation-triangle"></i> Validation Warnings (${validationResults.warnings.length})
                </h4>
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 0.9em;">
                    The following lookup values don't match existing data. These fields will be skipped during import.
                </p>
                <div style="max-height: 150px; overflow-y: auto; background: var(--bg-fff); padding: 10px; border-radius: 4px;">
        `;
        
        validationResults.warnings.forEach(w => {
            html += `
                <div style="font-size: 0.85em; color: #856404; margin-bottom: 5px;">
                    Row ${w.row}: <strong>${w.field}</strong> = "${w.value}" 
                    <span style="color: var(--fg-6c757d);">(Valid: ${w.validValues})</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button onclick="proceedWithImport()" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-check"></i> Proceed Anyway
                    </button>
                    <button onclick="cancelImport()" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-times"></i> Cancel & Fix Data
                    </button>
                </div>
            </div>
        `;
    }
    
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;"><thead><tr>';
    
    headers.forEach(header => {
        html += `<th style="padding: 8px; border: 1px solid var(--bd-dee2e6); background-color: var(--bg-f8f9fa); text-align: left; white-space: nowrap;">${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Show first 5 rows
    const previewRows = data.slice(0, 5);
    previewRows.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            const value = row[header] || '';
            html += `<td style="padding: 8px; border: 1px solid var(--bd-dee2e6);">${value}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    if (data.length > 5) {
        html += `<p style="margin: 10px 0 0 0; font-size: 0.85em; color: var(--fg-6c757d);">...and ${data.length - 5} more rows</p>`;
    }
    
    content.innerHTML = html;
    preview.style.display = 'block';
    
    // Enable import button only if no warnings OR user hasn't been warned yet
    const btn = document.getElementById('confirm-import-btn');
    if (!validationResults || validationResults.warnings.length === 0) {
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
}

/**
 * Confirm and import tasks
 */
function confirmImportTasks() {
    if (!importedTasksData || importedTasksData.length === 0) {
        showNotification('No data to import.', 'warning');
        return;
    }
    
    const btn = document.getElementById('confirm-import-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';
    
    // First, collect all unique project and category names from import data
    const projectNames = new Set();
    const categoryNames = new Set();
    
    importedTasksData.forEach(taskData => {
        const project = taskData.project_id || taskData.Project || taskData.project;
        const category = taskData.category_id || taskData.Category || taskData.category;
        
        if (project && typeof project === 'string' && project.trim() && isNaN(project)) {
            projectNames.add(project.trim());
        }
        if (category && typeof category === 'string' && category.trim() && isNaN(category)) {
            categoryNames.add(category.trim());
        }
    });
    
    console.log('[DEBUG] Import - Projects to check:', Array.from(projectNames));
    console.log('[DEBUG] Import - Categories to check:', Array.from(categoryNames));
    
    // Create missing projects and categories
    const createPromises = [];
    
    projectNames.forEach(name => {
        if (!name) return; // Skip empty names
        const exists = lookupData.projects && lookupData.projects.find(p => 
            p.name && p.name.trim().toLowerCase() === name.toLowerCase()
        );
        if (!exists) {
            console.log('[DEBUG] Creating project:', name);
            createPromises.push(
                fetch('/api/admin/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name })
                })
                .then(r => r.json())
                .then(newProject => {
                    if (!lookupData.projects) lookupData.projects = [];
                    lookupData.projects.push(newProject);
                    console.log('[DEBUG] Created project:', newProject);
                })
            );
        }
    });
    
    categoryNames.forEach(name => {
        if (!name) return; // Skip empty names
        const exists = lookupData.categories && lookupData.categories.find(c => 
            c.name && c.name.trim().toLowerCase() === name.toLowerCase()
        );
        if (!exists) {
            console.log('[DEBUG] Creating category:', name);
            createPromises.push(
                fetch('/api/data_model/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name })
                })
                .then(r => r.json())
                .then(newCategory => {
                    if (!lookupData.categories) lookupData.categories = [];
                    lookupData.categories.push(newCategory);
                    console.log('[DEBUG] Created category:', newCategory);
                })
            );
        }
    });
    
    // Wait for all projects/categories to be created, then import tasks
    Promise.all(createPromises)
    .then(() => {
        console.log('[DEBUG] All projects/categories created, starting task import');
        return importTasksAfterSetup();
    })
    .catch(err => {
        console.error('[DEBUG] Error creating projects/categories:', err);
        alert('Error creating projects/categories: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Import';
    });
}

function importTasksAfterSetup() {
    // Import tasks one by one
    let imported = 0;
    let failed = 0;
    const errors = [];
    
    const importPromises = importedTasksData.map((taskData, index) => {
        // Map CSV columns to task fields
        const task = {
            title: taskData.title || taskData.Title || `Imported Task ${index + 1}`,
            description: taskData.description || taskData.Description || '',
            status_name: taskData.status || taskData.Status || taskData.status_name || taskData.Status_Name || 'TBD',
            priority_name: taskData.priority || taskData.Priority || taskData.priority_name || taskData.Priority_Name || 'Medium',
            start_date: taskData.start_date || taskData.Start_Date || taskData['Start Date'] || null,
            due_date: taskData.due_date || taskData.Due_Date || taskData['Due Date'] || null,
            actual_start: taskData.actual_start || taskData.Actual_Start || null,
            actual_end: taskData.actual_end || taskData.Actual_End || null,
            project_id: taskData.project_id || taskData.Project || taskData.project || null,
            category_id: taskData.category_id || taskData.Category || taskData.category || null,
            subcategory_id: taskData.subcategory_id || taskData['Sub-Category'] || taskData.subcategory || taskData.Subcategory || taskData['SubCategory'] || null,
            is_archived: 0
        };
        
        // Bug-18: Validate status against lookup table
        if (task.status_name) {
            const validStatus = (lookupData.lkp_status || []).find(s => 
                s.name.toLowerCase() === task.status_name.toLowerCase()
            );
            if (!validStatus) {
                console.warn(`Row ${index + 1}: Invalid status "${task.status_name}", using default "TBD"`);
                task.status_name = 'TBD';
            }
        }
        
        // Bug-18: Validate priority against lookup table
        if (task.priority_name) {
            const validPriority = (lookupData.lkp_priority || []).find(p => 
                p.name.toLowerCase() === task.priority_name.toLowerCase()
            );
            if (!validPriority) {
                console.warn(`Row ${index + 1}: Invalid priority "${task.priority_name}", using default "Medium"`);
                task.priority_name = 'Medium';
            }
        }
        
        // If project is a name, try to find its ID (case-insensitive, trimmed)
        if (task.project_id && isNaN(task.project_id)) {
            const projectName = String(task.project_id).trim().toLowerCase();
            const project = lookupData.projects.find(p => 
                p.name.trim().toLowerCase() === projectName
            );
            task.project_id = project ? project.prj_id : null;
            
            // Debug: log if project not found
            if (!project) {
                console.warn(`Project not found: "${task.project_id}" (looked for: "${projectName}")`);
                console.log('Available projects:', lookupData.projects.map(p => p.name));
            }
        }
        
        // If category is a name, try to find its ID (case-insensitive, trimmed)
        if (task.category_id && isNaN(task.category_id)) {
            const categoryName = String(task.category_id).trim().toLowerCase();
            const category = lookupData.categories.find(c => 
                c.name.trim().toLowerCase() === categoryName
            );
            task.category_id = category ? category.cat_id : null;
            
            // Debug: log if category not found
            if (!category) {
                console.warn(`Category not found: "${task.category_id}" (looked for: "${categoryName}")`);
                console.log('Available categories:', lookupData.categories.map(c => c.name));
            }
        }
        
        // If subcategory is a name, try to find its ID (case-insensitive, trimmed)
        if (task.subcategory_id && isNaN(task.subcategory_id)) {
            const subcategoryName = String(task.subcategory_id).trim().toLowerCase();
            const subcategory = (lookupData.subcategories || []).find(sc => 
                sc.name.trim().toLowerCase() === subcategoryName
            );
            task.subcategory_id = subcategory ? subcategory.scat_id : null;
            
            // Debug: log if subcategory not found
            if (!subcategory) {
                console.warn(`Subcategory not found: "${task.subcategory_id}" (looked for: "${subcategoryName}")`);
                console.log('Available subcategories:', (lookupData.subcategories || []).map(sc => sc.name));
            }
        }
        
        return fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        })
        .then(response => {
            if (response.ok) {
                imported++;
            } else {
                failed++;
                return response.text().then(text => {
                    errors.push(`Row ${index + 1}: ${text}`);
                });
            }
        })
        .catch(error => {
            failed++;
            errors.push(`Row ${index + 1}: ${error.message}`);
        });
    });
    
    Promise.all(importPromises)
    .then(() => {
        const successMsg = `Successfully imported ${imported} task(s)`;
        const errorMsg = failed > 0 ? `. ${failed} failed` : '';
        showNotification(successMsg + errorMsg, failed > 0 ? 'warning' : 'success', 6000);
        
        if (errors.length > 0 && failed > 0) {
            console.log('Import errors:', errors);
        }
        
        closeImportTasksModal();
        loadAllTasks();
        renderTasksTable();
        
        // Re-enable button
        const btn = document.getElementById('confirm-import-btn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Import';
        }
    })
    .catch(err => {
        showNotification('Import error: ' + err.message, 'error');
        const btn = document.getElementById('confirm-import-btn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Import';
        }
    });
}

// ========================================================================
//                        EXPORT TASKS TO EXCEL
// ========================================================================

/**
 * Export all tasks to Excel file
 */
function exportTasksToExcel() {
    console.log('[Export] Starting task export to Excel...');
    
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            // Filter out deleted tasks
            const activeTasks = tasks.filter(t => t.is_deleted === 0);
            
            if (activeTasks.length === 0) {
                showNotification('No tasks to export', 'info');
                return;
            }
            
            // Prepare data for Excel - include ALL columns from tasks table
            const exportData = activeTasks.map(task => ({
                'ID': task.id,
                'Title': task.title || '',
                'Status': task.status_name || '',
                'Priority': task.priority_name || '',
                'Stage': task.stage_name || '',
                'Environment': task.environment_name || '',
                'Category': task.category_id || '',
                'Sub-Category': task.subcategory_id || '',
                'Project': task.project_id || '',
                'Service': task.service_component || '',
                'Assigned To': task.assigned_to || '',
                'Text Col 3': task.text_col_3 || '',
                'Text Col 4': task.template_source || '',
                'Text Col 5': task.blocked_by || '',
                'File': task.file || '',
                'URL': task.url || '',
                'Task Group': task.task_group || '',
                'Comments': task.comments || '',
                'Description': task.task_description || '',
                'Due Date': task.due_date || '',
                'Reminder Date': task.reminder_date || '',
                'Created At': task.created_at || '',
                'Is Archived': task.is_archived || 0,
                'Archived At': task.archived_at || ''
            }));
            
            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
            
            // Auto-size columns
            const max_width = exportData.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
            ws['!cols'] = Array(max_width).fill({ wch: 15 });
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `SynAppz_Tasks_${timestamp}.xlsx`;
            
            // Download file
            XLSX.writeFile(wb, filename);
            
            console.log(`[Export] Exported ${activeTasks.length} tasks to ${filename}`);
            showNotification(`Exported ${activeTasks.length} tasks successfully!`, 'success');
        })
        .catch(error => {
            console.error('[Export] Error:', error);
            showNotification('Failed to export tasks: ' + error.message, 'error');
        });
}

// Expose export function globally
window.exportTasksToExcel = exportTasksToExcel;


// Expose new Projects page functions
window.openCreateProjectModal = openCreateProjectModal;
window.closeCreateProjectModal = closeCreateProjectModal;
window.handleCreateProject = handleCreateProject;
window.toggleHideCompletedProjects = toggleHideCompletedProjects;
window.toggleHideCompletedTasks = toggleHideCompletedTasks;
window.handleGeneralSearch = handleGeneralSearch;

/**
 * Toggle page visibility (Feature-4)
 */
function togglePageVisibility(pageName, visible) {
    // Map page names to actual nav IDs (FAQ pages have different naming)
    const idMap = {
        'quick-links': 'nav-faq-quicklinks',
        'quick-info': 'nav-faq-quickinfo',
        'logs': 'nav-faq-logs'
    };
    
    const navId = idMap[pageName] || `nav-${pageName}`;
    const pageElement = document.getElementById(navId);
    
    if (pageElement) {
        pageElement.style.display = visible ? 'flex' : 'none';
    }
    updateNavSeparators();
    
    // Bug-34: Save to database instead of localStorage
    getPreference('page_visibility', {}).then(visibility => {
        visibility[pageName] = visible;
        savePreference('page_visibility', visibility);
    });
}

window.togglePageVisibility = togglePageVisibility;
window.toggleProjectGroupBy = toggleProjectGroupBy;

// ========================================================================
//                           DASHBOARD PAGE
// ========================================================================

// ========================================================================

let dashboardFilter = {
    groupBy: 'status_name',
    projectFilter: null,
    categoryFilter: null,
    dateRange: 'all', // 'week', 'month', 'quarter', 'all'
    chartType: 'bar'
};

let dashboardCharts = {}; // Store multiple chart instances

function initializeDashboard() {
    const container = document.getElementById('dashboard-container');
    container.innerHTML = '<p>Loading dashboard...</p>';
    
    Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json())
    ])
    .then(([tasks, lookups]) => {
        allTasks = tasks;
        lookupData = lookups;
        renderDashboard();
    })
    .catch(error => {
        container.innerHTML = `<p style="color:red;">Error loading dashboard: ${error.message}</p>`;
    });
}

function renderDashboard() {
    applyChartTheme();
    const container = document.getElementById('dashboard-container');
    const activeTasks = allTasks.filter(t => t.is_archived === 0 && !t.is_deleted);
    
    // Apply filters
    let filteredTasks = activeTasks;
    if (dashboardFilter.projectFilter) {
        filteredTasks = filteredTasks.filter(t => t.project_id === dashboardFilter.projectFilter);
    }
    if (dashboardFilter.categoryFilter) {
        filteredTasks = filteredTasks.filter(t => t.category_id === dashboardFilter.categoryFilter);
    }
    
    // Date range filter
    if (dashboardFilter.dateRange !== 'all') {
        const now = new Date();
        const cutoff = new Date();
        if (dashboardFilter.dateRange === 'week') cutoff.setDate(now.getDate() - 7);
        else if (dashboardFilter.dateRange === 'month') cutoff.setMonth(now.getMonth() - 1);
        else if (dashboardFilter.dateRange === 'quarter') cutoff.setMonth(now.getMonth() - 3);
        
        filteredTasks = filteredTasks.filter(t => {
            if (!t.created_date) return false;
            const created = new Date(t.created_date);
            return created >= cutoff;
        });
    }
    
    // Calculate stats
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status_name === 'Done').length;
    const inProgressTasks = filteredTasks.filter(t => t.status_name === 'In Progress').length;
    const tbdTasks = filteredTasks.filter(t => t.status_name === 'TBD').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = filteredTasks.filter(t => {
        if (!t.due_date || t.status_name === 'Done') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
    }).length;
    
    // Due this week
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const dueThisWeek = filteredTasks.filter(t => {
        if (!t.due_date || t.status_name === 'Done') return false;
        const dueDate = new Date(t.due_date);
        return dueDate >= today && dueDate <= weekFromNow;
    }).length;
    
    let html = `
        <div style="margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: var(--fg-212529); display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-chart-line"></i> Dashboard Analytics
            </h2>
            
            <!-- Filter Controls -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">
                            <i class="fa-solid fa-layer-group"></i> Group By:
                        </label>
                        <select id="dashboard-groupby" onchange="updateDashboardGroupBy(this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 0.95em;">
                            <option value="status_name" ${dashboardFilter.groupBy === 'status_name' ? 'selected' : ''}>Status</option>
                            <option value="stage_name" ${dashboardFilter.groupBy === 'stage_name' ? 'selected' : ''}>Stage</option>
                            <option value="priority_name" ${dashboardFilter.groupBy === 'priority_name' ? 'selected' : ''}>Priority</option>
                            <option value="category_id" ${dashboardFilter.groupBy === 'category_id' ? 'selected' : ''}>Category</option>
                            <option value="subcategory_id" ${dashboardFilter.groupBy === 'subcategory_id' ? 'selected' : ''}>Sub-Category</option>
                            <option value="project_id" ${dashboardFilter.groupBy === 'project_id' ? 'selected' : ''}>Project</option>
                            <option value="task_group" ${dashboardFilter.groupBy === 'task_group' ? 'selected' : ''}>Task Group</option>
                            <option value="comments" ${dashboardFilter.groupBy === 'comments' ? 'selected' : ''}>Assigned To</option>
                            <option value="task_description" ${dashboardFilter.groupBy === 'task_description' ? 'selected' : ''}>Service/Component</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">
                            <i class="fa-solid fa-diagram-project"></i> Project:
                        </label>
                        <select id="dashboard-project-filter" onchange="updateDashboardProjectFilter(this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 0.95em;">
                            <option value="">All Projects</option>
                            ${(lookupData.projects || []).map(p => 
                                `<option value="${p.prj_id}" ${dashboardFilter.projectFilter === p.prj_id ? 'selected' : ''}>${p.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">
                            <i class="fa-solid fa-folder"></i> Category:
                        </label>
                        <select id="dashboard-category-filter" onchange="updateDashboardCategoryFilter(this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 0.95em;">
                            <option value="">All Categories</option>
                            ${(lookupData.categories || []).map(c => 
                                `<option value="${c.cat_id}" ${dashboardFilter.categoryFilter === c.cat_id ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--fg-495057);">
                            <i class="fa-solid fa-calendar-days"></i> Time Range:
                        </label>
                        <select id="dashboard-date-range" onchange="updateDateRange(this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 0.95em;">
                            <option value="all" ${dashboardFilter.dateRange === 'all' ? 'selected' : ''}>All Time</option>
                            <option value="week" ${dashboardFilter.dateRange === 'week' ? 'selected' : ''}>Last 7 Days</option>
                            <option value="month" ${dashboardFilter.dateRange === 'month' ? 'selected' : ''}>Last Month</option>
                            <option value="quarter" ${dashboardFilter.dateRange === 'quarter' ? 'selected' : ''}>Last Quarter</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Stats Cards Row 1 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="highlightStat('total')">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">Total Tasks</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${totalTasks}</div>
                        </div>
                        <i class="fa-solid fa-tasks" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="highlightStat('progress')">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">In Progress</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${inProgressTasks}</div>
                        </div>
                        <i class="fa-solid fa-spinner" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="highlightStat('completed')">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">Completed</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${completedTasks}</div>
                        </div>
                        <i class="fa-solid fa-check-circle" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="highlightStat('tbd')">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">To Be Done</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${tbdTasks}</div>
                        </div>
                        <i class="fa-solid fa-clock" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">Completion Rate</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${completionRate}%</div>
                        </div>
                        <i class="fa-solid fa-chart-pie" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="showOverdueTasks()">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">Overdue</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${overdueTasks}</div>
                        </div>
                        <i class="fa-solid fa-exclamation-triangle" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="showDueSoonTasks()">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 8px;">Due This Week</div>
                            <div style="font-size: 2.2em; font-weight: 700;">${dueThisWeek}</div>
                        </div>
                        <i class="fa-solid fa-calendar-check" style="font-size: 2.5em; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
            
            <!-- Chart Toggle Buttons -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; gap: 10px; align-items: center; justify-content: center;">
                <button onclick="updateChartType('bar')" style="padding: 10px 20px; background-color: ${dashboardFilter.chartType === 'bar' ? '#007bff' : 'var(--bg-e9ecef)'}; color: ${dashboardFilter.chartType === 'bar' ? 'white' : 'var(--fg-495057)'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    <i class="fa-solid fa-chart-bar"></i> Bar Chart
                </button>
                <button onclick="updateChartType('pie')" style="padding: 10px 20px; background-color: ${dashboardFilter.chartType === 'pie' ? '#007bff' : 'var(--bg-e9ecef)'}; color: ${dashboardFilter.chartType === 'pie' ? 'white' : 'var(--fg-495057)'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    <i class="fa-solid fa-chart-pie"></i> Pie Chart
                </button>
                <button onclick="updateChartType('doughnut')" style="padding: 10px 20px; background-color: ${dashboardFilter.chartType === 'doughnut' ? '#007bff' : 'var(--bg-e9ecef)'}; color: ${dashboardFilter.chartType === 'doughnut' ? 'white' : 'var(--fg-495057)'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    <i class="fa-solid fa-circle-notch"></i> Doughnut
                </button>
                <button onclick="updateChartType('line')" style="padding: 10px 20px; background-color: ${dashboardFilter.chartType === 'line' ? '#007bff' : 'var(--bg-e9ecef)'}; color: ${dashboardFilter.chartType === 'line' ? 'white' : 'var(--fg-495057)'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    <i class="fa-solid fa-chart-line"></i> Line Chart
                </button>
            </div>
            
            <!-- Main Chart -->
            <div style="background: var(--bg-fff); border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                <h3 style="margin: 0 0 20px 0; color: var(--fg-212529); display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-chart-column"></i> Tasks Distribution by ${getGroupByLabel(dashboardFilter.groupBy)}
                </h3>
                <div style="position: relative; height: 400px;">
                    <canvas id="dashboard-chart-main"></canvas>
                </div>
            </div>
            
            <!-- Secondary Charts Row -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
                <!-- Status Breakdown -->
                <div style="background: var(--bg-fff); border-radius: 8px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 15px 0; color: var(--fg-212529); display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-list-check"></i> Status Breakdown
                    </h4>
                    <div style="position: relative; height: 250px;">
                        <canvas id="dashboard-chart-status"></canvas>
                    </div>
                </div>
                
                <!-- Priority Distribution -->
                <div style="background: var(--bg-fff); border-radius: 8px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 15px 0; color: var(--fg-212529); display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid fa-signal"></i> Priority Distribution
                    </h4>
                    <div style="position: relative; height: 250px;">
                        <canvas id="dashboard-chart-priority"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Render all charts
    renderMainChart(filteredTasks);
    renderStatusChart(filteredTasks);
    renderPriorityChart(filteredTasks);
}

function getGroupByLabel(groupBy) {
    const labels = {
        'status_name': 'Status',
        'stage_name': 'Stage',
        'priority_name': 'Priority',
        'category_id': 'Category',
        'subcategory_id': 'Sub-Category',
        'project_id': 'Project',
        'task_group': 'Task Group',
        'comments': 'Assigned To',
        'task_description': 'Service/Component'
    };
    return labels[groupBy] || groupBy;
}

function groupTasks(tasks, groupBy) {
    const grouped = {};
    
    tasks.forEach(task => {
        let key = task[groupBy] || 'Unassigned';
        
        // Convert IDs to names for lookups
        if (groupBy === 'project_id' && lookupData.projects) {
            const project = lookupData.projects.find(p => p.prj_id === key);
            key = project ? project.name : 'Unassigned';
        } else if (groupBy === 'category_id' && lookupData.categories) {
            const category = lookupData.categories.find(c => c.cat_id === key);
            key = category ? category.name : 'Unassigned';
        } else if (groupBy === 'subcategory_id' && lookupData.subcategories) {
            const subcategory = lookupData.subcategories.find(sc => sc.scat_id === key);
            key = subcategory ? subcategory.name : 'Unassigned';
        }
        
        grouped[key] = (grouped[key] || 0) + 1;
    });
    
    return grouped;
}

const chartColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', 
    '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#ff7675', '#74b9ff', '#a29bfe', '#fd79a8', '#fdcb6e'
];

function renderMainChart(tasks) {
    const canvas = document.getElementById('dashboard-chart-main');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const grouped = groupTasks(tasks, dashboardFilter.groupBy);
    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
    
    if (dashboardCharts.main) {
        dashboardCharts.main.destroy();
    }
    
    dashboardCharts.main = new Chart(ctx, {
        type: dashboardFilter.chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Tasks',
                data: data,
                backgroundColor: chartColors,
                borderColor: chartColors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: ['pie', 'doughnut'].includes(dashboardFilter.chartType),
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} tasks (${percentage}%)`;
                        }
                    }
                }
            },
            scales: ['bar', 'line'].includes(dashboardFilter.chartType) ? {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            } : {}
        }
    });
}

function renderStatusChart(tasks) {
    const canvas = document.getElementById('dashboard-chart-status');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const grouped = groupTasks(tasks, 'status_name');
    
    if (dashboardCharts.status) {
        dashboardCharts.status.destroy();
    }
    
    dashboardCharts.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(grouped),
            datasets: [{
                data: Object.values(grouped),
                backgroundColor: ['#6c757d', '#007bff', '#28a745', '#ffc107', '#dc3545'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderPriorityChart(tasks) {
    const canvas = document.getElementById('dashboard-chart-priority');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const grouped = groupTasks(tasks, 'priority_name');
    
    if (dashboardCharts.priority) {
        dashboardCharts.priority.destroy();
    }
    
    dashboardCharts.priority = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(grouped),
            datasets: [{
                label: 'Tasks',
                data: Object.values(grouped),
                backgroundColor: '#667eea',
                borderColor: '#764ba2',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function updateDashboardGroupBy(value) {
    dashboardFilter.groupBy = value;
    renderDashboard();
}

function updateDashboardProjectFilter(value) {
    dashboardFilter.projectFilter = value || null;
    renderDashboard();
}

function updateDashboardCategoryFilter(value) {
    dashboardFilter.categoryFilter = value || null;
    renderDashboard();
}

function updateDateRange(value) {
    dashboardFilter.dateRange = value;
    renderDashboard();
}

function updateChartType(type) {
    dashboardFilter.chartType = type;
    renderDashboard();
}

function highlightStat(type) {
    console.log('Stat clicked:', type);
}

function showOverdueTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = allTasks.filter(t => {
        if (t.is_archived || t.is_deleted) return false;
        if (!t.due_date || t.status_name === 'Done') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
    });
    
    if (overdue.length === 0) {
        showNotification('No overdue tasks!', 'success');
    } else {
        showNotification(`${overdue.length} overdue tasks found. Check Tasks page.`, 'warning');
    }
}

function showDueSoonTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    const dueSoon = allTasks.filter(t => {
        if (t.is_archived || t.is_deleted) return false;
        if (!t.due_date || t.status_name === 'Done') return false;
        const dueDate = new Date(t.due_date);
        return dueDate >= today && dueDate <= weekFromNow;
    });
    
    if (dueSoon.length === 0) {
        showNotification('No tasks due this week!', 'success');
    } else {
        showNotification(`${dueSoon.length} tasks due this week.`, 'info');
    }
}

window.updateDashboardGroupBy = updateDashboardGroupBy;
window.updateDashboardProjectFilter = updateDashboardProjectFilter;
window.updateDashboardCategoryFilter = updateDashboardCategoryFilter;
window.updateDateRange = updateDateRange;
window.updateChartType = updateChartType;
window.highlightStat = highlightStat;
window.showOverdueTasks = showOverdueTasks;
window.showDueSoonTasks = showDueSoonTasks;


/**
 * Bug-18: Proceed with import despite warnings
 */
function proceedWithImport() {
    const btn = document.getElementById('confirm-import-btn');
    btn.disabled = false;
    btn.style.opacity = '1';
    showNotification('Import enabled. Invalid lookup values will be skipped.', 'info');
}

/**
 * Bug-18: Cancel import
 */
function cancelImport() {
    importedTasksData = null;
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-file-input').value = '';
    showNotification('Import cancelled. Please fix your data and try again.', 'info');
}

window.proceedWithImport = proceedWithImport;
window.cancelImport = cancelImport;

/**
 * Feature-24: Set default landing page
 */
function setDefaultLandingPage(pageId) {
    savePreference('default_landing_page', pageId);
    showNotification('Default landing page updated', 'success');
}
window.setDefaultLandingPage = setDefaultLandingPage;


// ========================================================================
//                    USER PREFERENCES (DATABASE-BACKED)
// ========================================================================


/**
 * Load all preferences from database
 */
async function loadPreferences() {
    try {
        const response = await fetch('/api/preferences');
        return await response.json();
    } catch (error) {
        console.error('Error loading preferences:', error);
        return {};
    }
}

/**
 * Save a single preference to database
 */
async function savePreference(key, value) {
    try {
        console.log('[Preferences] Saving:', key, '=', value);
        const response = await fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: JSON.stringify(value) })
        });
        const result = await response.json();
        console.log('[Preferences] Saved successfully:', result);
        return result;
    } catch (error) {
        console.error('[Preferences] Error saving:', error);
        return { success: false };
    }
}

/**
 * Get a single preference from database
 */
async function getPreference(key, defaultValue = null) {
    try {
        const response = await fetch(`/api/preferences/${key}`);
        const data = await response.json();
        return data.value ? JSON.parse(data.value) : defaultValue;
    } catch (error) {
        console.error('Error getting preference:', error);
        return defaultValue;
    }
}


// ========================================================================
//                       FEATURE-21: DARK MODE
// ========================================================================

// ========================================================================
//                    THEME (LIGHT / DARK MODE)
// ========================================================================
// All neutral colours are CSS variables (see styles.css "THEME COLOURS").
// Adding the "dark-mode" class to <html> switches them.

// ========================================================================
//        MOBILE NAVIGATION (slide-out sidebar under ~820px wide)
// ========================================================================
function toggleMobileNav() {
    document.body.classList.toggle('mobile-nav-open');
}
function closeMobileNav() {
    document.body.classList.remove('mobile-nav-open');
}
window.toggleMobileNav = toggleMobileNav;
window.closeMobileNav = closeMobileNav;

function isDarkModeActive() {
    return document.documentElement.classList.contains('dark-mode');
}

function applyTheme(isDark) {
    const changed = isDark !== isDarkModeActive();
    document.documentElement.classList.toggle('dark-mode', isDark);
    if (document.body) document.body.classList.toggle('dark-mode', isDark);
    try { localStorage.setItem('synappz_theme', isDark ? 'dark' : 'light'); } catch (e) { /* ignore */ }

    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
    const checkbox = document.getElementById('dark-mode-toggle');
    if (checkbox) checkbox.checked = isDark;

    // Dashboard charts are drawn on canvas, so redraw them with the new theme colours
    if (changed && document.getElementById('dashboard-container') && typeof renderDashboard === 'function') {
        try { renderDashboard(); } catch (e) { console.warn('[Theme] Dashboard redraw failed', e); }
    }
}

function applyChartTheme() {
    if (typeof Chart === 'undefined') return;
    const dark = isDarkModeActive();
    Chart.defaults.color = dark ? '#c5cbd1' : '#666';
    Chart.defaults.borderColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
}

async function toggleDarkMode(enabled, silent = false) {
    applyTheme(!!enabled);
    await savePreference('dark_mode', !!enabled);
    if (!silent) showNotification(`Dark mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
}
window.toggleDarkMode = toggleDarkMode;

function quickToggleTheme() {
    toggleDarkMode(!isDarkModeActive(), true);
}
window.quickToggleTheme = quickToggleTheme;

// Sync with the saved preference (the database is the source of truth)
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(isDarkModeActive());
    getPreference('dark_mode', false).then(darkMode => {
        const isDark = darkMode === true || darkMode === 'true' || darkMode === '1' || darkMode === 1;
        applyTheme(isDark);
    }).catch(err => console.error('[Theme] Failed to load preference:', err));
});


// ========================================================================
//                   FEATURE-23: HIDE TASKS GLOBAL FILTERS
// ========================================================================

let hideTasksRules = [];

async function loadHideTasksRules() {
    hideTasksRules = await getPreference('hide_tasks_rules', []);
    return hideTasksRules;
}

async function saveHideTasksRules() {
    await savePreference('hide_tasks_rules', hideTasksRules);
    // Reload current page to apply filters
    if (typeof loadTasksData === 'function') {
        await loadTasksData();
    }
}

async function addHideTaskRule() {
    await loadHideTasksRules();
    hideTasksRules.push({
        enabled: true,
        field: 'status_name',
        operator: 'equals',
        value: 'Done'
    });
    await saveHideTasksRules();
    renderHideTasksRules();
}

async function toggleHideTaskRule(index) {
    await loadHideTasksRules();
    hideTasksRules[index].enabled = !hideTasksRules[index].enabled;
    await saveHideTasksRules();
}

async function updateHideTaskRule(index, field, value) {
    await loadHideTasksRules();
    hideTasksRules[index][field] = value;
    await saveHideTasksRules();
    if (field === 'field') {
        renderHideTasksRules(); // Re-render to show correct value options
    }
}

async function deleteHideTaskRule(index) {
    await loadHideTasksRules();
    hideTasksRules.splice(index, 1);
    await saveHideTasksRules();
    renderHideTasksRules();
}

async function renderHideTasksRules() {
    const container = document.getElementById('hide-tasks-rules-list');
    if (!container) return;
    
    await loadHideTasksRules();
    
    if (hideTasksRules.length === 0) {
        container.innerHTML = '<p style="color: var(--fg-6c757d); font-style: italic;">No rules configured. Add a rule to start hiding tasks.</p>';
        return;
    }
    
    // Fetch lookups for dropdowns
    const lookups = await fetch('/api/lookups').then(r => r.json());
    
    let html = '';
    hideTasksRules.forEach((rule, idx) => {
        // Determine if this field has lookup values
        let valueOptions = [];
        if (rule.field === 'status_name') {
            valueOptions = (lookups.lkp_status || []).map(s => s.name);
        } else if (rule.field === 'priority_name') {
            valueOptions = (lookups.lkp_priority || []).map(p => p.name);
        } else if (rule.field === 'stage_name') {
            valueOptions = (lookups.lkp_stage || []).map(s => s.name);
        } else if (rule.field === 'project_id') {
            valueOptions = (lookups.projects || []).map(p => ({ id: p.prj_id, name: p.name }));
        } else if (rule.field === 'category_id') {
            valueOptions = (lookups.categories || []).map(c => ({ id: c.cat_id, name: c.name }));
        }
        
        const hasLookup = valueOptions.length > 0;
        
        html += `
            <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 4px; padding: 15px; margin-bottom: 8px;">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleHideTaskRule(${idx})" style="width: 20px; height: 20px; cursor: pointer;">
                    <select onchange="updateHideTaskRule(${idx}, 'field', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                        <option value="status_name" ${rule.field === 'status_name' ? 'selected' : ''}>Status</option>
                        <option value="priority_name" ${rule.field === 'priority_name' ? 'selected' : ''}>Priority</option>
                        <option value="stage_name" ${rule.field === 'stage_name' ? 'selected' : ''}>Stage</option>
                        <option value="project_id" ${rule.field === 'project_id' ? 'selected' : ''}>Project</option>
                        <option value="category_id" ${rule.field === 'category_id' ? 'selected' : ''}>Category</option>
                        <option value="title" ${rule.field === 'title' ? 'selected' : ''}>Title</option>
                    </select>
                    <select onchange="updateHideTaskRule(${idx}, 'operator', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
                        <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Equals</option>
                        <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Not Equals</option>
                        <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Contains</option>
                    </select>
                    ${hasLookup && (rule.field === 'project_id' || rule.field === 'category_id') ? `
                        <select onchange="updateHideTaskRule(${idx}, 'value', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                            ${valueOptions.map(v => `<option value="${v.id}" ${rule.value === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                        </select>
                    ` : hasLookup ? `
                        <select onchange="updateHideTaskRule(${idx}, 'value', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                            ${valueOptions.map(v => `<option value="${v}" ${rule.value === v ? 'selected' : ''}>${v}</option>`).join('')}
                        </select>
                    ` : `
                        <input type="text" value="${rule.value || ''}" onchange="updateHideTaskRule(${idx}, 'value', this.value)" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; flex: 1;">
                    `}
                    <button onclick="deleteHideTaskRule(${idx})" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Apply hide tasks filter to task array
 */
function applyHideTasksFilter(tasks) {
    if (!hideTasksRules || hideTasksRules.length === 0) {
        return tasks;
    }
    
    const enabledRules = hideTasksRules.filter(r => r.enabled);
    if (enabledRules.length === 0) {
        return tasks;
    }
    
    // Filter out tasks that match ANY rule (OR logic)
    return tasks.filter(task => {
        return !enabledRules.some(rule => {
            const taskValue = task[rule.field];
            const ruleValue = rule.value;
            
            if (rule.operator === 'equals') {
                return taskValue === ruleValue;
            } else if (rule.operator === 'not_equals') {
                return taskValue !== ruleValue;
            } else if (rule.operator === 'contains') {
                return String(taskValue || '').toLowerCase().includes(String(ruleValue || '').toLowerCase());
            }
            return false;
        });
    });
}

// Expose functions globally
window.addHideTaskRule = addHideTaskRule;
window.toggleHideTaskRule = toggleHideTaskRule;
window.updateHideTaskRule = updateHideTaskRule;
window.deleteHideTaskRule = deleteHideTaskRule;
window.renderHideTasksRules = renderHideTasksRules;

// Initialize hide tasks rules on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHideTasksRules();
});


/**
 * Update subcategory dropdown based on selected category
 */
function updateSubcategoryOptions() {
    const categorySelect = document.getElementById('edit-category');
    const subcategorySelect = document.getElementById('edit-subcategory');
    
    if (!categorySelect || !subcategorySelect) return;
    
    const selectedCategory = categorySelect.value;
    
    // Clear and rebuild subcategory options
    subcategorySelect.innerHTML = '<option value="">None</option>';
    
    if (selectedCategory) {
        const filteredSubcategories = (lookupData.subcategories || [])
            .filter(sc => sc.category_id === selectedCategory);
        
        filteredSubcategories.forEach(sc => {
            const option = document.createElement('option');
            option.value = sc.scat_id;
            option.textContent = sc.name;
            subcategorySelect.appendChild(option);
        });
    }
}
window.updateSubcategoryOptions = updateSubcategoryOptions;

// ========================================
// PROJECT TEMPLATES
// ========================================

// Store templates in localStorage
const TEMPLATES_KEY = 'synaapz_project_templates';

function getProjectTemplates() {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [
        {
            id: '1',
            name: 'Deployment Plan',
            description: 'Standard deployment workflow with 15 subtasks',
            tasks: [
                { title: 'Code review', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Update dependencies', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Medium' },
                { title: 'Run unit tests', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Run integration tests', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Security scan', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Build production bundle', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Backup current database', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Critical' },
                { title: 'Deploy to staging', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Smoke testing on staging', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Notify stakeholders', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Medium' },
                { title: 'Deploy to production', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Critical' },
                { title: 'Monitor logs for 30 min', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Run smoke tests on production', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Update documentation', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Medium' },
                { title: 'Send deployment summary', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Low' }
            ]
        },
        {
            id: '2',
            name: 'Sprint Planning',
            description: 'Two-week sprint workflow',
            tasks: [
                { title: 'Review backlog', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Estimate story points', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Select sprint items', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Break down epics', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Medium' },
                { title: 'Assign tasks', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Set sprint goals', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'High' },
                { title: 'Daily standup prep', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Low' }
            ]
        }
    ];
}

function saveProjectTemplates(templates) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

/**
 * Open Template Library Modal
 */
function openTemplateLibrary() {
    const templates = getProjectTemplates();
    
    const modal = document.createElement('div');
    modal.className = 'template-library-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: var(--bg-fff); border-radius: 8px; max-width: 900px; width: 90%; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    modalContent.innerHTML = `
        <div style="padding: 20px; border-bottom: 2px solid #6f42c1; background: var(--bg-f8f9fa); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: var(--fg-6f42c1); font-size: 20px;">
                <i class="fa-solid fa-layer-group"></i> Project Templates
            </h3>
            <button class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--fg-6c757d); padding: 0; width: 30px; height: 30px;">×</button>
        </div>
        
        <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <p style="margin: 0; color: var(--fg-6c757d);">Select a template to create a new project</p>
                <button onclick="openTemplateManager()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    <i class="fa-solid fa-cog"></i> Manage Templates
                </button>
            </div>
            
            <div class="templates-list" style="display: flex; flex-direction: column; gap: 12px;">
                ${templates.map(template => `
                    <div style="border: 1px solid var(--bd-dee2e6); border-radius: 6px; padding: 15px; background: var(--bg-fff); display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;"
                         onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.borderColor='#6f42c1'"
                         onmouseout="this.style.boxShadow='none'; this.style.borderColor='var(--bd-dee2e6)'">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <h4 style="margin: 0; color: var(--fg-212529); font-size: 16px; font-weight: 600;">${template.name}</h4>
                                <span style="padding: 2px 8px; background: var(--bg-e7f3ff); color: #007bff; border-radius: 3px; font-size: 12px; font-weight: 500;">
                                    ${template.tasks.length} tasks
                                </span>
                            </div>
                            <p style="margin: 0; color: var(--fg-6c757d); font-size: 13px;">${template.description}</p>
                        </div>
                        <button onclick="useTemplate('${template.id}')" style="padding: 8px 20px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; white-space: nowrap;">
                            <i class="fa-solid fa-rocket"></i> Use Template
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="padding: 15px; border-top: 1px solid var(--bd-dee2e6); background: var(--bg-f8f9fa); text-align: right;">
            <button class="close-footer-btn" style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    
    // Close handlers
    modalContent.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modalContent.querySelector('.close-footer-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
}

/**
 * Use template to create project
 */
function useTemplate(templateId) {
    const templates = getProjectTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
        alert('Template not found');
        return;
    }
    
    // Prompt for project name
    const projectName = prompt('Enter project name:', template.name);
    if (!projectName) return;
    
    // Close template library
    document.querySelector('.template-library-modal')?.remove();
    
    // Create project with template tasks
    createProjectFromTemplate(projectName, template);
}

/**
 * Create project from template
 */
function createProjectFromTemplate(projectName, template) {
    // First create the project
    fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, status: 'Active' })
    })
    .then(response => response.json())
    .then(newProject => {
        console.log('[createProjectFromTemplate] Created project:', newProject);
        
        // Create all tasks first (to get their IDs)
        const taskPromises = template.tasks.map(taskTemplate => {
            const taskData = {
                title: taskTemplate.title,
                status_name: taskTemplate.status_name || 'To Do',
                stage_name: taskTemplate.stage_name || (lookupData.lkp_stage?.[0]?.name || 'Backlog'),
                priority_name: taskTemplate.priority_name || 'Medium',
                project_id: newProject.prj_id,
                template_source: template.name // Store template name
                // Note: blocked_by is NOT set here - will be set in second pass
            };
            
            return fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            }).then(r => r.json());
        });
        
        return Promise.all(taskPromises).then(createdTasks => {
            console.log('[createProjectFromTemplate] Created tasks:', createdTasks);
            console.log('[createProjectFromTemplate] Template tasks:', template.tasks);
            
            // Now update blocked_by fields by mapping template indices to actual task IDs
            const updatePromises = [];
            
            template.tasks.forEach((taskTemplate, templateIdx) => {
                console.log(`[createProjectFromTemplate] Processing task ${templateIdx}:`, taskTemplate);
                console.log(`[createProjectFromTemplate] Task ${templateIdx} blocked_by value:`, taskTemplate.blocked_by);
                
                // Check if this task has blocked_by dependencies
                if (taskTemplate.blocked_by && taskTemplate.blocked_by.trim() !== '') {
                    const createdTask = createdTasks[templateIdx];
                    
                    // API returns {message: "...", task_id: X}, not {id: X}
                    const taskId = createdTask?.task_id || createdTask?.id;
                    
                    if (!taskId) {
                        console.error('[createProjectFromTemplate] Task ID not found for index:', templateIdx, 'Response:', createdTask);
                        return;
                    }
                    
                    console.log(`[createProjectFromTemplate] Task ${templateIdx} has blocked_by: "${taskTemplate.blocked_by}"`);
                    
                    // Parse blocked_by (comma-separated template indices)
                    const templateIndices = taskTemplate.blocked_by.split(',')
                        .map(idx => idx.trim())
                        .map(idx => parseInt(idx))
                        .filter(idx => !isNaN(idx));
                    
                    console.log(`[createProjectFromTemplate] Task ${templateIdx} blocked by template indices:`, templateIndices);
                    
                    // Map template indices to actual task IDs
                    const actualTaskIds = templateIndices
                        .map(idx => {
                            const depTask = createdTasks[idx];
                            const depTaskId = depTask?.task_id || depTask?.id;
                            console.log(`[createProjectFromTemplate] Looking up template index ${idx} →`, depTask, '→ ID:', depTaskId);
                            return depTaskId || null;
                        })
                        .filter(id => id !== null);
                    
                    console.log(`[createProjectFromTemplate] Mapped to actual task IDs:`, actualTaskIds);
                    
                    if (actualTaskIds.length > 0) {
                        const blockedByValue = actualTaskIds.join(', ');
                        console.log(`[createProjectFromTemplate] Updating task ${taskId} with blocked_by: "${blockedByValue}"`);
                        
                        // Update the task with blocked_by field
                        const updatePromise = fetch(`/api/tasks/${taskId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                blocked_by: blockedByValue
                            })
                        }).then(response => {
                            console.log(`[createProjectFromTemplate] Update response for task ${taskId}:`, response.status);
                            return response.json();
                        }).then(data => {
                            console.log(`[createProjectFromTemplate] Updated task ${taskId} result:`, data);
                        });
                        
                        updatePromises.push(updatePromise);
                    } else {
                        console.log(`[createProjectFromTemplate] No valid task IDs to update for task ${templateIdx}`);
                    }
                } else {
                    console.log(`[createProjectFromTemplate] Task ${templateIdx} has no blocked_by dependencies`);
                }
            });
            
            console.log(`[createProjectFromTemplate] Total update promises: ${updatePromises.length}`);
            
            // Wait for all blocked_by updates to complete
            return Promise.all(updatePromises).then(() => {
                console.log('[createProjectFromTemplate] All blocked_by updates completed');
                return newProject;
            });
        });
    })
    .then(newProject => {
        showNotification(`Project "${projectName}" created with ${template.tasks.length} tasks!`, 'success');
        
        // Refresh and select new project
        initializeProjectsKanban();
        setTimeout(() => {
            selectProject(newProject.prj_id);
        }, 500);
    })
    .catch(error => {
        console.error('Error creating project from template:', error);
        showNotification('Error creating project', 'error');
    });
}

/**
 * Edit template
 */
function editTemplate(templateId) {
    const templates = getProjectTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return;
    
    // Initialize template tasks data globally
    window.templateTasksData = JSON.parse(JSON.stringify(template.tasks)); // Deep copy
    
    const modal = document.createElement('div');
    modal.id = 'template-edit-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: var(--bg-fff); border-radius: 8px; max-width: 1000px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    // Build header
    const header = document.createElement('div');
    header.style.cssText = 'padding: 20px; border-bottom: 2px solid #007bff; background: var(--bg-f8f9fa); display: flex; justify-content: space-between; align-items: center;';
    header.innerHTML = `
        <h3 style="margin: 0; color: #007bff;">Edit Template: ${template.name}</h3>
        <button class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--fg-6c757d); padding: 0; width: 30px; height: 30px;">×</button>
    `;
    
    // Build body
    const body = document.createElement('div');
    body.style.cssText = 'flex: 1; overflow-y: auto; padding: 20px;';
    
    // Template name and description
    body.innerHTML = `
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Template Name</label>
            <input id="template-name" value="${template.name}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Description</label>
            <textarea id="template-desc" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-height: 60px;">${template.description}</textarea>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--fg-495057);">Tasks (${window.templateTasksData.length})</h4>
            <button id="add-template-task-btn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                <i class="fa-solid fa-plus"></i> Add Task
            </button>
        </div>
        
        <div id="template-tasks-list" style="display: flex; flex-direction: column; gap: 15px;">
        </div>
    `;
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    
    // Build footer
    const footer = document.createElement('div');
    footer.style.cssText = 'padding: 15px; border-top: 1px solid var(--bd-dee2e6); background: var(--bg-f8f9fa); display: flex; justify-content: flex-end; gap: 10px;';
    footer.innerHTML = `
        <button class="cancel-btn" style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cancel
        </button>
        <button class="save-btn" style="padding: 8px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Save Changes
        </button>
    `;
    modalContent.appendChild(footer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Render existing tasks
    renderTemplateTasksList(window.templateTasksData);
    
    // Event handlers
    header.querySelector('.close-btn').addEventListener('click', () => {
        delete window.templateTasksData;
        modal.remove();
    });
    footer.querySelector('.cancel-btn').addEventListener('click', () => {
        delete window.templateTasksData;
        modal.remove();
    });
    footer.querySelector('.save-btn').addEventListener('click', () => saveTemplateEditWithForms(templateId));
    body.querySelector('#add-template-task-btn').addEventListener('click', () => addTemplateTaskWithForm());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            delete window.templateTasksData;
            modal.remove();
        }
    });
}

function renderTemplateTasksList(tasks) {
    const container = document.getElementById('template-tasks-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    tasks.forEach((task, idx) => {
        const taskCard = document.createElement('div');
        taskCard.style.cssText = 'border: 1px solid var(--bd-dee2e6); border-radius: 6px; padding: 12px; background: var(--bg-f8f9fa); display: flex; justify-content: space-between; align-items: center; cursor: grab; transition: background-color 0.2s;';
        taskCard.dataset.taskIdx = idx;
        taskCard.draggable = true;
        
        // Drag and drop events
        taskCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', idx);
            taskCard.style.opacity = '0.5';
            taskCard.style.cursor = 'grabbing';
        });
        
        taskCard.addEventListener('dragend', (e) => {
            taskCard.style.opacity = '1';
            taskCard.style.cursor = 'grab';
        });
        
        taskCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            taskCard.style.background = 'var(--bg-e7f3ff)';
        });
        
        taskCard.addEventListener('dragleave', (e) => {
            taskCard.style.background = 'var(--bg-f8f9fa)';
        });
        
        taskCard.addEventListener('drop', (e) => {
            e.preventDefault();
            taskCard.style.background = 'var(--bg-f8f9fa)';
            
            const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIdx = idx;
            
            if (draggedIdx !== targetIdx) {
                // Reorder tasks
                const draggedTask = window.templateTasksData[draggedIdx];
                window.templateTasksData.splice(draggedIdx, 1);
                window.templateTasksData.splice(targetIdx, 0, draggedTask);
                
                // Re-render
                renderTemplateTasksList(window.templateTasksData);
                showNotification('Task reordered', 'success');
            }
        });
        
        taskCard.innerHTML = `
            <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-grip-vertical" style="color: var(--fg-6c757d); cursor: grab;"></i>
                <span style="color: var(--fg-6c757d); font-weight: 600; min-width: 60px;">Task ${idx + 1}</span>
                <span style="color: var(--fg-212529); font-size: 14px;">${task.title || 'Untitled'}</span>
            </div>
            <div style="display: flex; gap: 5px; align-items: center;">
                <button class="move-up-btn" data-idx="${idx}" 
                        style="padding: 6px 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; ${idx === 0 ? 'opacity: 0.3; cursor: not-allowed;' : ''}"
                        ${idx === 0 ? 'disabled' : ''}>
                    <i class="fa-solid fa-arrow-up"></i>
                </button>
                <button class="move-down-btn" data-idx="${idx}" 
                        style="padding: 6px 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; ${idx === tasks.length - 1 ? 'opacity: 0.3; cursor: not-allowed;' : ''}"
                        ${idx === tasks.length - 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-arrow-down"></i>
                </button>
                <button class="edit-task-btn" data-idx="${idx}" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                    <i class="fa-solid fa-edit"></i> Edit
                </button>
                <button class="delete-task-btn" data-idx="${idx}" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(taskCard);
        
        // Add event listeners
        if (idx > 0) {
            taskCard.querySelector('.move-up-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                moveTemplateTask(idx, 'up');
            });
        }
        if (idx < tasks.length - 1) {
            taskCard.querySelector('.move-down-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                moveTemplateTask(idx, 'down');
            });
        }
        taskCard.querySelector('.edit-task-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editTemplateTask(idx);
        });
        taskCard.querySelector('.delete-task-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTemplateTask(idx);
        });
    });
}

function moveTemplateTask(taskIdx, direction) {
    if (!window.templateTasksData) return;
    
    const newIdx = direction === 'up' ? taskIdx - 1 : taskIdx + 1;
    
    if (newIdx < 0 || newIdx >= window.templateTasksData.length) return;
    
    // Swap tasks
    const temp = window.templateTasksData[taskIdx];
    window.templateTasksData[taskIdx] = window.templateTasksData[newIdx];
    window.templateTasksData[newIdx] = temp;
    
    // Re-render
    renderTemplateTasksList(window.templateTasksData);
}

function addTemplateTaskWithForm() {
    // Ensure window.templateTasksData exists
    if (!window.templateTasksData) {
        window.templateTasksData = [];
    }
    
    // Add empty task
    const newTask = {
        title: '',
        status_name: 'To Do',
        stage_name: lookupData.lkp_stage?.[0]?.name || 'Backlog',
        priority_name: 'Medium'
    };
    
    window.templateTasksData.push(newTask);
    
    // Re-render list
    renderTemplateTasksList(window.templateTasksData);
    
    // Open edit form for new task
    editTemplateTask(window.templateTasksData.length - 1);
}

function editTemplateTask(taskIdx) {
    console.log('[editTemplateTask] Called with idx:', taskIdx);
    
    // Ensure data exists
    if (!window.templateTasksData || !window.templateTasksData[taskIdx]) {
        console.error('[editTemplateTask] Template task data not found');
        alert('Error: Template task not found. Please try again.');
        return;
    }
    
    const task = window.templateTasksData[taskIdx];
    console.log('[editTemplateTask] Task data:', task);
    
    // Set template mode flag
    window.isEditingTemplate = true;
    window.currentTemplateTaskIdx = taskIdx;
    window.hasUnsavedTemplateChanges = false;
    
    // Convert template task to full task format for the modal
    const taskForModal = {
        id: taskIdx, // Use index as temporary ID
        ...task,
        // Ensure all required fields exist
        title: task.title || '',
        status_name: task.status_name || 'To Do',
        blocked_by: task.blocked_by || ''
    };
    
    console.log('[editTemplateTask] Task for modal:', taskForModal);
    console.log('[editTemplateTask] Checking for openTemplateTaskModal...');
    console.log('[editTemplateTask] window.openTemplateTaskModal exists?', typeof window.openTemplateTaskModal);
    
    // Check if function exists
    if (typeof window.openTemplateTaskModal === 'function') {
        console.log('[editTemplateTask] Calling window.openTemplateTaskModal');
        window.openTemplateTaskModal(taskForModal, taskIdx);
    } else {
        console.error('[editTemplateTask] openTemplateTaskModal function not found!');
        console.error('[editTemplateTask] Available window properties:', Object.keys(window).filter(k => k.includes('Template')));
        alert('Error: Template editing function not loaded. Please refresh the page and try again.');
    }
}

function openTemplateTaskModal(task, taskIdx) {
    if (!allColumnSettings || allColumnSettings.length === 0) {
        return '<p>Loading columns...</p>';
    }
    
    let html = '';
    
    allColumnSettings.forEach(col => {
        if (col.column_name === 'id') return;
        
        const value = task[col.column_name] || '';
        const fieldId = `tmpl-task-${col.column_name}`;
        
        html += `<div style="margin-bottom: 15px;">`;
        html += `<label style="display: block; margin-bottom: 5px; font-weight: 600;">${col.display_name}</label>`;
        
        // Generate appropriate input based on column type
        if (col.column_type === 'lookup_status') {
            html += `<select id="${fieldId}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
            (lookupData.lkp_status || []).forEach(item => {
                html += `<option value="${item.name}" ${value === item.name ? 'selected' : ''}>${item.name}</option>`;
            });
            html += `</select>`;
        } else if (col.column_type === 'lookup_stage') {
            html += `<select id="${fieldId}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
            (lookupData.lkp_stage || []).forEach(item => {
                html += `<option value="${item.name}" ${value === item.name ? 'selected' : ''}>${item.name}</option>`;
            });
            html += `</select>`;
        } else if (col.column_type === 'lookup_priority') {
            html += `<select id="${fieldId}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
            (lookupData.lkp_priority || []).forEach(item => {
                html += `<option value="${item.name}" ${value === item.name ? 'selected' : ''}>${item.name}</option>`;
            });
            html += `</select>`;
        } else if (col.column_type === 'lookup_projects') {
            html += `<select id="${fieldId}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
            html += `<option value="">None</option>`;
            (lookupData.projects || []).forEach(item => {
                html += `<option value="${item.prj_id}" ${value == item.prj_id ? 'selected' : ''}>${item.name}</option>`;
            });
            html += `</select>`;
        } else if (col.column_type === 'lookup_categories') {
            html += `<select id="${fieldId}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
            html += `<option value="">None</option>`;
            (lookupData.categories || []).forEach(item => {
                html += `<option value="${item.cat_id}" ${value == item.cat_id ? 'selected' : ''}>${item.name}</option>`;
            });
            html += `</select>`;
        } else if (col.column_type === 'lookup_subcategories') {
            html += `<select id="${fieldId}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
            html += `<option value="">None</option>`;
            (lookupData.subcategories || []).forEach(item => {
                html += `<option value="${item.scat_id}" ${value == item.scat_id ? 'selected' : ''}>${item.name}</option>`;
            });
            html += `</select>`;
        } else if (col.column_type === 'date') {
            html += `<input type="date" id="${fieldId}" value="${value}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
        } else if (col.column_type === 'number') {
            html += `<input type="number" id="${fieldId}" value="${value}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
        } else {
            html += `<input type="text" id="${fieldId}" value="${value}" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px;">`;
        }
        
        html += `</div>`;
    });
    
    return html;
}

function saveTemplateTaskForm(taskIdx) {
    const taskData = {};
    
    allColumnSettings.forEach(col => {
        if (col.column_name === 'id') return;
        
        const field = document.getElementById(`tmpl-task-${col.column_name}`);
        if (field) {
            taskData[col.column_name] = field.value || null;
        }
    });
    
    // Update stored data
    window.templateTasksData[taskIdx] = taskData;
    
    // Re-render list
    renderTemplateTasksList(window.templateTasksData);
}

function deleteTemplateTask(taskIdx) {
    if (window.templateTasksData.length <= 1) {
        alert('Template must have at least one task');
        return;
    }
    
    if (!confirm('Delete this task?')) return;
    
    window.templateTasksData.splice(taskIdx, 1);
    renderTemplateTasksList(window.templateTasksData);
}

function saveTemplateEditWithForms(templateId) {
    const templates = getProjectTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return;
    
    // Get updated values
    template.name = document.getElementById('template-name').value;
    template.description = document.getElementById('template-desc').value;
    template.tasks = window.templateTasksData || [];
    
    if (template.tasks.length === 0) {
        alert('Template must have at least one task');
        return;
    }
    
    saveProjectTemplates(templates);
    showNotification('Template updated!', 'success');
    
    // Clean up
    delete window.templateTasksData;
    
    // Close modals
    document.getElementById('template-edit-modal')?.remove();
    document.querySelector('.template-library-modal')?.remove();
    openTemplateLibrary();
}

function saveTemplateEdit(templateId) {
    // This is the old simple version - kept for backward compatibility
    // New version is saveTemplateEditWithForms
    const templates = getProjectTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return;
    
    template.name = document.getElementById('template-name')?.value || template.name;
    template.description = document.getElementById('template-desc')?.value || template.description;
    
    const taskInputs = document.querySelectorAll('.task-title');
    if (taskInputs.length > 0) {
        template.tasks = Array.from(taskInputs).map(input => ({
            title: input.value,
            status_name: 'To Do',
            stage_name: 'Backlog',
            priority_name: 'Medium'
        }));
    }
    
    saveProjectTemplates(templates);
    showNotification('Template updated!', 'success');
    
    document.querySelector('div[style*="z-index: 10001"]')?.remove();
    document.querySelector('.template-library-modal')?.remove();
    openTemplateLibrary();
}

function addTemplateTask() {
    const tasksDiv = document.getElementById('template-tasks');
    const currentTaskCount = tasksDiv.querySelectorAll('.task-title').length;
    
    const newTaskHtml = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <input value="New Task ${currentTaskCount + 1}" data-task-idx="${currentTaskCount}" class="task-title" style="flex: 1; padding: 6px; border: 1px solid var(--bd-ced4da); border-radius: 3px; font-size: 13px;">
            <button onclick="removeTemplateTask(${currentTaskCount})" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
    
    tasksDiv.insertAdjacentHTML('beforeend', newTaskHtml);
}

function removeTemplateTask(taskIdx) {
    const taskInputs = document.querySelectorAll('.task-title');
    if (taskInputs.length <= 1) {
        alert('Template must have at least one task');
        return;
    }
    
    taskInputs[taskIdx].closest('div').remove();
    
    // Re-index remaining tasks
    document.querySelectorAll('.task-title').forEach((input, idx) => {
        input.setAttribute('data-task-idx', idx);
        const removeBtn = input.nextElementSibling;
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeTemplateTask(${idx})`);
        }
    });
}

function deleteTemplate(templateId) {
    if (!confirm('Delete this template?')) return;
    
    let templates = getProjectTemplates();
    templates = templates.filter(t => t.id !== templateId);
    saveProjectTemplates(templates);
    
    showNotification('Template deleted', 'success');
    
    // Refresh library
    document.querySelector('.template-library-modal')?.remove();
    openTemplateLibrary();
}

function createNewTemplate() {
    const name = prompt('Template name:');
    if (!name) return;
    
    const templates = getProjectTemplates();
    const newTemplate = {
        id: Date.now().toString(),
        name: name,
        description: 'Custom template',
        tasks: [{ title: 'Task 1', status_name: 'To Do', stage_name: 'Backlog', priority_name: 'Medium' }]
    };
    
    templates.push(newTemplate);
    saveProjectTemplates(templates);
    
    // Close and reopen to show new template
    document.querySelector('.template-library-modal')?.remove();
    openTemplateLibrary();
    
    // Auto-open edit mode
    setTimeout(() => editTemplate(newTemplate.id), 100);
}

// Expose functions
window.openTemplateLibrary = openTemplateLibrary;
window.useTemplate = useTemplate;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.createNewTemplate = createNewTemplate;
window.saveTemplateEdit = saveTemplateEdit;
window.saveTemplateEditWithForms = saveTemplateEditWithForms;
window.editTemplateTask = editTemplateTask;
window.deleteTemplateTask = deleteTemplateTask;
window.moveTemplateTask = moveTemplateTask;
window.addTemplateTask = addTemplateTask;
window.removeTemplateTask = removeTemplateTask;
window.openTemplateManager = openTemplateManager;
window.toggleHideCompletedTasks = toggleHideCompletedTasks;
window.toggleHideTemplateTasks = toggleHideTemplateTasks;

/**
 * Open Template Manager (full editor view)
 */
function openTemplateManager() {
    document.querySelector('.template-library-modal')?.remove();
    
    const templates = getProjectTemplates();
    
    const modal = document.createElement('div');
    modal.className = 'template-manager-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: var(--bg-fff); border-radius: 8px; max-width: 1200px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    modalContent.innerHTML = `
        <div style="padding: 20px; border-bottom: 2px solid #007bff; background: var(--bg-f8f9fa); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #007bff; font-size: 20px;">
                <i class="fa-solid fa-cog"></i> Template Manager
            </h3>
            <button class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--fg-6c757d); padding: 0; width: 30px; height: 30px;">×</button>
        </div>
        
        <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <p style="margin: 0; color: var(--fg-6c757d);">Manage all project templates and their tasks</p>
                <button onclick="createNewTemplate(); document.querySelector('.template-manager-modal')?.remove(); openTemplateManager();" 
                        style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    <i class="fa-solid fa-plus"></i> New Template
                </button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                ${templates.map(template => `
                    <div style="border: 1px solid var(--bd-dee2e6); border-radius: 8px; padding: 20px; background: var(--bg-fff);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h4 style="margin: 0 0 5px 0; color: var(--fg-212529); font-size: 18px;">${template.name}</h4>
                                <p style="margin: 0; color: var(--fg-6c757d); font-size: 14px;">${template.description}</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="editTemplate('${template.id}')" 
                                        style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                                    <i class="fa-solid fa-edit"></i> Edit
                                </button>
                                <button onclick="if(confirm('Delete template?')) { deleteTemplate('${template.id}'); document.querySelector('.template-manager-modal')?.remove(); openTemplateManager(); }" 
                                        style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                                    <i class="fa-solid fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                        <div style="background: var(--bg-f8f9fa); border-radius: 4px; padding: 15px;">
                            <div style="font-weight: 600; margin-bottom: 10px; color: var(--fg-495057);">
                                <i class="fa-solid fa-list-check"></i> Tasks (${template.tasks.length})
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 8px;">
                                ${template.tasks.map((task, idx) => `
                                    <div style="padding: 8px 12px; background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 4px; font-size: 13px;">
                                        <span style="color: var(--fg-6c757d); margin-right: 6px;">${idx + 1}.</span>
                                        ${task.title}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="padding: 15px; border-top: 1px solid var(--bd-dee2e6); background: var(--bg-f8f9fa); text-align: right;">
            <button class="close-footer-btn" style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    
    // Close handlers
    modalContent.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    modalContent.querySelector('.close-footer-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
}

// Gantt sorting state
let ganttSortColumn = null;
let ganttSortDirection = 'asc';

// Gantt column resize state
let ganttResizeCol = null;
let ganttResizeStart = 0;
let ganttResizeWidth = 0;

function sortGanttChart(column) {
    if (ganttSortColumn === column) {
        ganttSortDirection = ganttSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        ganttSortColumn = column;
        ganttSortDirection = 'asc';
    }
    
    // Re-render Projects page
    renderProjectsKanban();
}

function startColumnResize(event, colName) {
    event.preventDefault();
    event.stopPropagation();
    
    ganttResizeCol = colName;
    ganttResizeStart = event.pageX;
    
    const table = document.getElementById('gantt-table');
    if (!table) return;
    
    const colElement = table.querySelector(`.gantt-col-${colName}`);
    if (colElement) {
        ganttResizeWidth = colElement.offsetWidth;
    }
    
    document.addEventListener('mousemove', handleColumnResize);
    document.addEventListener('mouseup', stopColumnResize);
    
    // Add cursor style to body
    document.body.style.cursor = 'col-resize';
}

function handleColumnResize(event) {
    if (!ganttResizeCol) return;
    
    const delta = event.pageX - ganttResizeStart;
    const newWidth = Math.max(80, ganttResizeWidth + delta); // Min 80px
    
    const table = document.getElementById('gantt-table');
    if (!table) return;
    
    const colElement = table.querySelector(`.gantt-col-${ganttResizeCol}`);
    if (colElement) {
        colElement.style.width = newWidth + 'px';
    }
}

function stopColumnResize() {
    ganttResizeCol = null;
    document.removeEventListener('mousemove', handleColumnResize);
    document.removeEventListener('mouseup', stopColumnResize);
    document.body.style.cursor = '';
}

// ========================================
// GANTT CHART (PROJECTS PAGE)
// ========================================

/**
 * Toggle between Kanban and Gantt view
 */
function toggleProjectView() {
    projectView = projectView === 'kanban' ? 'gantt' : 'kanban';
    renderProjectsKanban(); // Re-render entire page
}

/**
 * Render Gantt Chart for selected project
 */
function renderGanttChart(projectId) {
    if (!projectId || projectId === 'all-projects' || projectId === 'unassigned') {
        return '<p style="text-align: center; color: var(--fg-6c757d); padding: 50px;">Please select a specific project to view Gantt Chart</p>';
    }
    
    // Get tasks for this project that have dependencies
    let projectTasks = allTasks.filter(t => t.project_id === projectId && t.is_archived === 0);
    
    // Filter main tasks by active filters
    if (projectTaskGroupFilter || projectCategoryFilter || projectSubcategoryFilter) {
        projectTasks = projectTasks.filter(task => {
            if (projectTaskGroupFilter && task.task_group !== projectTaskGroupFilter) return false;
            if (projectCategoryFilter && task.category_id !== projectCategoryFilter) return false;
            if (projectSubcategoryFilter && task.subcategory_id !== projectSubcategoryFilter) return false;
            return true;
        });
    }
    
    // Apply general search to main tasks
    if (generalSearchTerm) {
        const searchLower = generalSearchTerm.toLowerCase();
        projectTasks = projectTasks.filter(task => {
            return Object.values(task).some(val => 
                val && String(val).toLowerCase().includes(searchLower)
            );
        });
    }
    
    // Now filter to only those with dependencies (blocked_by)
    const tasksWithDeps = projectTasks.filter(t => t.blocked_by);
    
    // Apply sorting if active
    if (ganttSortColumn) {
        tasksWithDeps.sort((a, b) => {
            let aVal = a[ganttSortColumn];
            let bVal = b[ganttSortColumn];
            
            // Handle dates
            if (ganttSortColumn === 'due_date') {
                aVal = aVal ? new Date(aVal) : new Date('2099-12-31');
                bVal = bVal ? new Date(bVal) : new Date('2099-12-31');
            }
            
            // Handle nulls
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';
            
            // Compare
            if (aVal < bVal) return ganttSortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return ganttSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    if (tasksWithDeps.length === 0) {
        return `
            <div style="text-align: center; color: var(--fg-6c757d); padding: 50px;">
                <i class="fa-solid fa-chart-gantt" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="font-size: 18px; margin-bottom: 10px;">No tasks with dependencies</p>
                <p style="font-size: 14px;">Add "Blocked By" relationships to tasks to see them in Gantt Chart</p>
            </div>
        `;
    }
    
    // Build dependency map
    const taskMap = {};
    projectTasks.forEach(t => {
        taskMap[t.id] = t;
    });
    
    // Calculate timeline
    let minDate = null;
    let maxDate = null;
    
    tasksWithDeps.forEach(task => {
        if (task.due_date) {
            const date = new Date(task.due_date);
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        }
    });
    
    // If no dates, use created dates
    if (!minDate) {
        tasksWithDeps.forEach(task => {
            const date = new Date(task.created_at);
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        });
    }
    
    // Add padding
    if (minDate) {
        minDate = new Date(minDate.setDate(minDate.getDate() - 7));
        maxDate = new Date(maxDate.setDate(maxDate.getDate() + 7));
    }
    
    const totalDays = minDate && maxDate ? Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) : 30;
    
    let html = `
        <div style="padding: 20px; background: var(--bg-fff);">
            <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-e7f3ff); border-left: 4px solid #007bff; border-radius: 4px;">
                <h4 style="margin: 0 0 5px 0; color: #007bff;"><i class="fa-solid fa-info-circle"></i> Gantt Chart View</h4>
                <p style="margin: 0; font-size: 14px; color: var(--fg-495057);">Showing ${tasksWithDeps.length} tasks with dependencies. Tasks are connected by "Blocked By" relationships. Drag column edges to resize.</p>
            </div>
            
            <div style="overflow-x: auto; border: 1px solid var(--bd-dee2e6); border-radius: 4px;">
                <table id="gantt-table" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                    <colgroup>
                        <col class="gantt-col-task" style="width: 280px;">
                        <col class="gantt-col-blocked" style="width: 220px;">
                        <col class="gantt-col-status" style="width: 120px;">
                        <col class="gantt-col-timeline" style="width: auto; min-width: ${totalDays * 30}px;">
                    </colgroup>
                    <thead>
                        <tr style="background: var(--bg-f8f9fa);">
                            <th onclick="sortGanttChart('title')" style="padding: 12px; text-align: left; border-bottom: 2px solid var(--bd-dee2e6); position: sticky; left: 0; background: var(--bg-f8f9fa); z-index: 2; cursor: pointer; user-select: none; position: relative; font-size: 14px; font-weight: 600;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Task</span>
                                    <div style="display: flex; align-items: center; gap: 5px;">
                                        <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.5;"></i>
                                        <div class="resize-handle" data-col="task" style="position: absolute; right: 0; top: 0; bottom: 0; width: 5px; cursor: col-resize; background: transparent;" 
                                             onmousedown="startColumnResize(event, 'task')" title="Drag to resize"></div>
                                    </div>
                                </div>
                            </th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--bd-dee2e6); position: relative; font-size: 14px; font-weight: 600;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Blocked By</span>
                                    <div class="resize-handle" data-col="blocked" style="position: absolute; right: 0; top: 0; bottom: 0; width: 5px; cursor: col-resize; background: transparent;" 
                                         onmousedown="startColumnResize(event, 'blocked')" title="Drag to resize"></div>
                                </div>
                            </th>
                            <th onclick="sortGanttChart('status_name')" style="padding: 12px; text-align: left; border-bottom: 2px solid var(--bd-dee2e6); cursor: pointer; user-select: none; position: relative; font-size: 14px; font-weight: 600;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Status</span>
                                    <div style="display: flex; align-items: center; gap: 5px;">
                                        <i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.5;"></i>
                                        <div class="resize-handle" data-col="status" style="position: absolute; right: 0; top: 0; bottom: 0; width: 5px; cursor: col-resize; background: transparent;" 
                                             onmousedown="startColumnResize(event, 'status')" title="Drag to resize"></div>
                                    </div>
                                </div>
                            </th>
                            <th onclick="sortGanttChart('due_date')" style="padding: 12px; border-bottom: 2px solid var(--bd-dee2e6); cursor: pointer; user-select: none; font-size: 14px; font-weight: 600;">
                                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                                    <span style="font-weight: bold;">${minDate ? minDate.toLocaleDateString() : ''}</span>
                                    <span><i class="fa-solid fa-sort" style="font-size: 12px; opacity: 0.5;"></i></span>
                                    <span style="font-weight: bold;">${maxDate ? maxDate.toLocaleDateString() : ''}</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    tasksWithDeps.forEach(task => {
        const blockedByIds = task.blocked_by.split(',').map(id => id.trim()).filter(id => id);
        
        // Check if main task matches any active filters
        let mainTaskMatchesFilter = false;
        const hasActiveFilters = projectTaskGroupFilter || projectCategoryFilter || projectSubcategoryFilter;
        
        if (hasActiveFilters) {
            mainTaskMatchesFilter = true; // Assume match initially
            
            // Check each active filter
            if (projectTaskGroupFilter && task.task_group !== projectTaskGroupFilter) {
                mainTaskMatchesFilter = false;
            }
            if (projectCategoryFilter && task.category_id !== projectCategoryFilter) {
                mainTaskMatchesFilter = false;
            }
            if (projectSubcategoryFilter && task.subcategory_id !== projectSubcategoryFilter) {
                mainTaskMatchesFilter = false;
            }
        }
        
        const blockedByTasks = blockedByIds
            .map(id => taskMap[id])
            .filter(t => t) // Task exists
            .filter(t => {
                // If main task matches filters OR no filters active, show ALL dependencies
                if (!hasActiveFilters || mainTaskMatchesFilter) {
                    // Only apply search filter to dependencies
                    if (generalSearchTerm) {
                        const searchLower = generalSearchTerm.toLowerCase();
                        const matches = Object.values(t).some(val => 
                            val && String(val).toLowerCase().includes(searchLower)
                        );
                        return matches;
                    }
                    return true; // Show all dependencies
                }
                
                // If main task doesn't match, apply full filtering to dependencies
                if (projectTaskGroupFilter && t.task_group !== projectTaskGroupFilter) return false;
                if (projectCategoryFilter && t.category_id !== projectCategoryFilter) return false;
                if (projectSubcategoryFilter && t.subcategory_id !== projectSubcategoryFilter) return false;
                if (generalSearchTerm) {
                    const searchLower = generalSearchTerm.toLowerCase();
                    const matches = Object.values(t).some(val => 
                        val && String(val).toLowerCase().includes(searchLower)
                    );
                    if (!matches) return false;
                }
                return true;
            });
        
        // Calculate bar position
        let barStart = 0;
        let barWidth = 20;
        
        if (task.due_date && minDate && maxDate) {
            const taskDate = new Date(task.due_date);
            const daysFromStart = Math.ceil((taskDate - minDate) / (1000 * 60 * 60 * 24));
            barStart = (daysFromStart / totalDays) * 100;
            barWidth = 5; // Single day marker
        }
        
        // Same status colour as kanban headers and cards
        const statusColor = getStatusColor(task.status_name);
        
        html += `
            <tr style="border-bottom: 1px solid var(--bd-dee2e6);" onmouseover="this.style.background='var(--bg-f8f9fa)'" onmouseout="this.style.background='var(--bg-fff)'">
                <td style="padding: 12px; position: sticky; left: 0; background: var(--bg-fff); z-index: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <div style="cursor: pointer; overflow: hidden;" onclick="openEditTaskModalById(${task.id})" title="${task.title}">
                        <div style="font-weight: 500; color: var(--fg-212529); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis;">${task.title}</div>
                        <div style="font-size: 12px; color: var(--fg-6c757d);">
                            ${task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                        </div>
                    </div>
                </td>
                <td style="padding: 12px; white-space: nowrap; overflow: hidden;">
                    <div style="display: flex; flex-direction: column; gap: 3px; overflow: hidden;">
                    ${blockedByTasks.length > 0 ? blockedByTasks.map(bt => {
                        // Get dependency task status color
                        const depStatusColor = getStatusColor(bt.status_name);
                        
                        // Lighter background version of status color
                        const lightBg = depStatusColor + '20'; // Add 20% opacity
                        
                        return `
                        <div style="font-size: 11px; padding: 4px 8px; background: ${lightBg}; border-radius: 3px; cursor: pointer; border-left: 3px solid ${depStatusColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--fg-212529);" 
                             onclick="openEditTaskModalById(${bt.id})" 
                             title="${bt.title}">
                            <i class="fa-solid fa-link"></i> #${bt.id}: ${bt.title}
                        </div>
                    `;
                    }).join('') : '<span style="color: var(--fg-6c757d);">-</span>'}
                    </div>
                </td>
                <td style="padding: 12px; white-space: nowrap; overflow: hidden;">
                    <span style="padding: 4px 8px; background: ${statusColor}; color: white; border-radius: 3px; font-size: 12px; font-weight: 500; display: inline-block;">
                        ${task.status_name || 'To Do'}
                    </span>
                </td>
                <td style="padding: 12px; position: relative;">
                    <div style="position: relative; height: 30px; background: var(--bg-f8f9fa); border-radius: 4px;">
                        ${task.due_date ? `
                            <div title="${new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}" style="position: absolute; left: ${barStart}%; top: 50%; transform: translateY(-50%); 
                                        width: ${barWidth}%; min-width: 40px; height: 20px; background: ${statusColor}; 
                                        border-radius: 3px; display: flex; align-items: center; justify-content: center; 
                                        color: white; font-size: 10px; font-weight: 500; cursor: pointer;">
                                ${new Date(task.due_date).getDate()}
                            </div>
                        ` : ''}
                        ${blockedByTasks.length > 0 && blockedByTasks[0].due_date ? `
                            <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                                ${blockedByTasks.map(bt => {
                                    if (!bt.due_date) return '';
                                    // Get dependency status color
                                    const depLineColor = getStatusColor(bt.status_name);
                                    const btDate = new Date(bt.due_date);
                                    const btDays = Math.ceil((btDate - minDate) / (1000 * 60 * 60 * 24));
                                    const btPos = (btDays / totalDays) * 100;
                                    return `<line x1="${btPos}%" y1="15" x2="${barStart}%" y2="15" stroke="${depLineColor}" stroke-width="2" stroke-dasharray="5,5"/>`;
                                }).join('')}
                            </svg>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

// Expose Gantt functions
window.toggleProjectView = toggleProjectView;
window.sortGanttChart = sortGanttChart;
window.startColumnResize = startColumnResize;

/**
 * Search tasks for Blocked By field
 */
function searchBlockedByTasks(query, fieldName) {
    const resultsDiv = document.getElementById('blockedby-results');
    
    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const searchLower = query.toLowerCase();
    const currentBlockedBy = document.getElementById(`task-${fieldName}`).value.split(',').filter(id => id.trim());
    
    // Filter tasks: not archived, not current task, matches search
    const matchingTasks = allTasks.filter(t => {
        if (t.is_archived === 1) return false;
        if (currentBlockedBy.includes(String(t.id))) return false; // Already selected
        
        const idMatch = String(t.id).includes(query);
        const titleMatch = t.title && t.title.toLowerCase().includes(searchLower);
        
        return idMatch || titleMatch;
    }).slice(0, 10); // Limit to 10 results
    
    if (matchingTasks.length === 0) {
        resultsDiv.innerHTML = '<div style="padding: 8px; color: var(--fg-6c757d);">No tasks found</div>';
    } else {
        resultsDiv.innerHTML = matchingTasks.map(t => `
            <div onclick="addBlockedBy(${t.id}, '${fieldName}')" 
                 style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--bd-e9ecef);"
                 onmouseover="this.style.background='var(--bg-f8f9fa)'"
                 onmouseout="this.style.background='var(--bg-fff)'">
                <div style="font-weight: 500;">#${t.id}: ${t.title}</div>
                <div style="font-size: 12px; color: var(--fg-6c757d);">
                    ${t.status_name || 'To Do'} • ${t.project_id ? (lookupData.projects.find(p => p.prj_id === t.project_id)?.name || '') : 'No project'}
                </div>
            </div>
        `).join('');
    }
    
    resultsDiv.style.display = 'block';
}

/**
 * Add task to Blocked By list
 */
function addBlockedBy(taskId, fieldName) {
    const hiddenInput = document.getElementById(`task-${fieldName}`);
    const currentIds = hiddenInput.value.split(',').filter(id => id.trim());
    
    if (!currentIds.includes(String(taskId))) {
        currentIds.push(taskId);
        hiddenInput.value = currentIds.join(',');
        
        // Update tags display
        updateBlockedByTags(currentIds);
    }
    
    // Clear search
    document.getElementById(`task-${fieldName}-search`).value = '';
    document.getElementById('blockedby-results').style.display = 'none';
}

/**
 * Remove task from Blocked By list
 */
function removeBlockedBy(taskId) {
    const hiddenInput = document.getElementById('task-blocked_by');
    const currentIds = hiddenInput.value.split(',').filter(id => id.trim() && id != taskId);
    hiddenInput.value = currentIds.join(',');
    
    // Update tags display
    updateBlockedByTags(currentIds);
}

/**
 * Update Blocked By tags display
 */
function updateBlockedByTags(taskIds) {
    const tagsDiv = document.getElementById('blocked-by-tags');
    const tasks = taskIds.map(id => allTasks.find(t => t.id == id)).filter(t => t);
    
    tagsDiv.innerHTML = tasks.map(t => `
        <span style="padding: 4px 8px; background: var(--bg-e7f3ff); border: 1px solid #007bff; border-radius: 4px; font-size: 12px; display: flex; align-items: center; gap: 4px;">
            #${t.id}: ${t.title}
            <i class="fa-solid fa-times" onclick="removeBlockedBy(${t.id})" style="cursor: pointer; color: #dc3545;"></i>
        </span>
    `).join('');
}

// Expose functions
window.searchBlockedByTasks = searchBlockedByTasks;
window.addBlockedBy = addBlockedBy;
window.removeBlockedBy = removeBlockedBy;

// ========================================
// CALENDAR PAGE
// ========================================

/**
 * Initialize Calendar Page
 */
function initializeCalendarPage() {
    console.log('[Calendar] Initializing Calendar page...');
    
    // Load tasks, lookups, and column settings first
    Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/lookups').then(r => r.json()),
        fetch('/api/admin/columns').then(r => r.json())
    ])
    .then(([tasks, lookups, colSettings]) => {
        allTasks = tasks;
        lookupData = lookups;
        allColumnSettings = colSettings;
        console.log('[Calendar] Loaded data - tasks:', tasks.length, 'columns:', colSettings.length);
        renderCalendarPage();
    })
    .catch(error => {
        console.error('[Calendar] Error loading data:', error);
        const container = document.getElementById('calendar-container');
        if (container) {
            container.innerHTML = '<p style="color: red; padding: 20px;">Error loading calendar data. Please try refreshing the page.</p>';
        }
    });
}

/**
 * Render Calendar Page
 */
function renderCalendarPage() {
    const container = document.getElementById('calendar-container');
    if (!container) {
        console.error('[Calendar] Container not found!');
        return;
    }
    
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let html = `
        <div style="height: 100%; display: flex; flex-direction: column; background: var(--bg-f5f7fa); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <!-- Top Controls Bar -->
            <div style="background: var(--bg-fff); border-bottom: 1px solid var(--bd-dee2e6); padding: 15px 20px;">
                <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                    <!-- Month Navigation -->
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <button onclick="calendarPreviousMonth()" 
                                style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button onclick="calendarCurrentMonth()" 
                                style="padding: 8px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; min-width: 100px;">
                            Current
                        </button>
                        <button onclick="calendarNextMonth()" 
                                style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                        <button onclick="openAddTaskModal()" 
                                style="padding: 8px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">
                            <i class="fa-solid fa-plus"></i> Add Task
                        </button>
                        <div style="font-size: 18px; font-weight: 600; color: var(--fg-212529); margin-left: 15px;">
                            ${monthNames[month]} ${year}
                        </div>
                    </div>
                    
                    <!-- Spacer -->
                    <div style="flex: 1;"></div>
                    
                    <!-- Filters -->
                    <input type="text" id="calendar-search" placeholder="Search tasks..." 
                           value="${calendarSearchTerm}"
                           oninput="handleCalendarSearch(this.value)"
                           style="padding: 8px 12px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 200px; font-size: 14px;">
                    
                    <select id="calendar-category-filter" onchange="handleCalendarCategoryFilter(this.value)"
                            style="padding: 8px 12px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px; font-size: 14px;">
                        <option value="">All Categories</option>
                        ${(lookupData.categories || []).map(c => 
                            `<option value="${c.cat_id}" ${calendarCategoryFilter === c.cat_id ? 'selected' : ''}>${c.name}</option>`
                        ).join('')}
                    </select>
                    
                    <select id="calendar-subcategory-filter" onchange="handleCalendarSubcategoryFilter(this.value)"
                            style="padding: 8px 12px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px; font-size: 14px;">
                        <option value="">All Sub-Categories</option>
                        ${(lookupData.subcategories || []).map(sc => 
                            `<option value="${sc.scat_id}" ${calendarSubcategoryFilter === sc.scat_id ? 'selected' : ''}>${sc.name}</option>`
                        ).join('')}
                    </select>
                    
                    <select id="calendar-project-filter" onchange="handleCalendarProjectFilter(this.value)"
                            style="padding: 8px 12px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px; font-size: 14px;">
                        <option value="">All Projects</option>
                        ${(lookupData.projects || []).map(p => 
                            `<option value="${p.prj_id}" ${calendarProjectFilter === p.prj_id ? 'selected' : ''}>${p.name}</option>`
                        ).join('')}
                    </select>
                    
                    <select id="calendar-group-filter" onchange="handleCalendarGroupFilter(this.value)"
                            style="padding: 8px 12px; border: 1px solid var(--bd-ced4da); border-radius: 4px; min-width: 150px; font-size: 14px;">
                        <option value="">All Task Groups</option>
                        ${[...new Set(allTasks.map(t => t.task_group).filter(g => g))].sort().map(g => 
                            `<option value="${g}" ${calendarGroupFilter === g ? 'selected' : ''}>${g}</option>`
                        ).join('')}
                    </select>
                    
                    <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer; user-select: none;">
                        <input type="checkbox" ${calendarShowDueDate ? 'checked' : ''} 
                               onchange="handleCalendarDateTypeFilter('due', this.checked)"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span style="font-size: 14px; color: var(--fg-495057);">Due Date</span>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer; user-select: none;">
                        <input type="checkbox" ${calendarShowReminderDate ? 'checked' : ''} 
                               onchange="handleCalendarDateTypeFilter('reminder', this.checked)"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span style="font-size: 14px; color: var(--fg-495057);">Reminder Date</span>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-f8f9fa); border-radius: 4px; cursor: pointer; user-select: none;">
                        <input type="checkbox" ${calendarHideCompleted ? 'checked' : ''} 
                               onchange="handleCalendarHideCompleted(this.checked)"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <span style="font-size: 14px; color: var(--fg-495057);">Hide Completed</span>
                    </label>
                </div>
            </div>
            
            <!-- Calendar Grid -->
            <div style="flex: 1; overflow: auto; padding: 20px;">
                ${renderCalendarGrid(year, month)}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render Calendar Grid
 */
function renderCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Adjust for Monday start: 0=Monday, 1=Tuesday... 6=Sunday
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6; // Sunday becomes 6
    
    // Filter tasks for this month
    const filteredTasks = allTasks.filter(task => {
        if (task.is_archived === 1 || task.is_deleted === 1) return false;
        
        // Check date type filters
        let hasValidDate = false;
        let dateMatches = false;
        
        if (calendarShowDueDate && task.due_date) {
            hasValidDate = true;
            const dueDate = new Date(task.due_date);
            if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
                dateMatches = true;
            }
        }
        
        if (calendarShowReminderDate && task.reminder_date) {
            hasValidDate = true;
            const reminderDate = new Date(task.reminder_date);
            if (reminderDate.getFullYear() === year && reminderDate.getMonth() === month) {
                dateMatches = true;
            }
        }
        
        if (!hasValidDate || !dateMatches) return false;
        
        // Apply category filters
        if (calendarCategoryFilter && task.category_id !== calendarCategoryFilter) {
            return false;
        }
        
        if (calendarSubcategoryFilter && task.subcategory_id !== calendarSubcategoryFilter) {
            return false;
        }
        
        if (calendarProjectFilter && task.project_id !== calendarProjectFilter) {
            return false;
        }
        
        if (calendarGroupFilter && task.task_group !== calendarGroupFilter) {
            return false;
        }
        
        // Apply search filter
        if (calendarSearchTerm) {
            const searchLower = calendarSearchTerm.toLowerCase();
            return Object.values(task).some(val => 
                val && String(val).toLowerCase().includes(searchLower)
            );
        }
        
        return true;
    });
    
    // Group tasks by date
    const tasksByDate = {};
    filteredTasks.forEach(task => {
        if (calendarShowDueDate && task.due_date) {
            const date = new Date(task.due_date);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const day = date.getDate();
                if (!tasksByDate[day]) tasksByDate[day] = [];
                tasksByDate[day].push({ ...task, dateType: 'due' });
            }
        }
        if (calendarShowReminderDate && task.reminder_date) {
            const date = new Date(task.reminder_date);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const day = date.getDate();
                if (!tasksByDate[day]) tasksByDate[day] = [];
                // Check if already added (task might have both due and reminder)
                const alreadyExists = tasksByDate[day].some(t => t.id === task.id && t.dateType === 'due');
                if (!alreadyExists) {
                    tasksByDate[day].push({ ...task, dateType: 'reminder' });
                } else {
                    // Task has both - mark it
                    const existingTask = tasksByDate[day].find(t => t.id === task.id);
                    existingTask.dateType = 'both';
                }
            }
        }
    });
    
    let html = `
        <div style="background: var(--bg-fff); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; border: 3px solid #007bff;">
            <!-- Header Row with Week# + Days -->
            <div style="display: grid; grid-template-columns: 50px repeat(7, 1fr); background: #007bff;">
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px; border-right: 2px solid #0056b3;">Wk</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Mon</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Tue</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Wed</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Thu</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Fri</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Sat</div>
                <div style="padding: 12px; text-align: center; font-weight: 600; color: white; font-size: 14px;">Sun</div>
            </div>
    `;
    
    // Calculate week numbers and build grid
    const weeksHtml = [];
    let currentWeekDays = [];
    let weekNumber = null;
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
        const positionInWeek = currentWeekDays.length; // Track actual position in array
        const isSaturday = positionInWeek === 5; // Saturday is position 5 (Mon=0...Sun=6)
        currentWeekDays.push(`<div style="border-right: 1px solid var(--bd-dee2e6); border-bottom: 1px solid var(--bd-dee2e6); ${isSaturday ? 'border-left: 2px solid #007bff;' : ''} background: var(--bg-fafbfc);"></div>`);
    }
    
    // Add days of month
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
        
        // Calculate ISO week number
        if (weekNumber === null || adjustedDayOfWeek === 0) {
            const tempDate = new Date(year, month, day);
            tempDate.setHours(0, 0, 0, 0);
            tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
            const yearStart = new Date(tempDate.getFullYear(), 0, 1);
            weekNumber = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
        }
        
        const isToday = isCurrentMonth && today.getDate() === day;
        const isWeekend = adjustedDayOfWeek >= 5; // Saturday or Sunday
        const positionInWeek = currentWeekDays.length; // Track actual position in array
        const isSaturday = positionInWeek === 5; // Saturday is position 5 in our week array
        const dayTasks = tasksByDate[day] || [];
        
        // Filter out completed tasks if hideCompleted is enabled
        const visibleTasks = calendarHideCompleted 
            ? dayTasks.filter(t => t.status_name?.toLowerCase() !== 'done')
            : dayTasks;
        
        const dayHtml = `
            <div class="calendar-day" 
                 data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}"
                 ondrop="handleCalendarDrop(event)" 
                 ondragover="handleCalendarDragOver(event)"
                 ondragleave="handleCalendarDragLeave(event)"
                 onclick="openCalendarDayModal('${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}')"
                 style="border-right: 1px solid var(--bd-dee2e6); border-bottom: 1px solid var(--bd-dee2e6); ${isSaturday ? 'border-left: 2px solid #007bff;' : ''} padding: 8px; background: ${isToday ? 'var(--bg-e7f3ff)' : isWeekend ? 'var(--bg-f8f9fa)' : 'var(--bg-fff)'}; overflow: hidden; display: flex; flex-direction: column; cursor: pointer;">
                <div style="font-weight: ${isToday ? '700' : '600'}; color: ${isToday ? '#007bff' : 'var(--fg-495057)'}; margin-bottom: 6px; font-size: 14px;">
                    ${day}
                </div>
                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
                    ${visibleTasks.slice(0, 3).map(task => {
                        const bgColor = task.dateType === 'due' ? 'var(--bg-fff5f5)' : task.dateType === 'reminder' ? 'var(--bg-fff8e1)' : 'var(--bg-e8f5e9)';
                        const borderColor = task.dateType === 'due' ? '#dc3545' : task.dateType === 'reminder' ? '#ff9800' : '#28a745';
                        const icon = task.dateType === 'due' ? 'calendar-xmark' : task.dateType === 'reminder' ? 'clock' : 'calendar-check';
                        
                        return `
                            <div class="calendar-task" 
                                 draggable="true"
                                 data-task-id="${task.id}"
                                 data-date-type="${task.dateType}"
                                 ondragstart="handleCalendarTaskDragStart(event)"
                                 onclick="event.stopPropagation(); openEditTaskModalById(${task.id})" 
                                 style="padding: 4px 6px; background: ${bgColor}; border-left: 3px solid ${borderColor}; border-radius: 3px; cursor: grab; font-size: 11px; line-height: 1.3; transition: all 0.2s;"
                                 onmouseover="this.style.transform='translateX(2px)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'"
                                 onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                                <i class="fa-solid fa-${icon}" style="font-size: 10px; margin-right: 4px; color: ${borderColor};"></i>
                                <span style="font-weight: 500; color: var(--fg-212529);">${task.title}</span>
                            </div>
                        `;
                    }).join('')}
                    ${visibleTasks.length > 3 ? `<div style="font-size: 11px; color: var(--fg-6c757d); padding: 2px 6px;">+${visibleTasks.length - 3} more</div>` : ''}
                </div>
            </div>
        `;
        
        currentWeekDays.push(dayHtml);
        
        // End of week (Sunday) or end of month
        if (adjustedDayOfWeek === 6 || day === daysInMonth) {
            // Fill remaining days of week if at end of month
            while (currentWeekDays.length < 7) {
                const position = currentWeekDays.length;
                const isSaturday = position === 5;
                currentWeekDays.push(`<div style="border-right: 1px solid var(--bd-dee2e6); border-bottom: 1px solid var(--bd-dee2e6); ${isSaturday ? 'border-left: 2px solid #007bff;' : ''} background: var(--bg-fafbfc);"></div>`);
            }
            
            // Add week row
            const borderColor = weeksHtml.length === 0 ? '#007bff' : 'var(--bd-dee2e6)'; // First row blue, rest grey
            weeksHtml.push(`
                <div style="display: grid; grid-template-columns: 50px repeat(7, 1fr); grid-auto-rows: 180px; border-top: 2px solid ${borderColor};">
                    <div style="border-right: 2px solid #007bff; background: #007bff; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">
                        ${weekNumber}
                    </div>
                    ${currentWeekDays.join('')}
                </div>
            `);
            
            currentWeekDays = [];
        }
    }
    
    html += weeksHtml.join('');
    
    html += `
        </div>
    `;
    
    return html;
}

/**
 * Calendar navigation handlers
 */
function calendarPreviousMonth() {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
    renderCalendarPage();
}

function calendarCurrentMonth() {
    calendarCurrentDate = new Date();
    renderCalendarPage();
}

function calendarNextMonth() {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
    renderCalendarPage();
}

/**
 * Calendar filter handlers
 */
function handleCalendarSearch(value) {
    calendarSearchTerm = value.toLowerCase();
    // Only re-render the grid, not the entire page (preserves input focus)
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        const year = calendarCurrentDate.getFullYear();
        const month = calendarCurrentDate.getMonth();
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

function handleCalendarCategoryFilter(value) {
    calendarCategoryFilter = value;
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

function handleCalendarSubcategoryFilter(value) {
    calendarSubcategoryFilter = value;
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

function handleCalendarProjectFilter(value) {
    calendarProjectFilter = value;
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

function handleCalendarGroupFilter(value) {
    calendarGroupFilter = value;
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

function handleCalendarDateTypeFilter(type, checked) {
    if (type === 'due') {
        calendarShowDueDate = checked;
    } else if (type === 'reminder') {
        calendarShowReminderDate = checked;
    }
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

function handleCalendarHideCompleted(checked) {
    calendarHideCompleted = checked;
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
    if (gridContainer) {
        gridContainer.innerHTML = renderCalendarGrid(year, month);
    }
}

/**
 * Drag and drop handlers
 */
let calendarDraggedTask = null;

function handleCalendarTaskDragStart(event) {
    const taskId = event.target.closest('.calendar-task').dataset.taskId;
    const dateType = event.target.closest('.calendar-task').dataset.dateType;
    calendarDraggedTask = { taskId, dateType };
    event.target.style.opacity = '0.5';
}

function handleCalendarDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.background = 'var(--bg-e7f3ff)';
}

function handleCalendarDragLeave(event) {
    const dayCell = event.currentTarget;
    const isToday = dayCell.classList.contains('today');
    const isWeekend = dayCell.style.background === 'rgb(248, 249, 250)';
    
    if (!isToday && !isWeekend) {
        dayCell.style.background = 'var(--bg-fff)';
    } else if (!isToday && isWeekend) {
        dayCell.style.background = 'var(--bg-f8f9fa)';
    }
}

function handleCalendarDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!calendarDraggedTask) return;
    
    const targetDate = event.currentTarget.dataset.date;
    const { taskId, dateType } = calendarDraggedTask;
    
    // Reset drag styling
    const dayCell = event.currentTarget;
    const isWeekend = dayCell.style.background === 'rgb(231, 243, 255)' || dayCell.style.background === '#e7f3ff' || dayCell.style.background === 'var(--bg-e7f3ff)';
    dayCell.style.background = isWeekend ? '#f8f9fa' : 'white';
    
    // Update task date
    const updateData = {};
    if (dateType === 'due' || dateType === 'both') {
        updateData.due_date = targetDate;
    }
    if (dateType === 'reminder' || dateType === 'both') {
        updateData.reminder_date = targetDate;
    }
    
    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(() => {
        showNotification('Task rescheduled successfully!', 'success');
        // Reload tasks and re-render calendar
        fetch('/api/tasks').then(r => r.json()).then(tasks => {
            allTasks = tasks;
            const year = calendarCurrentDate.getFullYear();
            const month = calendarCurrentDate.getMonth();
            const gridContainer = document.querySelector('#calendar-container > div > div:last-child');
            if (gridContainer) {
                gridContainer.innerHTML = renderCalendarGrid(year, month);
            }
        });
    })
    .catch(error => {
        console.error('Error rescheduling task:', error);
        showNotification('Error rescheduling task', 'error');
    });
    
    calendarDraggedTask = null;
}

/**
 * Open day modal showing all tasks for a specific date
 */
function openCalendarDayModal(date) {
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Find all tasks for this day
    const dayTasks = allTasks.filter(task => {
        if (task.is_archived === 1 || task.is_deleted === 1) return false;
        if (calendarHideCompleted && task.status_name?.toLowerCase() === 'done') return false;
        
        let hasDateMatch = false;
        
        if (calendarShowDueDate && task.due_date) {
            const dueDate = new Date(task.due_date);
            if (dueDate.getFullYear() === year && dueDate.getMonth() === month - 1 && dueDate.getDate() === day) {
                hasDateMatch = true;
                task._displayDateType = task._displayDateType || 'due';
            }
        }
        
        if (calendarShowReminderDate && task.reminder_date) {
            const reminderDate = new Date(task.reminder_date);
            if (reminderDate.getFullYear() === year && reminderDate.getMonth() === month - 1 && reminderDate.getDate() === day) {
                hasDateMatch = true;
                if (task._displayDateType === 'due') {
                    task._displayDateType = 'both';
                } else {
                    task._displayDateType = 'reminder';
                }
            }
        }
        
        return hasDateMatch;
    });
    
    // Apply category filters
    const filteredDayTasks = dayTasks.filter(task => {
        if (calendarCategoryFilter && task.category_id !== calendarCategoryFilter) return false;
        if (calendarSubcategoryFilter && task.subcategory_id !== calendarSubcategoryFilter) return false;
        if (calendarProjectFilter && task.project_id !== calendarProjectFilter) return false;
        if (calendarGroupFilter && task.task_group !== calendarGroupFilter) return false;
        
        if (calendarSearchTerm) {
            const searchLower = calendarSearchTerm.toLowerCase();
            return Object.values(task).some(val => 
                val && String(val).toLowerCase().includes(searchLower)
            );
        }
        
        return true;
    });
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'calendar-day-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: var(--bg-fff); border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = 'padding: 20px; border-bottom: 2px solid #007bff; background: var(--bg-f8f9fa); display: flex; justify-content: space-between; align-items: center;';
    header.innerHTML = `
        <h3 style="margin: 0; color: #007bff; font-size: 18px;">
            <i class="fa-solid fa-calendar-day"></i> ${dateStr}
        </h3>
        <button class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--fg-6c757d); padding: 0; width: 30px; height: 30px;">
            ×
        </button>
    `;
    
    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; overflow-y: auto; padding: 20px;';
    
    if (filteredDayTasks.length === 0) {
        content.innerHTML = `
            <p style="text-align: center; color: var(--fg-6c757d); padding: 40px 20px;">
                <i class="fa-solid fa-calendar-xmark" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                No tasks for this day
            </p>
        `;
    } else {
        filteredDayTasks.forEach(task => {
            const bgColor = task._displayDateType === 'due' ? 'var(--bg-fff5f5)' : task._displayDateType === 'reminder' ? 'var(--bg-fff8e1)' : 'var(--bg-e8f5e9)';
            const borderColor = task._displayDateType === 'due' ? '#dc3545' : task._displayDateType === 'reminder' ? '#ff9800' : '#28a745';
            const icon = task._displayDateType === 'due' ? 'calendar-xmark' : task._displayDateType === 'reminder' ? 'clock' : 'calendar-check';
            
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.style.cssText = `padding: 12px; margin-bottom: 10px; background: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 4px; cursor: pointer; transition: all 0.2s;`;
            taskDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <i class="fa-solid fa-${icon}" style="color: ${borderColor}; font-size: 14px;"></i>
                    <span style="font-weight: 600; font-size: 15px; color: var(--fg-212529);">${task.title}</span>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--fg-6c757d);">
                    ${task.status_name ? `<span><i class="fa-solid fa-circle-dot"></i> ${task.status_name}</span>` : ''}
                    ${task.priority_name ? `<span><i class="fa-solid fa-flag"></i> ${task.priority_name}</span>` : ''}
                    ${task.project_id ? `<span><i class="fa-solid fa-diagram-project"></i> ${lookupData.projects.find(p => p.prj_id === task.project_id)?.name || 'Project'}</span>` : ''}
                </div>
            `;
            
            // Add hover effects
            taskDiv.addEventListener('mouseenter', () => {
                taskDiv.style.transform = 'translateX(4px)';
                taskDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            });
            taskDiv.addEventListener('mouseleave', () => {
                taskDiv.style.transform = 'translateX(0)';
                taskDiv.style.boxShadow = 'none';
            });
            
            // Click to open edit modal
            taskDiv.addEventListener('click', () => {
                modal.remove();
                openEditTaskModalById(task.id);
            });
            
            content.appendChild(taskDiv);
        });
    }
    
    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'padding: 15px; border-top: 1px solid var(--bd-dee2e6); background: var(--bg-f8f9fa); text-align: right;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
    closeBtn.addEventListener('click', () => modal.remove());
    footer.appendChild(closeBtn);
    
    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(content);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // Add close button handler in header
    header.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Expose calendar functions to global scope
window.calendarPreviousMonth = calendarPreviousMonth;
window.calendarCurrentMonth = calendarCurrentMonth;
window.calendarNextMonth = calendarNextMonth;
window.handleCalendarSearch = handleCalendarSearch;
window.handleCalendarCategoryFilter = handleCalendarCategoryFilter;
window.handleCalendarSubcategoryFilter = handleCalendarSubcategoryFilter;
window.handleCalendarProjectFilter = handleCalendarProjectFilter;
window.handleCalendarGroupFilter = handleCalendarGroupFilter;
window.handleCalendarDateTypeFilter = handleCalendarDateTypeFilter;
window.handleCalendarHideCompleted = handleCalendarHideCompleted;
window.handleCalendarTaskDragStart = handleCalendarTaskDragStart;
window.handleCalendarDragOver = handleCalendarDragOver;
window.handleCalendarDragLeave = handleCalendarDragLeave;
window.handleCalendarDrop = handleCalendarDrop;
window.openCalendarDayModal = openCalendarDayModal;

// ========================================================================
// BULK OPERATIONS FUNCTIONS
// ========================================================================

function toggleCheckboxMode() {
    checkboxMode = !checkboxMode;
    selectedTasks.clear();
    renderTasksTable();
}

function toggleSelectAll(checked) {
    selectedTasks.clear();
    if (checked) {
        filteredTasks.forEach(task => selectedTasks.add(task.id));
    }
    document.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = checked);
    updateBulkActionsBar();
}

function handleTaskSelection(taskId, checked) {
    if (checked) {
        selectedTasks.add(taskId);
    } else {
        selectedTasks.delete(taskId);
    }
    updateBulkActionsBar();
    
    const allCheckboxes = document.querySelectorAll('.task-checkbox');
    const checkedCount = document.querySelectorAll('.task-checkbox:checked').length;
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = (checkedCount > 0 && checkedCount === allCheckboxes.length);
    }
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulk-actions-bar');
    if (bar) {
        bar.style.display = selectedTasks.size > 0 ? 'flex' : 'none';
        const count = bar.querySelector('.selected-count');
        if (count) {
            count.textContent = `${selectedTasks.size} task(s) selected`;
        }
    }
}

function clearSelection() {
    selectedTasks.clear();
    document.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = false);
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    updateBulkActionsBar();
}

function bulkChangeStatus() {
    const modal = document.createElement('div');
    modal.id = 'bulk-status-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
            <h3 style="margin: 0 0 20px 0; font-size: 20px; color: var(--fg-333);">Change Status</h3>
            <p style="margin: 0 0 20px 0; color: var(--fg-666);">Change status for ${selectedTasks.size} task(s)</p>
            <select id="bulk-status-select" style="width: 100%; padding: 12px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; margin-bottom: 20px;">
                ${(lookupData.lkp_status || []).map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
            </select>
            <div style="display: flex; gap: 10px;">
                <button onclick="applyBulkStatus()" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Apply</button>
                <button onclick="closeBulkStatusModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function applyBulkStatus() {
    const status = document.getElementById('bulk-status-select').value;
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {status_name: status}
            })
        });
        
        if (response.ok) {
            closeBulkStatusModal();
            clearSelection();
            await fetchTasks();
            showNotification('Status updated successfully', 'success');
        }
    } catch (error) {
        showNotification('Error updating status', 'error');
    }
}

function closeBulkStatusModal() {
    const modal = document.getElementById('bulk-status-modal');
    if (modal) modal.remove();
}

function bulkAssign() {
    const modal = document.createElement('div');
    modal.id = 'bulk-assign-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
            <h3 style="margin: 0 0 20px 0; font-size: 20px; color: var(--fg-333);">Assign Tasks</h3>
            <p style="margin: 0 0 20px 0; color: var(--fg-666);">Assign ${selectedTasks.size} task(s) to</p>
            <input type="text" id="bulk-assign-input" placeholder="Person name" style="width: 100%; padding: 12px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px;">
                <button onclick="applyBulkAssign()" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Apply</button>
                <button onclick="closeBulkAssignModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('bulk-assign-input').focus();
}

async function applyBulkAssign() {
    const assignedTo = document.getElementById('bulk-assign-input').value;
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {assigned_to: assignedTo}
            })
        });
        
        if (response.ok) {
            closeBulkAssignModal();
            clearSelection();
            await fetchTasks();
            showNotification('Tasks assigned successfully', 'success');
        }
    } catch (error) {
        showNotification('Error assigning tasks', 'error');
    }
}

function closeBulkAssignModal() {
    const modal = document.getElementById('bulk-assign-modal');
    if (modal) modal.remove();
}

function bulkReschedule() {
    const modal = document.createElement('div');
    modal.id = 'bulk-reschedule-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
            <h3 style="margin: 0 0 20px 0; font-size: 20px; color: var(--fg-333);">Reschedule Tasks</h3>
            <p style="margin: 0 0 20px 0; color: var(--fg-666);">Set new due date for ${selectedTasks.size} task(s)</p>
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--fg-333);">New Due Date:</label>
            <input type="date" id="bulk-date-input" style="width: 100%; padding: 12px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px;">
                <button onclick="applyBulkReschedule()" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Apply</button>
                <button onclick="closeBulkRescheduleModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function applyBulkReschedule() {
    const dueDate = document.getElementById('bulk-date-input').value;
    if (!dueDate) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {due_date: dueDate}
            })
        });
        
        if (response.ok) {
            closeBulkRescheduleModal();
            clearSelection();
            await fetchTasks();
            showNotification('Tasks rescheduled successfully', 'success');
        }
    } catch (error) {
        showNotification('Error rescheduling tasks', 'error');
    }
}

function closeBulkRescheduleModal() {
    const modal = document.getElementById('bulk-reschedule-modal');
    if (modal) modal.remove();
}

function bulkChangeCategory() {
    const modal = document.createElement('div');
    modal.id = 'bulk-category-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
            <h3 style="margin: 0 0 20px 0; font-size: 20px; color: var(--fg-333);">Change Category</h3>
            <p style="margin: 0 0 20px 0; color: var(--fg-666);">Set category for ${selectedTasks.size} task(s)</p>
            <select id="bulk-category-select" style="width: 100%; padding: 12px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; margin-bottom: 20px;">
                <option value="">None</option>
                ${(lookupData.categories || []).map(c => `<option value="${c.cat_id}">${c.name}</option>`).join('')}
            </select>
            <div style="display: flex; gap: 10px;">
                <button onclick="applyBulkCategory()" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Apply</button>
                <button onclick="closeBulkCategoryModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function applyBulkCategory() {
    const categoryId = document.getElementById('bulk-category-select').value;
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {category_id: categoryId || null}
            })
        });
        
        if (response.ok) {
            closeBulkCategoryModal();
            clearSelection();
            await fetchTasks();
            showNotification('Category updated successfully', 'success');
        }
    } catch (error) {
        showNotification('Error updating category', 'error');
    }
}

function closeBulkCategoryModal() {
    const modal = document.getElementById('bulk-category-modal');
    if (modal) modal.remove();
}

function bulkChangeProject() {
    const modal = document.createElement('div');
    modal.id = 'bulk-project-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
            <h3 style="margin: 0 0 20px 0; font-size: 20px; color: var(--fg-333);">Change Project</h3>
            <p style="margin: 0 0 20px 0; color: var(--fg-666);">Set project for ${selectedTasks.size} task(s)</p>
            <select id="bulk-project-select" style="width: 100%; padding: 12px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; margin-bottom: 20px;">
                <option value="">None</option>
                ${(lookupData.projects || []).map(p => `<option value="${p.prj_id}">${p.name}</option>`).join('')}
            </select>
            <div style="display: flex; gap: 10px;">
                <button onclick="applyBulkProject()" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Apply</button>
                <button onclick="closeBulkProjectModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function applyBulkProject() {
    const projectId = document.getElementById('bulk-project-select').value;
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {project_id: projectId || null}
            })
        });
        
        if (response.ok) {
            closeBulkProjectModal();
            clearSelection();
            await fetchTasks();
            showNotification('Project updated successfully', 'success');
        }
    } catch (error) {
        showNotification('Error updating project', 'error');
    }
}

function closeBulkProjectModal() {
    const modal = document.getElementById('bulk-project-modal');
    if (modal) modal.remove();
}

async function bulkArchive() {
    if (!confirm(`Archive ${selectedTasks.size} task(s)?`)) {
        return;
    }
    
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {is_archived: 1}
            })
        });
        
        if (response.ok) {
            clearSelection();
            await fetchTasks();
            showNotification('Tasks archived successfully', 'success');
        }
    } catch (error) {
        showNotification('Error archiving tasks', 'error');
    }
}

async function bulkDelete() {
    if (!confirm(`Move ${selectedTasks.size} task(s) to trash?`)) {
        return;
    }
    
    const taskIds = Array.from(selectedTasks);
    
    try {
        const response = await fetch('/api/tasks/bulk-update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                task_ids: taskIds,
                updates: {is_deleted: 1}
            })
        });
        
        if (response.ok) {
            clearSelection();
            await fetchTasks();
            showNotification('Tasks moved to trash', 'success');
        }
    } catch (error) {
        showNotification('Error moving tasks to trash', 'error');
    }
}
// ========================================================================
// RECURRING TASKS FUNCTIONS
// ========================================================================

function checkRecurringTaskBeforeEdit(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    
    if (task && task.recurrence_parent_id) {
        showRecurringEditChoice(taskId);
    } else {
        openEditTaskModalById(taskId);
    }
}

function showRecurringEditChoice(taskId) {
    const modal = document.createElement('div');
    modal.id = 'recurring-edit-choice-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-fff); padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 15px 0; font-size: 22px; color: var(--fg-333);">
                <i class="fa-solid fa-rotate" style="color: var(--fg-6f42c1); margin-right: 8px;"></i>
                Edit Recurring Task
            </h3>
            <p style="margin: 0 0 25px 0; color: var(--fg-666); line-height: 1.6;">This is a recurring task. How would you like to apply changes?</p>
            
            <button onclick="editSingleInstance(${taskId})" 
                    style="width: 100%; margin-bottom: 12px; padding: 15px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;"
                    onmouseover="this.style.background='#0056b3'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,123,255,0.3)'"
                    onmouseout="this.style.background='#007bff'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <i class="fa-solid fa-file"></i> Edit This Instance Only
            </button>
            
            <button onclick="editAllFutureInstances(${taskId})" 
                    style="width: 100%; margin-bottom: 20px; padding: 15px; background: #6f42c1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;"
                    onmouseover="this.style.background='#5a34a1'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(111,66,193,0.3)'"
                    onmouseout="this.style.background='#6f42c1'; this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <i class="fa-solid fa-layer-group"></i> Edit All Future Instances
            </button>
            
            <button onclick="closeRecurringEditChoice()" 
                    style="width: 100%; padding: 12px; background: var(--bg-fff); color: var(--fg-6c757d); border: 2px solid var(--bd-dee2e6); border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s;"
                    onmouseover="this.style.background='var(--bg-f8f9fa)'"
                    onmouseout="this.style.background='var(--bg-fff)'">
                Cancel
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function editSingleInstance(taskId) {
    closeRecurringEditChoice();
    openEditTaskModalById(taskId);
}

let editingFutureInstances = false;
let currentEditingTaskId = null;

function editAllFutureInstances(taskId) {
    closeRecurringEditChoice();
    editingFutureInstances = true;
    currentEditingTaskId = taskId;
    openEditTaskModalById(taskId);
}

function closeRecurringEditChoice() {
    const modal = document.getElementById('recurring-edit-choice-modal');
    if (modal) modal.remove();
}

const originalHandleEditTaskSubmit = window.handleEditTaskSubmit;

window.handleEditTaskSubmit = async function(event, taskId) {
    event.preventDefault();
    
    if (editingFutureInstances && currentEditingTaskId === taskId) {
        const formData = {};
        
        allColumnSettings.forEach(col => {
            if (col.column_name === 'id' || col.column_name === 'created_at') return;
            
            const input = document.getElementById(`task-${col.column_name}`);
            if (input) {
                formData[col.column_name] = input.value || null;
            }
        });
        
        try {
            const response = await fetch(`/api/tasks/${taskId}/edit-future-instances`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                closeEditTaskModal();
                await fetchTasks();
                showNotification('Task and future instances updated successfully', 'success');
                editingFutureInstances = false;
                currentEditingTaskId = null;
            } else {
                showNotification('Error updating future instances', 'error');
            }
        } catch (error) {
            showNotification('Error updating future instances', 'error');
        }
    } else {
        if (originalHandleEditTaskSubmit) {
            originalHandleEditTaskSubmit(event, taskId);
        }
    }
};

async function completeTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/complete`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        if (response.ok) {
            await fetchTasks();
            showNotification('Task completed', 'success');
        }
    } catch (error) {
        showNotification('Error completing task', 'error');
    }
}

function getRecurringIcon(task) {
    if (task.recurrence_parent_id !== null && task.recurrence_parent_id !== undefined) {
        return '<i class="fa-solid fa-rotate" style="color: var(--fg-6f42c1); margin-left: 5px;" title="Recurring Task"></i>';
    }
    return '';
}

// Add recurrence type handling to field generation
window.originalGenerateFieldHTML = window.generateFieldHTML || function() {};

function generateRecurrenceField(colName, currentValue, prefix = 'task') {
    return `<select id="${prefix}-${colName}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; font-size: 14px; background: var(--bg-fff);">
        <option value="">None (One-time task)</option>
        <option value="daily" ${currentValue === 'daily' ? 'selected' : ''}>Daily</option>
        <option value="weekly" ${currentValue === 'weekly' ? 'selected' : ''}>Weekly</option>
        <option value="monthly" ${currentValue === 'monthly' ? 'selected' : ''}>Monthly</option>
        <option value="yearly" ${currentValue === 'yearly' ? 'selected' : ''}>Yearly</option>
    </select>`;
}

// Handlers for header action buttons
function handleBulkEdit() {
    if (selectedTasks.size === 0) {
        showNotification('Please select at least one task to edit', 'error');
        return;
    }
    if (selectedTasks.size === 1) {
        const taskId = Array.from(selectedTasks)[0];
        checkRecurringTaskBeforeEdit(taskId);
    } else {
        showNotification('Please select only one task to edit', 'error');
    }
}

function handleBulkDuplicate() {
    if (selectedTasks.size === 0) {
        showNotification('Please select at least one task to duplicate', 'error');
        return;
    }
    if (selectedTasks.size === 1) {
        const taskId = Array.from(selectedTasks)[0];
        duplicateTask(taskId);
    } else {
        showNotification('Please select only one task to duplicate', 'error');
    }
}

function handleBulkDeleteButton() {
    if (selectedTasks.size === 0) {
        showNotification('Please select at least one task to delete', 'error');
        return;
    }
    bulkDelete();
}

// Wrapper function for compatibility
async function fetchTasks() {
    return await initializeTasksTable();
}

function toggleBulkActionsBar() {
    showBulkActionsBar = !showBulkActionsBar;
    renderTasksTable();
}

function handleBulkArchiveButton() {
    if (selectedTasks.size === 0) {
        showNotification('Please select at least one task to archive', 'error');
        return;
    }
    bulkArchive();
}

// Kanban card context menu for recurring tasks
function showKanbanCardMenu(event, taskId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove any existing menu
    const existingMenu = document.getElementById('kanban-card-menu');
    if (existingMenu) existingMenu.remove();
    
    // Get task to check if recurring
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
        console.error('Task not found:', taskId);
        return;
    }
    
    // A task is recurring if it has a parent OR has recurrence type set
    const isRecurringInstance = task.recurrence_parent_id !== null && task.recurrence_parent_id !== undefined;
    const isRecurringParent = task.recurrence_type && !task.recurrence_parent_id;
    const isRecurring = isRecurringInstance || isRecurringParent;
    
    console.log('Task context menu:', {
        id: taskId, 
        isRecurring, 
        isRecurringInstance,
        isRecurringParent,
        recurrence_parent_id: task.recurrence_parent_id, 
        recurrence_type: task.recurrence_type
    });
    
    // Create context menu
    const menu = document.createElement('div');
    menu.id = 'kanban-card-menu';
    menu.style.cssText = `
        position: fixed;
        top: ${event.clientY}px;
        left: ${event.clientX}px;
        background: var(--bg-fff);
        border: 1px solid var(--bd-dee2e6);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 200px;
    `;
    
    if (isRecurring) {
        menu.innerHTML = `
            <div style="padding: 8px 0;">
                <div onclick="editSingleInstance(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-edit" style="color: #007bff; width: 20px;"></i>
                    Edit This Instance
                </div>
                <div onclick="editAllFutureInstances(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-layer-group" style="color: var(--fg-6f42c1); width: 20px;"></i>
                    Edit All Future Instances
                </div>
                <div onclick="completeTask(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-check" style="color: #28a745; width: 20px;"></i>
                    Mark as Done
                </div>
            </div>
        `;
    } else {
        menu.innerHTML = `
            <div style="padding: 8px 0;">
                <div onclick="checkRecurringTaskBeforeEdit(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-edit" style="color: #007bff; width: 20px;"></i>
                    Edit Task
                </div>
                <div onclick="duplicateTask(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-copy" style="color: var(--fg-6c757d); width: 20px;"></i>
                    Duplicate Task
                </div>
                <div onclick="deleteTask(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--bg-f8f9fa)'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-trash" style="color: #dc3545; width: 20px;"></i>
                    Delete Task
                </div>
                <div style="height:1px; background:var(--bg-dee2e6); margin:4px 0;"></div>
                <div onclick="window._focusTitle=${taskId}; openSendToFocusModal(${taskId}); document.getElementById('kanban-card-menu').remove();" 
                     style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='#fff3e0'"
                     onmouseout="this.style.background='var(--bg-fff)'">
                    <i class="fa-solid fa-crosshairs" style="color: #fd7e14; width: 20px;"></i>
                    Send to Focus Board
                </div>
            </div>
        `;
    }
    
    document.body.appendChild(menu);
    
    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// ============================================================================
//                    ALL PROBLEMS PAGE - Fishbone + Table View
// ============================================================================
// Function names are prefixed with "prob" where the old Problem-page code
// collided with global names (e.g. sortTable, which broke All Tasks sorting).

let problemView = "fishbone"; // 'fishbone' or 'table'

const PROBLEM_PROJECT_TYPE = 'Problem';

/**
 * Initialize the All Problems page.
 * Problems are stored as projects with project_type = 'Problem';
 * their root causes live in the `causes` table (fishbone branches).
 */
function initializeProblemsPage() {
    window.problemPageName = PROBLEM_PROJECT_TYPE;
    const container = document.getElementById('problems-page-container');
    if (!container) return;
    container.innerHTML = '<div id="problem-container"><p>Loading problems...</p></div>';
    loadProblemsData(PROBLEM_PROJECT_TYPE);
}

function loadProblemsData(pageName) {
    Promise.all([
        fetch('/api/lookups').then(r => r.json()),
        fetch('/api/causes').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()).catch(() => [])
    ])
    .then(([lookups, causes, tasks]) => {
        lookupData = lookups;
        window.problemPageTasks = Array.isArray(tasks) ? tasks : [];
        window.problemPageProblems = (lookups.projects || []).filter(p => 
            p.project_type === PROBLEM_PROJECT_TYPE && !p.is_deleted
        );
        window.problemPageCauses = causes;
        
        // Keep a valid selection (default to the first problem)
        const ids = window.problemPageProblems.map(p => p.prj_id);
        if (!ids.includes(window.selectedProblemId)) {
            window.selectedProblemId = ids.length > 0 ? ids[0] : null;
        }
        
        renderProblemsLayout(pageName);
    })
    .catch(err => {
        const c = document.getElementById('problem-container');
        if (c) c.innerHTML = `<p style="color: #dc3545;">Error loading problems: ${err.message}</p>`;
    });
}

function renderProblemsLayout(pageName) {
    const container = document.getElementById('problem-container');
    const isMinimized = window.problemNavMinimized || false;
    
    container.innerHTML = `
        <div class="two-panel-layout" style="display: flex; height: calc(100vh - 120px); gap: 0;">
            <div id="problems-nav" class="two-panel-nav" style="width: ${isMinimized ? '50px' : '250px'}; background: var(--bg-f8f9fa); border-right: 1px solid var(--bd-dee2e6); overflow-y: auto; flex-shrink: 0; transition: width 0.3s;">
                <div style="padding: 15px; border-bottom: 1px solid var(--bd-dee2e6); background: #007bff; color: white; display: flex; justify-content: space-between; align-items: center;">
                    ${!isMinimized ? '<h3 style="margin: 0; font-size: 1.1em;"><i class="fa-solid fa-circle-exclamation"></i> Problems</h3>' : ''}
                    <button onclick="toggleProblemNav()" style="background: none; border: none; cursor: pointer; font-size: 1.2em; padding: 5px; color: white;">
                        <i class="fa-solid fa-${isMinimized ? 'chevron-right' : 'chevron-left'}"></i>
                    </button>
                </div>
                <div style="display: ${isMinimized ? 'none' : 'block'};">
                    <div style="padding: 10px 15px;">
                        <input type="text" id="problem-search" placeholder="Search problems..." oninput="filterProblems()" style="width: 100%; padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 4px; font-size: 0.9em;">
                    </div>
                    <div style="padding: 10px; background: var(--bg-fff); border-bottom: 1px solid var(--bd-dee2e6);">
                        <label style="display: flex; align-items: center; font-size: 0.9em; cursor: pointer;">
                            <input type="checkbox" id="hide-completed-problems" onchange="filterProblems()" style="margin-right: 8px; width: 16px; height: 16px;">
                            <span style="font-weight: 500;">Hide Completed Problems</span>
                        </label>
                        <div style="display: flex; gap: 6px; margin-top: 8px;">
                            <button onclick="openCreateProjectGroupPrompt('problem')" title="Create a problem group"
                                    style="flex: 1; padding: 6px 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.82em;">
                                <i class="fa-solid fa-folder-plus"></i> New Group
                            </button>
                            <button onclick="openManageProjectGroupsModal('problem')" title="Rename, reorder or delete groups"
                                    style="flex: 1; padding: 6px 8px; background: var(--bg-fff); color: #007bff; border: 1px solid #007bff; border-radius: 4px; cursor: pointer; font-size: 0.82em;">
                                <i class="fa-solid fa-folder-tree"></i> Manage
                            </button>
                        </div>
                    </div>
                    <div id="problems-list" style="padding: 10px;"></div>
                </div>
            </div>
            <div id="problem-main" class="two-panel-content" style="flex: 1; background: var(--bg-f8fafc); overflow: auto;"></div>
        </div>
    `;
    
    probEnsureSelection();
    renderProblemsList();
    renderProblemMainArea();
}

// ============================================================================
//            PROBLEM PROPERTIES + FILTERS (Project, Task Group, Category, Sub-Category)
// ============================================================================
// Problem fields: problem_project_id, task_group, category_id, subcategory_id
// Root cause fields: project_id, task_group (empty = inherits from its problem)

let problemFilters = { project: '', task_group: '', category: '', subcategory: '' };

const PROB_FILTER_KEYS = ['project', 'task_group', 'category', 'subcategory'];

function probRealProjects() {
    return (lookupData.projects || []).filter(p => !isProblemProject(p)).sort((a, b) => a.name.localeCompare(b.name));
}
function probProjectName(id) {
    const p = (lookupData.projects || []).find(x => x.prj_id === id);
    return p ? p.name : '';
}
function probCategoryName(id) {
    const c = (lookupData.categories || []).find(x => x.cat_id === id);
    return c ? c.name : '';
}
function probSubcategoryName(id) {
    const s = (lookupData.subcategories || []).find(x => x.scat_id === id);
    return s ? s.name : '';
}
function probTaskGroupOptions() {
    const values = [
        ...(window.problemPageTasks || []).map(t => t.task_group),
        ...(window.problemPageProblems || []).map(p => p.task_group),
        ...(window.problemPageCauses || []).map(c => c.task_group)
    ].filter(v => v && String(v).trim());
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function causeEffective(cause, problem) {
    return {
        project: cause.project_id || (problem && problem.problem_project_id) || '',
        task_group: cause.task_group || (problem && problem.task_group) || ''
    };
}

function probCauseFilterActive() {
    return !!(problemFilters.project || problemFilters.task_group);
}

function causeMatchesFilters(cause, problem) {
    if (!probCauseFilterActive()) return true;
    const e = causeEffective(cause, problem);
    if (problemFilters.project && e.project !== problemFilters.project) return false;
    if (problemFilters.task_group && e.task_group !== problemFilters.task_group) return false;
    return true;
}

function problemMatchesFilters(problem) {
    if (problemFilters.category && problem.category_id !== problemFilters.category) return false;
    if (problemFilters.subcategory && problem.subcategory_id !== problemFilters.subcategory) return false;
    if (!probCauseFilterActive()) return true;
    const ownMatch = (!problemFilters.project || problem.problem_project_id === problemFilters.project)
        && (!problemFilters.task_group || problem.task_group === problemFilters.task_group);
    if (ownMatch) return true;
    return (window.problemPageCauses || []).some(c => c.problem_id === problem.prj_id && causeMatchesFilters(c, problem));
}

function probFilterActiveCount() {
    return PROB_FILTER_KEYS.filter(k => problemFilters[k]).length;
}

function probFilterButtonHtml() {
    const count = probFilterActiveCount();
    const subcats = (lookupData.subcategories || []).filter(s => !problemFilters.category || s.category_id === problemFilters.category);
    const sel = (key, options, allLabel, title) => {
        const active = !!problemFilters[key];
        return `
        <select onchange="setProblemFilter('${key}', this.value)" title="${title}"
                style="padding: 8px; border: 1px solid ${active ? '#007bff' : 'var(--bd-ced4da)'}; border-radius: 4px; min-width: 140px; max-width: 190px; background: var(--bg-fff); color: var(--fg-212529); ${active ? 'box-shadow: 0 0 0 1px #007bff;' : ''}">
            <option value="">${allLabel}</option>
            ${options.map(o => `<option value="${escapeHtml(o.value)}" ${problemFilters[key] === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
        </select>`;
    };
    const inherit = "Also filters branches and root causes (a root cause without its own value uses its problem's value)";
    return `
        <div id="prob-filter-bar" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            ${sel('project', probRealProjects().map(p => ({ value: p.prj_id, label: p.name })), 'All Projects', inherit)}
            ${sel('task_group', probTaskGroupOptions().map(g => ({ value: g, label: g })), 'All Task Groups', inherit)}
            ${sel('category', (lookupData.categories || []).map(c => ({ value: c.cat_id, label: c.name })), 'All Categories', 'Filter problems by category')}
            ${sel('subcategory', subcats.map(s => ({ value: s.scat_id, label: s.name })), 'All Sub-Categories', 'Filter problems by sub-category')}
            ${count ? `<button onclick="clearProblemFilters()" title="Clear all filters" style="padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"><i class="fa-solid fa-times"></i> Clear</button>` : ''}
        </div>`;
}

function setProblemFilter(key, value) {
    problemFilters[key] = value || '';
    if (key === 'category' && problemFilters.subcategory) {
        const sc = (lookupData.subcategories || []).find(s => s.scat_id === problemFilters.subcategory);
        if (!sc || (value && sc.category_id !== value)) problemFilters.subcategory = '';
    }
    probRefreshAfterFilter();
}

function clearProblemFilters() {
    problemFilters = { project: '', task_group: '', category: '', subcategory: '' };
    probRefreshAfterFilter();
}

function probRefreshAfterFilter() {
    probEnsureSelection();
    renderProblemsList();
    renderProblemMainArea();
}

function probEnsureSelection() {
    const visibleIds = (window.problemPageProblems || []).filter(problemMatchesFilters).map(p => p.prj_id);
    if (!visibleIds.includes(window.selectedProblemId)) {
        window.selectedProblemId = visibleIds.length ? visibleIds[0] : null;
    }
}

function renderProblemMainArea() {
    const main = document.getElementById('problem-main');
    if (!main) return;
    if (window.selectedProblemId) {
        renderProblemContent();
        return;
    }
    const anyProblems = (window.problemPageProblems || []).length > 0;
    if (anyProblems && probFilterActiveCount()) {
        main.innerHTML = `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: flex-end; background: var(--bg-fff); padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${probFilterButtonHtml()}</div>
                <div style="text-align: center; color: var(--fg-6c757d); margin-top: 60px;">
                    <i class="fa-solid fa-filter" style="font-size: 2.5em; color: var(--fg-ced4da);"></i>
                    <h3 style="margin: 15px 0 8px 0; color: var(--fg-495057);">No problems match these filters</h3>
                    <button onclick="clearProblemFilters()" style="padding: 8px 18px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Clear filters</button>
                </div>
            </div>`;
        return;
    }
    main.innerHTML = `
        <div style="text-align: center; color: var(--fg-6c757d); margin-top: 80px;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 3em; color: var(--fg-ced4da);"></i>
            <h3 style="margin: 15px 0 8px 0; color: var(--fg-495057);">No problems yet</h3>
            <p style="margin: 0 0 20px 0;">Create a problem, then break it down into root causes on a fishbone diagram.</p>
            <button onclick="openCreateProblemModal()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                <i class="fa-solid fa-plus"></i> Create Problem
            </button>
        </div>`;
}

function probPropsSummaryHtml(problem) {
    const chip = (icon, label, value) => value
        ? `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 12px; background: var(--bg-f1f3f5); color: var(--fg-495057); font-size: 0.82em;"><i class="fa-solid ${icon}" style="opacity: 0.7;"></i>${label}: <strong>${escapeHtml(value)}</strong></span>`
        : '';
    const chips = [
        chip('fa-diagram-project', 'Project', probProjectName(problem.problem_project_id)),
        chip('fa-tag', 'Task Group', problem.task_group),
        chip('fa-folder', 'Category', probCategoryName(problem.category_id)),
        chip('fa-folder-tree', 'Sub-Category', probSubcategoryName(problem.subcategory_id))
    ].filter(Boolean);
    let filterNote = '';
    if (probCauseFilterActive()) {
        const all = (window.problemPageCauses || []).filter(c => c.problem_id === problem.prj_id);
        const shown = all.filter(c => causeMatchesFilters(c, problem));
        filterNote = `<span style="font-size: 0.82em; color: #007bff;"><i class="fa-solid fa-filter"></i> Showing ${shown.length} of ${all.length} root causes</span>`;
    }
    if (!chips.length && !filterNote) {
        return `<div style="margin: -10px 0 14px; font-size: 0.82em; color: var(--fg-6c757d);">No properties set · <a href="#" onclick="openEditProblemModal(); return false;">add Project, Task Group, Category…</a></div>`;
    }
    return `<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: -10px 0 14px;">${chips.join('')}${filterNote}</div>`;
}

function probPropertyFieldsHtml(prefix, values = {}) {
    const inputStyle = 'width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px;';
    const cat = values.category_id || '';
    const subcats = (lookupData.subcategories || []).filter(s => !cat || s.category_id === cat);
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Project</label>
                <select id="${prefix}-project" style="${inputStyle}">
                    <option value="">None</option>
                    ${probRealProjects().map(p => `<option value="${p.prj_id}" ${p.prj_id === values.problem_project_id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Task Group</label>
                <input type="text" id="${prefix}-task-group" list="${prefix}-task-group-list" value="${escapeHtml(values.task_group || '')}" placeholder="e.g. Roll-out" style="${inputStyle}">
                <datalist id="${prefix}-task-group-list">${probTaskGroupOptions().map(g => `<option value="${escapeHtml(g)}"></option>`).join('')}</datalist>
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Category</label>
                <select id="${prefix}-category" onchange="probUpdateSubcategoryOptions('${prefix}')" style="${inputStyle}">
                    <option value="">None</option>
                    ${(lookupData.categories || []).map(c => `<option value="${c.cat_id}" ${c.cat_id === cat ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Sub-Category</label>
                <select id="${prefix}-subcategory" style="${inputStyle}">
                    <option value="">None</option>
                    ${subcats.map(s => `<option value="${s.scat_id}" ${s.scat_id === values.subcategory_id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
                </select>
            </div>
        </div>`;
}

function probUpdateSubcategoryOptions(prefix) {
    const cat = document.getElementById(`${prefix}-category`)?.value || '';
    const sel = document.getElementById(`${prefix}-subcategory`);
    if (!sel) return;
    const current = sel.value;
    const subcats = (lookupData.subcategories || []).filter(s => !cat || s.category_id === cat);
    sel.innerHTML = `<option value="">None</option>` + subcats.map(s => `<option value="${s.scat_id}">${escapeHtml(s.name)}</option>`).join('');
    if (subcats.some(s => s.scat_id === current)) sel.value = current;
}

function probReadPropertyFields(prefix) {
    return {
        problem_project_id: document.getElementById(`${prefix}-project`)?.value || null,
        task_group: (document.getElementById(`${prefix}-task-group`)?.value || '').trim() || null,
        category_id: document.getElementById(`${prefix}-category`)?.value || null,
        subcategory_id: document.getElementById(`${prefix}-subcategory`)?.value || null
    };
}

// New root causes created while a Project / Task Group filter is active take those values
function probNewCauseDefaults() {
    const d = {};
    if (problemFilters.project) d.project_id = problemFilters.project;
    if (problemFilters.task_group) d.task_group = problemFilters.task_group;
    return d;
}

window.setProblemFilter = setProblemFilter;
window.clearProblemFilters = clearProblemFilters;
window.probUpdateSubcategoryOptions = probUpdateSubcategoryOptions;

function renderProblemsList() {
    const container = document.getElementById('problems-list');
    if (!container) return;
    
    const search = (document.getElementById('problem-search')?.value || '').toLowerCase();
    const hideCompleted = document.getElementById('hide-completed-problems')?.checked;
    const groups = groupsForScope('problem');
    const groupIds = new Set(groups.map(g => g.group_id));
    
    const visible = window.problemPageProblems.filter(p => {
        if (!problemMatchesFilters(p)) return false;
        if (hideCompleted) {
            const causes = window.problemPageCauses.filter(c => c.problem_id === p.prj_id);
            const allDone = causes.length > 0 && causes.every(c => c.status === 'Closed');
            if (allDone) return false;
        }
        return true;
    });
    const matches = p => !search || p.name.toLowerCase().includes(search);
    
    // Problem rows show only the problem name
    const row = p => {
        const selected = window.selectedProblemId === p.prj_id;
        return `
            <div class="problem-nav-row" draggable="true" ondragstart="handleProjectNavDragStart(event, '${p.prj_id}')"
                 onclick="selectProblem('${p.prj_id}')" title="${escapeHtml(p.name)}"
                 style="display: flex; align-items: center; gap: 6px; padding: 10px 12px; margin-bottom: 6px; border-radius: 6px; cursor: pointer; background: ${selected ? '#007bff' : 'var(--bg-fff)'}; color: ${selected ? 'white' : 'var(--fg-212529)'}; border: 1px solid ${selected ? '#007bff' : 'var(--bd-dee2e6)'};">
                <div style="flex: 1; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(p.name)}</div>
                <button class="problem-nav-move" onclick="event.stopPropagation(); openMoveProjectToGroupModal('${p.prj_id}')" title="Move to group"
                        style="background: none; border: none; cursor: pointer; padding: 2px 4px; color: ${selected ? 'white' : 'var(--fg-6c757d)'};">
                    <i class="fa-solid fa-folder-tree"></i>
                </button>
            </div>
        `;
    };
    
    const section = (groupId, name, members, collapseKey, isUngrouped) => {
        const collapsed = !search && !!projectGroupCollapsed[collapseKey];
        return `
            <div class="project-group-section" data-group-id="${groupId}"
                 ondragover="handleProjectGroupDragOver(event)" ondragleave="handleProjectGroupDragLeave(event)"
                 ondrop="handleProjectGroupDrop(event, '${groupId}')"
                 style="margin-bottom: 10px; border-radius: 8px;">
                <div onclick="toggleProjectGroupCollapse('${collapseKey}', 'problem')"
                     style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; user-select: none; margin-bottom: 6px; border-radius: 6px;
                            background: ${isUngrouped ? 'var(--bg-f1f3f5)' : 'var(--bg-e7f1ff)'}; border-left: 4px solid ${isUngrouped ? 'var(--bd-adb5bd)' : '#007bff'};">
                    <i class="fa-solid fa-chevron-${collapsed ? 'right' : 'down'}" style="font-size: 0.75em; width: 12px; color: ${isUngrouped ? 'var(--fg-6c757d)' : 'var(--fg-0056b3)'};"></i>
                    <i class="fa-${isUngrouped ? 'regular' : 'solid'} fa-folder${collapsed || isUngrouped ? '' : '-open'}" style="color: ${isUngrouped ? 'var(--fg-6c757d)' : '#007bff'};"></i>
                    <span style="flex: 1; font-weight: 600; font-size: 0.9em; color: ${isUngrouped ? 'var(--fg-495057)' : 'var(--fg-0b3d91)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(name)}</span>
                    <span style="font-size: 0.75em; color: var(--fg-6c757d);">${members.length}</span>
                </div>
                ${collapsed ? '' : `
                    <div style="padding-left: 10px;">
                        ${members.map(row).join('')}
                        ${members.length === 0 && !isUngrouped ? '<div style="font-size: 0.8em; color: var(--fg-6c757d); padding: 6px 10px; border: 1px dashed var(--bd-ced4da); border-radius: 6px;">Drag problems here</div>' : ''}
                    </div>
                `}
            </div>
        `;
    };
    
    let html = '';
    if (groups.length === 0) {
        html += visible.filter(matches).map(row).join('');
    } else {
        groups.forEach(g => {
            const members = visible.filter(p => p.group_id === g.group_id);
            const nameMatches = !search || g.name.toLowerCase().includes(search);
            const shown = nameMatches ? members : members.filter(matches);
            if (search && !nameMatches && shown.length === 0) return;
            html += section(g.group_id, g.name, shown, g.group_id, false);
        });
        const ungrouped = visible.filter(p => !p.group_id || !groupIds.has(p.group_id)).filter(matches);
        if (ungrouped.length > 0 || !search) {
            html += section('', 'Ungrouped', ungrouped, '__ungrouped_problem__', true);
        }
    }
    if (!html && search) {
        html = '<p style="color: var(--fg-6c757d); padding: 10px; text-align: center;">No problems found</p>';
    }
    
    html += `<button onclick="openCreateProblemModal()" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; margin-top: 10px;"><i class="fa-solid fa-plus"></i> Create Problem</button>`;
    container.innerHTML = html;
}

function selectProblem(problemId) {
    window.selectedProblemId = problemId;
    renderProblemsList();
    renderProblemContent();
}

function renderProblemContent() {
    if (problemView === 'fishbone') {
        probRenderFishboneView();
    } else {
        probRenderTableView();
    }
}

function probRenderFishboneView() {
    const container = document.getElementById('problem-main');
    const problem = window.problemPageProblems.find(p => p.prj_id === window.selectedProblemId);
    if (!problem) return;
    
    const causes = window.problemPageCauses.filter(c => c.problem_id === problem.prj_id && causeMatchesFilters(c, problem));
    const branches = [...new Set(causes.map(c => c.branch_name))];
    
    // Group by position
    const byPos = { top: [], bottom: [] };
    branches.forEach(bn => {
        const branchCauses = causes.filter(c => c.branch_name === bn);
        const pos = branchCauses[0]?.branch_position || 'top';
        byPos[pos].push({ name: bn, causes: branchCauses });
    });
    
    // FIXED spine position with top padding for boxes to grow upward
    const topPadding = 600; // Space above spine for boxes to grow
    const spineY = topPadding; // Spine at 600px from top
    const branchLineLength = 150;
    
    // Calculate max box height to ensure canvas is tall enough
    let maxTopBoxHeight = 150;
    let maxBottomBoxHeight = 150;
    
    byPos.top.forEach(branch => {
        const h = 120 + (branch.causes.length * 35);
        if (h > maxTopBoxHeight) maxTopBoxHeight = h;
    });
    
    byPos.bottom.forEach(branch => {
        const h = 120 + (branch.causes.length * 35);
        if (h > maxBottomBoxHeight) maxBottomBoxHeight = h;
    });
    
    // Canvas height: top padding + spine + bottom content
    const canvasHeight = topPadding + 100 + branchLineLength + maxBottomBoxHeight + 200;
    
    const slots = Math.max(byPos.top.length, byPos.bottom.length, 1);
    const spineWidth = 200 + (slots * 240);
    const arrowWidth = 90;
    const totalWidth = arrowWidth + 20 + spineWidth + 100;
    
    // SINGLE container with ONE scrollbar
    container.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="background: var(--bg-fff); padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; gap: 10px; align-items: center; flex-shrink: 0;">
                <button onclick="probSwitchView('table')" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-table"></i> Table View</button>
                <div style="width: 1px; height: 30px; background: var(--bg-dee2e6);"></div>
                <input type="text" id="branch-input" placeholder="Category (e.g. People)" style="width: 180px; padding: 8px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px;">
                <select id="pos-select" style="padding: 8px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px;">
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                </select>
                <button onclick="probAddBranch()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Add Branch</button>
                <button onclick="openEditProblemModal()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-edit"></i> Edit</button>
                ${probFilterButtonHtml()}
            </div>
            ${probPropsSummaryHtml(problem)}
            
            <!-- SINGLE scroll area -->
            <div style="flex: 1; overflow: auto; background: var(--bg-fff); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div id="fishbone-canvas" style="position: relative; width: ${totalWidth}px; height: ${canvasHeight}px;">
                    <!-- Arrow on LEFT -->
                    <div style="position: absolute; left: 0px; top: ${spineY}px; transform: translateY(-60px);">
                        <div style="width: 0; height: 0; border-top: 60px solid transparent; border-bottom: 60px solid transparent; border-right: 90px solid #007bff;">
                            <div style="position: absolute; left: 5px; top: 52px; width: 80px; color: white; font-weight: bold; text-align: center; font-size: 11px; line-height: 1.2;">
                                ${problem.name.toUpperCase().substring(0, 30)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Spine FIXED at Y=${spineY} -->
                    <div style="position: absolute; left: ${arrowWidth}px; top: ${spineY}px; height: 6px; background: #007bff; width: ${spineWidth}px;"></div>
                </div>
            </div>
        </div>
    `;
    
    probRenderBranchesOnSpine(byPos, spineWidth, spineY, arrowWidth, branchLineLength);
}

function probRenderBranchesOnSpine(byPos, spineWidth, spineY, arrowWidth, branchLineLength) {
    const container = document.getElementById('fishbone-canvas');
    if (!container) return;
    
    const slotWidth = 240;
    const startX = arrowWidth + 20;
    
    // Render top branches
    byPos.top.forEach((branch, i) => {
        const x = startX + (i * slotWidth) + 120;
        probCreateBranchElement(branch, 'top', x, spineY, container, branchLineLength);
    });
    
    // Render bottom branches
    byPos.bottom.forEach((branch, i) => {
        const x = startX + (i * slotWidth) + 120;
        probCreateBranchElement(branch, 'bottom', x, spineY, container, branchLineLength);
    });
}

function probCreateBranchElement(branch, pos, x, y, container, branchLineLength) {
    const allClosed = branch.causes.every(c => c.status === 'Closed');
    const color = allClosed ? '#28a745' : '#dc3545';
    
    // Branch line
    const line = document.createElement('div');
    line.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${pos === 'top' ? y - branchLineLength : y}px;
        width: 2px;
        height: ${branchLineLength}px;
        background: ${color};
        transform-origin: ${pos === 'top' ? 'bottom' : 'top'};
        transform: rotate(${pos === 'top' ? '30deg' : '-30deg'});
    `;
    
    // Box - GROWS UPWARD for top, GROWS DOWNWARD for bottom
    const box = document.createElement('div');
    const boxWidth = 200;
    
    // Calculate actual box height based on content
    const boxHeight = 120 + (branch.causes.length * 35);
    
    const boxX = x - (boxWidth / 2);
    // Box positioning - tight to branch line
    const boxY = pos === 'top' 
        ? y - branchLineLength - boxHeight + 20  // Moves UP as box grows, closer to line end
        : y + branchLineLength + 5;              // Grows DOWN, minimal gap
    
    box.style.cssText = `
        position: absolute;
        left: ${boxX}px;
        top: ${boxY}px;
        width: ${boxWidth}px;
        background: var(--bg-fff);
        border: 1px solid var(--bd-cbd5e1);
        border-top: 4px solid ${color};
        border-radius: 6px;
        padding: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    `;
    
    let causesHtml = branch.causes.map(c => {
        const short = c.cause_text.length > 80 ? c.cause_text.substring(0, 77) + '...' : c.cause_text;
        return `
            <div onclick="openCauseDetailModal(${c.id})" style="font-size: 11px; background: var(--bg-f1f5f9); padding: 6px 8px; margin: 4px 0; border-radius: 4px; cursor: pointer; line-height: 1.4; word-wrap: break-word;">
                ${short}
            </div>
        `;
    }).join('');
    
    box.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: bold; font-size: 13px;">${branch.name.toUpperCase()}</span>
            <button onclick="probDeleteBranch('${branch.name}')" style="background: var(--bg-fee2e2); color: #ef4444; padding: 3px 7px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer;">✕</button>
        </div>
        <div>${causesHtml}</div>
        <div style="display: flex; gap: 4px; margin-top: 8px;">
            <input type="text" placeholder="Add cause..." style="width: 75%; font-size: 11px; padding: 5px; border: 1px solid var(--bd-cbd5e1); border-radius: 4px;" onkeypress="if(event.key==='Enter') probAddCause(this, '${branch.name}', '${pos}')">
            <button onclick="probAddCause(this.previousElementSibling, '${branch.name}', '${pos}')" style="background: var(--bg-e2e8f0); padding: 5px 10px; font-size: 11px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
        </div>
    `;
    
    container.appendChild(line);
    container.appendChild(box);
}

function probRenderTableView() {
    const container = document.getElementById('problem-main');
    const problem = window.problemPageProblems.find(p => p.prj_id === window.selectedProblemId);
    if (!problem) return;
    
    const causes = window.problemPageCauses.filter(c => c.problem_id === problem.prj_id && causeMatchesFilters(c, problem));
    
    // Group by branch to get branch status
    const branchStatus = {};
    causes.forEach(c => {
        if (!branchStatus[c.branch_name]) branchStatus[c.branch_name] = [];
        branchStatus[c.branch_name].push(c.status);
    });
    
    Object.keys(branchStatus).forEach(bn => {
        branchStatus[bn] = branchStatus[bn].every(s => s === 'Closed') ? 'Closed' : 'Open';
    });
    
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: var(--bg-fff); padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                <button onclick="probSwitchView('fishbone')" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-diagram-project"></i> Fishbone View</button>
                <div style="width: 1px; height: 30px; background: var(--bg-dee2e6);"></div>
                <input type="text" id="prob-table-search" placeholder="Search..." oninput="probFilterTable()" style="width: 200px; padding: 8px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px;">
                <button onclick="openEditProblemModal()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-edit"></i> Edit</button>
                ${probFilterButtonHtml()}
            </div>
            ${probPropsSummaryHtml(problem)}
            <div style="background: var(--bg-fff); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: auto;">
                <table id="prob-causes-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--bg-f8f9fa); border-bottom: 2px solid var(--bd-dee2e6);">
                            <th onclick="probSortTable('id')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">ID <i class="fa-solid fa-sort"></i></th>
                            <th onclick="probSortTable('branch_name')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">Branch <i class="fa-solid fa-sort"></i></th>
                            <th onclick="probSortTable('cause_text')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">Root Cause <i class="fa-solid fa-sort"></i></th>
                            <th onclick="probSortTable('eff_project')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">Task Project <i class="fa-solid fa-sort"></i></th>
                            <th onclick="probSortTable('eff_task_group')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">Task Group <i class="fa-solid fa-sort"></i></th>
                            <th onclick="probSortTable('status')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">Cause Status <i class="fa-solid fa-sort"></i></th>
                            <th onclick="probSortTable('branch_status')" style="padding: 12px; text-align: left; cursor: pointer; user-select: none;">Branch Status <i class="fa-solid fa-sort"></i></th>
                        </tr>
                    </thead>
                    <tbody id="prob-table-body"></tbody>
                </table>
            </div>
        </div>
    `;
    
    probRenderTableRows(causes, branchStatus);
}

function probRenderTableRows(causes, branchStatus) {
    const tbody = document.getElementById('prob-table-body');
    if (!tbody) return;
    const problem = (window.problemPageProblems || []).find(p => p.prj_id === window.selectedProblemId);
    // Inherited values (from the problem) are shown in grey italics
    const effCell = (own, inherited) => own
        ? escapeHtml(own)
        : (inherited ? `<span style="color: var(--fg-6c757d); font-style: italic;" title="Inherited from problem">${escapeHtml(inherited)}</span>` : '<span style="color: var(--fg-adb5bd);">—</span>');
    
    let html = causes.map(c => `
        <tr onclick="openCauseDetailModal(${c.id})" style="border-bottom: 1px solid var(--bd-dee2e6); cursor: pointer;" onmouseover="this.style.background='var(--bg-f8f9fa)'" onmouseout="this.style.background='var(--bg-fff)'">
            <td style="padding: 12px;">${c.id}</td>
            <td style="padding: 12px; font-weight: 600;">${c.branch_name}</td>
            <td style="padding: 12px;">${escapeHtml(c.cause_text)}</td>
            <td style="padding: 12px;">${effCell(probProjectName(c.project_id), probProjectName(problem && problem.problem_project_id))}</td>
            <td style="padding: 12px;">${effCell(c.task_group, problem && problem.task_group)}</td>
            <td style="padding: 12px;"><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${c.status === 'Closed' ? '#d4edda' : '#fff3cd'}; color: ${c.status === 'Closed' ? '#155724' : '#856404'};">${c.status}</span></td>
            <td style="padding: 12px;"><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${branchStatus[c.branch_name] === 'Closed' ? '#d4edda' : '#f8d7da'}; color: ${branchStatus[c.branch_name] === 'Closed' ? '#155724' : '#721c24'};">${branchStatus[c.branch_name]}</span></td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

function probSortTable(column) {
    const problem = window.problemPageProblems.find(p => p.prj_id === window.selectedProblemId);
    let causes = window.problemPageCauses.filter(c => c.problem_id === problem.prj_id && causeMatchesFilters(c, problem));
    
    if (window.lastSortColumn === column) {
        window.sortAsc = !window.sortAsc;
    } else {
        window.sortAsc = true;
        window.lastSortColumn = column;
    }
    
    // Calculate branch status first
    const branchStatus = {};
    causes.forEach(c => {
        if (!branchStatus[c.branch_name]) branchStatus[c.branch_name] = [];
        branchStatus[c.branch_name].push(c.status);
    });
    Object.keys(branchStatus).forEach(bn => {
        branchStatus[bn] = branchStatus[bn].every(s => s === 'Closed') ? 'Closed' : 'Open';
    });
    
    causes.sort((a, b) => {
        let valA, valB;
        
        if (column === 'branch_status') {
            valA = branchStatus[a.branch_name];
            valB = branchStatus[b.branch_name];
        } else if (column === 'eff_project') {
            valA = probProjectName(causeEffective(a, problem).project);
            valB = probProjectName(causeEffective(b, problem).project);
        } else if (column === 'eff_task_group') {
            valA = causeEffective(a, problem).task_group;
            valB = causeEffective(b, problem).task_group;
        } else {
            valA = a[column];
            valB = b[column];
        }
        
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        return window.sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    
    probRenderTableRows(causes, branchStatus);
}

function probFilterTable() {
    const search = document.getElementById('prob-table-search').value.toLowerCase();
    const rows = document.querySelectorAll('#prob-table-body tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

function openCauseDetailModal(causeId) {
    const cause = window.problemPageCauses.find(c => c.id === causeId);
    if (!cause) return;
    const causeProblem = (window.problemPageProblems || []).find(p => p.prj_id === cause.problem_id);
    
    const modal = document.createElement('div');
    modal.id = 'modal-cause-detail';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 30px; width: 600px; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin: 0 0 20px 0;">Root Cause Detail</h3>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Branch: ${cause.branch_name}</label>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Cause Text</label>
                <textarea id="cause-text-edit" rows="4" style="width: 100%; padding: 10px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px; resize: vertical;">${escapeHtml(cause.cause_text)}</textarea>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Status</label>
                <select id="cause-status-edit" style="width: 100%; padding: 10px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px;">
                    <option value="Open" ${cause.status === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="Closed" ${cause.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">Task Project</label>
                    <select id="cause-project-edit" style="width: 100%; padding: 10px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px;">
                        <option value="">${causeProblem && causeProblem.problem_project_id ? 'Same as problem (' + escapeHtml(probProjectName(causeProblem.problem_project_id)) + ')' : 'None'}</option>
                        ${probRealProjects().map(p => `<option value="${p.prj_id}" ${p.prj_id === cause.project_id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">Task Group</label>
                    <input type="text" id="cause-taskgroup-edit" list="cause-taskgroup-list" value="${escapeHtml(cause.task_group || '')}"
                           placeholder="${causeProblem && causeProblem.task_group ? 'Same as problem (' + escapeHtml(causeProblem.task_group) + ')' : 'e.g. Roll-out'}"
                           style="width: 100%; padding: 10px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px;">
                    <datalist id="cause-taskgroup-list">${probTaskGroupOptions().map(g => `<option value="${escapeHtml(g)}"></option>`).join('')}</datalist>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Comments</label>
                <textarea id="cause-comments-edit" rows="3" placeholder="Add comments..." style="width: 100%; padding: 10px; border: 1px solid var(--bd-cbd5e1); border-radius: 6px; resize: vertical;">${cause.comments || ''}</textarea>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="saveCauseDetail(${causeId})" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Save</button>
                <button onclick="deleteCause(${causeId})" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
                <button onclick="document.getElementById('modal-cause-detail').remove()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveCauseDetail(causeId) {
    const data = {
        cause_text: document.getElementById('cause-text-edit').value.trim(),
        status: document.getElementById('cause-status-edit').value,
        comments: document.getElementById('cause-comments-edit').value.trim(),
        project_id: document.getElementById('cause-project-edit').value || null,
        task_group: document.getElementById('cause-taskgroup-edit').value.trim() || null
    };
    
    fetch(`/api/causes/${causeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById('modal-cause-detail').remove();
        loadProblemsData(window.problemPageName);
    });
}

function deleteCause(causeId) {
    if (!confirm('Delete this cause?')) return;
    fetch(`/api/causes/${causeId}`, { method: 'DELETE' })
        .then(() => {
            document.getElementById('modal-cause-detail').remove();
            loadProblemsData(window.problemPageName);
        });
}

function probAddBranch() {
    const name = document.getElementById('branch-input').value.trim();
    const pos = document.getElementById('pos-select').value;
    if (!name) return;
    
    fetch('/api/causes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            problem_id: window.selectedProblemId,
            branch_name: name,
            branch_position: pos,
            cause_text: `${name} - Root Cause`,
            status: 'Open',
            ...probNewCauseDefaults()
        })
    })
    .then(() => {
        document.getElementById('branch-input').value = '';
        loadProblemsData(window.problemPageName);
    });
}

function probAddCause(input, branchName, pos) {
    const text = input.value.trim();
    if (!text) return;
    
    fetch('/api/causes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            problem_id: window.selectedProblemId,
            branch_name: branchName,
            branch_position: pos,
            cause_text: text,
            status: 'Open',
            ...probNewCauseDefaults()
        })
    })
    .then(() => {
        input.value = '';
        loadProblemsData(window.problemPageName);
    });
}

function probDeleteBranch(branchName) {
    if (!confirm(`Delete "${branchName}" and all causes?`)) return;
    const causes = window.problemPageCauses.filter(c => c.branch_name === branchName && c.problem_id === window.selectedProblemId);
    Promise.all(causes.map(c => fetch(`/api/causes/${c.id}`, { method: 'DELETE' })))
        .then(() => loadProblemsData(window.problemPageName));
}

function probSwitchView(view) {
    problemView = view;
    renderProblemContent();
}

function toggleProblemNav() {
    window.problemNavMinimized = !window.problemNavMinimized;
    renderProblemsLayout(window.problemPageName);
}

function filterProblems() {
    renderProblemsList();
}

function openCreateProblemModal() {
    const modal = document.createElement('div');
    modal.id = 'modal-create-problem';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 30px; width: 560px; max-width: 94%;">
            <h3 style="margin: 0 0 20px 0;">Create Problem</h3>
            <input type="text" id="new-problem-name" placeholder="Problem statement..." style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; margin-bottom: 15px;">
            <textarea id="new-problem-desc" placeholder="Description..." rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; resize: vertical;"></textarea>
            <select id="new-problem-group" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; margin-top: 12px;">
                <option value="">— Ungrouped —</option>
                ${groupsForScope('problem').map(g => `<option value="${g.group_id}">${escapeHtml(g.name)}</option>`).join('')}
            </select>
            ${probPropertyFieldsHtml('new-problem', { problem_project_id: problemFilters.project, task_group: problemFilters.task_group, category_id: problemFilters.category, subcategory_id: problemFilters.subcategory })}
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="saveNewProblem()" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">Create</button>
                <button onclick="document.getElementById('modal-create-problem').remove()" style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('new-problem-name').focus();
}

function saveNewProblem() {
    const name = document.getElementById('new-problem-name').value.trim();
    if (!name) return;
    
    fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            description: document.getElementById('new-problem-desc').value,
            status: 'Active',
            project_type: PROBLEM_PROJECT_TYPE,
            group_id: document.getElementById('new-problem-group')?.value || null,
            ...probReadPropertyFields('new-problem')
        })
    })
    .then(() => {
        document.getElementById('modal-create-problem').remove();
        loadProblemsData(window.problemPageName);
    });
}

function openEditProblemModal() {
    const problem = window.problemPageProblems.find(p => p.prj_id === window.selectedProblemId);
    if (!problem) return;
    
    const modal = document.createElement('div');
    modal.id = 'modal-edit-problem';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 12px; padding: 30px; width: 560px; max-width: 94%;">
            <h3 style="margin: 0 0 20px 0;">Edit Problem</h3>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Problem statement</label>
            <input type="text" id="edit-problem-name" value="${escapeHtml(problem.name)}" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; margin-bottom: 12px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Description</label>
            <textarea id="edit-problem-desc" rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px; resize: vertical;">${escapeHtml(problem.description || '')}</textarea>
            ${probPropertyFieldsHtml('edit-problem', problem)}
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="saveEditProblem()" style="flex: 1; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Save</button>
                <button onclick="deleteProb()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
                <button onclick="document.getElementById('modal-edit-problem').remove()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEditProblem() {
    const name = document.getElementById('edit-problem-name').value.trim();
    if (!name) return;
    
    fetch(`/api/admin/projects/${window.selectedProblemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: document.getElementById('edit-problem-desc').value, ...probReadPropertyFields('edit-problem') })
    })
    .then(r => {
        if (!r.ok) throw new Error('Save failed');
        document.getElementById('modal-edit-problem').remove();
        showNotification('Problem updated', 'success');
        loadProblemsData(window.problemPageName);
    });
}

function deleteProb() {
    if (!confirm('Move this problem to Trash? You can restore it from the Trash page.')) return;
    fetch(`/api/admin/projects/${window.selectedProblemId}`, { method: 'DELETE' })
        .then(() => {
            window.selectedProblemId = null;
            document.getElementById('modal-edit-problem').remove();
            loadProblemsData(window.problemPageName);
        });
}

// Export
window.initializeProblemsPage = initializeProblemsPage;
window.selectProblem = selectProblem;
window.probSwitchView = probSwitchView;
window.toggleProblemNav = toggleProblemNav;
window.filterProblems = filterProblems;
window.openCreateProblemModal = openCreateProblemModal;
window.saveNewProblem = saveNewProblem;
window.probAddBranch = probAddBranch;
window.probAddCause = probAddCause;
window.probDeleteBranch = probDeleteBranch;
window.openCauseDetailModal = openCauseDetailModal;
window.saveCauseDetail = saveCauseDetail;
window.deleteCause = deleteCause;
window.openEditProblemModal = openEditProblemModal;
window.saveEditProblem = saveEditProblem;
window.deleteProb = deleteProb;
window.probSortTable = probSortTable;
window.probFilterTable = probFilterTable;




// ============================================================================
//                         FOCUS BOARD
// ============================================================================

// Focus Board filter state (independent from All Tasks)
let focusSearchTerm = '';
let focusGroupBy = 'status'; // 'status' or 'stage'
let focusActiveFilters = {};

// ========================================================================
//                          ROUTINES PAGE
// ========================================================================
// A "routine" is an ordinary task with a Recurrence set - nothing is stored
// separately, so routines keep showing up in All Tasks, their Project board,
// Calendar, Search and the Dashboard as usual. This page just gives them a
// dedicated, checklist-style view grouped by how often they repeat, with
// only the NEXT occurrence of each shown (the app creates the one after that
// automatically once you tick this one off).
//
// Note: the "next occurrence" chaining only happens when a routine is
// completed here (or via its checkbox elsewhere) through the /complete
// endpoint. Changing its status to Done some other way (e.g. dragging the
// card to a Done column) marks it done but does not create the next one.

const ROUTINE_TYPE_ORDER = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];
let routineFilters = { search: '', project: '', task_group: '' };

async function initializeRoutinesPage() {
    const container = document.getElementById('routines-container');
    if (!container) return;
    container.innerHTML = `<div style="padding: 20px; color: var(--fg-6c757d);">Loading routines...</div>`;
    try {
        const [tasks, lookups] = await Promise.all([
            fetch('/api/tasks').then(r => r.json()),
            fetch('/api/lookups').then(r => r.json())
        ]);
        allTasks = tasks;
        lookupData = lookups;
        renderRoutinesPage();
    } catch (err) {
        container.innerHTML = `<p style="color: #dc3545; padding: 20px;">Error loading routines: ${err.message}</p>`;
    }
}

function getActiveRoutines() {
    return (allTasks || []).filter(t =>
        (t.recurrence_type || t.recurrence_parent_id) &&
        !t.is_deleted && t.is_archived !== 1 &&
        (t.status_name || '').toLowerCase() !== 'done'
    );
}

function routineTaskGroupOptions(routines) {
    const values = routines.map(t => t.task_group).filter(v => v && String(v).trim());
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function routineMatchesFilters(t) {
    if (routineFilters.project && t.project_id !== routineFilters.project) return false;
    if (routineFilters.task_group && t.task_group !== routineFilters.task_group) return false;
    if (routineFilters.search && !t.title.toLowerCase().includes(routineFilters.search.toLowerCase())) return false;
    return true;
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + 'T00:00:00');
    return Math.round((due - today) / 86400000);
}

function routineDueBadge(dateStr) {
    const days = daysUntil(dateStr);
    if (days === null) return { label: 'No due date', bg: 'var(--bg-f1f3f5)', color: 'var(--fg-6c757d)', urgent: false };
    if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, bg: 'var(--bg-fee2e2)', color: '#dc3545', urgent: true };
    if (days === 0) return { label: 'Due today', bg: '#fff3cd', color: '#8a6404', urgent: true };
    const label = 'Due ' + new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return { label, bg: 'var(--bg-f1f3f5)', color: 'var(--fg-495057)', urgent: false };
}

function routineToolbarHtml() {
    const routines = getActiveRoutines();
    const projects = probRealProjects();
    const groups = routineTaskGroupOptions(routines);
    return `
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px;">
            <button onclick="openCreateRoutineModal()" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                <i class="fa-solid fa-plus"></i> Add Routine
            </button>
            <input type="text" id="routine-search" placeholder="Search routines..." value="${escapeHtml(routineFilters.search)}"
                   oninput="routineFilters.search = this.value; renderRoutinesPage(true)"
                   style="flex: 1; min-width: 180px; padding: 8px 12px; border: 1px solid var(--bd-ced4da); border-radius: 6px;">
            <select onchange="routineFilters.project = this.value; renderRoutinesPage()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 6px; background: var(--bg-fff); color: var(--fg-212529);">
                <option value="">All Projects</option>
                ${projects.map(p => `<option value="${p.prj_id}" ${routineFilters.project === p.prj_id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
            </select>
            <select onchange="routineFilters.task_group = this.value; renderRoutinesPage()" style="padding: 8px; border: 1px solid var(--bd-ced4da); border-radius: 6px; background: var(--bg-fff); color: var(--fg-212529);">
                <option value="">All Task Groups</option>
                ${groups.map(g => `<option value="${escapeHtml(g)}" ${routineFilters.task_group === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
            </select>
        </div>`;
}

function routineRowHtml(t) {
    const badge = routineDueBadge(t.due_date);
    const projectName = t.project_id ? (((lookupData.projects || []).find(p => p.prj_id === t.project_id) || {}).name || '') : '';
    const reminderHtml = (t.reminder_date && daysUntil(t.reminder_date) <= 0)
        ? `<span style="font-size: 0.78em; color: var(--fg-6c757d);" title="Reminder"><i class="fa-solid fa-bell"></i> ${new Date(t.reminder_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`
        : '';
    // Two flex groups so narrow screens wrap onto a second line (name, then
    // tags/badge) instead of squeezing everything onto one unreadable row.
    return `
        <div class="routine-row" data-task-id="${t.id}" style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; padding: 10px 12px; border-bottom: 1px solid var(--bd-e9ecef);">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1 1 140px; min-width: 0;">
                <input type="checkbox" onchange="completeRoutine(${t.id}, this)" title="Mark done" style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
                <span class="routine-row-title" style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(t.title)}">${escapeHtml(t.title)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; margin-left: 30px;">
                ${projectName || t.task_group ? `<div class="kanban-card-tags">
                    ${projectName ? `<span class="kanban-tag kanban-tag-project"><i class="fa-solid fa-diagram-project"></i><span>${escapeHtml(projectName)}</span></span>` : ''}
                    ${t.task_group ? `<span class="kanban-tag kanban-tag-group"><i class="fa-solid fa-tag"></i><span>${escapeHtml(t.task_group)}</span></span>` : ''}
                </div>` : ''}
                ${reminderHtml}
                <span style="font-size: 0.78em; font-weight: 600; padding: 3px 10px; border-radius: 12px; background: ${badge.bg}; color: ${badge.color}; white-space: nowrap;">${badge.label}</span>
                <button onclick="openEditTaskModalById(${t.id})" title="Edit" style="background: none; border: none; color: var(--fg-6c757d); cursor: pointer; padding: 6px; flex-shrink: 0;">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </div>
        </div>`;
}

function renderRoutinesPage(searchOnly) {
    const container = document.getElementById('routines-container');
    if (!container) return;

    const active = searchOnly ? container : null; // keep focus in the search box while typing
    const focusedId = document.activeElement && document.activeElement.id === 'routine-search' ? 'routine-search' : null;
    const caret = focusedId ? document.getElementById('routine-search').selectionStart : null;

    const all = getActiveRoutines();
    const visible = all.filter(routineMatchesFilters).sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'));
    const needsAttention = visible.filter(t => { const d = daysUntil(t.due_date); return d !== null && d <= 0; });

    let html = routineToolbarHtml();

    if (all.length === 0) {
        html += `
            <div style="text-align: center; color: var(--fg-6c757d); margin-top: 60px;">
                <i class="fa-solid fa-rotate" style="font-size: 3em; color: var(--fg-ced4da);"></i>
                <h3 style="margin: 15px 0 8px 0; color: var(--fg-495057);">No routines yet</h3>
                <p style="margin: 0 0 20px 0;">Capture recurring tasks like a daily clock-in or a monthly server check.</p>
                <button onclick="openCreateRoutineModal()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    <i class="fa-solid fa-plus"></i> Add Routine
                </button>
            </div>`;
    } else if (visible.length === 0) {
        html += `
            <div style="text-align: center; color: var(--fg-6c757d); margin-top: 60px;">
                <i class="fa-solid fa-filter" style="font-size: 2.5em; color: var(--fg-ced4da);"></i>
                <h3 style="margin: 15px 0 8px 0; color: var(--fg-495057);">No routines match</h3>
                <button onclick="routineFilters={search:'',project:'',task_group:''}; renderRoutinesPage();" style="padding: 8px 18px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Clear filters</button>
            </div>`;
    } else {
        if (needsAttention.length > 0) {
            html += `
                <div style="border: 1px solid #ffc107; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                    <div style="background: #fff3cd; color: #8a6404; font-size: 0.85em; font-weight: 600; padding: 8px 12px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Needs attention (${needsAttention.length})
                    </div>
                    <div style="background: var(--bg-fff);">${needsAttention.map(routineRowHtml).join('')}</div>
                </div>`;
        }
        const attentionIds = new Set(needsAttention.map(t => t.id));
        ROUTINE_TYPE_ORDER.forEach(type => {
            // A routine already shown in "Needs attention" isn't repeated down here.
            const rows = visible.filter(t => t.recurrence_type === type && !attentionIds.has(t.id));
            if (rows.length === 0) return;
            html += `
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 0.85em; font-weight: 600; color: var(--fg-495057); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">${RECURRENCE_TYPE_LABELS[type]}</p>
                    <div style="background: var(--bg-fff); border: 1px solid var(--bd-dee2e6); border-radius: 8px; overflow: hidden;">${rows.map(routineRowHtml).join('')}</div>
                </div>`;
        });
    }

    container.innerHTML = html;
    if (focusedId) {
        const el = document.getElementById(focusedId);
        if (el) { el.focus(); el.setSelectionRange(caret, caret); }
    }
}

async function completeRoutine(taskId, checkboxEl) {
    const row = checkboxEl.closest('.routine-row');
    checkboxEl.disabled = true;
    if (row) {
        row.style.opacity = '0.55';
        const title = row.querySelector('.routine-row-title');
        if (title) title.style.textDecoration = 'line-through';
    }
    try {
        const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' });
        if (!res.ok) throw new Error('Request failed');
    } catch (err) {
        showNotification('Could not complete routine', 'error');
        checkboxEl.disabled = false;
        checkboxEl.checked = false;
        if (row) { row.style.opacity = ''; const title = row.querySelector('.routine-row-title'); if (title) title.style.textDecoration = ''; }
        return;
    }
    showNotification('Routine completed', 'success');
    // Brief delay before the row disappears, so ticking it off feels confirmed
    // rather than sudden. Data (including any new next-occurrence) refreshes after.
    setTimeout(async () => {
        try {
            allTasks = await fetch('/api/tasks').then(r => r.json());
        } catch (err) { /* keep previous data if the refresh fails */ }
        if (document.getElementById('routines-container')) renderRoutinesPage();
    }, 2200);
}

function routineTaskGroupSuggestions() {
    const values = (allTasks || []).map(t => t.task_group).filter(v => v && String(v).trim());
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function openCreateRoutineModal() {
    document.getElementById('create-routine-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'create-routine-modal';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    const inputStyle = 'width: 100%; padding: 10px; border: 1px solid var(--bd-dee2e6); border-radius: 6px;';
    modal.innerHTML = `
        <div style="background: var(--bg-fff); border-radius: 10px; padding: 28px; width: 480px; max-width: 94%;">
            <h3 style="margin: 0 0 20px 0;"><i class="fa-solid fa-rotate" style="color: #28a745;"></i> Add Routine</h3>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Task Name *</label>
            <input type="text" id="routine-title" placeholder="e.g. Daily clock-in" style="${inputStyle} margin-bottom: 14px;">

            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Repeats *</label>
            <select id="routine-recurrence_type" onchange="updateRecurrenceDayPicker('routine-')" style="${inputStyle}">
                ${recurrenceTypeOptionsHtml('daily')}
            </select>
            ${recurrenceDayPickerHtml('routine-', 'daily', null)}

            <div class="routine-modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;">
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">First Due Date *</label>
                    <input type="date" id="routine-due-date" style="${inputStyle}">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">Reminder Date</label>
                    <input type="date" id="routine-reminder-date" style="${inputStyle}">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">Project</label>
                    <select id="routine-project" style="${inputStyle}">
                        <option value="">None</option>
                        ${probRealProjects().map(p => `<option value="${p.prj_id}">${escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">Task Group</label>
                    <input type="text" id="routine-task-group" list="routine-task-group-list" placeholder="e.g. Compliance" style="${inputStyle}">
                    <datalist id="routine-task-group-list">${routineTaskGroupSuggestions().map(g => `<option value="${escapeHtml(g)}"></option>`).join('')}</datalist>
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 22px;">
                <button onclick="saveNewRoutine()" style="flex: 1; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Create</button>
                <button onclick="document.getElementById('create-routine-modal').remove()" style="flex: 1; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    document.getElementById('routine-title').focus();
}

async function saveNewRoutine() {
    const title = document.getElementById('routine-title').value.trim();
    const recurrenceType = document.getElementById('routine-recurrence_type').value;
    const dueDate = document.getElementById('routine-due-date').value;
    if (!title) { alert('Task Name is required'); return; }
    if (!recurrenceType) { alert('Please choose how often this repeats'); return; }
    if (!dueDate) { alert('First Due Date is required'); return; }

    const body = {
        title,
        status_name: 'To Do',
        recurrence_type: recurrenceType,
        recurrence_day: readRecurrenceDay('routine-', recurrenceType),
        due_date: dueDate,
        reminder_date: document.getElementById('routine-reminder-date').value || null,
        project_id: document.getElementById('routine-project').value || null,
        task_group: document.getElementById('routine-task-group').value.trim() || null
    };
    try {
        const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Save failed');
        document.getElementById('create-routine-modal').remove();
        showNotification('Routine created', 'success');
        allTasks = await fetch('/api/tasks').then(r => r.json());
        renderRoutinesPage();
    } catch (err) {
        showNotification('Could not create routine: ' + err.message, 'error');
    }
}

window.openCreateRoutineModal = openCreateRoutineModal;
window.saveNewRoutine = saveNewRoutine;
window.completeRoutine = completeRoutine;

async function initializeFocusBoard() {
    const container = document.getElementById('focus-board-container');
    if (!container) return;
    container.innerHTML = `<div style="padding:20px; color:var(--fg-888);">Loading...</div>`;
    try {
        // Ensure lookupData is loaded
        if (!lookupData || !lookupData.lkp_status) await reloadLookupData();
        const resp = await fetch('/api/focus');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const focusTasks = await resp.json();
        renderFocusBoard(focusTasks, container);
    } catch (err) {
        container.innerHTML = `<div style="padding:20px; color:#dc3545;">Error: ${err.message}</div>`;
    }
}

function applyFocusFilters(tasks) {
    let result = tasks;
    // Search
    if (focusSearchTerm) {
        const term = focusSearchTerm.toLowerCase();
        result = result.filter(t => (t.title||'').toLowerCase().includes(term));
    }
    // Active filters
    Object.entries(focusActiveFilters).forEach(([col, val]) => {
        if (val) result = result.filter(t => t[col] === val);
    });
    return result;
}

function renderFocusBoard(focusTasks, container) {
    const today = new Date().toISOString().slice(0, 10);

    const allFiltered = applyFocusFilters(focusTasks);

    const pastTasks   = allFiltered.filter(t => t.focus_date < today);
    const todayTasks  = allFiltered.filter(t => t.focus_date === today);
    const futureTasks = allFiltered.filter(t => t.focus_date > today);

    // Build toolbar - same as All Tasks kanban
    const filterableColumns = (columnSettings || []).filter(c => c.is_filterable === 1);

    let html = `<div style="padding:0;">
        <!-- Toolbar -->
        <div style="margin-bottom:20px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button style="padding:8px 15px; background-color:${focusGroupBy==='stage'?'#28a745':'#007bff'}; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.9em;" onclick="focusToggleGroupBy()">
                <i class="fa-solid fa-layer-group"></i> Group by ${focusGroupBy==='stage'?'Status':'Stage'}
            </button>
            <button style="padding:8px 15px; background-color:#007bff; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.9em;" onclick="openAddTaskModal()">
                <i class="fa-solid fa-plus"></i> Add Task
            </button>
            <input type="text" id="focus-search-input" placeholder="Search tasks..."
                   value="${escapeHtml(focusSearchTerm)}"
                   style="flex-grow:1; min-width:200px; padding:10px; border:1px solid var(--bd-ccc); border-radius:4px;"
                   oninput="focusHandleSearch(this.value)">`;

    // Filter dropdowns — use allTasks for options (same as All Tasks page)
    filterableColumns.forEach(col => {
        const filterValue = focusActiveFilters[col.column_name] || '';
        const uniqueValues = [...new Set(allTasks.map(t => t[col.column_name]).filter(v => v))];
        html += `<select onchange="focusHandleFilter('${col.column_name}', this.value)"
                         style="padding:10px; border:1px solid var(--bd-ced4da); border-radius:4px; min-width:120px;">
                    <option value="">${col.display_name}: All</option>`;
        uniqueValues.forEach(value => {
            let display = value;
            if (col.column_type === 'lookup_projects' && lookupData.projects) {
                const p = lookupData.projects.find(x => x.prj_id === value);
                display = p ? p.name : value;
            } else if (col.column_type === 'lookup_categories' && lookupData.categories) {
                const c = lookupData.categories.find(x => x.cat_id === value);
                display = c ? c.name : value;
            }
            html += `<option value="${value}" ${filterValue===value?'selected':''}>${display}</option>`;
        });
        html += `</select>`;
    });

        html += `<button onclick="focusClearFilters()" style="padding:10px 15px; background-color:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer; white-space:nowrap;">
                    <i class="fa-solid fa-times"></i> Clear
                 </button>`;

    html += `</div>`; // end toolbar

    const groupByField = focusGroupBy === 'stage' ? 'stage_name' : 'status_name';
    const groups = focusGroupBy === 'stage' ? (lookupData.lkp_stage || []) : orderStatusesDoneLast(lookupData.lkp_status || []);

    // Build column color map once
    const colColors = {};
    groups.forEach(group => {
        colColors[group.name] = focusGroupBy === 'status' ? getStatusColor(group.name) : getStageColor(group.name);
    });

    // ── SHARED COLUMN HEADERS (once only) ─────────────────────────────────
    html += `<div class="kanban-grid" style="${kanbanGridStyle(groups.length, 4)}">`;
    groups.forEach(group => {
        html += `<div style="min-width:0;">
            <div title="${escapeHtml(group.name)}" style="background-color:${colColors[group.name]}; color:white; padding:8px 10px; border-radius:6px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${escapeHtml(group.name)}
            </div>
        </div>`;
    });
    html += `</div>`;

    // ── THREE SECTIONS ────────────────────────────────────────────────────
    html += renderFocusSection('Today', todayTasks, groups, groupByField);
    html += renderFocusSection("Previous days's unfinished tasks", pastTasks, groups, groupByField);
    html += renderFocusSection("Future days's unfinished tasks", futureTasks, groups, groupByField);

    html += `<div style="margin-top:10px; color:var(--fg-6c757d); font-size:0.9em;">Showing ${allFiltered.length} of ${focusTasks.length} tasks in Focus Board</div>`;
    html += `</div>`;

    container.innerHTML = html;
}

function renderFocusSection(title, tasks, groups, groupByField) {
    let html = `
        <div style="margin-bottom:20px;">
            <div style="margin:14px 0 10px;">
                <span style="font-weight:700; font-size:16px; color:var(--fg-212529);">${title}</span>
            </div>
            <div class="kanban-grid" style="${kanbanGridStyle(groups.length, 6)}">`;

    groups.forEach(group => {
        const tasksInGroup = tasks.filter(t => t[groupByField] === group.name);
        const dataAttr = groupByField === 'stage_name' ? `data-stage="${group.name}"` : `data-status="${group.name}"`;
        html += `<div class="kanban-column" ${dataAttr} data-field="${groupByField}"
                      style="min-width:0; background-color:var(--bg-f8f9fa); border-radius:8px; padding:8px; min-height:80px;"
                      ondrop="handleFocusKanbanDrop(event)" ondragover="handleKanbanDragOver(event)">`;
        tasksInGroup.forEach(task => { html += renderKanbanCard(task, focusGroupBy); });
        if (tasksInGroup.length === 0) {
            html += `<div style="color:var(--fg-adb5bd); font-size:12px; padding:6px 4px;">No tasks</div>`;
        }
        html += `</div>`;
    });

    if (groups.length === 0) {
        html += `<div style="color:var(--fg-adb5bd); font-size:13px; padding:6px 0;">No groups configured.</div>`;
    }

    html += `</div></div>`;
    return html;
}

function renderFocusCard(task) {
    const lkpPrio = (lookupData.lkp_priority||[]).find(p => p.name === task.priority_name);
    const borderColor = lkpPrio && lkpPrio.color ? lkpPrio.color : 'var(--bd-dee2e6)';
    const isDone = (task.status_name||'').toLowerCase() === 'done';
    const project = task.project_name || '';
    const taskGroup = task.task_group || '';

    return `<div style="position:relative; background:var(--bg-fff); border-radius:6px; padding:12px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1); border-left:4px solid ${borderColor}; transition:transform 0.2s,box-shadow 0.2s; ${isDone?'opacity:0.6;':''}"
         onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
         onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
         oncontextmenu="showFocusCardMenu(event,${task.id}); return false;">
        <div class="kanban-card-title" title="${escapeHtml(task.title||'Untitled')}" style="font-weight:600; font-size:0.9em; color:var(--fg-212529); margin-bottom:6px; ${isDone?'text-decoration:line-through;':''}">
            ${escapeHtml(task.title||'Untitled')}
        </div>
        ${taskGroup ? `<div style="font-size:0.8em; color:var(--fg-6c757d); margin-bottom:4px;"><i class="fa-solid fa-tag"></i> ${escapeHtml(taskGroup)}</div>` : ''}
        ${project ? `<div style="font-size:0.78em; color:var(--fg-6c757d); margin-bottom:8px;"><i class="fa-solid fa-diagram-project" style="margin-right:3px;"></i>${escapeHtml(project)}</div>` : ''}
        <div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:6px;">
            ${!isDone ? `<button onclick="focusDoneTask(${task.id})" style="padding:3px 8px; font-size:11px; background:#28a745; color:white; border:none; border-radius:3px; cursor:pointer;" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'"><i class="fa-solid fa-check"></i> Done</button>` : ''}
            <button onclick="changeFocusDate(${task.id})" title="Change date" style="padding:3px 8px; font-size:11px; background:#007bff; color:white; border:none; border-radius:3px; cursor:pointer;" onmouseover="this.style.background='#0069d9'" onmouseout="this.style.background='#007bff'"><i class="fa-solid fa-calendar-days"></i></button>
            <button onclick="removeFocusFlag(${task.id})" title="Remove from Focus Board" style="padding:3px 8px; font-size:11px; background:var(--bg-f8f9fa); color:var(--fg-6c757d); border:1px solid var(--bd-dee2e6); border-radius:3px; cursor:pointer;" onmouseover="this.style.background='var(--bg-e9ecef)'" onmouseout="this.style.background='var(--bg-f8f9fa)'"><i class="fa-solid fa-xmark"></i></button>
        </div>
    </div>`;
}

// ── FOCUS BOARD FILTER HANDLERS ───────────────────────────────────────────────

function focusToggleGroupBy() {
    focusGroupBy = focusGroupBy === 'status' ? 'stage' : 'status';
    initializeFocusBoard();
}

function focusHandleSearch(term) {
    focusSearchTerm = term;
    initializeFocusBoard();
}

function focusHandleFilter(col, val) {
    if (val) focusActiveFilters[col] = val;
    else delete focusActiveFilters[col];
    initializeFocusBoard();
}

function focusClearFilters() {
    focusSearchTerm = '';
    focusActiveFilters = {};
    initializeFocusBoard();
}

// ── FOCUS CARD CONTEXT MENU ───────────────────────────────────────────────────

function showFocusCardMenu(event, taskId) {
    event.preventDefault();
    event.stopPropagation();
    const existing = document.getElementById('focus-card-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.id = 'focus-card-menu';
    menu.style.cssText = `position:fixed; top:${event.clientY}px; left:${event.clientX}px; background:var(--bg-fff); border:1px solid var(--bd-dee2e6); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:10000; min-width:180px;`;
    menu.innerHTML = `<div style="padding:8px 0;">
        <div onclick="checkRecurringTaskBeforeEdit(${taskId}); document.getElementById('focus-card-menu').remove();"
             style="padding:10px 16px; cursor:pointer;" onmouseover="this.style.background='var(--bg-f8f9fa)'" onmouseout="this.style.background='var(--bg-fff)'">
            <i class="fa-solid fa-edit" style="color:#007bff; width:20px;"></i> Edit Task
        </div>
        <div onclick="changeFocusDate(${taskId}); document.getElementById('focus-card-menu').remove();"
             style="padding:10px 16px; cursor:pointer;" onmouseover="this.style.background='var(--bg-f8f9fa)'" onmouseout="this.style.background='var(--bg-fff)'">
            <i class="fa-solid fa-calendar-days" style="color:var(--fg-6c757d); width:20px;"></i> Change Date
        </div>
        <div onclick="focusDoneTask(${taskId}); document.getElementById('focus-card-menu').remove();"
             style="padding:10px 16px; cursor:pointer;" onmouseover="this.style.background='var(--bg-f8f9fa)'" onmouseout="this.style.background='var(--bg-fff)'">
            <i class="fa-solid fa-check" style="color:#28a745; width:20px;"></i> Mark Done
        </div>
        <div style="height:1px; background:var(--bg-dee2e6); margin:4px 0;"></div>
        <div onclick="removeFocusFlag(${taskId}); document.getElementById('focus-card-menu').remove();"
             style="padding:10px 16px; cursor:pointer;" onmouseover="this.style.background='var(--bg-f8f9fa)'" onmouseout="this.style.background='var(--bg-fff)'">
            <i class="fa-solid fa-xmark" style="color:#dc3545; width:20px;"></i> Remove from Focus
        </div>
    </div>`;
    document.body.appendChild(menu);
    setTimeout(() => {
        document.addEventListener('click', function close(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); }
        });
    }, 100);
}

// ── FOCUS BOARD ACTIONS ───────────────────────────────────────────────────────

function handleFocusKanbanDrop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const currentStatus = event.dataTransfer.getData('currentStatus');

    let column = event.target;
    while (column && !column.classList.contains('kanban-column')) {
        column = column.parentElement;
    }
    if (!column) return;

    document.querySelectorAll('.kanban-card').forEach(c => { c.style.opacity = '1'; });

    const newStatus = column.dataset.status || column.dataset.stage;
    const field = column.dataset.field === 'stage_name' ? 'stage_name' : 'status_name';
    const body = field === 'stage_name' ? { stage_name: newStatus } : { status_name: newStatus };

    if (currentStatus === newStatus) return;

    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
    .then(() => {
        // Update allTasks local data too
        const t = allTasks.find(x => x.id == taskId);
        if (t) t[field] = newStatus;
        initializeFocusBoard();
    })
    .catch(err => showNotification('Error: ' + err.message, 'error'));
}

async function focusDoneTask(taskId) {
    try {
        const r = await fetch(`/api/focus/${taskId}/done`, { method:'PUT' });
        if (!r.ok) throw new Error('Failed');
        showNotification('Task marked done and removed from Focus Board', 'success');
        initializeFocusBoard();
    } catch(e) { showNotification('Error: '+e.message, 'error'); }
}

async function removeFocusFlag(taskId) {
    try {
        await fetch(`/api/focus/${taskId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({focus_date:null}) });
        showNotification('Task removed from Focus Board', 'info');
        initializeFocusBoard();
    } catch(e) { showNotification('Error: '+e.message, 'error'); }
}

function changeFocusDate(taskId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-fff);border-radius:8px;padding:24px;min-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <h3 style="margin:0 0 16px;font-size:16px;"><i class="fa-solid fa-calendar-days" style="color:#007bff;margin-right:8px;"></i>Change Focus Date</h3>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button onclick="setFocusDateAndClose(${taskId},'${getTodayStr()}',this)" style="padding:9px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.9em;">⚡ Today (${getTodayStr()})</button>
                <button onclick="setFocusDateAndClose(${taskId},'${getTomorrowStr()}',this)" style="padding:9px;background:#6c757d;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.9em;">📅 Tomorrow (${getTomorrowStr()})</button>
                <input type="date" id="fcd-${taskId}" value="${getTodayStr()}" style="padding:8px;border:1px solid var(--bd-ced4da);border-radius:4px;font-size:14px;">
                <button onclick="setFocusDateFromInput(${taskId})" style="padding:9px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.9em;">Set Custom Date</button>
                <button onclick="this.closest('[style*=fixed]').remove()" style="padding:9px;background:var(--bg-f8f9fa);color:var(--fg-333);border:1px solid var(--bd-dee2e6);border-radius:4px;cursor:pointer;font-size:0.9em;">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

async function setFocusDateAndClose(taskId, date, btn) {
    btn.closest('[style*=fixed]').remove();
    await fetch(`/api/focus/${taskId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({focus_date:date}) });
    showNotification('Focus date updated', 'success');
    initializeFocusBoard();
}

async function setFocusDateFromInput(taskId) {
    const inp = document.getElementById(`fcd-${taskId}`);
    if (!inp||!inp.value) return;
    const date = inp.value;
    inp.closest('[style*=fixed]').remove();
    await fetch(`/api/focus/${taskId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({focus_date:date}) });
    showNotification('Focus date updated', 'success');
    initializeFocusBoard();
}

function getTodayStr()    { return new Date().toISOString().slice(0,10); }
function getTomorrowStr() { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }

// ── SEND TO FOCUS MODAL ───────────────────────────────────────────────────────

function openSendToFocusModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    const taskTitle = task ? (task.title||'') : '';
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-fff);border-radius:8px;padding:24px;min-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <h3 style="margin:0 0 8px;font-size:16px;"><i class="fa-solid fa-crosshairs" style="color:#fd7e14;margin-right:8px;"></i>Send to Focus Board</h3>
            <p style="margin:0 0 16px;font-size:13px;color:var(--fg-6c757d);border-bottom:1px solid var(--bd-dee2e6);padding-bottom:12px;">${escapeHtml(taskTitle)}</p>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button onclick="sendToFocusAndClose(${taskId},'${getTodayStr()}',this)" style="padding:9px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:0.9em;">⚡ Today</button>
                <button onclick="sendToFocusAndClose(${taskId},'${getTomorrowStr()}',this)" style="padding:9px;background:#6c757d;color:white;border:none;border-radius:4px;cursor:pointer;font-size:0.9em;">📅 Tomorrow</button>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="date" id="sfm-${taskId}" value="${getTodayStr()}" style="flex:1;padding:8px;border:1px solid var(--bd-ced4da);border-radius:4px;font-size:13px;">
                    <button onclick="sendToFocusFromInput(${taskId})" style="padding:8px 12px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;white-space:nowrap;font-size:0.9em;">Pick Date</button>
                </div>
                <button onclick="this.closest('[style*=fixed]').remove()" style="padding:9px;background:var(--bg-f8f9fa);color:var(--fg-333);border:1px solid var(--bd-dee2e6);border-radius:4px;cursor:pointer;font-size:0.9em;">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

async function sendToFocusAndClose(taskId, date, btn) {
    btn.closest('[style*=fixed]').remove();
    await fetch(`/api/focus/${taskId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({focus_date:date}) });
    showNotification('Task added to Focus Board 🎯', 'success');
}

async function sendToFocusFromInput(taskId) {
    const inp = document.getElementById(`sfm-${taskId}`);
    if (!inp||!inp.value) return;
    const date = inp.value;
    inp.closest('[style*=fixed]').remove();
    await fetch(`/api/focus/${taskId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({focus_date:date}) });
    showNotification('Task added to Focus Board 🎯', 'success');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
