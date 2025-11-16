# CSS Architecture Documentation

**File:** `src/css/dashboard-style.css`  
**Total Lines:** 7,726 lines  
**Last Updated:** November 16, 2025 (v2.0.0)  
**Architecture:** Monolithic (single file)

---

## Overview

The dashboard uses a single, comprehensive CSS file with a Mercury Light Theme design system. The architecture follows a liquid glass aesthetic with glassmorphism effects, smooth animations, and responsive design.

---

## File Structure

### Section Breakdown (26 Major Sections)

| Line Range | Section | Description | ~Lines |
|------------|---------|-------------|--------|
| 1-30 | **Variables** | CSS custom properties, colors, glass effects | 30 |
| 31-71 | **Base** | Reset, body, typography, scrollbar | 40 |
| 72-1361 | **New Features** | Recent feature additions, components | 1,290 |
| 1362-2129 | **Executive View** | Executive dashboard styles | 768 |
| 2130-2276 | **Content Header** | Inline metrics header | 147 |
| 2277-2620 | **Old Stats Bar** | Hidden legacy styles | 344 |
| 2621-2905 | **Scannable Cards** | Card redesign v6.2.6 | 285 |
| 2906-2928 | **Modal Overlay** | Full-screen overlay | 23 |
| 2929-3572 | **Detail Panel** | Modal, tabs, metrics | 644 |
| 3573-3688 | **Insights/Analytics** | Consolidated tab | 116 |
| 3689-3810 | **Drill-Down Filters** | Filter pill styles | 122 |
| 3811-4314 | **Planning View** | Planning dashboard | 504 |
| 4315-4407 | **Drill-Down KPIs** | KPI card styles | 93 |
| 4408-4571 | **Filter Pills** | Filter components | 164 |
| 4572-4909 | **Compact Cards** | Product card styles | 338 |
| 4910-5136 | **Journey Navigation** | Horizontal nav bar | 227 |
| 5137-5239 | **Journey Responsive** | Mobile/tablet styles | 103 |
| 5240-5425 | **Card Container** | Active stage cards | 186 |
| 5426-5586 | **Collapsible Details** | Detail sections | 161 |
| 5587-5766 | **Smoke Detectors** | Issue detection UI | 180 |
| 5767-6044 | **Smoke Modal** | Detector modal | 278 |
| 6045-6340 | **Governance (1)** | Dashboard section 1 | 296 |
| 6341-6418 | **Governance (2)** | Dashboard section 2 | 78 |
| 6419-7193 | **AI Insights** | Structured insights | 775 |
| 7194-7278 | **Governance Badge** | Filter badge | 85 |
| 7279-7332 | **Insights Filters** | Tab filter layout | 54 |
| 7333-7578 | **Contextual Alerts** | Alert system | 246 |
| 7579-7726 | **Screen Optimization** | Progressive optimization | 148 |

---

## Design System

### Color Palette (Mercury Light Theme)

```css
:root {
    /* Primary Colors */
    --primary: #667eea;
    --secondary: #764ba2;
    --mercury-accent: #6366f1;
    --mercury-glow: #818cf8;
    --mercury-silver: #e8eaf0;
    
    /* Glass Effect */
    --glass-bg: rgba(255, 255, 255, 0.45);
    --glass-border: rgba(255, 255, 255, 0.65);
    --glass-shadow: rgba(99, 102, 241, 0.08);
    --glass-hover: rgba(255, 255, 255, 0.65);
    
    /* Status Colors */
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    
    /* Text Colors */
    --text-primary: #1e293b;
    --text-secondary: #475569;
    --text-tertiary: #64748b;
    --text-muted: #94a3b8;
    
    /* Blur Amounts */
    --blur-amount: 20px;
    --blur-light: 12px;
}
```

### Glassmorphism System

**Core Effect:**
- Semi-transparent backgrounds (`rgba(255, 255, 255, 0.45-0.65)`)
- Backdrop blur (`blur(12px-20px)`)
- Subtle borders (`rgba(255, 255, 255, 0.65)`)
- Layered shadows (`rgba(99, 102, 241, 0.08-0.25)`)

