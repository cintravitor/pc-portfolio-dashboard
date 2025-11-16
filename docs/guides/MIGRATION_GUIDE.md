# Migration Guide: Event-Driven Architecture & Service Locator

**Version:** 1.0.0  
**Date:** November 16, 2025  
**Status:** Production Ready ✅

---

## 📖 Overview

This guide helps developers migrate from legacy direct-call patterns to the new event-driven architecture with optional Service Locator dependency injection.

**Key Benefits:**
- **Loose Coupling:** Modules communicate via events, not direct calls
- **Testability:** Mock dependencies easily with Service Locator
- **Maintainability:** Changes in one module don't break others
- **Backward Compatible:** Existing code continues to work

---

## 🎯 Quick Reference

### Old Pattern (Legacy - Still Works)

```javascript
// Direct namespace access
const data = window.DataManager.Filtering.applyFilters(criteria);
window.State.setFilteredData(data);

// Implicit dependency on window.DataManager
function myFunction() {
    return window.DataManager.getSomeData();
}
```

### New Pattern (Recommended)

```javascript
// Event-driven communication
window.DataManager.filterData(criteria); // Emits data:filtered event

// Subscribe to events
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, (payload) => {
    console.log('Data filtered:', payload.count);
    updateUI(payload.filteredData);
});

// Optional: Service Locator for explicit dependencies
const dataManager = Services.get('DataManager'); // Validates deps exist
```

---

## 🔄 Migration Patterns

### Pattern 1: Replace Direct Calls with Event Subscriptions

**Before (Direct Call):**
```javascript
function updateCards() {
    const filteredData = window.DataManager.Filtering.getFilteredData();
    renderCards(filteredData);
}

// Must manually call updateCards() after filtering
function onFilterChange() {
    window.DataManager.Filtering.applyFilters(criteria);
    updateCards(); // Manual coupling
}
```

**After (Event-Driven):**
```javascript
// Subscribe once on initialization
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, (payload) => {
    renderCards(payload.filteredData); // Auto-updates!
});

// No need to manually trigger updates
function onFilterChange() {
    window.DataManager.filterData(criteria); // Emits event automatically
}
```

**Benefits:**
- Cards auto-update when data changes
- No manual coupling between filter logic and card rendering
- Other modules can also subscribe to same event

---

### Pattern 2: Use Facade API Instead of Sub-Modules

**Before (Direct Sub-Module Access):**
```javascript
// Directly accessing internal modules
const data = window.DataManager.Fetching.fetchFromServer();
const filtered = window.DataManager.Filtering.applyFilters(criteria);
const metrics = window.DataManager.Analytics.calculateMetrics();
```

**After (Facade API):**
```javascript
// Use simplified facade methods
const data = await window.DataManager.fetchData();           // Emits data:loaded
const filtered = window.DataManager.filterData(criteria);     // Emits data:filtered  
const metrics = window.DataManager.getSummaryMetrics();       // Read-only accessor
```

**Benefits:**
- Cleaner API with only 7 core methods
- All methods emit events automatically
- Internal implementation can change without breaking code

---

### Pattern 3: Use Typed Events Instead of Strings

**Before (String Events - Error Prone):**
```javascript
// Typo-prone strings
window.Utils.publish('dataFiltered', data);  // Typo: should be 'data:filtered'
window.Utils.subscribe('data_filtered', handler); // Wrong format!
```

**After (Typed Event Registry):**
```javascript
// Type-safe event constants
window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FILTERED, data);
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, handler);

// Autocomplete support + no typos!
```

**Available Event Categories:**
```javascript
window.Utils.EVENTS.DATA.*        // Data operations (loaded, filtered, updated)
window.Utils.EVENTS.UI.*          // UI interactions (card clicked, panel opened)
window.Utils.EVENTS.STATE.*       // State changes (portfolioData, filteredData)
window.Utils.EVENTS.FILTER.*      // Filter operations (applied, cleared)
window.Utils.EVENTS.GOVERNANCE.*  // Governance dashboard events
```

---

