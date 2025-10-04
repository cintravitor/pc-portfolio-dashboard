/**
 * UI Filters Module
 * Handles all filter UI operations: tactical filters, filter pills, data quality filters
 * 
 * Part of the modular UI architecture refactor
 * @module ui-filters
 */

(function() {
    'use strict';
    
    // ==================== TACTICAL FILTERS ====================
    
    /**
     * Setup tactical filters and sorting for Portfolio Overview
     */
    function setupTacticalFilters() {
        console.log('Setting up tactical filters and sorting...');
        
        // Populate filter dropdowns with current data
        populateFilters();
        
        // Setup event listeners for all filter controls
        const searchInput = document.getElementById('search-input');
        const areaSelect = document.getElementById('filter-area');
        const maturitySelect = document.getElementById('filter-maturity');
        const ownerSelect = document.getElementById('filter-owner');
        const sortBySelect = document.getElementById('sort-by');
        
        // Use debounced filtering for search input (improves performance)
        if (searchInput) {
            const debouncedFilter = window.DataManager.debounce(applyFiltersFromUI, 300);
            searchInput.addEventListener('input', debouncedFilter);
        }
        
        // Add change listeners for filter dropdowns
        if (areaSelect) {
            areaSelect.addEventListener('change', applyFiltersFromUI);
        }
        
        if (maturitySelect) {
            maturitySelect.addEventListener('change', applyFiltersFromUI);
        }
        
        if (ownerSelect) {
            ownerSelect.addEventListener('change', applyFiltersFromUI);
        }
        
        // Add change listener for sort dropdown
        if (sortBySelect) {
            sortBySelect.addEventListener('change', applyFiltersFromUI);
        }
        
        // Setup click-to-filter for data quality stat cards
        setupDataQualityFilters();
        
        console.log('✅ Tactical filters and sorting configured');
    }
    
    /**
     * Setup click-to-filter event listeners for data quality stat cards
     */
    function setupDataQualityFilters() {
        const missingUXCard = document.querySelector('[data-filter-type="missing-ux-metric"]');
        const missingBICard = document.querySelector('[data-filter-type="missing-bi-metric"]');
        
        if (missingUXCard) {
            missingUXCard.addEventListener('click', () => {
                filterByMissingMetric('UX');
            });
        }
        
        if (missingBICard) {
            missingBICard.addEventListener('click', () => {
                filterByMissingMetric('BI');
            });
        }
    }
    
    /**
     * Filter products by missing metrics (UX or BI)
     * @param {string} metricType - Either 'UX' or 'BI'
     */
    function filterByMissingMetric(metricType) {
        const portfolioData = window.DataManager.getPortfolioData();
        
        // Filter products with missing metrics
        const filtered = portfolioData.filter(product => {
            if (metricType === 'UX') {
                // Check if UX metric is missing
                if (product.monthlyUX && Array.isArray(product.monthlyUX)) {
                    const lastValue = product.monthlyUX[product.monthlyUX.length - 1];
                    return !lastValue || 
                           lastValue === 'N/A' || 
                           lastValue === '' || 
                           lastValue === '0' ||
                           parseFloat(lastValue) === 0;
                }
                return true; // No monthlyUX array
            } else {
                // Check if BI metric is missing
                if (product.monthlyBI && Array.isArray(product.monthlyBI)) {
                    const lastValue = product.monthlyBI[product.monthlyBI.length - 1];
                    return !lastValue || 
                           lastValue === 'N/A' || 
                           lastValue === '' || 
                           lastValue === '0' ||
                           parseFloat(lastValue) === 0;
                }
                return true; // No monthlyBI array
            }
        });
        
        // Update filtered data in state
        window.State.setFilteredData(filtered);
        
        // Clear all filter UI controls (so they show "All")
        document.getElementById('search-input').value = '';
        document.getElementById('filter-area').value = '';
        document.getElementById('filter-maturity').value = '';
        document.getElementById('filter-owner').value = '';
        
        // Render filtered cards
        window.UIManager.Cards.render();
        window.UIManager.Cards.updateStats();
        
        // Show notification about what was filtered
        showDataQualityFilterNotification(metricType, filtered.length);
    }
    
    /**
     * Show notification when data quality filter is applied
     * @param {string} metricType - Either 'UX' or 'BI'
     * @param {number} count - Number of filtered products
     */
    function showDataQualityFilterNotification(metricType, count) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.data-quality-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification banner
        const notification = document.createElement('div');
        notification.className = 'data-quality-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-text">
                    Showing <strong>${count} product${count !== 1 ? 's' : ''}</strong> with missing ${metricType} metric updates
                </span>
                <button class="notification-close" onclick="window.UIManager.Filters.clearDataQualityFilter()">
                    <span>✕</span> Clear Filter
                </button>
            </div>
        `;
        
        // Insert notification at top of content area
        const contentLeft = document.getElementById('content-left');
        const statsBar = document.getElementById('stats-bar');
        contentLeft.insertBefore(notification, statsBar.nextSibling);
    }
    
    /**
     * Clear data quality filter and show all products
     */
    function clearDataQualityFilter() {
        // Remove notification
        const notification = document.querySelector('.data-quality-notification');
        if (notification) {
            notification.remove();
        }
        
        // Clear filters and show all products
        clearFilters();
    }
    
    /**
     * Populate filter dropdowns with unique values
     */
    function populateFilters() {
        const filterOptions = window.DataManager.getFilterOptions();
        
        // Populate dropdowns
        const areaSelect = document.getElementById('filter-area');
        const maturitySelect = document.getElementById('filter-maturity');
        const ownerSelect = document.getElementById('filter-owner');

        areaSelect.innerHTML = '<option value="">All Areas</option>' + 
            filterOptions.areas.map(a => `<option value="${window.Utils.escapeHtml(a)}">${window.Utils.escapeHtml(a)}</option>`).join('');
        
        maturitySelect.innerHTML = '<option value="">All Stages</option>' + 
            filterOptions.maturities.map(m => `<option value="${window.Utils.escapeHtml(m)}">${window.Utils.escapeHtml(m)}</option>`).join('');
        
        ownerSelect.innerHTML = '<option value="">All Owners</option>' + 
            filterOptions.owners.map(o => `<option value="${window.Utils.escapeHtml(o)}">${window.Utils.escapeHtml(o)}</option>`).join('');
    }
    
    /**
     * Apply filters - reads filter values and updates display
     */
    function applyFiltersFromUI() {
        const searchTerm = document.getElementById('search-input').value;
        const areaFilter = document.getElementById('filter-area').value;
        const maturityFilter = document.getElementById('filter-maturity').value;
        const ownerFilter = document.getElementById('filter-owner').value;
        const sortBy = document.getElementById('sort-by').value;
        const belowTargetOnly = document.getElementById('filter-below-target').checked;

        window.DataManager.applyFilters(searchTerm, areaFilter, maturityFilter, ownerFilter, sortBy, belowTargetOnly);
        
        window.UIManager.Cards.render();
        window.UIManager.Cards.updateStats();
        renderFilterPills();
    }
    
    /**
     * Clear all filters
     */
    function clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('filter-area').value = '';
        document.getElementById('filter-maturity').value = '';
        document.getElementById('filter-owner').value = '';
        document.getElementById('sort-by').value = '';
        document.getElementById('filter-below-target').checked = false;
        applyFiltersFromUI();
    }
    
    // ==================== FILTER PILLS ====================
    
    /**
     * Render active filter pills
     */
    function renderFilterPills() {
        const pillsContainer = document.getElementById('filter-pills-container');
        const pillsElement = document.getElementById('filter-pills');
        
        if (!pillsContainer || !pillsElement) {
            console.warn('Filter pills container not found');
            return;
        }
        
        // Get current filter values
        const searchTerm = document.getElementById('search-input')?.value || '';
        const areaFilter = document.getElementById('filter-area')?.value || '';
        const maturityFilter = document.getElementById('filter-maturity')?.value || '';
        const ownerFilter = document.getElementById('filter-owner')?.value || '';
        const sortBy = document.getElementById('sort-by')?.value || '';
        const belowTargetOnly = document.getElementById('filter-below-target')?.checked || false;
        
        // Build array of active filters
        const activeFilters = [];
        
        if (searchTerm.trim()) {
            activeFilters.push({
                type: 'search',
                label: 'Search',
                value: searchTerm,
                icon: '🔍'
            });
        }
        
        if (areaFilter) {
            activeFilters.push({
                type: 'area',
                label: 'Area',
                value: areaFilter,
                icon: '🏢'
            });
        }
        
        if (maturityFilter) {
            activeFilters.push({
                type: 'maturity',
                label: 'Maturity',
                value: maturityFilter,
                icon: '🔄'
            });
        }
        
        if (ownerFilter) {
            activeFilters.push({
                type: 'owner',
                label: 'Owner',
                value: ownerFilter,
                icon: '👤'
            });
        }
        
        if (belowTargetOnly) {
            activeFilters.push({
                type: 'below-target',
                label: 'Metrics',
                value: 'Below Target',
                icon: '📉'
            });
        }
        
        if (sortBy) {
            const sortLabels = {
                'name-asc': 'Name (A-Z)',
                'name-desc': 'Name (Z-A)',
                'maturity-asc': 'Maturity Stage',
                'area-asc': 'Area (A-Z)',
                'owner-asc': 'Owner (A-Z)'
            };
            activeFilters.push({
                type: 'sort',
                label: 'Sort',
                value: sortLabels[sortBy] || sortBy,
                icon: '⬆️'
            });
        }
        
        // Show or hide container based on active filters
        if (activeFilters.length === 0) {
            pillsContainer.style.display = 'none';
            return;
        }
        
        pillsContainer.style.display = 'flex';
        
        // Render pills
        pillsElement.innerHTML = activeFilters.map((filter, index) => `
            <div class="filter-pill" data-filter-type="${filter.type}" data-filter-index="${index}">
                <span class="filter-pill-icon">${filter.icon}</span>
                <span class="filter-pill-text">
                    <strong>${window.Utils.escapeHtml(filter.label)}:</strong> ${window.Utils.escapeHtml(filter.value)}
                </span>
                <button class="filter-pill-remove" 
                        onclick="window.UIManager.Filters.removeFilterPill('${filter.type}')" 
                        title="Remove ${window.Utils.escapeHtml(filter.label)} filter"
                        aria-label="Remove ${window.Utils.escapeHtml(filter.label)} filter">
                    ×
                </button>
            </div>
        `).join('');
    }
    
    /**
     * Remove a specific filter pill
     * @param {string} filterType - Type of filter to remove
     */
    function removeFilterPill(filterType) {
        // Clear the specific filter
        switch (filterType) {
            case 'search':
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
                break;
                
            case 'area':
                const areaFilter = document.getElementById('filter-area');
                if (areaFilter) areaFilter.value = '';
                break;
                
            case 'maturity':
                const maturityFilter = document.getElementById('filter-maturity');
                if (maturityFilter) maturityFilter.value = '';
                break;
                
            case 'owner':
                const ownerFilter = document.getElementById('filter-owner');
                if (ownerFilter) ownerFilter.value = '';
                break;
                
            case 'below-target':
                const belowTargetCheckbox = document.getElementById('filter-below-target');
                if (belowTargetCheckbox) belowTargetCheckbox.checked = false;
                break;
                
            case 'sort':
                const sortBy = document.getElementById('sort-by');
                if (sortBy) sortBy.value = '';
                break;
                
            default:
                console.warn('Unknown filter type:', filterType);
                return;
        }
        
        // Re-apply filters and update UI
        applyFiltersFromUI();
    }
    
    // Export to window.UIManager.Filters namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Filters = {
        setupTacticalFilters,
        populateFilters,
        applyFiltersFromUI,
        clearFilters,
        clearDataQualityFilter,
        renderFilterPills,
        removeFilterPill
    };
    
    console.log('✅ UI Filters module loaded');
})();
