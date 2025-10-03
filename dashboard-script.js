/**
 * P&C Portfolio Dashboard Script
 * Handles data fetching, filtering, and card-based display
 */

// Global variables
let portfolioData = [];
let filteredData = [];
let columnMapping = {}; // Dynamic column mapping based on headers
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'portfolio_last_update';
const DATA_CACHE_KEY = 'portfolio_data_cache';

/**
 * Lazy load Chart.js library when needed
 * This improves initial page load by ~200ms and saves ~120KB
 */
let chartJsLoaded = false;
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
 * Debounce utility - delays function execution until after wait period
 * Prevents excessive filtering on every keystroke
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Fetch data from Google Apps Script
 */
async function fetchSheetData() {
    showLoading(true);
    hideError();

    try {
        if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
            throw new Error('Missing Web App URL. Please configure config.js');
        }

        console.log('Fetching data from Google Apps Script...');
        console.log('URL:', CONFIG.WEB_APP_URL);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(CONFIG.WEB_APP_URL, { 
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-cache'
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const jsonData = await response.json();

        if (!jsonData.success) {
            throw new Error(jsonData.error || 'Unknown error');
        }

        const rows = jsonData.data;

        if (!rows || rows.length < 3) {
            throw new Error('Insufficient data in spreadsheet');
        }

        console.log(`Successfully fetched ${rows.length} rows`);

        // Row 0: Section headers (SOLUTION SCOPE, USER EXPERIENCE DATA, etc.)
        // Row 1: Actual column headers (P'n'C Area, Solution name, etc.)
        // Row 2+: Data rows
        
        const headers = rows[1]; // Get the actual column headers from row 1
        console.log('Headers found:', headers.slice(0, 15)); // Debug: show first 15 headers
        
        // Create dynamic column mapping
        columnMapping = {
            area: headers.indexOf("P'n'C Area"),
            name: headers.indexOf("Solution name"),
            problem: headers.indexOf("Which Problem it Solves"),
            solution: headers.indexOf("What is the solution"),
            regulatory: headers.indexOf("Is a regulatory demand?"),
            owner: headers.indexOf("Owner's Name"),
            maturity: headers.indexOf("Maturity Stage"),
            targetUser: headers.indexOf("Target User"),
            indirectUser: headers.indexOf("Indirect Impact User"),
            journeyMain: headers.indexOf("Main Journey Stage Impacted"),
            journeyCollateral: headers.indexOf("Collateral Journey Stage Impacted"),
            platform: headers.indexOf("User Interface Platform"),
            keyMetricUX: headers.indexOf("Key Metric\nUser Experience"),
            targetUX: headers.indexOf("TARGET"),
            keyMetricBI: headers.indexOf("Key Metric\nBusiness Impact")
        };
        
        // Find monthly columns (JAN, FEB, MAR, etc.)
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        // Find the first set of month columns (for UX metrics)
        let monthStartIdx = headers.indexOf('JAN');
        columnMapping.monthsUX = months.map(month => headers.indexOf(month, columnMapping.keyMetricUX));
        
        // Find the second TARGET column (for BI metrics)
        let targetBIIdx = headers.indexOf('TARGET', columnMapping.targetUX + 1);
        columnMapping.targetBI = targetBIIdx;
        
        // Find the second set of month columns (for BI metrics)
        let keyMetricBIIdx = headers.indexOf("Key Metric\nBusiness Impact");
        if (keyMetricBIIdx !== -1) {
            columnMapping.monthsBI = months.map(month => headers.indexOf(month, keyMetricBIIdx));
        }
        
        console.log('Column mapping:', columnMapping);
        console.log('Sample data row:', rows[2].slice(0, 12)); // Debug: show first 12 columns of first data row
        
        // Transform data rows (starting from row 2)
        const dataRows = rows.slice(2);
        
        portfolioData = dataRows
            .filter(row => {
                const hasName = row[columnMapping.name] && row[columnMapping.name].toString().trim();
                if (!hasName && row.some(cell => cell && cell.toString().trim())) {
                    console.warn('Skipping row with empty name:', row.slice(0, 5));
                }
                return hasName;
            })
            .map((row, index) => ({
                id: index,
                area: (row[columnMapping.area] || '').toString().trim(),
                name: (row[columnMapping.name] || '').toString().trim(),
                problem: (row[columnMapping.problem] || '').toString().trim(),
                solution: (row[columnMapping.solution] || '').toString().trim(),
                regulatory: (row[columnMapping.regulatory] || '').toString().trim(),
                owner: (row[columnMapping.owner] || '').toString().trim(),
                maturity: (row[columnMapping.maturity] || '').toString().trim(),
                targetUser: (row[columnMapping.targetUser] || '').toString().trim(),
                indirectUser: (row[columnMapping.indirectUser] || '').toString().trim(),
                journeyMain: (row[columnMapping.journeyMain] || '').toString().trim(),
                journeyCollateral: (row[columnMapping.journeyCollateral] || '').toString().trim(),
                platform: (row[columnMapping.platform] || '').toString().trim(),
                keyMetricUX: (row[columnMapping.keyMetricUX] || '').toString().trim(),
                targetUX: row[columnMapping.targetUX] || '',
                monthlyUX: columnMapping.monthsUX ? columnMapping.monthsUX.map(idx => row[idx] || '') : [],
                keyMetricBI: (row[columnMapping.keyMetricBI] || '').toString().trim(),
                targetBI: row[columnMapping.targetBI] || '',
                monthlyBI: columnMapping.monthsBI ? columnMapping.monthsBI.map(idx => row[idx] || '') : [],
                rawRow: row // Keep raw row for accessing other columns if needed
            }));
        
        console.log(`Processed ${portfolioData.length} products`);

        // Cache and update
        cacheData(portfolioData);
        updateLastFetchTime();
        
        // Populate filters and display
        populateFilters();
        applyFilters();
        updateStats();

    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Failed to fetch data: ${error.message}`);
        loadCachedData();
    } finally {
        showLoading(false);
    }
}

/**
 * Populate filter dropdowns with unique values
 */
function populateFilters() {
    // Get unique values
    const areas = [...new Set(portfolioData.map(p => p.area).filter(Boolean))].sort();
    const maturities = [...new Set(portfolioData.map(p => p.maturity).filter(Boolean))].sort();
    const owners = [...new Set(portfolioData.map(p => p.owner).filter(Boolean))].sort();

    // Populate dropdowns
    const areaSelect = document.getElementById('filter-area');
    const maturitySelect = document.getElementById('filter-maturity');
    const ownerSelect = document.getElementById('filter-owner');

    areaSelect.innerHTML = '<option value="">All Areas</option>' + 
        areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
    
    maturitySelect.innerHTML = '<option value="">All Stages</option>' + 
        maturities.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    
    ownerSelect.innerHTML = '<option value="">All Owners</option>' + 
        owners.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('');
}

/**
 * Apply filters to the data
 */
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const areaFilter = document.getElementById('filter-area').value;
    const maturityFilter = document.getElementById('filter-maturity').value;
    const ownerFilter = document.getElementById('filter-owner').value;

    filteredData = portfolioData.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.problem.toLowerCase().includes(searchTerm) ||
            product.solution.toLowerCase().includes(searchTerm);
        
        const matchesArea = !areaFilter || product.area === areaFilter;
        const matchesMaturity = !maturityFilter || product.maturity === maturityFilter;
        const matchesOwner = !ownerFilter || product.owner === ownerFilter;

        return matchesSearch && matchesArea && matchesMaturity && matchesOwner;
    });

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
    applyFilters();
}

/**
 * Render product cards
 */
function renderCards() {
    const container = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');

    if (filteredData.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    container.innerHTML = filteredData.map(product => `
        <div class="product-card fade-in" onclick="showDetailPanel(${product.id})" data-product-id="${product.id}">
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

/**
 * Show detail panel for a product
 */
function showDetailPanel(productId) {
    const product = portfolioData.find(p => p.id === productId);
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
            <button class="detail-close" onclick="hideDetailPanel()">×</button>
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

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Render metric chart with Chart.js
 */
let chartInstances = {};

function renderMetricChart(canvasId, monthlyData, targetValue, metricName) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
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
}

/**
 * Update statistics
 */
function updateStats() {
    const statsBar = document.getElementById('stats-bar');
    statsBar.style.display = 'flex';

    document.getElementById('stat-total').textContent = portfolioData.length;
    document.getElementById('stat-showing').textContent = filteredData.length;
    
    const liveCount = filteredData.filter(p => p.maturity.toLowerCase().includes('live')).length;
    const devCount = filteredData.filter(p => p.maturity.toLowerCase().includes('development')).length;
    
    document.getElementById('stat-live').textContent = liveCount;
    document.getElementById('stat-dev').textContent = devCount;
}

/**
 * Get status class based on maturity stage
 */
function getStatusClass(maturity) {
    const m = (maturity || '').toLowerCase();
    if (m.includes('live')) return 'status-live';
    if (m.includes('development')) return 'status-development';
    if (m.includes('ideation')) return 'status-ideation';
    if (m.includes('hold')) return 'status-hold';
    if (m.includes('discovery')) return 'status-discovery';
    return 'status-default';
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
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('error').classList.add('hidden');
}

/**
 * Update last fetch time
 */
function updateLastFetchTime() {
    const now = new Date();
    const timeString = now.toLocaleString();
    document.getElementById('last-update').textContent = `Last updated: ${timeString}`;
    localStorage.setItem(STORAGE_KEY, now.toISOString());
}

/**
 * Cache data
 */
function cacheData(data) {
    try {
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to cache data:', e);
    }
}

/**
 * Load cached data
 */
function loadCachedData() {
    try {
        const cached = localStorage.getItem(DATA_CACHE_KEY);
        if (cached) {
            portfolioData = JSON.parse(cached);
            populateFilters();
            applyFilters();
            updateStats();
            showError('Showing cached data. Unable to fetch fresh data.');
        }
    } catch (e) {
        console.warn('Failed to load cached data:', e);
    }
}

/**
 * Check if should refresh
 */
function shouldRefreshData() {
    const lastUpdate = localStorage.getItem(STORAGE_KEY);
    if (!lastUpdate) return true;
    const timeDiff = new Date() - new Date(lastUpdate);
    return timeDiff >= UPDATE_INTERVAL;
}

/**
 * Initialize auto-update
 */
function initAutoUpdate() {
    if (shouldRefreshData()) {
        fetchSheetData();
    } else {
        loadCachedData();
        const lastUpdate = localStorage.getItem(STORAGE_KEY);
        if (lastUpdate) {
            const date = new Date(lastUpdate);
            document.getElementById('last-update').textContent = `Last updated: ${date.toLocaleString()}`;
        }
    }

    setInterval(() => {
        if (shouldRefreshData()) {
            fetchSheetData();
        }
    }, 60 * 60 * 1000);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio Dashboard initialized');
    
    // Setup debounced search (waits 300ms after user stops typing)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedFilter = debounce(applyFilters, 300);
        searchInput.addEventListener('input', debouncedFilter);
    }
    
    initAutoUpdate();
});

