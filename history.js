document.addEventListener('DOMContentLoaded', function () {
  const transactionList = document.getElementById('transaction-list');
  const filterSelect = document.getElementById('filter');
  const dateSearch = document.getElementById('date-search');

  let transactions = [];

  async function fetchTransactions() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'Login.html';
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'Login.html';
          return;
        }
        throw new Error('Failed to fetch transactions');
      }

      transactions = await response.json();
      renderTransactions();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      transactionList.innerHTML = '<li>Error loading transactions. Please try again later.</li>';
    }
  }


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
        const formattedAmount = Math.abs(transaction.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        li.textContent = `${transaction.title}: ₦${formattedAmount}`;
        li.classList.add(transaction.amount < 0 ? 'expense' : 'income');
        li.style.color = transaction.amount < 0 ? 'red' : 'green';
        transactionList.appendChild(li);
      });
    });
  }



  // on load
  fetchTransactions();

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