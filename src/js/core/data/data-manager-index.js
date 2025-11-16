/**
 * Data Manager Index (Coordinator) - Enhanced with Facade Pattern
 * Provides a minimal, event-driven public API while reducing coupling
 * 
 * Architecture Pattern: Facade + Event-Driven
 * - Exposes minimal public API for common operations
 * - Emits events for all data operations (enables loose coupling)
 * - Maintains backward compatibility through sub-module exposure
 * - Reduces direct dependencies from UI layer
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // Verify all sub-modules are loaded
    const requiredModules = [
        'AI',
        'Fetching',
        'Filtering',
        'Analytics',
        'Anomalies',
        'Accessors',
        'Governance'
    ];
    
    const loadedModules = {};
    let allLoaded = true;
    
    requiredModules.forEach(moduleName => {
        const isLoaded = window.DataManager && window.DataManager[moduleName];
        loadedModules[moduleName] = isLoaded;
        if (!isLoaded) {
            console.error(`❌ Data module not loaded: ${moduleName}`);
            allLoaded = false;
        }
    });
    
    if (!allLoaded) {
        console.error('❌ Not all data modules loaded. DataManager may not function correctly.');
        console.log('Module status:', loadedModules);
    }
    
    // ==================== FACADE API (Recommended) ====================
    
    /**
     * Fetch portfolio data from API
     * Emits events: data:fetch:start, data:loaded (success), data:fetch:error (failure)
     * @returns {Promise<Object>} Promise resolving to { portfolioData, columnMapping }
     */
    function fetchData() {
        window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FETCH_START, {
            timestamp: Date.now()
        });
        
        return window.DataManager.Fetching.fetchSheetData()
            .then(result => {
                window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.LOADED, {
                    portfolioData: result.portfolioData,
                    columnMapping: result.columnMapping,
                    timestamp: Date.now()
                });
                return result;
            })
            .catch(error => {
                window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FETCH_ERROR, {
                    error: error.message || String(error),
                    timestamp: Date.now()
                });
                throw error;
            });
    }
    
    /**
     * Apply filters to portfolio data
     * Emits event: data:filtered
     * @param {Object} criteria - Filter criteria object
     * @returns {Array} Filtered data
     */
    function filterData(criteria) {
        const {
            searchTerm = '',
            areaFilters = [],
            journeyFilters = [],
            maturityFilters = [],
            targetUserFilters = [],
            ownerFilters = [],
            sortBy = '',
            belowTargetOnly = false,
            notUpdatedFilter = null,
            riskLevelFilter = null
        } = criteria;
        
        const filteredData = window.DataManager.Filtering.applyFilters(
            searchTerm,
            areaFilters,
            journeyFilters,
            maturityFilters,
            targetUserFilters,
            ownerFilters,
            sortBy,
            belowTargetOnly,
            notUpdatedFilter,
            riskLevelFilter
        );
        
        window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FILTERED, {
            filteredData,
            filters: criteria,
            count: filteredData.length,
            timestamp: Date.now()
        });
        
        return filteredData;
    }
    
    /**
     * Fetch governance data from API
     * Emits event: data:governance:loaded
     * @returns {Promise<Object>} Promise resolving to governance data
     */
    function fetchGovernance() {
        return window.DataManager.Fetching.fetchGovernanceData()
            .then(governanceData => {
                window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.GOVERNANCE_LOADED, {
                    governanceData,
                    timestamp: Date.now()
                });
                return governanceData;
            })
            .catch(error => {
                window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FETCH_ERROR, {
                    error: error.message || String(error),
                    context: 'governance',
                    timestamp: Date.now()
                });
                throw error;
            });
    }
    
    /**
     * Get filtered portfolio data (read-only accessor)
     * @returns {Array} Filtered data from state
     */
    function getFilteredData() {
        return window.DataManager.Accessors.getFilteredData();
    }
    
    /**
     * Get all portfolio data (read-only accessor)
     * @returns {Array} Complete portfolio data from state
     */
    function getPortfolioData() {
        return window.DataManager.Accessors.getPortfolioData();
    }
    
    /**
     * Get product by ID
     * @param {string|number} productId - Product identifier
     * @returns {Object|null} Product object or null if not found
     */
    function getProductById(productId) {
        return window.DataManager.Accessors.getProductById(productId);
    }
    
    /**
     * Get summary metrics for current filtered data
     * @returns {Object} Summary metrics
     */
    function getSummaryMetrics() {
        return window.DataManager.Accessors.getCardSummaryMetrics();
    }
    
    // ==================== NEW FACADE METHODS (Phase 1 Event Migration) ====================
    
    /**
     * Calculate governance metrics for given data
     * Facade method to reduce direct sub-module coupling
     * @param {Array} data - Portfolio data to analyze
     * @returns {Object} Governance metrics
     */
    function calculateGovernanceMetrics(data) {
        return window.DataManager.Governance.calculateAll(data);
    }
    
    /**
     * Categorize product risk level
     * Facade method to reduce direct sub-module coupling
     * @param {Object} product - Product to categorize
     * @returns {string} Risk level: 'critical', 'monitor', or 'healthy'
     */
    function categorizeRisk(product) {
        return window.DataManager.Filtering.categorizeProductRisk(product);
    }
    
    /**
     * Detect anomalies in portfolio data
     * Facade method to reduce direct sub-module coupling
     * @returns {Object} Anomaly report
     */
    function detectAnomalies() {
        return window.DataManager.Anomalies.checkAnomalies();
    }
    
    /**
     * Get portfolio-wide metrics
     * Facade method to reduce direct sub-module coupling
     * @returns {Object} Portfolio metrics
     */
    function getPortfolioMetrics() {
        return window.DataManager.Analytics.calculatePortfolioMetrics();
    }
    
    /**
     * Analyze portfolio data for insights
     * Facade method to reduce direct sub-module coupling
     * @param {Array} data - Portfolio data to analyze
     * @returns {Object} Analysis results
     */
    function analyzePortfolio(data) {
        return window.DataManager.Analytics.analyzePortfolioData(data);
    }
    
    // ==================== PUBLIC FACADE API ====================
    
    const facadeAPI = {
        // ==================== FACADE METHODS (Recommended - Event-Driven) ====================
        // These are the primary methods that should be used by UI modules
        fetchData,           // Fetch portfolio data with events
        filterData,          // Filter data with events
        fetchGovernance,     // Fetch governance data with events
        getFilteredData,     // Read-only accessor
        getPortfolioData,    // Read-only accessor
        getProductById,      // Read-only accessor
        getSummaryMetrics,   // Read-only accessor
        
        // New Phase 1 facade methods (reduce coupling)
        calculateGovernanceMetrics,  // Governance calculation
        categorizeRisk,              // Risk categorization
        detectAnomalies,             // Anomaly detection
        getPortfolioMetrics,         // Portfolio metrics
        analyzePortfolio,            // Portfolio analysis
        
        // ==================== SUB-MODULES (Backward Compatibility) ====================
        // Direct access to sub-modules for backward compatibility
        // New code should use facade methods above instead
        AI: window.DataManager.AI,
        Fetching: window.DataManager.Fetching,
        Filtering: window.DataManager.Filtering,
        Analytics: window.DataManager.Analytics,
        Anomalies: window.DataManager.Anomalies,
        Accessors: window.DataManager.Accessors,
        Governance: window.DataManager.Governance,
        
        // ==================== DIRECT METHOD EXPOSURE (Legacy Compatibility) ====================
        // These are exposed for backward compatibility with existing code
        // Gradually migrate to using facade methods or event subscriptions
        getAISummary: window.DataManager.AI?.getAISummary,
        fetchSheetData: window.DataManager.Fetching?.fetchSheetData,
        fetchGovernanceData: window.DataManager.Fetching?.fetchGovernanceData,
        fetchAllDataParallel: window.DataManager.Fetching?.fetchAllDataParallel,
        prefetchGovernanceData: window.DataManager.Fetching?.prefetchGovernanceData,
        getCachedGovernanceData: window.DataManager.Fetching?.getCachedGovernanceData,
        cacheData: window.DataManager.Fetching?.cacheData,
        loadCachedData: window.DataManager.Fetching?.loadCachedData,
        updateLastFetchTime: window.DataManager.Fetching?.updateLastFetchTime,
        getLastUpdateTime: window.DataManager.Fetching?.getLastUpdateTime,
        shouldRefreshData: window.DataManager.Fetching?.shouldRefreshData,
        applyFilters: window.DataManager.Filtering?.applyFilters,
        sortData: window.DataManager.Filtering?.sortData,
        getFilterOptions: window.DataManager.Filtering?.getFilterOptions,
        calculatePerformanceVsTarget: window.DataManager.Analytics?.calculatePerformanceVsTarget,
        calculateRiskScore: window.DataManager.Analytics?.calculateRiskScore,
        analyzePortfolioData: window.DataManager.Analytics?.analyzePortfolioData,
        getQuadrant: window.DataManager.Analytics?.getQuadrant,
        analyzeHealthFactors: window.DataManager.Analytics?.analyzeHealthFactors,
        calculatePortfolioMetrics: window.DataManager.Analytics?.calculatePortfolioMetrics,
        checkAnomalies: window.DataManager.Anomalies?.checkAnomalies,
        calculateSmokeDetectors: window.DataManager.Anomalies?.calculateSmokeDetectors,
        runSmokeDetectorTests: window.DataManager.Anomalies?.runSmokeDetectorTests,
        getProductStats: window.DataManager.Accessors?.getProductStats,
        countMissingMetrics: window.DataManager.Accessors?.countMissingMetrics,
        getCardSummaryMetrics: window.DataManager.Accessors?.getCardSummaryMetrics,
        calculateFilteredSummaryMetrics: window.DataManager.Accessors?.calculateFilteredSummaryMetrics,
        
        // ==================== UTILITY METHODS ====================
        debounce: window.Utils ? window.Utils.debounce : null
    };
    
    // Replace DataManager with facade-enhanced interface
    window.DataManager = Object.assign({}, window.DataManager, facadeAPI);
    
})();

