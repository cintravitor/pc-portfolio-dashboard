/**
 * UI Manager Module
 * Handles all user interface operations: rendering, tab management, events, and DOM manipulation
 */

// ==================== STATE ====================

let currentTab = 'portfolio-overview'; // Track current active tab
let analysisDataLoaded = false; // Track if analysis has been loaded
let chartJsLoaded = false; // Track Chart.js loading state
let chartInstances = {}; // Store chart instances to prevent memory leaks

// ==================== TAB MANAGEMENT ====================

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Update current tab
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === `tab-${tabName}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Show/hide filters based on active tab
    const filtersSection = document.getElementById('filters-section');
    if (tabName === 'portfolio-overview') {
        filtersSection.style.display = 'block';
    } else {
        filtersSection.style.display = 'none';
    }
    
    // Load analysis data if switching to analysis tab for the first time
    if (tabName === 'descriptive-analysis' && !analysisDataLoaded) {
        loadDescriptiveAnalysis();
    }
    
    // Load strategic view when switching to that tab
    if (tabName === 'strategic-view') {
        renderStrategicView();
    }
}

// ==================== FILTER UI ====================

/**
 * Populate filter dropdowns with unique values
 */
function populateFilters() {
    const filterOptions = window.DataManager.getFilterOptions();
    
    // Populate dropdowns
    const areaSelect = document.getElementById('filter-area');
    const maturitySelect = document.getElementById('filter-maturity');
    const ownerSelect = document.getElementById('filter-owner');

    areaSelect.innerHTML = '<option value="">All Areas</option>' + 
        filterOptions.areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
    
    maturitySelect.innerHTML = '<option value="">All Stages</option>' + 
        filterOptions.maturities.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    
    ownerSelect.innerHTML = '<option value="">All Owners</option>' + 
        filterOptions.owners.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('');
}

/**
 * Apply filters - reads filter values and updates display
 */
function applyFiltersFromUI() {
    const searchTerm = document.getElementById('search-input').value;
    const areaFilter = document.getElementById('filter-area').value;
    const maturityFilter = document.getElementById('filter-maturity').value;
    const ownerFilter = document.getElementById('filter-owner').value;

    window.DataManager.applyFilters(searchTerm, areaFilter, maturityFilter, ownerFilter);
    
    renderCards();
    updateStats();
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-area').value = '';
    document.getElementById('filter-maturity').value = '';
    document.getElementById('filter-owner').value = '';
    applyFiltersFromUI();
}

// ==================== CARD RENDERING ====================

/**
 * Render product cards
 */
function renderCards() {
    const container = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');
    const filteredData = window.DataManager.getFilteredData();

    if (filteredData.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    container.innerHTML = filteredData.map(product => `
        <div class="product-card fade-in" data-product-id="${product.id}">
            <div class="card-header">
                <div class="card-title">
                    ${escapeHtml(product.name)}
                </div>
                <div class="card-subtitle">
                    ${escapeHtml(product.area)}
                </div>
            </div>
            <div class="card-body">
                <div class="card-field">
                    <div class="field-label">Maturity Stage</div>
                    <div class="field-value">
                        <span class="status-badge ${getStatusClass(product.maturity)}">
                            ${escapeHtml(product.maturity) || 'Not specified'}
                        </span>
                    </div>
                </div>
                <div class="card-field">
                    <div class="field-label">Problem it Solves</div>
                    <div class="field-value ${!product.problem ? 'empty' : ''}">
                        ${truncateText(escapeHtml(product.problem), 150) || 'Not specified'}
                    </div>
                </div>
                <div class="card-field">
                    <div class="field-label">Owner</div>
                    <div class="field-value ${!product.owner ? 'empty' : ''}">
                        ${escapeHtml(product.owner) || 'Not assigned'}
                    </div>
                </div>
                <div class="card-field">
                    <div class="field-label">Target User</div>
                    <div class="field-value ${!product.targetUser ? 'empty' : ''}">
                        ${escapeHtml(product.targetUser) || 'Not specified'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== DETAIL PANEL ====================

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
        product.problem && `<li><strong>Problem:</strong> ${escapeHtml(product.problem)}</li>`,
        product.solution && `<li><strong>Solution:</strong> ${escapeHtml(product.solution)}</li>`,
        product.targetUser && `<li><strong>Target User:</strong> ${escapeHtml(product.targetUser)}</li>`,
        product.indirectUser && `<li><strong>Indirect Impact:</strong> ${escapeHtml(product.indirectUser)}</li>`
    ].filter(Boolean).join('');

    panel.innerHTML = `
        <div class="detail-header">
            <button class="detail-close">×</button>
            <div class="detail-title">${escapeHtml(product.name)}</div>
            <div class="detail-subtitle">${escapeHtml(product.area)}</div>
        </div>
        <div class="detail-body">
            <!-- Solution Scope Section -->
            <div class="detail-section">
                <div class="detail-section-title">Solution Scope</div>
                <ul class="scope-list">
                    ${scopeItems}
                </ul>
            </div>

            <!-- Journey & Platform Section -->
            <div class="detail-section">
                <div class="detail-section-title">Journey & Platform</div>
                <div class="detail-field">
                    <div class="detail-field-label">Main Journey Stage</div>
                    <div class="detail-field-value ${!product.journeyMain ? 'empty' : ''}">
                        ${escapeHtml(product.journeyMain) || 'Not specified'}
                    </div>
                </div>
                ${product.journeyCollateral ? `
                <div class="detail-field">
                    <div class="detail-field-label">Collateral Journey Stage</div>
                    <div class="detail-field-value">${escapeHtml(product.journeyCollateral)}</div>
                </div>
                ` : ''}
                <div class="detail-field">
                    <div class="detail-field-label">User Interface Platform</div>
                    <div class="detail-field-value ${!product.platform ? 'empty' : ''}">
                        ${escapeHtml(product.platform) || 'Not specified'}
                    </div>
                </div>
            </div>

            <!-- Key Metrics Section -->
            <div class="detail-section">
                <div class="detail-section-title">Key Metrics - User Experience</div>
                <div class="detail-field">
                    <div class="detail-field-label">${escapeHtml(product.keyMetricUX) || 'Metric'}</div>
                    <div class="chart-container">
                        <canvas id="chart-ux"></canvas>
                    </div>
                </div>
            </div>

            <!-- Business Impact Section -->
            <div class="detail-section">
                <div class="detail-section-title">Key Metrics - Business Impact</div>
                <div class="detail-field">
                    <div class="detail-field-label">${escapeHtml(product.keyMetricBI) || 'Metric'}</div>
                    <div class="chart-container">
                        <canvas id="chart-bi"></canvas>
                    </div>
                </div>
            </div>

            <!-- Ownership & Compliance -->
            <div class="detail-section">
                <div class="detail-section-title">Ownership & Compliance</div>
                <div class="detail-field">
                    <div class="detail-field-label">Owner</div>
                    <div class="detail-field-value">${escapeHtml(product.owner) || 'Not assigned'}</div>
                </div>
                <div class="detail-field">
                    <div class="detail-field-label">Maturity Stage</div>
                    <div class="detail-field-value">
                        <span class="status-badge ${getStatusClass(product.maturity)}">
                            ${escapeHtml(product.maturity) || 'Not specified'}
                        </span>
                    </div>
                </div>
                ${product.regulatory ? `
                <div class="detail-field">
                    <div class="detail-field-label">Regulatory Demand</div>
                    <div class="detail-field-value">${escapeHtml(product.regulatory)}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    panel.classList.remove('hidden');
    mainContent.classList.add('detail-open');
    contentLeft.classList.add('shrink');
    
    // Load Chart.js and render charts after panel is visible
    setTimeout(() => {
        loadChartJs()
            .then(() => {
                renderMetricChart('chart-ux', product.monthlyUX, product.targetUX, product.keyMetricUX);
                renderMetricChart('chart-bi', product.monthlyBI, product.targetBI, product.keyMetricBI);
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
 * Hide detail panel
 */
function hideDetailPanel() {
    // Destroy all chart instances to prevent memory leaks
    Object.values(chartInstances).forEach(chart => {
        if (chart && chart.destroy) {
            chart.destroy();
        }
    });
    chartInstances = {};
    
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

// ==================== CHARTS ====================

/**
 * Lazy load Chart.js library when needed
 * This improves initial page load by ~200ms and saves ~120KB
 */
function loadChartJs() {
    if (window.Chart || chartJsLoaded) {
        return Promise.resolve();
    }
    
    console.log('Loading Chart.js...');
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            chartJsLoaded = true;
            console.log('Chart.js loaded successfully');
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
        document.head.appendChild(script);
    });
}

/**
 * Render metric chart with Chart.js
 */
function renderMetricChart(canvasId, monthlyData, targetValue, metricName) {
    try {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas element '${canvasId}' not found`);
            return;
        }
        
        // Destroy existing chart if it exists
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Parse monthly data (convert strings to numbers, handle empty values)
    const actualData = monthlyData.map(value => {
        if (!value || value === '' || value === '-' || value === 'N/A') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    });
    
    // Parse target value
    const target = targetValue && targetValue !== '' && targetValue !== '-' ? parseFloat(targetValue) : null;
    
    // Create target line data (same value for all months)
    const targetData = target !== null ? Array(12).fill(target) : [];
    
    // Filter out months with no data
    const hasData = actualData.some(v => v !== null) || target !== null;
    
    if (!hasData) {
        // Show "No data available" message
        canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 2rem;">No data available for this metric</p>';
        return;
    }
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Actual',
                    data: actualData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    spanGaps: true
                },
                ...(target !== null ? [{
                    label: 'Target',
                    data: targetData,
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    tension: 0
                }] : [])
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: {
                        size: 13,
                        weight: '600',
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Format based on value type
                                const value = context.parsed.y;
                                if (value >= 0 && value <= 1) {
                                    label += (value * 100).toFixed(1) + '%';
                                } else {
                                    label += value.toLocaleString();
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        color: '#6b7280',
                        callback: function(value) {
                            // Format Y-axis labels
                            if (value >= 0 && value <= 1) {
                                return (value * 100).toFixed(0) + '%';
                            }
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        color: '#6b7280'
                    }
                }
            }
        }
    });
    } catch (error) {
        console.error('Error rendering chart:', error);
        const canvas = document.getElementById(canvasId);
        if (canvas && canvas.parentElement) {
            canvas.parentElement.innerHTML = 
                '<p style="color: #ef4444; text-align: center; padding: 2rem;">Chart rendering failed. Please refresh the page.</p>';
        }
    }
}

// ==================== STATS ====================

/**
 * Update statistics display
 */
function updateStats() {
    const statsBar = document.getElementById('stats-bar');
    statsBar.style.display = 'flex';

    const stats = window.DataManager.getProductStats();
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-showing').textContent = stats.showing;
    document.getElementById('stat-live').textContent = stats.live;
    document.getElementById('stat-dev').textContent = stats.dev;
}

/**
 * Update last fetch time display
 */
function updateLastUpdateDisplay() {
    const lastUpdate = window.DataManager.getLastUpdateTime();
    if (lastUpdate) {
        document.getElementById('last-update').textContent = `Last updated: ${lastUpdate.toLocaleString()}`;
    }
}

// ==================== STRATEGIC VIEW ====================

/**
 * Render Strategic View with real calculated data
 */
function renderStrategicView() {
    console.log('Rendering Strategic View with real calculations...');
    
    const strategicContent = document.getElementById('strategic-content');
    const portfolioData = window.DataManager.getPortfolioData();
    
    // Check if we have data to analyze
    if (!portfolioData || portfolioData.length === 0) {
        strategicContent.innerHTML = `
            <div class="analysis-section">
                <h2>⚠️ No Data Available</h2>
                <p style="color: #6b7280; margin-bottom: 1rem;">Please load the Portfolio Overview tab first to see strategic metrics.</p>
                <button class="refresh-btn" onclick="UIManager.switchTab('portfolio-overview')" style="margin-top: 1rem;">
                    Go to Portfolio Overview
                </button>
            </div>
        `;
        return;
    }
    
    console.log(`Analyzing ${portfolioData.length} products for strategic metrics...`);
    
    // Calculate metrics for all products
    const productMetrics = portfolioData.map(product => ({
        id: product.id,
        name: product.name,
        performanceScore: window.DataManager.calculatePerformanceVsTarget(product),
        riskScore: window.DataManager.calculateRiskScore(product)
    }));
    
    // Calculate portfolio-wide metrics
    
    // 1. Portfolio Health Score (average of all performance scores)
    const validPerformanceScores = productMetrics
        .map(p => p.performanceScore)
        .filter(score => score > 0); // Only count products with actual data
    
    const portfolioHealthScore = validPerformanceScores.length > 0
        ? Math.round(validPerformanceScores.reduce((sum, score) => sum + score, 0) / validPerformanceScores.length)
        : 0;
    
    // 2. Risk Breakdown (categorize products by risk score)
    // Risk levels: High (7-10), Medium (4-6), Low (0-3)
    const riskBreakdown = {
        high: productMetrics.filter(p => p.riskScore >= 7).length,
        medium: productMetrics.filter(p => p.riskScore >= 4 && p.riskScore < 7).length,
        low: productMetrics.filter(p => p.riskScore < 4).length
    };
    
    // 3. Target Achievement Rate (overall percentage)
    const targetAchievement = portfolioHealthScore; // Same as health score for now
    
    console.log('Strategic metrics calculated:', {
        portfolioHealthScore,
        riskBreakdown,
        targetAchievement,
        totalProducts: portfolioData.length,
        productsWithData: validPerformanceScores.length
    });
    
    // Create the strategic view HTML structure using vanilla JS
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'strategic-cards-grid';
    
    // Card 1: Portfolio Health Score (using real calculated data)
    const healthCard = createStrategicCard(
        '📊',
        'Portfolio Health',
        `${portfolioHealthScore}%`,
        `Based on ${validPerformanceScores.length} products with data`
    );
    
    // Card 2: Risk Breakdown (using real calculated data)
    const riskCard = createStrategicCard(
        '⚠️',
        'Portfolio Risk Distribution',
        '', // No single value for this card
        ''
    );
    
    // Add breakdown items to risk card with real data
    const breakdown = document.createElement('div');
    breakdown.className = 'strategic-breakdown';
    
    breakdown.innerHTML = `
        <div class="strategic-breakdown-item">
            <span class="strategic-breakdown-label">High Risk (7-10)</span>
            <span class="strategic-breakdown-value risk-high">${riskBreakdown.high}</span>
        </div>
        <div class="strategic-breakdown-item">
            <span class="strategic-breakdown-label">Medium Risk (4-6)</span>
            <span class="strategic-breakdown-value risk-medium">${riskBreakdown.medium}</span>
        </div>
        <div class="strategic-breakdown-item">
            <span class="strategic-breakdown-label">Low Risk (0-3)</span>
            <span class="strategic-breakdown-value risk-low">${riskBreakdown.low}</span>
        </div>
    `;
    
    riskCard.querySelector('.strategic-card-body').appendChild(breakdown);
    
    // Card 3: Target Achievement (using real calculated data)
    const targetCard = createStrategicCard(
        '🎯',
        'Performance vs Target',
        `${targetAchievement}%`,
        'Average target achievement across all products'
    );
    
    // Append all cards to grid
    cardsGrid.appendChild(healthCard);
    cardsGrid.appendChild(riskCard);
    cardsGrid.appendChild(targetCard);
    
    // Clear and update strategic content
    strategicContent.innerHTML = '';
    strategicContent.appendChild(cardsGrid);
    
    console.log('✅ Strategic View rendered with real calculated metrics');
}

/**
 * Helper function to create a strategic card element
 */
function createStrategicCard(icon, title, value, label) {
    const card = document.createElement('div');
    card.className = 'strategic-card';
    
    // Create card header
    const header = document.createElement('div');
    header.className = 'strategic-card-header';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'strategic-card-icon';
    iconDiv.textContent = icon;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'strategic-card-title';
    titleDiv.textContent = title;
    
    header.appendChild(iconDiv);
    header.appendChild(titleDiv);
    
    // Create card body
    const body = document.createElement('div');
    body.className = 'strategic-card-body';
    
    if (value) {
        const valueDiv = document.createElement('div');
        valueDiv.className = 'strategic-metric-value';
        valueDiv.textContent = value;
        body.appendChild(valueDiv);
    }
    
    if (label) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'strategic-metric-label';
        labelDiv.textContent = label;
        body.appendChild(labelDiv);
    }
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
}

// ==================== DESCRIPTIVE ANALYSIS ====================

/**
 * Load and display descriptive analysis
 */
async function loadDescriptiveAnalysis() {
    console.log('Loading descriptive analysis...');
    
    const analysisContent = document.getElementById('analysis-content');
    const analysisLoading = document.getElementById('analysis-loading');
    
    try {
        // Show loading state
        analysisLoading.classList.remove('hidden');
        analysisContent.innerHTML = '';
        
        // Get portfolio data
        let portfolioData = window.DataManager.getPortfolioData();
        
        // Check if we have portfolio data to analyze
        if (!portfolioData || portfolioData.length === 0) {
            // Try to load from cache
            portfolioData = window.DataManager.loadCachedData();
            if (!portfolioData || portfolioData.length === 0) {
                throw new Error('No portfolio data available. Please load the Portfolio Overview tab first.');
            }
            console.log('Using cached portfolio data for analysis');
        }
        
        console.log(`Analyzing ${portfolioData.length} solutions...`);
        
        // Perform analysis on the data
        const analysis = window.DataManager.analyzePortfolioData(portfolioData);
        
        // Display the analysis results
        displayAnalysisResults(analysis);
        
        // Mark as loaded
        analysisDataLoaded = true;
        console.log('✅ Descriptive analysis loaded successfully');
        
    } catch (error) {
        console.error('Error loading descriptive analysis:', error);
        analysisContent.innerHTML = `
            <div class="analysis-section">
                <h2>⚠️ Error Loading Analysis</h2>
                <p style="color: #ef4444; margin-bottom: 1rem; font-size: 1rem;">${escapeHtml(error.message)}</p>
                <p style="color: #6b7280; margin-bottom: 1rem;">Please ensure the Portfolio Overview tab has loaded data first.</p>
                <button class="refresh-btn" onclick="UIManager.switchTab('portfolio-overview')" style="margin-top: 1rem;">
                    Go to Portfolio Overview
                </button>
            </div>
        `;
    } finally {
        analysisLoading.classList.add('hidden');
    }
}

/**
 * Display analysis results with charts
 */
function displayAnalysisResults(analysis) {
    const analysisContent = document.getElementById('analysis-content');
    
    // Sort data for display
    const sortedStages = Object.entries(analysis.stageCount).sort((a, b) => b[1] - a[1]);
    const sortedAreas = Object.entries(analysis.areaCount).sort((a, b) => b[1] - a[1]);
    const sortedOwners = Object.entries(analysis.ownerCount).sort((a, b) => b[1] - a[1]);
    
    // Calculate key insights
    const topStage = sortedStages[0];
    const topStagePercentage = Math.round((topStage[1] / analysis.totalSolutions) * 100);
    const metricsPercentage = Math.round((analysis.metrics.withAnyMetric / analysis.totalSolutions) * 100);
    const bothMetricsPercentage = Math.round((analysis.metrics.withBothMetrics / analysis.totalSolutions) * 100);
    const regulatoryPercentage = Math.round((analysis.regulatory / analysis.totalSolutions) * 100);
    
    analysisContent.innerHTML = `
        <!-- Overview Section -->
        <div class="analysis-section">
            <h2>📊 Portfolio Overview</h2>
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
        </div>

        <!-- Charts Grid -->
        <div class="analysis-chart-grid">
            <!-- Maturity Stage Distribution -->
            <div class="analysis-chart-container">
                <h2>🔄 Solutions by Maturity Stage</h2>
                <div class="analysis-chart-wrapper">
                    <canvas id="chart-stages"></canvas>
                </div>
                <div class="analysis-highlight">
                    <p><strong>Key Insight:</strong> ${topStagePercentage}% are in the "${escapeHtml(topStage[0])}" stage.</p>
                </div>
            </div>

            <!-- Key Metrics Coverage -->
            <div class="analysis-chart-container">
                <h2>📈 Key Metrics Coverage</h2>
                <div class="analysis-chart-wrapper">
                    <canvas id="chart-metrics"></canvas>
                </div>
                <div class="analysis-highlight">
                    <p><strong>Coverage:</strong> ${metricsPercentage}% have at least one metric (${bothMetricsPercentage}% have both)</p>
                </div>
            </div>
        </div>

        <!-- Second Row Charts -->
        <div class="analysis-chart-grid">
            <!-- Area Distribution -->
            <div class="analysis-chart-container">
                <h2>🏢 Solutions by P&C Area</h2>
                <div class="analysis-chart-wrapper">
                    <canvas id="chart-areas"></canvas>
                </div>
            </div>

            <!-- Regulatory Compliance -->
            <div class="analysis-chart-container">
                <h2>⚖️ Regulatory Compliance</h2>
                <div class="analysis-chart-wrapper">
                    <canvas id="chart-regulatory"></canvas>
                </div>
                <div class="analysis-highlight">
                    <p><strong>Regulatory Mix:</strong> ${regulatoryPercentage}% are driven by regulatory demands.</p>
                </div>
            </div>
        </div>

        <!-- Owner Distribution (Top 10) -->
        <div class="analysis-chart-container" style="margin-top: 2rem;">
            <h2>👥 Top 10 Product Owners</h2>
            <div class="analysis-chart-wrapper" style="height: 400px;">
                <canvas id="chart-owners"></canvas>
            </div>
            ${sortedOwners.length > 10 ? `<p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem; text-align: center;">Showing top 10 of ${sortedOwners.length} owners</p>` : ''}
        </div>
    `;
    
    // Create charts after DOM is updated
    setTimeout(() => createAnalysisCharts(analysis, sortedStages, sortedAreas, sortedOwners), 100);
    
    console.log('✅ Analysis results displayed');
}

/**
 * Create all analysis charts using Chart.js
 * NOTE: This function is quite large - continuing in next part...
 */
function createAnalysisCharts(analysis, sortedStages, sortedAreas, sortedOwners) {
    // Color palette matching maturity stages
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

    // 1. Maturity Stage Chart (Bar Chart)
    const stagesCanvas = document.getElementById('chart-stages');
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

    // 2. Key Metrics Chart (Doughnut Chart)
    const metricsCanvas = document.getElementById('chart-metrics');
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

    // 3. P&C Area Chart (Horizontal Bar Chart)
    const areasCanvas = document.getElementById('chart-areas');
    if (areasCanvas) {
        new Chart(areasCanvas, {
            type: 'bar',
            data: {
                labels: sortedAreas.map(([area]) => area.length > 20 ? area.substring(0, 20) + '...' : area),
                datasets: [{
                    label: 'Solutions',
                    data: sortedAreas.map(([_, count]) => count),
                    backgroundColor: sortedAreas.map((_, i) => defaultColors[i % defaultColors.length]),
                    borderRadius: 6,
                    barThickness: 30
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
                            title: function(context) {
                                return sortedAreas[context[0].dataIndex][0];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { size: 11 } },
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

    // 4. Regulatory Compliance Chart (Pie Chart)
    const regulatoryCanvas = document.getElementById('chart-regulatory');
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
                        labels: { padding: 15, font: { size: 13, weight: '600' } }
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

    // 5. Top 10 Owners Chart (Horizontal Bar Chart)
    const ownersCanvas = document.getElementById('chart-owners');
    if (ownersCanvas) {
        const top10Owners = sortedOwners.slice(0, 10);
        new Chart(ownersCanvas, {
            type: 'bar',
            data: {
                labels: top10Owners.map(([owner]) => owner.length > 25 ? owner.substring(0, 25) + '...' : owner),
                datasets: [{
                    label: 'Solutions',
                    data: top10Owners.map(([_, count]) => count),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 6,
                    barThickness: 35
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
                            title: function(context) {
                                return top10Owners[context[0].dataIndex][0];
                            }
                        }
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
    
    console.log('✅ All charts created successfully');
}

// ==================== UI STATE ====================

/**
 * Show/hide loading state
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('cards-container');
    if (show) {
        loading.classList.remove('hidden');
        container.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    errorDiv.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('error').classList.add('hidden');
}

// ==================== UTILITIES ====================

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

/**
 * Get status class based on maturity stage
 */
function getStatusClass(maturity) {
    const m = (maturity || '').toLowerCase();
    if (m.includes('development')) return 'status-development';
    if (m.includes('growth')) return 'status-growth';
    if (m.includes('mature')) return 'status-mature';
    if (m.includes('decline')) return 'status-decline';
    return 'status-default';
}

// ==================== EXPORTS ====================

// Expose public API
window.UIManager = {
    switchTab,
    populateFilters,
    applyFiltersFromUI,
    clearFilters,
    renderCards,
    showDetailPanel,
    hideDetailPanel,
    updateStats,
    updateLastUpdateDisplay,
    renderStrategicView,
    loadDescriptiveAnalysis,
    showLoading,
    showError,
    hideError
};

