# Design Patterns & Recipes

**Version:** 1.0.0  
**Last Updated:** November 15, 2025

---

## 📖 Overview

This document provides **reusable patterns** and **UI recipes** for common use cases in the P&C Portfolio Dashboard. These patterns combine components, layout, and behaviors to solve specific design problems.

---

## 🎴 Card Patterns

### Product Card with AI Summary

**Use Case:** Displaying solution information in grid layout

**Pattern:**

```html
<div class="solution-card" onclick="showDetailPanel('product-id')">
    <div class="card-header">
        <h3 class="card-title">M5+ Onboarding</h3>
        <p class="card-ai-summary">
            Streamlined employee onboarding with automated workflows, 
            reducing time-to-productivity by 40%.
        </p>
    </div>
    
    <div class="card-metadata">
        <span class="metadata-item">👤 Owner Name</span>
        <span class="metadata-item">🎯 PATO</span>
        <span class="metadata-item">⭐ Mature</span>
    </div>
    
    <div class="card-badges">
        <span class="badge badge-success">UX: 95%</span>
        <span class="badge badge-success">BI: 88%</span>
        <span class="smoke-detector-badge">🔥 0</span>
    </div>
</div>
```

**Layout:**
- Title (semibold, 18px)
- AI summary (2-3 lines, 14px)
- Metadata row (owner, area, stage)
- Metrics badges (UX, BI, smoke detectors)

---

### Stat Card with Icon

**Use Case:** Displaying key metrics on dashboard

**Pattern:**

```html
<div class="stat-card stat-card-success">
    <div class="stat-card-icon" style="background: rgba(16, 185, 129, 0.15);">
        ✅
    </div>
    <div class="stat-card-content">
        <div class="stat-card-value">52</div>
        <div class="stat-card-label">Solutions On Target</div>
        <div class="stat-card-sublabel">UX & BI above 85%</div>
    </div>
</div>
```

**Variants:**
- Success (green accent)
- Warning (orange accent)
- Danger (red accent)
- Neutral (gray accent)

---

### Collapsible Section Card

**Use Case:** Expandable content sections in governance dashboard

**Pattern:**

```html
<div class="collapsible-section">
    <div class="section-header" onclick="toggleSection(this)">
        <h3 class="section-title">
            <span class="section-icon">📊</span>
            Portfolio Distribution
        </h3>
        <span class="collapse-icon">▼</span>
    </div>
    
    <div class="section-content">
        <!-- Charts, tables, or content -->
    </div>
</div>
```

**Behavior:**
- Click header to expand/collapse
- Icon rotates on toggle
- Smooth height transition
- Preserve state on tab switch

---

## 📊 Dashboard Layouts

### Three-Column Metric Grid

**Use Case:** Executive dashboard metrics

**Pattern:**

```html
<div class="metrics-grid">
    <div class="metric-card">
        <div class="metric-value">84</div>
        <div class="metric-label">Total Solutions</div>
    </div>
    
    <div class="metric-card metric-card-success">
        <div class="metric-value">52</div>
        <div class="metric-label">On Target</div>
    </div>
    
    <div class="metric-card metric-card-warning">
        <div class="metric-value">32</div>
        <div class="metric-label">Below Target</div>
    </div>
</div>
```

```css
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}
```

---

### Two-Column Layout (List + Detail)

**Use Case:** Browse solutions with detail panel

**Pattern:**

```html
<div class="app-layout">
    <main class="main-content">
        <div class="cards-grid">
            <!-- Solution cards -->
        </div>
    </main>
    
    <aside class="detail-panel-overlay" id="detail-overlay">
        <div class="detail-panel">
            <!-- Detail content -->
        </div>
    </aside>
</div>
```

**Behavior:**
- Main content: Scrollable card grid
- Detail panel: Slides in from right
- Overlay: Darkens background
- Click outside or ESC to close

---

### Dashboard with Tabs

**Use Case:** Multi-view dashboard (Explore, Insights)

**Pattern:**

```html
<div class="dashboard-container">
    <header class="dashboard-header">
        <div class="tab-navigation">
            <button class="tab-btn active" data-tab="explore">
                🔍 Explore
            </button>
            <button class="tab-btn" data-tab="insights">
                💡 Insights
            </button>
        </div>
    </header>
    
    <main class="dashboard-content">
        <div class="tab-content active" id="tab-explore">
            <!-- Explore content -->
        </div>
        
        <div class="tab-content" id="tab-insights">
            <!-- Insights content -->
        </div>
    </main>
</div>
```

**Behavior:**
- Only one tab active at a time
- Smooth fade transition between tabs
- Tab state persists on page reload
- URL updates with tab name

---

## 🔍 Filter Patterns

### Multi-Select Filter Bar

**Use Case:** Advanced filtering with multiple criteria

