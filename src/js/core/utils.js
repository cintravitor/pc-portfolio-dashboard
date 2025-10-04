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
    
    // DOM
    getElement,
    createElement
};

console.log('✅ Utils module loaded');

