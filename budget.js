document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget-form');
  const categoryInput = document.getElementById('category');
  const amountInput = document.getElementById('limit');
  const budgetList = document.getElementById('budget-list');
  const toggleBtn = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');

  let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  // Sidebar toggle functionality
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('collapsed');
  });

  function saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }

  function formatAmount(amount) {
    return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function renderBudgets() {
    budgetList.innerHTML = '';

    if (budgets.length === 0) {
      budgetList.innerHTML = '<li>No budgets set yet.</li>';
      return;
    }

    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    budgets.forEach((budget, index) => {
      const budgetCategory = budget.category.toLowerCase();

      const spent = transactions
        .filter(t => t.amount < 0 && t.category?.toLowerCase() === budgetCategory)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const percentageUsed = Math.min((spent / budget.amount) * 100, 100).toFixed(1);

      let barColor = '#4CAF50'; // green
      if (spent > budget.amount) {
        barColor = '#E74C3C'; // red
      } else if (percentageUsed >= 80) {
        barColor = '#F39C12'; // yellow
      }

      const li = document.createElement('li');
      li.innerHTML = `
        <div><strong>${budget.category}</strong> - ₦${formatAmount(spent)} spent out of ₦${formatAmount(budget.amount)}</div>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${percentageUsed}%; background-color: ${barColor};"></div>
        </div>
        <button class="delete-btn" title="Delete">✖</button>
      `;

      li.querySelector('.delete-btn').addEventListener('click', () => {
        budgets.splice(index, 1);
        saveBudgets();
        renderBudgets();
        updateChart();
      });

      budgetList.appendChild(li);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = categoryInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (category === '' || isNaN(amount)) {
      alert('Please enter a valid category and amount.');
      return;
    }

    budgets.push({ category, amount });
    saveBudgets();
    renderBudgets();
    updateChart();
    form.reset();
  });

  function updateChart() {
    const canvas = document.getElementById('spendingChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const categorySums = {};
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const category = t.category ? t.category.trim() : "Others";
        categorySums[category] = (categorySums[category] || 0) + Math.abs(t.amount);
      });

    const categoryColors = {
      Food: '#4CAF50',
      Transport: '#FF6384',
      Clothes: '#36A2EB',
      Utilities: '#FFCE56',
      Communication: '#8E44AD',
      Others: '#E67E22'
    };

    const categories = Object.keys(categorySums);
    const values = Object.values(categorySums);
    const backgroundColors = categories.map(cat => categoryColors[cat] || '#999');

    if (window.spendingChart instanceof Chart) {
      window.spendingChart.destroy();
    }

    window.spendingChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          label: 'Actual Spending by Category',
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 1
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

  // Init
  renderBudgets();
  updateChart();
});