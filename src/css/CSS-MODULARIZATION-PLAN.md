# CSS Modularization Plan

**Current:** 7,726 lines in single file  
**Target:** 8 logical modules + main import file  
**Approach:** Pragmatic modularization (balance between organization and risk)

---

## Module Structure

```
src/css/
├── modules/
│   ├── 01-variables.css       (~30 lines)   - CSS variables, colors
│   ├── 02-base.css            (~150 lines)  - Reset, body, typography
│   ├── 03-layout.css          (~800 lines)  - Header, tabs, containers
│   ├── 04-components.css      (~1,200 lines) - Cards, buttons, badges
│   ├── 05-journey-nav.css     (~500 lines)  - Journey navigation
│   ├── 06-modal.css           (~1,000 lines) - Modals, detail panels
│   ├── 07-features.css        (~2,500 lines) - Insights, governance, smoke detectors
│   └── 08-responsive.css      (~1,500 lines) - Media queries
└── dashboard-style.css         (Import file)
```

---

## Module Breakdown

### 01-variables.css
- CSS custom properties (`:root`)
- Color palette
- Glass effect variables
- Status colors
- Text colors
- Blur amounts

### 02-base.css
- CSS reset (`*`)
- Body styles
- Background gradients
- Typography (h1-h6, p)
- Common utilities
- Scrollbar styles

### 03-layout.css
- Dashboard header
- Tab navigation
- Content header
- Grid layouts
- Container styles
- Section layouts

### 04-components.css
- Button styles
- Card styles (solution cards, metric cards)
- Badge components
- Input fields
- Dropdowns and selects
- Filter components
- Loading indicators

### 05-journey-nav.css
- Journey navigation bar
- Journey stage buttons
- Journey stage counts
- Active/inactive states
- Empty state styles

### 06-modal.css
- Modal overlay
- Detail panel
- Modal header
- Modal tabs
- Modal content
- Modal animations
- Chart containers in modals

### 07-features.css
- Insights tab styles
- Analytics styles
- Governance dashboard
- Smoke detectors
- AI insights
- Drill-down views
- Planning view
- Contextual alerting

### 08-responsive.css
- All `@media` queries
- Tablet styles (768px-1024px)
- Mobile styles (<768px)
- Desktop optimizations (>1024px)
- Print styles (if any)

---

## Import Order (Critical!)

The main `dashboard-style.css` will import in this exact order:

```css
/* Dashboard Styles - Modular Architecture */

/* 1. Variables - Must load first */
@import url('./modules/01-variables.css');

/* 2. Base - Reset and foundations */
@import url('./modules/02-base.css');

/* 3. Layout - Page structure */
@import url('./modules/03-layout.css');

/* 4. Components - Reusable elements */
@import url('./modules/04-components.css');

/* 5. Journey Navigation - Feature specific */
@import url('./modules/05-journey-nav.css');

/* 6. Modal - Detail panels */
@import url('./modules/06-modal.css');

/* 7. Features - Tab-specific styles */
@import url('./modules/07-features.css');

/* 8. Responsive - Media queries last */
@import url('./modules/08-responsive.css');
```

---

## Extraction Strategy

1. **Read full CSS file**
2. **Identify section boundaries** (using grep markers)
3. **Extract to modules** (maintaining exact content)
4. **Verify no duplicates**
5. **Create import file**
6. **Test in browser**
7. **Commit if working**

---

## Testing Checklist

After modularization:
- [ ] Page loads without errors
- [ ] All styles render correctly
- [ ] Journey navigation works
- [ ] Modal styles correct
- [ ] Responsive design works
- [ ] No console errors
- [ ] Visual regression = 0

---

## Benefits

1. **Maintainability** - Easier to find and edit styles
2. **Cacheability** - Browsers can cache individual modules
3. **Organization** - Clear separation of concerns
4. **Performance** - Can optimize loading order
5. **Collaboration** - Multiple developers can work on different modules
6. **Documentation** - Self-documenting structure

---

## Status

- [x] Plan created
- [ ] Modules directory created
- [ ] CSS extracted to modules
- [ ] Import file created
- [ ] index.html updated
- [ ] Testing completed
- [ ] Committed to repository

