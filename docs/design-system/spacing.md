# Spacing System

**Version:** 1.0.0  
**Last Updated:** November 15, 2025

---

## 📐 Spacing Philosophy

The Mercury Light spacing system uses a **consistent 4px base unit** (0.25rem) to create harmonious, predictable layouts. This ensures visual rhythm and makes the interface feel cohesive.

**Core Principles:**
- 4px base unit (0.25rem)
- Powers of 2 for larger spacing
- Consistent gaps and padding
- Responsive adjustments for mobile
- Generous whitespace for clarity

---

## 📏 Spacing Scale

### Base Scale

All spacing values are multiples of the 4px base unit:

| Token | Value (rem) | Value (px) | Use Case |
|-------|-------------|------------|----------|
| `--spacing-1` | 0.25rem | 4px | Minimal spacing, tight elements |
| `--spacing-2` | 0.5rem | 8px | Small gaps, compact layouts |
| `--spacing-3` | 0.75rem | 12px | Standard small spacing |
| `--spacing-4` | 1rem | 16px | Base spacing unit |
| `--spacing-5` | 1.25rem | 20px | Medium spacing |
| `--spacing-6` | 1.5rem | 24px | Section spacing |
| `--spacing-8` | 2rem | 32px | Large section gaps |
| `--spacing-10` | 2.5rem | 40px | Major section separation |
| `--spacing-12` | 3rem | 48px | Extra large spacing |
| `--spacing-16` | 4rem | 64px | Page-level spacing |

**Visual Scale:**
```
1  ▪
2  ▪▪
3  ▪▪▪
4  ▪▪▪▪
5  ▪▪▪▪▪
6  ▪▪▪▪▪▪
8  ▪▪▪▪▪▪▪▪
10 ▪▪▪▪▪▪▪▪▪▪
12 ▪▪▪▪▪▪▪▪▪▪▪▪
16 ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪
```

---

## 🎯 Common Spacing Patterns

### Padding Patterns

#### Card Padding

```css
.card {
    padding: 1.5rem;  /* 24px - standard card padding */
}

.card-compact {
    padding: 1rem;    /* 16px - compact cards */
}

.card-large {
    padding: 2rem;    /* 32px - spacious cards */
}
```

**Usage:**
- Standard cards: 24px (1.5rem)
- Compact cards: 16px (1rem)
- Large feature cards: 32px (2rem)

---

#### Button Padding

```css
.btn {
    padding: 0.75rem 1.5rem;  /* 12px vertical, 24px horizontal */
}

.btn-small {
    padding: 0.5rem 1rem;     /* 8px vertical, 16px horizontal */
}

.btn-large {
    padding: 1rem 2rem;       /* 16px vertical, 32px horizontal */
}
```

---

#### Input Padding

```css
input, select {
    padding: 0.75rem 1rem;    /* 12px vertical, 16px horizontal */
}
```

---

### Margin Patterns

#### Section Margins

```css
.section {
    margin-bottom: 2rem;       /* 32px between sections */
}

.subsection {
    margin-bottom: 1.5rem;     /* 24px between subsections */
}
```

---

#### Text Element Margins

```css
h1 {
    margin-bottom: 1rem;       /* 16px below h1 */
}

h2 {
    margin-bottom: 0.75rem;    /* 12px below h2 */
    margin-top: 2rem;          /* 32px above h2 (section separation) */
}

p {
    margin-bottom: 1rem;       /* 16px between paragraphs */
}
```

---

### Gap Patterns (Flexbox/Grid)

#### Grid Gaps

```css
.grid {
    display: grid;
    gap: 1.5rem;               /* 24px - standard grid gap */
}

.grid-tight {
    gap: 1rem;                 /* 16px - compact grid */
}

.grid-loose {
    gap: 2rem;                 /* 32px - spacious grid */
}
```

**Current Usage:**
- Card grids: 1.5rem (24px)
- Metric grids: 1.5rem (24px)
- Product chips: 1rem (16px)

---

#### Flex Gaps

```css
.flex-row {
    display: flex;
    gap: 1rem;                 /* 16px - standard flex gap */
}

.flex-tight {
    gap: 0.5rem;              /* 8px - tight spacing */
}

.flex-loose {
    gap: 1.5rem;              /* 24px - loose spacing */
}
```

---

## 📦 Layout Spacing

### Container Padding

```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;          /* 32px horizontal padding */
}

@media (max-width: 767px) {
    .container {
        padding: 0 1rem;      /* 16px on mobile */
    }
}
```

---

### Main Content Padding

```css
.main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;            /* 32px all around */
}

@media (max-width: 767px) {
    .main-content {
        padding: 1rem;        /* 16px on mobile */
    }
}
```

---

### Header Spacing

```css
.header-content {
    padding: 1.5rem 2rem;     /* 24px vertical, 32px horizontal */
}

.header-top {
    margin-bottom: 1.5rem;    /* 24px below header top */
}

.tab-navigation {
    padding: 1rem 0 0 0;      /* 16px top padding */
    margin-top: 1rem;         /* 16px top margin */
}
```

---

## 🎨 Component-Specific Spacing

### Glass Cards

```css
.glass-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 16px;
}
```

