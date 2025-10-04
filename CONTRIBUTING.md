# Contributing to P&C Portfolio Dashboard

Thank you for your interest in contributing to the P&C Portfolio Dashboard! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- **Be respectful:** Treat all contributors with respect and kindness
- **Be collaborative:** Work together towards common goals
- **Be constructive:** Provide helpful feedback and suggestions
- **Be professional:** Maintain professional conduct in all interactions

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or insults
- Trolling or inflammatory comments
- Publishing others' private information

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Git** installed
- **Web browser** (Chrome, Firefox, Safari, or Edge)
- **Text editor** (VS Code, Sublime, Atom, etc.)
- **Python 3** (for local development server) or any HTTP server
- **Google Account** (if working with Google Apps Script backend)

### Recommended Tools

- **VS Code Extensions:**
  - ESLint
  - Prettier
  - Live Server
  - GitLens
  
- **Browser Extensions:**
  - React Developer Tools (for debugging)
  - JSON Viewer

---

## 💻 Development Setup

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/pc-portfolio-dashboard.git
cd pc-portfolio-dashboard
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/cintravitor/pc-portfolio-dashboard.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 5. Start Local Development Server

**Option A: Python**
```bash
python3 -m http.server 8080
```

**Option B: Node.js (http-server)**
```bash
npx http-server -p 8080
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### 6. Open in Browser

Navigate to `http://localhost:8080`

---

## 🛠️ How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **🐛 Bug Fixes** - Fix issues or unexpected behavior
2. **✨ New Features** - Add new functionality
3. **📚 Documentation** - Improve or add documentation
4. **🎨 UI/UX Improvements** - Enhance the user interface
5. **⚡ Performance** - Optimize code performance
6. **♿ Accessibility** - Improve accessibility features
7. **🧪 Testing** - Add or improve tests
8. **🔧 Refactoring** - Improve code quality

### Finding Something to Work On

1. **Check Issues:** Browse open issues labeled `good first issue` or `help wanted`
2. **Review Roadmap:** See [PRODUCT_ROADMAP.md](./docs/PRODUCT_ROADMAP.md) for planned features
3. **Propose Ideas:** Open a new issue to discuss your idea before implementing

### Before You Start

1. **Check existing issues** - Make sure no one else is working on it
2. **Comment on the issue** - Let others know you're working on it
3. **Discuss major changes** - For significant changes, discuss in an issue first

---

## 📝 Coding Standards

### JavaScript Style Guide

**General Principles:**
- Use vanilla JavaScript (ES6+)
- No frameworks required (keep it lightweight)
- Maintain consistency with existing code
- Write clear, self-documenting code

**Naming Conventions:**
```javascript
// Functions: camelCase
function fetchPortfolioData() { }
function calculateRiskScore() { }

// Variables: camelCase
const portfolioData = [];
let filteredProducts = [];

// Constants: UPPER_SNAKE_CASE
const MAX_PRODUCTS = 100;
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;

// Classes: PascalCase (if used)
class DataManager { }

// Private/internal: prefix with underscore
function _internalHelper() { }
```

**Code Structure:**
```javascript
/**
 * Function description (JSDoc style)
 * @param {string} productId - Product identifier
 * @param {Object} options - Configuration options
 * @returns {Object} Processed product data
 */
function processProduct(productId, options) {
    // Validate inputs
    if (!productId) {
        console.error('Product ID is required');
        return null;
    }
    
    // Main logic
    const product = findProduct(productId);
    
    // Return result
    return product;
}
```

**Best Practices:**
- ✅ Use `const` by default, `let` when reassignment needed
- ✅ Avoid `var`
- ✅ Use template literals for strings: `` `Hello ${name}` ``
- ✅ Use arrow functions for callbacks: `array.map(item => ...)`
- ✅ Add JSDoc comments for functions
- ✅ Handle errors gracefully
- ✅ Use meaningful variable names
- ✅ Keep functions small and focused (single responsibility)

### HTML Standards

