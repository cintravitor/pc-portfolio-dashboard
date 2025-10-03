# 📊 P&C Portfolio Dashboard

**Version:** 3.0  
**Live Demo:** [https://cintravitor.github.io/pc-portfolio-dashboard/](https://cintravitor.github.io/pc-portfolio-dashboard/)

A modern, lightweight portfolio management dashboard that syncs with Google Sheets to provide real-time insights across your P&C product portfolio. Features three powerful views: detailed solution exploration, comprehensive analytics, and executive-level strategic metrics.

---

## ✨ Features

### 🎯 Three-Tab Interface

#### 1. **Portfolio Overview**
- 🔍 **Search & Filter** - Find solutions by name, problem, area, stage, or owner
- 📇 **Product Cards** - Visual cards displaying key solution information
- 📊 **Detail Panels** - Comprehensive solution details with interactive charts
- 📈 **Performance Metrics** - Monthly UX and Business Impact trends
- 🎨 **Mercury Light Theme** - Modern liquid glass design

#### 2. **Descriptive Analysis**
- 📊 **Portfolio Statistics** - Total solutions, stages, areas, owners
- 📉 **Maturity Distribution** - Solutions by maturity stage with insights
- ✅ **Metrics Coverage** - Track UX/BI metric definition completeness
- 🏢 **Area Analysis** - Distribution across P&C areas
- ⚖️ **Regulatory Mix** - Compliance vs. strategic investment balance
- 👥 **Owner Workload** - Top 10 solution owners ranked by count

#### 3. **Strategic View** 🆕
- 💚 **Portfolio Health Score** - Average performance vs target (0-100%)
- ⚠️ **Risk Distribution** - High/Medium/Low risk categorization
- 🎯 **Target Achievement** - Overall success rate across all products
- 📊 **Real-Time Calculations** - Automatic metric aggregation
- 🎨 **Executive-Ready Visuals** - Large, presentation-friendly metrics

### 🚀 Technical Highlights

- ⚡ **Vanilla JavaScript** - No frameworks, fast and lightweight
- 🎨 **Mercury Light Theme** - Glassmorphism design with liquid glass effects
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 💾 **Offline Capable** - LocalStorage caching for offline viewing
- 🔄 **Auto-Refresh** - Updates every 24 hours automatically
- 🔓 **No API Key Required** - Uses Google Apps Script (no Cloud Console needed)
- 📊 **Chart.js Integration** - Beautiful, interactive metric charts
- ⚡ **Lazy Loading** - Charts and analysis load only when needed

---

## 🚀 Quick Start

### Prerequisites

- Google Account with access to your portfolio spreadsheet
- Modern web browser (Chrome, Firefox, Safari, Edge)
- For local testing: Python, Node.js, or any simple web server

### Step 1: Setup Google Apps Script

1. Open your Google Sheet with P&C portfolio data
2. Click **Extensions → Apps Script**
3. Delete existing code and paste:

```javascript
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'descriptive') {
      return getDescriptiveData();
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: data,
        lastUpdated: new Date().toISOString(),
        rowCount: data.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy → New deployment → Web app**
5. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy** and copy the Web App URL

### Step 2: Configure Dashboard

1. Clone this repository:
```bash
git clone https://github.com/cintravitor/pc-portfolio-dashboard.git
cd pc-portfolio-dashboard
```

2. Edit `config.js` and add your Web App URL:
```javascript
const CONFIG = {
    WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_ID_HERE/exec'
};
```

### Step 3: Run Locally

Choose one method:

**Python:**
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

**Node.js:**
```bash
npx http-server -p 8000
# Open http://localhost:8000
```

**PHP:**
```bash
php -S localhost:8000
# Open http://localhost:8000
```

**VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → Open with Live Server

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [**USER_STORIES.md**](USER_STORIES.md) | Complete user stories for all features (31 stories) |
| [**USER_GUIDE_TABS.md**](USER_GUIDE_TABS.md) | User guide with workflows and tips |
| [**DESIGN_THEME.md**](DESIGN_THEME.md) | Mercury Light theme documentation |
| [**PHASE2_VERIFICATION.md**](PHASE2_VERIFICATION.md) | Strategic View calculation verification |
| [**ARCHITECTURE_ANALYSIS.md**](ARCHITECTURE_ANALYSIS.md) | Technical architecture review |
| [**ROLLBACK_INSTRUCTIONS.md**](ROLLBACK_INSTRUCTIONS.md) | How to rollback if issues occur |

---

## 🎯 Use Cases

### For Executives
- **Monthly Reviews:** Strategic View provides instant KPIs (< 30 seconds)
- **Board Presentations:** Screenshot-ready metrics with professional visuals
- **Risk Management:** Identify high-risk products requiring attention

### For Portfolio Managers
- **Planning Sessions:** Comprehensive analytics for data-driven decisions
- **Resource Allocation:** Identify workload imbalances across owners
- **Gap Analysis:** Spot areas needing investment or solutions

### For Product Owners
- **Performance Monitoring:** Track your solutions vs targets with charts
- **Self-Service:** Quickly find and review your solutions
- **Benchmark Awareness:** See how your solutions compare (Strategic View)

### For P&C Analysts
- **Data Quality:** Track metric definition coverage
- **Trend Analysis:** Identify patterns in portfolio composition
- **Stakeholder Reports:** Export-ready visualizations

---

## 🏗️ Architecture

### Technology Stack

```
Frontend:
  ├── HTML5 (semantic structure)
  ├── CSS3 (Mercury Light theme, glassmorphism)
  ├── Vanilla JavaScript ES6+ (no frameworks)
  └── Chart.js 4.4.0 (lazy-loaded for metrics)

Backend:
  ├── Google Apps Script (serverless)
  └── Google Sheets (data source)

Hosting:
  └── GitHub Pages (static hosting)
```

### Data Flow

```
Google Sheets
    ↓ (via Apps Script Web App)
portfolioData[]
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│ Portfolio       │ Descriptive     │ Strategic View  │
│ Overview        │ Analysis        │                 │
│                 │                 │                 │
│ • Cards         │ • Stats         │ • Health Score  │
│ • Filters       │ • Distribution  │ • Risk Levels   │
│ • Detail Panel  │ • Coverage      │ • Performance   │
│ • Charts        │ • Insights      │                 │
└─────────────────┴─────────────────┴─────────────────┘
    ↓
localStorage (cache)
```

### File Structure

```
pc-portfolio-dashboard/
│
├── index.html                    # Main HTML structure
├── dashboard-style.css           # Mercury Light theme styles
├── dashboard-script.js           # Core application logic
├── config.js                     # Google Apps Script URL
├── GoogleAppsScript.gs           # Backend API script
│
├── README.md                     # This file
├── USER_STORIES.md              # Complete user stories
├── USER_GUIDE_TABS.md           # User guide with workflows
├── DESIGN_THEME.md              # Design documentation
├── PHASE2_VERIFICATION.md       # Strategic View calculations
│
└── [other documentation files]
```

---

## 📊 Strategic View Calculations

### Portfolio Health Score
```javascript
For each product:
  - Count months where actualUX >= targetUX
  - Count months where actualBI >= targetBI
  
Portfolio Health = Average of (achievedMonths / totalMonths) * 100
```

### Risk Score (0-10 scale)
```javascript
Base Risk (Maturity Stage):
  • Development: +4 points
  • Growth: +2 points
  • Mature: +0 points
  • Decline: +3 points

Additional Risk Factors:
  • Missing UX metric: +1.5
  • Missing BI metric: +1.5
  • Missing UX target: +1
  • Missing BI target: +1
  • Missing owner: +1

Risk Categories:
  • High: 7-10 points
  • Medium: 4-6 points
  • Low: 0-3 points
```

See [PHASE2_VERIFICATION.md](PHASE2_VERIFICATION.md) for detailed examples.

---

## 🎨 Design Philosophy

### Mercury Light Theme

**Inspired by:** Liquid mercury, finance dashboards, modern glassmorphism

**Key Characteristics:**
- **Lightweight:** Almost transparent background (feels like a blank canvas)
- **Depth:** Multi-layered with subtle radial gradients
- **Liquid Glass:** Frosted glass effect on all interactive elements
- **High Contrast:** WCAG AA compliant text colors
- **Smooth Animations:** Hardware-accelerated transitions

**Visual Properties:**
- Background: `rgba(255, 255, 255, 0.45)` with `blur(20px)`
- Gradients: Indigo-based (`#6366f1` to `#764ba2`)
- Shadows: Soft indigo tint (`rgba(99, 102, 241, 0.08)`)
- Hover: Lifts elements with enhanced glow

See [DESIGN_THEME.md](DESIGN_THEME.md) for full documentation.

---

## 🔧 Customization

### Update Interval

Edit `dashboard-script.js`:

```javascript
// Change from 24 hours to 12 hours
const UPDATE_INTERVAL = 12 * 60 * 60 * 1000;
```

### Risk Score Weights

Edit `calculateRiskScore()` in `dashboard-script.js`:

```javascript
// Adjust maturity risk values
if (maturity.includes('development')) {
    riskScore += 5; // Increased from 4
}
```

### Color Scheme

Edit `dashboard-style.css`:

```css
:root {
    --primary: #667eea;        /* Change to your brand color */
    --mercury-accent: #6366f1; /* Main accent color */
}
```

### Metric Definitions

Edit your Google Sheet columns to add/remove metrics. The dashboard dynamically adapts to your data structure.

---

## 🚨 Troubleshooting

### Dashboard Shows "No Data Available"
**Solution:** 
1. Click "🔄 Refresh Data" button
2. Check `config.js` has correct Web App URL
3. Verify Google Apps Script is deployed as "Anyone can access"
4. Check browser console (F12) for errors

### Strategic View Shows Old Dummy Data
**Solution:**
1. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Clear browser cache
3. Try incognito mode

### Charts Not Appearing in Detail Panel
**Solution:**
1. Wait a moment for Chart.js to load (lazy loaded)
2. Check browser console for errors
3. Ensure monthly metric data is present in your sheet

### Filters Not Working
**Solution:**
1. Ensure you're on "Portfolio Overview" tab (filters only work there)
2. Click "Clear Filters" and try again
3. Refresh the page

### Mobile Layout Issues
**Solution:**
1. Ensure viewport meta tag is present
2. Test in different mobile browsers
3. Check if animations are disabled (performance setting)

---

## 🔄 Deployment

### GitHub Pages (Current)

This dashboard is deployed via GitHub Pages:

1. Push changes to `main` branch
2. GitHub Actions automatically builds and deploys
3. Live in 2-5 minutes at: https://cintravitor.github.io/pc-portfolio-dashboard/

### Alternative Hosting Options

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Any Web Host:**
- Upload all files via FTP
- Ensure `config.js` contains your Web App URL
- Access via your domain

---

## 🔒 Security Considerations

### Current Setup
- ✅ **Read-Only:** Dashboard only reads data, never writes
- ✅ **No API Key:** Uses Google Apps Script (no exposed credentials)
- ✅ **CORS Handled:** Apps Script handles cross-origin requests
- ⚠️ **Public URL:** Web App URL is accessible to anyone who has it

### Enhancing Security (Optional)

Add API key check to Apps Script:

```javascript
function doGet(e) {
  const SECRET_KEY = 'your-secret-key';
  
  if (e.parameter.key !== SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid API key'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ... rest of code
}
```

Then update fetch call:
```javascript
const response = await fetch(`${CONFIG.WEB_APP_URL}?key=your-secret-key`);
```

---

## 📈 Performance

### Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Initial Page Load | < 2s | ~800ms |
| Time to Interactive | < 2s | ~1.2s |
| Tab Switch | < 100ms | ~50ms |
| Search Response | < 300ms | ~200ms |
| Strategic Calculation | < 200ms | ~150ms (100 products) |

### Optimization Techniques

- ✅ **Lazy Loading:** Chart.js only loads when detail panel opens
- ✅ **Debouncing:** Search input debounced (300ms)
- ✅ **Caching:** Analysis results cached after first load
- ✅ **Hardware Acceleration:** CSS transforms for animations
- ✅ **Minimal Bundle:** No frameworks, ~20KB JS total
- ✅ **LocalStorage:** Data cached for offline capability

---

## 🧪 Testing

### Manual Testing Checklist

**Portfolio Overview:**
- [ ] Search finds solutions
- [ ] Filters work correctly
- [ ] Cards display properly
- [ ] Detail panel opens/closes
- [ ] Charts render correctly
- [ ] Stats update with filters

**Descriptive Analysis:**
- [ ] Analysis loads automatically
- [ ] All 6 sections display
- [ ] Counts are accurate
- [ ] Insights show correct percentages
- [ ] No errors in console

**Strategic View:**
- [ ] Portfolio Health calculates correctly
- [ ] Risk distribution shows counts
- [ ] Target achievement displays
- [ ] Metrics update on data refresh
- [ ] Error state shows if no data

**Cross-Tab:**
- [ ] Tabs switch smoothly
- [ ] Data persists across switches
- [ ] Filters hide/show appropriately
- [ ] Mobile responsive
- [ ] Offline mode works

---

## 🤝 Contributing

### Branching Strategy

```
main                 # Production branch (protected)
  ├── feat/feature-name   # Feature branches
  ├── fix/bug-name        # Bug fix branches
  └── docs/update-name    # Documentation updates
```

### Commit Convention

```bash
feat: Add new feature
fix: Fix bug in calculation
docs: Update README
style: Improve CSS styling
refactor: Restructure code
perf: Improve performance
test: Add tests
```

### Creating a Feature

1. Create feature branch: `git checkout -b feat/your-feature`
2. Make changes and test locally
3. Commit with descriptive message
4. Create pull request to `main`
5. Wait for review and approval
6. Merge to `main` (triggers deployment)

---

## 📊 Roadmap

### Completed Features ✅
- [x] Portfolio Overview with search and filters
- [x] Descriptive Analysis with 6 insight sections
- [x] Strategic View with health/risk/performance metrics
- [x] Mercury Light theme
- [x] Mobile responsive design
- [x] Chart.js integration
- [x] Offline capability
- [x] Auto-refresh (24 hours)
- [x] Google Apps Script backend

### Planned Features 🔮
- [ ] Export to PDF/CSV
- [ ] Drill-down from Strategic View (click to see high-risk products)
- [ ] Historical trend tracking
- [ ] Custom alerts for below-target metrics
- [ ] Comparison views (area vs area)
- [ ] Custom dashboard configuration
- [ ] Dark mode option
- [ ] Data refresh notifications

---

## 📞 Support

### Resources

- **User Stories:** [USER_STORIES.md](USER_STORIES.md)
- **User Guide:** [USER_GUIDE_TABS.md](USER_GUIDE_TABS.md)
- **GitHub Issues:** [Report a bug or request a feature](https://github.com/cintravitor/pc-portfolio-dashboard/issues)
- **Google Apps Script Docs:** [developers.google.com/apps-script](https://developers.google.com/apps-script)

### Common Issues

Check [USER_GUIDE_TABS.md](USER_GUIDE_TABS.md) § Troubleshooting for solutions to:
- Data not loading
- Tabs not switching
- Charts not appearing
- Filters not working
- Mobile layout problems

---

## 📜 License

**Internal Use Only**  
This dashboard is proprietary software for internal P&C portfolio management.

---

## 🙏 Acknowledgments

**Design Inspiration:**
- Apple iOS glassmorphism
- Microsoft Fluent Design System
- Modern finance dashboards

**Technologies:**
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [Google Apps Script](https://developers.google.com/apps-script) - Serverless backend
- [GitHub Pages](https://pages.github.com/) - Free hosting

---

## 📧 Contact

**Product Owner:** P&C Portfolio Team  
**Repository:** [github.com/cintravitor/pc-portfolio-dashboard](https://github.com/cintravitor/pc-portfolio-dashboard)  
**Live Site:** [cintravitor.github.io/pc-portfolio-dashboard](https://cintravitor.github.io/pc-portfolio-dashboard/)

---

**Built with ❤️ using Vanilla JavaScript, Mercury Light Theme, and Google Apps Script**

**Version 3.0** | October 2025 | [View Changelog](https://github.com/cintravitor/pc-portfolio-dashboard/commits/main)
