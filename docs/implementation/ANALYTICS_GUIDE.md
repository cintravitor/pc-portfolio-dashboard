# 📊 Analytics System Documentation

## Overview

The P&C Portfolio Dashboard now includes a **lightweight, privacy-first analytics engine** that tracks user interactions locally in the browser.

**Version:** 1.0.0  
**Last Updated:** October 7, 2025  
**Status:** Production Ready  

---

## 🎯 Key Features

✅ **Privacy-First:** All data stored locally in browser  
✅ **No PII:** Zero personally identifiable information collected  
✅ **Anonymous Sessions:** Random session IDs only  
✅ **Zero Dependencies:** Pure vanilla JavaScript  
✅ **Export Ready:** Download as JSON or CSV  
✅ **Auto-Tracking:** Automatically tracks common interactions  
✅ **Opt-Out:** Users can disable tracking anytime  

---

## 🚀 Quick Start

### Check if Analytics is Working

Open browser console (F12) and type:

```javascript
// Check analytics status
Analytics.getSummary();

// Expected output:
// {
//   sessionId: "sess_1696708800000_abc123",
//   sessionStartTime: "2025-10-07T22:00:00.000Z",
//   totalEvents: 12,
//   eventsByType: {...},
//   isEnabled: true
// }
```

---

## 📋 What We Track

### Automatically Tracked Events

1. **Page Load**
   - When: User opens the dashboard
   - Data: Path, viewport size, load time

2. **Tab Switches**
   - When: User clicks navigation tabs
   - Data: From/to tab names

3. **Detail Panel Opens**
   - When: User clicks product card
   - Data: Product ID, product name

4. **Detail Section Expands**
   - When: User expands collapsible sections
   - Data: Section name

5. **Page Unload**
   - When: User closes/leaves page
   - Data: Session duration, event count

### Manual Tracking (For Custom Events)

You can track custom events using:

```javascript
Analytics.trackEvent('custom_event', {
    action: 'button_clicked',
    value: 123,
    metadata: 'any data you want'
});
```

---

## 🔧 API Reference

### Initialization

```javascript
// Initialize analytics (done automatically)
Analytics.init();
```

### Core Tracking

```javascript
// Track custom event
Analytics.trackEvent(eventType, eventDetails);

// Example:
Analytics.trackEvent('feature_used', {
    feature: 'export_button',
    format: 'csv'
});
```

### Specific Event Trackers

```javascript
// Track tab switch
Analytics.trackTabSwitch('explore', 'insights-analytics');

// Track detail panel opened
Analytics.trackDetailPanelOpen('product-123', 'Product Name');

// Track chart interaction
Analytics.trackChartInteraction('bar', 'click', { 
    chartName: 'Distribution by Area' 
});

// Track filter applied
Analytics.trackFilterApplied('area', 'HRBP');

// Track search
Analytics.trackSearch('keyword', 15); // query, results count
```

### Data Access

```javascript
// Get summary statistics
const summary = Analytics.getSummary();
console.log(summary);

// Get all events
const allEvents = Analytics.getEvents();

// Get filtered events
const tabSwitches = Analytics.getEvents({ 
    eventType: 'tab_switched' 
});

// Get events in time range
const recentEvents = Analytics.getEvents({
    startTime: '2025-10-07T00:00:00Z',
    endTime: '2025-10-07T23:59:59Z'
});
```

### Export Data

```javascript
// Export as JSON
const jsonData = Analytics.exportJSON();
console.log(jsonData);

// Export as CSV
const csvData = Analytics.exportCSV();
console.log(csvData);

// Download as file
Analytics.download('json'); // or 'csv'
```

### Privacy Controls

```javascript
// Check if enabled
if (Analytics.isEnabled()) {
    console.log('Analytics is tracking');
}

// Disable tracking
Analytics.disable();

// Enable tracking
Analytics.enable();

// Clear all data
Analytics.clearData();

// Clear only events (keep session)
Analytics.clearEvents();
```

---

## 📊 Understanding the Data

### Event Structure

Every tracked event has this structure:

```json
{
  "timestamp": "2025-10-07T22:15:30.123Z",
  "timestampMs": 1696711530123,
  "sessionId": "sess_1696708800000_abc123",
  "tabId": "tab_1696711500000_def456",
  "eventType": "tab_switched",
  "eventDetails": {
    "from": "explore",
    "to": "insights-analytics"
  },
  "sessionAge": 2730123,
  "path": "/",
  "hash": ""
}
```

