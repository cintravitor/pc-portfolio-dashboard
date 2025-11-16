# Visual Architecture Guide

## ✅ Current Architecture (November 2025 - Modular Refactoring Complete)

```
┌────────────────────────────────────────────────────────────┐
│                     index.html (UI)                        │
│  • Tab buttons                                             │
│  • Filter controls                                         │
│  • Content divs                                            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│              dashboard-script.js (Orchestrator)            │
│  • initialize()                                            │
│  • setupEventListeners()                                   │
│  • fetchSheetData()                                        │
└───────┬────────────────────────────────┬───────────────────┘
        │                                │
        │ Initializes                    │ Initializes
        ↓                                ↓
┌──────────────────────┐        ┌──────────────────────┐
│   UI MODULES         │        │   DATA MODULES       │
│   (Modular)          │        │   (Modular)          │
│                      │        │                      │
│ • ui-cards.js        │        │ • data-fetching.js   │
│ • ui-filters.js      │        │ • data-filtering.js  │
│ • ui-detail-panel.js │        │ • data-analytics.js  │
│ • ui-charts.js       │  ✅    │ • data-anomalies.js  │
│ • ui-governance.js   │  GOOD  │ • data-accessors.js  │
│ • ui-tabs.js         │        │ • data-governance.js │
│ • ui-analytics.js    │◄───────┤ • data-ai.js         │
│ • ui-drill-down.js   │ Facade │ • data-manager-index │
│                      │   API  │   (Coordinator)      │
└──────────┬───────────┘        └──────────┬───────────┘
           │                               │
           │ Uses State                    │ Updates State
           ↓                               ↓
┌────────────────────────────────────────────────────────────┐
│                    state.js (State)                        │
│  • portfolioData                                           │
│  • filteredData                                            │
│  • currentTab                                              │
│  • chartInstances                                          │
└────────────────────────────────────────────────────────────┘
```

**✅ Improvements Implemented (Phase 3 Complete)**:
- ✅ UI Manager split into 8 focused modules
- ✅ Data Manager split into 7 specialized modules
- ✅ Service Locator pattern available for dependency injection
- ✅ Facade pattern with event-driven architecture
- ✅ Each module has single responsibility
- ✅ Clean dependency hierarchy (no circular dependencies)
- ✅ Easy to test and maintain individual modules

---

## 🎯 Future Architecture Vision (Phase 4 - Optional)

```
┌────────────────────────────────────────────────────────────┐
│                     index.html (UI)                        │
│  • Tab buttons                                             │
│  • Filter controls                                         │
│  • Content divs                                            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────┐
│              dashboard-script.js (Orchestrator)            │
│                                                            │
│  CENTRAL EVENT COORDINATOR:                                │
│  • Subscribes to ALL events                                │
│  • Coordinates between UI and Data                         │
│  • Never manipulates DOM directly                          │
│  • Never processes data directly                           │
│                                                            │
│  Event Subscriptions:                                      │
│    window.Utils.subscribe('filter:changed', ...)          │
│    window.Utils.subscribe('data:loaded', ...)             │
│    window.Utils.subscribe('card:clicked', ...)            │
│    window.Utils.subscribe('drilldown:triggered', ...)     │
└───────┬────────────────────────────────────┬──────────────┘
        │                                    │
        │ Calls with data                    │ Calls for data
        │ ui.render(data)                    │ data.process()
        ↓                                    ↓
┌──────────────────────┐              ┌──────────────────────┐
│   ui-manager.js      │              │   data-manager.js    │
│   (View Layer)       │              │   (Data Layer)       │
│                      │              │                      │
│ • renderCards(data)  │              │ • fetchSheetData()   │
│ • switchTab(name)    │              │ • applyFilters()     │
│ • showDetail(data)   │              │ • calculateMetrics() │
│ • renderCharts(data) │              │ • checkAnomalies()   │
│                      │              │                      │
│ Publishes Events:    │              │ Returns Data:        │
│  'filter:changed'    │              │  metrics object      │
│  'card:clicked'      │              │  filtered array      │
│  'tab:switched'      │              │  anomaly report      │
│  'drilldown:started' │              │  (never renders UI)  │
└──────────┬───────────┘              └──────────┬───────────┘
           │                                     │
           │ Reads State                         │ Updates State
           ↓                                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    state.js (State)                         │
│  • portfolioData                                            │
│  • filteredData                                             │
│  • currentTab                                               │
│  • chartInstances                                           │
└─────────────────────────────────────────────────────────────┘
                                ↑
                                │ Used by all modules
                                │
┌─────────────────────────────────────────────────────────────┐
│                    utils.js (Utilities)                     │
│  • publish(event, data)                                     │
│  • subscribe(event, callback)                               │
│  • unsubscribeAll(event)                                    │
│  • escapeHtml(), debounce(), etc.                           │
└─────────────────────────────────────────────────────────────┘
```

