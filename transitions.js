document.addEventListener('DOMContentLoaded', () => {
  // Add entry animation class to the wrapper
  const wrapper = document.querySelector('.wrapper');
  if (wrapper) {
    wrapper.classList.add('page-transition-enter');
  }

  // Intercept link clicks
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Check if it's an internal link and not just a hash or empty
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && link.target !== '_blank') {
        e.preventDefault();

        // Add exit animation class
        if (wrapper) {
          wrapper.classList.remove('page-transition-enter');
          wrapper.classList.add('page-transition-exit');
        }

        // Wait for animation to finish then navigate
        setTimeout(() => {
          window.location.href = href;
        }, 300); // 300ms matches the CSS animation duration
      }
    });
  });
});