### Summary Statistics

```javascript
{
  "sessionId": "sess_...",
  "sessionStartTime": "2025-10-07T22:00:00.000Z",
  "sessionDuration": 900000, // 15 minutes in ms
  "activeTime": 720000, // 12 minutes active
  "totalEvents": 45,
  "uniqueTabs": 1,
  "eventsByType": {
    "tab_switched": 8,
    "detail_panel_opened": 12,
    "filter_applied": 5,
    "search_performed": 3,
    "chart_interacted": 4
  },
  "isEnabled": true
}
```

---

## 🧪 Testing Analytics

### Console Testing

Open browser console (F12) and run:

```javascript
// Test 1: Check analytics is loaded
console.log('Analytics loaded:', typeof Analytics !== 'undefined');

// Test 2: Check session ID
console.log('Session ID:', Analytics.getSessionId());

// Test 3: Track custom event
Analytics.trackEvent('test_event', { foo: 'bar' });

// Test 4: View all events
console.table(Analytics.getEvents());

// Test 5: Get summary
console.log(Analytics.getSummary());

// Test 6: Export data
console.log('JSON Export:', Analytics.exportJSON());
console.log('CSV Export:', Analytics.exportCSV());
```

### Expected Flow

1. **Page Load:**
   - `session_started` or `tab_opened` event
   - `page_loaded` event

2. **User Interaction:**
   - Click tab → `tab_switched` event
   - Click product → `detail_panel_opened` event
   - Expand section → `detail_section_expanded` event
   - Apply filter → `filter_applied` event

3. **Page Unload:**
   - `page_unloaded` event (with session duration)

---

## 📈 Use Cases

### For Product Managers

**Question:** Which tab is most popular?

```javascript
const summary = Analytics.getSummary();
console.log(summary.eventsByType);

// Look for tab_switched events
const tabs = Analytics.getEvents({ eventType: 'tab_switched' });
const toTabs = tabs.map(e => e.eventDetails.to);
const counts = {};
toTabs.forEach(tab => counts[tab] = (counts[tab] || 0) + 1);
console.log('Tab popularity:', counts);
```

**Question:** What's the average session duration?

```javascript
const summary = Analytics.getSummary();
const durationMinutes = summary.sessionDuration / 1000 / 60;
console.log(`Session duration: ${durationMinutes.toFixed(1)} minutes`);
```

### For UX Designers

**Question:** Do users discover detail panels?

```javascript
const detailOpens = Analytics.getEvents({ 
    eventType: 'detail_panel_opened' 
}).length;

const totalEvents = Analytics.getSummary().totalEvents;
const discoverRate = (detailOpens / totalEvents * 100).toFixed(1);

console.log(`${detailOpens} detail panels opened (${discoverRate}% of interactions)`);
```

**Question:** Which sections do users expand most?

```javascript
const expansions = Analytics.getEvents({ 
    eventType: 'detail_section_expanded' 
});

const sections = {};
expansions.forEach(e => {
    const section = e.eventDetails.section;
    sections[section] = (sections[section] || 0) + 1;
});

console.log('Section popularity:', sections);
```

### For Developers

**Question:** Are there any errors?

```javascript
// Track errors manually
window.addEventListener('error', function(e) {
    Analytics.trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
    });
});

// Then query errors
const errors = Analytics.getEvents({ eventType: 'javascript_error' });
console.log('Errors detected:', errors.length);
```

---

## 🔒 Privacy & Compliance

### What We Collect

✅ **Anonymous Data:**
- Session IDs (random strings)
- Event types and timestamps
- Tab/section interactions
- Viewport size
- User agent (browser info)

### What We DON'T Collect

❌ **No PII:**
- Names, emails, or personal info
- IP addresses
- Location data
- Cookies or tracking pixels
- Cross-site behavior
- Detailed user agents (truncated)

### Data Storage

- **Where:** Browser's localStorage only
- **Duration:** Until user clears browser data
- **Max Size:** ~1000 events (auto-cleanup)
- **Encryption:** None (not sensitive data)

### User Control

Users can:
1. **View their data:** `Analytics.getEvents()`
2. **Export their data:** `Analytics.download('json')`
3. **Clear their data:** `Analytics.clearData()`
4. **Opt-out:** `Analytics.disable()`

### GDPR Compliance

✅ **Compliant because:**
- No personal data collected
- Data stays on user's device
- User has full control
- No external transmission
- Easy to delete

---

## 🛠️ Advanced Usage

### Custom Event Tracking

