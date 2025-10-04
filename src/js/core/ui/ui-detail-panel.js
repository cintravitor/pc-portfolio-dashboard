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

                <!-- SECTION 3: Project Narrative (Collapsible, Collapsed by Default) -->
                <div class="detail-collapsible-section">
                    <div class="detail-collapsible-header collapsed" data-section="narrative">
                        <div class="collapsible-header-content">
                            <span class="collapsible-icon">📝</span>
                            <h3 class="collapsible-title">Project Narrative</h3>
                            <span class="collapsible-subtitle">Journey stages and platform details</span>
                        </div>
                        <span class="collapsible-toggle">+</span>
                    </div>
                    <div class="detail-collapsible-content collapsed" id="section-narrative">
                        <!-- Journey & Platform -->
                        <div class="detail-section">
                            <div class="detail-section-title">Journey & Platform</div>
                            <div class="detail-field">
                                <div class="detail-field-label">Main Journey Stage</div>
                                <div class="detail-field-value ${!product.journeyMain ? 'empty' : ''}">
                                    ${window.Utils.escapeHtml(product.journeyMain) || 'Not specified'}
                                </div>
                            </div>
                            ${product.journeyCollateral ? `
                            <div class="detail-field">
                                <div class="detail-field-label">Collateral Journey Stage</div>
                                <div class="detail-field-value">${window.Utils.escapeHtml(product.journeyCollateral)}</div>
                            </div>
                            ` : ''}
                            <div class="detail-field">
                                <div class="detail-field-label">User Interface Platform</div>
                                <div class="detail-field-value ${!product.platform ? 'empty' : ''}">
                                    ${window.Utils.escapeHtml(product.platform) || 'Not specified'}
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
