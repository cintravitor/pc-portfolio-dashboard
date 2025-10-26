# P&C Portfolio Dashboard

![Version](https://img.shields.io/badge/version-6.3.0-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

An interactive dashboard for managing and visualizing the People & Culture (P&C) portfolio solutions with AI-powered insights and strategic governance features.

## 🚀 Live Demo

Visit: https://cintravitor.github.io/pc-portfolio-dashboard/

## 📁 Project Structure

```
├── index.html              # Main dashboard page
├── src/                    # Source files
│   ├── js/                 # JavaScript files
│   │   ├── core/           # Core modules
│   │   │   ├── ai-recommendations.js # AI-powered recommendations
│   │   │   ├── utils.js        # Utility functions
│   │   │   ├── state.js        # State management
│   │   │   ├── data-manager.js # Data operations
│   │   │   └── ui/             # UI modules
│   │   │       ├── ui-cards.js
│   │   │       ├── ui-filters.js
│   │   │       ├── ui-detail-panel.js
│   │   │       └── ...
│   │   ├── config.js           # Configuration
│   │   ├── dashboard-script.js # Main orchestrator
│   │   └── GoogleAppsScript.gs # Backend script
│   ├── css/                # Stylesheets
│   │   └── dashboard-style.css
│   └── assets/             # Images and other assets
├── docs/                   # Documentation
│   ├── getting-started/    # Setup and deployment guides
│   ├── architecture/       # System design documentation
│   ├── api/                # API reference
│   ├── features/           # Feature documentation
│   ├── contributing/       # Contributor guidelines
│   ├── guides/             # Additional guides
│   ├── testing/            # Test documentation
│   └── archive/            # Historical documentation
├── tests/                  # Test files
├── scripts/                # Utility scripts
├── data/                   # Data files
│   └── *.csv               # Portfolio datasets
└── google-apps-script/     # Backend scripts
```

## 🏗️ Architecture

The dashboard follows a modern, modular architecture:

- **State Management**: Centralized state through `core/state.js`
- **Utility Functions**: Reusable utilities in `core/utils.js`
- **Data Layer**: All data operations in `core/data-manager.js`
- **UI Layer**: Rendering and interactions in `core/ui-manager.js`
- **Orchestration**: Main coordination in `dashboard-script.js`

## 🎯 Features

### Two Main Views

#### 🔍 Explore Tab
- **AI-Powered Cards**: Solution cards with AI-generated summaries (120-147 chars)
- **Smart Filtering**: Multi-select filters by area, maturity, and owner
- **Smoke Detectors**: Automated issue detection with visual indicators
- **Detail Panels**: Comprehensive solution details with metric charts
- **Search**: Fast text search across solutions

#### 💡 Insights Tab (Consolidated Dashboard)
- **Action Layer**: AI-driven insights and recommendations
- **Smoke Detector Scorecard**: Interactive drill-down for issues
- **Metrics Coverage**: UX/BI achievement tracking with gauges
- **Portfolio Distribution**: Column charts for Journey, Maturity, P&C Area
- **Resource Allocation**: BAU anomaly detection and team consumption
- **Executive Metrics**: High-level portfolio KPIs and performance tracking
- **Collapsible Sections**: Organized, scannable layout

### Key Capabilities
- 🤖 **AI Integration**: LiteLLM-powered summaries and recommendations
- 🔥 **Smoke Detectors**: Automated quality and health monitoring
- 📊 **Advanced Visualizations**: Column charts, gauges, and interactive graphs
- 🔄 **Real-time Updates**: Live data from Google Sheets
- 💾 **Offline Support**: Local caching for offline access
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js
- **Backend**: Google Apps Script
- **Data Source**: Google Sheets
- **Hosting**: GitHub Pages

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder.

**📚 [Documentation Index](./docs/README.md)** - Start here for all documentation

### Quick Links

#### Getting Started
- **[Quick Start Guide](./docs/getting-started/quick-start.md)** - Get up and running in 5 minutes
- **[Local Development](./docs/getting-started/local-development.md)** - Set up your dev environment
- **[Deployment Guide](./docs/getting-started/deployment.md)** - Deploy to production

#### Features & User Guides
- **[Governance Dashboard](./docs/features/GOVERNANCE_DASHBOARD.md)** - Strategic insights (v6.3.0)
- **[AI Features](./docs/features/AI_FEATURES_USER_STORIES.md)** - AI-powered capabilities
- **[Smoke Detectors](./docs/features/SMOKE_DETECTORS_README.md)** - Automated issue detection
- **[User Stories](./docs/features/USER_STORIES.md)** - Complete feature list

#### Technical Documentation
- **[Architecture Overview](./docs/architecture/overview.md)** - System design and patterns
- **[Data Flow](./docs/architecture/data-flow.md)** - How data moves through the system
- **[Module Structure](./docs/architecture/module-structure.md)** - Code organization
- **[Data Manager API](./docs/api/data-manager.md)** - Data operations API
- **[UI Modules API](./docs/api/ui-modules.md)** - UI components API
- **[Apps Script API](./docs/api/apps-script.md)** - Backend API reference

#### Contributing
- **[Code Standards](./docs/contributing/code-standards.md)** - Style guide and best practices
- **[Testing Guide](./docs/contributing/testing.md)** - Testing procedures

## 🚦 Getting Started

### For Users

1. **Visit the live dashboard**: https://cintravitor.github.io/pc-portfolio-dashboard/
2. **Navigate between two main views**:
   - **🔍 Explore** - Browse solutions with AI summaries and filters
   - **💡 Insights** - Strategic insights, portfolio health, and executive metrics
3. **Read the** [Quick Start Guide](./docs/getting-started/quick-start.md) for detailed usage

### For Developers

#### Quick Start

```bash
# Clone the repository
git clone https://github.com/cintravitor/pc-portfolio-dashboard.git
cd pc-portfolio-dashboard

# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

#### Contributing

We welcome contributions! Please see:
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** - Developer documentation

**Quick Links:**
- 🐛 [Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Request a Feature](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔀 [Submit a Pull Request](.github/pull_request_template.md)

#### Configuration

Edit `src/js/config.js` to set your Google Apps Script web app URL:

```javascript
const CONFIG = {
    WEB_APP_URL: 'YOUR_WEB_APP_URL_HERE'
};
```

## 🎨 Design

The dashboard uses a modern "Liquid Glass Card" design with:
- Frosted glass effects
- Smooth animations
- Responsive layout
- Dark mode support

## 📊 Data Source

Data is fetched from Google Sheets via Google Apps Script. The backend script (`src/js/GoogleAppsScript.gs`) should be deployed as a web app.

## 🔄 Updates

The dashboard automatically checks for updates every 24 hours. Manual refresh is available via the "Refresh Data" button.

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Development Resources

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** - Technical documentation
- **[PRODUCT_ROADMAP.md](./docs/PRODUCT_ROADMAP.md)** - Future plans
- **[USER_STORIES.md](./docs/USER_STORIES.md)** - Feature specifications

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our Code of Conduct in [CONTRIBUTING.md](./CONTRIBUTING.md).

## 👥 Contributors

Thank you to all contributors who have helped make this project better!

<!-- Contributors will be listed here -->

Want to see your name here? Check out [CONTRIBUTING.md](./CONTRIBUTING.md) to get started!

## 📝 License

[Your License Here]

## 🌟 Acknowledgments

- Built with vanilla JavaScript for simplicity and performance
- Powered by Google Sheets and Google Apps Script
- Visualizations by Chart.js
- Inspired by modern dashboard design principles

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/cintravitor/pc-portfolio-dashboard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/cintravitor/pc-portfolio-dashboard/discussions)
- **Documentation:** [docs/](./docs/)

---

**Version**: 6.3.0  
**Last Updated**: October 21, 2025  
**Status**: ✅ Production Ready

Made with ❤️ by the P&C team