Track any custom interaction:

```javascript
// Feature usage
document.querySelector('#export-button').addEventListener('click', () => {
    Analytics.trackEvent('export_clicked', {
        format: 'csv',
        products: 127
    });
});

// Performance tracking
const startTime = performance.now();
// ... do something ...
const endTime = performance.now();
Analytics.trackEvent('operation_completed', {
    operation: 'data_load',
    duration: endTime - startTime
});

// A/B testing
Analytics.trackEvent('ab_test', {
    variant: 'new_ui',
    converted: true
});
```

### Multi-Tab Support

Analytics automatically tracks multiple tabs:

```javascript
// Each tab gets unique tabId
// But shares same sessionId

const summary = Analytics.getSummary();
console.log(`Session across ${summary.uniqueTabs} tabs`);
```

### Session Management

```javascript
// Get current session ID
const sessionId = Analytics.getSessionId();

// Session automatically expires after 30 minutes of inactivity
// New session created on next interaction
```

### Export Automation

```javascript
// Auto-export on page unload
window.addEventListener('beforeunload', () => {
    const data = Analytics.exportJSON();
    // Send to server (if you have one)
    // Or save to local file
    console.log('Exporting analytics:', data);
});
```

---

## 🐛 Troubleshooting

### Analytics not tracking?

```javascript
// Check if loaded
if (typeof Analytics === 'undefined') {
    console.error('Analytics not loaded!');
    // Check index.html includes analytics.js script
}

// Check if enabled
if (!Analytics.isEnabled()) {
    console.warn('Analytics disabled');
    Analytics.enable();
}
```

### No events captured?

```javascript
// Check events array
const events = Analytics.getEvents();
if (events.length === 0) {
    console.warn('No events captured yet');
    // Try manually tracking an event
    Analytics.trackEvent('test', { test: true });
}
```

### localStorage full?

```javascript
// Clear old events
Analytics.clearEvents();

// Or clear everything
Analytics.clearData();
```

---

## 📦 Integration Examples

### With Existing Dashboard

The analytics system is already integrated with:

✅ Tab navigation (auto-tracked)  
✅ Detail panels (auto-tracked)  
✅ Collapsible sections (auto-tracked)  

### Adding Custom Tracking

In `ui-filters.js`:

```javascript
function applyFilters() {
    // ... existing filter code ...
    
    // Track filter usage
    const area = document.getElementById('filter-area').value;
    const maturity = document.getElementById('filter-maturity').value;
    
    if (area) Analytics.trackFilterApplied('area', area);
    if (maturity) Analytics.trackFilterApplied('maturity', maturity);
}
```

In `ui-charts.js`:

```javascript
function createChart(config) {
    const chart = new Chart(ctx, config);
    
    // Track chart creation
    Analytics.trackEvent('chart_created', {
        type: config.type,
        dataPoints: config.data.datasets[0].data.length
    });
    
    return chart;
}
```

---

## 📊 Reporting Dashboard (Future Enhancement)

A visual analytics dashboard can be added to show:

- 📈 Session trends over time
- 🔥 Feature usage heatmap
- 🚶 User journey flows
- ⏱️ Time spent analysis
- 🎯 Goal completion rates

See `ui-analytics.js` (coming soon) for implementation.

---

## 🔄 Migration & Updates

### Version History

- **v1.0.0** (Oct 7, 2025)
  - Initial release
  - Core tracking engine
  - Auto-tracking for tabs, panels, sections
  - JSON/CSV export
  - Privacy controls

### Future Enhancements

- [ ] Visual analytics dashboard
- [ ] Real-time event streaming
- [ ] Goal tracking & funnels
- [ ] A/B testing framework
- [ ] Performance monitoring
- [ ] Error tracking integration

---

## 📚 Additional Resources

- **Source Code:** `src/js/core/analytics.js`
- **Integration:** `index.html`, `dashboard-script.js`
- **Architecture:** Module Pattern, localStorage API

---

## 🆘 Support

### Common Questions

**Q: Is this GDPR compliant?**  
A: Yes, no personal data is collected.

**Q: Can I disable analytics?**  
A: Yes, run `Analytics.disable()` in console.

**Q: Where is my data sent?**  
A: Nowhere! It stays in your browser.

**Q: How long is data kept?**  
A: Until you clear browser data or manually clear it.

**Q: Can I see all my data?**  
A: Yes, run `Analytics.getEvents()` in console.

---

**END OF ANALYTICS GUIDE**

For questions or issues, contact the development team.

