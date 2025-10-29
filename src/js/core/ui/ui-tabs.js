/**
 * UI Tabs Module
 * Handles tab switching and navigation
 * 
 * Part of the modular UI architecture refactor
 * @module ui-tabs
 */

(function() {
    'use strict';
    
    // Track if Chart.js has been loaded
    let chartJsLoaded = typeof Chart !== 'undefined';
    let chartJsLoading = false;
    
    /**
     * Lazy load Chart.js library
     * Only loads when Insights tab is first visited
     * @returns {Promise<boolean>} True if loaded successfully
     */
    async function loadChartJs() {
        if (chartJsLoaded) {
            console.log('✅ Chart.js already loaded');
            return true;
        }
        
        if (chartJsLoading) {
            console.log('⏳ Chart.js already loading, waiting...');
            // Wait for existing load to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (chartJsLoaded || typeof Chart !== 'undefined') {
                        clearInterval(checkInterval);
                        chartJsLoaded = true;
                        resolve(true);
                    }
                }, 100);
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(false);
                }, 10000);
            });
        }
        
        chartJsLoading = true;
        console.log('📊 Lazy loading Chart.js...');
        const startTime = performance.now();
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = () => {
                const elapsed = (performance.now() - startTime).toFixed(0);
                console.log(`✅ Chart.js loaded (${elapsed}ms)`);
                chartJsLoaded = true;
                chartJsLoading = false;
                resolve(true);
            };
            script.onerror = () => {
                console.error('❌ Failed to load Chart.js');
                chartJsLoading = false;
                reject(new Error('Chart.js load failed'));
            };
            document.head.appendChild(script);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (!chartJsLoaded) {
                    console.error('❌ Chart.js load timeout');
                    chartJsLoading = false;
                    reject(new Error('Chart.js load timeout'));
                }
            }, 10000);
        });
    }
    
    /**
     * Switch between dashboard tabs
     * @param {string} tabName - Tab identifier ('portfolio-overview' or 'governance-dashboard')
     * @description Handles navigation between 🔍 Explore and 💡 Insights views
     */
    async function switchTab(tabName) {
        console.log(`Switching to tab: ${tabName}`);
        
        // NEW: If switching away from governance tab, cancel any in-progress render
        const currentTab = window.State.getCurrentTab();
        if (currentTab === 'governance-dashboard' && tabName !== 'governance-dashboard') {
            if (window.UIManager.Governance && window.UIManager.Governance.cancelRender) {
                window.UIManager.Governance.cancelRender();
            }
        }
        
        // Update current tab in State
        window.State.setCurrentTab(tabName);
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `tab-${tabName}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Keep filters visible on both tabs for dynamic filtering
        const filtersSection = document.getElementById('filters-section');
        if (filtersSection) {
            filtersSection.style.display = 'block';
        }
        
        // Configure filter display based on tab
        if (tabName === 'governance-dashboard') {
            // ==================== INSIGHTS TAB: Minimal Strategic Filters ====================
            // Only show: P&C Area, Journey Stage, Maturity Stage, Target User + Clear Filters
            
            // Hide search row
            const searchRow = document.querySelector('.filters-row-search');
            if (searchRow) searchRow.style.display = 'none';
            
            // Hide Owner Name filter
            const ownerFilterWrapper = document.getElementById('filter-owner-wrapper');
            if (ownerFilterWrapper) ownerFilterWrapper.style.display = 'none';
            
            // Hide Sort By dropdown
            const sortBy = document.getElementById('sort-by');
            if (sortBy) sortBy.style.display = 'none';
            
            // Hide Below Target Metrics checkbox
            const belowTargetLabel = document.querySelector('.filter-checkbox');
            if (belowTargetLabel) belowTargetLabel.style.display = 'none';
            
            // Move Clear Filters button to main filter row
            const clearBtn = document.querySelector('.clear-filters');
            const mainFiltersRow = document.querySelector('.filters-row-main');
            if (clearBtn && mainFiltersRow) {
                mainFiltersRow.appendChild(clearBtn);
                clearBtn.style.marginLeft = 'auto'; // Push to the right
            }
            
            // Add class to filters container for Insights-specific styling
            const filtersContainer = document.querySelector('.filters-container');
            if (filtersContainer) {
                filtersContainer.classList.add('insights-mode');
            }
            
        } else {
            // ==================== EXPLORE TAB: Full Filter Suite ====================
            // Show all filters and controls
            
            // Show search row
            const searchRow = document.querySelector('.filters-row-search');
            if (searchRow) searchRow.style.display = 'flex';
            
            // Show Owner Name filter
            const ownerFilterWrapper = document.getElementById('filter-owner-wrapper');
            if (ownerFilterWrapper) ownerFilterWrapper.style.display = 'block';
            
            // Show Sort By dropdown
            const sortBy = document.getElementById('sort-by');
            if (sortBy) sortBy.style.display = 'block';
            
            // Show Below Target Metrics checkbox
            const belowTargetLabel = document.querySelector('.filter-checkbox');
            if (belowTargetLabel) belowTargetLabel.style.display = 'flex';
            
            // Move Clear Filters button back to actions row
            const clearBtn = document.querySelector('.clear-filters');
            const actionsRow = document.querySelector('.filters-row-actions');
            if (clearBtn && actionsRow) {
                actionsRow.appendChild(clearBtn);
                clearBtn.style.marginLeft = ''; // Reset margin
            }
            
            // Remove Insights-specific styling class
            const filtersContainer = document.querySelector('.filters-container');
            if (filtersContainer) {
                filtersContainer.classList.remove('insights-mode');
            }
        }
        
        // Load tab-specific content
        if (tabName === 'governance-dashboard') {
            // Lazy load Chart.js before rendering Insights tab
            try {
                await loadChartJs();
            } catch (error) {
                console.error('Chart.js failed to load, governance dashboard may not render charts:', error);
                // Continue anyway - governance module has fallback handling
            }
            
            // Check if we have filtered data to use
            const filteredData = window.DataManager.getFilteredData();
            const portfolioData = window.DataManager.getPortfolioData();
            
            // If filters are active, update with filtered data instead of full render
            if (filteredData.length > 0 && filteredData.length < portfolioData.length) {
                // Trigger initial render first
                window.UIManager.Governance.render();
                
                // Then immediately update with filtered data
                setTimeout(() => {
                    const filterContext = {
                        areaFilters: [],
                        journeyFilters: [],
                        maturityFilters: [],
                        targetUserFilters: [],
                        ownerFilters: [],
                        searchTerm: '',
                        sortBy: '',
                        belowTargetOnly: false,
                        totalCount: portfolioData.length,
                        filteredCount: filteredData.length
                    };
                    
                    window.UIManager.Governance.updateWithFilters({
                        filteredData,
                        filterContext
                    });
                }, 100);
            } else {
                // No filters active, do normal render
                window.UIManager.Governance.render();
            }
        }
    }
    
    // Export to window.UIManager.Tabs namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Tabs = {
        switchTab
    };
    
    // Also expose as global for backward compatibility
    window.switchTab = switchTab;
    
    console.log('✅ UI Tabs module loaded');
})();