**Benefits**:
- ✅ UI Manager doesn't know about Data Manager
- ✅ Loose coupling between modules
- ✅ No circular dependencies
- ✅ Easy to test in isolation
- ✅ Changes don't cascade
- ✅ Clear execution flow via events

---

## Event Flow Examples

### Example 1: User Changes Filter

```
┌──────────────┐
│     User     │
│  clicks      │
│  filter      │
└──────┬───────┘
       │
       ↓
┌────────────────────────────────────────┐
│  ui-manager.js: applyFiltersFromUI()   │
│                                        │
│  1. Read filter values from DOM        │
│  2. Publish event:                     │
│     window.Utils.publish(              │
│       'filter:changed',                │
│       { area, maturity, owner, ... }   │
│     )                                  │
└───────────────┬────────────────────────┘
                │
                │ Event Bus
                ↓
┌────────────────────────────────────────┐
│  dashboard-script.js: subscribed       │
│                                        │
│  3. Receive filter data                │
│  4. Call data layer:                   │
│     window.DataManager.applyFilters()  │
│  5. Get filtered results:              │
│     filteredData = State.getFiltered() │
│  6. Update UI:                         │
│     UIManager.renderCards()            │
│     UIManager.updateStats()            │
│     UIManager.renderFilterPills()      │
│  7. Publish completion:                │
│     publish('ui:updated')              │
└───────────────┬────────────────────────┘
                │
                ↓
        ┌───────────────┐
        │   UI Updates  │
        │   Cards shown │
        │  Stats updated│
        │  Pills appear │
        └───────────────┘
```

---

### Example 2: User Clicks Card

```
┌──────────────┐
│     User     │
│   clicks     │
│    card      │
└──────┬───────┘
       │
       ↓
┌────────────────────────────────────────┐
│  ui-manager.js: card click handler     │
│                                        │
│  1. Get product ID from card           │
│  2. Publish event:                     │
│     window.Utils.publish(              │
│       'card:clicked',                  │
│       { productId: 123 }               │
│     )                                  │
└───────────────┬────────────────────────┘
                │
                │ Event Bus
                ↓
┌────────────────────────────────────────┐
│  dashboard-script.js: subscribed       │
│                                        │
│  3. Receive product ID                 │
│  4. Get product data:                  │
│     product = DataManager.getProduct() │
│  5. Get detail metrics:                │
│     metrics = DataManager.getMetrics() │
│  6. Show detail panel:                 │
│     UIManager.showDetailPanel(product) │
│  7. Render charts:                     │
│     UIManager.renderDetailCharts()     │
└───────────────┬────────────────────────┘
                │
                ↓
        ┌───────────────┐
        │Detail Panel   │
        │   Opens       │
        │Charts rendered│
        └───────────────┘
```

---

### Example 3: Data Load on Startup

```
┌──────────────┐
│  Page Load   │
│ DOMContentLoad│
└──────┬───────┘
       │
       ↓
┌────────────────────────────────────────┐
│  dashboard-script.js: initialize()     │
│                                        │
│  1. Setup event listeners              │
│  2. Check if refresh needed            │
│  3. Start data fetch                   │
│  4. Publish:                           │
│     publish('data:fetching')           │
└───────────────┬────────────────────────┘
                │
                ↓
┌────────────────────────────────────────┐
│  data-manager.js: fetchSheetData()     │
│                                        │
│  5. Fetch from Google Sheets           │
│  6. Process and transform              │
│  7. Update state                       │
│  8. Cache locally                      │
└───────────────┬────────────────────────┘
                │
                │ Returns data
                ↓
┌────────────────────────────────────────┐
│  dashboard-script.js: continued        │
│                                        │
│  9. Publish:                           │
│     publish('data:loaded', data)       │
│  10. Initialize UI:                    │
│      UIManager.setupFilters()          │
│      UIManager.renderCards()           │
│      UIManager.updateStats()           │
└───────────────┬────────────────────────┘
                │
                ↓
        ┌───────────────┐
        │  Dashboard    │
        │   Ready       │
        │  Data Loaded  │
        └───────────────┘
```

---

## Module Responsibility Matrix

| Module | Knows About | Calls Directly | Publishes Events | Subscribes to Events |
|--------|-------------|----------------|------------------|---------------------|
| **ui-manager.js** | DOM, State | None | filter:changed, card:clicked, tab:switched, drilldown:triggered | None (orchestrator calls it) |
| **data-manager.js** | State | None | None (returns data only) | None |
| **dashboard-script.js** | UI, Data, State, Utils | ui-manager, data-manager | data:loaded, ui:updated | ALL events |
| **state.js** | Nothing | None | None | None |
| **utils.js** | Nothing | None | N/A (is the event system) | N/A |

