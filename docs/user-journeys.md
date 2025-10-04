# P&C Portfolio Dashboard - User Journeys

**Version:** 4.0  
**Last Updated:** October 4, 2025  
**Status:** Production Ready

---

## 📖 Overview

This document outlines the key user journeys for the P&C Portfolio Dashboard. Each journey represents a real-world use case with specific goals, steps, and pain points that the dashboard addresses.

---

## 👥 Target User Roles

| Role | Primary Use Case | Key Features Used |
|------|------------------|-------------------|
| **Executive/Leader** | Strategic oversight and decision-making | Strategic View, Planning View |
| **Portfolio Manager** | Portfolio health monitoring and planning | All views, especially Planning View |
| **Product Owner** | Individual solution performance tracking | Portfolio Overview, Detail Panel |

---

## 🎯 Journey 1: Executive Monthly Review

### User Profile
**Role:** C-Level Executive or Senior Leader  
**Frequency:** Monthly  
**Time Required:** 10-15 minutes  
**Primary Goal:** Get a quick, comprehensive view of portfolio health for leadership reporting

### The Journey

#### Pre-Dashboard Pain Points ❌
- Had to request custom reports from analysts
- Data was outdated by the time reports were ready
- No visual representation of portfolio health
- Manual calculations prone to errors
- Difficult to identify risk areas quickly
- No drill-down capability for details

#### Current Journey with Dashboard ✅

**Step 1: Access Strategic View (1 minute)**
- Opens dashboard
- Clicks "Strategic View" tab
- Immediately sees three key metrics:
  - Portfolio Health Score (e.g., 73%)
  - Risk Distribution (High/Medium/Low counts)
  - Performance vs Target (e.g., 73%)

**Step 2: Identify Action Areas (2 minutes)**
- Clicks on "High Risk" KPI card
- Automatically navigates to Portfolio Overview
- Filters automatically applied to show high-risk products
- Reviews filtered product list
- Identifies specific solutions needing attention

**Step 3: Review Portfolio Distribution (3 minutes)**
- Switches to "Descriptive Analysis" tab
- Reviews maturity stage distribution
- Checks solutions by P&C area
- Assesses metrics coverage
- Identifies resource allocation issues

**Step 4: Check Anomalies (2 minutes)**
- Switches to "Planning View" tab
- Reviews proactive anomaly alerts:
  - Owner over-allocation warnings
  - Metric health issues
  - Data quality problems
- Notes action items for portfolio manager

**Step 5: Prepare for Meeting (5 minutes)**
- Screenshots key metrics from Strategic View
- Notes high-risk products from filtered view
- Documents key insights from anomaly alerts
- Ready for leadership presentation

**Step 6: Follow Up (2 minutes)**
- Drills down into specific high-risk products
- Reviews detail panels for context
- Assigns action items to portfolio manager

### Outcomes ✅
- **Time Saved:** 4-6 hours per month (vs. manual reports)
- **Data Freshness:** Real-time vs. 1-2 weeks old
- **Confidence:** Visual, data-driven insights
- **Actionability:** Clear identification of risk areas
- **Presentation Ready:** Screenshot-friendly visuals

### Pain Points Addressed ✅
| Pain Point | Solution |
|------------|----------|
| Manual report requests | Self-service dashboard |
| Outdated data | Real-time Google Sheets integration |
| No visual metrics | Strategic View with KPI cards |
| Hard to identify risks | Risk distribution + drill-down |
| No anomaly detection | Automated alerts in Planning View |
| Can't drill into details | Click-through to filtered views |

---

## 🎯 Journey 2: Product Owner Performance Check

### User Profile
**Role:** Product Owner  
**Frequency:** Weekly  
**Time Required:** 5-10 minutes  
**Primary Goal:** Track individual solution performance and identify areas below target

### The Journey

#### Pre-Dashboard Pain Points ❌
- Had to dig through spreadsheets
- Difficult to visualize metric trends
- No clear target vs. actual comparison
- Time-consuming to find their solution
- No historical trend visibility
- Manual calculation of performance

#### Current Journey with Dashboard ✅

**Step 1: Find Solution (30 seconds)**
- Opens dashboard (Portfolio Overview loads)
- Uses search box to type solution name
- Results filter in real-time as they type
- Solution card appears instantly

**Step 2: Quick Status Check (30 seconds)**
- Views compact solution card
- Immediately sees:
  - Maturity stage badge (color-coded)
  - UX metric status (🟢 green = above target, 🔴 red = below)
  - BI metric status (🟢/🔴/⚪ gray = no data)
  - Owner and problem statement

**Step 3: Detailed Review (2 minutes)**
- Clicks solution card
- Detail panel opens on right side
- Reviews core details section:
  - Problem statement
  - Solution description
  - Target user and journey stages

