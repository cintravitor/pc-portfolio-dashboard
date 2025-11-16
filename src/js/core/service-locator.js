/**
 * Service Locator for Dependency Injection
 * 
 * Lightweight dependency injection pattern for Vanilla JS applications.
 * Provides explicit dependency management as an alternative to implicit window.* globals.
 * 
 * Benefits:
 * - Explicit dependencies visible in code
 * - Testable (can inject mocks)
 * - Fail-fast (errors if dependencies missing)
 * - Zero runtime overhead (Map-based lookup)
 * - No framework or build step required
 * 
 * Usage:
 * ```javascript
 * // Register a service
 * Services.register('DataManager', window.DataManager, ['State', 'Utils']);
 * 
 * // Get a service
 * const dataManager = Services.get('DataManager');
 * 
 * // Check if service exists
 * if (Services.has('Analytics')) { ... }
 * ```
 * 
 * @module service-locator
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // ==================== PRIVATE STATE ====================
    
    /**
     * Registered services storage
     * @private
     * @type {Map<string, any>}
     */
    const services = new Map();
    
    /**
     * Service dependencies storage
     * Maps service name to array of dependency names
     * @private
     * @type {Map<string, Array<string>>}
     */
    const dependencies = new Map();
    
    /**
     * Service metadata storage
     * Stores registration time, version, etc.
     * @private
     * @type {Map<string, Object>}
     */
    const metadata = new Map();
    
    // ==================== PUBLIC API ====================
    
    /**
     * Register a service with optional dependencies
     * 
     * @param {string} name - Service name (e.g., 'DataManager', 'State')
     * @param {Function|Object} service - Service implementation
     * @param {Array<string>} [deps=[]] - Array of dependency names
     * @param {Object} [meta={}] - Optional metadata (version, description, etc.)
     * 
     * @throws {Error} If name is empty or service is null/undefined
     * 
     * @example
     * // Simple registration
     * Services.register('Utils', window.Utils);
     * 
     * // With dependencies
     * Services.register('DataManager', window.DataManager, ['State', 'Utils']);
     * 
     * // With metadata
     * Services.register('Analytics', analyticsModule, [], { version: '1.0.0' });
     */
    function register(name, service, deps = [], meta = {}) {
        // Validation
        if (!name || typeof name !== 'string') {
            throw new Error('Service name must be a non-empty string');
        }
        
        if (service === null || service === undefined) {
            throw new Error(`Cannot register null/undefined service: ${name}`);
        }
        
        // Warn if overwriting existing service
        if (services.has(name)) {
            console.warn(`⚠️ Service "${name}" is being overwritten`);
        }
        
        // Store service, dependencies, and metadata
        services.set(name, service);
        dependencies.set(name, deps || []);
        metadata.set(name, {
            registeredAt: Date.now(),
            version: meta.version || '1.0.0',
            description: meta.description || '',
            ...meta
        });
        
        console.log(`✅ Service registered: ${name}${deps.length > 0 ? ` (deps: ${deps.join(', ')})` : ''}`);
    }
    
    /**
     * Get a service by name
     * Validates that all dependencies are also registered
     * 
     * @param {string} name - Service name
     * @returns {any} Service instance
     * @throws {Error} If service not found or dependencies missing
     * 
     * @example
     * const dataManager = Services.get('DataManager');
     * const state = Services.get('State');
     */
    function get(name) {
        // Check if service exists
        if (!services.has(name)) {
            const available = Array.from(services.keys()).join(', ');
            throw new Error(
                `Service not found: "${name}"\n` +
                `Available services: ${available || 'none'}`
            );
        }
        
        // Check dependencies
        const deps = dependencies.get(name) || [];
        const missingDeps = deps.filter(dep => !services.has(dep));
        
        if (missingDeps.length > 0) {
            throw new Error(
                `Service "${name}" has missing dependencies: ${missingDeps.join(', ')}\n` +
                `Make sure to register dependencies before the service that needs them.`
            );
        }
        
        return services.get(name);
    }
    
    /**
     * Check if a service is registered
     * 
     * @param {string} name - Service name
     * @returns {boolean} True if service is registered
     * 
     * @example
     * if (Services.has('Analytics')) {
     *     const analytics = Services.get('Analytics');
     * }
     */
    function has(name) {
        return services.has(name);
    }
    
    /**
     * Unregister a service
     * Useful for testing or hot-reloading
     * 
     * @param {string} name - Service name to unregister
     * @returns {boolean} True if service was unregistered
     * 
     * @example
     * Services.unregister('TestService');
     */
    function unregister(name) {
        if (!services.has(name)) {
            console.warn(`⚠️ Cannot unregister non-existent service: ${name}`);
            return false;
        }
        
        services.delete(name);
        dependencies.delete(name);
        metadata.delete(name);
        
        console.log(`🗑️ Service unregistered: ${name}`);
        return true;
    }
    
    /**
     * Clear all registered services
     * Useful for testing or complete reset
     * 
     * @example
     * Services.clear(); // Reset all services
     */
    function clear() {
        const count = services.size;
        services.clear();
        dependencies.clear();
        metadata.clear();
        console.log(`🗑️ Cleared ${count} service(s)`);
    }
    
    /**
     * Get dependency graph for debugging
     * Shows all services and their dependencies
     * 
     * @returns {Object} Dependency graph object
     * 
     * @example
     * const graph = Services.getDependencyGraph();
     * console.table(graph);
     */
    function getDependencyGraph() {
        const graph = {};
        
        services.forEach((service, name) => {
            graph[name] = {
                dependencies: dependencies.get(name) || [],
                hasDependencies: (dependencies.get(name) || []).length > 0,
                metadata: metadata.get(name) || {}
            };
        });
        
        return graph;
    }
    
    /**
     * Get list of all registered service names
     * 
     * @returns {Array<string>} Array of service names
     * 
     * @example
     * const allServices = Services.list();
     * console.log('Registered services:', allServices);
     */
    function list() {
        return Array.from(services.keys());
    }
    
    /**
     * Get service metadata
     * 
     * @param {string} name - Service name
     * @returns {Object|null} Metadata object or null if not found
     * 
     * @example
     * const meta = Services.getMetadata('DataManager');
     * console.log('Version:', meta.version);
     */
    function getMetadata(name) {
        return metadata.get(name) || null;
    }
    
    /**
     * Get statistics about registered services
     * 
     * @returns {Object} Statistics object
     * 
     * @example
     * const stats = Services.getStats();
     * console.log(`${stats.totalServices} services registered`);
     */
    function getStats() {
        const allDeps = Array.from(dependencies.values()).flat();
        const uniqueDeps = new Set(allDeps);
        
        return {
            totalServices: services.size,
            servicesWithDeps: Array.from(dependencies.values()).filter(d => d.length > 0).length,
            totalDependencies: allDeps.length,
            uniqueDependencies: uniqueDeps.size,
            services: Array.from(services.keys())
        };
    }
    
    /**
     * Validate all service dependencies
     * Checks that all declared dependencies are registered
     * 
     * @returns {Object} Validation result { valid: boolean, errors: Array }
     * 
     * @example
     * const result = Services.validate();
     * if (!result.valid) {
     *     console.error('Dependency errors:', result.errors);
     * }
     */
    function validate() {
        const errors = [];
        
        dependencies.forEach((deps, serviceName) => {
            const missingDeps = deps.filter(dep => !services.has(dep));
            
            if (missingDeps.length > 0) {
                errors.push({
                    service: serviceName,
                    missingDependencies: missingDeps
                });
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    // ==================== AUTO-REGISTRATION ====================
    
    /**
     * Auto-register existing window.* services
     * Scans common namespaces and registers them automatically
     * 
     * @private
     */
    function autoRegisterExistingServices() {
        const knownServices = [
            { name: 'Utils', service: window.Utils, deps: [] },
            { name: 'State', service: window.State, deps: [] },
            { name: 'DataManager', service: window.DataManager, deps: ['State', 'Utils'] },
            { name: 'UIManager', service: window.UIManager, deps: ['DataManager', 'State', 'Utils'] },
            { name: 'PerformanceMonitor', service: window.PerformanceMonitor, deps: [] },
            { name: 'AIRecommendations', service: window.AIRecommendations, deps: [] }
        ];
        
        let registered = 0;
        
        knownServices.forEach(({ name, service, deps }) => {
            if (service) {
                register(name, service, deps, { autoRegistered: true });
                registered++;
            }
        });
        
        if (registered > 0) {
            console.log(`📦 Auto-registered ${registered} existing service(s)`);
        }
    }
    
    // ==================== MODULE EXPORTS ====================
    
    /**
     * Service Locator public API
     * @namespace Services
     */
    const ServiceLocator = {
        // Core API
        register,
        get,
        has,
        unregister,
        clear,
        
        // Inspection API
        list,
        getDependencyGraph,
        getMetadata,
        getStats,
        validate,
        
        // Version
        version: '1.0.0'
    };
    
    // Export to global namespace
    window.Services = ServiceLocator;
    
    // Auto-register existing services
    autoRegisterExistingServices();
    
    // Log statistics
    const stats = getStats();
    console.log('✅ Service Locator loaded');
    console.log(`📦 ${stats.totalServices} service(s) registered, ${stats.totalDependencies} total dependencies`);
    
})();

