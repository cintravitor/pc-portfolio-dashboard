/**
 * UI Detail Panel Module
 * Handles full-screen modal overlay for solution details with liquid glass styling
 * 
 * Features:
 * - Full-screen immersive modal (100vw x 100vh)
 * - History API integration with URL hash navigation
 * - Browser back button support
 * - Tab-based navigation (Metrics | Core Details)
 * - Single view at a time prevents overlap issues
 * - Smooth tab switching with animations
 * - Multiple close methods: X button, backdrop click, ESC key
 * 
 * Part of the modular UI architecture
 * @module ui-detail-panel
 */

(function() {
    'use strict';
    
    // ==================== HISTORY API HELPERS ====================
    
    /**
     * Convert product name to URL-friendly slug
     * @param {string} name - Product name
     * @returns {string} URL slug
     */
    function createSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Store original URL when first modal opens (for restoration)
    let originalUrlBeforeModal = null;
    
    // Initialize: Ensure we have a base dashboard state in history
    // This prevents browser back from leaving the site when closing modals
    (function initializeDashboardHistory() {
        // Only if we're on the dashboard (no hash) and haven't already set this
        if (!window.location.hash && !history.state?.isDashboardBase) {
            history.replaceState({ isDashboardBase: true }, '', window.location.href);
        }
    })();
    
    /**
     * Update URL hash when modal opens
     * @param {Object} product - Product object
     */
    function pushModalState(product) {
        // Store original URL only on first modal open (no hash present)
        if (!window.location.hash) {
            originalUrlBeforeModal = window.location.pathname + window.location.search;
        }
        
        const slug = createSlug(product.name);
        const hash = `#/solution/${slug}`;
        
        // Use replaceState instead of pushState to avoid adding history entries
        // This prevents navigation to external pages when closing modal
        history.replaceState({ 
            productId: product.id, 
            slug,
            isModal: true 
        }, '', hash);
        
        window.State.setDetailModalOpen(true);
        window.State.setCurrentDetailModalProduct(product);
    }
    
    /**
     * Clear URL hash when modal closes
     */
    function popModalState() {
        if (window.location.hash && originalUrlBeforeModal) {
            // Restore the original URL from before any modals were opened
            history.replaceState(null, '', originalUrlBeforeModal);
            originalUrlBeforeModal = null; // Reset for next modal session
        } else if (window.location.hash) {
            // Fallback: just remove hash
            const urlWithoutHash = window.location.pathname + window.location.search;
            history.replaceState(null, '', urlWithoutHash);
        }
        window.State.setDetailModalOpen(false);
        window.State.setCurrentDetailModalProduct(null);
    }
    
    // NOTE: generateAIRecommendation and generateRuleBasedRecommendation 
    // have been moved to ui-metric-cards.js module for better isolation
    
    // NOTE: calculateLastMonthPerformance and generatePerformanceIndicator 
    // have been moved to ui-metric-cards.js module for better isolation
    
    /**
     * Generate metrics section HTML content
     * Now delegates to ui-metric-cards.js module for actual rendering
     * @param {Object} product - Product data
     * @returns {string} HTML string with empty metrics grid (populated by module)
     * @requires window.UIManager.MetricCards - Isolated metric card rendering module
     */
    function generateMetricsContent(product) {
        // Return empty grid structure - metrics cards module will populate it
        return `
            <div class="metrics-grid" id="metrics-grid-container"></div>
        `;
    }
    
    /**
     * Generate core details section HTML content
     * @param {Object} product - Product data
     * @returns {string} HTML string
     */
    function generateCoreDetailsContent(product) {
        return `
            <div class="core-details-grid">
                <!-- Owner -->
                <div class="detail-field">
                    <div class="detail-field-label">Owner</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.owner) || 'Not assigned'}</div>
                </div>
                
                <!-- Maturity Stage -->
                <div class="detail-field">
                    <div class="detail-field-label">Maturity Stage</div>
                    <div class="detail-field-value">
                        <span class="status-badge ${window.Utils.getStatusClass(product.maturity)}">
                            ${window.Utils.escapeHtml(product.maturity) || 'Not specified'}
                        </span>
                    </div>
                </div>
                
                <!-- Target User -->
                ${product.targetUser ? `
                <div class="detail-field">
                    <div class="detail-field-label">Target User</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.targetUser)}</div>
                </div>
                ` : ''}
                
                <!-- Platform -->
                <div class="detail-field">
                    <div class="detail-field-label">Platform</div>
                    <div class="detail-field-value ${!product.platform ? 'empty' : ''}">
                        ${window.Utils.escapeHtml(product.platform) || 'Not specified'}
                    </div>
                </div>
                
                <!-- Journey Stage Impacted -->
                ${product.journeyMain ? `
                <div class="detail-field ${!product.targetUser && !product.regulatory ? 'full-width' : ''}">
                    <div class="detail-field-label">Journey Stage Impacted</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.journeyMain)}</div>
                </div>
                ` : ''}
                
                <!-- Regulatory Demand -->
                ${product.regulatory ? `
                <div class="detail-field ${!product.targetUser ? 'full-width' : ''}">
                    <div class="detail-field-label">Regulatory Demand</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.regulatory)}</div>
                </div>
                ` : ''}
                
                <!-- Problem (Full Width) -->
                ${product.problem ? `
                <div class="detail-field full-width">
                    <div class="detail-field-label">Problem</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.problem)}</div>
                </div>
                ` : ''}
                
                <!-- Solution (Full Width) -->
                ${product.solution ? `
                <div class="detail-field full-width">
                    <div class="detail-field-label">Solution</div>
                    <div class="detail-field-value">${window.Utils.escapeHtml(product.solution)}</div>
                </div>
                ` : ''}
                
                <!-- Platform Contextual Note (Full Width) -->
                ${product.platform ? `
                <div class="detail-field-note platform-note">
                    <div class="field-note-icon">💡</div>
                    <div class="field-note-text">
                        This solution is delivered through <strong>${window.Utils.escapeHtml(product.platform)}</strong>. 
                        Understanding the platform helps in resource allocation and technical decision-making.
                    </div>
                </div>
                ` : `
                <div class="detail-field-note warning platform-note">
                    <div class="field-note-icon">⚠️</div>
                    <div class="field-note-text">
                        Platform information is not specified. Consider documenting the technical platform for better resource planning.
                    </div>
                </div>
                `}
            </div>
        `;
    }
    
    /**
     * Get navigation info for current solution
     * @param {number} productId - Current product ID
     * @returns {Object} Navigation context
     */
    function getNavigationContext(productId) {
        const filteredData = window.DataManager.getFilteredData();
        const currentIndex = filteredData.findIndex(p => p.id === productId);
        
        return {
            currentIndex,
            total: filteredData.length,
            hasPrevious: currentIndex > 0,
            hasNext: currentIndex < filteredData.length - 1,
            previousId: currentIndex > 0 ? filteredData[currentIndex - 1].id : null,
            nextId: currentIndex < filteredData.length - 1 ? filteredData[currentIndex + 1].id : null,
            previousName: currentIndex > 0 ? filteredData[currentIndex - 1].name : null,
            nextName: currentIndex < filteredData.length - 1 ? filteredData[currentIndex + 1].name : null
        };
    }
    
    /**
     * Navigate to another solution (with animation)
     * @param {string} direction - 'previous' or 'next'
     */
    function navigateToSolution(direction) {
        const currentProduct = window.State.getCurrentDetailModalProduct();
        if (!currentProduct) return;
        
        const navContext = getNavigationContext(currentProduct.id);
        const targetId = direction === 'previous' ? navContext.previousId : navContext.nextId;
        
        if (targetId !== null) {
            // Quick transition: close current, open next
            showDetailPanel(targetId);
        }
    }
    
    /**
     * Show detail panel for a product with streamlined attribute display
     * Displays essential ownership and context information in scannable format
     * @param {number} productId - Product ID to display
     * @requires window.DataManager.getProductById - Fetch product data
     * @requires window.State - Modal state management
     * @requires window.UIManager.MetricCards - Render metric cards
     * @requires window.UIManager.ModalTabs - Handle tab navigation
     * @requires window.UIManager.Charts - Render charts
     */
    function showDetailPanel(productId) {
        const product = window.DataManager.getProductById(productId);
        if (!product) return;

        const panel = document.getElementById('detail-panel');
        const overlay = document.getElementById('detail-panel-overlay');
        const mainContent = document.getElementById('main-content');
        const contentLeft = document.getElementById('content-left');

        // Remove selected class from all cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Find and store the clicked card for animation origin
        const clickedCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (clickedCard) {
            clickedCard.classList.add('selected');
        }
        
        // Capture card position for expanding animation (before rendering modal)
        let cardRect = null;
        if (clickedCard) {
            cardRect = clickedCard.getBoundingClientRect();
            // Store for close animation
            panel._originCard = clickedCard;
            panel._originRect = cardRect;
        }
        
        // Get navigation context
        const navContext = getNavigationContext(productId);

        // Check for alert context to display banner
        const alertContext = window.State.getAlertContext();
        const hasAlerts = alertContext && alertContext.productId === productId && alertContext.triggers && alertContext.triggers.length > 0;
        
        // Generate alert banner HTML if alerts exist
        let alertBannerHtml = '';
        if (hasAlerts) {
            const { triggers } = alertContext;
            const hasCritical = triggers.some(t => t.severity === 'critical');
            const severity = hasCritical ? 'critical' : 'warning';
            const icon = hasCritical ? '🔥' : '⚠️';
            const title = hasCritical ? 'Critical Alerts Detected' : 'Attention Required';
            
            const triggersListHtml = triggers.map(trigger => 
                `<li>${window.Utils.escapeHtml(trigger.message)}</li>`
            ).join('');
            
            alertBannerHtml = `
                <div class="detail-alert-banner ${severity}" role="alert" aria-live="assertive">
                    <div class="alert-banner-icon">${icon}</div>
                    <div class="alert-banner-content">
                        <div class="alert-banner-title">${title}</div>
                        <ul class="alert-banner-triggers">
                            ${triggersListHtml}
                        </ul>
                    </div>
                </div>
            `;
            
            // Log analytics event (AC 2.4)
            if (window.UIManager && window.UIManager.Analytics) {
                window.UIManager.Analytics.logAlertDetailPageViewed(severity, productId, triggers.length);
            }
        }

        panel.innerHTML = `
            <div class="detail-header">
                <button class="detail-close" aria-label="Close detail modal (press ESC or browser back)" role="button">×</button>
                <div class="detail-title" id="detail-modal-title" role="heading" aria-level="1">${window.Utils.escapeHtml(product.name)}</div>
                <div class="detail-header-meta">
                    <div class="detail-subtitle">${window.Utils.escapeHtml(product.area)}</div>
                    ${navContext.total > 1 ? `<div class="detail-progress">Solution ${navContext.currentIndex + 1} of ${navContext.total}</div>` : ''}
                </div>
            </div>
            ${navContext.hasPrevious ? `
                <button class="modal-nav-btn modal-nav-previous" 
                        aria-label="Previous solution: ${window.Utils.escapeHtml(navContext.previousName)}"
                        title="${window.Utils.escapeHtml(navContext.previousName)}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
            ` : ''}
            ${navContext.hasNext ? `
                <button class="modal-nav-btn modal-nav-next" 
                        aria-label="Next solution: ${window.Utils.escapeHtml(navContext.nextName)}"
                        title="${window.Utils.escapeHtml(navContext.nextName)}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            ` : ''}
            <div class="detail-body">
                ${alertBannerHtml}
                <!-- Tab Navigation -->
                <div class="detail-tabs" role="tablist" aria-label="Solution details navigation">
                    <button class="detail-tab active" data-tab="metrics" role="tab" aria-selected="true" aria-controls="tab-metrics">
                        <span class="detail-tab-icon" aria-hidden="true">📊</span>
                        <div class="detail-tab-label">
                            <span class="detail-tab-title">Metrics</span>
                            <span class="detail-tab-subtitle">Track performance and take action</span>
                        </div>
                    </button>
                    <button class="detail-tab" data-tab="core-details" role="tab" aria-selected="false" aria-controls="tab-core-details">
                        <span class="detail-tab-icon" aria-hidden="true">📋</span>
                        <div class="detail-tab-label">
                            <span class="detail-tab-title">Core Details</span>
                            <span class="detail-tab-subtitle">Essential product information</span>
                        </div>
                    </button>
                </div>
                
                <!-- Tab Content: Metrics -->
                <div class="detail-tab-content active" id="tab-metrics" role="tabpanel" aria-labelledby="detail-modal-title">
                    ${generateMetricsContent(product)}
                </div>
                
                <!-- Tab Content: Core Details -->
                <div class="detail-tab-content" id="tab-core-details" role="tabpanel" aria-labelledby="detail-modal-title">
                    ${generateCoreDetailsContent(product)}
                </div>
            </div>
        `;

        // Show overlay and panel with expanding card animation
        overlay.classList.remove('hidden');
        panel.classList.remove('hidden');
        
        // Add ARIA attributes to overlay and panel for accessibility
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'detail-modal-title');
        
        // Allow body scroll to see dashboard content below modal
        // Note: Modal has its own internal scrolling via overflow-y: auto
        
        // Store previously focused element for restoration on close
        const previouslyFocused = document.activeElement;
        panel._previouslyFocused = previouslyFocused;
        
        // PREMIUM ANIMATION: Expanding card effect
        if (cardRect) {
            // Start overlay at transparent
            overlay.style.opacity = '0';
            
            // Set panel initial state to match card position/size
            // Account for modal being centered (50%) and offset from top (2vh)
            const modalCenterX = window.innerWidth / 2;
            const modalTop = window.innerHeight * 0.02;
            const modalCenterY = modalTop + (window.innerHeight * 0.94) / 2;
            
            const scaleX = cardRect.width / (window.innerWidth * 0.96);
            const scaleY = cardRect.height / (window.innerHeight * 0.94);
            const translateX = cardRect.left + (cardRect.width / 2) - modalCenterX;
            const translateY = cardRect.top + (cardRect.height / 2) - modalCenterY;
            
            // Initial transform with proper positioning (account for translateX(-50%) base)
            panel.style.transform = `translateX(-50%) translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
            panel.style.opacity = '0.5';
            
            // Force reflow to ensure initial state is applied
            panel.offsetHeight;
            
            // Animate to full screen using requestAnimationFrame for smoothness
            requestAnimationFrame(() => {
                // Enable transitions
                overlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                panel.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Animate to centered modal position
                overlay.style.opacity = '1';
                panel.style.transform = 'translateX(-50%) translate(0, 0) scale(1, 1)';
                panel.style.opacity = '1';
                
                // Clean up transition styles after animation completes
                setTimeout(() => {
                    overlay.style.transition = '';
                    panel.style.transition = '';
                }, 300);
            });
        } else {
            // Fallback: simple fade-in if no card reference
            overlay.style.opacity = '1';
            panel.style.opacity = '1';
        }
        
        // Update URL hash (History API integration)
        pushModalState(product);
        
        // Setup tab navigation
        setupTabNavigation();
        
        // Setup modal close handlers
        setupModalCloseHandlers();
        
        // Setup navigation button handlers
        setupNavigationHandlers();
        
        // Focus close button for keyboard accessibility (after animation)
        setTimeout(() => {
            const closeBtn = panel.querySelector('.detail-close');
            if (closeBtn) {
                closeBtn.focus();
            }
        }, 210);

        
        // Render metric cards using the isolated module
        // Use setTimeout to ensure DOM is fully ready
        setTimeout(() => {
            const metricsGridContainer = document.getElementById('metrics-grid-container');
            
            if (!metricsGridContainer) {
                console.error('[Detail Panel] Metrics grid container not found');
                return;
            }
            
            if (!window.UIManager || !window.UIManager.MetricCards) {
                console.error('[Detail Panel] MetricCards module not loaded');
                return;
            }
            
            // Render both metric cards using the isolated module
            window.UIManager.MetricCards.renderGrid(metricsGridContainer, product);
        }, 50); // Small delay to ensure DOM is ready
    }
    
    // NOTE: generateAndDisplayRecommendations has been removed
    // Recommendations are now handled internally by ui-metric-cards.js module
    
    /**
     * Setup tab navigation in detail panel
     * Now delegates to ui-modal-tabs.js module
     * @requires window.UIManager.ModalTabs - Isolated tab navigation module
     */
    function setupTabNavigation() {
        if (!window.UIManager || !window.UIManager.ModalTabs) {
            console.error('[Detail Panel] ModalTabs module not loaded');
            return;
        }
        
        window.UIManager.ModalTabs.init();
    }
    
    /**
     * Setup event handlers for closing the modal
     * Handles backdrop click, ESC key, close button, and arrow key navigation
     */
    function setupModalCloseHandlers() {
        const overlay = document.getElementById('detail-panel-overlay');
        const panel = document.getElementById('detail-panel');
        const closeBtn = panel.querySelector('.detail-close');
        
        // Close button click
        closeBtn.addEventListener('click', hideDetailPanel);
        
        // Backdrop click (clicking outside modal) - disabled to allow scrolling
        // overlay.addEventListener('click', (e) => {
        //     if (e.target === overlay) {
        //         hideDetailPanel();
        //     }
        // });
        
        // Keyboard handlers (ESC to close, arrows to navigate)
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                hideDetailPanel();
                document.removeEventListener('keydown', keyHandler);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateToSolution('previous');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateToSolution('next');
            }
        };
        document.addEventListener('keydown', keyHandler);
        
        // Store handler reference for cleanup
        overlay._keyHandler = keyHandler;
    }
    
    /**
     * Setup navigation button handlers
     */
    function setupNavigationHandlers() {
        const prevBtn = document.querySelector('.modal-nav-previous');
        const nextBtn = document.querySelector('.modal-nav-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigateToSolution('previous'));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigateToSolution('next'));
        }
    }
    
    /**
     * Hide detail panel with contracting animation
     * @param {Object} options - Options object
     * @param {boolean} options.skipHistoryPop - Skip history.back() call (used when triggered by popstate)
     */
    function hideDetailPanel(options = {}) {
        const { skipHistoryPop = false } = options;
        
        // Clear URL hash (only if not triggered by popstate)
        if (!skipHistoryPop) {
            popModalState();
        }
        
        const overlay = document.getElementById('detail-panel-overlay');
        const panel = document.getElementById('detail-panel');
        
        // PREMIUM ANIMATION: Contracting card effect
        const originCard = panel._originCard;
        const originRect = panel._originRect;
        
        if (originCard && originRect) {
            // Get current position of origin card (may have moved due to filtering/scrolling)
            const currentCardRect = originCard.getBoundingClientRect();
            
            // Calculate transform to contract back to card (account for modal's new centered position)
            const modalCenterX = window.innerWidth / 2;
            const modalTop = window.innerHeight * 0.02;
            const modalCenterY = modalTop + (window.innerHeight * 0.94) / 2;
            
            const scaleX = currentCardRect.width / (window.innerWidth * 0.96);
            const scaleY = currentCardRect.height / (window.innerHeight * 0.94);
            const translateX = currentCardRect.left + (currentCardRect.width / 2) - modalCenterX;
            const translateY = currentCardRect.top + (currentCardRect.height / 2) - modalCenterY;
            
            // Enable transitions
            overlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            panel.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Animate back to card position
            overlay.style.opacity = '0';
            panel.style.transform = `translateX(-50%) translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
            panel.style.opacity = '0';
            
            // After animation completes, hide and cleanup
            setTimeout(() => {
                completeHidePanel(overlay, panel, skipHistoryPop);
            }, 300);
        } else {
            // Fallback: simple fade-out
            overlay.style.transition = 'opacity 0.15s ease';
            panel.style.transition = 'opacity 0.15s ease';
            overlay.style.opacity = '0';
            panel.style.opacity = '0';
            
            setTimeout(() => {
                completeHidePanel(overlay, panel, skipHistoryPop);
            }, 150);
        }
    }
    
    /**
     * Complete the hide panel operation (cleanup after animation)
     * @private
     * @requires window.State - State management
     * @requires window.UIManager.ModalTabs - Tab state reset
     * @requires window.Utils - Event publishing
     */
    function completeHidePanel(overlay, panel, skipHistoryPop) {
        // Clear alert context (part of contextual alerting feature)
        window.State.clearAlertContext();
        
        // Reset tab state
        if (window.UIManager && window.UIManager.ModalTabs) {
            window.UIManager.ModalTabs.reset();
        }
        
        // Destroy chart instances
        const chartInstances = window.State.getChartInstances();
        Object.values(chartInstances).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        window.State.clearAllChartInstances();
        
        // Clean up keyboard listeners
        if (overlay && overlay._keyHandler) {
            document.removeEventListener('keydown', overlay._keyHandler);
            overlay._keyHandler = null;
        }
        
        // Hide overlay and panel
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.transition = '';
            overlay.style.opacity = '';
        }
        if (panel) {
            panel.classList.add('hidden');
            panel.style.transition = '';
            panel.style.transform = '';
            panel.style.opacity = '';
        }
        
        // Restore body styles
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Restore focus to previously focused element (accessibility)
        if (panel && panel._previouslyFocused) {
            panel._previouslyFocused.focus();
            panel._previouslyFocused = null;
        }
        
        // Clean up animation references
        if (panel) {
            panel._originCard = null;
            panel._originRect = null;
        }
        
        // Remove selected class from cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Emit panel closed event
        window.Utils.publishEnhanced(window.Utils.EVENTS.UI.PANEL_CLOSED, {
            timestamp: Date.now()
        });
    }
    
    // Export to window.UIManager.DetailPanel namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.DetailPanel = {
        show: showDetailPanel,
        hide: hideDetailPanel
    };
    
    // Global exports for backward compatibility
    window.showDetailPanel = showDetailPanel;
    window.hideDetailPanel = hideDetailPanel;
    
    // Subscribe to ui:card:clicked event for automatic panel opening
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.UI.CARD_CLICKED, (data) => {
        console.log(`📡 ui-detail-panel received ui:card:clicked event (productId: ${data.productId})`);
        
        // Automatically open detail panel
        showDetailPanel(data.productId);
        
        // Emit panel opened event
        window.Utils.publishEnhanced(window.Utils.EVENTS.UI.PANEL_OPENED, {
            productId: data.productId
        });
    });
    
    // Listen for browser back/forward navigation (History API integration)
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.productId !== undefined) {
            // User navigated forward to a modal state
            showDetailPanel(event.state.productId);
        } else {
            // User navigated back from modal (or to base state)
            if (window.State.getIsDetailModalOpen()) {
                hideDetailPanel({ skipHistoryPop: true });
            }
        }
    });
    
    console.log('✅ UI Detail Panel module loaded (EVENT-DRIVEN + HISTORY API)');
    console.log('📡 Subscribed to: ui:card:clicked');
    console.log('🔗 URL Hash: Updates on modal open/close (no new history entries)');
})();
