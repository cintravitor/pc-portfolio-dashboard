# EXPLORER Tab - Complete User Journey & User Stories

**Tab Name:** "Explore" (Technical ID: `portfolio-overview`)  
**Primary Purpose:** Product discovery, exploration, and detailed analysis  
**Target Users:** Portfolio Managers, Product Owners, Stakeholders, Executives, HRBP

---

## 🎯 Overview

The **EXPLORER Tab** is the main entry point for the P&C Portfolio Dashboard. It provides an interactive, filterable view of all solutions in the portfolio, allowing users to search, filter, and drill down into detailed product information.

---

## 📱 User Interface Description

### 1. **Header Section**
Located at the very top of the page, providing global controls and navigation.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏢 P&C Portfolio Dashboard                          [2025]          │
│                                     Last updated: Oct 9, 2025 10:30  │
│                                              [🔄 Refresh Data]       │
├─────────────────────────────────────────────────────────────────────┤
│  [Explore] [Insights & Analytics] [Planning & Action] [📊 Analytics]│
├─────────────────────────────────────────────────────────────────────┤
│ 🔍 [Search by solution name, problem, or description...]           │
│ [All Areas ▼] [All Stages ▼] [All Owners ▼] [Sort By... ▼]        │
│ □ Below Target Metrics              [Clear Filters]                 │
└─────────────────────────────────────────────────────────────────────┘
```

#### Components:
- **Dashboard Title**: Large, prominent "P&C Portfolio Dashboard" with year badge
- **Last Updated Timestamp**: Shows when data was last fetched from Google Sheets
- **Refresh Button**: Manual data refresh trigger with rotate icon (🔄)
- **Tab Navigation**: 4 tabs with "Explore" highlighted as active
- **Search Box**: Full-width text input with search icon and placeholder text
- **Filter Dropdowns**: 4 dropdowns (Area, Stage, Owner, Sort)
- **Below Target Checkbox**: Toggle filter for products below metric targets
- **Clear Filters Button**: Resets all filters and search

#### Visual Styling:
- **Glass-morphism effect**: Semi-transparent header with backdrop blur
- **Active tab**: Gradient accent line at bottom, highlighted background
- **Hover effects**: Subtle brightness increase on interactive elements
- **Responsive**: Stacks vertically on mobile devices

---

### 2. **Statistics Bar**
Displays real-time portfolio metrics that update dynamically with filters.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────────────────┐
│  Total Solutions    Showing    In Development   ⚠️ UX Metrics  ⚠️ BI Metrics │
│       45              45            12          not updated     not updated    │
│                                                     8                5          │
└─────────────────────────────────────────────────────────────────────┘
```

#### Stat Cards:
1. **Total Solutions**: Count of all products in portfolio
2. **Showing**: Count after filters applied (highlights when < Total)
3. **In Development**: Count of products in "Development" or "Growth" stages
4. **UX Metrics Not Updated**: Warning card (yellow) - shows products with missing UX data
5. **BI Metrics Not Updated**: Warning card (yellow) - shows products with missing BI data

#### Visual Styling:
- **Glass cards**: Semi-transparent background with soft shadows
- **Large numbers**: 2-3rem font size, gradient color
- **Small labels**: Uppercase, 0.75rem, gray text
- **Warning cards**: Yellow accent border, clickable cursor
- **Hover effect**: Card lifts slightly (translateY(-2px))
- **Click behavior**: Warning cards filter to show products with missing metrics

---

### 3. **Active Filter Pills** (Conditional)
Shows only when filters are active, providing visual feedback and quick removal.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────────────────┐
│ Active Filters: [🔍 Search: automation ×] [🏢 Area: HRBP ×]        │
│                 [🔄 Maturity: Live ×] [Clear All]                   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Components:
- **Filter Pills**: Rounded badges showing each active filter
  - Icon (emoji) representing filter type
  - Label and value text
  - Remove button (×) for individual removal
- **Clear All Button**: Removes all filters at once