### Pattern 4: Optional Service Locator for Explicit Dependencies

**Before (Implicit Window Globals):**
```javascript
// Implicit dependency - hard to test
function calculateMetrics() {
    const data = window.DataManager.getPortfolioData(); // Implicit dependency
    const state = window.State.getCurrentTab();          // Implicit dependency
    return performCalculation(data, state);
}
```

**After (Explicit Dependencies with Service Locator):**
```javascript
// Explicit dependencies - easy to mock for testing
function calculateMetrics() {
    const dataManager = Services.get('DataManager'); // Validates dependency exists
    const state = Services.get('State');             // Explicit and testable
    
    const data = dataManager.getPortfolioData();
    const tab = state.getCurrentTab();
    return performCalculation(data, tab);
}

// Testing with mocks
function testCalculateMetrics() {
    // Inject mock DataManager
    Services.register('DataManager', mockDataManager);
    const result = calculateMetrics();
    // Clean up
    Services.unregister('DataManager');
}
```

**Benefits:**
- Dependencies visible in code
- Testable with mocks
- Fail-fast errors if dependency missing
- Zero runtime overhead (Map lookup)

---

## 🛠️ Step-by-Step Migration

### Step 1: Identify Direct Calls

Search your code for direct calls to:
- `window.DataManager.*`
- `window.State.set*`
- `window.UIManager.*`

### Step 2: Replace with Event-Driven Patterns

For each direct call, decide:

**Option A: Keep Direct Call (Read-Only)**
```javascript
// Read-only accessors are fine
const data = window.DataManager.getFilteredData(); // OK
const state = window.State.getCurrentTab();        // OK
```

**Option B: Replace with Event (State Changes)**
```javascript
// Before: Direct state change
window.State.setFilteredData(data);
updateCards(); // Manual coupling

// After: Subscribe to state change event
window.Utils.subscribeEnhanced(window.Utils.EVENTS.STATE.FILTERED_DATA_SET, (payload) => {
    updateCards(payload.newValue); // Auto-updates
});
```

**Option C: Use Facade API (Data Operations)**
```javascript
// Before: Direct module access
window.DataManager.Filtering.applyFilters(criteria);

// After: Facade method (emits event)
window.DataManager.filterData(criteria); // Emits data:filtered
```

### Step 3: Add Event Subscriptions

In your module's initialization:

```javascript
function initializeModule() {
    // Subscribe to relevant events
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, onDataLoaded);
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, onDataFiltered);
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.UI.TAB_CHANGED, onTabChanged);
    
    console.log('Module initialized with event subscriptions');
}
```

### Step 4: Test Backward Compatibility

Ensure existing code still works:

```javascript
// Legacy pattern still works
const data = window.DataManager.Filtering.getFilteredData();
window.State.setFilteredData(data);

// New pattern works alongside
window.DataManager.filterData(criteria); // Also emits events
```

---

## 📚 Complete Event Registry

### Data Layer Events

```javascript
// Data fetch lifecycle
window.Utils.EVENTS.DATA.FETCH_START      // { timestamp }
window.Utils.EVENTS.DATA.FETCH_SUCCESS    // { data, count, timestamp }
window.Utils.EVENTS.DATA.FETCH_ERROR      // { error, message }

// Data changes
window.Utils.EVENTS.DATA.LOADED           // { data, count, timestamp }
window.Utils.EVENTS.DATA.FILTERED         // { filteredData, criteria, count }
window.Utils.EVENTS.DATA.UPDATED          // { updatedData, changeType }
window.Utils.EVENTS.DATA.GOVERNANCE_LOADED // { governanceData, timestamp }
```

### UI Interaction Events

```javascript
window.Utils.EVENTS.UI.FILTER_CHANGED     // { filterType, filterValue }
window.Utils.EVENTS.UI.CARD_CLICKED       // { productId, cardElement }
window.Utils.EVENTS.UI.PANEL_OPENED       // { productId, panelType }
window.Utils.EVENTS.UI.PANEL_CLOSED       // { productId, duration }
window.Utils.EVENTS.UI.TAB_CHANGED        // { oldTab, newTab }
window.Utils.EVENTS.UI.SEARCH_CHANGED     // { searchTerm, resultCount }
```

