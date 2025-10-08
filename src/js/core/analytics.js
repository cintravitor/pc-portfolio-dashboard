/**
 * Analytics Module
 * Lightweight, privacy-first usage tracking for P&C Portfolio Dashboard
 * 
 * Features:
 * - Anonymous session tracking
 * - Local storage only (no external services)
 * - Event-based architecture
 * - Export to JSON/CSV
 * - Zero PII collection
 * 
 * Part of the modular architecture - integrates with window.State and window.Utils
 */

(function() {
    'use strict';
    
    // ==================== CONSTANTS ====================
    
    const STORAGE_KEYS = {
        SESSION_ID: 'pnc_analytics_session_id',
        SESSION_START: 'pnc_analytics_session_start',
        EVENTS: 'pnc_analytics_events',
        ENABLED: 'pnc_analytics_enabled'
    };
    
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity = new session
    const MAX_EVENTS_STORED = 1000; // Prevent localStorage overflow
    
    // ==================== PRIVATE STATE ====================
    
    let currentSessionId = null;
    let currentTabId = null;
    let sessionStartTime = null;
    let lastActivityTime = null;
    let isEnabled = true;
    let eventBuffer = []; // In-memory buffer for performance
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Generate a unique session ID using timestamp + random string
     * Format: sess_TIMESTAMP_RANDOM
     */
    function generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `sess_${timestamp}_${random}`;
    }
    
    /**
     * Generate a unique tab/window ID to distinguish multiple open tabs
     * Format: tab_TIMESTAMP_RANDOM
     */
    function generateTabId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        return `tab_${timestamp}_${random}`;
    }
    
    /**
     * Check if current session has timed out due to inactivity
     */
    function isSessionExpired() {
        if (!lastActivityTime) return false;
        return (Date.now() - lastActivityTime) > SESSION_TIMEOUT;
    }
    
    /**
     * Get current timestamp in ISO format
     */
    function getTimestamp() {
        return new Date().toISOString();
    }
    
    /**
     * Safely read from localStorage with error handling
     */
    function safeLocalStorageGet(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`Analytics: Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Safely write to localStorage with error handling
     */
    function safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Analytics: Error writing ${key} to localStorage:`, error);
            // If storage is full, try to clear old events
            if (error.name === 'QuotaExceededError') {
                console.warn('Analytics: Storage quota exceeded, clearing old events...');
                clearOldEvents();
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('Analytics: Still unable to save after cleanup:', retryError);
                    return false;
                }
            }
            return false;
        }
    }
    
    /**
     * Clear old events if storage is full (keep only most recent 500)
     */
    function clearOldEvents() {
        try {
            const events = safeLocalStorageGet(STORAGE_KEYS.EVENTS, []);
            if (events.length > 500) {
                const recentEvents = events.slice(-500);
                safeLocalStorageSet(STORAGE_KEYS.EVENTS, recentEvents);
                console.log(`Analytics: Cleared ${events.length - 500} old events`);
            }
        } catch (error) {
            console.error('Analytics: Error clearing old events:', error);
        }
    }
    
    // ==================== SESSION MANAGEMENT ====================
    
    /**
     * Initialize or restore session
     * - Checks for existing session
     * - Creates new session if needed or if expired
     * - Generates tab ID for multi-tab tracking
     */
    function initSession() {
        console.log('Analytics: Initializing session...');
        
        // Check if analytics is enabled
        const enabled = safeLocalStorageGet(STORAGE_KEYS.ENABLED, true);
        isEnabled = enabled;
        
        if (!isEnabled) {
            console.log('Analytics: Tracking is disabled');
            return;
        }
        
        // Generate unique tab ID for this window/tab
        currentTabId = generateTabId();
        
        // Check for existing session
        const existingSessionId = safeLocalStorageGet(STORAGE_KEYS.SESSION_ID);
        const existingSessionStart = safeLocalStorageGet(STORAGE_KEYS.SESSION_START);
        
        // Determine if we need a new session
        const needsNewSession = !existingSessionId || 
                                !existingSessionStart || 
                                isSessionExpired();
        
        if (needsNewSession) {
            // Create new session
            currentSessionId = generateSessionId();
            sessionStartTime = Date.now();
            
            safeLocalStorageSet(STORAGE_KEYS.SESSION_ID, currentSessionId);
            safeLocalStorageSet(STORAGE_KEYS.SESSION_START, sessionStartTime);
            
            console.log(`Analytics: New session created: ${currentSessionId}`);
            
            // Track session start event
            trackEvent('session_started', {
                tabId: currentTabId,
                userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });
        } else {
            // Restore existing session
            currentSessionId = existingSessionId;
            sessionStartTime = existingSessionStart;
            
            console.log(`Analytics: Session restored: ${currentSessionId}`);
            
            // Track tab opened event (multi-tab support)
            trackEvent('tab_opened', {
                tabId: currentTabId,
                sessionAge: Date.now() - sessionStartTime
            });
        }
        
        // Update last activity time
        lastActivityTime = Date.now();
        
        // Load events from storage into buffer
        eventBuffer = safeLocalStorageGet(STORAGE_KEYS.EVENTS, []);
        
        // Set up activity tracking
        setupActivityTracking();
    }
    
    /**
     * Track user activity to prevent session timeout
     */
    function setupActivityTracking() {
        const updateActivity = () => {
            lastActivityTime = Date.now();
        };
        
        // Track various user interactions
        document.addEventListener('click', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('scroll', updateActivity);
        document.addEventListener('mousemove', updateActivity);
        
        // Check for session expiry periodically
        setInterval(() => {
            if (isSessionExpired() && isEnabled) {
                console.log('Analytics: Session expired, creating new session');
                initSession();
            }
        }, 60000); // Check every minute
    }
    
    // ==================== EVENT TRACKING ====================
    
    /**
     * Core event tracking function
     * @param {string} eventType - Type of event (e.g., 'tab_switch')
     * @param {Object} eventDetails - Additional event-specific data
     */
    function trackEvent(eventType, eventDetails = {}) {
        // Skip if analytics disabled
        if (!isEnabled) return;
        
        // Skip if no session
        if (!currentSessionId) {
            console.warn('Analytics: No session initialized, skipping event');
            return;
        }
        
        try {
            // Construct full event object
            const event = {
                timestamp: getTimestamp(),
                timestampMs: Date.now(),
                sessionId: currentSessionId,
                tabId: currentTabId,
                eventType: eventType,
                eventDetails: eventDetails,
                sessionAge: Date.now() - sessionStartTime,
                path: window.location.pathname,
                hash: window.location.hash
            };
            
            // Add to buffer
            eventBuffer.push(event);
            
            // Prevent buffer overflow
            if (eventBuffer.length > MAX_EVENTS_STORED) {
                eventBuffer.shift(); // Remove oldest event
            }
            
            // Persist to localStorage
            safeLocalStorageSet(STORAGE_KEYS.EVENTS, eventBuffer);
            
            // Send to backend
            sendToBackend(event);
            
            // Publish event for real-time listeners
            if (window.Utils && typeof window.Utils.publish === 'function') {
                window.Utils.publish('analytics-event-tracked', event);
            }
            
            // Log in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Analytics Event:', eventType, eventDetails);
            }
            
        } catch (error) {
            console.error('Analytics: Error tracking event:', error);
        }
    }
    
    // ==================== BACKEND COMMUNICATION ====================
    
    /**
     * Send event data to Google Apps Script backend
     * @param {Object} event - The event object to send
     */
    function sendToBackend(event) {
        // Backend Web App URL
        const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzzjsHr9XUxfbTHFdH3MzaacNAqgOu2GeoD6pu5qvfFSLuqIrrWIRIdKfJBLI2LFPDg/exec';
        
        // Skip if analytics disabled
        if (!isEnabled) return;
        
        try {
            // Send asynchronously (fire and forget)
            // Using navigator.sendBeacon for reliable delivery even on page unload
            const payload = JSON.stringify({
                timestamp: event.timestamp,
                sessionId: event.sessionId,
                tabId: event.tabId,
                eventType: event.eventType,
                eventDetails: event.eventDetails,
                sessionAge: event.sessionAge,
                path: event.path,
                userAgent: navigator.userAgent.substring(0, 200) // Truncate for privacy
            });
            
            // Try sendBeacon first (more reliable for page unload events)
            if (navigator.sendBeacon) {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(BACKEND_URL, blob);
            } else {
                // Fallback to fetch with no-cors mode
                fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: payload,
                    mode: 'no-cors', // Required for cross-origin requests
                    keepalive: true // Keep request alive even if page closes
                }).catch(err => {
                    // Silently fail - don't break user experience
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.warn('Analytics backend sync failed:', err);
                    }
                });
            }
        } catch (error) {
            // Silently fail - analytics should never break the app
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.warn('Analytics backend error:', error);
            }
        }
    }
    
    // ==================== SPECIFIC EVENT TRACKERS ====================
    
    /**
     * Track page load
     */
    function trackPageLoad() {
        trackEvent('page_loaded', {
            path: window.location.pathname,
            hash: window.location.hash,
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            loadTime: performance.now()
        });
    }
    
    /**
     * Track tab switch
     * @param {string} fromTab - Previous tab ID
     * @param {string} toTab - New tab ID
     */
    function trackTabSwitch(fromTab, toTab) {
        trackEvent('tab_switched', {
            from: fromTab,
            to: toTab
        });
    }
    
    /**
     * Track detail panel opened
     * @param {string} productId - Product identifier
     * @param {string} productName - Product name (optional)
     */
    function trackDetailPanelOpen(productId, productName = null) {
        trackEvent('detail_panel_opened', {
            productId: productId,
            productName: productName
        });
    }
    
    /**
     * Track detail panel section expanded
     * @param {string} sectionName - Name of the section
     */
    function trackDetailSectionExpanded(sectionName) {
        trackEvent('detail_section_expanded', {
            section: sectionName
        });
    }
    
    /**
     * Track chart interaction
     * @param {string} chartType - Type of chart (e.g., 'bar', 'line', 'doughnut')
     * @param {string} action - Action performed (e.g., 'hover', 'click')
     * @param {Object} details - Additional details
     */
    function trackChartInteraction(chartType, action, details = {}) {
        trackEvent('chart_interacted', {
            chartType: chartType,
            action: action,
            ...details
        });
    }
    
    /**
     * Track filter applied
     * @param {string} filterName - Name of the filter
     * @param {*} value - Filter value
     */
    function trackFilterApplied(filterName, value) {
        trackEvent('filter_applied', {
            filterName: filterName,
            value: value
        });
    }
    
    /**
     * Track search performed
     * @param {string} query - Search query (length only for privacy)
     * @param {number} resultsCount - Number of results
     */
    function trackSearch(query, resultsCount) {
        trackEvent('search_performed', {
            queryLength: query ? query.length : 0, // Don't store actual query for privacy
            resultsCount: resultsCount
        });
    }
    
    /**
     * Track page unload/close
     */
    function trackPageUnload() {
        const sessionDuration = Date.now() - sessionStartTime;
        trackEvent('page_unloaded', {
            sessionDuration: sessionDuration,
            eventCount: eventBuffer.length
        });
    }
    
    // ==================== DATA EXPORT ====================
    
    /**
     * Export all analytics data as JSON
     * @returns {Object} Complete analytics data
     */
    function exportDataAsJSON() {
        const events = safeLocalStorageGet(STORAGE_KEYS.EVENTS, []);
        
        return {
            metadata: {
                exportTime: getTimestamp(),
                sessionId: currentSessionId,
                sessionStartTime: new Date(sessionStartTime).toISOString(),
                totalEvents: events.length,
                version: '1.0.0'
            },
            events: events
        };
    }
    
    /**
     * Export analytics data as CSV string
     * @returns {string} CSV formatted data
     */
    function exportDataAsCSV() {
        const events = safeLocalStorageGet(STORAGE_KEYS.EVENTS, []);
        
        if (events.length === 0) {
            return 'No events to export';
        }
        
        // CSV Header
        let csv = 'Timestamp,Session ID,Tab ID,Event Type,Session Age (ms),Path,Details\n';
        
        // CSV Rows
        events.forEach(event => {
            const detailsStr = JSON.stringify(event.eventDetails).replace(/"/g, '""'); // Escape quotes
            csv += `"${event.timestamp}","${event.sessionId}","${event.tabId}","${event.eventType}",${event.sessionAge},"${event.path}","${detailsStr}"\n`;
        });
        
        return csv;
    }
    
    /**
     * Download data as file
     * @param {string} format - 'json' or 'csv'
     */
    function downloadData(format = 'json') {
        let content, filename, mimeType;
        
        if (format === 'csv') {
            content = exportDataAsCSV();
            filename = `analytics_${currentSessionId}.csv`;
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(exportDataAsJSON(), null, 2);
            filename = `analytics_${currentSessionId}.json`;
            mimeType = 'application/json';
        }
        
        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        console.log(`Analytics: Data downloaded as ${filename}`);
    }
    
    // ==================== ANALYTICS SUMMARY ====================
    
    /**
     * Get analytics summary/stats
     * @returns {Object} Summary statistics
     */
    function getSummary() {
        const events = safeLocalStorageGet(STORAGE_KEYS.EVENTS, []);
        const sessionDuration = Date.now() - sessionStartTime;
        
        // Count events by type
        const eventCounts = {};
        events.forEach(event => {
            eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
        });
        
        // Get unique tabs in this session
        const uniqueTabs = new Set(events.map(e => e.tabId)).size;
        
        // Calculate session metrics
        const firstEvent = events[0];
        const lastEvent = events[events.length - 1];
        const activeTime = lastEvent ? (lastEvent.timestampMs - firstEvent.timestampMs) : 0;
        
        return {
            sessionId: currentSessionId,
            sessionStartTime: new Date(sessionStartTime).toISOString(),
            sessionDuration: sessionDuration,
            activeTime: activeTime,
            totalEvents: events.length,
            uniqueTabs: uniqueTabs,
            eventsByType: eventCounts,
            isEnabled: isEnabled
        };
    }
    
    /**
     * Get events filtered by criteria
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered events
     */
    function getEvents(filters = {}) {
        let events = safeLocalStorageGet(STORAGE_KEYS.EVENTS, []);
        
        // Apply filters
        if (filters.eventType) {
            events = events.filter(e => e.eventType === filters.eventType);
        }
        
        if (filters.startTime) {
            events = events.filter(e => new Date(e.timestamp) >= new Date(filters.startTime));
        }
        
        if (filters.endTime) {
            events = events.filter(e => new Date(e.timestamp) <= new Date(filters.endTime));
        }
        
        if (filters.sessionId) {
            events = events.filter(e => e.sessionId === filters.sessionId);
        }
        
        return events;
    }
    
    // ==================== PRIVACY & CONTROL ====================
    
    /**
     * Enable analytics tracking
     */
    function enable() {
        isEnabled = true;
        safeLocalStorageSet(STORAGE_KEYS.ENABLED, true);
        console.log('Analytics: Tracking enabled');
    }
    
    /**
     * Disable analytics tracking
     */
    function disable() {
        isEnabled = false;
        safeLocalStorageSet(STORAGE_KEYS.ENABLED, false);
        console.log('Analytics: Tracking disabled');
    }
    
    /**
     * Clear all analytics data
     */
    function clearData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.EVENTS);
            localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
            localStorage.removeItem(STORAGE_KEYS.SESSION_START);
            eventBuffer = [];
            console.log('Analytics: All data cleared');
            return true;
        } catch (error) {
            console.error('Analytics: Error clearing data:', error);
            return false;
        }
    }
    
    /**
     * Clear only events (keep session)
     */
    function clearEvents() {
        try {
            localStorage.removeItem(STORAGE_KEYS.EVENTS);
            eventBuffer = [];
            console.log('Analytics: Events cleared');
            return true;
        } catch (error) {
            console.error('Analytics: Error clearing events:', error);
            return false;
        }
    }
    
    // ==================== INITIALIZATION ====================
    
    /**
     * Initialize analytics module
     * Called on page load
     */
    function init() {
        console.log('Analytics: Initializing module...');
        
        // Initialize session
        initSession();
        
        // Track page load
        trackPageLoad();
        
        // Track page unload
        window.addEventListener('beforeunload', trackPageUnload);
        
        // Set up automatic event tracking
        setupAutoTracking();
        
        console.log('Analytics: Module initialized successfully');
    }
    
    /**
     * Set up automatic event tracking for common interactions
     */
    function setupAutoTracking() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupAutoTrackingListeners);
        } else {
            setupAutoTrackingListeners();
        }
    }
    
    /**
     * Set up event listeners for automatic tracking
     */
    function setupAutoTrackingListeners() {
        // Track tab switches (using event delegation)
        document.addEventListener('click', function(e) {
            // Tab navigation
            const tabButton = e.target.closest('.tab-button, [data-tab], .nav-tab');
            if (tabButton) {
                const newTab = tabButton.getAttribute('data-tab') || 
                              tabButton.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] ||
                              tabButton.textContent.trim();
                
                if (newTab) {
                    // Get current active tab
                    const activeTab = document.querySelector('.tab-button.active, .nav-tab.active');
                    const oldTab = activeTab ? 
                                  (activeTab.getAttribute('data-tab') || activeTab.textContent.trim()) : 
                                  'unknown';
                    
                    trackTabSwitch(oldTab, newTab);
                }
            }
            
            // Detail panel opens (product cards)
            const productCard = e.target.closest('.product-card, [data-product-id]');
            if (productCard) {
                const productId = productCard.getAttribute('data-product-id') || 
                                 productCard.getAttribute('data-id') ||
                                 'unknown';
                const productName = productCard.querySelector('.product-name, .card-title')?.textContent;
                
                trackDetailPanelOpen(productId, productName);
            }
            
            // Collapsible sections in detail panel
            const collapsibleHeader = e.target.closest('.detail-collapsible-header, .collapsible-header');
            if (collapsibleHeader) {
                const sectionName = collapsibleHeader.querySelector('.collapsible-title')?.textContent ||
                                   collapsibleHeader.getAttribute('data-section') ||
                                   'unknown';
                trackDetailSectionExpanded(sectionName);
            }
        });
        
        console.log('Analytics: Auto-tracking listeners set up');
    }
    
    // ==================== PUBLIC API ====================
    
    // Expose public interface
    window.Analytics = {
        // Initialization
        init: init,
        
        // Core tracking
        trackEvent: trackEvent,
        
        // Specific event trackers
        trackPageLoad: trackPageLoad,
        trackTabSwitch: trackTabSwitch,
        trackDetailPanelOpen: trackDetailPanelOpen,
        trackDetailSectionExpanded: trackDetailSectionExpanded,
        trackChartInteraction: trackChartInteraction,
        trackFilterApplied: trackFilterApplied,
        trackSearch: trackSearch,
        
        // Data access
        getSummary: getSummary,
        getEvents: getEvents,
        exportJSON: exportDataAsJSON,
        exportCSV: exportDataAsCSV,
        download: downloadData,
        
        // Privacy & control
        enable: enable,
        disable: disable,
        clearData: clearData,
        clearEvents: clearEvents,
        
        // Status
        isEnabled: () => isEnabled,
        getSessionId: () => currentSessionId
    };
    
    console.log('Analytics: Module loaded. Call Analytics.init() to start tracking.');
    
})();

