document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (email === '' || password === '') {
      alert('Please fill in both email and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Login successfull');
        localStorage.setItem('user', JSON.stringify({ email }));
        window.location.href = 'Dashboard.html';
      } else {
        alert(data.message || 'Invalid login credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});