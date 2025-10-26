# Module Structure

## Module Organization

The codebase is organized into focused, single-responsibility modules following the IIFE (Immediately Invoked Function Expression) pattern for encapsulation.

## Directory Structure

```
src/js/
├── config.js                      # Configuration & constants
├── dashboard-script.js            # Main orchestrator
└── core/
    ├── utils.js                   # Utility functions
    ├── state.js                   # State management
    ├── data-manager.js            # Data operations (to be split)
    ├── analytics.js               # Analytics tracking
    ├── ai-recommendations.js      # AI features
    ├── ai-summaries-data.js       # Pre-generated summaries
    ├── ui-manager-compat.js       # Compatibility wrapper
    └── ui/                        # UI modules
        ├── ui-tabs.js             # Tab switching
        ├── ui-filters.js          # Filtering system
        ├── ui-cards.js            # Card rendering
        ├── ui-detail-panel.js     # Detail view
        ├── ui-charts.js           # Chart utilities
        ├── ui-governance.js       # Insights dashboard
        └── ui-drill-down.js       # Cross-tab navigation
```

## Module Template

All modules follow this pattern:

```javascript
/**
 * Module Name - Brief description
 * 
 * Responsibilities:
 * - Primary responsibility 1
 * - Primary responsibility 2
 * 
 * Dependencies:
 * - window.State
 * - window.Utils
 */

(function() {
    'use strict';
    
    // ==================== PRIVATE VARIABLES ====================
    
    const PRIVATE_CONST = 'value';
    let privateVariable = null;
    
    // ==================== PRIVATE FUNCTIONS ====================
    
    /**
     * Private helper function
     * @param {string} param - Description
     * @returns {void}
     */
    function privateHelper(param) {
        // Implementation
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Public function exposed to other modules
     * @param {Object} data - Input data
     * @returns {Array} Processed results
     */
    function publicFunction(data) {
        // Implementation
    }
    
    // ==================== EXPORTS ====================
    
    // Ensure namespace exists
    window.ModuleName = window.ModuleName || {};
    
    // Export public API
    window.ModuleName = {
        publicFunction,
        anotherPublicFunction
    };
    
    console.log('✅ ModuleName module loaded');
    
})();
```

## Core Modules

### config.js

**Purpose**: Application configuration and constants

**Exports**: `window.CONFIG`

**Contents**:
```javascript
const CONFIG = {
    // API endpoints
    WEB_APP_URL: '...',
    LITELLM_API_ENDPOINT: '...',
    LITELLM_API_KEY: '...',
    
    // Feature flags
    ENABLE_AI_RECOMMENDATIONS: true,
    
    // Settings
    CACHE_DURATION_MS: 300000,
    AUTO_REFRESH: false
};
```

### state.js

**Purpose**: Centralized state management

**Exports**: `window.State`

**API**:
```javascript
window.State = {
    // Getters
    getPortfolioData(),
    getFilteredData(),
    getColumnMapping(),
    getConstants(),
    
    // Setters
    setPortfolioData(data),
    setFilteredData(data),
    setColumnMapping(mapping),
    
    // UI State
    getActiveTab(),
    setActiveTab(tab)
};
```

### utils.js

**Purpose**: Common utility functions

**Exports**: `window.Utils`

**API**:
```javascript
window.Utils = {
    escapeHtml(str),
    formatNumber(num, decimals),
    parseDate(dateStr),
    debounce(func, delay),
    throttle(func, limit)
};
```

### data-manager.js

**Purpose**: Data operations and business logic

**Exports**: `window.DataManager`

**API** (Current - will be modularized):
```javascript
window.DataManager = {
    // Fetching
    fetchSheetData(),
    fetchGovernanceData(),
    cacheData(data),
    loadCachedData(),
    
    // Filtering
    applyFilters(...filters),
    sortData(data, sortBy),
    getFilterOptions(),
    
    // Analytics
    calculatePerformanceVsTarget(product),
    calculateRiskScore(product),
    analyzePortfolioData(data),
    calculatePortfolioMetrics(),
    
    // Anomalies
    checkAnomalies(),
    calculateSmokeDetectors(product),
    
    // Accessors
    getPortfolioData(),
    getFilteredData(),
    getProductById(id),
    getProductStats(),
    getCardSummaryMetrics(product),
    
    // AI
    getAISummary(name, original)
};
```

**Future Structure (Phase 3)**:
```javascript
// Sub-modules
window.DataManager.Fetching = {...}
window.DataManager.Filtering = {...}
window.DataManager.Analytics = {...}
window.DataManager.Anomalies = {...}
window.DataManager.Accessors = {...}
window.DataManager.AI = {...}

// Unified interface via data-manager-index.js
window.DataManager = {
    ...all functions from sub-modules
};
```

## UI Modules

### ui-tabs.js (76 lines)

**Purpose**: Tab navigation and switching

**Exports**: `window.UIManager.Tabs`

**API**:
```javascript
window.UIManager.Tabs = {
    init(),
    switchTab(tabId)
};
```

**Event Handlers**:
- Click on tab buttons
- Updates active states
- Shows/hides tab content
- Triggers tab-specific rendering

### ui-filters.js (400 lines)

**Purpose**: Filtering and search functionality

**Exports**: `window.UIManager.Filters`

**API**:
```javascript
window.UIManager.Filters = {
    init(),
    applyFilters(),
    clearFilters(),
    updateFilterPills(),
    populateDropdowns()
};
```

**Components**:
- Search input with debouncing
- Multi-select dropdowns
- Filter pills display
- Below-target checkbox

### ui-cards.js (149 lines)

**Purpose**: Solution card rendering

**Exports**: `window.UIManager.Cards`

