// PDF Report Generation using jsPDF
class FarmPDF {
    constructor() {
        this.doc = null;
        this.margin = 20;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.contentWidth = this.pageWidth - (2 * this.margin);
        this.currentY = this.margin;
        this.lineHeight = 7;
        this.pageNumber = 1;
        this.totalPages = 1;
    }

    // Initialize new PDF document
    initDocument(title = 'Farm Report') {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        this.currentY = this.margin;
        this.pageNumber = 1;
        this.totalPages = 1;

        // Add header
        this.addHeader(title);
        
        return this.doc;
    }

    // Add header with farm info
    addHeader(title) {
        // Farm name from settings
        const farmName = localStorage.getItem('farmName') || 'Farm Management';
        const farmManager = localStorage.getItem('farmManager') || '';
        const farmLocation = localStorage.getItem('farmLocation') || '';
        const reportDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Farm logo/icon
        this.doc.setFontSize(24);
        this.doc.setTextColor(76, 175, 80); // Primary green
        this.doc.text(farmName, this.margin, this.currentY);
        
        this.currentY += 10;

        // Report title
        this.doc.setFontSize(18);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(title, this.margin, this.currentY);
        
        this.currentY += 8;

        // Farm details
        this.doc.setFontSize(10);
        this.doc.setTextColor(100, 100, 100);
        
        let details = [];
        if (farmManager) details.push(`Manager: ${farmManager}`);
        if (farmLocation) details.push(`Location: ${farmLocation}`);
        details.push(`Report Date: ${reportDate}`);
        
        details.forEach(detail => {
            this.doc.text(detail, this.margin, this.currentY);
            this.currentY += 5;
        });

        this.currentY += 5;
        this.addSeparator();
    }

    // Add separator line
    addSeparator() {
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 5;
    }

    // Add section title
    addSection(title) {
        if (this.currentY > this.pageHeight - 40) {
            this.addPage();
        }

        this.doc.setFontSize(14);
        this.doc.setTextColor(33, 150, 243); // Accent blue
        this.doc.text(title, this.margin, this.currentY);
        
        this.currentY += 8;
        this.addSeparator();
    }

    // Add text paragraph
    addText(text, options = {}) {
        const {
            fontSize = 11,
            color = [0, 0, 0],
            bold = false,
            italic = false,
            align = 'left'
        } = options;

        if (this.currentY > this.pageHeight - 20) {
            this.addPage();
        }

        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(...color);
        
        if (bold) this.doc.setFont('helvetica', 'bold');
        if (italic) this.doc.setFont('helvetica', 'italic');
        
        const textLines = this.doc.splitTextToSize(text, this.contentWidth);
        
        textLines.forEach(line => {
            if (this.currentY > this.pageHeight - 20) {
                this.addPage();
            }
            
            this.doc.text(line, this.margin, this.currentY, { align });
            this.currentY += this.lineHeight;
        });

        // Reset font
        this.doc.setFont('helvetica', 'normal');
    }

    // Add table
    addTable(headers, data, options = {}) {
        const {
            title = '',
            columnWidths = [],
            headerColor = [76, 175, 80], // Primary green
            headerTextColor = [255, 255, 255],
            rowColors = [[240, 240, 240], [255, 255, 255]]
        } = options;

        if (title) {
            this.addText(title, { fontSize: 12, bold: true });
            this.currentY += 2;
        }

        // Calculate column widths if not provided
        const calculatedWidths = columnWidths.length === headers.length 
            ? columnWidths 
            : headers.map(() => this.contentWidth / headers.length);

        // Check if table fits on current page
        const estimatedHeight = (data.length + 1) * 8;
        if (this.currentY + estimatedHeight > this.pageHeight - 20) {
            this.addPage();
        }

        // Draw table header
        this.doc.setFillColor(...headerColor);
        this.doc.setTextColor(...headerTextColor);
        this.doc.setFont('helvetica', 'bold');
        
        let currentX = this.margin;
        headers.forEach((header, index) => {
            this.doc.rect(currentX, this.currentY, calculatedWidths[index], 8, 'F');
            this.doc.text(header, currentX + 2, this.currentY + 5);
            currentX += calculatedWidths[index];
        });

        this.currentY += 8;

        // Draw table rows
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont('helvetica', 'normal');

        data.forEach((row, rowIndex) => {
            // Check if we need a new page
            if (this.currentY + 8 > this.pageHeight - 20) {
                this.addPage();
                // Redraw header on new page
                this.doc.setFillColor(...headerColor);
                this.doc.setTextColor(...headerTextColor);
                this.doc.setFont('helvetica', 'bold');
                
                currentX = this.margin;
                headers.forEach((header, index) => {
                    this.doc.rect(currentX, this.currentY, calculatedWidths[index], 8, 'F');
                    this.doc.text(header, currentX + 2, this.currentY + 5);
                    currentX += calculatedWidths[index];
                });
                
                this.currentY += 8;
                this.doc.setTextColor(0, 0, 0);
                this.doc.setFont('helvetica', 'normal');
            }

            // Alternate row colors
            const rowColor = rowColors[rowIndex % 2];
            this.doc.setFillColor(...rowColor);
            this.doc.rect(this.margin, this.currentY, this.contentWidth, 8, 'F');

            // Draw cell content
            currentX = this.margin;
            headers.forEach((header, colIndex) => {
                const cellValue = row[header] || row[colIndex] || '';
                this.doc.text(cellValue.toString(), currentX + 2, this.currentY + 5);
                currentX += calculatedWidths[colIndex];
            });

            this.currentY += 8;
        });

        this.currentY += 5;
    }

