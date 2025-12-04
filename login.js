document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const rememberMeCheckbox = document.getElementById('remember-me');

  // Check if email is saved in localStorage
  const savedEmail = localStorage.getItem('savedEmail');
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMeCheckbox.checked = true;
  }

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    const email = emailInput.value.trim();
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
        // Handle Remember Me
        if (rememberMeCheckbox.checked) {
          localStorage.setItem('savedEmail', email);
        } else {
          localStorage.removeItem('savedEmail');
        }

        // Show success animation
        const overlay = document.querySelector('.login-success-overlay');
        if (overlay) {
          overlay.style.display = 'flex';
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = 'Dashboard.html';
        }, 2000);
      } else {
        alert(data.message || 'Invalid login credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});