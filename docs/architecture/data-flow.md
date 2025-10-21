# Data Flow Documentation

## Overview

This document describes how data flows through the P&C Portfolio Dashboard system.

## Primary Data Flows

### 1. Initial Data Load

```
Page Load
    ↓
dashboard-script.js verifies dependencies
    ↓
Calls fetchSheetData()
    ↓
HTTP GET → Apps Script Web App
    ↓
Apps Script reads Google Sheets
    ↓
Returns JSON { success, data, sheetName, lastUpdated }
    ↓
data-manager.js processes response
    ↓
Extracts column mapping (headers)
    ↓
window.State.setPortfolioData(data)
    ↓
Triggers renderCards()
    ↓
UI displays solution cards
```

### 2. Governance Data Flow

```
User clicks Governance tab
    ↓
ui-tabs.js switches active tab
    ↓
Calls UIManager.Governance.render()
    ↓
fetchGovernanceData()
    ↓
HTTP GET → Apps Script?action=getGovernanceData
    ↓
Apps Script calculates:
    - Smoke detectors summary
    - BAU anomalies
    - Data health metrics
    - PTech involvement
    - Team consumption
    - Performance metrics
    - Strategic gaps
    ↓
Returns consolidated JSON
    ↓
ui-governance.js renders sections:
    - Action Layer
    - Metrics Coverage
    - Portfolio Distribution
    - Resource Allocation
```

### 3. Filter Application Flow

```
User types in search OR selects filter
    ↓
ui-filters.js captures input
    ↓
Calls applyFilters(searchTerm, area, maturity, owner, sort, belowTarget)
    ↓
data-manager.applyFilters():
    1. Get current portfolio data
    2. Filter by search term (name, problem, solution)
    3. Filter by area (multi-select)
    4. Filter by maturity (multi-select)
    5. Filter by owner (multi-select)
    6. Filter by below target (boolean)
    7. Sort results
    ↓
window.State.setFilteredData(filtered)
    ↓
ui-filters.js updates filter pills
    ↓
ui-cards.js re-renders cards with filtered data
    ↓
Updates stats bar (total, missing metrics)
```

### 4. Detail Panel Flow

```
User clicks solution card
    ↓
ui-cards.js handles click event
    ↓
Calls renderDetailPanel(product)
    ↓
ui-detail-panel.js:
    1. Gets product data
    2. Builds HTML structure
    3. Inserts into #detail-panel
    4. Shows panel (adds 'visible' class)
    ↓
Calls renderMetricChart() for UX & BI
    ↓
ui-charts.js:
    1. Parses monthly data
    2. Creates Chart.js configuration
    3. Renders chart on canvas
```

### 5. AI Summary Flow

```
Card rendering
    ↓
Calls getCardSummaryMetrics(product)
    ↓
data-manager.js calls getAISummary(product.name, product.problem)
    ↓
Checks window.AI_SUMMARIES[productName]
    ↓
If exists:
    Returns AI-generated summary (120-147 chars)
If not exists:
    Returns original problem text
    ↓
Card displays problem text
    ↓
Shows "powered by OpenAI" attribution
```

### 6. Smoke Detector Flow

```
Solution data processing
    ↓
data-manager.calculateSmokeDetectors(product)
    ↓
Checks conditions:
    1. Missing UX metric?
    2. Missing BI metric?
    3. In decline stage?
    4. Data stale (no recent updates)?
    ↓
Returns count of triggered detectors
    ↓
Card rendering shows badge:
    - 🔥 Red if count > 0
    - Badge displays count
    ↓
User clicks badge → opens smoke detector modal
    ↓
Modal shows:
    - List of triggered detectors
    - Specific reasons
    - Recommended actions
```

## Data Structures

### Portfolio Data (Raw)

```javascript
[
    {
        id: 1,
        name: "Solution Name",
        owner: "Owner Name",
        area: "P&C Area",
        maturity: "Maturity Stage",
        problem: "Problem statement...",
        solution: "Solution description...",
        keyMetricUX: "Metric name",
        keyMetricBI: "Business metric",
        monthlyUX: [val1, val2, ..., val12],  // JAN-DEC
        monthlyBI: [val1, val2, ..., val12],
        targetUX: 85,
        targetBI: 100,
        // ... additional fields
    },
    // ... more solutions
]
```

