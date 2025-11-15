# Animation & Motion Design

**Version:** 1.0.0  
**Last Updated:** November 15, 2025

---

## 🎬 Animation Philosophy

Animation in the Mercury Light design system serves three purposes:

1. **Feedback** - Confirm user actions
2. **Context** - Show relationships between elements
3. **Delight** - Add personality without distraction

**Core Principles:**
- **Purposeful** - Every animation has a reason
- **Subtle** - Never overwhelming or distracting
- **Fast** - 200-300ms for most transitions
- **Natural** - Ease curves that feel organic
- **Respectful** - Honor `prefers-reduced-motion`

---

## ⏱️ Duration Scale

### Standard Durations

| Duration | Use Case | Example |
|----------|----------|---------|
| **100ms** | Instant feedback | Button press, checkbox toggle |
| **200ms** | Quick transitions | Hover effects, color changes |
| **300ms** | Standard transitions | Card hover, panel slides |
| **500ms** | Deliberate animations | Modal open, large movements |
| **1000ms+** | Background effects | Shimmer, ambient animations |

**Default Transition:**
```css
transition: all 0.3s ease;
```

---

## 📈 Easing Functions

### Timing Functions

```css
/* Standard ease (default) */
transition-timing-function: ease;

/* Ease out (deceleration) */
transition-timing-function: ease-out;

/* Ease in (acceleration) */
transition-timing-function: ease-in;

/* Ease in-out (smooth start and end) */
transition-timing-function: ease-in-out;

/* Custom cubic bezier */
transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
```

**When to Use:**
- `ease`: General purpose transitions
- `ease-out`: Elements entering viewport
- `ease-in`: Elements leaving viewport
- `ease-in-out`: Symmetrical movements

---

## 🎨 Hover Effects

### Card Hover (Lift)

**Effect:** Card lifts up with enhanced shadow

```css
.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.12);
}
```

**Duration:** 300ms  
**Easing:** ease

---

### Button Hover

**Effect:** Slight lift with shadow enhancement

```css
.btn {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn:active {
    transform: translateY(0);
}
```

**Duration:** 200ms (faster for responsiveness)  
**Easing:** ease

---

### Link Underline

**Effect:** Animated underline on hover

```css
.link {
    position: relative;
    text-decoration: none;
    color: var(--primary);
}

.link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary);
    transition: width 0.3s ease;
}

.link:hover::after {
    width: 100%;
}
```

---

## 🚪 Entry & Exit Animations

### Fade In

**Use Case:** Modals, tooltips, overlays

```css
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.fade-in {
    animation: fadeIn 0.2s ease;
}
```

---

### Slide In (Right)

**Use Case:** Detail panel, side navigation

```css
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.slide-in-right {
    animation: slideInRight 0.3s ease;
}
```

---

### Slide In (Top)

**Use Case:** Dropdowns, notifications

```css
@keyframes slideInTop {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.slide-in-top {
    animation: slideInTop 0.3s ease;
}
```

---

### Scale In

**Use Case:** Modals, popovers

```css
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

.scale-in {
    animation: scaleIn 0.2s ease-out;
}
```

---

### Slide Out (Right)

**Use Case:** Closing panels

```css
@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.slide-out-right {
    animation: slideOutRight 0.3s ease;
}
```

---

## 🔄 Loading Animations

### Spinner

**Effect:** Continuous rotation

```css
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.spinner {
    animation: spin 1s linear infinite;
}
```

**Duration:** 1000ms  
**Easing:** linear (constant speed)

---

### Pulse

**Effect:** Subtle scale pulse

```css
@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
}

.pulse {
    animation: pulse 2s ease-in-out infinite;
}
```

---

### Shimmer (Skeleton)

**Effect:** Gradient sweep for loading placeholders

```css
@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.skeleton {
    background: linear-gradient(
        90deg,
        rgba(226, 232, 240, 0.4) 0%,
        rgba(226, 232, 240, 0.8) 50%,
        rgba(226, 232, 240, 0.4) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}
```

---

## ✨ Ambient Animations

### Background Shimmer

**Effect:** Subtle moving gradient overlay

```css
@keyframes shimmerBackground {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.03) 50%,
        transparent 70%
    );
    background-size: 200% 200%;
    animation: shimmerBackground 15s ease-in-out infinite;
    pointer-events: none;
}
```

**Duration:** 15000ms (very slow)  
**Purpose:** Adds subtle movement to background

---

## 🎯 Interactive Animations

### Button Press

**Effect:** Scale down on click

```css
.btn {
    transition: transform 0.1s ease;
}

.btn:active {
    transform: scale(0.98);
}
```

**Duration:** 100ms (instant feedback)

---

### Checkbox Toggle

**Effect:** Checkmark draw-in

```css
@keyframes checkmarkDraw {
    0% {
        stroke-dashoffset: 100;
    }
    100% {
        stroke-dashoffset: 0;
    }
}

.checkbox-checkmark {
    stroke-dasharray: 100;
    animation: checkmarkDraw 0.3s ease forwards;
}
```

---

### Dropdown Expand

**Effect:** Height expansion with fade

```css
.dropdown {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
}

.dropdown.open {
    max-height: 500px;
    opacity: 1;
}
```

---

## 📊 Chart Animations

### Bar Chart Grow

**Chart.js Configuration:**

```javascript
const chartConfig = {
    animation: {
        duration: 1000,
        easing: 'easeOutQuart',
        onProgress: function(animation) {
            // Optional: callback during animation
        }
    }
};
```

---

### Gauge Fill

**Effect:** Smooth percentage fill

```css
.gauge-fill {
    transition: stroke-dashoffset 1s ease-out;
}
```

