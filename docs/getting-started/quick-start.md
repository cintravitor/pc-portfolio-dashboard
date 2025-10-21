# Quick Start Guide

## Overview

The P&C Portfolio Dashboard is an interactive web application for managing and visualizing People & Culture (P&C) portfolio solutions at Nubank. This guide will help you get up and running quickly.

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Google account with access to the P&C Portfolio spreadsheet
- Basic understanding of HTML/JavaScript (for local development)

## Running the Dashboard

### Option 1: Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cintravitor/pc-portfolio-dashboard.git
   cd pc-portfolio-dashboard
   ```

2. **Start a local server:**
   ```bash
   python3 -m http.server 8080
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080`

4. **Load data:**
   Click "Refresh Data" button to fetch latest data from Google Sheets

### Option 2: GitHub Pages (Production)

Visit the live deployment: [https://cintravitor.github.io/pc-portfolio-dashboard/](https://cintravitor.github.io/pc-portfolio-dashboard/)

## Dashboard Overview

The dashboard has three main tabs:

### 1. Explore Tab
- **Solution Cards**: Browse all P&C solutions with AI-generated summaries
- **Filters**: Search and filter by area, maturity stage, or owner
- **Detail Panel**: Click any card to see detailed metrics and charts
- **Smoke Detectors**: Visual indicators for solutions needing attention

### 2. Governance Tab
- **Action Layer**: AI-driven insights and smoke detector scorecard
- **Metrics Coverage**: UX/BI achievement tracking
- **Portfolio Distribution**: Visual breakdown by journey stage, maturity, and area
- **Resource Allocation**: BAU anomaly detection and team consumption

### 3. Analytics Tab
- **Executive Metrics**: High-level KPIs and portfolio health
- **Detailed Analysis**: Breakdowns by maturity, area, and metrics
- **Risk Matrix**: Risk vs performance quadrant view

## Key Features

### AI-Powered Summaries
Solution cards display concise AI-generated problem statements (under 150 characters) to improve scannability.

### Smoke Detectors
Automatic alerts for:
- Solutions missing key metrics
- Solutions in decline stage
- Data quality issues

### Interactive Filters
- **Search**: Find solutions by name or description
- **Multi-select**: Filter by multiple areas/stages simultaneously
- **Active Pills**: Visual display of applied filters with easy removal

### Real-Time Data
Data syncs directly from Google Sheets via Apps Script backend, ensuring always up-to-date information.

## Common Tasks

### Viewing Solution Details
1. Navigate to **Explore** tab
2. Click on any solution card
3. Detail panel opens on the right with:
   - Complete problem statement
   - Solution description
   - Metric charts (UX & BI)
   - Owner and team information

### Finding Solutions With Issues
1. Go to **Governance** tab
2. Check **Smoke Detector Scorecard**
3. Click on detector counts to drill down
4. Modal shows all affected solutions with reasons

### Analyzing Portfolio Health
1. Go to **Analytics** tab
2. View **Executive Summary** for high-level metrics
3. Scroll to **Health Score** for detailed analysis
4. Use **Risk Matrix** to identify high-priority solutions

### Filtering by Criteria
1. Use search box to find solutions by name
2. Click dropdown filters (Area, Stage, Owner)
3. Select multiple values as needed
4. Active filters shown as pills below search
5. Click "Clear All" to reset

## Troubleshooting

### Data Not Loading
- Check browser console (F12) for errors
- Verify internet connection
- Try refreshing the page
- Check if Google Sheets is accessible

### Cards Not Appearing
- Ensure filters aren't hiding all results
- Click "Clear Filters" to reset
- Check if data fetch was successful

### Charts Not Rendering
- Ensure Chart.js library loaded (check console)
- Verify solution has valid metric data
- Try closing and reopening detail panel

### AI Summaries Missing
- Check if `ai-summaries-data.js` loaded
- Look for console errors about AI_SUMMARIES
- Verify file has no syntax errors

## Next Steps

- Read [Architecture Overview](../architecture/overview.md) to understand system design
- Check [Feature Documentation](../features/) for detailed capabilities
- Review [API Reference](../api/) for developer information
- See [Contributing Guide](../contributing/code-standards.md) for development guidelines

## Getting Help

- Check [README.md](../../README.md) for project overview
- Review [Developer Guide](../guides/DEVELOPER_GUIDE.md) for technical details
- See [Testing Documentation](../testing/) for quality assurance
- Visit repository issues for known problems

## Version Information

**Current Version:** v6.3.0  
**Last Updated:** October 21, 2025  
**Major Features:**
- Strategic Governance Dashboard
- AI-powered solution summaries
- Column chart visualizations
- Collapsible section navigation

