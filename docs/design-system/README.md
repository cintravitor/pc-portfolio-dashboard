# P&C Portfolio Dashboard - Design System

**Version:** 1.0.0  
**Last Updated:** November 15, 2025  
**Status:** ✅ Production

---

## 📖 Overview

The P&C Portfolio Dashboard design system provides a cohesive, scalable foundation for building user interfaces with the **"Mercury Light"** aesthetic — featuring frosted glass effects, soft gradients, and modern typography.

### Design Philosophy

**Mercury Light Theme Principles:**

1. **✨ Ethereal Clarity** - Translucent surfaces with subtle depth
2. **🌊 Fluid Motion** - Smooth animations and transitions
3. **🎯 Focused Hierarchy** - Clear visual importance through size and weight
4. **♿ Inclusive Access** - WCAG AA compliant contrast ratios
5. **📱 Universal Responsiveness** - Mobile-first adaptive design

---

## 🎨 Core Design Language

### Visual Identity

**Name:** Mercury Light  
**Aesthetic:** Liquid Glass with Soft Radiance  
**Inspiration:** Frosted glass, flowing water, ambient light

**Key Visual Elements:**
- Frosted glass cards with backdrop blur (12-20px)
- Multi-layered radial gradients for depth
- Soft shadows with purple/indigo tints
- Subtle shimmer animations
- Rounded corners (8-16px standard)

---

## 📚 Documentation Structure

### Quick Navigation

| Section | Description | Link |
|---------|-------------|------|
| **Colors** | Complete color palette, semantic tokens | [colors.md](./colors.md) |
| **Typography** | Font scales, weights, line heights | [typography.md](./typography.md) |
| **Spacing** | Spacing scale, layout grid, gaps | [spacing.md](./spacing.md) |
| **Components** | Reusable UI components | [components.md](./components.md) |
| **Patterns** | Common UI patterns and recipes | [patterns.md](./patterns.md) |
| **Animation** | Motion design, transitions | [animation.md](./animation.md) |

---

## 🚀 Getting Started

### For Developers

**Using Design Tokens:**

All design tokens are available as CSS custom properties:

```css
/* Example: Using color tokens */
.my-element {
    color: var(--text-primary);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
}

/* Example: Using spacing */
.my-card {
    padding: var(--spacing-4);  /* 1rem = 16px */
    gap: var(--spacing-3);      /* 0.75rem = 12px */
}
```

**Location of Design Tokens:**
```
src/css/dashboard-style.css (lines 1-30)
```

---

### For Designers

**Design Files:**
- Figma: *(Not yet created)*
- Sketch: *(Not yet created)*
- Adobe XD: *(Not yet created)*

**Recommended Next Steps:**
1. Create Figma component library from existing CSS
2. Document component states (hover, active, disabled)
3. Create responsive breakpoint examples

---

## 🎯 Design Tokens

### Core Token Categories

#### 1. **Color Tokens**
```css
--primary           /* Primary brand color */
--secondary         /* Secondary brand color */
--mercury-accent    /* Accent color for highlights */
--text-primary      /* Primary text color */
--glass-bg          /* Glass effect background */
--success           /* Success/positive feedback */
--warning           /* Warning/caution feedback */
--danger            /* Error/danger feedback */
```

[→ Complete Color Documentation](./colors.md)

---

#### 2. **Typography Tokens**
```css
--font-family-base: 'Inter', sans-serif
--font-size-xs:   0.75rem   (12px)
--font-size-sm:   0.875rem  (14px)
--font-size-base: 1rem      (16px)
--font-size-lg:   1.125rem  (18px)
--font-size-xl:   1.25rem   (20px)
--font-size-2xl:  1.5rem    (24px)
--font-size-3xl:  2rem      (32px)
```

[→ Complete Typography Documentation](./typography.md)

---

#### 3. **Spacing Tokens**
```css
--spacing-1: 0.25rem  (4px)
--spacing-2: 0.5rem   (8px)
--spacing-3: 0.75rem  (12px)
--spacing-4: 1rem     (16px)
--spacing-5: 1.25rem  (20px)
--spacing-6: 1.5rem   (24px)
--spacing-8: 2rem     (32px)
```

