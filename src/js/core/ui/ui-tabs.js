/**
 * UI Tabs Module
 * Handles tab switching and navigation
 * 
 * Part of the modular UI architecture refactor
 * @module ui-tabs
 */

(function() {
    'use strict';
    
    /**
     * Switch between dashboard tabs
     * @param {string} tabName - Tab identifier ('portfolio-overview' or 'governance-dashboard')
     * @description Handles navigation between 🔍 Explore and 💡 Insights views
     */
    function switchTab(tabName) {
        console.log(`Switching to tab: ${tabName}`);
        
        // Update current tab in State
        window.State.setCurrentTab(tabName);
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `tab-${tabName}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Show/hide filters based on active tab
        const filtersSection = document.getElementById('filters-section');
        if (tabName === 'portfolio-overview') {
            filtersSection.style.display = 'block';
        } else {
            filtersSection.style.display = 'none';
        }
        
        // Load tab-specific content
        if (tabName === 'governance-dashboard') {
            window.UIManager.Governance.render();
        }
    }
    
    // Export to window.UIManager.Tabs namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Tabs = {
        switchTab
    };
    
    // Also expose as global for backward compatibility
    window.switchTab = switchTab;
    
    console.log('✅ UI Tabs module loaded');
})();
