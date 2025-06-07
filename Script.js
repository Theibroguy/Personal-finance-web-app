// Sample data - later we'll replace this with dynamic input
const transactions = [
  {id: 1, description: 'Salary', amount: 5000},
  {id: 2, description: 'Groceries', amount: -7000},
  {id: 3, description: 'Transport', amount: -2000}
];


// Funtion to update the transaction list in the UI
function displayTransactions() {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';


  transactions.forEach((tx) => {
    const li = document.createElement('li');
    li.textContent = `${tx.description}: ₦${tx.amount.toLocaleString()}`;
    li.style.color = tx.amount < 0 ? 'red' : 'green';
    list.appendChild(li);
  });
}


// Function to update summary cards
function updateSummary() {
  const balance = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const income = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const cards = document.querySelectorAll('.card');
  cards[0].textContent = `Balance: ₦${balance.toLocaleString()}`;
  cards[1].textContent = `Income: ₦${income.toLocaleString()}`;
  cards[2].textContent = `Expenses: ₦${Math.abs(expense).toLocaleString()}`;
}


// Initialize the app
function init() {
  displayTransactions();
  updateSummary();
}

init();
