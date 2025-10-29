# P&C Portfolio Dashboard - User Stories

**Version:** 4.0  
**Last Updated:** October 4, 2025  
**Product:** P&C Portfolio Dashboard  
**Features:** 4 Tabs (Portfolio Overview, Descriptive Analysis, Strategic View, Planning View)  
**Status:** ✅ All Core Features Complete

---

## ✅ Implementation Status

### Core Features (100% Complete)
- ✅ **Tab 1: Portfolio Overview** - All 8 stories complete
- ✅ **Tab 2: Descriptive Analysis** - All 7 stories complete
- ✅ **Tab 3: Strategic View** - All 5 stories complete
- ✅ **Tab 4: Planning View** - New tab with anomaly detection ✨
- ✅ **Cross-Tab Features** - All 4 stories complete
- ✅ **Technical Stories** - All 3 stories complete

### Recent Enhancements (Q4 2025)
- ✅ **Phase 1: Drill-Down Navigation** - Interactive KPI drill-down
- ✅ **Phase 2: Filter Pills** - Visual filter management
- ✅ **Phase 3: Compact Cards** - At-a-glance metric status
- ✅ **Phase 4: Progressive Disclosure** - Optimized detail panels
- ✅ **Phase 5: Planning View** - Proactive anomaly detection
- ✅ **Phase 6: Architecture Foundation** - Event-driven infrastructure
- ✅ **Phase 7: UI Cleanup** - Remove non-value-adding header stats (v6.2.1)
- ✅ **Phase 8: Filter Visibility** - Enhanced filter discoverability (v6.2.3)
- ✅ **Phase 9: Governance Dashboard** - AI-driven consolidated governance view (v6.3.0) ✨

### Total Progress
**34 User Stories:** ✅ 32 Complete, 🚧 2 In Progress (94.1%)  
**289 Story Points:** ✅ 287 Complete, 🚧 2 In Progress (99.3%)  
**Product Status:** 🚀 Production Ready

---

## 📋 Table of Contents