### Governance Data (Processed)

```javascript
{
    smokeDetectors: {
        count: 15,
        triggered: [
            {
                name: "Solution Name",
                triggers: ["Lacking Metrics", "Decline Stage"],
                primaryTrigger: "Lacking Metrics"
            },
            // ...
        ]
    },
    bauAnomalies: {
        high: [...],      // ≥3800 hrs
        flagged: [...],   // 1900-3799 hrs
        normal: [...]     // <1900 hrs
    },
    dataHealth: {
        totalSolutions: 84,
        missingUX: 10,
        missingBI: 5,
        healthScore: 85
    },
    // ... other metrics
}
```

### State Structure

```javascript
window.State = {
    portfolioData: [],      // All solutions from sheets
    filteredData: [],       // After applying filters
    columnMapping: {        // Column name → index
        "Solution name": 0,
        "Owner's Name": 1,
        // ...
    },
    constants: {
        MONTHS: ['JAN', 'FEB', ...],
        MATURITY_COLORS: {...},
        // ...
    },
    uiState: {
        activeTab: 'portfolio-overview',
        detailPanelOpen: false,
        expandedSections: new Set()
    }
}
```

## API Endpoints

### Apps Script Web App

**Base URL:** `https://script.google.com/macros/s/[ID]/exec`

#### 1. Get Raw Data (Default)
```
GET /exec
Response: {
    success: true,
    data: [...],
    sheetName: "[2025] P&C Portfolio",
    lastUpdated: "2025-10-21T...",
    rowCount: 84,
    columnCount: 45
}
```

#### 2. Get Governance Data
```
GET /exec?action=getGovernanceData
Response: {
    success: true,
    message: "Governance data retrieved successfully",
    smokeDetectors: {...},
    bauAnomalies: {...},
    dataHealth: {...},
    ptechInvolvement: {...},
    teamConsumption: {...},
    performanceMetrics: {...},
    strategicGaps: {...},
    timestamp: "2025-10-21T..."
}
```

## Caching Strategy

### Local Storage Cache

```javascript
// Cache key format
const CACHE_KEY = 'portfolio_data_cache';
const CACHE_TIME_KEY = 'portfolio_last_fetch';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check if cache valid
function shouldRefreshData() {
    const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
    if (!lastFetch) return true;
    return (Date.now() - parseInt(lastFetch)) > CACHE_DURATION;
}

// Cache data
function cacheData(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
}

// Load from cache
function loadCachedData() {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
}
```

### Data Flow with Cache

```
fetchSheetData() called
    ↓
Check shouldRefreshData()
    ↓
If cached & fresh:
    Load from localStorage
    Return cached data
    ↓
If stale or missing:
    Fetch from Apps Script
    Cache response
    Return fresh data
```

## Error Handling Flow

```
API call fails
    ↓
Catch error in try/catch
    ↓
Log error to console
    ↓
Check if cached data available
    ↓
If cache exists:
    Load cached data (fallback)
    Show warning: "Using cached data"
    ↓
If no cache:
    Show error message
    Provide "Retry" button
    ↓
User clicks retry → Attempt fetch again
```

## Real-Time Updates (Future)

```
Planned: WebSocket connection
    ↓
Google Sheets changes
    ↓
Apps Script detects change (trigger)
    ↓
Push notification to connected clients
    ↓
Client receives update
    ↓
Incremental data sync (only changed rows)
    ↓
Update window.State
    ↓
Re-render affected UI components
```

## Performance Considerations

### Data Size Management
- **Current**: ~84 solutions, ~45 columns
- **Raw data size**: ~500KB uncompressed
- **Compressed**: ~100KB (gzip)
- **Load time**: <2 seconds

### Optimization Strategies
1. **Pagination**: Only load visible cards (virtual scrolling)
2. **Incremental Loading**: Load summary first, details on demand
3. **Data Compression**: Gzip compression on transfer
4. **Selective Fetching**: Only refresh changed data
5. **Client-side Processing**: Calculate metrics in browser when possible

## Related Documentation

- [Architecture Overview](overview.md)
- [Module Structure](module-structure.md)
- [API Reference](../api/)

