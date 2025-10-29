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
    console.log('[Dashboard] Verifying dependencies...');
    
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
    
    // Check optional dependencies
    const missingOptional = optionalDependencies.filter(dep => !window[dep.name]);
    if (missingOptional.length > 0) {
        console.warn('[Dashboard] ⚠️ Optional features unavailable:');
        missingOptional.forEach(dep => {
            console.warn(`  - ${dep.name} (${dep.description})`);
        });
    }
    
    console.log('[Dashboard] ✅ All critical dependencies verified');
    console.log('[Dashboard] 🎯 Ready to initialize');
})();

// ==================== DATA LOADING & INITIALIZATION ====================

/**
 * Test anomaly detection with current portfolio data
 * Logs results to console for verification
 */
function testAnomalyDetection() {
    console.log('='.repeat(60));
    console.log('ANOMALY DETECTION TEST');
    console.log('='.repeat(60));
    
    const portfolioData = window.State.getPortfolioData();
    
    if (!portfolioData || portfolioData.length === 0) {
        console.warn('⚠️ No portfolio data available. Load data first.');
        return;
    }
    
    // Run anomaly detection
    const anomalyReport = window.DataManager.checkAnomalies();
    
    // Log full report
    console.log('\n📊 ANOMALY REPORT:');
    console.log(JSON.stringify(anomalyReport, null, 2));
    
    console.log('\n📈 SUMMARY:');
    console.log(`  • Total Owner Overloads: ${anomalyReport.summary.totalOwnerOverloads}`);
    console.log(`  • Total Data Health Issues: ${anomalyReport.summary.totalDataHealthIssues}`);
    console.log(`  • Total Anomalies: ${anomalyReport.summary.totalAnomalies}`);
    console.log(`  • Generated: ${anomalyReport.summary.timestamp}`);
    
    if (anomalyReport.ownerOverload.length > 0) {
        console.log('\n⚠️ OWNER OVERLOAD (>3 products in Development/Growth):');
        anomalyReport.ownerOverload.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.owner} (${item.productCount} products):`);
            item.products.forEach(productName => {
                console.log(`     - ${productName}`);
            });
        });
    } else {
        console.log('\n✅ No owner overloads detected');
    }
    
    if (anomalyReport.dataHealthIssues.length > 0) {
        console.log(`\n🏥 DATA HEALTH ISSUES (${anomalyReport.dataHealthIssues.length} products with issues):`);
        console.log('  Top 10 products with most issues:');
        anomalyReport.dataHealthIssues.slice(0, 10).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (${item.issueCount} issues):`);
            item.issues.forEach(issue => {
                console.log(`     - ${issue}`);
            });
        });
        
        if (anomalyReport.dataHealthIssues.length > 10) {
            console.log(`  ... and ${anomalyReport.dataHealthIssues.length - 10} more products with issues`);
        }
    } else {
        console.log('\n✅ No data health issues detected');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
    
    return anomalyReport;
}

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
                const elapsed = Date.now() - startTime;
                console.log(`✅ All modules ready (${elapsed}ms)`);
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
    console.log('Portfolio Dashboard initialized');
    
    // NEW: Wait for critical UI modules to be ready before setting up event listeners
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
    
    // Try to load cached data first for instant display
    const cachedData = window.DataManager.loadCachedData();
    if (cachedData && cachedData.length > 0) {
        console.log(`📦 Loading ${cachedData.length} products from cache...`);
        window.State.setPortfolioData(cachedData);
        window.UIManager.renderCards();
        window.UIManager.updateStats();
        window.UIManager.updateLastUpdateDisplay();
        console.log('✅ Cached data loaded');
    } else {
        console.log('⚠️ No cached data found - click "Refresh Data" button to load');
    }
    
    // Initialize auto-update system
    initAutoUpdate();
    
    console.log('✅ Dashboard ready');
    console.log('\n💡 TIP: Click "Refresh Data" to load latest data from Google Sheets');
    console.log('💡 TIP: Run testAnomalyDetection() in console to test anomaly detection');
}

/**
 * Initialize auto-update system
 * Checks if data should be refreshed and sets up periodic checks
 */
function initAutoUpdate() {
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
            window.UIManager.showError('Showing cached data.');
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
    window.UIManager.hideError();

    try {
        // Fetch data using Data Manager
        const data = await window.DataManager.fetchSheetData();
        
        // Update UI after successful fetch
        window.UIManager.setupTacticalFilters(); // Setup filters and sorting
        window.DataManager.applyFilters('', '', '', '', ''); // Reset filters and sorting
        window.UIManager.renderCards();
        window.UIManager.updateStats();
        window.UIManager.updateLastUpdateDisplay();
        
        console.log('✅ Data fetch and UI update complete');

    } catch (error) {
        console.error('Error in fetchSheetData:', error);
        window.UIManager.showError(`Failed to fetch data: ${error.message}`);
        
        // Try to load cached data as fallback
        const cachedData = window.DataManager.loadCachedData();
        if (cachedData && cachedData.length > 0) {
            window.UIManager.setupTacticalFilters(); // Setup filters and sorting
            window.DataManager.applyFilters('', '', '', '', ''); // Reset filters and sorting
            window.UIManager.renderCards();
            window.UIManager.updateStats();
            window.UIManager.showError('Showing cached data. Unable to fetch fresh data.');
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
    console.log('✅ Tab buttons initialized');
    
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
    
    console.log('✅ All event listeners setup complete');
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

// Expose test function globally for manual testing in console
window.testAnomalyDetection = testAnomalyDetection;

// ==================== INITIALIZATION ====================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initialize);
