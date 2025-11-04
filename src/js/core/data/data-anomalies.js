/**
 * Data Anomalies Module
 * Handles anomaly detection and smoke detector calculations
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PRIVATE HELPERS ====================
    
    /**
     * Check if value is invalid (missing, empty, N/A, or dash)
     */
    function isInvalid(val) {
        if (val === null || val === undefined || val === '' || val === 'N/A' || val === '-') {
            return true;
        }
        if (typeof val === 'string' && val.trim() === '') {
            return true;
        }
        return false;
    }
    
    /**
     * Check if a monthly data array has any valid data
     * Used to detect if tracking exists even if metric name is defined
     * @param {Array} monthlyArray - Array of monthly values
     * @returns {boolean} True if at least one valid data point exists
     */
    function hasAnyValidData(monthlyArray) {
        if (!Array.isArray(monthlyArray) || monthlyArray.length === 0) {
            return false;
        }
        
        // Check if at least one month has valid numeric data
        for (let i = 0; i < monthlyArray.length; i++) {
            if (isValidNumber(monthlyArray[i])) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a value is a valid numeric value
     */
    function isValidNumber(val) {
        if (isInvalid(val)) return false;
        const num = parseFloat(val);
        return !isNaN(num);
    }

    /**
     * Get the most recent non-empty monthly value
     */
    function getMostRecentValue(monthlyArray) {
        if (!monthlyArray || !Array.isArray(monthlyArray)) return null;
        
        for (let i = monthlyArray.length - 1; i >= 0; i--) {
            const val = monthlyArray[i];
            if (isValidNumber(val)) {
                return parseFloat(val);
            }
        }
        return null;
    }

    /**
     * Check for downward trend in the LAST 3 months from today
     * Business Rule: Must show decline in the most recent 3 consecutive months
     * 
     * @param {Array} monthlyArray - Array of 12 monthly values (Jan-Dec, indices 0-11)
     * @returns {boolean} True if last 3 months show declining trend
     */
    function hasDownwardTrend(monthlyArray) {
        if (!Array.isArray(monthlyArray) || monthlyArray.length < 12) {
            return false;
        }
        
        // Get current month (0-11, where 0 = January, 11 = December)
        const currentMonth = new Date().getMonth();
        
        // Calculate indices for last 3 months
        // For example, if current month is November (10):
        // - Month 1: September (8)
        // - Month 2: October (9)  
        // - Month 3: November (10)
        const month1Index = currentMonth - 2;
        const month2Index = currentMonth - 1;
        const month3Index = currentMonth;
        
        // Handle year boundary (e.g., if current month is January or February)
        // For January (0): check Nov(10), Dec(11) of previous year - not in same array
        // For February (1): check Dec(11) of previous year, Jan(0) - not in same array
        // So we need at least March (2) or later to have 3 months in the same year array
        if (month1Index < 0) {
            // Can't check last 3 months within the same year array
            return false;
        }
        
        // Get values for last 3 months
        const month1Value = monthlyArray[month1Index];
        const month2Value = monthlyArray[month2Index];
        const month3Value = monthlyArray[month3Index];
        
        // Check if all 3 months have valid numeric data
        if (!isValidNumber(month1Value) || !isValidNumber(month2Value) || !isValidNumber(month3Value)) {
            return false; // Can't determine trend without all 3 data points
        }
        
        // Convert to numbers
        const val1 = parseFloat(month1Value);
        const val2 = parseFloat(month2Value);
        const val3 = parseFloat(month3Value);
        
        // Check for declining trend: each month lower than the previous
        // Month 2 < Month 1 AND Month 3 < Month 2
        const isDecline = (val2 < val1) && (val3 < val2);
        
        return isDecline;
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Check for portfolio anomalies
     */
    function checkAnomalies() {
        const portfolioData = window.State.getPortfolioData();
        
        if (!portfolioData || portfolioData.length === 0) {
            console.warn('No portfolio data available for anomaly detection');
            return {
                ownerOverload: [],
                dataHealthIssues: []
            };
        }
        
        // ===== 1. OWNER OVER-ALLOCATION DETECTION =====
        const ownerProductMap = {};
        
        portfolioData.forEach(product => {
            const owner = product.owner || 'Not assigned';
            const maturity = (product.maturity || '').toLowerCase();
            
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
        
        ownerOverload.sort((a, b) => b.productCount - a.productCount);
        
        // ===== 2. METRIC HEALTH CHECKS =====
        const dataHealthIssues = [];
        
        portfolioData.forEach(product => {
            const issues = [];
            
            if (isInvalid(product.keyMetricUX)) {
                issues.push('Missing UX Metric');
            }
            
            if (isInvalid(product.keyMetricBI)) {
                issues.push('Missing BI Metric');
            }
            
            if (isInvalid(product.targetUX) && !isInvalid(product.keyMetricUX)) {
                issues.push('Missing UX Target');
            }
            
            if (isInvalid(product.targetBI) && !isInvalid(product.keyMetricBI)) {
                issues.push('Missing BI Target');
            }
            
            if (!isInvalid(product.keyMetricUX) && isValidNumber(product.targetUX)) {
                const mostRecentUX = getMostRecentValue(product.monthlyUX);
                const targetUX = parseFloat(product.targetUX);
                
                if (mostRecentUX !== null && mostRecentUX < targetUX) {
                    issues.push(`Below UX Target (${mostRecentUX} < ${targetUX})`);
                }
            }
            
            if (!isInvalid(product.keyMetricBI) && isValidNumber(product.targetBI)) {
                const mostRecentBI = getMostRecentValue(product.monthlyBI);
                const targetBI = parseFloat(product.targetBI);
                
                if (mostRecentBI !== null && mostRecentBI < targetBI) {
                    issues.push(`Below BI Target (${mostRecentBI} < ${targetBI})`);
                }
            }
            
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
        
        dataHealthIssues.sort((a, b) => b.issueCount - a.issueCount);
        
        return {
            ownerOverload: ownerOverload,
            dataHealthIssues: dataHealthIssues,
            summary: {
                totalOwnerOverloads: ownerOverload.length,
                totalDataHealthIssues: dataHealthIssues.length,
                totalAnomalies: ownerOverload.length + dataHealthIssues.length,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Calculate smoke detectors for a product
     * Returns structured object with count and detailed trigger information
     * 
     * @param {Object} productData - Product data object
     * @returns {Object} { count: number, triggers: Array<{type: string, message: string, severity: string}> }
     * 
     * @example
     * const result = calculateSmokeDetectors(product);
     * // Returns: { count: 2, triggers: [
     * //   { type: 'trend', message: 'UX metric declining (3+ consecutive months)', severity: 'warning' },
     * //   { type: 'missing', message: 'Business Impact metric not defined', severity: 'critical' }
     * // ]}
     */
    function calculateSmokeDetectors(productData) {
        const triggers = [];
        
        // DETECTOR 1: Downward Metric Trend
        const uxDownward = hasDownwardTrend(productData.monthlyUX);
        const biDownward = hasDownwardTrend(productData.monthlyBI);
        
        if (uxDownward && biDownward) {
            triggers.push({
                type: 'trend',
                message: 'Both UX and BI metrics declining (3+ consecutive months)',
                severity: 'critical'
            });
        } else if (uxDownward) {
            triggers.push({
                type: 'trend',
                message: 'UX metric declining (3+ consecutive months)',
                severity: 'warning'
            });
        } else if (biDownward) {
            triggers.push({
                type: 'trend',
                message: 'Business Impact metric declining (3+ consecutive months)',
                severity: 'warning'
            });
        }
        
        // DETECTOR 2: Lacking Metrics or Data (MECE - Mutually Exclusive)
        // Analyze metric definition and data availability
        const uxMetricDefined = !isInvalid(productData.keyMetricUX);
        const uxHasData = hasAnyValidData(productData.monthlyUX);
        const uxHasTarget = isValidNumber(productData.targetUX);
        
        const biMetricDefined = !isInvalid(productData.keyMetricBI);
        const biHasData = hasAnyValidData(productData.monthlyBI);
        const biHasTarget = isValidNumber(productData.targetBI);
        
        // Categorize each metric into mutually exclusive states
        const uxState = !uxMetricDefined ? 'not-defined' : 
                       !uxHasData ? 'no-data' : 
                       'tracking';
        
        const biState = !biMetricDefined ? 'not-defined' : 
                       !biHasData ? 'no-data' : 
                       'tracking';
        
        // Apply MECE rules: Check combinations from most severe to least
        
        // Rule 1: Both metrics completely missing (not even defined)
        if (uxState === 'not-defined' && biState === 'not-defined') {
            triggers.push({
                type: 'missing',
                message: 'Both UX and Business Impact metrics not defined',
                severity: 'critical'
            });
        }
        // Rule 2: Both metrics defined but neither has data
        else if (uxState === 'no-data' && biState === 'no-data') {
            triggers.push({
                type: 'missing',
                message: 'Both metrics defined but no data tracked for either',
                severity: 'critical'
            });
        }
        // Rule 3: UX not defined (BI may or may not be tracking)
        else if (uxState === 'not-defined') {
            triggers.push({
                type: 'missing',
                message: 'User Experience metric not defined',
                severity: 'warning'
            });
        }
        // Rule 4: BI not defined (UX may or may not be tracking)
        else if (biState === 'not-defined') {
            triggers.push({
                type: 'missing',
                message: 'Business Impact metric not defined',
                severity: 'warning'
            });
        }
        // Rule 5: UX defined but no data (only if BI is tracking, otherwise covered by Rule 2)
        else if (uxState === 'no-data' && biState === 'tracking') {
            if (uxHasTarget) {
                triggers.push({
                    type: 'tracking-gap',
                    message: 'UX target defined but no actual data tracked',
                    severity: 'warning'
                });
            } else {
                triggers.push({
                    type: 'tracking-gap',
                    message: 'UX metric defined but no data tracked',
                    severity: 'warning'
                });
            }
        }
        // Rule 6: BI defined but no data (only if UX is tracking, otherwise covered by Rule 2)
        else if (biState === 'no-data' && uxState === 'tracking') {
            if (biHasTarget) {
                triggers.push({
                    type: 'tracking-gap',
                    message: 'Business Impact target defined but no actual data tracked',
                    severity: 'warning'
                });
            } else {
                triggers.push({
                    type: 'tracking-gap',
                    message: 'Business Impact metric defined but no data tracked',
                    severity: 'warning'
                });
            }
        }
        
        // DETECTOR 3: Maturity Signal
        const maturityStage = (productData.maturity || '').toLowerCase().trim();
        const isDecline = maturityStage.includes('decline') || maturityStage === '4. decline';
        
        if (isDecline) {
            triggers.push({
                type: 'maturity',
                message: 'Product in Decline stage - requires attention',
                severity: 'critical'
            });
        }
        
        // DETECTOR 4: High BAU HC Allocation
        const bauHC = parseFloat(productData.totalBAUHC) || 0;
        if (bauHC > 3) {
            // Round to 1 decimal place, or show as integer if whole number
            const bauHCDisplay = bauHC % 1 === 0 ? Math.round(bauHC) : bauHC.toFixed(1);
            triggers.push({
                type: 'resource',
                message: `High BAU headcount allocation (${bauHCDisplay} FTEs)`,
                severity: 'warning'
            });
        }
        
        return {
            count: triggers.length,
            triggers: triggers
        };
    }

    /**
     * Run smoke detector unit tests
     * For testing/validation purposes
     * Updated to test new structured return format
     */
    function runSmokeDetectorTests() {
        console.log('🧪 Running Smoke Detector Unit Tests...');
        
        let passedTests = 0;
        let totalTests = 0;
        
        const assertEqual = (actual, expected, testName) => {
            totalTests++;
            if (actual === expected) {
                passedTests++;
                console.log(`✅ ${testName}: PASS`);
            } else {
                console.error(`❌ ${testName}: FAIL (expected ${expected}, got ${actual})`);
            }
        };
        
        // Test 1: Product with no issues
        const healthyProduct = {
            keyMetricUX: 'Active Users',
            keyMetricBI: 'Revenue',
            monthlyUX: [80, 85, 90],
            monthlyBI: [100, 105, 110],
            maturity: '3. Mature'
        };
        const result1 = calculateSmokeDetectors(healthyProduct);
        assertEqual(result1.count, 0, 'Healthy product - count');
        assertEqual(result1.triggers.length, 0, 'Healthy product - triggers array');
        
        // Test 2: Missing UX metric
        const missingUX = {
            keyMetricUX: '',
            keyMetricBI: 'Revenue',
            monthlyUX: [],
            monthlyBI: [100],
            maturity: '2. Growth'
        };
        const result2 = calculateSmokeDetectors(missingUX);
        assertEqual(result2.count, 1, 'Missing UX metric - count');
        assertEqual(result2.triggers.length, 1, 'Missing UX metric - triggers array');
        
        // Test 3: Decline stage
        const decliningProduct = {
            keyMetricUX: 'Users',
            keyMetricBI: 'Revenue',
            monthlyUX: [80],
            monthlyBI: [100],
            maturity: '4. Decline'
        };
        const result3 = calculateSmokeDetectors(decliningProduct);
        assertEqual(result3.count, 1, 'Decline stage - count');
        assertEqual(result3.triggers[0].type, 'maturity', 'Decline stage - trigger type');
        
        // Test 4: Downward trend (last 3 months from current date)
        // Create array with declining values in the last 3 months
        const currentMonth = new Date().getMonth();
        const uxData = new Array(12).fill('0'); // Fill with zeros
        const biData = new Array(12).fill('100'); // Fill with valid data
        
        // Set declining trend in last 3 months if we have enough months
        if (currentMonth >= 2) {
            uxData[currentMonth - 2] = '100'; // 3 months ago
            uxData[currentMonth - 1] = '90';  // 2 months ago
            uxData[currentMonth] = '80';      // Current month
        }
        
        const trendingDown = {
            keyMetricUX: 'Users',
            keyMetricBI: 'Revenue',
            monthlyUX: uxData,
            monthlyBI: biData,
            maturity: '3. Mature'
        };
        const result4 = calculateSmokeDetectors(trendingDown);
        
        // Only expect trend alert if we're past February (month 2+)
        if (currentMonth >= 2) {
            assertEqual(result4.count >= 1, true, 'Downward trend - should detect');
            const hasTrendTrigger = result4.triggers.some(t => t.type === 'trend');
            assertEqual(hasTrendTrigger, true, 'Downward trend - has trend trigger');
        } else {
            console.log('⚠️ Skipping trend test - need at least March to test last 3 months');
        }
        
        console.log(`\n🏁 Test Results: ${passedTests}/${totalTests} tests passed`);
        
        return {
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests
        };
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Anomalies = {
        checkAnomalies,
        calculateSmokeDetectors,
        runSmokeDetectorTests
    };
    
    console.log('✅ Data Anomalies module loaded');
    
})();

