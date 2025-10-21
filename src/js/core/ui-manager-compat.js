/**
 * UI Manager Compatibility Wrapper
 * Maintains backward compatibility with legacy code
 * 
 * This wrapper ensures old code that references window.UIManager
 * continues to work after the modular split.
 * 
 * Part of the modular UI architecture refactor
 */

(function() {
    'use strict';
    
    // Ensure UIManager namespace exists and consolidate all modules
    if (!window.UIManager) window.UIManager = {};
    
    // Add top-level convenience methods for backward compatibility
    Object.assign(window.UIManager, {
        // From ui-tabs.js
        switchTab: window.UIManager.Tabs?.switchTab || function(tabName) {
            console.warn('Tabs module not loaded');
        },
        
        // From ui-filters.js
        setupTacticalFilters: window.UIManager.Filters?.setupTacticalFilters || function() {
            console.warn('Filters module not loaded');
        },
        populateFilters: window.UIManager.Filters?.populateFilters || function() {
            console.warn('Filters module not loaded');
        },
        applyFiltersFromUI: window.UIManager.Filters?.applyFiltersFromUI || function() {
            console.warn('Filters module not loaded');
        },
        clearFilters: window.UIManager.Filters?.clearFilters || function() {
            console.warn('Filters module not loaded');
        },
        
        // From ui-cards.js
        renderCards: window.UIManager.Cards?.render || function() {
            console.warn('Cards module not loaded');
        },
        updateStats: window.UIManager.Cards?.updateStats || function() {
            console.warn('Cards module not loaded');
        },
        updateLastUpdateDisplay: window.UIManager.Cards?.updateLastUpdateDisplay || function() {
            console.warn('Cards module not loaded');
        },
        
        // From ui-detail-panel.js
        showDetailPanel: window.UIManager.DetailPanel?.show || function() {
            console.warn('DetailPanel module not loaded');
        },
        hideDetailPanel: window.UIManager.DetailPanel?.hide || function() {
            console.warn('DetailPanel module not loaded');
        },
        
        // UI State helpers (moved from old ui-manager.js)
        showLoading: function(show) {
            const loading = document.getElementById('loading');
            const container = document.getElementById('cards-container');
            if (loading && container) {
                if (show) {
                    loading.classList.remove('hidden');
                    container.classList.add('hidden');
                } else {
                    loading.classList.add('hidden');
                }
            }
        },
        
        showError: function(message) {
            const errorDiv = document.getElementById('error');
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
            }
        },
        
        hideError: function() {
            const errorDiv = document.getElementById('error');
            if (errorDiv) {
                errorDiv.classList.add('hidden');
            }
        }
    });
    
    // Expose global functions for onclick handlers (backward compatibility)
    window.removeFilterPill = function(type) {
        if (window.UIManager.Filters && window.UIManager.Filters.removeFilterPill) {
            window.UIManager.Filters.removeFilterPill(type);
        }
    };
    
    window.clearDataQualityFilter = function() {
        if (window.UIManager.Filters && window.UIManager.Filters.clearDataQualityFilter) {
            window.UIManager.Filters.clearDataQualityFilter();
        }
    };
    
    // Global tab switching function
    window.switchTab = function(tabName) {
        if (window.UIManager.switchTab) {
            window.UIManager.switchTab(tabName);
        }
    };
    
    // Global detail panel functions
    window.showDetailPanel = function(productData) {
        if (window.UIManager.showDetailPanel) {
            window.UIManager.showDetailPanel(productData);
        }
    };
    
    window.hideDetailPanel = function() {
        if (window.UIManager.hideDetailPanel) {
            window.UIManager.hideDetailPanel();
        }
    };
    
    console.log('✅ UI Manager compatibility wrapper loaded');
    console.log('📊 Active UI Modules:', {
        Tabs: !!window.UIManager.Tabs,
        Filters: !!window.UIManager.Filters,
        Cards: !!window.UIManager.Cards,
        DetailPanel: !!window.UIManager.DetailPanel,
        Charts: !!window.UIManager.Charts,
        Governance: !!window.UIManager.Governance,
        Analytics: !!window.UIManager.Analytics,
        DrillDown: !!window.UIManager.DrillDown
    });
})();
