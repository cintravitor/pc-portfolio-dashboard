/**
 * UI Planning Module
 * Handles Planning & Action workspace with anomaly detection
 * 
 * Part of the modular UI architecture refactor
 */

(function() {
    'use strict';
    
    /**
     * Render Planning & Action Workspace
     * Main entry point for the Planning tab
     */
    function renderPlanningView() {
        console.log('Rendering Planning & Action Workspace...');
        
        const planningContent = document.getElementById('planning-content');
        
        if (!planningContent) {
            console.error('Planning content container not found');
            return;
        }
        
        // Get portfolio data from State
        const portfolioData = window.State.getPortfolioData();
        
        // Check if we have data to analyze
        if (!portfolioData || portfolioData.length === 0) {
            planningContent.innerHTML = `
                <div class="executive-empty-state">
                    <h2>⚠️ No Data Available</h2>
                    <p>Please load the Explore tab first to see anomaly detection.</p>
                    <button class="refresh-btn" onclick="switchTab('portfolio-overview')" style="margin-top: 1.5rem;">
                        Go to Explore
                    </button>
                </div>
            `;
            return;
        }
        
        console.log('Planning & Action data loaded:', portfolioData.length, 'products');
        
        // Clear and start building
        planningContent.innerHTML = '';
        
        // Create header section
        const headerSection = createPlanningHeaderSection();
        planningContent.appendChild(headerSection);
        
        // ========== ANOMALY ALERTS SECTION (with drill-down capability) ==========
        const anomalySection = createAnomalyAlertsSection();
        planningContent.appendChild(anomalySection);
        
        // Setup drill-down click handlers after DOM is ready
        setTimeout(() => {
            if (window.UIManager.DrillDown && window.UIManager.DrillDown.setupHandlers) {
                window.UIManager.DrillDown.setupHandlers();
            }
        }, 100);
        
        console.log('✅ Planning & Action Workspace rendered successfully');
    }
    
    /**
     * Create Planning & Action header section
     */
    function createPlanningHeaderSection() {
        const section = document.createElement('div');
        section.className = 'planning-header';
        
        section.innerHTML = `
            <div class="planning-header-content">
                <h1 class="planning-title">🎯 Planning & Action Workspace</h1>
                <p class="planning-subtitle">Proactive anomaly detection with one-click drill-down to detailed insights</p>
            </div>
        `;
        
        return section;
    }
    
    /**
     * Create Anomaly Alerts Section with clear user-friendly list
     */
    function createAnomalyAlertsSection() {
        const section = document.createElement('div');
        section.className = 'planning-section anomaly-section';
        
        // Get anomaly report from Data Manager
        const anomalyReport = window.DataManager.checkAnomalies();
        
        const totalAnomalies = anomalyReport.summary.totalAnomalies;
        const hasAnomalies = totalAnomalies > 0;
        
        section.innerHTML = `
            <div class="planning-section-header">
                <h2 class="planning-section-title">
                    <span class="section-icon">⚠️</span>
                    Anomaly Detection
                    ${hasAnomalies ? `<span class="anomaly-badge">${totalAnomalies}</span>` : ''}
                </h2>
                <p class="planning-section-subtitle">Automated detection of portfolio risks and data quality issues</p>
            </div>
            
            <div class="anomaly-content">
                ${hasAnomalies ? `
                    <!-- Owner Overload Alerts -->
                    ${anomalyReport.ownerOverload.length > 0 ? `
                        <div class="anomaly-category">
                            <h3 class="anomaly-category-title">
                                👥 Owner Over-allocation (${anomalyReport.ownerOverload.length})
                            </h3>
                            <p class="anomaly-category-desc">Owners managing more than 3 products in Development/Growth stages</p>
                            <div class="anomaly-list">
                                ${anomalyReport.ownerOverload.map(item => `
                                    <div class="anomaly-card owner-overload anomaly-clickable" 
                                         data-anomaly-type="owner-overload" 
                                         data-owner="${escapeHtml(item.owner)}"
                                         title="Click to view ${item.owner}'s products in Insights & Analytics">
                                        <div class="anomaly-card-header">
                                            <span class="anomaly-owner">${escapeHtml(item.owner)}</span>
                                            <span class="anomaly-count">${item.productCount} products</span>
                                            <span class="drill-down-hint">🔍 Click to analyze</span>
                                        </div>
                                        <div class="anomaly-card-body">
                                            <ul class="anomaly-products-list">
                                                ${item.products.map(product => `
                                                    <li>${escapeHtml(product)}</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                        <div class="anomaly-card-action">
                                            <span class="anomaly-recommendation">💡 Consider redistributing workload or prioritizing products</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Data Health Issues -->
                    ${anomalyReport.dataHealthIssues.length > 0 ? `
                        <div class="anomaly-category">
                            <h3 class="anomaly-category-title">
                                🏥 Data Health Issues (${anomalyReport.dataHealthIssues.length})
                            </h3>
                            <p class="anomaly-category-desc">Products with missing metrics, targets, or below-target performance</p>
                            <div class="anomaly-list">
                                ${anomalyReport.dataHealthIssues.slice(0, 10).map(item => `
                                    <div class="anomaly-card data-health-issue anomaly-clickable" 
                                         data-anomaly-type="data-health" 
                                         data-product-name="${escapeHtml(item.name)}"
                                         data-area="${escapeHtml(item.area)}"
                                         data-owner="${escapeHtml(item.owner)}"
                                         title="Click to view ${item.name} details in Insights & Analytics">
                                        <div class="anomaly-card-header">
                                            <span class="anomaly-product">${escapeHtml(item.name)}</span>
                                            <span class="anomaly-issue-count">${item.issueCount} issue${item.issueCount > 1 ? 's' : ''}</span>
                                            <span class="drill-down-hint">🔍 Click to analyze</span>
                                        </div>
                                        <div class="anomaly-card-meta">
                                            <span class="anomaly-meta-item">📍 ${escapeHtml(item.area)}</span>
                                            <span class="anomaly-meta-item">👤 ${escapeHtml(item.owner)}</span>
                                            <span class="anomaly-meta-item">📊 ${escapeHtml(item.maturity)}</span>
                                        </div>
                                        <div class="anomaly-card-body">
                                            <ul class="anomaly-issues-list">
                                                ${item.issues.map(issue => `
                                                    <li class="anomaly-issue">
                                                        ${getIssueIcon(issue)} ${escapeHtml(issue)}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                `).join('')}
                                ${anomalyReport.dataHealthIssues.length > 10 ? `
                                    <div class="anomaly-more">
                                        <p>... and ${anomalyReport.dataHealthIssues.length - 10} more products with issues</p>
                                        <button class="btn-secondary" onclick="drillDownToAllDataHealthIssues()">
                                            🔍 View All Issues in Insights & Analytics
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                ` : `
                    <div class="anomaly-empty-state">
                        <div class="anomaly-empty-icon">✅</div>
                        <h3>No Anomalies Detected</h3>
                        <p>Your portfolio is healthy! All owners are balanced and data quality is good.</p>
                        <ul class="anomaly-empty-checklist">
                            <li>✅ All owners have ≤3 products in Development/Growth</li>
                            <li>✅ All products have complete metrics</li>
                            <li>✅ All metrics are meeting targets</li>
                        </ul>
                    </div>
                `}
            </div>
        `;
        
        return section;
    }
    
    /**
     * Get icon for specific issue type
     */
    function getIssueIcon(issue) {
        if (issue.includes('Missing UX')) return '📊';
        if (issue.includes('Missing BI')) return '💼';
        if (issue.includes('Below UX')) return '📉';
        if (issue.includes('Below BI')) return '📊';
        if (issue.includes('Target')) return '🎯';
        return '⚠️';
    }
    
    /**
     * Helper function for escapeHtml (if not using window.Utils)
     */
    function escapeHtml(text) {
        if (window.Utils && window.Utils.escapeHtml) {
            return window.Utils.escapeHtml(text);
        }
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
    
    // Export to UIManager namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Planning = {
        render: renderPlanningView
    };
    
    console.log('✅ UI Planning module loaded');
})();
