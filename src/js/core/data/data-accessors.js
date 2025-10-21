/**
 * Data Accessors Module
 * Provides getter functions for accessing portfolio data
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PRIVATE HELPERS ====================
    
    /**
     * Check if value is invalid
     */
    function isInvalid(val) {
        return !val || val === '' || val === 'N/A' || val === '-';
    }

    /**
     * Check if value is a valid number
     */
    function isValidNumber(val) {
        if (isInvalid(val)) return false;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
    }

    /**
     * Get most recent monthly value
     */
    function getMostRecentValue(monthlyArray) {
        if (!Array.isArray(monthlyArray) || monthlyArray.length === 0) {
            return null;
        }
        
        for (let i = monthlyArray.length - 1; i >= 0; i--) {
            const val = monthlyArray[i];
            if (isValidNumber(val)) {
                return parseFloat(val);
            }
        }
        return null;
    }
    
    // ==================== PUBLIC API ====================
    
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
     * Get statistics for portfolio products
     * @returns {Object} Statistics object
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
     * Count products with missing metrics
     * @returns {Object} Counts of missing UX and BI metrics
     */
    function countMissingMetrics() {
        const portfolioData = window.State.getPortfolioData();
        
        if (!portfolioData || portfolioData.length === 0) {
            return {
                missingUX: 0,
                missingBI: 0
            };
        }
        
        const currentMonth = new Date().getMonth();
        
        let missingUX = 0;
        let missingBI = 0;
        
        portfolioData.forEach(product => {
            // Check UX metric
            const uxMetricName = product.keyMetricUX;
            const uxCurrentMonthValue = product.monthlyUX ? product.monthlyUX[currentMonth] : null;
            
            const uxMetricMissing = isInvalid(uxMetricName);
            const uxValueMissing = isInvalid(uxCurrentMonthValue) || parseFloat(uxCurrentMonthValue) === 0;
            
            if (uxMetricMissing || uxValueMissing) {
                missingUX++;
            }
            
            // Check BI metric
            const biMetricName = product.keyMetricBI;
            const biCurrentMonthValue = product.monthlyBI ? product.monthlyBI[currentMonth] : null;
            
            const biMetricMissing = isInvalid(biMetricName);
            const biValueMissing = isInvalid(biCurrentMonthValue) || parseFloat(biCurrentMonthValue) === 0;
            
            if (biMetricMissing || biValueMissing) {
                missingBI++;
            }
        });
        
        return {
            missingUX: missingUX,
            missingBI: missingBI
        };
    }

    /**
     * Get summary metrics for a product card
     * Returns compact metric status for at-a-glance viewing
     * @param {Object} product - Product object
     * @returns {Object} Summary metrics with status indicators
     */
    function getCardSummaryMetrics(product) {
        // Calculate UX status
        let uxStatus = 'gray';
        const mostRecentUX = getMostRecentValue(product.monthlyUX);
        const targetUX = isValidNumber(product.targetUX) ? parseFloat(product.targetUX) : null;
        
        if (mostRecentUX !== null && targetUX !== null) {
            uxStatus = mostRecentUX >= targetUX ? 'green' : 'red';
        } else if (isInvalid(product.keyMetricUX)) {
            uxStatus = 'gray';
        }
        
        // Calculate BI status
        let biStatus = 'gray';
        const mostRecentBI = getMostRecentValue(product.monthlyBI);
        const targetBI = isValidNumber(product.targetBI) ? parseFloat(product.targetBI) : null;
        
        if (mostRecentBI !== null && targetBI !== null) {
            biStatus = mostRecentBI >= targetBI ? 'green' : 'red';
        } else if (isInvalid(product.keyMetricBI)) {
            biStatus = 'gray';
        }
        
        // Get AI summary
        const getAISummary = window.DataManager.AI ? window.DataManager.AI.getAISummary : null;
        const problem = getAISummary ? 
            getAISummary(product.name, product.problem) : 
            product.problem;
        
        return {
            owner: product.owner || 'Not assigned',
            problem: problem,
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
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Accessors = {
        getPortfolioData,
        getFilteredData,
        getProductById,
        getProductStats,
        countMissingMetrics,
        getCardSummaryMetrics
    };
    
    console.log('✅ Data Accessors module loaded');
    
})();

