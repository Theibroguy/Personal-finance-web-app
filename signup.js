document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');

  form.addEventListener('submit' function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !email || password) {
      alert('Please fill in all fields');
      return;
    }

    // Save user details to locaStorage (for demo purpose)
    localStorage.setItem('user', JSON.stringify({username, email, password}));

    // Redirect to dashboard
    window.location.href = 'Dashboard.html';
  });
});