[→ Complete Spacing Documentation](./spacing.md)

---

#### 4. **Effect Tokens**
```css
--blur-light:  12px   /* Light blur for subtle effects */
--blur-amount: 20px   /* Standard blur for glass effect */

--border-radius-sm: 8px
--border-radius-md: 12px
--border-radius-lg: 16px
```

---

## 🧩 Component Library

### Available Components

| Component | Status | Documentation |
|-----------|--------|---------------|
| **Buttons** | ✅ Stable | [components.md#buttons](./components.md#buttons) |
| **Cards** | ✅ Stable | [components.md#cards](./components.md#cards) |
| **Forms** | ✅ Stable | [components.md#forms](./components.md#forms) |
| **Modals** | ✅ Stable | [components.md#modals](./components.md#modals) |
| **Tables** | ✅ Stable | [components.md#tables](./components.md#tables) |
| **Badges** | ✅ Stable | [components.md#badges](./components.md#badges) |
| **Charts** | ✅ Stable | [components.md#charts](./components.md#charts) |
| **Navigation** | ✅ Stable | [components.md#navigation](./components.md#navigation) |

---

## 📐 Layout Principles

### Responsive Grid

**Breakpoints:**
```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

**Container:**
```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}
```

---

## ♿ Accessibility Standards

### WCAG AA Compliance

**Color Contrast:**
- Text on background: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus indicators
- Logical tab order

**Screen Readers:**
- Semantic HTML (header, nav, main, section)
- ARIA labels where needed
- Alt text for images

---

## 🎭 Theme Support

### Current Themes

| Theme | Status | Notes |
|-------|--------|-------|
| **Mercury Light** | ✅ Active | Default theme |
| **Dark Mode** | 🚧 Planned | Not yet implemented |

### Adding Dark Mode

**Planned Approach:**
```css
@media (prefers-color-scheme: dark) {
    :root {
        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --glass-bg: rgba(15, 23, 42, 0.6);
        /* ... additional dark tokens */
    }
}
```

---

## 🔧 Development Guidelines

### Using the Design System

**✅ DO:**
- Use design tokens (CSS variables) instead of hardcoded values
- Follow established patterns from existing components
- Maintain consistent spacing using spacing scale
- Test across all breakpoints
- Ensure WCAG AA color contrast

**❌ DON'T:**
- Hardcode colors, sizes, or spacing values
- Create custom components without checking existing library
- Override design tokens without discussion
- Break established visual hierarchy
- Ignore responsive behavior

---

## 📊 Design Metrics

### Current Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Components** | 24 components | ✅ Good |
| **Color Tokens** | 15 semantic tokens | ✅ Good |
| **Typography Scale** | 7 sizes | ✅ Good |
| **Spacing Scale** | 10 values | ✅ Good |
| **Line of Code** | ~7000 lines CSS | ⚠️ Consider optimization |

---

## 🗺️ Roadmap

### Short-term (Q4 2025)

- [ ] Create Figma component library
- [ ] Add dark mode support
- [ ] Document animation guidelines
- [ ] Create interactive component playground

### Long-term (2026)

- [ ] CSS-in-JS migration option
- [ ] Design token JSON export
- [ ] Component variant system
- [ ] Automated visual regression testing

---

## 🤝 Contributing

### Proposing Changes

1. **Open Discussion:** Create issue with `design-system` label
2. **Design Exploration:** Create mockups/prototypes
3. **Review:** Design team reviews proposal
4. **Implementation:** Update CSS and documentation
5. **Review:** Code review for consistency
6. **Merge:** Update version number

### Design System Team

**Maintainers:**
- Design Lead: *(To be assigned)*
- Frontend Lead: *(To be assigned)*

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| **1.0.0** | Nov 15, 2025 | Initial design system documentation |

---

## 📚 Additional Resources

- [Component Examples](./examples/)
- [Migration Guide](./migration-guide.md) *(Coming soon)*
- [Design Principles](./design-principles.md) *(Coming soon)*
- [Brand Guidelines](./brand-guidelines.md) *(Coming soon)*

---

## 🆘 Support

**Questions?**
- Check existing documentation first
- Review [components.md](./components.md) for examples
- Open issue with `design-system` label
- Contact design system maintainers

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Active