### State Management Events

```javascript
window.Utils.EVENTS.STATE.CHANGED              // Generic state change
window.Utils.EVENTS.STATE.PORTFOLIO_DATA_SET   // { key, oldValue, newValue, count }
window.Utils.EVENTS.STATE.FILTERED_DATA_SET    // { key, oldValue, newValue, count }
window.Utils.EVENTS.STATE.TAB_SET              // { key, oldValue, newValue }
window.Utils.EVENTS.STATE.RISK_FILTER_SET      // { key, oldValue, newValue }
```

### Filter Events

```javascript
window.Utils.EVENTS.FILTER.APPLIED              // { criteria, resultCount }
window.Utils.EVENTS.FILTER.CLEARED              // { clearedFilters }
window.Utils.EVENTS.FILTER.RISK_ACTIVATED       // { riskLevel }
window.Utils.EVENTS.FILTER.RISK_DEACTIVATED     // { riskLevel }
window.Utils.EVENTS.FILTER.METRIC_ACTIVATED     // { metricType }
window.Utils.EVENTS.FILTER.METRIC_DEACTIVATED   // { metricType }
```

### Governance Events

```javascript
window.Utils.EVENTS.GOVERNANCE.RENDERED         // { metrics, timestamp }
window.Utils.EVENTS.GOVERNANCE.DRILLDOWN_OPENED // { metricType, data }
window.Utils.EVENTS.GOVERNANCE.DRILLDOWN_CLOSED // { metricType, duration }
window.Utils.EVENTS.GOVERNANCE.METRIC_CLICKED   // { metricType, value }
```

---

## 🎓 Best Practices

### 1. Use Typed Events

✅ **DO:**
```javascript
window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FILTERED, payload);
```

❌ **DON'T:**
```javascript
window.Utils.publish('data-filtered', payload); // Typo-prone
```

### 2. Use Wildcard Subscriptions for Monitoring

```javascript
// Monitor all data events
window.Utils.subscribeEnhanced('data:*', (payload, eventName) => {
    console.log(`[DATA EVENT] ${eventName}:`, payload);
});

// Monitor all UI interactions
window.Utils.subscribeEnhanced('ui:*', (payload, eventName) => {
    analyticsTracker.track(eventName, payload);
});
```

### 3. Validate Event Payloads

```javascript
// Events have schema validation built-in
window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FILTERED, {
    filteredData: results,
    count: results.length
}); // ✅ Valid payload

window.Utils.publishEnhanced(window.Utils.EVENTS.DATA.FILTERED, {
    data: results // ❌ Wrong key, validation fails
});
```

### 4. Use Facade API for Data Operations

✅ **DO:**
```javascript
window.DataManager.fetchData();         // Simple facade method
window.DataManager.filterData(criteria);
window.DataManager.getFilteredData();
```

❌ **DON'T:**
```javascript
window.DataManager.Fetching.fetchFromSheet();  // Internal sub-module
window.DataManager.Filtering.applyComplexFilters(); // Internal implementation
```

### 5. Prefer Read-Only Accessors for State

✅ **DO:**
```javascript
const tab = window.State.getCurrentTab();
const data = window.State.getFilteredData();
```

❌ **DON'T:**
```javascript
// Avoid direct manipulation
window.State.appState.currentTab = 'newTab'; // Bypasses events!
```

### 6. Optional: Use Service Locator for Testability

```javascript
// For modules that need to be tested
function MyModule() {
    const dataManager = Services.get('DataManager');
    const state = Services.get('State');
    
    // Now you can inject mocks in tests
}
```

---

## 🧪 Testing with New Patterns

### Testing Event Subscriptions

