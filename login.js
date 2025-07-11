document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById(login-form);

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (email === '' || password === '') {
      alert('Please fill in both email and password');
      return;
    }

    // Simulate successful login
    // I will add localStorage here
    window.location.href = 'Dashboard.html';
  });
});