/**
 * UI Insights Module
 * Handles Insights & Analytics tab (merged Descriptive Analysis + Strategic View)
 * 
 * Part of the modular UI architecture refactor
 * This is the largest module combining executive metrics, detailed analytics, and legacy views
 */

(function() {
    'use strict';
    
    // Helper function for HTML escaping
    function escapeHtml(text) {
        if (window.Utils && window.Utils.escapeHtml) {
            return window.Utils.escapeHtml(text);
        }
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
    
    // ==================== MAIN RENDER FUNCTION ====================
    
    /**
     * Render Insights & Analytics tab
     * Main entry point for the Insights & Analytics view
     */
    async function renderInsightsAnalytics() {
        console.log('Rendering Insights & Analytics...');
        
        const insightsContent = document.getElementById('insights-content');
        const insightsLoading = document.getElementById('insights-loading');
        
        if (!insightsContent) {
            console.error('Insights content container not found');
            return;
        }
        
        try {
            // Show loading state
            insightsLoading.classList.remove('hidden');
            insightsContent.innerHTML = '';
            
            // Get portfolio data
            let portfolioData = window.State.getPortfolioData();
            
            // Check if we have portfolio data to analyze
            if (!portfolioData || portfolioData.length === 0) {
                // Try to load from cache
                portfolioData = window.DataManager.loadCachedData();
                if (!portfolioData || portfolioData.length === 0) {
                    throw new Error('No portfolio data available. Please load the Explore tab first.');
                }
                console.log('Using cached portfolio data for insights');
            }
            
            console.log(`Analyzing ${portfolioData.length} solutions for insights...`);
            
            // Get both executive metrics and descriptive analysis
            const metrics = window.DataManager.calculatePortfolioMetrics();
            const analysis = window.DataManager.analyzePortfolioData(portfolioData);
            
            // Check if we have valid data
            if (!metrics || !analysis) {
                throw new Error('Unable to calculate portfolio metrics. Please refresh data.');
            }
            
            // Clear and start building the consolidated view
            insightsContent.innerHTML = '';
            
            // ========== SECTION 1: EXECUTIVE SUMMARY ==========
            const executiveSummarySection = createExecutiveSummarySection(metrics);
            insightsContent.appendChild(executiveSummarySection);
            
            // ========== SECTION 2: DETAILED BREAKDOWNS ==========
            const detailedBreakdownsSection = createDetailedBreakdownsSection(analysis, metrics);
            insightsContent.appendChild(detailedBreakdownsSection);
            
            // ========== SECTION 3: DEEP ANALYTICS ==========
            const deepAnalyticsSection = createDeepAnalyticsSection(analysis);
            insightsContent.appendChild(deepAnalyticsSection);
            
            // Mark as loaded in State
            window.State.setAnalysisDataLoaded(true);
            
            // Check for active drill-down filter
            const drillDownFilter = window.State.getDrillDownFilter?.();
            if (drillDownFilter && drillDownFilter.active) {
                console.log('Drill-down filter detected, applying...');
                setTimeout(() => {
                    if (window.UIManager.DrillDown && window.UIManager.DrillDown.applyFilter) {
                        window.UIManager.DrillDown.applyFilter();
                    }
                }, 150);
            }
            
            console.log('✅ Insights & Analytics rendered successfully');
            
        } catch (error) {
            console.error('Error loading insights & analytics:', error);
            insightsContent.innerHTML = `
                <div class="analysis-section">
                    <h2>⚠️ Error Loading Insights</h2>
                    <p style="color: #ef4444; margin-bottom: 1rem; font-size: 1rem;">${escapeHtml(error.message)}</p>
                    <p style="color: #6b7280; margin-bottom: 1rem;">Please ensure the Explore tab has loaded data first.</p>
                    <button class="refresh-btn" onclick="switchTab('portfolio-overview')" style="margin-top: 1rem;">
                        Go to Explore
                    </button>
                </div>
            `;
        } finally {
            insightsLoading.classList.add('hidden');
        }
    }
    
    // ==================== SECTION CREATORS ====================
    
    /**
     * SECTION 1: Executive Summary
     * Contains Health Score, Target Achievement, and Risk Distribution
     */
    function createExecutiveSummarySection(metrics) {
        const section = document.createElement('div');
        section.className = 'insights-section executive-summary-section';
        section.id = 'executive-summary-section';
        
        // Create section header
        const header = document.createElement('div');
        header.className = 'insights-section-header';
        header.innerHTML = `
            <h2 class="insights-section-title">📊 Executive Summary</h2>
            <p class="insights-section-subtitle">Portfolio health at a glance</p>
        `;
        section.appendChild(header);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'executive-summary-content';
        
        // Health Score Card
        const healthCard = createHealthScoreSection(metrics);
        content.appendChild(healthCard);
        
        // KPI Cards for Drill-Down
        const kpiCards = createDrillDownKPICards(metrics);
        content.appendChild(kpiCards);
        
        // Risk & Opportunity Matrix
        const riskMatrix = createRiskOpportunityMatrix(metrics);
        content.appendChild(riskMatrix);
        
        section.appendChild(content);
        return section;
    }
    
    /**
     * SECTION 2: Detailed Breakdowns
     * Contains Maturity, Area, and Owner distributions
     */
    function createDetailedBreakdownsSection(analysis, metrics) {
        const section = document.createElement('div');
        section.className = 'insights-section detailed-breakdowns-section';
        section.id = 'detailed-breakdowns-section';
        
        // Create section header
        const header = document.createElement('div');
        header.className = 'insights-section-header';
        header.innerHTML = `
            <h2 class="insights-section-title">🔍 Detailed Breakdowns</h2>
            <p class="insights-section-subtitle">Portfolio composition and distribution</p>
        `;
        section.appendChild(header);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'detailed-breakdowns-content';
        
        // Sort data for display
        const sortedStages = Object.entries(analysis.stageCount).sort((a, b) => b[1] - a[1]);
        const sortedAreas = Object.entries(analysis.areaCount).sort((a, b) => b[1] - a[1]);
        const sortedOwners = Object.entries(analysis.ownerCount).sort((a, b) => b[1] - a[1]);
        
        // Calculate key insights
        const topStage = sortedStages[0];
        const topStagePercentage = Math.round((topStage[1] / analysis.totalSolutions) * 100);
        
        // Create charts grid
        const chartsGrid = document.createElement('div');
        chartsGrid.className = 'analysis-chart-grid';
        chartsGrid.innerHTML = `
            <!-- Maturity Stage Distribution -->
            <div class="analysis-chart-container">
                <h3>🔄 Solutions by Maturity Stage</h3>
                <div class="analysis-chart-wrapper">
                    <canvas id="insights-chart-stages"></canvas>
                </div>
                <div class="analysis-highlight">
                    <p><strong>Key Insight:</strong> ${topStagePercentage}% are in the "${escapeHtml(topStage[0])}" stage.</p>
                </div>
            </div>

            <!-- P&C Area Distribution -->
            <div class="analysis-chart-container">
                <h3>🏢 Solutions by P&C Area</h3>
                <div class="analysis-chart-wrapper">
                    <canvas id="insights-chart-areas"></canvas>
                </div>
            </div>
        `;
        
        content.appendChild(chartsGrid);
        
        // Owner Distribution (Top 10)
        const ownerChart = document.createElement('div');
        ownerChart.className = 'analysis-chart-container';
        ownerChart.style.marginTop = '2rem';
        ownerChart.innerHTML = `
            <h3>👥 Top 10 Product Owners</h3>
            <div class="analysis-chart-wrapper" style="height: 400px;">
                <canvas id="insights-chart-owners"></canvas>
            </div>
            ${sortedOwners.length > 10 ? `<p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem; text-align: center;">Showing top 10 of ${sortedOwners.length} owners</p>` : ''}
        `;
        content.appendChild(ownerChart);
        
        section.appendChild(content);
        
        // Create charts after DOM is updated
        setTimeout(() => createInsightsBreakdownCharts(analysis, sortedStages, sortedAreas, sortedOwners), 100);
        
        return section;
    }
    
    /**
     * SECTION 3: Deep Analytics
     * Contains detailed statistics, metrics coverage, and regulatory compliance
     */
    function createDeepAnalyticsSection(analysis) {
        const section = document.createElement('div');
        section.className = 'insights-section deep-analytics-section';
        section.id = 'deep-analytics-section';
        
        // Create section header
        const header = document.createElement('div');
        header.className = 'insights-section-header';
        header.innerHTML = `
            <h2 class="insights-section-title">📈 Deep Analytics</h2>
            <p class="insights-section-subtitle">Comprehensive portfolio metrics and insights</p>
        `;
        section.appendChild(header);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'deep-analytics-content';
        
        // Calculate percentages
        const metricsPercentage = Math.round((analysis.metrics.withAnyMetric / analysis.totalSolutions) * 100);
        const bothMetricsPercentage = Math.round((analysis.metrics.withBothMetrics / analysis.totalSolutions) * 100);
        const regulatoryPercentage = Math.round((analysis.regulatory / analysis.totalSolutions) * 100);
        
        // Portfolio Overview Stats
        const statsCard = document.createElement('div');
        statsCard.className = 'analysis-section';
        statsCard.innerHTML = `
            <h3>📊 Portfolio Overview</h3>
            <div class="analysis-stats-grid">
                <div class="analysis-stat-card">
                    <div class="analysis-stat-label">Total Solutions</div>
                    <div class="analysis-stat-value">${analysis.totalSolutions}</div>
                </div>
                <div class="analysis-stat-card">
                    <div class="analysis-stat-label">Maturity Stages</div>
                    <div class="analysis-stat-value">${Object.keys(analysis.stageCount).length}</div>
                </div>
                <div class="analysis-stat-card">
                    <div class="analysis-stat-label">P&C Areas</div>
                    <div class="analysis-stat-value">${Object.keys(analysis.areaCount).length}</div>
                </div>
                <div class="analysis-stat-card">
                    <div class="analysis-stat-label">Product Owners</div>
                    <div class="analysis-stat-value">${Object.keys(analysis.ownerCount).length}</div>
                </div>
            </div>
        `;
        content.appendChild(statsCard);
        
        // Charts Grid for Metrics and Regulatory
        const chartsGrid = document.createElement('div');
        chartsGrid.className = 'analysis-chart-grid';
        chartsGrid.style.marginTop = '2rem';
        chartsGrid.innerHTML = `
            <!-- Key Metrics Coverage -->
            <div class="analysis-chart-container">
                <h3>📈 Key Metrics Coverage</h3>
                <div class="analysis-chart-wrapper">
                    <canvas id="insights-chart-metrics"></canvas>
                </div>
                <div class="analysis-highlight">
                    <p><strong>Coverage:</strong> ${metricsPercentage}% have at least one metric (${bothMetricsPercentage}% have both)</p>
                </div>
            </div>

            <!-- Regulatory Compliance -->
            <div class="analysis-chart-container">
                <h3>⚖️ Regulatory Compliance</h3>
                <div class="analysis-chart-wrapper">
                    <canvas id="insights-chart-regulatory"></canvas>
                </div>
                <div class="analysis-highlight">
                    <p><strong>Regulatory Mix:</strong> ${regulatoryPercentage}% are driven by regulatory demands.</p>
                </div>
            </div>
        `;
        content.appendChild(chartsGrid);
        
        section.appendChild(content);
        
        // Create charts after DOM is updated
        setTimeout(() => createInsightsDeepAnalyticsCharts(analysis), 100);
        
        return section;
    }
    
    // ==================== EXECUTIVE VIEW (STRATEGIC VIEW) ====================
    
    /**
     * Render Executive View with comprehensive portfolio metrics and visualizations
     * This is the upgraded Strategic View with enhanced executive insights
     */
    function renderExecutiveView() {
        console.log('Rendering Executive View...');
        
        const executiveContent = document.getElementById('executive-content');
        
        if (!executiveContent) {
            console.error('Executive content container not found');
            return;
        }
        
        // Get metrics from Data Manager
        const metrics = window.DataManager.calculatePortfolioMetrics();
        
        // Check if we have data to analyze
        if (!metrics) {
            executiveContent.innerHTML = `
                <div class="executive-empty-state">
                    <h2>⚠️ No Data Available</h2>
                    <p>Please load the Portfolio Overview tab first to see executive metrics.</p>
                    <button class="refresh-btn" onclick="window.UIManager.switchTab('portfolio-overview')" style="margin-top: 1.5rem;">
                        Go to Portfolio Overview
                    </button>
                </div>
            `;
            return;
        }
        
        console.log('Executive metrics loaded:', metrics);
        
        // Clear and start building
        executiveContent.innerHTML = '';
        
        // ========== 1. PORTFOLIO HEALTH SCORE ==========
        const healthSection = createHealthScoreSection(metrics);
        executiveContent.appendChild(healthSection);
        
        // ========== 1.5. CLICKABLE KPI CARDS FOR DRILL-DOWN ==========
        const kpiCardsSection = createDrillDownKPICards(metrics);
        executiveContent.appendChild(kpiCardsSection);
        
        // ========== 2. RISK & OPPORTUNITY MATRIX ==========
        const matrixSection = createRiskOpportunityMatrix(metrics);
        executiveContent.appendChild(matrixSection);
        
        // ========== 3. RISK & OPPORTUNITY LISTS ==========
        const listsSection = createRiskOpportunityLists(metrics);
        executiveContent.appendChild(listsSection);
        
        // ========== 4. STRATEGIC ALIGNMENT CHARTS ==========
        const chartsSection = createStrategicAlignmentCharts(metrics);
        executiveContent.appendChild(chartsSection);
        
        console.log('✅ Executive View rendered successfully');
    }
    
    // Keep old strategic view function as alias for backward compatibility
    function renderStrategicView() {
        renderExecutiveView();
    }
    
    // ==================== CHART CREATORS ====================
    
    /**
     * Create charts for Detailed Breakdowns section
     */
    function createInsightsBreakdownCharts(analysis, sortedStages, sortedAreas, sortedOwners) {
        const stageColors = {
            '1. Development': 'rgba(59, 130, 246, 0.85)',
            '2. Growth': 'rgba(16, 185, 129, 0.85)',
            '3. Mature': 'rgba(168, 85, 247, 0.85)',
            '4. Decline': 'rgba(251, 146, 60, 0.85)'
        };
        
        const defaultColors = [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(251, 146, 60, 0.8)'
        ];
        
        // 1. Maturity Stage Chart
        const stagesCanvas = document.getElementById('insights-chart-stages');
        if (stagesCanvas) {
            new Chart(stagesCanvas, {
                type: 'bar',
                data: {
                    labels: sortedStages.map(([stage]) => stage),
                    datasets: [{
                        label: 'Number of Solutions',
                        data: sortedStages.map(([_, count]) => count),
                        backgroundColor: sortedStages.map(([stage]) => stageColors[stage] || defaultColors[0]),
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
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 }
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
        
        // 2. P&C Area Chart
        const areasCanvas = document.getElementById('insights-chart-areas');
        if (areasCanvas) {
            new Chart(areasCanvas, {
                type: 'bar',
                data: {
                    labels: sortedAreas.map(([area]) => area),
                    datasets: [{
                        label: 'Number of Solutions',
                        data: sortedAreas.map(([_, count]) => count),
                        backgroundColor: defaultColors,
                        borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: { size: 12 } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                        },
                        y: {
                            ticks: { font: { size: 12, weight: '600' } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
        
        // 3. Top 10 Owners Chart
        const ownersCanvas = document.getElementById('insights-chart-owners');
        if (ownersCanvas) {
            const top10Owners = sortedOwners.slice(0, 10);
            new Chart(ownersCanvas, {
                type: 'bar',
                data: {
                    labels: top10Owners.map(([owner]) => owner),
                    datasets: [{
                        label: 'Number of Solutions',
                        data: top10Owners.map(([_, count]) => count),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: { size: 12 } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                        },
                        y: {
                            ticks: { font: { size: 11 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
        
        console.log('✅ Breakdown charts created');
    }
    
    /**
     * Create charts for Deep Analytics section
     */
    function createInsightsDeepAnalyticsCharts(analysis) {
        // 1. Key Metrics Chart
        const metricsCanvas = document.getElementById('insights-chart-metrics');
        if (metricsCanvas) {
            new Chart(metricsCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['UX Only', 'BI Only', 'Both Metrics', 'No Metrics'],
                    datasets: [{
                        data: [
                            analysis.metrics.withUXMetric - analysis.metrics.withBothMetrics,
                            analysis.metrics.withBIMetric - analysis.metrics.withBothMetrics,
                            analysis.metrics.withBothMetrics,
                            analysis.metrics.withoutMetrics
                        ],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(156, 163, 175, 0.6)'
                        ],
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
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // 2. Regulatory Chart
        const regulatoryCanvas = document.getElementById('insights-chart-regulatory');
        if (regulatoryCanvas) {
            new Chart(regulatoryCanvas, {
                type: 'pie',
                data: {
                    labels: ['Regulatory', 'Non-Regulatory'],
                    datasets: [{
                        data: [analysis.regulatory, analysis.nonRegulatory],
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(59, 130, 246, 0.8)'
                        ],
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
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        console.log('✅ Deep analytics charts created');
    }
    
    // ==================== EXECUTIVE VIEW HELPER FUNCTIONS ====================
    
    /**
     * Create Portfolio Health Score section with narrative
     */
    function createHealthScoreSection(metrics) {
        const section = document.createElement('div');
        section.className = 'executive-section';
        
        // Determine health level and color
        const score = metrics.healthScore;
        let scoreClass, scoreLabel;
        
        if (score >= 80) {
            scoreClass = 'score-excellent';
            scoreLabel = 'Excellent';
        } else if (score >= 65) {
            scoreClass = 'score-good';
            scoreLabel = 'Good';
        } else if (score >= 50) {
            scoreClass = 'score-fair';
            scoreLabel = 'Fair';
        } else {
            scoreClass = 'score-poor';
            scoreLabel = 'Needs Attention';
        }
        
        // Build health score breakdown HTML
        let breakdownHTML = '';
        if (metrics.healthScoreBreakdown && metrics.healthScoreBreakdown.length > 0) {
            breakdownHTML = `
                <div class="health-score-breakdown">
                    <h3 class="health-breakdown-title">Key Factors Affecting Health Score:</h3>
                    <ul class="health-breakdown-list">
                        ${metrics.healthScoreBreakdown.map((factor) => `
                            <li class="health-breakdown-item" data-type="${factor.type}">
                                <span class="health-breakdown-icon">${factor.icon}</span>
                                <div class="health-breakdown-content">
                                    <div class="health-breakdown-message">${escapeHtml(factor.message)}</div>
                                    <div class="health-breakdown-details">${escapeHtml(factor.details)}</div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        section.innerHTML = `
            <h2 class="executive-section-title">📊 Portfolio Health Score</h2>
            <p class="executive-section-subtitle">Composite metric based on performance (60%) and risk management (40%)</p>
            
            <div class="health-score-container">
                <div class="health-score-label">Overall Portfolio Health</div>
                <div class="health-score-display ${scoreClass}">${score}</div>
                
                <div class="health-score-bar">
                    <div class="health-score-fill ${scoreClass}" style="width: ${score}%"></div>
                </div>
                
                <div class="health-score-metadata">
                    <div class="health-score-meta-item">
                        <div class="health-score-meta-value">${metrics.totalProducts}</div>
                        <div class="health-score-meta-label">Total Products</div>
                    </div>
                    <div class="health-score-meta-item">
                        <div class="health-score-meta-value">${metrics.avgPerformanceScore}%</div>
                        <div class="health-score-meta-label">Avg Performance</div>
                    </div>
                    <div class="health-score-meta-item">
                        <div class="health-score-meta-value">${metrics.avgRiskScore}/10</div>
                        <div class="health-score-meta-label">Avg Risk Score</div>
                    </div>
                </div>
                
                ${breakdownHTML}
            </div>
        `;
        
        // Add narrative
        const narrative = generateHealthScoreNarrative(metrics, scoreLabel);
        const narrativeDiv = document.createElement('div');
        narrativeDiv.className = 'executive-narrative';
        narrativeDiv.innerHTML = narrative;
        section.appendChild(narrativeDiv);
        
        return section;
    }
    
    /**
     * Create Drill-Down KPI Cards
     */
    function createDrillDownKPICards(metrics) {
        const section = document.createElement('div');
        section.className = 'executive-section kpi-drill-down-section';
        
        section.innerHTML = `
            <h2 class="executive-section-title">🎯 Portfolio Command Center</h2>
            <p class="executive-section-subtitle">Click any card to drill down into specific product segments</p>
            
            <div class="kpi-cards-grid">
                <div class="kpi-drill-card high-risk" onclick="drillDownToTacticalView('high-risk')">
                    <div class="kpi-drill-card-icon">🚨</div>
                    <div class="kpi-drill-card-content">
                        <div class="kpi-drill-card-value">${metrics.riskBreakdown.high}</div>
                        <div class="kpi-drill-card-label">High Risk Products</div>
                        <div class="kpi-drill-card-sublabel">Risk Score ≥ 7</div>
                    </div>
                    <div class="kpi-drill-card-action">
                        <span class="kpi-drill-card-arrow">→</span>
                    </div>
                </div>
                
                <div class="kpi-drill-card medium-risk" onclick="drillDownToTacticalView('medium-risk')">
                    <div class="kpi-drill-card-icon">⚠️</div>
                    <div class="kpi-drill-card-content">
                        <div class="kpi-drill-card-value">${metrics.riskBreakdown.medium}</div>
                        <div class="kpi-drill-card-label">Medium Risk Products</div>
                        <div class="kpi-drill-card-sublabel">Risk Score 4-6</div>
                    </div>
                    <div class="kpi-drill-card-action">
                        <span class="kpi-drill-card-arrow">→</span>
                    </div>
                </div>
                
                <div class="kpi-drill-card low-risk" onclick="drillDownToTacticalView('low-risk')">
                    <div class="kpi-drill-card-icon">✅</div>
                    <div class="kpi-drill-card-content">
                        <div class="kpi-drill-card-value">${metrics.riskBreakdown.low}</div>
                        <div class="kpi-drill-card-label">Low Risk Products</div>
                        <div class="kpi-drill-card-sublabel">Risk Score < 4</div>
                    </div>
                    <div class="kpi-drill-card-action">
                        <span class="kpi-drill-card-arrow">→</span>
                    </div>
                </div>
                
                <div class="kpi-drill-card below-target" onclick="drillDownToTacticalView('below-target')">
                    <div class="kpi-drill-card-icon">📉</div>
                    <div class="kpi-drill-card-content">
                        <div class="kpi-drill-card-value">${metrics.productMetrics.filter(p => p.performanceScore > 0 && p.performanceScore < 50).length}</div>
                        <div class="kpi-drill-card-label">Below Target</div>
                        <div class="kpi-drill-card-sublabel">Performance < 50%</div>
                    </div>
                    <div class="kpi-drill-card-action">
                        <span class="kpi-drill-card-arrow">→</span>
                    </div>
                </div>
                
                <div class="kpi-drill-card star-performers" onclick="drillDownToTacticalView('star-performers')">
                    <div class="kpi-drill-card-icon">🌟</div>
                    <div class="kpi-drill-card-content">
                        <div class="kpi-drill-card-value">${metrics.starPerformers}</div>
                        <div class="kpi-drill-card-label">Star Performers</div>
                        <div class="kpi-drill-card-sublabel">Low Risk + High Performance</div>
                    </div>
                    <div class="kpi-drill-card-action">
                        <span class="kpi-drill-card-arrow">→</span>
                    </div>
                </div>
                
                <div class="kpi-drill-card products-at-risk" onclick="drillDownToTacticalView('products-at-risk')">
                    <div class="kpi-drill-card-icon">⛔</div>
                    <div class="kpi-drill-card-content">
                        <div class="kpi-drill-card-value">${metrics.productsAtRisk}</div>
                        <div class="kpi-drill-card-label">Critical Products</div>
                        <div class="kpi-drill-card-sublabel">High Risk + Low Performance</div>
                    </div>
                    <div class="kpi-drill-card-action">
                        <span class="kpi-drill-card-arrow">→</span>
                    </div>
                </div>
            </div>
            
            <div class="kpi-drill-hint">
                💡 <strong>Tip:</strong> Click any card above to view filtered products in Portfolio Overview
            </div>
        `;
        
        return section;
    }
    
    /**
     * Create Risk & Opportunity Matrix
     */
    function createRiskOpportunityMatrix(metrics) {
        const section = document.createElement('div');
        section.className = 'executive-section';
        
        section.innerHTML = `
            <h2 class="executive-section-title">📊 Risk & Opportunity Matrix</h2>
            <p class="executive-section-subtitle">Portfolio positioning based on risk level and performance opportunity</p>
            
            <div class="matrix-container">
                <div class="matrix-chart-wrapper">
                    <canvas id="chart-risk-opportunity-matrix"></canvas>
                </div>
                <div class="matrix-legend">
                    <h4 class="matrix-legend-title">Quadrants:</h4>
                    <div class="matrix-legend-items">
                        <div class="matrix-legend-item">
                            <span class="matrix-legend-color" style="background-color: rgba(16, 185, 129, 0.7);"></span>
                            <span class="matrix-legend-label"><strong>Star Performers</strong> - Low Risk, High Performance</span>
                        </div>
                        <div class="matrix-legend-item">
                            <span class="matrix-legend-color" style="background-color: rgba(245, 158, 11, 0.7);"></span>
                            <span class="matrix-legend-label"><strong>Monitor</strong> - High Risk, High Performance</span>
                        </div>
                        <div class="matrix-legend-item">
                            <span class="matrix-legend-color" style="background-color: rgba(251, 191, 36, 0.7);"></span>
                            <span class="matrix-legend-label"><strong>Improve</strong> - Low Risk, Low Performance</span>
                        </div>
                        <div class="matrix-legend-item">
                            <span class="matrix-legend-color" style="background-color: rgba(239, 68, 68, 0.7);"></span>
                            <span class="matrix-legend-label"><strong>Critical</strong> - High Risk, Low Performance</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create chart after DOM insertion
        setTimeout(() => createRiskOpportunityScatterChart(metrics), 100);
        
        // Add narrative
        const narrative = generateMatrixNarrative(metrics);
        const narrativeDiv = document.createElement('div');
        narrativeDiv.className = 'executive-narrative';
        narrativeDiv.innerHTML = narrative;
        section.appendChild(narrativeDiv);
        
        return section;
    }
    
    /**
     * Create Risk & Opportunity scatter chart
     */
    function createRiskOpportunityScatterChart(metrics) {
        const canvas = document.getElementById('chart-risk-opportunity-matrix');
        if (!canvas) return;
        
        const dataByQuadrant = { star: [], monitor: [], improve: [], critical: [] };
        
        metrics.riskOpportunityData.forEach(product => {
            dataByQuadrant[product.quadrant].push({
                x: product.riskScore,
                y: product.performanceScore,
                productName: product.name,
                area: product.area,
                maturity: product.maturity
            });
        });
        
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Star Performers',
                        data: dataByQuadrant.star,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    },
                    {
                        label: 'Monitor',
                        data: dataByQuadrant.monitor,
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        borderWidth: 2,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    },
                    {
                        label: 'Improve',
                        data: dataByQuadrant.improve,
                        backgroundColor: 'rgba(251, 191, 36, 0.7)',
                        borderColor: 'rgba(251, 191, 36, 1)',
                        borderWidth: 2,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    },
                    {
                        label: 'Critical',
                        data: dataByQuadrant.critical,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 2,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        callbacks: {
                            title: (context) => context[0].raw.productName || 'Product',
                            label: (context) => [
                                `Risk Score: ${context.parsed.x.toFixed(1)}/10`,
                                `Performance: ${context.parsed.y.toFixed(0)}%`,
                                `Area: ${context.raw.area || 'N/A'}`,
                                `Maturity: ${context.raw.maturity || 'N/A'}`
                            ]
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Risk Score (Lower is Better) →' },
                        min: 0,
                        max: 10,
                        ticks: { stepSize: 1 }
                    },
                    y: {
                        title: { display: true, text: '↑ Performance Score (Higher is Better)' },
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create Risk & Opportunity Lists
     */
    function createRiskOpportunityLists(metrics) {
        const section = document.createElement('div');
        section.className = 'executive-section';
        
        section.innerHTML = `
            <h2 class="executive-section-title">🎯 Risk & Opportunity Analysis</h2>
            <p class="executive-section-subtitle">Top products requiring attention and best performers to leverage</p>
            
            <div class="executive-lists-grid">
                <div class="executive-list-card">
                    <h3 class="executive-list-title risks">🚨 Top 3 Risks</h3>
                    <ul class="executive-list" id="top-risks-list"></ul>
                </div>
                
                <div class="executive-list-card">
                    <h3 class="executive-list-title opportunities">🌟 Top 3 Opportunities</h3>
                    <ul class="executive-list" id="top-opportunities-list"></ul>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            populateRisksList(metrics.topRisks);
            populateOpportunitiesList(metrics.topOpportunities);
        }, 0);
        
        const narrative = generateRiskOpportunityNarrative(metrics);
        const narrativeDiv = document.createElement('div');
        narrativeDiv.className = 'executive-narrative';
        narrativeDiv.innerHTML = narrative;
        section.appendChild(narrativeDiv);
        
        return section;
    }
    
    /**
     * Populate risks and opportunities lists
     */
    function populateRisksList(topRisks) {
        const list = document.getElementById('top-risks-list');
        if (!list) return;
        
        if (topRisks.length === 0) {
            list.innerHTML = '<li style="padding: 1rem; text-align: center; color: #6b7280;">No high-risk products identified</li>';
            return;
        }
        
        list.innerHTML = topRisks.map((risk, index) => `
            <li class="executive-list-item risk">
                <span class="executive-list-item-rank">${index + 1}</span>
                <div style="flex: 1;">
                    <div class="executive-list-item-name">${escapeHtml(risk.name)}</div>
                    <div class="executive-list-item-details">
                        <span class="executive-list-item-score">Risk: ${risk.riskScore.toFixed(1)}/10</span>
                        <span>${escapeHtml(risk.area)}</span>
                        <span>${escapeHtml(risk.maturity)}</span>
                    </div>
                </div>
            </li>
        `).join('');
    }
    
    function populateOpportunitiesList(topOpportunities) {
        const list = document.getElementById('top-opportunities-list');
        if (!list) return;
        
        if (topOpportunities.length === 0) {
            list.innerHTML = '<li style="padding: 1rem; text-align: center; color: #6b7280;">No high-performing products identified</li>';
            return;
        }
        
        list.innerHTML = topOpportunities.map((opp, index) => `
            <li class="executive-list-item opportunity">
                <span class="executive-list-item-rank">${index + 1}</span>
                <div style="flex: 1;">
                    <div class="executive-list-item-name">${escapeHtml(opp.name)}</div>
                    <div class="executive-list-item-details">
                        <span class="executive-list-item-score">Performance: ${opp.performanceScore}%</span>
                        <span>${escapeHtml(opp.area)}</span>
                        <span>${escapeHtml(opp.maturity)}</span>
                    </div>
                </div>
            </li>
        `).join('');
    }
    
    /**
     * Create Strategic Alignment Charts
     */
    function createStrategicAlignmentCharts(metrics) {
        const section = document.createElement('div');
        section.className = 'executive-section';
        
        section.innerHTML = `
            <h2 class="executive-section-title">🎯 Strategic Alignment & Resource Allocation</h2>
            <p class="executive-section-subtitle">Product distribution across areas and maturity stages</p>
            
            <div class="executive-charts-grid">
                <div class="executive-chart-card">
                    <h3 class="executive-chart-title">📍 Products by P&C Area</h3>
                    <div class="executive-chart-wrapper">
                        <canvas id="chart-alignment-area"></canvas>
                    </div>
                </div>
                
                <div class="executive-chart-card">
                    <h3 class="executive-chart-title">📈 Products by Maturity Stage</h3>
                    <div class="executive-chart-wrapper">
                        <canvas id="chart-allocation-maturity"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => createAlignmentCharts(metrics), 100);
        
        const narrative = generateStrategicAlignmentNarrative(metrics);
        const narrativeDiv = document.createElement('div');
        narrativeDiv.className = 'executive-narrative';
        narrativeDiv.innerHTML = narrative;
        section.appendChild(narrativeDiv);
        
        return section;
    }
    
    /**
     * Create alignment charts
     */
    function createAlignmentCharts(metrics) {
        const areaCanvas = document.getElementById('chart-alignment-area');
        if (areaCanvas) {
            const areaData = Object.entries(metrics.alignmentByArea).sort((a, b) => b[1] - a[1]);
            new Chart(areaCanvas, {
                type: 'pie',
                data: {
                    labels: areaData.map(([area]) => area),
                    datasets: [{
                        data: areaData.map(([, count]) => count),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(236, 72, 153, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((context.parsed / total) * 100);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        const maturityCanvas = document.getElementById('chart-allocation-maturity');
        if (maturityCanvas) {
            const maturityData = Object.entries(metrics.allocationByMaturity).sort((a, b) => {
                const order = ['1. Development', '2. Growth', '3. Mature', '4. Decline'];
                return order.indexOf(a[0]) - order.indexOf(b[0]);
            });
            
            new Chart(maturityCanvas, {
                type: 'bar',
                data: {
                    labels: maturityData.map(([stage]) => stage),
                    datasets: [{
                        label: 'Number of Products',
                        data: maturityData.map(([, count]) => count),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(251, 146, 60, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }
    }
    
    // ==================== NARRATIVE GENERATORS ====================
    
    function generateHealthScoreNarrative(metrics, scoreLabel) {
        const score = metrics.healthScore;
        let narrative = `The portfolio's health is <span class="highlight">${scoreLabel}</span> with a score of <strong>${score}/100</strong>. `;
        
        if (score >= 80) {
            narrative += `This indicates <strong>strong portfolio performance</strong> with well-managed risks.`;
        } else if (score >= 65) {
            narrative += `This indicates <strong>solid portfolio performance</strong> with manageable risks.`;
        } else if (score >= 50) {
            narrative += `This indicates <strong>moderate portfolio health</strong> with some concerns. Immediate attention needed for ${metrics.productsAtRisk} high-risk products.`;
        } else {
            narrative += `This indicates <strong>portfolio health needs significant improvement</strong>. Urgent action required.`;
        }
        
        narrative += ` The portfolio includes <strong>${metrics.starPerformers} star performers</strong> and <strong>${metrics.needsAttention} products needing attention</strong>.`;
        return narrative;
    }
    
    function generateMatrixNarrative(metrics) {
        const quadrantCounts = { star: 0, monitor: 0, improve: 0, critical: 0 };
        metrics.riskOpportunityData.forEach(product => quadrantCounts[product.quadrant]++);
        
        const total = metrics.totalProducts;
        let narrative = '';
        
        if (quadrantCounts.critical > 0) {
            const percent = Math.round((quadrantCounts.critical / total) * 100);
            narrative += `<strong>${quadrantCounts.critical} products (${percent}%)</strong> are in the <strong>Critical</strong> quadrant and require immediate attention. `;
        }
        
        if (quadrantCounts.star > 0) {
            const percent = Math.round((quadrantCounts.star / total) * 100);
            narrative += `<strong>${quadrantCounts.star} products (${percent}%)</strong> are <strong>Star Performers</strong>. `;
        }
        
        return narrative || 'Portfolio health is balanced across all quadrants.';
    }
    
    function generateRiskOpportunityNarrative(metrics) {
        let narrative = '';
        
        if (metrics.topRisks.length > 0) {
            const topRisk = metrics.topRisks[0];
            narrative += `The highest risk product is <span class="highlight">${escapeHtml(topRisk.name)}</span> with a risk score of <strong>${topRisk.riskScore.toFixed(1)}/10</strong>. `;
        }
        
        if (metrics.topOpportunities.length > 0) {
            const topOpp = metrics.topOpportunities[0];
            narrative += `The top performing product is <span class="highlight">${escapeHtml(topOpp.name)}</span> achieving <strong>${topOpp.performanceScore}% target performance</strong>.`;
        }
        
        return narrative || 'Insufficient data for risk and opportunity insights.';
    }
    
    function generateStrategicAlignmentNarrative(metrics) {
        const areaEntries = Object.entries(metrics.alignmentByArea).sort((a, b) => b[1] - a[1]);
        const highestArea = areaEntries[0];
        const developmentCount = metrics.allocationByMaturity['1. Development'] || 0;
        const matureCount = metrics.allocationByMaturity['3. Mature'] || 0;
        
        let narrative = `Resources are heavily allocated to the <span class="highlight">${escapeHtml(highestArea[0])}</span> area with <strong>${highestArea[1]} products</strong>. `;
        narrative += `The portfolio shows <strong>${developmentCount} products in development</strong> and <strong>${matureCount} mature products</strong>. `;
        
        if (developmentCount > matureCount) {
            narrative += `The high proportion in early stages suggests a <strong>growth-focused strategy</strong>.`;
        } else {
            narrative += `The balanced distribution suggests a <strong>well-diversified portfolio</strong>.`;
        }
        
        return narrative;
    }
    
    // Export to UIManager namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Insights = {
        render: renderInsightsAnalytics,
        renderExecutiveView,
        renderStrategicView,
        createExecutiveSummarySection,
        createDetailedBreakdownsSection,
        createDeepAnalyticsSection
    };
    
    console.log('✅ UI Insights module loaded');
})();
