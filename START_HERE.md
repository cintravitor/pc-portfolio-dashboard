# 🚀 P&C Portfolio Dashboard - Quick Start Guide

Welcome to the P&C Portfolio Dashboard! This guide will help you get started quickly.

---

## 📋 Quick Start (5 Minutes)

### For Users

1. **Visit the live dashboard:**  
   [https://cintravitor.github.io/pc-portfolio-dashboard/](https://cintravitor.github.io/pc-portfolio-dashboard/)

2. **Explore the features:**
   - **Explorer Tab** - Browse all products with filters
   - **Executive View** - High-level KPIs and metrics
   - **Insights & Analytics** - Data analysis and trends
   - **Planning & Action** - Anomaly detection and recommendations

### For Developers

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cintravitor/pc-portfolio-dashboard.git
   cd pc-portfolio-dashboard
   ```

2. **Start local server:**
   ```bash
   python3 -m http.server 8080
   ```

3. **Open in browser:**
   ```bash
   open http://localhost:8080
   ```

4. **Make changes and test:**
   - Edit files in `src/`
   - Refresh browser to see changes
   - Check browser console for errors

---

## 📁 Repository Structure

```
├── src/
│   ├── js/core/          # Core modules (AI, data, state, UI)
│   ├── js/config.js      # Configuration (API keys, settings)
│   └── css/              # Stylesheets
├── docs/
│   ├── architecture/     # Architecture documentation
│   ├── deployment/       # Deployment guides
│   ├── features/         # Feature documentation
│   ├── guides/           # User and developer guides
│   ├── implementation/   # Implementation summaries
│   └── testing/          # Test documentation
├── tests/                # Test files
├── scripts/              # Utility scripts
├── data/                 # CSV data files
└── google-apps-script/   # Backend scripts
```

---

## 🔧 Configuration

### API Keys Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `src/js/config.js` with your keys:
   - **Google Apps Script URL** - Get from Apps Script deployment
   - **LiteLLM API Key** - Get from LiteLLM dashboard

3. **Important:** Never commit real API keys to version control!

See detailed configuration guide: [docs/guides/DEVELOPER_GUIDE.md](./docs/guides/DEVELOPER_GUIDE.md)

---

## 🎯 Key Features

### AI-Powered Recommendations 🆕
- Contextual insights using GPT-4o Mini
- Appears below metric charts in detail panels
- Based on product context, maturity, and performance trends

### Modular Architecture
- Clean separation of concerns
- Easy to extend and maintain
- Comprehensive error handling

### Real-time Data
- Connects to Google Sheets via Apps Script
- Auto-refresh every 24 hours
- Manual refresh available

---

## 📖 Documentation

### Essential Reading
- **[README.md](./README.md)** - Complete project overview
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[docs/README.md](./docs/README.md)** - Documentation index

### Quick Links
- **User Guide:** [docs/guides/USER_GUIDE_TABS.md](./docs/guides/USER_GUIDE_TABS.md)
- **Developer Guide:** [docs/guides/DEVELOPER_GUIDE.md](./docs/guides/DEVELOPER_GUIDE.md)
- **Deployment Guide:** [docs/deployment/DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md)
- **AI Features:** [docs/features/AI_RECOMMENDATIONS_IMPLEMENTATION_GUIDE.md](./docs/features/AI_RECOMMENDATIONS_IMPLEMENTATION_GUIDE.md)

---

## 🧪 Testing

### Run Tests Locally

1. **Start local server** (if not running):
   ```bash
   python3 -m http.server 8080
   ```

2. **Open test files:**
   - Unit tests: `tests/*.test.js`
   - Smoke tests: `tests/smoke-detectors.test.html`

3. **Run tests in browser console:**
   ```javascript
   // Open DevTools (F12) and run:
   window.runTests()
   ```

### Manual Testing
- Open the dashboard
- Click through all tabs
- Test filters and search
- Open product details
- Verify AI recommendations appear
- Check for console errors

---

## 🚀 Deployment

### Deploy to Production

1. **Ensure all tests pass**
2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```
3. **Push to main:**
   ```bash
   git push origin main
   ```
4. **GitHub Pages auto-deploys** - Wait 2-3 minutes

### Deployment Checklist
See: [docs/deployment/DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md)

---

## 🔍 Troubleshooting

### Common Issues

**Dashboard won't load:**
- Check browser console for errors
- Verify local server is running on port 8080
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

**AI recommendations not appearing:**
- Check `src/js/config.js` has valid API key
- Verify `AI_RECOMMENDATIONS_ENABLED: true`
- Check browser console for API errors
- Clear cache: `window.AIRecommendations.clearCache()`

**Data not loading:**
- Verify Google Apps Script URL in `config.js`
- Check Apps Script deployment is published
- Test URL directly in browser

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with conventional commits:**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push and create Pull Request**

See detailed guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📞 Need Help?

- **Documentation:** Browse [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/cintravitor/pc-portfolio-dashboard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/cintravitor/pc-portfolio-dashboard/discussions)

---

## ✅ Next Steps

1. ✅ Read [README.md](./README.md) for complete overview
2. ✅ Review [docs/features/USER_STORIES.md](./docs/features/USER_STORIES.md) for feature list
3. ✅ Check [docs/architecture/](./docs/architecture/) for technical details
4. ✅ Start contributing! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Last Updated:** October 19, 2025  
**Version:** 7.1.0  
**Status:** ✅ Production Ready

Happy coding! 🎉
