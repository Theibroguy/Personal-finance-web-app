document.addEventListener('DOMContentLoaded', function () {
  const transactionList = document.getElementById('transaction-list');
  const filterSelect = document.getElementById('filter');


  function renderTransactions(filter = 'all') {
    transactionList.innerHTML = '';
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (transactions.length === 0) {
      transactionList.innerHTML = '<li>No transactions found.</li>';
      return;
    }

    // Group transactions by date
    const grouped = {};

    transactions.forEach(transaction => {
      //Apply the filter
      if (filter === 'income' && transaction.amount < 0) return;
      if (filter === 'expense' && transaction.amount > 0) return;

      const date = transaction.date || 'Unknown Date';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(transaction);
    });

    // Display grouped transactions
    Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
      const heading = document.createElement('h3');
      heading.textContent = new Date(date).toDateString();
      heading.style.marginTop = '20px';
      transactionList.appendChild(heading);

      grouped[date].forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.title}: ₦${Math.abs(transaction.amount)}`;
        li.classList.add(transaction.amount < 0 ? 'expense' : 'income');
        li.style.color = transaction.amount < 0 ? 'red' : 'green';
        transactionList.appendChild(li);
      });
    });
  }

  // Initial render
  renderTransactions();

  // Filter dropdown handler
  filterSelect.addEventListener('change', () => {
    renderTransactions(filterSelect.value);
  });
});
