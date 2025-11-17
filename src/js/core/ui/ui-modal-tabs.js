/**
 * UI Modal Tabs Module
 * Isolated, self-contained module for handling tab navigation in the Solution Detail Modal
 * 
 * Architecture:
 * - IIFE pattern for strict encapsulation
 * - Event-driven communication (publishes tab:switched events)
 * - ARIA-compliant for accessibility
 * - No dependencies on modal content - purely handles tab UI state
 * 
 * @module ui-modal-tabs
 * @requires window.Utils - For event publishing
 */

(function() {
    'use strict';
    
    // Store reference to active tab for state queries
    let currentActiveTabId = null;
    
    /**
     * Switch active tab in the modal
     * @param {string} tabId - Tab identifier (e.g., 'metrics', 'core-details')
     * @fires tab:switched - Published via window.Utils.publishEnhanced
     */
    function switchTab(tabId) {
        if (!tabId) {
            console.error('[Modal Tabs] Tab ID not provided');
            return;
        }
        
        // Find all tab buttons and content panels
        const tabs = document.querySelectorAll('.detail-tab');
        const tabContents = document.querySelectorAll('.detail-tab-content');
        
        if (tabs.length === 0 || tabContents.length === 0) {
            console.warn('[Modal Tabs] No tabs or tab content found in DOM');
            return;
        }
        
        // Remove active state from all tabs
        tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        // Remove active state from all tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Activate the selected tab
        const targetTab = document.querySelector(`.detail-tab[data-tab="${tabId}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.setAttribute('aria-selected', 'true');
        }
        
        // Activate the corresponding content panel
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Update internal state
        currentActiveTabId = tabId;
        
        // Publish event for other modules to react
        if (window.Utils && window.Utils.publishEnhanced) {
            window.Utils.publishEnhanced('tab:switched', {
                tabId: tabId,
                timestamp: Date.now()
            });
        }
        
        console.log('[Modal Tabs] Switched to tab:', tabId);
    }
    
    /**
     * Initialize tab navigation for the modal
     * Sets up click event listeners on all tab buttons
     * @param {HTMLElement} tabsContainer - Container element holding the tab buttons (optional, will search DOM if not provided)
     */
    function initTabNavigation(tabsContainer) {
        // If no container provided, search for it
        const container = tabsContainer || document.querySelector('.detail-tabs');
        
        if (!container) {
            console.warn('[Modal Tabs] Tab container not found in DOM');
            return;
        }
        
        // Find all tab buttons within container
        const tabs = container.querySelectorAll('.detail-tab');
        
        if (tabs.length === 0) {
            console.warn('[Modal Tabs] No tab buttons found in container');
            return;
        }
        
        // Set up click handlers
        tabs.forEach(tab => {
            // Remove any existing listeners (prevent duplicates)
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            // Add click listener
            newTab.addEventListener('click', () => {
                const tabId = newTab.getAttribute('data-tab');
                if (tabId) {
                    switchTab(tabId);
                }
            });
        });
        
        // Initialize first active tab state
        const activeTab = container.querySelector('.detail-tab.active');
        if (activeTab) {
            currentActiveTabId = activeTab.getAttribute('data-tab');
        }
        
        console.log('[Modal Tabs] Tab navigation initialized with', tabs.length, 'tabs');
    }
    
    /**
     * Get the currently active tab ID
     * @returns {string|null} Active tab ID or null if none active
     */
    function getActiveTab() {
        return currentActiveTabId;
    }
    
    /**
     * Reset tab state (useful when modal closes)
     */
    function resetTabState() {
        currentActiveTabId = null;
    }
    
    // Export to window.UIManager.ModalTabs namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.ModalTabs = {
        init: initTabNavigation,
        switchTab: switchTab,
        getActiveTab: getActiveTab,
        reset: resetTabState
    };
    
    console.log('✅ UI Modal Tabs module loaded (ISOLATED)');
})();