**Pattern:**

```html
<div class="filters-section">
    <!-- Row 1: Search -->
    <div class="filters-row-search">
        <input type="text" 
               id="search-input" 
               placeholder="Search solutions..."
               oninput="applyFilters()">
    </div>
    
    <!-- Row 2: Dropdowns -->
    <div class="filters-row-main">
        <div class="custom-multiselect">
            <div class="multiselect-header">P&C Area</div>
            <div class="multiselect-dropdown">
                <!-- Options -->
            </div>
        </div>
        
        <div class="custom-multiselect">
            <div class="multiselect-header">Maturity Stage</div>
            <div class="multiselect-dropdown">
                <!-- Options -->
            </div>
        </div>
    </div>
    
    <!-- Row 3: Actions -->
    <div class="filters-row-actions">
        <button class="clear-filters" onclick="clearFilters()">
            Clear All
        </button>
    </div>
</div>
```

**Behavior:**
- Real-time filtering on input
- Multi-select dropdowns
- Active filter pills display
- Clear all resets to defaults

---

### Active Filter Pills

**Use Case:** Show currently applied filters

**Pattern:**

```html
<div class="filter-pills-container">
    <div class="filter-pills-label">Active Filters:</div>
    
    <div class="filter-pills">
        <span class="filter-pill">
            <span>P&C Area: PATO</span>
            <button class="filter-pill-remove" 
                    onclick="removeFilter('area', 'PATO')">
                ✕
            </button>
        </span>
        
        <span class="filter-pill">
            <span>Maturity: Mature</span>
            <button class="filter-pill-remove" 
                    onclick="removeFilter('maturity', 'Mature')">
                ✕
            </button>
        </span>
    </div>
    
    <button class="clear-all-pills" onclick="clearFilters()">
        Clear All
    </button>
</div>
```

**Behavior:**
- Pills appear as filters are applied
- Click X to remove individual filter
- Clear All removes all filters
- Container hides when no filters active

---

## 📈 Data Visualization Patterns

### Metric Gauge

**Use Case:** Show percentage completion (e.g., UX/BI coverage)

**Pattern:**

```html
<div class="gauge-container">
    <canvas id="ux-gauge"></canvas>
    <div class="gauge-label">UX Metrics Coverage</div>
    <div class="gauge-value">78%</div>
</div>
```

```javascript
// Chart.js configuration
const gaugeConfig = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [78, 22], // Value, Remainder
            backgroundColor: ['#10b981', 'rgba(0,0,0,0.05)'],
            borderWidth: 0
        }]
    },
    options: {
        cutout: '75%',
        rotation: -90,
        circumference: 180
    }
};
```

---

### Column Chart with Labels

**Use Case:** Portfolio distribution by category

**Pattern:**

```html
<div class="chart-container">
    <h3 class="chart-title">Solutions by Journey Stage</h3>
    <canvas id="journey-chart"></canvas>
</div>
```

```javascript
const columnConfig = {
    type: 'bar',
    data: {
        labels: ['Hire', 'Onboard', 'Develop', 'Perform', 'Reward'],
        datasets: [{
            data: [12, 18, 24, 20, 10],
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderRadius: 8
        }]
    },
    options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false
    }
};
```

---

## 🔔 Notification Patterns

### Inline Alert

**Use Case:** Contextual feedback within a section

**Pattern:**

```html
<div class="alert alert-warning">
    <div class="alert-icon">⚠️</div>
    <div class="alert-content">
        <div class="alert-title">Action Required</div>
        <div class="alert-message">
            3 solutions have not updated metrics this month.
        </div>
    </div>
</div>
```

**Variants:**
- Success (green) - Positive feedback
- Warning (orange) - Needs attention
- Danger (red) - Critical issue
- Info (blue) - Informational

---

### Toast Notification (Future)

**Use Case:** Temporary feedback for user actions

**Pattern:**

```html
<div class="toast toast-success">
    <span class="toast-icon">✅</span>
    <span class="toast-message">Data refreshed successfully</span>
    <button class="toast-close">✕</button>
</div>
```

**Behavior:**
- Appear in top-right corner
- Auto-dismiss after 5 seconds
- Stack multiple toasts
- Swipe to dismiss on mobile

---

## 🪟 Modal Patterns

### Confirmation Dialog

**Use Case:** Confirm destructive actions

**Pattern:**

```html
<div class="modal-overlay">
    <div class="modal modal-sm">
        <h3 class="modal-title">Confirm Action</h3>
        <p class="modal-message">
            Are you sure you want to clear all filters? 
            This action cannot be undone.
        </p>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal()">
                Cancel
            </button>
            <button class="btn btn-primary" onclick="confirmAction()">
                Confirm
            </button>
        </div>
    </div>
</div>
```

