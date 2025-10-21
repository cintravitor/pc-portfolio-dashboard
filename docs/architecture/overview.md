# Architecture Overview

## System Architecture

The P&C Portfolio Dashboard follows a modern, modular architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   UI Layer  │  │  State Mgmt  │  │  Data Layer   │  │
│  │             │  │              │  │               │  │
│  │ - Tabs      │  │ - Portfolio  │  │ - Fetching    │  │
│  │ - Cards     │  │ - Filtered   │  │ - Filtering   │  │
│  │ - Filters   │  │ - UI State   │  │ - Analytics   │  │
│  │ - Charts    │  │              │  │ - Anomalies   │  │
│  │ - Panels    │  │              │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│         │                 │                  │           │
│         └─────────────────┴──────────────────┘           │
│                           │                              │
│                    ┌──────▼──────┐                       │
│                    │ Dashboard   │                       │
│                    │ Orchestrator│                       │
│                    └─────────────┘                       │
└────────────────────────────│────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Google APIs    │
                    ├──────────────────┤
                    │  Apps Script     │
                    │  (Backend)       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Google Sheets   │
                    │  (Data Source)   │
                    └──────────────────┘
```

## Technology Stack

### Frontend
- **HTML5**: Structure and layout
- **CSS3**: Styling with Flexbox/Grid
- **JavaScript (ES6+)**: Application logic
- **Chart.js**: Data visualization
- **Vanilla JS**: No framework dependencies

### Backend
- **Google Apps Script**: Server-side processing
- **Google Sheets**: Data storage and source of truth

### External Services
- **LiteLLM API**: AI-powered features
- **GitHub Pages**: Static site hosting

## Core Modules

### 1. State Management (`state.js`)

Centralized state container using singleton pattern.

```javascript
window.State = {
    portfolioData: [],      // Raw data from sheets
    filteredData: [],       // After applying filters
    columnMapping: {},      // Column name to index mapping
    uiState: {}            // UI-specific state
}
```

**Responsibilities:**
- Store application state
- Provide getters/setters
- Maintain data consistency
- No business logic

### 2. Data Layer (`data-manager.js`)

**Current:** Single file (1,214 lines) - **To be modularized in Phase 3**

**Modules:**
- **Fetching**: Load data from Apps Script, caching
- **Filtering**: Search, filter, sort operations
- **Analytics**: Calculate metrics, risk scores
- **Anomalies**: Detect issues, smoke detectors
- **Accessors**: Get portfolio data, products by ID
- **AI**: Generate AI summaries

### 3. UI Layer (`ui/` modules)

Modular UI components, each responsible for specific rendering:

#### `ui-tabs.js` (76 lines)
- Switch between tabs
- Update active states
- Trigger tab-specific rendering

#### `ui-filters.js` (400 lines)
- Search functionality
- Multi-select dropdowns
- Filter pills
- Data quality filters

#### `ui-cards.js` (149 lines)
- Render solution cards
- Display metrics badges
- Update stats counters
- Collapsible sections by area

#### `ui-detail-panel.js` (299 lines)
- Show/hide detail panel
- Display product details
- Render metric charts
- Mobile responsive

#### `ui-charts.js` (226 lines)
- Chart.js initialization
- Metric chart rendering
- Chart instance management

#### `ui-governance.js` (1,322 lines)
- Governance dashboard
- Action layer with AI insights
- Smoke detector scorecard
- Metrics coverage
- Portfolio distribution
- Resource allocation

#### `ui-analytics.js` (596 lines)
- Analytics dashboard
- Executive metrics
- Portfolio breakdowns
- Performance tracking

#### `ui-drill-down.js` (496 lines)
- Cross-tab navigation
- Anomaly click handlers
- Filter state management

### 4. Utility Layer

#### `utils.js`
- Escape HTML
- Format numbers
- Date utilities
- Common helpers

#### `analytics.js`
- Event tracking
- User behavior monitoring
- Performance metrics

#### `ai-recommendations.js`
- AI recommendation generation
- LiteLLM API integration
- Prompt management

#### `ai-summaries-data.js`
- Pre-generated AI summaries
- 82 solution summaries
- Cached for performance

## Data Flow

### 1. Application Initialization

```javascript
// dashboard-script.js
1. Verify dependencies loaded
2. Initialize modules
3. Set up event listeners
4. Fetch initial data
5. Render UI
```

### 2. Data Fetching Flow

```
User clicks "Refresh Data"
    ↓
data-manager.fetchSheetData()
    ↓
Apps Script Web App
    ↓
Google Sheets (read data)
    ↓
JSON response to frontend
    ↓
state.setPortfolioData(data)
    ↓
Trigger UI re-render
```

### 3. Filter Flow

```
User applies filter
    ↓
ui-filters.js captures event
    ↓
data-manager.applyFilters()
    ↓
Filter/sort portfolio data
    ↓
state.setFilteredData(filtered)
    ↓
