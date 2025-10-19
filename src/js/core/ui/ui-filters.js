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
        
        // Initialize custom multi-select dropdowns
        initializeCustomMultiselect();
        
        // Populate filter dropdowns with current data
        populateFilters();
        
        // Setup event listeners for search and sort
        const searchInput = document.getElementById('search-input');
        const sortBySelect = document.getElementById('sort-by');
        
        // Use debounced filtering for search input (improves performance)
        if (searchInput) {
            const debouncedFilter = window.DataManager.debounce(applyFiltersFromUI, 300);
            searchInput.addEventListener('input', debouncedFilter);
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
     * Custom multi-select state storage
     */
    const multiSelectState = {
        area: new Set(),
        maturity: new Set(),
        owner: new Set()
    };
    
    /**
     * Initialize custom multi-select dropdowns
     */
    function initializeCustomMultiselect() {
        console.log('🔧 Initializing custom multi-select dropdowns...');
        
        // Setup click handlers for headers
        const headers = document.querySelectorAll('.multiselect-header');
        headers.forEach(header => {
            header.addEventListener('click', function(e) {
                e.stopPropagation();
                const filterType = this.getAttribute('data-filter');
                const dropdown = document.querySelector(`.multiselect-dropdown[data-filter="${filterType}"]`);
                
                // Close all other dropdowns
                document.querySelectorAll('.multiselect-dropdown').forEach(dd => {
                    if (dd !== dropdown) {
                        dd.classList.remove('open');
                    }
                });
                document.querySelectorAll('.multiselect-header').forEach(h => {
                    if (h !== this) {
                        h.classList.remove('active');
                    }
                });
                
                // Toggle this dropdown
                dropdown.classList.toggle('open');
                this.classList.toggle('active');
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.custom-multiselect')) {
                document.querySelectorAll('.multiselect-dropdown').forEach(dd => {
                    dd.classList.remove('open');
                });
                document.querySelectorAll('.multiselect-header').forEach(h => {
                    h.classList.remove('active');
                });
            }
        });
        
        console.log('✅ Custom multi-select initialized');
    }
    
    /**
     * Helper function to get selected values from custom multi-select
     * @param {string} filterType - Type of filter ('area', 'maturity', 'owner')
     * @returns {Array<string>} Array of selected values
     */
    function getSelectedValues(filterType) {
        return Array.from(multiSelectState[filterType]);
    }
    
    /**
     * Populate custom multi-select dropdowns with unique values
     */
    function populateFilters() {
        const filterOptions = window.DataManager.getFilterOptions();
        
        console.log('📋 Populating filters:', filterOptions);
        
        // Populate area dropdown
        const areaDropdown = document.querySelector('.multiselect-dropdown[data-filter="area"]');
        if (areaDropdown) {
            areaDropdown.innerHTML = filterOptions.areas.map(area => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(area)}">
                    <input type="checkbox" id="area-${window.Utils.escapeHtml(area).replace(/\s+/g, '-')}" />
                    <label for="area-${window.Utils.escapeHtml(area).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(area)}</label>
                </div>
            `).join('');
            
            // Add event listeners
            areaDropdown.querySelectorAll('.multiselect-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('area', this);
                });
            });
        }
        
        // Populate maturity dropdown
        const maturityDropdown = document.querySelector('.multiselect-dropdown[data-filter="maturity"]');
        if (maturityDropdown) {
            maturityDropdown.innerHTML = filterOptions.maturities.map(maturity => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(maturity)}">
                    <input type="checkbox" id="maturity-${window.Utils.escapeHtml(maturity).replace(/\s+/g, '-')}" />
                    <label for="maturity-${window.Utils.escapeHtml(maturity).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(maturity)}</label>
                </div>
            `).join('');
            
            // Add event listeners
            maturityDropdown.querySelectorAll('.multiselect-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('maturity', this);
                });
            });
        }
        
        // Populate owner dropdown
        const ownerDropdown = document.querySelector('.multiselect-dropdown[data-filter="owner"]');
        if (ownerDropdown) {
            ownerDropdown.innerHTML = filterOptions.owners.map(owner => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(owner)}">
                    <input type="checkbox" id="owner-${window.Utils.escapeHtml(owner).replace(/\s+/g, '-')}" />
                    <label for="owner-${window.Utils.escapeHtml(owner).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(owner)}</label>
                </div>
            `).join('');
            
            // Add event listeners
            ownerDropdown.querySelectorAll('.multiselect-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('owner', this);
                });
            });
        }
        
        console.log('✅ Filters populated');
    }
    
    /**
     * Handle multi-select option change
     */
    function handleMultiselectChange(filterType, optionElement) {
        const value = optionElement.getAttribute('data-value');
        const checkbox = optionElement.querySelector('input[type="checkbox"]');
        
        if (checkbox.checked) {
            multiSelectState[filterType].add(value);
            optionElement.classList.add('selected');
        } else {
            multiSelectState[filterType].delete(value);
            optionElement.classList.remove('selected');
        }
        
        console.log(`✓ ${filterType} selection:`, Array.from(multiSelectState[filterType]));
        
        // Apply filters immediately
        setTimeout(() => {
            applyFiltersFromUI();
        }, 50); // Small delay to ensure checkbox state is updated
    }
    
    /**
     * Apply filters - reads filter values and updates display
     */
    function applyFiltersFromUI() {
        const searchTerm = document.getElementById('search-input').value;
        const areaFilters = getSelectedValues('area');
        const maturityFilters = getSelectedValues('maturity');
        const ownerFilters = getSelectedValues('owner');
        const sortBy = document.getElementById('sort-by').value;
        const belowTargetOnly = document.getElementById('filter-below-target').checked;

        // Debug logging
        console.log('🔍 Applying filters:', {
            areas: areaFilters,
            maturity: maturityFilters,
            owners: ownerFilters,
            search: searchTerm
        });

        console.log('📤 Sending to DataManager:', {
            searchTerm,
            areaFilters,
            maturityFilters,
            ownerFilters,
            sortBy,
            belowTargetOnly
        });

        window.DataManager.applyFilters(searchTerm, areaFilters, maturityFilters, ownerFilters, sortBy, belowTargetOnly);
        
        // Get filtered data to determine which areas to expand
        const filteredData = window.DataManager.getFilteredData();
        
        console.log('📥 Filtered data count:', filteredData.length);
        
        // Check if any filters are active (arrays need length check)
        const hasActiveFilters = searchTerm || areaFilters.length > 0 || maturityFilters.length > 0 || ownerFilters.length > 0 || belowTargetOnly;
        
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
        console.log('🧹 Clearing all filters...');
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        // Clear custom multi-select state
        multiSelectState.area.clear();
        multiSelectState.maturity.clear();
        multiSelectState.owner.clear();
        
        // Uncheck all checkboxes and remove selected class
        document.querySelectorAll('.multiselect-option').forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            option.classList.remove('selected');
        });
        
        const sortBy = document.getElementById('sort-by');
        if (sortBy) sortBy.value = '';
        
        const belowTarget = document.getElementById('filter-below-target');
        if (belowTarget) belowTarget.checked = false;
        
        console.log('✅ Filters cleared, applying empty filters...');
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
        
        // Get current filter values (custom multi-select arrays)
        const searchTerm = document.getElementById('search-input')?.value || '';
        const areaFilters = getSelectedValues('area');
        const maturityFilters = getSelectedValues('maturity');
        const ownerFilters = getSelectedValues('owner');
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
                multiSelectState.area.delete(filterValue);
                const areaOption = document.querySelector(`.multiselect-dropdown[data-filter="area"] .multiselect-option[data-value="${filterValue}"]`);
                if (areaOption) {
                    areaOption.classList.remove('selected');
                    const checkbox = areaOption.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = false;
                }
                break;
                
            case 'maturity':
                multiSelectState.maturity.delete(filterValue);
                const maturityOption = document.querySelector(`.multiselect-dropdown[data-filter="maturity"] .multiselect-option[data-value="${filterValue}"]`);
                if (maturityOption) {
                    maturityOption.classList.remove('selected');
                    const checkbox = maturityOption.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = false;
                }
                break;
                
            case 'owner':
                multiSelectState.owner.delete(filterValue);
                const ownerOption = document.querySelector(`.multiselect-dropdown[data-filter="owner"] .multiselect-option[data-value="${filterValue}"]`);
                if (ownerOption) {
                    ownerOption.classList.remove('selected');
                    const checkbox = ownerOption.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = false;
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
