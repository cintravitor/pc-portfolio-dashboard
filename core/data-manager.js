/**
 * Data Manager Module
 * Handles all data-related operations: fetching, processing, caching, and calculations
 */

// ==================== DATA STATE ====================

// Global data variables
let portfolioData = [];
let filteredData = [];
let columnMapping = {}; // Dynamic column mapping based on headers

// Constants
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'portfolio_last_update';
const DATA_CACHE_KEY = 'portfolio_data_cache';

// ==================== DATA FETCHING ====================

/**
 * Fetch data from Google Apps Script
 */
async function fetchSheetData() {
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
        
        return portfolioData;

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw to let caller handle
    }
}

// ==================== DATA FILTERING ====================

/**
 * Apply filters to the data
 */
function applyFilters(searchTerm = '', areaFilter = '', maturityFilter = '', ownerFilter = '', sortBy = '') {
    // First, filter the data
    filteredData = portfolioData.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.owner.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesArea = !areaFilter || product.area === areaFilter;
        const matchesMaturity = !maturityFilter || product.maturity === maturityFilter;
        const matchesOwner = !ownerFilter || product.owner === ownerFilter;

        return matchesSearch && matchesArea && matchesMaturity && matchesOwner;
    });

    // Then, sort the filtered data
    if (sortBy) {
        filteredData = sortData(filteredData, sortBy);
    }

    return filteredData;
}

/**
 * Sort data based on selected criteria
 */
