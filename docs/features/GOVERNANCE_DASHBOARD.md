# Actionable Insights & Governance Dashboard

**Version**: 6.3.0  
**Status**: ✅ Complete  
**Date**: October 21, 2025

## Overview

Consolidated dashboard replacing "Insights & Analytics" and "Planning & Action" tabs, providing an actionable view of portfolio health with AI-driven insights, smoke detector logic, and resource allocation anomalies.

## User Story

**Story X.X: AI-Driven Portfolio Governance Dashboard**

**As the** Chief of Staff or a Portfolio Owner,  
**I want** a single "Actionable Insights & Governance" dashboard tab that consolidates the performance metrics, resource allocation data, and actively displays a Portfolio Health Summary featuring AI-driven Smoke Detector logic and BAU allocation anomalies at the top,  
**So that** I can quickly identify potential "Low Value" solutions, proactively spot strategic gaps, and inform resource trade-off decisions without manually correlating data.

## Architecture

### Three-Section Layout

The dashboard follows a strict information hierarchy with visual prominence given to the Action Layer:

#### **Top Section (Action Layer)** 🎯
The most prominent section with gradient background and larger sizing:
- **AI-Driven Portfolio Health Summary**: LiteLLM-powered insights analyzing smoke detectors, BAU anomalies, and data health
- **Smoke Detector Count Scorecard**: Clickable card showing count of triggered warning signals
  - Click to view drill-down modal with solution names and trigger types
  - Triggers include: Lacking Metrics, Maturity: Decline Stage, Downward Trend
- **Data Health Scorecard**: Displays portfolio data completeness percentage
  - Shows count of solutions missing key metrics

#### **Mid Section (Allocation Analysis)** 📈
Resource allocation and team consumption analysis:
- **BAU Allocation Anomaly Chart**: Horizontal bar chart with threshold lines
  - Red threshold: ≥3800 hrs/year (High Demand)
  - Orange threshold: 1900-3799 hrs/year (Flagged)
  - Color-coded bars for quick visual identification
- **PTech Involvement Map**: Doughnut chart showing solutions with/without People Tech involvement
- **Team Consumption Ranked List**: Top-down list of teams by total BAU hours
  - Shows hours and FTE conversion for each team

#### **Bottom Section (Health & Distribution)** 💪
Portfolio health metrics and strategic distribution:
- **Performance Metrics**: Side-by-side comparison of UX and BI metrics
  - UX Achievement Rate: Percentage of solutions meeting UX targets
  - BI Coverage: Percentage of solutions with BI metrics defined
  - Compact gauge visualizations for quick comparison
- **Strategic Distribution**: Bar chart showing portfolio distribution by maturity stage
  - Identifies concentration in Development, Growth, Mature, or Decline stages

## Data Sources

### Backend (Apps Script)
- **Endpoint**: `getGovernanceData()` in `google-apps-script/COMPLETE-UPDATED-CODE.gs`
- **Spreadsheet**: P&C Portfolio Dataset (2025)
  - ID: `10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI`
  - Sheet: `[2025] P&C Portfolio`
- **Processing**: Server-side aggregation of 7 metric categories:
  1. Smoke Detectors Summary
  2. BAU Anomalies (High/Flagged/Normal)
  3. Data Health Metrics
  4. PTech Involvement Distribution
  5. Team Consumption by Hours
  6. Performance Metrics (UX/BI)
  7. Strategic Gaps & Distribution

### Frontend (AI)
- **AI Provider**: LiteLLM API
- **Model**: GPT-4o-mini (openai/gpt-4o-mini)
- **Purpose**: Generate 2-3 sentence actionable insights based on governance metrics
- **Timeout**: 5 seconds with fallback to rule-based summary

## Technical Details

### Frontend Implementation
- **File**: `src/js/core/ui/ui-governance.js`
- **Module Pattern**: IIFE with namespace export to `window.UIManager.Governance`
- **Key Functions**:
  - `renderGovernanceDashboard()`: Main entry point
  - `createActionLayer()`: Top section with AI summary and scorecards
  - `createAllocationSection()`: Mid section with charts and lists
  - `createHealthSection()`: Bottom section with performance metrics
  - `showSmokeDetectorModal()`: Drill-down modal for smoke detector details

### Styling
- **File**: `src/css/dashboard-style.css`
- **Section**: Governance Dashboard Styles (lines 5503-5954)
- **Key Classes**:
  - `.governance-action-layer`: Prominent top section with gradient and large padding
  - `.governance-scorecard`: Clickable cards with hover effects
  - `.bau-anomaly-chart`: Chart container with threshold visualization
  - `.smoke-detector-modal`: Full-screen modal for drill-down details
