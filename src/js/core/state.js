/**
 * State Management Module
 * Centralized state management for the Portfolio Dashboard
 * Provides a single source of truth for all application state
 * 
 * Design Pattern: Singleton State Manager with controlled access
 * Benefits:
 * - Single source of truth for all application data
 * - Controlled state mutations through setters
 * - Easy debugging (all state changes go through this module)
 * - Better testability (can mock state easily)
 * - Prevents accidental state corruption
 */

// ==================== STATE DEFINITION ====================

/**
 * Application state object
 * Contains all global application data
 * @private
 */
const appState = {
    // Data state
    portfolioData: [],          // Raw portfolio data from Google Sheets
    filteredData: [],           // Filtered/sorted subset of portfolioData
    columnMapping: {},          // Dynamic column mapping from spreadsheet headers
    
    // UI state
    currentTab: 'portfolio-overview',  // Active tab name
    analysisDataLoaded: false,         // Whether analysis tab data has been loaded
    chartJsLoaded: false,              // Whether Chart.js library has been loaded
    chartInstances: {},                // Store chart instances to prevent memory leaks
    activeRiskFilter: null,            // Active risk level filter: 'critical', 'monitor', 'datagaps', or null
    
    // Cache state
    lastUpdateTime: null,      // Timestamp of last data fetch
    
    // Constants
    constants: {
        UPDATE_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours in ms
        STORAGE_KEY: 'portfolio_last_update',
        DATA_CACHE_KEY: 'portfolio_data_cache',
        CACHE_EXPIRY: 24 * 60 * 60 * 1000     // 24 hours
    }
};

// ==================== STATE GETTERS ====================

/**
 * Get the complete portfolio data
 * @returns {Array} Array of all portfolio products
 */
function getPortfolioData() {
    return appState.portfolioData;
}

/**
 * Get the filtered/sorted portfolio data
 * @returns {Array} Array of filtered/sorted products
 */
function getFilteredData() {
    return appState.filteredData;
}

/**
 * Get column mapping for spreadsheet
 * @returns {Object} Column mapping object
 */
function getColumnMapping() {
    return appState.columnMapping;
}

/**
 * Get current active tab name
 * @returns {string} Current tab identifier
 */
function getCurrentTab() {
    return appState.currentTab;
}

/**
 * Check if analysis data has been loaded
 * @returns {boolean} Analysis loaded status
 */
function isAnalysisDataLoaded() {
    return appState.analysisDataLoaded;
}

/**
 * Check if Chart.js library has been loaded
 * @returns {boolean} Chart.js loaded status
 */
function isChartJsLoaded() {
    return appState.chartJsLoaded;
}

/**
 * Get all chart instances
 * @returns {Object} Object containing all chart instances
 */
function getChartInstances() {
    return appState.chartInstances;
}

/**
 * Get a specific chart instance by ID
 * @param {string} chartId - Chart identifier
 * @returns {Object|null} Chart instance or null if not found
 */
function getChartInstance(chartId) {
    return appState.chartInstances[chartId] || null;
}

/**
 * Get last data update timestamp
 * @returns {number|null} Timestamp or null if never updated
 */
function getLastUpdateTime() {
    return appState.lastUpdateTime;
}

/**
 * Get application constants
 * @returns {Object} Constants object
 */
function getConstants() {
    return { ...appState.constants }; // Return copy to prevent mutation
}

/**
 * Get specific constant value
 * @param {string} key - Constant key name
 * @returns {*} Constant value
 */
function getConstant(key) {
    return appState.constants[key];
}

/**
 * Get active risk filter
 * @returns {string|null} Active risk level: 'critical', 'monitor', 'datagaps', or null
 */
function getActiveRiskFilter() {
    return appState.activeRiskFilter;
}

/**
 * Get entire state (for debugging only)
 * @returns {Object} Deep clone of entire state
 */
function getState() {
    return window.Utils.deepClone(appState);
}

// ==================== STATE SETTERS ====================

/**
 * Set the complete portfolio data
 * @param {Array} data - New portfolio data array
 * @throws {Error} If data is not an array
 */
function setPortfolioData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Portfolio data must be an array');
    }
    appState.portfolioData = data;
    console.log(`State: Portfolio data set (${data.length} items)`);
}

/**
 * Set the filtered data
 * @param {Array} data - New filtered data array
 * @throws {Error} If data is not an array
 */
function setFilteredData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Filtered data must be an array');
    }
    appState.filteredData = data;
}

/**
 * Set column mapping
 * @param {Object} mapping - Column mapping object
 * @throws {Error} If mapping is not an object
 */
function setColumnMapping(mapping) {
    if (typeof mapping !== 'object' || mapping === null) {
        throw new Error('Column mapping must be an object');
    }
    appState.columnMapping = mapping;
    console.log('State: Column mapping updated');
}

/**
 * Set current active tab
 * @param {string} tabName - Tab identifier
 */
