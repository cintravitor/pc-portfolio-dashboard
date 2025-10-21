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
            
            // ========== SECTION 1: ACTION LAYER (TOP) ==========
            const actionLayer = await createActionLayer(governanceData);
            governanceContent.appendChild(actionLayer);
            
            // ========== SECTION 2: ALLOCATION ANALYSIS (MID) ==========
            const allocationSection = createAllocationSection(governanceData);
            governanceContent.appendChild(allocationSection);
            
            // ========== SECTION 3: HEALTH & DISTRIBUTION (BOTTOM) ==========
            const healthSection = createHealthSection(governanceData);
            governanceContent.appendChild(healthSection);
            
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
     */
    async function generateAISummary(data) {
        const contentEl = document.getElementById('ai-summary-content');
        
        if (!contentEl) return;
        
        try {
            // Build prompt from governance data
            const prompt = `You are a portfolio governance advisor. Analyze this portfolio and provide 2-3 actionable insights in under 330 characters:

Portfolio Metrics:
- Smoke Detectors: ${data.smokeDetectors.count} solutions triggered warning signals
- BAU Anomalies: ${data.bauAnomalies.summary.highCount} solutions with high demand (≥3800 hrs/yr), ${data.bauAnomalies.summary.flaggedCount} flagged (1900-3799 hrs)
- Data Health: ${data.dataHealth.missingMetrics} solutions missing key metrics (${data.dataHealth.healthScore}% health score)
- Performance: ${data.performanceMetrics.ux.achievementRate}% UX target achievement

Provide concise, actionable recommendations prioritizing the most critical issues.`;
            
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
            
            contentEl.innerHTML = `<p>${escapeHtml(aiText)}</p>`;
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
            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #6b7280;">
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
        const section = document.createElement('div');
        section.className = 'governance-section';
        
        section.innerHTML = `
            <h2 class="governance-section-title">
                <span>📈</span>
                <span>Resource Allocation & Anomalies</span>
            </h2>
        `;
        
        const grid = document.createElement('div');
        grid.className = 'governance-allocation-section';
        
        // BAU Anomaly Chart
        const bauChart = createBAUAnomalyChartContainer(data.bauAnomalies);
        grid.appendChild(bauChart);
        
        // Team Consumption List
        const teamList = createTeamConsumptionList(data.teamConsumption);
        grid.appendChild(teamList);
        
        section.appendChild(grid);
        
        // PTech Involvement Chart (full width below)
        const ptechChart = createPTechInvolvementChart(data.ptechInvolvement);
        section.appendChild(ptechChart);
        
        // Initialize charts after DOM is ready
        setTimeout(() => {
            initializeBAUAnomalyChart(data.bauAnomalies);
            initializePTechChart(data.ptechInvolvement);
        }, 100);
        
        return section;
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
        const section = document.createElement('div');
        section.className = 'governance-section';
        
        section.innerHTML = `
            <h2 class="governance-section-title">
                <span>💪</span>
                <span>Portfolio Health & Distribution</span>
            </h2>
        `;
        
        const grid = document.createElement('div');
        grid.className = 'governance-health-section';
        
        // Performance Metrics Card
        const performanceCard = createPerformanceMetricsCard(data.performanceMetrics);
        grid.appendChild(performanceCard);
        
        // Strategic Gaps Card
        const strategicCard = createStrategicGapsCard(data.strategicGaps);
        grid.appendChild(strategicCard);
        
        section.appendChild(grid);
        
        // Initialize charts
        setTimeout(() => {
            initializePerformanceGauges(data.performanceMetrics);
            initializeStrategicGapsCharts(data.strategicGaps);
        }, 100);
        
        return section;
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
    
    // ==================== EXPORTS ====================
    
    // Export to UIManager namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Governance = {
        render: renderGovernanceDashboard
    };
    
    console.log('✅ UI Governance module loaded');
    
})();