function sortData(data, sortBy) {
    // Create a copy to avoid mutating the original array
    const sortedData = [...data];
    
    switch (sortBy) {
        case 'name-asc':
            return sortedData.sort((a, b) => 
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
        
        case 'name-desc':
            return sortedData.sort((a, b) => 
                b.name.toLowerCase().localeCompare(a.name.toLowerCase())
            );
        
        case 'maturity-asc':
            // Sort by maturity stage in logical order: Development → Growth → Mature → Decline
            const maturityOrder = {
                '1. development': 1,
                '2. growth': 2,
                '3. mature': 3,
                '4. decline': 4
            };
            return sortedData.sort((a, b) => {
                const aOrder = maturityOrder[a.maturity.toLowerCase()] || 999;
                const bOrder = maturityOrder[b.maturity.toLowerCase()] || 999;
                return aOrder - bOrder;
            });
        
        case 'area-asc':
            return sortedData.sort((a, b) => 
                a.area.toLowerCase().localeCompare(b.area.toLowerCase())
            );
        
        case 'owner-asc':
            return sortedData.sort((a, b) => 
                a.owner.toLowerCase().localeCompare(b.owner.toLowerCase())
            );
        
        default:
            return sortedData;
    }
}

/**
 * Get unique filter values
 */
function getFilterOptions() {
    return {
        areas: [...new Set(portfolioData.map(p => p.area).filter(Boolean))].sort(),
        maturities: [...new Set(portfolioData.map(p => p.maturity).filter(Boolean))].sort(),
        owners: [...new Set(portfolioData.map(p => p.owner).filter(Boolean))].sort()
    };
}

// ==================== DATA CACHING ====================

/**
 * Cache data to localStorage
 */
function cacheData(data) {
    try {
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to cache data:', e);
    }
}

/**
 * Load cached data from localStorage
 */
function loadCachedData() {
    try {
        const cached = localStorage.getItem(DATA_CACHE_KEY);
        if (cached) {
            portfolioData = JSON.parse(cached);
            return portfolioData;
        }
    } catch (e) {
        console.warn('Failed to load cached data:', e);
    }
    return null;
}

/**
 * Update last fetch timestamp
 */
function updateLastFetchTime() {
    const now = new Date();
    localStorage.setItem(STORAGE_KEY, now.toISOString());
    return now;
}

/**
 * Get last update time
 */
function getLastUpdateTime() {
    const lastUpdate = localStorage.getItem(STORAGE_KEY);
    return lastUpdate ? new Date(lastUpdate) : null;
}

/**
 * Check if data should be refreshed
 */
function shouldRefreshData() {
    const lastUpdate = localStorage.getItem(STORAGE_KEY);
    if (!lastUpdate) return true;
    const timeDiff = new Date() - new Date(lastUpdate);
    return timeDiff >= UPDATE_INTERVAL;
}

// ==================== CALCULATIONS ====================

/**
 * Calculate performance vs target for a single product
 * Returns percentage of months where actual >= target across UX and BI metrics
 */
function calculatePerformanceVsTarget(product) {
    let totalMonths = 0;
    let achievedMonths = 0;
    
    // Helper to check if value is valid (not N/A, not empty, is numeric)
    const isValidValue = (val) => {
        if (!val || val === '' || val === 'N/A' || val === '-') return false;
        const num = parseFloat(val);
        return !isNaN(num);
    };
    
    // Check UX metrics
    if (product.monthlyUX && Array.isArray(product.monthlyUX) && isValidValue(product.targetUX)) {
        const targetUX = parseFloat(product.targetUX);
        
        product.monthlyUX.forEach(monthValue => {
            if (isValidValue(monthValue)) {
                totalMonths++;
                const actualValue = parseFloat(monthValue);
                if (actualValue >= targetUX) {
                    achievedMonths++;
                }
            }
        });
    }
    
    // Check BI metrics
    if (product.monthlyBI && Array.isArray(product.monthlyBI) && isValidValue(product.targetBI)) {
        const targetBI = parseFloat(product.targetBI);
        
        product.monthlyBI.forEach(monthValue => {
            if (isValidValue(monthValue)) {
                totalMonths++;
                const actualValue = parseFloat(monthValue);
                if (actualValue >= targetBI) {
                    achievedMonths++;
                }
            }
        });
    }
    
    // Return percentage (0-100)
    if (totalMonths === 0) return 0; // No data available
    return Math.round((achievedMonths / totalMonths) * 100);
}

/**
 * Calculate risk score for a single product (0-10 scale)
 * Higher score = higher risk
 */
function calculateRiskScore(product) {
    let riskScore = 0;
    
    // Base risk from maturity stage
    const maturity = product.maturity?.toLowerCase() || '';
    
    if (maturity.includes('development') || maturity === '1. development') {
        riskScore += 4; // Highest risk - early stage
    } else if (maturity.includes('growth') || maturity === '2. growth') {
        riskScore += 2; // Medium-high risk - scaling phase
    } else if (maturity.includes('mature') || maturity === '3. mature') {
        riskScore += 0; // Low risk - stable
    } else if (maturity.includes('decline') || maturity === '4. decline') {
        riskScore += 3; // High risk - declining
    } else {
        riskScore += 2; // Unknown maturity = medium risk
    }
    
    // Add risk if key metrics are missing or N/A
    const isInvalid = (val) => !val || val === '' || val === 'N/A' || val === '-';
    
    if (isInvalid(product.keyMetricUX)) {
        riskScore += 1.5; // No UX tracking
    }
    
    if (isInvalid(product.keyMetricBI)) {
        riskScore += 1.5; // No BI tracking
    }
    
    if (isInvalid(product.targetUX)) {
        riskScore += 1; // No UX target
    }
    
    if (isInvalid(product.targetBI)) {
        riskScore += 1; // No BI target
    }
    
    // Add risk if owner is not assigned
    if (isInvalid(product.owner)) {
        riskScore += 1; // No clear ownership
    }
    
    // Cap risk score at 10
    return Math.min(riskScore, 10);
}

/**
 * Analyze portfolio data and calculate statistics
 */
function analyzePortfolioData(data) {
    console.log('Performing data analysis...');
    
    const analysis = {
        totalSolutions: data.length,
        stageCount: {},
        areaCount: {},
        ownerCount: {},
        metrics: {
            withUXMetric: 0,
            withBIMetric: 0,
            withBothMetrics: 0,
            withoutMetrics: 0
        },
        regulatory: 0,
        nonRegulatory: 0
    };
    
    // Analyze each solution
    data.forEach(solution => {
        // Count by maturity stage
        const stage = solution.maturity || 'Not specified';
        analysis.stageCount[stage] = (analysis.stageCount[stage] || 0) + 1;
        
        // Count by area
        const area = solution.area || 'Not specified';
        analysis.areaCount[area] = (analysis.areaCount[area] || 0) + 1;
        
        // Count by owner
        const owner = solution.owner || 'Not assigned';
        analysis.ownerCount[owner] = (analysis.ownerCount[owner] || 0) + 1;
        
        // Count metrics
        const hasUX = solution.keyMetricUX && solution.keyMetricUX.trim() !== '';
        const hasBI = solution.keyMetricBI && solution.keyMetricBI.trim() !== '';
        
        if (hasUX) analysis.metrics.withUXMetric++;
        if (hasBI) analysis.metrics.withBIMetric++;
        if (hasUX && hasBI) analysis.metrics.withBothMetrics++;
        if (!hasUX && !hasBI) analysis.metrics.withoutMetrics++;
        
        // Count regulatory
        if (solution.regulatory && solution.regulatory.toLowerCase().includes('yes')) {
            analysis.regulatory++;
        } else {
            analysis.nonRegulatory++;
        }
    });
    
    // Calculate percentages
    analysis.metrics.withAnyMetric = analysis.metrics.withUXMetric + analysis.metrics.withBIMetric - analysis.metrics.withBothMetrics;
    
    console.log('Analysis complete:', analysis);
    return analysis;
}

/**
 * Calculate comprehensive portfolio metrics for Executive View
 * Returns a structured object with all high-level, actionable insights
 */
function calculatePortfolioMetrics() {
    console.log('Calculating portfolio metrics for Executive View...');
    
    if (!portfolioData || portfolioData.length === 0) {
        console.warn('No portfolio data available for metrics calculation');
        return null;
    }
    
    // Calculate individual product metrics
    const productMetrics = portfolioData.map(product => ({
        id: product.id,
        name: product.name,
        area: product.area,
        maturity: product.maturity,
        owner: product.owner,
        performanceScore: calculatePerformanceVsTarget(product),
        riskScore: calculateRiskScore(product)
    }));
    
    // ===== 1. PORTFOLIO HEALTH SCORE =====
    // Composite score (0-100) based on performance and inverse risk
    
    // Get valid performance scores (exclude products with no data)
    const validPerformanceScores = productMetrics
        .map(p => p.performanceScore)
        .filter(score => score > 0);
    
    // Calculate average performance (0-100)
    const avgPerformance = validPerformanceScores.length > 0
        ? validPerformanceScores.reduce((sum, score) => sum + score, 0) / validPerformanceScores.length
        : 0;
    
    // Calculate average risk score (0-10 scale)
    const avgRiskScore = productMetrics.reduce((sum, p) => sum + p.riskScore, 0) / productMetrics.length;
    
    // Convert risk to inverse health contribution (10 = worst risk = 0% health, 0 = no risk = 100% health)
    const riskHealthContribution = ((10 - avgRiskScore) / 10) * 100;
    
    // Composite health score: 60% performance + 40% inverse risk
    const healthScore = Math.round((avgPerformance * 0.6) + (riskHealthContribution * 0.4));
    
    // ===== 2. RISK BREAKDOWN =====
    // Categorize products by risk level
    const riskBreakdown = {
        high: productMetrics.filter(p => p.riskScore >= 7).length,
        medium: productMetrics.filter(p => p.riskScore >= 4 && p.riskScore < 7).length,
        low: productMetrics.filter(p => p.riskScore < 4).length
    };
    
    // ===== 3. TOP RISKS =====
    // Identify top 3 products with highest risk scores
    const topRisks = productMetrics
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 3)
        .map(p => ({
            id: p.id,
            name: p.name,
            riskScore: p.riskScore,
            area: p.area,
            maturity: p.maturity
        }));
    
    // ===== 4. TOP OPPORTUNITIES =====
    // Identify top 3 products with highest performance scores
    const topOpportunities = productMetrics
        .filter(p => p.performanceScore > 0) // Only products with actual performance data
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 3)
        .map(p => ({
            id: p.id,
            name: p.name,
            performanceScore: p.performanceScore,
            area: p.area,
            maturity: p.maturity
        }));
    
    // ===== 5. STRATEGIC ALIGNMENT BY AREA =====
    // Count products by P&C area
    const alignmentByArea = {};
    productMetrics.forEach(p => {
        const area = p.area || 'Not specified';
        alignmentByArea[area] = (alignmentByArea[area] || 0) + 1;
    });
    
    // ===== 6. RESOURCE ALLOCATION BY MATURITY =====
    // Count products by maturity stage
    const allocationByMaturity = {};
    productMetrics.forEach(p => {
        const maturity = p.maturity || 'Not specified';
        allocationByMaturity[maturity] = (allocationByMaturity[maturity] || 0) + 1;
    });
    
    // ===== 7. RESOURCE ALLOCATION BY OWNER =====
    // Count products by owner (for workload analysis)
    const allocationByOwner = {};
    productMetrics.forEach(p => {
        const owner = p.owner || 'Not assigned';
        allocationByOwner[owner] = (allocationByOwner[owner] || 0) + 1;
    });
    
    // Get top 5 owners by product count
    const topOwnersByCount = Object.entries(allocationByOwner)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([owner, count]) => ({ owner, count }));
    
    // ===== 8. ADDITIONAL INSIGHTS =====
    // Calculate additional metrics for executive decision-making
    
    // Products at risk (high risk + low performance)
    const productsAtRisk = productMetrics.filter(p => 
        p.riskScore >= 7 && p.performanceScore < 50
    ).length;
    
    // Star performers (low risk + high performance)
    const starPerformers = productMetrics.filter(p => 
        p.riskScore < 4 && p.performanceScore >= 80
    ).length;
    
    // Products needing attention (medium-high risk, any performance)
    const needsAttention = productMetrics.filter(p => 
        p.riskScore >= 5 && p.riskScore < 7
    ).length;
    
    // ===== CONSTRUCT RETURN OBJECT =====
    const metrics = {
        // Summary metrics
        healthScore: healthScore,
        totalProducts: portfolioData.length,
        productsWithData: validPerformanceScores.length,
        
        // Risk analysis
        riskBreakdown: riskBreakdown,
        topRisks: topRisks,
        avgRiskScore: Math.round(avgRiskScore * 10) / 10, // Round to 1 decimal
        
        // Performance analysis
        topOpportunities: topOpportunities,
        avgPerformanceScore: Math.round(avgPerformance),
        
        // Strategic alignment
        alignmentByArea: alignmentByArea,
        allocationByMaturity: allocationByMaturity,
        topOwnersByCount: topOwnersByCount,
        
        // Additional insights
        productsAtRisk: productsAtRisk,
        starPerformers: starPerformers,
        needsAttention: needsAttention,
        
        // Raw data (for advanced use)
        productMetrics: productMetrics
    };
    
    console.log('✅ Portfolio metrics calculated:', {
        healthScore: metrics.healthScore,
        totalProducts: metrics.totalProducts,
        riskBreakdown: metrics.riskBreakdown,
        topRisksCount: metrics.topRisks.length,
        topOpportunitiesCount: metrics.topOpportunities.length
    });
    
    return metrics;
}

