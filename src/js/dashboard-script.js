/**
 * P&C Portfolio Dashboard - Main Orchestrator
 * Coordinates between Data Manager and UI Manager modules
 * 
 * This is a simplified, high-level orchestrator that delegates work to specialized modules:
 * - core/data-manager.js: Handles all data operations
 * - core/ui-manager.js: Handles all UI rendering and interactions
 * 
 * DEPENDENCIES: All core modules must be loaded before this script
 */

// ==================== CRITICAL DEPENDENCY VERIFICATION ====================

/**
 * Verify all critical dependencies are loaded
 * This prevents cryptic runtime errors if scripts fail to load
 * @throws {Error} If critical dependencies are missing
 */
(function verifyCoreDependencies() {
    const criticalDependencies = [
        { name: 'CONFIG', description: 'Configuration object' },
        { name: 'State', description: 'State management', path: 'window.State' },
        { name: 'Utils', description: 'Utility functions', path: 'window.Utils' },
        { name: 'DataManager', description: 'Data operations', path: 'window.DataManager' },
        { name: 'UIManager', description: 'UI management', path: 'window.UIManager' }
    ];
    
    const optionalDependencies = [
        { name: 'AIRecommendations', description: 'AI features', path: 'window.AIRecommendations' }
    ];
    
    // Check critical dependencies
    const missingCritical = criticalDependencies.filter(dep => {
        const exists = dep.name === 'CONFIG' ? typeof CONFIG !== 'undefined' : window[dep.name];
        return !exists;
    });
    
    if (missingCritical.length > 0) {
        console.error('[Dashboard] ❌ CRITICAL ERROR: Missing dependencies');
        missingCritical.forEach(dep => {
            console.error(`  - ${dep.name} (${dep.description}) not loaded`);
        });
        console.error('[Dashboard] Check that all scripts loaded successfully');
        console.error('[Dashboard] Check browser console for earlier errors');
        
        // Show user-friendly error
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial;">
                <div style="text-align: center; max-width: 500px; padding: 2rem;">
                    <h2 style="color: #ef4444;">⚠️ Dashboard Loading Error</h2>
                    <p>Critical modules failed to load. Please:</p>
                    <ol style="text-align: left; margin: 1rem 0;">
                        <li>Refresh the page</li>
                        <li>Clear browser cache (Cmd+Shift+R or Ctrl+Shift+F5)</li>
                        <li>Check browser console for details</li>
                    </ol>
                    <p style="font-size: 0.875rem; color: #666;">
                        Missing: ${missingCritical.map(d => d.name).join(', ')}
                    </p>
                </div>
            </div>
        `;
        
        throw new Error(`Critical dependencies missing: ${missingCritical.map(d => d.name).join(', ')}`);
    }
})();

// ==================== DATA LOADING & INITIALIZATION ====================

/**
 * Wait for critical UI modules to be fully loaded
 * Prevents race conditions where event listeners fail to attach
 * 
 * @param {Array<string>} modulePaths - Array of module paths to check (e.g., ['UIManager.Filters'])
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<void>} Resolves when all modules are ready
 */
function waitForModules(modulePaths, timeout = 5000) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            const allReady = modulePaths.every(path => {
                const parts = path.split('.');
                let obj = window;
                for (const part of parts) {
                    obj = obj?.[part];
                    if (!obj) return false;
                }
                return true;
            });
            
            if (allReady) {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                const missing = modulePaths.filter(path => {
                    const parts = path.split('.');
                    let obj = window;
                    for (const part of parts) {
                        obj = obj?.[part];
                        if (!obj) return true;
                    }
                    return false;
                });
                const error = new Error(`Module timeout: ${missing.join(', ')} not loaded after ${timeout}ms`);
                
                // Log critical error but don't completely fail
                if (window.Utils && window.Utils.logCriticalError) {
                    window.Utils.logCriticalError('ModuleInitialization', error, { 
                        missing: missing,
                        timeout: timeout 
                    });
                } else {
                    console.error('❌ CRITICAL:', error.message);
                }
                
                // Resolve anyway to allow page to continue (graceful degradation)
                console.warn('⚠️ Proceeding despite missing modules (degraded mode)');
                resolve();
            }
        }, 50); // Check every 50ms
    });
}

/**
 * Main initialization function
 * Orchestrates data loading and UI setup
 */
async function initialize() {
    // Wait for critical UI modules to be ready before setting up event listeners
    try {
        await waitForModules([
            'UIManager.Filters',
            'UIManager.Cards', 
            'UIManager.Tabs',
            'UIManager.DetailPanel'
        ]);
    } catch (error) {
        console.error('Error waiting for modules:', error);
        // Continue anyway - graceful degradation
    }
    
    // Setup UI event listeners (now safe - all modules are ready)
    setupEventListeners();
    
    // Subscribe to fetch retry events for transparent user feedback
    if (window.Utils && window.Utils.subscribeEnhanced) {
        window.Utils.subscribeEnhanced('data:fetch:retry', (data) => {
            const loadingDiv = document.getElementById('loading');
            const loadingText = loadingDiv?.querySelector('h2');
            const loadingSubtext = loadingDiv?.querySelector('p');
            
            if (loadingText && loadingSubtext) {
                if (data.attempt === 1) {
                    loadingText.textContent = 'Loading Portfolio Data...';
                    loadingSubtext.textContent = 'Connecting to Google Sheets';
                } else if (data.attempt === 2) {
                    loadingText.textContent = 'Still Loading...';
                    loadingSubtext.textContent = 'Apps Script warming up (this is normal for first load)';
                } else {
                    loadingText.textContent = 'Almost There...';
                    loadingSubtext.textContent = `Final attempt (${Math.round(data.timeout/1000)}s timeout)`;
                }
            }
        });
    }
    
    // Initialize auto-update system
    initAutoUpdate();
}

/**
 * Initialize auto-update system
 * Checks if data should be refreshed and sets up periodic checks
 */
function initAutoUpdate() {
    // Check if DataManager is available
    if (!window.DataManager || !window.DataManager.shouldRefreshData) {
        console.error('❌ DataManager not available! Retrying in 100ms...');
        setTimeout(initAutoUpdate, 100);
        return;
    }
    
    if (window.DataManager.shouldRefreshData()) {
        fetchSheetData();
    } else {
        const portfolioData = window.DataManager.loadCachedData();
        
        if (portfolioData && portfolioData.length > 0) {
            window.UIManager.setupTacticalFilters(); // Setup filters and sorting
            window.DataManager.applyFilters('', '', '', '', ''); // Initialize filteredData with sorting
            window.UIManager.renderCards();
            window.UIManager.updateStats();
            window.UIManager.updateLastUpdateDisplay();
            window.UIManager.showLoading(false); // Hide loading screen when rendering from cache
        } else {
            fetchSheetData();
        }
    }

    // Check every hour for stale data
    setInterval(() => {
        if (window.DataManager.shouldRefreshData()) {
            fetchSheetData();
        }
    }, 60 * 60 * 1000); // 1 hour
}

/**
 * Fetch fresh data from Google Sheets
 * Coordinates data fetching and UI updates
 */
async function fetchSheetData() {
    window.UIManager.showLoading(true);

    try {
        // Fetch data using Data Manager (with automatic retry logic)
        const data = await window.DataManager.fetchSheetData();
        
        // Update UI after successful fetch
        window.UIManager.setupTacticalFilters(); // Setup filters and sorting
        window.DataManager.applyFilters('', '', '', '', ''); // Reset filters and sorting
        window.UIManager.renderCards();
        window.UIManager.updateStats();
        window.UIManager.updateLastUpdateDisplay();
        
        // Setup inline metrics click listeners (Premium Header Redesign v8.4.0)
        if (window.UIManager.Cards && window.UIManager.Cards.setupInlineMetricsListeners) {
            window.UIManager.Cards.setupInlineMetricsListeners();
        }

    } catch (error) {
        console.error('❌ CRITICAL: All data fetch attempts failed:', error);
        
        // Try to load cached data as silent fallback
        const cachedData = window.DataManager.loadCachedData();
        if (cachedData && cachedData.length > 0) {
            console.log('✅ Loading from cache as fallback');
            window.UIManager.setupTacticalFilters(); // Setup filters and sorting
            window.DataManager.applyFilters('', '', '', '', ''); // Reset filters and sorting
            window.UIManager.renderCards();
            window.UIManager.updateStats();
            window.UIManager.updateLastUpdateDisplay();
        } else {
            // Only show error for truly catastrophic failures (no cache available)
            const loadingDiv = document.getElementById('loading');
            if (loadingDiv) {
                loadingDiv.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <h2 style="color: #ef4444;">Unable to Connect</h2>
                        <p style="color: #6b7280; margin: 1rem 0;">
                            Could not reach Google Sheets after multiple attempts.
                        </p>
                        <p style="color: #6b7280; font-size: 0.875rem;">
                            Please check your internet connection or contact support.
                        </p>
                        <button class="refresh-btn" onclick="fetchSheetData()" style="margin-top: 1rem;">
                            Retry
                        </button>
                    </div>
                `;
            }
            
            // Log critical error for debugging
            if (window.Utils && window.Utils.logCriticalError) {
                window.Utils.logCriticalError('InitialDataFetch', error, {
                    hasCache: false,
                    errorType: error.name
                });
            }
        }
    } finally {
        window.UIManager.showLoading(false);
    }
}

