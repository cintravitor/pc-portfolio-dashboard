# Code Standards & Style Guide

## JavaScript Style

### Variables

```javascript
// Use const by default
const API_URL = 'https://...';
const portfolioData = [];

// Use let when reassignment needed
let currentFilter = null;

// Never use var
// ❌ var name = 'value';
```

### Functions

```javascript
// Descriptive names, camelCase
function calculateRiskScore(product) {
    // Implementation
}

// Arrow functions for callbacks
const filtered = data.filter(item => item.active);

// Async functions
async function fetchData() {
    const response = await fetch(url);
    return response.json();
}
```

### Naming Conventions

```javascript
// Variables & functions: camelCase
const userName = 'John';
function getUserName() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_ENDPOINT = 'https://...';

// Classes (if used): PascalCase
class DataProcessor {}

// Private/internal: prefix with underscore
function _internalHelper() {}
```

### Code Organization

```javascript
// Module structure
(function() {
    'use strict';
    
    // ==================== CONSTANTS ====================
    const CONSTANT_VALUE = 10;
    
    // ==================== PRIVATE VARIABLES ====================
    let privateVar = null;
    
    // ==================== PRIVATE FUNCTIONS ====================
    function privateHelper() {}
    
    // ==================== PUBLIC API ====================
    function publicFunction() {}
    
    // ==================== EXPORTS ====================
    window.ModuleName = {
        publicFunction
    };
    
    console.log('✅ ModuleName loaded');
})();
```

### Comments

```javascript
/**
 * Calculate portfolio risk score
 * @param {Object} product - Product data object
 * @param {Array} benchmarks - Historical benchmarks
 * @returns {Number} Risk score 0-100
 */
function calculateRisk(product, benchmarks) {
    // Check for missing data
    if (!product.keyMetricUX) {
        return 100; // Maximum risk
    }
    
    // Calculate based on performance
    const score = /* calculation */;
    return score;
}

// Single-line comments for clarification
const threshold = 85; // Minimum acceptable score
```

### Error Handling

```javascript
// Always handle errors
async function fetchData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        // Fallback behavior
        return loadCachedData();
    }
}

// Validate inputs
function calculateScore(value) {
    if (typeof value !== 'number') {
        throw new TypeError('Value must be a number');
    }
    if (value < 0 || value > 100) {
        throw new RangeError('Value must be 0-100');
    }
    return value * 2;
}
```

## HTML Style

### Structure

```html
<!-- Semantic HTML -->
<header class="header">
    <nav class="navigation">
        <button class="tab-btn active" data-tab="explore">
            Explore
        </button>
    </nav>
</header>

<main class="main-content">
    <section class="dashboard-section">
        <article class="solution-card">
            <!-- Content -->
        </article>
    </section>
</main>
```

### Attributes

```html
<!-- Order: id, class, data-*, other -->
<button 
    id="submit-btn"
    class="btn btn-primary"
    data-action="submit"
    aria-label="Submit form"
    onclick="handleSubmit()">
    Submit
</button>

<!-- Boolean attributes -->
<input type="checkbox" checked disabled>
```

## CSS Style

### Naming

```css
/* BEM-inspired naming */
.solution-card { }
.solution-card__header { }
.solution-card__title { }
.solution-card--featured { }

/* Utility classes */
.hidden { display: none; }
.visible { display: block; }
.text-center { text-align: center; }
```

### Organization

```css
/* 1. Layout */
.container {
    display: flex;
    flex-direction: column;
}

/* 2. Visual */
.card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
}

/* 3. Typography */
.title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
}

/* 4. States */
.button:hover { }
.button:active { }
.button:disabled { }
```

### Properties Order

```css
.element {
    /* Positioning */
    position: relative;
    top: 0;
    left: 0;
    z-index: 10;
    
    /* Box model */
    display: flex;
    width: 100%;
    height: auto;
    margin: 1rem;
    padding: 1rem;
    
    /* Visual */
    background: white;
    border: 1px solid;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    /* Typography */
    font-size: 1rem;
    font-weight: 400;
    color: #333;
    text-align: left;
    
    /* Other */
    cursor: pointer;
    transition: all 0.3s;
}
```

