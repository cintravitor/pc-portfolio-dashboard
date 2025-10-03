# User Stories - Data Attributes Addendum

**Date:** October 3, 2025  
**Purpose:** Data attribute specifications for all remaining user stories

This document provides the **Data Used in Business Rule** and **Data Tracked from User Interaction** attributes for stories 2.1-5.3.

---

## Tab 2: Descriptive Analysis

### Story 2.1: View Portfolio Overview Stats

**Data Used in Business Rule:**
- `portfolioData.length` - Total Solutions count
- `[...new Set(portfolioData.map(p => p.maturity))]` - Unique Maturity Stages
- `[...new Set(portfolioData.map(p => p.area))]` - Unique P&C Areas
- `[...new Set(portfolioData.map(p => p.owner))]` - Unique Product Owners
- `analyzePortfolioData(portfolioData)` - Analysis function
- No filters applied (uses full dataset)

**Data Tracked from User Interaction:**
- Tab switch to Descriptive Analysis
- Time spent viewing overview stats
- Stat card hover events
- Order of sections viewed
- Screenshots or exports taken
- Return visits to this tab

---

### Story 2.2: Analyze Maturity Distribution

**Data Used in Business Rule:**
- `product.maturity` - Maturity Stage field
- Groups solutions by maturity value
- `array.reduce()` for counting per stage
- `array.sort()` by count (descending)
- Calculates dominant stage percentage: `(count / total) * 100`
- Maturity stages: "1. Development", "2. Growth", "3. Mature", "4. Decline"

**Data Tracked from User Interaction:**
- Maturity distribution section views
- Hover on maturity list items
- Time spent analyzing distribution
- Actions taken after viewing (e.g., filter by stage)
- Comparison with previous views
- Insight box reads

---

### Story 2.3: Assess Metrics Coverage

**Data Used in Business Rule:**
- `product.keyMetricUX` - UX Metric field (checks if defined/not N/A)
- `product.keyMetricBI` - BI Metric field (checks if defined/not N/A)
- Counts solutions where UX metric is defined
- Counts solutions where BI metric is defined
- Counts solutions with both metrics
- Counts solutions with no metrics
- Calculates percentages: `(count / total) * 100`
- Logic: `isInvalid = (val) => !val || val === '' || val === 'N/A'`

**Data Tracked from User Interaction:**
- Metrics coverage section views
- Stat card interactions
- Time spent on metrics coverage
- Correlation with data quality actions
- Actions taken after identifying gaps
- Solutions without metrics investigation

---

### Story 2.4: View Solutions by Area

**Data Used in Business Rule:**
- `product.area` - P&C Area field
- Groups solutions by area
- Counts per area using `array.reduce()`
- Sorts areas by count (descending)
- P&C Areas: HRBP, PATO, PSE, PJC, Talent Acquisition

**Data Tracked from User Interaction:**
- Area list views
- Hover on specific areas
- Click-through to filtered view by area
- Most viewed areas
- Time spent per area section
- Area comparison behavior

---

### Story 2.5: Understand Regulatory Mix

**Data Used in Business Rule:**
- `product.regulatory` - Is a regulatory demand? (YES/NO)
- Counts where `product.regulatory === "YES"`
- Counts where `product.regulatory === "NO"` or empty
- Calculates regulatory percentage: `(regulatory / total) * 100`
- Creates key insight with percentage

**Data Tracked from User Interaction:**
- Regulatory section views
- Stat card interactions (regulatory vs non-regulatory)
- Time spent analyzing compliance mix
- Actions after viewing regulatory mix
- Correlation with risk analysis
- Insight box engagement

---

### Story 2.6: Identify Top Solution Owners

**Data Used in Business Rule:**
- `product.owner` - Owner's Name field
- Groups solutions by owner
- Counts per owner using `array.reduce()`
- Sorts owners by count (descending)
- Takes top 10: `array.slice(0, 10)`
- Shows remaining count if total owners > 10
- Formula: "...and X more owners" where X = totalOwners - 10

**Data Tracked from User Interaction:**
- Top owners section views
- Hover on specific owners
- Click-through to owner details
- Most viewed owners
- Time spent analyzing workload
- Workload balancing actions taken

---

### Story 2.7: Automatic Analysis Loading

**Data Used in Business Rule:**
- `analysisDataLoaded` - Boolean flag (prevents re-calculation)
- `portfolioData` - Full dataset (must be loaded first)
- `localStorage.getItem(DATA_CACHE_KEY)` - Fallback cached data
- `analyzePortfolioData(data)` - Main analysis function
- `displayAnalysisResults(analysis)` - Rendering function
- Error handling if portfolioData is empty

