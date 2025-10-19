# 📁 Repository Organization Guide

**P&C Portfolio Dashboard**  
**Version:** 5.0.0  
**Last Updated:** October 4, 2025

---

## 🗂️ Repository Structure

```
pc-portfolio-dashboard/
├── 📄 index.html                      # Main entry point
├── 📄 README.md                       # Project overview
├── 📄 CONTRIBUTING.md                 # Contribution guidelines
├── 📄 REPOSITORY_GUIDE.md            # This file
│
├── 📁 src/                           # Source code
│   ├── 📁 css/                       # Stylesheets
│   │   └── dashboard-style.css       # Main styles (71KB)
│   │
│   ├── 📁 js/                        # JavaScript
│   │   ├── config.js                 # Configuration
│   │   ├── dashboard-script.js       # Main orchestrator
│   │   ├── GoogleAppsScript.gs       # Backend script
│   │   └── 📁 core/                  # Core modules
│   │       ├── utils.js              # Utilities
│   │       ├── state.js              # State management
│   │       ├── data-manager.js       # Data operations
│   │       └── ui-manager.js         # UI rendering ⚠️
│   │
│   └── 📁 assets/                    # Static assets
│
├── 📁 data/                          # Data files
│   ├── *.csv                         # Portfolio data
│   └── README.md                     # Data documentation
│
├── 📁 docs/                          # Documentation (organized)
│   ├── README.md                     # Documentation hub
│   ├── 📁 architecture/              # System design
│   ├── 📁 guides/                    # User & dev guides
│   ├── 📁 deployment/                # Deployment docs
│   ├── 📁 features/                  # Feature docs
│   ├── 📁 testing/                   # QA & testing
│   └── 📁 archive/                   # Historical docs
│
├── 📁 archive/                       # Code backups
│   └── *.html, *.js, *.css          # Old versions
│
└── 📁 _deployment_logs/              # Deployment history
    ├── deployment_history.log        # Log entries
    └── DEPLOYMENT_*.md               # Deployment reports
```

---

## 📂 Folder Purposes

### **`/` (Root)**
- `index.html` - Application entry point
- `README.md` - Project overview and quick start
- `CONTRIBUTING.md` - How to contribute
- `REPOSITORY_GUIDE.md` - This guide

**Keep root clean!** Only essential files here.

---

### **`src/` - Source Code**

#### **`src/css/`** - Stylesheets
- `dashboard-style.css` - All application styles
- Mercury Light theme with glass morphism
- Responsive design (mobile, tablet, desktop)
- **Size:** 71KB (526 CSS rules)

#### **`src/js/`** - JavaScript

**Top-level files:**
- `config.js` - Configuration (Google Apps Script URL)
- `dashboard-script.js` - Application initialization
- `GoogleAppsScript.gs` - Backend script (reference)

**`src/js/core/` - Core Modules:**
- `utils.js` - Utility functions (484 lines)
- `state.js` - State management (362 lines)
- `data-manager.js` - Data operations (1,251 lines)
- `ui-manager.js` - UI rendering (4,230 lines) ⚠️

**Module Loading Order (in index.html):**
```html
1. config.js          ← Configuration
2. utils.js           ← Foundation (no deps)
3. state.js           ← Foundation (no deps)
4. data-manager.js    ← Depends on utils, state
5. ui-manager.js      ← Depends on all above
6. dashboard-script.js ← Orchestrator
```

#### **`src/assets/`** - Static Assets
- Images, icons, fonts (if any)
- Currently empty

---

### **`data/` - Data Files**

- CSV files with portfolio data
- `README.md` explaining data structure
- Not committed to Git (too large)
- Data comes from Google Sheets via Apps Script

---

### **`docs/` - Documentation (Newly Organized)**

#### **Structure:**
```
docs/
├── README.md                    # Documentation hub (start here!)
│
├── architecture/                # System design & architecture
│   ├── CODE_ARCHITECTURE.md    # Detailed code structure
│   ├── ARCHITECTURE_REFACTOR_COMPLETE.md
│   └── ...
│
├── guides/                      # How-to guides
│   ├── DEVELOPER_GUIDE.md      # For developers
│   ├── USER_GUIDE_TABS.md      # For end users
│   └── ...
│
├── deployment/                  # Deployment procedures
│   ├── DEPLOYMENT_GUIDE.md     # How to deploy
│   ├── ROLLBACK_INSTRUCTIONS.md
│   └── ...
│
├── features/                    # Feature documentation
│   ├── USER_STORIES.md         # All features (34 stories)
│   ├── INSIGHTS_ANALYTICS_CONSOLIDATION_COMPLETE.md
│   ├── PLANNING_ACTION_DRILLDOWN_COMPLETE.md
│   └── ...
│
├── testing/                     # QA & test plans
│   ├── TEST_INSTRUCTIONS.md
│   ├── VERIFICATION_REPORT.md
│   └── ...
│
└── archive/                     # Historical documents
    └── PHASE*.md, *_COMPLETE.md
```

#### **Navigation:**
- **Start with:** `docs/README.md` (documentation hub)
- **For developers:** `docs/guides/DEVELOPER_GUIDE.md`
- **For architecture:** `docs/architecture/CODE_ARCHITECTURE.md`
- **For features:** `docs/features/USER_STORIES.md`

---

### **`archive/` - Code Backups**

- Backup files before major refactors
- Old versions of HTML, CSS, JS
- **Don't delete!** Useful for rollback
- Not actively maintained

---

### **`_deployment_logs/` - Deployment History**

- `deployment_history.log` - One-line entries
- `DEPLOYMENT_*.md` - Detailed reports
- Created automatically during deployments
- Useful for audit trail and rollback

---

## 📝 File Naming Conventions

