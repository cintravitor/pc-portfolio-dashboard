# UI-Data Coupling Audit Report

**Date:** November 16, 2025  
**Audited By:** Architectural Review  
**Status:** Complete

## Executive Summary

Found **23 direct `window.DataManager` calls** across 7 UI modules. This audit identifies coupling points and provides migration recommendations to achieve better decoupling through the event-driven facade API.

---

## Findings by Module

### 1. ui-detail-panel.js (2 calls)

**Current Coupling:**
- `window.DataManager.getFilteredData()` - Line 480 (navigation context)
- `window.DataManager.getProductById(productId)` - Line 518 (show detail)

**Severity:** 🟢 LOW  
**Recommendation:** Keep as-is (read-only accessors, no side effects)

---

### 2. ui-filters.js (3 calls)

**Current Coupling:**
- `window.DataManager.getFilterOptions()` - Line 391 (populate filters)
- `window.DataManager.filterData(filterCriteria)` - Line 695 ✅ (FACADE METHOD)
- `window.DataManager.getPortfolioData().length` - Line 711 (count display)

**Severity:** 🟢 LOW  
**Recommendation:** 
- ✅ Already using facade method for filtering
- Replace line 711 with `getSummaryMetrics()` facade method

**Migration Example:**
```javascript
// OLD:
totalCount: window.DataManager.getPortfolioData().length

// NEW:
const metrics = window.DataManager.getSummaryMetrics();
totalCount: metrics.totalCount
```

---

### 3. ui-governance.js (3 calls)

**Current Coupling:**
- `window.DataManager.Governance.calculateAll(portfolioData)` - Line 152 (DIRECT SUB-MODULE)
- `window.DataManager.Filtering.categorizeProductRisk(product)` - Line 1743 (DIRECT SUB-MODULE)
- `window.DataManager.Governance.calculateAll(filteredData)` - Line 1819 (DIRECT SUB-MODULE)

**Severity:** 🟡 MEDIUM  
**Recommendation:** Wrap in facade methods or migrate to event-driven pattern

**Proposed Facade Methods:**
```javascript
// In data-manager-index.js:
function calculateGovernanceMetrics(data) {
    return window.DataManager.Governance.calculateAll(data);
}

function categorizeRisk(product) {
    return window.DataManager.Filtering.categorizeProductRisk(product);
}
```

---

### 4. ui-cards.js (7 calls)

**Current Coupling:**
- `window.DataManager.getFilteredData()` - Line 58, 284, 658 (READ-ONLY)
- `window.DataManager.getCardSummaryMetrics(product)` - Line 336 ✅ (IN FACADE)
- `window.DataManager.calculateSmokeDetectors(product)` - Line 339 (smoke detectors)
- `window.DataManager.calculateFilteredSummaryMetrics(filteredData)` - Line 659, 982 (metrics)
- `window.DataManager.getLastUpdateTime()` - Line 683 (timestamp)

**Severity:** 🟢 LOW  
**Recommendation:** Mostly read-only accessors which are acceptable. Consider caching `getFilteredData()` calls.

**Optimization:**
```javascript
// Instead of calling getFilteredData() 3 times:
const filteredData = window.DataManager.getFilteredData(); // Once
// Reuse variable throughout
```

---

### 5. ui-tabs.js (2 calls)

**Current Coupling:**
- `window.DataManager.getFilteredData()` - Line 197 (READ-ONLY)
- `window.DataManager.getPortfolioData()` - Line 198 (READ-ONLY)

**Severity:** 🟢 LOW  
**Recommendation:** Keep as-is (read-only accessors)

---

### 6. ui-governance-core.js (2 calls)

**Current Coupling:**
- `window.DataManager.Governance.calculateAll(portfolioData)` - Line 91, 217 (DIRECT SUB-MODULE)

**Severity:** 🟡 MEDIUM  
**Recommendation:** Same as ui-governance.js - wrap in facade method

---

### 7. ui-drill-down.js (4 calls)

**Current Coupling:**
- `window.DataManager.checkAnomalies()` - Line 77 (anomaly detection)
- `window.DataManager.calculatePortfolioMetrics()` - Line 341 (metrics)
- `window.DataManager.analyzePortfolioData(filteredData)` - Line 342 (analysis)

**Severity:** 🟡 MEDIUM  
**Recommendation:** Consider facade methods or event subscriptions for data operations

---

## Summary by Severity

| Severity | Count | Modules |
|----------|-------|---------|
| 🔴 HIGH | 0 | None |
| 🟡 MEDIUM | 9 | ui-governance.js (3), ui-governance-core.js (2), ui-drill-down.js (4) |
| 🟢 LOW | 14 | ui-detail-panel.js (2), ui-filters.js (2), ui-cards.js (7), ui-tabs.js (2), ui-filters.js (1) |

---

## Decoupling Recommendations

### Priority 1: Facade Methods (Week 1)

Add these facade methods to `data-manager-index.js`:

```javascript
// Governance metrics
function calculateGovernanceMetrics(data) {
    return window.DataManager.Governance.calculateAll(data);
}

// Risk categorization
function categorizeRisk(product) {
    return window.DataManager.Filtering.categorizeProductRisk(product);
}

// Anomaly detection (already exposed, but formalize)
function detectAnomalies() {
    return window.DataManager.Anomalies.checkAnomalies();
}

// Portfolio metrics
function getPortfolioMetrics() {
    return window.DataManager.Analytics.calculatePortfolioMetrics();
}

// Portfolio analysis
function analyzePortfolio(data) {
    return window.DataManager.Analytics.analyzePortfolioData(data);
}
```

### Priority 2: Event-Driven Pattern (Week 2-3)

Migrate operations with side effects to event-driven pattern:

**Example: Governance Data Calculation**

```javascript
// BEFORE (Direct call):
const governanceData = window.DataManager.Governance.calculateAll(portfolioData);

// AFTER (Event-driven):
window.Utils.subscribe('governance:calculated', (event) => {
    const { governanceData } = event.detail;
    // Handle governance data
});

// Trigger calculation
window.DataManager.calculateGovernanceMetrics(portfolioData);
// Emits: 'governance:calculated' event
```

### Priority 3: Minimize Read-Only Calls (Week 3)

While read-only accessors are acceptable, reduce redundant calls:

```javascript
// BAD (3 calls to same method):
function render() {
    const data1 = window.DataManager.getFilteredData();
    // ... 100 lines later ...
    const data2 = window.DataManager.getFilteredData();
    // ... 50 lines later ...
    const data3 = window.DataManager.getFilteredData();
}

// GOOD (1 call, reuse):
function render() {
    const filteredData = window.DataManager.getFilteredData();
    // Reuse filteredData throughout
}
```

---

## Metrics

- **Total Coupling Points:** 23
- **Direct Sub-Module Access:** 9 (39%)
- **Read-Only Accessors:** 14 (61%)
- **Facade Methods Used:** 2 (9%)
- **Target Reduction:** 50% (11 → recommended facade methods)

---

## Action Items

1. ✅ Complete this audit
2. Create facade methods for medium-severity coupling
3. Update UI modules to use facade methods
4. Document event-driven patterns for common operations
5. Add unit tests for facade methods
6. Monitor coupling metrics over time

---

## Conclusion

The current coupling level is **acceptable** for a modular monolith, with most calls being read-only accessors. The 9 direct sub-module calls represent the primary opportunity for improvement.

**Recommendation:** Implement Priority 1 facade methods in next sprint to reduce coupling by ~40%.

