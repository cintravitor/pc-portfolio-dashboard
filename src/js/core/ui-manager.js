/**
 * UI Manager Module
 * Handles all user interface operations: rendering, tab management, events, and DOM manipulation
 * 
 * REFACTORED: Now uses centralized State management (window.State)
 * - Removed local state variables (currentTab, analysisDataLoaded, chartJsLoaded, chartInstances)
 * - All state access goes through window.State getters/setters
 * - Utility functions accessed via window.Utils
 */

// ==================== NOTE: STATE MANAGEMENT ====================
// This module NO LONGER maintains its own state variables.
// All UI state is managed through window.State:
// - window.State.getCurrentTab() / setCurrentTab()
// - window.State.isAnalysisDataLoaded() / setAnalysisDataLoaded()
// - window.State.isChartJsLoaded() / setChartJsLoaded()
// - window.State.getChartInstance() / setChartInstance() / removeChartInstance()

// ==================== TAB MANAGEMENT ====================

/**
 * Switch between tabs
 * @param {string} tabName - Tab identifier
 */
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Update current tab in State
    window.State.setCurrentTab(tabName);
    
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
    if (tabName === 'descriptive-analysis' && !window.State.isAnalysisDataLoaded()) {
        loadDescriptiveAnalysis();
    }
    
    // Load strategic view when switching to that tab
    if (tabName === 'strategic-view') {
        renderStrategicView();
    }
    
    // Load planning view when switching to that tab
    if (tabName === 'planning-view') {
        renderPlanningView();
    }
}

// ==================== FILTER UI ====================

/**
 * Setup tactical filters and sorting for Portfolio Overview
 * This function initializes all filter and sort controls for the tactical view
 */
function setupTacticalFilters() {
    console.log('Setting up tactical filters and sorting...');
    
    // Populate filter dropdowns with current data
    populateFilters();
    
    // Setup event listeners for all filter controls
    const searchInput = document.getElementById('search-input');
    const areaSelect = document.getElementById('filter-area');
    const maturitySelect = document.getElementById('filter-maturity');
    const ownerSelect = document.getElementById('filter-owner');
    const sortBySelect = document.getElementById('sort-by');
    
    // Use debounced filtering for search input (improves performance)
    if (searchInput) {
        const debouncedFilter = window.DataManager.debounce(applyFiltersFromUI, 300);
        searchInput.addEventListener('input', debouncedFilter);
    }
    
    // Add change listeners for filter dropdowns
    if (areaSelect) {
        areaSelect.addEventListener('change', applyFiltersFromUI);
    }
    
    if (maturitySelect) {
        maturitySelect.addEventListener('change', applyFiltersFromUI);
    }
    
    if (ownerSelect) {
        ownerSelect.addEventListener('change', applyFiltersFromUI);
    }
    
    // Add change listener for sort dropdown
    if (sortBySelect) {
        sortBySelect.addEventListener('change', applyFiltersFromUI);
    }
    
    // Setup click-to-filter for data quality stat cards
    setupDataQualityFilters();
    
    console.log('✅ Tactical filters and sorting configured');
}

/**
 * Setup click-to-filter event listeners for data quality stat cards
 */
function setupDataQualityFilters() {
    const missingUXCard = document.querySelector('[data-filter-type="missing-ux-metric"]');
    const missingBICard = document.querySelector('[data-filter-type="missing-bi-metric"]');
    
    if (missingUXCard) {
        missingUXCard.addEventListener('click', () => {
            filterByMissingMetric('UX');
        });
    }
    
    if (missingBICard) {
        missingBICard.addEventListener('click', () => {
            filterByMissingMetric('BI');
        });
    }
}

/**
 * Filter products by missing metrics (UX or BI)
 * @param {string} metricType - Either 'UX' or 'BI'
 */
function filterByMissingMetric(metricType) {
    const portfolioData = window.DataManager.getPortfolioData();
    
    // Filter products with missing metrics
    const filtered = portfolioData.filter(product => {
        if (metricType === 'UX') {
            // Check if UX metric is missing
            if (product.monthlyUX && Array.isArray(product.monthlyUX)) {
                const lastValue = product.monthlyUX[product.monthlyUX.length - 1];
                return !lastValue || 
                       lastValue === 'N/A' || 
                       lastValue === '' || 
                       lastValue === '0' ||
                       parseFloat(lastValue) === 0;
            }
            return true; // No monthlyUX array
        } else {
            // Check if BI metric is missing
            if (product.monthlyBI && Array.isArray(product.monthlyBI)) {
                const lastValue = product.monthlyBI[product.monthlyBI.length - 1];
                return !lastValue || 
                       lastValue === 'N/A' || 
                       lastValue === '' || 
                       lastValue === '0' ||
                       parseFloat(lastValue) === 0;
            }
            return true; // No monthlyBI array
        }
    });
    
    // Update filtered data in state
    window.State.setFilteredData(filtered);
    
    // Clear all filter UI controls (so they show "All")
    document.getElementById('search-input').value = '';
    document.getElementById('filter-area').value = '';
    document.getElementById('filter-maturity').value = '';
    document.getElementById('filter-owner').value = '';
    
    // Render filtered cards
    renderCards();
    updateStats();
    
    // Show notification about what was filtered
    showDataQualityFilterNotification(metricType, filtered.length);
}

/**
 * Show notification when data quality filter is applied
 * @param {string} metricType - Either 'UX' or 'BI'
 * @param {number} count - Number of filtered products
 */
