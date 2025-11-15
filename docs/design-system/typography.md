# Typography System

**Version:** 1.0.0  
**Last Updated:** November 15, 2025

---

## 📝 Typography Philosophy

Typography in the Mercury Light design system prioritizes **clarity and readability** with a modern, professional aesthetic using the Inter font family.

**Core Principles:**
- Single font family (Inter) for consistency
- Clear hierarchy through size and weight
- Generous line-height for readability
- Mobile-friendly base sizes
- Accessible contrast ratios

---

## 🔤 Font Family

### Primary Typeface: Inter

```css
font-family: 'Inter', sans-serif;
```

**Why Inter?**
- ✅ Optimized for screen reading
- ✅ Excellent legibility at small sizes
- ✅ Variable font weights (300-700)
- ✅ Open source and free
- ✅ Wide language support

**CDN Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Loaded Weights:**
- 300 (Light) - Rarely used
- 400 (Regular) - Body text
- 500 (Medium) - Emphasized text
- 600 (Semibold) - Subheadings, buttons
- 700 (Bold) - Headlines, important values

---

## 📏 Type Scale

### Font Size Scale

Based on a modular scale with rem units (1rem = 16px base):

| Token | Size (rem) | Size (px) | Use Case |
|-------|-----------|-----------|----------|
| `--font-size-xs` | 0.75rem | 12px | Tiny labels, captions, metadata |
| `--font-size-sm` | 0.875rem | 14px | Small UI text, table cells, badges |
| `--font-size-base` | 1rem | 16px | Body text, paragraphs, descriptions |
| `--font-size-lg` | 1.125rem | 18px | Emphasized body text, large labels |
| `--font-size-xl` | 1.25rem | 20px | Small headings, section titles |
| `--font-size-2xl` | 1.5rem | 24px | Card titles, subsection headers |
| `--font-size-3xl` | 2rem | 32px | Page titles, important metrics |
| `--font-size-4xl` | 3rem | 48px | Hero numbers, executive metrics |

**Usage Example:**
```css
.section-title {
    font-size: var(--font-size-2xl);
}

.metric-value {
    font-size: var(--font-size-4xl);
}
```

---

## ⚖️ Font Weight Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `--font-weight-light` | 300 | Subtle, decorative text |
| `--font-weight-normal` | 400 | Body text, paragraphs |
| `--font-weight-medium` | 500 | Emphasized content |
| `--font-weight-semibold` | 600 | Subheadings, buttons, labels |
| `--font-weight-bold` | 700 | Headlines, important numbers |

**Common Patterns:**

```css
/* Body text */
p {
    font-weight: 400; /* normal */
}

/* Button text */
button {
    font-weight: 600; /* semibold */
}

/* Headlines */
h1, h2, h3 {
    font-weight: 700; /* bold */
}

/* Metric values */
.metric-value {
    font-weight: 700; /* bold */
}
```

---

## 📐 Line Height

| Token | Value | Use Case |
|-------|-------|----------|
| `--line-height-tight` | 1 | Metric values, compact numbers |
| `--line-height-snug` | 1.2 | Headlines, card titles |
| `--line-height-normal` | 1.5 | Body text, paragraphs |
| `--line-height-relaxed` | 1.75 | Long-form content |

**Readability Guidelines:**
- Headlines: 1.2 (tighter for visual impact)
- Body text: 1.5 (optimal for reading)
- Long paragraphs: 1.75 (extra breathing room)
- Metrics/numbers: 1 (compact display)

---

## 🎯 Typography Hierarchy

### Display Styles (Headlines)

#### H1 - Page Title

```css
h1, .h1 {
    font-size: 2rem;          /* 32px */
    font-weight: 700;         /* Bold */
    line-height: 1.2;
    color: var(--text-primary);
    margin-bottom: 1rem;
}
```

**Example:** "P&C Portfolio Dashboard"  
**Use Cases:** Page main heading, dashboard title

---

#### H2 - Section Title

```css
h2, .h2 {
    font-size: 1.5rem;        /* 24px */
    font-weight: 700;
    line-height: 1.2;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
}
```

**Example:** "Action Layer", "Smoke Detector Scorecard"  
**Use Cases:** Major section headings

---

#### H3 - Subsection Title

```css
h3, .h3 {
    font-size: 1.25rem;       /* 20px */
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}
```

**Example:** "UX Metrics Coverage", "Portfolio Distribution"  
**Use Cases:** Subsection headings, card titles

---

#### H4 - Component Title

```css
h4, .h4 {
    font-size: 1.125rem;      /* 18px */
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}
```

**Use Cases:** Component headers, detail panel sections

---

### Body Styles

#### Body Large

```css
.body-large {
    font-size: 1.125rem;      /* 18px */
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-primary);
}
```

**Use Cases:** Important descriptions, introductory text

---

#### Body Regular (Default)

```css
body, .body {
    font-size: 1rem;          /* 16px */
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-primary);
}
```

**Use Cases:** Standard body text, descriptions, paragraphs

---

#### Body Small

```css
.body-small {
    font-size: 0.875rem;      /* 14px */
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-secondary);
}
```

**Use Cases:** Supporting text, table content, secondary descriptions

---

### Utility Styles

