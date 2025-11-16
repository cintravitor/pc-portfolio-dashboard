# JavaScript Modules Architecture

**Version:** v2.0.0  
**Last Updated:** November 16, 2025  
**Architecture:** Modular ES6  

---

## Overview

The dashboard uses a modular JavaScript architecture with clear separation of concerns. The codebase is organized into **core modules** (data, state, utilities) and **UI modules** (rendering, interactions).

---

## Directory Structure

```
src/js/
├── config.js                    # Configuration (API URLs, settings)
├── dashboard-script.js          # Main orchestrator
├── GoogleAppsScript.gs          # Backend script (Google Apps Script)
└── core/                        # Core modules
    ├── ai-recommendations.js    # AI-powered recommendations
    ├── ai-summaries-data.js     # AI summary data
    ├── performance-monitor.js   # Performance tracking
    ├── state.js                 # Centralized state management
    ├── ui-manager-compat.js     # UI manager compatibility layer
    ├── utils.js                 # Utility functions
    ├── data/                    # Data layer modules
    │   ├── data-accessors.js    # Data access patterns
    │   ├── data-ai.js           # AI data operations
    │   ├── data-analytics.js    # Analytics calculations
    │   ├── data-anomalies.js    # Anomaly detection
    │   ├── data-fetching.js     # API calls, data loading
    │   ├── data-filtering.js    # Filter logic
    │   ├── data-governance.js   # Governance data
    │   └── data-manager-index.js # Data manager entry point
    └── ui/                      # UI layer modules
        ├── ui-analytics.js      # Analytics/Insights tab rendering
        ├── ui-cards.js          # Solution cards + journey navigation
        ├── ui-charts.js         # Chart rendering (Chart.js wrapper)
        ├── ui-detail-panel.js   # Modal/detail panel
        ├── ui-drill-down.js     # Drill-down views
        ├── ui-filters.js        # Filter components
        ├── ui-governance-core.js # Governance dashboard core
        ├── ui-governance-smoke.js # Smoke detector UI
        ├── ui-governance.js     # Governance main
        └── ui-tabs.js           # Tab navigation
```

---

## Module Hierarchy

### Layer 1: Foundation
```
config.js          → Configuration
utils.js           → Utility functions
state.js           → State management
```

### Layer 2: Data
```
data-fetching.js       → API calls, data loading
data-accessors.js      → Data access patterns
data-filtering.js      → Filter logic
data-analytics.js      → Calculations
data-governance.js     → Governance data
data-ai.js             → AI operations
data-anomalies.js      → Anomaly detection
data-manager-index.js  → Aggregates all data modules
```

### Layer 3: UI
```
ui-tabs.js             → Tab switching
ui-filters.js          → Filter UI
ui-cards.js            → Solution cards + journey nav
ui-detail-panel.js     → Modals
ui-charts.js           → Chart rendering
ui-analytics.js        → Analytics tab
ui-governance.js       → Governance tab
ui-drill-down.js       → Drill-down views
ui-governance-core.js  → Governance core
ui-governance-smoke.js → Smoke detectors
```

### Layer 4: Orchestration
```
dashboard-script.js → Main coordinator
ai-recommendations.js → AI features
performance-monitor.js → Performance tracking
```

---

## Core Modules

### 1. config.js

**Purpose:** Configuration management

**Exports:**
```javascript
CONFIG = {
    WEB_APP_URL: string,
    CACHE_DURATION: number,
    // ... other settings
}
```

**Usage:**
- API endpoint configuration
- Feature flags
- Environment settings

### 2. state.js

**Purpose:** Centralized state management

**Key Functions:**
```javascript
getState()                    // Get current state
setState(newState)            // Update state
getCurrentTab()               // Get active tab
setCurrentTab(tab)            // Set active tab
getFilters()                  // Get filter state
setFilters(filters)           // Update filters
```

**State Structure:**
```javascript
{
    currentTab: 'explore' | 'insights',
    filters: {...},
    products: [...],
    loading: boolean,
    lastUpdate: timestamp
}
```

### 3. utils.js

**Purpose:** Utility functions

**Categories:**
- **DOM Manipulation:** `createElement`, `addClass`, etc.
- **Data Formatting:** `formatNumber`, `formatDate`, etc.
- **Validation:** `isValid`, `sanitize`, etc.
- **Helpers:** `debounce`, `throttle`, etc.

### 4. data-manager-index.js

**Purpose:** Central data management

