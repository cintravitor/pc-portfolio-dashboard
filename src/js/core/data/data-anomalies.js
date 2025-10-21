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
     * Check for downward trend in metrics
     */
    function hasDownwardTrend(monthlyArray) {
        if (!Array.isArray(monthlyArray) || monthlyArray.length < 3) {
            return false;
        }
        
        const validValues = [];
        for (let i = 0; i < monthlyArray.length; i++) {
            if (isValidNumber(monthlyArray[i])) {
                validValues.push({
                    index: i,
                    value: parseFloat(monthlyArray[i])
                });
            }
        }
        
        if (validValues.length < 3) {
            return false;
        }
        
        let consecutiveDeclines = 0;
        for (let i = 1; i < validValues.length; i++) {
            if (validValues[i].value < validValues[i - 1].value) {
                consecutiveDeclines++;
                if (consecutiveDeclines >= 2) {
                    return true;
                }
            } else {
                consecutiveDeclines = 0;
            }
        }
        
        return false;
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
     * Returns count of triggered detectors (0-4)
     */
    function calculateSmokeDetectors(productData) {
        let detectorCount = 0;
        
        // DETECTOR 1: Downward Metric Trend
        const uxDownward = hasDownwardTrend(productData.monthlyUX);
        const biDownward = hasDownwardTrend(productData.monthlyBI);
        
        if (uxDownward || biDownward) {
            detectorCount++;
        }
        
        // DETECTOR 2: Lacking Metrics
        const missingUXMetric = isInvalid(productData.keyMetricUX);
        const missingBIMetric = isInvalid(productData.keyMetricBI);
        
        if (missingUXMetric || missingBIMetric) {
            detectorCount++;
        }
        
        // DETECTOR 3: Maturity Signal
        const maturityStage = (productData.maturity || '').toLowerCase().trim();
        const isDecline = maturityStage.includes('decline') || maturityStage === '4. decline';
        
        if (isDecline) {
            detectorCount++;
        }
        
        // DETECTOR 4: High BAU HC Allocation
        // This would require additional column mapping - placeholder for now
        // In full implementation, check Total HC Allocation > 2
        
        return detectorCount;
    }

    /**
     * Run smoke detector unit tests
     * For testing/validation purposes
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
        assertEqual(calculateSmokeDetectors(healthyProduct), 0, 'Healthy product');
        
        // Test 2: Missing UX metric
        const missingUX = {
            keyMetricUX: '',
            keyMetricBI: 'Revenue',
            monthlyUX: [],
            monthlyBI: [100],
            maturity: '2. Growth'
        };
        assertEqual(calculateSmokeDetectors(missingUX), 1, 'Missing UX metric');
        
        // Test 3: Decline stage
        const decliningProduct = {
            keyMetricUX: 'Users',
            keyMetricBI: 'Revenue',
            monthlyUX: [80],
            monthlyBI: [100],
            maturity: '4. Decline'
        };
        assertEqual(calculateSmokeDetectors(decliningProduct), 1, 'Decline stage');
        
        // Test 4: Downward trend
        const trendingDown = {
            keyMetricUX: 'Users',
            keyMetricBI: 'Revenue',
            monthlyUX: [100, 90, 80],
            monthlyBI: [200],
            maturity: '3. Mature'
        };
        assertEqual(calculateSmokeDetectors(trendingDown), 1, 'Downward trend');
        
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