```html
<!-- Use semantic HTML -->
<header>, <nav>, <main>, <article>, <section>, <footer>

<!-- Proper indentation (2 or 4 spaces, be consistent) -->
<div class="container">
    <div class="card">
        <h2>Title</h2>
        <p>Content</p>
    </div>
</div>

<!-- Use data attributes for JS hooks -->
<button data-product-id="123" data-tab="overview">
```

### CSS Standards

```css
/* Use meaningful class names */
.product-card { }
.filter-section { }
.metric-indicator { }

/* Group related properties */
.element {
    /* Positioning */
    position: relative;
    top: 0;
    left: 0;
    
    /* Display & Box Model */
    display: flex;
    width: 100%;
    padding: 1rem;
    margin: 0;
    
    /* Typography */
    font-size: 1rem;
    line-height: 1.5;
    
    /* Visual */
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    
    /* Animation */
    transition: all 0.3s ease;
}

/* Mobile-first responsive design */
.container {
    width: 100%;
}

@media (min-width: 768px) {
    .container {
        width: 750px;
    }
}
```

---

## 📦 Commit Guidelines

### Commit Message Format

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(filters): add multi-select capability to area filter

fix(charts): resolve Chart.js memory leak on tab switch

docs(readme): update installation instructions

style(cards): improve card spacing and alignment

refactor(data-manager): extract risk calculation to separate function

perf(ui): implement virtual scrolling for large datasets
```

**Good Commit Messages:**
- ✅ `feat(planning-view): add anomaly detection alerts`
- ✅ `fix(detail-panel): prevent chart rendering error on missing data`
- ✅ `docs(contributing): add code style guidelines`

**Bad Commit Messages:**
- ❌ `fixed stuff`
- ❌ `update`
- ❌ `wip`

### Commit Best Practices

- **Atomic commits:** One logical change per commit
- **Present tense:** "Add feature" not "Added feature"
- **Imperative mood:** "Fix bug" not "Fixes bug"
- **Reference issues:** Include issue number if applicable

---

## 🔄 Pull Request Process

### 1. Sync Your Fork

Before creating a PR, sync with upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, well-documented code
- Follow coding standards
- Test your changes thoroughly
- Update documentation if needed

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat(scope): add new feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Submit the pull request

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
How was this tested?
- [ ] Tested locally
- [ ] Tested in multiple browsers
- [ ] Tested on mobile

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested on different browsers
- [ ] Responsive design verified
```

### Review Process

1. **Automated Checks:** PR will be checked automatically
2. **Code Review:** Maintainers will review your code
3. **Feedback:** Address any requested changes
4. **Approval:** Once approved, your PR will be merged

### After Merge

1. Delete your feature branch
2. Sync your fork with upstream
3. Celebrate! 🎉

---

## 🧪 Testing

### Manual Testing

Before submitting a PR, test:

1. **Functionality:**
   - Feature works as expected
   - No console errors
   - No broken functionality

2. **Cross-Browser:**
   - Chrome
   - Firefox
   - Safari
   - Edge

3. **Responsive Design:**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

4. **Edge Cases:**
   - Empty data
   - Large datasets (100+ products)
   - Missing data fields
   - Network errors

### Testing Checklist

```markdown
- [ ] Feature works in Chrome
- [ ] Feature works in Firefox
- [ ] Feature works in Safari
- [ ] Feature works on mobile
- [ ] No console errors
- [ ] No visual bugs
- [ ] Performance acceptable
- [ ] Accessible (keyboard navigation)
- [ ] Works with cached data
- [ ] Works offline (if applicable)
```

---

## 📚 Documentation

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change existing functionality
- Fix a notable bug
- Add new configuration options
- Change the API

### Documentation Files

- **README.md** - Project overview and quick start
- **CONTRIBUTING.md** - This file
- **docs/USER_STORIES.md** - Feature documentation
- **docs/user-journeys.md** - User workflows
- **docs/PRODUCT_ROADMAP.md** - Future plans
- **Code comments** - Inline documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep it up-to-date
- Use proper markdown formatting

---

## 🏗️ Architecture Overview

### Project Structure

