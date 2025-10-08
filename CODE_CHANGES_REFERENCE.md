# Code Changes Reference Guide
**Quick Reference for Enhanced UI Implementation**

---

## Modified Files Overview

### 1. src/js/core/ui/ui-cards.js
**Lines Changed:** Complete file rewrite  
**Key Changes:** Collapsible area grouping, platform/automation display

### 2. src/js/core/ui/ui-filters.js
**Lines Changed:** 200-233 (applyFiltersFromUI function)  
**Key Changes:** Intelligent area expansion logic

### 3. src/css/dashboard-style.css
**Lines Changed:** 
- Line 2028: Changed cards-grid to flex column
- Lines 3669-3805: Added technical info and badge styles
- Lines 3807-3955: Added area section styles

---

## Key Code Snippets

### 1. Grouping Products by Area (ui-cards.js)

```javascript
// Group products by P&C Area
const groupedByArea = {};
filteredData.forEach(product => {
    const area = product.area || 'Uncategorized';
    if (!groupedByArea[area]) {
        groupedByArea[area] = [];
    }
    groupedByArea[area].push(product);
});

// Sort areas alphabetically
const sortedAreas = Object.keys(groupedByArea).sort();
```

---

### 2. Rendering Collapsible Section (ui-cards.js)

```javascript
return `
<div class="area-section" data-area="${window.Utils.escapeHtml(area)}">
    <div class="area-header" onclick="window.UIManager.Cards.toggleArea('${area}')">
        <div class="area-header-content">
            <span class="area-toggle-icon">${isExpanded ? '−' : '+'}</span>
            <h3 class="area-title">${window.Utils.escapeHtml(area)}</h3>
            <span class="area-count">(${products.length})</span>
        </div>
    </div>
    <div class="area-cards ${isExpanded ? 'expanded' : 'collapsed'}">
        ${cardsHtml}
    </div>
</div>
`;
```

---

### 3. Platform Info Helper (ui-cards.js)

```javascript
function getPlatformInfo(platform) {
    if (!platform || platform.trim() === '') {
        return '<span class="platform-empty">Not specified</span>';
    }
    
    const platforms = platform.split(',').map(p => p.trim()).filter(p => p);
    if (platforms.length === 0) {
        return '<span class="platform-empty">Not specified</span>';
    }
    
    const platformIcons = {
        'Web': '🌐',
        'Mobile': '📱',
        'Desktop': '💻',
        'API': '🔌',
        'Email': '📧',
        'SMS': '📨',
        'Excel': '📊',
        'SharePoint': '📁',
        'Teams': '💬'
    };
    
    const firstPlatform = platforms[0];
    const icon = platformIcons[firstPlatform] || '📦';
    
    if (platforms.length === 1) {
        return `${icon} ${window.Utils.escapeHtml(firstPlatform)}`;
    } else {
        return `${icon} ${window.Utils.escapeHtml(firstPlatform)} +${platforms.length - 1}`;
    }
}
```

---

### 4. Automation Info Helper (ui-cards.js)

```javascript
function getAutomationInfo(product) {
    const hasUXData = product.monthlyUX && product.monthlyUX.some(val => val && val !== '' && val !== '0');
    const hasBIData = product.monthlyBI && product.monthlyBI.some(val => val && val !== '' && val !== '0');
    
    if (hasUXData && hasBIData) {
        return {
            icon: '✓',
            text: 'Automated',
            class: 'automation-automated'
        };
    } else if (hasUXData || hasBIData) {
        return {
            icon: '⚠',
            text: 'Partial',
            class: 'automation-partial'
        };
    } else {
        return {
            icon: '○',
            text: 'Manual',
            class: 'automation-manual'
        };
    }
}
```

---

### 5. Toggle Area Function (ui-cards.js)

```javascript
const expandedSections = new Set();

function toggleArea(area) {
    if (expandedSections.has(area)) {
        expandedSections.delete(area);
    } else {
        expandedSections.add(area);
    }
    renderCards();
}
```

---

### 6. Enhanced Filter Logic (ui-filters.js)

```javascript
function applyFiltersFromUI() {
    const searchTerm = document.getElementById('search-input').value;
    const areaFilter = document.getElementById('filter-area').value;
    const maturityFilter = document.getElementById('filter-maturity').value;
    const ownerFilter = document.getElementById('filter-owner').value;
    const sortBy = document.getElementById('sort-by').value;
    const belowTargetOnly = document.getElementById('filter-below-target').checked;

    window.DataManager.applyFilters(searchTerm, areaFilter, maturityFilter, ownerFilter, sortBy, belowTargetOnly);
    
    // Get filtered data to determine which areas to expand
    const filteredData = window.DataManager.getFilteredData();
    
    // Check if any filters are active
    const hasActiveFilters = searchTerm || areaFilter || maturityFilter || ownerFilter || belowTargetOnly;
    
    if (hasActiveFilters && filteredData.length > 0) {
        // Get unique areas from filtered data
        const areasToExpand = [...new Set(filteredData.map(product => product.area || 'Uncategorized'))];
        
        // Expand only the areas with filtered results
        window.UIManager.Cards.collapseAllAreas();
        window.UIManager.Cards.expandAreas(areasToExpand);
    } else if (!hasActiveFilters) {
        // If no filters, collapse all areas (default state)
        window.UIManager.Cards.collapseAllAreas();
    }
    
    window.UIManager.Cards.render();
    window.UIManager.Cards.updateStats();
    renderFilterPills();
}
```

