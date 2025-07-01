document.addEventListener('DOMContentLoaded', function () {
  const transactionList = document.getElementById('transaction-list');
  const filterSelect = document.getElementById('filter');
  const dateSearch = document.getElementById('date-search');

  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];


  function renderTransactions(filter = 'all', date = '') {
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
      transactionList.innerHTML = '<li>No transactions found.</li>';
      return;
    }

    // Group transactions by date
    const grouped = {};

    transactions.forEach(transaction => {
      //Apply the filter
      if (filter !== 'all' && ((filter === 'income' && transaction.amount < 0) || (filter === 'expense' && transaction.amount > 0))) return;

      // Apply date filter (if any)
      if (date) {
        const transDate = transaction.date ? transaction.date.split('T')[0] : '';
        if (transDate !== date) return;
      }

      const dateKey = transaction.date ? transaction.date.split('T')[0] : 'Unknown Date';
      if (!grouped[date]) grouped[dateKey] = [];
      grouped[dateKey].push(transaction);
    });

    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    if (dates.length === 0) {
      transactionList.innerHTML = '<li>No matching transactions.</li>';
    }

    dates.forEach(date => {
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

   

  // on load
  renderTransactions();

  // On filter change
  filterSelect.addEventListener('change', () => {
    renderTransactions(filterSelect.value, dateSearch.value);
  });

  // On date search change
  dateSearch.addEventListener('change', () => {
    renderTransactions(filterSelect.value, dateSearch.value)
  });
});


// SIDEBAR TOGGLE FUNCTIONALITY
const toggleBtn = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
    });
  }