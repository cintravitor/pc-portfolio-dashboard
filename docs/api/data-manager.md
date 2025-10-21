# Data Manager API Reference

## Overview

`window.DataManager` provides all data operations including fetching, filtering, analytics, and anomaly detection.

## Data Fetching

### `fetchSheetData()`

Fetches portfolio data from Google Sheets via Apps Script.

**Returns**: `Promise<Object>`

**Response**:
```javascript
{
    success: true,
    data: Array,          // Portfolio solutions
    sheetName: String,
    lastUpdated: String,
    rowCount: Number,
    columnCount: Number
}
```

**Example**:
```javascript
const result = await window.DataManager.fetchSheetData();
if (result.success) {
    console.log(`Loaded ${result.rowCount} solutions`);
}
```

### `fetchGovernanceData()`

Fetches pre-processed governance metrics from Apps Script.

**Returns**: `Promise<Object>`

**Response**:
```javascript
{
    smokeDetectors: {...},
    bauAnomalies: {...},
    dataHealth: {...},
    ptechInvolvement: {...},
    teamConsumption: {...},
    performanceMetrics: {...},
    strategicGaps: {...},
    timestamp: String
}
```

### `cacheData(data)`

Stores data in localStorage for offline access.

**Parameters**:
- `data` (Array): Portfolio data to cache

**Returns**: `void`

### `loadCachedData()`

Retrieves cached data from localStorage.

**Returns**: `Array | null`

## Filtering & Search

### `applyFilters(searchTerm, areaFilters, maturityFilters, ownerFilters, sortBy, belowTargetOnly)`

Applies filters and sorting to portfolio data.

**Parameters**:
- `searchTerm` (String): Search query
- `areaFilters` (Array): P&C areas to include
- `maturityFilters` (Array): Maturity stages to include
- `ownerFilters` (Array): Owner names to include
- `sortBy` (String): Sort key ('name-asc', 'name-desc', etc.)
- `belowTargetOnly` (Boolean): Filter to below-target solutions

**Returns**: `Array` - Filtered solutions

**Example**:
```javascript
const filtered = window.DataManager.applyFilters(
    'onboarding',           // search
    ['PATO', 'PSE'],       // areas
    ['3. Mature'],         // maturity
    [],                    // owners
    'name-asc',            // sort
    false                  // below target
);
```

### `sortData(data, sortBy)`

Sorts portfolio data by specified criteria.

**Parameters**:
- `data` (Array): Data to sort
- `sortBy` (String): Sort key

**Sort Options**:
- `'name-asc'`, `'name-desc'`
- `'maturity-asc'`
- `'area-asc'`
- `'owner-asc'`

**Returns**: `Array` - Sorted data

### `getFilterOptions()`

Gets available filter values from current data.

**Returns**: `Object`
```javascript
{
    areas: ['PATO', 'PSE', 'PJC', ...],
    maturity: ['1. Development', '2. Growth', ...],
    owners: ['John Doe', 'Jane Smith', ...]
}
```

## Analytics

### `calculatePerformanceVsTarget(product)`

Calculates if solution meets performance targets.

**Parameters**:
- `product` (Object): Solution data

**Returns**: `Object`
```javascript
{
    uxPerformance: Number,     // % of target achieved
    biPerformance: Number,
    uxMeetsTarget: Boolean,
    biMeetsTarget: Boolean
}
```

### `calculateRiskScore(product)`

Calculates risk score (0-100) based on multiple factors.

**Parameters**:
- `product` (Object): Solution data

**Returns**: `Number` - Risk score (0-100, higher = more risk)

**Factors**:
- Missing metrics
- Below-target performance
- Decline stage
- Data staleness
- High BAU allocation

### `analyzePortfolioData(data)`

Performs comprehensive portfolio analysis.

**Parameters**:
- `data` (Array): Portfolio solutions

**Returns**: `Object`
```javascript
{
    totalSolutions: Number,
    byMaturity: Object,
    byArea: Object,
    avgRiskScore: Number,
    healthFactors: Object,
    // ... more metrics
}
```

### `calculatePortfolioMetrics()`

Calculates executive-level portfolio metrics.

**Returns**: `Object`
```javascript
{
    totalSolutions: Number,
    maturityBreakdown: Object,
    areaDistribution: Object,
    metricsHealth: Object,
    performanceSummary: Object
}
```

## Anomaly Detection

### `checkAnomalies()`

Identifies portfolio anomalies and issues.

**Returns**: `Object`
```javascript
{
    ownerOverAllocation: Array,  // Owners with too many solutions
    missingMetrics: Array,       // Solutions missing key metrics
    decliningSolutions: Array,   // Solutions in decline
    staleData: Array            // Solutions with no recent updates
}
```

### `calculateSmokeDetectors(productData)`

Calculates smoke detector count for a solution.

**Parameters**:
- `productData` (Object): Solution data

**Returns**: `Number` - Count of triggered detectors

**Detectors**:
1. Missing UX metric
2. Missing BI metric
3. In decline stage
4. No data updates in 3+ months

**Example**:
```javascript
const count = window.DataManager.calculateSmokeDetectors(product);
if (count > 0) {
    console.warn(`${count} issues detected for ${product.name}`);
}
```

## Data Accessors

### `getPortfolioData()`

Returns full unfiltered portfolio data.

**Returns**: `Array`

### `getFilteredData()`

Returns currently filtered data.

**Returns**: `Array`

### `getProductById(id)`

Gets single solution by ID.

**Parameters**:
- `id` (Number): Solution ID

**Returns**: `Object | null`

**Example**:
```javascript
const product = window.DataManager.getProductById(42);
if (product) {
    console.log(product.name);
}
```

### `getProductStats()`

Gets statistics about filtered products.

**Returns**: `Object`
```javascript
{
    total: Number,
    missingUX: Number,
    missingBI: Number,
    belowTargetUX: Number,
    belowTargetBI: Number
}
```

### `getCardSummaryMetrics(product)`

Gets display metrics for solution card.

**Parameters**:
- `product` (Object): Solution data

**Returns**: `Object`
```javascript
{
    owner: String,
    problem: String,        // AI summary or original
    maturity: String,
    area: String,
    uxStatus: String,      // 'green', 'red', 'gray'
    biStatus: String,
    uxMetric: String,
    biMetric: String,
    uxValue: Number,
    biValue: Number,
    uxTarget: Number,
    biTarget: Number
}
```

## AI Integration

### `getAISummary(solutionName, originalProblem)`

Gets AI-generated summary for solution.

**Parameters**:
- `solutionName` (String): Solution name
- `originalProblem` (String): Original problem text (fallback)

**Returns**: `String` - AI summary (120-147 chars) or original

**Example**:
```javascript
const summary = window.DataManager.getAISummary(
    "M5+ Onboarding",
    "Long original problem statement..."
);
// Returns: "M5+ managers face unstructured onboarding..."
```

## Error Handling

All async functions handle errors gracefully:

```javascript
try {
    const data = await window.DataManager.fetchSheetData();
} catch (error) {
    console.error('Failed to fetch:', error);
    // Falls back to cached data if available
    const cached = window.DataManager.loadCachedData();
}
```

## Related Documentation

- [UI Modules API](ui-modules.md)
- [Apps Script API](apps-script.md)
- [Architecture Overview](../architecture/overview.md)

