
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];

// Sidebar toggle functionality
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

function saveBudgets() {
  localStorage.setItem('budgets', JSON.stringify(budgets));
}

function formatAmount(amount) {
  return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function fetchTransactions() {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const res = await fetch('http://localhost:5000/api/transactions', {
      headers: { 'x-auth-token': token }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
  return [];
}

async function renderBudgets() {
  budgetList.innerHTML = '';

  if (budgets.length === 0) {
    budgetList.innerHTML = '<li style="color: var(--text-gray); border: none; background: transparent;">No budgets set yet.</li>';
    updateChart([]);
    return;
  }

  const transactions = await fetchTransactions();

  budgets.forEach((budget, index) => {
    const budgetCategory = budget.category.toLowerCase();

    const spent = transactions
      .filter(t => t.type === 'expense' && (t.category?.toLowerCase() === budgetCategory || (budgetCategory === 'others' && !t.category)))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percentageUsed = Math.min((spent / budget.amount) * 100, 100).toFixed(1);

    let barColor = 'var(--success)'; // green
    if (spent > budget.amount) {
      barColor = 'var(--danger)'; // red
    } else if (percentageUsed >= 80) {
      barColor = 'var(--warning)'; // yellow
    }

    const li = document.createElement('li');
    li.innerHTML = `
        <div class="budget-header">
          <span class="budget-category">${budget.category}</span>
          <button class="delete-btn" title="Delete"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="budget-info">
          <span>₦${formatAmount(spent)} spent</span>
          <span>of ₦${formatAmount(budget.amount)}</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" data-width="${percentageUsed}" style="background-color: ${barColor}; width: 0%"></div>
        </div>
      `;

    li.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Delete this budget?')) {
        budgets.splice(index, 1);
        saveBudgets();
        renderBudgets();
      }
    });

    budgetList.appendChild(li);

    // Animate progress bar
    setTimeout(() => {
      const progressBar = li.querySelector('.progress-bar');
      if (progressBar) progressBar.style.width = `${percentageUsed}%`;
    }, 100);
  });

  updateChart(transactions);
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
  form.reset();
});

function updateChart(transactions) {
  const canvas = document.getElementById('spendingChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const categorySums = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const category = t.category ? t.category : "Others";
      categorySums[category] = (categorySums[category] || 0) + Math.abs(t.amount);
    });

  const categoryColors = {
    Food: '#4CAF50',
    Transport: '#FF6384',
    Clothes: '#36A2EB',
    Utilities: '#FFCE56',
    Communication: '#8E44AD',
    Health: '#FF0000',
    Others: '#E67E22',
    Income: '#10B981'
  };

  const categories = Object.keys(categorySums);
  const values = Object.values(categorySums);
  const backgroundColors = categories.map(cat => categoryColors[cat] || '#999');

  if (window.spendingChart instanceof Chart) {
    window.spendingChart.destroy();
  }

  // If no data, show empty chart or message? Chart.js handles empty data gracefully usually

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

  window.spendingChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        label: 'Spending',
        data: values,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          }
        }
      },
      cutout: '70%'
    }
  });
}

// Init
renderBudgets();
});