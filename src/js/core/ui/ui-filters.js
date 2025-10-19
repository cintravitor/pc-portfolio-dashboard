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
        
        // Add console logging for debugging multi-select
        console.log('✅ Data quality filters and multi-select setup complete');
    }
    
    /**
     * Filter products by missing metrics (UX or BI)
     * 
     * Business Rule: A product is counted as "missing metrics" if:
     * 1. The key metric field itself is "N/A" or empty (no metric defined), OR
     * 2. The CURRENT MONTH metric value is missing, N/A, empty, or zero
     * 
     * @param {string} metricType - Either 'UX' or 'BI'
     */
    function filterByMissingMetric(metricType) {
        const portfolioData = window.DataManager.getPortfolioData();
        
        // Get current month index (0-based: Jan=0, Feb=1, ..., Oct=9, Nov=10, Dec=11)
        const currentMonth = new Date().getMonth();
        
        // Filter products with missing metrics (definition OR current month value)
        const filtered = portfolioData.filter(product => {
            if (metricType === 'UX') {
                // Rule 1: Check if key metric field is missing or N/A (no metric defined)
                if (!product.keyMetricUX || 
                    product.keyMetricUX.trim() === '' || 
                    product.keyMetricUX === 'N/A') {
                    return true;
                }
                
                // Rule 2: Check if UX metric value is missing for current month
                if (product.monthlyUX && Array.isArray(product.monthlyUX)) {
                    const currentValue = product.monthlyUX[currentMonth];
                    return !currentValue || 
                           currentValue === 'N/A' || 
                           currentValue === '' || 
                           currentValue === '0' ||
                           parseFloat(currentValue) === 0;
                }
                return true; // No monthlyUX array
            } else {
                // Rule 1: Check if key metric field is missing or N/A (no metric defined)
                if (!product.keyMetricBI || 
                    product.keyMetricBI.trim() === '' || 
                    product.keyMetricBI === 'N/A') {
                    return true;
                }
                
                // Rule 2: Check if BI metric value is missing for current month
                if (product.monthlyBI && Array.isArray(product.monthlyBI)) {
                    const currentValue = product.monthlyBI[currentMonth];
                    return !currentValue || 
                           currentValue === 'N/A' || 
                           currentValue === '' || 
                           currentValue === '0' ||
                           parseFloat(currentValue) === 0;
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
     * Helper function to get selected values from multi-select dropdown
     * @param {HTMLSelectElement} selectElement - The select element
     * @returns {Array<string>} Array of selected values (excluding empty default option)
     */
    function getSelectedValues(selectElement) {
        if (!selectElement) return [];
        const selected = Array.from(selectElement.selectedOptions)
            .map(option => option.value)
            .filter(value => value !== ''); // Exclude empty default option
        return selected;
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

        areaSelect.innerHTML = '<option value="">P&C Area</option>' + 
            filterOptions.areas.map(a => `<option value="${window.Utils.escapeHtml(a)}">${window.Utils.escapeHtml(a)}</option>`).join('');
        
        maturitySelect.innerHTML = '<option value="">Journey Stage</option>' + 
            filterOptions.maturities.map(m => `<option value="${window.Utils.escapeHtml(m)}">${window.Utils.escapeHtml(m)}</option>`).join('');
        
        ownerSelect.innerHTML = '<option value="">Owner Name</option>' + 
            filterOptions.owners.map(o => `<option value="${window.Utils.escapeHtml(o)}">${window.Utils.escapeHtml(o)}</option>`).join('');
    }
    
    /**
     * Apply filters - reads filter values and updates display
     */
    function applyFiltersFromUI() {
        const searchTerm = document.getElementById('search-input').value;
        const areaFilters = getSelectedValues(document.getElementById('filter-area'));
        const maturityFilters = getSelectedValues(document.getElementById('filter-maturity'));
        const ownerFilters = getSelectedValues(document.getElementById('filter-owner'));
        const sortBy = document.getElementById('sort-by').value;
        const belowTargetOnly = document.getElementById('filter-below-target').checked;

        // Debug logging
        console.log('🔍 Applying filters:', {
            areas: areaFilters,
            maturity: maturityFilters,
            owners: ownerFilters,
            search: searchTerm
        });

        window.DataManager.applyFilters(searchTerm, areaFilters, maturityFilters, ownerFilters, sortBy, belowTargetOnly);
        
        // Get filtered data to determine which areas to expand
        const filteredData = window.DataManager.getFilteredData();
        
        // Check if any filters are active
        const hasActiveFilters = searchTerm || areaFilter || maturityFilter || ownerFilter || belowTargetOnly;
        
        if (hasActiveFilters && filteredData.length > 0) {
            // Get unique areas from filtered data
            const areasToExpand = [...new Set(filteredData.map(product => product.area || 'Uncategorized'))];
            
            // Expand only the areas with filtered results
            window.UIManager.Cards.collapseAllAreas(); // First collapse all
            window.UIManager.Cards.expandAreas(areasToExpand); // Then expand relevant ones
        } else if (!hasActiveFilters) {
            // If no filters, collapse all areas (default state)
            window.UIManager.Cards.collapseAllAreas();
        }
        
        window.UIManager.Cards.render();
        window.UIManager.Cards.updateStats();
        renderFilterPills();
    }
    
    /**
     * Clear all filters
     */
    function clearFilters() {
        document.getElementById('search-input').value = '';
        
        // Clear multi-select dropdowns (deselect all options)
        const areaSelect = document.getElementById('filter-area');
        const maturitySelect = document.getElementById('filter-maturity');
        const ownerSelect = document.getElementById('filter-owner');
        
        if (areaSelect) {
            Array.from(areaSelect.options).forEach(opt => opt.selected = false);
        }
        if (maturitySelect) {
            Array.from(maturitySelect.options).forEach(opt => opt.selected = false);
        }
        if (ownerSelect) {
            Array.from(ownerSelect.options).forEach(opt => opt.selected = false);
        }
        
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
        
        // Get current filter values (multi-select arrays)
        const searchTerm = document.getElementById('search-input')?.value || '';
        const areaFilters = getSelectedValues(document.getElementById('filter-area'));
        const maturityFilters = getSelectedValues(document.getElementById('filter-maturity'));
        const ownerFilters = getSelectedValues(document.getElementById('filter-owner'));
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
        
        // Handle multiple area selections
        if (areaFilters && areaFilters.length > 0) {
            areaFilters.forEach(area => {
                activeFilters.push({
                    type: 'area',
                    label: 'P&C Area',
                    value: area,
                    icon: '🏢'
                });
            });
        }
        
        // Handle multiple maturity selections
        if (maturityFilters && maturityFilters.length > 0) {
            maturityFilters.forEach(maturity => {
                activeFilters.push({
                    type: 'maturity',
                    label: 'Journey Stage',
                    value: maturity,
                    icon: '🔄'
                });
            });
        }
        
        // Handle multiple owner selections
        if (ownerFilters && ownerFilters.length > 0) {
            ownerFilters.forEach(owner => {
                activeFilters.push({
                    type: 'owner',
                    label: 'Owner',
                    value: owner,
                    icon: '👤'
                });
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
                        onclick="window.UIManager.Filters.removeFilterPill('${filter.type}', '${window.Utils.escapeHtml(filter.value)}')" 
                        title="Remove ${window.Utils.escapeHtml(filter.label)} filter"
                        aria-label="Remove ${window.Utils.escapeHtml(filter.label)} filter">
                    ×
                </button>
            </div>
        `).join('');
    }
    
    /**
     * Remove a specific filter pill
     * For multi-select filters, this removes only the specific value, not all selections
     * @param {string} filterType - Type of filter to remove (e.g., 'area', 'maturity', 'owner')
     * @param {string} filterValue - Specific value to remove (for multi-select)
     */
    function removeFilterPill(filterType, filterValue) {
        // Clear the specific filter
        switch (filterType) {
            case 'search':
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
                break;
                
            case 'area':
                const areaFilter = document.getElementById('filter-area');
                if (areaFilter && filterValue) {
                    // Find and deselect the specific option
                    Array.from(areaFilter.options).forEach(opt => {
                        if (opt.value === filterValue) {
                            opt.selected = false;
                        }
                    });
                }
                break;
                
            case 'maturity':
                const maturityFilter = document.getElementById('filter-maturity');
                if (maturityFilter && filterValue) {
                    // Find and deselect the specific option
                    Array.from(maturityFilter.options).forEach(opt => {
                        if (opt.value === filterValue) {
                            opt.selected = false;
                        }
                    });
                }
                break;
                
            case 'owner':
                const ownerFilter = document.getElementById('filter-owner');
                if (ownerFilter && filterValue) {
                    // Find and deselect the specific option
                    Array.from(ownerFilter.options).forEach(opt => {
                        if (opt.value === filterValue) {
                            opt.selected = false;
                        }
                    });
                }
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
