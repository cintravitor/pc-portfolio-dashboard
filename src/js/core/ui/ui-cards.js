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
    
    // Private state
    const expandedSections = new Set();
    
    // Performance optimization: Cache grouped data
    let cachedFilteredData = null;
    let cachedGroupedData = null;
    
    // Track if tooltip listeners have been set up
    let tooltipListenersInitialized = false;
    
    /**
     * Get grouped data with memoization for performance
     * @returns {Object} { groupedByArea, sortedAreas }
     */
    function getGroupedData() {
        const filteredData = window.DataManager.getFilteredData();
        
        // Cache hit - return cached data (massive performance boost)
        if (filteredData === cachedFilteredData && cachedGroupedData) {
            return cachedGroupedData;
        }
        
        // Cache miss - recompute grouping
        const groupedByArea = {};
        filteredData.forEach(product => {
            const area = product.area || 'Uncategorized';
            if (!groupedByArea[area]) {
                groupedByArea[area] = [];
            }
            groupedByArea[area].push(product);
        });
        
        // Sort areas alphabetically
        const sortedAreas = Object.keys(groupedByArea).sort();
        
        // Update cache
        cachedFilteredData = filteredData;
        cachedGroupedData = { groupedByArea, sortedAreas };
        
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
     * Render product cards grouped by P&C Area with collapsible sections
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
            return;
        }

        emptyState.classList.add('hidden');
        container.classList.remove('hidden');

        // Get grouped data (from cache if possible)
        const { groupedByArea, sortedAreas } = getGroupedData();

        // Render collapsible sections
        container.innerHTML = sortedAreas.map(area => {
            const products = groupedByArea[area];
            const isExpanded = expandedSections.has(area);
            
            // Generate cards HTML for this area
            const cardsHtml = products.map(product => {
                const summary = window.DataManager.getCardSummaryMetrics(product);
                
                // Calculate smoke detector alerts for this product (returns {count, triggers})
                const alertData = window.DataManager.calculateSmokeDetectors(product);
                const smokeDetectorBadge = getSmokeDetectorBadge(product.id, alertData);
                
                // Generate metric badges with actual values
                const uxBadge = getMetricBadgeWithValues('UX', summary.uxStatus, summary.uxValue, summary.uxTarget, summary.uxMetric);
                const biBadge = getMetricBadgeWithValues('BI', summary.biStatus, summary.biValue, summary.biTarget, summary.biMetric);
                
                return `
                <div class="product-card product-card-compact fade-in" data-product-id="${product.id}">
                    ${smokeDetectorBadge}
                    
                    <div class="card-header-compact">
                        <div class="card-title-compact">
                            ${window.Utils.escapeHtml(product.name)}
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
                            <span class="ai-attribution">powered by OpenAI</span>
                        </div>
                        
                        <div class="card-metrics-new">
                            ${uxBadge}
                            ${biBadge}
                        </div>
                    </div>
                </div>
                `;
            }).join('');
            
            // SECURITY: Use data-area attribute instead of inline onclick
            return `
            <div class="area-section" data-area="${window.Utils.escapeHtml(area)}">
                <div class="area-header">
                    <div class="area-header-content">
                        <span class="area-toggle-icon">${isExpanded ? '−' : '+'}</span>
                        <h3 class="area-title">${window.Utils.escapeHtml(area)}</h3>
                        <span class="area-count">(${products.length})</span>
                    </div>
                </div>
                <div class="area-cards ${isExpanded ? 'expanded' : 'collapsed'}">
                    ${cardsHtml}
                </div>
            </div>
            `;
        }).join('');
        
        // Set up event delegation for toggle clicks (better than inline onclick)
        setupAreaToggleListeners(container);
        
        // Set up alert tooltip listeners (only once)
        if (!tooltipListenersInitialized) {
            setupAlertTooltipListeners();
            tooltipListenersInitialized = true;
        }
    }
    
    /**
     * Set up event delegation for area toggle clicks
     * More efficient and secure than inline onclick
     */
    function setupAreaToggleListeners(container) {
        // Remove old listener if exists
        const oldListener = container._areaToggleListener;
        if (oldListener) {
            container.removeEventListener('click', oldListener);
        }
        
        // Create new listener
        const newListener = function(event) {
            const header = event.target.closest('.area-header');
            if (!header) return;
            
            const section = header.closest('.area-section');
            if (!section) return;
            
            const area = section.dataset.area;
            if (area) {
                toggleArea(area);
            }
        };
        
        container.addEventListener('click', newListener);
        container._areaToggleListener = newListener; // Store for cleanup
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
     * Toggle area section expansion
     * @param {string} area - Area name to toggle
     */
    function toggleArea(area) {
        try {
            if (!area) {
                console.warn('toggleArea called with empty area');
                return;
            }
            
            if (expandedSections.has(area)) {
                expandedSections.delete(area);
            } else {
                expandedSections.add(area);
            }
            
            // Don't invalidate cache - grouping hasn't changed
            renderCards();
        } catch (error) {
            console.error('Failed to toggle area:', area, error);
        }
    }
    
    /**
     * Expand specific areas (used by filtering)
     * @param {Array<string>} areas - Array of area names to expand
     */
    function expandAreas(areas) {
        try {
            if (!Array.isArray(areas)) {
                console.warn('expandAreas called with non-array:', areas);
                return;
            }
            
            areas.forEach(area => {
                if (area) {
                    expandedSections.add(area);
                }
            });
            
            renderCards();
        } catch (error) {
            console.error('Failed to expand areas:', error);
        }
    }
    
    /**
     * Collapse all areas
     */
    function collapseAllAreas() {
        try {
            expandedSections.clear();
            renderCards();
        } catch (error) {
            console.error('Failed to collapse all areas:', error);
        }
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
     * Update statistics display
     * Updated to use filtered data for consistency with dynamic updates
     * Defensive: checks if elements exist before updating (handles cached old HTML)
     */
    function updateStats() {
        const statsBar = document.getElementById('stats-bar');
        if (!statsBar) {
            console.warn('Stats bar not found');
            return;
        }
        statsBar.style.display = 'flex';

        // Use filtered data (ensures consistency with dynamic updates)
        const filteredData = window.DataManager.getFilteredData();
        const metrics = window.DataManager.calculateFilteredSummaryMetrics(filteredData);
        
        // Safely update stats if elements exist
        const statTotal = document.getElementById('stat-total');
        if (statTotal) statTotal.textContent = metrics.total;
        
        // Update data quality cards
        const statMissingUX = document.getElementById('stat-missing-ux');
        const statMissingBI = document.getElementById('stat-missing-bi');
        
        if (statMissingUX) statMissingUX.textContent = metrics.missingUX;
        if (statMissingBI) statMissingBI.textContent = metrics.missingBI;
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
        updateStats,
        updateLastUpdateDisplay,
        updateFilteredSummaryCards,  // NEW: Real-time summary card updates
        toggleArea,
        expandAreas,
        collapseAllAreas,
        invalidateCache  // Export for external cache invalidation
    };
    
    // Subscribe to filter changes for real-time summary card updates
    // This ensures cards dynamically reflect the current filtered subset
    window.Utils.subscribe('filters:changed', updateFilteredSummaryCards);
    console.log('✅ Summary cards subscribed to filters:changed event');
    
    console.log('✅ UI Cards module loaded (OPTIMIZED)');
})();

