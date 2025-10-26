/**
 * UI Governance Module
 * Handles Actionable Insights & Governance dashboard
 * 
 * Part of the modular UI architecture
 * @version 6.3.0
 */

(function() {
    'use strict';
    
    // Global state for modal
    let currentModalData = null;
    
    // Filter state tracking
    let currentFilterContext = null;
    let isUsingFilteredData = false;
    
    /**
     * Main render function for Governance Dashboard
     * Entry point for the Governance tab
     */
    async function renderGovernanceDashboard() {
        console.log('🎯 Rendering Governance Dashboard...');
        
        const governanceContent = document.getElementById('governance-content');
        const governanceLoading = document.getElementById('governance-loading');
        
        if (!governanceContent) {
            console.error('Governance content container not found');
            return;
        }
        
        try {
            // Show loading state
            governanceLoading.classList.remove('hidden');
            governanceContent.innerHTML = '';
            
            // Fetch consolidated governance data from Apps Script
            console.log('Fetching governance data...');
            const data = await fetchGovernanceData();
            
            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to fetch governance data');
            }
            
            const governanceData = data.data || data;
            console.log('Governance data received:', governanceData);
            
            // Clear and start building dashboard
            governanceContent.innerHTML = '';
            
            // PERFORMANCE OPTIMIZATION: Use DocumentFragment for batch DOM insertion
            // This reduces reflows from 4 to 1 (80% reduction in layout thrashing)
            const fragment = document.createDocumentFragment();
            
            // ========== SECTION 1: ACTION LAYER (TOP - Always Visible) ==========
            const actionLayer = await createActionLayer(governanceData);
            fragment.appendChild(actionLayer);
            
            // ========== SECTION 2: METRICS COVERAGE (Collapsible) ==========
            const metricsCoverageSection = createMetricsCoverageSection(governanceData);
            fragment.appendChild(metricsCoverageSection);
            
            // ========== SECTION 3: PORTFOLIO DISTRIBUTION (Collapsible) ==========
            const portfolioDistSection = createPortfolioDistributionSection(governanceData);
            fragment.appendChild(portfolioDistSection);
            
            // ========== SECTION 4: RESOURCE ALLOCATION (Collapsible) ==========
            const allocationSection = createAllocationSection(governanceData);
            fragment.appendChild(allocationSection);
            
            // Single DOM insertion (1 reflow instead of 4)
            governanceContent.appendChild(fragment);
            
            console.log('✅ Governance Dashboard rendered successfully');
            
        } catch (error) {
            console.error('Error loading governance dashboard:', error);
            governanceContent.innerHTML = `
                <div class="governance-section">
                    <h2>⚠️ Error Loading Governance Dashboard</h2>
                    <p style="color: #ef4444; margin-bottom: 1rem; font-size: 1rem;">${escapeHtml(error.message)}</p>
                    <p style="color: #6b7280; margin-bottom: 1rem;">Please check your Apps Script endpoint and try again.</p>
                    <button class="refresh-btn" onclick="window.UIManager.Governance.render()" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            `;
        } finally {
            governanceLoading.classList.add('hidden');
        }
    }
    
    /**
     * Fetch governance data from Apps Script backend
     */
    async function fetchGovernanceData() {
        const url = CONFIG.WEB_APP_URL + '?action=getGovernanceData';
        
        try {
            // Simple GET request without custom headers to avoid CORS preflight
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching governance data:', error);
            throw error;
        }
    }
    
    // ==================== COLLAPSIBLE SECTION HELPER ====================
    
    /**
     * Create a collapsible section container
     */
    function createCollapsibleSection(id, icon, title, subtitle, content, defaultExpanded = false) {
        const section = document.createElement('div');
        section.className = 'governance-section-collapsible';
        section.id = `governance-section-${id}`;
        
        const header = document.createElement('div');
        header.className = 'governance-section-header';
        
        const headerLeft = document.createElement('div');
        headerLeft.className = 'governance-section-header-left';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'governance-section-icon';
        iconSpan.textContent = icon;
        
        const titleContainer = document.createElement('div');
        const titleH3 = document.createElement('h3');
        titleH3.className = 'governance-section-title';
        titleH3.textContent = title;
        titleContainer.appendChild(titleH3);
        
        if (subtitle) {
            const subtitleP = document.createElement('p');
            subtitleP.className = 'governance-section-subtitle';
            subtitleP.textContent = subtitle;
            titleContainer.appendChild(subtitleP);
        }
        
        headerLeft.appendChild(iconSpan);
        headerLeft.appendChild(titleContainer);
        
        const toggle = document.createElement('div');
        toggle.className = 'governance-section-toggle';
        toggle.innerHTML = `
            <span>${defaultExpanded ? 'Collapse' : 'Expand'}</span>
            <span class="governance-section-toggle-icon ${defaultExpanded ? 'expanded' : ''}">▼</span>
        `;
        
        header.appendChild(headerLeft);
        header.appendChild(toggle);
        
        const body = document.createElement('div');
        body.className = `governance-section-body ${defaultExpanded ? 'expanded' : ''}`;
        
        const bodyContent = document.createElement('div');
        bodyContent.className = 'governance-section-content';
        bodyContent.appendChild(content);
        
        body.appendChild(bodyContent);
        
        // Toggle functionality
        header.addEventListener('click', () => {
            const isExpanded = body.classList.contains('expanded');
            body.classList.toggle('expanded');
            toggle.querySelector('.governance-section-toggle-icon').classList.toggle('expanded');
            toggle.querySelector('span').textContent = isExpanded ? 'Expand' : 'Collapse';
        });
        
        section.appendChild(header);
        section.appendChild(body);
        
        return section;
    }
    
    // ==================== SECTION 2: METRICS COVERAGE ====================
    
    /**
     * Create Metrics Coverage Section
     * Shows UX and BI metric coverage statistics
     */
    function createMetricsCoverageSection(data) {
        const container = document.createElement('div');
        
        if (!data.metricsCoverage) {
            container.innerHTML = '<p style="color: #64748b;">No metrics coverage data available</p>';
            return createCollapsibleSection('metrics-coverage', '📊', 'Metrics Coverage', 
                'Track metric definition, data freshness, and automation', container, false);
        }
        
        const coverage = data.metricsCoverage;
        const perf = data.performanceMetrics;
        
        // ========== ACHIEVEMENT GAUGES (TOP) ==========
        const achievementSection = document.createElement('div');
        achievementSection.innerHTML = `
            <h4 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <span>🎯</span> Current Month Achievement
            </h4>
        `;
        
        const achievementGrid = document.createElement('div');
        achievementGrid.className = 'metric-comparison';
        achievementGrid.innerHTML = `
            <div class="metric-gauge-container">
                <div class="performance-metric-gauge">
                    <canvas id="ux-performance-gauge"></canvas>
                </div>
                <div class="metric-label">UX Achievement</div>
                <div class="metric-value">${perf.ux.achievementRate}%</div>
                <p class="metric-detail">${perf.ux.aboveTarget} of ${coverage.totalSolutions} solutions on target</p>
            </div>
            <div class="metric-gauge-container">
                <div class="performance-metric-gauge">
                    <canvas id="bi-performance-gauge"></canvas>
                </div>
                <div class="metric-label">BI Achievement</div>
                <div class="metric-value">${Math.round((perf.bi.withData / (perf.bi.withData + perf.bi.noData)) * 100)}%</div>
                <p class="metric-detail">${perf.bi.withData} of ${coverage.totalSolutions} solutions with data</p>
            </div>
        `;
        achievementSection.appendChild(achievementGrid);
        container.appendChild(achievementSection);
        
        // ========== METRICS COVERAGE CARDS ==========
        const coverageTitle = document.createElement('h4');
        coverageTitle.style.cssText = 'font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 2rem 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;';
        coverageTitle.innerHTML = '<span>📊</span> Metrics Coverage';
        container.appendChild(coverageTitle);
        
        // UX and BI Comparison
        const comparison = document.createElement('div');
        comparison.className = 'metrics-comparison';
        
        // UX Metrics Card
        const uxCard = document.createElement('div');
        uxCard.innerHTML = `
            <h4 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <span>👤</span> User Experience Metrics
            </h4>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-card-header">
                        <span class="metric-card-icon">✅</span>
                        <h5 class="metric-card-title">Metric Defined</h5>
                    </div>
                    <div class="metric-card-value">${coverage.ux.metricDefinedPercent}%</div>
                    <p class="metric-card-label">${coverage.ux.metricDefined} of ${coverage.totalSolutions} solutions</p>
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.ux.metricDefinedPercent >= 80 ? 'high' : coverage.ux.metricDefinedPercent >= 50 ? 'medium' : 'low'}" 
                             style="width: ${coverage.ux.metricDefinedPercent}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-header">
                        <span class="metric-card-icon">📅</span>
                        <h5 class="metric-card-title">Current Month Data</h5>
                    </div>
                    <div class="metric-card-value">${coverage.ux.currentMonthFilledPercent}%</div>
                    <p class="metric-card-label">${coverage.ux.currentMonthFilled} solutions updated</p>
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.ux.currentMonthFilledPercent >= 80 ? 'high' : coverage.ux.currentMonthFilledPercent >= 50 ? 'medium' : 'low'}" 
                             style="width: ${coverage.ux.currentMonthFilledPercent}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-header">
                        <span class="metric-card-icon">🤖</span>
                        <h5 class="metric-card-title">Automated Extraction</h5>
                    </div>
                    <div class="metric-card-value">${coverage.ux.automatedPercent !== null ? coverage.ux.automatedPercent + '%' : 'N/A'}</div>
                    <p class="metric-card-label">${coverage.ux.automatedPercent !== null ? coverage.ux.automated + ' automated' : 'Data not available'}</p>
                    ${coverage.ux.automatedPercent !== null ? `
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.ux.automatedPercent >= 50 ? 'high' : coverage.ux.automatedPercent >= 25 ? 'medium' : 'low'}" 
                             style="width: ${coverage.ux.automatedPercent}%"></div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // BI Metrics Card
        const biCard = document.createElement('div');
        biCard.innerHTML = `
            <h4 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <span>💼</span> Business Impact Metrics
            </h4>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-card-header">
                        <span class="metric-card-icon">✅</span>
                        <h5 class="metric-card-title">Metric Defined</h5>
                    </div>
                    <div class="metric-card-value">${coverage.bi.metricDefinedPercent}%</div>
                    <p class="metric-card-label">${coverage.bi.metricDefined} of ${coverage.totalSolutions} solutions</p>
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.bi.metricDefinedPercent >= 80 ? 'high' : coverage.bi.metricDefinedPercent >= 50 ? 'medium' : 'low'}" 
                             style="width: ${coverage.bi.metricDefinedPercent}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-card-header">
                        <span class="metric-card-icon">📅</span>
                        <h5 class="metric-card-title">Current Month Data</h5>
                    </div>
                    <div class="metric-card-value">${coverage.bi.currentMonthFilledPercent !== null ? coverage.bi.currentMonthFilledPercent + '%' : 'N/A'}</div>
                    <p class="metric-card-label">${coverage.bi.currentMonthFilledPercent !== null ? coverage.bi.currentMonthFilled + ' solutions tracked' : 'Data not available'}</p>
                    ${coverage.bi.currentMonthFilledPercent !== null ? `
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.bi.currentMonthFilledPercent >= 80 ? 'high' : coverage.bi.currentMonthFilledPercent >= 50 ? 'medium' : 'low'}" 
                             style="width: ${coverage.bi.currentMonthFilledPercent}%"></div>
                    </div>
                    ` : ''}
                </div>
                <div class="metric-card">
                    <div class="metric-card-header">
                        <span class="metric-card-icon">🤖</span>
                        <h5 class="metric-card-title">Automated Extraction</h5>
                    </div>
                    <div class="metric-card-value">${coverage.bi.automatedPercent !== null ? coverage.bi.automatedPercent + '%' : 'N/A'}</div>
                    <p class="metric-card-label">${coverage.bi.automatedPercent !== null ? coverage.bi.automated + ' automated' : 'Data not available'}</p>
                    ${coverage.bi.automatedPercent !== null ? `
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.bi.automatedPercent >= 50 ? 'high' : coverage.bi.automatedPercent >= 25 ? 'medium' : 'low'}" 
                             style="width: ${coverage.bi.automatedPercent}%"></div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        comparison.appendChild(uxCard);
        comparison.appendChild(biCard);
        container.appendChild(comparison);
        
        // Initialize achievement gauges
        setTimeout(() => {
            initializePerformanceGauges(perf);
        }, 100);
        
        return createCollapsibleSection('metrics-coverage', '📊', 'Metrics Coverage', 
            `${perf.ux.achievementRate}% UX, ${Math.round((perf.bi.withData / coverage.totalSolutions) * 100)}% BI achievement`, 
            container, true); // Default expanded
    }
    
    // ==================== SECTION 3: PORTFOLIO DISTRIBUTION ====================
    
    /**
     * Create Portfolio Distribution Section
     * Shows performance metrics, distribution by Journey, Target User, Platform, Regulatory, Maturity
     */
    function createPortfolioDistributionSection(data) {
        const container = document.createElement('div');
        
        if (!data.portfolioDistribution || !data.performanceMetrics) {
            container.innerHTML = '<p style="color: #64748b;">No distribution data available</p>';
            return createCollapsibleSection('portfolio-distribution', '📈', 'Portfolio Distribution', 
                'View portfolio metrics and distribution', container, false);
        }
        
        const dist = data.portfolioDistribution;
        const gaps = data.strategicGaps;
        
        const grid = document.createElement('div');
        grid.className = 'distribution-grid';
        
        // Journey Stage Column Chart
        const journeyCard = document.createElement('div');
        journeyCard.className = 'distribution-card';
        journeyCard.innerHTML = `
            <h4 class="distribution-card-title">🗺️ Journey Stage Coverage</h4>
            <div style="height: 280px; margin-top: 1rem;">
                <canvas id="journey-stage-chart"></canvas>
            </div>
        `;
        
        // Maturity Distribution Column Chart
        const maturityCard = document.createElement('div');
        maturityCard.className = 'distribution-card';
        maturityCard.innerHTML = `
            <h4 class="distribution-card-title">📈 Maturity Distribution</h4>
            <div style="height: 280px; margin-top: 1rem;">
                <canvas id="maturity-distribution-chart"></canvas>
            </div>
        `;
        
        // Target User Distribution
        const userCard = document.createElement('div');
        userCard.className = 'distribution-card';
        userCard.innerHTML = `
            <h4 class="distribution-card-title">👥 Target User Groups</h4>
            <ul class="distribution-list">
                ${dist.byTargetUser.slice(0, 8).map(item => `
                    <li class="distribution-item">
                        <span class="distribution-item-label">${escapeHtml(item.name)}</span>
                        <span class="distribution-item-value">${item.count}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Platform Distribution
        const platformCard = document.createElement('div');
        platformCard.className = 'distribution-card';
        platformCard.innerHTML = `
            <h4 class="distribution-card-title">💻 Solution Platforms</h4>
            <ul class="distribution-list">
                ${dist.byPlatform.slice(0, 8).map(item => `
                    <li class="distribution-item">
                        <span class="distribution-item-label">${escapeHtml(item.name)}</span>
                        <span class="distribution-item-value">${item.count}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Regulatory Requirement
        const regulatoryCard = document.createElement('div');
        regulatoryCard.className = 'distribution-card';
        regulatoryCard.innerHTML = `
            <h4 class="distribution-card-title">⚖️ Regulatory Requirements</h4>
            <div style="margin-top: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.875rem; color: #475569;">Regulatory</span>
                        <span style="font-size: 0.875rem; font-weight: 600;">${dist.regulatory.yes} (${dist.regulatory.yesPercent}%)</span>
                    </div>
                    <div class="distribution-bar">
                        <div class="distribution-bar-fill" style="width: ${dist.regulatory.yesPercent}%; background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);">
                            ${dist.regulatory.yesPercent}%
                        </div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.875rem; color: #475569;">Non-Regulatory</span>
                        <span style="font-size: 0.875rem; font-weight: 600;">${dist.regulatory.no} (${dist.regulatory.noPercent}%)</span>
                    </div>
                    <div class="distribution-bar">
                        <div class="distribution-bar-fill" style="width: ${dist.regulatory.noPercent}%;">
                            ${dist.regulatory.noPercent}%
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // P&C Area Distribution Column Chart
        const areaCard = document.createElement('div');
        areaCard.className = 'distribution-card';
        areaCard.innerHTML = `
            <h4 class="distribution-card-title">🏢 P&C Area Distribution</h4>
            <div style="height: 280px; margin-top: 1rem;">
                <canvas id="area-distribution-chart"></canvas>
            </div>
        `;
        
        grid.appendChild(journeyCard);
        grid.appendChild(maturityCard);
        grid.appendChild(userCard);
        grid.appendChild(platformCard);
        grid.appendChild(regulatoryCard);
        grid.appendChild(areaCard);
        container.appendChild(grid);
        
        // Initialize column charts
        setTimeout(() => {
            initializeDistributionColumnCharts(dist, gaps);
        }, 100);
        
        return createCollapsibleSection('portfolio-distribution', '📈', 'Portfolio Distribution', 
            `${dist.byJourney.length} journey stages, ${gaps.byMaturity.length} maturity levels`, 
            container, false);
    }
    
    /**
     * Initialize Distribution Column Charts
     */
    function initializeDistributionColumnCharts(dist, gaps) {
        // Journey Stage Column Chart
        const journeyCtx = document.getElementById('journey-stage-chart');
        if (journeyCtx) {
            new Chart(journeyCtx, {
                type: 'bar',
                data: {
                    labels: dist.byJourney.map(item => item.name),
                    datasets: [{
                        label: 'Solutions',
                        data: dist.byJourney.map(item => item.count),
                        backgroundColor: '#6366f1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.parsed.y} solutions`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                font: { size: 10 }
                            }
                        }
                    }
                }
            });
        }
        
        // Maturity Distribution Column Chart
        const maturityCtx = document.getElementById('maturity-distribution-chart');
        if (maturityCtx) {
            new Chart(maturityCtx, {
                type: 'bar',
                data: {
                    labels: gaps.byMaturity.map(item => item.name),
                    datasets: [{
                        label: 'Solutions',
                        data: gaps.byMaturity.map(item => item.count),
                        backgroundColor: '#8b5cf6',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.parsed.y} solutions`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        }
        
        // P&C Area Distribution Column Chart
        const areaCtx = document.getElementById('area-distribution-chart');
        if (areaCtx) {
            new Chart(areaCtx, {
                type: 'bar',
                data: {
                    labels: gaps.byArea.map(item => item.name),
                    datasets: [{
                        label: 'Solutions',
                        data: gaps.byArea.map(item => item.count),
                        backgroundColor: '#10b981',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.parsed.y} solutions`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        }
    }
    
    // ==================== SECTION 1: ACTION LAYER ====================
    
    /**
     * Create Action Layer (Top Section)
     * AI Summary, Smoke Detector Scorecard, Data Health Scorecard
     */
    async function createActionLayer(data) {
        const section = document.createElement('div');
        section.className = 'governance-action-layer';
        
        // Title
        const title = document.createElement('div');
        title.className = 'governance-action-layer-title';
        title.innerHTML = `
            <span>🎯</span>
            <span>Action Layer: Portfolio Health Summary</span>
        `;
        section.appendChild(title);
        
        // AI Summary
        const aiSummary = createAISummaryCard(data);
        section.appendChild(aiSummary);
        
        // Smoke Detector Scorecard
        const smokeDetectorCard = createSmokeDetectorScorecard(data.smokeDetectors);
        section.appendChild(smokeDetectorCard);
        
        // Data Health Scorecard
        const dataHealthCard = createDataHealthScorecard(data.dataHealth);
        section.appendChild(dataHealthCard);
        
        // Generate AI summary asynchronously
        setTimeout(() => generateAISummary(data), 100);
        
        return section;
    }
    
    /**
     * Create AI Summary Card
     */
    function createAISummaryCard(data) {
        const card = document.createElement('div');
        card.className = 'governance-ai-summary';
        card.innerHTML = `
            <h3>
                <span>🤖</span>
                <span>AI-Driven Insights</span>
            </h3>
            <div id="ai-summary-content" class="governance-ai-summary-text">
                <div class="governance-ai-loading">
                    <div class="spinner" style="width: 20px; height: 20px;"></div>
                    <span>Generating insights...</span>
                </div>
            </div>
        `;
        return card;
    }
    
    /**
     * Generate AI Summary using LiteLLM
     * Fetches AI-powered insights for the governance dashboard
     * Outputs structured HTML with hierarchy: Summary → Findings → Recommendations
     * 
     * @param {Object} data - Governance data object containing metrics and alerts
     * @returns {Promise<void>} Updates DOM with formatted insights
     * 
     * @description
     * Structured output format ensures scannability for senior leadership:
     * - Bold, larger headings for main sections
     * - Numbered/bulleted lists for discrete items
     * - Color-coded severity badges ([HIGH RISK], [MEDIUM RISK], [ATTENTION NEEDED])
     * - Three-part hierarchy for clear information flow
     * 
     * @see parseStructuredAIOutput for HTML parsing logic
     */
    async function generateAISummary(data) {
        const contentEl = document.getElementById('ai-summary-content');
        
        if (!contentEl) return;
        
        try {
            // Build prompt from governance data with filter context
            const filterInfo = isUsingFilteredData ? 
                `FILTERED VIEW: Analyzing ${currentFilterContext.filteredCount} of ${currentFilterContext.totalCount} solutions
Filters Applied:
- P&C Areas: ${currentFilterContext.areaFilters.length > 0 ? currentFilterContext.areaFilters.join(', ') : 'All'}
- Journey Stages: ${currentFilterContext.journeyFilters.length > 0 ? currentFilterContext.journeyFilters.join(', ') : 'All'}
- Maturity Stages: ${currentFilterContext.maturityFilters.length > 0 ? currentFilterContext.maturityFilters.join(', ') : 'All'}
- Target Users: ${currentFilterContext.targetUserFilters.length > 0 ? currentFilterContext.targetUserFilters.join(', ') : 'All'}

` : 'COMPLETE PORTFOLIO VIEW\n\n';
            
            const prompt = `You are a portfolio governance advisor. ${filterInfo}Analyze this ${isUsingFilteredData ? 'filtered subset' : 'portfolio'} and provide structured, actionable insights.

Portfolio Metrics:
- Smoke Detectors: ${data.smokeDetectors.count} solutions triggered warning signals
- BAU Anomalies: ${data.bauAnomalies.summary.highCount} solutions with high demand (≥3800 hrs/yr), ${data.bauAnomalies.summary.flaggedCount} flagged (1900-3799 hrs)
- Data Health: ${data.dataHealth.missingMetrics} solutions missing key metrics (${data.dataHealth.healthScore}% health score)
- Performance: ${data.performanceMetrics.ux.achievementRate}% UX target achievement

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

**STRATEGIC PRIORITY**
[One concise high-level strategic recommendation in 1-2 sentences]

**KEY FINDINGS**
• [Finding 1 with specific numbers - use • for bullets]
• [Finding 2 with specific numbers]
• [Finding 3 with specific numbers]
• [Finding 4 if needed]

Use severity markers: [HIGH RISK], [MEDIUM RISK], [ATTENTION NEEDED] where appropriate${isUsingFilteredData ? ' FOR THIS FILTERED SUBSET' : ''}.`;
            
            console.log('Generating AI summary with prompt...');
            
            // Call LiteLLM API
            const response = await fetch(CONFIG.LITELLM_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.LITELLM_API_KEY}`
                },
                body: JSON.stringify({
                    model: CONFIG.AI_MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a concise portfolio governance advisor. Provide brief, actionable insights.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`);
            }
            
            const result = await response.json();
            const aiText = result.choices[0].message.content.trim();
            
            contentEl.innerHTML = parseStructuredAIOutput(aiText);
            console.log('✅ AI summary generated');
            
        } catch (error) {
            console.error('Error generating AI summary:', error);
            contentEl.innerHTML = `
                <p style="color: #6b7280;">
                    <strong>Key Findings:</strong> 
                    ${data.smokeDetectors.count} solutions need attention. 
                    ${data.bauAnomalies.summary.highCount} have high BAU demand. 
                    Focus on improving data health (${data.dataHealth.healthScore}% score) and addressing smoke detector alerts.
                </p>
            `;
        }
    }
    
    /**
     * Create Smoke Detector Scorecard (clickable)
     */
    function createSmokeDetectorScorecard(smokeDetectorData) {
        const card = document.createElement('div');
        card.className = 'governance-scorecard';
        card.onclick = () => showSmokeDetectorModal(smokeDetectorData);
        
        const count = smokeDetectorData.count || 0;
        const statusClass = count > 10 ? 'danger' : count > 5 ? 'warning' : '';
        
        card.innerHTML = `
            <div class="scorecard-icon">🚨</div>
            <div class="scorecard-value ${statusClass}">${count}</div>
            <div class="scorecard-label">Smoke Detectors Triggered</div>
        `;
        
        return card;
    }
    
    /**
     * Show Smoke Detector Modal with drill-down details
     */
    function showSmokeDetectorModal(smokeDetectorData) {
        const modal = document.createElement('div');
        modal.className = 'smoke-detector-modal';
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
        
        const triggeredList = smokeDetectorData.triggered || [];
        
        modal.innerHTML = `
            <div class="smoke-detector-modal-content">
                <div class="smoke-detector-modal-header">
                    <h2>🚨 Smoke Detector Details</h2>
                    <button class="smoke-detector-modal-close" onclick="closeModal()">✕</button>
                </div>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">
                    ${triggeredList.length} solution${triggeredList.length !== 1 ? 's' : ''} triggered warning signals
                </p>
                <div class="smoke-detector-list">
                    ${triggeredList.map(item => `
                        <div class="smoke-detector-item">
                            <div class="smoke-detector-item-name">${escapeHtml(item.name)}</div>
                            <div class="smoke-detector-item-triggers">
                                ${item.triggers.map(trigger => `
                                    <span class="smoke-detector-trigger-badge">${escapeHtml(trigger)}</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Make closeModal global for onclick handlers
        window.closeModal = () => {
            modal.remove();
            delete window.closeModal;
        };
    }
    
    /**
     * Create Data Health Scorecard
     */
    function createDataHealthScorecard(dataHealth) {
        const card = document.createElement('div');
        card.className = 'governance-scorecard';
        
        const healthScore = dataHealth.healthScore || 0;
        const statusClass = healthScore < 60 ? 'danger' : healthScore < 80 ? 'warning' : '';
        
        card.innerHTML = `
            <div class="scorecard-icon">📊</div>
            <div class="scorecard-value ${statusClass}">${healthScore}%</div>
            <div class="scorecard-label">Data Health Score</div>
            <div style="font-size: 0.75rem; color: #9ca3af; line-height: 1.2;">
                ${dataHealth.missingMetrics} missing metrics
            </div>
        `;
        
        return card;
    }
    
    // ==================== SECTION 2: ALLOCATION ANALYSIS ====================
    
    /**
     * Create Allocation Section (Mid Section)
     * BAU Anomaly Chart, PTech Involvement, Team Consumption
     */
    function createAllocationSection(data) {
        const container = document.createElement('div');
        
        const grid = document.createElement('div');
        grid.className = 'governance-allocation-section';
        
        // BAU Anomaly Chart
        const bauChart = createBAUAnomalyChartContainer(data.bauAnomalies);
        grid.appendChild(bauChart);
        
        // Team Consumption List
        const teamList = createTeamConsumptionList(data.teamConsumption);
        grid.appendChild(teamList);
        
        container.appendChild(grid);
        
        // PTech Involvement Chart (full width below)
        const ptechChart = createPTechInvolvementChart(data.ptechInvolvement);
        container.appendChild(ptechChart);
        
        // PTech by Area (if available)
        if (data.ptechByArea && data.ptechByArea.length > 0) {
            const ptechByAreaCard = document.createElement('div');
            ptechByAreaCard.className = 'distribution-card';
            ptechByAreaCard.style.marginTop = '1.5rem';
            ptechByAreaCard.innerHTML = `
                <h4 class="distribution-card-title">🔧 PTech Involvement by P&C Area</h4>
                <ul class="distribution-list">
                    ${data.ptechByArea.map(item => `
                        <li class="distribution-item">
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                    <span class="distribution-item-label">${escapeHtml(item.area)}</span>
                                    <span class="distribution-item-value">${item.withPTech}/${item.total} (${item.percentWithPTech}%)</span>
                                </div>
                                <div class="distribution-bar" style="height: 24px;">
                                    <div class="distribution-bar-fill" style="width: ${item.percentWithPTech}%; font-size: 0.7rem;">
                                        ${item.percentWithPTech}%
                                    </div>
                                </div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
            container.appendChild(ptechByAreaCard);
        }
        
        
        // Initialize charts after DOM is ready
        setTimeout(() => {
            initializeBAUAnomalyChart(data.bauAnomalies);
            initializePTechChart(data.ptechInvolvement);
        }, 100);
        
        const highCount = data.bauAnomalies?.summary?.highCount || 0;
        const flaggedCount = data.bauAnomalies?.summary?.flaggedCount || 0;
        
        return createCollapsibleSection('resource-allocation', '📈', 'Resource Allocation', 
            `${highCount} high, ${flaggedCount} flagged BAU allocations`, 
            container, false);
    }
    
    /**
     * Create BAU Anomaly Chart Container
     */
    function createBAUAnomalyChartContainer(bauData) {
        const container = document.createElement('div');
        container.className = 'bau-anomaly-chart';
        container.innerHTML = `
            <h3>⚠️ BAU Allocation Anomalies</h3>
            <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem;">
                Solutions with high BAU hour allocations (Red: ≥3800 hrs, Orange: 1900-3799 hrs)
            </p>
            <div class="bau-chart-container">
                <canvas id="bau-anomaly-chart"></canvas>
            </div>
        `;
        return container;
    }
    
    /**
     * Initialize BAU Anomaly Chart with Chart.js
     */
    function initializeBAUAnomalyChart(bauData) {
        const canvas = document.getElementById('bau-anomaly-chart');
        if (!canvas || typeof Chart === 'undefined') {
            console.error('Canvas or Chart.js not found');
            return;
        }
        
        // Combine all solutions for the chart
        const allSolutions = [
            ...bauData.high.map(s => ({ ...s, category: 'high' })),
            ...bauData.flagged.map(s => ({ ...s, category: 'flagged' })),
            ...bauData.normal.slice(0, 5).map(s => ({ ...s, category: 'normal' }))
        ];
        
        // Sort by hours descending
        allSolutions.sort((a, b) => b.hours - a.hours);
        
        // Take top 20 for visibility
        const topSolutions = allSolutions.slice(0, 20);
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: topSolutions.map(s => s.name),
                datasets: [{
                    label: 'BAU Hours/Year',
                    data: topSolutions.map(s => s.hours),
                    backgroundColor: topSolutions.map(s => {
                        if (s.category === 'high') return 'rgba(239, 68, 68, 0.8)';
                        if (s.category === 'flagged') return 'rgba(245, 158, 11, 0.8)';
                        return 'rgba(16, 185, 129, 0.8)';
                    }),
                    borderRadius: 6
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
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.x;
                                const fte = (value / 1900).toFixed(2);
                                return [`Hours: ${value}/year`, `FTE: ${fte}`];
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                xMin: 3800,
                                xMax: 3800,
                                borderColor: 'rgba(239, 68, 68, 0.8)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: 'High Threshold (3800 hrs)',
                                    enabled: true,
                                    position: 'end'
                                }
                            },
                            line2: {
                                type: 'line',
                                xMin: 1900,
                                xMax: 1900,
                                borderColor: 'rgba(245, 158, 11, 0.8)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Flag Threshold (1900 hrs)',
                                    enabled: true,
                                    position: 'start'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'Hours per Year' },
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
    
    /**
     * Create Team Consumption List
     */
    function createTeamConsumptionList(teamData) {
        const container = document.createElement('div');
        container.className = 'team-consumption-list';
        container.innerHTML = `
            <h3>👥 Team Consumption</h3>
            <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem;">
                Total BAU hours by team
            </p>
            ${teamData.map(team => `
                <div class="team-item">
                    <div class="team-name">${escapeHtml(team.team)}</div>
                    <div class="team-hours">
                        <div class="team-hours-value">${team.hours.toLocaleString()} hrs</div>
                        <div class="team-fte">${team.fte} FTE</div>
                    </div>
                </div>
            `).join('')}
        `;
        return container;
    }
    
    /**
     * Create PTech Involvement Chart
     */
    function createPTechInvolvementChart(ptechData) {
        const container = document.createElement('div');
        container.className = 'ptech-involvement-chart';
        container.innerHTML = `
            <h3>🔧 People Tech Involvement</h3>
            <div class="ptech-chart-container">
                <canvas id="ptech-involvement-chart"></canvas>
            </div>
        `;
        return container;
    }
    
    /**
     * Initialize PTech Involvement Chart
     */
    function initializePTechChart(ptechData) {
        const canvas = document.getElementById('ptech-involvement-chart');
        if (!canvas || typeof Chart === 'undefined') return;
        
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['PTech Involved', 'No PTech Involvement'],
                datasets: [{
                    data: [ptechData.withPTech, ptechData.withoutPTech],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
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
                            label: (context) => {
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
    
    // ==================== SECTION 3: HEALTH & DISTRIBUTION ====================
    
    /**
     * Create Health Section (Bottom Section)
     * Performance Metrics, Strategic Gaps
     */
    function createHealthSection(data) {
        const container = document.createElement('div');
        
        const grid = document.createElement('div');
        grid.className = 'governance-health-section';
        
        // Performance Metrics Card
        const performanceCard = createPerformanceMetricsCard(data.performanceMetrics);
        grid.appendChild(performanceCard);
        
        // Strategic Gaps Card
        const strategicCard = createStrategicGapsCard(data.strategicGaps);
        grid.appendChild(strategicCard);
        
        container.appendChild(grid);
        
        // Initialize charts
        setTimeout(() => {
            initializePerformanceGauges(data.performanceMetrics);
            initializeStrategicGapsCharts(data.strategicGaps);
        }, 100);
        
        const uxRate = data.performanceMetrics?.ux?.achievementRate || 0;
        const biCoverage = data.performanceMetrics?.bi?.withData || 0;
        
        return createCollapsibleSection('performance-health', '💪', 'Performance & Portfolio Health', 
            `${uxRate}% UX achievement, ${biCoverage} solutions with BI data`, 
            container, false);
    }
    
    /**
     * Create Performance Metrics Card (Side-by-Side UX/BI)
     */
    function createPerformanceMetricsCard(perfData) {
        const card = document.createElement('div');
        card.className = 'performance-metrics-card';
        card.innerHTML = `
            <h3>🎯 Performance Metrics</h3>
            <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1.5rem;">
                Last month performance vs targets
            </p>
            <div class="metric-comparison">
                <div class="metric-gauge-container">
                    <div class="performance-metric-gauge">
                        <canvas id="ux-performance-gauge"></canvas>
                    </div>
                    <div class="metric-label">UX Achievement</div>
                    <div class="metric-value">${perfData.ux.achievementRate}%</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">
                        ${perfData.ux.aboveTarget} of ${perfData.ux.aboveTarget + perfData.ux.belowTarget} on target
                    </div>
                </div>
                <div class="metric-gauge-container">
                    <div class="performance-metric-gauge">
                        <canvas id="bi-performance-gauge"></canvas>
                    </div>
                    <div class="metric-label">BI Coverage</div>
                    <div class="metric-value">${Math.round((perfData.bi.withData / (perfData.bi.withData + perfData.bi.noData)) * 100)}%</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">
                        ${perfData.bi.withData} solutions with data
                    </div>
                </div>
            </div>
        `;
        return card;
    }
    
    /**
     * Initialize Performance Gauges (Doughnut Charts)
     */
    function initializePerformanceGauges(perfData) {
        // UX Gauge
        const uxCanvas = document.getElementById('ux-performance-gauge');
        if (uxCanvas && typeof Chart !== 'undefined') {
            new Chart(uxCanvas, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [perfData.ux.achievementRate, 100 - perfData.ux.achievementRate],
                        backgroundColor: [
                            perfData.ux.achievementRate >= 70 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(245, 158, 11, 0.8)',
                            'rgba(229, 231, 235, 0.3)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }
        
        // BI Gauge
        const biCanvas = document.getElementById('bi-performance-gauge');
        if (biCanvas && typeof Chart !== 'undefined') {
            const biPercentage = Math.round((perfData.bi.withData / (perfData.bi.withData + perfData.bi.noData)) * 100);
            new Chart(biCanvas, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [biPercentage, 100 - biPercentage],
                        backgroundColor: [
                            biPercentage >= 70 ? 'rgba(99, 102, 241, 0.8)' : 'rgba(245, 158, 11, 0.8)',
                            'rgba(229, 231, 235, 0.3)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }
    }
    
    /**
     * Create Strategic Gaps Card
     */
    function createStrategicGapsCard(gapsData) {
        const card = document.createElement('div');
        card.className = 'performance-metrics-card';
        card.innerHTML = `
            <h3>📊 Strategic Distribution</h3>
            <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem;">
                Portfolio distribution by area and maturity
            </p>
            <div style="height: 250px;">
                <canvas id="strategic-gaps-chart"></canvas>
            </div>
        `;
        return card;
    }
    
    /**
     * Initialize Strategic Gaps Charts
     */
    function initializeStrategicGapsCharts(gapsData) {
        const canvas = document.getElementById('strategic-gaps-chart');
        if (!canvas || typeof Chart === 'undefined') return;
        
        // Show maturity distribution as a bar chart
        const maturityData = gapsData.byMaturity.slice(0, 6);
        
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: maturityData.map(m => m.name),
                datasets: [{
                    label: 'Number of Solutions',
                    data: maturityData.map(m => m.count),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(156, 163, 175, 0.6)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * HTML escape helper
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Parse structured AI text into formatted HTML
     * Converts AI output with markdown-style formatting into semantic HTML
     * with proper heading hierarchy, lists, and color-coded severity markers
     * 
     * @param {string} aiText - Raw AI text with markdown-style formatting
     * @returns {string} Formatted HTML string
     * 
     * @example
     * const html = parseStructuredAIOutput("**STRATEGIC PRIORITY**\nFocus on...");
     * // Returns: '<div class="ai-section ai-summary">...</div>'
     */
    function parseStructuredAIOutput(aiText) {
        if (!aiText) return '<p class="ai-empty">No insights available</p>';
        
        // Split into sections by **SECTION_NAME**
        const sections = aiText.split(/\*\*([A-Z\s]+)\*\*/g).filter(s => s.trim());
        
        let html = '<div class="ai-insights-structured">';
        
        for (let i = 0; i < sections.length; i += 2) {
            const sectionName = sections[i]?.trim();
            const sectionContent = sections[i + 1]?.trim();
            
            if (!sectionName || !sectionContent) continue;
            
            // Determine section type and CSS class
            const sectionId = sectionName.toLowerCase().replace(/\s+/g, '-');
            let sectionClass = 'ai-section';
            
            if (sectionName.includes('STRATEGIC') || sectionName.includes('PRIORITY')) {
                sectionClass += ' ai-summary';
            } else if (sectionName.includes('FINDING')) {
                sectionClass += ' ai-findings';
            } else if (sectionName.includes('ACTION') || sectionName.includes('RECOMMEND')) {
                sectionClass += ' ai-recommendations';
            }
            
            html += `<div class="${sectionClass}">`;
            html += `<h4 class="ai-section-heading">${escapeHtml(sectionName)}</h4>`;
            
            // Parse content based on list markers
            if (sectionContent.includes('•')) {
                // Bullet list
                const items = sectionContent.split('•').filter(item => item.trim());
                html += '<ul class="ai-list ai-list-bulleted">';
                items.forEach(item => {
                    html += `<li class="ai-list-item">${parseInlineFormatting(item.trim())}</li>`;
                });
                html += '</ul>';
            } else if (/^\d+\./.test(sectionContent)) {
                // Numbered list
                const items = sectionContent.split(/\d+\./).filter(item => item.trim());
                html += '<ol class="ai-list ai-list-numbered">';
                items.forEach(item => {
                    html += `<li class="ai-list-item">${parseInlineFormatting(item.trim())}</li>`;
                });
                html += '</ol>';
            } else {
                // Plain paragraph (for strategic summary)
                html += `<p class="ai-paragraph">${parseInlineFormatting(sectionContent)}</p>`;
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * Parse inline formatting and severity markers
     * Converts [HIGH RISK], [MEDIUM RISK], [ATTENTION NEEDED] into color-coded badges
     * 
     * @param {string} text - Text with potential severity markers
     * @returns {string} HTML with formatted severity badges
     */
    function parseInlineFormatting(text) {
        if (!text) return '';
        
        // Replace severity markers with color-coded badges
        let formatted = escapeHtml(text);
        
        formatted = formatted.replace(/\[HIGH RISK\]/gi, 
            '<span class="ai-severity-badge ai-severity-high">HIGH RISK</span>');
        formatted = formatted.replace(/\[MEDIUM RISK\]/gi, 
            '<span class="ai-severity-badge ai-severity-medium">MEDIUM RISK</span>');
        formatted = formatted.replace(/\[ATTENTION NEEDED\]/gi, 
            '<span class="ai-severity-badge ai-severity-attention">ATTENTION NEEDED</span>');
        
        return formatted;
    }
    
    // ==================== DYNAMIC FILTERING SUPPORT ====================
    
    /**
     * Update governance dashboard with filtered data
     * This function is called when filters change on the Explore tab
     * It recalculates all metrics client-side for instant updates
     * 
     * @param {Object} eventData - Event data from filters:changed event
     */
    async function updateGovernanceWithFilters(eventData) {
        const startTime = performance.now();
        
        const { filteredData, filterContext } = eventData;
        
        console.log(`🔄 Updating governance with ${filteredData.length} filtered solutions...`);
        
        // Update filter state
        currentFilterContext = filterContext;
        isUsingFilteredData = filterContext.filteredCount < filterContext.totalCount;
        
        // Show filter status indicator
        showFilterBadge(filterContext);
        
        try {
            // Calculate governance metrics client-side (NO network call)
            const governanceData = window.DataManager.Governance.calculateAll(filteredData);
            
            // Update all sections with new data (await because it's async)
            await updateDashboardSections(governanceData);
            
            const endTime = performance.now();
            const updateTime = (endTime - startTime).toFixed(2);
            console.log(`⚡ Governance update completed in ${updateTime}ms`);
            
            // Performance warning if >500ms
            if (updateTime > 500) {
                console.warn(`⚠️ Governance update took ${updateTime}ms (target: <500ms)`);
            }
            
        } catch (error) {
            console.error('Error updating governance with filters:', error);
        }
    }
    
    /**
     * Update all dashboard sections with new governance data
     * @param {Object} governanceData - Recalculated governance metrics
     */
    async function updateDashboardSections(governanceData) {
        const governanceContent = document.getElementById('governance-content');
        if (!governanceContent) return;
        
        // Clear and rebuild (for now - can optimize later to update in place)
        governanceContent.innerHTML = '';
        
        // Rebuild all sections (createActionLayer is async, must await)
        const actionLayer = await createActionLayer(governanceData);
        governanceContent.appendChild(actionLayer);
        
        const metricsCoverageSection = createMetricsCoverageSection(governanceData);
        governanceContent.appendChild(metricsCoverageSection);
        
        const portfolioDistSection = createPortfolioDistributionSection(governanceData);
        governanceContent.appendChild(portfolioDistSection);
        
        const allocationSection = createAllocationSection(governanceData);
        governanceContent.appendChild(allocationSection);
        
        // Regenerate AI summary with filter context
        setTimeout(() => generateAISummary(governanceData), 100);
    }
    
    /**
     * Show filter status badge on governance dashboard
     * @param {Object} filterContext - Current filter context
     */
    function showFilterBadge(filterContext) {
        // Remove existing badge
        const existingBadge = document.querySelector('.governance-filter-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Only show badge if filters are active
        if (filterContext.filteredCount === filterContext.totalCount) {
            return;
        }
        
        // Create filter badge
        const badge = document.createElement('div');
        badge.className = 'governance-filter-badge';
        badge.innerHTML = `
            <div class="filter-badge-content">
                <span class="filter-badge-icon">🔍</span>
                <span class="filter-badge-text">
                    <strong>Filtered View:</strong> ${filterContext.filteredCount} of ${filterContext.totalCount} solutions
                </span>
                <button class="filter-badge-reset" onclick="window.UIManager.Filters.clearFilters()">
                    Reset to Full View
                </button>
            </div>
        `;
        
        // Insert at top of governance content
        const governanceContent = document.getElementById('governance-content');
        if (governanceContent) {
            governanceContent.insertBefore(badge, governanceContent.firstChild);
        }
    }
    
    // ==================== EXPORTS ====================
    
    // Export to UIManager namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Governance = {
        render: renderGovernanceDashboard,
        updateWithFilters: updateGovernanceWithFilters
    };
    
    // Subscribe to filter change events
    window.Utils.subscribe('filters:changed', (eventData) => {
        // Only update if we're on the governance dashboard tab
        if (window.State.getCurrentTab() === 'governance-dashboard') {
            updateGovernanceWithFilters(eventData);
        } else {
            // Store filter context for when user switches to governance tab
            currentFilterContext = eventData.filterContext;
            isUsingFilteredData = eventData.filterContext.filteredCount < eventData.filterContext.totalCount;
        }
    });
    
    console.log('✅ UI Governance module loaded');
    console.log('📡 Subscribed to filters:changed event');
    
})();

