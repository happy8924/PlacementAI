/**
 * PlacementAI — Theme & Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initOnboardingModal();
  initScrollReveal();
});

/* Theme Toggle & LocalStorage Persistence */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const mobileToggleBtn = document.getElementById('mobile-theme-toggle');
  
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');
  
  const mobileSunIcon = document.getElementById('mobile-theme-sun');
  const mobileMoonIcon = document.getElementById('mobile-theme-moon');

  // Helper to sync UI icons and accessibility labels
  function updateThemeUI(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
      
      if (mobileSunIcon) mobileSunIcon.classList.remove('hidden');
      if (mobileMoonIcon) mobileMoonIcon.classList.add('hidden');

      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Switch to light mode');
      if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      document.documentElement.classList.remove('dark');
      
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
      
      if (mobileSunIcon) mobileSunIcon.classList.add('hidden');
      if (mobileMoonIcon) mobileMoonIcon.classList.remove('hidden');

      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // Initial State Check
  const currentTheme = localStorage.getItem('placementai-theme') || 'dark';
  updateThemeUI(currentTheme === 'dark');

  // Toggle Function
  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('placementai-theme', newTheme);
    updateThemeUI(newTheme === 'dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleTheme);
  }
}

/* Mobile Navigation Handler */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        menu.classList.add('hidden');
        if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      } else {
        menu.classList.remove('hidden');
        if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      }
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      });
    });
  }
}

/* Onboarding Setup Modal */
function initOnboardingModal() {
  const modal = document.getElementById('modal-onboarding');
  const closeBtn = document.getElementById('modal-close');
  const form = document.getElementById('onboarding-form');
  const successBox = document.getElementById('modal-success');

  const triggers = document.querySelectorAll('.btn-getstarted-trigger, .btn-signin-trigger');

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      if (form) form.reset();
      if (successBox) successBox.classList.add('hidden');
      if (form) form.classList.remove('hidden');
    }, 300);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('hidden');
      if (successBox) successBox.classList.remove('hidden');
      setTimeout(() => {
        closeModal();
      }, 2000);
    });
  }
}

/* Scroll Reveal Handler */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}
