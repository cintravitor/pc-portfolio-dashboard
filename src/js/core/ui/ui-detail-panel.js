/**
 * UI Detail Panel Module
 * Handles product detail panel display and interactions
 * 
 * Part of the modular UI architecture refactor
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
     * Show detail panel for a product
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

        // Build solution scope list
        const scopeItems = [
            product.problem && `<li><strong>Problem:</strong> ${window.Utils.escapeHtml(product.problem)}</li>`,
            product.solution && `<li><strong>Solution:</strong> ${window.Utils.escapeHtml(product.solution)}</li>`,
            product.targetUser && `<li><strong>Target User:</strong> ${window.Utils.escapeHtml(product.targetUser)}</li>`,
            product.indirectUser && `<li><strong>Indirect Impact:</strong> ${window.Utils.escapeHtml(product.indirectUser)}</li>`
        ].filter(Boolean).join('');

        panel.innerHTML = `
            <div class="detail-header">
                <button class="detail-close">×</button>
                <div class="detail-title">${window.Utils.escapeHtml(product.name)}</div>
                <div class="detail-subtitle">${window.Utils.escapeHtml(product.area)}</div>
            </div>
            <div class="detail-body">
                <!-- SECTION 1: Core Details (Always Visible) -->
                <div class="detail-collapsible-section">
                    <div class="detail-collapsible-header" data-section="core">
                        <div class="collapsible-header-content">
                            <span class="collapsible-icon">📋</span>
                            <h3 class="collapsible-title">Core Details</h3>
                            <span class="collapsible-subtitle">Essential product information</span>
                        </div>
                        <span class="collapsible-toggle">–</span>
                    </div>
                    <div class="detail-collapsible-content expanded" id="section-core">
                        <!-- Solution Scope -->
                        <div class="detail-section">
                            <div class="detail-section-title">Solution Scope</div>
                            <ul class="scope-list">
                                ${scopeItems}
                            </ul>
                        </div>
                        
                        <!-- Ownership & Compliance -->
                        <div class="detail-section">
                            <div class="detail-section-title">Ownership & Compliance</div>
                            <div class="detail-field">
                                <div class="detail-field-label">Owner</div>
                                <div class="detail-field-value">${window.Utils.escapeHtml(product.owner) || 'Not assigned'}</div>
                            </div>
                            <div class="detail-field">
                                <div class="detail-field-label">Maturity Stage</div>
                                <div class="detail-field-value">
                                    <span class="status-badge ${window.Utils.getStatusClass(product.maturity)}">
                                        ${window.Utils.escapeHtml(product.maturity) || 'Not specified'}
                                    </span>
                                </div>
                            </div>
                            ${product.regulatory ? `
                            <div class="detail-field">
                                <div class="detail-field-label">Regulatory Demand</div>
                                <div class="detail-field-value">${window.Utils.escapeHtml(product.regulatory)}</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- Platform Information -->
                        <div class="detail-section">
                            <div class="detail-section-title">Platform Details</div>
                            <div class="detail-field">
                                <div class="detail-field-label">Primary Platform</div>
                                <div class="detail-field-value ${!product.platform ? 'empty' : ''}">
                                    ${window.Utils.escapeHtml(product.platform) || 'Not specified'}
                                </div>
                            </div>
                            ${product.platform ? `
                            <div class="detail-field-note">
                                <div class="field-note-icon">💡</div>
                                <div class="field-note-text">
                                    This solution is delivered through <strong>${window.Utils.escapeHtml(product.platform)}</strong>. 
                                    Understanding the platform helps in resource allocation and technical decision-making.
                                </div>
                            </div>
                            ` : `
                            <div class="detail-field-note warning">
                                <div class="field-note-icon">⚠️</div>
                                <div class="field-note-text">
                                    Platform information is not specified. Consider documenting the technical platform for better resource planning.
                                </div>
                            </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: Metrics (Collapsible, Collapsed by Default) -->
                <div class="detail-collapsible-section">
                    <div class="detail-collapsible-header collapsed" data-section="metrics">
                        <div class="collapsible-header-content">
                            <span class="collapsible-icon">📊</span>
                            <h3 class="collapsible-title">Metrics</h3>
                            <span class="collapsible-subtitle">Track performance and take action</span>
                        </div>
                        <span class="collapsible-toggle">+</span>
                    </div>
                    <div class="detail-collapsible-content collapsed" id="section-metrics">
                        <!-- Key Metrics - UX -->
                        <div class="detail-section">
                            <div class="detail-section-title">Key Metrics - User Experience</div>
                            <div class="detail-field">
                                <div class="detail-field-label">${window.Utils.escapeHtml(product.keyMetricUX) || 'Metric'}</div>
                                <div class="chart-container">
                                    <canvas id="chart-ux"></canvas>
                                </div>
                            </div>
                            <!-- UX Performance Recommendation -->
                            <div id="ux-recommendation" class="recommendation-placeholder">
                                <div class="automation-recommendation info">
                                    <div class="recommendation-icon">🤖</div>
                                    <div class="recommendation-text">Generating AI recommendation...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Key Metrics - BI -->
                        <div class="detail-section">
                            <div class="detail-section-title">Key Metrics - Business Impact</div>
                            <div class="detail-field">
                                <div class="detail-field-label">${window.Utils.escapeHtml(product.keyMetricBI) || 'Metric'}</div>
                                <div class="chart-container">
                                    <canvas id="chart-bi"></canvas>
                                </div>
                            </div>
                            <!-- BI Performance Recommendation -->
                            <div id="bi-recommendation" class="recommendation-placeholder">
                                <div class="automation-recommendation info">
                                    <div class="recommendation-icon">🤖</div>
                                    <div class="recommendation-text">Generating AI recommendation...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        panel.classList.remove('hidden');
        mainContent.classList.add('detail-open');
        contentLeft.classList.add('shrink');
        
        // Setup collapsible section event listeners
        setupCollapsibleSections();
        
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
     * Setup event listeners for collapsible sections in detail panel
     */
    function setupCollapsibleSections() {
        const headers = document.querySelectorAll('.detail-collapsible-header');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                toggleCollapsibleSection(header);
            });
        });
    }
    
    /**
     * Toggle a collapsible section's expanded/collapsed state
     */
    function toggleCollapsibleSection(header) {
        const sectionId = header.getAttribute('data-section');
        const content = document.getElementById(`section-${sectionId}`);
        const toggle = header.querySelector('.collapsible-toggle');
        
        if (!content || !toggle) return;
        
        // Check current state
        const isCollapsed = header.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand
            header.classList.remove('collapsed');
            content.classList.remove('collapsed');
            content.classList.add('expanded');
            toggle.textContent = '–';
            
            // If expanding metrics section, load charts if not already loaded
            if (sectionId === 'metrics') {
                setTimeout(() => {
                    const uxChart = document.getElementById('chart-ux');
                    const biChart = document.getElementById('chart-bi');
                    
                    // Check if charts need to be rendered
                    if (uxChart && !uxChart.chart) {
                        const product = window.State.getPortfolioData().find(p => {
                            const selectedCard = document.querySelector('.product-card.selected');
                            return selectedCard && p.id === parseInt(selectedCard.getAttribute('data-product-id'));
                        });
                        
                        if (product) {
                            window.UIManager.Charts.loadChartJs().then(() => {
                                window.UIManager.Charts.renderMetricChart('chart-ux', product.monthlyUX, product.targetUX, product.keyMetricUX);
                                window.UIManager.Charts.renderMetricChart('chart-bi', product.monthlyBI, product.targetBI, product.keyMetricBI);
                            });
                        }
                    }
                }, 300); // Wait for expand animation
            }
        } else {
            // Collapse
            header.classList.add('collapsed');
            content.classList.remove('expanded');
            content.classList.add('collapsed');
            toggle.textContent = '+';
        }
    }
    
    /**
     * Hide detail panel
     */
    function hideDetailPanel() {
        // Destroy all chart instances to prevent memory leaks
        const chartInstances = window.State.getChartInstances();
        Object.values(chartInstances).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        // Clear all chart instances in State
        window.State.clearAllChartInstances();
        
        const panel = document.getElementById('detail-panel');
        const mainContent = document.getElementById('main-content');
        const contentLeft = document.getElementById('content-left');

        panel.classList.add('hidden');
        mainContent.classList.remove('detail-open');
        contentLeft.classList.remove('shrink');

        // Remove selected class from all cards
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
