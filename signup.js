document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const strengthText = document.getElementById('strength-text');
  const matchText = document.getElementById('match-text');
  const form = document.getElementById('signup-form');

  passwordInput.addEventListener('input', () => {
    const value = passwordInput.value;
    const strength = getPasswordStrength(value);

    strengthText.textContent = `Strength: ${strength.label}`;
    strengthText.style.color = strength.color;
  });

  confirmInput.addEventListener('input', () => {
    matchText.textContent = confirmInput.value === passwordInput.value ? 'Passwords match ✅' : 'Passwords do not match ❌';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value !== confirmInput.value) {
      alert('Passwords do not match!');
      return;
    }
    // Proceed with signup
    alert("Sign up successful");
    // Redirect or save data here
    setTimeout(() => {
      window.location.href = "Dashboard.html";
    }, 1000);
  });
});

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[\W]/.test(password)) score++;

  if (score <= 1) return {label: 'Weak', color: 'red' };
  if (score === 2) return {label: 'Medium', color: 'orange' };
  return {label: 'Strong', color: 'lightgreen' };
}

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
