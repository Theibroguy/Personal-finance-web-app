document.addEventListener('DOMContentLoaded', () => {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  const form = document.getElementById('transaction-form');
  const titleInput = document.getElementById('title');
  const amountInput = document.getElementById('amount');
  const typeInput = document.getElementById('type');

  const transactionList = document.getElementById('transaction-list');
  const incomeDisplay = document.getElementById('income');
  const expenseDisplay = document.getElementById('expense');
  const balanceDisplay = document.getElementById('balance');

  const toggleBtn = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  function saveTransaction() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  function displayTransactions() {
    transactionList.innerHTML = '';

    transactions.forEach(transaction => {
      const li = document.createElement('li');
      li.className = transaction.amount < 0 ? 'expense' : 'income';
      li.innerHTML = `${transaction.title} - ₦${Math.abs(transaction.amount)} <button class="delete-btn">✖</button>`;

      li.querySelector('.delete-btn').addEventListener('click', () => {
        deleteTransaction(transaction.id);
      });

      transactionList.appendChild(li);
    });
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransaction();
    displayTransactions();
    updateSummary();
  }

  function updateSummary() {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const balance = income + expense;

    incomeDisplay.textContent = `Income: ₦${income.toFixed(2)}`;
    expenseDisplay.textContent = `Expense: ₦${Math.abs(expense).toFixed(2)}`;
    balanceDisplay.textContent = `Balance: ₦${balance.toFixed(2)}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;

    if (title === '' || isNaN(amount)) {
      alert('Please fill in all fields correctly.');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    };

    transactions.push(newTransaction);
    saveTransaction();
    displayTransactions();
    updateSummary();
    form.reset();
  });

  // Initialize
  displayTransactions();
  updateSummary();
});