#### Visual Styling:
- **Pill colors**: Light blue background (#e0f2fe), blue text
- **Remove button**: Hover turns red, smooth transition
- **Responsive**: Wraps to multiple lines on narrow screens

---

### 4. **Product Cards Grid** (Main Content)
Products grouped by P&C Area in collapsible sections.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────────────────┐
│ [+] HRBP                                                    (12)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ [−] PATO                                                    (18)    │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│ │ Solution A   │ │ Solution B   │ │ Solution C   │               │
│ │ [3. Mature]  │ │ [2. Growth]  │ │ [1. Dev]     │               │
│ │              │ │              │ │              │               │
│ │ 👤 John Doe  │ │ 👤 Jane Smith│ │ 👤 Bob Lee   │               │
│ │ Problem text │ │ Problem text │ │ Problem text │               │
│ │              │ │              │ │              │               │
│ │ Platform: Web│ │ Platform: API│ │ Platform: Mobile│             │
│ │ Metrics: Auto│ │ Metrics: Partial│ │ Metrics: Manual│          │
│ │              │ │              │ │              │               │
│ │ 🟢 UX 🟢 BI  │ │ 🟢 UX 🔴 BI  │ │ ⚪ UX ⚪ BI   │               │
│ └──────────────┘ └──────────────┘ └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

#### Area Section Header:
- **Toggle Icon**: `+` (collapsed) or `−` (expanded)
- **Area Name**: Large, bold text (e.g., "HRBP", "PATO", "PSE")
- **Product Count**: Gray badge showing number of products in area
- **Click Behavior**: Toggles section expansion
- **Visual Feedback**: Hover darkens background

#### Product Card (Compact Design):
Each card shows essential information at a glance:

**Card Header:**
- **Product Name**: Bold, truncated if too long
- **Maturity Badge**: Color-coded pill
  - Blue: "1. Development"
  - Green: "2. Growth"  
  - Purple: "3. Mature"
  - Orange: "4. Decline"

**Card Body:**
- **Owner**: Icon (👤) + owner name (truncated to 25 chars)
- **Problem Statement**: Truncated to 80 characters with "..."
- **Platform Information**:
  - Icon (🌐 Web, 📱 Mobile, 💻 Desktop, etc.)
  - Platform name
  - "+N" badge if multiple platforms
- **Metrics Status**:
  - Icon indicator (✓ Automated, ⚠ Partial, ○ Manual)
  - Text label

**Performance Indicators:**
- **UX Metric**: 
  - 🟢 Green: Meeting target
  - 🔴 Red: Below target
  - ⚪ Gray: No data
- **BI Metric**: Same color coding

#### Visual Styling:
- **Card dimensions**: ~350px wide, auto height
- **Spacing**: 1.5rem gap between cards
- **Hover effect**: Lifts slightly, shadow increases, border highlights
- **Click behavior**: Opens detail panel on the right
- **Selected state**: Blue border, remains highlighted
- **Responsive**: Single column on mobile

---

### 5. **Detail Panel** (Right Sidebar)
Slides in from right when a product card is clicked.

#### Visual Layout:
```
┌─────────────────────────────────────────┐
│ [×]                                     │
│                                         │
│ Solution Name                           │
│ P&C Area                                │
├─────────────────────────────────────────┤
│                                         │
│ [−] 📋 Core Details                     │
│     Essential product information       │
├─────────────────────────────────────────┤
│ Solution Scope                          │
│ • Problem: [problem text]               │
│ • Solution: [solution text]             │
│ • Target User: [target user]            │
│ • Indirect Impact: [indirect user]      │
│                                         │
│ Ownership & Compliance                  │
│ Owner: [owner name]                     │
│ Maturity Stage: [stage badge]           │
│ Regulatory Demand: [YES/NO]             │
│                                         │
│ Platform Details                        │
│ Primary Platform: [platform]            │
│ 💡 [Platform context note]              │
├─────────────────────────────────────────┤
│ [+] 📊 Metrics & Performance            │
│     KPI tracking and trend charts       │
└─────────────────────────────────────────┘
```

#### Header:
- **Close Button (×)**: Top-right, large, accessible
- **Product Name**: Large title font
- **P&C Area**: Subtitle, gray text

#### Collapsible Sections:

**Section 1: Core Details (Expanded by Default)**
- **Section Header**: Icon + title + subtitle + toggle (−/+)
- **Solution Scope**:
  - Bulleted list with bold labels
  - Problem statement
  - Solution description
  - Target user
  - Indirect impact user
  
- **Ownership & Compliance**:
  - Field-value pairs
  - Owner name
  - Maturity stage with color-coded badge
  - Regulatory demand (YES/NO)
  
- **Platform Details**:
  - Platform name or "Not specified"
  - Contextual note (💡) explaining platform importance
  - Warning (⚠️) if platform not specified

**Section 2: Metrics (Collapsed by Default)**
- **Section Header**: Icon + title "Metrics" + subtitle "Track performance and take action" + toggle (−/+)
- **UX Metrics Chart**:
  - Section title: "Key Metrics - User Experience"
  - Metric name as field label
  - Canvas element with Chart.js line chart
  - Shows 12 months (JAN-DEC) on X-axis
  - Actual values as solid line
  - Target as dashed line
  - Interactive tooltips on hover
  - **Performance Recommendation**: Contextual recommendation based on UX metric performance
    - Analyzes if metric is below/above/meeting target
    - Icon + text
    - Color-coded by performance (success/info/warning/error)
  
- **BI Metrics Chart**:
  - Section title: "Key Metrics - Business Impact"
  - Metric name as field label
  - Canvas element with Chart.js line chart
  - Same format as UX chart
  - **Performance Recommendation**: Contextual recommendation based on BI metric performance
    - Analyzes if metric is below/above/meeting target
    - Icon + text
    - Color-coded by performance (success/info/warning/error)

#### Visual Styling:
- **Width**: ~400px on desktop, full screen on mobile
- **Background**: White with soft shadow
- **Scroll**: Vertical scroll if content exceeds height
- **Animation**: Slides in from right (300ms ease)
- **Charts**: Responsive, maintains aspect ratio
- **Collapsible sections**: Smooth expand/collapse animation (300ms)
- **Close behavior**: Click × button, click outside panel (on desktop), or press Escape key

---

### 6. **Empty State**
Shown when no products match the current filters.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    📭                                   │
│              No Results Found                           │
│                                                         │
│    Try adjusting your filters or search terms          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Components:
- **Icon**: Large mailbox emoji (📭)
- **Title**: "No Results Found"
- **Subtitle**: Helpful guidance text
- **Styling**: Centered, gray text, padding

---

### 7. **Loading State**
Shown during initial data fetch from Google Sheets.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ⟳ (spinning)                        │
│           Loading Portfolio Data...                     │
│                                                         │
│       Fetching data from Google Sheets                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Components:
- **Spinner**: Animated rotating circle
- **Title**: "Loading Portfolio Data..."
- **Subtitle**: "Fetching data from Google Sheets"
- **Styling**: Centered, animated spinner

---

### 8. **Error State**
Shown if data fetch fails.

#### Visual Layout:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ⚠️                                   │
│            Error Loading Data                           │
│                                                         │
│           [Error message details]                       │
│                                                         │
│              [Try Again]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Components:
- **Icon**: Warning emoji (⚠️)
- **Title**: "Error Loading Data"
- **Error Message**: Specific error details
- **Try Again Button**: Triggers data refetch
- **Styling**: Centered, red accent color

---

## 🎬 Complete User Journey

### Journey 1: Product Owner - Check My Product Performance (5 minutes)

**Goal**: Quickly find my product and check if metrics are meeting targets.

**Steps:**

1. **Landing** 
   - Dashboard opens on EXPLORER tab
   - Loading spinner appears (2-3 seconds)
   - Stats bar and product cards populate
   - *UI State*: Full portfolio visible, all areas collapsed

2. **Search for Product**
   - Click in search box
   - Type product name (e.g., "Employee Onboarding")
   - Results filter in real-time (<300ms delay)
   - *UI State*: Filter pill appears showing search term
   - *UI State*: Only matching area sections expand automatically
   - *UI State*: Stats bar updates to show "Showing: 1"

3. **View Product Card**
   - Product card is visible in expanded area section
   - Card shows:
     - Product name and maturity stage
     - Owner name (confirming it's mine)
     - Problem statement preview
     - Platform: Web
     - Metrics: Automated
     - Performance indicators: 🟢 UX, 🔴 BI (red BI catches attention)
   - *User thinks*: "BI metric is below target, need to investigate"

4. **Open Detail Panel**
   - Click product card
   - Card highlights with blue border
   - Detail panel slides in from right (300ms)
   - *UI State*: Main content area shrinks to accommodate panel
   - Core Details section is already expanded

5. **Review Core Information**
   - Scroll through Core Details section
   - Confirm problem statement and solution description
   - Check ownership (correct)
   - Note maturity stage: "3. Mature"
   - Platform: Web (as expected)

6. **Expand Metrics Section**
   - Click "📊 Metrics & Performance" header
   - Section expands smoothly (300ms animation)
   - Charts start loading (500ms)
   - *UI State*: Two charts now visible

7. **Analyze UX Chart**
   - UX Metric: "CSAT" shown as chart title
   - Line chart displays 12 months (JAN-DEC)
   - Solid blue line: actual values
   - Dashed gray line: target (85)
   - Hover over recent months to see exact values
   - *Observation*: All months above target (green indicator makes sense)

8. **Analyze BI Chart**
   - BI Metric: "Adoption Rate" shown as chart title
   - Line chart displays 12 months
   - Solid blue line: actual values
   - Dashed gray line: target (75)
   - *Observation*: Last 3 months dipped below target
   - *User thinks*: "Need to investigate adoption drop"

9. **Check Data Extraction Status**
   - Scroll to "Data Extraction Status" section
   - Overall status: ⚙️ "Partially Automated"
   - UX Metric: ✅ "Automated" - 12 months of data
   - BI Metric: ✅ "Automated" - 12 months of data
   - Recommendations: "Metrics are being collected regularly. Monitor for any gaps in data collection."

10. **Take Action**
    - Close detail panel (click ×)
    - *User notes*: Need to address BI metric decline
    - Clear search filter
    - Dashboard returns to full view

**Outcome**: 
- ✅ Found product quickly (search)
- ✅ Identified BI metric issue (red indicator)
- ✅ Analyzed trend over time (charts)
- ✅ Confirmed data quality (automation status)
- ✅ Ready to take corrective action

**Pain Points Addressed**:
- Fast search with real-time filtering
- Visual indicators for at-a-glance status
- Interactive charts for trend analysis
- Automation status transparency

---

### Journey 2: Portfolio Manager - Review HRBP Area Products (10 minutes)

**Goal**: Understand all products in HRBP area, identify any concerns.

**Steps:**

1. **Landing**
   - Dashboard opens on EXPLORER tab
   - All 45 products loaded
   - Stats bar shows: Total: 45, Showing: 45, In Development: 12, UX Issues: 8, BI Issues: 5

2. **Apply Area Filter**
   - Click "All Areas" dropdown
   - Select "HRBP"
   - Dropdown closes automatically
   - *UI State*: Filter pill appears showing "🏢 Area: HRBP"
   - *UI State*: HRBP section expands automatically
   - *UI State*: All other area sections collapse
   - *UI State*: Stats bar updates to "Showing: 12"

3. **Review HRBP Section**
   - HRBP header shows "(12)" products
   - 12 product cards displayed in grid (3 columns)
   - Scan cards quickly for:
     - Maturity distribution (3 Mature, 5 Growth, 4 Development)
     - Owner distribution (multiple owners)
     - Performance indicators (mix of green, red, gray)

4. **Identify Products with Issues**
   - Notice 2 products with 🔴 red indicators
   - Notice 3 products with ⚪ gray indicators (no data)
   - *User thinks*: "Need to investigate these 5 products"

5. **Sort by Performance**
   - Click "Sort By..." dropdown
   - Select "Maturity Stage"
   - Cards re-order: Development → Growth → Mature
   - *UI State*: Filter pill added "⬆️ Sort: Maturity Stage"

6. **Review Development Products**
   - Top 4 cards are "1. Development" stage
   - Check owners: 2 assigned to same person (potential overload)
   - Check metrics: 3 out of 4 have gray indicators (no data yet - acceptable for dev stage)

7. **Check Growth Products**
   - Next 5 cards are "2. Growth" stage
   - Notice 1 product with both UX and BI red
   - *User thinks*: "This one needs attention"
   - Click on that product card

8. **Investigate Problem Product**
   - Detail panel opens
   - Product name: "Benefits Enrollment"
   - Owner: Jane Smith
   - Maturity: "2. Growth"
   - Platform: Web
   - Expand Metrics section
   - UX Chart: Consistently below target for 6 months
   - BI Chart: Also below target
   - *User conclusion*: "Schedule meeting with Jane to discuss"

9. **Continue Review**
   - Close detail panel
   - Scroll through remaining products
   - Notice Mature products mostly have green indicators (good)
   - Take note of 3 products with no data (gray) - need metrics defined

10. **Check Data Quality**
    - Scroll up to stats bar
    - Click "⚠️ UX Metrics not updated" card
    - View switches to show 8 products with missing UX data
    - Orange notification banner appears: "Showing 8 products with missing UX metric updates [× Clear Filter]"
    - Scan products: Mix of areas, but 2 are in HRBP
    - *User notes*: Add to follow-up list

11. **Return to Full View**
    - Click "Clear Filter" in notification banner
    - All filters cleared
    - Dashboard returns to full view
    - All areas collapsed

**Outcome**:
- ✅ Focused on specific area (HRBP)
- ✅ Sorted for meaningful review (by maturity)
- ✅ Identified 1 critical product (below targets)
- ✅ Identified 2 products needing metrics (no data)
- ✅ Identified 2 products with same owner (potential overload)
- ✅ Created action plan

**Pain Points Addressed**:
- Area filtering for focused review
- Sorting for logical analysis
- Visual indicators for quick scanning
- Data quality filters for gap identification
- Detail panel for deep investigation

---

### Journey 3: Executive - Quick Portfolio Health Check (3 minutes)

**Goal**: Get a quick sense of portfolio health before a meeting.

**Steps:**

1. **Landing**
   - Dashboard opens on EXPLORER tab
   - Immediately view stats bar

2. **Review Statistics**
   - Total Solutions: 45 (good portfolio size)
   - Showing: 45 (no filters)
   - In Development: 12 (healthy pipeline)
   - UX Metrics not updated: 8 (some data quality issues)
   - BI Metrics not updated: 5 (some data quality issues)
   - *Initial impression*: Portfolio is active, but some metrics need attention

3. **Check Products Below Target**
   - Click "Below Target Metrics" checkbox
   - Filter pill appears
   - Cards update to show only below-target products
   - Stats bar: "Showing: 7"
   - *UI State*: 7 products visible across areas

4. **Scan Below-Target Products**
   - Quickly scan the 7 product cards
   - Note maturity stages: Mix of Growth and Mature
   - Note areas: Distributed across HRBP, PATO, PSE
   - *User thinks*: "No single area is failing, issues are distributed"

5. **Sample One Product**
   - Click on one below-target product
   - Detail panel opens
   - Expand Metrics section
   - Review charts - see declining trend
   - *User thinks*: "Need Portfolio Manager to follow up on these"

6. **Check Data Quality Issues**
   - Close detail panel
   - Clear "Below Target" filter
   - Click "⚠️ UX Metrics not updated" stat card
   - View 8 products with missing UX data
   - Note: Mix of Development and Growth stages
   - *User thinks*: "Acceptable for Development, but Growth products need metrics"

7. **Take Notes**
   - Clear filter
   - *User notes for meeting*:
     - 45 products total
     - 12 in development (pipeline health good)
     - 7 products below targets (need follow-up)
     - 8 products missing UX metrics (mostly acceptable)
     - No major red flags, but improvement needed

**Outcome**:
- ✅ Got portfolio overview in < 3 minutes
- ✅ Identified key metrics for discussion
- ✅ Identified areas needing follow-up
- ✅ Ready for executive meeting

**Pain Points Addressed**:
- Fast stats overview
- Quick filtering for issues
- Sample investigation capability
- Data quality visibility

---

### Journey 4: Stakeholder - Research Solutions for My Area (15 minutes)

**Goal**: Understand what solutions exist for employee benefits area.

**Steps:**

1. **Landing**
   - Dashboard opens
   - User is unfamiliar with navigation

2. **Use Search**
   - Type "benefits" in search box
   - Real-time filter shows 4 products
   - Filter pill appears
   - *UI State*: Only areas with matching products expand

3. **Review Search Results**
   - 4 products found across 2 areas (HRBP and PATO)
   - HRBP section: 2 products
   - PATO section: 2 products

4. **Explore First Product**
   - Click "Benefits Enrollment" card
   - Detail panel opens
   - Read problem statement: Clear description of issue
   - Read solution description: Understand how it works
   - Target user: "All employees"
   - Platform: "Web"
   - *User thinks*: "This might solve our problem"

5. **Check Product Maturity**
   - Maturity stage: "3. Mature" (Live)
   - *User thinks*: "This is ready to use now"

6. **Review Metrics (if interested)**
   - Expand Metrics section
   - See UX metrics (CSAT) trend
   - See BI metrics (Adoption Rate) trend
   - Data extraction: Fully automated
   - *User thinks*: "This is actively used and monitored"

7. **Note Owner**
   - Owner: Jane Smith
   - *User notes*: Contact Jane to learn more

8. **Explore Other Results**
   - Close panel
   - Click through other 3 products
   - Compare problem statements
   - Compare maturity stages
   - Compare owners

9. **Broaden Search**
   - Clear search filter
   - Click "All Areas" dropdown
   - Select "HRBP"
   - Browse all HRBP products (12 total)
   - Find 2 more related to benefits

10. **Export Information**
    - For each relevant product, take notes:
      - Product name
      - Problem/solution
      - Owner
      - Maturity stage
      - Platform

**Outcome**:
- ✅ Discovered 6 relevant solutions
- ✅ Understood each solution's purpose
- ✅ Identified 3 Live solutions ready to use
- ✅ Identified contacts (owners) to reach out to
- ✅ Ready to schedule demos

**Pain Points Addressed**:
- Easy search for keyword matching
- Clear problem/solution descriptions
- Maturity stage visibility (know if it's ready)
- Owner information for follow-up
- Area filtering for context

---

## 📋 Complete User Stories with UI Details

### Epic: Solution Discovery & Exploration

---

#### Story 1: Real-Time Search

**As a** Product Owner  
**I want to** search for solutions by name, problem, or description  
**So that I** can quickly find specific solutions I'm interested in

**UI Components:**
- **Search Box**
  - Location: Below tab navigation, top of page
  - Width: Full width of filters section
  - Placeholder: "Search by solution name, problem, or description..."
  - Icon: 🔍 search icon on left
  - Style: White background, rounded corners, border
  - Behavior: Real-time filtering with 300ms debounce

**Acceptance Criteria:**
- ✅ Search box visible and accessible at top
- ✅ Search updates results in real-time as user types
- ✅ Matches against product name, problem, and solution description
- ✅ Case-insensitive matching
- ✅ Results appear within 300ms of last keystroke
- ✅ Empty search shows all solutions
- ✅ Filter pill appears when search term entered
- ✅ Matching areas auto-expand, others collapse

**User Interaction Flow:**
1. User clicks in search box → box highlights with blue border
2. User types "onboarding" → debounce timer starts
3. After 300ms → filter applies
4. Cards update → only matching products visible
5. Filter pill appears → "🔍 Search: onboarding"
6. Stats bar updates → "Showing: 3" (down from 45)
7. Matching area sections expand automatically

**Edge Cases:**
- Search term with no matches → Show empty state
- Very long search term → Truncate in filter pill
- Special characters → Handle gracefully, no errors

**Data Used:**
- `product.name` - Solution name
- `product.problem` - Problem statement
- `product.solution` - Solution description
- Case-insensitive string matching via `toLowerCase()`

**Priority:** High  
**Story Points:** 3

---

#### Story 2: Multi-Dimensional Filtering

**As a** Portfolio Manager  
**I want to** filter solutions by P&C area, maturity stage, and owner  
**So that I** can focus on specific segments of the portfolio

**UI Components:**
- **Filter Dropdowns** (4 total)
  - Location: Below search box, same row
  - Dropdowns:
    1. **Area Filter**: "All Areas" default
       - Options: All Areas, HRBP, PATO, PSE, PJC, Talent Acquisition
    2. **Maturity Filter**: "All Stages" default
       - Options: All Stages, 1. Development, 2. Growth, 3. Mature, 4. Decline
    3. **Owner Filter**: "All Owners" default
       - Options: Dynamically populated from data
    4. **Sort By**: No default
       - Options: Product Name (A-Z), Product Name (Z-A), Maturity Stage, P&C Area (A-Z), Owner (A-Z)
  - Style: White background, dropdown arrow, rounded corners
  - Width: Auto-size based on content

- **Below Target Checkbox**
  - Location: Right of dropdowns
  - Label: "Below Target Metrics"
  - Tooltip: "Show only products where UX or BI metrics are below target"
  - Style: Custom checkbox with label

- **Clear Filters Button**
  - Location: Far right of filters row
  - Label: "Clear Filters"
  - Style: Secondary button, gray border
  - Behavior: Resets all filters and search

**Acceptance Criteria:**
- ✅ Four filter dropdowns are visible and functional
- ✅ Filters can be combined (AND logic)
- ✅ Filter options populate dynamically from current data
- ✅ Results update immediately when filter selected
- ✅ "Clear Filters" button resets all filters at once
- ✅ Stats bar updates to show filtered count
- ✅ Filter pills appear for each active filter
- ✅ Filtered area sections expand automatically

**User Interaction Flow:**
1. User clicks "All Areas" dropdown → Dropdown opens with all options
2. User selects "HRBP" → Dropdown closes
3. Filter applies immediately → Cards update
4. Filter pill appears → "🏢 Area: HRBP"
5. Stats bar updates → "Showing: 12"
6. HRBP section expands → Other sections collapse
7. User clicks "All Stages" dropdown → Dropdown opens
8. User selects "3. Mature" → Dropdown closes
9. Second filter pill appears → "🔄 Maturity: 3. Mature"
10. Cards update → Only HRBP Mature products visible
11. Stats bar updates → "Showing: 3"

**Edge Cases:**
- All filters applied → Some combinations may result in 0 products (show empty state)
- Filter then search → Combines both
- Clear filters with search active → Clears search too

**Data Used:**
- `product.area` - P&C Area
- `product.maturity` - Maturity Stage
- `product.owner` - Owner Name
- `product.monthlyUX` - For below-target filter (UX)
- `product.monthlyBI` - For below-target filter (BI)
- `product.targetUX` - Target value for UX
- `product.targetBI` - Target value for BI

**Priority:** High  
**Story Points:** 5

---

#### Story 3: At-a-Glance Product Cards

**As a** Stakeholder  
**I want to** see solutions displayed as visual cards with key information  
**So that I** can quickly scan and identify solutions of interest

**UI Components:**
- **Area Section Header**
  - Toggle icon: + (collapsed) or − (expanded)
  - Area name: Large, bold text
  - Product count: Gray badge "(12)"
  - Hover: Background darkens slightly
  - Click: Toggles expansion

- **Product Card (Compact Design)**
  - Dimensions: ~350px wide, auto height
  - Border: 1px light gray, rounded corners
  - Shadow: Soft drop shadow
  - Hover: Lifts 2px, shadow increases, blue border appears
  - Click: Opens detail panel
  - Selected state: Blue border persists
  
  **Card Header:**
  - Product name: Bold, 1.125rem font
  - Maturity badge: Rounded pill, color-coded
    - Blue (#3b82f6): "1. Development"
    - Green (#10b981): "2. Growth"
    - Purple (#8b5cf6): "3. Mature"
    - Orange (#f59e0b): "4. Decline"
  
  **Card Body:**
  - Owner: 
    - Icon: 👤
    - Name: Truncated to 25 chars
    - Font: 0.875rem, gray
  - Problem statement:
    - Text: Truncated to 80 chars
    - Font: 0.875rem, dark gray
    - Style: Italic
  - Platform info:
    - Label: "Platform:"
    - Icon: Contextual (🌐 Web, 📱 Mobile, etc.)
    - Value: Platform name
    - Multi-platform: Shows "+2" if multiple
  - Metrics info:
    - Label: "Metrics:"
    - Badge: Colored pill
      - Green (#10b981): "✓ Automated"
      - Yellow (#f59e0b): "⚠ Partial"
      - Gray (#6b7280): "○ Manual"
  
  **Card Footer (Performance):**
  - Label: "Performance:"
  - Indicator row: 2 circular indicators
    - UX: Labeled "UX"
      - 🟢 Green: Meeting target
      - 🔴 Red: Below target
      - ⚪ Gray: No data
    - BI: Labeled "BI"
      - Same color logic
  - Tooltip on hover: Shows metric name, current value, target, status

**Acceptance Criteria:**
- ✅ Products grouped by P&C Area
- ✅ Area sections collapsible/expandable
- ✅ Each card shows: name, area, maturity, problem, owner, platform, metrics status, performance
- ✅ Maturity badges are color-coded correctly
- ✅ Cards are clickable with hover effect
- ✅ Cards layout responsively (3 columns → 2 → 1 on smaller screens)
- ✅ Empty state shown when no solutions match filters
- ✅ Selected card highlights with blue border

**User Interaction Flow:**
1. User views expanded area section → Cards displayed in grid
2. User hovers over card → Card lifts, shadow increases, cursor: pointer
3. User sees performance indicators → 🟢 UX, 🔴 BI (understands status at glance)
4. User hovers over BI indicator → Tooltip appears: "BI: Adoption Rate\nCurrent: 62.3 | Target: 75.0\n✗ Below target"
5. User clicks card → Card highlights with blue border
6. Detail panel slides in from right
7. User clicks another card → Previous card unhighlights, new card highlights

**Edge Cases:**
- Very long product names → Truncate with ellipsis
- Missing platform → Show "Not specified"
- No metrics data → Show gray indicators with "No data" tooltip
- No owner → Show "Not assigned"

**Data Used:**
- `product.id` - Unique identifier
- `product.name` - Product name
- `product.area` - P&C Area for grouping
- `product.maturity` - Maturity stage for badge
- `product.problem` - Problem statement (truncated)
- `product.owner` - Owner name (truncated)
- `product.platform` - Platform information
- `product.monthlyUX` - For performance calculation
- `product.monthlyBI` - For performance calculation
- `product.targetUX` - For comparison
- `product.targetBI` - For comparison
- `product.keyMetricUX` - Metric name for tooltip
- `product.keyMetricBI` - Metric name for tooltip

**Priority:** High  
**Story Points:** 8

---

#### Story 4: Comprehensive Detail Panel

**As a** Product Owner  
**I want to** click on a solution card to see comprehensive details  
**So that I** can understand the full scope, metrics, and ownership

**UI Components:**
- **Detail Panel Container**
  - Position: Fixed to right side of screen
  - Width: 400px (desktop), 100% (mobile)
  - Height: 100vh
  - Background: White
  - Shadow: Large left shadow
  - Z-index: High (overlays main content)
  - Animation: Slide in from right (300ms ease)

- **Panel Header**
  - Close button (×):
    - Position: Top-right corner
    - Size: 2rem, clickable area 44px
    - Color: Gray, hover: red
    - Behavior: Closes panel
  - Product name:
    - Font: Bold, 1.5rem
    - Color: Dark gray (#1f2937)
    - Margin: 1rem below close button
  - Area subtitle:
    - Font: 0.875rem
    - Color: Medium gray (#6b7280)
    - Margin: 0.25rem below name

- **Panel Body (Scrollable)**
  - Padding: 1.5rem
  - Max-height: calc(100vh - header height)
  - Overflow-y: auto
  
  **Collapsible Section Pattern:**
  - Section header:
    - Icon: Emoji (📋, 📊)
    - Title: Bold, 1.125rem
    - Subtitle: Gray, 0.875rem, description
    - Toggle: + or − icon
    - Click behavior: Expand/collapse section
    - Hover: Background lightens
  - Section content:
    - Padding: 1.5rem
    - Animation: Expand/collapse (300ms ease)
    - States: expanded/collapsed classes
  
  **Section 1: Core Details (Default: Expanded)**
  
  *Solution Scope:*
  - Bulleted list format
  - Each item: Bold label + value
  - Items:
    - Problem: Full problem statement
    - Solution: Full solution description
    - Target User: Target user description
    - Indirect Impact: Indirect user impact
  - Style: 0.875rem font, line-height 1.6
  
  *Ownership & Compliance:*
  - Field-value pairs
  - Fields:
    - Owner: Name or "Not assigned"
    - Maturity Stage: Badge (same colors as card)
    - Regulatory Demand: YES/NO badge
  - Style: Label above value, 0.875rem
  
  *Platform Details:*
  - Platform name field
  - Contextual note (💡):
    - Light blue background
    - Icon + text explaining platform importance
    - Example: "This solution is delivered through Web. Understanding the platform helps in resource allocation..."
  - Warning note (⚠️) if not specified:
    - Light orange background
    - Icon + text encouraging documentation
  
  **Section 2: Metrics (Default: Collapsed)**
  
  *UX Metrics Chart:*
  - Section title: "Key Metrics - User Experience"
  - Metric name as field label
  - Chart container:
    - Canvas element for Chart.js
    - Aspect ratio: 2:1
    - Responsive
  - Chart details:
    - Type: Line chart
    - X-axis: Months (JAN, FEB, MAR, ... DEC)
    - Y-axis: Metric values
    - Data line: Solid blue line
    - Target line: Dashed gray line
    - Tooltips: Show exact values on hover
  - Performance recommendation:
    - Analyzes UX metric vs target
    - Contextual, actionable insight
    - Color-coded by performance level
  
  *BI Metrics Chart:*
  - Same format as UX chart
  - Different metric name
  - Performance recommendation:
    - Analyzes BI metric vs target
    - Contextual, actionable insight
    - Color-coded by performance level
  
  *Recommendation Examples:*
  - Success: "Great work! User experience metric is consistently meeting or exceeding target. Keep up the momentum."
  - Warning: "User experience metric is frequently below target. Consider improvement initiatives to address performance gaps."
  - Info: "Performance is variable. Review months below target and identify patterns or opportunities for optimization."
  - Info: "No data available for this metric. Establish baseline measurements to track business impact."

**Acceptance Criteria:**
- ✅ Clicking card opens detail panel on right
- ✅ Panel shows all product information organized in sections
- ✅ Close button (×) dismisses panel
- ✅ Opened card highlighted with selection indicator
- ✅ Panel is scrollable if content exceeds screen height
- ✅ On mobile, panel is full-screen overlay
- ✅ Core Details expanded by default
- ✅ Metrics section collapsed by default
- ✅ Charts load lazily when section expanded
- ✅ Smooth animations for all transitions

**User Interaction Flow:**
1. User clicks product card → Card highlights
2. Detail panel slides in (300ms) → Main content shrinks
3. Panel header displays → Product name and area visible
4. Core Details section visible → Already expanded
5. User reads solution scope → Problem, solution, target user
6. User checks ownership → Owner name, maturity stage
7. User clicks "Metrics" header → Section expands (300ms)
8. Charts load → Spinning indicator while loading
9. Charts render → UX chart appears first, then BI chart
10. User hovers over chart → Tooltip shows exact value
11. User scrolls down → Sees UX performance recommendation
12. User continues scrolling → Sees BI performance recommendation
13. User reads recommendations → Understands performance and next steps
13. User clicks × button → Panel slides out (300ms)
14. Main content expands → Returns to full width

**Edge Cases:**
- Missing problem/solution → Show "Not specified"
- No metrics defined → Show placeholder in charts
- Chart.js fails to load → Show error message with retry button
- Very long text content → Panel scrolls, header stays fixed
- Mobile device → Panel becomes full-screen with slide-up animation

**Data Used:**
- `product` - Full product object
- All fields from product:
  - name, area, problem, solution, targetUser, indirectUser
  - owner, maturity, regulatory, platform
  - keyMetricUX, targetUX, monthlyUX[]
  - keyMetricBI, targetBI, monthlyBI[]

**Priority:** High  
**Story Points:** 13

---

#### Story 5: Interactive Metric Charts

**As a** Product Owner  
**I want to** see monthly UX and Business Impact metrics visualized as charts  
**So that I** can track performance trends and target achievement

**UI Components:**
- **Chart Container**
  - Location: Within detail panel, Metrics & Performance section
  - Two charts: UX Metrics, BI Metrics
  - Canvas element: HTML5 Canvas for Chart.js
  - Dimensions: Responsive, aspect ratio 2:1

- **Chart Components (Chart.js Line Chart)**:
  - **Title**: Metric name (e.g., "CSAT", "Adoption Rate")
  - **X-axis**: 
    - Labels: Month abbreviations (JAN, FEB, MAR, ..., DEC)
    - Font: 0.75rem, gray
    - Grid: Light gray vertical lines
  - **Y-axis**:
    - Labels: Metric values (auto-scaled)
    - Font: 0.75rem, gray
    - Grid: Light gray horizontal lines
  - **Data Line** (Actual values):
    - Color: Blue (#3b82f6)
    - Style: Solid line, 2px width
    - Points: Filled circles on data points
    - Point hover: Larger circle
  - **Target Line**:
    - Color: Gray (#9ca3af)
    - Style: Dashed line, 2px width
    - No points
    - Label: "Target"
  - **Tooltip** (on hover):
    - Background: White with shadow
    - Shows:
      - Month
      - Actual: [value]
      - Target: [value]
      - Status: Above/Below target
    - Position: Follows cursor

- **Loading State**:
  - Spinner animation while Chart.js loads
  - Text: "Loading chart..."

- **Error State**:
  - Red text: "Failed to load charts. Please refresh the page."
  - Retry button

**Acceptance Criteria:**
- ✅ Two chart sections in detail panel: UX and BI
- ✅ Charts show monthly actuals as line graph
- ✅ Target value shown as dashed reference line
- ✅ Chart labels include metric name
- ✅ X-axis shows months (JAN-DEC)
- ✅ Charts are interactive (hover shows tooltips with values)
- ✅ Charts handle missing data gracefully (gaps in line)
- ✅ Chart.js loads lazily (only when Metrics section expanded)
- ✅ Charts are responsive to container size

**User Interaction Flow:**
1. User expands Metrics section → Chart loading begins
2. Loading spinner appears → "Loading charts..."
3. Chart.js library loads → 200-500ms
4. First chart renders → UX Metrics chart appears
5. Second chart renders → BI Metrics chart appears
6. User sees data line → Blue line across 12 months
7. User sees target line → Gray dashed line
8. User hovers over data point → Tooltip appears
9. Tooltip shows:
   - "August"
   - "Actual: 87.5"
   - "Target: 85.0"
   - "✓ Above target" (green text)
10. User moves cursor → Tooltip follows smoothly
11. User compares months → Can see trend visually
12. User identifies dip in May-June → Below target

**Edge Cases:**
- All values missing → Show empty chart with message "No data available"
- Some months missing → Line has gaps (doesn't interpolate)
- Very high/low outlier → Y-axis auto-scales appropriately
- No target defined → Only show actual line, no dashed line
- Metric name is N/A → Use generic "Metric" as title

**Data Used:**
- `product.keyMetricUX` - UX metric name (chart title)
- `product.targetUX` - UX target (dashed line)
- `product.monthlyUX[]` - Array of 12 UX values (JAN-DEC)
- `product.keyMetricBI` - BI metric name (chart title)
- `product.targetBI` - BI target (dashed line)
- `product.monthlyBI[]` - Array of 12 BI values (JAN-DEC)
- Chart.js library (CDN): https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js

**Technical Details:**
- Chart type: Line chart
- Parsing: `parseFloat()` for numeric conversion
- Null handling: Skip null/undefined/empty values
- Animation: 500ms on initial render
- Responsiveness: Maintains aspect ratio, resizes with container

**Priority:** High  
**Story Points:** 13

---

#### Story 6: Portfolio Statistics Dashboard

**As a** Portfolio Manager  
**I want to** see real-time statistics at the top of the page  
**So that I** can quickly understand portfolio size and composition

**UI Components:**
- **Statistics Bar**
  - Location: Below filters, above product cards
  - Layout: Horizontal flex row
  - Spacing: 1rem gaps between cards
  - Responsive: Wraps to 2 columns on tablets, stacks on mobile

- **Stat Card (Standard)**
  - Dimensions: Auto-width, 100px height
  - Background: Semi-transparent white (glass effect)
  - Border: 1px light gray, rounded corners
  - Shadow: Soft drop shadow
  - Hover: Lifts 2px, shadow increases
  - Layout: Vertical flex (label above value)
  
  **Components:**
  - Label:
    - Font: 0.75rem, uppercase, bold
    - Color: Medium gray (#6b7280)
    - Position: Top
  - Value:
    - Font: 2rem (32px), bold
    - Color: Gradient (blue to purple)
    - Position: Below label
  
  **Cards:**
  1. **Total Solutions**
     - Label: "TOTAL SOLUTIONS"
     - Value: Count of all products
     - Example: "45"
  
  2. **Showing**
     - Label: "SHOWING"
     - Value: Count after filters
     - Example: "12" (when filtered)
     - Highlight: Orange color when < Total
  
  3. **In Development**
     - Label: "IN DEVELOPMENT"
     - Value: Count of Development + Growth stages
     - Example: "12"

- **Stat Card (Warning)**
  - Same as standard, plus:
  - Background: Light yellow (#fef3c7)
  - Border: Yellow (#f59e0b)
  - Icon: ⚠️ warning emoji before label
  - Cursor: Pointer (clickable)
  - Title attribute: Hover shows full explanation
  
  **Warning Cards:**
  4. **UX Metrics Not Updated**
     - Label: "⚠️ UX METRICS NOT UPDATED"
     - Value: Count of products with missing UX data
     - Example: "8"
     - Click behavior: Filters to show only these products
  
  5. **BI Metrics Not Updated**
     - Label: "⚠️ BI METRICS NOT UPDATED"
     - Value: Count of products with missing BI data
     - Example: "5"
     - Click behavior: Filters to show only these products

**Acceptance Criteria:**
- ✅ Stat bar displays 5 metric cards
- ✅ Stats update immediately when filters change
- ✅ Cards displayed as glass-effect cards with gradients
- ✅ Cards have hover effect (lift and shadow)
- ✅ Warning cards are clickable and apply data quality filters
- ✅ Stat bar is responsive (wraps on smaller screens)
- ✅ Values update in real-time with filtering

**User Interaction Flow:**
1. User lands on dashboard → Stats bar visible
2. Initial state:
   - Total: 45
   - Showing: 45
   - In Development: 12
   - UX Missing: 8
   - BI Missing: 5
3. User applies HRBP filter → Stats update instantly:
   - Total: 45 (unchanged)
   - Showing: 12 (orange highlight)
   - In Development: 4 (updated)
   - UX Missing: 2 (updated)
   - BI Missing: 1 (updated)
4. User hovers over "UX Missing" card → Card lifts, cursor: pointer
5. User sees title tooltip → "Click to filter products with missing UX metric updates"
6. User clicks → View filters to 2 products
7. Notification banner appears → "Showing 2 products with missing UX metric updates"

**Edge Cases:**
- All filters applied, 0 products → Showing: 0
- No products in development → In Development: 0
- All metrics updated → Warning cards show 0 (good!)

**Data Used:**
- `portfolioData.length` - Total count
- `filteredData.length` - Showing count
- `product.maturity === "1. Development"` - Dev count
- `product.maturity === "2. Growth"` - Growth count
- `product.monthlyUX[11]` - Last month UX (check if missing)
- `product.monthlyBI[11]` - Last month BI (check if missing)

**Calculations:**
- Total: Always full dataset count
- Showing: Filtered dataset count
- In Development: Count where maturity is "1. Development" OR "2. Growth"
- UX Missing: Count where last month UX is empty/null/0
- BI Missing: Count where last month BI is empty/null/0

**Priority:** High  
**Story Points:** 5

---

### Epic: Data Management

---

#### Story 7: Manual Data Refresh

**As a** Portfolio Manager  
**I want to** manually refresh data from Google Sheets  
**So that I** can see the latest updates without waiting 24 hours

**UI Components:**
- **Refresh Button**
  - Location: Header top-right, next to "Last updated" timestamp
  - Icon: 🔄 (rotate emoji)
  - Label: "Refresh Data"
  - Style: Primary button, blue background, white text
  - Width: Auto
  - Hover: Darkens slightly
  - Active (during refresh): 
    - Icon rotates (animation)
    - Button disabled
    - Text: "Refreshing..."

- **Last Updated Timestamp**
  - Location: Header top-right, left of refresh button
  - Format: "Last updated: Oct 9, 2025, 10:30:15 AM"
  - Font: 0.875rem, gray
  - Updates after successful refresh

- **Success State**:
  - Timestamp updates to current time
  - Brief success message (toast notification):
    - Position: Top-right corner
    - Background: Green
    - Icon: ✓
    - Text: "Data refreshed successfully"
    - Duration: 3 seconds, fades out

- **Error State**:
  - Error message (toast notification):
    - Position: Top-right corner
    - Background: Red
    - Icon: ⚠️
    - Text: "Failed to refresh data: [error message]"
    - Fallback: "Using cached data"
    - Duration: 5 seconds, user can dismiss

**Acceptance Criteria:**
- ✅ "🔄 Refresh Data" button visible in header
- ✅ Clicking button fetches fresh data from Google Sheets
- ✅ Loading indicator shows during fetch (rotating icon)
- ✅ Success updates "Last updated" timestamp
- ✅ Error message shown if fetch fails
- ✅ Cached data used as fallback if fetch fails
- ✅ All views update with new data (cards, stats, detail panel)
- ✅ Button disabled during refresh to prevent double-click

**User Interaction Flow:**
1. User sees timestamp → "Last updated: Oct 8, 2025, 5:30 PM" (yesterday)
2. User clicks "🔄 Refresh Data" button → Button becomes disabled
3. Icon starts rotating → Visual feedback
4. Button text changes → "Refreshing..."
5. Data fetch begins → Request to Google Apps Script endpoint
6. Loading takes 2-3 seconds → User waits
7. Success → Data received
8. Cards re-render → New products appear / updated info
9. Stats update → New counts
10. Timestamp updates → "Last updated: Oct 9, 2025, 10:30 AM"
11. Toast notification → "✓ Data refreshed successfully" (3sec)
12. Button re-enables → "🔄 Refresh Data"

**Error Flow:**
1. User clicks refresh → Fetch starts
2. Network error occurs → Fetch fails
3. Toast notification → "⚠️ Failed to refresh data: Network error"
4. Dashboard continues → Uses cached data
5. Timestamp doesn't change → Still shows last successful update
6. Button re-enables → User can try again

**Edge Cases:**
- No internet connection → Show error, use cache
- Google Sheets API down → Show error, use cache
- Cached data corrupt → Show critical error, prompt page reload
- First-time load (no cache) → Must succeed or show error state

**Data Used:**
- `CONFIG.WEB_APP_URL` - Google Apps Script Web App URL
- `fetch()` API - HTTP request
- `localStorage.setItem(DATA_CACHE_KEY)` - Save to cache
- `localStorage.setItem(STORAGE_KEY)` - Save timestamp
- `new Date().toISOString()` - Current timestamp
- `portfolioData` - Global state update

**Technical Details:**
- Endpoint: Google Apps Script doGet() function
- Method: GET request
- Response: JSON array of products
- Caching: localStorage with expiry check
- Error handling: Try-catch with fallback

**Priority:** High  
**Story Points:** 5

---

#### Story 8: Automatic Daily Updates

**As a** Portfolio Manager  
**I want to** have data automatically refresh every 24 hours  
**So that I** don't have to manually update constantly

**UI Components:**
- **Background Process**
  - No visible UI (runs automatically)
  - Checks timestamp on page load
  - Checks timestamp every hour (background interval)
  - Triggers refresh if > 24 hours elapsed

- **Auto-Refresh Notification**
  - Toast notification when auto-refresh occurs:
    - Position: Top-right
    - Background: Blue
    - Icon: 🔄
    - Text: "Data automatically refreshed"
    - Duration: 3 seconds

- **Last Updated Timestamp**
  - Always displays current data age
  - Updates after auto-refresh

**Acceptance Criteria:**
- ✅ Dashboard checks update time on page load
- ✅ If > 24 hours since last update, auto-fetches fresh data
- ✅ Background check runs every hour (while page open)
- ✅ Auto-refresh triggers when 24-hour threshold exceeded
- ✅ "Last updated" timestamp always displayed
- ✅ Data cached in localStorage for offline viewing
- ✅ Auto-refresh doesn't interrupt user if detail panel open
- ✅ Notification shown when auto-refresh completes

**User Interaction Flow:**

**Scenario 1: Page Load (Data Fresh)**
1. User opens dashboard → Initial load
2. Check last update → "2 hours ago"
3. No auto-refresh needed → Load from cache
4. Display continues → Fast load

**Scenario 2: Page Load (Data Stale)**
1. User opens dashboard → Initial load
2. Check last update → "28 hours ago" (> 24h)
3. Auto-refresh triggers → Fetch from Google Sheets
4. Loading indicator → Shows while fetching
5. Data loads → New data displayed
6. Timestamp updates → "Just now"
7. No notification needed → User expects initial load

**Scenario 3: Background Auto-Refresh**
1. User has dashboard open → Browsing products
2. 1 hour passes → Background interval check runs
3. Check last update → "25 hours ago" (> 24h)
4. Auto-refresh triggers → Background fetch
5. Data received → Updates state
6. View refreshes → Cards update (if no detail panel open)
7. Toast notification → "🔄 Data automatically refreshed"
8. Timestamp updates → Current time

**Edge Cases:**
- User has detail panel open → Wait until panel closes, then refresh
- Multiple tabs open → Each tab manages independently (could improve with SharedWorker)
- Browser closed before 24h → Next open triggers refresh
- Auto-refresh fails → Silent fail, try again next interval

**Data Used:**
- `UPDATE_INTERVAL = 24 * 60 * 60 * 1000` - 24 hours in milliseconds
- `localStorage.getItem(STORAGE_KEY)` - Last update timestamp
- `new Date() - lastUpdateTime` - Calculate age
- `setInterval(checkForUpdates, 60 * 60 * 1000)` - Hourly check
- `shouldRefreshData()` - Boolean decision function

**Technical Details:**
- Page load: Immediate check and fetch if needed
- Interval check: Every 60 minutes
- Threshold: 24 hours (86,400,000 ms)
- Cache: localStorage with timestamp
- Silent operation: No user prompts

**Priority:** Medium  
**Story Points:** 8

---

## 🎨 Visual Design System

### Color Palette

**Primary Colors:**
- Blue: #3b82f6 (Primary actions, active states)
- Purple: #8b5cf6 (Accents, gradients)
- Green: #10b981 (Success, on-track metrics)
- Red: #ef4444 (Errors, below-target metrics)
- Yellow: #f59e0b (Warnings, data quality alerts)
- Orange: #f97316 (Decline stage, highlights)

**Neutral Colors:**
- Gray 900: #111827 (Primary text)
- Gray 700: #374151 (Secondary text)
- Gray 500: #6b7280 (Tertiary text, labels)
- Gray 300: #d1d5db (Borders, dividers)
- Gray 100: #f3f4f6 (Backgrounds)
- White: #ffffff (Cards, panels)

**Status Colors:**
- Development: Blue (#3b82f6)
- Growth: Green (#10b981)
- Mature: Purple (#8b5cf6)
- Decline: Orange (#f59e0b)

**Metric Colors:**
- Meeting Target: Green (#10b981) 🟢
- Below Target: Red (#ef4444) 🔴
- No Data: Gray (#9ca3af) ⚪

### Typography

**Font Family:**
- Primary: 'Inter', sans-serif
- Weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Font Sizes:**
- Hero: 2rem (32px) - Stat values
- H1: 1.5rem (24px) - Detail panel title
- H2: 1.25rem (20px) - Section titles
- H3: 1.125rem (18px) - Card titles
- Body: 0.875rem (14px) - Main text
- Small: 0.75rem (12px) - Labels, captions

### Spacing

**Scale: 0.25rem (4px) base unit**
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Effects

**Shadows:**
- Card: 0 1px 3px rgba(0,0,0,0.1)
- Card Hover: 0 4px 6px rgba(0,0,0,0.1)
- Panel: 0 10px 25px rgba(0,0,0,0.1)

**Transitions:**
- Standard: 200ms ease
- Hover: 150ms ease
- Slide: 300ms ease

**Border Radius:**
- Small: 0.375rem (6px)
- Medium: 0.5rem (8px)
- Large: 0.75rem (12px)
- Pill: 9999px

### Glass-morphism

**Glass Effect:**
- Background: rgba(255, 255, 255, 0.8)
- Backdrop filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.3)
- Shadow: 0 4px 6px rgba(0,0,0,0.1)

---

## 📊 Data Flow & Business Rules

### Data Sources

**Primary Data Source:**
- Google Sheets via Google Apps Script Web App
- Endpoint: `CONFIG.WEB_APP_URL`
- Method: HTTP GET
- Format: JSON array of product objects

**Data Structure:**
```javascript
{
  id: 1,
  name: "Employee Onboarding Portal",
  area: "HRBP",
  maturity: "3. Mature",
  owner: "Jane Smith",
  problem: "New hires struggle with...",
  solution: "A centralized portal...",
  targetUser: "All new employees",
  indirectUser: "Hiring managers",
  journeyMain: "Onboarding",
  journeyCollateral: "Performance Management",
  platform: "Web, Mobile",
  regulatory: "NO",
  keyMetricUX: "CSAT",
  targetUX: 85,
  monthlyUX: [82, 84, 86, ...], // 12 values
  keyMetricBI: "Adoption Rate",
  targetBI: 75,
  monthlyBI: [70, 72, 78, ...] // 12 values
}
```

### Filtering Logic

**Multi-Filter AND Logic:**
```javascript
filteredData = portfolioData.filter(product => {
  // Search (OR across fields)
  if (searchTerm) {
    const matchesName = product.name.toLowerCase().includes(searchTerm);
    const matchesProblem = product.problem.toLowerCase().includes(searchTerm);
    const matchesSolution = product.solution.toLowerCase().includes(searchTerm);
    if (!(matchesName || matchesProblem || matchesSolution)) return false;
  }
  
  // Area (exact match)
  if (areaFilter && product.area !== areaFilter) return false;
  
  // Maturity (exact match)
  if (maturityFilter && product.maturity !== maturityFilter) return false;
  
  // Owner (exact match)
  if (ownerFilter && product.owner !== ownerFilter) return false;
  
  // Below Target (custom logic)
  if (belowTargetOnly) {
    const uxBelowTarget = isMetricBelowTarget(product.monthlyUX, product.targetUX);
    const biBelowTarget = isMetricBelowTarget(product.monthlyBI, product.targetBI);
    if (!(uxBelowTarget || biBelowTarget)) return false;
  }
  
  return true;
});
```

### Sorting Logic

**Sort Options:**
```javascript
switch (sortBy) {
  case 'name-asc':
    data.sort((a, b) => a.name.localeCompare(b.name));
    break;
  case 'name-desc':
    data.sort((a, b) => b.name.localeCompare(a.name));
    break;
  case 'maturity-asc':
    data.sort((a, b) => a.maturity.localeCompare(b.maturity));
    break;
  case 'area-asc':
    data.sort((a, b) => a.area.localeCompare(b.area));
    break;
  case 'owner-asc':
    data.sort((a, b) => a.owner.localeCompare(b.owner));
    break;
}
```

### Performance Calculation

**Metric Status (Green/Red/Gray):**
```javascript
function getMetricStatus(monthlyData, target) {
  // No metric defined
  if (!monthlyData || !target) return 'gray';
  
  // Get last month's value
  const lastValue = monthlyData[11]; // December (index 11)
  
  // No data for last month
  if (!lastValue || lastValue === '' || lastValue === 'N/A') return 'gray';
  
  // Convert to number
  const value = parseFloat(lastValue);
  const targetNum = parseFloat(target);
  
  // Compare
  if (value >= targetNum) return 'green';
  else return 'red';
}
```

### Automation Detection

**Metric Automation Level:**
```javascript
function determineAutomation(monthlyData) {
  // Count valid data points
  const validMonths = monthlyData.filter(val => 
    val && val !== '' && val !== 'N/A' && val !== '0'
  ).length;
  
  if (validMonths >= 6) return 'Automated';
  else if (validMonths >= 3) return 'Semi-Automated';
  else if (validMonths > 0) return 'Manual';
  else return 'No Data';
}
```

---

## 🔧 Technical Implementation Details

### Module Architecture

**Core Modules:**
1. `utils.js` - Utility functions (escapeHtml, truncateText, etc.)
2. `state.js` - Global state management
3. `data-manager.js` - Data fetching, filtering, calculations
4. `ui-cards.js` - Product card rendering
5. `ui-detail-panel.js` - Detail panel rendering
6. `ui-filters.js` - Filter UI management
7. `ui-tabs.js` - Tab switching
8. `ui-charts.js` - Chart.js integration

### Event Handling

**Card Click Handler:**
```javascript
document.addEventListener('click', (e) => {
  const card = e.target.closest('.product-card');
  if (card) {
    const productId = card.getAttribute('data-product-id');
    window.UIManager.DetailPanel.show(productId);
  }
});
```

**Detail Panel Close Handler:**
```javascript
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('detail-close')) {
    window.UIManager.DetailPanel.hide();
  }
});
```

**Filter Change Handler:**
```javascript
document.getElementById('filter-area').addEventListener('change', () => {
  window.UIManager.Filters.applyFiltersFromUI();
});
```

### Performance Optimizations

**Debounced Search:**
```javascript
const debouncedSearch = debounce(() => {
  applyFilters();
}, 300); // Wait 300ms after last keystroke
```

**Lazy Chart Loading:**
```javascript
// Only load Chart.js when Metrics section expanded
if (!window.Chart) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  document.head.appendChild(script);
}
```

**Virtual Scrolling** (Future):
- For portfolios > 100 products
- Render only visible cards
- Load more on scroll

### Browser Compatibility

**Supported:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Polyfills Not Required:**
- Modern JavaScript (ES6+)
- Fetch API
- LocalStorage
- CSS Grid/Flexbox

---

## 📈 Analytics & Tracking

### User Events to Track

**Discovery Events:**
- Search performed (term, results count)
- Filter applied (type, value)
- Sort applied (type)
- Card viewed (product ID, scroll depth)
- Card clicked (product ID, position in list)

**Engagement Events:**
- Detail panel opened (product ID)
- Detail panel section expanded (section name)
- Chart hovered (product ID, metric type, month)
- Time spent viewing detail (seconds)
- Detail panel closed (method: X button, outside click, ESC)

**Data Quality Events:**
- Missing metrics stat clicked (UX/BI)
- Below target filter applied
- Products with no data viewed

**Performance Events:**
- Page load time
- Data fetch time
- Chart render time
- Filter application time

### Success Metrics

**Adoption:**
- Daily active users
- Session duration
- Pages per session

**Engagement:**
- Average products viewed per session
- Detail panel open rate
- Search usage rate
- Filter usage rate

**Data Quality:**
- % products with complete metrics
- % products meeting targets
- % automated data collection

---

## 🚀 Future Enhancements

### Short-term (Q1 2026)

1. **Export Functionality**
   - Export filtered products to CSV/Excel
   - Export chart images
   - Print-friendly view

2. **Advanced Filters**
   - Date range filters (show products updated in last X days)
   - Custom metric thresholds
   - Saved filter presets

3. **Bulk Actions**
   - Select multiple products
   - Bulk tag/categorize
   - Bulk export

### Medium-term (Q2 2026)

1. **Comparison View**
   - Compare 2-4 products side-by-side
   - Highlight differences
   - Benchmark against portfolio average

2. **Timeline View**
   - Visualize product lifecycle
   - Show key milestones
   - Historical changes

3. **Advanced Search**
   - Boolean operators (AND, OR, NOT)
   - Field-specific search
   - Recent searches

### Long-term (2026+)

1. **AI-Powered Insights**
   - Anomaly detection
   - Predictive analytics
   - Recommendations

2. **Collaboration**
   - Comments on products
   - @mentions
   - Shared workspaces

3. **Mobile App**
   - Native iOS/Android app
   - Offline mode
   - Push notifications

---

## 📄 Related Documentation

- **[USER_STORIES.md](./USER_STORIES.md)** - Complete user stories for all tabs
- **[USER_GUIDE_TABS.md](./docs/guides/USER_GUIDE_TABS.md)** - User guide for all tabs
- **[FEATURE_TESTING_GUIDE.md](./FEATURE_TESTING_GUIDE.md)** - QA testing procedures
- **[REPOSITORY_GUIDE.md](./REPOSITORY_GUIDE.md)** - Repository navigation guide
- **[README.md](./README.md)** - Project overview and setup

---

**Document Version:** 1.0  
**Last Updated:** October 9, 2025  
**Author:** Product Team  
**Review Status:** ✅ Complete