function setCurrentTab(tabName) {
    if (typeof tabName !== 'string') {
        throw new Error('Tab name must be a string');
    }
    appState.currentTab = tabName;
}

/**
 * Set analysis data loaded status
 * @param {boolean} loaded - Loaded status
 */
function setAnalysisDataLoaded(loaded) {
    appState.analysisDataLoaded = Boolean(loaded);
}

/**
 * Set Chart.js loaded status
 * @param {boolean} loaded - Loaded status
 */
function setChartJsLoaded(loaded) {
    appState.chartJsLoaded = Boolean(loaded);
}

/**
 * Set a chart instance
 * @param {string} chartId - Chart identifier
 * @param {Object} instance - Chart.js instance
 */
function setChartInstance(chartId, instance) {
    // Destroy existing instance if it exists
    if (appState.chartInstances[chartId]) {
        try {
            appState.chartInstances[chartId].destroy();
        } catch (e) {
            console.warn(`Failed to destroy existing chart ${chartId}:`, e);
        }
    }
    appState.chartInstances[chartId] = instance;
}

/**
 * Remove a chart instance
 * @param {string} chartId - Chart identifier
 */
function removeChartInstance(chartId) {
    if (appState.chartInstances[chartId]) {
        try {
            appState.chartInstances[chartId].destroy();
        } catch (e) {
            console.warn(`Failed to destroy chart ${chartId}:`, e);
        }
        delete appState.chartInstances[chartId];
    }
}

/**
 * Clear all chart instances
 * Useful when switching tabs or resetting the view
 */
function clearAllChartInstances() {
    Object.keys(appState.chartInstances).forEach(chartId => {
        removeChartInstance(chartId);
    });
    appState.chartInstances = {};
}

/**
 * Set last update timestamp
 * @param {number|null} timestamp - Timestamp in milliseconds or null
 */
function setLastUpdateTime(timestamp) {
    appState.lastUpdateTime = timestamp;
}

/**
 * Set active risk filter
 * @param {string|null} level - Risk level: 'critical', 'monitor', 'datagaps', or null to clear
 */
function setActiveRiskFilter(level) {
    if (level !== null && !['critical', 'monitor', 'datagaps'].includes(level)) {
        console.warn(`Invalid risk level: ${level}. Must be 'critical', 'monitor', 'datagaps', or null`);
        return;
    }
    appState.activeRiskFilter = level;
    console.log(`State: Active risk filter set to ${level || 'null'}`);
}

// ==================== STATE OPERATIONS ====================

/**
 * Reset all data state (useful for testing or logout scenarios)
 */
function resetDataState() {
    appState.portfolioData = [];
    appState.filteredData = [];
    appState.columnMapping = {};
    appState.lastUpdateTime = null;
    console.log('State: Data state reset');
}

/**
 * Reset UI state
 */
function resetUIState() {
    appState.currentTab = 'portfolio-overview';
    appState.analysisDataLoaded = false;
    appState.activeRiskFilter = null;
    clearAllChartInstances();
    console.log('State: UI state reset');
}

/**
 * Reset entire application state
 */
function resetState() {
    resetDataState();
    resetUIState();
    console.log('State: Complete state reset');
}

/**
 * Check if portfolio data is available
 * @returns {boolean} True if data is loaded
 */
function hasData() {
    return Array.isArray(appState.portfolioData) && appState.portfolioData.length > 0;
}

/**
 * Get statistics about current state
 * @returns {Object} State statistics
 */
function getStateStats() {
    return {
        portfolioDataCount: appState.portfolioData.length,
        filteredDataCount: appState.filteredData.length,
        currentTab: appState.currentTab,
        analysisLoaded: appState.analysisDataLoaded,
        chartJsLoaded: appState.chartJsLoaded,
        activeCharts: Object.keys(appState.chartInstances).length,
        lastUpdate: appState.lastUpdateTime ? new Date(appState.lastUpdateTime).toISOString() : 'Never'
    };
}

// ==================== MODULE EXPORTS ====================

/**
 * Export state management functions via window.State namespace
 * This provides controlled access to application state from any module
 */
window.State = {
    // Getters
    getPortfolioData,
    getFilteredData,
    getColumnMapping,
    getCurrentTab,
    isAnalysisDataLoaded,
    isChartJsLoaded,
    getChartInstances,
    getChartInstance,
    getLastUpdateTime,
    getConstants,
    getConstant,
    getActiveRiskFilter,
    getState, // For debugging
    
    // Setters
    setPortfolioData,
    setFilteredData,
    setColumnMapping,
    setCurrentTab,
    setAnalysisDataLoaded,
    setChartJsLoaded,
    setChartInstance,
    removeChartInstance,
    clearAllChartInstances,
    setLastUpdateTime,
    setActiveRiskFilter,
    
    // Operations
    resetDataState,
    resetUIState,
    resetState,
    hasData,
    getStateStats
};

console.log('✅ State management module loaded');