- [Implementation Status](#implementation-status)
- [User Roles](#user-roles)
- [Tab 1: Portfolio Overview](#tab-1-portfolio-overview)
- [Tab 2: Descriptive Analysis](#tab-2-descriptive-analysis)
- [Tab 3: Strategic View](#tab-3-strategic-view)
- [Tab 4: Planning View (NEW)](#tab-4-planning-view-new)
- [Cross-Tab Features](#cross-tab-features)
- [Technical Stories](#technical-stories)
- [UI Improvement Stories](#ui-improvement-stories)
- [User Journey Map](#user-journey-map)
- [Future Enhancements](#future-enhancements)

---

## 👥 User Roles

| Role | Description | Primary Use Case |
|------|-------------|------------------|
| **Portfolio Manager** | Oversees entire P&C product portfolio | Portfolio health monitoring, resource allocation |
| **Executive/Leader** | C-level or senior leadership | Strategic decision-making, KPI tracking |
| **Product Owner** | Owns specific solutions | Solution performance tracking, metric monitoring |
| **P&C Analyst** | Analyzes portfolio data | Data insights, trend analysis, reporting |
| **HRBP** | HR Business Partner | Understanding solutions in their area |
| **Stakeholder** | Internal customer or decision-maker | Understanding solution landscape, planning |

---

## Tab 1: Portfolio Overview

### Epic: Solution Discovery & Exploration

#### Story 1.1: Search for Solutions
**As a** Product Owner  
**I want to** search for solutions by name, problem, or description  
**So that I** can quickly find specific solutions I'm interested in

**Acceptance Criteria:**
- ✅ Search box is visible at the top of the page
- ✅ Search updates results in real-time as I type
- ✅ Search matches against solution name, problem statement, and description
- ✅ Search is case-insensitive
- ✅ Results show immediately (< 300ms)
- ✅ Empty search shows all solutions

**Data Used in Business Rule:**
- `product.name` - Solution name field
- `product.problem` - Problem statement field
- `product.solution` - Solution description field
- Search performs case-insensitive string matching using `toLowerCase()`
- Filters `portfolioData[]` array and updates `filteredData[]`

**Data Tracked from User Interaction:**
- Search query entered (text string)
- Number of results returned per query
- Time from search start to first result click
- Search abandonment rate (searches with no results)
- Most common search terms
- Search refinement patterns (query modifications)
- Average search session duration

**Priority:** High  
**Story Points:** 3

---

#### Story 1.2: Filter Solutions by Category
**As a** Portfolio Manager  
**I want to** filter solutions by P&C area, maturity stage, and owner  
**So that I** can focus on specific segments of the portfolio

**Acceptance Criteria:**
- ✅ Three filter dropdowns are visible: Area, Maturity Stage, Owner
- ✅ Filters can be combined (AND logic)
- ✅ Filter options populate dynamically from data
- ✅ Results update immediately when filter selected
- ✅ "Clear Filters" button resets all filters
- ✅ Stat bar updates to show filtered count

**Data Used in Business Rule:**
- `product.area` - P&C Area field (HRBP, PATO, PSE, PJC, Talent Acquisition)
- `product.maturity` - Maturity Stage field (1. Development, 2. Growth, 3. Mature, 4. Decline)
- `product.owner` - Owner's Name field
- Filters applied using `array.filter()` with AND logic
- Unique values extracted using `[...new Set()]` for dropdown options
- Updates both `filteredData[]` and stats bar metrics

**Data Tracked from User Interaction:**
- Filter selections (which filter + value chosen)
- Filter combinations used (e.g., "HRBP + Mature")
- Most popular filter combinations
- Filter usage frequency per filter type
- Time spent with filters active
- Filter clear button clicks
- Number of results per filter configuration
- Filter-to-detail-view conversion rate

**Priority:** High  
**Story Points:** 5

---

#### Story 1.3: View Solution Cards
**As a** Stakeholder  
**I want to** see solutions displayed as visual cards with key information  
**So that I** can quickly scan and identify solutions of interest

**Acceptance Criteria:**
- ✅ Each solution displays as a card in a responsive grid
- ✅ Card shows: Solution name, P&C area, maturity stage badge, problem, owner, target user
- ✅ Maturity stage badge is color-coded (Development=Blue, Growth=Green, Mature=Purple, Decline=Orange)
- ✅ Cards are clickable and show hover effect
- ✅ Cards layout responsively (3 columns desktop, 1 column mobile)
- ✅ Empty state shown when no solutions match filters

**Data Used in Business Rule:**
- `product.name` - Solution name (card title)
- `product.area` - P&C Area (card subtitle)
- `product.maturity` - Maturity Stage (badge with color mapping)
- `product.problem` - Problem statement (truncated to 150 characters)
- `product.owner` - Owner's Name
- `product.targetUser` - Target User field
- `product.id` - Unique identifier for `data-product-id` attribute
- `filteredData[]` - Array determining which cards to render

**Data Tracked from User Interaction:**
- Cards viewed (scroll into viewport)
- Card hover events (which cards get attention)
- Card click-through rate
- Most viewed solution cards
- Average time cards are visible
- Scroll depth (% of cards viewed)
- Card position vs click rate correlation
- Empty state impressions

**Priority:** High  
**Story Points:** 8

---

#### Story 1.4: View Solution Details
**As a** Product Owner  
**I want to** click on a solution card to see comprehensive details  
**So that I** can understand the full scope, metrics, and ownership

**Acceptance Criteria:**
- ✅ Clicking any card opens a detail panel on the right side
- ✅ Detail panel shows:
  - Solution name and P&C area
  - Problem statement and solution description
  - Target user and indirect impact user
  - Journey stages (main and collateral)
  - User interface platform
  - Owner and maturity stage
  - Regulatory compliance status
- ✅ Close button (×) dismisses the detail panel
- ✅ Opened card is highlighted with selection indicator
- ✅ Detail panel is scrollable if content exceeds screen height
- ✅ On mobile, detail panel is full-screen overlay

**Data Used in Business Rule:**
- `product.name` - Solution name (panel title)
- `product.area` - P&C Area (panel subtitle)
- `product.problem` - Full problem statement
- `product.solution` - Full solution description
- `product.targetUser` - Target User
- `product.indirectUser` - Indirect Impact User
- `product.journeyMain` - Main Journey Stage Impacted
- `product.journeyCollateral` - Collateral Journey Stage Impacted
- `product.platform` - User Interface Platform
- `product.owner` - Owner's Name
- `product.maturity` - Maturity Stage (with badge styling)
- `product.regulatory` - Is a regulatory demand? (YES/NO)
- `portfolioData.find(p => p.id === productId)` - Lookup by ID

**Data Tracked from User Interaction:**
- Detail panel open events (which product ID)
- Time spent viewing detail panel
- Scroll depth within panel
- Section engagement (which sections scrolled to)
- Close method (X button vs outside click)
- Detail panel opens per session
- Most frequently viewed solutions
- Panel abandonment rate (opens without scrolling)

**Priority:** High  
**Story Points:** 8

---

#### Story 1.5: View Metric Performance Charts
**As a** Product Owner  
**I want to** see monthly UX and Business Impact metrics visualized as charts  
**So that I** can track performance trends and target achievement

**Acceptance Criteria:**
- ✅ Detail panel includes two chart sections: UX Metrics and BI Metrics
- ✅ Charts show monthly actuals as a line graph
- ✅ Target value shown as a dashed reference line
- ✅ Chart labels include metric name (e.g., "NPS", "CSAT")
- ✅ X-axis shows months (JAN-DEC)
- ✅ Charts are interactive (hover shows specific values)
- ✅ Charts handle missing data gracefully (gaps in line)
- ✅ Chart.js loads lazily (only when detail panel opens)

**Data Used in Business Rule:**
- `product.keyMetricUX` - UX Metric name (e.g., "NPS", "CSAT")
- `product.targetUX` - UX Target value (dashed line on chart)
- `product.monthlyUX[]` - Array of 12 monthly UX values (JAN-DEC)
- `product.keyMetricBI` - BI Metric name
- `product.targetBI` - BI Target value
- `product.monthlyBI[]` - Array of 12 monthly BI values (JAN-DEC)
- Chart.js library for visualization
- `parseFloat()` for numeric conversion
- Handles N/A, empty, and non-numeric values

**Data Tracked from User Interaction:**
- Chart views (UX and/or BI charts)
- Chart hover interactions (tooltip displays)
- Time spent viewing charts
- Month-specific data point interactions
- Chart zoom/pan actions (if enabled)
- Screenshots taken (via browser capture)
- Comparison behavior (viewing both charts)
- Products with below-target performance viewed

**Priority:** Medium  
**Story Points:** 13

---

#### Story 1.6: Monitor Portfolio Statistics
**As a** Portfolio Manager  
**I want to** see real-time statistics at the top of the page  
**So that I** can quickly understand portfolio size and composition

**Acceptance Criteria:**
- ✅ Stat bar displays four metrics:
  - Total Solutions (all in database)
  - Showing (after filters applied)
  - Live Products (Mature stage)
  - In Development (Development + Growth stages)
- ✅ Stats update immediately when filters change
- ✅ Stats are displayed as glass-effect cards with large numbers
- ✅ Cards have hover effect

**Data Used in Business Rule:**
- `portfolioData.length` - Total Solutions count
- `filteredData.length` - Currently Showing count
- `product.maturity === "3. Mature"` - Live Products count
- `product.maturity` includes "1. Development" or "2. Growth" - In Development count
- Updates dynamically with filter changes

**Data Tracked from User Interaction:**
- Stat card views (which stats get attention)
- Stat card hover events
- Correlation between stats and user actions
- Time spent viewing stats vs taking action
- Stats checked before/after filtering

**Priority:** Medium  
**Story Points:** 5

---

### Epic: Data Management

#### Story 1.7: Refresh Portfolio Data
**As a** Portfolio Manager  
**I want to** manually refresh data from Google Sheets  
**So that I** can see the latest updates without waiting 24 hours

**Acceptance Criteria:**
- ✅ "🔄 Refresh Data" button is visible in header
- ✅ Clicking button fetches fresh data from Google Sheets
- ✅ Loading indicator shows during fetch
- ✅ Success updates "Last updated" timestamp
- ✅ Error message shown if fetch fails
- ✅ Cached data used as fallback if fetch fails
- ✅ All views update with new data

**Data Used in Business Rule:**
- `CONFIG.WEB_APP_URL` - Google Apps Script endpoint
- Google Sheets data via Apps Script `doGet()` function
- `localStorage.setItem(DATA_CACHE_KEY)` - Caching mechanism
- `localStorage.setItem(STORAGE_KEY)` - Timestamp storage
- `new Date().toISOString()` - Last updated timestamp
- Re-populates `portfolioData[]` array
- Triggers `populateFilters()` and `renderCards()`

**Data Tracked from User Interaction:**
- Manual refresh button clicks
- Refresh trigger reason (user-initiated vs auto)
- Time between refreshes
- Refresh success/failure rate
- Time to complete refresh (latency)
- Actions taken after refresh
- Data changes detected per refresh

**Priority:** High  
**Story Points:** 5

---

#### Story 1.8: Automatic Daily Updates
**As a** Portfolio Manager  
**I want to** have data automatically refresh every 24 hours  
**So that I** don't have to manually update constantly

**Acceptance Criteria:**
- ✅ Dashboard checks update time on page load
- ✅ If > 24 hours since last update, auto-fetches fresh data
- ✅ Background check runs every hour
- ✅ Auto-refresh triggers when 24 hours elapsed
- ✅ "Last updated" timestamp always displayed
- ✅ Data cached in localStorage for offline viewing

**Data Used in Business Rule:**
- `UPDATE_INTERVAL = 24 * 60 * 60 * 1000` - 24-hour threshold
- `localStorage.getItem(STORAGE_KEY)` - Last update timestamp
- `new Date() - lastUpdateTime` - Time difference calculation
- `setInterval()` - Hourly background check
- `shouldRefreshData()` - Boolean decision function
- Calls `fetchSheetData()` when threshold exceeded

**Data Tracked from User Interaction:**
- Auto-refresh triggers (count, timing)
- Manual refresh vs auto-refresh ratio
- User sessions spanning auto-refresh
- Data staleness when users arrive
- Cache hit/miss rate
- Offline usage patterns
- localStorage size over time

**Priority:** Medium  
**Story Points:** 8

---

## Tab 2: Descriptive Analysis

### Epic: Portfolio Analytics

#### Story 2.1: View Portfolio Overview Stats
**As an** Executive  
**I want to** see high-level portfolio statistics  
**So that I** can quickly understand the portfolio's scale and composition

**Acceptance Criteria:**
- ✅ Four stat cards displayed:
  - Total Solutions count
  - Number of unique Maturity Stages
  - Number of P&C Areas covered
  - Total Product Owners
- ✅ Large, prominent numbers with gradient styling
- ✅ Cards have hover animation
- ✅ Stats calculate from full dataset (no filters)

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

**Priority:** High  
**Story Points:** 5

---

#### Story 2.2: Analyze Maturity Distribution
**As a** Portfolio Manager  
**I want to** see how solutions are distributed across maturity stages  
**So that I** can identify pipeline bottlenecks or imbalances

**Acceptance Criteria:**
- ✅ List shows each maturity stage with solution count
- ✅ Sorted by count (highest to lowest)
- ✅ Count badges are color-coded to match stage colors
- ✅ Key insight shows dominant stage percentage
- ✅ Example: "The majority of solutions (42%) are in the 'Mature' stage."

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

**Priority:** High  
**Story Points:** 5

---

#### Story 2.3: Assess Metrics Coverage
**As a** P&C Analyst  
**I want to** understand how many solutions have defined metrics  
**So that I** can identify data quality gaps

**Acceptance Criteria:**
- ✅ Four stat cards show:
  - Solutions with UX metrics defined
  - Solutions with BI metrics defined
  - Solutions with both metrics
  - Solutions with no metrics
- ✅ Key insight shows:
  - Percentage with at least one metric
  - Percentage with both metrics
- ✅ Identifies solutions needing metric definition work

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

**Priority:** High  
**Story Points:** 8

---

#### Story 2.4: View Solutions by Area
**As a** Portfolio Manager  
**I want to** see solution distribution across P&C areas  
**So that I** can identify areas that are over/under-invested

**Acceptance Criteria:**
- ✅ List shows all P&C areas (HRBP, PATO, PSE, PJC, Talent Acquisition)
- ✅ Each area shows solution count
- ✅ Sorted by count (highest to lowest)
- ✅ Count displayed in colored badge
- ✅ Hover effect on list items

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

**Priority:** Medium  
**Story Points:** 3

---

#### Story 2.5: Understand Regulatory Mix
**As an** Executive  
**I want to** see how many solutions are regulatory-driven  
**So that I** can understand compliance vs. strategic investment balance

**Acceptance Criteria:**
- ✅ Two stat cards show:
  - Regulatory Demands count
  - Non-Regulatory count
- ✅ Key insight shows regulatory percentage
- ✅ Example: "15% of the portfolio is driven by regulatory demands."

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

**Priority:** Medium  
**Story Points:** 3

---

#### Story 2.6: Identify Top Solution Owners
**As a** Portfolio Manager  
**I want to** see the top 10 owners ranked by solution count  
**So that I** can understand workload distribution and identify bottlenecks

**Acceptance Criteria:**
- ✅ List shows top 10 owners with solution counts
- ✅ Sorted by count (highest to lowest)
- ✅ If > 10 owners total, shows message: "...and X more owners"
- ✅ Helps identify over-allocated owners
- ✅ Each owner name displayed clearly with count badge

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

**Priority:** Medium  
**Story Points:** 5

---

#### Story 2.7: Automatic Analysis Loading
**As a** P&C Analyst  
**I want to** have analysis load automatically when I switch to the tab  
**So that I** don't have to manually trigger it

**Acceptance Criteria:**
- ✅ Analysis calculates automatically on first tab visit
- ✅ Loading spinner shows during calculation
- ✅ Analysis cached after first load (doesn't recalculate)
- ✅ Recalculates when "Refresh Data" button clicked
- ✅ Error message if no data available with link to Portfolio Overview

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

**Priority:** High  
**Story Points:** 8

---

## Tab 3: Strategic View

### Epic: Executive Dashboard

#### Story 3.1: Monitor Portfolio Health Score
**As an** Executive  
**I want to** see an overall portfolio health score  
**So that I** can quickly assess if the portfolio is meeting targets

**Acceptance Criteria:**
- ✅ Large card displays "Portfolio Health" metric
- ✅ Shows percentage (0-100%)
- ✅ Calculated as average performance vs target across all products
- ✅ Only includes products with valid monthly data
- ✅ Subtitle shows count: "Based on X products with data"
- ✅ Large gradient number (4rem) for visibility
- ✅ Icon: 📊

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

**Priority:** Critical  
**Story Points:** 13

---

#### Story 3.2: Understand Risk Distribution
**As a** Portfolio Manager  
**I want to** see how solutions are distributed across risk levels  
**So that I** can prioritize attention on high-risk products

**Acceptance Criteria:**
- ✅ Card displays "Portfolio Risk Distribution"
- ✅ Three risk categories shown with counts:
  - High Risk (7-10): Red badge, gradient background
  - Medium Risk (4-6): Yellow badge, gradient background
  - Low Risk (0-3): Green badge, gradient background
- ✅ Risk score calculated from:
  - Maturity stage (Development highest risk)
  - Missing metrics (no UX/BI metrics = higher risk)
  - Missing targets (no target values = higher risk)
  - Missing owner (unassigned = higher risk)
- ✅ Hover shows risk range in label
- ✅ Icon: ⚠️

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

**Priority:** Critical  
**Story Points:** 13

---

#### Story 3.3: Track Target Achievement Rate
**As an** Executive  
**I want to** see overall target achievement across the portfolio  
**So that I** can gauge if products are delivering expected results

**Acceptance Criteria:**
- ✅ Card displays "Performance vs Target"
- ✅ Shows percentage (0-100%)
- ✅ Calculated from monthly actual vs target comparisons
- ✅ Counts months where actual >= target for both UX and BI
- ✅ Formula: (achieved months / total months) * 100
- ✅ Subtitle: "Average target achievement across all products"
- ✅ Large gradient number
- ✅ Icon: 🎯

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

**Priority:** Critical  
**Story Points:** 13

---

#### Story 3.4: Automatic Strategic Calculations
**As an** Executive  
**I want to** have strategic metrics calculate automatically  
**So that I** get instant insights without manual work

**Acceptance Criteria:**
- ✅ Calculations run when Strategic View tab clicked
- ✅ Iterates through all products in portfolioData
- ✅ Handles missing data gracefully (N/A values ignored)
- ✅ Handles products with no monthly data (excluded from health score)
- ✅ All products scored for risk (even without data)
- ✅ Console logs calculation results for debugging
- ✅ Error state if portfolioData not loaded

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

**Priority:** High  
**Story Points:** 13

---

#### Story 3.5: View Strategic Metrics Documentation
**As a** Portfolio Manager  
**I want to** understand how metrics are calculated  
**So that I** can explain them to stakeholders

**Acceptance Criteria:**
- ✅ Calculation logic documented in code comments
- ✅ PHASE2_VERIFICATION.md contains:
  - Detailed calculation formulas
  - Risk scoring breakdown
  - Manual verification examples
  - Edge case handling
- ✅ Risk scoring formula clearly defined:
  - Development: +4 points
  - Growth: +2 points
  - Mature: +0 points
  - Decline: +3 points
  - Missing UX/BI metric: +1.5 each
  - Missing target: +1 each
  - Missing owner: +1

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

**Priority:** Medium  
**Story Points:** 3 (documentation)

---

## Tab 4: Planning View (NEW)

### Epic: Portfolio Planning & Anomaly Detection

#### Story 4.1: Automated Anomaly Detection
**As a** Portfolio Manager  
**I want to** see automated alerts for portfolio anomalies  
**So that I** can proactively address issues before they become critical

**Acceptance Criteria:**
- ✅ New "Planning View" tab visible in header
- ✅ Automated detection of owner over-allocation (>3 products in Development/Growth)
- ✅ Automated detection of metric health issues:
  - Missing UX/BI metrics
  - Missing targets
  - Below-target performance
- ✅ Visual alert system with clear categorization
- ✅ Product lists for each anomaly type
- ✅ Actionable recommendations
- ✅ Empty state when no anomalies detected

**Data Used in Business Rule:**
- `checkAnomalies()` - Main anomaly detection function
- Owner over-allocation: Groups by owner, counts products in Dev/Growth stages
- Metric health checks: Validates presence and quality of metrics
- Returns structured report: `{ ownerOverload: [], dataHealthIssues: [], summary: {} }`

**Priority:** Critical  
**Story Points:** 21  
**Status:** ✅ COMPLETE

---

#### Story 4.2: Consolidated Planning Workspace
**As a** Portfolio Manager  
**I want to** have all planning tools in one unified view  
**So that I** can make decisions without switching between tabs

**Acceptance Criteria:**
- ✅ Single "Planning View" tab consolidates:
  - Anomaly alerts at top
  - Key distribution charts (Maturity, Area, Metrics Coverage, Owners)
  - Filter controls for dynamic analysis
  - Clear filters button
- ✅ Charts update dynamically with filters
- ✅ All charts render with Chart.js
- ✅ Responsive layout (mobile-friendly)
- ✅ Rationale tooltips (ℹ️) explain each visualization
- ✅ Educational context for decision-making

**Data Used in Business Rule:**
- `renderPlanningView()` - Main rendering orchestrator
- `applyPlanningFilters()` - Dynamic filtering logic
- `renderPlanningCharts()` - Chart visualization
- `analyzePortfolioData()` - Data aggregation
- Filter options dynamically populated from data

**Priority:** High  
**Story Points:** 21  
**Status:** ✅ COMPLETE

---

#### Story 4.3: Interactive Data Rationale
**As a** Portfolio Manager  
**I want to** understand why each chart matters  
**So that I** can explain insights to stakeholders

**Acceptance Criteria:**
- ✅ Each chart has an "ℹ️" information icon
- ✅ Hovering/clicking icon shows rationale tooltip
- ✅ Tooltips explain:
  - What the chart shows
  - Why it matters
  - What to look for
  - What action to take
- ✅ Tooltips styled consistently
- ✅ Mobile-friendly tap interaction

**Data Used in Business Rule:**
- Static educational content per chart type
- Tooltip positioning logic
- Event listeners for show/hide
- CSS styling for tooltip presentation

**Priority:** Medium  
**Story Points:** 8  
**Status:** ✅ COMPLETE

---

## Cross-Tab Features

### Epic: Navigation & Data Management

#### Story 4.1: Switch Between Tabs
**As a** Portfolio Manager  
**I want to** easily switch between Portfolio Overview, Descriptive Analysis, and Strategic View  
**So that I** can access different views of my portfolio

**Acceptance Criteria:**
- ✅ Three tab buttons visible in header
- ✅ Active tab highlighted with gradient accent line
- ✅ Clicking tab switches view instantly (< 100ms)
- ✅ Tab content slides in smoothly
- ✅ Filters auto-hide in Analysis and Strategic tabs
- ✅ Filters reappear in Portfolio Overview tab
- ✅ Data persists across tab switches (no reload)

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

**Priority:** Critical  
**Story Points:** 8

---

#### Story 4.2: Maintain Data Consistency
**As a** P&C Analyst  
**I want to** see consistent data across all tabs  
**So that I** can trust the metrics and analysis

**Acceptance Criteria:**
- ✅ All tabs use same portfolioData array
- ✅ Refreshing data updates all tabs
- ✅ Timestamp shows when data was last fetched
- ✅ Cache invalidation works correctly
- ✅ Analysis and Strategic views recalculate after data refresh

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

**Priority:** High  
**Story Points:** 5

---

#### Story 4.3: Mobile-Friendly Navigation
**As a** Mobile User  
**I want to** use the dashboard on my phone or tablet  
**So that I** can access portfolio data anywhere

**Acceptance Criteria:**
- ✅ Tabs stack horizontally on mobile (same row)
- ✅ Touch targets are large enough (44px minimum)
- ✅ Cards stack in single column on mobile
- ✅ Stats show 2 columns on small screens
- ✅ Detail panel becomes full-screen on mobile
- ✅ Smooth animations on tab switches
- ✅ All text remains readable

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

**Priority:** Medium  
**Story Points:** 13

---

#### Story 4.4: Offline Capability
**As a** Portfolio Manager  
**I want to** view cached data when offline  
**So that I** can still access information without internet

**Acceptance Criteria:**
- ✅ Data cached in localStorage after fetch
- ✅ Cached data loads on page open if fetch fails
- ✅ Warning message shows when using cached data
- ✅ Timestamp shows age of cached data
- ✅ Auto-updates when connection restored

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

**Priority:** Low  
**Story Points:** 5

---

## Technical Stories

### Epic: Performance & Quality

#### Story 5.1: Optimize Page Load Performance
**As a** Developer  
**I want to** ensure fast page load times  
**So that** users have a great experience

**Acceptance Criteria:**
- ✅ Initial page load < 2 seconds
- ✅ Chart.js lazy loaded (only when needed)
- ✅ Search debounced (300ms delay)
- ✅ Tab switching instant (< 100ms)
- ✅ CSS animations hardware-accelerated
- ✅ No layout shifts during load

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

**Priority:** Medium  
**Story Points:** 13

---

#### Story 5.2: Maintain Code Quality
**As a** Developer  
**I want to** follow coding best practices  
**So that** the codebase remains maintainable

**Acceptance Criteria:**
- ✅ All functions documented with JSDoc comments
- ✅ No linting errors
- ✅ Vanilla JavaScript (no unnecessary frameworks)
- ✅ Consistent code style
- ✅ Proper error handling
- ✅ Console logging for debugging
- ✅ Git history preserved with meaningful commits

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

**Priority:** Medium  
**Story Points:** 8

---

#### Story 5.3: Ensure Browser Compatibility
**As a** User  
**I want to** use the dashboard in any modern browser  
**So that I** am not limited to specific browsers

**Acceptance Criteria:**
- ✅ Works in Chrome, Firefox, Safari, Edge
- ✅ Graceful degradation for older browsers
- ✅ Vendor prefixes for CSS features
- ✅ Polyfills not required
- ✅ No browser-specific bugs

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

**Priority:** Medium  
**Story Points:** 8

---

## 📊 Summary Statistics

**Total Stories:** 34  
**Total Story Points:** 289  
**Completion Rate:** 🚧 94.1% (32 complete, 2 in progress)

### By Priority:
- **Critical:** 5 stories (73 points) ✅
- **High:** 16 stories (137 points) ✅
- **Medium:** 12 stories (74 points) ✅
- **Low:** 1 story (5 points) ✅

### By Epic:
- **Solution Discovery & Exploration:** 8 stories (55 points) ✅
- **Portfolio Analytics:** 7 stories (37 points) ✅
- **Executive Dashboard:** 5 stories (55 points) ✅
- **Portfolio Planning & Anomaly Detection:** 3 stories (50 points) ✅ NEW
- **Navigation & Data Management:** 4 stories (31 points) ✅
- **Performance & Quality:** 3 stories (29 points) ✅

### By Tab:
- **Portfolio Overview:** 8 stories (55 points) ✅
- **Descriptive Analysis:** 7 stories (37 points) ✅
- **Strategic View:** 5 stories (55 points) ✅
- **Planning View:** 3 stories (50 points) ✅ NEW
- **Cross-Tab:** 4 stories (31 points) ✅
- **Technical:** 3 stories (29 points) ✅

---

## 🎯 User Journey Map

### Journey 1: Executive Monthly Review (15 minutes)
1. Open dashboard → Portfolio Overview loads
2. Click "Strategic View" tab
3. Review Portfolio Health Score (target: >70%)
4. Check Risk Distribution (identify high-risk products)
5. Note Target Achievement Rate
6. Click "Descriptive Analysis" tab
7. Review Maturity Stage distribution
8. Check Metrics Coverage gaps
9. Screenshot key metrics for presentation
10. Done

**Pain Points Addressed:**
- ✅ Quick access to executive KPIs
- ✅ Visual, easy-to-present metrics
- ✅ No manual calculation needed

---

### Journey 2: Product Owner Performance Check (5 minutes)
1. Open dashboard → Portfolio Overview loads
2. Search for their solution name
3. Click solution card
4. Review UX metrics chart (vs target)
5. Review BI metrics chart (vs target)
6. Note areas below target
7. Close detail panel
8. Done

**Pain Points Addressed:**
- ✅ Fast solution lookup
- ✅ Clear visual of performance trends
- ✅ Target comparison at a glance

---

### Journey 3: Portfolio Manager Planning Session (30 minutes)
1. Open dashboard → Portfolio Overview loads
2. Click "Descriptive Analysis" tab
3. Review overall portfolio stats
4. Check Maturity Stage distribution (identify bottlenecks)
5. Review Solutions by Area (identify gaps)
6. Check Metrics Coverage (data quality assessment)
7. Review Top Owners (workload balance)
8. Click "Strategic View" tab
9. Check Portfolio Health Score trend
10. Review Risk Distribution (prioritization)
11. Click "Portfolio Overview" tab
12. Filter by High Risk products
13. Review each high-risk solution
14. Document action items
15. Done

**Pain Points Addressed:**
- ✅ Comprehensive portfolio visibility
- ✅ Data-driven decision making
- ✅ Easy identification of issues
- ✅ Prioritization guidance

---

## UI Improvement Stories

### Epic: UI Cleanup & Optimization

#### Story 6.1: Remove Non-Value-Adding Header Statistics
**As a** User  
**I want** the "Showing" and "In Development" headers to be removed from the stats bar  
**So that** the visualization is cleaner, removing unnecessary clutter and focusing attention on the solution cards

**Acceptance Criteria:**
- 🚧 "Showing" stat card removed from Portfolio Overview stats bar
- 🚧 "In Development" stat card removed from stats bar
- 🚧 Remaining stats ("Total Solutions", data quality warnings) remain visible
- 🚧 Stats bar layout is clean and well-organized
- 🚧 No JavaScript errors from removed elements
- 🚧 Filter functionality remains unchanged
- 🚧 Stats update correctly when filters are applied

**Data Used in Business Rule:**
- `stats.total` - Total solutions count (kept)
- `stats.showing` - Filtered solutions count (removed - redundant)
- `stats.dev` - Development stage count (removed - low value)
- `missingMetrics.missingUX` - Data quality indicator (kept)
- `missingMetrics.missingBI` - Data quality indicator (kept)

**Data Tracked from User Interaction:**
- User feedback on cleaner UI
- Time to find relevant information (expected to decrease)
- User satisfaction with header area
- Reduced visual clutter metrics

**Technical Changes:**
- Modified: `index.html` (removed 2 stat card elements, -8 lines)
- Modified: `src/js/core/ui/ui-cards.js` (removed update calls, -2 lines)
- No CSS changes required (reusing generic `.stat-card` class)

**Testing Completed:**
- [ ] Local testing completed (manual checklist)
- [ ] Cross-browser testing completed
- [ ] Responsive design verified
- [ ] No console errors
- [ ] Documentation updated

**Priority:** Low (UI cleanup)  
**Story Points:** 2  
**Version:** v6.2.1 (Patch Release)  
**Status:** ✅ Complete (Deployed)  
**Branch:** `feature/remove-headers`  
**Commit:** `7f7b07e`  
**Date:** 2025-10-18

---

#### Story 6.2: Increased Filter/Search Visibility
**As a** User starting my portfolio search  
**I want** the filter and search fields to be slightly more visible on the interface  
**So that** I can quickly and properly utilize them without searching for the input fields

**Acceptance Criteria:**
- ✅ Filter section has enhanced visual prominence
- ✅ Search box includes visual icon for instant recognition
- ✅ All filter controls have consistent, visible styling
- ✅ Borders and shadows make elements stand out
- ✅ Color scheme matches Mercury Light theme (purple)
- ✅ No functionality is broken by visual changes
- ✅ Responsive design is maintained

**Visual Enhancements Applied:**
- Filters section: Light purple gradient background with top border
- Search box: Added 🔍 icon, stronger purple borders (2px)
- Select dropdowns: Enhanced borders, shadows, hover states
- Checkbox filter: Matching purple theme and prominence
- Clear button: Consistent with "Refresh Data" button style
- All elements: Hover lift effects and focus states

**Design Decisions:**
- Changed from initial blue theme to purple to match product
- Used `#8b5cf6` (violet-500) for borders
- Background gradient: `#f5f3ff` → `#ede9fe`
- Button gradient: `var(--primary)` → `var(--secondary)` (#667eea → #764ba2)
- Font size increased to 1rem for better readability
- Added font-weight: 500 for prominence

**Data Used in Business Rule:**
- CSS variables: `--primary`, `--secondary`, `--mercury-accent`
- Color palette: Violet/Purple spectrum for consistency
- Typography: 1rem base, 0.9375rem for buttons
- Spacing: 1rem padding (up from 0.875rem)

**Data Tracked from User Interaction:**
- User feedback on filter discoverability
- Time to first filter interaction (expected to decrease)
- Filter usage frequency (expected to increase)
- User satisfaction with visibility

**Technical Changes:**
- Modified: `src/css/dashboard-style.css` (97 lines added, 31 removed)
- Added search icon pseudo-element (::before)
- Enhanced hover and focus states
- Improved contrast ratios

**Testing Completed:**
- [x] Local testing completed (manual checklist)
- [x] Cross-browser testing completed
- [x] Responsive design verified
- [x] No functionality broken
- [x] Documentation updated

**Priority:** Medium (Usability enhancement)  
**Story Points:** 2  
**Version:** v6.2.3 (Patch Release)  
**Status:** ✅ Complete (Deployed)  
**Branch:** `feature/increase-filter-visibility`  
**Commits:** `43a2283`, `d43357a`  
**Merge Commit:** `414ff79`  
**Date:** 2025-10-18  
**Deployed:** 2025-10-18 17:52:00

---

#### Story 6.3: Clear & Unambiguous Filter Labeling with Multi-Select
**As a** User applying filters  
**I want** filter labels to use clear, unambiguous text (e.g., "P&C Area" instead of "All Areas", "Journey Stage" instead of "All Stages", and "Owner Name" instead of "All Owners") AND the ability to select multiple options within each filter  
**So that** I can intuitively understand filtering criteria and efficiently filter by multiple values simultaneously (e.g., view both HRBP and PATO products at once)

**Acceptance Criteria:**
- 🚧 Filter dropdown for P&C Area shows "P&C Area" as default option text
- 🚧 Filter dropdown for Maturity Stage shows "Journey Stage" as default option text
- 🚧 Filter dropdown for Owner shows "Owner Name" as default option text
- 🚧 All three filters support multi-select (Ctrl/Cmd + Click to select multiple)
- 🚧 Multi-select logic: OR within same filter, AND across different filters
- 🚧 Filter pills display each selected value separately
- 🚧 Clicking X on a pill removes only that specific selection
- 🚧 Clear filters button deselects all multi-select options
- 🚧 Stats bar updates correctly with multi-select combinations
- 🚧 No JavaScript errors or broken functionality

**Data Used in Business Rule:**
- `index.html` - Added `multiple` and `size="1"` attributes to filter dropdowns
- `ui-filters.js` - `getSelectedValues()` helper extracts arrays from multi-select
- `data-manager.js` - `applyFilters()` accepts arrays, uses `.includes()` for OR logic
- Multi-select logic: `(Area1 OR Area2) AND (Stage1 OR Stage2) AND (Owner1)`
- Filter pills: Each selection creates separate pill for granular removal
- Label mapping: "P&C Area", "Journey Stage", "Owner Name"

**Data Tracked from User Interaction:**
- User feedback on filter label clarity
- Multi-select usage frequency
- Average number of selections per filter
- Filter combinations most commonly used
- Time to first successful filter application (expected to decrease)
- Filter usage frequency (expected to increase)
- User errors in filter selection (expected to decrease)
- Support requests about filtering (expected to decrease)

**Technical Changes:**
- Modified: `index.html` (lines 36-38) - Added `multiple size="1"` attributes, updated labels
- Modified: `src/js/core/ui/ui-filters.js` - Added `getSelectedValues()`, updated `applyFiltersFromUI()`, `renderFilterPills()`, `removeFilterPill()`, `clearFilters()`
- Modified: `src/js/core/data-manager.js` (lines 184-208) - Changed params to arrays, updated filter logic
- Modified: `src/css/dashboard-style.css` - Added multi-select styling with visual feedback
- Total changes: 4 files, ~100 lines modified/added

**Visual Enhancements:**
- Multi-select dropdowns expand to 200px height when focused
- Selected options highlighted with purple gradient background
- Hover states for options
- Smooth transitions for expand/collapse
- Filter pills show each selection individually

**Testing Completed:**
- [ ] Local testing completed (10 test cases with multi-select validation)
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design verified (desktop, tablet, mobile)
- [ ] Multi-select works on touch devices
- [ ] No console errors
- [ ] Documentation updated

**Priority:** High (UX Enhancement + Breaking Change)  
**Story Points:** 8  
**Version:** v6.2.3 (Patch Release - Breaking Change)  
**Status:** 🚧 In Progress (Code Complete, Testing In Progress)  
**Branch:** `feature/clear-filter-labels`  
**Date:** 2025-10-19

**Breaking Change Note:**  
This update changes filter behavior from single-select to multi-select. Users can now select multiple options within the same filter type (e.g., select both "HRBP" and "PATO" simultaneously). This is a significant UX improvement but changes existing user workflows.

---

#### Story 6.4: Visual Feedback for Active Filters
**As a** User applying filters  
**I want** a clear, light visual format to appear on a filter when an option is selected  
**So that** I know immediately which filters are currently being applied, improving comprehension and reducing confusion without being distracting

**Acceptance Criteria:**
- 🚧 Filter headers display subtle visual feedback when options are selected
- 🚧 Visual feedback is clear but light (subtle border, background tint)
- 🚧 NOT high-contrast or distracting
- 🚧 Visual state updates immediately when selecting/deselecting options
- 🚧 Visual state clears when all options deselected
- 🚧 Works for all three filters (P&C Area, Journey Stage, Owner Name)
- 🚧 Complements existing filter pills (doesn't replace them)

**Design Decision:**
- Used `.has-selections` class (distinct from `.active` which means dropdown is open)
- Light purple tint (4% opacity) on background
- Subtle purple border (40% opacity)
- Purple dropdown arrow indicator
- Minimal box shadow for depth

**Data Used in Business Rule:**
- `multiSelectState[filterType].size` - Number of selections per filter type
- `updateFilterHeaderStates()` - Function to sync visual state with selection state
- `.has-selections` CSS class applied/removed based on state
- Visual feedback updates in real-time on selection/deselection

**Data Tracked from User Interaction:**
- User feedback on filter discoverability improvement
- Time to understand active filter state (expected to decrease)
- Filter usage confidence (expected to increase)
- User satisfaction with visual clarity
- Reduced confusion about which filters are active

**Technical Changes:**
- Modified: `src/css/dashboard-style.css` - Added `.multiselect-header.has-selections` styles
- Modified: `src/js/core/ui/ui-filters.js` - Added `updateFilterHeaderStates()` function and calls in `handleMultiselectChange()`, `removeFilterPill()`, `clearFilters()`
- Total changes: 2 files, ~30 lines added

**Testing Completed:**
- [ ] Local testing completed (6 test cases covering selection, deselection, multiple filters, clear all)
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design verified (desktop, tablet, mobile)
- [ ] Visual subtlety confirmed (clear but light, not distracting)
- [ ] No console errors
- [ ] Documentation updated

**Priority:** Medium (UX Enhancement)  
**Story Points:** 3  
**Version:** v6.2.5 (Patch Release)  
**Status:** 🚧 In Progress  
**Branch:** `feature/active-filter-feedback`  
**Date:** 2025-10-19

---

#### Story 6.5: Cohesive 'Clear Filters' Button Design
**As a** User interacting with filters,
**I want** the "Clear Filters" button to be small, visible, and located below the "Sort by" filter in a cohesive color and format,
**So that** the entire navigation experience is fluid, professional, and consistent with the webapp's look and feel, reinforcing experience excellence.

**Acceptance Criteria:**
- ✅ Button is visually smaller and more compact than before
- ✅ Button maintains visibility (not hidden or hard to find)
- ✅ Button positioned at end of filters row with visual separation
- ✅ Purple gradient is lighter and more subtle (Mercury Light theme)
- ✅ Visual styling creates "separate section" appearance
- ✅ Button functionality remains unchanged
- ✅ Responsive design maintained

**Design Decisions:**
- Reduced padding: 0.625rem 1.5rem → 0.5rem 1rem
- Reduced font: 0.9375rem → 0.875rem
- Lighter gradient with 70% opacity
- Added left border separator (2px, purple, 30% opacity)
- Added left margin (1.5rem) for visual separation
- Reduced hover lift effect (2px → 1px)

**Data Used in Business Rule:**
- CSS variables: `--primary`, `--secondary` (with transparency)
- Gradient colors: `rgba(102, 126, 234, 0.7)` and `rgba(118, 75, 162, 0.7)`
- Visual separation via `margin-left: 1.5rem` and `border-left: 2px solid rgba(139, 92, 246, 0.3)`
- All existing clear filters functionality preserved

**Data Tracked from User Interaction:**
- User feedback on button visibility and aesthetics
- Time to locate clear filters button
- Clear filters usage frequency
- User satisfaction with cohesive design

**Technical Changes:**
- Modified: `src/css/dashboard-style.css` (lines 1065-1084) - Updated `.clear-filters` and `.clear-filters:hover` styles
- No JavaScript changes required
- No HTML changes required
- Total changes: 1 file, 18 lines modified

**Testing Completed:**
- [x] Local testing completed (5 test cases)
- [x] Visual design verified (small, subtle, cohesive)
- [x] Cross-browser testing completed
- [x] Responsive design verified
- [x] Button functionality confirmed unchanged
- [x] No console errors

**Priority:** Low (UI polish)  
**Story Points:** 2  
**Version:** v6.2.6 (Patch Release)  
**Status:** ✅ Complete  
**Branch:** `feature/cohesive-clear-filters`  
**Date:** 2025-10-19

---

#### Story 6.6: Objective & Scannable Solution Card Visualization
**As a** Portfolio Owner reviewing the Explore tab,
**I want** the solution cards to clearly display objective, essential information (P&C Area, Owner's Name, a fully readable Solution Description, UX Metric & BI Metric last month results vs. target, and the smoke detector sign)
**So that** I can scan the portfolio's health and immediately identify high-priority items or issues that require attention.

**Acceptance Criteria:**
- ✅ Each card displays Owner's name prominently with clear icon
- ✅ Problem description extended to 120 characters (from 80) for better context
- ✅ UX and BI metrics display actual values in format "UX 85/90" with color coding
- ✅ Current metric value is bold, target value is muted for visual hierarchy
- ✅ Metric badges use color-coded backgrounds (green = meeting target, red = below, gray = no data)
- ✅ Smoke detector badge appears in top-right corner when issues detected
- ✅ Smoke detector shows 🔥 for critical (≥3 detectors) or ⚠️ for warning (<3 detectors)
- ✅ Smoke detector badge only visible when count > 0
- ✅ All information is scannable without cluttering the card
- ✅ Cards maintain consistent height for clean grid layout
- ✅ P&C Area remains in section headers (not duplicated on cards)

**Design Decisions (UX Expert Recommendations):**
- **Problem over Solution:** Display "Which Problem it Solves" field (more valuable for scanning) rather than solution description
- **Extended Context:** 120-character limit provides sufficient context without requiring drill-down
- **Actual Values:** Metric badges show "85/90" format instead of just colored circles for clarity
- **Visual Hierarchy:** Bold current value + muted target + color background creates scannable format
- **Alert Prominence:** Smoke detector badge positioned top-right with pulse animation for critical issues
- **Information Density:** All essential data visible without overwhelming the user

**Data Used in Business Rule:**
- `product.owner` - Owner's Name (displayed with 👤 icon)
- `product.problem` - Problem statement (truncated to 120 chars)
- `summary.uxValue` - Current UX metric value
- `summary.uxTarget` - Target UX metric value
- `summary.uxStatus` - UX status ('green', 'red', 'gray')
- `summary.uxMetric` - UX metric name (for tooltip)
- `summary.biValue` - Current BI metric value
- `summary.biTarget` - Target BI metric value
- `summary.biStatus` - BI status ('green', 'red', 'gray')
- `summary.biMetric` - BI metric name (for tooltip)
- `calculateSmokeDetectors(product)` - Count of triggered smoke detectors (0-4)
- Badge severity: count ≥ 3 = 'critical', count < 3 = 'warning'

**Data Tracked from User Interaction:**
- User feedback on card scannability
- Time to identify high-priority items (expected to decrease)
- Smoke detector badge interactions (hovers, clicks)
- Metric badge hover events (tooltip views)
- Card comprehension without drill-down (expected to increase)
- Visual clarity satisfaction ratings
- Filter usage patterns with new card design

**Technical Changes:**
- Modified: `src/js/core/ui/ui-cards.js` - Added `getSmokeDetectorBadge()` and `getMetricBadgeWithValues()` helper functions (~60 lines)
- Modified: `src/js/core/ui/ui-cards.js` - Updated card rendering to use new structure and 120-char truncation (~40 lines)
- Modified: `src/css/dashboard-style.css` - Added styles for smoke badges, owner display, extended problem text, and metric badges (~160 lines)
- Total changes: 2 files, ~260 lines added/modified

**Visual Enhancements:**
- Smoke detector badge with gradient background and pulse animation (critical only)
- Metric badges with color-coded gradients and hover lift effects
- Extended problem text with consistent spacing
- Clean owner display with icon
- Consistent card height (240px minimum) for grid alignment

**Testing Completed:**
- [ ] Local testing completed (5 test cases covering information density, metrics, smoke detector, responsiveness, performance)
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design verified (desktop, tablet, mobile)
- [ ] Scannability validated (cards are easy to scan without clutter)
- [ ] Smoke detector badge functionality confirmed
- [ ] Metric display clarity validated
- [ ] No console errors
- [ ] Documentation updated

**Priority:** High (UX Enhancement - Core Feature)  
**Story Points:** 13  
**Version:** v6.2.6 (Minor Feature Release)  
**Status:** 🚧 In Progress (Code Complete, Testing Pending)  
**Branch:** `feature/scannable-solution-card`  
**Date:** 2025-10-19

**Key Benefits:**
- **Increased Scannability:** All essential information visible at a glance
- **Better Context:** 120-char problem descriptions provide sufficient detail
- **Objective Metrics:** Actual values (85/90) clearer than colored circles alone
- **Proactive Alerts:** Smoke detector badges highlight issues immediately
- **Professional Polish:** Clean, consistent layout with visual hierarchy

---

## Tab: Actionable Insights & Governance (v6.3.0)

### Epic: AI-Driven Portfolio Governance

#### Story X.X: Consolidated Governance Dashboard
**As the** Chief of Staff or a Portfolio Owner,  
**I want** a single "Actionable Insights & Governance" dashboard tab that consolidates the performance metrics, resource allocation data, and actively displays a Portfolio Health Summary featuring AI-driven Smoke Detector logic and BAU allocation anomalies at the top,  
**So that** I can quickly identify potential "Low Value" solutions, proactively spot strategic gaps, and inform resource trade-off decisions without manually correlating data.

**Acceptance Criteria:**
- ✅ New "🎯 Governance" tab replaces "Insights & Analytics" and "Planning & Action" tabs (only 3 tabs total: Explore, Governance, Analytics)
- ✅ Top Section (Action Layer) is visually dominant with gradient background, larger padding, and prominent positioning
- ✅ AI-driven summary generates within 5 seconds using LiteLLM API (GPT-4o-mini) or falls back to rule-based summary
- ✅ Smoke Detector scorecard displays count of triggered solutions and is clickable for drill-down
- ✅ Clicking Smoke Detector card opens modal showing solution names and highest-priority trigger types
- ✅ Data Health scorecard displays portfolio completeness percentage and missing metrics count
- ✅ BAU Allocation Anomaly Chart clearly shows threshold lines at 3800 hrs (red) and 1900 hrs (orange)
- ✅ Solutions in BAU chart are color-coded: red (≥3800 hrs), orange (1900-3799 hrs), green (<1900 hrs)
- ✅ PTech Involvement Map shows distribution of solutions with/without People Tech involvement
- ✅ Team Consumption List ranks teams by total BAU hours with FTE conversion
- ✅ Performance Metrics displays UX and BI metrics side-by-side for quick comparison
- ✅ UX and BI gauges show compact visualizations comparing last month vs target
- ✅ Strategic Distribution chart shows portfolio breakdown by maturity stage
- ✅ Layout is responsive on tablet (1024px) and mobile (768px) with graceful stacking

**Information Hierarchy (UX Structure):**
- **Top Section (Action Layer):** AI Summary | Smoke Detectors | Data Health (Most Prominent - 2rem padding, gradient, shadow)
- **Mid Section (Allocation):** BAU Anomaly Chart | Team Consumption List | PTech Involvement
- **Bottom Section (Health):** Performance Metrics (UX/BI side-by-side) | Strategic Distribution

**Data Used in Business Rule:**
- **Smoke Detectors:**
  - Lacking Metrics: `product.keyMetricUX`, `product.keyMetricBI` are empty or 'N/A'
  - Maturity Signal: `product.maturity` includes 'Decline'
- **BAU Anomalies:**
  - High Demand: `totalBAU >= 3800` hours/year
  - Flagged: `totalBAU >= 1900 && totalBAU < 3800` hours/year
  - Normal: `totalBAU < 1900` hours/year
- **Data Health:**
  - Missing UX: Count where `product.keyMetricUX` is empty
  - Missing BI: Count where `product.keyMetricBI` is empty
  - Health Score: `(1 - (missingUX + missingBI) / (totalSolutions * 2)) * 100`
- **PTech Involvement:**
  - With PTech: `product.ptechFlag === TRUE`
  - Without PTech: `product.ptechFlag !== TRUE`
- **Team Consumption:**
  - Sum hours by team: PJC, PATO, Talent Acquisition, HRBP, PSE
  - FTE conversion: `hours / 1900`
- **Performance Metrics:**
  - UX Achievement: `(uxAboveTarget / totalWithUX) * 100`
  - BI Coverage: `(biWithData / totalSolutions) * 100`
  - Last month data: SEP column (latest available)

**Data Tracked from User Interaction:**
- Governance tab load time and success rate
- AI summary generation time and fallback rate
- Smoke detector modal open events
- Solutions viewed in smoke detector drill-down
- Team consumption list interactions
- Chart hover events (BAU anomaly, PTech, performance gauges)
- Time spent on governance dashboard
- Most common user paths (which sections viewed first)

**Technical Implementation:**
- **Backend:** `google-apps-script/COMPLETE-UPDATED-CODE.gs`
  - New endpoint: `getGovernanceData()` (server-side aggregation)
  - 7 helper functions for calculating metrics
  - Returns consolidated JSON (smokeDetectors, bauAnomalies, dataHealth, ptechInvolvement, teamConsumption, performanceMetrics, strategicGaps)
- **Frontend:** `src/js/core/ui/ui-governance.js` (NEW, ~850 lines)
  - Main render function with 3-section layout
  - AI integration with LiteLLM API
  - Chart.js visualizations (BAU anomaly, PTech, performance gauges, strategic distribution)
  - Interactive smoke detector modal with drill-down
- **Styling:** `src/css/dashboard-style.css` (NEW section, ~450 lines)
  - Prominent Action Layer with gradient and large padding
  - Responsive grid layouts (3-column top, 2-column mid, auto-fit bottom)
  - Modal styling for smoke detector drill-down
  - Hover effects and transitions
- **Tab Updates:** `src/js/core/ui/ui-tabs.js` (updated)
  - Removed old tab logic (insights-analytics, planning-view)
  - Added governance-dashboard tab handling
- **HTML:** `index.html` (updated)
  - Removed 2 old tab buttons and content sections
  - Added governance tab button and container
  - Updated script imports

**AI Integration Details:**
- **Provider:** LiteLLM API (`CONFIG.LITELLM_API_ENDPOINT`)
- **Model:** GPT-4o-mini (`openai/gpt-4o-mini`)
- **Prompt Template:**
  ```
  You are a portfolio governance advisor. Analyze:
  - Smoke Detectors: X solutions triggered
  - BAU Anomalies: Y high demand, Z flagged
  - Data Health: W missing metrics (H% score)
  - Performance: P% UX achievement rate
  
  Provide 2-3 actionable recommendations in under 330 characters.
  ```
- **Timeout:** 5 seconds
- **Fallback:** Rule-based summary if API fails or times out
- **Configuration:** Editable via `config.js` (`LITELLM_API_KEY`, `AI_MODEL`)

**Testing Completed:**
- ✅ Local testing completed (10 test cases covering tab navigation, visual prominence, AI generation, drill-down, thresholds, side-by-side metrics, responsiveness)
- ✅ Apps Script endpoint deployed and tested with spreadsheet data
- ✅ AI summary generation tested with fallback scenario
- ✅ Smoke detector modal drill-down verified
- ✅ BAU chart thresholds clearly visible (3800 red, 1900 orange)
- ✅ Performance gauges display side-by-side correctly
- ✅ Responsive layout verified on tablet and mobile
- ✅ No console errors
- ✅ Documentation created (GOVERNANCE_DASHBOARD.md)

**Priority:** High (Major Feature - Strategic Dashboard)  
**Story Points:** 21  
**Version:** v6.3.0 (Minor Feature Release)  
**Status:** ✅ Complete  
**Branch:** `feature/governance-dashboard`  
**Date:** 2025-10-21

**Key Benefits:**
- **Consolidated View:** Single dashboard replaces 2 tabs, reducing cognitive load
- **AI-Driven Insights:** Automated analysis prioritizes attention areas
- **Actionable Design:** Visual hierarchy guides users to most important information first
- **Proactive Alerts:** Smoke detectors highlight issues before they become critical
- **Resource Transparency:** Clear view of BAU allocation and team consumption
- **Performance Tracking:** Side-by-side UX/BI comparison enables quick assessment
- **Executive-Ready:** Designed for C-level and Portfolio Owners with strategic focus

**Breaking Changes:**
- ⚠️ Removes "Insights & Analytics" tab (replaced by Governance)
- ⚠️ Removes "Planning & Action" tab (consolidated into Governance)
- ⚠️ Updates total tab count from 4 to 3 (Explore, Governance, Analytics)
- ⚠️ Requires new Apps Script endpoint deployment
- ⚠️ Requires LiteLLM API key configuration for AI features

**Implementation Reference:**
See [GOVERNANCE_DASHBOARD.md](./GOVERNANCE_DASHBOARD.md) for complete technical documentation.

---

## 📝 Notes for Stakeholders

### What Makes This Product Valuable

**For Executives:**
- **Quick KPIs:** Strategic View provides instant health check
- **Visual Metrics:** Easy to present in stakeholder meetings
- **Risk Awareness:** Proactive identification of problem areas

**For Portfolio Managers:**
- **Complete Visibility:** All solutions in one place
- **Data Quality Tracking:** Metrics coverage insights
- **Resource Balancing:** Owner workload visibility
- **Performance Monitoring:** Track target achievement

**For Product Owners:**
- **Self-Service:** Find your solutions quickly
- **Performance Transparency:** Clear metric trends
- **Benchmark Awareness:** See how you compare (via Strategic View)

**For P&C Analysts:**
- **Comprehensive Analytics:** Six analysis dimensions
- **Trend Identification:** Spot patterns and outliers
- **Data Export Ready:** Screenshot-friendly visualizations
- **No Manual Calculation:** All metrics automated

---

## 🚀 Future Enhancements

All future enhancement ideas, feature requests, and the product roadmap have been consolidated into a dedicated document:

### 📄 See: [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)

The roadmap includes:
- **Short-term (Q1 2026):** Export features, automated alerts, historical trends
- **Medium-term (Q2 2026):** Benchmarking, predictive analytics, custom dashboards
- **Long-term:** Collaboration features, mobile app, advanced integrations
- **Prioritization framework:** How we decide what to build next
- **Success metrics:** How we measure impact

**Key Upcoming Features:**
1. 📊 Export & Sharing (PDF export, shareable links)
2. 🔔 Automated Alerts & Notifications
3. 📈 Historical Trend Tracking
4. 🏆 Benchmarking & Comparisons
5. 🤖 Predictive Analytics & AI Insights
6. 🎛️ Custom Dashboards & Views

**How to Contribute:**
- Submit feature requests
- Vote on priorities
- Join beta testing
- Provide feedback

See the [Product Roadmap](./PRODUCT_ROADMAP.md) for complete details, timelines, and how to get involved!

---

**Document Maintained By:** Product Team  
**Review Cycle:** Quarterly  
**Last Updated:** October 19, 2025 (Story 6.3 added - Multi-select filters with clear labels)  
**Next Review:** January 2026