function showDataQualityFilterNotification(metricType, count) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.data-quality-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification banner
    const notification = document.createElement('div');
    notification.className = 'data-quality-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">⚠️</span>
            <span class="notification-text">
                Showing <strong>${count} product${count !== 1 ? 's' : ''}</strong> with missing ${metricType} metric updates
            </span>
            <button class="notification-close" onclick="clearDataQualityFilter()">
                <span>✕</span> Clear Filter
            </button>
        </div>
    `;
    
    // Insert notification at top of content area
    const contentLeft = document.getElementById('content-left');
    const statsBar = document.getElementById('stats-bar');
    contentLeft.insertBefore(notification, statsBar.nextSibling);
}

/**
 * Clear data quality filter and show all products
 * Exposed globally for onclick handler
 */
function clearDataQualityFilter() {
    // Remove notification
    const notification = document.querySelector('.data-quality-notification');
    if (notification) {
        notification.remove();
    }
    
    // Clear filters and show all products
    clearFilters();
}

// Expose globally for HTML onclick
window.clearDataQualityFilter = clearDataQualityFilter;

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
    const sortBy = document.getElementById('sort-by').value;

    window.DataManager.applyFilters(searchTerm, areaFilter, maturityFilter, ownerFilter, sortBy);
    
    renderCards();
    updateStats();
    renderFilterPills(); // Update filter pills UI
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-area').value = '';
    document.getElementById('filter-maturity').value = '';
    document.getElementById('filter-owner').value = '';
    document.getElementById('sort-by').value = '';
    applyFiltersFromUI();
}

// ==================== FILTER PILLS ====================

/**
 * Render active filter pills
 * Shows visual tags for each active filter with remove buttons
 */
function renderFilterPills() {
    const pillsContainer = document.getElementById('filter-pills-container');
    const pillsElement = document.getElementById('filter-pills');
    
    if (!pillsContainer || !pillsElement) {
        console.warn('Filter pills container not found');
        return;
    }
    
    // Get current filter values
    const searchTerm = document.getElementById('search-input')?.value || '';
    const areaFilter = document.getElementById('filter-area')?.value || '';
    const maturityFilter = document.getElementById('filter-maturity')?.value || '';
    const ownerFilter = document.getElementById('filter-owner')?.value || '';
    const sortBy = document.getElementById('sort-by')?.value || '';
    
    // Build array of active filters
    const activeFilters = [];
    
    if (searchTerm.trim()) {
        activeFilters.push({
            type: 'search',
            label: 'Search',
            value: searchTerm,
            icon: '🔍'
        });
    }
    
    if (areaFilter) {
        activeFilters.push({
            type: 'area',
            label: 'Area',
            value: areaFilter,
            icon: '🏢'
        });
    }
    
    if (maturityFilter) {
        activeFilters.push({
            type: 'maturity',
            label: 'Maturity',
            value: maturityFilter,
            icon: '🔄'
        });
    }
    
    if (ownerFilter) {
        activeFilters.push({
            type: 'owner',
            label: 'Owner',
            value: ownerFilter,
            icon: '👤'
        });
    }
    
    if (sortBy) {
        const sortLabels = {
            'name-asc': 'Name (A-Z)',
            'name-desc': 'Name (Z-A)',
            'maturity-asc': 'Maturity Stage',
            'area-asc': 'Area (A-Z)',
            'owner-asc': 'Owner (A-Z)'
        };
        activeFilters.push({
            type: 'sort',
            label: 'Sort',
            value: sortLabels[sortBy] || sortBy,
            icon: '⬆️'
        });
    }
    
    // Show or hide container based on active filters
    if (activeFilters.length === 0) {
        pillsContainer.style.display = 'none';
        return;
    }
    
    pillsContainer.style.display = 'flex';
    
    // Render pills
    pillsElement.innerHTML = activeFilters.map((filter, index) => `
        <div class="filter-pill" data-filter-type="${filter.type}" data-filter-index="${index}">
            <span class="filter-pill-icon">${filter.icon}</span>
            <span class="filter-pill-text">
                <strong>${escapeHtml(filter.label)}:</strong> ${escapeHtml(filter.value)}
            </span>
            <button class="filter-pill-remove" 
                    onclick="removeFilterPill('${filter.type}')" 
                    title="Remove ${escapeHtml(filter.label)} filter"
                    aria-label="Remove ${escapeHtml(filter.label)} filter">
                ×
            </button>
        </div>
    `).join('');
}

/**
 * Remove a specific filter pill
 * @param {string} filterType - Type of filter to remove ('search', 'area', 'maturity', 'owner', 'sort')
 */
function removeFilterPill(filterType) {
    // Clear the specific filter
    switch (filterType) {
        case 'search':
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            break;
            
        case 'area':
            const areaFilter = document.getElementById('filter-area');
            if (areaFilter) areaFilter.value = '';
            break;
            
        case 'maturity':
            const maturityFilter = document.getElementById('filter-maturity');
            if (maturityFilter) maturityFilter.value = '';
            break;
            
        case 'owner':
            const ownerFilter = document.getElementById('filter-owner');
            if (ownerFilter) ownerFilter.value = '';
            break;
            
        case 'sort':
            const sortBy = document.getElementById('sort-by');
            if (sortBy) sortBy.value = '';
            break;
            
        default:
            console.warn('Unknown filter type:', filterType);
            return;
    }
    
    // Re-apply filters and update UI
    applyFiltersFromUI();
}

// Expose removeFilterPill globally for onclick handlers
window.removeFilterPill = removeFilterPill;

// ==================== CARD RENDERING ====================

/**
 * Render product cards (optimized compact design)
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

    container.innerHTML = filteredData.map(product => {
        // Get summary metrics for compact display
        const summary = window.DataManager.getCardSummaryMetrics(product);
        
        // Generate metric status indicators
        const uxIndicator = getMetricIndicator('UX', summary.uxStatus, summary.uxMetric, summary.uxValue, summary.uxTarget);
        const biIndicator = getMetricIndicator('BI', summary.biStatus, summary.biMetric, summary.biValue, summary.biTarget);
        
        return `
        <div class="product-card product-card-compact fade-in" data-product-id="${product.id}">
            <div class="card-header-compact">
                <div class="card-title-compact">
                    ${escapeHtml(product.name)}
                </div>
                <span class="status-badge-compact ${getStatusClass(summary.maturity)}">
                    ${escapeHtml(summary.maturity)}
                </span>
            </div>
            
            <div class="card-body-compact">
                <div class="card-meta-row">
                    <div class="card-meta-item">
                        <span class="meta-icon">🏢</span>
                        <span class="meta-text">${escapeHtml(summary.area)}</span>
                    </div>
                    <div class="card-meta-item">
                        <span class="meta-icon">👤</span>
                        <span class="meta-text">${truncateText(escapeHtml(summary.owner), 25)}</span>
                    </div>
                </div>
                
                <div class="card-problem">
                    ${truncateText(escapeHtml(summary.problem), 80)}
                </div>
                
                <div class="card-metrics">
                    <div class="metric-label">Metrics vs Target:</div>
                    <div class="metric-indicators">
                        ${uxIndicator}
                        ${biIndicator}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Generate metric indicator HTML
 * @param {string} label - Metric label (UX or BI)
 * @param {string} status - Status color (green, red, gray)
 * @param {string} metricName - Name of the metric
 * @param {number|null} value - Current value
 * @param {number|null} target - Target value
 * @returns {string} HTML for metric indicator
 */
