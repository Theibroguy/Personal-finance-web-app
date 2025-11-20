document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const matchText = document.getElementById('match-text');
  const form = document.getElementById('signup-form');

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
  const [showIcon, hideIcon] = el.querySelectorAll('svg');

  if (input.type === 'password') {
    input.type = 'text';
    showIcon.style.display = 'none';
    hideIcon.style.display = 'inline';

  } else {
    input.type = 'password';
    showIcon.style.display = 'inline';
    hideIcon.style.display = 'none';
  }
}
