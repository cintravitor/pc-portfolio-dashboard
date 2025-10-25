/**
 * UI Charts Module
 * Handles Chart.js loading and metric chart rendering
 * 
 * Part of the modular UI architecture refactor
 * @module ui-charts
 */

(function() {
    'use strict';
    
    /**
     * Lazy load Chart.js library when needed
     * This improves initial page load by ~200ms and saves ~120KB
     */
    function loadChartJs() {
        if (window.Chart || window.State.isChartJsLoaded()) {
            return Promise.resolve();
        }
        
        console.log('Loading Chart.js...');
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = () => {
                window.State.setChartJsLoaded(true);
                console.log('Chart.js loaded successfully');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Chart.js'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Render metric chart with Chart.js
     */
    function renderMetricChart(canvasId, monthlyData, targetValue, metricName) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`Canvas element '${canvasId}' not found`);
                return;
            }
            
            // Destroy existing chart if it exists (use State)
            const existingChart = window.State.getChartInstance(canvasId);
            if (existingChart) {
                existingChart.destroy();
            }
            
            const ctx = canvas.getContext('2d');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Parse monthly data (convert strings to numbers, handle empty values)
        const actualData = monthlyData.map(value => {
            if (!value || value === '' || value === '-' || value === 'N/A') return null;
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        });
        
        // Parse target value
        const target = targetValue && targetValue !== '' && targetValue !== '-' ? parseFloat(targetValue) : null;
        
        // Create target line data (same value for all months)
        const targetData = target !== null ? Array(12).fill(target) : [];
        
        // Filter out months with no data
        const hasData = actualData.some(v => v !== null) || target !== null;
        
        if (!hasData) {
            // Show "No data available" message
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 2rem;">No data available for this metric</p>';
            return;
        }
        
        // Register custom plugin for data labels
        const dataLabelsPlugin = {
            id: 'customDataLabels',
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, i) => {
                    // Only show labels for actual data (first dataset)
                    if (i !== 0) return;
                    
                    const meta = chart.getDatasetMeta(i);
                    if (!meta.hidden) {
                        meta.data.forEach((element, index) => {
                            const value = dataset.data[index];
                            if (value === null || value === undefined) return;
                            
                            // Format value
                            let label;
                            if (value >= 0 && value <= 1) {
                                label = Math.round(value * 100);
                            } else {
                                label = Math.round(value);
                            }
                            
                            // Draw label
                            ctx.save();
                            ctx.fillStyle = '#667eea';
                            ctx.font = '600 11px Inter';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(label, element.x, element.y - 10);
                            ctx.restore();
                        });
                    }
                });
            }
        };
        
        // Create chart and store in State
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Actual',
                        data: actualData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        spanGaps: true
                    },
                    ...(target !== null ? [{
                        label: 'Target',
                        data: targetData,
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [10, 5],
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        tension: 0
                    }] : [])
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleFont: {
                            size: 13,
                            weight: '600',
                            family: "'Inter', sans-serif"
                        },
                        bodyFont: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // Format based on value type
                                    const value = context.parsed.y;
                                    if (value >= 0 && value <= 1) {
                                        label += (value * 100).toFixed(1) + '%';
                                    } else {
                                        label += value.toLocaleString();
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                family: "'Inter', sans-serif"
                            },
                            color: '#6b7280',
                            callback: function(value) {
                                // Format Y-axis labels
                                if (value >= 0 && value <= 1) {
                                    return (value * 100).toFixed(0) + '%';
                                }
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                family: "'Inter', sans-serif"
                            },
                            color: '#6b7280'
                        }
                    }
                }
            },
            plugins: [dataLabelsPlugin]
        });
            
            // Store chart instance in State
            window.State.setChartInstance(canvasId, chart);
            
        } catch (error) {
            console.error('Error rendering chart:', error);
            const canvas = document.getElementById(canvasId);
            if (canvas && canvas.parentElement) {
                canvas.parentElement.innerHTML = 
                    '<p style="color: #ef4444; text-align: center; padding: 2rem;">Chart rendering failed. Please refresh the page.</p>';
            }
        }
    }
    
    // Export to window.UIManager.Charts namespace
    if (!window.UIManager) window.UIManager = {};
    window.UIManager.Charts = {
        loadChartJs,
        renderMetricChart
    };
    
    console.log('✅ UI Charts module loaded');
})();
