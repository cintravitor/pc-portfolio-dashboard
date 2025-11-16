# Design Tokens - Mercury Light Design System

**Version:** 1.0.0  
**Last Updated:** November 2025

## Overview

Design tokens are the visual design atoms of the Mercury Light Design System. They are the foundational constants (colors, spacing, typography, etc.) that maintain consistency across the entire application.

## Location

All design tokens are centralized in:
```
/src/css/design-tokens.css
```

## Usage

### In HTML
Design tokens are automatically available when you include the design-tokens.css file:

```html
<link rel="stylesheet" href="src/css/design-tokens.css">
```

### In CSS
Reference tokens using CSS custom properties:

```css
.my-component {
    color: var(--text-primary);
    background: var(--glass-bg);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
}
```

## Token Categories

### Colors

#### Primary Palette
- `--primary: #667eea` - Main brand color
- `--secondary: #764ba2` - Secondary brand color
- `--mercury-accent: #6366f1` - Accent color
- `--mercury-glow: #818cf8` - Glow effect color
- `--mercury-silver: #e8eaf0` - Silver accent

#### Glass-morphism Effects
- `--glass-bg: rgba(255, 255, 255, 0.45)` - Base glass background
- `--glass-bg-hover: rgba(255, 255, 255, 0.65)` - Hover state
- `--glass-border: rgba(255, 255, 255, 0.65)` - Glass border
- `--glass-shadow: rgba(99, 102, 241, 0.08)` - Base shadow
- `--glass-shadow-hover: rgba(99, 102, 241, 0.12)` - Hover shadow

#### Status Colors
- `--success: #10b981` - Success states
- `--danger: #ef4444` - Error/danger states
- `--warning: #f59e0b` - Warning states
- `--info: #3b82f6` - Informational states

Each status color has light and border variants:
- `--success-light: rgba(16, 185, 129, 0.1)`
- `--success-border: rgba(16, 185, 129, 0.3)`

#### Text Colors
- `--text-primary: #1e293b` - Primary text
- `--text-secondary: #475569` - Secondary text
- `--text-tertiary: #64748b` - Tertiary text
- `--text-muted: #94a3b8` - Muted/disabled text
- `--text-white: #ffffff` - White text

### Typography

#### Font Family
- `--font-primary: 'Inter'` - Primary font stack

#### Font Sizes
- `--font-size-xs: 0.75rem` (12px)
- `--font-size-sm: 0.875rem` (14px)
- `--font-size-base: 1rem` (16px)
- `--font-size-lg: 1.125rem` (18px)
- `--font-size-xl: 1.25rem` (20px)
- `--font-size-2xl: 1.5rem` (24px)
- `--font-size-3xl: 1.875rem` (30px)
- `--font-size-4xl: 2.25rem` (36px)

#### Font Weights
- `--font-weight-light: 300`
- `--font-weight-normal: 400`
- `--font-weight-medium: 500`
- `--font-weight-semibold: 600`
- `--font-weight-bold: 700`

#### Line Heights
- `--line-height-tight: 1.25`
- `--line-height-normal: 1.5`
- `--line-height-relaxed: 1.75`

### Spacing

Progressive scale for consistent spacing:

- `--spacing-xs: 0.25rem` (4px)
- `--spacing-sm: 0.5rem` (8px)
- `--spacing-md: 1rem` (16px)
- `--spacing-lg: 1.5rem` (24px)
- `--spacing-xl: 2rem` (32px)
- `--spacing-2xl: 3rem` (48px)
- `--spacing-3xl: 4rem` (64px)

### Border Radius

- `--radius-sm: 0.375rem` (6px) - Small elements
- `--radius-md: 0.5rem` (8px) - Medium elements
- `--radius-lg: 0.75rem` (12px) - Large elements
- `--radius-xl: 1rem` (16px) - Extra large
- `--radius-2xl: 1.5rem` (24px) - Cards, panels
- `--radius-full: 9999px` - Fully rounded (pills, avatars)

### Effects

#### Blur
- `--blur-light: 12px` - Light blur
- `--blur-amount: 20px` - Standard blur
- `--blur-heavy: 32px` - Heavy blur

#### Shadows
- `--shadow-sm` - Subtle shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow
- `--shadow-xl` - Extra large shadow
- `--shadow-2xl` - Maximum shadow
- `--shadow-glass` - Glass effect shadow
- `--shadow-glass-hover` - Glass hover shadow

#### Transitions
- `--transition-fast: 150ms` - Quick interactions
- `--transition-base: 250ms` - Standard transitions
- `--transition-slow: 350ms` - Slower animations
- `--transition-slower: 500ms` - Deliberate animations

#### Easing
- `--ease-linear` - Linear easing
- `--ease-in` - Ease in
- `--ease-out` - Ease out
- `--ease-in-out` - Ease in and out
- `--ease-premium` - Premium feel (cubic-bezier)

### Z-Index Scale

Consistent layering system:

- `--z-base: 0` - Base layer
- `--z-dropdown: 10` - Dropdowns
- `--z-sticky: 20` - Sticky elements
- `--z-fixed: 30` - Fixed elements
- `--z-modal-backdrop: 40` - Modal backdrops
- `--z-modal: 50` - Modals
- `--z-popover: 60` - Popovers
- `--z-tooltip: 70` - Tooltips

## Best Practices

### 1. Always Use Tokens

❌ **Don't:**
```css
.card {
    color: #1e293b;
    padding: 16px;
    border-radius: 12px;
}
```

✅ **Do:**
```css
.card {
    color: var(--text-primary);
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
}
```

### 2. Use Semantic Tokens

Choose tokens based on meaning, not appearance:

❌ **Don't:**
```css
.error-message {
    color: #ef4444; /* Direct color value */
}
```

✅ **Do:**
```css
.error-message {
    color: var(--danger); /* Semantic token */
}
```

### 3. Maintain Consistency

Use the spacing scale consistently:

❌ **Don't:**
```css
.container {
    padding: 14px; /* Arbitrary value */
}
```

✅ **Do:**
```css
.container {
    padding: var(--spacing-md); /* 16px from scale */
}
```

### 4. Combine Tokens

Build complex styles from simple tokens:

```css
.premium-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-amount));
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-glass);
    padding: var(--spacing-lg);
    transition: all var(--transition-base) var(--ease-premium);
}

.premium-card:hover {
    background: var(--glass-bg-hover);
    box-shadow: var(--shadow-glass-hover);
    transform: translateY(-4px);
}
```

## Future Enhancements

### Dark Mode Support

Design tokens include commented dark mode values. When implementing dark mode:

1. Uncomment the dark mode section in `design-tokens.css`
2. Add `@media (prefers-color-scheme: dark)` queries
3. Override color tokens for dark theme
4. Test all components in both modes

### Custom Themes

To create custom themes:

1. Duplicate `design-tokens.css`
2. Modify color values
3. Keep all token names unchanged
4. Test thoroughly

### Dynamic Tokens

For runtime theme switching, consider:
- JavaScript-based token updates
- CSS custom property manipulation
- Local storage for persistence

## References

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Design Tokens Specification](https://designtokens.org/)
- [Inter Font Family](https://fonts.google.com/specimen/Inter)

