/**
 * UI Detail Panel Module
 * Handles full-screen modal overlay for solution details with liquid glass styling
 * 
 * Features:
 * - Full-screen centered modal with backdrop blur
 * - Tab-based navigation (Metrics | Core Details)
 * - Single view at a time prevents overlap issues
 * - Smooth tab switching with animations
 * - Multiple close methods: X button, backdrop click, ESC key
 * 
 * Part of the modular UI architecture
 * @module ui-detail-panel
 */

(function() {
    'use strict';
    
    /**
     * Generate AI-powered recommendation for a metric
     * Falls back to rule-based if AI fails
     * @param {Object} product - Full product object with context
     * @param {string} metricType - 'UX' or 'BI'
     * @param {Array} monthlyData - Monthly actual values
     * @param {Array} targetData - Monthly target values
     * @returns {Promise<string>} HTML string with recommendation
     */
    async function generateAIRecommendation(product, metricType, monthlyData, targetData) {
        // Try AI first if enabled and available
        if (CONFIG.AI_RECOMMENDATIONS_ENABLED && window.AIRecommendations) {
            try {
                console.log('[Detail Panel] Generating AI recommendation for', metricType);
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
                console.warn('[Detail Panel] AI generation failed, falling back to rule-based:', error);
                // Fall through to rule-based
            }
        }
        
        // Fallback to rule-based recommendation
        return generateRuleBasedRecommendation(monthlyData, targetData, metricType);
    }
    
    /**
     * Generate rule-based recommendation (fallback)
     * Original logic preserved for when AI is unavailable
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
     * Calculate performance status based on last month's data
     * @param {Array} monthlyData - Monthly actual values
     * @param {Array} targetData - Monthly target values (can be array or single value)
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
     * Generate performance indicator HTML
     * @param {Object} performance - { status, actual, target }
     * @returns {string} HTML string
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
     * Generate metrics section HTML content
     * @param {Object} product - Product data
     * @returns {string} HTML string
     */
    function generateMetricsContent(product) {
        const uxPerformance = calculateLastMonthPerformance(product.monthlyUX, product.targetUX);
        const biPerformance = calculateLastMonthPerformance(product.monthlyBI, product.targetBI);
        
        return `
            <div class="metrics-grid">
                <div class="metric-card ${uxPerformance.status === 'below' ? 'below-target' : uxPerformance.status === 'above' ? 'above-target' : ''}">
                    <div class="metric-card-title">User Experience</div>
                    ${generatePerformanceIndicator(uxPerformance)}
                    <div class="detail-field">
                        <div class="detail-field-label">${window.Utils.escapeHtml(product.keyMetricUX) || 'Metric'}</div>
                        <div class="chart-container">
                            <canvas id="chart-ux"></canvas>
                        </div>
                    </div>
                    <div id="ux-recommendation" class="recommendation-placeholder">
                        <div class="automation-recommendation info">
                            <div class="recommendation-icon">🤖</div>
                            <div class="recommendation-text">Generating AI recommendation...</div>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card ${biPerformance.status === 'below' ? 'below-target' : biPerformance.status === 'above' ? 'above-target' : ''}">
                    <div class="metric-card-title">Business Impact</div>
                    ${generatePerformanceIndicator(biPerformance)}
                    <div class="detail-field">
                        <div class="detail-field-label">${window.Utils.escapeHtml(product.keyMetricBI) || 'Metric'}</div>
                        <div class="chart-container">
                            <canvas id="chart-bi"></canvas>
                        </div>
                    </div>
                    <div id="bi-recommendation" class="recommendation-placeholder">
                        <div class="automation-recommendation info">
                            <div class="recommendation-icon">🤖</div>
                            <div class="recommendation-text">Generating AI recommendation...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate core details section HTML content
     * @param {Object} product - Product data
     * @returns {string} HTML string
     */
    function generateCoreDetailsContent(product) {
        return `
            <div class="core-details-grid">
                <!-- Owner -->
                <div class="detail-field">
                    <div class="detail-field-label">Owner</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.owner) || 'Not assigned'}</div>
                </div>
                
                <!-- Maturity Stage -->
                <div class="detail-field">
                    <div class="detail-field-label">Maturity Stage</div>
                    <div class="detail-field-value">
                        <span class="status-badge ${window.Utils.getStatusClass(product.maturity)}">
                            ${window.Utils.escapeHtml(product.maturity) || 'Not specified'}
                        </span>
                    </div>
                </div>
                
                <!-- Target User -->
                ${product.targetUser ? `
                <div class="detail-field">
                    <div class="detail-field-label">Target User</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.targetUser)}</div>
                </div>
                ` : ''}
                
                <!-- Platform -->
                <div class="detail-field">
                    <div class="detail-field-label">Platform</div>
                    <div class="detail-field-value ${!product.platform ? 'empty' : ''}">
                        ${window.Utils.escapeHtml(product.platform) || 'Not specified'}
                    </div>
                </div>
                
                <!-- Journey Stage Impacted -->
                ${product.journeyMain ? `
                <div class="detail-field ${!product.targetUser && !product.regulatory ? 'full-width' : ''}">
                    <div class="detail-field-label">Journey Stage Impacted</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.journeyMain)}</div>
                </div>
                ` : ''}
                
                <!-- Regulatory Demand -->
                ${product.regulatory ? `
                <div class="detail-field ${!product.targetUser ? 'full-width' : ''}">
                    <div class="detail-field-label">Regulatory Demand</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.regulatory)}</div>
                </div>
                ` : ''}
                
                <!-- Problem (Full Width) -->
                ${product.problem ? `
                <div class="detail-field full-width">
                    <div class="detail-field-label">Problem</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.problem)}</div>
                </div>
                ` : ''}
                
                <!-- Solution (Full Width) -->
                ${product.solution ? `
                <div class="detail-field full-width">
                    <div class="detail-field-label">Solution</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.solution)}</div>
                </div>
                ` : ''}
                
                <!-- Platform Contextual Note (Full Width) -->
                ${product.platform ? `
                <div class="detail-field-note platform-note">
                    <div class="field-note-icon">💡</div>
                    <div class="field-note-text">
                        This solution is delivered through <strong>${window.Utils.escapeHtml(product.platform)}</strong>. 
                        Understanding the platform helps in resource allocation and technical decision-making.
                    </div>
                </div>
                ` : `
                <div class="detail-field-note warning platform-note">
                    <div class="field-note-icon">⚠️</div>
                    <div class="field-note-text">
                        Platform information is not specified. Consider documenting the technical platform for better resource planning.
                    </div>
                </div>
                `}
            </div>
        `;
    }
    
    /**
     * Show detail panel for a product with streamlined attribute display
     * Displays essential ownership and context information in scannable format
     * @param {number} productId - Product ID to display
     */
    function showDetailPanel(productId) {
        const product = window.DataManager.getProductById(productId);
        if (!product) return;

        const panel = document.getElementById('detail-panel');
        const mainContent = document.getElementById('main-content');
        const contentLeft = document.getElementById('content-left');

        // Remove selected class from all cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selected class to clicked card
        const clickedCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (clickedCard) {
            clickedCard.classList.add('selected');
        }

        // No preprocessing needed - attributes rendered directly in template

        panel.innerHTML = `
            <div class="detail-header">
                <button class="detail-close" aria-label="Close detail panel">×</button>
                <div class="detail-title">${window.Utils.escapeHtml(product.name)}</div>
                <div class="detail-subtitle">${window.Utils.escapeHtml(product.area)}</div>
            </div>
            <div class="detail-body">
                <!-- Tab Navigation -->
                <div class="detail-tabs">
                    <button class="detail-tab active" data-tab="metrics">
                        <span class="detail-tab-icon">📊</span>
                        <div class="detail-tab-label">
                            <span class="detail-tab-title">Metrics</span>
                            <span class="detail-tab-subtitle">Track performance and take action</span>
                        </div>
                    </button>
                    <button class="detail-tab" data-tab="core-details">
                        <span class="detail-tab-icon">📋</span>
                        <div class="detail-tab-label">
                            <span class="detail-tab-title">Core Details</span>
                            <span class="detail-tab-subtitle">Essential product information</span>
                        </div>
                    </button>
                </div>
                
                <!-- Tab Content: Metrics -->
                <div class="detail-tab-content active" id="tab-metrics">
                    ${generateMetricsContent(product)}
                </div>
                
                <!-- Tab Content: Core Details -->
                <div class="detail-tab-content" id="tab-core-details">
                    ${generateCoreDetailsContent(product)}
                </div>
            </div>
        `;

        // Show overlay and panel
        const overlay = document.getElementById('detail-panel-overlay');
        overlay.classList.remove('hidden');
        panel.classList.remove('hidden');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Setup tab navigation
        setupTabNavigation();
        
        // Setup modal close handlers
        setupModalCloseHandlers();
        
        // Load Chart.js and render charts after panel is visible
        setTimeout(() => {
            window.UIManager.Charts.loadChartJs()
                .then(() => {
                    window.UIManager.Charts.renderMetricChart('chart-ux', product.monthlyUX, product.targetUX, product.keyMetricUX);
                    window.UIManager.Charts.renderMetricChart('chart-bi', product.monthlyBI, product.targetBI, product.keyMetricBI);
                })
                .catch(error => {
                    console.error('Failed to load charts:', error);
                    // Show fallback message
                    const uxContainer = document.getElementById('chart-ux');
                    const biContainer = document.getElementById('chart-bi');
                    if (uxContainer && uxContainer.parentElement) {
                        uxContainer.parentElement.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 2rem;">Failed to load charts. Please refresh the page.</p>';
                    }
                    if (biContainer && biContainer.parentElement) {
                        biContainer.parentElement.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 2rem;">Failed to load charts. Please refresh the page.</p>';
                    }
                });
        }, 100);
        
        // Generate AI recommendations asynchronously
        generateAndDisplayRecommendations(product);
    }
    
    /**
     * Generate and display AI recommendations for both metrics
     * @param {Object} product - Product object
     */
    async function generateAndDisplayRecommendations(product) {
        // Generate UX recommendation
        generateAIRecommendation(product, 'UX', product.monthlyUX, product.targetUX)
            .then(html => {
                const uxContainer = document.getElementById('ux-recommendation');
                if (uxContainer) {
                    uxContainer.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Failed to generate UX recommendation:', error);
                const uxContainer = document.getElementById('ux-recommendation');
                if (uxContainer) {
                    uxContainer.innerHTML = generateRuleBasedRecommendation(product.monthlyUX, product.targetUX, 'UX');
                }
            });
        
        // Generate BI recommendation
        generateAIRecommendation(product, 'BI', product.monthlyBI, product.targetBI)
            .then(html => {
                const biContainer = document.getElementById('bi-recommendation');
                if (biContainer) {
                    biContainer.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Failed to generate BI recommendation:', error);
                const biContainer = document.getElementById('bi-recommendation');
                if (biContainer) {
                    biContainer.innerHTML = generateRuleBasedRecommendation(product.monthlyBI, product.targetBI, 'BI');
                }
            });
    }
    
    /**
     * Setup tab navigation in detail panel
     */
    function setupTabNavigation() {
        const tabs = document.querySelectorAll('.detail-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab);
            });
        });
    }
    
    /**
     * Switch active tab in detail panel
     * @param {HTMLElement} clickedTab - The tab button that was clicked
     */
    function switchTab(clickedTab) {
        const tabName = clickedTab.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.detail-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.detail-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to clicked tab and corresponding content
        clickedTab.classList.add('active');
        const targetContent = document.getElementById(`tab-${tabName}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Track analytics event
        if (window.Analytics) {
            window.Analytics.trackEvent('detail_panel', 'tab_switch', tabName);
        }
    }
    
    /**
     * Setup event handlers for closing the modal
     * Handles backdrop click, ESC key, and close button
     */
    function setupModalCloseHandlers() {
        const overlay = document.getElementById('detail-panel-overlay');
        const panel = document.getElementById('detail-panel');
        const closeBtn = panel.querySelector('.detail-close');
        
        // Close button click
        closeBtn.addEventListener('click', hideDetailPanel);
        
        // Backdrop click (clicking outside modal)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideDetailPanel();
            }
        });
        
        // ESC key press
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                hideDetailPanel();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Store handler reference for cleanup
        overlay._escHandler = escHandler;
    }
    
    /**
     * Hide detail panel
     */
    function hideDetailPanel() {
        // Destroy chart instances
        const chartInstances = window.State.getChartInstances();
        Object.values(chartInstances).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        window.State.clearAllChartInstances();
        
        const overlay = document.getElementById('detail-panel-overlay');
        const panel = document.getElementById('detail-panel');
        
        // Clean up ESC key listener
        if (overlay && overlay._escHandler) {
            document.removeEventListener('keydown', overlay._escHandler);
            overlay._escHandler = null;
        }
        
        // Hide overlay and panel
        if (overlay) overlay.classList.add('hidden');
        if (panel) panel.classList.add('hidden');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove selected class from cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
    }
    
    // Export to window.UIManager.DetailPanel namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.DetailPanel = {
        show: showDetailPanel,
        hide: hideDetailPanel
    };
    
    // Global exports for backward compatibility
    window.showDetailPanel = showDetailPanel;
    window.hideDetailPanel = hideDetailPanel;
    
    console.log('✅ UI Detail Panel module loaded');
})();
