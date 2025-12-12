document.addEventListener('DOMContentLoaded', () => {
  // Theme Application
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const categoryColors = {
    "Housing": "#8E44AD",
    "Transportation": "#FF6384",
    "Food": "#4CAF50",
    "Utilities": "#FFCE56",
    "Healthcare": "#FF0000",
    "Entertainment": "#36A2EB",
    "Shopping": "#9C27B0",
    "Education": "#03A9F4",
    "Savings & Investments": "#009688",
    "Debt Payments": "#795548",
    "Personal Care": "#E91E63",
    "Gifts & Donations": "#673AB7",
    "Other": "#607D8B",
    "Income": "#10B981"
  };

  const categoryIcons = {
    "Housing": "fa-house",
    "Transportation": "fa-car",
    "Food": "fa-utensils",
    "Utilities": "fa-bolt",
    "Healthcare": "fa-heart-pulse",
    "Entertainment": "fa-film",
    "Shopping": "fa-bag-shopping",
    "Education": "fa-graduation-cap",
    "Savings & Investments": "fa-piggy-bank",
    "Debt Payments": "fa-credit-card",
    "Personal Care": "fa-spa",
    "Gifts & Donations": "fa-gift",
    "Other": "fa-circle-question",
    "Income": "fa-money-bill-wave"
  };

  const form = document.getElementById('transaction-form');
  const titleInput = document.getElementById('title');
  const amountInput = document.getElementById('amount');
  const typeInput = document.getElementById('type');
  const categoryInput = document.getElementById('category');

  const transactionList = document.getElementById('transaction-list');
  const incomeDisplay = document.getElementById('income');
  const expenseDisplay = document.getElementById('expense');
  const balanceDisplay = document.getElementById('balance');

  const toggleBtn = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const token = localStorage.getItem('token');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  let transactions = [];

  async function fetchTransactions() {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      transactions = data;
      displayTransactions();
      updateSummary();
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }

  function displayTransactions() {
    if (!transactionList) return;
    transactionList.innerHTML = '';

    // Show only the most recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    recentTransactions.forEach(transaction => {
      const li = document.createElement('li');
      li.className = transaction.type === 'expense' ? 'expense' : 'income';

      const formattedAmount = Math.abs(transaction.amount)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      const category = transaction.category || "Others";
      const color = categoryColors[category] || '#999';
      const icon = categoryIcons[category] || 'fa-circle-question';

      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}20; display: flex; align-items: center; justify-content: center; color: ${color};">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div>
                <span style="display: block; font-weight: 600; color: var(--text-light);">${transaction.title}</span>
                <span style="font-size: 12px; color: ${color};">${category}</span>
            </div>
        </div>
        <div>
            <span style="font-weight: 600;">₦${formattedAmount}</span>
        </div>
      `;

      transactionList.appendChild(li);
    });
  }

  async function deleteTransaction(id) {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (res.ok) {
        transactions = transactions.filter(t => t._id !== id);
        displayTransactions();
        updateSummary();
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  }

  function updateSummary() {
    if (!incomeDisplay || !expenseDisplay || !balanceDisplay) return;

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    incomeDisplay.textContent = `Income: ₦${income.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    expenseDisplay.textContent = `Expense: ₦${expense.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    balanceDisplay.textContent = `Balance: ₦${balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  if (form) {
    // Category Logic
    const incomeCategories = ["Income", "Gifts & Donations", "Savings & Investments", "Other"];
    const expenseCategories = [
      "Housing", "Transportation", "Food", "Utilities", "Healthcare",
      "Entertainment", "Shopping", "Education", "Savings & Investments",
      "Debt Payments", "Personal Care", "Gifts & Donations", "Other"
    ];

    function updateCategoryOptions(type) {
      categoryInput.innerHTML = '<option value="">Select Category</option>';
      const categories = type === 'income' ? incomeCategories : expenseCategories;

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryInput.appendChild(option);
      });
    }

    // Initialize with default type
    updateCategoryOptions(typeInput.value);

    // Listen for type changes
    typeInput.addEventListener('change', (e) => {
      updateCategoryOptions(e.target.value);
    });

    // Modal Elements
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmAmount = document.getElementById('confirmAmount');
    const confirmType = document.getElementById('confirmType');
    const confirmCategory = document.getElementById('confirmCategory');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    let pendingTransaction = null;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const amount = parseFloat(amountInput.value);
      const type = typeInput.value;
      const category = categoryInput.value;

      if (title === '' || isNaN(amount) || category === '') {
        alert('Please fill in all fields correctly.');
        return;
      }

      // Store data temporarily
      pendingTransaction = { title, amount, type, category };

      // Populate Modal
      confirmTitle.textContent = title;
      confirmAmount.textContent = `₦${amount.toFixed(2)}`;
      confirmType.textContent = type;
      confirmCategory.textContent = category;

      // Show Modal
      confirmationModal.classList.add('active');
    });

    // Handle Confirm
    confirmBtn.addEventListener('click', async () => {
      if (!pendingTransaction) return;

      try {
        const res = await fetch('http://localhost:5000/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(pendingTransaction)
        });

        const data = await res.json();
        transactions.unshift(data);
        displayTransactions();
        updateSummary();
        form.reset();

        // Hide Modal
        confirmationModal.classList.remove('active');
        pendingTransaction = null;
      } catch (err) {
        console.error('Error adding transaction:', err);
        alert('Failed to add transaction');
      }
    });

    // Handle Cancel
    cancelBtn.addEventListener('click', () => {
      confirmationModal.classList.remove('active');
      pendingTransaction = null;
    });

    // Close on outside click for confirmation modal
    window.addEventListener('click', (e) => {
      if (e.target === confirmationModal) {
        confirmationModal.classList.remove('active');
        pendingTransaction = null;
      }
    });
  }

  // Initialize
  fetchTransactions();
});