#### Caption

```css
.caption {
    font-size: 0.75rem;       /* 12px */
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-muted);
}
```

**Use Cases:** Timestamps, metadata, fine print

---

#### Label

```css
.label {
    font-size: 0.875rem;      /* 14px */
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

**Use Cases:** Form labels, table headers, category tags

---

#### Overline

```css
.overline {
    font-size: 0.75rem;       /* 12px */
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}
```

**Use Cases:** Section labels, category headers

---

### Special Purpose Styles

#### Metric Value (Large Display)

```css
.metric-value {
    font-size: 3rem;          /* 48px */
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
}
```

**Example:** "84" (total solutions), "32%" (percentage)

---

#### Metric Value (Medium)

```css
.metric-value-md {
    font-size: 2rem;          /* 32px */
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
}
```

**Use Cases:** Card statistics, smaller metrics

---

#### Button Text

```css
.btn {
    font-size: 0.875rem;      /* 14px */
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.02em;
}
```

**Use Cases:** All button labels

---

#### Badge Text

```css
.badge {
    font-size: 0.875rem;      /* 14px */
    font-weight: 600;
    line-height: 1;
}
```

**Use Cases:** Status badges, count indicators

---

## 🎨 Text Colors

Typography colors should be selected based on hierarchy and importance:

| Color Token | Usage |
|-------------|--------|
| `var(--text-primary)` | Headlines, important content, body text |
| `var(--text-secondary)` | Supporting text, labels, descriptions |
| `var(--text-tertiary)` | Metadata, auxiliary information |
| `var(--text-muted)` | Placeholder text, disabled states |

**Example:**
```css
.card-title {
    color: var(--text-primary);
}

.card-description {
    color: var(--text-secondary);
}

.card-timestamp {
    color: var(--text-muted);
}
```

---

## 📱 Responsive Typography

### Mobile Adjustments

On smaller screens, reduce font sizes slightly for better fit:

```css
@media (max-width: 767px) {
    h1 {
        font-size: 1.75rem;  /* 28px instead of 32px */
    }
    
    h2 {
        font-size: 1.375rem; /* 22px instead of 24px */
    }
    
    .metric-value {
        font-size: 2.5rem;   /* 40px instead of 48px */
    }
}
```

---

## ♿ Accessibility Guidelines

### Minimum Sizes

**WCAG Guidelines:**
- Minimum body text: 16px (1rem) for optimal readability
- Small text (< 18px): Requires 4.5:1 contrast ratio
- Large text (≥ 18px): Requires 3:1 contrast ratio

**Our Compliance:**
- ✅ Base font size: 16px (meets guideline)
- ✅ All text colors meet contrast requirements
- ✅ Line heights optimized for readability

---

### Focus Indicators

All interactive text elements must have visible focus states:

```css
a:focus,
button:focus {
    outline: 2px solid var(--mercury-accent);
    outline-offset: 2px;
}
```

---

## 🎯 Usage Guidelines

### ✅ DO

- Use rem units for font sizes (scalable)
- Maintain consistent line heights per text type
- Use semantic heading hierarchy (h1 → h2 → h3)
- Keep line length between 50-75 characters for readability
- Use font-weight to create emphasis, not color alone

### ❌ DON'T

- Mix multiple font families
- Use font sizes smaller than 12px (0.75rem)
- Skip heading levels (h1 → h3)
- Use bold for entire paragraphs
- Rely solely on color to convey meaning

---

## 🔧 Implementation Examples

### Card with Full Typography Hierarchy

```html
<div class="card">
    <span class="overline">Category</span>
    <h3 class="card-title">Solution Name</h3>
    <p class="body-small">This is a description of the solution with supporting details.</p>
    <div class="metric-container">
        <span class="metric-value">84</span>
        <span class="caption">Total Solutions</span>
    </div>
</div>
```

```css
.card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.body-small {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-secondary);
}
```

---

### Metric Display

```html
<div class="metric-card">
    <div class="metric-value">32</div>
    <div class="metric-label">Solutions Below Target</div>
    <div class="metric-sublabel">Updated 5 minutes ago</div>
</div>
```

```css
.metric-value {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
}

.metric-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.metric-sublabel {
    font-size: 0.75rem;
    color: var(--text-muted);
}
```

---

## 📊 Typography Scale Visualization

```
48px ████████ H1 / Hero Metrics
32px ██████   H2 / Large Metrics
24px ████     H3 / Section Headers
20px ███      H4 / Subsections
18px ██       Body Large
16px ██       Body Regular (Base)
14px █        Body Small / Labels
12px █        Captions / Metadata
```

---

## 🌙 Dark Mode Typography (Planned)

Typography adjustments for dark mode:

```css
@media (prefers-color-scheme: dark) {
    body {
        font-weight: 400; /* Slightly lighter weight on dark backgrounds */
    }
    
    /* Adjust for reduced contrast on dark backgrounds */
    .caption {
        font-size: 0.8125rem; /* Slightly larger for readability */
    }
}
```

---

## 📚 Related Documentation

- [Colors](./colors.md) - Text color tokens
- [Components](./components.md) - Component-specific typography
- [Spacing](./spacing.md) - Text spacing and margins

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