**Data Tracked from User Interaction:**
- Analysis load triggers (first visit vs cached)
- Load time/latency
- Error occurrences (no data available)
- User navigation after load
- Tab switch patterns
- Re-calculation triggers (refresh button)

---

## Tab 3: Strategic View

### Story 3.1: Monitor Portfolio Health Score

**Data Used in Business Rule:**
- `calculatePerformanceVsTarget(product)` - Function that returns % (0-100)
- `product.monthlyUX[]` - Array of monthly UX values
- `product.targetUX` - UX target value
- `product.monthlyBI[]` - Array of monthly BI values
- `product.targetBI` - BI target value
- Counts months where `actual >= target`
- Formula: `(achievedMonths / totalMonths) * 100`
- Averages across all products with valid data
- Excludes products with 0% (no data)
- `Math.round()` for final percentage

**Data Tracked from User Interaction:**
- Strategic View tab visits
- Portfolio Health card views
- Time spent viewing health score
- Health score trend analysis (if comparing over time)
- Actions taken based on health score
- Drill-down attempts (if feature exists)
- Screenshots of health metrics

---

### Story 3.2: Understand Risk Distribution

**Data Used in Business Rule:**
- `calculateRiskScore(product)` - Function returning 0-10 score
- `product.maturity` - Base risk from maturity:
  - "1. Development" = +4 points
  - "2. Growth" = +2 points
  - "3. Mature" = +0 points
  - "4. Decline" = +3 points
- `product.keyMetricUX` - Missing = +1.5 risk points
- `product.keyMetricBI` - Missing = +1.5 risk points
- `product.targetUX` - Missing = +1 risk point
- `product.targetBI` - Missing = +1 risk point
- `product.owner` - Missing = +1 risk point
- Risk categories:
  - High: score >= 7
  - Medium: score >= 4 && score < 7
  - Low: score < 4
- Counts products per category

**Data Tracked from User Interaction:**
- Risk distribution card views
- Risk category hover events
- Time spent analyzing risk
- High-risk product investigation
- Risk-based filtering actions
- Risk distribution trend over time
- Correlation with portfolio actions

---

### Story 3.3: Track Target Achievement Rate

**Data Used in Business Rule:**
- Same as Story 3.1 (Portfolio Health Score)
- `calculatePerformanceVsTarget(product)` - Performance calculation
- Averages all valid performance scores
- Currently: `targetAchievement = portfolioHealthScore`
- Could be enhanced to weight differently or focus on different metrics

**Data Tracked from User Interaction:**
- Target achievement card views
- Time spent analyzing achievement rate
- Comparison with risk distribution
- Actions taken for below-target products
- Trend analysis (comparing over time)
- Benchmark comparisons

---

### Story 3.4: Automatic Strategic Calculations

**Data Used in Business Rule:**
- `portfolioData[]` - Full dataset array
- `portfolioData.map(product => calculatePerformanceVsTarget(product))` - All performance scores
- `portfolioData.map(product => calculateRiskScore(product))` - All risk scores
- `array.filter(score => score > 0)` - Valid performance scores only
- `array.reduce((sum, score) => sum + score, 0) / count` - Average calculation
- `array.filter(p => p.riskScore >= 7).length` - High risk count
- `array.filter(p => p.riskScore >= 4 && p.riskScore < 7).length` - Medium risk count
- `array.filter(p => p.riskScore < 4).length` - Low risk count
- Error handling for empty portfolioData

**Data Tracked from User Interaction:**
- Calculation triggers (tab switch)
- Calculation latency/performance
- Error occurrences
- Data freshness at calculation time
- User navigation after viewing calculated results
- Recalculation frequency

---

### Story 3.5: View Strategic Metrics Documentation

**Data Used in Business Rule:**
- Documentation files (markdown):
  - `PHASE2_VERIFICATION.md` - Calculation details
  - `USER_STORIES.md` - This file
  - Code comments in `dashboard-script.js`
- Risk scoring formula constants
- Performance calculation logic
- Edge case handling documentation

**Data Tracked from User Interaction:**
- Documentation access (if help links exist)
- Help/tooltip interactions
- Time spent reading calculation explanations
- External documentation views
- Support requests related to metrics
- Stakeholder questions about calculations

---

## Cross-Tab Features

### Story 4.1: Switch Between Tabs

**Data Used in Business Rule:**
- `currentTab` - Global variable tracking active tab
- `btn.dataset.tab` - Tab identifier from button data attribute
- `document.querySelectorAll('.tab-btn')` - All tab buttons
- `document.querySelectorAll('.tab-content')` - All tab content divs
- `filtersSection.style.display` - Show/hide filters logic
- Tab names: 'portfolio-overview', 'descriptive-analysis', 'strategic-view'
- CSS classes: `.active`, `.hidden`

