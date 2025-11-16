/**
 * UI Cards Module - OPTIMIZED VERSION
 * Handles product card rendering and statistics display
 * 
 * Part of the modular UI architecture refactor
 * @module ui-cards
 * 
 * OPTIMIZATIONS:
 * - Memoized grouping for performance
 * - Event delegation for toggle (no inline onclick)
 * - Error handling for robustness
 * - Better animation handling
 */

(function() {
    'use strict';
    
    // Private state - Horizontal Journey Navigation
    let activeJourneyStage = null; // Tracks currently selected journey stage
    
    // Performance optimization: Cache grouped data
    let cachedFilteredData = null;
    let cachedGroupedData = null;
    
    // Track if tooltip listeners have been set up
    let tooltipListenersInitialized = false;
    
    /**
     * Map journey stage values from data to display names
     * @param {string} journeyStage - Raw journey stage value from data
     * @returns {string|null} Display name for the journey stage, or null if not mappable
     */
    function getJourneyDisplayName(journeyStage) {
        if (!journeyStage || journeyStage === 'N/A' || journeyStage.trim() === '') {
            return null; // Skip products with no journey stage
        }
        
        // Journey stage mapping with consistent sizing
        const journeyMap = {
            '(1) Discover and apply for a position': 'Discovery & Apply',
            '(2) Start and adapt': 'Start & Adapt',
            '(3) Perform my role': 'Perform My Role',
            '(4) Develop myself and grow': 'Develop & Grow',
            '(5) Interrupt and get back to work': 'Interrupt & Get Back',
            '(6) Resign or get terminated': 'Resign & Exit',
            '(7) Return to Nubank': 'Return to Nubank',
            'All': 'All Journey Stages'
        };
        
        return journeyMap[journeyStage] || null;
    }
    
    /**
     * Get grouped data with memoization for performance
     * @returns {Object} { groupedByJourney, sortedJourneys }
     */
    function getGroupedData() {
        const filteredData = window.DataManager.getFilteredData();
        
        // Cache hit - return cached data (massive performance boost)
        if (filteredData === cachedFilteredData && cachedGroupedData) {
            return cachedGroupedData;
        }
        
        // Initialize all journey stages with empty arrays (to show even with 0 solutions)
        const groupedByJourney = {
            'All Journey Stages': [],
            'Discovery & Apply': [],
            'Start & Adapt': [],
            'Perform My Role': [],
            'Develop & Grow': [],
            'Interrupt & Get Back': [],
            'Resign & Exit': [],
            'Return to Nubank': []
        };
        
        // Group solutions by journey stage
        filteredData.forEach(product => {
            const journeyStage = product.journeyMain;
            const displayName = getJourneyDisplayName(journeyStage);
            
            // Only add products with valid journey stage mappings
            if (displayName && groupedByJourney[displayName] !== undefined) {
                groupedByJourney[displayName].push(product);
            }
            // Products with unmapped or missing journey stages are skipped
        });
        
        // All journey stages in correct order (already sorted by initialization order)
        const sortedJourneys = Object.keys(groupedByJourney);
        
        // Update cache
        cachedFilteredData = filteredData;
        cachedGroupedData = { groupedByJourney, sortedJourneys };
        
        return cachedGroupedData;
    }
    
    /**
     * Invalidate cache (call when data changes)
     */
    function invalidateCache() {
        cachedFilteredData = null;
        cachedGroupedData = null;
    }
    
    /**
     * Render horizontal journey navigation bar
     * Creates stage pills with glassmorphism and active state management
     */
    function renderJourneyNavigation() {
        const navigationContainer = document.getElementById('journey-navigation');
        const stagesWrapper = document.getElementById('journey-stages-wrapper');
        
        if (!navigationContainer || !stagesWrapper) {
            console.warn('Journey navigation containers not found');
            return;
        }
        
        // Get grouped data
        const { groupedByJourney, sortedJourneys } = getGroupedData();
        
        // Filter to show only stages with solutions
        const journeysWithResults = sortedJourneys.filter(journey => 
            groupedByJourney[journey] && groupedByJourney[journey].length > 0
        );
        
        // If no results, hide navigation
        if (journeysWithResults.length === 0) {
            navigationContainer.style.display = 'none';
            return;
        }
        
        // Show navigation
        navigationContainer.style.display = 'block';
        
        // Only set default active stage if one was previously selected and still has results
        if (activeJourneyStage && !journeysWithResults.includes(activeJourneyStage)) {
            activeJourneyStage = null; // Reset if previous stage has no results
        }
        
        // Render stage buttons
        stagesWrapper.innerHTML = journeysWithResults.map(journey => {
            const count = groupedByJourney[journey].length;
            const isActive = journey === activeJourneyStage;
            const activeClass = isActive ? 'active' : '';
            
            return `
                <button class="journey-stage-btn ${activeClass}" 
                        data-journey="${window.Utils.escapeHtml(journey)}"
                        role="tab"
                        aria-selected="${isActive}"
                        aria-controls="cards-container"
                        ${count === 0 ? 'disabled' : ''}>
                    <span class="journey-stage-name">${window.Utils.escapeHtml(journey)}</span>
                    <span class="journey-stage-count">${count}</span>
                </button>
            `;
        }).join('');
        
        // Set up event delegation for stage selection
        setupJourneyNavigationListeners(stagesWrapper);
    }
    
    /**
     * Set up event delegation for journey stage button clicks and keyboard navigation
     * @param {HTMLElement} stagesWrapper - The wrapper containing stage buttons
     */
    function setupJourneyNavigationListeners(stagesWrapper) {
        // Remove old listeners if exist
        const oldClickListener = stagesWrapper._journeyClickListener;
        const oldKeyListener = stagesWrapper._journeyKeyListener;
        
        if (oldClickListener) {
            stagesWrapper.removeEventListener('click', oldClickListener);
        }
        if (oldKeyListener) {
            stagesWrapper.removeEventListener('keydown', oldKeyListener);
        }
        
        // Click listener
        const clickListener = function(event) {
            const button = event.target.closest('.journey-stage-btn');
            if (!button || button.disabled) return;
            
            const journey = button.dataset.journey;
            if (journey) {
                selectJourneyStage(journey);
            }
        };
        
        // Keyboard navigation listener (Arrow keys + Home/End)
        const keyListener = function(event) {
            const button = event.target.closest('.journey-stage-btn');
            if (!button) return;
            
            const buttons = Array.from(stagesWrapper.querySelectorAll('.journey-stage-btn:not([disabled])'));
            const currentIndex = buttons.indexOf(button);
            
            let targetIndex = currentIndex;
            
            switch(event.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    targetIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    targetIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                    event.preventDefault();
                    break;
                case 'Home':
                    targetIndex = 0;
                    event.preventDefault();
                    break;
                case 'End':
                    targetIndex = buttons.length - 1;
                    event.preventDefault();
                    break;
                case 'Enter':
                case ' ':
                    const journey = button.dataset.journey;
                    if (journey) {
                        selectJourneyStage(journey);
                    }
                    event.preventDefault();
                    break;
                default:
                    return;
            }
            
            if (targetIndex !== currentIndex && buttons[targetIndex]) {
                buttons[targetIndex].focus();
            }
        };
        
        stagesWrapper.addEventListener('click', clickListener);
        stagesWrapper.addEventListener('keydown', keyListener);
        
        // Store for cleanup
        stagesWrapper._journeyClickListener = clickListener;
        stagesWrapper._journeyKeyListener = keyListener;
    }
    
    /**
     * Select a journey stage and update the display with smooth transition
     * @param {string} stageName - The display name of the journey stage to show
     */
    function selectJourneyStage(stageName) {
        if (activeJourneyStage === stageName) {
            return; // Already selected
        }
        
        const cardsContainer = document.getElementById('cards-container');
        if (!cardsContainer) return;
        
        // Use requestAnimationFrame for smoother transition (GPU-optimized)
        cardsContainer.classList.add('transitioning');
        
        // Wait for fade-out transition to complete
        requestAnimationFrame(() => {
            setTimeout(() => {
                activeJourneyStage = stageName;
                renderJourneyNavigation(); // Update active button state
                renderCards(); // Render new stage's cards
                
                // Remove transitioning class for fade-in after a frame
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        cardsContainer.classList.remove('transitioning');
                    }, 50);
                });
            }, 250); // Reduced from 300ms for snappier feel
        });
    }
    
    /**
     * Render product cards for the active journey stage only
     */
    function renderCards() {
        const container = document.getElementById('cards-container');
        const emptyState = document.getElementById('empty-state');
        const filteredData = window.DataManager.getFilteredData();

        // Handle empty state
        if (filteredData.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            invalidateCache(); // Clear cache on empty
            
            // Also hide journey navigation
            const navigationContainer = document.getElementById('journey-navigation');
            if (navigationContainer) {
                navigationContainer.style.display = 'none';
            }
            return;
        }

        emptyState.classList.add('hidden');
        container.classList.remove('hidden');

        // Render journey navigation first
        renderJourneyNavigation();

        // Get grouped data (from cache if possible)
        const { groupedByJourney } = getGroupedData();

        // If no active stage selected, show elegant minimal empty state
        if (!activeJourneyStage) {
            container.innerHTML = `
                <div class="empty-stage-zen">
                    <div class="zen-arrows">
                        <span class="zen-arrow">↑</span>
                        <span class="zen-arrow">↑</span>
                        <span class="zen-arrow">↑</span>
                    </div>
                    <div class="zen-text">Choose a journey stage to explore</div>
                    <div class="zen-divider"></div>
                </div>
            `;
            return;
        }

        // Get products for the active journey stage
        const activeProducts = groupedByJourney[activeJourneyStage] || [];

        // If no products for active stage, show empty state
        if (activeProducts.length === 0) {
            container.innerHTML = '<div class="empty-stage-message">No solutions found for this journey stage.</div>';
            return;
        }

        // Generate cards HTML for active journey stage only
        const cardsHtml = activeProducts.map(product => {
            const summary = window.DataManager.getCardSummaryMetrics(product);
            
            // Calculate smoke detector alerts for this product (returns {count, triggers})
            const alertData = window.DataManager.calculateSmokeDetectors(product);
            const smokeDetectorBadge = getSmokeDetectorBadge(product.id, alertData);
            
            // Generate metric badges with actual values
            const uxBadge = getMetricBadgeWithValues('UX', summary.uxStatus, summary.uxValue, summary.uxTarget, summary.uxMetric);
            const biBadge = getMetricBadgeWithValues('BI', summary.biStatus, summary.biValue, summary.biTarget, summary.biMetric);
            
            // Get P&C Area for badge
            const pncArea = product.area || 'N/A';
            const pncAreaBadge = pncArea !== 'N/A' ? `<span class="card-pnc-area-badge">${window.Utils.escapeHtml(pncArea)}</span>` : '';
            
            return `
            <div class="product-card product-card-compact fade-in" data-product-id="${product.id}">
                ${smokeDetectorBadge}
                
                <div class="card-header-compact">
                    <div class="card-title-row">
                        ${pncAreaBadge}
                        <div class="card-title-compact">
                            ${window.Utils.escapeHtml(product.name)}
                        </div>
                    </div>
                </div>
                
                <div class="card-body-compact">
                    <div class="card-owner">
                        <span class="owner-icon">👤</span>
                        <span class="owner-name">${window.Utils.escapeHtml(summary.owner)}</span>
                    </div>
                    
                    <div class="card-problem-wrapper">
                        <div class="card-problem-extended">
                            ${window.Utils.escapeHtml(summary.problem)}
                        </div>
                    </div>
                    
                    <div class="card-metrics-horizontal">
                        ${uxBadge}
                        ${biBadge}
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        // Render cards directly (no wrapper sections needed)
        container.innerHTML = cardsHtml;
        
        // Set up alert tooltip listeners (only once)
        if (!tooltipListenersInitialized) {
            setupAlertTooltipListeners();
            tooltipListenersInitialized = true;
        }
    }
    
    
    /**
     * Get platform information with icon
     */
    function getPlatformInfo(platform) {
        if (!platform || platform.trim() === '') {
            return '<span class="platform-empty">Not specified</span>';
        }
        
        // Extract and format platform names
        const platforms = platform.split(',').map(p => p.trim()).filter(p => p);
        if (platforms.length === 0) {
            return '<span class="platform-empty">Not specified</span>';
        }
        
        // Map platforms to icons
        const platformIcons = {
            'Web': '🌐',
            'Mobile': '📱',
            'Desktop': '💻',
            'API': '🔌',
            'Email': '📧',
            'SMS': '📨',
            'Excel': '📊',
            'SharePoint': '📁',
            'Teams': '💬'
        };
        
        // Get icon or use default
        const firstPlatform = platforms[0];
        const icon = platformIcons[firstPlatform] || '📦';
        
        if (platforms.length === 1) {
            return `${icon} ${window.Utils.escapeHtml(firstPlatform)}`;
        } else {
            return `${icon} ${window.Utils.escapeHtml(firstPlatform)} +${platforms.length - 1}`;
        }
    }
    
    /**
     * Generate smoke detector badge HTML with contextual alert tooltip
     * Shows warning badge in top-right corner of card when detectors are triggered
     * Badge is enhanced with hover tooltip showing specific alert causes
     * 
     * @param {number} productId - Product ID for analytics and state management
     * @param {Object} alertData - Alert data from calculateSmokeDetectors() { count, triggers }
     * @returns {string} HTML for smoke detector badge, or empty string if no alerts
     */
    function getSmokeDetectorBadge(productId, alertData) {
        if (!alertData || !alertData.count || alertData.count === 0) return '';
        
        const { count, triggers } = alertData;
        
        // Determine severity based on trigger content, not just count
        const hasCritical = triggers.some(t => t.severity === 'critical');
        const severity = hasCritical ? 'critical' : 'warning';
        const icon = hasCritical ? '🔥' : '⚠️';
        
        // Generate data attributes for tooltip functionality
        const triggersJson = JSON.stringify(triggers).replace(/"/g, '&quot;');
        
        return `
            <div class="smoke-detector-badge smoke-${severity}" 
                 data-product-id="${productId}"
                 data-alert-severity="${severity}"
                 data-alert-triggers='${triggersJson}'
                 tabindex="0"
                 role="button"
                 aria-label="${count} alert${count > 1 ? 's' : ''} detected. Press enter for details.">
                ${icon}
            </div>
        `;
    }
    
    /**
     * Generate metric badge with actual values (current vs target)
     * Displays metrics in compact, scannable format with color coding
     * @param {string} label - Metric label (e.g., "UX", "BI")
     * @param {string} status - Status color ('green', 'red', 'gray')
     * @param {number|null} value - Current metric value
     * @param {number|null} target - Target metric value
     * @param {string} metricName - Name of the metric for tooltip
     * @returns {string} HTML for metric badge
     */
    function getMetricBadgeWithValues(label, status, value, target, metricName) {
        const statusClass = `metric-${status}`;
        const icon = status === 'green' ? '✓' : status === 'red' ? '✗' : '—';
        
        // Format values for display - preserve decimals if present
        let currentDisplay, targetDisplay;
        
        if (value !== null && !isNaN(value)) {
            // Round to 1 decimal if needed, otherwise show as integer
            currentDisplay = value % 1 === 0 ? Math.round(value) : value.toFixed(1);
        } else {
            currentDisplay = 'N/A';
        }
        
        if (target !== null && !isNaN(target)) {
            // Round to 1 decimal if needed, otherwise show as integer
            targetDisplay = target % 1 === 0 ? Math.round(target) : target.toFixed(1);
        } else {
            targetDisplay = 'N/A';
        }
        
        // Create tooltip with metric details
        const metricNameDisplay = metricName && metricName !== 'N/A' ? metricName : 'Not defined';
        const tooltip = `${label} Metric: ${metricNameDisplay}\nCurrent: ${currentDisplay} | Target: ${targetDisplay}`;
        
        return `
            <div class="metric-badge ${statusClass}" title="${tooltip}">
                <span class="metric-label">${label}:</span>
                <span class="metric-values">
                    <span class="metric-current">${currentDisplay}</span>
                    <span class="metric-separator">/</span>
                    <span class="metric-target">${targetDisplay}</span>
                </span>
                <span class="metric-icon">${icon}</span>
            </div>
        `;
    }
    
    /**
     * Get automation status information
     * FIXED: Now requires 12 months of valid data for "Automated" status
     * 
     * Classification logic:
     * - Automated: Both UX and BI have 12 months of valid data
     * - Partial: At least one metric has some data, but not 12 months on both
     * - Manual: No data or insufficient data on both metrics
     */
    function getAutomationInfo(product) {
        /**
         * Helper: Count valid data points in monthly array
         * Valid = non-empty, non-zero, numeric value
         */
        const countValidMonths = (monthlyArray) => {
            if (!monthlyArray || !Array.isArray(monthlyArray)) {
                return 0;
            }
            return monthlyArray.filter(val => {
                // Must be non-empty and non-zero
                if (!val || val === '' || val === '0' || val === 'N/A' || val === '-') {
                    return false;
                }
                // Must be a valid number
                const num = parseFloat(val);
                return !isNaN(num) && num !== 0;
            }).length;
        };
        
        const uxValidMonths = countValidMonths(product.monthlyUX);
        const biValidMonths = countValidMonths(product.monthlyBI);
        
        // AUTOMATED: Both metrics have 12 months of valid data
        const isUXAutomated = uxValidMonths === 12;
        const isBIAutomated = biValidMonths === 12;
        
        if (isUXAutomated && isBIAutomated) {
            return {
                icon: '✓',
                text: 'Automated',
                class: 'automation-automated'
            };
        }
        
        // PARTIAL: At least one metric has some data (but not 12 months on both)
        const hasAnyUXData = uxValidMonths > 0;
        const hasAnyBIData = biValidMonths > 0;
        
        if (hasAnyUXData || hasAnyBIData) {
            return {
                icon: '⚙',
                text: 'Partial',
                class: 'automation-partial'
            };
        }
        
        // MANUAL: No data on either metric
        return {
            icon: '○',
            text: 'Manual',
            class: 'automation-manual'
        };
    }
    
    /**
     * Legacy function - now redirects to selectJourneyStage
     * Maintained for backward compatibility
     * @deprecated Use selectJourneyStage instead
     */
    function toggleArea(journey) {
        console.warn('toggleArea is deprecated. Use selectJourneyStage instead.');
        selectJourneyStage(journey);
    }
    
    /**
     * Legacy function - now selects first journey with results
     * Maintained for backward compatibility
     * @deprecated No longer needed with horizontal navigation
     */
    function expandAreas(journeys) {
        console.warn('expandAreas is deprecated with horizontal navigation.');
        if (Array.isArray(journeys) && journeys.length > 0) {
            selectJourneyStage(journeys[0]);
        }
    }
    
    /**
     * Legacy function - maintained for compatibility
     * @deprecated No longer needed with horizontal navigation
     */
    function collapseAllAreas() {
        console.warn('collapseAllAreas is deprecated with horizontal navigation.');
        // No-op: Single stage always visible
    }
    
    /**
     * Generate metric indicator HTML
     */
    function getMetricIndicator(label, status, metricName, value, target) {
        let icon, tooltip, statusClass;
        
        switch (status) {
            case 'green':
                icon = '🟢';
                statusClass = 'metric-green';
                tooltip = `${label}: ${metricName}\nCurrent: ${value !== null ? value.toFixed(1) : 'N/A'} | Target: ${target !== null ? target.toFixed(1) : 'N/A'}\n✓ Meeting target`;
                break;
            case 'red':
                icon = '🔴';
                statusClass = 'metric-red';
                tooltip = `${label}: ${metricName}\nCurrent: ${value !== null ? value.toFixed(1) : 'N/A'} | Target: ${target !== null ? target.toFixed(1) : 'N/A'}\n✗ Below target`;
                break;
            case 'gray':
            default:
                icon = '⚪';
                statusClass = 'metric-gray';
                tooltip = `${label}: ${metricName === 'N/A' ? 'Not defined' : 'No data available'}`;
                break;
        }
        
        return `
            <div class="metric-indicator ${statusClass}" title="${tooltip}">
                <span class="metric-icon">${icon}</span>
                <span class="metric-label-text">${label}</span>
            </div>
        `;
    }
    
    /**
     * Update inline metrics display (Premium Header Redesign v8.4.0)
     * Updated to use filtered data for consistency with dynamic updates
     * Defensive: checks if elements exist before updating (handles cached old HTML)
     */
    function updateInlineMetrics() {
        const contentHeader = document.getElementById('content-header');
        if (!contentHeader) {
            console.warn('Content header not found');
            return;
        }
        contentHeader.style.display = 'flex';

        // Use filtered data (ensures consistency with dynamic updates)
        const filteredData = window.DataManager.getFilteredData();
        const metrics = window.DataManager.calculateFilteredSummaryMetrics(filteredData);
        
        // Update inline metric values
        const inlineTotal = document.getElementById('inline-total');
        const inlineUX = document.getElementById('inline-ux');
        const inlineBI = document.getElementById('inline-bi');
        
        if (inlineTotal) inlineTotal.textContent = metrics.total;
        if (inlineUX) inlineUX.textContent = metrics.missingUX;
        if (inlineBI) inlineBI.textContent = metrics.missingBI;
    }
    
    /**
     * Legacy function name for backwards compatibility
     * @deprecated Use updateInlineMetrics() instead
     */
    function updateStats() {
        updateInlineMetrics();
    }
    
    /**
     * Update last fetch time display
     */
    function updateLastUpdateDisplay() {
        const lastUpdate = window.DataManager.getLastUpdateTime();
        if (lastUpdate) {
            document.getElementById('last-update').textContent = `Last updated: ${lastUpdate.toLocaleString()}`;
        }
    }
    
    /**
     * Clear visual active state from inline metric pills
     * Called when filters are cleared to sync visual state
     */
    function clearInlineMetricsActiveState() {
        const uxWrapper = document.getElementById('inline-ux-wrapper');
        const biWrapper = document.getElementById('inline-bi-wrapper');
        
        if (uxWrapper) uxWrapper.classList.remove('metric-active');
        if (biWrapper) biWrapper.classList.remove('metric-active');
        
        console.log('🧹 Cleared inline metrics visual state');
    }
    
    /**
     * Setup click handlers for inline warning metrics
     * Allows users to click on UX/BI warning metrics to filter results
     * Connected to data quality filtering system (v8.4.0)
     */
    function setupInlineMetricsListeners() {
        const uxWrapper = document.getElementById('inline-ux-wrapper');
        const biWrapper = document.getElementById('inline-bi-wrapper');
        
        if (uxWrapper) {
            uxWrapper.addEventListener('click', () => {
                console.log('🎯 UX metric clicked - toggling missing UX metrics filter');
                
                if (window.UIManager && window.UIManager.Filters && window.UIManager.Filters.toggleNotUpdatedFilter) {
                    // Toggle the filter (same as old stat card behavior)
                    window.UIManager.Filters.toggleNotUpdatedFilter('UX');
                    
                    // Update visual state based on active filter
                    const activeFilter = window.UIManager.Filters.getActiveNotUpdatedFilter();
                    if (activeFilter === 'UX') {
                        uxWrapper.classList.add('metric-active');
                        if (biWrapper) biWrapper.classList.remove('metric-active');
                    } else {
                        uxWrapper.classList.remove('metric-active');
                    }
                } else {
                    console.error('UIManager.Filters.toggleNotUpdatedFilter not available');
                }
            });
        }
        
        if (biWrapper) {
            biWrapper.addEventListener('click', () => {
                console.log('🎯 BI metric clicked - toggling missing BI metrics filter');
                
                if (window.UIManager && window.UIManager.Filters && window.UIManager.Filters.toggleNotUpdatedFilter) {
                    // Toggle the filter (same as old stat card behavior)
                    window.UIManager.Filters.toggleNotUpdatedFilter('BI');
                    
                    // Update visual state based on active filter
                    const activeFilter = window.UIManager.Filters.getActiveNotUpdatedFilter();
                    if (activeFilter === 'BI') {
                        biWrapper.classList.add('metric-active');
                        if (uxWrapper) uxWrapper.classList.remove('metric-active');
                    } else {
                        biWrapper.classList.remove('metric-active');
                    }
                } else {
                    console.error('UIManager.Filters.toggleNotUpdatedFilter not available');
                }
            });
        }
        
        console.log('✅ Inline metrics click listeners connected to data quality filtering');
    }
    
    // ==================== ALERT TOOLTIP FUNCTIONALITY ====================
    
    // Store active tooltip reference for cleanup
    let activeTooltip = null;
    let activeTooltipBadge = null;
    
    /**
     * Create and show alert tooltip for a smoke detector badge
     * Displays specific alert triggers with <100ms target performance
     * 
     * @param {HTMLElement} badge - The smoke detector badge element
     * @param {Array} triggers - Array of trigger objects from calculateSmokeDetectors()
     * @param {string} severity - Alert severity ('warning' or 'critical')
     * @param {number} productId - Product ID for analytics
     */
    function showAlertTooltip(badge, triggers, severity, productId) {
        // Hide any existing tooltip first
        hideAlertTooltip();
        
        // Performance: Start timing
        const perfStart = performance.now();
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'alert-tooltip position-below';
        tooltip.setAttribute('role', 'tooltip');
        
        // Build tooltip content
        const icon = severity === 'critical' ? '🔥' : '⚠️';
        const title = severity === 'critical' ? 'Critical Alerts' : 'Attention Required';
        
        const triggersHtml = triggers.map(trigger => {
            const cssClass = trigger.severity === 'critical' ? 'critical' : '';
            return `<li class="alert-tooltip-trigger-item ${cssClass}">${window.Utils.escapeHtml(trigger.message)}</li>`;
        }).join('');
        
        tooltip.innerHTML = `
            <div class="alert-tooltip-header">
                <span class="alert-tooltip-icon">${icon}</span>
                <h4 class="alert-tooltip-title">${title}</h4>
            </div>
            <ul class="alert-tooltip-triggers">
                ${triggersHtml}
            </ul>
        `;
        
        // Add to DOM (initially hidden via CSS)
        document.body.appendChild(tooltip);
        
        // Position tooltip relative to badge
        positionTooltip(tooltip, badge);
        
        // Show tooltip with animation
        requestAnimationFrame(() => {
            tooltip.classList.add('visible');
        });
        
        // Store references for cleanup
        activeTooltip = tooltip;
        activeTooltipBadge = badge;
        
        // Log analytics event (AC 1.4)
        if (window.UIManager && window.UIManager.Analytics) {
            window.UIManager.Analytics.logAlertContextHovered(severity, productId);
        }
        
        // Performance: Log timing
        const perfEnd = performance.now();
        const duration = perfEnd - perfStart;
        if (duration > 100) {
            console.warn(`⚠️ Tooltip display exceeded 100ms target: ${duration.toFixed(2)}ms`);
        }
    }
    
    /**
     * Position tooltip relative to badge with smart viewport detection
     * @param {HTMLElement} tooltip - Tooltip element
     * @param {HTMLElement} badge - Badge element
     */
    function positionTooltip(tooltip, badge) {
        const badgeRect = badge.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Calculate position (default: below badge, aligned to right)
        let top = badgeRect.bottom + 8;
        let left = badgeRect.right - tooltipRect.width;
        
        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust horizontal position if needed
        if (left < 8) {
            left = 8;
        } else if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8;
        }
        
        // Check if tooltip would overflow bottom of viewport
        if (top + tooltipRect.height > viewportHeight - 8) {
            // Position above badge instead
            top = badgeRect.top - tooltipRect.height - 8;
            tooltip.classList.remove('position-below');
            tooltip.classList.add('position-above');
        }
        
        // Apply position
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
    
    /**
     * Hide and remove active tooltip
     */
    function hideAlertTooltip() {
        if (activeTooltip) {
            activeTooltip.classList.remove('visible');
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (activeTooltip && activeTooltip.parentNode) {
                    activeTooltip.parentNode.removeChild(activeTooltip);
                }
                activeTooltip = null;
                activeTooltipBadge = null;
            }, 100);
        }
    }
    
    /**
     * Setup event listeners for alert tooltip functionality
     * Called once when cards are first rendered
     */
    function setupAlertTooltipListeners() {
        // Use event delegation for better performance
        const container = document.getElementById('cards-container');
        if (!container) return;
        
        // Mouse enter on badge
        container.addEventListener('mouseenter', (e) => {
            const badge = e.target.closest('.smoke-detector-badge');
            if (!badge) return;
            
            try {
                const triggers = JSON.parse(badge.getAttribute('data-alert-triggers'));
                const severity = badge.getAttribute('data-alert-severity');
                const productId = parseInt(badge.getAttribute('data-product-id'), 10);
                
                if (triggers && triggers.length > 0) {
                    showAlertTooltip(badge, triggers, severity, productId);
                }
            } catch (error) {
                console.error('Failed to show alert tooltip:', error);
            }
        }, true); // Use capture phase for delegation
        
        // Mouse leave on badge
        container.addEventListener('mouseleave', (e) => {
            const badge = e.target.closest('.smoke-detector-badge');
            if (badge && badge === activeTooltipBadge) {
                hideAlertTooltip();
            }
        }, true);
        
        // Keyboard focus on badge (accessibility)
        container.addEventListener('focus', (e) => {
            const badge = e.target.closest('.smoke-detector-badge');
            if (!badge) return;
            
            try {
                const triggers = JSON.parse(badge.getAttribute('data-alert-triggers'));
                const severity = badge.getAttribute('data-alert-severity');
                const productId = parseInt(badge.getAttribute('data-product-id'), 10);
                
                if (triggers && triggers.length > 0) {
                    showAlertTooltip(badge, triggers, severity, productId);
                }
            } catch (error) {
                console.error('Failed to show alert tooltip on focus:', error);
            }
        }, true);
        
        // Keyboard blur on badge
        container.addEventListener('blur', (e) => {
            const badge = e.target.closest('.smoke-detector-badge');
            if (badge && badge === activeTooltipBadge) {
                hideAlertTooltip();
            }
        }, true);
        
        // Hide tooltip when scrolling (better UX)
        window.addEventListener('scroll', hideAlertTooltip, { passive: true });
        
        console.log('✅ Alert tooltip event listeners attached');
    }
    
    /**
     * Update summary cards based on filtered data (real-time updates)
     * Subscribes to 'filters:changed' event via pub/sub pattern
     * 
     * This function is called automatically whenever filters are applied/removed,
     * ensuring summary cards always reflect the current filtered subset.
     * 
     * @param {Object} eventData - Event data from filters:changed event
     * @param {Array} eventData.filteredData - Current filtered dataset
     * @param {Object} eventData.filterContext - Filter metadata (counts, active filters)
     * 
     * @performance Target: <50ms DOM update time (part of overall <200ms requirement)
     * @complexity O(1) for DOM updates + O(n) for metric calculation
     * 
     * @example
     * // Called automatically via event subscription:
     * window.Utils.publish('filters:changed', { filteredData: [...] });
     */
    function updateFilteredSummaryCards(eventData) {
        // Performance instrumentation: Start timer
        const perfStart = performance.now();
        
        try {
            // Extract filtered data from event
            const filteredData = eventData?.filteredData || [];
            
            // Performance: Calculate all metrics in single pass
            const metrics = window.DataManager.calculateFilteredSummaryMetrics(filteredData);
            
            // Performance: Batch DOM reads before writes (prevent layout thrashing)
            // Use getElementById (fastest native API) and textContent (faster than innerHTML)
            const statTotal = document.getElementById('stat-total');
            const statMissingUX = document.getElementById('stat-missing-ux');
            const statMissingBI = document.getElementById('stat-missing-bi');
            
            // Defensive: Check if elements exist before updating
            if (statTotal) {
                statTotal.textContent = metrics.total;
            } else {
                console.warn('stat-total element not found in DOM');
            }
            
            if (statMissingUX) {
                statMissingUX.textContent = metrics.missingUX;
            } else {
                console.warn('stat-missing-ux element not found in DOM');
            }
            
            if (statMissingBI) {
                statMissingBI.textContent = metrics.missingBI;
            } else {
                console.warn('stat-missing-bi element not found in DOM');
            }
            
            // Performance instrumentation: End timer and log results
            const perfEnd = performance.now();
            const duration = (perfEnd - perfStart).toFixed(2);
            console.log(`⚡ Summary cards updated in ${duration}ms (${metrics.total} products)`);
            
            // Performance warning if threshold exceeded
            if (perfEnd - perfStart > 200) {
                console.warn(`⚠️ Summary card update exceeded 200ms threshold: ${duration}ms`);
            }
            
        } catch (error) {
            console.error('Failed to update filtered summary cards:', error);
            // Graceful degradation: Don't break the app on error
        }
    }
    
    // Export to window.UIManager.Cards namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Cards = {
        render: renderCards,
        renderJourneyNavigation,  // NEW: Horizontal journey navigation
        selectJourneyStage,  // NEW: Select active journey stage
        updateStats,  // Legacy - calls updateInlineMetrics
        updateInlineMetrics,  // NEW: Premium header redesign v8.4.0
        setupInlineMetricsListeners,  // NEW: Setup click handlers for warning metrics
        clearInlineMetricsActiveState,  // NEW: Clear visual state when filters cleared
        updateLastUpdateDisplay,
        updateFilteredSummaryCards,  // NEW: Real-time summary card updates
        toggleArea,  // DEPRECATED: Legacy compatibility
        expandAreas,  // DEPRECATED: Legacy compatibility
        collapseAllAreas,  // DEPRECATED: Legacy compatibility
        invalidateCache  // Export for external cache invalidation
    };
    
    // Subscribe to filter changes for real-time summary card updates
    // This ensures cards dynamically reflect the current filtered subset
    window.Utils.subscribe('filters:changed', updateFilteredSummaryCards);
    console.log('✅ Summary cards subscribed to filters:changed event');
    
    // Subscribe to data:filtered event from facade API for automatic re-rendering
    // This event is emitted by DataManager.filterData() facade method
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, (data) => {
        console.log(`📡 ui-cards received data:filtered event (${data.count} items)`);
        
        // Invalidate cache to force re-grouping with new data
        invalidateCache();
        
        // Re-render cards with new filtered data
        renderCards();
        
        // Update inline metrics
        updateInlineMetrics();
        
        // Update journey navigation
        renderJourneyNavigation();
    });
    console.log('✅ UI Cards subscribed to data:filtered event (event-driven architecture)');
    
    // Subscribe to data:loaded event for initial render
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, (data) => {
        console.log(`📡 ui-cards received data:loaded event (${data.portfolioData.length} items)`);
        
        // Invalidate cache when new data loads
        invalidateCache();
        
        // Initial render will be triggered by the app orchestrator
        // This subscription is for future automatic updates
    });
    console.log('✅ UI Cards subscribed to data:loaded event');
    
    console.log('✅ UI Cards module loaded (EVENT-DRIVEN + HORIZONTAL JOURNEY NAVIGATION)');
})();