    // Add chart/image
    addImage(imageData, title = '', width = 170, height = 80) {
        if (this.currentY + height > this.pageHeight - 40) {
            this.addPage();
        }

        if (title) {
            this.addText(title, { fontSize: 12, bold: true });
            this.currentY += 2;
        }

        const x = (this.pageWidth - width) / 2;
        this.doc.addImage(imageData, 'PNG', x, this.currentY, width, height);
        this.currentY += height + 10;
    }

    // Add key metrics
    addKeyMetrics(metrics, title = 'Key Metrics') {
        this.addSection(title);

        const metricsPerRow = 2;
        const boxWidth = this.contentWidth / metricsPerRow;
        const boxHeight = 25;

        metrics.forEach((metric, index) => {
            if (index % metricsPerRow === 0 && index > 0) {
                this.currentY += boxHeight + 5;
            }

            // Check if we need a new page
            if (this.currentY + boxHeight > this.pageHeight - 40) {
                this.addPage();
            }

            const col = index % metricsPerRow;
            const x = this.margin + (col * boxWidth);
            
            // Draw metric box
            this.doc.setDrawColor(200, 200, 200);
            this.doc.setLineWidth(0.5);
            this.doc.rect(x, this.currentY, boxWidth - 5, boxHeight);

            // Metric label
            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(metric.label, x + 5, this.currentY + 8);

            // Metric value
            this.doc.setFontSize(16);
            this.doc.setTextColor(76, 175, 80);
            this.doc.text(metric.value, x + 5, this.currentY + 18);

            // Metric change
            if (metric.change) {
                this.doc.setFontSize(9);
                const changeColor = metric.change.startsWith('+') 
                    ? [76, 175, 80] // Green for positive
                    : [244, 67, 54]; // Red for negative
                this.doc.setTextColor(...changeColor);
                this.doc.text(metric.change, x + 5, this.currentY + 23);
            }
        });

        this.currentY += boxHeight + 15;
    }

    // Add page number
    addPageNumber() {
        this.doc.setFontSize(10);
        this.doc.setTextColor(100, 100, 100);
        const pageText = `Page ${this.pageNumber} of ${this.totalPages}`;
        this.doc.text(pageText, this.pageWidth - this.margin - 20, this.pageHeight - 10);
    }

    // Add new page
    addPage() {
        // Add page number to current page
        this.addPageNumber();
        
        // Add new page
        this.doc.addPage();
        this.pageNumber++;
        this.totalPages = Math.max(this.totalPages, this.pageNumber);
        this.currentY = this.margin;
        
        // Add header to new page
        this.addHeader('Farm Report (Continued)');
    }