**Breakdown:**
- Internal padding: 24px (1.5rem)
- Bottom margin: 24px (1.5rem)
- Border radius: 16px (affects visual weight)

---

### Stat Cards

```css
.stat-card {
    padding: 1.5rem;
    gap: 1rem;                /* Between icon and content */
}
```

---

### Tables

```css
.table th,
.table td {
    padding: 1rem;            /* 16px cell padding */
}

.table {
    margin-bottom: 2rem;      /* 32px below table */
}
```

---

### Detail Panel

```css
.detail-panel {
    padding: 2rem;            /* 32px - spacious for reading */
}

.detail-section {
    margin-bottom: 2rem;      /* 32px between sections */
}

.detail-field {
    margin-bottom: 1rem;      /* 16px between fields */
}
```

---

### Filter Section

```css
.filters-row-main {
    gap: 0.5rem;              /* 8px - tight gap for filters */
}

.filters-row-actions {
    gap: 1rem;                /* 16px - standard gap for actions */
}
```

---

## 📱 Responsive Spacing

### Mobile Adjustments

On smaller screens, reduce spacing to optimize screen real estate:

```css
@media (max-width: 767px) {
    /* Reduce container padding */
    .container {
        padding: 0 1rem;      /* 16px instead of 32px */
    }
    
    /* Reduce card padding */
    .card {
        padding: 1rem;        /* 16px instead of 24px */
    }
    
    /* Reduce section gaps */
    .section {
        margin-bottom: 1.5rem; /* 24px instead of 32px */
    }
    
    /* Reduce grid gaps */
    .grid {
        gap: 1rem;            /* 16px instead of 24px */
    }
}
```

---

### Tablet Adjustments

```css
@media (min-width: 768px) and (max-width: 1023px) {
    .container {
        padding: 0 1.5rem;    /* 24px */
    }
    
    .card {
        padding: 1.25rem;     /* 20px */
    }
}
```

---

## 🔍 Border Radius Scale

Border radius creates visual weight and softness:

| Token | Value | Use Case |
|-------|-------|----------|
| `--radius-sm` | 8px | Small elements, badges |
| `--radius-md` | 12px | Standard cards, inputs |
| `--radius-lg` | 16px | Large cards, modals |
| `--radius-xl` | 20px | Feature cards |
| `--radius-full` | 9999px | Pills, circular elements |

**Usage:**
```css
.badge {
    border-radius: 8px;       /* Small radius */
}

.card {
    border-radius: 16px;      /* Large radius */
}

.pill {
    border-radius: 9999px;    /* Fully rounded */
}
```

---

## 🎯 Spacing Decision Tree

**Choosing the Right Spacing:**

```
Need spacing?
├─ Between elements in a row/column?
│  └─ Use gap: 0.5rem to 1.5rem
│
├─ Inside an element?
│  └─ Use padding: 1rem to 2rem
│
├─ Between sections?
│  └─ Use margin-bottom: 1.5rem to 2rem
│
├─ Page-level spacing?
│  └─ Use margin or padding: 2rem to 4rem
│
└─ Tight/compact layout?
   └─ Use smaller values: 0.5rem to 1rem
```

---

## 📊 Spacing Hierarchy

Visual hierarchy through spacing:

```
┌─────────────────────────────────────┐
│  Page Content (4rem / 64px padding) │
│  ┌───────────────────────────────┐  │
│  │ Section (2rem / 32px margin)  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Card (1.5rem / 24px pad)│  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │ Element (1rem gap)│  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## ♿ Accessibility Considerations

### Touch Targets

**Minimum Size:** 44x44px (2.75rem)

```css
button, a, input {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1rem;  /* Ensures touch target */
}
```

---

### Visual Separation

Ensure sufficient spacing between interactive elements:

```css
.button-group {
    gap: 1rem;              /* 16px minimum between buttons */
}
```

---

## 🎯 Usage Guidelines

### ✅ DO

- Use spacing tokens instead of hardcoded values
- Maintain consistent spacing patterns
- Increase spacing on larger screens
- Use generous whitespace for clarity
- Follow the 4px base unit

### ❌ DON'T

- Use arbitrary spacing values (e.g., 13px, 27px)
- Mix pixel and rem units inconsistently
- Reduce spacing below minimum touch targets
- Over-crowd elements (leave breathing room)
- Ignore responsive spacing adjustments

---

## 🔧 Implementation Examples

### Grid Layout with Spacing

```css
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;              /* 24px between cards */
    padding: 2rem;            /* 32px container padding */
}
```

---

### Card with Internal Spacing

```css
.stat-card {
    padding: 1.5rem;          /* 24px internal padding */
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 1rem;                /* 16px between elements */
}

.stat-card + .stat-card {
    margin-top: 1.5rem;       /* 24px between cards */
}
```

---

### Form Layout

```css
.form-group {
    margin-bottom: 1.5rem;    /* 24px between form fields */
}

.form-label {
    margin-bottom: 0.5rem;    /* 8px below label */
}

.form-input {
    padding: 0.75rem 1rem;    /* 12px vertical, 16px horizontal */
}
```

---

## 📚 Related Documentation

- [Components](./components.md) - Component-specific spacing
- [Typography](./typography.md) - Text spacing and line heights
- [Patterns](./patterns.md) - Layout patterns with spacing

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

