# API Deprecation Plan - Data Manager

**Version:** 1.0  
**Created:** November 16, 2025  
**Status:** Planning Phase

## Overview

The `data-manager-index.js` currently exposes 40+ methods for backward compatibility. This document outlines the deprecation strategy to move towards the event-driven facade API.

---

## Current API Surface

### ✅ Recommended Facade API (7 methods)

**These are the PREFERRED methods for new code:**

| Method | Purpose | Event Emitted | Status |
|--------|---------|---------------|--------|
| `fetchData()` | Fetch portfolio data | `data:loaded`, `data:fetch:error` | ✅ Active |
| `filterData(criteria)` | Filter portfolio | `data:filtered` | ✅ Active |
| `fetchGovernance()` | Fetch governance data | `data:governance:loaded` | ✅ Active |
| `getFilteredData()` | Read filtered data | None (read-only) | ✅ Active |
| `getPortfolioData()` | Read portfolio data | None (read-only) | ✅ Active |
| `getProductById(id)` | Get product by ID | None (read-only) | ✅ Active |
| `getSummaryMetrics()` | Get summary metrics | None (read-only) | ✅ Active |

---

## Legacy Methods - Deprecation Plan

### Phase 1: Mark as Deprecated (Immediate)

**Category: Direct Sub-Module Access** *(33 methods)*

These methods directly expose sub-module functionality and should be migrated to facade methods or event subscriptions.

#### Data Fetching (5 methods)
- ⚠️ `fetchSheetData()` → Use `fetchData()` facade method
- ⚠️ `fetchGovernanceData()` → Use `fetchGovernance()` facade method
- `fetchAllDataParallel()` → Evaluate if still needed
- `prefetchGovernanceData()` → Consider removing
- `getCachedGovernanceData()` → Evaluate if still needed

#### Caching Methods (3 methods)
- `cacheData()` → Internal to fetching module
- `loadCachedData()` → Internal to fetching module
- `shouldRefreshData()` → Internal to fetching module

#### Filtering Methods (3 methods)
- ⚠️ `applyFilters()` → Use `filterData()` facade method
- `sortData()` → Consider wrapping in facade
- `getFilterOptions()` → Keep (read-only utility)

#### Analytics Methods (6 methods)
- `calculatePerformanceVsTarget()` → Consider facade wrapper
- `calculateRiskScore()` → Consider facade wrapper
- `analyzePortfolioData()` → Consider facade wrapper
- `getQuadrant()` → Utility, keep
- `analyzeHealthFactors()` → Consider facade wrapper
- `calculatePortfolioMetrics()` → Consider facade wrapper

#### Anomaly Detection (3 methods)
- `checkAnomalies()` → Consider facade wrapper
- `calculateSmokeDetectors()` → Keep (actively used in UI)
- `runSmokeDetectorTests()` → Internal testing, consider removing

#### Data Accessors (5 methods)
- ✅ `getProductStats()` → Keep (read-only)
- ✅ `countMissingMetrics()` → Keep (read-only)
- ✅ `getCardSummaryMetrics()` → Already in facade
- ✅ `calculateFilteredSummaryMetrics()` → Keep (read-only)
- ✅ `getProductById()` → Already in facade

#### Time Utilities (3 methods)
- `updateLastFetchTime()` → Internal to fetching
- `getLastUpdateTime()` → Keep (useful utility)
- `shouldRefreshData()` → Already listed above

#### Other (5 methods)
- `getAISummary()` → Keep (AI feature)
- `debounce()` → Move to Utils module
- Direct sub-module access: `AI`, `Fetching`, `Filtering`, `Analytics`, `Anomalies`, `Accessors`, `Governance`

---

## Migration Strategy

### Step 1: Add Deprecation Warnings (Sprint 1)

Add console.warn to deprecated methods:

```javascript
function applyFilters(...args) {
    console.warn('[DEPRECATED] DataManager.applyFilters() is deprecated. Use DataManager.filterData() instead.');
    return window.DataManager.Filtering.applyFilters(...args);
}
```

### Step 2: Update Documentation (Sprint 1)

- Update all docs to recommend facade methods
- Add migration guide showing old → new patterns
- Update code examples in documentation

### Step 3: Code Migration (Sprint 2-3)

Systematically update code to use facade methods:

**Priority 1: UI Modules**
- ui-cards.js
- ui-filters.js
- ui-governance.js
- ui-detail-panel.js

**Priority 2: Dashboard Orchestrator**
- dashboard-script.js

**Priority 3: Other Modules**
- Any remaining references

### Step 4: Remove Deprecated Methods (Sprint 4+)

After confirming zero usage:
1. Remove method from data-manager-index.js
2. Update version to v9.0.0 (breaking change)
3. Document removal in CHANGELOG

---

## Recommended API Patterns

### Before (Legacy)
```javascript
// Direct sub-module call
const data = await window.DataManager.fetchSheetData();

// Direct filtering
const filtered = window.DataManager.applyFilters(
    searchTerm, areaFilters, journeyFilters, maturityFilters, 
    targetUserFilters, ownerFilters, sortBy, belowTargetOnly
);
```

### After (Facade + Events)
```javascript
// Facade method with event subscription
window.Utils.subscribe('data:loaded', (event) => {
    const { portfolioData, columnMapping } = event.detail;
    // Handle data loaded
});

const data = await window.DataManager.fetchData();

// Facade filtering
const filtered = window.DataManager.filterData({
    searchTerm,
    areaFilters,
    journeyFilters,
    maturityFilters,
    targetUserFilters,
    ownerFilters,
    sortBy,
    belowTargetOnly
});
```

---

## Success Metrics

- ✅ All UI modules using facade methods (0 direct sub-module calls)
- ✅ Documentation updated to show facade patterns
- ✅ Zero deprecation warnings in production console
- ✅ API surface reduced from 40+ to ~15 active methods
- ✅ Event-driven patterns adopted for data operations

---

## Timeline

| Phase | Duration | Completion Date |
|-------|----------|-----------------|
| Add Warnings | 1 week | TBD |
| Update Docs | 1 week | TBD |
| Migrate UI Modules | 2-3 weeks | TBD |
| Remove Deprecated | 1 week | TBD |

**Total Estimated Time:** 5-6 weeks

---

## Notes

- Maintain backward compatibility during migration period
- Use feature flags if needed for gradual rollout
- Monitor usage with analytics before removing methods
- Keep read-only accessor methods (no side effects)