// ==================== EVENT LISTENERS ====================

/**
 * Setup all event listeners
 * Uses event delegation for better performance
 */
function setupEventListeners() {
    // Setup tab button clicks
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            window.UIManager.switchTab(tabName);
        });
    });
    
    // Setup tactical filters and sorting for Portfolio Overview
    // This includes search, filters, and sorting functionality
    window.UIManager.setupTacticalFilters();
    
    // Event delegation for clicks (better performance and cleaner code)
    document.addEventListener('click', (e) => {
        // Handle product card clicks
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('.detail-panel')) {
            const productId = parseInt(card.dataset.productId, 10);
            if (!isNaN(productId)) {
                // Store alert context in state before opening detail panel (contextual alerting feature)
                const product = window.DataManager.getProductById(productId);
                if (product) {
                    const alertData = window.DataManager.calculateSmokeDetectors(product);
                    if (alertData && alertData.count > 0) {
                        window.State.setAlertContext(productId, alertData.triggers);
                    } else {
                        // Clear any stale context
                        window.State.clearAlertContext();
                    }
                }
                
                window.UIManager.showDetailPanel(productId);
            }
            return;
        }
        
        // Handle detail panel close button
        if (e.target.closest('.detail-close')) {
            window.UIManager.hideDetailPanel();
            return;
        }
        
        // Handle clear filters button
        if (e.target.closest('.clear-filters')) {
            window.UIManager.clearFilters();
            return;
        }
    });
}

// ==================== GLOBAL FUNCTIONS (FOR HTML onclick) ====================

/**
 * Global functions exposed for HTML onclick handlers
 * These maintain backward compatibility with existing HTML
 */

// Expose fetchSheetData globally for HTML onclick
window.fetchSheetData = fetchSheetData;

// Expose filter functions for HTML onchange handlers
window.applyFilters = function() {
    window.UIManager.applyFiltersFromUI();
};

window.clearFilters = function() {
    window.UIManager.clearFilters();
};

// ==================== INITIALIZATION ====================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initialize);
