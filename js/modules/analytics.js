/**
 * PETIID ADMIN - ANALYTICS MODULE
 * Statistics, charts, and data insights
 */

const analytics = {
    charts: {},
    dateRange: '30d',

    /**
     * Load analytics section
     */
    async load() {
        console.log('📈 Loading analytics...');

        try {
            await Promise.all([
                this.loadOverviewStats(),
                this.loadUserGrowth(),
                this.loadSpeciesDistribution(),
                this.loadGeographicData(),
                this.loadDeviceStats()
            ]);

            console.log('✅ Analytics loaded');
        } catch (error) {
            console.error('❌ Analytics load error:', error);
            app.toast('Error cargando estadísticas', 'error');
        }
    },

    /**
     * Change date range filter
     */
    async changeDateRange(range) {
        this.dateRange = range;

        // Update button states
        document.querySelectorAll('.date-range-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.range === range);
        });

        await this.load();
    },

    /**
     * Get date filter based on range
     */
    getDateFilter() {
        const now = new Date();
        let startDate;

        switch (this.dateRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        return startDate.toISOString();
    },

    /**
     * Load overview stats
     */
    async loadOverviewStats() {
        try {
            const startDate = this.getDateFilter();

            // Get counts with date filter
            const [newUsers, newPets, newPosts, activeReports] = await Promise.all([
                this.countSince('profiles', 'created_at', startDate),
                this.countSince('pets', 'created_at', startDate),
                this.countSince('posts', 'created_at', startDate),
                db.count('moderation_reports', { status: 'pending' })
            ]);

            // Update UI
            this.updateStat('analytics-new-users', newUsers);
            this.updateStat('analytics-new-pets', newPets);
            this.updateStat('analytics-new-posts', newPosts);
            this.updateStat('analytics-active-reports', activeReports);

        } catch (error) {
            console.error('Error loading overview stats:', error);
        }
    },

    /**
     * Count records since date
     */
    async countSince(table, dateColumn, startDate) {
        const { count, error } = await supabaseClient
            .from(table)
            .select('*', { count: 'exact', head: true })
            .gte(dateColumn, startDate);

        if (error) throw error;
        return count || 0;
    },

    /**
     * Update stat display
     */
    updateStat(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = app.formatNumber(value);
        }
    },

    /**
     * Load user growth data
     */
    async loadUserGrowth() {
        try {
            const startDate = this.getDateFilter();

            const { data } = await supabaseClient
                .from('profiles')
                .select('created_at')
                .gte('created_at', startDate)
                .order('created_at', { ascending: true });

            if (!data) return;

            // Group by day
            const dailyCounts = this.groupByDay(data, 'created_at');

            // Render chart
            this.renderLineChart('user-growth-chart', {
                labels: Object.keys(dailyCounts),
                data: Object.values(dailyCounts),
                label: 'Nuevos usuarios'
            });

        } catch (error) {
            console.error('Error loading user growth:', error);
        }
    },

    /**
     * Group data by day
     */
    groupByDay(data, dateField) {
        const counts = {};

        data.forEach(item => {
            const date = new Date(item[dateField]).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric'
            });
            counts[date] = (counts[date] || 0) + 1;
        });

        return counts;
    },

    /**
     * Load species distribution
     */
    async loadSpeciesDistribution() {
        try {
            const { data } = await supabaseClient
                .from('pets')
                .select('species');

            if (!data) return;

            // Count by species
            const speciesCounts = {};
            data.forEach(pet => {
                const species = pet.species || 'other';
                speciesCounts[species] = (speciesCounts[species] || 0) + 1;
            });

            // Render chart
            this.renderDoughnutChart('species-chart', {
                labels: Object.keys(speciesCounts).map(s => this.formatSpecies(s)),
                data: Object.values(speciesCounts)
            });

        } catch (error) {
            console.error('Error loading species distribution:', error);
        }
    },

    /**
     * Format species name
     */
    formatSpecies(species) {
        const names = {
            'dog': 'Perros',
            'cat': 'Gatos',
            'bird': 'Aves',
            'rabbit': 'Conejos',
            'other': 'Otros'
        };
        return names[species?.toLowerCase()] || species;
    },

    /**
     * Load geographic data
     */
    async loadGeographicData() {
        try {
            const { data } = await supabaseClient
                .from('profiles')
                .select('country, city')
                .not('country', 'is', null);

            if (!data) return;

            // Count by country
            const countryCounts = {};
            data.forEach(user => {
                const country = user.country || 'Desconocido';
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            });

            // Sort and get top 10
            const sorted = Object.entries(countryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            // Render chart
            this.renderBarChart('geo-chart', {
                labels: sorted.map(([country]) => country),
                data: sorted.map(([, count]) => count),
                label: 'Usuarios'
            });

        } catch (error) {
            console.error('Error loading geographic data:', error);
        }
    },

    /**
     * Load device stats
     */
    async loadDeviceStats() {
        try {
            const { data } = await supabaseClient
                .from('profiles')
                .select('device_os')
                .not('device_os', 'is', null);

            if (!data) return;

            // Count by OS
            const osCounts = { 'iOS': 0, 'Android': 0, 'Otro': 0 };
            data.forEach(user => {
                const os = user.device_os || '';
                if (os.toLowerCase().includes('ios')) {
                    osCounts['iOS']++;
                } else if (os.toLowerCase().includes('android')) {
                    osCounts['Android']++;
                } else {
                    osCounts['Otro']++;
                }
            });

            // Update UI
            const total = Object.values(osCounts).reduce((a, b) => a + b, 0);
            const iosPercent = total > 0 ? Math.round((osCounts['iOS'] / total) * 100) : 0;
            const androidPercent = total > 0 ? Math.round((osCounts['Android'] / total) * 100) : 0;

            const statsEl = document.getElementById('device-stats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <div class="device-stat">
                        <div class="device-icon" style="background: #000; color: #fff;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="font-semibold">${iosPercent}%</div>
                            <div class="text-muted text-sm">iOS</div>
                        </div>
                    </div>
                    <div class="device-stat">
                        <div class="device-icon" style="background: #3ddc84; color: #fff;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.463 11.463 0 00-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 001.3 18h21.4c0-3.36-1.89-6.33-5.1-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="font-semibold">${androidPercent}%</div>
                            <div class="text-muted text-sm">Android</div>
                        </div>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error loading device stats:', error);
        }
    },

    /**
     * Render a simple line chart using CSS
     */
    renderLineChart(containerId, { labels, data, label }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const max = Math.max(...data, 1);
        const barWidth = 100 / data.length;

        container.innerHTML = `
            <div class="simple-chart-container">
                <div class="chart-bars">
                    ${data.map((value, i) => `
                        <div class="chart-bar-wrapper" style="width: ${barWidth}%;">
                            <div class="chart-bar" style="height: ${(value / max) * 100}%;" 
                                 title="${labels[i]}: ${value}"></div>
                            <div class="chart-label">${labels[i]}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render a simple doughnut chart using CSS
     */
    renderDoughnutChart(containerId, { labels, data }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = data.reduce((a, b) => a + b, 0);
        const colors = ['#fb923c', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

        container.innerHTML = `
            <div class="doughnut-legend">
                ${labels.map((label, i) => `
                    <div class="legend-item">
                        <span class="legend-color" style="background: ${colors[i % colors.length]};"></span>
                        <span>${label}: ${data[i]} (${total > 0 ? Math.round((data[i] / total) * 100) : 0}%)</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render a simple bar chart using CSS
     */
    renderBarChart(containerId, { labels, data, label }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const max = Math.max(...data, 1);

        container.innerHTML = `
            <div class="horizontal-bars">
                ${labels.map((labelText, i) => `
                    <div class="h-bar-row">
                        <div class="h-bar-label">${labelText}</div>
                        <div class="h-bar-track">
                            <div class="h-bar-fill" style="width: ${(data[i] / max) * 100}%;"></div>
                        </div>
                        <div class="h-bar-value">${data[i]}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// Add chart styles
const chartStyles = document.createElement('style');
chartStyles.textContent = `
    .simple-chart-container {
        height: 200px;
        display: flex;
        flex-direction: column;
    }
    .chart-bars {
        flex: 1;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        padding-bottom: 30px;
    }
    .chart-bar-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .chart-bar {
        width: 100%;
        max-width: 40px;
        background: var(--primary);
        border-radius: 4px 4px 0 0;
        transition: height 0.3s ease;
        cursor: pointer;
    }
    .chart-bar:hover {
        background: var(--primary-hover);
    }
    .chart-label {
        font-size: 10px;
        color: var(--text-muted);
        margin-top: 8px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
    .doughnut-legend {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
    }
    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
    }
    .horizontal-bars {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .h-bar-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .h-bar-label {
        width: 100px;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .h-bar-track {
        flex: 1;
        height: 24px;
        background: var(--bg-tertiary);
        border-radius: 6px;
        overflow: hidden;
    }
    .h-bar-fill {
        height: 100%;
        background: var(--primary);
        border-radius: 6px;
        transition: width 0.3s ease;
    }
    .h-bar-value {
        width: 50px;
        text-align: right;
        font-size: 13px;
        font-weight: 600;
    }
    .device-stat {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--bg-tertiary);
        border-radius: 12px;
    }
    .device-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    #device-stats {
        display: flex;
        gap: 16px;
    }
`;
document.head.appendChild(chartStyles);

// Export
window.analytics = analytics;
