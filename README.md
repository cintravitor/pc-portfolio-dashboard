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
│   │   │   ├── utils.js        # Utility functions
│   │   │   ├── state.js        # State management
│   │   │   ├── data-manager.js # Data operations
│   │   │   └── ui-manager.js   # UI rendering
│   │   ├── config.js           # Configuration
│   │   ├── dashboard-script.js # Main orchestrator
│   │   └── GoogleAppsScript.gs # Backend script
│   ├── css/                # Stylesheets
│   │   └── dashboard-style.css
│   └── assets/             # Images and other assets
├── docs/                   # Documentation
│   ├── README.md           # Original documentation
│   ├── USER_STORIES.md     # User stories
│   ├── ARCHITECTURE_*.md   # Architecture docs
│   └── ...                 # Other documentation
├── data/                   # Data files
│   └── *.csv               # Portfolio datasets
└── deploy-mercury-theme.sh # Deployment script
```

## 🏗️ Architecture

The dashboard follows a modern, modular architecture:

- **State Management**: Centralized state through `core/state.js`
- **Utility Functions**: Reusable utilities in `core/utils.js`
- **Data Layer**: All data operations in `core/data-manager.js`
- **UI Layer**: Rendering and interactions in `core/ui-manager.js`
- **Orchestration**: Main coordination in `dashboard-script.js`

## 🎯 Features

- **Executive View**: Portfolio health score, risk & opportunity matrix
- **Portfolio Overview**: Filterable and sortable product cards
- **Descriptive Analysis**: Statistical insights and charts
- **Anomaly Detection**: Automated detection of owner over-allocation and data quality issues
- **Real-time Updates**: Auto-refresh from Google Sheets
- **Offline Support**: Local caching for offline access

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js
- **Backend**: Google Apps Script
- **Data Source**: Google Sheets
- **Hosting**: GitHub Pages

## 📖 Documentation

Full documentation is available in the [`docs/`](./docs/) folder:

- [User Guide](./docs/USER_GUIDE_TABS.md)
- [Architecture Overview](./docs/ARCHITECTURE_REFACTOR_COMPLETE.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Setup Instructions](./docs/SETUP_COMPLETE.md)
- [Anomaly Detection](./docs/ANOMALY_DETECTION_IMPLEMENTATION.md) - **NEW**

## 🚦 Getting Started

### Local Development

1. Clone the repository
2. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open http://localhost:8080 in your browser

### Configuration

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

## 📝 License

[Your License]

## 👥 Contributors

[Your Team]

---

**Last Updated**: October 2025