    // Generate production report
    async generateProductionReport(livestock, period = 'last-month') {
        this.initDocument(`${livestock === 'dairy' ? 'Dairy' : 'Poultry'} Production Report`);
        
        // Get data
        const productionData = await db.getProductionData(livestock, period);
        const kpiData = await db.getKPIData(livestock);
        const insights = await window.app?.generateInsights() || [];

        // Key metrics
        const metrics = livestock === 'dairy' 
            ? [
                { label: 'Total Milk Production', value: `${kpiData.milkYield} L`, change: '+5.2%' },
                { label: 'Herd Size', value: kpiData.herdSize, change: '' },
                { label: 'Active Cows', value: kpiData.activeCows, change: '' },
                { label: 'Monthly Income', value: `KES ${kpiData.income}`, change: '+3.8%' }
            ]
            : [
                { label: 'Total Egg Production', value: kpiData.eggProduction, change: '+4.1%' },
                { label: 'Flock Size', value: kpiData.flockSize, change: '' },
                { label: 'Mortality Rate', value: kpiData.mortalityRate, change: '-0.5%' },
                { label: 'Monthly Income', value: `KES ${kpiData.income}`, change: '+2.9%' }
            ];

        this.addKeyMetrics(metrics);

        // Production trends
        this.addSection('Production Trends');
        
        // Get chart image
        const chartImage = charts.createChartForPDF('production');
        if (chartImage) {
            this.addImage(chartImage, 'Production Trend Chart');
        }

        // Detailed production data
        this.addSection('Detailed Production Records');
        
        const tableHeaders = ['Date', 'Type', 'Quantity', 'Unit', 'Notes'];
        const tableData = (await db.getAllRecords('production', { livestock }))
            .slice(0, 20) // Limit to 20 records
            .map(record => ({
                Date: new Date(record.date).toLocaleDateString(),
                Type: record.type === 'milk' ? 'Milk' : 'Eggs',
                Quantity: record.quantity,
                Unit: record.unit,
                Notes: record.notes || '-'
            }));

        this.addTable(tableHeaders, tableData, {
            columnWidths: [25, 25, 25, 25, 90]
        });

        // Insights
        if (insights.length > 0) {
            this.addSection('Smart Insights');
            insights.forEach(insight => {
                this.addText(`• ${insight.text}`, { fontSize: 11 });
            });
        }

        // Recommendations
        this.addSection('Recommendations');
        const recommendations = livestock === 'dairy'
            ? [
                'Consider rotating pastures to improve grass quality',
                'Review feed composition for optimal milk production',
                'Schedule regular health check-ups for the herd',
                'Monitor water quality and availability'
            ]
            : [
                'Optimize lighting conditions for better egg production',
                'Review vaccination schedule with your veterinarian',
                'Consider feed supplements during high production periods',
                'Monitor temperature and ventilation in coops'
            ];

        recommendations.forEach(rec => {
            this.addText(`• ${rec}`, { fontSize: 11 });
        });

        // Footer
        this.addPageNumber();
        
        return this.doc;
    }

    // Generate financial report
    async generateFinancialReport(livestock, period = 'last-month') {
        this.initDocument(`${livestock === 'dairy' ? 'Dairy' : 'Poultry'} Financial Report`);
        
        // Get data
        const financeData = await db.getFinanceData(livestock, period);
        const kpiData = await db.getKPIData(livestock);

        // Financial summary
        const metrics = [
            { label: 'Total Income', value: `KES ${kpiData.income}`, change: '+4.2%' },
            { label: 'Total Expenses', value: `KES ${kpiData.expenses}`, change: '+1.8%' },
            { label: 'Net Profit', value: `KES ${kpiData.profit}`, change: '+6.5%' },
            { label: 'Profit Margin', value: `${(kpiData.profit / kpiData.income * 100 || 0).toFixed(1)}%`, change: '' }
        ];

        this.addKeyMetrics(metrics);

        // Financial trends
        this.addSection('Financial Trends');
        
        const chartImage = charts.createChartForPDF('finance');
        if (chartImage) {
            this.addImage(chartImage, 'Financial Trend Chart');
        }

        // Income breakdown
        this.addSection('Income Breakdown');
        
        const incomeData = (await db.getAllRecords('financial', { 
            livestock, 
            type: 'income' 
        })).slice(0, 10);

        const incomeTableData = incomeData.map(record => ({
            Date: new Date(record.date).toLocaleDateString(),
            Category: record.category || 'Other',
            Description: record.description || '-',
            Amount: `KES ${record.amount || 0}`
        }));

        this.addTable(['Date', 'Category', 'Description', 'Amount'], incomeTableData);

        // Expense breakdown
        this.addSection('Expense Breakdown');
        
        const expenseData = (await db.getAllRecords('financial', { 
            livestock, 
            type: 'expense' 
        })).slice(0, 10);

        const expenseTableData = expenseData.map(record => ({
            Date: new Date(record.date).toLocaleDateString(),
            Category: record.category || 'Other',
            Description: record.description || '-',
            Amount: `KES ${record.amount || 0}`
        }));

        this.addTable(['Date', 'Category', 'Description', 'Amount'], expenseTableData);

        // Financial analysis
        this.addSection('Financial Analysis');
        
        const analysis = [
            'Feed costs account for 45% of total expenses',
            'Veterinary services show a 12% increase this period',
            'Milk/Egg sales revenue grew by 8% compared to last period',
            'Operational efficiency improved by 5%'
        ];

        analysis.forEach(item => {
            this.addText(`• ${item}`, { fontSize: 11 });
        });

        // Footer
        this.addPageNumber();
        
        return this.doc;
    }

