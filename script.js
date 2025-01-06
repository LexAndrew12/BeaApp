// Ellenőrizzük, hogy van-e már mentett adat
let data = JSON.parse(localStorage.getItem('BeaAppData')) || {};
const months = {
   January: "Január", February: "Február", March: "Március", April: "Április",
   May: "Május", June: "Június", July: "Július", August: "Augusztus",
   September: "Szeptember", October: "Október", November: "November", December: "December"
};
const weeks = { week1: "1. hét", week2: "2. hét", week3: "3. hét", week4: "4. hét" };

// Számológép kijelzője
const display = document.getElementById('display');

// Hónap- és hétválasztó elemek
const monthSelect = document.getElementById('month');
const weekSelect = document.getElementById('week');

// Frissíti a kijelzőt az aktuális héten lévő összegekkel
function updateCurrentWeekTotals() {
    const currentMonth = monthSelect.value;
    const currentWeek = weekSelect.value;

    const currentTotalsDisplay = document.getElementById('current-totals-display');

    if (data[currentMonth] && data[currentMonth][currentWeek]) {
        const currentData = data[currentMonth][currentWeek];
        
        // Összegek megjelenítése táblázatban
        currentTotalsDisplay.innerHTML = `
          <tr><td>Bevétel:</td><td>${currentData.income} Ft</td></tr>
          <tr><td>Kiadás:</td><td>${currentData.expense} Ft</td></tr>
          <tr><td>Kemon rendelés:</td><td>${currentData.kemonOrder} Ft</td></tr>
          <tr><td>Vendég vásárlás:</td><td>${currentData.guestSales} Ft</td></tr>`;
        
        // Nettó jövedelem és Kemon rendelés-vendég vásárlás különbség
        document.getElementById('net-income').textContent = `${currentData.income - currentData.expense} Ft`;
        document.getElementById('kemon-guest-difference').textContent = `${currentData.kemonOrder - currentData.guestSales} Ft`;
        
        // Havi összesítés frissítése
        updateMonthlySummary(currentMonth);
        
    } else {
        currentTotalsDisplay.innerHTML = `
          <tr><td>Bevétel:</td><td>0 Ft<td></tr><tr><td>Kiadás:</td><td>0 Ft<td></tr><tr><td>Kemon rendelés:</td><td>0 Ft<td></tr><tr><td>Vendég vásárlás:</td><td>0 Ft<td></tr>`;
          
        document.getElementById('net-income').textContent = `0 Ft`;
        document.getElementById('kemon-guest-difference').textContent = `0 Ft`;
        
        // Havi összesítés nullázása
        updateMonthlySummary(currentMonth);
    }
}

// Havi összesítés kiszámítása
function updateMonthlySummary(month) {
    let totalIncome = 0;
    let totalExpense = 0;

    if (data[month]) {
        for (const week in data[month]) {
            totalIncome += data[month][week].income;
            totalExpense += data[month][week].expense;
        }
    }

    // Havi összesítés megjelenítése
    const monthlySummaryDisplay = document.getElementById('monthly-summary');
    monthlySummaryDisplay.innerHTML = `
      Havi Bevétel: ${totalIncome} Ft<br/>
      Havi Kiadás: ${totalExpense} Ft<br/>
      Havi Különbség: ${totalIncome - totalExpense} Ft<br/>`;
}

// Hónap- és hétválasztó eseménykezelők
monthSelect.addEventListener('change', updateCurrentWeekTotals);
weekSelect.addEventListener('change', updateCurrentWeekTotals);

// Számgombok eseménykezelése
document.querySelectorAll('.buttons button').forEach(button => {
   button.addEventListener('click', () => {
       const value = button.textContent;

       if (value === "Törlés") {
           // Kijelző törlése
           display.textContent = "0";
       } else if (value === "000") {
           // Három nulla hozzáadása
           display.textContent += "000";
       } else if (display.textContent === "0") {
           display.textContent = value; // Első szám cseréje
       } else {
           display.textContent += value; // További számok hozzáadása
       }
   });
});

// Kategóriagombok eseménykezelése (hozzáadás és kivonás)
document.querySelectorAll('.category-buttons .category').forEach(button => {
   button.addEventListener('click', () => {
       const category = button.getAttribute('data-category');
       const amount = Number(display.textContent);

       if (amount > 0) {
           const isMin = button.classList.contains('min'); // Ellenőrizzük, hogy mínusz gomb-e
           const finalAmount = isMin ? -amount : amount;

           saveData(category, finalAmount);
           display.textContent = "0"; // Kijelző alaphelyzetbe állítása
           updateCurrentWeekTotals(); // Frissítsük az aktuális heti összegeket
       }
   });
});

// Az adatok mentése
function saveData(category, amount) {
   const month = monthSelect.value; // Hónap kiválasztása
   const week = weekSelect.value;   // Hét kiválasztása

   if (!data[month]) { data[month] = {}; }
   if (!data[month][week]) { data[month][week] = { income: 0, expense: 0, kemonOrder: 0, guestSales: 0 }; }

   data[month][week][category] += amount;

   // Adatok mentése localStorage-be
   localStorage.setItem('BeaAppData', JSON.stringify(data));

   // Statisztikák frissítése (csak az index.html-en)
   if (document.getElementById('charts')) {
       displayData();
   }
}

// Az adatok megjelenítése diagramokon
function displayData() {
   const statsSection = document.getElementById('charts');
   
   if (!statsSection) return; // Ha nem található charts szekció, kilépünk

   statsSection.innerHTML = '<h2>Statisztikák:</h2>'; // Töröljük a korábbi tartalmat

   const incomeData = [];
   const expenseData = [];
   const labels = [];

   for (const month in data) {
       const monthData = data[month];
       labels.push(months[month]);

       let totalIncome = 0;
       let totalExpense = 0;

       for (const week in monthData) {
           totalIncome += monthData[week].income;
           totalExpense += monthData[week].expense;
       }

       incomeData.push(totalIncome);
       expenseData.push(totalExpense);
   }

   // Diagram létrehozása
   const canvas = document.createElement('canvas');
   statsSection.appendChild(canvas);
   
   const ctx = canvas.getContext('2d');
   new Chart(ctx, {
       type:'bar', // Választható diagramtípus
       data:{
           labels,
           datasets:[
               { label:'Bevétel', data : incomeData, backgroundColor:'rgba(75,192,192,0.6)' },
               { label:'Kiadás', data : expenseData, backgroundColor:'rgba(255,99,132,0.6)' }
           ]
       },
       options:{
           responsive:true,
           scales:{
               y:{
                   beginAtZero:true
               }
           }
       }
   });
}

// Az oldal betöltésekor megjelenítjük a mentett adatokat (csak a charts.html-en)
if (window.location.pathname.endsWith("charts.html")) {
    window.onload = function () { displayData(); };
}

// Frissítsük az aktuális heti összegeket az oldal betöltésekor is
updateCurrentWeekTotals();