```
src/
├── js/
│   ├── core/
│   │   ├── utils.js          # Utility functions & Pub/Sub
│   │   ├── state.js          # Centralized state management
│   │   ├── data-manager.js   # Data operations
│   │   └── ui-manager.js     # UI rendering
│   ├── config.js             # Configuration
│   ├── dashboard-script.js   # Main orchestrator
│   └── GoogleAppsScript.gs   # Backend script
└── css/
    └── dashboard-style.css    # Styles
```

### Module Responsibilities

**utils.js:**
- Utility functions (string, date, array manipulation)
- Pub/Sub event system
- Shared helpers

**state.js:**
- Single source of truth for app state
- Controlled state access via getters/setters
- State validation

**data-manager.js:**
- Fetch data from Google Sheets
- Process and transform data
- Calculate metrics and analytics
- Return data (never manipulates DOM)

**ui-manager.js:**
- Render UI components
- Handle user interactions
- Publish UI events
- Receive data as arguments

**dashboard-script.js:**
- Application orchestrator
- Subscribes to events
- Coordinates between data and UI
- Application lifecycle management

### Event-Driven Architecture

The app uses a Pub/Sub pattern for loose coupling:

```javascript
// UI publishes events
window.Utils.publish('filter:changed', filterData);

// Orchestrator subscribes
window.Utils.subscribe('filter:changed', (data) => {
    // Process data
    window.DataManager.applyFilters(data);
    
    // Update UI
    window.UIManager.renderCards();
});
```

**See:** [docs/STRATEGIC_ARCHITECTURE_REPORT.md](./docs/STRATEGIC_ARCHITECTURE_REPORT.md)

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Check if it's already reported
2. **Reproduce the bug** - Can you consistently reproduce it?
3. **Check browser console** - Any error messages?

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- Browser: [e.g. Chrome 118]
- OS: [e.g. macOS 14]
- Screen size: [e.g. 1920x1080]

**Console errors**
Any error messages from browser console

**Additional context**
Any other relevant information
```

---

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Describe the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you thought about

**User Story**
As a [role], I want [feature] so that [benefit]

**Additional context**
Mockups, examples, or references

**Affected users**
Who would benefit from this feature?

**Priority**
Low / Medium / High (in your opinion)
```

---

## 🎨 UI/UX Guidelines

### Design Principles

1. **Consistency:** Use existing components and patterns
2. **Clarity:** Make UI elements clear and understandable
3. **Efficiency:** Minimize clicks and cognitive load
4. **Feedback:** Provide clear feedback for actions
5. **Accessibility:** Ensure features are accessible

### Colors

```css
/* Primary colors */
--primary-blue: #3b82f6;
--primary-purple: #8b5cf6;

/* Maturity stages */
--development: #3b82f6; /* Blue */
--growth: #10b981;      /* Green */
--mature: #8b5cf6;      /* Purple */
--decline: #f59e0b;     /* Orange */

/* Status colors */
--success: #10b981;     /* Green */
--warning: #f59e0b;     /* Orange */
--error: #ef4444;       /* Red */
--info: #3b82f6;        /* Blue */
```

### Typography

```css
/* Font sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
```

---

## 🔐 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns to [your-email]
2. Include detailed description
3. Include steps to reproduce
4. We'll respond within 48 hours

### Security Best Practices

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for all external requests

---

## ❓ Getting Help

### Resources

- **Documentation:** [docs/](./docs/)
- **User Stories:** [docs/USER_STORIES.md](./docs/USER_STORIES.md)
- **Architecture:** [docs/STRATEGIC_ARCHITECTURE_REPORT.md](./docs/STRATEGIC_ARCHITECTURE_REPORT.md)
- **Roadmap:** [docs/PRODUCT_ROADMAP.md](./docs/PRODUCT_ROADMAP.md)

### Communication

- **Issues:** For bugs and feature requests
- **Discussions:** For questions and ideas
- **Pull Requests:** For code contributions

### Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with `question` label

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Acknowledgments

Thank you for contributing to the P&C Portfolio Dashboard! Your contributions help make this project better for everyone.

### Contributors

A list of all contributors will be maintained in the project README.

---

**Happy Contributing!** 🎉

*Last Updated: October 4, 2025*