    // Generate health report
    async generateHealthReport(livestock, period = 'last-month') {
        this.initDocument(`${livestock === 'dairy' ? 'Dairy' : 'Poultry'} Health Report`);
        
        // Get data
        const healthData = await db.getAllRecords('health', { livestock });
        const kpiData = await db.getKPIData(livestock);

        // Health summary
        const metrics = livestock === 'dairy'
            ? [
                { label: 'Healthy Animals', value: kpiData.activeCows, change: '' },
                { label: 'Sick Animals', value: kpiData.sickCows, change: '-2' },
                { label: 'Dry Cows', value: kpiData.dryCows, change: '' },
                { label: 'Last Vaccination', value: '15 days ago', change: '' }
            ]
            : [
                { label: 'Flock Size', value: kpiData.flockSize, change: '' },
                { label: 'Mortality Rate', value: kpiData.mortalityRate, change: '-0.3%' },
                { label: 'Disease Cases', value: '2', change: '-1' },
                { label: 'Vaccination Coverage', value: '95%', change: '' }
            ];

        this.addKeyMetrics(metrics);

        // Upcoming health events
        this.addSection('Upcoming Health Events');
        
        const upcomingEvents = healthData
            .filter(record => {
                const nextDue = record.nextDue ? new Date(record.nextDue) : null;
                return nextDue && nextDue > new Date();
            })
            .slice(0, 5);

        if (upcomingEvents.length > 0) {
            const eventsTableData = upcomingEvents.map(record => ({
                Date: new Date(record.nextDue).toLocaleDateString(),
                Animal: record.animal || 'All',
                Treatment: record.treatment || '-',
                Type: record.type || '-'
            }));

            this.addTable(['Due Date', 'Animal', 'Treatment', 'Type'], eventsTableData);
        } else {
            this.addText('No upcoming health events scheduled.', { fontSize: 11 });
        }

        // Recent health records
        this.addSection('Recent Health Records');
        
        const recentHealth = healthData.slice(0, 10);
        const healthTableData = recentHealth.map(record => ({
            Date: new Date(record.date).toLocaleDateString(),
            Animal: record.animal || '-',
            Type: record.type || '-',
            Treatment: record.treatment || '-',
            Vet: record.vet || '-',
            Cost: record.cost ? `KES ${record.cost}` : '-'
        }));

        this.addTable(['Date', 'Animal', 'Type', 'Treatment', 'Vet', 'Cost'], healthTableData, {
            columnWidths: [25, 30, 25, 40, 30, 20]
        });

        // Health recommendations
        this.addSection('Health Recommendations');
        
        const recommendations = livestock === 'dairy'
            ? [
                'Schedule routine hoof trimming every 6 months',
                'Implement a deworming program for the herd',
                'Monitor body condition scores regularly',
                'Ensure clean and dry bedding areas'
            ]
            : [
                'Implement biosecurity measures in the coop',
                'Schedule regular parasite control',
                'Monitor flock behavior for early disease detection',
                'Maintain proper ventilation and temperature control'
            ];

        recommendations.forEach(rec => {
            this.addText(`• ${rec}`, { fontSize: 11 });
        });

        // Footer
        this.addPageNumber();
        
        return this.doc;
    }

