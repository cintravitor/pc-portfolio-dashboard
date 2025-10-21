# Local Development Guide

## Development Environment Setup

### Prerequisites

- **Git**: Version control
- **Python 3.x**: For local web server
- **Node.js** (optional): For running scripts and tests
- **Modern Web Browser**: Chrome recommended for dev tools
- **Code Editor**: VS Code, Sublime, or similar

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/cintravitor/pc-portfolio-dashboard.git
   cd pc-portfolio-dashboard
   ```

2. **Install Dependencies** (if using Node.js)
   ```bash
   npm install
   ```

3. **Configure API Keys**
   Update `src/js/config.js` with your credentials:
   ```javascript
   LITELLM_API_KEY: 'your-litellm-api-key',
   WEB_APP_URL: 'your-apps-script-web-app-url'
   ```

## Running Locally

### Start Development Server

```bash
python3 -m http.server 8080
```

Access at: `http://localhost:8080`

### Alternative: Use Node.js http-server

```bash
npx http-server -p 8080
```

## Project Structure

```
/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio/
├── index.html                 # Main entry point
├── src/
│   ├── js/
│   │   ├── config.js         # Configuration
│   │   ├── dashboard-script.js  # Main orchestrator
│   │   └── core/
│   │       ├── utils.js      # Utility functions
│   │       ├── state.js      # State management
│   │       ├── data-manager.js  # Data operations
│   │       ├── analytics.js  # Analytics tracking
│   │       ├── ai-recommendations.js  # AI features
│   │       ├── ai-summaries-data.js   # Pre-generated AI summaries
│   │       └── ui/           # UI modules
│   │           ├── ui-tabs.js
│   │           ├── ui-filters.js
│   │           ├── ui-cards.js
│   │           ├── ui-detail-panel.js
│   │           ├── ui-charts.js
│   │           ├── ui-governance.js
│   │           ├── ui-analytics.js
│   │           └── ui-drill-down.js
│   └── css/
│       └── dashboard-style.css
├── docs/                     # Documentation
├── tests/                    # Test files
├── scripts/                  # Utility scripts
├── data/                     # Data files
└── google-apps-script/       # Backend scripts
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in your code editor. The development server will serve updated files automatically (hard refresh browser to clear cache).

### 3. Test Changes

Open browser developer console (F12) and verify:
- No JavaScript errors
- All features work as expected
- Console logs are meaningful

### 4. Commit Changes

```bash
git add .
git commit -m "feat: description of your changes"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Common Development Tasks

### Adding a New UI Module

1. Create file in `src/js/core/ui/`
2. Wrap in IIFE:
   ```javascript
   (function() {
       'use strict';
       
       // Your module code
       
       window.UIManager = window.UIManager || {};
       window.UIManager.ModuleName = {
           // Exported functions
       };
       
       console.log('✅ ModuleName module loaded');
   })();
   ```

3. Add script tag to `index.html`
4. Update `ui-manager-compat.js` if needed

### Modifying Data Processing

Edit `src/js/core/data-manager.js`:
- Data fetching functions (lines 110-256)
- Filtering logic (lines 257-400)
- Analytics calculations (lines 482-939)

### Updating Styles

Edit `src/css/dashboard-style.css`:
- Follow existing naming conventions
- Use CSS custom properties for colors
- Maintain responsive breakpoints (@media queries)

### Adding Backend Functionality

Edit `google-apps-script/analytics-backend.gs`:
1. Add new function
2. Export via `doGet()` router
3. Test in Apps Script editor
4. Deploy new version

## Debugging

### Browser DevTools

**Console (F12)**
- View error messages
- Inspect logged data
- Test functions in console

**Network Tab**
- Monitor API calls
- Check response data
- Verify CORS headers

**Elements Tab**
- Inspect DOM structure
- Test CSS changes live
- View computed styles

### Common Issues

**Data not loading:**
```javascript
// Check in console:
window.State.getPortfolioData()
// Should return array of solutions
```

**Filters not working:**
```javascript
// Check in console:
window.State.getFilteredData()
// Should return filtered array
```

**Charts not rendering:**
```javascript
// Verify Chart.js loaded:
typeof Chart !== 'undefined'
// Should return true
```

## Testing

### Manual Testing

1. **Smoke Test**: Verify all tabs load
2. **Feature Test**: Test specific functionality
3. **Edge Cases**: Test with empty data, missing fields
4. **Cross-browser**: Test in Chrome, Firefox, Safari

### Automated Tests

Run test suite (if configured):
```bash
npm test
```

### Performance Testing

Check browser console Performance tab:
- Load time < 3 seconds
- Time to Interactive < 2 seconds
- No memory leaks

## Code Quality

### Linting

Follow existing code style:
- Use `const` and `let`, not `var`
- 4-space indentation
- Single quotes for strings
- Descriptive variable names

### Documentation

Add JSDoc comments for functions:
```javascript
/**
 * Calculate portfolio metrics
 * @param {Array} data - Portfolio data array
 * @returns {Object} Calculated metrics
 */
function calculateMetrics(data) {
    // Implementation
}
```

### Git Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `docs:` Documentation
- `style:` Formatting
- `test:` Testing

## Deployment

See [Deployment Guide](deployment.md) for production deployment instructions.

## Resources

- [Architecture Overview](../architecture/overview.md)
- [API Reference](../api/)
- [Feature Documentation](../features/)
- [Contributing Guidelines](../contributing/code-standards.md)

