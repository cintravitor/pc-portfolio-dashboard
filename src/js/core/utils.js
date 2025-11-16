/**
 * Utility Functions Module
 * Provides common, reusable helper functions used across the application
 */

// ==================== PERFORMANCE UTILITIES ====================

/**
 * Debounce function to limit how often a function can be called
 * Useful for search inputs and other high-frequency events
 * 
 * @param {Function} func - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce(searchFunction, 300);
 * searchInput.addEventListener('input', debouncedSearch);
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ==================== STRING UTILITIES ====================

/**
 * Escape HTML special characters to prevent XSS attacks
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML insertion
 * 
 * @example
 * const safe = escapeHtml('<script>alert("xss")</script>');
 * // Returns: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Truncate text to a specified length with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 * 
 * @example
 * truncateText('This is a long text', 10); // Returns: 'This is a...'
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ==================== DATA UTILITIES ====================

/**
 * Parse a numeric value from various input types
 * Handles strings, numbers, and returns 0 for invalid inputs
 * 
 * @param {*} value - Value to parse
 * @returns {number} Parsed number or 0
 * 
 * @example
 * parseNumeric('42.5'); // Returns: 42.5
 * parseNumeric('invalid'); // Returns: 0
 */
function parseNumeric(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

/**
 * Calculate percentage safely (handles division by zero)
 * 
 * @param {number} value - Numerator
 * @param {number} total - Denominator
 * @param {number} [decimals=0] - Number of decimal places
 * @returns {number} Percentage value
 * 
 * @example
 * calculatePercentage(25, 100); // Returns: 25
 * calculatePercentage(1, 3, 2); // Returns: 33.33
 */
function calculatePercentage(value, total, decimals = 0) {
    if (total === 0) return 0;
    const percentage = (value / total) * 100;
    return decimals > 0 ? parseFloat(percentage.toFixed(decimals)) : Math.round(percentage);
}

/**
 * Deep clone an object or array
 * 
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 * 
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const copy = deepClone(original);
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
}

// ==================== ARRAY UTILITIES ====================

/**
 * Get unique values from an array
 * 
 * @param {Array} arr - Input array
 * @returns {Array} Array with unique values
 * 
 * @example
 * getUniqueValues([1, 2, 2, 3, 1]); // Returns: [1, 2, 3]
 */
function getUniqueValues(arr) {
    return [...new Set(arr)];
}

/**
 * Sort array of objects by a specific property
 * 
 * @param {Array} arr - Array to sort
 * @param {string} property - Property name to sort by
 * @param {boolean} [ascending=true] - Sort direction
 * @returns {Array} Sorted array
 * 
 * @example
 * sortByProperty(users, 'name'); // Sort by name ascending
 * sortByProperty(users, 'age', false); // Sort by age descending
 */
function sortByProperty(arr, property, ascending = true) {
    return [...arr].sort((a, b) => {
        const valueA = a[property];
        const valueB = b[property];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return ascending 
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }
        
        return ascending 
            ? valueA - valueB
            : valueB - valueA;
    });
}

// ==================== DATE UTILITIES ====================

/**
 * Format a date to a readable string
 * 
 * @param {Date|string|number} date - Date to format
 * @param {string} [format='short'] - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date(), 'short'); // Returns: '10/4/2025'
 * formatDate(new Date(), 'long'); // Returns: 'October 4, 2025'
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const options = {
        short: { year: 'numeric', month: 'numeric', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return d.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Get time elapsed since a date (e.g., "2 hours ago")
 * 
 * @param {Date|string|number} date - Past date
 * @returns {string} Human-readable time elapsed
 * 
 * @example
 * getTimeElapsed(Date.now() - 3600000); // Returns: '1 hour ago'
 */
