/**
 * UI Cards Module
 * Handles product card rendering and statistics display
 * 
 * Part of the modular UI architecture refactor
 * @module ui-cards
 */

(function() {
    'use strict';
    
    /**
     * Render product cards (optimized compact design)
     */
    function renderCards() {
        const container = document.getElementById('cards-container');
        const emptyState = document.getElementById('empty-state');
        const filteredData = window.DataManager.getFilteredData();

        if (filteredData.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.classList.remove('hidden');

        container.innerHTML = filteredData.map(product => {
            // Get summary metrics for compact display
            const summary = window.DataManager.getCardSummaryMetrics(product);
            
            // Generate metric status indicators
            const uxIndicator = getMetricIndicator('UX', summary.uxStatus, summary.uxMetric, summary.uxValue, summary.uxTarget);
            const biIndicator = getMetricIndicator('BI', summary.biStatus, summary.biMetric, summary.biValue, summary.biTarget);
            
            return `
            <div class="product-card product-card-compact fade-in" data-product-id="${product.id}">
                <div class="card-header-compact">
                    <div class="card-title-compact">
                        ${window.Utils.escapeHtml(product.name)}
                    </div>
                    <span class="status-badge-compact ${window.Utils.getStatusClass(summary.maturity)}">
                        ${window.Utils.escapeHtml(summary.maturity)}
                    </span>
                </div>
                
                <div class="card-body-compact">
                    <div class="card-meta-row">
                        <div class="card-meta-item">
                            <span class="meta-icon">🏢</span>
                            <span class="meta-text">${window.Utils.escapeHtml(summary.area)}</span>
                        </div>
                        <div class="card-meta-item">
                            <span class="meta-icon">👤</span>
                            <span class="meta-text">${window.Utils.truncateText(window.Utils.escapeHtml(summary.owner), 25)}</span>
                        </div>
                    </div>
                    
                    <div class="card-problem">
                        ${window.Utils.truncateText(window.Utils.escapeHtml(summary.problem), 80)}
                    </div>
                    
                    <div class="card-metrics">
                        <div class="metric-label">Metrics vs Target:</div>
                        <div class="metric-indicators">
                            ${uxIndicator}
                            ${biIndicator}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
    
    /**
     * Generate metric indicator HTML
     */
    function getMetricIndicator(label, status, metricName, value, target) {
        let icon, tooltip, statusClass;
        
        switch (status) {
            case 'green':
                icon = '🟢';
                statusClass = 'metric-green';
                tooltip = `${label}: ${metricName}\nCurrent: ${value !== null ? value.toFixed(1) : 'N/A'} | Target: ${target !== null ? target.toFixed(1) : 'N/A'}\n✓ Meeting target`;
                break;
            case 'red':
                icon = '🔴';
                statusClass = 'metric-red';
                tooltip = `${label}: ${metricName}\nCurrent: ${value !== null ? value.toFixed(1) : 'N/A'} | Target: ${target !== null ? target.toFixed(1) : 'N/A'}\n✗ Below target`;
                break;
            case 'gray':
            default:
                icon = '⚪';
                statusClass = 'metric-gray';
                tooltip = `${label}: ${metricName === 'N/A' ? 'Not defined' : 'No data available'}`;
                break;
        }
        
        return `
            <div class="metric-indicator ${statusClass}" title="${tooltip}">
                <span class="metric-icon">${icon}</span>
                <span class="metric-label-text">${label}</span>
            </div>
        `;
    }
    
    /**
     * Update statistics display
     */
    function updateStats() {
        const statsBar = document.getElementById('stats-bar');
        statsBar.style.display = 'flex';

        const stats = window.DataManager.getProductStats();
        const missingMetrics = window.DataManager.countMissingMetrics();
        
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-showing').textContent = stats.showing;
        document.getElementById('stat-live').textContent = stats.live;
        document.getElementById('stat-dev').textContent = stats.dev;
        
        // Update data quality cards
        document.getElementById('stat-missing-ux').textContent = missingMetrics.missingUX;
        document.getElementById('stat-missing-bi').textContent = missingMetrics.missingBI;
    }
    
    /**
     * Update last fetch time display
     */
    function updateLastUpdateDisplay() {
        const lastUpdate = window.DataManager.getLastUpdateTime();
        if (lastUpdate) {
            document.getElementById('last-update').textContent = `Last updated: ${lastUpdate.toLocaleString()}`;
        }
    }
    
    // Export to window.UIManager.Cards namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Cards = {
        render: renderCards,
        updateStats,
        updateLastUpdateDisplay
    };
    
    console.log('✅ UI Cards module loaded');
})();