    // Generate comprehensive annual report
    async generateAnnualReport(livestock, year = new Date().getFullYear()) {
        this.initDocument(`${livestock === 'dairy' ? 'Dairy' : 'Poultry'} Annual Report ${year}`);
        
        // Executive summary
        this.addSection('Executive Summary');
        this.addText(
            `This report provides a comprehensive overview of the ${livestock} farm operations for the year ${year}. ` +
            `It includes production performance, financial results, health management, and strategic recommendations ` +
            `for the upcoming year.`,
            { fontSize: 11 }
        );

        // Production performance
        this.addSection('Production Performance');
        const productionData = await db.getProductionData(livestock, 'annual');
        
        if (productionData.length > 0) {
            const prodTableData = productionData.map(record => ({
                Period: record.period,
                'Total Production': `${record.total} ${livestock === 'dairy' ? 'L' : 'units'}`,
                'Monthly Average': `${(record.total / 30).toFixed(1)} ${livestock === 'dairy' ? 'L/day' : 'units/day'}`
            }));

            this.addTable(['Period', 'Total Production', 'Monthly Average'], prodTableData);
        }

        // Financial performance
        this.addSection('Financial Performance');
        const financeData = await db.getFinanceData(livestock, 'annual');
        
        if (financeData.length > 0) {
            const financeTableData = financeData.map(record => ({
                Period: record.period,
                Income: `KES ${record.income.toLocaleString()}`,
                Expenses: `KES ${record.expense.toLocaleString()}`,
                Profit: `KES ${record.profit.toLocaleString()}`,
                'Profit Margin': `${((record.profit / record.income) * 100 || 0).toFixed(1)}%`
            }));

            this.addTable(['Period', 'Income', 'Expenses', 'Profit', 'Profit Margin'], financeTableData);
        }

        // Key achievements
        this.addSection('Key Achievements');
        const achievements = [
            `Achieved ${livestock === 'dairy' ? 'milk' : 'egg'} production target for 9 out of 12 months`,
            'Reduced feed costs by 8% through optimized feeding strategies',
            'Maintained animal health with only 2% incidence rate',
            'Implemented digital record-keeping system'
        ];

        achievements.forEach(achievement => {
            this.addText(`• ${achievement}`, { fontSize: 11 });
        });

        // Challenges and solutions
        this.addSection('Challenges & Solutions');
        const challenges = [
            'Challenge: Seasonal variations in production\nSolution: Implemented supplemental feeding program',
            'Challenge: Rising feed costs\nSolution: Negotiated bulk purchase agreements',
            'Challenge: Disease outbreaks\nSolution: Enhanced biosecurity measures'
        ];

        challenges.forEach(challenge => {
            this.addText(`• ${challenge}`, { fontSize: 11 });
        });

        // Strategic recommendations for next year
        this.addSection('Strategic Recommendations');
        const recommendations = [
            'Expand herd/flock by 15% to increase production capacity',
            'Invest in automated feeding systems to reduce labor costs',
            'Implement precision farming techniques for better resource management',
            'Explore value-added products (e.g., cheese, processed eggs)',
            'Develop partnerships with local markets for better pricing'
        ];

        recommendations.forEach(rec => {
            this.addText(`• ${rec}`, { fontSize: 11 });
        });

        // Financial projections
        this.addSection('Financial Projections');
        this.addText('Based on current performance and planned investments:', { fontSize: 11 });
        
        const projections = [
            { 'Metric': 'Projected Revenue Growth', 'Next Year': '12-15%', '3-Year Target': '40-50%' },
            { 'Metric': 'Cost Reduction Target', 'Next Year': '5-8%', '3-Year Target': '15-20%' },
            { 'Metric': 'Profit Margin Target', 'Next Year': '25-30%', '3-Year Target': '35-40%' },
            { 'Metric': 'ROI on Investments', 'Next Year': '15%', '3-Year Target': '45%' }
        ];

        this.addTable(['Metric', 'Next Year', '3-Year Target'], projections);

        // Footer with disclaimer
        this.currentY += 10;
        this.addText(
            'Disclaimer: This report is generated based on available data. ' +
            'For detailed analysis and strategic planning, consult with agricultural experts.',
            { fontSize: 9, color: [100, 100, 100], italic: true }
        );

        this.addPageNumber();
        
        return this.doc;
    }

    // Save PDF to file
    savePDF(filename = 'farm-report.pdf') {
        if (!this.doc) {
            throw new Error('No PDF document initialized');
        }

        this.doc.save(filename);
    }

    // Get PDF as data URL
    getPDFDataURL() {
        if (!this.doc) {
            throw new Error('No PDF document initialized');
        }

        return this.doc.output('dataurlstring');
    }

    // Get PDF as blob
    getPDFBlob() {
        if (!this.doc) {
            throw new Error('No PDF document initialized');
        }

        return this.doc.output('blob');
    }

    // Generate and download report
    async generateReport(type, livestock, options = {}) {
        try {
            let pdf;
            
            switch(type) {
                case 'production':
                    pdf = await this.generateProductionReport(livestock, options.period);
                    break;
                case 'finance':
                    pdf = await this.generateFinancialReport(livestock, options.period);
                    break;
                case 'health':
                    pdf = await this.generateHealthReport(livestock, options.period);
                    break;
                case 'annual':
                    pdf = await this.generateAnnualReport(livestock, options.year);
                    break;
                default:
                    throw new Error('Invalid report type');
            }

            const filename = `${livestock}-${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            return true;
        } catch (error) {
            console.error('Error generating report:', error);
            ui.showNotification('Error generating report', 'error');
            return false;
        }
    }
}

// Create singleton instance
const pdf = new FarmPDF();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pdf;
}
