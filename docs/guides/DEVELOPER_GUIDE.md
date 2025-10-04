# Developer Guide - P&C Portfolio Dashboard

**Last Updated:** October 4, 2025  
**For:** Developers contributing to or maintaining the project

---

## 🎯 Overview

This guide provides detailed technical information for developers working on the P&C Portfolio Dashboard. It covers architecture, development workflows, debugging, and best practices.

---

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Development Workflow](#development-workflow)
- [Debugging Guide](#debugging-guide)
- [Common Tasks](#common-tasks)
- [Performance Optimization](#performance-optimization)
- [Browser Compatibility](#browser-compatibility)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/cintravitor/pc-portfolio-dashboard.git
cd pc-portfolio-dashboard

# 2. Start local server
python3 -m http.server 8080

# 3. Open in browser
open http://localhost:8080
```

That's it! The dashboard should load with cached data.

---

## 🏗️ Architecture Deep Dive

### Module System

The dashboard uses a **modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│              index.html (View)                  │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        ↓                      ↓
┌──────────────┐      ┌──────────────┐
│ dashboard-   │      │    CSS       │
│ script.js    │      │  Styling     │
│ (Orchestrator)│      └──────────────┘
└───────┬───────┘
        │
        ├─→ state.js (State Management)
        ├─→ data-manager.js (Data Layer)
        ├─→ ui-manager.js (UI Layer)
        └─→ utils.js (Utilities + Pub/Sub)
```

### State Management (state.js)

**Purpose:** Single source of truth for application state

**Key Functions:**
```javascript
// Getters
window.State.getPortfolioData()    // Get all products
window.State.getFilteredData()     // Get filtered products
window.State.getCurrentTab()       // Get active tab
window.State.getChartInstances()   // Get Chart.js instances

// Setters
window.State.setPortfolioData(data)
window.State.setFilteredData(data)
window.State.setCurrentTab(tab)
window.State.setChartInstance(id, chart)

// Operations
window.State.resetState()          // Reset all state
window.State.hasData()             // Check if data loaded
window.State.getStateStats()       // Debug info
```

**State Structure:**
```javascript
const appState = {
    portfolioData: [],          // All products
    filteredData: [],           // Filtered products
    currentTab: 'portfolio-overview',
    analysisDataLoaded: false,
    chartJsLoaded: false,
    chartInstances: {},         // Chart.js instances
    lastUpdateTime: null,
    columnMapping: {}
};
```

---

### Data Layer (data-manager.js)

**Purpose:** All data operations (fetch, process, calculate)

**Key Functions:**

**Data Loading:**
```javascript
window.DataManager.fetchSheetData()        // Fetch from Google Sheets
window.DataManager.loadCachedData()        // Load from localStorage
window.DataManager.shouldRefreshData()     // Check if refresh needed
```

**Data Processing:**
```javascript
window.DataManager.applyFilters(search, area, maturity, owner, sort)
window.DataManager.getFilterOptions()      // Get unique values for filters
window.DataManager.getProductStats()       // Get statistics
```

**Analysis:**
```javascript
window.DataManager.calculateRiskScore(product)
window.DataManager.calculatePerformanceVsTarget(product)
window.DataManager.calculatePortfolioMetrics()
window.DataManager.analyzePortfolioData(data)
window.DataManager.checkAnomalies()        // Anomaly detection
window.DataManager.getCardSummaryMetrics(product)
```

**Data Flow:**
```
Google Sheets
    ↓ (Google Apps Script)
fetchSheetData()
    ↓
parseAndStoreData()
    ↓
window.State.setPortfolioData()
    ↓
localStorage (cache)
```

---

### UI Layer (ui-manager.js)

**Purpose:** Rendering and user interaction (no business logic)

**Key Functions:**

**Tab Management:**
```javascript
window.UIManager.switchTab(tabName)
window.UIManager.renderStrategicView()
window.UIManager.renderPlanningView()
window.UIManager.loadDescriptiveAnalysis()
```

**Filters & Cards:**
```javascript
window.UIManager.setupTacticalFilters()
window.UIManager.applyFiltersFromUI()
window.UIManager.clearFilters()
window.UIManager.renderCards()
window.UIManager.renderFilterPills()
```

**Detail Panel:**
```javascript
window.UIManager.showDetailPanel(productId)
window.UIManager.hideDetailPanel()
```

**UI Updates:**
```javascript
window.UIManager.updateStats()
window.UIManager.showLoading(show)
window.UIManager.showError(message)
```

**UI doesn't:**
- ❌ Call data-manager directly (should publish events instead)
- ❌ Process data
- ❌ Contain business logic

---

### Utilities (utils.js)

**Purpose:** Shared utilities + Pub/Sub event system

**Utility Functions:**
```javascript
// String
window.Utils.escapeHtml(str)
window.Utils.truncateText(text, maxLength)

// Data
window.Utils.deepClone(obj)
window.Utils.parseNumeric(value)
window.Utils.calculatePercentage(value, total)

// Array
window.Utils.getUniqueValues(array)
window.Utils.sortByProperty(array, property, order)

// Date
window.Utils.formatDate(date)
window.Utils.getTimeElapsed(timestamp)

// Performance
window.Utils.debounce(func, delay)
```

**Pub/Sub System:**
```javascript
// Publish event
window.Utils.publish('filter:changed', { area: 'HRBP' });

// Subscribe to event
window.Utils.subscribe('filter:changed', (data) => {
    console.log('Filter changed:', data);
});

// Unsubscribe
window.Utils.unsubscribeAll('filter:changed');

// Debug
window.Utils.getRegisteredEvents()      // See all events
window.Utils.getSubscriberCount(event)  // Count subscribers
```

---

## 🔄 Development Workflow

### Adding a New Feature

**Example: Add export to PDF feature**

#### 1. Create Branch
```bash
git checkout -b feature/pdf-export
```

#### 2. Plan the Implementation

```javascript
// Where does it fit?
// - UI: Export button in Strategic View
// - Data: Format data for PDF
// - Utils: PDF generation library

// What modules are affected?
// - ui-manager.js: Add export button, handle click
// - data-manager.js: Prepare data for export
// - New: pdf-generator.js (optional)
```

#### 3. Implement

**ui-manager.js:**
```javascript
function renderStrategicView() {
    // ... existing code ...
    
    // Add export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📄 Export to PDF';
    exportBtn.onclick = () => exportToPDF();
    executiveContent.appendChild(exportBtn);
}

function exportToPDF() {
    // Publish event
    window.Utils.publish('export:pdf:requested');
}
```

**dashboard-script.js:**
```javascript
// Subscribe to export event
window.Utils.subscribe('export:pdf:requested', () => {
    const metrics = window.DataManager.calculatePortfolioMetrics();
    generatePDF(metrics);
});
```

#### 4. Test
- ✅ Works in all browsers
- ✅ Handles edge cases
- ✅ No console errors
- ✅ Performance acceptable

#### 5. Document
- Update README.md
- Add to USER_STORIES.md
- Update PRODUCT_ROADMAP.md

#### 6. Commit & PR
```bash
git add .
git commit -m "feat(strategic-view): add PDF export functionality"
git push origin feature/pdf-export
```

---

## 🐛 Debugging Guide

### Browser DevTools

**Console Commands:**

```javascript
// View current state
window.State.getStateStats()

// View portfolio data
window.State.getPortfolioData()

// View filtered data
window.State.getFilteredData()

// Test anomaly detection
window.testAnomalyDetection()

// View registered events
window.Utils.getRegisteredEvents()

// Test pub/sub
window.Utils.subscribe('test', d => console.log('Got:', d));
window.Utils.publish('test', { msg: 'Hello!' });
```

### Common Issues

**Issue: "No data loaded"**
```javascript
// Check if data exists
window.State.hasData()  // Should return true

// Check localStorage
localStorage.getItem('portfolio_data_cache')

// Manually fetch
await window.DataManager.fetchSheetData()
```

**Issue: "Charts not rendering"**
```javascript
// Check Chart.js loaded
window.State.isChartJsLoaded()

// Check chart instances
window.State.getChartInstances()

// Manually destroy and re-render
window.State.clearAllChartInstances()
window.UIManager.renderPlanningView()
```

**Issue: "Filters not working"**
```javascript
// Check filtered data
console.log(window.State.getFilteredData())

// Check filter values
const area = document.getElementById('filter-area').value;
const maturity = document.getElementById('filter-maturity').value;
console.log({ area, maturity });

// Re-apply filters
window.UIManager.applyFiltersFromUI()
```

### Performance Profiling

```javascript
// Measure function execution time
console.time('filterPerformance');
window.DataManager.applyFilters('', 'HRBP', '', '', '');
console.timeEnd('filterPerformance');

// Memory usage
console.log(performance.memory);

// Monitor reflows
// Chrome DevTools → Performance → Record → Analyze
```

---

## 🔧 Common Tasks

### Adding a New Chart

**1. Add HTML container:**
```html
<div class="chart-card">
    <canvas id="my-new-chart"></canvas>
</div>
```

**2. Create chart in ui-manager.js:**
```javascript
function renderMyNewChart(data) {
    const canvas = document.getElementById('my-new-chart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    const existingChart = window.State.getChartInstance('my-new-chart');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create new chart
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'My Data',
                data: data.values,
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Store instance
    window.State.setChartInstance('my-new-chart', chart);
}
```

### Adding a New Filter

**1. Add HTML:**
```html
<select id="filter-my-field" onchange="applyFilters()">
    <option value="">All</option>
</select>
```

**2. Update data-manager.js:**
```javascript
function applyFilters(search, area, maturity, owner, myField, sort) {
    let filtered = portfolioData;
    
    // ... existing filters ...
    
    // New filter
    if (myField) {
        filtered = filtered.filter(p => p.myField === myField);
    }
    
    window.State.setFilteredData(filtered);
}
```

**3. Update ui-manager.js:**
```javascript
function applyFiltersFromUI() {
    const myField = document.getElementById('filter-my-field').value;
    
    window.DataManager.applyFilters(
        searchTerm,
        areaFilter,
        maturityFilter,
        ownerFilter,
        myField,  // New parameter
        sortBy
    );
    
    renderCards();
    updateStats();
}
```

### Adding a New Anomaly Check

**In data-manager.js:**
```javascript
function checkAnomalies() {
    const anomalyReport = {
        ownerOverload: [],
        dataHealthIssues: [],
        myNewCheck: [],  // New category
        summary: {}
    };
    
    // ... existing checks ...
    
    // New anomaly check
    portfolioData.forEach(product => {
        if (someCondition(product)) {
            anomalyReport.myNewCheck.push({
                id: product.id,
                name: product.name,
                issue: 'Description of issue',
                recommendation: 'What to do about it'
            });
        }
    });
    
    // Update summary
    anomalyReport.summary.totalMyNewCheck = anomalyReport.myNewCheck.length;
    
    return anomalyReport;
}
```

---

## ⚡ Performance Optimization

### Best Practices

**1. Lazy Loading**
```javascript
// Load Chart.js only when needed
if (!window.State.isChartJsLoaded() && !window.Chart) {
    loadChartJs();
}
```

**2. Debouncing**
```javascript
// Debounce search input
const debouncedSearch = window.Utils.debounce(() => {
    applyFiltersFromUI();
}, 300);

searchInput.addEventListener('input', debouncedSearch);
```

**3. Virtual Scrolling (for large datasets)**
```javascript
// Only render visible cards
function renderVisibleCards() {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const cardHeight = 200;
    
    const startIndex = Math.floor(scrollTop / cardHeight);
    const endIndex = Math.ceil((scrollTop + viewportHeight) / cardHeight);
    
    const visibleProducts = filteredData.slice(startIndex, endIndex);
    // Render only visible products
}
```

**4. Chart Cleanup**
```javascript
// Always destroy charts before creating new ones
function destroyAllCharts() {
    const instances = window.State.getChartInstances();
    Object.values(instances).forEach(chart => chart.destroy());
    window.State.clearAllChartInstances();
}
```

### Performance Monitoring

```javascript
// Add performance marks
performance.mark('filter-start');
applyFilters();
performance.mark('filter-end');
performance.measure('filter-time', 'filter-start', 'filter-end');

// Get measure
const measure = performance.getEntriesByName('filter-time')[0];
console.log(`Filter took ${measure.duration}ms`);
```

---

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |

### Testing Cross-Browser

**Use BrowserStack or similar:**
```bash
# Or test locally with different browsers
open -a "Google Chrome" http://localhost:8080
open -a "Firefox" http://localhost:8080
open -a "Safari" http://localhost:8080
```

### Polyfills Not Required

The codebase uses only modern JavaScript (ES6+) features that are widely supported. No polyfills needed for target browsers.

---

## 🔍 Troubleshooting

### Problem: Changes not reflecting

**Solution:**
```bash
# Hard refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Clear cache
# Chrome DevTools → Network → Disable cache (checkbox)

# Clear localStorage
localStorage.clear()
```

### Problem: Chart.js errors

**Solution:**
```javascript
// Destroy all charts first
window.State.clearAllChartInstances();

// Re-load Chart.js
window.State.setChartJsLoaded(false);
loadChartJs();
```

### Problem: Google Sheets data not loading

**Solution:**
```javascript
// Check config
console.log(CONFIG.WEB_APP_URL);

// Test endpoint
fetch(CONFIG.WEB_APP_URL)
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);

// Check CORS
// Ensure Google Apps Script deployed as web app with "Anyone" access
```

---

## 📖 Additional Resources

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[USER_STORIES.md](./USER_STORIES.md)** - Feature documentation
- **[STRATEGIC_ARCHITECTURE_REPORT.md](./STRATEGIC_ARCHITECTURE_REPORT.md)** - Architecture details
- **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)** - Future plans

---

## 💬 Getting Help

**Stuck? Here's how to get help:**

1. **Search Issues:** Check if someone else had the same problem
2. **Read Docs:** Check all documentation files
3. **Ask in Discussions:** Post a question
4. **Open Issue:** Create a detailed issue with reproduction steps

---

**Happy Developing!** 🚀

*Last Updated: October 4, 2025*