function getTimeElapsed(date) {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diffMs = now - then;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 * 
 * @example
 * isEmpty(''); // Returns: true
 * isEmpty([]); // Returns: true
 * isEmpty('hello'); // Returns: false
 */
function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

/**
 * Validate if a value is within a numeric range
 * 
 * @param {number} value - Value to check
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if within range
 * 
 * @example
 * isInRange(5, 1, 10); // Returns: true
 * isInRange(15, 1, 10); // Returns: false
 */
function isInRange(value, min, max) {
    return value >= min && value <= max;
}

// ==================== UI UTILITIES ====================

/**
 * Get CSS class for maturity stage status badge
 * 
 * @param {string} maturity - Maturity stage (e.g., '1. Development', '2. Growth')
 * @returns {string} CSS class name
 * 
 * @example
 * getStatusClass('1. Development'); // Returns: 'status-development'
 * getStatusClass('2. Growth'); // Returns: 'status-growth'
 */
function getStatusClass(maturity) {
    if (!maturity || typeof maturity !== 'string') return 'status-unknown';
    
    const maturityLower = maturity.toLowerCase();
    
    if (maturityLower.includes('development')) return 'status-development';
    if (maturityLower.includes('growth')) return 'status-growth';
    if (maturityLower.includes('mature')) return 'status-mature';
    if (maturityLower.includes('decline')) return 'status-decline';
    
    return 'status-unknown';
}

// ==================== DOM UTILITIES ====================

/**
 * Safely get an element by ID with error handling
 * 
 * @param {string} id - Element ID
 * @param {boolean} [required=false] - Whether to log warning if not found
 * @returns {HTMLElement|null} Element or null
 * 
 * @example
 * const element = getElement('myId', true);
 */
function getElement(id, required = false) {
    const element = document.getElementById(id);
    if (!element && required) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

/**
 * Create an HTML element with attributes and children
 * 
 * @param {string} tag - HTML tag name
 * @param {Object} [attributes={}] - Element attributes
 * @param {Array|string} [children=[]] - Child elements or text
 * @returns {HTMLElement} Created element
 * 
 * @example
 * const div = createElement('div', { class: 'container' }, ['Hello World']);
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Add children
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });
    
    return element;
}

// ==================== PUBLISH/SUBSCRIBE PATTERN ====================

/**
 * Event Bus for decoupling modules
 * Implements a lightweight Pub/Sub pattern for loose coupling between modules
 * 
 * Benefits:
 * - Decouples event producers from consumers
 * - Makes testing easier (can subscribe to events in tests)
 * - Allows multiple subscribers to same event
 * - Central place to see all application events
 */

/**
 * Event subscribers storage
 * Maps event names to arrays of callback functions
 * @private
 */
const eventSubscribers = {};

/**
 * Publish an event with optional data
 * Notifies all subscribers of this event type
 * 
 * @param {string} event - Event name (e.g., 'data:loaded', 'filter:changed')
 * @param {*} data - Optional data to pass to subscribers
 * 
 * @example
 * publish('filter:changed', { area: 'Claims', maturity: 'Growth' });
 */
function publish(event, data) {
    if (!event || typeof event !== 'string') {
        console.error('publish() requires an event name (string)');
        return;
    }
    
    const subscribers = eventSubscribers[event] || [];
    
    if (subscribers.length === 0) {
        console.warn(`No subscribers for event: ${event}`);
        return;
    }
    
    console.log(`📡 Publishing event: ${event}`, data ? `(${subscribers.length} subscribers)` : '');
    
    subscribers.forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`Error in subscriber for event "${event}":`, error);
        }
    });
}

/**
 * Subscribe to an event
 * Callback will be invoked whenever the event is published
 * 
 * @param {string} event - Event name to subscribe to
 * @param {Function} callback - Function to call when event is published
 * @returns {Function} Unsubscribe function
 * 
 * @example
 * const unsubscribe = subscribe('filter:changed', (data) => {
 *     console.log('Filter changed:', data);
 * });
 * 
 * // Later, to unsubscribe:
 * unsubscribe();
 */
function subscribe(event, callback) {
    if (!event || typeof event !== 'string') {
        console.error('subscribe() requires an event name (string)');
        return () => {};
    }
    
    if (typeof callback !== 'function') {
        console.error('subscribe() requires a callback function');
        return () => {};
    }
    
    if (!eventSubscribers[event]) {
        eventSubscribers[event] = [];
    }
    
    eventSubscribers[event].push(callback);
    console.log(`📬 Subscribed to event: ${event} (${eventSubscribers[event].length} subscribers)`);
    
    // Return unsubscribe function
    return function unsubscribe() {
        const index = eventSubscribers[event].indexOf(callback);
        if (index > -1) {
            eventSubscribers[event].splice(index, 1);
            console.log(`📭 Unsubscribed from event: ${event}`);
        }
    };
}

/**
 * Unsubscribe all callbacks for a specific event
 * Useful for cleanup or reset scenarios
 * 
 * @param {string} event - Event name to clear subscribers for
 */
