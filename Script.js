// From this section is the improved or refined code
//Get from localStorage or fallback to empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];


//DOM references
const form = document.getElementById('transaction-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const transactionList = document.getElementById('transaction-list');
const incomeDisplay = document.getElementById('income');
const expenseDisplay = document.getElementById('expense');
const balanceDisplay = document.getElementById('balance');


// Save to localStorage
function saveTransaction() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
};


// Display transactions in List and delete a transaction in list
function displayTransactions() {
  transactionList.innerHTML = '';

  transactions.forEach(transaction => {
    const li = document.createElement('li');
    li.className = transaction.amount < 0 ? 'expense' : 'income';

    const text = document.createTextNode(`${transaction.title} - ₦${Math.abs(transaction.amount)}`);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function () {
      deleteTransaction(transaction.id);
    };

    li.appendChild(text);
    li.appendChild(deleteBtn);
    transactionList.appendChild(li);
  });
};

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransaction();
  displayTransactions();
  updateSummary();
};


// Update summary
function updateSummary () {
  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income + expense;

  incomeDisplay.textContent = `₦${income.toFixed(2)}`;
  expenseDisplay.textContent = `₦${Math.abs(expense).toFixed(2)}`;
  balanceDisplay.textContent = `₦${balance.toFixed(2)}`
};


// Submit handler
form.addEventListener('submit', function (e) {
  e.preventDefault();


  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;

  if(title === '' || isNaN(amount)) {
    alert('Please fill in all fields correctly.');
    return;
  }

  const newTransaction = {
    id: Date.now(),
    title,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount), date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
  };

  transactions.push(newTransaction);
  saveTransaction();
  displayTransactions();
  updateSummary();
  form.requestFullscreen();
});


// Initial load
displayTransactions();
updateSummary();












/* This is just to test if everything is working
// Sample data - later we'll replace this with dynamic input
const transactions = [
  {id: 1, description: 'Salary', amount: 50000},
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

//Reference the form and inputs
const form = document.getElementById('transaction-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');


// Handle form submit
form.addEventListener('submit', function(e) {
  e.preventDefault();

  
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;

  if (title === '' || isNaN(amount)) {
    alert('please fill in all fields correctly');
    return;
  }


  const newTransaction = {
    id: Date.now(),
    title,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount)
  };


  transactions.push(newTransaction);   //Add to the array
  displayTransactions();               // Re-render list
  updateSummary();                     //Update totals
  form.reset();                        // Clear the form
});
*/