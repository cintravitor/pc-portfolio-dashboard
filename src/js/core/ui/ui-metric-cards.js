/**
 * UI Metric Cards Module
 * Isolated, self-contained module for rendering UX/BI metric cards in the Solution Detail Modal
 * 
 * Architecture:
 * - IIFE pattern for strict encapsulation
 * - Explicit data dependencies (no implicit globals)
 * - No DOM manipulation outside of provided container
 * - Event-driven communication via window.Utils
 * 
 * @module ui-metric-cards
 * @requires window.Utils - For HTML escaping and event publishing
 * @requires window.AIRecommendations - For AI-powered recommendations (optional)
 * @requires window.CONFIG - For AI feature flag
 */

(function() {
    'use strict';
    
    /**
     * Calculate performance status based on last month's data
     * @param {Array} monthlyData - Monthly actual values
     * @param {Array|number} targetData - Monthly target values (can be array or single value)
     * @returns {Object} { status: 'above'|'below'|'neutral', actual: number, target: number }
     */
    function calculateLastMonthPerformance(monthlyData, targetData) {
        if (!Array.isArray(monthlyData)) {
            return { status: 'neutral', actual: null, target: null };
        }
        
        // Parse target - can be a single value or an array
        let targetValue = null;
        if (Array.isArray(targetData) && targetData.length > 0) {
            // Use first valid target value from array
            for (let val of targetData) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed) && parsed > 0) {
                    targetValue = parsed;
                    break;
                }
            }
        } else if (targetData !== null && targetData !== undefined && targetData !== '' && targetData !== '-') {
            targetValue = parseFloat(targetData);
            if (isNaN(targetValue)) targetValue = null;
        }
        
        // Find the last valid actual data point
        for (let i = monthlyData.length - 1; i >= 0; i--) {
            const val = monthlyData[i];
            if (val === null || val === undefined || val === '' || val === '-' || val === 'N/A') continue;
            
            const actual = parseFloat(val);
            if (!isNaN(actual) && actual >= 0) {
                // If no target, just show the value
                if (targetValue === null || targetValue <= 0) {
                    return { status: 'neutral', actual, target: null };
                }
                
                const status = actual >= targetValue ? 'above' : 'below';
                return { status, actual, target: targetValue };
            }
        }
        
        return { status: 'neutral', actual: null, target: null };
    }
    
    /**
     * Generate performance indicator HTML badge
     * @param {Object} performance - { status, actual, target }
     * @returns {string} HTML string for performance indicator
     */
    function generatePerformanceIndicator(performance) {
        const { status, actual, target } = performance;
        
        if (status === 'neutral' || actual === null || target === null) {
            return `
                <div class="metric-performance-indicator neutral">
                    <span>○</span>
                    <span>No Recent Data</span>
                </div>
            `;
        }
        
        const percentage = Math.round((actual / target) * 100);
        const diff = Math.abs(percentage - 100);
        
        if (status === 'above') {
            return `
                <div class="metric-performance-indicator above">
                    <span>✓</span>
                    <span>Last Month: ${percentage}% of Target (+${diff}%)</span>
                </div>
            `;
        } else {
            return `
                <div class="metric-performance-indicator below">
                    <span>⚠</span>
                    <span>Last Month: ${percentage}% of Target (-${diff}%)</span>
                </div>
            `;
        }
    }
    
    /**
     * Generate rule-based recommendation (fallback when AI unavailable)
     * @param {Array} monthlyData - Monthly actual values
     * @param {Array} targetData - Monthly target values
     * @param {string} metricType - 'UX' or 'BI'
     * @returns {string} HTML string with recommendation
     */
    function generateRuleBasedRecommendation(monthlyData, targetData, metricType) {
        // Check if we have data
        if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
            return `
                <div class="automation-recommendation info">
                    <div class="recommendation-icon">📊</div>
                    <div class="recommendation-text">No data available for this metric. Establish baseline measurements to track ${metricType === 'UX' ? 'user experience' : 'business impact'}.</div>
                </div>
            `;
        }
        
        // Check if target data exists at all
        const hasTargetArray = Array.isArray(targetData) && targetData.length > 0;
        let hasAnyValidTarget = false;
        
        if (hasTargetArray) {
            // Check if there's at least one valid target value
            for (let i = 0; i < targetData.length; i++) {
                const targetVal = targetData[i];
                if (targetVal && targetVal !== '' && targetVal !== 'N/A' && targetVal !== '-' && !isNaN(parseFloat(targetVal))) {
                    hasAnyValidTarget = true;
                    break;
                }
            }
        }
        
        // Count valid data points and analyze performance
        let validDataPoints = 0;
        let belowTargetCount = 0;
        let aboveTargetCount = 0;
        
        for (let i = 0; i < monthlyData.length; i++) {
            const actualVal = monthlyData[i];
            const targetVal = targetData && targetData[i] ? targetData[i] : null;
            
            if (actualVal && actualVal !== '' && actualVal !== 'N/A' && actualVal !== '-') {
                validDataPoints++;
                
                if (targetVal && targetVal !== '' && targetVal !== 'N/A' && targetVal !== '-') {
                    const actual = parseFloat(actualVal);
                    const target = parseFloat(targetVal);
                    
                    if (!isNaN(actual) && !isNaN(target)) {
                        if (actual < target) {
                            belowTargetCount++;
                        } else if (actual >= target) {
                            aboveTargetCount++;
                        }
                    }
                }
            }
        }
        
        // No valid data points
        if (validDataPoints === 0) {
            return `
                <div class="automation-recommendation info">
                    <div class="recommendation-icon">📊</div>
                    <div class="recommendation-text">No data available for this metric. Establish baseline measurements to track ${metricType === 'UX' ? 'user experience' : 'business impact'}.</div>
                </div>
            `;
        }
        
        // Has data but no valid targets at all
        if (!hasAnyValidTarget) {
            return `
                <div class="automation-recommendation info">
                    <div class="recommendation-icon">🎯</div>
                    <div class="recommendation-text">Data is being tracked. Consider setting target values to measure performance against goals.</div>
                </div>
            `;
        }
        
        // Has targets but no successful comparisons (e.g., data and targets don't align)
        const totalComparisons = belowTargetCount + aboveTargetCount;
        
        if (totalComparisons === 0) {
            return `
                <div class="automation-recommendation info">
                    <div class="recommendation-icon">📊</div>
                    <div class="recommendation-text">Metric data is available, but performance comparison is limited. Ensure actual and target values align for the same time periods.</div>
                </div>
            `;
        }
        
        // Calculate performance ratio
        const belowTargetRatio = belowTargetCount / totalComparisons;
        
        if (belowTargetRatio >= 0.6) {
            // Consistently below target
            return `
                <div class="automation-recommendation warning">
                    <div class="recommendation-icon">⚠️</div>
                    <div class="recommendation-text">${metricType === 'UX' ? 'User experience' : 'Business impact'} metric is frequently below target. Consider improvement initiatives to address performance gaps.</div>
                </div>
            `;
        } else if (belowTargetRatio >= 0.3) {
            // Mixed performance
            return `
                <div class="automation-recommendation info">
                    <div class="recommendation-icon">📈</div>
                    <div class="recommendation-text">Performance is variable. Review months below target and identify patterns or opportunities for optimization.</div>
                </div>
            `;
        } else {
            // Meeting or exceeding target
            return `
                <div class="automation-recommendation success">
                    <div class="recommendation-icon">✅</div>
                    <div class="recommendation-text">Great work! ${metricType === 'UX' ? 'User experience' : 'Business impact'} metric is consistently meeting or exceeding target. Keep up the momentum.</div>
                </div>
            `;
        }
    }
    
    /**
     * Generate AI-powered recommendation for a metric
     * Falls back to rule-based if AI fails or is disabled
     * @param {Object} product - Full product object with context
     * @param {string} metricType - 'UX' or 'BI'
     * @param {Array} monthlyData - Monthly actual values
     * @param {Array} targetData - Monthly target values
     * @returns {Promise<string>} HTML string with recommendation
     */
    async function generateAIRecommendation(product, metricType, monthlyData, targetData) {
        // Try AI first if enabled and available
        if (window.CONFIG && window.CONFIG.AI_RECOMMENDATIONS_ENABLED && window.AIRecommendations) {
            try {
                console.log('[Metric Cards] Generating AI recommendation for', metricType);
                const aiText = await window.AIRecommendations.generate(product, metricType);
                
                // Return AI recommendation with subtle attribution
                return `
                    <div class="automation-recommendation ai-powered">
                        <div class="recommendation-text">
                            <span>${aiText}</span>
                            <span class="ai-attribution">🤖 Powered by OpenAI</span>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.warn('[Metric Cards] AI generation failed, falling back to rule-based:', error);
                // Fall through to rule-based
            }
        }
        
        // Fallback to rule-based recommendation
        return generateRuleBasedRecommendation(monthlyData, targetData, metricType);
    }
    
    /**
     * Render a single metric card into a container
     * @param {HTMLElement} container - DOM container to render into
     * @param {Object} product - Product data object
     * @param {string} metricType - 'UX' or 'BI'
     * @requires window.Utils.escapeHtml - For HTML sanitization
     * @requires window.UIManager.Charts.renderMetricChart - For chart rendering
     */
    function renderMetricCard(container, product, metricType) {
        if (!container) {
            console.error('[Metric Cards] Container element not provided');
            return;
        }
        
        if (!product) {
            console.error('[Metric Cards] Product data not provided');
            return;
        }
        
        // Determine metric-specific data
        const isUX = metricType === 'UX';
        const monthlyData = isUX ? product.monthlyUX : product.monthlyBI;
        const targetData = isUX ? product.targetUX : product.targetBI;
        const keyMetric = isUX ? product.keyMetricUX : product.keyMetricBI;
        const trackingFrequency = isUX ? product.trackingFrequencyUX : product.trackingFrequencyBI;
        const chartId = isUX ? 'chart-ux' : 'chart-bi';
        const recommendationId = isUX ? 'ux-recommendation' : 'bi-recommendation';
        
        // Calculate performance
        const performance = calculateLastMonthPerformance(monthlyData, targetData);
        
        // Determine status class
        let statusClass = '';
        if (performance.status === 'below') {
            statusClass = 'below-target';
        } else if (performance.status === 'above') {
            statusClass = 'above-target';
        }
        
        // Render card HTML
        container.innerHTML = `
            <div class="metric-card ${statusClass}">
                <div class="metric-card-title">${isUX ? 'User Experience' : 'Business Impact'}</div>
                ${generatePerformanceIndicator(performance)}
                <div class="detail-field">
                    <div class="detail-field-label">
                        ${window.Utils.escapeHtml(keyMetric) || 'Metric'}
                        ${trackingFrequency ? `<span class="metric-tracking-frequency">Tracked ${window.Utils.escapeHtml(trackingFrequency)}</span>` : ''}
                    </div>
                    <div class="chart-container">
                        <canvas id="${chartId}"></canvas>
                    </div>
                </div>
                <div id="${recommendationId}" class="recommendation-placeholder">
                    <div class="automation-recommendation info">
                        <div class="recommendation-icon">🤖</div>
                        <div class="recommendation-text">Generating AI recommendation...</div>
                    </div>
                </div>
            </div>
        `;
        
        // Render chart asynchronously
        setTimeout(() => {
            const canvas = document.getElementById(chartId);
            if (!canvas) {
                console.error('[Metric Cards] Chart canvas not found:', chartId);
                return;
            }
            
            if (!window.UIManager || !window.UIManager.Charts) {
                console.error('[Metric Cards] Charts module not available');
                return;
            }
            
            window.UIManager.Charts.loadChartJs()
                .then(() => {
                    window.UIManager.Charts.renderMetricChart(
                        chartId,
                        monthlyData,
                        targetData,
                        keyMetric || `${metricType} Metric`
                    );
                })
                .catch(error => {
                    console.error('[Metric Cards] Failed to load chart:', error);
                    if (canvas.parentElement) {
                        canvas.parentElement.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 2rem;">Failed to load chart. Please refresh.</p>';
                    }
                });
        }, 50);
        
        // Generate AI recommendation asynchronously
        generateAIRecommendation(product, metricType, monthlyData, targetData)
            .then(html => {
                const recommendationContainer = document.getElementById(recommendationId);
                if (recommendationContainer) {
                    recommendationContainer.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('[Metric Cards] Failed to generate recommendation:', error);
                const recommendationContainer = document.getElementById(recommendationId);
                if (recommendationContainer) {
                    recommendationContainer.innerHTML = generateRuleBasedRecommendation(monthlyData, targetData, metricType);
                }
            });
    }
    
    /**
     * Render both metric cards (UX and BI) into the metrics grid
     * @param {HTMLElement} metricsGridContainer - Container element for metrics grid
     * @param {Object} product - Product data object
     * @requires window.DataManager.getProductById - For fetching product data
     */
    function renderMetricsGrid(metricsGridContainer, product) {
        if (!metricsGridContainer) {
            console.error('[Metric Cards] Metrics grid container not provided');
            return;
        }
        
        if (!product) {
            console.error('[Metric Cards] Product data not provided');
            return;
        }
        
        // Create two card containers
        metricsGridContainer.innerHTML = `
            <div id="ux-card-container"></div>
            <div id="bi-card-container"></div>
        `;
        
        // Render both cards
        const uxContainer = document.getElementById('ux-card-container');
        const biContainer = document.getElementById('bi-card-container');
        
        if (uxContainer) {
            renderMetricCard(uxContainer, product, 'UX');
        }
        
        if (biContainer) {
            renderMetricCard(biContainer, product, 'BI');
        }
    }
    
    // Export to window.UIManager.MetricCards namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.MetricCards = {
        render: renderMetricCard,
        renderGrid: renderMetricsGrid,
        generatePerformanceIndicator: generatePerformanceIndicator
    };
    
    console.log('✅ UI Metric Cards module loaded (ISOLATED)');
})();