function unsubscribeAll(event) {
    if (event) {
        delete eventSubscribers[event];
        console.log(`🗑️ Cleared all subscribers for event: ${event}`);
    } else {
        // Clear all subscriptions
        Object.keys(eventSubscribers).forEach(key => delete eventSubscribers[key]);
        console.log('🗑️ Cleared all event subscribers');
    }
}

/**
 * Get list of all registered events (for debugging)
 * @returns {Array<string>} Array of event names
 */
function getRegisteredEvents() {
    return Object.keys(eventSubscribers);
}

/**
 * Get subscriber count for an event (for debugging)
 * @param {string} event - Event name
 * @returns {number} Number of subscribers
 */
function getSubscriberCount(event) {
    return (eventSubscribers[event] || []).length;
}

// ==================== EVENT REGISTRY ====================

/**
 * Event Registry - Centralized, typed event constants
 * Prevents typos and provides IDE autocomplete support
 * 
 * Event Naming Convention: domain:action
 * - data:* - Data layer events (fetching, filtering, updates)
 * - ui:* - UI interaction events (clicks, opens, closes)
 * - state:* - State management events (state changes)
 * - filter:* - Filter-specific events
 * - governance:* - Governance dashboard events
 * 
 * @constant
 * @type {Object}
 */
const EVENT_REGISTRY = {
    // Data Layer Events
    DATA: {
        LOADED: 'data:loaded',                      // Portfolio data loaded from API
        FILTERED: 'data:filtered',                  // Data filtered/sorted
        UPDATED: 'data:updated',                    // Data refreshed
        FETCH_START: 'data:fetch:start',            // Data fetch initiated
        FETCH_SUCCESS: 'data:fetch:success',        // Data fetch completed
        FETCH_ERROR: 'data:fetch:error',            // Data fetch failed
        GOVERNANCE_LOADED: 'data:governance:loaded' // Governance data loaded
    },
    
    // UI Interaction Events
    UI: {
        FILTER_CHANGED: 'ui:filter:changed',        // Filter criteria changed
        CARD_CLICKED: 'ui:card:clicked',            // Product card clicked
        PANEL_OPENED: 'ui:panel:opened',            // Detail panel opened
        PANEL_CLOSED: 'ui:panel:closed',            // Detail panel closed
        TAB_CHANGED: 'ui:tab:changed',              // Navigation tab changed
        SEARCH_CHANGED: 'ui:search:changed'         // Search input changed
    },
    
    // State Management Events
    STATE: {
        CHANGED: 'state:changed',                   // Generic state change
        PORTFOLIO_DATA_SET: 'state:portfolioData',  // Portfolio data state updated
        FILTERED_DATA_SET: 'state:filteredData',    // Filtered data state updated
        TAB_SET: 'state:currentTab',                // Current tab state updated
        RISK_FILTER_SET: 'state:riskFilter'         // Risk filter state updated
    },
    
    // Filter-Specific Events
    FILTER: {
        APPLIED: 'filter:applied',                  // Filters applied to data
        CLEARED: 'filter:cleared',                  // All filters cleared
        RISK_ACTIVATED: 'filter:risk:activated',    // Risk filter activated
        RISK_DEACTIVATED: 'filter:risk:deactivated',// Risk filter deactivated
        METRIC_ACTIVATED: 'filter:metric:activated',// Metric filter (UX/BI) activated
        METRIC_DEACTIVATED: 'filter:metric:deactivated' // Metric filter deactivated
    },
    
    // Governance Dashboard Events
    GOVERNANCE: {
        RENDERED: 'governance:rendered',            // Governance dashboard rendered
        DRILLDOWN_OPENED: 'governance:drilldown:opened', // Drill-down modal opened
        DRILLDOWN_CLOSED: 'governance:drilldown:closed', // Drill-down modal closed
        METRIC_CLICKED: 'governance:metric:clicked' // Governance metric clicked
    }
};

/**
 * Event payload schemas for validation
 * Defines expected structure for each event type
 * @private
 */
const EVENT_SCHEMAS = {
    'data:loaded': { required: ['portfolioData'], optional: ['timestamp'] },
    'data:filtered': { required: ['filteredData'], optional: ['filters', 'count'] },
    'ui:filter:changed': { required: ['filters'], optional: ['source'] },
    'ui:card:clicked': { required: ['productId'], optional: ['product'] },
    'ui:panel:opened': { required: ['productId'], optional: [] },
    'ui:panel:closed': { required: [], optional: [] },
    'ui:tab:changed': { required: ['tabName'], optional: ['previousTab'] },
    'state:changed': { required: ['key'], optional: ['oldValue', 'newValue'] }
};

