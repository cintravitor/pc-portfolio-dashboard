/**
 * Data Analytics Module
 * Handles all analytical calculations including performance, risk, and portfolio metrics
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PUBLIC API ====================
    
    /**
     * Calculate performance vs target for a product
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
     * Returns array of factors affecting portfolio health
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
        
        // Sort by severity (most severe first) and return top 5
        return factors.sort((a, b) => b.severity - a.severity).slice(0, 5);
    }

    /**
     * Calculate comprehensive portfolio metrics for executive view
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
        
        // Convert risk to inverse health contribution
        const riskHealthContribution = ((10 - avgRiskScore) / 10) * 100;
        
        // Composite health score: 60% performance + 40% inverse risk
        const healthScore = Math.round((avgPerformance * 0.6) + (riskHealthContribution * 0.4));
        
        // ===== 2. RISK BREAKDOWN =====
        const riskBreakdown = {
            high: productMetrics.filter(p => p.riskScore >= 7).length,
            medium: productMetrics.filter(p => p.riskScore >= 4 && p.riskScore < 7).length,
            low: productMetrics.filter(p => p.riskScore < 4).length
        };
        
        // ===== 3. TOP RISKS =====
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
        const topOpportunities = productMetrics
            .filter(p => p.performanceScore > 0)
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
        const alignmentByArea = {};
        productMetrics.forEach(p => {
            const area = p.area || 'Not specified';
            alignmentByArea[area] = (alignmentByArea[area] || 0) + 1;
        });
        
        // ===== 6. RESOURCE ALLOCATION BY MATURITY =====
        const allocationByMaturity = {};
        productMetrics.forEach(p => {
            const maturity = p.maturity || 'Not specified';
            allocationByMaturity[maturity] = (allocationByMaturity[maturity] || 0) + 1;
        });
        
        // ===== 7. RESOURCE ALLOCATION BY OWNER =====
        const allocationByOwner = {};
        productMetrics.forEach(p => {
            const owner = p.owner || 'Not assigned';
            allocationByOwner[owner] = (allocationByOwner[owner] || 0) + 1;
        });
        
        const topOwnersByCount = Object.entries(allocationByOwner)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([owner, count]) => ({ owner, count }));
        
        // ===== 8. ADDITIONAL INSIGHTS =====
        const productsAtRisk = productMetrics.filter(p => 
            p.riskScore >= 7 && p.performanceScore < 50
        ).length;
        
        const starPerformers = productMetrics.filter(p => 
            p.riskScore < 4 && p.performanceScore >= 80
        ).length;
        
        const needsAttention = productMetrics.filter(p => 
            p.riskScore >= 5 && p.riskScore < 7
        ).length;
        
        // ===== 9. HEALTH SCORE BREAKDOWN =====
        const healthScoreBreakdown = analyzeHealthFactors(portfolioData, productMetrics);
        
        // ===== 10. RISK & OPPORTUNITY MATRIX DATA =====
        const riskOpportunityData = productMetrics.map(p => ({
            id: p.id,
            name: p.name,
            area: p.area,
            maturity: p.maturity,
            riskScore: p.riskScore,
            performanceScore: p.performanceScore,
            quadrant: getQuadrant(p.riskScore, p.performanceScore)
        }));
        
        // ===== CONSTRUCT RETURN OBJECT =====
        const metrics = {
            // Summary metrics
            healthScore: healthScore,
            healthScoreBreakdown: healthScoreBreakdown,
            totalProducts: portfolioData.length,
            productsWithData: validPerformanceScores.length,
            
            // Risk analysis
            riskBreakdown: riskBreakdown,
            topRisks: topRisks,
            avgRiskScore: Math.round(avgRiskScore * 10) / 10,
            
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
            riskOpportunityData: riskOpportunityData,
            
            // Raw data
            productMetrics: productMetrics
        };
        
        console.log('✅ Portfolio metrics calculated:', {
            healthScore: metrics.healthScore,
            totalProducts: metrics.totalProducts,
            riskBreakdown: metrics.riskBreakdown
        });
        
        return metrics;
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Analytics = {
        calculatePerformanceVsTarget,
        calculateRiskScore,
        analyzePortfolioData,
        getQuadrant,
        analyzeHealthFactors,
        calculatePortfolioMetrics
    };
    
    console.log('✅ Data Analytics module loaded');
    
})();

