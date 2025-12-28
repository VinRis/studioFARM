// Chart.js Wrapper for Farm Management
class FarmCharts {
    constructor() {
        this.charts = new Map();
        this.colors = {
            primary: '#4CAF50',
            secondary: '#FFC107',
            accent: '#2196F3',
            danger: '#F44336',
            success: '#8BC34A',
            warning: '#FF9800',
            info: '#00BCD4'
        };
        
        // Dark mode colors
        this.darkColors = {
            primary: '#66BB6A',
            secondary: '#FFCA28',
            accent: '#42A5F5',
            danger: '#EF5350',
            success: '#7CB342',
            warning: '#FFB74D',
            info: '#26C6DA'
        };
    }

    getColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? this.darkColors : this.colors;
    }

    // Production Chart
    renderProductionChart(data, livestock) {
        const canvas = document.getElementById('production-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.has('production')) {
            this.charts.get('production').destroy();
        }
        
        const colors = this.getColors();
        const isDairy = livestock === 'dairy';
        
        const chartData = {
            labels: data.map(d => d.period),
            datasets: [{
                label: isDairy ? 'Milk Production (L)' : 'Egg Production',
                data: data.map(d => d.total),
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
        
        const chart = new Chart(canvas, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            }
                        }
                    }
                }
            }
        });
        
        this.charts.set('production', chart);
    }

    // Finance Chart
    renderFinanceChart(data, livestock) {
        const canvas = document.getElementById('finance-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.has('finance')) {
            this.charts.get('finance').destroy();
        }
        
        const colors = this.getColors();
        
        const chartData = {
            labels: data.map(d => d.period),
            datasets: [
                {
                    label: 'Income',
                    data: data.map(d => d.income),
                    borderColor: colors.success,
                    backgroundColor: colors.success + '40',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Expenses',
                    data: data.map(d => d.expense),
                    borderColor: colors.danger,
                    backgroundColor: colors.danger + '40',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Profit',
                    data: data.map(d => d.profit),
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '40',
                    borderWidth: 2,
                    fill: false,
                    type: 'line'
                }
            ]
        };
        
        const chart = new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += 'KES ' + context.parsed.y.toLocaleString();
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        stacked: false,
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            },
                            callback: function(value) {
                                return 'KES ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        this.charts.set('finance', chart);
    }

    // Health Distribution Chart
    renderHealthChart(data) {
        const canvas = document.getElementById('health-chart');
        if (!canvas) return;
        
        const colors = this.getColors();
        
        const chartData = {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    colors.primary,
                    colors.secondary,
                    colors.accent,
                    colors.danger,
                    colors.success
                ],
                borderWidth: 1,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface')
            }]
        };
        
        return new Chart(canvas, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                family: "'Roboto', sans-serif"
                            }
                        }
                    }
                }
            }
        });
    }

    // Destroy all charts
    destroyAllCharts() {
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
    }

    // Update chart colors for theme change
    updateChartColors() {
        const colors = this.getColors();
        
        this.charts.forEach((chart, key) => {
            if (key === 'production') {
                chart.data.datasets[0].borderColor = colors.primary;
                chart.data.datasets[0].backgroundColor = colors.primary + '20';
            } else if (key === 'finance') {
                chart.data.datasets[0].borderColor = colors.success;
                chart.data.datasets[0].backgroundColor = colors.success + '40';
                chart.data.datasets[1].borderColor = colors.danger;
                chart.data.datasets[1].backgroundColor = colors.danger + '40';
                chart.data.datasets[2].borderColor = colors.primary;
                chart.data.datasets[2].backgroundColor = colors.primary + '40';
            }
            
            chart.update('none');
        });
    }

    // Export chart as image
    exportChartAsImage(chartId, filename = 'chart.png') {
        const chart = this.charts.get(chartId);
        if (!chart) return;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = chart.toBase64Image();
        link.click();
    }

    // Create chart for PDF report
    createChartForPDF(chartId, width = 800, height = 400) {
        const chart = this.charts.get(chartId);
        if (!chart) return null;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface');
        tempCtx.fillRect(0, 0, width, height);
        
        // Clone chart with new dimensions
        const tempChart = new Chart(tempCtx, {
            type: chart.config.type,
            data: JSON.parse(JSON.stringify(chart.config.data)),
            options: {
                ...chart.config.options,
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    ...chart.config.options.plugins,
                    legend: {
                        ...chart.config.options.plugins?.legend,
                        position: 'top'
                    }
                }
            }
        });
        
        const imageData = tempCanvas.toDataURL('image/png');
        tempChart.destroy();
        
        return imageData;
    }
}

// Create singleton instance
const charts = new FarmCharts();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = charts;
}