---

## 🔔 Notification Animations

### Toast Slide In

**Effect:** Slide in from top-right

```css
@keyframes toastSlideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.toast {
    animation: toastSlideIn 0.3s ease;
}
```

---

### Alert Shake (Error)

**Effect:** Horizontal shake for errors

```css
@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-10px);
    }
    75% {
        transform: translateX(10px);
    }
}

.input-error {
    animation: shake 0.4s ease;
}
```

---

## 🎴 Card Grid Animations

### Staggered Fade In

**Effect:** Cards appear sequentially

```css
.card {
    animation: fadeIn 0.5s ease backwards;
}

.card:nth-child(1) { animation-delay: 0.05s; }
.card:nth-child(2) { animation-delay: 0.1s; }
.card:nth-child(3) { animation-delay: 0.15s; }
.card:nth-child(4) { animation-delay: 0.2s; }
/* ... */

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

**JavaScript Alternative:**
```javascript
cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.05}s`;
});
```

---

## 🌊 Smooth Scrolling

### Smooth Page Scroll

```css
html {
    scroll-behavior: smooth;
}
```

---

### Animated Scroll to Element

```javascript
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
```

---

## ♿ Accessibility: Reduced Motion

### Respect User Preferences

**Critical:** Always honor `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

**Alternative Approach:**
```css
@media (prefers-reduced-motion: reduce) {
    /* Disable non-essential animations */
    .card:hover {
        transform: none;
    }
    
    /* Keep essential feedback */
    .btn:active {
        transform: scale(0.98);
    }
    
    /* Disable ambient animations */
    body::before {
        animation: none;
    }
}
```

---

## 🎯 Animation Guidelines

### ✅ DO

- Keep animations under 500ms for UI interactions
- Use consistent easing across similar animations
- Provide instant feedback for clicks (100ms)
- Respect `prefers-reduced-motion`
- Test on lower-end devices
- Use `transform` and `opacity` for performance
- Consider animation purpose

### ❌ DON'T

- Animate layout properties (width, height, top, left)
- Use multiple conflicting animations
- Create distracting constant motion
- Ignore accessibility settings
- Use animations longer than 1 second for interactions
- Animate on initial page load excessively
- Block user interaction during animations

---

## ⚡ Performance Optimization

### Composite Properties

**Fast (GPU-accelerated):**
- `transform`
- `opacity`
- `filter`

**Slow (triggers layout/paint):**
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`

**Example - Good:**
```css
/* ✅ Use transform */
.card:hover {
    transform: translateY(-4px);
}
```

**Example - Bad:**
```css
/* ❌ Avoid margin */
.card:hover {
    margin-top: -4px;
}
```

---

### Will-Change Optimization

**Use sparingly for frequently animated elements:**

```css
.frequently-animated {
    will-change: transform, opacity;
}

/* Remove after animation */
.frequently-animated.done {
    will-change: auto;
}
```

**Warning:** Don't overuse - creates additional layers

---

### Hardware Acceleration

**Force GPU rendering:**

```css
.animated-element {
    transform: translateZ(0);
    backface-visibility: hidden;
}
```

---

## 📚 Animation Library

### Reusable Animation Classes

```css
/* Fade effects */
.fade-in { animation: fadeIn 0.3s ease; }
.fade-out { animation: fadeOut 0.3s ease; }

/* Slide effects */
.slide-in-right { animation: slideInRight 0.3s ease; }
.slide-in-left { animation: slideInLeft 0.3s ease; }
.slide-in-top { animation: slideInTop 0.3s ease; }
.slide-in-bottom { animation: slideInBottom 0.3s ease; }

/* Scale effects */
.scale-in { animation: scaleIn 0.2s ease; }
.scale-out { animation: scaleOut 0.2s ease; }

/* Loading */
.spin { animation: spin 1s linear infinite; }
.pulse { animation: pulse 2s ease-in-out infinite; }
.shimmer { animation: shimmer 1.5s infinite; }

/* Feedback */
.shake { animation: shake 0.4s ease; }
```

---

## 🎬 Complex Animation Sequences

### Multi-Step Animation

```css
@keyframes complexEntry {
    0% {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    50% {
        opacity: 0.5;
        transform: translateY(-5px) scale(1.02);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.complex-entry {
    animation: complexEntry 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

---

### JavaScript-Controlled Sequence

```javascript
async function animateSequence(element) {
    // Step 1: Fade in
    element.classList.add('fade-in');
    await wait(300);
    
    // Step 2: Scale up
    element.classList.add('scale-in');
    await wait(200);
    
    // Step 3: Remove classes
    element.classList.remove('fade-in', 'scale-in');
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 📊 Animation Timing Reference

### Quick Reference Chart

```
0ms ────┐
        │ Instant (button press)
100ms ──┤
        │ Quick feedback
200ms ──┤
        │ Standard transitions
300ms ──┤
        │ Deliberate animations
500ms ──┤
        │
1000ms ─┤ Slow/Background effects
        │
∞ ──────┘ Infinite (loading, ambient)
```

---

## 🔧 Debugging Animations

### Show Animation Boundaries

```css
* {
    outline: 1px solid red;
}
```

### Slow Down All Animations (Dev)

```css
* {
    animation-duration: 3s !important;
    transition-duration: 3s !important;
}
```

### Chrome DevTools

1. Open DevTools
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "Show Animations"
4. Replay and adjust animations

---

## 📚 Related Documentation

- [Components](./components.md) - Component-specific animations
- [Patterns](./patterns.md) - Animation patterns in context
- [Performance Guide](../guides/performance.md) - Optimization tips

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

