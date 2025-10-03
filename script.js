/**
 * Product Portfolio Dashboard - Main Script
 * Handles data fetching from Google Sheets and automatic daily updates
 */

// Constants
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEY = 'portfolio_last_update';
const DATA_CACHE_KEY = 'portfolio_data_cache';

/**
 * Main function to fetch data from Google Apps Script Web App
 * Uses a deployed Web App URL (no API key needed!)
 */
async function fetchSheetData() {
    // Show loading indicator
    showLoading(true);
    hideError();
    
    try {
        // Validate configuration
        if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
            throw new Error('Missing Web App URL. Please configure config.js with your Google Apps Script Web App URL.');
        }
        
        console.log('Fetching data from Google Apps Script...');
        
        // Make the request to the Web App
        const response = await fetch(CONFIG.WEB_APP_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        
        // Check if the response was successful
        if (!jsonData.success) {
            throw new Error(jsonData.error || 'Unknown error from Web App');
        }
        
        // Extract the data
        const rows = jsonData.data;
        
        if (!rows || rows.length === 0) {
            throw new Error('No data found in the spreadsheet');
        }
        
        console.log(`Successfully fetched ${rows.length} rows`);
        
        // Cache the data and update timestamp
        cacheData(rows);
        updateLastFetchTime();
        
        // Display the data in a table
        displayDataAsTable(rows);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Failed to fetch data: ${error.message}`);
        
        // Try to load cached data if available
        loadCachedData();
    } finally {
        showLoading(false);
    }
}

/**
 * Display data as an HTML table
 * @param {Array<Array<string>>} rows - 2D array of cell values
 */
function displayDataAsTable(rows) {
    const container = document.getElementById('table-container');
    
    if (rows.length === 0) {
        container.innerHTML = '<p class="placeholder">No data to display</p>';
        return;
    }
    
    // Create table element
    const table = document.createElement('table');
    
    // Create table header from first row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    rows[0].forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell || '(empty)';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body from remaining rows
    const tbody = document.createElement('tbody');
    
    for (let i = 1; i < rows.length; i++) {
        const row = document.createElement('tr');
        
        // Ensure all rows have the same number of columns as the header
        const numColumns = rows[0].length;
        
        for (let j = 0; j < numColumns; j++) {
            const td = document.createElement('td');
            td.textContent = rows[i][j] || '';
            row.appendChild(td);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    
    // Replace container content with the new table
    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * Show or hide the loading indicator
 * @param {boolean} show - Whether to show the loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Display an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

/**
 * Hide the error message
 */
function hideError() {
    const errorDiv = document.getElementById('error');
    errorDiv.classList.add('hidden');
}

/**
 * Update the last update timestamp in the UI
 */
function updateLastFetchTime() {
    const now = new Date();
    const timeString = now.toLocaleString();
    
    document.getElementById('last-update').textContent = `Last updated: ${timeString}`;
    
    // Store timestamp in localStorage
    localStorage.setItem(STORAGE_KEY, now.toISOString());
}

/**
 * Cache the fetched data in localStorage
 * @param {Array<Array<string>>} data - The data to cache
 */
function cacheData(data) {
    try {
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to cache data:', error);
    }
}

/**
 * Load cached data from localStorage
 */
function loadCachedData() {
    try {
        const cachedData = localStorage.getItem(DATA_CACHE_KEY);
        if (cachedData) {
            const rows = JSON.parse(cachedData);
            displayDataAsTable(rows);
            showError('Showing cached data. Unable to fetch fresh data from Google Sheets.');
        }
    } catch (error) {
        console.warn('Failed to load cached data:', error);
    }
}

/**
 * Check if it's time to refresh the data (24 hours have passed)
 * @returns {boolean} - True if data should be refreshed
 */
function shouldRefreshData() {
    const lastUpdate = localStorage.getItem(STORAGE_KEY);
    
    if (!lastUpdate) {
        return true; // No previous update, should refresh
    }
    
    const lastUpdateTime = new Date(lastUpdate);
    const now = new Date();
    const timeDiff = now - lastUpdateTime;
    
    return timeDiff >= UPDATE_INTERVAL;
}

/**
 * Initialize the automatic update mechanism
 * Checks every hour if 24 hours have passed since last update
 */
function initAutoUpdate() {
    // Check immediately on load
    if (shouldRefreshData()) {
        console.log('24 hours have passed, fetching fresh data...');
        fetchSheetData();
    } else {
        // Load cached data
        const cachedData = localStorage.getItem(DATA_CACHE_KEY);
        if (cachedData) {
            const rows = JSON.parse(cachedData);
            displayDataAsTable(rows);
            
            // Update the last update display
            const lastUpdate = localStorage.getItem(STORAGE_KEY);
            if (lastUpdate) {
                const date = new Date(lastUpdate);
                document.getElementById('last-update').textContent = `Last updated: ${date.toLocaleString()}`;
            }
        }
    }
    
    // Set up periodic check (every hour) to see if 24 hours have passed
    setInterval(() => {
        if (shouldRefreshData()) {
            console.log('24 hours have passed, auto-fetching data...');
            fetchSheetData();
        }
    }, 60 * 60 * 1000); // Check every hour
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio Dashboard initialized');
    
    // Start the auto-update mechanism
    initAutoUpdate();
});