**Exports:**
```javascript
window.DataManager = {
    fetchData(),              // Load all data
    getProducts(),            // Get solution data
    getFiltered(),            // Apply filters
    getAnalytics(),           // Analytics data
    getGovernance(),          // Governance data
    cacheData(),              // Cache management
    // ... more methods
}
```

**Data Flow:**
```
GoogleSheets → data-fetching.js → data-manager → State → UI modules
```

---

## UI Modules

### 1. ui-cards.js (Solution Cards + Journey Navigation)

**Purpose:** Render solution cards and journey stage navigation

**Key Functions:**
```javascript
renderJourneyNavigation()     // Horizontal journey bar
selectJourneyStage(stage)     // Handle stage selection
renderCards(products)         // Render solution cards
expandCard(card)              // Card expansion
```

**State Dependencies:**
- `activeJourneyStage`
- `filteredProducts`

**DOM Updates:**
- `#journey-navigation`
- `#cards-container`

**New in v2.0.0:**
- Horizontal journey navigation
- Single-stage card view
- Empty state handling

### 2. ui-detail-panel.js (Modals)

**Purpose:** Detail panel/modal management

**Key Functions:**
```javascript
showDetailPanel(product)      // Open modal
hideDetailPanel()             // Close modal
renderMetrics(product)        // Render charts
switchTab(tabName)            // Tab navigation
```

**Features:**
- Production-stable behavior (v2.0.0)
- Smooth animations
- Scroll locking
- Chart rendering

### 3. ui-tabs.js (Tab Navigation)

**Purpose:** Main tab switching

**Key Functions:**
```javascript
switchTab(tabName)            // Switch between tabs
initializeTabs()              // Setup tab listeners
updateTabBadges()             // Update counts
```

**Tabs:**
- Explore (solution cards)
- Insights (analytics dashboard)

### 4. ui-filters.js (Filters)

**Purpose:** Filter component management

**Key Functions:**
```javascript
renderFilters()               // Render filter UI
applyFilters()                // Apply filter logic
clearFilters()                // Reset filters
updateFilterCounts()          // Update counts
```

**Filter Types:**
- Multi-select dropdowns
- Search input
- Checkbox filters

### 5. ui-charts.js (Charts)

**Purpose:** Chart.js wrapper and chart rendering

**Key Functions:**
```javascript
createChart(type, data)       // Create Chart.js instance
updateChart(chart, data)      // Update existing chart
destroyChart(chart)           // Clean up chart
```

**Chart Types:**
- Line charts (trends)
- Bar charts (comparisons)
- Gauge charts (metrics)

### 6. ui-analytics.js (Insights Tab)

**Purpose:** Analytics dashboard rendering

**Key Functions:**
```javascript
renderAnalytics()             // Render insights tab
renderMetrics()               // Metric cards
renderCharts()                // Analytics charts
```

**Features:**
- Dynamic filtering
- Real-time updates
- Interactive charts

### 7. ui-governance.js (Governance)

**Purpose:** Governance dashboard

**Modules:**
- `ui-governance.js` - Main governance
- `ui-governance-core.js` - Core functionality
- `ui-governance-smoke.js` - Smoke detectors

**Features:**
- Smoke detector system
- Portfolio health
- Issue tracking

---

## Data Flow

### Loading Data

```
1. dashboard-script.js calls DataManager.fetchData()
2. data-fetching.js makes API call to Google Apps Script
3. data-manager-index.js processes and caches data
4. state.js updates with new data
5. UI modules render based on state
```

### User Interaction

```
1. User clicks element (e.g., journey stage)
2. UI module handles event (ui-cards.js)
3. State updated (state.setActiveStage())
4. UI re-renders based on new state
5. Smooth transition applied
```

### Filtering

```
1. User changes filter (ui-filters.js)
2. Filter state updated (state.setFilters())
3. data-filtering.js applies filter logic
4. Filtered results returned
5. UI modules re-render with filtered data
```

---

## Dependency Graph

```
dashboard-script.js
├── config.js
├── state.js
├── utils.js
├── data-manager-index.js
│   ├── data-fetching.js
│   ├── data-accessors.js
│   ├── data-filtering.js
│   ├── data-analytics.js
│   ├── data-governance.js
│   ├── data-ai.js
│   └── data-anomalies.js
├── ui-tabs.js
├── ui-filters.js
├── ui-cards.js
│   └── ui-detail-panel.js
├── ui-analytics.js
│   └── ui-charts.js
├── ui-governance.js
│   ├── ui-governance-core.js
│   └── ui-governance-smoke.js
├── ui-drill-down.js
├── ai-recommendations.js
└── performance-monitor.js
```