**API**:
```javascript
window.UIManager.Cards = {
    init(),
    renderCards(),
    updateStats()
};
```

**Features**:
- Collapsible sections by area
- Metric badges (UX/BI)
- Smoke detector indicators
- Click handling for detail panel

### ui-detail-panel.js (299 lines)

**Purpose**: Solution detail view

**Exports**: `window.UIManager.DetailPanel`

**API**:
```javascript
window.UIManager.DetailPanel = {
    render(product),
    close()
};
```

**Sections**:
- Problem statement
- Solution description
- Metric charts
- Owner information
- Metadata

### ui-charts.js (226 lines)

**Purpose**: Chart.js utilities

**Exports**: `window.UIManager.Charts`

**API**:
```javascript
window.UIManager.Charts = {
    renderMetricChart(canvasId, data, config),
    destroyChart(canvasId),
    updateChart(canvasId, newData)
};
```

### ui-governance.js (1,322 lines)

**Purpose**: Insights dashboard - consolidated strategic view

**Exports**: `window.UIManager.Governance`

**API**:
```javascript
window.UIManager.Governance = {
    render()
};
```

**Sections**:
- Action Layer (AI summary, smoke detectors)
- Metrics Coverage (UX/BI achievement)
- Portfolio Distribution (charts & breakdowns)
- Resource Allocation (BAU, PTech, teams)
- Executive metrics and portfolio KPIs

### ui-drill-down.js (496 lines)

**Purpose**: Cross-tab navigation

**Exports**: `window.UIManager.DrillDown`

**API**:
```javascript
window.UIManager.DrillDown = {
    handleAnomalyClick(type, data),
    clearDrillDown()
};
```

## Module Dependencies

### Dependency Graph

```
dashboard-script.js
    ├── config.js
    ├── utils.js
    ├── state.js
    ├── analytics.js
    ├── ai-summaries-data.js
    ├── data-manager.js
    │   ├── state.js
    │   ├── utils.js
    │   └── ai-summaries-data.js
    ├── ai-recommendations.js
    │   └── config.js
    └── ui/*
        ├── ui-charts.js
        ├── ui-cards.js
        │   ├── state.js
        │   ├── utils.js
        │   └── data-manager.js
        ├── ui-filters.js
        │   ├── state.js
        │   └── data-manager.js
        ├── ui-detail-panel.js
        │   ├── utils.js
        │   ├── data-manager.js
        │   └── ui-charts.js
        ├── ui-governance.js
        │   ├── config.js
        │   ├── utils.js
        │   └── data-manager.js
        ├── ui-drill-down.js
        │   ├── state.js
        │   └── data-manager.js
        └── ui-tabs.js
            └── ui-governance.js
```

### Load Order (index.html)

Critical dependencies must load before dependents:

```html
<!-- 1. Configuration -->
<script src="config.js"></script>

<!-- 2. AI Data (early) -->
<script src="ai-summaries-data.js"></script>

<!-- 3. Foundation -->
<script src="utils.js"></script>
<script src="state.js"></script>
<script src="analytics.js"></script>

<!-- 4. Data Layer -->
<script src="data-manager.js"></script>

<!-- 5. AI Module -->
<script src="ai-recommendations.js"></script>

<!-- 6. UI Modules -->
<script src="ui/ui-charts.js"></script>
<script src="ui/ui-cards.js"></script>
<script src="ui/ui-filters.js"></script>
<script src="ui/ui-detail-panel.js"></script>
<script src="ui/ui-governance.js"></script>
<script src="ui/ui-drill-down.js"></script>
<script src="ui/ui-tabs.js"></script>  <!-- Last! -->

<!-- 7. Compatibility -->
<script src="ui-manager-compat.js"></script>

<!-- 8. Orchestrator -->
<script src="dashboard-script.js"></script>
```

## Module Communication

### 1. Direct Function Calls

```javascript
// In ui-cards.js
window.DataManager.getProductById(id);
```

### 2. Shared State

```javascript
// Set in data-manager.js
window.State.setPortfolioData(data);

// Read in ui-cards.js
const data = window.State.getPortfolioData();
```

### 3. Custom Events

```javascript
// Publish in data-manager.js
document.dispatchEvent(new CustomEvent('data-loaded', {
    detail: { count: data.length }
}));

// Subscribe in ui-cards.js
document.addEventListener('data-loaded', (e) => {
    console.log(`Loaded ${e.detail.count} items`);
});
```

### 4. Callback Functions

```javascript
// Pass callback to async operation
window.DataManager.fetchSheetData()
    .then(data => {
        window.UIManager.Cards.renderCards();
    });
```

## Module Guidelines

### Do's
✅ Single responsibility per module
✅ Clear, documented API
✅ Minimal dependencies
✅ Private by default, public by intent
✅ Consistent naming conventions
✅ Error handling in all public functions
✅ Console logging for debugging

### Don'ts
❌ Circular dependencies
❌ Global variable pollution
❌ Side effects in initialization
❌ Tight coupling between modules
❌ Exposing internal implementation
❌ Mutating external state directly
❌ Silent failures

## Future Modularity

### Phase 3 Goals

**Split data-manager.js (1,214 lines) into:**
- `data-fetching.js` (~200 lines)
- `data-filtering.js` (~150 lines)
- `data-analytics.js` (~300 lines)
- `data-anomalies.js` (~200 lines)
- `data-accessors.js` (~100 lines)
- `data-ai.js` (~50 lines)
- `data-manager-index.js` (~50 lines coordinator)

**Benefits:**
- Easier to test
- Parallel development
- Reduced cognitive load
- Better code organization
- Improved maintainability

## Related Documentation

- [Architecture Overview](overview.md)
- [Data Flow](data-flow.md)
- [API Reference](../api/)

