/**
 * Data Manager Module
 * Handles all data-related operations: fetching, processing, caching, and calculations
 * 
 * REFACTORED: Now uses centralized State management (window.State)
 * - Removed global variables (portfolioData, filteredData, columnMapping)
 * - All state access goes through window.State getters/setters
 * - Utility functions accessed via window.Utils
 * 
 * DEPENDENCIES: window.State, window.Utils, CONFIG
 */

// ==================== DEPENDENCY CHECK ====================

(function checkDependencies() {
    const required = ['State', 'Utils'];
    const missing = required.filter(dep => !window[dep]);
    
    if (missing.length > 0) {
        console.error('[DataManager] ❌ Missing dependencies:', missing);
        console.error('[DataManager] Load order must be: config.js → utils.js → state.js → data-manager.js');
        throw new Error(`DataManager dependency error: ${missing.join(', ')} not found`);
    }
    
    if (typeof CONFIG === 'undefined') {
        console.error('[DataManager] ❌ CONFIG not found');
        throw new Error('DataManager requires CONFIG to be loaded first');
    }
    
    console.log('[DataManager] ✅ Dependencies verified');
})();

// ==================== NOTE: STATE MANAGEMENT ====================
// This module NO LONGER maintains its own state variables.
// All state is managed through window.State:
// - window.State.getPortfolioData() / setPortfolioData()
// - window.State.getFilteredData() / setFilteredData()
// - window.State.getColumnMapping() / setColumnMapping()
// - window.State.getConstants() for configuration values

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
        
        // Create dynamic column mapping - Store in State
        const columnMapping = {
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
        
        // Store column mapping in State
        window.State.setColumnMapping(columnMapping);
        
        // Transform data rows (starting from row 2)
        const dataRows = rows.slice(2);
        
        const portfolioData = dataRows
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

        // Store in centralized State
        window.State.setPortfolioData(portfolioData);
        
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
 * @param {string} searchTerm - Search query string
 * @param {Array<string>} areaFilters - Array of selected P&C areas (multi-select)
 * @param {Array<string>} maturityFilters - Array of selected maturity stages (multi-select)
 * @param {Array<string>} ownerFilters - Array of selected owners (multi-select)
 * @param {string} sortBy - Sort option
 * @param {boolean} belowTargetOnly - Filter for below-target products only
 * 
 * Multi-select logic: OR within same filter type, AND across different filter types
 * Example: (Area1 OR Area2) AND (Stage1 OR Stage2) AND (Owner1)
 */
function applyFilters(searchTerm = '', areaFilters = [], maturityFilters = [], ownerFilters = [], sortBy = '', belowTargetOnly = false) {
    // Get portfolio data from State
    const portfolioData = window.State.getPortfolioData();
    
    console.log('🔧 DataManager.applyFilters called:', {
        portfolioDataCount: portfolioData.length,
        areaFilters,
        maturityFilters,
        ownerFilters,
        searchTerm
    });
    
    // First, filter the data
    let filteredData = portfolioData.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.owner.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Multi-select logic: if array is empty, match all; otherwise check if product value is in array (OR logic)
        const matchesArea = areaFilters.length === 0 || areaFilters.includes(product.area);
        const matchesMaturity = maturityFilters.length === 0 || maturityFilters.includes(product.maturity);
        const matchesOwner = ownerFilters.length === 0 || ownerFilters.includes(product.owner);
        
        // Below-target filter logic
        let matchesBelowTarget = true;
        if (belowTargetOnly) {
            // Helper to check if value is a valid number
            const isValidNumber = (val) => {
                if (!val || val === '' || val === 'N/A' || val === '-') return false;
                const num = parseFloat(val);
                return !isNaN(num) && num >= 0;
            };
            
            // Helper to get most recent valid value from monthly array
            const getMostRecentValue = (monthlyArray) => {
                if (!Array.isArray(monthlyArray) || monthlyArray.length === 0) {
                    return null;
                }
                // Find the last non-empty, non-N/A value
                for (let i = monthlyArray.length - 1; i >= 0; i--) {
                    const val = monthlyArray[i];
                    if (isValidNumber(val)) {
                        return parseFloat(val);
                    }
                }
                return null;
            };
            
            // Check if UX or BI metrics are below target
            let uxBelowTarget = false;
            let biBelowTarget = false;
            
            // Check UX metric
            const mostRecentUX = getMostRecentValue(product.monthlyUX);
            const targetUX = isValidNumber(product.targetUX) ? parseFloat(product.targetUX) : null;
            
            if (mostRecentUX !== null && targetUX !== null) {
                uxBelowTarget = mostRecentUX < targetUX;
            }
            
            // Check BI metric
            const mostRecentBI = getMostRecentValue(product.monthlyBI);
            const targetBI = isValidNumber(product.targetBI) ? parseFloat(product.targetBI) : null;
            
            if (mostRecentBI !== null && targetBI !== null) {
                biBelowTarget = mostRecentBI < targetBI;
            }
            
            // Product must have at least one metric below target
            matchesBelowTarget = uxBelowTarget || biBelowTarget;
        }

        return matchesSearch && matchesArea && matchesMaturity && matchesOwner && matchesBelowTarget;
    });

    // Then, sort the filtered data
    if (sortBy) {
        filteredData = sortData(filteredData, sortBy);
    }

    // Store filtered data in State
    window.State.setFilteredData(filteredData);
    
    console.log('✅ DataManager filtered:', {
        originalCount: portfolioData.length,
        filteredCount: filteredData.length,
        filters: { areaFilters, maturityFilters, ownerFilters }
    });

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
    const portfolioData = window.State.getPortfolioData();
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
        const DATA_CACHE_KEY = window.State.getConstant('DATA_CACHE_KEY');
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
        const DATA_CACHE_KEY = window.State.getConstant('DATA_CACHE_KEY');
        const cached = localStorage.getItem(DATA_CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            // Store loaded data in State
            window.State.setPortfolioData(data);
            return data;
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
    const STORAGE_KEY = window.State.getConstant('STORAGE_KEY');
    localStorage.setItem(STORAGE_KEY, now.toISOString());
    // Also store in State
    window.State.setLastUpdateTime(now.getTime());
    return now;
}

