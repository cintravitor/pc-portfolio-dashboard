/**
 * UI Analytics Module
 * Renders the in-product analytics dashboard
 * 
 * Features:
 * - Session overview and metrics
 * - Event visualization
 * - Top pages/tabs tracking
 * - Export to Google Sheets functionality
 * - Real-time data from localStorage
 * 
 * Part of the modular UI architecture - integrates with window.Analytics
 */

(function() {
    'use strict';
    
    // ==================== CONSTANTS ====================
    
    const REFRESH_INTERVAL = 5000; // Refresh dashboard every 5 seconds
    let refreshIntervalId = null;
    
    // ==================== MAIN RENDERING ====================
    
    /**
     * Render the complete analytics dashboard
     * This is the main entry point called when switching to the Analytics tab
     */
    function renderAnalyticsDashboard() {
        const container = document.getElementById('tab-analytics-dashboard');
        
        if (!container) {
            console.error('Analytics: Dashboard container not found');
            return;
        }
        
        // Check if Analytics module is available
        if (typeof window.Analytics === 'undefined') {
            container.innerHTML = `
                <div class="analytics-error">
                    <h2>⚠️ Analytics Module Not Loaded</h2>
                    <p>The analytics tracking module is not available.</p>
                </div>
            `;
            return;
        }
        
        // Check if analytics is enabled
        if (!window.Analytics.isEnabled()) {
            container.innerHTML = `
                <div class="analytics-disabled">
                    <h2>📊 Analytics Disabled</h2>
                    <p>Analytics tracking is currently disabled.</p>
                    <button class="btn-primary" onclick="window.Analytics.enable(); window.UIAnalytics.renderAnalyticsDashboard();">
                        Enable Analytics
                    </button>
                </div>
            `;
            return;
        }
        
        // Get analytics data
        const summary = window.Analytics.getSummary();
        const allEvents = window.Analytics.getEvents();
        
        // Build dashboard HTML
        container.innerHTML = `
            <div class="analytics-dashboard">
                <!-- Header -->
                <div class="analytics-header">
                    <div class="analytics-title">
                        <h1>📊 Usage Analytics</h1>
                        <p class="analytics-subtitle">Real-time insights from your browsing session</p>
                    </div>
                    <div class="analytics-actions">
                        <button class="btn-secondary" onclick="window.UIAnalytics.refreshDashboard()">
                            🔄 Refresh
                        </button>
                        <button class="btn-primary" onclick="window.UIAnalytics.exportToGoogleSheets()">
                            📤 Export to Google Sheets
                        </button>
                    </div>
                </div>
                
                <!-- Session Overview -->
                <div class="analytics-section">
                    <h2>Session Overview</h2>
                    <div class="analytics-cards">
                        ${renderSessionCard(summary)}
                        ${renderEventsCard(summary, allEvents)}
                        ${renderActivityCard(summary)}
                        ${renderStorageCard(allEvents)}
                    </div>
                </div>
                
                <!-- Event Breakdown -->
                <div class="analytics-section">
                    <h2>Event Breakdown</h2>
                    <div class="analytics-grid">
                        <div class="analytics-panel">
                            ${renderEventsByTypeChart(summary.eventsByType)}
                        </div>
                        <div class="analytics-panel">
                            ${renderTopEvents(summary.eventsByType)}
                        </div>
                    </div>
                </div>
                
                <!-- User Journey -->
                <div class="analytics-section">
                    <h2>User Journey</h2>
                    <div class="analytics-grid">
                        <div class="analytics-panel">
                            ${renderPageVisits(allEvents)}
                        </div>
                        <div class="analytics-panel">
                            ${renderRecentActivity(allEvents)}
                        </div>
                    </div>
                </div>
                
                <!-- Data Management -->
                <div class="analytics-section">
                    <h2>Data Management</h2>
                    <div class="analytics-data-management">
                        <button class="btn-secondary" onclick="window.Analytics.download('json')">
                            💾 Download JSON
                        </button>
                        <button class="btn-secondary" onclick="window.Analytics.download('csv')">
                            📄 Download CSV
                        </button>
                        <button class="btn-warning" onclick="if(confirm('Clear all events from localStorage? This will not affect exported data.')) { window.Analytics.clearEvents(); window.UIAnalytics.refreshDashboard(); }">
                            🗑️ Clear Local Events
                        </button>
                        <button class="btn-danger" onclick="if(confirm('Disable analytics and clear all data? This cannot be undone.')) { window.Analytics.clearData(); window.Analytics.disable(); window.UIAnalytics.renderAnalyticsDashboard(); }">
                            ⚠️ Disable Analytics
                        </button>
                    </div>
                </div>
                
                <!-- Privacy Notice -->
                <div class="analytics-privacy">
                    <p><strong>🔒 Privacy First:</strong> All data is stored locally in your browser. No personal information is collected. Session IDs are anonymous and random.</p>
                </div>
            </div>
        `;
        
        // Start auto-refresh
        startAutoRefresh();
    }
    
    // ==================== SESSION CARDS ====================
    
    /**
     * Render session information card
     */
    function renderSessionCard(summary) {
        const duration = formatDuration(summary.sessionDuration);
        const activeTime = formatDuration(summary.activeTime);
        const startTime = new Date(summary.sessionStartTime).toLocaleString();
        
        return `
            <div class="analytics-card">
                <div class="card-icon">🔑</div>
                <div class="card-content">
                    <div class="card-label">Session ID</div>
                    <div class="card-value" title="${summary.sessionId}">${summary.sessionId.substring(0, 20)}...</div>
                    <div class="card-meta">Started: ${startTime}</div>
                    <div class="card-meta">Duration: ${duration}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render total events card
     */
    function renderEventsCard(summary, allEvents) {
        const eventsPerMinute = summary.activeTime > 0 ? 
            (summary.totalEvents / (summary.activeTime / 60000)).toFixed(1) : 0;
        
        return `
            <div class="analytics-card">
                <div class="card-icon">📊</div>
                <div class="card-content">
                    <div class="card-label">Total Events</div>
                    <div class="card-value">${summary.totalEvents}</div>
                    <div class="card-meta">${eventsPerMinute} events/min</div>
                    <div class="card-meta">${Object.keys(summary.eventsByType).length} event types</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render activity card
     */
    function renderActivityCard(summary) {
        const activeTime = formatDuration(summary.activeTime);
        const lastActivity = getLastActivityTime(summary);
        
        return `
            <div class="analytics-card">
                <div class="card-icon">⚡</div>
                <div class="card-content">
                    <div class="card-label">Activity</div>
                    <div class="card-value">${activeTime}</div>
                    <div class="card-meta">Active time</div>
                    <div class="card-meta">Last: ${lastActivity}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render storage usage card
     */
    function renderStorageCard(allEvents) {
        const storageSize = estimateStorageSize(allEvents);
        const storagePercent = ((storageSize / (5 * 1024 * 1024)) * 100).toFixed(1);
        
        return `
            <div class="analytics-card">
                <div class="card-icon">💾</div>
                <div class="card-content">
                    <div class="card-label">Storage</div>
                    <div class="card-value">${formatBytes(storageSize)}</div>
                    <div class="card-meta">${storagePercent}% of 5MB quota</div>
                    <div class="card-meta">~${(storageSize / allEvents.length).toFixed(0)} bytes/event</div>
                </div>
            </div>
        `;
    }
    
    // ==================== VISUALIZATIONS ====================
    
    /**
     * Render events by type chart
     */
    function renderEventsByTypeChart(eventsByType) {
        const sortedEvents = Object.entries(eventsByType)
            .sort((a, b) => b[1] - a[1]);
        
        const maxCount = sortedEvents[0]?.[1] || 1;
        
        const bars = sortedEvents.map(([type, count]) => {
            const percentage = (count / maxCount) * 100;
            const label = formatEventType(type);
            return `
                <div class="chart-bar-row">
                    <div class="chart-bar-label">${label}</div>
                    <div class="chart-bar-wrapper">
                        <div class="chart-bar" style="width: ${percentage}%"></div>
                        <div class="chart-bar-value">${count}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="analytics-chart">
                <h3>Events by Type</h3>
                <div class="chart-bars">
                    ${bars}
                </div>
            </div>
        `;
    }
    
    /**
     * Render top events list
     */
    function renderTopEvents(eventsByType) {
        const sortedEvents = Object.entries(eventsByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const total = Object.values(eventsByType).reduce((sum, count) => sum + count, 0);
        
        const rows = sortedEvents.map(([type, count], index) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const icon = getEventIcon(type);
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${icon} ${formatEventType(type)}</td>
                    <td class="text-right">${count}</td>
                    <td class="text-right">${percentage}%</td>
                </tr>
            `;
        }).join('');
        
        return `
            <div class="analytics-table-container">
                <h3>Top 10 Events</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Event Type</th>
                            <th class="text-right">Count</th>
                            <th class="text-right">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    /**
     * Render page visits tracking
     */
    function renderPageVisits(allEvents) {
        // Count tab switches
        const tabSwitches = allEvents
            .filter(e => e.eventType === 'tab_switched')
            .reduce((acc, e) => {
                const tab = e.eventDetails?.to || 'Unknown';
                acc[tab] = (acc[tab] || 0) + 1;
                return acc;
            }, {});
        
        const sortedTabs = Object.entries(tabSwitches)
            .sort((a, b) => b[1] - a[1]);
        
        if (sortedTabs.length === 0) {
            return `
                <div class="analytics-empty">
                    <p>No tab switches recorded yet</p>
                </div>
            `;
        }
        
        const rows = sortedTabs.map(([tab, count], index) => `
            <tr>
                <td>${index + 1}</td>
                <td>📑 ${tab}</td>
                <td class="text-right">${count}</td>
            </tr>
        `).join('');
        
        return `
            <div class="analytics-table-container">
                <h3>Tab Navigation</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tab</th>
                            <th class="text-right">Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    /**
     * Render recent activity timeline
     */
    function renderRecentActivity(allEvents) {
        const recentEvents = allEvents.slice(-15).reverse();
        
        if (recentEvents.length === 0) {
            return `
                <div class="analytics-empty">
                    <p>No recent activity</p>
                </div>
            `;
        }
        
        const rows = recentEvents.map(event => {
            const time = new Date(event.timestamp).toLocaleTimeString();
            const icon = getEventIcon(event.eventType);
            const label = formatEventType(event.eventType);
            const details = formatEventDetails(event.eventDetails);
            
            return `
                <div class="activity-row">
                    <div class="activity-time">${time}</div>
                    <div class="activity-content">
                        <div class="activity-type">${icon} ${label}</div>
                        ${details ? `<div class="activity-details">${details}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="analytics-timeline">
                <h3>Recent Activity (Last 15)</h3>
                <div class="timeline-content">
                    ${rows}
                </div>
            </div>
        `;
    }
    
    // ==================== ACTIONS ====================
    
    /**
     * Export data to Google Sheets
     */
    async function exportToGoogleSheets() {
        const button = event.target;
        const originalText = button.textContent;
        
        try {
            // Disable button and show loading
            button.disabled = true;
            button.textContent = '⏳ Exporting...';
            
            // Send data to backend
            const result = await window.Analytics.sendDataToBackend(false);
            
            if (result.success) {
                button.textContent = '✅ Exported!';
                alert(`Successfully exported ${result.successCount} events to Google Sheets!`);
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 3000);
            } else {
                button.textContent = '❌ Failed';
                alert(`Export failed: ${result.message}`);
                
                // Reset button
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 3000);
            }
            
        } catch (error) {
            console.error('Export error:', error);
            button.textContent = '❌ Error';
            alert(`Export error: ${error.message}`);
            
            // Reset button
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
        }
    }
    
    /**
     * Refresh dashboard data
     */
    function refreshDashboard() {
        renderAnalyticsDashboard();
    }
    
    /**
     * Start auto-refresh timer
     */
    function startAutoRefresh() {
        // Clear existing interval
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
        }
        
        // Set up new interval
        refreshIntervalId = setInterval(() => {
            // Only refresh if analytics tab is active
            const analyticsTab = document.getElementById('tab-analytics-dashboard');
            if (analyticsTab && analyticsTab.classList.contains('active')) {
                refreshDashboard();
            }
        }, REFRESH_INTERVAL);
    }
    
    /**
     * Stop auto-refresh timer
     */
    function stopAutoRefresh() {
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
            refreshIntervalId = null;
        }
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Format duration in milliseconds to human-readable string
     */
    function formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
        if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
        return `${(ms / 3600000).toFixed(1)}h`;
    }
    
    /**
     * Format bytes to human-readable string
     */
    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    /**
     * Estimate storage size of events
     */
    function estimateStorageSize(events) {
        try {
            return JSON.stringify(events).length;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * Get last activity time
     */
    function getLastActivityTime(summary) {
        const now = Date.now();
        const sessionStart = new Date(summary.sessionStartTime).getTime();
        const lastActivity = sessionStart + summary.activeTime;
        const diff = now - lastActivity;
        
        if (diff < 5000) return 'Just now';
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return `${Math.floor(diff / 3600000)}h ago`;
    }
    
    /**
     * Format event type for display
     */
    function formatEventType(type) {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Get icon for event type
     */
    function getEventIcon(type) {
        const icons = {
            'session_started': '🚀',
            'tab_opened': '🪟',
            'page_loaded': '📄',
            'tab_switched': '🔄',
            'detail_panel_opened': '📋',
            'detail_section_expanded': '📂',
            'chart_interacted': '📊',
            'filter_applied': '🔍',
            'search_performed': '🔎',
            'page_unloaded': '👋'
        };
        return icons[type] || '📌';
    }
    
    /**
     * Format event details for display
     */
    function formatEventDetails(details) {
        if (!details || typeof details !== 'object') return '';
        
        const important = [];
        if (details.from && details.to) important.push(`${details.from} → ${details.to}`);
        if (details.productName) important.push(details.productName);
        if (details.section) important.push(details.section);
        if (details.filterName) important.push(`${details.filterName}: ${details.value}`);
        if (details.chartType) important.push(details.chartType);
        
        return important.join(' · ');
    }
    
    // ==================== PUBLIC API ====================
    
    // Expose public interface
    window.UIAnalytics = {
        renderAnalyticsDashboard: renderAnalyticsDashboard,
        refreshDashboard: refreshDashboard,
        exportToGoogleSheets: exportToGoogleSheets,
        startAutoRefresh: startAutoRefresh,
        stopAutoRefresh: stopAutoRefresh
    };
    
    console.log('UI Analytics: Module loaded');
    
})();

