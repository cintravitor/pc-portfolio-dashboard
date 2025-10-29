/**
 * UI Governance Core Module
 * Main orchestrator for the Governance/Insights dashboard
 * 
 * Part of the modular UI architecture (Split from monolithic ui-governance.js)
 * @version 8.0.0
 */

(function() {
    'use strict';
    
    // ==================== STATE MANAGEMENT ====================
    
    // Render state tracking (prevent multiple simultaneous renders)
    let isRendering = false;
    let currentAbortController = null;
    
    // Filter state tracking
    let currentFilterContext = null;
    let isUsingFilteredData = false;
    
    // Render cache for performance (5-minute TTL)
    let cachedGovernanceHTML = null;
    let cacheTimestamp = null;
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    // ==================== MAIN RENDER FUNCTION ====================
    
    /**
     * Main render function for Governance Dashboard
     * Entry point for the Governance tab
     * 
     * @param {boolean} forceRefresh - Force fresh render, bypass cache
     */
    async function renderGovernanceDashboard(forceRefresh = false) {
        console.log('🎯 Rendering Governance Dashboard...');
        
        const governanceContent = document.getElementById('governance-content');
        const governanceLoading = document.getElementById('governance-loading');
        
        if (!governanceContent) {
            console.error('Governance content container not found');
            return;
        }
        
        // Check cache validity
        const now = Date.now();
        const cacheValid = cachedGovernanceHTML && 
                           cacheTimestamp && 
                           (now - cacheTimestamp) < CACHE_TTL;
        
        if (cacheValid && !forceRefresh) {
            console.log('📦 Using cached governance content');
            governanceContent.innerHTML = cachedGovernanceHTML;
            // Re-attach event listeners for cached content
            attachGovernanceEventListeners();
            return;
        }
        
        // Prevent multiple simultaneous renders
        if (isRendering) {
            console.warn('⚠️ Render already in progress, cancelling previous render...');
            if (currentAbortController) {
                currentAbortController.abort();
            }
            isRendering = false;
        }
        
        // Set rendering flag
        isRendering = true;
        currentAbortController = new AbortController();
        
        try {
            // Show loading state
            if (governanceLoading) {
                governanceLoading.classList.remove('hidden');
                governanceLoading.style.display = '';
                governanceLoading.setAttribute('aria-hidden', 'false');
            }
            governanceContent.innerHTML = '';
            
            // Calculate governance data client-side
            console.log('Calculating governance data client-side...');
            const portfolioData = window.State.getPortfolioData();
            
            if (!portfolioData || portfolioData.length === 0) {
                throw new Error('No portfolio data available. Please refresh data first.');
            }
            
            // Calculate all governance metrics
            const governanceData = window.DataManager.Governance.calculateAll(portfolioData);
            console.log('Governance data calculated:', governanceData);
            
            // PERFORMANCE: Use DocumentFragment for batch DOM insertion
            const fragment = document.createDocumentFragment();
            
            // ========== SECTION 1: ACTION LAYER (TOP - Always Visible) ==========
            const actionLayer = await createActionLayer(governanceData);
            fragment.appendChild(actionLayer);
            
            // ========== SECTION 2: METRICS COVERAGE (Collapsible) ==========
            if (window.UIGovernance && window.UIGovernance.Sections) {
                const metricsCoverageSection = window.UIGovernance.Sections.createMetricsCoverageSection(governanceData);
                fragment.appendChild(metricsCoverageSection);
            }
            
            // ========== SECTION 3: PORTFOLIO DISTRIBUTION (Collapsible) ==========
            if (window.UIGovernance && window.UIGovernance.Sections) {
                const portfolioDistSection = window.UIGovernance.Sections.createPortfolioDistributionSection(governanceData);
                fragment.appendChild(portfolioDistSection);
            }
            
            // ========== SECTION 4: RESOURCE ALLOCATION (Collapsible) ==========
            if (window.UIGovernance && window.UIGovernance.Sections) {
                const allocationSection = window.UIGovernance.Sections.createAllocationSection(governanceData);
                fragment.appendChild(allocationSection);
            }
            
            // ========== SECTION 5: EXECUTIVE METRICS (Collapsible) ==========
            if (window.UIGovernance && window.UIGovernance.Sections) {
                const executiveSection = window.UIGovernance.Sections.createHealthSection(governanceData);
                fragment.appendChild(executiveSection);
            }
            
            // Append all sections at once (single reflow)
            governanceContent.appendChild(fragment);
            
            // Cache the rendered content
            cachedGovernanceHTML = governanceContent.innerHTML;
            cacheTimestamp = now;
            console.log('💾 Governance content cached');
            
            // Hide loading, attach event listeners
            if (governanceLoading) {
                governanceLoading.classList.add('hidden');
                governanceLoading.setAttribute('aria-hidden', 'true');
            }
            
            attachGovernanceEventListeners();
            
            console.log('✅ Governance Dashboard rendered successfully');
            
        } catch (error) {
            console.error('Error rendering governance dashboard:', error);
            
            if (governanceContent) {
                governanceContent.innerHTML = `
                    <div class="error-state">
                        <h2>⚠️ Unable to Load Governance Dashboard</h2>
                        <p>${error.message}</p>
                        <button class="btn-primary" onclick="window.UIGovernance.Core.renderGovernanceDashboard(true)">
                            Try Again
                        </button>
                    </div>
                `;
            }
            
            if (window.Utils && window.Utils.logCriticalError) {
                window.Utils.logCriticalError('GovernanceRender', error, {
                    filterContext: currentFilterContext
                });
            }
        } finally {
            isRendering = false;
            if (governanceLoading) {
                governanceLoading.classList.add('hidden');
            }
        }
    }
    
    /**
     * Create Action Layer with AI Summary and Smoke Detector Scorecard
     */
    async function createActionLayer(governanceData) {
        const section = document.createElement('section');
        section.className = 'action-layer';
        section.setAttribute('aria-label', 'Action Layer');
        
        // Delegate to Smoke module
        if (window.UIGovernance && window.UIGovernance.Smoke) {
            const aiCard = window.UIGovernance.Smoke.createAISummaryCard(governanceData);
            const smokeCard = window.UIGovernance.Smoke.createSmokeDetectorScorecard(governanceData.smokeDetectorData);
            
            section.appendChild(aiCard);
            section.appendChild(smokeCard);
        }
        
        return section;
    }
    
    /**
     * Attach event listeners to governance dashboard elements
     */
    function attachGovernanceEventListeners() {
        // Collapsible sections
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', function() {
                const section = this.parentElement;
                const content = section.querySelector('.collapsible-content');
                const isExpanded = section.classList.contains('expanded');
                
                if (isExpanded) {
                    section.classList.remove('expanded');
                    content.style.maxHeight = '0';
                } else {
                    section.classList.add('expanded');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
        
        // Smoke detector drill-down buttons
        document.querySelectorAll('.smoke-drill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const issueType = this.dataset.issueType;
                if (window.UIGovernance && window.UIGovernance.Smoke) {
                    const governanceData = window.DataManager.Governance.calculateAll(window.State.getPortfolioData());
                    window.UIGovernance.Smoke.showSmokeDetectorModal(governanceData.smokeDetectorData);
                }
            });
        });
        
        console.log('✅ Governance event listeners attached');
    }
    
    /**
     * Apply strategic filters to governance dashboard
     */
    function applyStrategicFilters(filterContext) {
        console.log('Applying strategic filters:', filterContext);
        currentFilterContext = filterContext;
        isUsingFilteredData = true;
        
        // Clear cache and force fresh render with filters
        clearCache();
        renderGovernanceDashboard(true);
        
        // Show filter badge
        if (window.UIGovernance && window.UIGovernance.Filters) {
            window.UIGovernance.Filters.showFilterBadge(filterContext);
        }
    }
    
    /**
     * Clear governance render cache
     */
    function clearCache() {
        cachedGovernanceHTML = null;
        cacheTimestamp = null;
        console.log('🗑️ Governance cache cleared');
    }
    
    /**
     * Get current filter context
     */
    function getCurrentFilterContext() {
        return currentFilterContext;
    }
    
    /**
     * Cancel ongoing render
     */
    function cancelRender() {
        if (currentAbortController) {
            currentAbortController.abort();
            console.log('Render cancelled');
        }
        isRendering = false;
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.UIGovernance = window.UIGovernance || {};
    
    // Export Core API
    window.UIGovernance.Core = {
        renderGovernanceDashboard,
        applyStrategicFilters,
        clearCache,
        getCurrentFilterContext,
        cancelRender
    };
    
    console.log('✅ UI Governance Core module loaded');
})();