/**
 * Get last update time
 */
function getLastUpdateTime() {
    const STORAGE_KEY = window.State.getConstant('STORAGE_KEY');
    const lastUpdate = localStorage.getItem(STORAGE_KEY);
    return lastUpdate ? new Date(lastUpdate) : null;
}

/**
 * Check if data should be refreshed
 */
function shouldRefreshData() {
    const STORAGE_KEY = window.State.getConstant('STORAGE_KEY');
    const UPDATE_INTERVAL = window.State.getConstant('UPDATE_INTERVAL');
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
 * Determine which quadrant a product falls into on the risk-opportunity matrix
 * @param {number} riskScore - Risk score (0-10)
 * @param {number} performanceScore - Performance score (0-100)
 * @returns {string} - Quadrant identifier
 */
function getQuadrant(riskScore, performanceScore) {
    // Define thresholds
    const riskThreshold = 5; // Risk score >= 5 is "high risk"
    const performanceThreshold = 50; // Performance >= 50% is "high performance"
    
    const isHighRisk = riskScore >= riskThreshold;
    const isHighPerformance = performanceScore >= performanceThreshold;
    
    if (isHighRisk && !isHighPerformance) {
        return 'critical'; // High risk, low performance - RED (needs immediate attention)
    } else if (isHighRisk && isHighPerformance) {
        return 'monitor'; // High risk, high performance - ORANGE (monitor closely)
    } else if (!isHighRisk && !isHighPerformance) {
        return 'improve'; // Low risk, low performance - YELLOW (opportunity to improve)
    } else {
        return 'star'; // Low risk, high performance - GREEN (star performers)
    }
}

/**
 * Analyze portfolio health factors and identify top negative contributors
 * Returns array of top 3 factors affecting portfolio health
 */
function analyzeHealthFactors(portfolioData, productMetrics) {
    const factors = [];
    
    // Factor 1: Products failing performance targets (< 50%)
    const failingPerformance = productMetrics.filter(p => 
        p.performanceScore > 0 && p.performanceScore < 50
    );
    if (failingPerformance.length > 0) {
        factors.push({
            type: 'performance',
            severity: failingPerformance.length,
            icon: '📉',
            message: `${failingPerformance.length} product${failingPerformance.length > 1 ? 's are' : ' is'} failing performance targets (below 50%)`,
            details: `${failingPerformance.length} of ${productMetrics.length} products not meeting target KPIs`
        });
    }
    
    // Factor 2: High-risk products (risk score >= 7)
    const highRiskProducts = productMetrics.filter(p => p.riskScore >= 7);
    if (highRiskProducts.length > 0) {
        factors.push({
            type: 'risk',
            severity: highRiskProducts.length,
            icon: '⚠️',
            message: `${highRiskProducts.length} product${highRiskProducts.length > 1 ? 's' : ''} classified as high risk`,
            details: `Risk factors include early maturity stage, missing metrics, or lack of ownership`
        });
    }
    
    // Factor 3: Products with no performance data
    const noPerformanceData = productMetrics.filter(p => p.performanceScore === 0);
    if (noPerformanceData.length > 0) {
        factors.push({
            type: 'data',
            severity: noPerformanceData.length,
            icon: '📊',
            message: `${noPerformanceData.length} product${noPerformanceData.length > 1 ? 's have' : ' has'} no performance data tracked`,
            details: `Missing monthly metrics or target values prevent performance assessment`
        });
    }
    
    // Factor 4: Missing Business Impact metrics
    const missingBIMetrics = portfolioData.filter(p => 
        !p.keyMetricBI || p.keyMetricBI.trim() === ''
    );
    if (missingBIMetrics.length > 0) {
        factors.push({
            type: 'metrics',
            severity: missingBIMetrics.length,
            icon: '💼',
            message: `${missingBIMetrics.length} product${missingBIMetrics.length > 1 ? 's lack' : ' lacks'} Business Impact metrics`,
            details: `Business value measurement incomplete for portfolio analysis`
        });
    }
    
    // Factor 5: Missing UX metrics
    const missingUXMetrics = portfolioData.filter(p => 
        !p.keyMetricUX || p.keyMetricUX.trim() === ''
    );
    if (missingUXMetrics.length > 0) {
        factors.push({
            type: 'metrics',
            severity: missingUXMetrics.length,
            icon: '👤',
            message: `${missingUXMetrics.length} product${missingUXMetrics.length > 1 ? 's lack' : ' lacks'} User Experience metrics`,
            details: `User impact measurement incomplete for portfolio analysis`
        });
    }
    
    // Factor 6: Products without owners
    const missingOwners = portfolioData.filter(p => 
        !p.owner || p.owner.trim() === ''
    );
    if (missingOwners.length > 0) {
        factors.push({
            type: 'ownership',
            severity: missingOwners.length,
            icon: '👥',
            message: `${missingOwners.length} product${missingOwners.length > 1 ? 's have' : ' has'} no assigned owner`,
            details: `Clear ownership critical for accountability and product success`
        });
    }
    
    // Factor 7: Products missing target values
    const missingTargets = portfolioData.filter(p => 
        (!p.targetUX || p.targetUX === '') && (!p.targetBI || p.targetBI === '')
    );
    if (missingTargets.length > 0) {
        factors.push({
            type: 'targets',
            severity: missingTargets.length,
            icon: '🎯',
            message: `${missingTargets.length} product${missingTargets.length > 1 ? 's have' : ' has'} no defined target values`,
            details: `Target setting essential for measuring progress and success`
        });
    }
    
    // Sort by severity (most products affected) and return top 3
    return factors
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 3);
}

