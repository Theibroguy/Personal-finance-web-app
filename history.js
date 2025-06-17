document.addEventListener('DOMContentLoaded', function () {
  const transactionList = document.getElementById('transaction-list');
  const filterSelect = document.getElementById('filter');

  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  function renderTransactions(filtered) {
    transactionList.innerHTML = '';

    if (filtered.length === 0) {
      transactionList.innerHTML = '<li>No transactions found.</li>';
      return;
    }

    // Group transactions by date
    const grouped = {};

    filtered.forEach(transaction => {
      const date = new Date(transaction.id).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    // Display grouped transactions
    Object.keys(grouped).forEach(date => {
      const dateHeader = document.createElement('h3');
      dateHeader.textContent = date;
      transactionList.appendChild(dateHeader);

      grouped[date].forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.title}: ₦${Math.abs(transaction.amount)}`;
        li.className = transaction.amount < 0 ? 'expense' : 'income';
        transactionList.appendChild(li);
      });
    });
  }

  // Filtering function
  function applyFilter() {
    const selected = filterSelect.value;

    let filteredTransactions = [...transactions];

    if (selected === 'income') {
      filteredTransactions = transactions.filter(t => t.amount > 0);
    } else if (selected === 'expense') {
      filteredTransactions = transactions.filter(t => t.amount < 0);
    }

    renderTransactions(filteredTransactions);
  }

  filterSelect.addEventListener('change', applyFilter);

  // Initial load
  applyFilter();
});