ui-cards.js renders filtered cards
```

### 4. Detail Panel Flow

```
User clicks card
    ↓
ui-cards.js handles click
    ↓
data-manager.getProductById(id)
    ↓
ui-detail-panel.js opens panel
    ↓
ui-charts.js renders metrics charts
```

### 5. Governance Dashboard Flow

```
User clicks Governance tab
    ↓
ui-tabs.js switches tab
    ↓
data-manager.fetchGovernanceData()
    ↓
Apps Script processes metrics
    ↓
Returns consolidated JSON
    ↓
ui-governance.js renders dashboard
```

## Backend Architecture

### Apps Script Structure

```javascript
// analytics-backend.gs

function doGet(e) {
    const action = e.parameter.action;
    
    if (action === 'getGovernanceData') {
        return getGovernanceData();
    }
    
    // Default: return raw data
    return getRawSheetData();
}

function getGovernanceData() {
    // Server-side processing
    return {
        smokeDetectors: calculateSmokeDetectorsSummary(),
        bauAnomalies: calculateBAUAnomalies(),
        dataHealth: calculateDataHealth(),
        ptechInvolvement: calculatePTechInvolvement(),
        teamConsumption: calculateTeamConsumption(),
        performanceMetrics: calculatePerformanceMetrics(),
        strategicGaps: calculateStrategicGaps()
    };
}
```

**Benefits:**
- Server-side data processing
- Reduced client-side computation
- Single consolidated endpoint
- Pre-calculated metrics

## Design Patterns

### 1. Module Pattern (IIFE)

All modules wrapped in Immediately Invoked Function Expression:

```javascript
(function() {
    'use strict';
    
    // Private variables and functions
    const privateVar = 'hidden';
    
    function privateFunction() {
        // Internal use only
    }
    
    // Public API
    window.ModuleName = {
        publicFunction: function() {
            // Exposed to other modules
        }
    };
    
    console.log('✅ Module loaded');
})();
```

**Benefits:**
- Encapsulation
- No global pollution
- Controlled API surface
- Clear dependencies

### 2. Singleton Pattern (State)

Single instance of state management:

```javascript
window.State = (function() {
    let instance;
    
    function createInstance() {
        return {
            portfolioData: [],
            // ...
        };
    }
    
    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
```

### 3. Observer Pattern (Events)

Event-driven UI updates:

```javascript
// Publisher
document.dispatchEvent(new CustomEvent('data-loaded', {
    detail: { data: portfolioData }
}));

// Subscriber
document.addEventListener('data-loaded', (e) => {
    renderCards(e.detail.data);
});
```

### 4. Facade Pattern (DataManager)

Simplified interface to complex subsystems:

```javascript
window.DataManager = {
    // Simple API hides complexity
    fetchData: () => { /* complex logic */ },
    filterData: () => { /* complex logic */ },
    getProduct: () => { /* complex logic */ }
};
```

## Performance Optimizations

### 1. Caching Strategy

```javascript
// Local storage cache
const CACHE_KEY = 'portfolio_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function shouldRefreshData() {
    const lastFetch = localStorage.getItem('last_fetch');
    return !lastFetch || (Date.now() - lastFetch > CACHE_DURATION);
}
```

### 2. Lazy Loading

```javascript
// Chart.js loaded on demand
function loadChartLibrary() {
    if (typeof Chart !== 'undefined') return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
```

### 3. Debouncing

```javascript
// Search input debounced
let searchTimeout;
function handleSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters(query);
    }, 300);
}
```

### 4. Virtual Scrolling (Planned)

For large datasets, render only visible cards.

## Security Considerations

### 1. Input Validation

```javascript
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### 2. API Key Protection

```javascript
// Never commit API keys
// Use environment variables or config
const API_KEY = CONFIG.LITELLM_API_KEY;
```

### 3. CORS Handling

```javascript
// Apps Script response
return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
```

## Error Handling

### Global Error Handler

```javascript
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Log to analytics
    // Show user-friendly message
});
```

### API Error Handling

```javascript
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API error');
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        showErrorMessage('Failed to load data');
        return loadCachedData(); // Fallback
    }
}
```

## Testing Strategy

### Unit Tests
- Individual function testing
- Mock dependencies
- Edge case coverage

### Integration Tests
- Module interaction testing
- Data flow validation
- API integration

### E2E Tests
- User workflow testing
- Cross-browser validation
- Performance benchmarks

## Future Improvements

### Phase 3: Data Layer Modularization
- Split `data-manager.js` into 6 focused modules
- Improve maintainability
- Enable parallel development
- Reduce cognitive load

### Potential Enhancements
- WebSocket for real-time updates
- Service Worker for offline support
- Progressive Web App (PWA)
- TypeScript migration
- Automated testing pipeline

## Related Documentation

- [Data Flow Diagram](data-flow.md)
- [Module Structure](module-structure.md)
- [API Reference](../api/)
- [Development Guide](../getting-started/local-development.md)

