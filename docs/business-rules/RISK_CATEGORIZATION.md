# Risk Categorization Business Rules

**Version:** 1.0.0  
**Last Updated:** October 29, 2025  
**Owner:** P&C Portfolio Governance Team

---

## Overview

This document defines the unified business logic for categorizing portfolio solutions into risk levels. The risk categorization system combines **Risk Score** (0-10 scale) and **Smoke Detector** counts (0-4) to provide a comprehensive view of solution health.

---

## Risk Levels

### 🚨 CRITICAL ISSUES
**Internal Code:** `critical`  
**User-Facing Name:** "Critical Issues"  
**Badge Color:** Red (#ef4444)

**Purpose:** Identify solutions requiring urgent intervention.

**Filter Criteria (ANY of the following triggers CRITICAL):**
- Risk Score ≥ 7.0 OR
- Smoke Detectors ≥ 3 OR
- Maturity = "Decline" AND missing key metrics (UX or BI)

**User Intent:** "Show me solutions in crisis that need immediate action."

---

### ⚠️ MONITOR CLOSELY
**Internal Code:** `monitor`  
**User-Facing Name:** "Monitor Closely"  
**Badge Color:** Orange (#f59e0b)

**Purpose:** Flag solutions with warning signs that require attention.

**Filter Criteria (ANY of the following triggers MONITOR):**
- Risk Score 4.0-6.9 OR
- Smoke Detectors = 1-2 OR
- Below target performance (UX or BI < 50% of target)

**User Intent:** "Show me solutions needing proactive management."

---

### 💡 DATA GAPS
**Internal Code:** `datagaps`  
**User-Facing Name:** "Data Gaps"  
**Badge Color:** Purple (#6366f1)

**Purpose:** Highlight solutions with tracking or governance issues.

**Filter Criteria (ANY of the following triggers DATA GAPS):**
- Missing UX Key Metric OR
- Missing BI Key Metric OR
- Missing owner assignment OR
- Missing UX or BI targets (when metrics are defined) OR
- No monthly tracking data

**User Intent:** "Show me solutions with incomplete data that need governance attention."

---

## Risk Score Calculation (0-10 Scale)

**Function:** `window.DataManager.Analytics.calculateRiskScore(product)`  
**Implementation:** `src/js/core/data/data-analytics.js`

### Components

1. **Maturity Risk (0-4 points)**
   - Development: +4 points
   - Growth: +2 points
   - Decline: +3 points
   - Mature: +0 points

2. **Data Quality Risk (0-5 points)**
   - Missing UX Key Metric: +1.5 points
   - Missing BI Key Metric: +1.5 points
   - Missing UX Target: +1.0 point
   - Missing BI Target: +1.0 point

3. **Ownership Risk (0-1 point)**
   - Missing owner: +1.0 point

**Total Range:** 0.0 - 10.0 points

### Examples

| Scenario | Calculation | Total Risk Score |
|----------|-------------|------------------|
| Development solution, missing both metrics | 4 + 1.5 + 1.5 = **7.0** (CRITICAL) |
| Growth solution, all metrics present | 2 + 0 + 0 = **2.0** (LOW) |
| Mature solution, missing UX metric + target + owner | 0 + 1.5 + 1.0 + 1.0 = **3.5** (LOW) |
| Decline solution, missing BI target | 3 + 1.0 = **4.0** (MONITOR) |

---

## Smoke Detector Triggers (0-4 Count)

**Function:** `window.DataManager.Anomalies.calculateSmokeDetectors(product)`  
**Implementation:** `src/js/core/data/data-anomalies.js`

### Detector #1: 📉 Downward Trend
**Trigger:** 3+ consecutive months of declining UX or BI metrics

**Logic:**
```javascript
// Check last 3 months for downward trend
const last3Months = product.monthlyUX.slice(-3);
if (last3Months[0] > last3Months[1] && last3Months[1] > last3Months[2]) {
    detectorCount++;
}
```

**Example:** UX score: 75% → 70% → 65% (triggers detector)

---

### Detector #2: 🚫 Lacking Metrics
**Trigger:** Missing UX Key Metric OR missing BI Key Metric

**Logic:**
```javascript
const uxMetric = product.keyMetricUX;
const biMetric = product.keyMetricBI;
if (!uxMetric || uxMetric === '' || uxMetric === 'N/A' || 
    !biMetric || biMetric === '' || biMetric === 'N/A') {
    detectorCount++;
}
```

**Example:** Solution has UX metric defined but BI metric is "N/A" (triggers detector)

---

### Detector #3: ⚠️ Maturity Signal
**Trigger:** Solution is in "Decline" stage

**Logic:**
```javascript
const maturityStage = product.maturity?.toLowerCase().trim();
if (maturityStage.includes('decline') || maturityStage === '4. decline') {
    detectorCount++;
}
```

**Example:** Maturity = "4. Decline" (triggers detector)

---

### Detector #4: 👥 High BAU HC Allocation
**Trigger:** Headcount Allocation (BAU) > 3 HC

**Status:** **NEWLY ACTIVATED** (October 2025)

**Data Source:** Spreadsheet column "Total Headcount Allocation (BAU) in # HC"  
**Mapped to:** `product.totalBAUHC`

**Logic:**
```javascript
const bauHC = parseFloat(product.totalBAUHC) || 0;
if (bauHC > 3) {
    detectorCount++;
}
```

**Rationale:** Solutions consuming > 3 BAU headcount require closer monitoring for ROI and efficiency.

**Example:** Solution has 4.5 HC allocated to BAU → triggers detector

---

## Risk Categorization Logic

**Function:** `window.DataManager.Filtering.categorizeProductRisk(product)`  
**Implementation:** `src/js/core/data/data-filtering.js`

### Decision Flow

```
┌─────────────────────────────────────────────┐
│ Calculate Risk Score & Smoke Detector Count │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│ CRITICAL ISSUES?                                     │
│ • Risk Score ≥ 7                                    │
│ • Smoke Detectors ≥ 3                               │
│ • Decline + Missing Metrics                         │
└──────┬───────────────────────────────────────────────┘
       │ NO
       ▼
┌──────────────────────────────────────────────────────┐
│ MONITOR CLOSELY?                                     │
│ • Risk Score 4-6.9                                  │
│ • Smoke Detectors 1-2                               │
└──────┬───────────────────────────────────────────────┘
       │ NO
       ▼
┌──────────────────────────────────────────────────────┐
│ DATA GAPS?                                           │
│ • Missing UX/BI metrics                             │
│ • Missing owner/targets                             │
└──────┬───────────────────────────────────────────────┘
       │ NO
       ▼
   [ No Risk Category ]
```

---

## Interactive Badge Behavior

### Click Interaction
**Action:** Navigate to Explore tab and apply risk level filter

**Implementation:**
1. Badge click publishes `risk-badge:clicked` event
2. `ui-tabs.js` subscribes and switches to `portfolio-overview` tab
3. After 100ms delay, publishes `filter:risk-level` event
4. `ui-filters.js` subscribes and applies filter
5. Filter pill appears in active filters section
6. Solutions are filtered instantly (<200ms target)

### Hover Interaction
**Action:** Display tooltip with criteria + solution names

**Tooltip Content (Option A - Full Details):**
- Risk level title + solution count
- Trigger criteria (why this level?)
- Top 5 solutions (alphabetically)
- "Click to filter on Explore tab" CTA

**Performance Target:** Tooltip appears < 150ms

---

## Help Icon (?) Tooltip

**Location:** Next to "AI-Driven Insights" title in Governance Dashboard

**Purpose:** Provide comprehensive risk level guide without opening a modal

**Content:**
- All 3 risk levels with criteria
- All 4 smoke detector definitions
- Usage hint: "Hover badge for details • Click to filter"

**UX Decision:** Tooltip (not modal) for faster access and less disruption

---

## Validation & Testing

### Test Scenarios

#### Scenario 1: Development Solution
**Given:**
- Maturity: "1. Development"
- UX Metric: Missing
- BI Metric: Defined
- Risk Score: 4 + 1.5 = 5.5
- Smoke Detectors: 1 (Lacking Metrics)

**Expected:** MONITOR CLOSELY

---

#### Scenario 2: Decline with Missing Metrics
**Given:**
- Maturity: "4. Decline"
- UX Metric: Missing
- BI Metric: Missing
- Risk Score: 3 + 1.5 + 1.5 = 6.0
- Smoke Detectors: 2 (Lacking Metrics + Maturity Signal)

**Expected:** CRITICAL ISSUES (Decline + Missing Metrics rule)

---

#### Scenario 3: High BAU HC
**Given:**
- Maturity: "3. Mature"
- All metrics present
- BAU HC: 4.5
- Risk Score: 0
- Smoke Detectors: 1 (High BAU HC)

**Expected:** MONITOR CLOSELY (1 smoke detector)

---

#### Scenario 4: Missing Owner Only
**Given:**
- Maturity: "3. Mature"
- All metrics + targets present
- Owner: Missing
- Risk Score: 0 + 1.0 = 1.0
- Smoke Detectors: 0

**Expected:** DATA GAPS (Missing owner)

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-29 | Initial documentation with all 3 risk levels, 4 smoke detectors, and interactive badge behavior | AI Implementation |

---

## References

- **Implementation Files:**
  - Risk Categorization: `src/js/core/data/data-filtering.js`
  - Risk Score: `src/js/core/data/data-analytics.js`
  - Smoke Detectors: `src/js/core/data/data-anomalies.js`
  - UI Interaction: `src/js/core/ui/ui-governance.js`
  - Cross-Tab Navigation: `src/js/core/ui/ui-tabs.js`
  - Filter Application: `src/js/core/ui/ui-filters.js`

- **Related Documentation:**
  - `docs/features/SMOKE_DETECTORS_README.md`
  - `docs/features/AI_FEATURES_USER_STORIES.md`
  - `docs/architecture/data-flow.md`

---

**Questions? Contact the P&C Portfolio Governance Team.**

