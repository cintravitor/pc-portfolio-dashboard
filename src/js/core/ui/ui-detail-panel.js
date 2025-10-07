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
     * Generate Metric Automation Section HTML
     * Determines if metrics are automated or manual based on data presence and patterns
     */
    function generateMetricAutomationSection(product) {
        // Helper function to determine if a metric has data extraction
        const determineDataExtraction = (monthlyData, metricName) => {
            if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
                return { status: 'No Data', class: 'status-empty', icon: '❌' };
            }
            
            // Count valid data points
            let validDataPoints = 0;
            for (let i = 0; i < monthlyData.length; i++) {
                const val = monthlyData[i];
                if (val && val !== '' && val !== 'N/A' && val !== '-') {
                    validDataPoints++;
                }
            }
            
            // Determine automation level based on data consistency
            // Assume automated if more than 6 months of data present
            if (validDataPoints >= 6) {
                return { 
                    status: 'Automated', 
                    class: 'status-automated', 
                    icon: '✅',
                    detail: `${validDataPoints} months of data collected`
                };
            } else if (validDataPoints >= 3) {
                return { 
                    status: 'Semi-Automated', 
                    class: 'status-semi-automated', 
                    icon: '⚙️',
                    detail: `${validDataPoints} months of data collected`
                };
            } else if (validDataPoints > 0) {
                return { 
                    status: 'Manual', 
                    class: 'status-manual', 
                    icon: '✏️',
                    detail: `${validDataPoints} months of data collected`
                };
            } else {
                return { 
                    status: 'No Data', 
                    class: 'status-empty', 
                    icon: '❌',
                    detail: 'No data collected'
                };
            }
        };
        
        const uxAutomation = determineDataExtraction(product.monthlyUX, product.keyMetricUX);
        const biAutomation = determineDataExtraction(product.monthlyBI, product.keyMetricBI);
        
        // Overall automation score
        let overallStatus = 'Not Automated';
        let overallClass = 'status-empty';
        let overallIcon = '❌';
        
        if (uxAutomation.status === 'Automated' && biAutomation.status === 'Automated') {
            overallStatus = 'Fully Automated';
            overallClass = 'status-automated';
            overallIcon = '✅';
        } else if (uxAutomation.status === 'Automated' || biAutomation.status === 'Automated' || 
                   uxAutomation.status === 'Semi-Automated' || biAutomation.status === 'Semi-Automated') {
            overallStatus = 'Partially Automated';
            overallClass = 'status-semi-automated';
            overallIcon = '⚙️';
        } else if (uxAutomation.status === 'Manual' || biAutomation.status === 'Manual') {
            overallStatus = 'Manual Collection';
            overallClass = 'status-manual';
            overallIcon = '✏️';
        }
        
        return `
            <div class="detail-section">
                <div class="detail-section-title">Data Extraction Status</div>
                
                <!-- Overall Automation Status -->
                <div class="automation-overall-status ${overallClass}">
                    <div class="automation-status-icon">${overallIcon}</div>
                    <div class="automation-status-content">
                        <div class="automation-status-label">Overall Automation</div>
                        <div class="automation-status-value">${overallStatus}</div>
                    </div>
                </div>
                
                <!-- UX Metric Automation -->
                <div class="detail-field">
                    <div class="detail-field-label">
                        User Experience Metric
                        ${product.keyMetricUX ? `<span class="metric-name">(${window.Utils.escapeHtml(product.keyMetricUX)})</span>` : ''}
                    </div>
                    <div class="automation-status-row">
                        <div class="automation-badge ${uxAutomation.class}">
                            <span class="automation-icon">${uxAutomation.icon}</span>
                            <span class="automation-text">${uxAutomation.status}</span>
                        </div>
                        <div class="automation-detail">${uxAutomation.detail}</div>
                    </div>
                </div>
                
                <!-- BI Metric Automation -->
                <div class="detail-field">
                    <div class="detail-field-label">
                        Business Impact Metric
                        ${product.keyMetricBI ? `<span class="metric-name">(${window.Utils.escapeHtml(product.keyMetricBI)})</span>` : ''}
                    </div>
                    <div class="automation-status-row">
                        <div class="automation-badge ${biAutomation.class}">
                            <span class="automation-icon">${biAutomation.icon}</span>
                            <span class="automation-text">${biAutomation.status}</span>
                        </div>
                        <div class="automation-detail">${biAutomation.detail}</div>
                    </div>
                </div>
                
                <!-- Automation Recommendations -->
                <div class="automation-recommendations">
                    <div class="detail-section-title" style="margin-top: 1.5rem; margin-bottom: 0.75rem;">💡 Recommendations</div>
                    ${generateAutomationRecommendations(uxAutomation, biAutomation, overallStatus)}
                </div>
            </div>
        `;
    }
    
    /**
     * Generate automation recommendations based on current status
     */
    function generateAutomationRecommendations(uxAutomation, biAutomation, overallStatus) {
        const recommendations = [];
        
        if (overallStatus === 'Fully Automated') {
            recommendations.push({
                icon: '✅',
                text: 'Excellent! Both metrics are fully automated. Continue monitoring data quality.',
                type: 'success'
            });
        } else {
            if (uxAutomation.status === 'No Data' || uxAutomation.status === 'Manual') {
                recommendations.push({
                    icon: '🎯',
                    text: 'Consider automating UX metric collection to improve data consistency and reduce manual effort.',
                    type: 'warning'
                });
            }
            
            if (biAutomation.status === 'No Data' || biAutomation.status === 'Manual') {
                recommendations.push({
                    icon: '📊',
                    text: 'Consider automating Business Impact metric collection for more reliable tracking.',
                    type: 'warning'
                });
            }
            
            if (uxAutomation.status === 'No Data' && biAutomation.status === 'No Data') {
                recommendations.push({
                    icon: '⚠️',
                    text: 'No metrics are being collected. Establish baseline measurements and set up data collection pipelines.',
                    type: 'error'
                });
            }
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                icon: '👍',
                text: 'Metrics are being collected regularly. Monitor for any gaps in data collection.',
                type: 'info'
            });
        }
        
        return recommendations.map(rec => `
            <div class="automation-recommendation ${rec.type}">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-text">${rec.text}</div>
            </div>
        `).join('');
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
                    </div>
                </div>

                <!-- SECTION 2: Metrics & Performance (Collapsible, Collapsed by Default) -->
                <div class="detail-collapsible-section">
                    <div class="detail-collapsible-header collapsed" data-section="metrics">
                        <div class="collapsible-header-content">
                            <span class="collapsible-icon">📊</span>
                            <h3 class="collapsible-title">Metrics & Performance</h3>
                            <span class="collapsible-subtitle">KPI tracking and trend charts</span>
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
                        </div>
                    </div>
                </div>

                <!-- SECTION 3: Solution Platforms -->
                <div class="detail-collapsible-section">
                    <div class="detail-collapsible-header collapsed" data-section="platforms">
                        <div class="collapsible-header-content">
                            <span class="collapsible-icon">💻</span>
                            <h3 class="collapsible-title">Solution Platforms</h3>
                            <span class="collapsible-subtitle">Technical platform and infrastructure details</span>
                        </div>
                        <span class="collapsible-toggle">+</span>
                    </div>
                    <div class="detail-collapsible-content collapsed" id="section-platforms">
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

                <!-- SECTION 4: Metric Automation -->
                <div class="detail-collapsible-section">
                    <div class="detail-collapsible-header collapsed" data-section="automation">
                        <div class="collapsible-header-content">
                            <span class="collapsible-icon">🤖</span>
                            <h3 class="collapsible-title">Metric Automation</h3>
                            <span class="collapsible-subtitle">Data extraction and automation status</span>
                        </div>
                        <span class="collapsible-toggle">+</span>
                    </div>
                    <div class="detail-collapsible-content collapsed" id="section-automation">
                        ${generateMetricAutomationSection(product)}
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
