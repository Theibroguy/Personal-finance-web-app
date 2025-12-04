document.addEventListener('DOMContentLoaded', () => {
  const forgotPasswordForm = document.getElementById('forgot-password-form');

  forgotPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();

    if (email === '') {
      alert('Please enter your email address');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Password reset link sent to email');
        if (data.previewUrl) {
          console.log('Preview URL:', data.previewUrl);
          // Open preview URL in new tab for dev testing
          window.open(data.previewUrl, '_blank');
        }
      } else {
        alert(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