- **Responsive**: Breakpoints at 1024px and 768px for tablet/mobile

### Backend Implementation
- **File**: `google-apps-script/COMPLETE-UPDATED-CODE.gs`
- **Endpoint**: `doGet(e)` with `?action=getGovernanceData` parameter
- **Helper Functions**:
  - `calculateSmokeDetectorsSummary()`: Identifies solutions with warning signals
  - `calculateBAUAnomalies()`: Categorizes solutions by BAU hour thresholds
  - `calculateDataHealth()`: Counts missing metrics and calculates health score
  - `calculatePTechInvolvement()`: Groups solutions by PTech flag
  - `calculateTeamConsumption()`: Sums hours by team (PJC, PATO, TA, HRBP, PSE)
  - `calculatePerformanceMetrics()`: Compares last month vs targets
  - `calculateStrategicGaps()`: Analyzes distribution by area and maturity

## User Experience

### Visual Hierarchy
1. **Action Layer** is immediately visible with:
   - Larger padding (2rem vs 1.5rem)
   - Gradient background with prominent border
   - Shadow depth (0 12px 48px)
   - Grid layout prioritizing AI summary (2fr column)

2. **Mid Section** provides detailed analysis:
   - 2:1 grid ratio (chart to list)
   - Clear threshold indicators on BAU chart
   - Hover effects on team list items

3. **Bottom Section** enables quick comparisons:
   - Side-by-side metric gauges
   - Color-coded performance indicators
   - Strategic distribution visualization

### Interactions
- **Smoke Detector Scorecard**: Click to open modal with full list of triggered solutions
- **Team List Items**: Hover to highlight
- **Charts**: Hover for detailed tooltips with FTE calculations and percentages

## Deployment

### Prerequisites
1. Deploy updated `COMPLETE-UPDATED-CODE.gs` to Google Apps Script
2. Verify `CONFIG.WEB_APP_URL` points to deployed endpoint
3. Ensure `CONFIG.LITELLM_API_KEY` is valid and active

### Git Workflow
```bash
git checkout -b feature/governance-dashboard
git add .
git commit -m "feat(governance): Implemented consolidated dashboard"
git checkout main
git tag pre-deployment-backup-$(date +%Y-%m-%d-%H%M)
git merge --no-ff feature/governance-dashboard
git tag -a v6.3.0 -m "Feature: Strategic Governance Dashboard Launch"
git push origin main && git push origin v6.3.0
```

## Testing

### Manual Test Cases
1. **Tab Navigation**: Verify only 3 tabs visible (Explore, Governance, Analytics)
2. **Action Layer Prominence**: Confirm top section is visually dominant
3. **AI Summary**: Wait for AI-generated insights (fallback to rule-based if timeout)
4. **Smoke Detector Drill-Down**: Click scorecard, verify modal shows solutions and triggers
5. **BAU Thresholds**: Confirm red (3800) and orange (1900) lines visible on chart
6. **Performance Comparison**: Verify UX and BI metrics side-by-side
7. **Responsive Layout**: Test on tablet (1024px) and mobile (768px) widths

### Success Criteria
- ✅ Dashboard loads within 3 seconds
- ✅ AI summary generates or falls back gracefully
- ✅ All charts render correctly with Chart.js
- ✅ Smoke detector modal displays accurate data
- ✅ No console errors
- ✅ Responsive on all screen sizes

## Maintenance

### Updating AI Prompt
Edit the prompt template in `ui-governance.js` > `generateAISummary()` function:
```javascript
const prompt = `You are a portfolio governance advisor...`;
```

### Modifying Thresholds
BAU hour thresholds are defined in:
- **Backend**: `calculateBAUAnomalies()` (3800, 1900)
- **Frontend**: `initializeBAUAnomalyChart()` (annotation plugin)

### Adding New Metrics
1. Add calculation function in `COMPLETE-UPDATED-CODE.gs`
2. Include in `getGovernanceData()` return object
3. Update frontend rendering in `ui-governance.js`
4. Add corresponding CSS styles if needed

## Known Issues

None at launch.

## Future Enhancements

- [ ] Add export functionality for governance reports
- [ ] Enable date range filtering for historical trends
- [ ] Implement solution-level drill-down from charts
- [ ] Add customizable AI prompt templates via UI
- [ ] Create scheduled email digests for executives

