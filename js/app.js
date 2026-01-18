/**
 * FILE: app.js
 * DESKRIPSI: File utama aplikasi, mengelola inisialisasi, navigasi, dan fungsi umum
 */

// Data aplikasi (simulasi database di localStorage)
const appData = {
    // Data default jika tidak ada data di localStorage
    defaultWallets: [
        { id: 1, name: "Dompet Utama", type: "cash", balance: 5000000, color: "#4a6bff", createdAt: new Date().toISOString() },
        { id: 2, name: "Rekening BCA", type: "bank", balance: 15000000, color: "#28a745", createdAt: new Date().toISOString() },
        { id: 3, name: "OVO", type: "digital", balance: 2500000, color: "#6f42c1", createdAt: new Date().toISOString() }
    ],
    
    defaultCategories: [
        { id: 1, name: "Gaji", type: "income", color: "#28a745" },
        { id: 2, name: "Investasi", type: "income", color: "#20c997" },
        { id: 3, name: "Hadiah", type: "income", color: "#17a2b8" },
        { id: 4, name: "Makanan & Minuman", type: "expense", color: "#dc3545" },
        { id: 5, name: "Transportasi", type: "expense", color: "#fd7e14" },
        { id: 6, name: "Belanja", type: "expense", color: "#e83e8c" },
        { id: 7, name: "Hiburan", type: "expense", color: "#6f42c1" },
        { id: 8, name: "Kesehatan", type: "expense", color: "#20c997" },
        { id: 9, name: "Pendidikan", type: "expense", color: "#17a2b8" },
        { id: 10, name: "Tagihan", type: "expense", color: "#6c757d" }
    ],
    
    defaultTransactions: [
        { 
            id: 1, 
            description: "Gaji Bulanan", 
            amount: 7500000, 
            type: "income", 
            categoryId: 1, 
            walletId: 2, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(), 
            notes: "Gaji dari perusahaan",
            createdAt: new Date().toISOString()
        },
        { 
            id: 2, 
            description: "Belanja Bulanan", 
            amount: 1200000, 
            type: "expense", 
            categoryId: 4, 
            walletId: 1, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(), 
            notes: "Belanja kebutuhan bulanan",
            createdAt: new Date().toISOString()
        },
        { 
            id: 3, 
            description: "Bensin Motor", 
            amount: 50000, 
            type: "expense", 
            categoryId: 5, 
            walletId: 1, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString(), 
            notes: "",
            createdAt: new Date().toISOString()
        },
        { 
            id: 4, 
            description: "Bayar Listrik", 
            amount: 450000, 
            type: "expense", 
            categoryId: 10, 
            walletId: 2, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(), 
            notes: "Tagihan bulan April",
            createdAt: new Date().toISOString()
        },
        { 
            id: 5, 
            description: "Nonton Bioskop", 
            amount: 120000, 
            type: "expense", 
            categoryId: 7, 
            walletId: 3, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString(), 
            notes: "Nonton film Avengers",
            createdAt: new Date().toISOString()
        },
        { 
            id: 6, 
            description: "Dividen Saham", 
            amount: 350000, 
            type: "income", 
            categoryId: 2, 
            walletId: 2, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(), 
            notes: "Dividen saham BBCA",
            createdAt: new Date().toISOString()
        }
    ],
    
    defaultBudgets: [
        { id: 1, categoryId: 4, amount: 1500000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), createdAt: new Date().toISOString() },
        { id: 2, categoryId: 5, amount: 500000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), createdAt: new Date().toISOString() },
        { id: 3, categoryId: 7, amount: 300000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), createdAt: new Date().toISOString() }
    ]
};

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi data di localStorage jika belum ada
    initLocalStorage();
    
    // Inisialisasi elemen UI
    initUI();
    
    // Inisialisasi event listeners
    initEventListeners();
    
    // Tampilkan halaman dashboard sebagai default
    showPage('dashboard');
    
    // Update tanggal saat ini
    updateCurrentDate();
    
    // Set interval untuk update real-time setiap 30 detik
    setInterval(updateRealTimeData, 30000);
    
    console.log('Aplikasi MoneyMaster berhasil diinisialisasi!');
});

