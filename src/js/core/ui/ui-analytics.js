/**
 * UI Analytics Module
 * Handles analytics event logging with extensible interface
 * 
 * Current Implementation: Console logging
 * Future: Can be swapped to Google Analytics (GA4), Amplitude, Mixpanel, etc.
 * 
 * Part of the modular UI architecture
 * @module ui-analytics
 */

(function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    
    /**
     * Analytics configuration
     * Can be extended to support multiple analytics providers
     */
    const analyticsConfig = {
        enabled: true,
        provider: 'console', // 'console', 'ga4', 'amplitude', etc.
        debugMode: true      // Set to false in production
    };
    
    // ==================== PRIVATE HELPERS ====================
    
    /**
     * Format timestamp for logging
     * @returns {string} Formatted timestamp
     */
    function getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }
    
    /**
     * Send event to console (current implementation)
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    function logToConsole(eventName, parameters) {
        const timestamp = getTimestamp();
        const logData = {
            timestamp,
            event: eventName,
            ...parameters
        };
        
        if (analyticsConfig.debugMode) {
            console.log(`[Analytics] ${eventName}:`, logData);
        }
    }
    
    /**
     * Send event to Google Analytics (placeholder for future)
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    function logToGA4(eventName, parameters) {
        // Placeholder for GA4 integration
        // Example: gtag('event', eventName, parameters);
        console.warn('[Analytics] GA4 not configured. Event:', eventName, parameters);
    }
    
    /**
     * Send event to Amplitude (placeholder for future)
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    function logToAmplitude(eventName, parameters) {
        // Placeholder for Amplitude integration
        // Example: amplitude.getInstance().logEvent(eventName, parameters);
        console.warn('[Analytics] Amplitude not configured. Event:', eventName, parameters);
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Log a generic analytics event
     * Routes to appropriate provider based on configuration
     * 
     * @param {string} eventName - Name of the event (e.g., 'button_clicked', 'page_viewed')
     * @param {Object} parameters - Event parameters/properties
     * 
     * @example
     * logEvent('filter_applied', { 
     *   filterType: 'area', 
     *   filterValue: 'Customer Experience',
     *   resultCount: 15 
     * });
     */
    function logEvent(eventName, parameters = {}) {
        if (!analyticsConfig.enabled) {
            return;
        }
        
        if (typeof eventName !== 'string' || eventName.trim() === '') {
            console.error('[Analytics] Invalid event name:', eventName);
            return;
        }
        
        // Route to appropriate provider
        switch (analyticsConfig.provider) {
            case 'console':
                logToConsole(eventName, parameters);
                break;
            case 'ga4':
                logToGA4(eventName, parameters);
                break;
            case 'amplitude':
                logToAmplitude(eventName, parameters);
                break;
            default:
                console.warn('[Analytics] Unknown provider:', analyticsConfig.provider);
        }
    }
    
    /**
     * Log alert context hovered event (AC 1.4)
     * Triggered when user hovers over smoke detector badge and tooltip appears
     * 
     * @param {string} alertType - Type of alert: 'warning' or 'critical'
     * @param {number} solutionId - Product/solution ID
     * 
     * @example
     * logAlertContextHovered('warning', 42);
     */
    function logAlertContextHovered(alertType, solutionId) {
        logEvent('alert_context_hovered', {
            alert_type: alertType,
            solution_id: solutionId,
            interaction_type: 'hover'
        });
    }
    
    /**
     * Log alert detail page viewed event (AC 2.4)
     * Triggered when detail panel opens with alert banner displayed
     * 
     * @param {string} alertType - Type of alert: 'warning' or 'critical'
     * @param {number} solutionId - Product/solution ID
     * @param {number} triggerCount - Number of alert triggers
     * 
     * @example
     * logAlertDetailPageViewed('critical', 42, 3);
     */
    function logAlertDetailPageViewed(alertType, solutionId, triggerCount) {
        logEvent('alert_detail_page_viewed', {
            alert_type: alertType,
            solution_id: solutionId,
            trigger_count: triggerCount,
            view_type: 'detail_panel'
        });
    }
    
    /**
     * Log card clicked event (general)
     * Can be used for tracking card interactions
     * 
     * @param {number} solutionId - Product/solution ID
     * @param {boolean} hasAlerts - Whether the product has active alerts
     */
    function logCardClicked(solutionId, hasAlerts) {
        logEvent('solution_card_clicked', {
            solution_id: solutionId,
            has_alerts: hasAlerts
        });
    }
    
    /**
     * Log filter applied event
     * Tracks filtering behavior
     * 
     * @param {string} filterType - Type of filter (area, maturity, etc.)
     * @param {string|Array} filterValue - Filter value(s)
     * @param {number} resultCount - Number of results after filter
     */
    function logFilterApplied(filterType, filterValue, resultCount) {
        logEvent('filter_applied', {
            filter_type: filterType,
            filter_value: filterValue,
            result_count: resultCount
        });
    }
    
    /**
     * Set analytics configuration
     * Allows runtime configuration changes
     * 
     * @param {Object} config - Configuration object
     * @param {boolean} [config.enabled] - Enable/disable analytics
     * @param {string} [config.provider] - Analytics provider
     * @param {boolean} [config.debugMode] - Debug mode flag
     */
    function configure(config) {
        if (typeof config !== 'object') {
            console.error('[Analytics] Invalid configuration:', config);
            return;
        }
        
        if (config.hasOwnProperty('enabled')) {
            analyticsConfig.enabled = Boolean(config.enabled);
        }
        
        if (config.hasOwnProperty('provider')) {
            analyticsConfig.provider = String(config.provider);
        }
        
        if (config.hasOwnProperty('debugMode')) {
            analyticsConfig.debugMode = Boolean(config.debugMode);
        }
        
        console.log('[Analytics] Configuration updated:', analyticsConfig);
    }
    
    /**
     * Get current analytics configuration
     * @returns {Object} Current configuration
     */
    function getConfiguration() {
        return { ...analyticsConfig };
    }
    
    // ==================== EXPORTS ====================
    
    // Export to window.UIManager.Analytics namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Analytics = {
        // Core API
        logEvent,
        configure,
        getConfiguration,
        
        // Specific event loggers for contextual alerting
        logAlertContextHovered,
        logAlertDetailPageViewed,
        
        // Additional event loggers
        logCardClicked,
        logFilterApplied
    };
    
    console.log('✅ UI Analytics module loaded (provider: console)');
    
})();

