# UI Modules API Reference

## Overview

UI modules handle all rendering and user interaction. All modules export via `window.UIManager`.

## Module APIs

### UIManager.Tabs

**Purpose**: Tab navigation

```javascript
// Initialize tab switching
window.UIManager.Tabs.init();

// Switch to specific tab
window.UIManager.Tabs.switchTab('governance-dashboard');
```

**Tab IDs**:
- `'portfolio-overview'` - 🔍 Explore tab
- `'governance-dashboard'` - 💡 Insights tab

### UIManager.Filters

**Purpose**: Filtering and search

```javascript
// Initialize filters
window.UIManager.Filters.init();

// Apply current filter state
window.UIManager.Filters.applyFilters();

// Clear all filters
window.UIManager.Filters.clearFilters();

// Update filter pills display
window.UIManager.Filters.updateFilterPills();

// Populate filter dropdowns
window.UIManager.Filters.populateDropdowns();
```

### UIManager.Cards

**Purpose**: Solution card rendering

```javascript
// Initialize card system
window.UIManager.Cards.init();

// Render all cards
window.UIManager.Cards.renderCards();

// Update stats bar
window.UIManager.Cards.updateStats();
```

### UIManager.DetailPanel

**Purpose**: Solution detail view

```javascript
// Render detail panel for product
window.UIManager.DetailPanel.render(productData);

// Close detail panel
window.UIManager.DetailPanel.close();
```

### UIManager.Charts

**Purpose**: Chart.js utilities

```javascript
// Render metric chart
window.UIManager.Charts.renderMetricChart(
    'ux-chart-canvas',
    monthlyData,
    {
        label: 'UX Metric',
        target: 85
    }
);

// Destroy chart instance
window.UIManager.Charts.destroyChart('ux-chart-canvas');
```

### UIManager.Governance

**Purpose**: Insights dashboard (consolidated governance view)

```javascript
// Render complete insights dashboard
window.UIManager.Governance.render();
```

**Sections Rendered**:
- Action Layer (AI summary, smoke detectors)
- Metrics Coverage (UX/BI achievement)
- Portfolio Distribution
- Resource Allocation

### UIManager.DrillDown

**Purpose**: Cross-tab navigation

```javascript
// Handle anomaly card click
window.UIManager.DrillDown.handleAnomalyClick('owner-overallocation', ownerData);

// Clear drill-down filters
window.UIManager.DrillDown.clearDrillDown();
```

## Event System

### Custom Events

Modules communicate via custom events:

```javascript
// Data loaded event
document.addEventListener('data-loaded', (e) => {
    console.log(`Loaded ${e.detail.count} items`);
});

// Filter changed event
document.addEventListener('filters-changed', (e) => {
    console.log(`Active filters: ${e.detail.activeCount}`);
});

// Tab switched event
document.addEventListener('tab-switched', (e) => {
    console.log(`Now on: ${e.detail.tabId}`);
});
```

## DOM Interactions

### Key Elements

```javascript
// Main containers
document.getElementById('cards-container');
document.getElementById('detail-panel');
document.getElementById('tab-governance-dashboard');

// Filter elements
document.getElementById('search-input');
document.getElementById('filter-area-wrapper');
document.getElementById('filter-maturity-wrapper');
document.getElementById('filter-owner-wrapper');

// Stats bar
document.getElementById('stat-total');
document.getElementById('stat-missing-ux');
document.getElementById('stat-missing-bi');
```

### CSS Classes

```javascript
// Card states
'.product-card'
'.product-card-compact'
'.smoke-detector-badge'

// Tab states
'.tab-btn.active'
'.tab-content.active'

// Filter states
'.filter-pill'
'.multiselect-header.open'

// Panel states
'.detail-panel.visible'
```

## Related Documentation

- [Data Manager API](data-manager.md)
- [Apps Script API](apps-script.md)
- [Module Structure](../architecture/module-structure.md)