/**
 * Inisialisasi data di localStorage
 */
function initLocalStorage() {
    // Inisialisasi wallets jika belum ada
    if (!localStorage.getItem('wallets')) {
        localStorage.setItem('wallets', JSON.stringify(appData.defaultWallets));
    }
    
    // Inisialisasi categories jika belum ada
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(appData.defaultCategories));
    }
    
    // Inisialisasi transactions jika belum ada
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify(appData.defaultTransactions));
    }
    
    // Inisialisasi budgets jika belum ada
    if (!localStorage.getItem('budgets')) {
        localStorage.setItem('budgets', JSON.stringify(appData.defaultBudgets));
    }
    
    // Inisialisasi tema jika belum ada
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light');
    }
    
    // Inisialisasi id counter jika belum ada
    if (!localStorage.getItem('lastTransactionId')) {
        localStorage.setItem('lastTransactionId', appData.defaultTransactions.length);
    }
    
    if (!localStorage.getItem('lastWalletId')) {
        localStorage.setItem('lastWalletId', appData.defaultWallets.length);
    }
    
    if (!localStorage.getItem('lastBudgetId')) {
        localStorage.setItem('lastBudgetId', appData.defaultBudgets.length);
    }
}

/**
 * Inisialisasi elemen UI
 */
function initUI() {
    // Terapkan tema yang disimpan
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Set tanggal default untuk input tanggal
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transDate').value = today;
    document.getElementById('transferDate').value = today;
    
    // Isi opsi bulan untuk filter laporan
    fillMonthOptions();
    
    // Isi opsi tahun untuk filter laporan
    fillYearOptions();
    
    // Isi opsi bulan untuk budget
    fillBudgetMonthOptions();
    
    // Isi opsi tahun untuk budget
    fillBudgetYearOptions();
}

/**
 * Inisialisasi event listeners
 */
