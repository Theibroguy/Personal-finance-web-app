document.addEventListener('DOMContentLoaded', function () {
  const transactionList = document.getElementById('transaction-list');
  const filterButtons = document.querySelectorAll('#filters button');

  // Get stored transactions
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  function renderTransactions(filter = 'all') {
    transactionList.innerHTML = '';

    const filtered = transactions.filter(transaction => {
      if (filter === 'income') return transaction.amount > 0;
      if (filter === 'expense') return transaction.amount < 0;
      return true; // 'all'
    });

    if (filtered.length === 0) {
      transactionList.innerHTML = '<li>No transaction found.</li>';
      return;
    }

    filtered.forEach(transaction => {
      const li = document.createElement('li');
      li.textContent = `${transaction.title}: ${transaction.amount > 0 ? '+' : ''}₦${Math.abs(transaction.amount)}`;
      li.classList.add(transaction.amount > 0 ? 'income' : 'expense');
      transactionList.appendChild(li);
    });
  }

  // Event listeners for filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('data-filter');
      renderTransactions(selected);
    });
  });

  // Initial load
  renderTransactions();
});