/**
 * Validate event payload against schema
 * @param {string} event - Event name
 * @param {*} data - Payload to validate
 * @returns {boolean} True if valid
 * @private
 */
function validateEventPayload(event, data) {
    const schema = EVENT_SCHEMAS[event];
    if (!schema) {
        // No schema defined - allow any payload
        return true;
    }
    
    // Check required fields
    if (schema.required && schema.required.length > 0) {
        if (!data || typeof data !== 'object') {
            console.warn(`Event "${event}" requires payload object with fields: ${schema.required.join(', ')}`);
            return false;
        }
        
        const missingFields = schema.required.filter(field => !(field in data));
        if (missingFields.length > 0) {
            console.warn(`Event "${event}" missing required fields: ${missingFields.join(', ')}`);
            return false;
        }
    }
    
    return true;
}

/**
 * Enhanced publish with validation and wildcard support
 * Validates payload and notifies wildcard subscribers
 * 
 * @param {string} event - Event name (use EVENT_REGISTRY constants)
 * @param {*} data - Event payload
 * @param {Object} options - Publishing options
 * @param {boolean} options.silent - Suppress console logging
 * @param {boolean} options.skipValidation - Skip payload validation
 * 
 * @example
 * publishEnhanced(Utils.EVENTS.DATA.LOADED, { portfolioData: [...] });
 * publishEnhanced(Utils.EVENTS.UI.FILTER_CHANGED, { filters: {...} }, { silent: true });
 */
function publishEnhanced(event, data, options = {}) {
    if (!event || typeof event !== 'string') {
        console.error('publishEnhanced() requires an event name (string)');
        return;
    }
    
    // Validate payload (unless skipped)
    if (!options.skipValidation && !validateEventPayload(event, data)) {
        console.error(`Event "${event}" published with invalid payload`, data);
        // Still publish, but log warning
    }
    
    // Get direct subscribers
    const subscribers = eventSubscribers[event] || [];
    
    // Get wildcard subscribers (e.g., 'data:*' matches 'data:loaded')
    const eventParts = event.split(':');
    const wildcardEvent = eventParts[0] + ':*';
    const wildcardSubscribers = eventSubscribers[wildcardEvent] || [];
    
    const totalSubscribers = subscribers.length + wildcardSubscribers.length;
    
    if (totalSubscribers === 0) {
        if (!options.silent) {
            console.warn(`No subscribers for event: ${event}`);
        }
        return;
    }
    
    if (!options.silent) {
        console.log(`📡 Publishing event: ${event}`, `(${totalSubscribers} subscribers)`);
    }
    
    // Notify direct subscribers
    subscribers.forEach(callback => {
        try {
            callback(data, event);
        } catch (error) {
            console.error(`Error in subscriber for event "${event}":`, error);
        }
    });
    
    // Notify wildcard subscribers
    wildcardSubscribers.forEach(callback => {
        try {
            callback(data, event);
        } catch (error) {
            console.error(`Error in wildcard subscriber for event "${event}":`, error);
        }
    });
}

/**
 * Subscribe to events with wildcard support
 * Supports wildcard patterns like 'data:*' to subscribe to all data events
 * 
 * @param {string} event - Event name or wildcard pattern (e.g., 'data:*')
 * @param {Function} callback - Function to call when event is published
 * @param {Object} options - Subscription options
 * @param {boolean} options.once - Auto-unsubscribe after first invocation
 * @returns {Function} Unsubscribe function
 * 
 * @example
 * // Subscribe to specific event
 * subscribeEnhanced(Utils.EVENTS.DATA.LOADED, (data) => { ... });
 * 
 * // Subscribe to all data events
 * subscribeEnhanced('data:*', (data, event) => {
 *     console.log('Data event:', event, data);
 * });
 * 
 * // Subscribe with once option
 * subscribeEnhanced(Utils.EVENTS.DATA.LOADED, callback, { once: true });
 */
