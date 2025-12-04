document.addEventListener('DOMContentLoaded', () => {
  const resetPasswordForm = document.getElementById('reset-password-form');
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    alert('Invalid or missing token. Please request a new password reset link.');
    window.location.href = 'forgot-password.html';
    return;
  }

  resetPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Password reset successful');
        window.location.href = 'Login.html';
      } else {
        alert(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
