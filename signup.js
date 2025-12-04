document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const matchText = document.getElementById('match-text');
  const form = document.getElementById('signup-form');
  const usernameInput = document.getElementById('username');
  const usernameFeedback = document.getElementById('username-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  let timeout = null;

  usernameInput.addEventListener('input', () => {
    const username = usernameInput.value;

    // Clear previous timeout
    clearTimeout(timeout);

    // Reset feedback if empty
    if (username.length === 0) {
      usernameFeedback.textContent = '';
      usernameFeedback.className = 'feedback-text';
      submitButton.disabled = false;
      return;
    }

    // Debounce the API call
    timeout = setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await res.json();

        if (data.available) {
          usernameFeedback.textContent = 'Username is available ✅';
          usernameFeedback.style.color = '#10b981'; // Success green
          submitButton.disabled = false;
        } else {
          usernameFeedback.textContent = 'Username is already taken ❌';
          usernameFeedback.style.color = '#ef4444'; // Danger red
          submitButton.disabled = true;
        }
      } catch (error) {
        console.error('Error checking username:', error);
      }
    }, 500); // 500ms delay
  });

  const emailInput = document.getElementById('email');
  const emailFeedback = document.getElementById('email-feedback');
  let emailTimeout = null;

  emailInput.addEventListener('input', () => {
    const email = emailInput.value;

    // Clear previous timeout
    clearTimeout(emailTimeout);

    // Reset feedback if empty
    if (email.length === 0) {
      emailFeedback.textContent = '';
      emailFeedback.className = 'feedback-text';
      submitButton.disabled = false;
      return;
    }

    // Debounce the API call
    emailTimeout = setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.available) {
          emailFeedback.textContent = 'Email is available ✅';
          emailFeedback.style.color = '#10b981'; // Success green
          submitButton.disabled = false;
        } else {
          emailFeedback.textContent = 'Email is already taken ❌';
          emailFeedback.style.color = '#ef4444'; // Danger red
          submitButton.disabled = true;
        }
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }, 500); // 500ms delay
  });

  confirmInput.addEventListener('input', () => {
    matchText.textContent = confirmInput.value === passwordInput.value ? 'Passwords match ✅' : 'Passwords do not match ❌';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (passwordInput.value !== confirmInput.value) {
      alert('Passwords do not match!');
      return;
    }

    const newUser = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: passwordInput.value,
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Signup successful!");
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'Dashboard.html';
      } else {
        alert(data.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong. Please try again later.");
    }
  });

  // Password strength progress bar
  const newPasswordInput = document.getElementById('password');
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');

  newPasswordInput.addEventListener('input', () => {
    const password = newPasswordInput.value;
    const strength = getPasswordStrength(password);

    // Update bar width and color
    strengthBar.style.width = `${strength.percent}%`;
    strengthBar.style.backgroundColor = strength.color;

    // Update stregth label
    strengthText.textContent = `Strength: ${strength.label}`;
  });

  // Strength logic
  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[\W]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', percent: 25, color: 'red' };
    if (score === 2) return { label: 'Medium', percent: 50, color: 'orange' };
    if (score === 3) return { label: 'Strong', percent: 75, color: 'lightgreen' };
    return { label: 'Very Strong', percent: 100, color: 'green' };
  }
});


function togglePassword(id, el) {
  const input = document.getElementById(id);
  const showIcon = el.querySelector('.show');
  const hideIcon = el.querySelector('.hide');

  if (input.type === 'password') {
    input.type = 'text';
    showIcon.style.display = 'none';
    hideIcon.style.display = 'inline-block';
  } else {
    input.type = 'password';
    showIcon.style.display = 'inline-block';
    hideIcon.style.display = 'none';
  }
}
