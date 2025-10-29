/**
 * Performance Monitoring Module
 * Tracks Core Web Vitals and enforces performance budgets
 * 
 * @version 8.0.0
 */

(function() {
    'use strict';
    
    // ==================== PERFORMANCE BUDGETS ====================
    
    const PERFORMANCE_BUDGETS = {
        FCP: 1800,      // First Contentful Paint: 1.8s
        LCP: 2500,      // Largest Contentful Paint: 2.5s
        FID: 100,       // First Input Delay: 100ms
        CLS: 0.1,       // Cumulative Layout Shift: 0.1
        TTI: 3500       // Time to Interactive: 3.5s
    };
    
    // Metrics storage
    const metrics = {};
    
    // ==================== CORE WEB VITALS TRACKING ====================
    
    /**
     * Measure page load performance
     * Tracks Core Web Vitals and logs warnings if budgets exceeded
     */
    function measurePageLoad() {
        if (!window.PerformanceObserver) {
            console.warn('⚠️ PerformanceObserver not supported - performance monitoring disabled');
            return;
        }
        
        console.log('📊 Performance monitoring initialized');
        
        // Track paint timing (FCP, LCP)
        try {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const metricName = entry.name === 'first-contentful-paint' ? 'FCP' : entry.name;
                    const value = entry.startTime;
                    
                    metrics[metricName] = value;
                    console.log(`📊 ${metricName}: ${value.toFixed(0)}ms`);
                    
                    // Check against budget
                    const budget = PERFORMANCE_BUDGETS[metricName];
                    if (budget && value > budget) {
                        console.warn(`⚠️ ${metricName} exceeds budget: ${value.toFixed(0)}ms > ${budget}ms`);
                    } else if (budget) {
                        console.log(`✅ ${metricName} within budget (${value.toFixed(0)}ms < ${budget}ms)`);
                    }
                }
            });
            
            paintObserver.observe({ entryTypes: ['paint'] });
        } catch (error) {
            console.warn('⚠️ Paint timing observer failed:', error.message);
        }
        
        // Track Largest Contentful Paint (LCP)
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                const value = lastEntry.renderTime || lastEntry.loadTime;
                
                metrics.LCP = value;
                console.log(`📊 LCP: ${value.toFixed(0)}ms`);
                
                if (value > PERFORMANCE_BUDGETS.LCP) {
                    console.warn(`⚠️ LCP exceeds budget: ${value.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.LCP}ms`);
                } else {
                    console.log(`✅ LCP within budget (${value.toFixed(0)}ms < ${PERFORMANCE_BUDGETS.LCP}ms)`);
                }
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('⚠️ LCP observer failed:', error.message);
        }
        
        // Track First Input Delay (FID)
        try {
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const value = entry.processingStart - entry.startTime;
                    
                    metrics.FID = value;
                    console.log(`📊 FID: ${value.toFixed(0)}ms`);
                    
                    if (value > PERFORMANCE_BUDGETS.FID) {
                        console.warn(`⚠️ FID exceeds budget: ${value.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.FID}ms`);
                    } else {
                        console.log(`✅ FID within budget (${value.toFixed(0)}ms < ${PERFORMANCE_BUDGETS.FID}ms)`);
                    }
                }
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('⚠️ FID observer failed:', error.message);
        }
        
        // Track Cumulative Layout Shift (CLS)
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                metrics.CLS = clsValue;
                
                if (clsValue > PERFORMANCE_BUDGETS.CLS) {
                    console.warn(`⚠️ CLS exceeds budget: ${clsValue.toFixed(3)} > ${PERFORMANCE_BUDGETS.CLS}`);
                }
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('⚠️ CLS observer failed:', error.message);
        }
        
        // Measure Time to Interactive (TTI) - approximation using load event
        window.addEventListener('load', () => {
            const tti = performance.now();
            metrics.TTI = tti;
            console.log(`📊 TTI (approx): ${tti.toFixed(0)}ms`);
            
            if (tti > PERFORMANCE_BUDGETS.TTI) {
                console.warn(`⚠️ TTI exceeds budget: ${tti.toFixed(0)}ms > ${PERFORMANCE_BUDGETS.TTI}ms`);
            } else {
                console.log(`✅ TTI within budget (${tti.toFixed(0)}ms < ${PERFORMANCE_BUDGETS.TTI}ms)`);
            }
            
            // Log summary after page load
            logPerformanceSummary();
        });
    }
    
    /**
     * Log performance summary
     */
    function logPerformanceSummary() {
        console.log('');
        console.log('='.repeat(60));
        console.log('📊 PERFORMANCE SUMMARY');
        console.log('='.repeat(60));
        
        const metricsToShow = ['FCP', 'LCP', 'FID', 'CLS', 'TTI'];
        metricsToShow.forEach(metric => {
            if (metrics[metric] !== undefined) {
                const value = metrics[metric];
                const budget = PERFORMANCE_BUDGETS[metric];
                const unit = metric === 'CLS' ? '' : 'ms';
                const status = budget && value > budget ? '❌' : '✅';
                
                console.log(`${status} ${metric}: ${value.toFixed(metric === 'CLS' ? 3 : 0)}${unit} (budget: ${budget}${unit})`);
            }
        });
        
        console.log('='.repeat(60));
        console.log('');
    }
    
    /**
     * Measure module load time
     * @param {string} moduleName - Name of the module
     * @param {number} startTime - Performance.now() at module start
     */
    function measureModuleLoadTime(moduleName, startTime) {
        const elapsed = performance.now() - startTime;
        console.log(`⏱️ ${moduleName} loaded in ${elapsed.toFixed(0)}ms`);
        
        if (elapsed > 500) {
            console.warn(`⚠️ ${moduleName} load time exceeds 500ms budget`);
        }
        
        return elapsed;
    }
    
    /**
     * Measure operation duration
     * @param {string} operationName - Name of the operation
     * @param {Function} operation - Function to measure
     * @returns {Promise<any>} Result of the operation
     */
    async function measureOperation(operationName, operation) {
        const startTime = performance.now();
        
        try {
            const result = await operation();
            const elapsed = performance.now() - startTime;
            console.log(`⏱️ ${operationName}: ${elapsed.toFixed(2)}ms`);
            return result;
        } catch (error) {
            const elapsed = performance.now() - startTime;
            console.error(`❌ ${operationName} failed after ${elapsed.toFixed(2)}ms:`, error);
            throw error;
        }
    }
    
    /**
     * Get current metrics
     * @returns {Object} Current performance metrics
     */
    function getMetrics() {
        return { ...metrics };
    }
    
    /**
     * Get performance budgets
     * @returns {Object} Performance budgets
     */
    function getBudgets() {
        return { ...PERFORMANCE_BUDGETS };
    }
    
    // ==================== AUTO-INITIALIZATION ====================
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', measurePageLoad);
    } else {
        // DOM already loaded
        measurePageLoad();
    }
    
    // ==================== EXPORTS ====================
    
    window.PerformanceMonitor = {
        measurePageLoad,
        measureModuleLoadTime,
        measureOperation,
        getMetrics,
        getBudgets,
        BUDGETS: PERFORMANCE_BUDGETS
    };
    
    console.log('✅ Performance Monitor module loaded');
})();