---

### Smoke Detector Details Modal

**Use Case:** Show solutions with triggered smoke detectors

**Pattern:**

```html
<div class="modal-overlay">
    <div class="modal">
        <div class="modal-header">
            <h3 class="modal-title">
                🔥 Solutions with Smoke Detectors Triggered (12)
            </h3>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        
        <div class="modal-body">
            <div class="solution-list">
                <div class="solution-list-item">
                    <div class="solution-name">M5+ Onboarding</div>
                    <div class="solution-issues">
                        <span class="issue-badge">Missing UX Metric</span>
                        <span class="issue-badge">Data not updated</span>
                    </div>
                </div>
                <!-- More items -->
            </div>
        </div>
    </div>
</div>
```

---

## 📱 Responsive Patterns

### Mobile-First Card Grid

**Pattern:**

```css
/* Mobile: 1 column */
.cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
    .cards-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Large Desktop: 4 columns */
@media (min-width: 1440px) {
    .cards-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

---

### Collapsible Mobile Navigation

**Pattern:**

```html
<!-- Desktop: Horizontal tabs -->
<div class="tab-navigation desktop">
    <button class="tab-btn">🔍 Explore</button>
    <button class="tab-btn">💡 Insights</button>
</div>

<!-- Mobile: Dropdown selector -->
<div class="tab-navigation mobile">
    <select class="tab-select" onchange="switchTab(this.value)">
        <option value="explore">🔍 Explore</option>
        <option value="insights">💡 Insights</option>
    </select>
</div>
```

```css
.tab-navigation.mobile {
    display: block;
}

.tab-navigation.desktop {
    display: none;
}

@media (min-width: 768px) {
    .tab-navigation.mobile {
        display: none;
    }
    
    .tab-navigation.desktop {
        display: flex;
    }
}
```

---

## 🎨 Glass Effect Patterns

### Layered Glass Cards

**Use Case:** Create depth with overlapping glass elements

**Pattern:**

```css
/* Background layer */
.glass-background {
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(20px);
}

/* Mid layer (cards) */
.glass-card {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
}

/* Top layer (modals) */
.glass-modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
}
```

**Hierarchy:**
- Lower opacity = Background
- Medium opacity = Interactive elements
- Higher opacity = Focus elements

---

### Glass with Gradient Border

**Pattern:**

```css
.glass-card-premium {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    position: relative;
    border-radius: 16px;
    padding: 1.5rem;
}

.glass-card-premium::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}
```

**Creates:** Gradient border around glass card

---

## 🔄 Loading Patterns

### Skeleton Screen

**Use Case:** Show placeholder while data loads

**Pattern:**

```html
<div class="card skeleton-container">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text" style="width: 80%;"></div>
    
    <div class="skeleton-row">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-badge"></div>
    </div>
</div>
```

**Behavior:**
- Shows while fetching data
- Matches actual content layout
- Shimmer animation
- Smooth transition to real content

---

### Progressive Loading

**Pattern:**

```javascript
// Load critical content first
async function loadDashboard() {
    // 1. Show skeleton
    showSkeleton();
    
    // 2. Load stats (fast)
    const stats = await fetchStats();
    renderStats(stats);
    
    // 3. Load cards (medium)
    const cards = await fetchCards();
    renderCards(cards);
    
    // 4. Load charts (slow)
    const charts = await fetchCharts();
    renderCharts(charts);
    
    // 5. Hide skeleton
    hideSkeleton();
}
```

---

## ♿ Accessibility Patterns

### Skip Navigation

**Pattern:**

```html
<a href="#main-content" class="skip-link">
    Skip to main content
</a>

<nav aria-label="Main navigation">
    <!-- Navigation -->
</nav>

<main id="main-content" tabindex="-1">
    <!-- Main content -->
</main>
```

```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 0.5rem 1rem;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

---

### ARIA Live Regions

**Pattern:**

```html
<!-- Announce filter results -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
    Showing 12 of 84 solutions
</div>

<!-- Screen reader only text -->
<span class="sr-only">
    Solution name: M5+ Onboarding. 
    Status: On target. 
    0 smoke detectors triggered.
</span>
```

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

---

## 🎯 Best Practices

### DO

✅ Use established patterns before creating new ones  
✅ Combine components consistently  
✅ Maintain visual hierarchy  
✅ Test responsive behavior  
✅ Ensure keyboard navigation works  
✅ Provide loading states  

### DON'T

❌ Create one-off custom patterns  
❌ Mix different visual styles  
❌ Ignore mobile viewport  
❌ Skip accessibility features  
❌ Forget error states  

---

## 📚 Related Documentation

- [Components](./components.md) - Individual components
- [Animation](./animation.md) - Transition patterns
- [Typography](./typography.md) - Text hierarchy

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

