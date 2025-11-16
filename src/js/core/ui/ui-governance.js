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
    
    // Render state tracking (prevent multiple simultaneous renders)
    let isRendering = false;
    let currentAbortController = null;
    
    // Render cache for performance (5-minute TTL)
    let cachedGovernanceHTML = null;
    let cacheTimestamp = null;
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    // ==================== CHART.JS READINESS CHECKER ====================
    
    /**
     * Wait for Chart.js library to be available
     * Prevents errors when trying to create charts before library loads
     * 
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<boolean>} True if Chart.js loaded, false if timeout
     */
    function waitForChartJs(timeout = 10000) {
        return new Promise((resolve, reject) => {
            // If already loaded, resolve immediately
            if (typeof Chart !== 'undefined') {
                console.log('✅ Chart.js already loaded');
                resolve(true);
                return;
            }
            
            console.log('⏳ Waiting for Chart.js to load...');
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (typeof Chart !== 'undefined') {
                    clearInterval(checkInterval);
                    const elapsed = Date.now() - startTime;
                    console.log(`✅ Chart.js loaded (${elapsed}ms)`);
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    const error = new Error(`Chart.js failed to load within ${timeout}ms`);
                    console.error('❌ Chart.js load timeout');
                    
                    // Log critical error but don't fail completely
                    if (window.Utils && window.Utils.logCriticalError) {
                        window.Utils.logCriticalError('ChartJsLoad', error, { 
                            timeout: timeout,
                            cdnUrl: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
                        });
                    }
                    
                    // Resolve with false to allow graceful degradation
                    resolve(false);
                }
            }, 100); // Check every 100ms
        });
    }
    
    /**
     * Main render function for Governance Dashboard
     * Entry point for the Governance tab
     * 
     * @param {boolean} forceRefresh - Force fresh render, bypass cache
     */
    async function renderGovernanceDashboard(forceRefresh = false) {
        console.log('🎯 Rendering Governance Dashboard...');
        
        const governanceContent = document.getElementById('governance-content');
        
        // Check cache validity (5-minute TTL)
        const now = Date.now();
        const cacheValid = cachedGovernanceHTML && 
                           cacheTimestamp && 
                           (now - cacheTimestamp) < CACHE_TTL;
        
        if (cacheValid && !forceRefresh) {
            console.log('📦 Using cached governance content');
            if (governanceContent) {
                governanceContent.innerHTML = cachedGovernanceHTML;
            }
            // Hide loading indicator
            const governanceLoading = document.getElementById('governance-loading');
            if (governanceLoading) {
                governanceLoading.classList.add('hidden');
            }
            return;
        }
        
        // NEW: Prevent multiple simultaneous renders
        if (isRendering) {
            console.warn('⚠️ Render already in progress, cancelling previous render...');
            // Cancel any in-flight request
            if (currentAbortController) {
                currentAbortController.abort();
            }
            isRendering = false; // Reset flag so we can proceed
        }
        
        const governanceLoading = document.getElementById('governance-loading');
        
        if (!governanceContent) {
            console.error('Governance content container not found');
            return;
        }
        
        // Set rendering flag
        isRendering = true;
        
        // Create new abort controller for this render
        currentAbortController = new AbortController();
        
        try {
            // Show loading state
            if (governanceLoading) {
                governanceLoading.classList.remove('hidden');
                governanceLoading.style.display = ''; // Clear any inline styles
                governanceLoading.setAttribute('aria-hidden', 'false');
            }
            governanceContent.innerHTML = '';
            
            // Use client-side calculation for real-time automation metrics
            console.log('Calculating governance data client-side...');
            const portfolioData = window.State.getPortfolioData();
            
            if (!portfolioData || portfolioData.length === 0) {
                throw new Error('No portfolio data available. Please refresh data first.');
            }
            
            // Debug: Check if automation fields are present
            console.log('Sample solution data:', {
                name: portfolioData[0]?.name,
                uxAutomation: portfolioData[0]?.uxAutomation,
                biAutomation: portfolioData[0]?.biAutomation
            });
            
            // Calculate all governance metrics client-side (includes automation percentages)
            const governanceData = window.DataManager.Governance.calculateAll(portfolioData);
            console.log('Governance data calculated:', governanceData);
            
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
            
            // Cache the rendered content
            cachedGovernanceHTML = governanceContent.innerHTML;
            cacheTimestamp = now;
            console.log('💾 Governance content cached');
            
            console.log('✅ Governance Dashboard rendered successfully');
            
        } catch (error) {
            // NEW: If aborted due to tab switching, don't show error (this is intentional)
            if (error.name === 'AbortError') {
                console.log('🔄 Governance render cancelled (tab switched)');
                governanceContent.innerHTML = ''; // Clear content
                return; // Exit quietly
            }
            
            console.error('Error loading governance dashboard:', error);
            
            // Log critical error for debugging
            if (window.Utils && window.Utils.logCriticalError) {
                window.Utils.logCriticalError('GovernanceDashboardRender', error, {
                    hasContent: !!governanceContent,
                    errorType: error.name
                });
            }
            
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
            // NEW: Always reset rendering flag
            isRendering = false;
            // NEW: ALWAYS hide loading state in finally block (guaranteed cleanup)
            // This ensures the spinner stops even if rendering crashes
            if (governanceLoading) {
                // Multiple approaches to ensure it's hidden (belt and suspenders)
                governanceLoading.classList.add('hidden');
                governanceLoading.style.display = 'none'; // Force hide with inline style
                governanceLoading.setAttribute('aria-hidden', 'true'); // Accessibility
                console.log('🔄 Loading state cleaned up');
            }
        }
    }
    
    /**
     * Fetch governance data from Apps Script backend
     * @param {AbortSignal} externalSignal - Optional abort signal from caller (for tab switching)
     */
    async function fetchGovernanceData(externalSignal = null) {
        const url = CONFIG.WEB_APP_URL + '?action=getGovernanceData';
        
        let timeoutId;
        let wasTimeout = false;
        
        try {
            console.log('📡 Fetching governance data with 30s timeout...');
            
            // NEW: Add AbortController for timeout (prevents infinite waiting)
            const controller = new AbortController();
            
            // Set timeout flag when timeout fires
            timeoutId = setTimeout(() => {
                wasTimeout = true;
                controller.abort();
            }, 30000); // 30 second timeout
            
            // If external signal provided (from tab switching), abort when it aborts
            if (externalSignal) {
                externalSignal.addEventListener('abort', () => {
                    // Don't set wasTimeout - this is a tab switch, not a timeout
                    controller.abort();
                });
            }
            
            // Simple GET request with abort signal
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId); // Clear timeout on successful response
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Governance data fetched successfully');
            return data;
            
        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            
            // NEW: Handle AbortError differently based on cause
            if (error.name === 'AbortError') {
                // If it was a timeout, throw user-friendly timeout error
                if (wasTimeout) {
                    console.error('Error fetching governance data: Timeout');
                    const timeoutError = new Error('Request timed out after 30 seconds. The server may be under heavy load. Please try again.');
                    
                    // Log the timeout for debugging
                    if (window.Utils && window.Utils.logCriticalError) {
                        window.Utils.logCriticalError('GovernanceDataTimeout', timeoutError, {
                            url: url,
                            timeout: 30000
                        });
                    }
                    
                    throw timeoutError;
                } else {
                    // Otherwise it's a tab switch - DON'T log error, just re-throw
                    // so renderGovernanceDashboard can handle it silently
                    throw error;
                }
            }
            
            // Log other errors (not tab-switch aborts)
            console.error('Error fetching governance data:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection and try again.');
            }
            
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
        
        // Only add icon if provided (minimalist design: no icons)
        if (icon && icon.trim() !== '') {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'governance-section-icon';
            iconSpan.textContent = icon;
            headerLeft.appendChild(iconSpan);
        }
        
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
            <h4 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(99, 102, 241, 0.1);">
                Target Achievement
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
                <div class="metric-value ${perf.ux.achievementRate >= 70 ? 'metric-value-success' : 'metric-value-danger'}">${perf.ux.achievementRate}%</div>
                <p class="metric-detail">${perf.ux.aboveTarget} of ${coverage.totalSolutions} solutions achieving target</p>
            </div>
            <div class="metric-gauge-container">
                <div class="performance-metric-gauge">
                    <canvas id="bi-performance-gauge"></canvas>
                </div>
                <div class="metric-label">BI Achievement</div>
                <div class="metric-value ${perf.bi.achievementRate >= 70 ? 'metric-value-success' : 'metric-value-danger'}">${perf.bi.achievementRate}%</div>
                <p class="metric-detail">${perf.bi.aboveTarget} of ${coverage.totalSolutions} solutions achieving target</p>
            </div>
        `;
        achievementSection.appendChild(achievementGrid);
        container.appendChild(achievementSection);
        
        // ========== METRICS COVERAGE CARDS ==========
        // UX and BI Comparison
        const comparison = document.createElement('div');
        comparison.className = 'metrics-comparison';
        
        // UX Metrics Card
        const uxCard = document.createElement('div');
        uxCard.innerHTML = `
            <h4 style="font-size: 0.875rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(99, 102, 241, 0.1);">
                User Experience Metrics
            </h4>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h5 class="metric-card-title">Metric Defined</h5>
                    <div class="metric-card-value ${coverage.ux.metricDefinedPercent >= 90 ? 'metric-value-success' : 'metric-value-danger'}">${coverage.ux.metricDefinedPercent}%</div>
                    <p class="metric-card-label">${coverage.ux.metricDefined} of ${coverage.totalSolutions} solutions</p>
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.ux.metricDefinedPercent >= 90 ? 'automation-success' : 'automation-warning'}" 
                             style="width: ${coverage.ux.metricDefinedPercent}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <h5 class="metric-card-title">Current Month Data</h5>
                    <div class="metric-card-value ${coverage.ux.currentMonthFilledPercent >= 80 ? 'metric-value-success' : 'metric-value-danger'}">${coverage.ux.currentMonthFilledPercent}%</div>
                    <p class="metric-card-label">${coverage.ux.currentMonthFilled} solutions updated</p>
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.ux.currentMonthFilledPercent >= 80 ? 'automation-success' : 'automation-warning'}" 
                             style="width: ${coverage.ux.currentMonthFilledPercent}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <h5 class="metric-card-title">Automated Extraction</h5>
                    <div class="metric-card-value metric-automation-value ${coverage.ux.automatedPercent >= 75 ? 'automation-success' : 'automation-warning'}">${coverage.ux.automatedPercent !== null ? coverage.ux.automatedPercent + '%' : 'N/A'}</div>
                    <p class="metric-card-label">${coverage.ux.automatedPercent !== null ? coverage.ux.automated + ' of ' + coverage.ux.metricDefined + ' automated' : 'Data not available'}</p>
                    ${coverage.ux.automatedPercent !== null ? `
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.ux.automatedPercent >= 75 ? 'automation-success' : 'automation-warning'}" 
                             style="width: ${coverage.ux.automatedPercent}%"></div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // BI Metrics Card
        const biCard = document.createElement('div');
        biCard.innerHTML = `
            <h4 style="font-size: 0.875rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(99, 102, 241, 0.1);">
                Business Impact Metrics
            </h4>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h5 class="metric-card-title">Metric Defined</h5>
                    <div class="metric-card-value ${coverage.bi.metricDefinedPercent >= 90 ? 'metric-value-success' : 'metric-value-danger'}">${coverage.bi.metricDefinedPercent}%</div>
                    <p class="metric-card-label">${coverage.bi.metricDefined} of ${coverage.totalSolutions} solutions</p>
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.bi.metricDefinedPercent >= 90 ? 'automation-success' : 'automation-warning'}" 
                             style="width: ${coverage.bi.metricDefinedPercent}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <h5 class="metric-card-title">Current Month Data</h5>
                    <div class="metric-card-value ${coverage.bi.currentMonthFilledPercent !== null && coverage.bi.currentMonthFilledPercent >= 80 ? 'metric-value-success' : 'metric-value-danger'}">${coverage.bi.currentMonthFilledPercent !== null ? coverage.bi.currentMonthFilledPercent + '%' : 'N/A'}</div>
                    <p class="metric-card-label">${coverage.bi.currentMonthFilledPercent !== null ? coverage.bi.currentMonthFilled + ' solutions updated' : 'Data not available'}</p>
                    ${coverage.bi.currentMonthFilledPercent !== null ? `
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.bi.currentMonthFilledPercent >= 80 ? 'automation-success' : 'automation-warning'}" 
                             style="width: ${coverage.bi.currentMonthFilledPercent}%"></div>
                    </div>
                    ` : ''}
                </div>
                <div class="metric-card">
                    <h5 class="metric-card-title">Automated Extraction</h5>
                    <div class="metric-card-value metric-automation-value ${coverage.bi.automatedPercent >= 75 ? 'automation-success' : 'automation-warning'}">${coverage.bi.automatedPercent !== null ? coverage.bi.automatedPercent + '%' : 'N/A'}</div>
                    <p class="metric-card-label">${coverage.bi.automatedPercent !== null ? coverage.bi.automated + ' of ' + coverage.bi.metricDefined + ' automated' : 'Data not available'}</p>
                    ${coverage.bi.automatedPercent !== null ? `
                    <div class="metric-progress-bar">
                        <div class="metric-progress-fill ${coverage.bi.automatedPercent >= 75 ? 'automation-success' : 'automation-warning'}" 
                             style="width: ${coverage.bi.automatedPercent}%"></div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        comparison.appendChild(uxCard);
        comparison.appendChild(biCard);
        container.appendChild(comparison);
        
        // Initialize achievement gauges with color coding
        setTimeout(() => {
            initializePerformanceGauges(perf, coverage.totalSolutions);
        }, 100);
        
        return createCollapsibleSection('metrics-coverage', '', 'Metrics Coverage', 
            '', // Removed redundant subtitle
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
        
        return createCollapsibleSection('portfolio-distribution', '', 'Portfolio Distribution', 
            '', // Removed subtitle for ultra-minimal design
            container, false);
    }
    
    /**
     * Initialize Distribution Column Charts
     */
    async function initializeDistributionColumnCharts(dist, gaps) {
        // NEW: Wait for Chart.js to be available
        const chartJsReady = await waitForChartJs();
        if (!chartJsReady) {
            console.warn('⚠️ Chart.js not available - skipping distribution charts');
            return; // Gracefully skip chart creation
        }
        
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
        
        // AI Summary (only card in Action Layer now)
        const aiSummary = createAISummaryCard(data);
        section.appendChild(aiSummary);
        
        // Generate AI summary asynchronously
        setTimeout(() => generateAISummary(data), 100);
        
        return section;
    }
    
    /**
     * Create AI Summary Card with Help Icon
     */
    function createAISummaryCard(data) {
        const card = document.createElement('div');
        card.className = 'governance-ai-summary';
        card.innerHTML = `
            <h3>
                <span>🤖</span>
                <span>AI-Driven Insights</span>
                <span class="ai-help-icon" title="Risk Level Guide">?
                    <div class="help-tooltip">
                        ${createHelpTooltipContent()}
                    </div>
                </span>
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
     * Create Help Tooltip Content
     * Concise risk level guide (no scrolling needed)
     */
    function createHelpTooltipContent() {
        return `
            <div class="help-tooltip-header">Risk Level Guide</div>
            <div class="help-tooltip-grid">
                <div class="help-tooltip-item">
                    <span class="help-badge help-badge-critical">🚨 CRITICAL</span>
                    <span class="help-desc">Score ≥7 • 3-4 detectors</span>
                </div>
                <div class="help-tooltip-item">
                    <span class="help-badge help-badge-monitor">⚠️ MONITOR</span>
                    <span class="help-desc">Score 4-7 • 1-2 detectors</span>
                </div>
                <div class="help-tooltip-item">
                    <span class="help-badge help-badge-gaps">💡 DATA GAPS</span>
                    <span class="help-desc">Missing metrics/owner</span>
                </div>
            </div>
            <div class="help-tooltip-divider"></div>
            <div class="help-tooltip-footer">
                Hover badge for details • Click to filter
            </div>
        `;
    }
    
    /**
     * Cache AI Summary for performance optimization
     * @param {string} cacheKey - Cache key (full or filtered view)
     * @param {string} summary - AI-generated summary text
     * @param {Object} data - Governance data for fingerprint
     */
    function cacheAISummary(cacheKey, summary, data) {
        try {
            const cacheData = {
                summary: summary,
                timestamp: Date.now(),
                dataFingerprint: generateDataFingerprint(data)
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache AI summary:', error);
        }
    }
    
    /**
     * Get cached AI summary if valid
     * @param {string} cacheKey - Cache key
     * @param {Object} data - Current governance data
     * @returns {Object|null} Cached data or null if invalid/expired
     */
    function getCachedAISummary(cacheKey, data) {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const now = Date.now();
            const TTL = 24 * 60 * 60 * 1000; // 24 hours
            
            // Check if expired
            if (now - cacheData.timestamp > TTL) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            // Check if data changed (invalidate cache if metrics changed significantly)
            const currentFingerprint = generateDataFingerprint(data);
            if (cacheData.dataFingerprint !== currentFingerprint) {
                console.log('Cache invalidated: data changed');
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData;
        } catch (error) {
            console.warn('Failed to retrieve cached AI summary:', error);
            return null;
        }
    }
    
    /**
     * Generate fingerprint of governance data to detect changes
     * @param {Object} data - Governance data
     * @returns {string} Data fingerprint
     */
    function generateDataFingerprint(data) {
        return `${data.smokeDetectors.count}-${data.bauAnomalies.summary.highCount}-${data.dataHealth.missingMetrics}-${data.performanceMetrics.ux.achievementRate}`;
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
     * - Performance: 24hr caching to avoid unnecessary API calls
     * 
     * @see parseStructuredAIOutput for HTML parsing logic
     */
    async function generateAISummary(data) {
        const contentEl = document.getElementById('ai-summary-content');
        
        if (!contentEl) return;
        
        // Check for cached AI summary (24hr TTL)
        const cacheKey = `ai-summary-cache-${isUsingFilteredData ? 'filtered' : 'full'}`;
        const cached = getCachedAISummary(cacheKey, data);
        
        if (cached) {
            console.log('✅ Using cached AI summary (performance optimization)');
            contentEl.innerHTML = parseStructuredAIOutput(cached.summary);
            attachRiskBadgeListeners();
            return;
        }
        
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

CRITICAL FORMATTING RULES:
- ALWAYS use EXACT markers: [HIGH RISK], [MEDIUM RISK], [ATTENTION NEEDED]
- Use [HIGH RISK] when mentioning critical/urgent issues, failures, or high smoke detectors (≥3)
- Use [MEDIUM RISK] when mentioning monitoring needs, flagged items, or moderate concerns (1-2 detectors)
- Use [ATTENTION NEEDED] when mentioning missing data, incomplete metrics, or data gaps
- NEVER paraphrase these markers - use the EXACT brackets and text
- Place markers IMMEDIATELY after the relevant phrase

Example: "10 solutions [HIGH RISK] require immediate attention" NOT "10 solutions show critical issues"${isUsingFilteredData ? ' FOR THIS FILTERED SUBSET' : ''}.`;
            
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
            
            // Cache the AI summary for performance (24hr TTL)
            cacheAISummary(cacheKey, aiText, data);
            
            contentEl.innerHTML = parseStructuredAIOutput(aiText);
            // Attach interactive event listeners to risk badges
            attachRiskBadgeListeners();
            console.log('✅ AI summary generated with interactive badges (cached for 24hrs)');
            
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
    
    // Smoke Detector and Data Health Score cards removed - replaced by interactive risk badges in AI summary
    
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
        
        return createCollapsibleSection('resource-allocation', '', 'Resource Allocation', 
            '', // Removed subtitle for ultra-minimal design
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
    async function initializeBAUAnomalyChart(bauData) {
        // NEW: Wait for Chart.js to be available
        const chartJsReady = await waitForChartJs();
        if (!chartJsReady) {
            console.warn('⚠️ Chart.js not available - skipping BAU anomaly chart');
            return; // Gracefully skip chart creation
        }
        
        const canvas = document.getElementById('bau-anomaly-chart');
        if (!canvas) {
            console.error('Canvas element not found: bau-anomaly-chart');
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
    async function initializePTechChart(ptechData) {
        // NEW: Wait for Chart.js to be available
        const chartJsReady = await waitForChartJs();
        if (!chartJsReady) {
            console.warn('⚠️ Chart.js not available - skipping PTech involvement chart');
            return; // Gracefully skip chart creation
        }
        
        const canvas = document.getElementById('ptech-involvement-chart');
        if (!canvas) {
            console.error('Canvas element not found: ptech-involvement-chart');
            return;
        }
        
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
    async function initializePerformanceGauges(perfData, totalSolutions) {
        // NEW: Wait for Chart.js to be available
        const chartJsReady = await waitForChartJs();
        if (!chartJsReady) {
            console.warn('⚠️ Chart.js not available - skipping performance gauges');
            return; // Gracefully skip chart creation
        }
        
        // UX Gauge - with color coding (Green ≥70%, Red <70%)
        const uxCanvas = document.getElementById('ux-performance-gauge');
        if (uxCanvas) {
            new Chart(uxCanvas, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [perfData.ux.achievementRate, 100 - perfData.ux.achievementRate],
                        backgroundColor: [
                            perfData.ux.achievementRate >= 70 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
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
        
        // BI Gauge - with color coding (Green ≥70%, Red <70%)
        const biCanvas = document.getElementById('bi-performance-gauge');
        if (biCanvas) {
            new Chart(biCanvas, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [perfData.bi.achievementRate, 100 - perfData.bi.achievementRate],
                        backgroundColor: [
                            perfData.bi.achievementRate >= 70 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
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
     * Converts AI-generated risk markers into interactive, clickable badges with data attributes
     * 
     * @param {string} text - Text with potential severity markers
     * @returns {string} HTML with formatted, interactive severity badges
     */
    function parseInlineFormatting(text) {
        if (!text) return '';
        
        // Replace AI-generated markers with new user-friendly badge names
        let formatted = escapeHtml(text);
        
        // HIGH RISK → CRITICAL ISSUES (red badge, 'critical' data attribute)
        formatted = formatted.replace(/\[HIGH RISK\]/gi, 
            '<span class="ai-severity-badge ai-severity-high" data-risk-level="critical">CRITICAL ISSUES</span>');
        
        // MEDIUM RISK → MONITOR CLOSELY (orange badge, 'monitor' data attribute)
        formatted = formatted.replace(/\[MEDIUM RISK\]/gi, 
            '<span class="ai-severity-badge ai-severity-medium" data-risk-level="monitor">MONITOR CLOSELY</span>');
        
        // ATTENTION NEEDED → DATA GAPS (purple badge, 'datagaps' data attribute)
        formatted = formatted.replace(/\[ATTENTION NEEDED\]/gi, 
            '<span class="ai-severity-badge ai-severity-attention" data-risk-level="datagaps">DATA GAPS</span>');
        
        return formatted;
    }
    
    /**
     * Attach event listeners to risk badges for interactive filtering
     * Called after AI summary is rendered
     */
    function attachRiskBadgeListeners() {
        const badges = document.querySelectorAll('.ai-severity-badge[data-risk-level]');
        
        if (badges.length === 0) {
            console.log('No risk badges found to attach listeners');
            return;
        }
        
        console.log(`Attaching listeners to ${badges.length} risk badge(s)`);
        
        badges.forEach(badge => {
            const riskLevel = badge.getAttribute('data-risk-level');
            
            // CLICK: Navigate to Explore tab with filter
            badge.addEventListener('click', () => handleRiskBadgeClick(riskLevel));
            
            // HOVER: Show tooltip with solution names
            badge.addEventListener('mouseenter', (e) => showRiskTooltip(e.target, riskLevel));
            badge.addEventListener('mouseleave', () => hideRiskTooltip());
        });
    }
    
    /**
     * Handle risk badge click - publish cross-tab navigation event
     * @param {string} riskLevel - Risk level: 'critical', 'monitor', or 'datagaps'
     */
    function handleRiskBadgeClick(riskLevel) {
        console.log(`🎯 Risk badge clicked: ${riskLevel}`);
        
        // Publish event to trigger cross-tab navigation with filter
        window.Utils.publish('risk-badge:clicked', {
            riskLevel: riskLevel,
            timestamp: Date.now()
        });
    }
    
    /**
     * Show risk tooltip on hover with solution names and criteria
     * @param {HTMLElement} badgeElement - The badge element
     * @param {string} riskLevel - Risk level: 'critical', 'monitor', or 'datagaps'
     */
    function showRiskTooltip(badgeElement, riskLevel) {
        const portfolioData = window.State.getPortfolioData();
        
        if (!portfolioData || portfolioData.length === 0) {
            console.warn('No portfolio data available for tooltip');
            return;
        }
        
        // Get matching solutions using the risk categorization function
        const matchingSolutions = portfolioData
            .filter(product => window.DataManager.Filtering.categorizeProductRisk(product) === riskLevel)
            .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical sort
        
        const topSolutions = matchingSolutions.slice(0, 5);
        const remaining = matchingSolutions.length - 5;
        
        // Define labels and criteria for each risk level
        const labels = {
            critical: { 
                title: '🚨 CRITICAL ISSUES', 
                criteria: 'Risk score ≥ 7/10 • 3+ smoke detectors • Decline + missing metrics' 
            },
            monitor: { 
                title: '⚠️ MONITOR CLOSELY', 
                criteria: 'Risk score 4-6.9/10 • 1-2 smoke detectors • Below target (<50%)' 
            },
            datagaps: { 
                title: '💡 DATA GAPS', 
                criteria: 'Missing UX/BI metrics • Missing owner/targets • No tracking' 
            }
        };
        
        const config = labels[riskLevel];
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'risk-badge-tooltip';
        tooltip.innerHTML = `
            <div class="risk-tooltip-title">${config.title} (${matchingSolutions.length} Solution${matchingSolutions.length !== 1 ? 's' : ''})</div>
            <div class="risk-tooltip-criteria">Triggered by:<br>${config.criteria}</div>
            <div class="risk-tooltip-solutions">
                Solutions (alphabetically):<br>
                ${topSolutions.map(s => `• ${escapeHtml(s.name)}`).join('<br>')}
                ${remaining > 0 ? `<br>+ ${remaining} more...` : ''}
            </div>
            <div class="risk-tooltip-cta">👆 Click to filter on Explore tab</div>
        `;
        
        badgeElement.appendChild(tooltip);
    }
    
    /**
     * Hide risk tooltip
     */
    function hideRiskTooltip() {
        document.querySelectorAll('.risk-badge-tooltip').forEach(t => t.remove());
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
        
        // Clear cache since we're filtering
        clearCache();
        
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
    
    /**
     * Cancel any in-progress governance render
     * Called when user switches away from Insights tab
     */
    function cancelRender() {
        if (isRendering && currentAbortController) {
            console.log('🛑 Cancelling in-progress governance render...');
            currentAbortController.abort();
            isRendering = false;
            
            // Also hide loading state
            const governanceLoading = document.getElementById('governance-loading');
            if (governanceLoading) {
                governanceLoading.classList.add('hidden');
                governanceLoading.style.display = 'none';
            }
        }
    }
    
    /**
     * Clear the governance render cache
     * Call this when data changes or filters are applied
     */
    function clearCache() {
        cachedGovernanceHTML = null;
        cacheTimestamp = null;
        console.log('🗑️ Governance cache cleared');
    }
    
    // Export to UIManager namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Governance = {
        render: renderGovernanceDashboard,
        clearCache: clearCache,
        updateWithFilters: updateGovernanceWithFilters,
        cancelRender: cancelRender
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
    
    // Subscribe to data:loaded event for automatic cache invalidation
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, (data) => {
        console.log(`📡 ui-governance received data:loaded event (${data.portfolioData.length} items)`);
        
        // Clear cache when new data loads
        clearCache();
        
        // If we're on the governance tab, re-render
        if (window.State.getCurrentTab() === 'governance-dashboard') {
            console.log('🔄 Auto-refreshing governance dashboard with new data');
            renderGovernanceDashboard();
        }
    });
    
    // Subscribe to data:filtered event for automatic updates
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, (data) => {
        console.log(`📡 ui-governance received data:filtered event (${data.count} items)`);
        
        // Clear cache when filtered data changes
        clearCache();
        
        // Update dashboard if we're on the governance tab
        if (window.State.getCurrentTab() === 'governance-dashboard') {
            console.log('🔄 Auto-updating governance dashboard with filtered data');
            // The filters:changed event will handle the update
            // This is just for cache invalidation
        }
    });
    
    // Subscribe to data:governance:loaded event (for future server-side governance data)
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.GOVERNANCE_LOADED, (data) => {
        console.log('📡 ui-governance received data:governance:loaded event');
        
        // Clear cache and potentially use server-calculated data
        clearCache();
        
        // Future enhancement: Use server-calculated governance data if available
        // For now, we calculate client-side
    });
    
    console.log('✅ UI Governance module loaded (EVENT-DRIVEN)');
    console.log('📡 Subscribed to: filters:changed, data:loaded, data:filtered, data:governance:loaded');
    
})();

