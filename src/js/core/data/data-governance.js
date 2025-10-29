/**
 * Data Governance Module
 * Client-side governance metric calculations for real-time filtering
 * 
 * Ports all Apps Script governance calculations to JavaScript for instant
 * client-side recalculation when filters change on the Insights tab.
 * 
 * Part of modular data architecture refactor (Phase 3)
 * @module data-governance
 */

(function() {
    'use strict';
    
    // ==================== MAIN CALCULATION ORCHESTRATOR ====================
    
    /**
     * Calculate all governance metrics from portfolio data
     * This is the main entry point that returns the complete governance object
     * 
     * @param {Array} portfolioData - Array of portfolio solutions
     * @returns {Object} Complete governance data matching backend structure
     */
    function calculateAll(portfolioData) {
        if (!portfolioData || !Array.isArray(portfolioData) || portfolioData.length === 0) {
            console.warn('No portfolio data provided to calculateAll');
            return getEmptyGovernanceData();
        }
        
        console.log(`🔢 Calculating governance metrics for ${portfolioData.length} solutions...`);
        
        const startTime = performance.now();
        
        const governanceData = {
            smokeDetectors: calculateSmokeDetectors(portfolioData),
            bauAnomalies: calculateBAUAnomalies(portfolioData),
            dataHealth: calculateDataHealth(portfolioData),
            ptechInvolvement: calculatePTechInvolvement(portfolioData),
            teamConsumption: calculateTeamConsumption(portfolioData),
            performanceMetrics: calculatePerformanceMetrics(portfolioData),
            strategicGaps: calculateStrategicGaps(portfolioData),
            metricsCoverage: calculateMetricsCoverage(portfolioData),
            portfolioDistribution: calculatePortfolioDistribution(portfolioData),
            ptechByArea: calculatePTechByArea(portfolioData),
            bauDedication: calculateBAUDedication(portfolioData),
            timestamp: new Date().toISOString()
        };
        
        const endTime = performance.now();
        console.log(`✅ Governance calculation completed in ${(endTime - startTime).toFixed(2)}ms`);
        
        return governanceData;
    }
    
    /**
     * Get empty governance data structure (fallback)
     * @returns {Object} Empty governance data with zero values
     */
    function getEmptyGovernanceData() {
        return {
            smokeDetectors: { count: 0, triggered: [] },
            bauAnomalies: { high: [], flagged: [], normal: [], summary: { highCount: 0, flaggedCount: 0, normalCount: 0 } },
            dataHealth: { totalSolutions: 0, missingUX: 0, missingBI: 0, missingOwner: 0, missingMetrics: 0, healthScore: 0 },
            ptechInvolvement: { withPTech: 0, withoutPTech: 0, ptechSolutions: [], percentage: 0 },
            teamConsumption: [],
            performanceMetrics: { ux: { aboveTarget: 0, belowTarget: 0, noData: 0, achievementRate: 0, samples: [] }, bi: { withData: 0, noData: 0, samples: [] } },
            strategicGaps: { byArea: [], byMaturity: [] },
            metricsCoverage: { totalSolutions: 0, ux: {}, bi: {} },
            portfolioDistribution: { byJourney: [], byTargetUser: [], byPlatform: [], regulatory: { yes: 0, no: 0, yesPercent: 0, noPercent: 0 } },
            ptechByArea: [],
            bauDedication: { topSolutions: [], totalHours: 0, totalHC: 0 },
            timestamp: new Date().toISOString()
        };
    }
    
    // ==================== SMOKE DETECTORS ====================
    
    /**
     * Calculate Smoke Detectors Summary
     * Identifies solutions that trigger warning signals
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} Smoke detector summary with count and details
     */
    function calculateSmokeDetectors(portfolioData) {
        const triggered = [];
        let totalCount = 0;
        
        portfolioData.forEach(solution => {
            const detectorTypes = [];
            
            // Detector 1: Missing Key Metrics
            const uxMetric = solution.keyMetricUX;
            const biMetric = solution.keyMetricBI;
            if (!uxMetric || uxMetric === '' || uxMetric === 'N/A' || !biMetric || biMetric === '' || biMetric === 'N/A') {
                detectorTypes.push('Lacking Metrics');
            }
            
            // Detector 2: Decline Stage
            const maturity = solution.maturity || '';
            if (maturity.includes('Decline')) {
                detectorTypes.push('Maturity: Decline Stage');
            }
            
            // If any detector triggered, add to list
            if (detectorTypes.length > 0) {
                triggered.push({
                    name: solution.name,
                    triggers: detectorTypes,
                    primaryTrigger: detectorTypes[0]
                });
                totalCount++;
            }
        });
        
        return {
            count: totalCount,
            triggered: triggered.slice(0, 20) // Limit to top 20 for performance
        };
    }
    
    // ==================== BAU ANOMALIES ====================
    
    /**
     * Calculate BAU Allocation Anomalies
     * Identifies solutions with high BAU hour allocations
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} BAU anomalies categorized by severity
     */
    function calculateBAUAnomalies(portfolioData) {
        const high = []; // >=3800 hrs
        const flagged = []; // 1900-3799 hrs
        const normal = []; // <1900 hrs
        
        portfolioData.forEach(solution => {
            const totalHours = parseFloat(solution.totalBAUHours) || 0;
            
            const item = {
                name: solution.name,
                hours: totalHours
            };
            
            if (totalHours >= 3800) {
                high.push(item);
            } else if (totalHours >= 1900) {
                flagged.push(item);
            } else if (totalHours > 0) {
                normal.push(item);
            }
        });
        
        // Sort by hours descending
        high.sort((a, b) => b.hours - a.hours);
        flagged.sort((a, b) => b.hours - a.hours);
        
        return {
            high: high.slice(0, 15),
            flagged: flagged.slice(0, 15),
            normal: normal.slice(0, 10),
            summary: {
                highCount: high.length,
                flaggedCount: flagged.length,
                normalCount: normal.length
            }
        };
    }
    
    // ==================== DATA HEALTH ====================
    
    /**
     * Calculate Data Health Metrics
     * Counts solutions with missing or incomplete data
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} Data health statistics
     */
    function calculateDataHealth(portfolioData) {
        let missingUX = 0;
        let missingBI = 0;
        let missingOwner = 0;
        let totalSolutions = portfolioData.length;
        
        portfolioData.forEach(solution => {
            const uxMetric = solution.keyMetricUX;
            const biMetric = solution.keyMetricBI;
            const owner = solution.owner;
            
            if (!uxMetric || uxMetric === '' || uxMetric === 'N/A') missingUX++;
            if (!biMetric || biMetric === '' || biMetric === 'N/A') missingBI++;
            if (!owner || owner === '' || owner === 'N/A') missingOwner++;
        });
        
        const healthScore = Math.round((1 - ((missingUX + missingBI) / (totalSolutions * 2))) * 100);
        
        return {
            totalSolutions,
            missingUX,
            missingBI,
            missingOwner,
            missingMetrics: missingUX + missingBI,
            healthScore
        };
    }
    
    // ==================== PTECH INVOLVEMENT ====================
    
    /**
     * Calculate PTech Involvement Distribution
     * Groups solutions by People Tech team involvement
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} PTech involvement statistics
     */
    function calculatePTechInvolvement(portfolioData) {
        let withPTech = 0;
        let withoutPTech = 0;
        const ptechSolutions = [];
        
        portfolioData.forEach(solution => {
            // Check both field names for compatibility
            const ptechFlag = solution.ptechFlag || solution.ptechInvolvement;
            
            if (ptechFlag === true || ptechFlag === 'TRUE' || ptechFlag === 'YES' || ptechFlag === 'Yes') {
                withPTech++;
                ptechSolutions.push(solution.name);
            } else {
                withoutPTech++;
            }
        });
        
        const total = withPTech + withoutPTech;
        
        return {
            withPTech,
            withoutPTech,
            ptechSolutions: ptechSolutions.slice(0, 20),
            percentage: total > 0 ? Math.round((withPTech / total) * 100) : 0
        };
    }
    
    // ==================== TEAM CONSUMPTION ====================
    
    /**
     * Calculate Team Consumption by BAU Hours
     * Sums hours allocated to each team (PJC, PATO, TA, HRBP, PSE)
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Array} Team consumption ranked by hours
     */
    function calculateTeamConsumption(portfolioData) {
        const teams = {
            'PJC': 0,
            'PATO': 0,
            'Talent Acquisition': 0,
            'HRBP': 0,
            'PSE': 0
        };
        
        portfolioData.forEach(solution => {
            teams['PJC'] += parseFloat(solution.bauPJC) || 0;
            teams['PATO'] += parseFloat(solution.bauPATO) || 0;
            teams['Talent Acquisition'] += parseFloat(solution.bauTA) || 0;
            teams['HRBP'] += parseFloat(solution.bauHRBP) || 0;
            teams['PSE'] += parseFloat(solution.bauPSE) || 0;
        });
        
        // Convert to array and sort by hours descending
        const teamArray = Object.entries(teams).map(([name, hours]) => ({
            team: name,
            hours: Math.round(hours),
            fte: (hours / 1900).toFixed(2)
        }));
        
        teamArray.sort((a, b) => b.hours - a.hours);
        
        return teamArray;
    }
    
    // ==================== PERFORMANCE METRICS ====================
    
    /**
     * Calculate Performance Metrics
     * Gets current month UX and BI metrics vs targets
     * 
     * NEW LOGIC: Solutions without targets are considered as NOT achieving
     * This provides realistic portfolio health visibility
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} Performance metrics summary
     */
    function calculatePerformanceMetrics(portfolioData) {
        let uxAboveTarget = 0;
        let uxBelowTarget = 0;
        let uxNoData = 0;
        let biAboveTarget = 0;
        let biBelowTarget = 0;
        let biNoData = 0;
        
        const uxSamples = [];
        const biSamples = [];
        
        // Get current month (0-based: Oct = 9)
        const currentMonth = new Date().getMonth();
        
        portfolioData.forEach(solution => {
            // UX Metrics
            const uxMetric = solution.keyMetricUX;
            const uxTarget = parseFloat(solution.targetUX);
            const monthlyUX = solution.monthlyUX;
            const currentMonthUX = monthlyUX && monthlyUX[currentMonth] ? parseFloat(monthlyUX[currentMonth]) : null;
            
            if (uxMetric && uxMetric !== 'N/A' && currentMonthUX !== null && !isNaN(currentMonthUX) && !isNaN(uxTarget)) {
                if (currentMonthUX >= uxTarget) {
                    uxAboveTarget++;
                    uxSamples.push({ name: solution.name, value: currentMonthUX, target: uxTarget, status: 'above' });
                } else {
                    uxBelowTarget++;
                    uxSamples.push({ name: solution.name, value: currentMonthUX, target: uxTarget, status: 'below' });
                }
            } else {
                uxNoData++;
            }
            
            // BI Metrics - NOW WITH TARGET ACHIEVEMENT CALCULATION (same logic as UX)
            const biMetric = solution.keyMetricBI;
            const biTarget = parseFloat(solution.targetBI);
            const monthlyBI = solution.monthlyBI;
            const currentMonthBI = monthlyBI && monthlyBI[currentMonth] ? parseFloat(monthlyBI[currentMonth]) : null;
            
            if (biMetric && biMetric !== 'N/A' && currentMonthBI !== null && !isNaN(currentMonthBI) && !isNaN(biTarget)) {
                if (currentMonthBI >= biTarget) {
                    biAboveTarget++;
                    biSamples.push({ name: solution.name, value: currentMonthBI, target: biTarget, status: 'above' });
                } else {
                    biBelowTarget++;
                    biSamples.push({ name: solution.name, value: currentMonthBI, target: biTarget, status: 'below' });
                }
            } else {
                biNoData++;
            }
        });
        
        // NEW CALCULATION: Use total solutions (not just those with data/targets)
        // Solutions without targets are counted as NOT achieving
        const totalSolutions = portfolioData.length;
        const uxAchievementRate = totalSolutions > 0 ? Math.round((uxAboveTarget / totalSolutions) * 100) : 0;
        const biAchievementRate = totalSolutions > 0 ? Math.round((biAboveTarget / totalSolutions) * 100) : 0;
        
        return {
            ux: {
                aboveTarget: uxAboveTarget,
                belowTarget: uxBelowTarget,
                noData: uxNoData,
                achievementRate: uxAchievementRate,
                samples: uxSamples.slice(0, 10)
            },
            bi: {
                aboveTarget: biAboveTarget,
                belowTarget: biBelowTarget,
                noData: biNoData,
                achievementRate: biAchievementRate,
                samples: biSamples.slice(0, 10)
            }
        };
    }
    
    // ==================== STRATEGIC GAPS ====================
    
    /**
     * Calculate Strategic Gaps and Distribution
     * Analyzes portfolio distribution by area and maturity
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} Strategic distribution data
     */
    function calculateStrategicGaps(portfolioData) {
        const byArea = {};
        const byMaturity = {};
        
        portfolioData.forEach(solution => {
            const area = solution.area || 'Unspecified';
            const maturity = solution.maturity || 'Unspecified';
            
            byArea[area] = (byArea[area] || 0) + 1;
            byMaturity[maturity] = (byMaturity[maturity] || 0) + 1;
        });
        
        // Convert to arrays
        const areaDistribution = Object.entries(byArea).map(([name, count]) => ({ name, count }));
        const maturityDistribution = Object.entries(byMaturity).map(([name, count]) => ({ name, count }));
        
        // Sort by count
        areaDistribution.sort((a, b) => b.count - a.count);
        maturityDistribution.sort((a, b) => b.count - a.count);
        
        return {
            byArea: areaDistribution,
            byMaturity: maturityDistribution
        };
    }
    
    // ==================== METRICS COVERAGE ====================
    
    /**
     * Calculate Metrics Coverage Statistics
     * Tracks UX/BI metric definition, data freshness, and automation
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} Metrics coverage statistics including automation percentages
     * 
     * @property {Object} ux - UX metrics coverage
     * @property {number} ux.automated - Count of solutions with automated UX extraction
     * @property {number} ux.automatedPercent - Percentage of automated UX extraction (0-100)
     * @property {Object} bi - BI metrics coverage  
     * @property {number} bi.automated - Count of solutions with automated BI extraction
     * @property {number} bi.automatedPercent - Percentage of automated BI extraction (0-100)
     * 
     * @performance Target: <50ms for 100 solutions
     */
    function calculateMetricsCoverage(portfolioData) {
        let totalSolutions = portfolioData.length;
        let uxMetricDefined = 0;
        let uxCurrentMonthFilled = 0;
        let uxReachedTarget = 0;
        let uxAutomated = 0;
        let biMetricDefined = 0;
        let biCurrentMonthFilled = 0;
        let biReachedTarget = 0;
        let biAutomated = 0;
        
        // Get current month (0-based)
        const currentMonth = new Date().getMonth();
        
        portfolioData.forEach(solution => {
            // UX Metrics
            const uxMetric = solution.keyMetricUX;
            if (uxMetric && uxMetric !== '' && uxMetric !== 'N/A') {
                uxMetricDefined++;
                
                const monthlyUX = solution.monthlyUX;
                if (monthlyUX && monthlyUX[currentMonth]) {
                    const currentMonthValue = parseFloat(monthlyUX[currentMonth]);
                    if (!isNaN(currentMonthValue) && currentMonthValue !== 0) {
                        uxCurrentMonthFilled++;
                        
                        const target = parseFloat(solution.targetUX);
                        if (!isNaN(target) && currentMonthValue >= target) {
                            uxReachedTarget++;
                        }
                    }
                }
            }
            
            // BI Metrics
            const biMetric = solution.keyMetricBI;
            if (biMetric && biMetric !== '' && biMetric !== 'N/A') {
                biMetricDefined++;
                
                const monthlyBI = solution.monthlyBI;
                if (monthlyBI && monthlyBI[currentMonth]) {
                    const currentMonthValue = parseFloat(monthlyBI[currentMonth]);
                    if (!isNaN(currentMonthValue) && currentMonthValue !== 0) {
                        biCurrentMonthFilled++;
                    }
                }
            }
            
            // UX Automation check
            const uxAutomationStatus = (solution.uxAutomation || '').toLowerCase();
            if (uxAutomationStatus === 'automated') {
                uxAutomated++;
            }
            
            // BI Automation check
            const biAutomationStatus = (solution.biAutomation || '').toLowerCase();
            if (biAutomationStatus === 'automated') {
                biAutomated++;
            }
        });
        
        return {
            totalSolutions,
            ux: {
                metricDefined: uxMetricDefined,
                metricDefinedPercent: Math.round((uxMetricDefined / totalSolutions) * 100),
                currentMonthFilled: uxCurrentMonthFilled,
                currentMonthFilledPercent: Math.round((uxCurrentMonthFilled / totalSolutions) * 100),
                reachedTarget: uxReachedTarget,
                reachedTargetPercent: uxMetricDefined > 0 ? Math.round((uxReachedTarget / uxMetricDefined) * 100) : 0,
                automated: uxAutomated,
                automatedPercent: uxMetricDefined > 0 ? Math.round((uxAutomated / uxMetricDefined) * 100) : 0
            },
            bi: {
                metricDefined: biMetricDefined,
                metricDefinedPercent: Math.round((biMetricDefined / totalSolutions) * 100),
                currentMonthFilled: biCurrentMonthFilled,
                currentMonthFilledPercent: biMetricDefined > 0 ? Math.round((biCurrentMonthFilled / biMetricDefined) * 100) : null,
                reachedTarget: biReachedTarget,
                reachedTargetPercent: biMetricDefined > 0 ? Math.round((biReachedTarget / biMetricDefined) * 100) : 0,
                automated: biAutomated,
                automatedPercent: biMetricDefined > 0 ? Math.round((biAutomated / biMetricDefined) * 100) : 0
            }
        };
    }
    
    // ==================== PORTFOLIO DISTRIBUTION ====================
    
    /**
     * Calculate Portfolio Distribution
     * Analyzes distribution by journey, target user, platform, and regulatory
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} Portfolio distribution statistics
     */
    function calculatePortfolioDistribution(portfolioData) {
        const byJourney = {};
        const byTargetUser = {};
        const byPlatform = {};
        let regulatoryCount = 0;
        let nonRegulatoryCount = 0;
        
        portfolioData.forEach(solution => {
            // Journey stages (main and collateral)
            const journeyMain = solution.journeyMain;
            const journeyCollateral = solution.journeyCollateral;
            
            if (journeyMain && journeyMain !== '' && journeyMain !== 'N/A') {
                byJourney[journeyMain] = (byJourney[journeyMain] || 0) + 1;
            }
            if (journeyCollateral && journeyCollateral !== '' && journeyCollateral !== 'N/A' && journeyCollateral !== journeyMain) {
                byJourney[journeyCollateral] = (byJourney[journeyCollateral] || 0) + 1;
            }
            
            // Target user
            const targetUser = solution.targetUser || 'Unspecified';
            byTargetUser[targetUser] = (byTargetUser[targetUser] || 0) + 1;
            
            // Platform
            const platform = solution.platform || 'Unspecified';
            byPlatform[platform] = (byPlatform[platform] || 0) + 1;
            
            // Regulatory
            const regulatory = (solution.regulatory || '').toString().toLowerCase();
            if (regulatory.includes('yes')) {
                regulatoryCount++;
            } else {
                nonRegulatoryCount++;
            }
        });
        
        // Convert to arrays and sort
        const journeyDistribution = Object.entries(byJourney).map(([name, count]) => ({ name, count }));
        journeyDistribution.sort((a, b) => b.count - a.count);
        
        const targetUserDistribution = Object.entries(byTargetUser).map(([name, count]) => ({ name, count }));
        targetUserDistribution.sort((a, b) => b.count - a.count);
        
        const platformDistribution = Object.entries(byPlatform).map(([name, count]) => ({ name, count }));
        platformDistribution.sort((a, b) => b.count - a.count);
        
        const totalSolutions = regulatoryCount + nonRegulatoryCount;
        
        return {
            byJourney: journeyDistribution,
            byTargetUser: targetUserDistribution,
            byPlatform: platformDistribution,
            regulatory: {
                yes: regulatoryCount,
                no: nonRegulatoryCount,
                yesPercent: Math.round((regulatoryCount / totalSolutions) * 100),
                noPercent: Math.round((nonRegulatoryCount / totalSolutions) * 100)
            }
        };
    }
    
    // ==================== PTECH BY AREA ====================
    
    /**
     * Calculate PTech Involvement by P&C Area
     * Shows which areas have more PTech involvement
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Array} PTech involvement statistics by area
     */
    function calculatePTechByArea(portfolioData) {
        const areaStats = {};
        
        portfolioData.forEach(solution => {
            const area = solution.area || 'Unspecified';
            // Check both field names for compatibility
            const ptechFlag = solution.ptechFlag || solution.ptechInvolvement;
            const hasPTech = ptechFlag === true || ptechFlag === 'TRUE' || ptechFlag === 'YES' || ptechFlag === 'Yes';
            
            if (!areaStats[area]) {
                areaStats[area] = { total: 0, withPTech: 0, withoutPTech: 0 };
            }
            
            areaStats[area].total++;
            if (hasPTech) {
                areaStats[area].withPTech++;
            } else {
                areaStats[area].withoutPTech++;
            }
        });
        
        // Convert to array and calculate percentages
        const ptechByArea = Object.entries(areaStats).map(([area, stats]) => ({
            area,
            total: stats.total,
            withPTech: stats.withPTech,
            withoutPTech: stats.withoutPTech,
            percentWithPTech: Math.round((stats.withPTech / stats.total) * 100)
        }));
        
        // Sort by total descending
        ptechByArea.sort((a, b) => b.total - a.total);
        
        return ptechByArea;
    }
    
    // ==================== BAU DEDICATION ====================
    
    /**
     * Calculate BAU Dedication (Top Solutions by Hours)
     * Identifies solutions with highest BAU allocations
     * 
     * @param {Array} portfolioData - Portfolio solutions
     * @returns {Object} BAU dedication statistics
     */
    function calculateBAUDedication(portfolioData) {
        const solutions = [];
        
        portfolioData.forEach(solution => {
            const hours = parseFloat(solution.totalBAUHours) || 0;
            const hc = parseFloat(solution.totalBAUHC) || 0;
            
            if (hours > 0) {
                solutions.push({
                    name: solution.name,
                    hoursPerYear: Math.round(hours),
                    fullyDedicatedHC: parseFloat(hc.toFixed(2))
                });
            }
        });
        
        // Sort by hours descending
        solutions.sort((a, b) => b.hoursPerYear - a.hoursPerYear);
        
        return {
            topSolutions: solutions.slice(0, 20),
            totalHours: solutions.reduce((sum, s) => sum + s.hoursPerYear, 0),
            totalHC: solutions.reduce((sum, s) => sum + s.fullyDedicatedHC, 0)
        };
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Governance = {
        calculateAll,
        calculateSmokeDetectors,
        calculateBAUAnomalies,
        calculateDataHealth,
        calculatePTechInvolvement,
        calculateTeamConsumption,
        calculatePerformanceMetrics,
        calculateStrategicGaps,
        calculateMetricsCoverage,
        calculatePortfolioDistribution,
        calculatePTechByArea,
        calculateBAUDedication
    };
    
    console.log('✅ Data Governance module loaded');
    
})();