/**
 * Check for anomalies in the portfolio data
 * Identifies owner over-allocation and data quality issues
 * 
 * @returns {Object} Consolidated anomaly report with categorized anomalies
 */
function checkAnomalies() {
    // Get portfolio data from State
    const portfolioData = window.State.getPortfolioData();
    
    if (!portfolioData || portfolioData.length === 0) {
        console.warn('No portfolio data available for anomaly detection');
        return {
            ownerOverload: [],
            dataHealthIssues: []
        };
    }
    
    // ===== 1. OWNER OVER-ALLOCATION DETECTION =====
    // Flag owners with more than 3 products in Development or Growth stages
    
    // Group products by owner
    const ownerProductMap = {};
    
    portfolioData.forEach(product => {
        const owner = product.owner || 'Not assigned';
        const maturity = (product.maturity || '').toLowerCase();
        
        // Check if product is in Development or Growth stage
        const isDevelopmentOrGrowth = maturity.includes('development') || 
                                      maturity === '1. development' ||
                                      maturity.includes('growth') ||
                                      maturity === '2. growth';
        
        if (isDevelopmentOrGrowth) {
            if (!ownerProductMap[owner]) {
                ownerProductMap[owner] = [];
            }
            ownerProductMap[owner].push({
                id: product.id,
                name: product.name,
                maturity: product.maturity
            });
        }
    });
    
    // Identify owners with more than 3 products in Development/Growth
    const ownerOverload = [];
    Object.entries(ownerProductMap).forEach(([owner, products]) => {
        if (products.length > 3) {
            ownerOverload.push({
                owner: owner,
                productCount: products.length,
                products: products.map(p => p.name)
            });
        }
    });
    
    // Sort by product count (descending)
    ownerOverload.sort((a, b) => b.productCount - a.productCount);
    
    // ===== 2. METRIC HEALTH CHECKS =====
    // Identify data quality issues for each product
    
    const dataHealthIssues = [];
    
    // Helper to check if value is invalid (missing or N/A)
    const isInvalid = (val) => {
        if (!val || val === '' || val === 'N/A' || val === '-') return true;
        return false;
    };
    
    // Helper to check if a value is a valid number
    const isValidNumber = (val) => {
        if (isInvalid(val)) return false;
        const num = parseFloat(val);
        return !isNaN(num);
    };
    
    // Helper to get the most recent non-empty monthly value
    const getMostRecentValue = (monthlyArray) => {
        if (!monthlyArray || !Array.isArray(monthlyArray)) return null;
        
        // Iterate from end to beginning to find most recent value
        for (let i = monthlyArray.length - 1; i >= 0; i--) {
            const val = monthlyArray[i];
            if (isValidNumber(val)) {
                return parseFloat(val);
            }
        }
        return null;
    };
    
    portfolioData.forEach(product => {
        const issues = [];
        
        // Check 1: Missing UX metric definition
        if (isInvalid(product.keyMetricUX)) {
            issues.push('Missing UX Metric');
        }
        
        // Check 2: Missing BI metric definition
        if (isInvalid(product.keyMetricBI)) {
            issues.push('Missing BI Metric');
        }
        
        // Check 3: Missing UX target
        if (isInvalid(product.targetUX) && !isInvalid(product.keyMetricUX)) {
            issues.push('Missing UX Target');
        }
        
        // Check 4: Missing BI target
        if (isInvalid(product.targetBI) && !isInvalid(product.keyMetricBI)) {
            issues.push('Missing BI Target');
        }
        
        // Check 5: Most recent UX monthly value below target
        if (!isInvalid(product.keyMetricUX) && isValidNumber(product.targetUX)) {
            const mostRecentUX = getMostRecentValue(product.monthlyUX);
            const targetUX = parseFloat(product.targetUX);
            
            if (mostRecentUX !== null && mostRecentUX < targetUX) {
                issues.push(`Below UX Target (${mostRecentUX} < ${targetUX})`);
            }
        }
        
        // Check 6: Most recent BI monthly value below target
        if (!isInvalid(product.keyMetricBI) && isValidNumber(product.targetBI)) {
            const mostRecentBI = getMostRecentValue(product.monthlyBI);
            const targetBI = parseFloat(product.targetBI);
            
            if (mostRecentBI !== null && mostRecentBI < targetBI) {
                issues.push(`Below BI Target (${mostRecentBI} < ${targetBI})`);
            }
        }
        
        // If any issues found, add to report
        if (issues.length > 0) {
            dataHealthIssues.push({
                id: product.id,
                name: product.name,
                area: product.area,
                owner: product.owner,
                maturity: product.maturity,
                issueCount: issues.length,
                issues: issues
            });
        }
    });
    
    // Sort data health issues by issue count (descending)
    dataHealthIssues.sort((a, b) => b.issueCount - a.issueCount);
    
    // ===== CONSTRUCT ANOMALY REPORT =====
    const anomalyReport = {
        ownerOverload: ownerOverload,
        dataHealthIssues: dataHealthIssues,
        summary: {
            totalOwnerOverloads: ownerOverload.length,
            totalDataHealthIssues: dataHealthIssues.length,
            totalAnomalies: ownerOverload.length + dataHealthIssues.length,
            timestamp: new Date().toISOString()
        }
    };
    return anomalyReport;
}

