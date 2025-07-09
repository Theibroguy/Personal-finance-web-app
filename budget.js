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

    budgets.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${item.category} - ₦${formatAmount(item.amount)}
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
    if (!canvas) {
      console.warn("Canvas not found!");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn("Canvas context is null!");
      return;
    }

    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const expenses = transactions.filter(t => t.amount < 0);

    const categorySums = {};
    expenses.forEach(t => {
      const title = t.title.toLowerCase();
      categorySums[title] = (categorySums[title] || 0) + Math.abs(t.amount);
    });

    const categories = Object.keys(categorySums);
    const values = Object.values(categorySums);

    if (window.spendingChart instanceof Chart) {
      window.spendingChart.destroy();
    }

    window.spendingChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(cat => cat[0].toUpperCase() + cat.slice(1)),
        datasets: [{
          label: 'Actual Spending by Category',
          data: values,
          backgroundColor: [
            '#4CAF50', '#FF6384', '#36A2EB',
            '#FFCE56', '#8E44AD', '#E67E22'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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