### **Documentation:**
- `TOPIC_NAME.md` - Main documentation
- `TOPIC_NAME_GUIDE.md` - User guide
- `TOPIC_NAME_COMPLETE.md` - Completion report
- `TOPIC_NAME_IMPLEMENTATION.md` - Technical details

### **Code:**
- `kebab-case.js` - JavaScript files
- `kebab-case.css` - CSS files
- `PascalCase.gs` - Google Apps Script

### **Documentation Folders:**
- `lowercase/` - Folder names
- Clear, descriptive names

---

## 🔍 Finding What You Need

### **"I want to understand the code structure"**
→ `docs/architecture/CODE_ARCHITECTURE.md`

### **"I want to add a new feature"**
→ Start with `docs/guides/DEVELOPER_GUIDE.md`
→ Check `docs/features/USER_STORIES.md` for existing features

### **"I want to deploy changes"**
→ `docs/deployment/DEPLOYMENT_GUIDE.md`

### **"I want to fix a bug"**
→ Check `docs/architecture/CODE_ARCHITECTURE.md` for module structure
→ Use browser DevTools console to identify the module

### **"I want to test the application"**
→ `docs/testing/TEST_INSTRUCTIONS.md`

### **"I broke something and need to rollback"**
→ `docs/deployment/ROLLBACK_INSTRUCTIONS.md`

---

## 🚀 Quick Start Paths

### **New Developer Onboarding:**
1. Read `README.md`
2. Read `docs/README.md`
3. Read `docs/guides/DEVELOPER_GUIDE.md`
4. Review `docs/architecture/CODE_ARCHITECTURE.md`
5. Explore `src/js/core/` modules
6. Try local server: `python3 -m http.server 8080`

### **Contributing a Feature:**
1. Read `CONTRIBUTING.md`
2. Check `docs/features/USER_STORIES.md`
3. Review `docs/architecture/CODE_ARCHITECTURE.md`
4. Create feature branch
5. Make changes
6. Test locally
7. Submit PR

### **Fixing a Bug:**
1. Reproduce locally
2. Check browser console for errors
3. Identify module from `docs/architecture/CODE_ARCHITECTURE.md`
4. Fix in appropriate `src/js/core/*.js` file
5. Test fix
6. Submit PR

---

## 📊 Repository Statistics

### **Code:**
- **Total Lines:** 6,582 lines of JavaScript
- **Largest File:** ui-manager.js (4,230 lines) ⚠️
- **Modules:** 6 core JavaScript files
- **CSS Lines:** ~2,200 lines (526 rules)

### **Documentation:**
- **Total Docs:** 69 markdown files
- **Organized:** 6 categories + archive
- **Key Docs:** ~15 essential documents
- **Archive:** 26 historical documents

### **Repository:**
- **Size:** ~250KB (excluding node_modules, data)
- **Files:** ~100 files total
- **Commits:** 100+ commits
- **Contributors:** Open for contributions!

---

## 🔒 Best Practices

### **Code Organization:**
✅ Keep modules focused (single responsibility)  
✅ Use meaningful file names  
✅ Comment complex logic  
✅ Follow existing code style  
✅ Keep functions small (<50 lines)  

### **Documentation:**
✅ Update docs with code changes  
✅ Use clear headings and structure  
✅ Include examples  
✅ Archive obsolete docs (don't delete)  
✅ Link related documents  

### **Git Workflow:**
✅ Create feature branches  
✅ Write descriptive commit messages  
✅ Test before committing  
✅ Use Git tags for versions  
✅ Document deployments  

---

## ⚠️ Known Issues & Recommendations

### **Critical:**
🔴 **ui-manager.js is too large (4,230 lines)**
- Recommendation: Split into 8 focused modules
- See: `docs/architecture/CODE_ARCHITECTURE.md`

### **Important:**
🟡 **Documentation was flat (now fixed!)**
- ✅ Reorganized into 6 categories
- ✅ Created navigation hub

🟡 **No TypeScript type definitions**
- Recommendation: Add JSDoc comments or .d.ts files

### **Nice to Have:**
🟢 **No automated tests**
- Recommendation: Add unit tests for core modules

🟢 **No build pipeline**
- Recommendation: Add bundler for minification

---

## 🤝 Contributing

See `CONTRIBUTING.md` for detailed guidelines.

**Quick checklist:**
- [ ] Read developer guide
- [ ] Create feature branch
- [ ] Follow code style
- [ ] Test locally
- [ ] Update documentation
- [ ] Submit PR with description

---

## 📞 Need Help?

**Documentation Issues:**
- Check `docs/README.md` for navigation
- File GitHub issue with `documentation` label

**Code Questions:**
- Review `docs/architecture/CODE_ARCHITECTURE.md`
- Check `docs/guides/DEVELOPER_GUIDE.md`
- Ask in GitHub Discussions

**Bug Reports:**
- Check existing issues
- Include browser console output
- Describe steps to reproduce

---

## 🔄 Maintenance

### **Regular Tasks:**
- **Weekly:** Review open issues and PRs
- **Monthly:** Update dependencies (Chart.js, etc.)
- **Quarterly:** Review and archive old documentation
- **Yearly:** Major architecture review

### **After Each Deployment:**
- [ ] Create deployment log entry
- [ ] Update version numbers
- [ ] Tag commit
- [ ] Document any issues

---

## 📚 Additional Resources

**Internal:**
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [docs/README.md](./docs/README.md) - Documentation hub

**External:**
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Google Apps Script](https://developers.google.com/apps-script)

---

**Last Updated:** October 4, 2025  
**Maintained By:** Project maintainers  
**Questions?** File an issue or discussion on GitHub

Made with 📁 for better organization and clarity.
