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
});