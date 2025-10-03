# P&C Portfolio Dashboard - User Stories

**Version:** 3.0  
**Last Updated:** October 3, 2025  
**Product:** P&C Portfolio Dashboard  
**Features:** 3 Tabs (Portfolio Overview, Descriptive Analysis, Strategic View)

---

## 📋 Table of Contents

- [User Roles](#user-roles)
- [Tab 1: Portfolio Overview](#tab-1-portfolio-overview)
- [Tab 2: Descriptive Analysis](#tab-2-descriptive-analysis)
- [Tab 3: Strategic View](#tab-3-strategic-view)
- [Cross-Tab Features](#cross-tab-features)
- [Technical Stories](#technical-stories)

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

**Total Stories:** 31  
**Total Story Points:** 237

### By Priority:
- **Critical:** 4 stories (52 points)
- **High:** 15 stories (116 points)
- **Medium:** 11 stories (66 points)
- **Low:** 1 story (5 points)

### By Epic:
- **Solution Discovery & Exploration:** 8 stories (55 points)
- **Portfolio Analytics:** 7 stories (37 points)
- **Executive Dashboard:** 5 stories (55 points)
- **Navigation & Data Management:** 4 stories (31 points)
- **Performance & Quality:** 3 stories (29 points)

### By Tab:
- **Portfolio Overview:** 8 stories (55 points)
- **Descriptive Analysis:** 7 stories (37 points)
- **Strategic View:** 5 stories (55 points)
- **Cross-Tab:** 4 stories (31 points)
- **Technical:** 3 stories (29 points)

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

## 🔄 Future Enhancement Ideas (Not in Current Scope)

These are **potential** future user stories:

1. **Export Functionality**
   - "As an Executive, I want to export Strategic View to PDF, so that I can include it in presentations"

2. **Drill-Down from Strategic View**
   - "As a Portfolio Manager, I want to click Risk categories, so that I can see which specific products are high-risk"

3. **Custom Alerts**
   - "As a Product Owner, I want to receive alerts when my metrics fall below target, so that I can take corrective action"

4. **Historical Trends**
   - "As a P&C Analyst, I want to see Portfolio Health over time, so that I can track improvement/decline"

5. **Comparison Views**
   - "As a Portfolio Manager, I want to compare performance across P&C areas, so that I can identify best practices"

6. **Custom Dashboards**
   - "As an Executive, I want to configure which metrics appear in Strategic View, so that I can focus on what matters most"

---

**Document Maintained By:** Product Team  
**Review Cycle:** Quarterly  
**Next Review:** January 2026