**Data Tracked from User Interaction:**
- Tab switch events (which tab → which tab)
- Tab switch frequency
- Time spent per tab
- Tab switch patterns/sequences
- Most used tab
- Tab abandonment (switch away quickly)
- Session tab navigation flow

---

### Story 4.2: Maintain Data Consistency

**Data Used in Business Rule:**
- `portfolioData[]` - Single source of truth
- `filteredData[]` - Filtered view (Portfolio Overview only)
- `analysisDataLoaded` - Analysis cache flag
- `DATA_CACHE_KEY` - localStorage key
- `STORAGE_KEY` - Timestamp key
- All tabs read from same `portfolioData` source
- Refresh triggers re-population of all views
- Cache validation on data changes

**Data Tracked from User Interaction:**
- Data refresh events
- Cache hits vs misses
- Data age when viewed
- Stale data warnings shown
- Refresh trigger reasons
- Data consistency issues reported
- Cross-tab data verification behavior

---

### Story 4.3: Mobile-Friendly Navigation

**Data Used in Business Rule:**
- `window.innerWidth` - Screen size detection
- CSS media queries: `@media (max-width: 768px)`
- Responsive grid: `grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))`
- Touch targets: 44px minimum
- Mobile-specific CSS classes
- Viewport meta tag settings

**Data Tracked from User Interaction:**
- Device type (mobile/tablet/desktop)
- Screen size distribution
- Touch vs click events
- Mobile tab switching behavior
- Scroll patterns on mobile
- Mobile layout issues (bounce rate)
- Mobile session duration
- Feature usage on mobile vs desktop

---

### Story 4.4: Offline Capability

**Data Used in Business Rule:**
- `localStorage.getItem(DATA_CACHE_KEY)` - Cached portfolio data
- `localStorage.getItem(STORAGE_KEY)` - Last update timestamp
- `navigator.onLine` - Browser online status (optional)
- Fallback logic in `fetchSheetData()` catch block
- Cache age calculation
- Error message display for offline state

**Data Tracked from User Interaction:**
- Offline sessions (count, duration)
- Cache usage frequency
- Data age during offline usage
- Online/offline transition events
- Refresh attempts while offline
- User behavior differences when offline
- Cache size over time

---

## Technical Stories

### Story 5.1: Optimize Page Load Performance

**Data Used in Business Rule:**
- `performance.now()` - Performance timing measurements
- Lazy loading checks: `if (window.Chart)` before loading
- `debounce()` function: 300ms delay constant
- `setTimeout()` for deferred operations
- CSS animations with `will-change` properties
- Asset sizes: Chart.js (~120KB), CSS (~12KB), JS (~20KB)
- Critical rendering path optimization

**Data Tracked from User Interaction:**
- Page load time (First Contentful Paint)
- Time to Interactive (TTI)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Chart.js load time (lazy loaded)
- Search debounce effectiveness
- Performance by device/browser

---

### Story 5.2: Maintain Code Quality

**Data Used in Business Rule:**
- Linter rules and configurations
- JSDoc comment standards
- Code style guidelines
- Error handling patterns
- Console logging standards
- Git commit message format
- Code review checklist

**Data Tracked from User Interaction:**
- Error occurrences (console.error logs)
- Warning occurrences (console.warn logs)
- Performance warnings
- Deprecation warnings
- Browser compatibility issues
- Crash reports
- Bug reports from users

---

### Story 5.3: Ensure Browser Compatibility

**Data Used in Business Rule:**
- `navigator.userAgent` - Browser detection
- Feature detection: `typeof window.Chart !== 'undefined'`
- CSS vendor prefixes: `-webkit-`, `-moz-`
- `backdrop-filter` browser support
- LocalStorage availability check
- Fetch API support check
- ES6+ feature availability

**Data Tracked from User Interaction:**
- Browser distribution (Chrome, Firefox, Safari, Edge)
- Browser version distribution
- OS distribution
- Feature support by browser
- Browser-specific errors
- Fallback usage (degraded features)
- Compatibility issues reported
- Cross-browser behavior differences

---

## Summary

**Total Stories with Data Attributes:** 31  
**Data Fields Documented:** 50+  
**Tracking Events Identified:** 150+

This addendum provides complete data context for all user stories, enabling:
- **Data Engineering:** Understanding data requirements
- **Analytics:** Defining tracking requirements
- **Testing:** Validating data usage
- **Documentation:** Complete feature specification

---

**Last Updated:** October 3, 2025  
**Next Review:** When new features added

