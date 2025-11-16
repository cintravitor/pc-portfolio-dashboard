# Component Library

**Version:** 1.0.0  
**Last Updated:** November 15, 2025

---

## 📦 Overview

This document catalogs all reusable UI components in the P&C Portfolio Dashboard with specifications, variants, states, and implementation examples.

---

## 🎨 Design Principles

All components follow these principles:

1. **Glass Effect First** - Frosted glass aesthetic with backdrop blur
2. **Hover Feedback** - Subtle lift and shadow on hover
3. **Smooth Transitions** - 0.2-0.3s ease transitions
4. **Accessibility** - WCAG AA compliant
5. **Responsive** - Mobile-first approach

---

## 🔘 Buttons

### Primary Button

**Appearance:** Gradient background (primary → secondary), white text

```css
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}
```

**Use Cases:** Primary actions, "Refresh Data", "Apply Filters"

---

### Secondary Button (Ghost)

```css
.btn-secondary {
    background: transparent;
    color: var(--primary);
    border: 1.5px solid var(--primary);
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: var(--primary);
    color: white;
}
```

**Use Cases:** Secondary actions, "Cancel", "View Details"

---

### Button Sizes

```css
/* Small */
.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
}

/* Medium (default) */
.btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
}

/* Large */
.btn-lg {
    padding: 1rem 2rem;
    font-size: 1rem;
}
```

---

## 🎴 Cards

### Glass Card (Standard)

**Appearance:** Frosted glass with backdrop blur, subtle border, soft shadow

```css
.glass-card {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.06);
    transition: all 0.3s ease;
}

.glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.12);
}
```

**Use Cases:** Product cards, metric cards, content containers

---

### Solution Card

**Anatomy:**
- Header: Title + AI summary
- Body: Metadata (owner, area, maturity)
- Footer: Metrics badges, smoke detector count

```css
.solution-card {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.solution-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.12);
    border-color: var(--mercury-accent);
}

.card-header {
    margin-bottom: 1rem;
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.card-ai-summary {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
}

.card-badges {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}
```

---

### Stat Card

**Appearance:** Metric display with icon, large value, label

```css
.stat-card {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.stat-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.stat-card-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
}

.stat-card-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
}
```

**Variants:**
- `.stat-card.success` - Green border
- `.stat-card.warning` - Orange border
- `.stat-card.danger` - Red border

---

## 🏷️ Badges

### Status Badge

```css
.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    gap: 0.35rem;
}

.badge-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.badge-success {
    background: var(--success);
    color: white;
}

.badge-warning {
    background: var(--warning);
    color: white;
}

.badge-danger {
    background: var(--danger);
    color: white;
}

.badge-neutral {
    background: var(--mercury-silver);
    color: var(--text-primary);
}
```

---

### Count Badge (Smoke Detector)

```css
.smoke-detector-badge {
    background: var(--danger);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}
```

**Example:** "🔥 3" for 3 triggered smoke detectors

---

## 📝 Forms

### Text Input

```css
.input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid rgba(226, 232, 240, 0.6);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    font-size: 0.875rem;
    color: var(--text-primary);
    transition: all 0.2s ease;
}

.input:focus {
    outline: none;
    border-color: var(--mercury-accent);
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input::placeholder {
    color: var(--text-muted);
}
```

---

### Search Input

```css
.search-box {
    position: relative;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1.5px solid rgba(226, 232, 240, 0.6);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
}

.search-box::before {
    content: '🔍';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
}
```

---

### Multi-Select Dropdown

```css
.multiselect-header {
    padding: 0.75rem 1rem;
    border: 1.5px solid rgba(226, 232, 240, 0.6);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
}

.multiselect-header:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: var(--mercury-accent);
}

.multiselect-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
}

.multiselect-option {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.15s ease;
}

.multiselect-option:hover {
    background: rgba(99, 102, 241, 0.08);
}

.multiselect-option.selected {
    background: rgba(99, 102, 241, 0.12);
    font-weight: 600;
}
```

---

## 📊 Tables

### Standard Table

```css
.table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    overflow: hidden;
}

.table thead {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table td {
    padding: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.table tbody tr {
    transition: background-color 0.2s ease;
}

.table tbody tr:hover {
    background: rgba(99, 102, 241, 0.05);
}
```

---

## 🪟 Modals & Panels

### Solution Detail Modal (Full-Screen Immersive)

**Behavior:** Full-screen overlay modal (100vw × 100vh) that opens when user clicks a solution card. Provides immersive view of solution metrics with Chart.js visualizations.

