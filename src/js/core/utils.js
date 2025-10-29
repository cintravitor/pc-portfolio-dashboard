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
    
    // Pub/Sub Event System
    publish,
    subscribe,
    unsubscribeAll,
    getRegisteredEvents,
    getSubscriberCount,
    
    // Error Logging
    logCriticalError
};

console.log('✅ Utils module loaded');

