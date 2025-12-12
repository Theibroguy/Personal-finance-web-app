
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

let budgets = [];
const budgetList = document.getElementById('budget-list');
const form = document.getElementById('budget-form');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('limit');

const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// Modal Elements
const modal = document.getElementById('budgetRequestModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalTransactionList = document.getElementById('modalTransactionList');

// Sidebar toggle functionality
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

// Close Modal
if (closeModal) {
  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

// Close on outside click
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});


function formatAmount(amount) {
  return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch budgets from backend
async function fetchBudgets() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'Login.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/budgets', {
      headers: { 'x-auth-token': token }
    });
    if (res.ok) {
      budgets = await res.json();
      renderBudgets();
    } else {
      console.error('Failed to fetch budgets');
    }
  } catch (err) {
    console.error('Error fetching budgets:', err);
  }
}

// Fetch transactions from backend
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
    const transactions = await fetchTransactions();
    updateChart(transactions);
    return;
  }

  const transactions = await fetchTransactions();

  budgets.forEach((budget) => {
    const budgetCategory = budget.category.toLowerCase();

    // Filter transactions for this budget
    const budgetTransactions = transactions.filter(t =>
      t.type === 'expense' && (t.category?.toLowerCase() === budgetCategory || (budgetCategory === 'others' && !t.category))
    );

    const spent = budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percentageUsed = Math.min((spent / budget.amount) * 100, 100).toFixed(1);

    let barColor = 'var(--success)'; // green
    if (spent > budget.amount) {
      barColor = 'var(--danger)'; // red
    } else if (percentageUsed >= 80) {
      barColor = 'var(--warning)'; // yellow
    }

    const li = document.createElement('li');
    li.className = 'budget-item';
    // Add cursor pointer to indicate clickability
    li.style.cursor = 'pointer';

    li.innerHTML = `
        <div class="budget-header">
          <div class="budget-info">
             <div class="category-icon"><i class="fa-solid fa-tag"></i></div>
             <h3>${budget.category}</h3>
          </div>
          <button class="delete-btn" title="Delete" data-id="${budget._id}" style="background: none; border: none; color: var(--text-gray); cursor: pointer; z-index: 10;"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="budget-stats" style="margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>₦${formatAmount(spent)} spent</span>
          <span>Target: ₦${formatAmount(budget.amount)}</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" style="background: ${barColor}; width: 0%" data-width="${percentageUsed}%"></div>
        </div>
        <div style="text-align: right; font-size: 12px; color: ${barColor}; margin-top: 4px;">${percentageUsed}%</div>
      `;

    // Delete functionality
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent modal from opening
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Delete this budget?')) {
        await deleteBudget(id);
      }
    });

    // Click event for modal
    li.addEventListener('click', () => {
      showBudgetDetails(budget.category, budgetTransactions);
    });

    budgetList.appendChild(li);

    // Animate progress bar
    setTimeout(() => {
      const progressBar = li.querySelector('.progress-bar');
      if (progressBar) progressBar.style.width = progressBar.getAttribute('data-width');
    }, 100);
  });

  updateChart(transactions);
}

function showBudgetDetails(category, transactions) {
  modalTitle.textContent = `${category} Transactions`;
  modalTransactionList.innerHTML = '';

  if (transactions.length === 0) {
    modalTransactionList.innerHTML = '<li style="color: var(--text-gray); background: transparent; border: none; text-align: center;">No transactions found.</li>';
  } else {
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
      const li = document.createElement('li');
      li.className = 'budget-item'; // Reuse item style but simpler
      li.style.padding = '12px';
      li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="font-size: 14px; font-weight: 500; color: var(--text-light);">${t.title || 'Untitled'}</h4>
                        <span style="font-size: 12px; color: var(--text-gray);">${formatDate(t.date)}</span>
                    </div>
                    <span style="font-weight: 600; color: var(--danger);">-₦${formatAmount(t.amount)}</span>
                </div>
            `;
      modalTransactionList.appendChild(li);
    });
  }

  modal.classList.add('active');
}

async function deleteBudget(id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:5000/api/budgets/${id}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });

    if (res.ok) {
      fetchBudgets(); // Refresh list
    } else {
      alert('Failed to delete budget');
    }
  } catch (err) {
    console.error('Error deleting budget:', err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const category = categoryInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const token = localStorage.getItem('token');

  if (category === '' || isNaN(amount)) {
    alert('Please enter a valid category and amount.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ category, amount })
    });

    if (res.ok) {
      form.reset();
      fetchBudgets(); // Refresh list
    } else {
      alert('Failed to add budget');
    }
  } catch (err) {
    console.error('Error adding budget:', err);
  }
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
fetchBudgets();