// ==================== UTILITIES ====================

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

// ==================== GETTERS ====================

/**
 * Get current portfolio data
 */
function getPortfolioData() {
    return portfolioData;
}

/**
 * Get current filtered data
 */
function getFilteredData() {
    return filteredData;
}

/**
 * Get data by product ID
 */
function getProductById(id) {
    return portfolioData.find(p => p.id === id);
}

/**
 * Get statistics for live and dev products
 */
function getProductStats() {
    return {
        total: portfolioData.length,
        showing: filteredData.length,
        live: filteredData.filter(p => p.maturity.toLowerCase().includes('live') || p.maturity.toLowerCase().includes('mature')).length,
        dev: filteredData.filter(p => p.maturity.toLowerCase().includes('development')).length
    };
}

// ==================== EXPORTS ====================

// Expose public API globally for access by other modules
window.DataManager = {
    // Data fetching
    fetchSheetData,
    
    // Data filtering
    applyFilters,
    sortData,
    getFilterOptions,
    
    // Data caching
    cacheData,
    loadCachedData,
    updateLastFetchTime,
    getLastUpdateTime,
    shouldRefreshData,
    
    // Calculations
    calculatePerformanceVsTarget,
    calculateRiskScore,
    analyzePortfolioData,
    calculatePortfolioMetrics,
    
    // Utilities
    debounce,
    
    // Getters
    getPortfolioData,
    getFilteredData,
    getProductById,
    getProductStats
};

