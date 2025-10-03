/**
 * P&C Portfolio Dashboard - Main Orchestrator
 * Coordinates between Data Manager and UI Manager modules
 * 
 * This is a simplified, high-level orchestrator that delegates work to specialized modules:
 * - core/data-manager.js: Handles all data operations
 * - core/ui-manager.js: Handles all UI rendering and interactions
 */

// ==================== DATA LOADING & INITIALIZATION ====================

/**
 * Main initialization function
 * Orchestrates data loading and UI setup
 */
async function initialize() {
    console.log('Portfolio Dashboard initialized');
    
    // Setup UI event listeners
    setupEventListeners();
    
    // Initialize auto-update system
    initAutoUpdate();
    
    console.log('✅ Dashboard ready');
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
            window.UIManager.populateFilters();
            window.DataManager.applyFilters('', '', '', ''); // Initialize filteredData
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
        window.UIManager.populateFilters();
        window.DataManager.applyFilters('', '', '', ''); // Reset filters
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
            window.UIManager.populateFilters();
            window.DataManager.applyFilters('', '', '', '');
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
    
    // Setup debounced search (waits 300ms after user stops typing)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedFilter = window.DataManager.debounce(window.UIManager.applyFiltersFromUI, 300);
        searchInput.addEventListener('input', debouncedFilter);
    }
    
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

// ==================== INITIALIZATION ====================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initialize);
