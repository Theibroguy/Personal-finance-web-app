document.addEventListener('DOMContentLoaded', async () => {
  const profileForm = document.getElementById('profile-form');
  const passwordForm = document.getElementById('password-form');
  const notificationForm = document.getElementById('notification-form');
  const statusMessage = document.getElementById('status-message');
  const passwordStatus = document.getElementById('password-status');
  const notificationStatus = document.getElementById('notification-status');
  const themeToggle = document.getElementById('theme-toggle');
  const toggleBtn = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');

  // Sidebar toggle functionality
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Theme Toggle Logic
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.checked = false;
  } else {
    document.body.classList.remove('light-mode');
    themeToggle.checked = true;
  }

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  });

  // Load user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.email) {
    window.location.href = 'Login.html';
    return;
  }

  // Pre-fill profile form
  document.getElementById('email').value = user.email;
  document.getElementById('username').value = user.username || '';

  // Profile Update
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMessage.textContent = 'Updating...';
    statusMessage.style.color = 'var(--text-gray)';

    const updatedUser = {
      email: document.getElementById('email').value,
      username: document.getElementById('username').value,
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();

      if (res.ok) {
        statusMessage.textContent = 'Profile updated successfully!';
        statusMessage.style.color = 'var(--success)';
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        statusMessage.textContent = data.message || 'Error updating profile';
        statusMessage.style.color = 'var(--danger)';
      }
    } catch (err) {
      console.error('Error:', err);
      statusMessage.textContent = 'Network error. Try again.';
      statusMessage.style.color = 'var(--danger)';
    }
  });

  // Password Update
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    passwordStatus.textContent = 'Updating...';
    passwordStatus.style.color = 'var(--text-gray)';

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      passwordStatus.textContent = "New passwords do not match";
      passwordStatus.style.color = "var(--danger)";
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        passwordStatus.textContent = 'Password updated successfully';
        passwordStatus.style.color = "var(--success)";
        passwordForm.reset();
      } else {
        passwordStatus.textContent = data.message || 'Error updating password';
        passwordStatus.style.color = "var(--danger)";
      }
    } catch (err) {
      console.error('Password update error:', err);
      passwordStatus.textContent = 'Something went wrong please try again.';
      passwordStatus.style.color = "var(--danger)";
    }
  });

  // Password Strength
  const newPasswordInput = document.getElementById('new-password');
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');

  newPasswordInput.addEventListener('input', () => {
    const password = newPasswordInput.value;
    const strength = getPasswordStrength(password);

    strengthBar.style.width = `${strength.percent}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = strength.label;
    strengthText.style.color = strength.color;
  });

  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[\W]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', percent: 25, color: 'var(--danger)' };
    if (score === 2) return { label: 'Medium', percent: 50, color: 'var(--warning)' };
    if (score === 3) return { label: 'Strong', percent: 75, color: 'var(--success)' };
    return { label: 'Very Strong', percent: 100, color: 'var(--success)' };
  }

  // Notification Preferences
  const emailCheckbox = document.getElementById('email-notifications');
  const frequencySelect = document.getElementById('report-frequency');

  // Load preferences
  async function loadPreferences() {
    try {
      const res = await fetch(`http://localhost:5000/api/user/preferences?email=${user.email}`);
      const data = await res.json();
      if (res.ok && data.preferences) {
        emailCheckbox.checked = data.preferences.email;
        frequencySelect.value = data.preferences.frequency;
      }
    } catch (err) {
      console.error('Failed to load preferences', err);
    }
  }
  loadPreferences();

  notificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    notificationStatus.textContent = 'Saving...';
    notificationStatus.style.color = 'var(--text-gray)';

    const prefs = {
      email: emailCheckbox.checked,
      frequency: frequencySelect.value
    };

    try {
      const res = await fetch('http://localhost:5000/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, preferences: prefs })
      });

      const data = await res.json();

      if (res.ok) {
        notificationStatus.textContent = "Preferences saved successfully";
        notificationStatus.style.color = "var(--success)";
      } else {
        notificationStatus.textContent = data.message || "Failed to save preferences";
        notificationStatus.style.color = "var(--danger)";
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      notificationStatus.textContent = "Network error";
      notificationStatus.style.color = "var(--danger)";
    }
  });
});

// Toggle Password Visibility
function togglePassword(el) {
  const input = el.previousElementSibling;
  const showIcon = el.querySelector('.show');
  const hideIcon = el.querySelector('.hide');

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