**Step 4: Analyze Metrics (3 minutes)**
- Expands "Metrics & Performance" section
- Reviews UX metrics chart:
  - Monthly trend line (Jan-Dec)
  - Target line (dashed)
  - Identifies months below target
- Reviews BI metrics chart similarly
- Hovers over data points for exact values

**Step 5: Review Context (2 minutes)**
- Expands "Project Narrative" section
- Reviews regulatory status
- Checks indirect impact users
- Notes collateral journey stages

**Step 6: Action Planning (2 minutes)**
- Notes months below target
- Identifies improvement opportunities
- Documents next steps
- Closes detail panel

### Outcomes ✅
- **Time Saved:** 1-2 hours per week (vs. manual tracking)
- **Visibility:** Clear trend visualization
- **Proactivity:** Identify issues before they become critical
- **Self-Service:** No need to ask analysts for data
- **Confidence:** Data-backed performance tracking

### Pain Points Addressed ✅
| Pain Point | Solution |
|------------|----------|
| Hard to find solutions | Real-time search + filters |
| No quick status view | Compact cards with metric indicators |
| Manual trend tracking | Interactive monthly charts |
| No target comparison | Visual target lines on charts |
| Spreadsheet diving | Beautiful, organized detail panel |
| No historical context | 12 months of data visualized |

---

## 🎯 Journey 3: Portfolio Manager Planning Session

### User Profile
**Role:** Portfolio Manager  
**Frequency:** Bi-weekly or Monthly  
**Time Required:** 30-45 minutes  
**Primary Goal:** Comprehensive portfolio planning, resource allocation, and risk mitigation

### The Journey

#### Pre-Dashboard Pain Points ❌
- Multiple spreadsheets to review
- Manual data aggregation and analysis
- No automated anomaly detection
- Difficult to identify owner over-allocation
- Time-consuming to find data quality issues
- Hard to balance workload across team
- No centralized planning view
- Manual risk assessment

#### Current Journey with Dashboard ✅

**Phase 1: Anomaly Review (5-8 minutes)**

**Step 1: Open Planning View**
- Opens dashboard
- Clicks "Planning View" tab
- Immediately sees "Proactive Alerts & Insights" section

**Step 2: Review Owner Allocation**
- Sees owner over-allocation alerts:
  - "⚠️ Jane Doe is over-allocated with 5 products in Development/Growth"
- Reviews affected products list
- Notes need for resource rebalancing

**Step 3: Check Data Health**
- Reviews metric health issues:
  - Products with missing UX/BI metrics
  - Products with missing targets
  - Products below target thresholds
- Prioritizes data cleanup tasks
- Assigns data quality improvements

**Phase 2: Portfolio Analysis (10-15 minutes)**

**Step 4: Review Distribution Charts**
- In Planning View, reviews:
  - Maturity Distribution chart (identifies bottlenecks)
  - Solutions by P&C Area (identifies coverage gaps)
  - Metrics Coverage (data quality overview)
  - Top 10 Product Owners (workload distribution)

**Step 5: Apply Filters for Deep Dive**
- Uses Planning View filters:
  - Filters by specific P&C area
  - Filters by maturity stage
  - Charts update dynamically
- Reads rationale tooltips (ℹ️ icons) to understand:
  - "Why does this chart matter?"
  - "What should I look for?"
  - "What action should I take?"

**Step 6: Switch to Strategic View**
- Clicks "Strategic View" tab
- Reviews executive KPIs:
  - Portfolio Health Score
  - Risk Distribution (High: 8, Medium: 15, Low: 32)
  - Performance vs Target

**Step 7: Drill Into High-Risk Products**
- Clicks "High Risk" KPI card
- Automatically switches to Portfolio Overview
- High-risk products automatically filtered
- Reviews each high-risk solution:
  - Maturity stage
  - Metric status
  - Owner assignment

**Phase 3: Detailed Investigation (10-15 minutes)**

**Step 8: Review Specific Solutions**
- Clicks individual solution cards
- Reviews detail panels:
  - Core Details
  - Metrics & Performance (charts)
  - Project Narrative
- Uses progressive disclosure to focus on relevant info
- Charts load lazily for performance

**Step 9: Filter by Owner**
- Returns to Portfolio Overview
- Clears drill-down filters (click notification banner)
- Uses filter pills to filter by specific owner
- Reviews that owner's product portfolio
- Assesses workload balance

**Step 10: Filter by Area**
- Removes owner filter pill (click X)
- Filters by P&C area (e.g., "HRBP")
- Reviews area-specific solutions
- Identifies area-specific patterns

**Phase 4: Documentation & Action Planning (5-8 minutes)**

