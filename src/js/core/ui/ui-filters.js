/**
 * UI Filters Module
 * Handles all filter UI operations: tactical filters, filter pills, data quality filters
 * 
 * Part of the modular UI architecture refactor
 * @module ui-filters
 */

(function() {
    'use strict';
    
    // State tracking for "Not Updated" card filters
    let activeNotUpdatedFilter = null; // null, 'UX', or 'BI'
    
    // Debounce timer for filter changes
    let filterDebounceTimer = null;
    const FILTER_DEBOUNCE_MS = 150; // 150ms debounce for optimal responsiveness
    
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
            const debouncedFilter = window.Utils.debounce(applyFiltersFromUI, FILTER_DEBOUNCE_MS);
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
                toggleNotUpdatedFilter('UX');
            });
        }
        
        if (missingBICard) {
            missingBICard.addEventListener('click', () => {
                toggleNotUpdatedFilter('BI');
            });
        }
        
        // Add console logging for debugging multi-select
        console.log('✅ Data quality filters and multi-select setup complete');
    }
    
    /**
     * Toggle "Not Updated" filter for UX or BI metrics
     * Uses Pub/Sub pattern and stacks with multi-select filters
     * 
     * Business Rule: A product is "Not Updated for Current Month" if:
     * 1. The key metric field is "N/A" or empty (no metric defined), OR
     * 2. The CURRENT MONTH value is missing, N/A, empty, zero, or dash
     * 
     * @param {string} metricType - Either 'UX' or 'BI'
     */
    function toggleNotUpdatedFilter(metricType) {
        console.log(`🔄 Toggling "Not Updated" filter for ${metricType}...`);
        
        // If clicking the same card again, deactivate the filter
        if (activeNotUpdatedFilter === metricType) {
            console.log(`✖️ Deactivating ${metricType} "Not Updated" filter`);
            activeNotUpdatedFilter = null;
            updateCardActiveState(metricType, false);
            
            // Publish deactivation event
            window.Utils.publish('notUpdatedFilter:deactivated', { metricType });
            
            // Reapply filters without the "Not Updated" filter
            applyFiltersFromUI();
            return;
        }
        
        // Activate the new filter (or switch from UX to BI, or vice versa)
        if (activeNotUpdatedFilter !== null && activeNotUpdatedFilter !== metricType) {
            // Deactivate the other card first
            updateCardActiveState(activeNotUpdatedFilter, false);
        }
        
        activeNotUpdatedFilter = metricType;
        updateCardActiveState(metricType, true);
        
        console.log(`✅ Activated ${metricType} "Not Updated" filter`);
        
        // Publish activation event
        window.Utils.publish('notUpdatedFilter:activated', { metricType });
        
        // Apply filters WITH the "Not Updated" filter (stacks with multi-select)
        applyFiltersFromUI();
    }
    
    /**
     * Update visual active state of "Not Updated" filter cards
     * @param {string} metricType - 'UX' or 'BI'
     * @param {boolean} isActive - true to activate, false to deactivate
     */
    function updateCardActiveState(metricType, isActive) {
        const cardId = metricType === 'UX' ? 'card-missing-ux' : 'card-missing-bi';
        const card = document.getElementById(cardId);
        
        if (!card) {
            console.warn(`Card not found: ${cardId}`);
            return;
        }
        
        if (isActive) {
            card.classList.add('stat-card-active');
            card.setAttribute('aria-pressed', 'true');
            card.title = `Click to remove ${metricType} "Not Updated" filter`;
        } else {
            card.classList.remove('stat-card-active');
            card.setAttribute('aria-pressed', 'false');
            card.title = `Click to filter solutions with missing ${metricType} metric updates`;
        }
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
        // journey: new Set(),  // REMOVED: Journey Stage filter (Premium Header Redesign v8.4.0 - redundant with grouping)
        maturity: new Set(),
        targetUser: new Set(),
        owner: new Set()
    };
    
    /**
     * Initialize custom multi-select dropdowns
     */
    function initializeCustomMultiselect() {
        console.log('🔧 Initializing custom multi-select dropdowns...');
        
        // NEW: Verify DOM elements exist before attaching listeners
        const headers = document.querySelectorAll('.multiselect-header');
        if (headers.length === 0) {
            const errorMsg = 'No .multiselect-header elements found. Cannot initialize filters.';
            console.error('❌', errorMsg);
            
            // Log critical error for debugging
            if (window.Utils && window.Utils.logCriticalError) {
                window.Utils.logCriticalError('FilterInitialization', new Error(errorMsg), {
                    expectedElements: '.multiselect-header',
                    foundCount: 0
                });
            }
            
            // Show user-friendly error in filters section
            const filtersSection = document.getElementById('filters-section');
            if (filtersSection) {
                const errorBanner = document.createElement('div');
                errorBanner.style.cssText = 'color: #ef4444; padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 0.5rem; margin: 1rem 0;';
                errorBanner.innerHTML = '⚠️ Filter initialization failed. Please refresh the page or contact support if the issue persists.';
                filtersSection.insertBefore(errorBanner, filtersSection.firstChild);
            }
            
            return false; // Signal initialization failure
        }
        
        console.log(`✅ Found ${headers.length} filter headers`);
        
        // Setup click handlers for headers
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
        return true; // Signal successful initialization
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
     * Update visual state of filter headers based on selections
     */
    function updateFilterHeaderStates() {
        ['area', 'maturity', 'targetUser', 'owner'].forEach(filterType => {  // journey removed
            const header = document.querySelector(`.multiselect-header[data-filter="${filterType}"]`);
            const hasSelections = multiSelectState[filterType] && multiSelectState[filterType].size > 0;
            
            if (header) {
                if (hasSelections) {
                    header.classList.add('has-selections');
                } else {
                    header.classList.remove('has-selections');
                }
            }
        });
    }
    
    /**
     * Create "Select All" option HTML for a multi-select dropdown
     * @param {string} filterType - Filter type identifier ('area', 'journey', etc.)
     * @returns {string} HTML string for "Select All" checkbox option
     */
    function createSelectAllOption(filterType) {
        return `
            <div class="multiselect-option multiselect-select-all" data-value="__SELECT_ALL__" data-filter-type="${filterType}">
                <input type="checkbox" id="${filterType}-select-all" />
                <label for="${filterType}-select-all"><strong>Select All</strong></label>
            </div>
            <div class="multiselect-divider"></div>
        `;
    }
    
    /**
     * Handle "Select All" toggle for a specific filter type
     * @param {string} filterType - Filter type ('area', 'journey', 'maturity', 'targetUser', 'owner')
     * @param {HTMLElement} selectAllOption - The "Select All" checkbox element
     */
    function handleSelectAllToggle(filterType, selectAllOption) {
        const startTime = performance.now();
        
        const checkbox = selectAllOption.querySelector('input[type="checkbox"]');
        const dropdown = document.querySelector(`.multiselect-dropdown[data-filter="${filterType}"]`);
        const allOptions = dropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)');
        
        const shouldSelectAll = checkbox.checked;
        
        // Bulk state mutation (no DOM updates in loop for performance)
        if (shouldSelectAll) {
            // Select all options
            allOptions.forEach(option => {
                const value = option.getAttribute('data-value');
                multiSelectState[filterType].add(value);
            });
        } else {
            // Deselect all options
            multiSelectState[filterType].clear();
        }
        
        // Batch DOM updates using DocumentFragment for performance
        allOptions.forEach(option => {
            const optionCheckbox = option.querySelector('input[type="checkbox"]');
            optionCheckbox.checked = shouldSelectAll;
            option.classList.toggle('selected', shouldSelectAll);
        });
        
        const elapsed = performance.now() - startTime;
        console.log(`✅ [ANALYTICS] filter_select_all_toggle: { filterType: "${filterType}", action: "${shouldSelectAll ? 'select_all' : 'deselect_all'}", optionsCount: ${allOptions.length}, durationMs: ${elapsed.toFixed(2)} }`);
        
        // Update visual feedback on header
        updateFilterHeaderStates();
        
        // Apply filters with existing debounce mechanism
        setTimeout(() => {
            applyFiltersFromUI();
        }, 50);
    }
    
    /**
     * Update "Select All" checkbox state to reflect current selections
     * Called after individual option changes to keep "Select All" in sync
     * @param {string} filterType - Filter type identifier
     */
    function updateSelectAllState(filterType) {
        const dropdown = document.querySelector(`.multiselect-dropdown[data-filter="${filterType}"]`);
        if (!dropdown) return;
        
        const selectAllCheckbox = dropdown.querySelector('.multiselect-select-all input[type="checkbox"]');
        if (!selectAllCheckbox) return;
        
        const allOptions = dropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)');
        const totalOptions = allOptions.length;
        const selectedCount = multiSelectState[filterType].size;
        
        // Update "Select All" checkbox state
        selectAllCheckbox.checked = (selectedCount === totalOptions && totalOptions > 0);
    }
    
    /**
     * Populate custom multi-select dropdowns with unique values
     */
    function populateFilters() {
        const filterOptions = window.DataManager.getFilterOptions();
        
        console.log('📋 Populating filters:', filterOptions);
        
        // Guard clause: Skip if no data available yet
        if (!filterOptions || !filterOptions.areas || !filterOptions.maturities || !filterOptions.targetUsers || !filterOptions.owners) {
            console.warn('⚠️ Filter options not available yet - skipping filter population');
            return;
        }
        
        // Populate area dropdown
        const areaDropdown = document.querySelector('.multiselect-dropdown[data-filter="area"]');
        if (areaDropdown) {
            areaDropdown.innerHTML = createSelectAllOption('area') + filterOptions.areas.map(area => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(area)}">
                    <input type="checkbox" id="area-${window.Utils.escapeHtml(area).replace(/\s+/g, '-')}" />
                    <label for="area-${window.Utils.escapeHtml(area).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(area)}</label>
                </div>
            `).join('');
            
            // Add "Select All" event listener
            const selectAllOption = areaDropdown.querySelector('.multiselect-select-all');
            if (selectAllOption) {
                selectAllOption.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleSelectAllToggle('area', this);
                });
            }
            
            // Add event listeners for individual options
            areaDropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('area', this);
                });
            });
        }
        
        // REMOVED: Journey dropdown population (Premium Header Redesign v8.4.0)
        // Journey Stage filter removed - redundant with journey stage grouping
        /* 
        const journeyDropdown = document.querySelector('.multiselect-dropdown[data-filter="journey"]');
        if (journeyDropdown) {
            journeyDropdown.innerHTML = createSelectAllOption('journey') + filterOptions.journeys.map(journey => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(journey)}">
                    <input type="checkbox" id="journey-${window.Utils.escapeHtml(journey).replace(/\s+/g, '-')}" />
                    <label for="journey-${window.Utils.escapeHtml(journey).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(journey)}</label>
                </div>
            `).join('');
            
            const selectAllOption = journeyDropdown.querySelector('.multiselect-select-all');
            if (selectAllOption) {
                selectAllOption.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleSelectAllToggle('journey', this);
                });
            }
            
            journeyDropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('journey', this);
                });
            });
        }
        */
        
        // Populate maturity dropdown
        const maturityDropdown = document.querySelector('.multiselect-dropdown[data-filter="maturity"]');
        if (maturityDropdown) {
            maturityDropdown.innerHTML = createSelectAllOption('maturity') + filterOptions.maturities.map(maturity => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(maturity)}">
                    <input type="checkbox" id="maturity-${window.Utils.escapeHtml(maturity).replace(/\s+/g, '-')}" />
                    <label for="maturity-${window.Utils.escapeHtml(maturity).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(maturity)}</label>
                </div>
            `).join('');
            
            // Add "Select All" event listener
            const selectAllOption = maturityDropdown.querySelector('.multiselect-select-all');
            if (selectAllOption) {
                selectAllOption.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleSelectAllToggle('maturity', this);
                });
            }
            
            // Add event listeners for individual options
            maturityDropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('maturity', this);
                });
            });
        }
        
        // Populate target user dropdown
        const targetUserDropdown = document.querySelector('.multiselect-dropdown[data-filter="targetUser"]');
        if (targetUserDropdown) {
            targetUserDropdown.innerHTML = createSelectAllOption('targetUser') + filterOptions.targetUsers.map(targetUser => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(targetUser)}">
                    <input type="checkbox" id="targetUser-${window.Utils.escapeHtml(targetUser).replace(/\s+/g, '-')}" />
                    <label for="targetUser-${window.Utils.escapeHtml(targetUser).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(targetUser)}</label>
                </div>
            `).join('');
            
            // Add "Select All" event listener
            const selectAllOption = targetUserDropdown.querySelector('.multiselect-select-all');
            if (selectAllOption) {
                selectAllOption.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleSelectAllToggle('targetUser', this);
                });
            }
            
            // Add event listeners for individual options
            targetUserDropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)').forEach(option => {
                option.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleMultiselectChange('targetUser', this);
                });
            });
        }
        
        // Populate owner dropdown
        const ownerDropdown = document.querySelector('.multiselect-dropdown[data-filter="owner"]');
        if (ownerDropdown) {
            ownerDropdown.innerHTML = createSelectAllOption('owner') + filterOptions.owners.map(owner => `
                <div class="multiselect-option" data-value="${window.Utils.escapeHtml(owner)}">
                    <input type="checkbox" id="owner-${window.Utils.escapeHtml(owner).replace(/\s+/g, '-')}" />
                    <label for="owner-${window.Utils.escapeHtml(owner).replace(/\s+/g, '-')}">${window.Utils.escapeHtml(owner)}</label>
                </div>
            `).join('');
            
            // Add "Select All" event listener
            const selectAllOption = ownerDropdown.querySelector('.multiselect-select-all');
            if (selectAllOption) {
                selectAllOption.addEventListener('click', function(e) {
                    if (e.target.tagName !== 'INPUT') {
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    }
                    handleSelectAllToggle('owner', this);
                });
            }
            
            // Add event listeners for individual options
            ownerDropdown.querySelectorAll('.multiselect-option:not(.multiselect-select-all)').forEach(option => {
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
        
        // Update visual feedback on header
        updateFilterHeaderStates();
        
        // Update "Select All" checkbox state to reflect new selection
        updateSelectAllState(filterType);
        
        // Apply filters immediately
        setTimeout(() => {
            applyFiltersFromUI();
        }, 50); // Small delay to ensure checkbox state is updated
    }
    
    /**
     * Apply filters - reads filter values and updates display (debounced)
     */
    function applyFiltersFromUI() {
        // Debounce filter application to prevent excessive re-renders
        clearTimeout(filterDebounceTimer);
        
        // Show loading indicator immediately for responsiveness feedback
        showFilterLoadingIndicator();
        
        filterDebounceTimer = setTimeout(() => {
            applyFiltersImmediately();
        }, FILTER_DEBOUNCE_MS);
    }
    
    /**
     * Show loading indicator during filter application
     */
    function showFilterLoadingIndicator() {
        const container = document.getElementById('cards-container');
        if (container) {
            container.style.opacity = '0.6';
            container.style.pointerEvents = 'none';
        }
    }
    
    /**
     * Hide loading indicator after filter application
     */
    function hideFilterLoadingIndicator() {
        const container = document.getElementById('cards-container');
        if (container) {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }
    }
    
    /**
     * Apply filters immediately (called after debounce)
     */
    function applyFiltersImmediately() {
        const searchTerm = document.getElementById('search-input').value;
        const areaFilters = getSelectedValues('area');
        const journeyFilters = [];  // REMOVED: Journey filter (v8.4.0) - always empty array
        const maturityFilters = getSelectedValues('maturity');
        const targetUserFilters = getSelectedValues('targetUser');
        const ownerFilters = getSelectedValues('owner');
        const sortBy = document.getElementById('sort-by').value;
        const belowTargetOnly = document.getElementById('filter-below-target').checked;

        // Debug logging
        console.log('🔍 Applying filters:', {
            areas: areaFilters,
            journeys: journeyFilters,
            maturity: maturityFilters,
            targetUsers: targetUserFilters,
            owners: ownerFilters,
            search: searchTerm
        });

        // Get active risk filter from state
        const riskLevelFilter = window.State.getActiveRiskFilter();
        
        console.log('📤 Sending to DataManager:', {
            searchTerm,
            areaFilters,
            journeyFilters,
            maturityFilters,
            targetUserFilters,
            ownerFilters,
            sortBy,
            belowTargetOnly,
            notUpdatedFilter: activeNotUpdatedFilter,
            riskLevelFilter
        });

        // Build filter criteria object
        const filterCriteria = {
            searchTerm,
            areaFilters,
            journeyFilters,
            maturityFilters,
            targetUserFilters,
            ownerFilters,
            sortBy,
            belowTargetOnly,
            notUpdatedFilter: activeNotUpdatedFilter,
            riskLevelFilter
        };
        
        // Apply filters using facade API (emits 'data:filtered' event)
        const filteredData = window.DataManager.filterData(filterCriteria);
        
        console.log('📥 Filtered data count:', filteredData.length);
        
        // Publish filter change event for Insights tab to subscribe
        window.Utils.publish('filters:changed', {
            filteredData: filteredData,
            filterContext: {
                areaFilters,
                journeyFilters,
                maturityFilters,
                targetUserFilters,
                ownerFilters,
                searchTerm,
                sortBy,
                belowTargetOnly,
                totalCount: window.DataManager.getPortfolioData().length,
                filteredCount: filteredData.length
            }
        });
        
        // Check if any filters are active (arrays need length check) - journey removed
        const hasActiveFilters = searchTerm || areaFilters.length > 0 || maturityFilters.length > 0 || targetUserFilters.length > 0 || ownerFilters.length > 0 || belowTargetOnly || activeNotUpdatedFilter !== null || riskLevelFilter !== null;
        
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
        
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            window.UIManager.Cards.render();
            window.UIManager.Cards.updateStats();
            renderFilterPills();
            hideFilterLoadingIndicator();
        });
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
        // multiSelectState.journey.clear();  // REMOVED: Journey filter (v8.4.0)
        multiSelectState.maturity.clear();
        multiSelectState.targetUser.clear();
        multiSelectState.owner.clear();
        
        // Uncheck all checkboxes and remove selected class
        document.querySelectorAll('.multiselect-option').forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
            option.classList.remove('selected');
        });
        
        // Clear inline metrics visual state (Premium Header Redesign v8.4.0)
        if (window.UIManager && window.UIManager.Cards && window.UIManager.Cards.clearInlineMetricsActiveState) {
            window.UIManager.Cards.clearInlineMetricsActiveState();
        }
        
        // Uncheck all "Select All" checkboxes
        document.querySelectorAll('.multiselect-select-all input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const sortBy = document.getElementById('sort-by');
        if (sortBy) sortBy.value = '';
        
        const belowTarget = document.getElementById('filter-below-target');
        if (belowTarget) belowTarget.checked = false;
        
        // Clear "Not Updated" card filter if active
        if (activeNotUpdatedFilter !== null) {
            updateCardActiveState(activeNotUpdatedFilter, false);
            activeNotUpdatedFilter = null;
        }
        
        // Clear visual feedback from headers
        updateFilterHeaderStates();
        
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
        const journeyFilters = [];  // REMOVED: Journey filter (v8.4.0)
        const maturityFilters = getSelectedValues('maturity');
        const targetUserFilters = getSelectedValues('targetUser');
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
        
        // REMOVED: Journey filter pills (v8.4.0)
        /* 
        if (journeyFilters && journeyFilters.length > 0) {
            journeyFilters.forEach(journey => {
                activeFilters.push({
                    type: 'journey',
                    label: 'Journey Stage',
                    value: journey,
                    icon: '🗺️'
                });
            });
        }
        */
        
        // Handle multiple maturity selections
        if (maturityFilters && maturityFilters.length > 0) {
            maturityFilters.forEach(maturity => {
                activeFilters.push({
                    type: 'maturity',
                    label: 'Maturity Stage',
                    value: maturity,
                    icon: '🔄'
                });
            });
        }
        
        // Handle multiple target user selections
        if (targetUserFilters && targetUserFilters.length > 0) {
            targetUserFilters.forEach(targetUser => {
                activeFilters.push({
                    type: 'targetUser',
                    label: 'Target User',
                    value: targetUser,
                    icon: '👥'
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
        
        // Risk level filter pill
        const riskLevelFilter = window.State.getActiveRiskFilter();
        if (riskLevelFilter) {
            const riskLabels = {
                critical: { name: 'Critical Issues', icon: '🚨' },
                monitor: { name: 'Monitor Closely', icon: '⚠️' },
                datagaps: { name: 'Data Gaps', icon: '💡' }
            };
            const riskConfig = riskLabels[riskLevelFilter];
            activeFilters.push({
                type: 'risk-level',
                label: 'Risk Level',
                value: riskConfig.name,
                icon: riskConfig.icon,
                riskLevel: riskLevelFilter  // Store for removal
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
                
            case 'journey':
                // REMOVED: Journey filter (v8.4.0) - no-op for backwards compatibility
                console.warn('Journey filter pill removal attempted but journey filter is removed');
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
                
            case 'targetUser':
                multiSelectState.targetUser.delete(filterValue);
                const targetUserOption = document.querySelector(`.multiselect-dropdown[data-filter="targetUser"] .multiselect-option[data-value="${filterValue}"]`);
                if (targetUserOption) {
                    targetUserOption.classList.remove('selected');
                    const checkbox = targetUserOption.querySelector('input[type="checkbox"]');
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
                
            case 'risk-level':
                clearRiskFilter();
                return; // clearRiskFilter already applies filters, no need to do it again
                
            default:
                console.warn('Unknown filter type:', filterType);
                return;
        }
        
        // Update visual feedback on headers
        updateFilterHeaderStates();
        
        // Re-apply filters and update UI
        applyFiltersFromUI();
    }
    
    // ==================== RISK LEVEL FILTER ====================
    
    /**
     * Apply risk level filter from badge click
     * @param {Object} payload - Event payload with riskLevel
     */
    function applyRiskLevelFilter(payload) {
        const { riskLevel } = payload;
        
        console.log(`🎯 Applying risk level filter: ${riskLevel}`);
        
        // Set risk filter in state
        window.State.setActiveRiskFilter(riskLevel);
        
        // Clear any existing "Not Updated" filters to avoid confusion
        if (activeNotUpdatedFilter) {
            activeNotUpdatedFilter = null;
            hideDataQualityNotification();
            updateCardActiveState('UX', false);
            updateCardActiveState('BI', false);
        }
        
        // Apply filters with new risk level
        applyFiltersFromUI();
        
        console.log(`✅ Risk level filter applied: ${riskLevel}`);
    }
    
    /**
     * Clear risk level filter
     */
    function clearRiskFilter() {
        console.log('🧹 Clearing risk level filter');
        
        // Clear state
        window.State.setActiveRiskFilter(null);
        
        // Re-apply filters without risk level
        applyFiltersFromUI();
        
        console.log('✅ Risk level filter cleared');
    }
    
    // Subscribe to risk level filter events
    window.Utils.subscribe('filter:risk-level', applyRiskLevelFilter);
    
    // Export to window.UIManager.Filters namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Filters = {
        setupTacticalFilters,
        populateFilters,
        applyFiltersFromUI,
        clearFilters,
        clearDataQualityFilter,
        clearRiskFilter,
        renderFilterPills,
        removeFilterPill,
        toggleNotUpdatedFilter,  // EXPOSED: For inline metrics click handlers (v8.4.0)
        getActiveNotUpdatedFilter: () => activeNotUpdatedFilter  // NEW: Expose active "Not Updated" filter state
    };
    
    console.log('✅ UI Filters module loaded');
})();
