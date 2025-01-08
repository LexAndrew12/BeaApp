// Check authentication
const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'login.html';
}

// Get user data
const users = JSON.parse(localStorage.getItem('users'));
let data = users[currentUser].data || {};

document.addEventListener('DOMContentLoaded', function() {
    const inputTrigger = document.getElementById('inputTrigger');
    const inputModal = document.getElementById('inputModal');
    const modalClose = document.getElementById('modalClose');
    const display = document.getElementById('display');
    const monthSelect = document.getElementById('month');
    const weekSelect = document.getElementById('week');

    // Modal kezelése
    inputTrigger?.addEventListener('click', () => {
        inputModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    modalClose?.addEventListener('click', () => {
        closeModal();
    });

    // Modal bezárás függvény
    function closeModal() {
        inputModal.classList.remove('active');
        document.body.style.overflow = '';
        display.textContent = '0';
    }

    // Kategória gombok eseménykezelése - AZONNALI visszatérés az alapképernyőre
    const categoryButtons = document.querySelectorAll('.category');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            const amount = Number(display.textContent);
            const isMin = button.classList.contains('min');
            
            if (amount > 0) {
                const finalAmount = isMin ? -amount : amount;
                saveData(category, finalAmount);
                
                // Azonnali modal bezárás és számológép nullázás
                closeModal();
                
                // Frissítjük az összegeket
                updateCurrentWeekTotals();
                
                // Visszaállítjuk a görgetést
                document.body.style.overflow = '';
            }
        });
    });

    // Számgombok eseménykezelése
    document.querySelectorAll('.number').forEach(button => {
        button.addEventListener('click', () => {
            const currentValue = display.textContent;
            const buttonValue = button.textContent;

            if (currentValue === '0') {
                display.textContent = buttonValue;
            } else {
                display.textContent = currentValue + buttonValue;
            }
        });
    });

    // Törlés gomb eseménykezelése
    document.getElementById('clear').addEventListener('click', () => {
        display.textContent = '0';
    });

    // Reset funkciók
    window.resetWeekData = function() {
        if (confirm('Biztosan törölni szeretnéd az aktuális hét adatait?')) {
            const currentMonth = monthSelect.value;
            const currentWeek = weekSelect.value;
            
            if (!data[currentMonth]) {
                data[currentMonth] = {};
            }
            
            data[currentMonth][currentWeek] = {
                income: 0,
                expense: 0,
                kemonOrder: 0,
                guestSales: 0
            };
            
            // Felhasználó adatainak frissítése
            users[currentUser].data = data;
            localStorage.setItem('users', JSON.stringify(users));
            
            updateCurrentWeekTotals();
        }
    };

    window.resetAllData = function() {
        if (confirm('Biztosan törölni szeretnéd az összes adatot? Ez a művelet nem visszavonható!')) {
            data = {};
            users[currentUser].data = data;
            localStorage.setItem('users', JSON.stringify(users));
            updateCurrentWeekTotals();
        }
    };

    // Hónap és hét választó események hozzáadása
    monthSelect.addEventListener('change', () => {
        updateCurrentWeekTotals();
    });

    weekSelect.addEventListener('change', () => {
        updateCurrentWeekTotals();
    });
});

// Adatok mentése
function saveData(category, amount) {
    const month = document.getElementById('month').value;
    const week = document.getElementById('week').value;

    if (!data[month]) {
        data[month] = {};
    }
    if (!data[month][week]) {
        data[month][week] = {
            income: 0,
            expense: 0,
            kemonOrder: 0,
            guestSales: 0
        };
    }

    data[month][week][category] += amount;

    // Felhasználó adatainak frissítése
    users[currentUser].data = data;
    localStorage.setItem('users', JSON.stringify(users));

    updateCurrentWeekTotals();
}

// Frissíti a kijelzőt az aktuális héten lévő összegekkel
function updateCurrentWeekTotals() {
    const currentMonth = document.getElementById('month').value;
    const currentWeek = document.getElementById('week').value;
    const currentTotalsDisplay = document.getElementById('current-totals-display');

    if (data[currentMonth] && data[currentMonth][currentWeek]) {
        const currentData = data[currentMonth][currentWeek];
        
        currentTotalsDisplay.innerHTML = `
            <tr><td>Bevétel:</td><td>${currentData.income} Ft</td></tr>
            <tr><td>Kiadás:</td><td>${currentData.expense} Ft</td></tr>
            <tr><td>Kemon rendelés:</td><td>${currentData.kemonOrder} Ft</td></tr>
            <tr><td>Vendég vásárlás:</td><td>${currentData.guestSales} Ft</td></tr>`;
        
        document.getElementById('net-income').textContent = 
            `${currentData.income - currentData.expense} Ft`;
        document.getElementById('kemon-guest-difference').textContent = 
            `${currentData.guestSales - currentData.kemonOrder} Ft`;
        
        updateMonthlySummary(currentMonth);
    } else {
        currentTotalsDisplay.innerHTML = `
            <tr><td>Bevétel:</td><td>0 Ft</td></tr>
            <tr><td>Kiadás:</td><td>0 Ft</td></tr>
            <tr><td>Kemon rendelés:</td><td>0 Ft</td></tr>
            <tr><td>Vendég vásárlás:</td><td>0 Ft</td></tr>`;
        
        document.getElementById('net-income').textContent = '0 Ft';
        document.getElementById('kemon-guest-difference').textContent = '0 Ft';
        
        updateMonthlySummary(currentMonth);
    }
}

// Kijelentkezés funkció
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.clear(); // Munkamenet törlése
    window.location.href = 'login.html';
}

// Kijelentkezés gomb hozzáadása
document.querySelector('header').innerHTML += `
    <button onclick="logout()" class="logout-button">Kijelentkezés</button>
`;

// Oldal betöltésekor frissítjük az összegeket
updateCurrentWeekTotals();

// Adjunk hozzá egy eseménykezelőt az oldal bezárásához/elhagyásához
window.addEventListener('beforeunload', function() {
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
});