**Step 11: Document Findings**
- Screenshots key metrics from Planning View
- Notes anomaly alerts for follow-up
- Documents high-risk products
- Lists data quality improvement tasks

**Step 12: Assign Action Items**
- Creates task list based on:
  - Owner over-allocation (rebalance resources)
  - High-risk products (increase oversight)
  - Data quality issues (assign cleanup)
  - Below-target products (intervention plans)

**Step 13: Schedule Follow-Ups**
- Plans next review session
- Sets reminders for specific products
- Assigns accountability

### Outcomes ✅
- **Time Saved:** 6-10 hours per month (vs. manual analysis)
- **Proactivity:** Automated anomaly detection
- **Visibility:** Complete portfolio view in one place
- **Data-Driven:** Clear metrics for decision-making
- **Efficiency:** Filter and drill-down for focused analysis
- **Quality:** Automated data health checks
- **Balance:** Clear view of resource allocation

### Pain Points Addressed ✅
| Pain Point | Solution |
|------------|----------|
| Multiple spreadsheets | Consolidated Planning View |
| Manual anomaly detection | Automated alerts (owner overload, data health) |
| No resource visibility | Top 10 owners + over-allocation warnings |
| Manual risk assessment | Strategic View risk distribution + drill-down |
| Data quality blind spots | Metrics coverage analysis + health checks |
| Hard to find patterns | Interactive charts with dynamic filtering |
| No drill-down capability | Click KPI cards → auto-filtered tactical view |
| Time-consuming analysis | Automated calculations + visual insights |
| No prioritization | Risk scores + anomaly alerts |
| Can't focus on specific areas | Filter pills + dynamic filtering |

---

## 📊 Journey Comparison Matrix

| Aspect | Executive Review | Product Owner Check | Portfolio Manager Planning |
|--------|-----------------|---------------------|---------------------------|
| **Frequency** | Monthly | Weekly | Bi-weekly/Monthly |
| **Duration** | 10-15 min | 5-10 min | 30-45 min |
| **Primary Tab** | Strategic View | Portfolio Overview | Planning View |
| **Key Features** | KPI cards, drill-down | Search, detail panel, charts | Anomalies, filters, drill-down |
| **Main Goal** | Strategic oversight | Track own performance | Portfolio planning |
| **Time Saved** | 4-6 hrs/month | 1-2 hrs/week | 6-10 hrs/month |
| **Pain Points Solved** | Manual reports, delayed data | Spreadsheet diving | Multiple tools, manual analysis |

---

## 🎯 Key Insights from User Journeys

### Common Patterns

1. **Self-Service:** All users can access data independently
2. **Visual-First:** Charts and KPIs reduce cognitive load
3. **Drill-Down:** Easy navigation from high-level to details
4. **Real-Time:** No waiting for analyst reports
5. **Proactive:** Anomaly detection flags issues early
6. **Efficient:** Filter and search for focused analysis

### Most Valued Features

1. **Planning View Anomaly Alerts** (Portfolio Managers)
2. **Strategic View Drill-Down** (Executives)
3. **Detail Panel with Charts** (Product Owners)
4. **Filter Pills** (All users)
5. **Compact Cards with Status** (All users)
6. **Progressive Disclosure** (All users)

### Impact Metrics

| Metric | Before Dashboard | After Dashboard | Improvement |
|--------|-----------------|-----------------|-------------|
| **Time to get portfolio health** | 2-3 days | < 2 minutes | 99% faster |
| **Owner over-allocation detection** | Manual, quarterly | Automated, real-time | Proactive |
| **Data quality visibility** | Low | High | Automated checks |
| **Risk identification** | Manual | Automated + visual | Proactive |
| **Product Owner self-service** | None | Full | Autonomous |

---

## 🚀 Future Journey Enhancements

### Potential Improvements

1. **Executive Review:**
   - PDF export of Strategic View
   - Email alerts for critical metrics
   - Historical trend comparison

2. **Product Owner Check:**
   - Goal-setting interface
   - Peer benchmarking
   - Automated performance alerts

3. **Portfolio Manager Planning:**
   - Action item tracking
   - Resource rebalancing suggestions
   - Predictive analytics (risk forecasting)

---

## 📝 Journey Validation

### How We Validated These Journeys

- ✅ Based on actual user stories (USER_STORIES.md)
- ✅ Informed by implemented features
- ✅ Tested with real dashboard functionality
- ✅ Reflects pain points from requirements gathering
- ✅ Incorporates all 4 recent feature phases

### Next Steps

1. Validate journeys with real users
2. Collect feedback on journey accuracy
3. Identify additional journey types
4. Refine based on usage analytics
5. Update quarterly

---

**Document Maintained By:** Product Team  
**Review Cycle:** Quarterly  
**Next Review:** January 2026  
**Status:** Production Ready ✅


