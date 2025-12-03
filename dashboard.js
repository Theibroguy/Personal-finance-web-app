document.addEventListener('DOMContentLoaded', () => {
  // Theme Application
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const categoryColors = {
    Food: '#4CAF50',
    Transport: '#FF6384',
    Clothes: '#36A2EB',
    Utilities: '#FFCE56',
    Communication: '#8E44AD',
    Health: '#FF0000',
    Others: '#E67E22'
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

    transactions.forEach(transaction => {
      const li = document.createElement('li');
      li.className = transaction.type === 'expense' ? 'expense' : 'income';

      const formattedAmount = Math.abs(transaction.amount)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      const category = transaction.category || "Others";
      const color = categoryColors[category] || '#999';

      li.innerHTML = `
        <span style = "color: ${color}; font-weight: 600;">
          ${transaction.title} (${category})
        </span> - ₦${formattedAmount}
        <button class = "delete-btn" data-id="${transaction._id}">✖</button>
      `;

      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        deleteTransaction(e.target.dataset.id);
      });

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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const amount = parseFloat(amountInput.value);
      const type = typeInput.value;
      const category = categoryInput.value;

      if (title === '' || isNaN(amount) || category === '') {
        alert('Please fill in all fields correctly.');
        return;
      }

      const newTransaction = {
        title,
        amount,
        type,
        category
      };

      try {
        const res = await fetch('http://localhost:5000/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(newTransaction)
        });

        const data = await res.json();
        transactions.unshift(data);
        displayTransactions();
        updateSummary();
        form.reset();
      } catch (err) {
        console.error('Error adding transaction:', err);
      }
    });
  }

  // Initialize
  fetchTransactions();
});