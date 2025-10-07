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
        
        // ========== NEW: PORTFOLIO MANAGER VISUALIZATIONS ==========
        const resourceSection = createResourceAllocationSection();
        planningContent.appendChild(resourceSection);
        
        // ========== NEW: SOLUTIONS BY OWNER ==========
        const ownerSection = createSolutionsByOwnerSection();
        planningContent.appendChild(ownerSection);
        
        // ========== NEW: PEOPLE TECH TEAM SECTION ==========
        const peopleTechSection = createPeopleTechSection();
        planningContent.appendChild(peopleTechSection);
        
        // ========== NEW: REGULATORY FILTER SECTION ==========
        const regulatorySection = createRegulatoryFilterSection();
        planningContent.appendChild(regulatorySection);
        
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
     * Create Resource Allocation Section
     * Shows Distribution by P&C Area and Maturity of P&C Solutions
     */
    function createResourceAllocationSection() {
        const section = document.createElement('div');
        section.className = 'planning-section resource-allocation-section';
        
        section.innerHTML = `
            <div class="planning-section-header">
                <h2 class="planning-section-title">
                    <span class="section-icon">📊</span>
                    Resource Allocation & Portfolio Maturity
                </h2>
                <p class="planning-section-subtitle">Visualize resource distribution and solution maturity across the portfolio</p>
            </div>
            
            <div class="planning-charts-grid">
                <div class="planning-chart-card">
                    <h3 class="planning-chart-title">🏢 Distribution by P&C Area</h3>
                    <div class="planning-chart-wrapper">
                        <canvas id="chart-planning-area-distribution"></canvas>
                    </div>
                </div>
                
                <div class="planning-chart-card">
                    <h3 class="planning-chart-title">📈 Maturity of P&C Solutions</h3>
                    <div class="planning-chart-wrapper">
                        <canvas id="chart-planning-maturity-distribution"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Create charts after DOM insertion
        setTimeout(() => createResourceAllocationCharts(), 100);
        
        return section;
    }
    
    /**
     * Create resource allocation charts
     */
    function createResourceAllocationCharts() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded - cannot create resource allocation charts');
            return;
        }
        
        const portfolioData = window.State.getPortfolioData();
        
        if (!portfolioData || portfolioData.length === 0) {
            return;
        }
        
        // Count by P&C Area
        const areaCount = {};
        portfolioData.forEach(product => {
            const area = product.area || 'Unspecified';
            areaCount[area] = (areaCount[area] || 0) + 1;
        });
        
        // Count by Maturity
        const maturityCount = {};
        portfolioData.forEach(product => {
            const maturity = product.maturity || 'Unspecified';
            maturityCount[maturity] = (maturityCount[maturity] || 0) + 1;
        });
        
        // Sort by count
        const sortedAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]);
        const sortedMaturities = Object.entries(maturityCount).sort((a, b) => {
            const order = ['1. Development', '2. Growth', '3. Mature', '4. Decline'];
            const aIndex = order.indexOf(a[0]);
            const bIndex = order.indexOf(b[0]);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a[0].localeCompare(b[0]);
        });
        
        const areaColors = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(251, 146, 60, 0.8)'
        ];
        
        const maturityColors = {
            '1. Development': 'rgba(59, 130, 246, 0.85)',
            '2. Growth': 'rgba(16, 185, 129, 0.85)',
            '3. Mature': 'rgba(168, 85, 247, 0.85)',
            '4. Decline': 'rgba(251, 146, 60, 0.85)'
        };
        
        // Create P&C Area chart
        const areaCanvas = document.getElementById('chart-planning-area-distribution');
        if (areaCanvas && window.Chart) {
            new Chart(areaCanvas, {
                type: 'pie',
                data: {
                    labels: sortedAreas.map(([area]) => area),
                    datasets: [{
                        data: sortedAreas.map(([, count]) => count),
                        backgroundColor: areaColors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 15, font: { size: 12, weight: '600' } }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} solutions (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Create Maturity chart
        const maturityCanvas = document.getElementById('chart-planning-maturity-distribution');
        if (maturityCanvas && window.Chart) {
            new Chart(maturityCanvas, {
                type: 'bar',
                data: {
                    labels: sortedMaturities.map(([maturity]) => maturity),
                    datasets: [{
                        label: 'Number of Solutions',
                        data: sortedMaturities.map(([, count]) => count),
                        backgroundColor: sortedMaturities.map(([maturity]) => 
                            maturityColors[maturity] || 'rgba(156, 163, 175, 0.8)'
                        ),
                        borderRadius: 8,
                        barThickness: 50
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${value} solutions (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: { size: 12 } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                        },
                        x: {
                            ticks: { font: { size: 12, weight: '600' } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
        
        console.log('✅ Resource allocation charts created');
    }
    
    /**
     * Create Solutions by Owner Section
     */
    function createSolutionsByOwnerSection() {
        const section = document.createElement('div');
        section.className = 'planning-section solutions-by-owner-section';
        
        const portfolioData = window.State.getPortfolioData();
        
        // Group solutions by owner and calculate metrics
        const ownerStats = {};
        portfolioData.forEach(product => {
            const owner = product.owner && product.owner.trim() !== '' ? 
                         product.owner.trim() : 'Unassigned';
            
            if (!ownerStats[owner]) {
                ownerStats[owner] = {
                    count: 0,
                    withUXMetric: 0,
                    withBIMetric: 0,
                    products: []
                };
            }
            
            ownerStats[owner].count++;
            ownerStats[owner].products.push(product.name);
            
            // Check if metrics are defined
            if (product.keyMetricUX && product.keyMetricUX !== 'N/A' && product.keyMetricUX !== '-') {
                ownerStats[owner].withUXMetric++;
            }
            if (product.keyMetricBI && product.keyMetricBI !== 'N/A' && product.keyMetricBI !== '-') {
                ownerStats[owner].withBIMetric++;
            }
        });
        
        // Sort owners by product count
        const sortedOwners = Object.entries(ownerStats).sort((a, b) => b[1].count - a[1].count);
        
        // Show top 15 owners
        const topOwners = sortedOwners.slice(0, 15);
        
        section.innerHTML = `
            <div class="planning-section-header">
                <h2 class="planning-section-title">
                    <span class="section-icon">👥</span>
                    Solutions by Owner
                </h2>
                <p class="planning-section-subtitle">Product ownership distribution and metric coverage (Top 15 owners)</p>
            </div>
            
            <div class="owner-stats-container">
                <table class="owner-stats-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 25%;">Owner</th>
                            <th style="width: 10%;">Solutions</th>
                            <th style="width: 15%;">UX Metrics</th>
                            <th style="width: 15%;">BI Metrics</th>
                            <th style="width: 30%;">Products</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topOwners.map(([owner, stats], index) => {
                            const uxPercent = Math.round((stats.withUXMetric / stats.count) * 100);
                            const biPercent = Math.round((stats.withBIMetric / stats.count) * 100);
                            
                            return `
                                <tr class="owner-stat-row">
                                    <td><strong>${index + 1}</strong></td>
                                    <td><strong>${escapeHtml(owner)}</strong></td>
                                    <td>
                                        <span class="owner-badge">${stats.count}</span>
                                    </td>
                                    <td>
                                        <div class="metric-progress-bar">
                                            <div class="metric-progress-fill" style="width: ${uxPercent}%; background-color: rgba(59, 130, 246, 0.7);"></div>
                                            <span class="metric-progress-label">${stats.withUXMetric}/${stats.count} (${uxPercent}%)</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="metric-progress-bar">
                                            <div class="metric-progress-fill" style="width: ${biPercent}%; background-color: rgba(16, 185, 129, 0.7);"></div>
                                            <span class="metric-progress-label">${stats.withBIMetric}/${stats.count} (${biPercent}%)</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="owner-products-list" title="${stats.products.map(p => escapeHtml(p)).join(', ')}">
                                            ${stats.products.slice(0, 2).map(p => escapeHtml(p)).join(', ')}${stats.products.length > 2 ? ` +${stats.products.length - 2} more` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                ${sortedOwners.length > 15 ? `
                    <p style="text-align: center; color: #6b7280; margin-top: 1rem; font-size: 0.875rem;">
                        Showing top 15 of ${sortedOwners.length} owners
                    </p>
                ` : ''}
            </div>
        `;
        
        return section;
    }
    
    /**
     * Create People Tech Team Section
     */
    function createPeopleTechSection() {
        const section = document.createElement('div');
        section.className = 'planning-section people-tech-section';
        
        const portfolioData = window.State.getPortfolioData();
        
        // Identify People Tech team members (case-insensitive match)
        // Common variations: "PTech", "People Tech", "PeopleTech", names with "PTech" affiliation
        const peopleTechSolutions = portfolioData.filter(product => {
            const owner = (product.owner || '').toLowerCase();
            const area = (product.area || '').toLowerCase();
            return owner.includes('ptech') || 
                   owner.includes('peopletech') || 
                   owner.includes('people tech') ||
                   area.includes('ptech') ||
                   area.includes('peopletech');
        });
        
        // Count by area
        const areaCount = {};
        peopleTechSolutions.forEach(product => {
            const area = product.area || 'Unspecified';
            areaCount[area] = (areaCount[area] || 0) + 1;
        });
        
        const sortedAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]);
        
        section.innerHTML = `
            <div class="planning-section-header">
                <h2 class="planning-section-title">
                    <span class="section-icon">🚀</span>
                    People Tech Team Solutions
                </h2>
                <p class="planning-section-subtitle">Solutions owned or supported by the People Tech team</p>
            </div>
            
            <div class="people-tech-content">
                <div class="people-tech-summary">
                    <div class="people-tech-stat-card">
                        <div class="stat-card-value">${peopleTechSolutions.length}</div>
                        <div class="stat-card-label">Total Solutions</div>
                    </div>
                    <div class="people-tech-stat-card">
                        <div class="stat-card-value">${sortedAreas.length}</div>
                        <div class="stat-card-label">P&C Areas</div>
                    </div>
                </div>
                
                ${peopleTechSolutions.length > 0 ? `
                    <div class="people-tech-breakdown">
                        <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b;">Breakdown by P&C Area</h3>
                        <table class="people-tech-table">
                            <thead>
                                <tr>
                                    <th style="width: 40%;">P&C Area</th>
                                    <th style="width: 20%;">Solutions</th>
                                    <th style="width: 40%;">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedAreas.map(([area, count]) => {
                                    const percentage = Math.round((count / peopleTechSolutions.length) * 100);
                                    return `
                                        <tr>
                                            <td><strong>${escapeHtml(area)}</strong></td>
                                            <td>${count}</td>
                                            <td>
                                                <div class="percentage-bar">
                                                    <div class="percentage-fill" style="width: ${percentage}%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                                                    <span class="percentage-label">${percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="people-tech-products">
                        <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b;">Product List</h3>
                        <div class="products-grid">
                            ${peopleTechSolutions.map(product => `
                                <div class="product-chip">
                                    <div class="product-chip-name">${escapeHtml(product.name)}</div>
                                    <div class="product-chip-area">${escapeHtml(product.area)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="people-tech-empty">
                        <p style="color: #6b7280; text-align: center; padding: 2rem;">
                            No solutions found for People Tech team. Solutions are identified by owner or area containing "PTech", "PeopleTech", or "People Tech".
                        </p>
                    </div>
                `}
            </div>
        `;
        
        return section;
    }
    
    /**
     * Create Regulatory Filter Section
     */
    function createRegulatoryFilterSection() {
        const section = document.createElement('div');
        section.className = 'planning-section regulatory-filter-section';
        
        const portfolioData = window.State.getPortfolioData();
        
        // Count regulatory vs non-regulatory
        const regulatoryCount = portfolioData.filter(p => 
            p.regulatory && 
            typeof p.regulatory === 'string' && 
            p.regulatory.toLowerCase().includes('yes')
        ).length;
        const nonRegulatoryCount = portfolioData.length - regulatoryCount;
        
        // Group by regulatory status and area
        const regulatoryByArea = {};
        const nonRegulatoryByArea = {};
        
        portfolioData.forEach(product => {
            const area = product.area || 'Unspecified';
            const isRegulatory = product.regulatory && product.regulatory.toLowerCase().includes('yes');
            
            if (isRegulatory) {
                regulatoryByArea[area] = (regulatoryByArea[area] || 0) + 1;
            } else {
                nonRegulatoryByArea[area] = (nonRegulatoryByArea[area] || 0) + 1;
            }
        });
        
        section.innerHTML = `
            <div class="planning-section-header">
                <h2 class="planning-section-title">
                    <span class="section-icon">⚖️</span>
                    Regulatory Status Analysis
                </h2>
                <p class="planning-section-subtitle">Filter and analyze solutions by regulatory demand</p>
            </div>
            
            <div class="regulatory-content">
                <div class="regulatory-summary">
                    <div class="regulatory-stat-card regulatory-yes">
                        <div class="stat-card-icon">⚖️</div>
                        <div class="stat-card-content">
                            <div class="stat-card-value">${regulatoryCount}</div>
                            <div class="stat-card-label">Regulatory Demand</div>
                            <div class="stat-card-sublabel">${Math.round((regulatoryCount / portfolioData.length) * 100)}% of portfolio</div>
                        </div>
                        <button class="filter-btn" onclick="filterByRegulatory('yes')" title="Filter to show only regulatory solutions">
                            🔍 View Solutions
                        </button>
                    </div>
                    
                    <div class="regulatory-stat-card regulatory-no">
                        <div class="stat-card-icon">📋</div>
                        <div class="stat-card-content">
                            <div class="stat-card-value">${nonRegulatoryCount}</div>
                            <div class="stat-card-label">Non-Regulatory</div>
                            <div class="stat-card-sublabel">${Math.round((nonRegulatoryCount / portfolioData.length) * 100)}% of portfolio</div>
                        </div>
                        <button class="filter-btn" onclick="filterByRegulatory('no')" title="Filter to show only non-regulatory solutions">
                            🔍 View Solutions
                        </button>
                    </div>
                </div>
                
                <div class="regulatory-breakdown">
                    <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b;">Regulatory vs Non-Regulatory by Area</h3>
                    <div class="regulatory-chart-wrapper">
                        <canvas id="chart-planning-regulatory-by-area"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Create stacked bar chart
        setTimeout(() => createRegulatoryByAreaChart(regulatoryByArea, nonRegulatoryByArea), 100);
        
        return section;
    }
    
    /**
     * Create regulatory by area stacked chart
     */
    function createRegulatoryByAreaChart(regulatoryByArea, nonRegulatoryByArea) {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded - cannot create regulatory chart');
            return;
        }
        
        const canvas = document.getElementById('chart-planning-regulatory-by-area');
        if (!canvas) return;
        
        // Get all areas
        const allAreas = new Set([
            ...Object.keys(regulatoryByArea),
            ...Object.keys(nonRegulatoryByArea)
        ]);
        const areas = Array.from(allAreas).sort();
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: areas,
                datasets: [
                    {
                        label: 'Regulatory Demand',
                        data: areas.map(area => regulatoryByArea[area] || 0),
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderRadius: 6
                    },
                    {
                        label: 'Non-Regulatory',
                        data: areas.map(area => nonRegulatoryByArea[area] || 0),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { size: 12, weight: '600' }, padding: 15 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value} solutions`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { font: { size: 11 } },
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { size: 12 } },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    }
                }
            }
        });
        
        console.log('✅ Regulatory by area chart created');
    }
    
    /**
     * Global function to filter by regulatory status
     * Switches to Explore tab and applies filter
     */
    window.filterByRegulatory = function(status) {
        console.log('Filtering by regulatory status:', status);
        
        // Switch to Explore tab
        if (window.UIManager && window.UIManager.Tabs && window.UIManager.Tabs.switchTab) {
            window.UIManager.Tabs.switchTab('portfolio-overview');
        }
        
        // Apply filter after tab switch
        setTimeout(() => {
            // This would integrate with the existing filter system
            // For now, we'll log the action
            console.log('Filter applied:', status === 'yes' ? 'Regulatory Demand' : 'Non-Regulatory');
            
            // Show alert to user
            alert(`Filtering to show ${status === 'yes' ? 'Regulatory Demand' : 'Non-Regulatory'} solutions. (Note: This feature would integrate with the Explore tab filters)`);
        }, 200);
    };
    
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
                    <!-- Smoke Detectors Section -->
                    ${createSmokeDetectorsSection()}
                    
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
     * Create Smoke Detectors Section with table showing all products
     */
    function createSmokeDetectorsSection() {
        // Get portfolio data
        const portfolioData = window.State.getPortfolioData();
        
        if (!portfolioData || portfolioData.length === 0) {
            return '';
        }
        
        // Calculate smoke detectors for all products
        const productsWithDetectors = portfolioData.map(product => ({
            ...product,
            smokeDetectorCount: window.DataManager.calculateSmokeDetectors(product)
        }));
        
        // Filter to show only products with detectors > 0
        const productsAtRisk = productsWithDetectors.filter(p => p.smokeDetectorCount > 0);
        
        // Sort by detector count (highest first)
        productsAtRisk.sort((a, b) => b.smokeDetectorCount - a.smokeDetectorCount);
        
        // Count severity levels
        const critical = productsAtRisk.filter(p => p.smokeDetectorCount >= 3).length;
        const warning = productsAtRisk.filter(p => p.smokeDetectorCount > 0 && p.smokeDetectorCount < 3).length;
        
        if (productsAtRisk.length === 0) {
            return `
                <div class="anomaly-category">
                    <h3 class="anomaly-category-title">
                        🔍 Smoke Detectors (0)
                    </h3>
                    <p class="anomaly-category-desc">Early warning system for product health issues</p>
                    <div class="anomaly-empty-state" style="margin: 1rem 0;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <p style="color: #059669; font-weight: 600;">All products are healthy!</p>
                        <p style="color: #6b7280; font-size: 0.875rem;">No smoke detectors triggered</p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="anomaly-category smoke-detectors-section">
                <h3 class="anomaly-category-title">
                    🔍 Smoke Detectors (${productsAtRisk.length})
                    ${critical > 0 ? `<span class="sd-badge-critical">${critical} Critical</span>` : ''}
                    ${warning > 0 ? `<span class="sd-badge-warning">${warning} Warning</span>` : ''}
                </h3>
                <p class="anomaly-category-desc">
                    Early warning system detecting: downward trends, missing metrics, maturity signals, and high HC allocation
                </p>
                
                <div class="smoke-detectors-table-container">
                    <table class="smoke-detectors-table">
                        <thead>
                            <tr>
                                <th style="width: 5%;">SDs</th>
                                <th style="width: 25%;">Product Name</th>
                                <th style="width: 15%;">Owner</th>
                                <th style="width: 15%;">Area</th>
                                <th style="width: 15%;">Maturity</th>
                                <th style="width: 25%;">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsAtRisk.map(product => createSmokeDetectorRow(product)).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="smoke-detectors-legend">
                    <h4>Smoke Detector Rules:</h4>
                    <ul>
                        <li><strong>Detector 1:</strong> 📉 Downward metric trend (3+ consecutive months)</li>
                        <li><strong>Detector 2:</strong> 🚫 Missing UX or BI metrics</li>
                        <li><strong>Detector 3:</strong> ⚠️ Decline stage OR Growth/Mature with Sean Ellis Score &lt; 40%</li>
                        <li><strong>Detector 4:</strong> 👥 High BAU HC allocation (&gt; 2 people)</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    /**
     * Create a single row for the smoke detectors table
     */
    function createSmokeDetectorRow(product) {
        const count = product.smokeDetectorCount || 0;
        const severityClass = count >= 3 ? 'critical' : 'warning';
        const icon = count >= 3 ? '🚨' : '⚠️';
        
        return `
            <tr class="sd-row">
                <td>
                    <div class="sd-badge sd-badge-${severityClass} sd-badge-clickable" 
                         data-product-id="${product.id}"
                         data-product-name="${escapeHtml(product.name)}"
                         data-sd-count="${count}"
                         onclick="openSmokeDetectorDrillDown(${product.id}, '${escapeHtml(product.name)}', ${count})"
                         title="Click to see which detectors are triggered">
                        <span class="sd-badge-icon">${icon}</span>
                        <span class="sd-badge-count">${count}</span>
                    </div>
                </td>
                <td>
                    <strong>${escapeHtml(product.name)}</strong>
                </td>
                <td>${escapeHtml(product.owner || 'Not assigned')}</td>
                <td>${escapeHtml(product.area || 'N/A')}</td>
                <td>${escapeHtml(product.maturity || 'N/A')}</td>
                <td>
                    <button class="sd-action-btn" 
                            onclick="drillDownToProduct('${escapeHtml(product.name)}')"
                            title="View product details in Insights & Analytics">
                        🔍 View Details
                    </button>
                </td>
            </tr>
        `;
    }
    
    /**
     * Analyze which specific detectors are triggered for a product
     * Returns detailed breakdown for drill-down display
     */
    function analyzeSmokeDetectorsDetailed(product) {
        const detectors = [];
        
        // Helper functions
        const isInvalid = (val) => {
            if (val === null || val === undefined || val === '' || val === 'N/A' || val === '-') return true;
            if (typeof val === 'string' && val.trim() === '') return true;
            return false;
        };
        
        const isValidNumber = (val) => {
            if (isInvalid(val)) return false;
            const num = parseFloat(val);
            return !isNaN(num);
        };
        
        const hasDownwardTrend = (monthlyArray) => {
            if (!Array.isArray(monthlyArray) || monthlyArray.length < 3) return false;
            
            const validValues = [];
            for (let i = 0; i < monthlyArray.length; i++) {
                if (isValidNumber(monthlyArray[i])) {
                    validValues.push(parseFloat(monthlyArray[i]));
                }
            }
            
            if (validValues.length < 3) return false;
            
            let consecutiveDeclines = 0;
            for (let i = 1; i < validValues.length; i++) {
                if (validValues[i] < validValues[i - 1]) {
                    consecutiveDeclines++;
                    if (consecutiveDeclines >= 2) return true;
                } else {
                    consecutiveDeclines = 0;
                }
            }
            return false;
        };
        
        // DETECTOR 1: Downward Metric Trend
        const uxDownward = hasDownwardTrend(product.monthlyUX);
        const biDownward = hasDownwardTrend(product.monthlyBI);
        
        if (uxDownward || biDownward) {
            detectors.push({
                name: '📉 Downward Metric Trend',
                triggered: true,
                description: `${uxDownward ? 'UX metrics' : ''}${uxDownward && biDownward ? ' and ' : ''}${biDownward ? 'BI metrics' : ''} showing decline over 3+ consecutive months`,
                recommendation: 'Investigate root cause of declining metrics. Consider product improvements or resource reallocation.',
                severity: 'high'
            });
        } else {
            detectors.push({
                name: '📉 Downward Metric Trend',
                triggered: false,
                description: 'No sustained downward trend detected in metrics',
                severity: 'ok'
            });
        }
        
        // DETECTOR 2: Lacking Metrics
        const missingUXMetric = isInvalid(product.keyMetricUX);
        const missingBIMetric = isInvalid(product.keyMetricBI);
        
        if (missingUXMetric || missingBIMetric) {
            const missing = [];
            if (missingUXMetric) missing.push('User Experience');
            if (missingBIMetric) missing.push('Business Impact');
            
            detectors.push({
                name: '🚫 Lacking Metrics',
                triggered: true,
                description: `Missing key metrics: ${missing.join(', ')}`,
                recommendation: 'Define and implement tracking for missing metrics to enable data-driven decisions.',
                severity: 'high'
            });
        } else {
            detectors.push({
                name: '🚫 Lacking Metrics',
                triggered: false,
                description: 'All key metrics are defined',
                severity: 'ok'
            });
        }
        
        // DETECTOR 3: Maturity Signal
        const maturityStage = (product.maturity || '').toLowerCase().trim();
        const isDecline = maturityStage.includes('decline') || maturityStage === '4. decline';
        const isGrowth = maturityStage.includes('growth') || maturityStage === '2. growth';
        const isMature = maturityStage.includes('mature') || maturityStage === '3. mature';
        
        let maturityTriggered = false;
        let maturityDesc = '';
        let maturityRec = '';
        
        if (isDecline) {
            maturityTriggered = true;
            maturityDesc = 'Product is in Decline stage';
            maturityRec = 'Consider sunsetting strategy or major pivot to revitalize the product.';
        } else if (isGrowth || isMature) {
            const seanEllisScore = product.keyMetricUX;
            if (isInvalid(seanEllisScore)) {
                maturityTriggered = true;
                maturityDesc = `${isGrowth ? 'Growth' : 'Mature'} stage product missing Sean Ellis Score`;
                maturityRec = 'Conduct Sean Ellis survey to measure product-market fit and guide strategy.';
            } else if (isValidNumber(seanEllisScore) && parseFloat(seanEllisScore) < 40) {
                maturityTriggered = true;
                maturityDesc = `${isGrowth ? 'Growth' : 'Mature'} stage with Sean Ellis Score below 40% (${seanEllisScore}%)`;
                maturityRec = 'Low product-market fit score indicates need for product improvements or repositioning.';
            }
        }
        
        if (maturityTriggered) {
            detectors.push({
                name: '⚠️ Maturity Signal',
                triggered: true,
                description: maturityDesc,
                recommendation: maturityRec,
                severity: isDecline ? 'critical' : 'high'
            });
        } else {
            detectors.push({
                name: '⚠️ Maturity Signal',
                triggered: false,
                description: 'Maturity stage is healthy',
                severity: 'ok'
            });
        }
        
        // DETECTOR 4: High BAU HC Allocation
        // Note: This is a simplified check since HC extraction is heuristic
        detectors.push({
            name: '👥 High BAU HC Allocation',
            triggered: false, // We'll assume false for drill-down since extraction is complex
            description: 'HC allocation check (requires full data analysis)',
            severity: 'ok'
        });
        
        return detectors;
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
    
    /**
     * Open Smoke Detector drill-down modal showing which detectors are triggered
     * @param {number} productId - Product ID
     * @param {string} productName - Product name
     * @param {number} count - Number of triggered detectors
     */
    function openSmokeDetectorDrillDown(productId, productName, count) {
        console.log(`Opening smoke detector drill-down for product ID: ${productId}`);
        
        // Get product data
        const portfolioData = window.State.getPortfolioData();
        const product = portfolioData.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        // Analyze which detectors are triggered
        const detectorAnalysis = analyzeSmokeDetectorsDetailed(product);
        
        // Create modal HTML
        const modalHTML = `
            <div class="sd-modal-overlay" id="sd-modal-overlay" onclick="closeSmokeDetectorModal()">
                <div class="sd-modal" onclick="event.stopPropagation()">
                    <div class="sd-modal-header">
                        <h2>
                            🔍 Smoke Detector Analysis
                        </h2>
                        <button class="sd-modal-close" onclick="closeSmokeDetectorModal()" title="Close">✕</button>
                    </div>
                    
                    <div class="sd-modal-product-info">
                        <h3>${escapeHtml(productName)}</h3>
                        <div class="sd-modal-meta">
                            <span>Owner: ${escapeHtml(product.owner || 'Not assigned')}</span>
                            <span>Area: ${escapeHtml(product.area || 'N/A')}</span>
                            <span>Maturity: ${escapeHtml(product.maturity || 'N/A')}</span>
                        </div>
                        <div class="sd-modal-score">
                            ${count >= 3 ? '🚨' : '⚠️'} 
                            <strong>${count} Smoke Detector${count > 1 ? 's' : ''}</strong> Triggered
                            ${count >= 3 ? '<span class="sd-critical-label">CRITICAL</span>' : '<span class="sd-warning-label">WARNING</span>'}
                        </div>
                    </div>
                    
                    <div class="sd-modal-body">
                        <div class="sd-detectors-list">
                            ${detectorAnalysis.map(detector => `
                                <div class="sd-detector-item ${detector.triggered ? 'sd-triggered' : 'sd-ok'}">
                                    <div class="sd-detector-header">
                                        <span class="sd-detector-status">
                                            ${detector.triggered ? '🚨' : '✅'}
                                        </span>
                                        <h4 class="sd-detector-name">${detector.name}</h4>
                                        ${detector.triggered ? '<span class="sd-detector-badge">TRIGGERED</span>' : ''}
                                    </div>
                                    <p class="sd-detector-desc">${detector.description}</p>
                                    ${detector.triggered && detector.recommendation ? `
                                        <div class="sd-detector-recommendation">
                                            <strong>💡 Recommendation:</strong> ${detector.recommendation}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sd-modal-footer">
                        <button class="sd-btn-secondary" onclick="closeSmokeDetectorModal()">
                            Close
                        </button>
                        <button class="sd-btn-primary" onclick="drillDownToProduct('${escapeHtml(productName)}'); closeSmokeDetectorModal();">
                            🔍 View Full Product Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close smoke detector modal
     */
    function closeSmokeDetectorModal() {
        const modal = document.getElementById('sd-modal-overlay');
        if (modal) {
            modal.remove();
        }
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    /**
     * Drill down to a specific product in Insights & Analytics
     * @param {string} productName - Name of the product
     */
    function drillDownToProduct(productName) {
        console.log('Drilling down to product:', productName);
        
        // Use existing drill-down infrastructure
        if (window.UIManager && window.UIManager.DrillDown) {
            window.UIManager.DrillDown.drillToInsights({
                type: 'data-health',
                productName: productName
            });
        }
    }
    
    // Export to UIManager namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Planning = {
        render: renderPlanningView
    };
    
    // Global exports for onclick handlers
    window.openSmokeDetectorDrillDown = openSmokeDetectorDrillDown;
    window.closeSmokeDetectorModal = closeSmokeDetectorModal;
    window.drillDownToProduct = drillDownToProduct;
    
    console.log('✅ UI Planning module loaded');
})();
