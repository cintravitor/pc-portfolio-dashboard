# P&C Portfolio Dashboard

An interactive dashboard for managing and visualizing the People & Culture (P&C) portfolio solutions.

## 🚀 Live Demo

Visit: [GitHub Pages URL]

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
│   ├── architecture/       # Architecture documentation
│   ├── deployment/         # Deployment guides
│   ├── features/           # Feature documentation
│   ├── guides/             # User and developer guides
│   ├── implementation/     # Implementation summaries
│   └── testing/            # Test documentation
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

### Core Dashboards
- **Strategic View**: Executive KPIs with interactive drill-down
- **Portfolio Overview**: Filterable cards with at-a-glance metrics
- **Descriptive Analysis**: Statistical insights and charts
- **Planning View**: Proactive anomaly detection and planning workspace

### Key Capabilities
- **Automated Anomaly Detection**: Owner over-allocation and data quality issues
- **Interactive Drill-Down**: Click KPIs to filter tactical view
- **Visual Filter Pills**: Easy filter management and removal
- **Progressive Disclosure**: Optimized detail panels with collapsible sections
- **Real-time Updates**: Auto-refresh from Google Sheets
- **Offline Support**: Local caching for offline access

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js
- **Backend**: Google Apps Script
- **Data Source**: Google Sheets
- **Hosting**: GitHub Pages

## 📖 Documentation

Full documentation is available in the [`docs/`](./docs/) folder. See [docs/README.md](./docs/README.md) for a complete index.

### Quick Links

#### User Documentation
- **[User Stories](./docs/features/USER_STORIES.md)** - Complete feature list (34 stories, all ✅ complete)
- **[User Journeys](./docs/features/user-journeys.md)** - Real-world use cases and workflows
- **[User Guide](./docs/guides/USER_GUIDE_TABS.md)** - How to use the dashboard
- **[Product Roadmap](./docs/features/PRODUCT_ROADMAP.md)** - Future enhancements and timeline

#### Technical Documentation
- **[Architecture](./docs/architecture/)** - System architecture and design decisions
- **[Developer Guide](./docs/guides/DEVELOPER_GUIDE.md)** - Technical documentation for contributors
- **[AI Features](./docs/features/AI_RECOMMENDATIONS_IMPLEMENTATION_GUIDE.md)** - AI-powered recommendations 🆕

#### Deployment & Setup
- **[Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)** - How to deploy
- **[Local Testing](./docs/guides/LOCAL_TESTING_GUIDE.md)** - Getting started locally
- **[Setup Instructions](./docs/deployment/SETUP_COMPLETE.md)** - Initial configuration

## 🚦 Getting Started

### For Users

1. Visit the live dashboard: [GitHub Pages URL]
2. Explore the 4 main views:
   - **Strategic View** - Executive KPIs
   - **Portfolio Overview** - Product cards and filters
   - **Descriptive Analysis** - Statistics and insights
   - **Planning View** - Anomaly detection and planning

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

**Last Updated**: October 19, 2025  
**Version**: 7.1.0  
**Status**: ✅ Production Ready

Made with ❤️ by the P&C team