function getMetricIndicator(label, status, metricName, value, target) {
    let icon, tooltip, statusClass;
    
    switch (status) {
        case 'green':
            icon = '🟢';
            statusClass = 'metric-green';
            tooltip = `${label}: ${metricName}\nCurrent: ${value !== null ? value.toFixed(1) : 'N/A'} | Target: ${target !== null ? target.toFixed(1) : 'N/A'}\n✓ Meeting target`;
            break;
        case 'red':
            icon = '🔴';
            statusClass = 'metric-red';
            tooltip = `${label}: ${metricName}\nCurrent: ${value !== null ? value.toFixed(1) : 'N/A'} | Target: ${target !== null ? target.toFixed(1) : 'N/A'}\n✗ Below target`;
            break;
        case 'gray':
        default:
            icon = '⚪';
            statusClass = 'metric-gray';
            tooltip = `${label}: ${metricName === 'N/A' ? 'Not defined' : 'No data available'}`;
            break;
    }
    
    return `
        <div class="metric-indicator ${statusClass}" title="${tooltip}">
            <span class="metric-icon">${icon}</span>
            <span class="metric-label-text">${label}</span>
        </div>
    `;
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
                            <div class="detail-field-label">${escapeHtml(product.keyMetricUX) || 'Metric'}</div>
                            <div class="chart-container">
                                <canvas id="chart-ux"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Key Metrics - BI -->
                    <div class="detail-section">
                        <div class="detail-section-title">Key Metrics - Business Impact</div>
                        <div class="detail-field">
                            <div class="detail-field-label">${escapeHtml(product.keyMetricBI) || 'Metric'}</div>
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
 * @param {HTMLElement} header - The header element that was clicked
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
                        loadChartJs().then(() => {
                            renderMetricChart('chart-ux', product.monthlyUX, product.targetUX, product.keyMetricUX);
                            renderMetricChart('chart-bi', product.monthlyBI, product.targetBI, product.keyMetricBI);
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

// ==================== CHARTS ====================

/**
 * Lazy load Chart.js library when needed
 * This improves initial page load by ~200ms and saves ~120KB
 */
function loadChartJs() {
    if (window.Chart || window.State.isChartJsLoaded()) {
        return Promise.resolve();
    }
    
    console.log('Loading Chart.js...');
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            window.State.setChartJsLoaded(true);
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
        
        // Destroy existing chart if it exists (use State)
        const existingChart = window.State.getChartInstance(canvasId);
        if (existingChart) {
            existingChart.destroy();
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
    
    // Create chart and store in State
    const chart = new Chart(ctx, {
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
        
        // Store chart instance in State
        window.State.setChartInstance(canvasId, chart);
        
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
    const missingMetrics = window.DataManager.countMissingMetrics();
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-showing').textContent = stats.showing;
    document.getElementById('stat-live').textContent = stats.live;
    document.getElementById('stat-dev').textContent = stats.dev;
    
    // Update new data quality cards
    document.getElementById('stat-missing-ux').textContent = missingMetrics.missingUX;
    document.getElementById('stat-missing-bi').textContent = missingMetrics.missingBI;
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

/**
 * Create Portfolio Health Score section with narrative
 */
function createHealthScoreSection(metrics) {
    const section = document.createElement('div');
    section.className = 'executive-section';
    
    // Determine health level and color
    const score = metrics.healthScore;
    let scoreClass, scoreLabel, scoreColor;
    
    if (score >= 80) {
        scoreClass = 'score-excellent';
        scoreLabel = 'Excellent';
        scoreColor = 'green';
    } else if (score >= 65) {
        scoreClass = 'score-good';
        scoreLabel = 'Good';
        scoreColor = 'blue';
    } else if (score >= 50) {
        scoreClass = 'score-fair';
        scoreLabel = 'Fair';
        scoreColor = 'orange';
    } else {
        scoreClass = 'score-poor';
        scoreLabel = 'Needs Attention';
        scoreColor = 'red';
    }
    
    // Build health score breakdown HTML
    let breakdownHTML = '';
    if (metrics.healthScoreBreakdown && metrics.healthScoreBreakdown.length > 0) {
        breakdownHTML = `
            <div class="health-score-breakdown">
                <h3 class="health-breakdown-title">Key Factors Affecting Health Score:</h3>
                <ul class="health-breakdown-list">
                    ${metrics.healthScoreBreakdown.map((factor, index) => `
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
 * Create Drill-Down KPI Cards - Clickable cards that filter Portfolio Overview
 * These cards act as a command center for executives to drill into specific product segments
 */
function createDrillDownKPICards(metrics) {
    const section = document.createElement('div');
    section.className = 'executive-section kpi-drill-down-section';
    
    section.innerHTML = `
        <h2 class="executive-section-title">🎯 Portfolio Command Center</h2>
        <p class="executive-section-subtitle">Click any card to drill down into specific product segments</p>
        
        <div class="kpi-cards-grid">
            <!-- High Risk Products Card -->
            <div class="kpi-drill-card high-risk" data-drill-type="high-risk" onclick="drillDownToTacticalView('high-risk')">
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
            
            <!-- Medium Risk Products Card -->
            <div class="kpi-drill-card medium-risk" data-drill-type="medium-risk" onclick="drillDownToTacticalView('medium-risk')">
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
            
            <!-- Low Risk Products Card -->
            <div class="kpi-drill-card low-risk" data-drill-type="low-risk" onclick="drillDownToTacticalView('low-risk')">
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
            
            <!-- Below Target Products Card -->
            <div class="kpi-drill-card below-target" data-drill-type="below-target" onclick="drillDownToTacticalView('below-target')">
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
            
            <!-- Star Performers Card -->
            <div class="kpi-drill-card star-performers" data-drill-type="star-performers" onclick="drillDownToTacticalView('star-performers')">
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
            
            <!-- Products at Risk Card -->
            <div class="kpi-drill-card products-at-risk" data-drill-type="products-at-risk" onclick="drillDownToTacticalView('products-at-risk')">
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
 * Create Risk & Opportunity Matrix section with scatter plot
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
    setTimeout(() => {
        createRiskOpportunityScatterChart(metrics);
    }, 100);
    
    // Add narrative
    const narrative = generateMatrixNarrative(metrics);
    const narrativeDiv = document.createElement('div');
    narrativeDiv.className = 'executive-narrative';
    narrativeDiv.innerHTML = narrative;
    section.appendChild(narrativeDiv);
    
    return section;
}

/**
 * Create the scatter plot for Risk & Opportunity Matrix
 */
function createRiskOpportunityScatterChart(metrics) {
    const canvas = document.getElementById('chart-risk-opportunity-matrix');
    if (!canvas) {
        console.warn('Matrix canvas not found');
        return;
    }
    
    // Group products by quadrant for color-coding
    const dataByQuadrant = {
        star: [],
        monitor: [],
        improve: [],
        critical: []
    };
    
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
                legend: {
                    display: false // Using custom legend
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleFont: {
                        size: 14,
                        weight: 'bold',
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
                        title: function(context) {
                            return context[0].raw.productName || 'Product';
                        },
                        label: function(context) {
                            return [
                                `Risk Score: ${context.parsed.x.toFixed(1)}/10`,
                                `Performance: ${context.parsed.y.toFixed(0)}%`,
                                `Area: ${context.raw.area || 'N/A'}`,
                                `Maturity: ${context.raw.maturity || 'N/A'}`
                            ];
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Vertical line at risk threshold (5)
                        line1: {
                            type: 'line',
                            xMin: 5,
                            xMax: 5,
                            borderColor: 'rgba(156, 163, 175, 0.5)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                display: false
                            }
                        },
                        // Horizontal line at performance threshold (50%)
                        line2: {
                            type: 'line',
                            yMin: 50,
                            yMax: 50,
                            borderColor: 'rgba(156, 163, 175, 0.5)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                display: false
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Risk Score (Lower is Better) →',
                        font: {
                            size: 13,
                            weight: '600',
                            family: "'Inter', sans-serif"
                        },
                        color: '#1f2937'
                    },
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        color: '#6b7280'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '↑ Performance Score (Higher is Better)',
                        font: {
                            size: 13,
                            weight: '600',
                            family: "'Inter', sans-serif"
                        },
                        color: '#1f2937'
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        color: '#6b7280',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                }
            }
        }
    });
}

/**
 * Generate narrative text for Risk & Opportunity Matrix
 */
function generateMatrixNarrative(metrics) {
    // Count products in each quadrant
    const quadrantCounts = {
        star: 0,
        monitor: 0,
        improve: 0,
        critical: 0
    };
    
    metrics.riskOpportunityData.forEach(product => {
        quadrantCounts[product.quadrant]++;
    });
    
    const total = metrics.totalProducts;
    
    let narrative = '';
    
    // Focus on critical quadrant
    if (quadrantCounts.critical > 0) {
        const criticalPercent = Math.round((quadrantCounts.critical / total) * 100);
        narrative += `<strong class="text-danger">${quadrantCounts.critical} products (${criticalPercent}%)</strong> are in the <strong>Critical</strong> quadrant (high risk, low performance) and require immediate attention. `;
    }
    
    // Highlight star performers
    if (quadrantCounts.star > 0) {
        const starPercent = Math.round((quadrantCounts.star / total) * 100);
        narrative += `<strong class="text-success">${quadrantCounts.star} products (${starPercent}%)</strong> are <strong>Star Performers</strong> (low risk, high performance) and can serve as benchmarks. `;
    }
    
    // Mention monitor quadrant
    if (quadrantCounts.monitor > 0) {
        const monitorPercent = Math.round((quadrantCounts.monitor / total) * 100);
        narrative += `${quadrantCounts.monitor} products (${monitorPercent}%) are performing well but carry high risk and should be <strong>monitored closely</strong>. `;
    }
    
    // Mention improve quadrant
    if (quadrantCounts.improve > 0) {
        const improvePercent = Math.round((quadrantCounts.improve / total) * 100);
        narrative += `${quadrantCounts.improve} products (${improvePercent}%) have low risk but underperforming and present <strong>opportunities for improvement</strong>. `;
    }
    
    // Strategic recommendation
    if (quadrantCounts.critical > quadrantCounts.star) {
        narrative += '<br><br><strong>Recommendation:</strong> Focus resources on moving critical products either to lower risk or higher performance. Consider resource reallocation from stable products to critical ones.';
    } else {
        narrative += '<br><br><strong>Recommendation:</strong> Leverage learnings from star performers to improve products in other quadrants. Maintain current risk management practices.';
    }
    
    return narrative;
}

/**
 * Create Risk & Opportunity Lists section
 */
function createRiskOpportunityLists(metrics) {
    const section = document.createElement('div');
    section.className = 'executive-section';
    
    section.innerHTML = `
        <h2 class="executive-section-title">🎯 Risk & Opportunity Analysis</h2>
        <p class="executive-section-subtitle">Top products requiring attention and best performers to leverage</p>
        
        <div class="executive-lists-grid">
            <!-- Top Risks -->
            <div class="executive-list-card">
                <h3 class="executive-list-title risks">🚨 Top 3 Risks</h3>
                <ul class="executive-list" id="top-risks-list"></ul>
            </div>
            
            <!-- Top Opportunities -->
            <div class="executive-list-card">
                <h3 class="executive-list-title opportunities">🌟 Top 3 Opportunities</h3>
                <ul class="executive-list" id="top-opportunities-list"></ul>
            </div>
        </div>
    `;
    
    // Populate lists after DOM insertion
    setTimeout(() => {
        populateRisksList(metrics.topRisks);
        populateOpportunitiesList(metrics.topOpportunities);
    }, 0);
    
    // Add narrative
    const narrative = generateRiskOpportunityNarrative(metrics);
    const narrativeDiv = document.createElement('div');
    narrativeDiv.className = 'executive-narrative';
    narrativeDiv.innerHTML = narrative;
    section.appendChild(narrativeDiv);
    
    return section;
}

/**
 * Populate Top Risks list
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

/**
 * Populate Top Opportunities list
 */
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
 * Create Strategic Alignment Charts section
 */
function createStrategicAlignmentCharts(metrics) {
    const section = document.createElement('div');
    section.className = 'executive-section';
    
    section.innerHTML = `
        <h2 class="executive-section-title">🎯 Strategic Alignment & Resource Allocation</h2>
        <p class="executive-section-subtitle">Product distribution across areas and maturity stages</p>
        
        <div class="executive-charts-grid">
            <!-- Alignment by Area Chart -->
            <div class="executive-chart-card">
                <h3 class="executive-chart-title">📍 Products by P&C Area</h3>
                <div class="executive-chart-wrapper">
                    <canvas id="chart-alignment-area"></canvas>
                </div>
            </div>
            
            <!-- Allocation by Maturity Chart -->
            <div class="executive-chart-card">
                <h3 class="executive-chart-title">📈 Products by Maturity Stage</h3>
                <div class="executive-chart-wrapper">
                    <canvas id="chart-allocation-maturity"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Create charts after DOM insertion
    setTimeout(() => {
        createAlignmentCharts(metrics);
    }, 100);
    
    // Add narrative
    const narrative = generateStrategicAlignmentNarrative(metrics);
    const narrativeDiv = document.createElement('div');
    narrativeDiv.className = 'executive-narrative';
    narrativeDiv.innerHTML = narrative;
    section.appendChild(narrativeDiv);
    
    return section;
}

/**
 * Create Chart.js charts for strategic alignment
 */
function createAlignmentCharts(metrics) {
    // Chart 1: Products by P&C Area (Pie Chart)
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
                        labels: { 
                            padding: 15, 
                            font: { size: 12, weight: '600', family: "'Inter', sans-serif" }
                        }
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
    
    // Chart 2: Products by Maturity (Bar Chart)
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
                    ],
                    borderRadius: 8,
                    barThickness: 60
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
                        titleFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                        bodyFont: { size: 13, family: "'Inter', sans-serif" }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            stepSize: 1, 
                            font: { size: 12, family: "'Inter', sans-serif" } 
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 12, weight: '600', family: "'Inter', sans-serif" } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

/**
 * Generate narrative text for Health Score
 */
function generateHealthScoreNarrative(metrics, scoreLabel) {
    const score = metrics.healthScore;
    let narrative = `The portfolio's health is <span class="highlight">${scoreLabel}</span> with a score of <strong>${score}/100</strong>. `;
    
    if (score >= 80) {
        narrative += `This indicates <strong>strong portfolio performance</strong> with well-managed risks. Continue monitoring top performers and maintain current strategic direction.`;
    } else if (score >= 65) {
        narrative += `This indicates <strong>solid portfolio performance</strong> with manageable risks. Focus on elevating medium-performing products and addressing identified risk areas.`;
    } else if (score >= 50) {
        narrative += `This indicates <strong>moderate portfolio health</strong> with some concerns. Immediate attention needed for ${metrics.productsAtRisk} high-risk products. Consider reallocating resources to improve performance.`;
    } else {
        narrative += `This indicates <strong>portfolio health needs significant improvement</strong>. Urgent action required: ${metrics.productsAtRisk} products are at critical risk. Recommend immediate strategic review and intervention plan.`;
    }
    
    narrative += ` The portfolio includes <strong>${metrics.starPerformers} star performers</strong> and <strong>${metrics.needsAttention} products needing attention</strong>.`;
    
    return narrative;
}

/**
 * Generate narrative text for Risk & Opportunity Analysis
 */
function generateRiskOpportunityNarrative(metrics) {
    let narrative = '';
    
    // Risk narrative
    if (metrics.topRisks.length > 0) {
        const topRisk = metrics.topRisks[0];
        narrative += `The highest risk product is <span class="highlight">${escapeHtml(topRisk.name)}</span> with a risk score of <strong>${topRisk.riskScore.toFixed(1)}/10</strong>. `;
        
        if (metrics.riskBreakdown.high > 0) {
            narrative += `Overall, <strong>${metrics.riskBreakdown.high} products</strong> are classified as high risk and require immediate attention. `;
        }
    }
    
    // Opportunity narrative
    if (metrics.topOpportunities.length > 0) {
        const topOpp = metrics.topOpportunities[0];
        narrative += `The top performing product is <span class="highlight">${escapeHtml(topOpp.name)}</span> achieving <strong>${topOpp.performanceScore}% target performance</strong>. `;
        
        if (metrics.starPerformers > 0) {
            narrative += `Leverage insights from the <strong>${metrics.starPerformers} star performers</strong> to improve other products in the portfolio.`;
        }
    }
    
    if (!narrative) {
        narrative = 'Insufficient data to generate risk and opportunity insights. Continue collecting performance data for more comprehensive analysis.';
    }
    
    return narrative;
}

/**
 * Generate narrative text for Strategic Alignment
 */
function generateStrategicAlignmentNarrative(metrics) {
    // Find highest and lowest areas
    const areaEntries = Object.entries(metrics.alignmentByArea).sort((a, b) => b[1] - a[1]);
    const highestArea = areaEntries[0];
    const lowestArea = areaEntries[areaEntries.length - 1];
    
    // Find maturity distribution
    const maturityEntries = Object.entries(metrics.allocationByMaturity);
    const developmentCount = metrics.allocationByMaturity['1. Development'] || 0;
    const matureCount = metrics.allocationByMaturity['3. Mature'] || 0;
    
    let narrative = `Resources are heavily allocated to the <span class="highlight">${escapeHtml(highestArea[0])}</span> area with <strong>${highestArea[1]} products (${Math.round((highestArea[1]/metrics.totalProducts)*100)}%)</strong>, while the <span class="highlight">${escapeHtml(lowestArea[0])}</span> area has the lowest allocation with <strong>${lowestArea[1]} products</strong>. `;
    
    narrative += `The portfolio maturity distribution shows <strong>${developmentCount} products in development</strong> and <strong>${matureCount} mature products</strong>. `;
    
    if (developmentCount > matureCount) {
        narrative += `The high proportion of products in early stages suggests a <strong>growth-focused strategy</strong> with investment in innovation. Monitor development progress closely and ensure adequate resources for scaling.`;
    } else if (matureCount > developmentCount * 2) {
        narrative += `The concentration in mature products indicates a <strong>stability-focused portfolio</strong>. Consider increasing investment in innovation and new product development to maintain competitive advantage.`;
    } else {
        narrative += `The balanced maturity distribution suggests a <strong>well-diversified portfolio</strong> with both stable revenue sources and growth opportunities.`;
    }
    
    return narrative;
}

// Keep old strategic view function as alias for backward compatibility
function renderStrategicView() {
    renderExecutiveView();
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
        
        // Mark as loaded in State
        window.State.setAnalysisDataLoaded(true);
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

// ==================== PLANNING VIEW ====================

/**
 * Render Planning View - Unified workspace for Portfolio Managers
 * Combines anomaly alerts, filters, and key charts in one integrated view
 */
function renderPlanningView() {
    console.log('Rendering Planning View...');
    
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
                <p>Please load the Portfolio Overview tab first to see planning insights.</p>
                <button class="refresh-btn" onclick="window.UIManager.switchTab('portfolio-overview')" style="margin-top: 1.5rem;">
                    Go to Portfolio Overview
                </button>
            </div>
        `;
        return;
    }
    
    console.log('Planning View data loaded:', portfolioData.length, 'products');
    
    // Clear and start building
    planningContent.innerHTML = '';
    
    // Create header section
    const headerSection = createPlanningHeaderSection();
    planningContent.appendChild(headerSection);
    
    // ========== 1. ANOMALY ALERTS SECTION ==========
    const anomalySection = createAnomalyAlertsSection();
    planningContent.appendChild(anomalySection);
    
    // ========== 2. FILTERS SECTION ==========
    const filtersSection = createPlanningFiltersSection();
    planningContent.appendChild(filtersSection);
    
    // ========== 3. KEY INSIGHTS & CHARTS SECTION ==========
    const chartsSection = createPlanningChartsSection();
    planningContent.appendChild(chartsSection);
    
    // Apply initial rendering of charts after DOM insertion
    setTimeout(() => {
        renderPlanningCharts(portfolioData);
        setupPlanningFilters();
    }, 100);
    
    console.log('✅ Planning View rendered successfully');
}

/**
 * Create Planning View header section
 */
function createPlanningHeaderSection() {
    const section = document.createElement('div');
    section.className = 'planning-header';
    
    section.innerHTML = `
        <div class="planning-header-content">
            <h1 class="planning-title">📋 Planning View</h1>
            <p class="planning-subtitle">Unified workspace with anomaly detection, filtering, and key portfolio insights</p>
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
                                <div class="anomaly-card owner-overload">
                                    <div class="anomaly-card-header">
                                        <span class="anomaly-owner">${escapeHtml(item.owner)}</span>
                                        <span class="anomaly-count">${item.productCount} products</span>
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
                                <div class="anomaly-card data-health-issue">
                                    <div class="anomaly-card-header">
                                        <span class="anomaly-product">${escapeHtml(item.name)}</span>
                                        <span class="anomaly-issue-count">${item.issueCount} issue${item.issueCount > 1 ? 's' : ''}</span>
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
                                    <button class="btn-secondary" onclick="console.log(window.DataManager.checkAnomalies())">
                                        View Full Report in Console
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
 * Create Planning Filters Section
 */
function createPlanningFiltersSection() {
    const section = document.createElement('div');
    section.className = 'planning-section filters-section-planning';
    
    section.innerHTML = `
        <div class="planning-section-header">
            <h2 class="planning-section-title">
                <span class="section-icon">🔍</span>
                Portfolio Filters
            </h2>
            <p class="planning-section-subtitle">Filter the visualizations below to focus on specific segments</p>
        </div>
        
        <div class="planning-filters-container">
            <div class="planning-filter-group">
                <label class="planning-filter-label">P&C Area</label>
                <select id="planning-filter-area" class="planning-filter-select">
                    <option value="">All Areas</option>
                </select>
            </div>
            
            <div class="planning-filter-group">
                <label class="planning-filter-label">Maturity Stage</label>
                <select id="planning-filter-maturity" class="planning-filter-select">
                    <option value="">All Stages</option>
                </select>
            </div>
            
            <div class="planning-filter-group">
                <label class="planning-filter-label">Owner</label>
                <select id="planning-filter-owner" class="planning-filter-select">
                    <option value="">All Owners</option>
                </select>
            </div>
            
            <button class="planning-filter-clear" onclick="clearPlanningFilters()">
                Clear Filters
            </button>
        </div>
        
        <div class="planning-filter-summary" id="planning-filter-summary">
            Showing all <span id="planning-filtered-count">0</span> products
        </div>
    `;
    
    return section;
}

/**
 * Create Planning Charts Section with rationale tooltips
 */
function createPlanningChartsSection() {
    const section = document.createElement('div');
    section.className = 'planning-section charts-section-planning';
    
    section.innerHTML = `
        <div class="planning-section-header">
            <h2 class="planning-section-title">
                <span class="section-icon">📊</span>
                Key Portfolio Insights
            </h2>
            <p class="planning-section-subtitle">Distribution charts dynamically updated based on your filter selection</p>
        </div>
        
        <div class="planning-charts-grid">
            <!-- Maturity Distribution Chart -->
            <div class="planning-chart-card">
                <div class="planning-chart-header">
                    <h3 class="planning-chart-title">🔄 Maturity Stage Distribution</h3>
                    <button class="chart-info-btn" data-tooltip="maturity">
                        <span class="info-icon">ℹ️</span>
                    </button>
                </div>
                <div class="chart-tooltip" id="tooltip-maturity" style="display: none;">
                    <h4>Why This Matters</h4>
                    <p><strong>Pipeline Health:</strong> This chart helps identify potential bottlenecks in your product pipeline.</p>
                    <ul>
                        <li><strong>High Development:</strong> May signal resourcing constraints or slow time-to-market</li>
                        <li><strong>High Mature:</strong> Could indicate need for new strategic investments or innovation</li>
                        <li><strong>Balanced Distribution:</strong> Shows healthy portfolio lifecycle management</li>
                    </ul>
                    <p class="tooltip-action">💡 Use this to prioritize resource allocation and identify pipeline risks.</p>
                </div>
                <div class="planning-chart-wrapper">
                    <canvas id="planning-chart-maturity"></canvas>
                </div>
            </div>
            
            <!-- Area Distribution Chart -->
            <div class="planning-chart-card">
                <div class="planning-chart-header">
                    <h3 class="planning-chart-title">🏢 Solutions by P&C Area</h3>
                    <button class="chart-info-btn" data-tooltip="area">
                        <span class="info-icon">ℹ️</span>
                    </button>
                </div>
                <div class="chart-tooltip" id="tooltip-area" style="display: none;">
                    <h4>Why This Matters</h4>
                    <p><strong>Strategic Alignment:</strong> Shows how your portfolio investments align with organizational priorities.</p>
                    <ul>
                        <li><strong>Over-investment:</strong> Too many products in one area may indicate duplication or lack of focus</li>
                        <li><strong>Under-investment:</strong> Sparse coverage may reveal strategic gaps</li>
                        <li><strong>Balanced Coverage:</strong> Reflects holistic approach to P&C needs</li>
                    </ul>
                    <p class="tooltip-action">💡 Use this to ensure balanced coverage across all P&C functions.</p>
                </div>
                <div class="planning-chart-wrapper">
                    <canvas id="planning-chart-area"></canvas>
                </div>
            </div>
            
            <!-- Metrics Coverage Chart -->
            <div class="planning-chart-card">
                <div class="planning-chart-header">
                    <h3 class="planning-chart-title">📈 Metrics Coverage</h3>
                    <button class="chart-info-btn" data-tooltip="metrics">
                        <span class="info-icon">ℹ️</span>
                    </button>
                </div>
                <div class="chart-tooltip" id="tooltip-metrics" style="display: none;">
                    <h4>Why This Matters</h4>
                    <p><strong>Data Quality:</strong> Measures how well your portfolio performance is being tracked.</p>
                    <ul>
                        <li><strong>No Metrics:</strong> Cannot measure success or make data-driven decisions</li>
                        <li><strong>Partial Coverage:</strong> Incomplete picture of product performance</li>
                        <li><strong>Full Coverage:</strong> Enables comprehensive performance management</li>
                    </ul>
                    <p class="tooltip-action">💡 Use this to identify products needing metric definition work.</p>
                </div>
                <div class="planning-chart-wrapper">
                    <canvas id="planning-chart-metrics"></canvas>
                </div>
            </div>
            
            <!-- Owner Distribution Chart -->
            <div class="planning-chart-card">
                <div class="planning-chart-header">
                    <h3 class="planning-chart-title">👥 Top 10 Product Owners</h3>
                    <button class="chart-info-btn" data-tooltip="owners">
                        <span class="info-icon">ℹ️</span>
                    </button>
                </div>
                <div class="chart-tooltip" id="tooltip-owners" style="display: none;">
                    <h4>Why This Matters</h4>
                    <p><strong>Workload Balance:</strong> Identifies potential capacity constraints or over-allocation.</p>
                    <ul>
                        <li><strong>High Product Count:</strong> Owner may be stretched thin, risking quality</li>
                        <li><strong>Uneven Distribution:</strong> May indicate need for team expansion or rebalancing</li>
                        <li><strong>Even Distribution:</strong> Shows healthy resource allocation</li>
                    </ul>
                    <p class="tooltip-action">💡 Use this to balance workload and ensure owner capacity for success.</p>
                </div>
                <div class="planning-chart-wrapper">
                    <canvas id="planning-chart-owners"></canvas>
                </div>
            </div>
        </div>
    `;
    
    return section;
}

/**
 * Setup Planning Filters
 * Populates filter dropdowns and adds event listeners
 */
function setupPlanningFilters() {
    const portfolioData = window.State.getPortfolioData();
    
    // Get filter options using DataManager
    const filterOptions = window.DataManager.getFilterOptions();
    
    // Populate Area filter
    const areaSelect = document.getElementById('planning-filter-area');
    if (areaSelect) {
        areaSelect.innerHTML = '<option value="">All Areas</option>' +
            filterOptions.areas.map(area => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`).join('');
        
        areaSelect.addEventListener('change', applyPlanningFilters);
    }
    
    // Populate Maturity filter
    const maturitySelect = document.getElementById('planning-filter-maturity');
    if (maturitySelect) {
        maturitySelect.innerHTML = '<option value="">All Stages</option>' +
            filterOptions.maturities.map(maturity => `<option value="${escapeHtml(maturity)}">${escapeHtml(maturity)}</option>`).join('');
        
        maturitySelect.addEventListener('change', applyPlanningFilters);
    }
    
    // Populate Owner filter
    const ownerSelect = document.getElementById('planning-filter-owner');
    if (ownerSelect) {
        ownerSelect.innerHTML = '<option value="">All Owners</option>' +
            filterOptions.owners.map(owner => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`).join('');
        
        ownerSelect.addEventListener('change', applyPlanningFilters);
    }
    
    // Setup tooltip toggles
    document.querySelectorAll('.chart-info-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tooltipId = 'tooltip-' + this.dataset.tooltip;
            const tooltip = document.getElementById(tooltipId);
            
            // Hide all other tooltips
            document.querySelectorAll('.chart-tooltip').forEach(t => {
                if (t.id !== tooltipId) {
                    t.style.display = 'none';
                }
            });
            
            // Toggle this tooltip
            if (tooltip) {
                tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
    
    // Initial render with all data
    updatePlanningFilterSummary(portfolioData.length);
    
    console.log('✅ Planning filters setup complete');
}

/**
 * Apply Planning Filters and re-render charts
 */
function applyPlanningFilters() {
    const portfolioData = window.State.getPortfolioData();
    
    // Get filter values
    const areaFilter = document.getElementById('planning-filter-area')?.value || '';
    const maturityFilter = document.getElementById('planning-filter-maturity')?.value || '';
    const ownerFilter = document.getElementById('planning-filter-owner')?.value || '';
    
    // Filter data
    const filteredData = portfolioData.filter(product => {
        const matchesArea = !areaFilter || product.area === areaFilter;
        const matchesMaturity = !maturityFilter || product.maturity === maturityFilter;
        const matchesOwner = !ownerFilter || product.owner === ownerFilter;
        
        return matchesArea && matchesMaturity && matchesOwner;
    });
    
    // Update filter summary
    updatePlanningFilterSummary(filteredData.length);
    
    // Re-render charts with filtered data
    renderPlanningCharts(filteredData);
    
    console.log('Planning filters applied:', filteredData.length, 'products shown');
}

/**
 * Clear Planning Filters
 */
function clearPlanningFilters() {
    // Reset all filter dropdowns
    const areaSelect = document.getElementById('planning-filter-area');
    const maturitySelect = document.getElementById('planning-filter-maturity');
    const ownerSelect = document.getElementById('planning-filter-owner');
    
    if (areaSelect) areaSelect.value = '';
    if (maturitySelect) maturitySelect.value = '';
    if (ownerSelect) ownerSelect.value = '';
    
    // Re-apply filters (which will show all data)
    applyPlanningFilters();
}

// Expose globally for onclick handler
window.clearPlanningFilters = clearPlanningFilters;

/**
 * Update filter summary text
 */
function updatePlanningFilterSummary(count) {
    const summaryText = document.getElementById('planning-filtered-count');
    if (summaryText) {
        summaryText.textContent = count;
    }
}

/**
 * Render all Planning View charts with Chart.js
 */
function renderPlanningCharts(data) {
    console.log('Rendering planning charts with', data.length, 'products');
    
    // Chart colors
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
    
    // Analyze filtered data
    const analysis = window.DataManager.analyzePortfolioData(data);
    
    // 1. Maturity Stage Distribution (Pie Chart)
    const maturityCanvas = document.getElementById('planning-chart-maturity');
    if (maturityCanvas && window.Chart) {
        const sortedStages = Object.entries(analysis.stageCount).sort((a, b) => b[1] - a[1]);
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(maturityCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        new Chart(maturityCanvas, {
            type: 'doughnut',
            data: {
                labels: sortedStages.map(([stage]) => stage),
                datasets: [{
                    data: sortedStages.map(([_, count]) => count),
                    backgroundColor: sortedStages.map(([stage]) => stageColors[stage] || defaultColors[0]),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, font: { size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
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
    
    // 2. Area Distribution (Horizontal Bar Chart)
    const areaCanvas = document.getElementById('planning-chart-area');
    if (areaCanvas && window.Chart) {
        const sortedAreas = Object.entries(analysis.areaCount).sort((a, b) => b[1] - a[1]);
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(areaCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        new Chart(areaCanvas, {
            type: 'bar',
            data: {
                labels: sortedAreas.map(([area]) => area.length > 20 ? area.substring(0, 20) + '...' : area),
                datasets: [{
                    label: 'Solutions',
                    data: sortedAreas.map(([_, count]) => count),
                    backgroundColor: sortedAreas.map((_, i) => defaultColors[i % defaultColors.length]),
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // 3. Metrics Coverage (Pie Chart)
    const metricsCanvas = document.getElementById('planning-chart-metrics');
    if (metricsCanvas && window.Chart) {
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(metricsCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        new Chart(metricsCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Both Metrics', 'UX Only', 'BI Only', 'No Metrics'],
                datasets: [{
                    data: [
                        analysis.metrics.withBothMetrics,
                        analysis.metrics.withUXMetric - analysis.metrics.withBothMetrics,
                        analysis.metrics.withBIMetric - analysis.metrics.withBothMetrics,
                        analysis.metrics.withoutMetrics
                    ],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.85)',
                        'rgba(59, 130, 246, 0.85)',
                        'rgba(245, 158, 11, 0.85)',
                        'rgba(239, 68, 68, 0.85)'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, font: { size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                }
            }
        });
    }
    
    // 4. Owner Distribution (Horizontal Bar Chart - Top 10)
    const ownersCanvas = document.getElementById('planning-chart-owners');
    if (ownersCanvas && window.Chart) {
        const sortedOwners = Object.entries(analysis.ownerCount).sort((a, b) => b[1] - a[1]);
        const top10Owners = sortedOwners.slice(0, 10);
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(ownersCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        new Chart(ownersCanvas, {
            type: 'bar',
            data: {
                labels: top10Owners.map(([owner]) => owner.length > 25 ? owner.substring(0, 25) + '...' : owner),
                datasets: [{
                    label: 'Solutions',
                    data: top10Owners.map(([_, count]) => count),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    console.log('✅ Planning charts rendered successfully');
}

// ==================== DRILL-DOWN FUNCTIONALITY ====================

/**
 * Drill down from Strategic View to Portfolio Overview with specific filters
 * This function enables executives to click KPI cards and immediately see relevant products
 * 
 * @param {string} drillType - Type of drill-down: 'high-risk', 'medium-risk', 'low-risk', 
 *                              'below-target', 'star-performers', 'products-at-risk'
 */
function drillDownToTacticalView(drillType) {
    // Get portfolio data and calculate metrics for each product
    const portfolioData = window.State.getPortfolioData();
    
    if (!portfolioData || portfolioData.length === 0) {
        console.warn('No portfolio data available for drill-down');
        alert('No portfolio data available. Please load data first.');
        return;
    }
    
    // Calculate risk score and performance for each product
    const productMetrics = portfolioData.map(product => ({
        ...product,
        riskScore: window.DataManager.calculateRiskScore(product),
        performanceScore: window.DataManager.calculatePerformanceVsTarget(product)
    }));
    
    // Filter products based on drill-down type
    let filteredProducts = [];
    let filterDescription = '';
    
    switch (drillType) {
        case 'high-risk':
            filteredProducts = productMetrics.filter(p => p.riskScore >= 7);
            filterDescription = 'High Risk Products (Risk Score ≥ 7)';
            break;
            
        case 'medium-risk':
            filteredProducts = productMetrics.filter(p => p.riskScore >= 4 && p.riskScore < 7);
            filterDescription = 'Medium Risk Products (Risk Score 4-6)';
            break;
            
        case 'low-risk':
            filteredProducts = productMetrics.filter(p => p.riskScore < 4);
            filterDescription = 'Low Risk Products (Risk Score < 4)';
            break;
            
        case 'below-target':
            filteredProducts = productMetrics.filter(p => p.performanceScore > 0 && p.performanceScore < 50);
            filterDescription = 'Below Target Products (Performance < 50%)';
            break;
            
        case 'star-performers':
            // Star performers: Low risk (< 4) AND high performance (>= 80%)
            filteredProducts = productMetrics.filter(p => p.riskScore < 4 && p.performanceScore >= 80);
            filterDescription = 'Star Performers (Low Risk + High Performance)';
            break;
            
        case 'products-at-risk':
            // Critical products: High risk (>= 7) AND low performance (< 50%)
            filteredProducts = productMetrics.filter(p => p.riskScore >= 7 && p.performanceScore < 50);
            filterDescription = 'Critical Products (High Risk + Low Performance)';
            break;
            
        default:
            console.warn('Unknown drill-down type:', drillType);
            filteredProducts = portfolioData;
            filterDescription = 'All Products';
    }
    
    // Store the filtered data in State
    window.State.setFilteredData(filteredProducts);
    
    // Clear any active filters in the UI
    clearFiltersUI();
    
    // Switch to Portfolio Overview tab
    switchTab('portfolio-overview');
    
    // Render the filtered products
    renderCards();
    updateStats();
    
    // Show a notification to the user
    showDrillDownNotification(filterDescription, filteredProducts.length);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Clear filter UI controls (dropdowns and search)
 */
function clearFiltersUI() {
    // Clear search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Clear filter dropdowns
    const areaFilter = document.getElementById('filter-area');
    if (areaFilter) areaFilter.value = '';
    
    const maturityFilter = document.getElementById('filter-maturity');
    if (maturityFilter) maturityFilter.value = '';
    
    const ownerFilter = document.getElementById('filter-owner');
    if (ownerFilter) ownerFilter.value = '';
    
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = '';
}

/**
 * Show a notification about the drill-down filter applied
 */
function showDrillDownNotification(filterDescription, count) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'drill-down-notification';
    notification.innerHTML = `
        <div class="drill-down-notification-content">
            <span class="drill-down-notification-icon">🎯</span>
            <div class="drill-down-notification-text">
                <strong>Viewing:</strong> ${filterDescription}
                <span class="drill-down-notification-count">(${count} product${count !== 1 ? 's' : ''})</span>
            </div>
            <button class="drill-down-notification-close" onclick="closeDrillDownNotification()">×</button>
        </div>
    `;
    
    // Remove any existing notification
    const existing = document.querySelector('.drill-down-notification');
    if (existing) existing.remove();
    
    // Add to page
    const container = document.getElementById('content-left') || document.querySelector('.main-content');
    if (container) {
        container.insertBefore(notification, container.firstChild);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }
}

/**
 * Close drill-down notification
 */
function closeDrillDownNotification() {
    const notification = document.querySelector('.drill-down-notification');
    if (notification) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }
    
    // Reset to show all products
    const portfolioData = window.State.getPortfolioData();
    window.DataManager.applyFilters('', '', '', '', '');
    renderCards();
    updateStats();
}

// Expose drill-down functions globally for onclick handlers
window.drillDownToTacticalView = drillDownToTacticalView;
window.closeDrillDownNotification = closeDrillDownNotification;

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

/**
 * Expose public API
 * 
 * REFACTORED ARCHITECTURE:
 * - All UI state is now managed through window.State
 * - Utility functions accessed via window.Utils
 * - This module now focuses purely on UI rendering and interaction
 */
window.UIManager = {
    switchTab,
    setupTacticalFilters,
    populateFilters,
    applyFiltersFromUI,
    clearFilters,
    renderCards,
    showDetailPanel,
    hideDetailPanel,
    updateStats,
    updateLastUpdateDisplay,
    renderStrategicView,
    renderExecutiveView,
    renderPlanningView,
    loadDescriptiveAnalysis,
    showLoading,
    showError,
    hideError
};

console.log('✅ UI Manager module loaded (Refactored)');

