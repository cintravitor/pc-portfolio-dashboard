/**
 * Data Filtering Module
 * Handles filtering, searching, and sorting of portfolio data
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PRIVATE HELPERS ====================
    
    /**
     * Helper function to check if a value is invalid/missing
     * @param {*} val - Value to check
     * @returns {boolean} True if invalid
     */
    function isInvalid(val) {
        return !val || val === '' || val === 'N/A' || val === '-';
    }
    
    /**
     * Categorize product into risk level based on unified business rules
     * Combines Risk Score and Smoke Detector count to determine risk category
     * 
     * @see docs/business-rules/RISK_CATEGORIZATION.md for complete rules
     * @param {Object} product - Product object with risk metrics
     * @returns {string|null} - 'critical', 'monitor', 'datagaps', or null
     * 
     * @example
     * const product = { name: 'Portal', maturity: '1. Development', ... };
     * const level = categorizeProductRisk(product);
     * // Returns: 'critical' (Development = +4 risk score >= 7)
     */
    function categorizeProductRisk(product) {
        // Calculate risk score and smoke detector count
        const riskScore = window.DataManager.Analytics.calculateRiskScore(product);
        const smokeCount = window.DataManager.Anomalies.calculateSmokeDetectors(product);
        
        // CRITICAL ISSUES - Urgent intervention required
        // Criteria: Risk score >=7 OR 3+ smoke detectors OR decline + missing metrics
        if (riskScore >= 7 || smokeCount >= 3 || 
            (product.maturity?.includes('Decline') && 
             (isInvalid(product.keyMetricUX) || isInvalid(product.keyMetricBI)))) {
            return 'critical';
        }
        
        // MONITOR CLOSELY - Warning signs present
        // Criteria: Risk score 4-6.9 OR 1-2 smoke detectors
        if ((riskScore >= 4 && riskScore < 7) || (smokeCount >= 1 && smokeCount <= 2)) {
            return 'monitor';
        }
        
        // DATA GAPS - Tracking or governance issues
        // Criteria: Missing metrics, owner, targets, or no tracking
        if (isInvalid(product.keyMetricUX) || isInvalid(product.keyMetricBI) || 
            isInvalid(product.owner) || isInvalid(product.targetUX) || isInvalid(product.targetBI)) {
            return 'datagaps';
        }
        
        return null; // No risk category assigned
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Apply filters to the data
     * @param {string} searchTerm - Search query string
     * @param {Array<string>} areaFilters - Array of selected P&C areas (multi-select)
     * @param {Array<string>} journeyFilters - Array of selected journey stages (multi-select)
     * @param {Array<string>} maturityFilters - Array of selected maturity stages (multi-select)
     * @param {Array<string>} targetUserFilters - Array of selected target users (multi-select)
     * @param {Array<string>} ownerFilters - Array of selected owners (multi-select)
     * @param {string} sortBy - Sort option
     * @param {boolean} belowTargetOnly - Filter for below-target products only
     * @param {string|null} notUpdatedFilter - Current month "Not Updated" filter: 'UX', 'BI', or null
     * @param {string|null} riskLevelFilter - Risk level filter: 'critical', 'monitor', 'datagaps', or null
     * 
     * Multi-select logic: OR within same filter type, AND across different filter types
     * "Not Updated" filter: Applies as primary filter, then multi-select filters apply to subset
     * Example: (Area1 OR Area2) AND (Journey1 OR Journey2) AND (Maturity1 OR Maturity2) AND (TargetUser1 OR TargetUser2) AND (Owner1) AND (NotUpdatedUX) AND (RiskLevel)
     */
    function applyFilters(searchTerm = '', areaFilters = [], journeyFilters = [], maturityFilters = [], targetUserFilters = [], ownerFilters = [], sortBy = '', belowTargetOnly = false, notUpdatedFilter = null, riskLevelFilter = null) {
        // Get portfolio data from State
        const portfolioData = window.State.getPortfolioData();
        
        console.log('🔧 DataManager.applyFilters called:', {
            portfolioDataCount: portfolioData.length,
            areaFilters,
            journeyFilters,
            maturityFilters,
            targetUserFilters,
            ownerFilters,
            searchTerm
        });
        
        if (!portfolioData || portfolioData.length === 0) {
            console.warn('No portfolio data available to filter');
            window.State.setFilteredData([]);
            return [];
        }
        
        let filtered = [...portfolioData];
        
        // Apply search term filter
        if (searchTerm && searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(product => {
                const name = (product.name || '').toLowerCase();
                const problem = (product.problem || '').toLowerCase();
                const solution = (product.solution || '').toLowerCase();
                const owner = (product.owner || '').toLowerCase();
                const area = (product.area || '').toLowerCase();
                
                return name.includes(search) || 
                       problem.includes(search) || 
                       solution.includes(search) ||
                       owner.includes(search) ||
                       area.includes(search);
            });
        }
        
        // Apply P&C Area filters (multi-select OR logic)
        if (areaFilters && areaFilters.length > 0) {
            filtered = filtered.filter(product => {
                const productArea = (product.area || '').trim();
                return areaFilters.includes(productArea);
            });
        }
        
        // Apply Journey Stage filters (multi-select OR logic)
        if (journeyFilters && journeyFilters.length > 0) {
            filtered = filtered.filter(product => {
                const productJourney = (product.journeyMain || '').trim();
                return journeyFilters.includes(productJourney);
            });
        }
        
        // Apply Maturity filters (multi-select OR logic)
        if (maturityFilters && maturityFilters.length > 0) {
            filtered = filtered.filter(product => {
                const productMaturity = (product.maturity || '').trim();
                return maturityFilters.includes(productMaturity);
            });
        }
        
        // Apply Target User filters (multi-select OR logic)
        if (targetUserFilters && targetUserFilters.length > 0) {
            filtered = filtered.filter(product => {
                const productTargetUser = (product.targetUser || '').trim();
                return targetUserFilters.includes(productTargetUser);
            });
        }
        
        // Apply Owner filters (multi-select OR logic)
        if (ownerFilters && ownerFilters.length > 0) {
            filtered = filtered.filter(product => {
                const productOwner = (product.owner || '').trim();
                return ownerFilters.includes(productOwner);
            });
        }
        
        // Apply below-target filter
        if (belowTargetOnly) {
            filtered = filtered.filter(product => {
                const uxMetric = product.keyMetricUX;
                const biMetric = product.keyMetricBI;
                
                if (!uxMetric || !biMetric || uxMetric === 'N/A' || biMetric === 'N/A') {
                    return true; // Include products without metrics (they need attention)
                }
                
                // Get latest monthly values
                const latestUX = product.monthlyUX ? parseFloat(product.monthlyUX[product.monthlyUX.length - 1]) : null;
                const latestBI = product.monthlyBI ? parseFloat(product.monthlyBI[product.monthlyBI.length - 1]) : null;
                const targetUX = parseFloat(product.targetUX);
                const targetBI = parseFloat(product.targetBI);
                
                const uxBelowTarget = !isNaN(latestUX) && !isNaN(targetUX) && latestUX < targetUX;
                const biBelowTarget = !isNaN(latestBI) && !isNaN(targetBI) && latestBI < targetBI;
                
                return uxBelowTarget || biBelowTarget;
            });
        }
        
        // Apply Risk Level filter (if active)
        if (riskLevelFilter) {
            filtered = filtered.filter(product => 
                categorizeProductRisk(product) === riskLevelFilter
            );
        }
        
        // Apply "Not Updated" filter (current month check)
        if (notUpdatedFilter === 'UX' || notUpdatedFilter === 'BI') {
            const currentMonth = new Date().getMonth();
            
            filtered = filtered.filter(product => {
                if (notUpdatedFilter === 'UX') {
                    // Check if UX metric is missing or current month value is empty/zero
                    const uxMetricMissing = !product.keyMetricUX || 
                                           product.keyMetricUX.trim() === '' || 
                                           product.keyMetricUX === 'N/A';
                    
                    if (uxMetricMissing) return true;
                    
                    const currentValue = product.monthlyUX ? product.monthlyUX[currentMonth] : null;
                    return !currentValue || 
                           currentValue === 'N/A' || 
                           currentValue === '' || 
                           currentValue === '0' ||
                           currentValue === '-' ||
                           parseFloat(currentValue) === 0;
                } else {
                    // Check if BI metric is missing or current month value is empty/zero
                    const biMetricMissing = !product.keyMetricBI || 
                                           product.keyMetricBI.trim() === '' || 
                                           product.keyMetricBI === 'N/A';
                    
                    if (biMetricMissing) return true;
                    
                    const currentValue = product.monthlyBI ? product.monthlyBI[currentMonth] : null;
                    return !currentValue || 
                           currentValue === 'N/A' || 
                           currentValue === '' || 
                           currentValue === '0' ||
                           currentValue === '-' ||
                           parseFloat(currentValue) === 0;
                }
            });
        }
        
        // Apply sorting
        if (sortBy) {
            filtered = sortData(filtered, sortBy);
        }
        
        // Store filtered data in State
        window.State.setFilteredData(filtered);
        
        console.log(`Filtered to ${filtered.length} products (from ${portfolioData.length})`);
        
        return filtered;
    }

    /**
     * Sort data by specified criteria
     */
    function sortData(data, sortBy) {
        const sorted = [...data];
        
        switch (sortBy) {
            case 'name-asc':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'name-desc':
                sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            case 'maturity-asc':
                sorted.sort((a, b) => (a.maturity || '').localeCompare(b.maturity || ''));
                break;
            case 'area-asc':
                sorted.sort((a, b) => (a.area || '').localeCompare(b.area || ''));
                break;
            case 'owner-asc':
                sorted.sort((a, b) => (a.owner || '').localeCompare(b.owner || ''));
                break;
            default:
                // No sorting
                break;
        }
        
        return sorted;
    }

    /**
     * Get unique filter options from current data
     */
    function getFilterOptions() {
        const portfolioData = window.State.getPortfolioData();
        
        if (!portfolioData || portfolioData.length === 0) {
            return { areas: [], journeys: [], maturities: [], targetUsers: [], owners: [] };
        }
        
        const areas = [...new Set(portfolioData.map(p => p.area).filter(Boolean))].sort();
        const journeys = [...new Set(portfolioData.map(p => p.journeyMain).filter(Boolean))].sort();
        const maturities = [...new Set(portfolioData.map(p => p.maturity).filter(Boolean))].sort();
        const targetUsers = [...new Set(portfolioData.map(p => p.targetUser).filter(Boolean))].sort();
        const owners = [...new Set(portfolioData.map(p => p.owner).filter(Boolean))].sort();
        
        return { areas, journeys, maturities, targetUsers, owners };
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Filtering = {
        applyFilters,
        sortData,
        getFilterOptions,
        categorizeProductRisk  // Export for use in UI modules
    };
    
    console.log('✅ Data Filtering module loaded');
    
})();

