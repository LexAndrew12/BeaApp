document.addEventListener('DOMContentLoaded', function() {
    // Adatok betöltése
    const currentUser = sessionStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users'));
    const data = users[currentUser].data;
    
    const monthSelect = document.getElementById('monthSelect');
    
    // Grafikonok inicializálása
    let incomeExpenseChart, weeklyIncomeChart, kemonVsGuestChart;
    
    // Hónap választó eseménykezelő
    monthSelect.addEventListener('change', updateCharts);
    
    // Grafikonok frissítése
    function updateCharts() {
        const selectedMonth = monthSelect.value;
        const monthData = data[selectedMonth] || {};
        
        updateIncomeExpenseChart(monthData);
        updateWeeklyIncomeChart(monthData);
        updateKemonVsGuestChart(monthData);
        updateMonthlySummary(monthData);
    }
    
    // Bevétel/Kiadás kördiagram
    function updateIncomeExpenseChart(monthData) {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        
        let totalIncome = 0;
        let totalExpense = 0;
        
        Object.values(monthData).forEach(week => {
            totalIncome += week.income || 0;
            totalExpense += week.expense || 0;
        });
        
        if (incomeExpenseChart) {
            incomeExpenseChart.destroy();
        }
        
        incomeExpenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Bevétel', 'Kiadás'],
                datasets: [{
                    data: [totalIncome, totalExpense],
                    backgroundColor: ['#4CAF50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Heti bevételek vonaldiagram
    function updateWeeklyIncomeChart(monthData) {
        const ctx = document.getElementById('weeklyIncomeChart').getContext('2d');
        
        const weeklyData = Object.entries(monthData).map(([week, data]) => ({
            week: week.replace('week', ''),
            income: data.income || 0
        }));
        
        if (weeklyIncomeChart) {
            weeklyIncomeChart.destroy();
        }
        
        weeklyIncomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.map(d => d.week + '. hét'),
                datasets: [{
                    label: 'Heti bevétel',
                    data: weeklyData.map(d => d.income),
                    borderColor: '#2196F3',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Kemon vs Vendég vásárlás oszlopdiagram
    function updateKemonVsGuestChart(monthData) {
        const ctx = document.getElementById('kemonVsGuestChart').getContext('2d');
        
        let totalKemon = 0;
        let totalGuest = 0;
        
        Object.values(monthData).forEach(week => {
            totalKemon += week.kemonOrder || 0;
            totalGuest += week.guestSales || 0;
        });
        
        if (kemonVsGuestChart) {
            kemonVsGuestChart.destroy();
        }
        
        kemonVsGuestChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Kemon rendelés', 'Vendég vásárlás'],
                datasets: [{
                    data: [totalKemon, totalGuest],
                    backgroundColor: ['#9C27B0', '#FF9800']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Havi összefoglaló frissítése
    function updateMonthlySummary(monthData) {
        let totalIncome = 0;
        let totalExpense = 0;
        let totalKemon = 0;
        let totalGuest = 0;
        let bestWeekIncome = 0;
        let bestWeekNum = '';
        
        Object.entries(monthData).forEach(([week, data]) => {
            const weekIncome = data.income || 0;
            totalIncome += weekIncome;
            totalExpense += data.expense || 0;
            totalKemon += data.kemonOrder || 0;
            totalGuest += data.guestSales || 0;
            
            if (weekIncome > bestWeekIncome) {
                bestWeekIncome = weekIncome;
                bestWeekNum = week.replace('week', '');
            }
        });
        
        document.getElementById('totalIncome').textContent = `${totalIncome} Ft`;
        document.getElementById('netProfit').textContent = `${totalIncome - totalExpense} Ft`;
        document.getElementById('productProfit').textContent = `${totalGuest - totalKemon} Ft`;
        document.getElementById('bestWeek').textContent = bestWeekNum ? `${bestWeekNum}. hét (${bestWeekIncome} Ft)` : '-';
    }
    
    // Kezdeti betöltés
    updateCharts();
}); 