function subscribeEnhanced(event, callback, options = {}) {
    if (!event || typeof event !== 'string') {
        console.error('subscribeEnhanced() requires an event name (string)');
        return () => {};
    }
    
    if (typeof callback !== 'function') {
        console.error('subscribeEnhanced() requires a callback function');
        return () => {};
    }
    
    // Wrap callback for 'once' option
    let wrappedCallback = callback;
    if (options.once) {
        let unsubscribeFn;
        wrappedCallback = function(...args) {
            callback(...args);
            if (unsubscribeFn) {
                unsubscribeFn();
            }
        };
    }
    
    if (!eventSubscribers[event]) {
        eventSubscribers[event] = [];
    }
    
    eventSubscribers[event].push(wrappedCallback);
    
    const isWildcard = event.endsWith(':*');
    console.log(`📬 Subscribed to ${isWildcard ? 'wildcard ' : ''}event: ${event} (${eventSubscribers[event].length} subscribers)`);
    
    // Return unsubscribe function
    const unsubscribeFn = function unsubscribe() {
        const index = eventSubscribers[event].indexOf(wrappedCallback);
        if (index > -1) {
            eventSubscribers[event].splice(index, 1);
            console.log(`📭 Unsubscribed from event: ${event}`);
        }
    };
    
    return unsubscribeFn;
}

/**
 * Get event statistics for debugging
 * @returns {Object} Event system statistics
 */
function getEventStats() {
    const events = Object.keys(eventSubscribers);
    const totalSubscribers = events.reduce((sum, event) => sum + eventSubscribers[event].length, 0);
    
    return {
        totalEvents: events.length,
        totalSubscribers,
        events: events.map(event => ({
            name: event,
            subscriberCount: eventSubscribers[event].length
        }))
    };
}

// ==================== ERROR LOGGING ====================

/**
 * Log critical errors to console with stack trace and context
 * Future enhancement: Send to analytics endpoint
 * 
 * @param {string} context - Where the error occurred (e.g., 'FilterInitialization')
 * @param {Error} error - The error object
 * @param {Object} metadata - Additional context
 * @returns {Object} Error report object
 * 
 * @example
 * try {
 *   // risky operation
 * } catch (error) {
 *   Utils.logCriticalError('DataFetch', error, { url: apiUrl });
 * }
 */
function logCriticalError(context, error, metadata = {}) {
    const errorReport = {
        timestamp: new Date().toISOString(),
        context,
        message: error.message || String(error),
        stack: error.stack || 'No stack trace available',
        userAgent: navigator.userAgent,
        url: window.location.href,
        state: {
            hasPortfolioData: window.State?.hasData() || false,
            currentTab: window.State?.getCurrentTab() || 'unknown',
            ...metadata
        }
    };
    
    console.error('🚨 CRITICAL ERROR:', context);
    console.error('Message:', error.message || String(error));
    console.error('Stack:', error.stack || 'No stack trace');
    console.error('Context:', errorReport);
    
    // Future: Send to analytics endpoint
    // if (CONFIG.ANALYTICS_ENABLED) {
    //     fetch('/api/log-error', { 
    //         method: 'POST', 
    //         body: JSON.stringify(errorReport),
    //         headers: { 'Content-Type': 'application/json' }
    //     }).catch(err => console.warn('Failed to send error report:', err));
    // }
    
    return errorReport;
}

// ==================== MODULE EXPORTS ====================

/**
 * Export all utility functions via window.Utils namespace
 * This allows any module to access utilities via window.Utils.functionName()
 */
window.Utils = {
    // Performance
    debounce,
    
    // String
    escapeHtml,
    truncateText,
    
    // Data
    parseNumeric,
    calculatePercentage,
    deepClone,
    
    // Array
    getUniqueValues,
    sortByProperty,
    
    // Date
    formatDate,
    getTimeElapsed,
    
    // Validation
    isEmpty,
    isInRange,
    
    // UI
    getStatusClass,
    
    // DOM
    getElement,
    createElement,
    
    // Pub/Sub Event System (Legacy - for backward compatibility)
    publish,
    subscribe,
    unsubscribeAll,
    getRegisteredEvents,
    getSubscriberCount,
    
    // Enhanced Pub/Sub Event System (Recommended)
    publishEnhanced,
    subscribeEnhanced,
    getEventStats,
    
    // Event Registry - Typed event constants
    EVENTS: EVENT_REGISTRY,
    
    // Error Logging
    logCriticalError
};

console.log('✅ Utils module loaded');
console.log('📡 Event system enhanced with typed constants and validation');