/**
 * Calculate comprehensive portfolio metrics for Executive View
 * Returns a structured object with all high-level, actionable insights
 */
function calculatePortfolioMetrics() {
    console.log('Calculating portfolio metrics for Executive View...');
    
    // Get portfolio data from State
    const portfolioData = window.State.getPortfolioData();
    
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
    
    // ===== 9. HEALTH SCORE BREAKDOWN =====
    // Identify top 3 negative factors affecting portfolio health
    const healthScoreBreakdown = analyzeHealthFactors(portfolioData, productMetrics);
    
    // ===== 10. RISK & OPPORTUNITY MATRIX DATA =====
    // Create array for scatter plot visualization with risk vs performance
    const riskOpportunityData = productMetrics.map(p => ({
        id: p.id,
        name: p.name,
        area: p.area,
        maturity: p.maturity,
        riskScore: p.riskScore,
        performanceScore: p.performanceScore,
        // Determine quadrant for color-coding
        quadrant: getQuadrant(p.riskScore, p.performanceScore)
    }));
    
    // ===== CONSTRUCT RETURN OBJECT =====
    const metrics = {
        // Summary metrics
        healthScore: healthScore,
        healthScoreBreakdown: healthScoreBreakdown, // NEW: Drill-down reasons
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
        
        // Risk & Opportunity Matrix
        riskOpportunityData: riskOpportunityData, // NEW: Matrix data for scatter plot
        
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
 * Get summary metrics for a product card (optimized display)
 * Returns compact metric status for at-a-glance viewing
 * 
 * @param {Object} product - Product object
 * @returns {Object} Summary metrics with status indicators
 */
function getCardSummaryMetrics(product) {
    // Helper to check if value is invalid
    const isInvalid = (val) => !val || val === '' || val === 'N/A' || val === '-';
    
    // Helper to check if value is a valid number
    const isValidNumber = (val) => {
        if (isInvalid(val)) return false;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
    };
    
    // Helper to get most recent monthly value
    const getMostRecentValue = (monthlyArray) => {
        if (!Array.isArray(monthlyArray) || monthlyArray.length === 0) {
            return null;
        }
        
        // Find the last non-empty, non-N/A value
        for (let i = monthlyArray.length - 1; i >= 0; i--) {
            const val = monthlyArray[i];
            if (isValidNumber(val)) {
                return parseFloat(val);
            }
        }
        return null;
    };
    
    // Calculate UX status
    let uxStatus = 'gray'; // Default: no data
    const mostRecentUX = getMostRecentValue(product.monthlyUX);
    const targetUX = isValidNumber(product.targetUX) ? parseFloat(product.targetUX) : null;
    
    if (mostRecentUX !== null && targetUX !== null) {
        uxStatus = mostRecentUX >= targetUX ? 'green' : 'red';
    } else if (isInvalid(product.keyMetricUX)) {
        uxStatus = 'gray'; // No metric defined
    }
    
    // Calculate BI status
    let biStatus = 'gray'; // Default: no data
    const mostRecentBI = getMostRecentValue(product.monthlyBI);
    const targetBI = isValidNumber(product.targetBI) ? parseFloat(product.targetBI) : null;
    
    if (mostRecentBI !== null && targetBI !== null) {
        biStatus = mostRecentBI >= targetBI ? 'green' : 'red';
    } else if (isInvalid(product.keyMetricBI)) {
        biStatus = 'gray'; // No metric defined
    }
    
    // Return summary object
    return {
        owner: product.owner || 'Not assigned',
        problem: product.problem || 'No problem statement defined',
        maturity: product.maturity || 'Not specified',
        area: product.area || 'Not specified',
        uxStatus: uxStatus,
        biStatus: biStatus,
        uxMetric: product.keyMetricUX || 'N/A',
        biMetric: product.keyMetricBI || 'N/A',
        uxValue: mostRecentUX !== null ? mostRecentUX : null,
        biValue: mostRecentBI !== null ? mostRecentBI : null,
        uxTarget: targetUX,
        biTarget: targetBI
    };
}

// ==================== GETTERS ====================
// These functions provide convenient access to state data
// They proxy to window.State for consistency

/**
 * Get current portfolio data
 * @returns {Array} Portfolio data array
 */
function getPortfolioData() {
    return window.State.getPortfolioData();
}

/**
 * Get current filtered data
 * @returns {Array} Filtered data array
 */
function getFilteredData() {
    return window.State.getFilteredData();
}

/**
 * Get data by product ID
 * @param {number} id - Product ID
 * @returns {Object|undefined} Product object or undefined
 */
function getProductById(id) {
    const portfolioData = window.State.getPortfolioData();
    return portfolioData.find(p => p.id === id);
}

/**
 * Get statistics for live and dev products
 * @returns {Object} Statistics object with total, showing, live, and dev counts
 */
function getProductStats() {
    const portfolioData = window.State.getPortfolioData();
    const filteredData = window.State.getFilteredData();
    
    return {
        total: portfolioData.length,
        showing: filteredData.length,
        live: filteredData.filter(p => p.maturity.toLowerCase().includes('live') || p.maturity.toLowerCase().includes('mature')).length,
        dev: filteredData.filter(p => p.maturity.toLowerCase().includes('development')).length
    };
}

/**
 * Count products with missing metric updates
 * 
 * Business Rule: A product is counted as "missing metrics" if:
 * 1. The key metric field itself is "N/A" or empty (no metric defined), OR
 * 2. The CURRENT MONTH metric value is missing, N/A, empty, or zero
 * 
 * @returns {Object} Object containing counts of products with missing UX and BI metrics
 * @returns {number} return.missingUX - Count of products with missing UX metric definition or current month value
 * @returns {number} return.missingBI - Count of products with missing BI metric definition or current month value
 */
function countMissingMetrics() {
    const portfolioData = window.State.getPortfolioData();
    
    if (!portfolioData || portfolioData.length === 0) {
        return {
            missingUX: 0,
            missingBI: 0
        };
    }
    
    // Get current month index (0-based: Jan=0, Feb=1, ..., Oct=9, Nov=10, Dec=11)
    const currentMonth = new Date().getMonth();
    
    let missingUX = 0;
    let missingBI = 0;
    
    portfolioData.forEach(product => {
        // Check UX metric
        // Rule 1: Check if key metric field is missing or N/A (no metric defined)
        if (!product.keyMetricUX || 
            product.keyMetricUX.trim() === '' || 
            product.keyMetricUX === 'N/A') {
            missingUX++;
        } 
        // Rule 2: Check if current month value is missing
        else if (product.monthlyUX && Array.isArray(product.monthlyUX)) {
            // Get the current month value (e.g., October = index 9)
            const currentUXValue = product.monthlyUX[currentMonth];
            
            // Check if it's missing, N/A, empty, or zero
            if (!currentUXValue || 
                currentUXValue === 'N/A' || 
                currentUXValue === '' || 
                currentUXValue === '0' ||
                parseFloat(currentUXValue) === 0) {
                missingUX++;
            }
        } else {
            // No monthlyUX array at all
            missingUX++;
        }
        
        // Check BI metric
        // Rule 1: Check if key metric field is missing or N/A (no metric defined)
        if (!product.keyMetricBI || 
            product.keyMetricBI.trim() === '' || 
            product.keyMetricBI === 'N/A') {
            missingBI++;
        }
        // Rule 2: Check if current month value is missing
        else if (product.monthlyBI && Array.isArray(product.monthlyBI)) {
            // Get the current month value (e.g., October = index 9)
            const currentBIValue = product.monthlyBI[currentMonth];
            
            // Check if it's missing, N/A, empty, or zero
            if (!currentBIValue || 
                currentBIValue === 'N/A' || 
                currentBIValue === '' || 
                currentBIValue === '0' ||
                parseFloat(currentBIValue) === 0) {
                missingBI++;
            }
        } else {
            // No monthlyBI array at all
            missingBI++;
        }
    });
    
    return {
        missingUX,
        missingBI
    };
}

// ==================== SMOKE DETECTORS ====================

/**
 * Calculate Smoke Detectors for a single product
 * Returns a count of triggered detectors (0-4) based on four critical warning signals
 * 
 * @param {Object} productData - Product object with all relevant fields
 * @returns {number} Count of triggered smoke detectors (0-4)
 */
function calculateSmokeDetectors(productData) {
    let detectorCount = 0;
    
    // Helper to check if value is invalid (missing, empty, N/A, or dash)
    const isInvalid = (val) => {
        if (val === null || val === undefined || val === '' || val === 'N/A' || val === '-') {
            return true;
        }
        // Check if it's a string that's just whitespace
        if (typeof val === 'string' && val.trim() === '') {
            return true;
        }
        return false;
    };
    
    // Helper to check if a value is a valid numeric value
    const isValidNumber = (val) => {
        if (isInvalid(val)) return false;
        const num = parseFloat(val);
        return !isNaN(num);
    };
    
    // Helper to get Total HC Allocation from rawRow
    const getTotalHCAllocation = (product) => {
        // If we have column mapping, use it to find the Total HC Allocation column
        const columnMapping = window.State ? window.State.getColumnMapping() : null;
        
        if (!product.rawRow || !Array.isArray(product.rawRow)) {
            return null;
        }
        
        // Search for "Total\nHeadcount Allocation (BAU) in # HC" column
        // This is typically around column index 62 based on the CSV structure
        // But we need to dynamically find it if column mapping exists
        
        // For now, we'll look for the value in the rawRow around the expected position
        // A more robust approach would be to enhance the column mapping during data fetch
        
        // The rawRow contains all columns, we need to find the right index
        // Based on CSV structure, Total HC Allocation is near the end
        // Looking at the CSV headers, it appears after all the secondary metrics
        
        // Strategy: Search backwards from the end for a valid number in the expected range
        // HC allocation is typically 0-10 people
        for (let i = product.rawRow.length - 10; i >= 0 && i < product.rawRow.length; i--) {
            const val = product.rawRow[i];
            if (isValidNumber(val)) {
                const num = parseFloat(val);
                // HC allocation should be reasonable (0-100)
                if (num >= 0 && num <= 100) {
                    // This could be our HC allocation
                    // We'll use the first valid number we find in this range
                    // In production, this should use proper column mapping
                    return num;
                }
            }
        }
        
        return null;
    };
    
    // DETECTOR 1: Downward Metric Trend
    // Check for downward trend in monthlyUX or monthlyBI for 3+ consecutive months
    const hasDownwardTrend = (monthlyArray) => {
        if (!Array.isArray(monthlyArray) || monthlyArray.length < 3) {
            return false;
        }
        
        // Extract valid numeric values with their indices
        const validValues = [];
        for (let i = 0; i < monthlyArray.length; i++) {
            if (isValidNumber(monthlyArray[i])) {
                validValues.push({
                    index: i,
                    value: parseFloat(monthlyArray[i])
                });
            }
        }
        
        // Need at least 3 valid values to check for trend
        if (validValues.length < 3) {
            return false;
        }
        
        // Check for 3+ consecutive declining values
        let consecutiveDeclines = 0;
        for (let i = 1; i < validValues.length; i++) {
            if (validValues[i].value < validValues[i - 1].value) {
                consecutiveDeclines++;
                if (consecutiveDeclines >= 2) {
                    // 2 declines means 3 consecutive values (first, second, third)
                    return true;
                }
            } else {
                // Reset counter if trend breaks
                consecutiveDeclines = 0;
            }
        }
        
        return false;
    };
    
    const uxDownward = hasDownwardTrend(productData.monthlyUX);
    const biDownward = hasDownwardTrend(productData.monthlyBI);
    
    if (uxDownward || biDownward) {
        detectorCount++;
    }
    
    // DETECTOR 2: Lacking Metrics
    // Check if Key Metric UX or Key Metric BI is missing
    const missingUXMetric = isInvalid(productData.keyMetricUX);
    const missingBIMetric = isInvalid(productData.keyMetricBI);
    
    if (missingUXMetric || missingBIMetric) {
        detectorCount++;
    }
    
    // DETECTOR 3: Maturity Signal
    // Check if Maturity Stage is "Decline", OR
    // if it's "Growth" or "Mature" but Sean Ellis Score is missing or below 40%
    const maturityStage = (productData.maturity || '').toLowerCase().trim();
    
    // Check for Decline stage
    const isDecline = maturityStage.includes('decline') || maturityStage === '4. decline';
    
    // Check for Growth or Mature stage
    const isGrowth = maturityStage.includes('growth') || maturityStage === '2. growth';
    const isMature = maturityStage.includes('mature') || maturityStage === '3. mature';
    
    if (isDecline) {
        detectorCount++;
    } else if (isGrowth || isMature) {
        // For Growth/Mature, check Sean Ellis Score
        // Sean Ellis Score is in the keyMetricUX column
        const seanEllisScore = productData.keyMetricUX;
        
        // Check if score is missing or below 40%
        if (isInvalid(seanEllisScore)) {
            detectorCount++;
        } else if (isValidNumber(seanEllisScore)) {
            const score = parseFloat(seanEllisScore);
            if (score < 40) {
                detectorCount++;
            }
        }
    }
    
    // DETECTOR 4: High BAU HC Allocation
    // Check if Total Headcount Allocation (BAU) in # HC is greater than 2
    const totalHC = getTotalHCAllocation(productData);
    
    if (totalHC !== null && totalHC > 2) {
        detectorCount++;
    }
    
    return detectorCount;
}

// ==================== EXPORTS ====================

/**
 * Expose public API globally for access by other modules
 * 
 * REFACTORED ARCHITECTURE:
 * - All state access goes through window.State (see core/state.js)
 * - Utility functions accessed via window.Utils (see core/utils.js)
 * - This module now focuses purely on data operations
 */
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
    checkAnomalies,
    getCardSummaryMetrics,
    calculateSmokeDetectors,
    
    // Getters (proxy to State)
    getPortfolioData,
    getFilteredData,
    getProductById,
    getProductStats,
    countMissingMetrics,
    
    // Utility reference (for backward compatibility)
    debounce: window.Utils ? window.Utils.debounce : null
};

console.log('✅ Data Manager module loaded (Refactored)');

// ==================== UNIT TESTS: SMOKE DETECTORS ====================
// Comprehensive test suite for calculateSmokeDetectors function
// Run these tests in development/testing environment to validate logic

/**
 * Unit Test Suite for calculateSmokeDetectors
 * Tests all four smoke detector rules with edge cases
 */
function runSmokeDetectorTests() {
    console.log('🧪 Running Smoke Detector Unit Tests...');
    
    let passedTests = 0;
    let failedTests = 0;
    
    // Helper function to run a single test
    const test = (testName, productData, expectedCount, description) => {
        const result = calculateSmokeDetectors(productData);
        const passed = result === expectedCount;
        
        if (passed) {
            console.log(`✅ PASS: ${testName}`);
            console.log(`   Expected: ${expectedCount}, Got: ${result}`);
            if (description) console.log(`   ${description}`);
            passedTests++;
        } else {
            console.error(`❌ FAIL: ${testName}`);
            console.error(`   Expected: ${expectedCount}, Got: ${result}`);
            if (description) console.error(`   ${description}`);
            failedTests++;
        }
        console.log(''); // Empty line for readability
    };
    
    // ==================== TEST 1: Zero Detectors ====================
    console.log('--- Test Suite 1: Zero Detectors ---');
    
    test(
        'Product with perfect health (no detectors)',
        {
            keyMetricUX: '75', // Has UX metric
            keyMetricBI: '150', // Has BI metric
            maturity: '1. Development', // Development stage (not decline, growth, or mature)
            monthlyUX: [100, 105, 110, 115], // Upward trend
            monthlyBI: [200, 210, 220, 230], // Upward trend
            rawRow: new Array(65).fill(0).concat([1.5]) // HC allocation = 1.5 (≤ 2)
        },
        0,
        'Product with all metrics present, upward trends, Development stage, low HC'
    );
    
    test(
        'Mature product with good Sean Ellis Score (no detectors)',
        {
            keyMetricUX: '55', // Sean Ellis Score above 40%
            keyMetricBI: '200',
            maturity: '3. Mature',
            monthlyUX: [100, 102, 101], // Stable trend
            monthlyBI: [200, 205, 203],
            rawRow: new Array(65).fill(0).concat([2]) // HC allocation = 2 (not > 2)
        },
        0,
        'Mature product with Sean Ellis Score above 40%, no downward trend, HC = 2'
    );
    
    // ==================== TEST 2: Detector 1 - Downward Trend ====================
    console.log('--- Test Suite 2: Detector 1 - Downward Metric Trend ---');
    
    test(
        'Downward UX trend for exactly 3 months',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 90, 80], // 3 consecutive declining values
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Exactly 3 declining UX values triggers detector'
    );
    
    test(
        'Downward BI trend for 4+ months',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 190, 180, 170], // 4 consecutive declining values
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        '4+ declining BI values triggers detector'
    );
    
    test(
        'Only 2 consecutive months declining (no trigger)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 90], // Only 2 values declining
            monthlyBI: [200, 210],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'Only 2 declining values should NOT trigger detector'
    );
    
    test(
        'Downward trend with N/A values interspersed',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 'N/A', 90, 'N/A', 80], // Valid values show decline
            monthlyBI: [200],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Downward trend detected even with N/A values in between'
    );
    
    test(
        'Trend breaks and resets (no trigger)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 90, 95, 85], // Decline breaks at 95
            monthlyBI: [200, 210],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'Trend breaks when value increases, no 3+ consecutive declines'
    );
    
    // ==================== TEST 3: Detector 2 - Lacking Metrics ====================
    console.log('--- Test Suite 3: Detector 2 - Lacking Metrics ---');
    
    test(
        'Missing UX metric only',
        {
            keyMetricUX: '', // Missing
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Missing UX metric triggers detector'
    );
    
    test(
        'Missing BI metric only',
        {
            keyMetricUX: '75',
            keyMetricBI: 'N/A', // Missing
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Missing BI metric triggers detector'
    );
    
    test(
        'Both metrics missing',
        {
            keyMetricUX: '-', // Missing
            keyMetricBI: '', // Missing
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Both metrics missing triggers detector once (not twice)'
    );
    
    test(
        'Null and undefined metrics',
        {
            keyMetricUX: null,
            keyMetricBI: undefined,
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Null or undefined metrics trigger detector'
    );
    
    // ==================== TEST 4: Detector 3 - Maturity Signal ====================
    console.log('--- Test Suite 4: Detector 3 - Maturity Signal ---');
    
    test(
        'Decline stage triggers detector',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '4. Decline',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Decline maturity stage triggers detector'
    );
    
    test(
        'Growth stage with missing Sean Ellis Score',
        {
            keyMetricUX: '', // Missing Sean Ellis Score
            keyMetricBI: '150',
            maturity: '2. Growth',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        2,
        'Growth with missing Sean Ellis triggers both detector 2 (lacking metrics) and 3 (maturity signal)'
    );
    
    test(
        'Growth stage with Sean Ellis Score below 40%',
        {
            keyMetricUX: '35', // Below 40%
            keyMetricBI: '150',
            maturity: '2. Growth',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Growth with Sean Ellis Score below 40% triggers detector'
    );
    
    test(
        'Growth stage with Sean Ellis Score exactly 40% (no trigger)',
        {
            keyMetricUX: '40', // Exactly 40%
            keyMetricBI: '150',
            maturity: '2. Growth',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'Growth with Sean Ellis Score exactly 40% does NOT trigger detector'
    );
    
    test(
        'Mature stage with Sean Ellis Score below 40%',
        {
            keyMetricUX: '30',
            keyMetricBI: '150',
            maturity: '3. Mature',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Mature with Sean Ellis Score below 40% triggers detector'
    );
    
    test(
        'Mature stage with Sean Ellis Score above 40% (no trigger)',
        {
            keyMetricUX: '55',
            keyMetricBI: '150',
            maturity: '3. Mature',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'Mature with Sean Ellis Score above 40% does NOT trigger detector'
    );
    
    test(
        'Development stage (no maturity signal trigger)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'Development stage does NOT trigger maturity signal detector'
    );
    
    // ==================== TEST 5: Detector 4 - High BAU HC Allocation ====================
    console.log('--- Test Suite 5: Detector 4 - High BAU HC Allocation ---');
    
    test(
        'HC allocation exactly 2 (no trigger)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([2]) // Exactly 2
        },
        0,
        'HC allocation exactly 2 does NOT trigger detector'
    );
    
    test(
        'HC allocation greater than 2 (triggers)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([2.1]) // > 2
        },
        1,
        'HC allocation > 2 triggers detector'
    );
    
    test(
        'HC allocation much higher than 2',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([10]) // Much higher
        },
        1,
        'HC allocation = 10 triggers detector'
    );
    
    test(
        'Missing rawRow data (no trigger)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: null // No raw data
        },
        0,
        'Missing rawRow does NOT trigger detector (cannot determine HC)'
    );
    
    // ==================== TEST 6: Multiple Detectors ====================
    console.log('--- Test Suite 6: Multiple Detectors Triggered ---');
    
    test(
        'All four detectors triggered',
        {
            keyMetricUX: '', // Missing metric (Detector 2)
            keyMetricBI: '',
            maturity: '4. Decline', // Decline stage (Detector 3)
            monthlyUX: [100, 90, 80], // Downward trend (Detector 1)
            monthlyBI: [200, 190, 180],
            rawRow: new Array(65).fill(0).concat([5]) // HC > 2 (Detector 4)
        },
        4,
        'All four detectors triggered'
    );
    
    test(
        'Three detectors: downward trend, lacking metrics, high HC',
        {
            keyMetricUX: 'N/A', // Missing metric (Detector 2)
            keyMetricBI: '150',
            maturity: '1. Development', // Development (no Detector 3)
            monthlyUX: [100, 90, 80], // Downward trend (Detector 1)
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([3]) // HC > 2 (Detector 4)
        },
        3,
        'Three detectors: downward trend, lacking metrics, high HC'
    );
    
    test(
        'Two detectors: decline stage and downward trend',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '4. Decline', // Detector 3
            monthlyUX: [100, 90, 80, 70], // Downward trend (Detector 1)
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        2,
        'Two detectors: decline stage and downward trend'
    );
    
    // ==================== TEST 7: Edge Cases ====================
    console.log('--- Test Suite 7: Edge Cases ---');
    
    test(
        'Empty monthly arrays',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [], // Empty array
            monthlyBI: [],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'Empty monthly arrays should not trigger downward trend detector'
    );
    
    test(
        'All N/A monthly values',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: ['N/A', 'N/A', 'N/A'],
            monthlyBI: ['N/A', 'N/A', 'N/A'],
            rawRow: new Array(65).fill(0).concat([1])
        },
        0,
        'All N/A monthly values should not trigger downward trend'
    );
    
    test(
        'Mixed valid and invalid maturity format',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: 'Growth', // Without number prefix
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Growth stage without Sean Ellis Score triggers detector (keyMetricUX used for score)'
    );
    
    test(
        'Whitespace-only metric values',
        {
            keyMetricUX: '   ', // Whitespace only
            keyMetricBI: '\t\n',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([1])
        },
        1,
        'Whitespace-only metric values trigger lacking metrics detector'
    );
    
    test(
        'Negative HC allocation (edge case)',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([-1]) // Negative value
        },
        0,
        'Negative HC allocation should not trigger (invalid data)'
    );
    
    test(
        'Zero HC allocation',
        {
            keyMetricUX: '75',
            keyMetricBI: '150',
            maturity: '1. Development',
            monthlyUX: [100, 105, 110],
            monthlyBI: [200, 210, 220],
            rawRow: new Array(65).fill(0).concat([0])
        },
        0,
        'Zero HC allocation does not trigger detector'
    );
    
    // ==================== TEST SUMMARY ====================
    console.log('==================== TEST SUMMARY ====================');
    console.log(`Total Tests: ${passedTests + failedTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log('======================================================');
    
    return {
        total: passedTests + failedTests,
        passed: passedTests,
        failed: failedTests,
        success: failedTests === 0
    };
}

// Expose test function globally for manual execution
window.runSmokeDetectorTests = runSmokeDetectorTests;

// Uncomment the line below to run tests automatically when module loads
// runSmokeDetectorTests();