---

### 7. Card Technical Info HTML (ui-cards.js)

```javascript
<div class="card-technical-info">
    <div class="technical-info-row">
        <span class="info-label">Platform:</span>
        <span class="platform-badge">${platformInfo}</span>
    </div>
    <div class="technical-info-row">
        <span class="info-label">Metrics:</span>
        <span class="automation-badge ${automationInfo.class}">${automationInfo.icon} ${automationInfo.text}</span>
    </div>
</div>
```

---

### 8. CSS: Area Section Styles

```css
.area-section {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-amount)) saturate(180%);
    border-radius: 16px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px var(--glass-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.7);
    overflow: hidden;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;
}

.area-header {
    padding: 1.25rem 1.75rem;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%);
    border-bottom: 2px solid rgba(99, 102, 241, 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.area-cards.expanded {
    max-height: 10000px;
    opacity: 1;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.25rem;
}

.area-cards.collapsed {
    max-height: 0;
    opacity: 0;
    padding: 0 1.5rem;
}
```

---

### 9. CSS: Technical Info Styles

```css
.card-technical-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(99, 102, 241, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(99, 102, 241, 0.08);
}

.platform-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.75rem;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.automation-badge.automation-automated {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border-color: rgba(16, 185, 129, 0.2);
}

.automation-badge.automation-partial {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
    border-color: rgba(245, 158, 11, 0.2);
}

.automation-badge.automation-manual {
    background: rgba(148, 163, 184, 0.1);
    color: #64748b;
    border-color: rgba(148, 163, 184, 0.2);
}
```

---

## API Changes

### New Exports from ui-cards.js

```javascript
window.UIManager.Cards = {
    render: renderCards,
    updateStats,
    updateLastUpdateDisplay,
    toggleArea,           // NEW: Toggle area expansion
    expandAreas,          // NEW: Expand multiple areas
    collapseAllAreas      // NEW: Collapse all areas
};
```

---

## Data Flow

```
1. User Action (Filter/Click)
        ↓
2. applyFiltersFromUI() or toggleArea()
        ↓
3. Update expandedSections Set
        ↓
4. renderCards() - Group by area
        ↓
5. Generate HTML with collapsible sections
        ↓
6. CSS handles animations
```

---

## Platform Icon Mapping

```javascript
const platformIcons = {
    'Web': '🌐',
    'Mobile': '📱',
    'Desktop': '💻',
    'API': '🔌',
    'Email': '📧',
    'SMS': '📨',
    'Excel': '📊',
    'SharePoint': '📁',
    'Teams': '💬'
};
```

---

## Automation Status Logic

```javascript
// Has both UX and BI data → Automated (✓ Green)
if (hasUXData && hasBIData) return 'automated';

// Has one type of data → Partial (⚠ Orange)
if (hasUXData || hasBIData) return 'partial';

// Has no data → Manual (○ Gray)
return 'manual';
```

---

## CSS Variables Used

```css
--glass-bg: rgba(255, 255, 255, 0.45);
--glass-border: rgba(255, 255, 255, 0.65);
--glass-shadow: rgba(99, 102, 241, 0.08);
--blur-amount: 20px;
--mercury-accent: #6366f1;
--text-primary: #1e293b;
--text-secondary: #475569;
```

---

## Responsive Breakpoints

```css
/* Desktop: > 1024px */
.area-cards.expanded {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
}

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* Mobile: < 768px */
@media (max-width: 768px) {
    grid-template-columns: 1fr;
}
```

---

## Testing Commands (Browser Console)

```javascript
// Check expanded sections
console.log(window.UIManager.Cards);

// Manually expand an area
window.UIManager.Cards.expandAreas(['HRBP']);

// Collapse all
window.UIManager.Cards.collapseAllAreas();

// Get current filtered data
console.log(window.DataManager.getFilteredData());

// Check grouping
const data = window.DataManager.getFilteredData();
const grouped = {};
data.forEach(p => {
    const area = p.area || 'Uncategorized';
    grouped[area] = (grouped[area] || 0) + 1;
});
console.log(grouped);
```

---

## Common Issues & Solutions

### Issue: Areas not expanding when filtering
**Solution:** Check that `expandAreas()` is being called with correct area names. Verify `product.area` field exists.

### Issue: Sections stay expanded when clearing filters
**Solution:** Ensure `collapseAllAreas()` is called in the else branch of `applyFiltersFromUI()`.

### Issue: Platform icons not showing
**Solution:** Check that `product.platform` field exists and matches icon mapping keys exactly.

### Issue: Automation status always shows "Manual"
**Solution:** Verify that `product.monthlyUX` and `product.monthlyBI` arrays contain non-empty values.

---

## Performance Notes

- **Grouping Operation:** O(n) where n = number of filtered products
- **Rendering:** O(n) per render (unavoidable for DOM updates)
- **Area Toggle:** O(1) Set operations
- **Memory:** Minimal overhead (one Set for expanded state)

---

## Browser DevTools Tips

### Check Current State
```javascript
// In browser console:
window.State.getState();
window.State.getFilteredData();
```

### Force Re-render
```javascript
window.UIManager.Cards.render();
```

### Debug Filtering
```javascript
window.DataManager.applyFilters('search term', '', '', '', '', false);
console.log(window.DataManager.getFilteredData());
```

---

This reference guide provides quick access to all key code changes and patterns used in the implementation.

