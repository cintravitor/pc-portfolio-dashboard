/**
 * Data Fetching Module
 * Handles data fetching from Google Apps Script and caching
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PUBLIC API ====================
    
    /**
     * Fetch governance dashboard data from Google Apps Script
     * Uses the new getGovernanceData endpoint with pre-processed metrics
     */
    async function fetchGovernanceData() {
        try {
            if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
                throw new Error('Missing Web App URL. Please configure config.js');
            }

            console.log('Fetching governance data from Google Apps Script...');
            console.log('URL:', CONFIG.WEB_APP_URL + '?action=getGovernanceData');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(CONFIG.WEB_APP_URL + '?action=getGovernanceData', { 
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const jsonData = await response.json();

            if (!jsonData.success) {
                throw new Error(jsonData.error || 'Unknown error');
            }

            console.log('✅ Successfully fetched governance data');
            return jsonData;

        } catch (error) {
            console.error('Error fetching governance data:', error);
            
            // Provide user-friendly error messages
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Google Sheets may be slow to respond. Please try again.');
            }
            
            throw error; // Re-throw to let caller handle
        }
    }

    /**
     * Fetch data from Google Apps Script
     */
    async function fetchSheetData() {
        try {
            if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
                throw new Error('Missing Web App URL. Please configure config.js');
            }

            console.log('Fetching data from Google Apps Script...');
            console.log('URL:', CONFIG.WEB_APP_URL);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout (increased)
            
            const response = await fetch(CONFIG.WEB_APP_URL, { 
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const jsonData = await response.json();

            if (!jsonData.success) {
                throw new Error(jsonData.error || 'Unknown error');
            }

            const rows = jsonData.data;

            if (!rows || rows.length < 3) {
                throw new Error('Insufficient data in spreadsheet');
            }

            console.log(`Successfully fetched ${rows.length} rows`);

            // Row 0: Section headers (SOLUTION SCOPE, USER EXPERIENCE DATA, etc.)
            // Row 1: Actual column headers (P'n'C Area, Solution name, etc.)
            // Row 2+: Data rows
            
            const headers = rows[1]; // Get the actual column headers from row 1
            
            // Create dynamic column mapping - Store in State
            const columnMapping = {
                area: headers.indexOf("P'n'C Area"),
                name: headers.indexOf("Solution name"),
                problem: headers.indexOf("Which Problem it Solves"),
                solution: headers.indexOf("What is the solution"),
                regulatory: headers.indexOf("Is a regulatory demand?"),
                owner: headers.indexOf("Owner's Name"),
                maturity: headers.indexOf("Maturity Stage"),
                targetUser: headers.indexOf("Target User"),
                indirectUser: headers.indexOf("Indirect Impact User"),
                journeyMain: headers.indexOf("Main Journey Stage Impacted"),
                journeyCollateral: headers.indexOf("Collateral Journey Stage Impacted"),
                platform: headers.indexOf("User Interface Platform"),
                keyMetricUX: headers.indexOf("Key Metric\nUser Experience"),
                targetUX: headers.indexOf("TARGET"),
                keyMetricBI: headers.indexOf("Key Metric\nBusiness Impact")
            };
            
            // Find BAU hours columns (these are multi-line headers, search by partial match)
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i] ? headers[i].toString().trim() : '';
                if (header.includes('PJC') && header.includes('Headcount Allocation (BAU)')) {
                    columnMapping.bauPJC = i;
                }
                if (header.includes('PATO') && header.includes('Headcount Allocation (BAU)')) {
                    columnMapping.bauPATO = i;
                }
                if (header.includes('Talent Acquisition') && header.includes('Headcount Allocation (BAU)')) {
                    columnMapping.bauTA = i;
                }
                if (header.includes('HRBP') && header.includes('Headcount Allocation (BAU)')) {
                    columnMapping.bauHRBP = i;
                }
                if (header.includes('PSE') && header.includes('Headcount Allocation (BAU)')) {
                    columnMapping.bauPSE = i;
                }
                if (header.includes('Total') && header.includes('Headcount Allocation (BAU)') && header.includes('hours') && !header.includes('# HC')) {
                    columnMapping.totalBAUHours = i;
                }
                if (header.includes('People Tech Involvement Flag')) {
                    columnMapping.ptechFlag = i;
                }
            }
            
            // Find first "Tracking Frequency" column (for UX metrics)
            const uxMetricStartIdx = columnMapping.keyMetricUX !== -1 ? columnMapping.keyMetricUX : 0;
            columnMapping.trackingFrequencyUX = headers.indexOf("Tracking Frequency", uxMetricStartIdx);
            
            // Find monthly columns (JAN, FEB, MAR, etc.)
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            
            // Find the first set of month columns (for UX metrics)
            columnMapping.monthsUX = months.map(month => headers.indexOf(month, columnMapping.keyMetricUX));
            
            // Find the second TARGET column (for BI metrics)
            let targetBIIdx = headers.indexOf('TARGET', columnMapping.targetUX + 1);
            columnMapping.targetBI = targetBIIdx;
            
            // Find the second set of month columns (for BI metrics)
            let keyMetricBIIdx = headers.indexOf("Key Metric\nBusiness Impact");
            if (keyMetricBIIdx !== -1) {
                columnMapping.monthsBI = months.map(month => headers.indexOf(month, keyMetricBIIdx));
                // Find second "Tracking Frequency" column (for BI metrics)
                columnMapping.trackingFrequencyBI = headers.indexOf("Tracking Frequency", keyMetricBIIdx);
            }
            
            // Store column mapping in State
            window.State.setColumnMapping(columnMapping);
            
            // Transform data rows (starting from row 2)
            const dataRows = rows.slice(2);
            
            const portfolioData = dataRows
                .filter(row => {
                    const hasName = row[columnMapping.name] && row[columnMapping.name].toString().trim();
                    if (!hasName && row.some(cell => cell && cell.toString().trim())) {
                        console.warn('Skipping row with empty name:', row.slice(0, 5));
                    }
                    return hasName;
                })
                .map((row, index) => ({
                    id: index,
                    area: (row[columnMapping.area] || '').toString().trim(),
                    name: (row[columnMapping.name] || '').toString().trim(),
                    problem: (row[columnMapping.problem] || '').toString().trim(),
                    solution: (row[columnMapping.solution] || '').toString().trim(),
                    regulatory: (row[columnMapping.regulatory] || '').toString().trim(),
                    owner: (row[columnMapping.owner] || '').toString().trim(),
                    maturity: (row[columnMapping.maturity] || '').toString().trim(),
                    targetUser: (row[columnMapping.targetUser] || '').toString().trim(),
                    indirectUser: (row[columnMapping.indirectUser] || '').toString().trim(),
                    journeyMain: (row[columnMapping.journeyMain] || '').toString().trim(),
                    journeyCollateral: (row[columnMapping.journeyCollateral] || '').toString().trim(),
                    platform: (row[columnMapping.platform] || '').toString().trim(),
                    keyMetricUX: (row[columnMapping.keyMetricUX] || '').toString().trim(),
                    targetUX: row[columnMapping.targetUX] || '',
                    monthlyUX: columnMapping.monthsUX ? columnMapping.monthsUX.map(idx => row[idx] || '') : [],
                    trackingFrequencyUX: columnMapping.trackingFrequencyUX !== -1 ? (row[columnMapping.trackingFrequencyUX] || '').toString().trim() : '',
                    keyMetricBI: (row[columnMapping.keyMetricBI] || '').toString().trim(),
                    targetBI: row[columnMapping.targetBI] || '',
                    monthlyBI: columnMapping.monthsBI ? columnMapping.monthsBI.map(idx => row[idx] || '') : [],
                    trackingFrequencyBI: columnMapping.trackingFrequencyBI !== -1 ? (row[columnMapping.trackingFrequencyBI] || '').toString().trim() : '',
                    // BAU Hours data
                    bauPJC: columnMapping.bauPJC !== undefined ? (row[columnMapping.bauPJC] || '') : '',
                    bauPATO: columnMapping.bauPATO !== undefined ? (row[columnMapping.bauPATO] || '') : '',
                    bauTA: columnMapping.bauTA !== undefined ? (row[columnMapping.bauTA] || '') : '',
                    bauHRBP: columnMapping.bauHRBP !== undefined ? (row[columnMapping.bauHRBP] || '') : '',
                    bauPSE: columnMapping.bauPSE !== undefined ? (row[columnMapping.bauPSE] || '') : '',
                    totalBAUHours: columnMapping.totalBAUHours !== undefined ? (row[columnMapping.totalBAUHours] || '') : '',
                    // PTech Involvement
                    ptechFlag: columnMapping.ptechFlag !== undefined ? (row[columnMapping.ptechFlag] || '').toString().trim() : '',
                    rawRow: row // Keep raw row for accessing other columns if needed
                }));
            
            console.log(`Processed ${portfolioData.length} products`);

            // Store in centralized State
            window.State.setPortfolioData(portfolioData);
            
            // Cache and update
            cacheData(portfolioData);
            updateLastFetchTime();
            
            return portfolioData;

        } catch (error) {
            console.error('Error fetching data:', error);
            
            // Provide user-friendly error messages
            if (error.name === 'AbortError') {
                throw new Error('Request timed out after 45 seconds. Google Sheets may be slow to respond. Please try again or check your internet connection.');
            }
            
            throw error; // Re-throw to let caller handle
        }
    }

    /**
     * Cache data to localStorage
     */
    function cacheData(data) {
        try {
            const DATA_CACHE_KEY = window.State.getConstant('DATA_CACHE_KEY');
            localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to cache data:', e);
        }
    }

    /**
     * Load cached data from localStorage
     */
    function loadCachedData() {
        try {
            const DATA_CACHE_KEY = window.State.getConstant('DATA_CACHE_KEY');
            const cached = localStorage.getItem(DATA_CACHE_KEY);
            if (cached) {
                const data = JSON.parse(cached);
                // Store loaded data in State
                window.State.setPortfolioData(data);
                return data;
            }
        } catch (e) {
            console.warn('Failed to load cached data:', e);
        }
        return null;
    }

    /**
     * Update last fetch timestamp
     */
    function updateLastFetchTime() {
        const now = new Date();
        const STORAGE_KEY = window.State.getConstant('STORAGE_KEY');
        localStorage.setItem(STORAGE_KEY, now.toISOString());
        // Also store in State
        window.State.setLastUpdateTime(now.getTime());
        return now;
    }

    /**
     * Get last update time
     */
    function getLastUpdateTime() {
        const STORAGE_KEY = window.State.getConstant('STORAGE_KEY');
        const lastUpdate = localStorage.getItem(STORAGE_KEY);
        return lastUpdate ? new Date(lastUpdate) : null;
    }

    /**
     * Check if data should be refreshed
     */
    function shouldRefreshData() {
        const STORAGE_KEY = window.State.getConstant('STORAGE_KEY');
        const UPDATE_INTERVAL = window.State.getConstant('UPDATE_INTERVAL');
        const lastUpdate = localStorage.getItem(STORAGE_KEY);
        
        if (!lastUpdate) return true;
        
        const lastUpdateTime = new Date(lastUpdate).getTime();
        const now = Date.now();
        
        return (now - lastUpdateTime) > UPDATE_INTERVAL;
    }
    
    /**
     * Fetch both portfolio and governance data in parallel
     * Provides faster loading by making requests simultaneously
     * 
     * @returns {Promise<{portfolio: Array, governance: Object}>} Combined data
     */
    async function fetchAllDataParallel() {
        try {
            console.log('🚀 Fetching portfolio and governance data in parallel...');
            
            const [portfolioData, governanceData] = await Promise.allSettled([
                fetchSheetData(),
                fetchGovernanceData()
            ]);
            
            const result = {
                portfolio: null,
                governance: null,
                errors: {
                    portfolio: null,
                    governance: null
                }
            };
            
            // Handle portfolio data result
            if (portfolioData.status === 'fulfilled') {
                result.portfolio = portfolioData.value;
                console.log('✅ Portfolio data fetched successfully');
            } else {
                result.errors.portfolio = portfolioData.reason;
                console.error('❌ Portfolio data fetch failed:', portfolioData.reason);
            }
            
            // Handle governance data result
            if (governanceData.status === 'fulfilled') {
                result.governance = governanceData.value;
                console.log('✅ Governance data fetched successfully');
            } else {
                result.errors.governance = governanceData.reason;
                console.error('❌ Governance data fetch failed:', governanceData.reason);
            }
            
            // At least one should succeed
            if (!result.portfolio && !result.governance) {
                throw new Error('Both portfolio and governance data fetch failed');
            }
            
            console.log('✅ Parallel data fetch complete');
            return result;
            
        } catch (error) {
            console.error('Error in parallel data fetch:', error);
            throw error;
        }
    }
    
    /**
     * Prefetch governance data in the background
     * Fire-and-forget fetch that won't block the UI
     * Useful when user is on Explore tab and likely to switch to Insights
     */
    function prefetchGovernanceData() {
        console.log('🔮 Prefetching governance data in background...');
        
        fetchGovernanceData()
            .then(data => {
                // Cache the governance data
                try {
                    const GOVERNANCE_CACHE_KEY = 'pnc_governance_cache';
                    localStorage.setItem(GOVERNANCE_CACHE_KEY, JSON.stringify(data));
                    localStorage.setItem(GOVERNANCE_CACHE_KEY + '_time', new Date().toISOString());
                    console.log('✅ Governance data prefetched and cached');
                } catch (error) {
                    console.log('Governance data fetched but cache failed:', error);
                }
            })
            .catch(error => {
                console.log('Background governance prefetch failed (non-critical):', error.message);
            });
    }
    
    /**
     * Get cached governance data if available and fresh
     * @returns {Object|null} Cached governance data or null
     */
    function getCachedGovernanceData() {
        try {
            const GOVERNANCE_CACHE_KEY = 'pnc_governance_cache';
            const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (same as portfolio cache)
            
            const cachedData = localStorage.getItem(GOVERNANCE_CACHE_KEY);
            const cacheTime = localStorage.getItem(GOVERNANCE_CACHE_KEY + '_time');
            
            if (!cachedData || !cacheTime) {
                return null;
            }
            
            const cacheAge = Date.now() - new Date(cacheTime).getTime();
            if (cacheAge > CACHE_DURATION) {
                console.log('Governance cache expired');
                return null;
            }
            
            console.log('✅ Using cached governance data');
            return JSON.parse(cachedData);
            
        } catch (error) {
            console.error('Error reading governance cache:', error);
            return null;
        }
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.Fetching = {
        fetchSheetData,
        fetchGovernanceData,
        fetchAllDataParallel,
        prefetchGovernanceData,
        getCachedGovernanceData,
        cacheData,
        loadCachedData,
        updateLastFetchTime,
        getLastUpdateTime,
        shouldRefreshData
    };
    
    console.log('✅ Data Fetching module loaded');
    
})();