**Features:**
- Full-screen takeover (covers header, filters, all content)
- History API integration (URL hash: `#/solution/{slug}`)
- Browser back button closes modal
- ESC key closes modal
- Hardware-accelerated animations (<100ms)
- Focus trap for accessibility
- Lazy-loaded Chart.js graphs

**CSS:**
```css
.detail-panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(24px);
    z-index: 1000;
    animation: modalFadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
}

.detail-panel {
    width: 100vw;
    height: 100vh;
    background: var(--glass-bg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modalFadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
}

@keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

**Accessibility:**
- `role="dialog"` on overlay
- `aria-modal="true"`
- Focus trapped within modal
- ESC key closes (with screen reader announcement)
- Focus restored on close
- Tab navigation with ARIA roles and states

---

### Modal (Center)

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

.modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}
```

---

## 📑 Tabs

### Tab Navigation

```css
.tab-navigation {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 0 0 0;
    border-top: 1px solid rgba(226, 232, 240, 0.4);
}

.tab-btn {
    padding: 0.875rem 1.75rem;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px);
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    border-radius: 0.75rem 0.75rem 0 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: none;
}

.tab-btn:hover {
    background: rgba(255, 255, 255, 0.5);
    color: var(--text-primary);
}

.tab-btn.active {
    background: rgba(255, 255, 255, 0.65);
    color: var(--mercury-accent);
    border-color: var(--mercury-accent);
    border-bottom-color: transparent;
}
```

---

## 🎯 Filter Pills

### Active Filter Pill

```css
.filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-primary);
}

.filter-pill-remove {
    cursor: pointer;
    color: var(--text-muted);
    transition: color 0.2s ease;
}

.filter-pill-remove:hover {
    color: var(--danger);
}
```

---

## 📈 Charts

### Chart Container

```css
.chart-container {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    padding: 1.5rem;
}

.chart-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.chart-canvas {
    position: relative;
    height: 300px;
}
```

---

## 🔔 Alerts & Notifications

### Alert Banner

```css
.alert {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.alert-success {
    background: rgba(16, 185, 129, 0.1);
    border-left: 3px solid var(--success);
}

.alert-warning {
    background: rgba(245, 158, 11, 0.1);
    border-left: 3px solid var(--warning);
}

.alert-danger {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid var(--danger);
}

.alert-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
}

.alert-content {
    flex: 1;
}

.alert-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.alert-message {
    font-size: 0.875rem;
    color: var(--text-secondary);
}
```

---

## 🔄 Loading States

### Spinner

```css
.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

### Skeleton Loader

```css
.skeleton {
    background: linear-gradient(
        90deg,
        rgba(226, 232, 240, 0.4) 0%,
        rgba(226, 232, 240, 0.8) 50%,
        rgba(226, 232, 240, 0.4) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.skeleton-text {
    height: 1rem;
    margin-bottom: 0.5rem;
}

.skeleton-title {
    height: 1.5rem;
    width: 60%;
}
```

---

## 🧩 Progress Indicators

### Progress Bar

```css
.progress-bar {
    position: relative;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    height: 32px;
    overflow: hidden;
}

.progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 8px;
    transition: width 0.5s ease;
}

.progress-fill.success {
    background: var(--success);
}

.progress-fill.warning {
    background: var(--warning);
}

.progress-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 1;
}
```

---

## ♿ Accessibility Notes

### Focus States

All interactive components must have visible focus indicators:

```css
*:focus-visible {
    outline: 2px solid var(--mercury-accent);
    outline-offset: 2px;
}
```

### Keyboard Navigation

- Buttons: `Enter` and `Space` trigger action
- Dropdowns: Arrow keys navigate, `Enter` selects
- Modals: `Esc` closes modal
- Tabs: Arrow keys switch tabs

---

## 📱 Responsive Behavior

### Mobile Adaptations

```css
@media (max-width: 767px) {
    /* Full-width detail panel */
    .detail-panel {
        width: 100%;
    }
    
    /* Reduced card padding */
    .glass-card {
        padding: 1rem;
    }
    
    /* Stacked buttons */
    .button-group {
        flex-direction: column;
    }
    
    .button-group .btn {
        width: 100%;
    }
}
```

---

## 📚 Related Documentation

- [Patterns](./patterns.md) - Component usage patterns
- [Animation](./animation.md) - Transition details
- [Colors](./colors.md) - Color usage in components

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