**Application:**
- Cards, modals, navigation bars
- Buttons, dropdowns, inputs
- Headers, tabs, containers

### Typography

**Font Family:** 'Inter', sans-serif

**Hierarchy:**
- H1: Dashboard title
- H2: Section headers
- H3: Card titles
- Body: 16px base
- Small: 14px (labels, metadata)

---

## Key Components

### 1. Journey Navigation (Lines 4910-5239)

**New in v2.0.0 - Horizontal navigation bar**

**Structure:**
```css
.journey-navigation          /* Container */
.journey-stages-wrapper      /* Stages container */
.journey-stage-btn           /* Individual stage button */
  .journey-stage-btn.active  /* Active state */
.journey-stage-name          /* Stage label */
.journey-stage-count         /* Solution count badge */
```

**Features:**
- Glassmorphism design
- Active/inactive states
- Responsive (desktop, tablet, mobile)
- Smooth transitions
- Hover effects

**Responsive Behavior:**
- Desktop: All stages visible
- Tablet: Compact layout
- Mobile: Horizontal scroll with snap points

### 2. Solution Cards (Lines 4572-4909, 2621-2905)

**Two versions:**
- **Compact Cards** (v6.2.6+) - Current, dense layout
- **Scannable Cards** - Legacy, larger layout

**Structure:**
```css
.product-card                /* Card container */
.card-header-compact         /* Header with badges */
.card-pnc-area-badge         /* P&C Area badge (PJC/PSE) */
.card-title-compact          /* Solution title */
.card-problem                /* Problem statement */
.card-metrics-horizontal     /* Horizontal metric layout */
.metric-badge                /* Individual metrics */
```

**Features:**
- Glass effect background
- Hover animations
- Click interactions
- Responsive sizing

### 3. Modal/Detail Panel (Lines 2906-3572)

**Structure:**
```css
.detail-panel-overlay        /* Full-screen overlay */
.detail-panel                /* Modal container (90%, 1200px max, 92vh) */
.detail-header               /* Modal header (gradient) */
.detail-close                /* Close button */
.detail-title                /* Solution name */
.detail-tabs                 /* Tab navigation */
.detail-tab                  /* Individual tab */
.detail-tab-content          /* Tab content area */
.metrics-grid                /* 2-column grid */
.metric-card                 /* Metric visualization */
.chart-container             /* Chart wrapper (300px height) */
```

**Features:**
- Production-stable dimensions (v2.0.0)
- Smooth slide-up animation
- Scrollable content
- Background scroll lock
- Responsive design

### 4. Filters (Lines 4408-4571, 3689-3810, 7279-7332)

**Three filter systems:**
- **Filter Pills** - Tag-style filters
- **Drill-Down Filters** - Hierarchical filtering
- **Insights Tab Filters** - Consistent layout

**Components:**
```css
.filters-container           /* Main container */
.custom-multiselect          /* Dropdown filters */
.filter-pill                 /* Tag-style filter */
.filter-checkbox             /* Hidden checkbox filters */
```

**Features:**
- Unified styling across tabs
- Glassmorphism design
- Smooth transitions
- Responsive layout

### 5. Smoke Detectors (Lines 5587-6044)

**Issue detection system**

**Components:**
```css
.smoke-detector-indicator    /* Visual indicator */
.smoke-detector-badge        /* Issue count badge */
.smoke-detector-modal        /* Full modal view */
.smoke-category              /* Category sections */
.smoke-item                  /* Individual issue */
```

**Features:**
- Visual alerts
- Priority indicators
- Modal drill-down
- Category organization

---

## Responsive Design

### Breakpoints

```css
/* Desktop */
@media (min-width: 1025px) { /* Default styles */ }

/* Tablet */
@media (max-width: 1024px) { /* Compact layouts */ }

/* Mobile */
@media (max-width: 768px) { /* Single column, stacked */ }

/* Small Mobile */
@media (max-width: 480px) { /* Ultra-compact */ }
```

### Responsive Strategies

