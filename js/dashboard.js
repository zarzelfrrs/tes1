/**
 * FILE: dashboard.js
 * DESKRIPSI: Mengelola dashboard dan komponennya
 */

// Inisialisasi charts
let cashflowChart = null;
let expenseChart = null;

/**
 * Load dashboard dengan semua komponennya
 */
function loadDashboard() {
    updateSummaryCards();
    updateCharts();
    updateRecentTransactions();
    updateAIInsights();
    
    // Inisialisasi event listeners untuk dashboard
    initDashboardEventListeners();
}

/**
 * Update summary cards di dashboard
 */
function updateSummaryCards() {
    const cardsContainer = document.getElementById('summaryCards');
    
    // Hitung data untuk cards
    const totalBalance = app.calculateTotalBalance();
    const monthlyIncome = app.calculateMonthlyIncome();
    const monthlyExpense = app.calculateMonthlyExpense();
    
    // Hitung perubahan dari bulan lalu (sederhana, dalam aplikasi nyata akan lebih kompleks)
    // Untuk demo, kita gunakan angka acak
    const balanceChange = 2.5; // +2.5%
    const incomeChange = 5.7;  // +5.7%
    const expenseChange = -3.2; // -3.2%
    
    // Hitung sisa budget (total budget - pengeluaran bulan ini)
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    let totalBudget = 0;
    let totalSpent = 0;
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    budgets.forEach(budget => {
        if (budget.month === currentMonth && budget.year === currentYear) {
            totalBudget += budget.amount;
            
            // Hitung pengeluaran untuk kategori ini bulan ini
            const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            const categorySpent = transactions
                .filter(trans => 
                    trans.type === 'expense' && 
                    trans.categoryId === budget.categoryId &&
                    new Date(trans.date).getMonth() + 1 === currentMonth &&
                    new Date(trans.date).getFullYear() === currentYear
                )
                .reduce((sum, trans) => sum + trans.amount, 0);
            
            totalSpent += categorySpent;
        }
    });
    
    const budgetRemaining = totalBudget - totalSpent;
    const budgetPercentage = totalBudget > 0 ? (budgetRemaining / totalBudget) * 100 : 100;
    
    // Tentukan status budget
    let budgetStatus = 'Aman';
    let budgetStatusClass = 'status-safe';
    let budgetProgressClass = 'progress-safe';
    
    if (budgetPercentage < 20) {
        budgetStatus = 'Hampir Habis';
        budgetStatusClass = 'status-warning';
        budgetProgressClass = 'progress-warning';
    }
    
    if (budgetRemaining < 0) {
        budgetStatus = 'Melewati Limit';
        budgetStatusClass = 'status-danger';
        budgetProgressClass = 'progress-danger';
    }
    
    // Generate HTML untuk cards
    cardsContainer.innerHTML = `
        <div class="summary-card balance">
            <div class="card-header">
                <div class="card-title">Total Saldo</div>
                <div class="card-icon">
                    <i class="fas fa-wallet"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(totalBalance)}</div>
            <div class="card-change ${balanceChange >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${balanceChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(balanceChange)}% dari bulan lalu
            </div>
        </div>
        
        <div class="summary-card income">
            <div class="card-header">
                <div class="card-title">Pemasukan Bulan Ini</div>
                <div class="card-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(monthlyIncome)}</div>
            <div class="card-change ${incomeChange >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${incomeChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(incomeChange)}% dari bulan lalu
            </div>
        </div>
        
        <div class="summary-card expense">
            <div class="card-header">
                <div class="card-title">Pengeluaran Bulan Ini</div>
                <div class="card-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(monthlyExpense)}</div>
            <div class="card-change ${expenseChange >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${expenseChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(expenseChange)}% dari bulan lalu
            </div>
        </div>
        
        <div class="summary-card budget">
            <div class="card-header">
                <div class="card-title">Sisa Budget</div>
                <div class="card-icon">
                    <i class="fas fa-chart-pie"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(budgetRemaining > 0 ? budgetRemaining : 0)}</div>
            <div class="budget-progress ${budgetProgressClass}">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(budgetPercentage, 100)}%"></div>
                </div>
                <div class="budget-status">
                    <span>${budgetPercentage.toFixed(1)}% tersisa</span>
                    <span class="status-badge ${budgetStatusClass}">${budgetStatus}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update charts di dashboard
 */
function updateCharts() {
    updateCashflowChart();
    updateExpenseChart();
}

/**
 * Update cashflow chart
 */
function updateCashflowChart() {
    const ctx = document.getElementById('cashflowChart').getContext('2d');
    
    // Ambil data untuk 6 bulan terakhir
    const now = new Date();
    const months = [];
    const incomeData = [];
    const expenseData = [];
    const balanceData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        months.push(monthYear);
        
        // Hitung pemasukan dan pengeluaran untuk bulan ini
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        const income = transactions
            .filter(trans => {
                const transDate = new Date(trans.date);
                return trans.type === 'income' && 
                       transDate.getMonth() === month && 
                       transDate.getFullYear() === year;
            })
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expense = transactions
            .filter(trans => {
                const transDate = new Date(trans.date);
                return trans.type === 'expense' && 
                       transDate.getMonth() === month && 
                       transDate.getFullYear() === year;
            })
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        incomeData.push(income);
        expenseData.push(expense);
        balanceData.push(income - expense);
    }
    
    // Hancurkan chart sebelumnya jika ada
    if (cashflowChart) {
        cashflowChart.destroy();
    }
    
    // Buat chart baru
    cashflowChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Saldo',
                    data: balanceData,
                    borderColor: '#4a6bff',
                    backgroundColor: 'rgba(74, 107, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${app.formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return 'Rp' + (value / 1000000).toFixed(1) + 'Jt';
                            } else if (value >= 1000) {
                                return 'Rp' + (value / 1000).toFixed(0) + 'Rb';
                            }
                            return 'Rp' + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update expense chart
 */
function updateExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Ambil data pengeluaran per kategori bulan ini
    const categoryExpenses = app.calculateCategoryExpenses();
    
    const labels = Object.values(categoryExpenses).map(cat => cat.name);
    const data = Object.values(categoryExpenses).map(cat => cat.total);
    const backgroundColors = Object.values(categoryExpenses).map(cat => cat.color);
    
    // Jika tidak ada data, tampilkan pesan
    if (labels.length === 0) {
        if (expenseChart) {
            expenseChart.destroy();
        }
        
        // Buat chart kosong dengan pesan
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Tidak ada data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e9ecef'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
        
        // Tambahkan teks di tengah
        Chart.register({
            id: 'noDataText',
            afterDraw: function(chart) {
                const { ctx, width, height } = chart;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '14px Arial';
                ctx.fillStyle = '#6c757d';
                ctx.fillText('Tidak ada pengeluaran', width / 2, height / 2);
                ctx.restore();
            }
        });
        
        return;
    }
    
    // Hancurkan chart sebelumnya jika ada
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Buat chart baru
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${app.formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
    
    // Event listener untuk mengubah tipe chart
    document.querySelectorAll('#expenseChart').closest('.chart-container').querySelectorAll('.btn-chart-type').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            
            // Update active state
            this.closest('.chart-controls').querySelectorAll('.btn-chart-type').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Ubah tipe chart
            expenseChart.config.type = chartType;
            expenseChart.update();
        });
    });
}

/**
 * Update recent transactions list
 */
function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const filterValue = document.getElementById('transactionFilter').value;
    
    // Tentukan filter berdasarkan pilihan
    let filters = {};
    
    switch(filterValue) {
        case '1':
            filters.period = 'today';
            break;
        case '7':
            // Untuk minggu ini, kita atur custom
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filters.startDate = weekAgo.toISOString().split('T')[0];
            filters.endDate = new Date().toISOString().split('T')[0];
            break;
        case '30':
            filters.period = 'month';
            break;
        case '365':
            filters.period = 'year';
            break;
        case 'all':
            // Tidak ada filter
            break;
    }
    
    const transactions = app.getFilteredTransactions(filters);
    const recentTransactions = transactions.slice(0, 5); // Ambil 5 transaksi terbaru
    
    // Generate HTML
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-receipt"></i>
                <p>Tidak ada transaksi</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    recentTransactions.forEach(trans => {
        const category = app.getCategoryById(trans.categoryId);
        const wallet = app.getWalletById(trans.walletId);
        const isIncome = trans.type === 'income';
        
        html += `
            <div class="transaction-item ${isIncome ? 'transaction-income' : 'transaction-expense'}">
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="fas fa-${isIncome ? 'arrow-down' : 'arrow-up'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${trans.description}</h4>
                        <p>${category.name} • ${wallet.name} • ${app.formatDate(trans.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount">
                    ${isIncome ? '+' : '-'} ${app.formatCurrency(trans.amount)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Update AI insights
 */
function updateAIInsights() {
    const container = document.getElementById('aiInsights');
    
    // Hitung beberapa statistik untuk insights
    const monthlyIncome = app.calculateMonthlyIncome();
    const monthlyExpense = app.calculateMonthlyExpense();
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
    
    // Hitung pengeluaran per kategori
    const categoryExpenses = app.calculateCategoryExpenses();
    
    // Cari kategori dengan pengeluaran tertinggi
    let highestCategory = { name: 'Tidak ada', amount: 0 };
    Object.values(categoryExpenses).forEach(cat => {
        if (cat.total > highestCategory.amount) {
            highestCategory = { name: cat.name, amount: cat.total };
        }
    });
    
    // Bandingkan dengan bulan lalu (sederhana)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Hitung pengeluaran bulan lalu
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const lastMonthExpense = transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'expense' && 
                   transDate.getMonth() === lastMonth.getMonth() && 
                   transDate.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((sum, trans) => sum + trans.amount, 0);
    
    const expenseChange = lastMonthExpense > 0 ? 
        ((monthlyExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
    
    // Generate insights
    const insights = [];
    
    // Insight 1: Rasio tabungan
    if (savingsRate > 20) {
        insights.push({
            title: 'Tabungan Sehat',
            message: `Rasio tabungan Anda ${savingsRate.toFixed(1)}% sangat baik! Pertahankan kebiasaan finansial yang sehat ini.`
        });
    } else if (savingsRate > 0) {
        insights.push({
            title: 'Perbaiki Tabungan',
            message: `Rasio tabungan Anda ${savingsRate.toFixed(1)}% masih rendah. Coba kurangi pengeluaran tidak penting untuk meningkatkan tabungan.`
        });
    } else {
        insights.push({
            title: 'Perhatian: Defisit',
            message: 'Pengeluaran Anda lebih besar dari pemasukan bulan ini. Evaluasi pengeluaran dan cari cara untuk mengurangi biaya.'
        });
    }
    
    // Insight 2: Kategori pengeluaran tertinggi
    if (highestCategory.amount > 0) {
        const percentage = (highestCategory.amount / monthlyExpense) * 100;
        insights.push({
            title: `Fokus pada ${highestCategory.name}`,
            message: `${highestCategory.name} adalah pengeluaran terbesar Anda (${percentage.toFixed(1)}% dari total pengeluaran). Pertimbangkan untuk mengoptimalkan pengeluaran ini.`
        });
    }
    
    // Insight 3: Perbandingan bulan lalu
    if (expenseChange > 10) {
        insights.push({
            title: 'Pengeluaran Meningkat',
            message: `Pengeluaran Anda naik ${expenseChange.toFixed(1)}% dari bulan lalu. Periksa apakah kenaikan ini wajar atau perlu dikendalikan.`
        });
    } else if (expenseChange < -10) {
        insights.push({
            title: 'Pengeluaran Menurun',
            message: `Hebat! Pengeluaran Anda turun ${Math.abs(expenseChange).toFixed(1)}% dari bulan lalu. Terus pertahankan pengelolaan keuangan yang baik.`
        });
    } else {
        insights.push({
            title: 'Pengeluaran Stabil',
            message: 'Pengeluaran Anda stabil dibandingkan bulan lalu. Konsistensi adalah kunci dari pengelolaan keuangan yang baik.'
        });
    }
    
    // Insight 4: Budget
    const budgets = JSON.parse(localStorage.getItem('budgets')) || [];
    if (budgets.length > 0) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        let budgetStatus = 'baik';
        let nearLimitCount = 0;
        
        budgets.forEach(budget => {
            if (budget.month === currentMonth && budget.year === currentYear) {
                // Hitung pengeluaran untuk budget ini
                const categorySpent = transactions
                    .filter(trans => 
                        trans.type === 'expense' && 
                        trans.categoryId === budget.categoryId &&
                        new Date(trans.date).getMonth() + 1 === currentMonth &&
                        new Date(trans.date).getFullYear() === currentYear
                    )
                    .reduce((sum, trans) => sum + trans.amount, 0);
                
                const percentage = (categorySpent / budget.amount) * 100;
                
                if (percentage > 90) {
                    nearLimitCount++;
                }
            }
        });
        
        if (nearLimitCount > 0) {
            insights.push({
                title: 'Budget Perhatian',
                message: `${nearLimitCount} kategori budget Anda hampir mencapai limit. Periksa pengeluaran Anda untuk menghindari melebihi budget.`
            });
        } else {
            insights.push({
                title: 'Budget Terkendali',
                message: 'Semua budget Anda masih dalam kendali. Pertahankan pengelolaan anggaran yang baik ini.'
            });
        }
    }
    
    // Generate HTML untuk insights
    let html = '';
    
    insights.forEach(insight => {
        html += `
            <div class="insight-item">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
            </div>
        `;
    });
    
    // Jika tidak ada insights, tampilkan pesan default
    if (html === '') {
        html = `
            <div class="insight-item">
                <h4>Analisis Keuangan</h4>
                <p>AI sedang menganalisis data keuangan Anda. Tambahkan lebih banyak transaksi untuk mendapatkan insight yang lebih akurat.</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Inisialisasi event listeners untuk dashboard
 */
function initDashboardEventListeners() {
    // Event listeners untuk mengubah tipe cashflow chart
    document.querySelectorAll('#cashflowChart').closest('.chart-container').querySelectorAll('.btn-chart-type').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            
            // Update active state
            this.closest('.chart-controls').querySelectorAll('.btn-chart-type').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Ubah tipe chart
            cashflowChart.config.type = chartType;
            cashflowChart.update();
        });
    });
    
    // Event listeners untuk mengubah tipe expense chart
    document.querySelectorAll('#expenseChart').closest('.chart-container').querySelectorAll('.btn-chart-type').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.getAttribute('data-chart');
            
            // Update active state
            this.closest('.chart-controls').querySelectorAll('.btn-chart-type').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Ubah tipe chart
            expenseChart.config.type = chartType;
            expenseChart.update();
        });
    });
}