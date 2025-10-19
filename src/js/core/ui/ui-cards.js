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
                
                // Calculate smoke detector count for this product
                const smokeCount = window.DataManager.calculateSmokeDetectors(product);
                const smokeDetectorBadge = getSmokeDetectorBadge(smokeCount);
                
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
                        <span class="status-badge-compact ${window.Utils.getStatusClass(summary.maturity)}">
                            ${window.Utils.escapeHtml(summary.maturity)}
                        </span>
                    </div>
                    
                    <div class="card-body-compact">
                        <div class="card-owner">
                            <span class="owner-icon">👤</span>
                            <span class="owner-name">${window.Utils.truncateText(window.Utils.escapeHtml(summary.owner), 30)}</span>
                        </div>
                        
                        <div class="card-problem-extended">
                            ${window.Utils.truncateText(window.Utils.escapeHtml(summary.problem), 120)}
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
     * Generate smoke detector badge HTML
     * Shows warning badge in top-right corner of card when detectors are triggered
     * @param {number} count - Number of smoke detectors triggered (0-4)
     * @returns {string} HTML for smoke detector badge, or empty string if count is 0
     */
    function getSmokeDetectorBadge(count) {
        if (!count || count === 0) return '';
        
        const icon = count >= 3 ? '🔥' : '⚠️';
        const severity = count >= 3 ? 'critical' : 'warning';
        const tooltip = `${count} smoke detector${count > 1 ? 's' : ''} triggered - Click card for details`;
        
        return `
            <div class="smoke-detector-badge smoke-${severity}" title="${tooltip}">
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
        
        // Format values for display
        const currentDisplay = value !== null && !isNaN(value) ? Math.round(value) : 'N/A';
        const targetDisplay = target !== null && !isNaN(target) ? Math.round(target) : 'N/A';
        
        // Create tooltip with metric details
        const tooltip = `${label}: ${metricName}\nCurrent: ${currentDisplay} | Target: ${targetDisplay}`;
        
        return `
            <div class="metric-badge ${statusClass}" title="${tooltip}">
                <span class="metric-label">${label}</span>
                <span class="metric-current">${currentDisplay}</span>
                <span class="metric-separator">/</span>
                <span class="metric-target">${targetDisplay}</span>
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
     * Defensive: checks if elements exist before updating (handles cached old HTML)
     */
    function updateStats() {
        const statsBar = document.getElementById('stats-bar');
        if (!statsBar) {
            console.warn('Stats bar not found');
            return;
        }
        statsBar.style.display = 'flex';

        const stats = window.DataManager.getProductStats();
        const missingMetrics = window.DataManager.countMissingMetrics();
        
        // Safely update stats if elements exist
        const statTotal = document.getElementById('stat-total');
        if (statTotal) statTotal.textContent = stats.total;
        
        // Update data quality cards
        const statMissingUX = document.getElementById('stat-missing-ux');
        const statMissingBI = document.getElementById('stat-missing-bi');
        
        if (statMissingUX) statMissingUX.textContent = missingMetrics.missingUX;
        if (statMissingBI) statMissingBI.textContent = missingMetrics.missingBI;
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
    
    // Export to window.UIManager.Cards namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Cards = {
        render: renderCards,
        updateStats,
        updateLastUpdateDisplay,
        toggleArea,
        expandAreas,
        collapseAllAreas,
        invalidateCache  // Export for external cache invalidation
    };
    
    console.log('✅ UI Cards module loaded (OPTIMIZED)');
})();