```javascript
function testEventSubscription() {
    let eventFired = false;
    let receivedPayload = null;
    
    // Subscribe to test event
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, (payload) => {
        eventFired = true;
        receivedPayload = payload;
    });
    
    // Trigger action that should emit event
    window.DataManager.filterData({ status: 'Active' });
    
    // Verify
    console.assert(eventFired, 'Event should have fired');
    console.assert(receivedPayload.count > 0, 'Should have results');
}
```

### Testing with Service Locator Mocks

```javascript
function testWithMockDataManager() {
    // Create mock
    const mockDataManager = {
        getFilteredData: () => [{ id: 1, name: 'Test' }],
        filterData: (criteria) => console.log('Mock filter:', criteria)
    };
    
    // Inject mock
    const originalDM = Services.get('DataManager');
    Services.register('DataManager', mockDataManager);
    
    // Run test
    const result = myFunctionThatUsesDataManager();
    
    // Verify
    console.assert(result.length === 1, 'Should use mock data');
    
    // Restore original
    Services.register('DataManager', originalDM);
}
```

---

## 🚨 Common Pitfalls

### 1. Forgetting to Subscribe Before Publishing

❌ **WRONG:**
```javascript
// Event published before subscription
window.DataManager.fetchData(); // Emits data:loaded

// Too late! Event already fired
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, handler);
```

✅ **CORRECT:**
```javascript
// Subscribe first (usually in init)
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, handler);

// Then trigger actions that emit events
window.DataManager.fetchData(); // Handler will receive event
```

### 2. Creating Memory Leaks with Subscriptions

❌ **WRONG:**
```javascript
function showModal() {
    // New subscription every time modal opens!
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, handleData);
}
```

✅ **CORRECT:**
```javascript
// Subscribe once on initialization
function initModule() {
    window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, handleData);
}

// Or use 'once' option for one-time events
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.LOADED, handler, { once: true });
```

### 3. Mixing Old and New Patterns Inconsistently

⚠️ **CONFUSING:**
```javascript
// Some code uses events
window.DataManager.filterData(criteria); // Emits event

// Other code polls directly
setInterval(() => {
    const data = window.DataManager.getFilteredData(); // Polling!
}, 1000);
```

✅ **CONSISTENT:**
```javascript
// Subscribe to event once
window.Utils.subscribeEnhanced(window.Utils.EVENTS.DATA.FILTERED, updateUI);

// Let events handle updates automatically
window.DataManager.filterData(criteria); // updateUI called automatically
```

---

## 📈 Performance Considerations

### Event System Performance

- **Overhead:** < 0.1ms per event publish/subscribe
- **Impact:** Negligible for typical use cases
- **Benefit:** Eliminates unnecessary re-renders and polling

### Apps Script Caching (Phase 2)

- **Cache TTL:** 5 minutes (portfolio), 10 minutes (governance)
- **Performance:** 90% faster cached responses (< 50ms)
- **Quota Impact:** 80% reduction in spreadsheet reads

### When to Use Direct Calls vs Events

**Use Direct Calls:**
- Read-only accessors (no side effects)
- Synchronous utility functions
- Simple calculations

**Use Events:**
- State changes that affect multiple modules
- Async operations (fetch, filter)
- User interactions that need tracking

---

## 🎯 Migration Checklist

- [ ] Identify all direct `window.DataManager.*` calls
- [ ] Replace data operations with facade API
- [ ] Add event subscriptions for state changes
- [ ] Use typed events from `window.Utils.EVENTS`
- [ ] Test backward compatibility
- [ ] Update tests to use event patterns
- [ ] Optional: Migrate to Service Locator for testability
- [ ] Monitor performance in production
- [ ] Update documentation

---

## 📞 Support & Resources

- **Architecture Overview:** `/docs/architecture/overview.md`
- **Event Registry:** `window.Utils.EVENTS` in `/src/js/core/utils.js`
- **Facade API:** `/docs/api/data-manager.md`
- **Design Tokens:** `/docs/design-system/tokens.md`
- **Implementation Summary:** `/ARCHITECTURAL_REFACTOR_IMPLEMENTATION_SUMMARY.md`

---

**Questions?** Open an issue or reach out to the architecture team.

