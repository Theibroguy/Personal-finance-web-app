// settings.js
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('profile-form');
  const status = document.getElementById('status-message');

  // Load user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.email) {
    status.textContent = "You need to log in first.";
    return;
  }

  // Pre-fill form
  document.getElementById('email').value = user.email;
  document.getElementById('username').value = user.username || '';

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedUser = {
      email: document.getElementById('email').value,
      username: document.getElementById('username').value,
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();

      if (res.ok) {
        status.textContent = 'Profile updated successfully!';
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        status.textContent = data.message || 'Error updating profile';
      }
    } catch (err) {
      console.error('Error:', err);
      status.textContent = 'Network error. Try again.';
    }
  });

  // PASSWORD FORM
  const passwordForm = document.getElementById('password-form');
  const passwordStatus = document.getElementById('password-status');

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const email = JSON.parse(localStorage.getItem('user')).email;

    const strength = getPasswordStrength(newPassword);

    if (strength.percent <= 50) {
      passwordStatus.textContent = "Password is too weak. Try making it stronger 🔐";
      passwordStatus.style.color = "red";
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordStatus.textContent = "New passwords do not match ❌";
      passwordStatus.style.color = "red";
      return;
    }

    try {
      const res =await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        passwordStatus.textContent = 'Password updated successfully ✅';
        passwordStatus.style.color = "green";
        passwordForm.reset();
        strengthBar.style.width = '0%'; // This resets strength bar
        strengthText.textContent = '';
      } else {
        passwordStatus.textContent = data.message || 'Error updating password';
        passwordStatus.style.color = "red";
      }
    } catch (err) {
      console.error('Password update error:', err);
      passwordStatus.textContent = 'Something went wrong please try again.';
      passwordStatus.style.color = "red";
    }
  });

  // Password strength progress bar
  const newPasswordInput = document.getElementById('new-password');
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
    if (score === 2) return { label: 'Medium', percent: 50, color: 'orange'};
    if (score === 3) return { label: 'Strong', percent: 75, color: 'lightgreen' };
    return { label: 'Very Strong', percent: 100, color: 'green'};
  }
});


// Toggle show/hide password
function togglePassword(inputType, el) {
  const input = el.previousElementSibling;
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

// Notification preference logic
const notifForm = document.getElementById('notification-form');
const emailCheckbox = document.getElementById('email-notifications');
const frequencySelect = document.getElementById('report-frequency');
const notifStatus = document.getElementById('notification-status');

const userData = JSON.parse(localStorage.getItem('user'));

// Load existing preferences from backend 
async function loadPreferences() {
  try {
    const res = await fetch(`http://localhost:5000/api/user/preferences?email=${userData.email}`);
    const data = await res.json();
    if (res.ok && data.preferences) {
      emailCheckbox.checked = data.preferences.email;
      frequencySelect.value = data.preferences.frequency;
    }
  } catch {
    console.error('Failed to load preferences', err);
  }
}

loadPreferences();

// Save preferences from backend
notifForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const prefs = {
    email: emailCheckbox.checked,
    frequency: frequencySelect.value
  };

  try {
    const res = await fetch('http://localhost:5000/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        preferences: prefs
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      notifStatus.textContent = "Preferences updated successfully ✅";
      notifStatus.style.color = "green";
    } else {
      notifStatus.textContent = data.message || "Failed to update preferences ❌";
      notifStatus.style.color = "red";
    }
  } catch (err) {
    console.error("Error updating preferences:", err);
    notifStatus.style.color = "red";
  }
});