---

## Testing Strategy

### Unit Testing (With Event System)

```javascript
// Test UI Manager in isolation
describe('UI Manager', () => {
    it('should publish filter:changed event', () => {
        // Mock
        let eventData = null;
        window.Utils.subscribe('filter:changed', data => {
            eventData = data;
        });
        
        // Act
        window.UIManager.applyFiltersFromUI();
        
        // Assert
        expect(eventData).toBeDefined();
        expect(eventData.area).toBe('Claims');
    });
});

// Test Data Manager in isolation
describe('Data Manager', () => {
    it('should filter products correctly', () => {
        // Arrange
        window.State.setPortfolioData(mockData);
        
        // Act
        window.DataManager.applyFilters('', 'Claims', '', '', '');
        
        // Assert
        const filtered = window.State.getFilteredData();
        expect(filtered.length).toBe(5);
        expect(filtered.every(p => p.area === 'Claims')).toBe(true);
    });
});
```

---

## Event Logging for Debugging

```javascript
// Add comprehensive logging
window.Utils.subscribe('*', (data) => {
    // Log all events (wildcard subscriber)
    console.log(`[EVENT] ${event}`, data);
});

// Log specific flows
window.Utils.subscribe('filter:changed', (data) => {
    console.log('[FILTER] Changed:', data);
});

window.Utils.subscribe('data:loaded', (data) => {
    console.log('[DATA] Loaded:', data.length, 'items');
});

// Performance monitoring
window.Utils.subscribe('filter:changed', (data) => {
    const start = performance.now();
    
    // Subscribe to completion
    window.Utils.subscribe('ui:updated', () => {
        const duration = performance.now() - start;
        console.log('[PERF] Filter flow took', duration, 'ms');
    }, { once: true });
});
```

---

## Migration Checklist

### Phase 1: Infrastructure ✅
- [x] Implement pub/sub in utils.js
- [x] Add publish() function
- [x] Add subscribe() function
- [x] Add unsubscribe functionality
- [x] Add debug utilities
- [x] Test basic functionality

### Phase 2: Filter Flow (Proof of Concept)
- [ ] Update ui-manager.js to publish filter:changed
- [ ] Update dashboard-script.js to subscribe
- [ ] Remove direct DataManager call from UI
- [ ] Test thoroughly
- [ ] Document pattern

### Phase 3: Data Loading Flow
- [ ] Add data:fetching event
- [ ] Add data:loaded event
- [ ] Add data:error event
- [ ] Update fetchSheetData flow
- [ ] Test error handling

### Phase 4: Navigation Flow
- [ ] Add tab:switched event
- [ ] Update switchTab function
- [ ] Add card:clicked event
- [ ] Update card handlers
- [ ] Test all navigation

### Phase 5: Drill-Down Flow
- [ ] Add drilldown:triggered event
- [ ] Update drill-down handlers
- [ ] Test tactical view filtering
- [ ] Test notification display

### Phase 6: Validation & Cleanup
- [ ] Remove ALL direct cross-module calls
- [ ] Verify no ui → data calls
- [ ] Comprehensive testing
- [ ] Performance validation
- [ ] Update all documentation

---

## Success Metrics

### Code Quality
- [ ] No direct ui → data calls
- [ ] All interactions via events
- [ ] Clear module boundaries
- [ ] Well-documented events

### Maintainability
- [ ] Easy to add new features
- [ ] Easy to trace execution
- [ ] Easy to debug issues
- [ ] Clear separation of concerns

### Performance
- [ ] No slowdown vs current
- [ ] Event overhead negligible
- [ ] No memory leaks
- [ ] Smooth user experience

### Testability
- [ ] Can test modules in isolation
- [ ] Can mock events easily
- [ ] Can verify event flow
- [ ] High code coverage possible

---

## Quick Reference: Common Patterns

### Publishing an Event
```javascript
// In UI Manager
window.Utils.publish('filter:changed', {
    area: 'Claims',
    maturity: 'Growth',
    owner: 'John Doe'
});
```

### Subscribing to an Event
```javascript
// In Dashboard Script
window.Utils.subscribe('filter:changed', (filterData) => {
    // Process the event
    handleFilterChange(filterData);
});
```

### Coordinating Data and UI
```javascript
// In Dashboard Script
window.Utils.subscribe('filter:changed', (filters) => {
    // Get data
    window.DataManager.applyFilters(filters);
    const data = window.State.getFilteredData();
    
    // Update UI
    window.UIManager.renderCards(data);
    window.UIManager.updateStats();
    
    // Broadcast completion
    window.Utils.publish('ui:updated', { type: 'filter' });
});
```

---

**This visual guide provides a clear roadmap for the architectural transformation!** 🎯