---

## Event System

### Event Delegation

Used for dynamic content (cards, buttons, filters):

```javascript
// In ui-cards.js
document.addEventListener('click', (e) => {
    if (e.target.matches('.journey-stage-btn')) {
        selectJourneyStage(stage);
    }
});
```

### Custom Events

```javascript
// Dispatch
window.dispatchEvent(new CustomEvent('dataLoaded', {detail: data}));

// Listen
window.addEventListener('dataLoaded', (e) => {
    renderUI(e.detail);
});
```

---

## State Management Patterns

### Single Source of Truth

```javascript
// Bad - Local state
let myLocalData = [...];

// Good - Central state
const data = window.State.getProducts();
```

### Immutable Updates

```javascript
// Bad - Direct mutation
state.products.push(newProduct);

// Good - Immutable update
window.State.setState({
    products: [...state.products, newProduct]
});
```

### Reactive Rendering

```javascript
// When state changes, UI updates
window.State.setState(newState);
renderUI(); // Re-render based on new state
```

---

## Performance Optimizations

### 1. Memoization

```javascript
// Cache expensive calculations
let cachedResult = null;
function expensiveOperation(data) {
    if (cachedResult) return cachedResult;
    cachedResult = /* expensive calculation */;
    return cachedResult;
}
```

### 2. Debouncing/Throttling

```javascript
// Search input debouncing
const debouncedSearch = debounce((query) => {
    performSearch(query);
}, 300);
```

### 3. Event Delegation

```javascript
// One listener for all cards (not one per card)
container.addEventListener('click', handleCardClick);
```

### 4. RequestAnimationFrame

```javascript
// Smooth animations
requestAnimationFrame(() => {
    element.style.opacity = '1';
});
```

---

## Error Handling

### Pattern

```javascript
try {
    const data = await fetchData();
    renderUI(data);
} catch (error) {
    console.error('Error loading data:', error);
    showErrorMessage('Failed to load data');
}
```

### Logging

```javascript
// Development
console.log('Debug info:', data);

// Production errors only
console.error('Critical error:', error);
```

---

## Extension Points

### Adding a New Feature

1. **Create module file:** `src/js/core/ui/ui-my-feature.js`
2. **Export functions:**
   ```javascript
   window.UIManager.MyFeature = {
       render() { /* ... */ },
       handleClick() { /* ... */ }
   };
   ```
3. **Import in index.html:** `<script src="..."></script>`
4. **Call from orchestrator:** `dashboard-script.js`

### Adding a New UI Component

1. **Create in appropriate UI module**
2. **Follow existing patterns** (glassmorphism, transitions)
3. **Use state management** (window.State)
4. **Add event listeners** (delegation preferred)
5. **Document in architecture**

---

## Testing Strategy

### Manual Testing

1. **Feature testing** - Test all features work
2. **Cross-browser** - Chrome, Safari, Firefox
3. **Responsive** - Desktop, tablet, mobile
4. **Performance** - Load times, interactions

### Future: Automated Testing

- **Unit tests** - Jest for pure functions
- **Integration tests** - Module interactions
- **E2E tests** - Playwright/Cypress
- **Visual regression** - Percy/Chromatic

---

## Common Patterns

### Module Template

```javascript
// ui-my-feature.js
(() => {
    'use strict';
    
    // Private functions
    function privateHelper() {
        // ...
    }
    
    // Public API
    window.UIManager = window.UIManager || {};
    window.UIManager.MyFeature = {
        render() {
            // Rendering logic
        },
        
        handleEvent(e) {
            // Event handling
        }
    };
})();
```

### Data Fetching

```javascript
async function fetchData() {
    try {
        const response = await fetch(CONFIG.WEB_APP_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}
```

---

## Migration Guide (Future)

### To TypeScript

1. Add TypeScript compiler
2. Create type definitions
3. Migrate module by module
4. Ensure backward compatibility

### To Build System

1. Add Webpack/Vite
2. Configure module bundling
3. Add minification
4. Setup dev/prod builds

---

## Related Documentation

- **CSS Architecture:** `docs/architecture/CSS_ARCHITECTURE.md`
- **Data Flow:** `docs/architecture/data-flow.md`
- **Module Structure:** `docs/architecture/module-structure.md`
- **Performance:** `docs/architecture/PERFORMANCE_BASELINE.md`

---

**Maintained by:** P&C Development Team  
**Last Review:** November 16, 2025  
**Next Review:** When adding major features