## Git Conventions

### Commit Messages

Follow Conventional Commits:

```bash
# Format
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `style`: Formatting
- `test`: Testing
- `chore`: Maintenance

**Examples**:
```bash
feat(governance): Add metrics coverage section

- Add UX/BI achievement gauges
- Create collapsible metrics cards
- Integrate with backend endpoint

Closes #123

---

fix(filters): Resolve multi-select dropdown not closing

---

docs(api): Update data-manager API reference

---

refactor(data): Split data-manager into modules
```

### Branch Naming

```bash
# Feature branches
feature/add-governance-dashboard
feature/ai-summaries

# Bug fixes
fix/filter-dropdown-issue
fix/chart-rendering-bug

# Refactoring
refactor/split-data-manager
refactor/modularize-ui

# Documentation
docs/update-readme
docs/api-reference
```

### Pull Requests

**Title**: Same as commit message

**Description**:
```markdown
## Description
Brief description of changes

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Manual testing completed
- [ ] All features working
- [ ] No console errors
- [ ] Cross-browser tested

## Screenshots
[If UI changes]

## Related Issues
Closes #123
```

## Code Review Guidelines

### Checklist

**Functionality**:
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No console errors

**Code Quality**:
- [ ] Follows style guide
- [ ] Well-commented
- [ ] No code duplication
- [ ] Efficient implementation

**Testing**:
- [ ] Manually tested
- [ ] No regressions
- [ ] Performance acceptable

**Documentation**:
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)
- [ ] Comments adequate

### Review Process

1. Read description & linked issues
2. Check out branch locally
3. Run and test changes
4. Review code line-by-line
5. Leave inline comments
6. Approve or request changes

## File Organization

### Module Files

```
src/js/core/ui/ui-module-name.js
```

- One module per file
- File name matches module name
- Max 500 lines (split if larger)

### Related Files Together

```
src/js/core/
├── data/
│   ├── data-fetching.js
│   ├── data-filtering.js
│   └── data-analytics.js
└── ui/
    ├── ui-tabs.js
    ├── ui-filters.js
    └── ui-cards.js
```

## Performance Guidelines

### Avoid

```javascript
// ❌ Don't query DOM repeatedly
for (let i = 0; i < 100; i++) {
    document.getElementById('container').innerHTML += item;
}

// ❌ Don't create functions in loops
data.forEach((item) => {
    setTimeout(function() { /* ... */ }, 100);
});
```

### Do

```javascript
// ✅ Build HTML string first
let html = '';
for (let i = 0; i < 100; i++) {
    html += item;
}
document.getElementById('container').innerHTML = html;

// ✅ Use event delegation
document.getElementById('container').addEventListener('click', (e) => {
    if (e.target.matches('.item')) {
        // Handle click
    }
});
```

## Security Guidelines

### Input Sanitization

```javascript
// Always escape user input
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const userInput = '<script>alert("xss")</script>';
const safe = escapeHtml(userInput);
```

### API Keys

```javascript
// ❌ Never commit API keys
const API_KEY = 'sk-1234567890abcdef';

// ✅ Use config file (gitignored)
const API_KEY = CONFIG.LITELLM_API_KEY;
```

## Testing Standards

### Manual Testing

Before committing:
1. Test in Chrome
2. Test in Firefox or Safari
3. Test mobile viewport
4. Check console for errors
5. Verify all features work

### Test Cases

Document test scenarios:
```markdown
## Test Scenario: Apply Filters

**Steps**:
1. Enter search term "onboarding"
2. Select area filter "PATO"
3. Click "Apply"

**Expected**:
- Cards filter to matching solutions
- Filter pill appears
- Stats update

**Actual**:
- ✅ Pass / ❌ Fail
```

## Related Documentation

- [Local Development Guide](../getting-started/local-development.md)
- [Testing Guide](testing.md)
- [Architecture Overview](../architecture/overview.md)

