/**
 * Data Filtering Module
 * Handles filtering, searching, and sorting of portfolio data
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PUBLIC API ====================
    
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
        
        // Apply Maturity filters (multi-select OR logic)
        if (maturityFilters && maturityFilters.length > 0) {
            filtered = filtered.filter(product => {
                const productMaturity = (product.maturity || '').trim();
                return maturityFilters.includes(productMaturity);
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
            return { areas: [], maturity: [], owners: [] };
        }
        
        const areas = [...new Set(portfolioData.map(p => p.area).filter(Boolean))].sort();
        const maturity = [...new Set(portfolioData.map(p => p.maturity).filter(Boolean))].sort();
        const owners = [...new Set(portfolioData.map(p => p.owner).filter(Boolean))].sort();
        
        return { areas, maturity, owners };
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Filtering = {
        applyFilters,
        sortData,
        getFilterOptions
    };
    
    console.log('✅ Data Filtering module loaded');
    
})();