function initEventListeners() {
    // Toggle menu sidebar
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    
    // Toggle tema gelap/terang
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navigasi menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Update active state di menu
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
            
            // Tutup sidebar di mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('show');
            }
        });
    });
    
    // Tombol lihat semua transaksi
    document.getElementById('viewAllTransactions').addEventListener('click', function() {
        showPage('transactions');
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.getAttribute('data-page') === 'transactions') {
                navItem.classList.add('active');
            }
        });
    });
    
    // Event listeners untuk modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Tutup modal saat klik di luar konten modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Filter transaksi terbaru
    document.getElementById('transactionFilter').addEventListener('change', function() {
        updateRecentTransactions();
    });
    
    // Refresh AI insights
    document.getElementById('refreshInsights').addEventListener('click', function() {
        updateAIInsights();
        // Animasi refresh
        this.classList.add('rotating');
        setTimeout(() => {
            this.classList.remove('rotating');
        }, 500);
    });
    
    // Tambah animasi untuk refresh button
    const style = document.createElement('style');
    style.textContent = `
        .rotating {
            animation: rotate 0.5s linear;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Toggle sidebar (buka/tutup)
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
    } else {
        sidebar.classList.toggle('collapsed');
        const mainContent = document.getElementById('mainContent');
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '0';
        } else {
            mainContent.style.marginLeft = 'var(--sidebar-width)';
        }
    }
}

/**
 * Toggle tema gelap/terang
 */
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    // Toggle kelas tema
    body.classList.toggle('dark-theme');
    
    // Update icon dan simpan preferensi
    if (body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
    
    // Animasi tombol
    themeToggle.classList.add('rotate');
    setTimeout(() => {
        themeToggle.classList.remove('rotate');
    }, 500);
}

/**
 * Tampilkan halaman tertentu
 * @param {string} pageId - ID halaman yang akan ditampilkan
 */
function showPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load data untuk halaman tertentu
        switch(pageId) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'transactions':
                loadTransactions();
                break;
            case 'budgets':
                loadBudgets();
                break;
            case 'reports':
                loadReports();
                break;
            case 'wallets':
                loadWallets();
                break;
        }
    }
}

/**
 * Update tanggal saat ini di header
 */
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('id-ID', options);
    document.getElementById('currentDate').textContent = formattedDate;
}

/**
 * Update data real-time
 */
function updateRealTimeData() {
    // Update dashboard jika sedang ditampilkan
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateSummaryCards();
        updateCharts();
        updateRecentTransactions();
        updateAIInsights();
    }
    
    // Update tanggal
    updateCurrentDate();
    
    console.log('Data real-time diperbarui:', new Date().toLocaleTimeString());
}

/**
 * Format angka ke Rupiah
 * @param {number} amount - Jumlah uang
 * @returns {string} - String yang diformat sebagai Rupiah
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * @param {string} dateString - String tanggal
 * @returns {string} - Tanggal yang diformat
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format tanggal dengan waktu
 * @param {string} dateString - String tanggal
 * @returns {string} - Tanggal dan waktu yang diformat
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Tampilkan modal
 * @param {string} modalId - ID modal yang akan ditampilkan
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Mencegah scroll di background
    }
}

/**
 * Tutup semua modal
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto'; // Aktifkan scroll kembali
}

/**
 * Tampilkan loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

/**
 * Sembunyikan loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

/**
 * Ambil data dari localStorage
 * @param {string} key - Kunci data
 * @returns {Array} - Array data
 */
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Simpan data ke localStorage
 * @param {string} key - Kunci data
 * @param {Array} data - Data yang akan disimpan
 */
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Ambil kategori berdasarkan ID
 * @param {number} id - ID kategori
 * @returns {Object} - Objek kategori
 */
function getCategoryById(id) {
    const categories = getData('categories');
    return categories.find(cat => cat.id === id) || { name: 'Tidak Diketahui', color: '#6c757d' };
}

/**
 * Ambil dompet berdasarkan ID
 * @param {number} id - ID dompet
 * @returns {Object} - Objek dompet
 */
function getWalletById(id) {
    const wallets = getData('wallets');
    return wallets.find(wallet => wallet.id === id) || { name: 'Tidak Diketahui', color: '#6c757d' };
}

/**
 * Ambil semua transaksi dengan filter
 * @param {Object} filters - Objek filter
 * @returns {Array} - Array transaksi yang difilter
 */
function getFilteredTransactions(filters = {}) {
    let transactions = getData('transactions');
    
    // Filter berdasarkan tipe
    if (filters.type && filters.type !== 'all') {
        transactions = transactions.filter(trans => trans.type === filters.type);
    }
    
    // Filter berdasarkan kategori
    if (filters.categoryId && filters.categoryId !== 'all') {
        const categoryId = parseInt(filters.categoryId);
        transactions = transactions.filter(trans => trans.categoryId === categoryId);
    }
    
    // Filter berdasarkan dompet
    if (filters.walletId && filters.walletId !== 'all') {
        const walletId = parseInt(filters.walletId);
        transactions = transactions.filter(trans => trans.walletId === walletId);
    }
    
    // Filter berdasarkan periode
    if (filters.period && filters.period !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch(filters.period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        transactions = transactions.filter(trans => {
            const transDate = new Date(trans.date);
            return transDate >= startDate;
        });
    }
    
    // Filter berdasarkan rentang tanggal kustom
    if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); // Sampai akhir hari
        
        transactions = transactions.filter(trans => {
            const transDate = new Date(trans.date);
            return transDate >= start && transDate <= end;
        });
    }
    
    // Urutkan berdasarkan tanggal (terbaru dulu)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return transactions;
}

/**
 * Hitung total saldo dari semua dompet
 * @returns {number} - Total saldo
 */
function calculateTotalBalance() {
    const wallets = getData('wallets');
    return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}

/**
 * Hitung total pemasukan bulan ini
 * @returns {number} - Total pemasukan bulan ini
 */
function calculateMonthlyIncome() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = getData('transactions');
    
    return transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'income' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        })
        .reduce((total, trans) => total + trans.amount, 0);
}

/**
 * Hitung total pengeluaran bulan ini
 * @returns {number} - Total pengeluaran bulan ini
 */
function calculateMonthlyExpense() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = getData('transactions');
    
    return transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'expense' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        })
        .reduce((total, trans) => total + trans.amount, 0);
}

/**
 * Hitung total pengeluaran per kategori bulan ini
 * @returns {Object} - Objek dengan kategori sebagai kunci dan total sebagai nilai
 */
function calculateCategoryExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = getData('transactions');
    const categories = getData('categories');
    
    const result = {};
    
    // Inisialisasi semua kategori pengeluaran dengan 0
    categories
        .filter(cat => cat.type === 'expense')
        .forEach(cat => {
            result[cat.id] = {
                name: cat.name,
                color: cat.color,
                total: 0
            };
        });
    
    // Hitung total per kategori
    transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'expense' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        })
        .forEach(trans => {
            if (result[trans.categoryId]) {
                result[trans.categoryId].total += trans.amount;
            }
        });
    
    // Filter hanya kategori dengan total > 0
    const filteredResult = {};
    Object.keys(result).forEach(key => {
        if (result[key].total > 0) {
            filteredResult[key] = result[key];
        }
    });
    
    return filteredResult;
}

/**
 * Isi opsi bulan untuk filter laporan
 */
function fillMonthOptions() {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const select = document.getElementById('reportMonth');
    select.innerHTML = '<option value="all">Semua Bulan</option>';
    
    const currentMonth = new Date().getMonth();
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        if (index === currentMonth) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

/**
 * Isi opsi tahun untuk filter laporan
 */
function fillYearOptions() {
    const select = document.getElementById('reportMonth'); // Ini salah, seharusnya reportYear?
    // Untuk sekarang kita hanya menggunakan bulan
    
    // Isi juga untuk budget
    fillBudgetYearOptions();
}

/**
 * Isi opsi bulan untuk form budget
 */
function fillBudgetMonthOptions() {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const select = document.getElementById('budgetMonth');
    select.innerHTML = '';
    
    const currentMonth = new Date().getMonth() + 1;
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        if (index + 1 === currentMonth) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

/**
 * Isi opsi tahun untuk form budget
 */
function fillBudgetYearOptions() {
    const select = document.getElementById('budgetYear');
    select.innerHTML = '';
    
    const currentYear = new Date().getFullYear();
    
    // Tampilkan 3 tahun: tahun lalu, tahun ini, tahun depan
    for (let i = -1; i <= 1; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (i === 0) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

/**
 * Generate ID unik untuk data baru
 * @param {string} type - Jenis data (transaction, wallet, budget)
 * @returns {number} - ID baru
 */
function generateId(type) {
    const key = `last${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
    let lastId = parseInt(localStorage.getItem(key)) || 0;
    lastId++;
    localStorage.setItem(key, lastId);
    return lastId;
}

// Ekspor fungsi yang diperlukan untuk file JS lainnya
window.app = {
    formatCurrency,
    formatDate,
    formatDateTime,
    getData,
    saveData,
    getCategoryById,
    getWalletById,
    getFilteredTransactions,
    calculateTotalBalance,
    calculateMonthlyIncome,
    calculateMonthlyExpense,
    calculateCategoryExpenses,
    showModal,
    closeAllModals,
    showLoading,
    hideLoading,
    generateId,
    showPage
};