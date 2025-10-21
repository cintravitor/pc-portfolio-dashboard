/**
 * Data Manager Index (Coordinator)
 * Unifies all data modules under a single DataManager interface
 * 
 * This module consolidates the modular data architecture into a single API
 * for backward compatibility and ease of use.
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
        'Accessors'
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
    
    // Consolidate all sub-modules into unified DataManager interface
    const unifiedDataManager = {
        // ====================  AI Module ====================
        getAISummary: window.DataManager.AI?.getAISummary,
        
        // ==================== Fetching Module ====================
        fetchSheetData: window.DataManager.Fetching?.fetchSheetData,
        fetchGovernanceData: window.DataManager.Fetching?.fetchGovernanceData,
        cacheData: window.DataManager.Fetching?.cacheData,
        loadCachedData: window.DataManager.Fetching?.loadCachedData,
        updateLastFetchTime: window.DataManager.Fetching?.updateLastFetchTime,
        getLastUpdateTime: window.DataManager.Fetching?.getLastUpdateTime,
        shouldRefreshData: window.DataManager.Fetching?.shouldRefreshData,
        
        // ==================== Filtering Module ====================
        applyFilters: window.DataManager.Filtering?.applyFilters,
        sortData: window.DataManager.Filtering?.sortData,
        getFilterOptions: window.DataManager.Filtering?.getFilterOptions,
        
        // ==================== Analytics Module ====================
        calculatePerformanceVsTarget: window.DataManager.Analytics?.calculatePerformanceVsTarget,
        calculateRiskScore: window.DataManager.Analytics?.calculateRiskScore,
        analyzePortfolioData: window.DataManager.Analytics?.analyzePortfolioData,
        getQuadrant: window.DataManager.Analytics?.getQuadrant,
        analyzeHealthFactors: window.DataManager.Analytics?.analyzeHealthFactors,
        calculatePortfolioMetrics: window.DataManager.Analytics?.calculatePortfolioMetrics,
        
        // ==================== Anomalies Module ====================
        checkAnomalies: window.DataManager.Anomalies?.checkAnomalies,
        calculateSmokeDetectors: window.DataManager.Anomalies?.calculateSmokeDetectors,
        runSmokeDetectorTests: window.DataManager.Anomalies?.runSmokeDetectorTests,
        
        // ==================== Accessors Module ====================
        getPortfolioData: window.DataManager.Accessors?.getPortfolioData,
        getFilteredData: window.DataManager.Accessors?.getFilteredData,
        getProductById: window.DataManager.Accessors?.getProductById,
        getProductStats: window.DataManager.Accessors?.getProductStats,
        countMissingMetrics: window.DataManager.Accessors?.countMissingMetrics,
        getCardSummaryMetrics: window.DataManager.Accessors?.getCardSummaryMetrics,
        
        // ==================== Legacy Compatibility ====================
        // Utility reference for backward compatibility
        debounce: window.Utils ? window.Utils.debounce : null
    };
    
    // Replace DataManager with unified interface
    window.DataManager = Object.assign({}, window.DataManager, unifiedDataManager);
    
    console.log('✅ Data Manager Index loaded - Unified API active');
    console.log('📊 Data Manager Modules:', loadedModules);
    
    // Log API summary
    const apiCount = Object.keys(unifiedDataManager).filter(key => typeof unifiedDataManager[key] === 'function').length;
    console.log(`📦 DataManager API: ${apiCount} functions available`);
    
})();

