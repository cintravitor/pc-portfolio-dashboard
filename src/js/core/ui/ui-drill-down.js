/**
 * UI Drill-Down Module
 * Handles cross-tab drill-down functionality
 * 
 * Part of the modular UI architecture refactor
 */

(function() {
    'use strict';
    
    /**
     * Setup click handlers for anomaly cards to enable drill-down to Insights & Analytics
     * This creates a seamless flow from Planning & Action → Insights & Analytics with filtering
     */
    function setupAnomalyDrillDownHandlers() {
        console.log('Setting up anomaly drill-down handlers...');
        
        // Get all clickable anomaly cards
        const anomalyCards = document.querySelectorAll('.anomaly-clickable');
        
        anomalyCards.forEach(card => {
            card.addEventListener('click', function() {
                const anomalyType = this.dataset.anomalyType;
                const owner = this.dataset.owner;
                const productName = this.dataset.productName;
                const area = this.dataset.area;
                
                console.log('Anomaly card clicked:', { anomalyType, owner, productName, area });
                
                // Create filter object based on anomaly type
                let filterConfig = {
                    type: anomalyType,
                    owner: owner,
                    productName: productName,
                    area: area
                };
                
                // Trigger drill-down
                drillDownToInsightsAnalytics(filterConfig);
            });
            
            // Add hover effect
            card.style.cursor = 'pointer';
        });
        
        console.log(`✅ ${anomalyCards.length} anomaly cards made clickable`);
    }
    
    /**
     * Drill-down function: Switches to Insights & Analytics tab and applies filter
     * @param {Object} filterConfig - Configuration for filtering { type, owner, productName, area }
     */
    function drillDownToInsightsAnalytics(filterConfig) {
        console.log('Drilling down to Insights & Analytics with filter:', filterConfig);
        
        // Store drill-down filter in State
        window.State.setDrillDownFilter({
            active: true,
            ...filterConfig
        });
        
        // Switch to Insights & Analytics tab
        if (window.UIManager && window.UIManager.switchTab) {
            window.UIManager.switchTab('insights-analytics');
        } else if (window.switchTab) {
            window.switchTab('insights-analytics');
        }
        
        // The renderInsightsAnalytics() function will check for active drill-down filter
        // and apply it automatically
    }
    
    /**
     * Helper function for "View All Issues" button
     */
    function drillDownToAllDataHealthIssues() {
        const anomalyReport = window.DataManager.checkAnomalies();
        const allIssueProducts = anomalyReport.dataHealthIssues.map(item => item.name);
        
        drillDownToInsightsAnalytics({
            type: 'data-health-all',
            products: allIssueProducts
        });
    }
    
    /**
     * Legacy: Strategic View drill-down to Tactical View
     * @deprecated - Kept for backward compatibility
     */
    function drillDownToTacticalView(drillType) {
        console.log('Drilling down to tactical view:', drillType);
        
        // Store drill-down state
        window.State.setDrillDownActive(true);
        window.State.setDrillDownType(drillType);
        
        // Switch to Portfolio Overview tab
        if (window.UIManager && window.UIManager.switchTab) {
            window.UIManager.switchTab('portfolio-overview');
        } else if (window.switchTab) {
            window.switchTab('portfolio-overview');
        }
        
        // Show notification
        showDrillDownNotification(drillType);
    }
    
    /**
     * Show a notification banner that drill-down is active
     */
    function showDrillDownNotification(drillType) {
        const labels = {
            'high-risk': 'High Risk Products (Risk Score ≥ 7)',
            'medium-risk': 'Medium Risk Products (Risk Score 4-6)',
            'low-risk': 'Low Risk Products (Risk Score < 4)',
            'below-target': 'Below Target Products (Performance < 50%)',
            'star-performers': 'Star Performers (Low Risk + High Performance)',
            'products-at-risk': 'Critical Products (High Risk + Low Performance)'
        };
        
        const label = labels[drillType] || drillType;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'drill-down-notification';
        notification.className = 'drill-down-notification';
        notification.innerHTML = `
            <div class="drill-down-notification-content">
                <span class="drill-down-notification-icon">🔍</span>
                <span class="drill-down-notification-text">
                    <strong>Drill-down Active:</strong> Showing ${label}
                </span>
                <button class="drill-down-notification-close" onclick="closeDrillDownNotification()">
                    ✕ Clear Filter
                </button>
            </div>
        `;
        
        // Insert notification
        const cardsContainer = document.getElementById('cards-container');
        if (cardsContainer) {
            cardsContainer.insertBefore(notification, cardsContainer.firstChild);
        }
    }
    
    /**
     * Close drill-down notification and clear filter
     */
    function closeDrillDownNotification() {
        // Clear drill-down state
        window.State.setDrillDownActive(false);
        window.State.setDrillDownType(null);
        
        // Remove notification
        const notification = document.getElementById('drill-down-notification');
        if (notification) {
            notification.remove();
        }
        
        // Re-render cards without filter
        if (window.UIManager && window.UIManager.renderCards) {
            window.UIManager.renderCards();
        }
    }
    
    /**
     * Add drill-down filter to State management
     * This extends the State object with drill-down filter capability
     */
    if (!window.State.getDrillDownFilter) {
        let drillDownFilter = {
            active: false,
            type: null,
            owner: null,
            productName: null,
            area: null,
            products: []
        };
        
        window.State.getDrillDownFilter = function() {
            return drillDownFilter;
        };
        
        window.State.setDrillDownFilter = function(filter) {
            drillDownFilter = { ...drillDownFilter, ...filter };
            console.log('Drill-down filter updated:', drillDownFilter);
        };
        
        window.State.clearDrillDownFilter = function() {
            drillDownFilter = {
                active: false,
                type: null,
                owner: null,
                productName: null,
                area: null,
                products: []
            };
            console.log('Drill-down filter cleared');
        };
    }
    
    /**
     * Filter Insights & Analytics content based on drill-down filter
     * Used by the Planning & Action tab to create a drill-down view
     * 
     * This function is called automatically when Insights & Analytics tab renders
     * and detects an active drill-down filter
     */
    function applyDrillDownFilter() {
        const filter = window.State.getDrillDownFilter();
        
        if (!filter || !filter.active) {
            console.log('No active drill-down filter');
            return;
        }
        
        console.log('Applying drill-down filter to Insights & Analytics:', filter);
        
        // Get portfolio data
        const portfolioData = window.State.getPortfolioData();
        if (!portfolioData || portfolioData.length === 0) {
            console.warn('No portfolio data available for filtering');
            return;
        }
        
        // Filter data based on anomaly type
        let filteredData = portfolioData;
        let filterDescription = '';
        
        switch (filter.type) {
            case 'owner-overload':
                filteredData = portfolioData.filter(p => p.owner === filter.owner);
                filterDescription = `Owner: ${filter.owner} (Over-allocated)`;
                break;
                
            case 'data-health':
                filteredData = portfolioData.filter(p => p.name === filter.productName);
                filterDescription = `Product: ${filter.productName} (Data Health Issues)`;
                break;
                
            case 'data-health-all':
                filteredData = portfolioData.filter(p => filter.products.includes(p.name));
                filterDescription = `All Products with Data Health Issues (${filter.products.length})`;
                break;
                
            default:
                console.warn('Unknown anomaly type:', filter.type);
        }
        
        console.log(`Filtered ${filteredData.length} products based on drill-down`);
        
        // Show filter pill at top of Insights & Analytics tab
        showDrillDownFilterPill(filterDescription, filteredData.length);
        
        // Re-render Insights & Analytics with filtered data
        reRenderInsightsWithFilteredData(filteredData);
    }
    
    /**
     * Show a filter pill at the top of Insights & Analytics to indicate drill-down is active
     */
    function showDrillDownFilterPill(description, count) {
        const insightsContent = document.getElementById('insights-content');
        
        if (!insightsContent) {
            return;
        }
        
        // Check if pill already exists, remove it
        const existingPill = document.getElementById('drill-down-filter-pill');
        if (existingPill) {
            existingPill.remove();
        }
        
        // Create filter pill
        const filterPill = document.createElement('div');
        filterPill.id = 'drill-down-filter-pill';
        filterPill.className = 'drill-down-filter-pill';
        filterPill.innerHTML = `
            <div class="filter-pill-content">
                <span class="filter-pill-icon">🔍</span>
                <span class="filter-pill-text">
                    <strong>Drill-down Active:</strong> ${escapeHtml(description)} 
                    <span class="filter-pill-count">(${count} products)</span>
                </span>
                <button class="filter-pill-clear" onclick="clearDrillDownFilter()" title="Clear filter and view all data">
                    ✕ Clear Filter
                </button>
            </div>
        `;
        
        // Insert at the top of insights content
        insightsContent.insertBefore(filterPill, insightsContent.firstChild);
        
        console.log('✅ Drill-down filter pill displayed');
    }
    
    /**
     * Clear drill-down filter and re-render Insights & Analytics with full data
     */
    function clearDrillDownFilter() {
        console.log('Clearing drill-down filter...');
        
        // Clear filter from State
        window.State.clearDrillDownFilter();
        
        // Remove filter pill
        const filterPill = document.getElementById('drill-down-filter-pill');
        if (filterPill) {
            filterPill.remove();
        }
        
        // Re-render Insights & Analytics with full data
        if (window.UIManager && window.UIManager.Insights && window.UIManager.Insights.render) {
            window.UIManager.Insights.render();
        }
        
        console.log('✅ Drill-down filter cleared, showing all data');
    }
    
    /**
     * Re-render Insights & Analytics with filtered data
     * @param {Array} filteredData - Filtered portfolio data
     */
    function reRenderInsightsWithFilteredData(filteredData) {
        console.log(`Re-rendering Insights & Analytics with ${filteredData.length} filtered products...`);
        
        const insightsContent = document.getElementById('insights-content');
        if (!insightsContent) {
            console.error('Insights content container not found');
            return;
        }
        
        // Store original data temporarily
        const originalData = window.State.getPortfolioData();
        
        // Temporarily replace portfolio data with filtered data
        window.State.setPortfolioData(filteredData);
        
        // Calculate metrics and analysis with filtered data
        const metrics = window.DataManager.calculatePortfolioMetrics();
        const analysis = window.DataManager.analyzePortfolioData(filteredData);
        
        // Restore original data
        window.State.setPortfolioData(originalData);
        
        // Clear existing sections (except filter pill)
        const filterPill = document.getElementById('drill-down-filter-pill');
        insightsContent.innerHTML = '';
        if (filterPill) {
            insightsContent.appendChild(filterPill);
        }
        
        // Render sections with filtered data
        if (metrics && analysis && window.UIManager.Insights) {
            // Use the insights module's section creators if available
            if (window.UIManager.Insights.createExecutiveSummarySection) {
                const executiveSummarySection = window.UIManager.Insights.createExecutiveSummarySection(metrics);
                insightsContent.appendChild(executiveSummarySection);
                
                const detailedBreakdownsSection = window.UIManager.Insights.createDetailedBreakdownsSection(analysis, metrics);
                insightsContent.appendChild(detailedBreakdownsSection);
                
                const deepAnalyticsSection = window.UIManager.Insights.createDeepAnalyticsSection(analysis);
                insightsContent.appendChild(deepAnalyticsSection);
            }
            
            console.log('✅ Insights & Analytics re-rendered with filtered data');
        } else {
            insightsContent.innerHTML += `
                <div class="analysis-section">
                    <h2>⚠️ No Data Available</h2>
                    <p style="color: #6b7280;">The filtered view has no data to display.</p>
                    <button class="refresh-btn" onclick="clearDrillDownFilter()" style="margin-top: 1rem;">
                        Clear Filter
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Helper function for escapeHtml
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
    window.UIManager.DrillDown = {
        setupHandlers: setupAnomalyDrillDownHandlers,
        drillToInsights: drillDownToInsightsAnalytics,
        applyFilter: applyDrillDownFilter,
        clearFilter: clearDrillDownFilter
    };
    
    // Global exports for onclick handlers (backward compatibility)
    window.drillDownToAllDataHealthIssues = drillDownToAllDataHealthIssues;
    window.drillDownToTacticalView = drillDownToTacticalView;
    window.closeDrillDownNotification = closeDrillDownNotification;
    window.clearDrillDownFilter = clearDrillDownFilter;
    
    console.log('✅ UI Drill-Down module loaded');
})();