1. **Desktop (>1024px):**
   - Full multi-column layouts
   - All navigation visible
   - Larger touch targets
   - Hover states active

2. **Tablet (768-1024px):**
   - 2-column grids
   - Compact spacing
   - Adjusted font sizes
   - Simplified navigation

3. **Mobile (<768px):**
   - Single-column layouts
   - Horizontal scrolling for navigation
   - Larger touch targets
   - Simplified interactions
   - Full-width modals

---

## Animation System

### Transitions

**Standard:** `0.25s cubic-bezier(0.4, 0, 0.2, 1)`

**Usage:**
- Button states
- Card hovers
- Filter interactions
- Tab switches

### Keyframe Animations

**Common Animations:**
```css
@keyframes fadeIn           /* Fade in appearance */
@keyframes fadeInSlideUp    /* Fade + slide motion */
@keyframes modalSlideUp     /* Modal entrance */
@keyframes shimmer          /* Subtle shine effect */
@keyframes pulse            /* Attention grabber */
```

### Performance

- GPU-accelerated (`transform`, `opacity`)
- `will-change` for complex animations
- `requestAnimationFrame` in JavaScript
- Avoid layout-triggering properties

---

## Maintenance Guidelines

### Adding New Styles

1. **Find the appropriate section** (use grep for section markers)
2. **Follow existing patterns** (glassmorphism, transitions)
3. **Use CSS variables** (colors, spacing)
4. **Test responsiveness** (all breakpoints)
5. **Document significant additions**

### Modifying Existing Styles

1. **Search for the selector** (`grep` is your friend)
2. **Understand dependencies** (check cascading)
3. **Test thoroughly** (all affected pages)
4. **Verify no regressions** (visual inspection)

### Performance Considerations

1. **Minimize selector complexity** (keep specific)
2. **Avoid deep nesting** (CSS nesting)
3. **Use efficient properties** (transform over left/top)
4. **Optimize animations** (GPU-accelerated)
5. **Minimize reflows** (batch DOM changes)

---

## Common Patterns

### Glassmorphism Card

```css
.your-element {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-amount)) saturate(180%);
    -webkit-backdrop-filter: blur(var(--blur-amount)) saturate(180%);
    border: 1px solid var(--glass-border);
    border-radius: 1rem;
    box-shadow: 0 4px 16px var(--glass-shadow);
}
```

### Hover Effect

```css
.your-element {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.your-element:hover {
    background: var(--glass-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}
```

### Responsive Grid

```css
.your-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

@media (max-width: 768px) {
    .your-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
```

---

## Future Improvements

### Recommended (Low Risk)

1. **Extract CSS Variables** - Separate theme file
2. **Document Component Catalog** - Visual style guide
3. **Add CSS Comments** - Inline documentation
4. **Remove Dead Code** - Unused legacy styles

### Planned (Medium Risk)

1. **Modular Architecture** - Split into logical files (see CSS_MODULARIZATION_ROADMAP.md)
2. **Build Process** - Minification, concatenation
3. **Critical CSS** - Inline above-the-fold styles
4. **Lazy Loading** - Non-critical CSS async

### Advanced (High Risk)

1. **CSS-in-JS** - Component-scoped styles
2. **Tailwind/Utility** - Utility-first approach
3. **CSS Modules** - Scoped styling
4. **PostCSS Pipeline** - Advanced transformations

---

## Related Documentation

- **JS Modules:** `docs/architecture/JS_MODULES.md`
- **Modularization Roadmap:** `docs/architecture/CSS_MODULARIZATION_ROADMAP.md`
- **Performance Baseline:** `docs/architecture/PERFORMANCE_BASELINE.md`
- **Design System:** `docs/design-system/README.md`

---

## Version History

- **v2.0.0** (Nov 16, 2025) - Horizontal journey navigation, modal fixes
- **v1.x** - Vertical journey sections, larger cards
- **v6.2.6** - Scannable card redesign
- **Earlier** - Base architecture, glassmorphism system

---

**Maintained by:** P&C Development Team  
**Last Review:** November 16, 2025  
**Next Review:** When planning CSS refactoring

