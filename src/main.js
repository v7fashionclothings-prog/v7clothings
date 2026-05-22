import { initHero } from './components/Hero.js';
import { initCatalog } from './components/Catalog.js';
import { initCart } from './components/Cart.js';
import { initCheckout } from './components/Checkout.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize Components
  initHero();
  initCatalog();
  initCart();
  initCheckout();

  // Navigation Logic
  setupNavigation();

  // Mobile Menu Logic
  setupMobileMenu();

  // Theme Toggler
  setupThemeToggle();

  // Navbar Scroll Effects (hide on scroll down, glass effect)
  setupNavbarScroll();

  // Contact Form Submission Mock
  setupContactForm();
});

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const appViews = document.querySelectorAll('.app-view');

  function switchView(viewName) {
    // Deactivate all links and views
    navLinks.forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    appViews.forEach(view => {
      view.classList.remove('active');
    });

    // Activate selected view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  // Set up listeners for header and mobile menu navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const viewName = link.dataset.view;
      if (viewName) {
        // e.preventDefault(); // Don't prevent default so url hashes work if needed, or prevent it
        switchView(viewName);
        
        // If it was a mobile drawer link, close the drawer
        closeMobileDrawer();
      }
    });
  });

  // Category cards click from Home view
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      
      // Go to shop
      switchView('shop');

      // Click the category filter pill in Shop sidebar
      const pill = document.querySelector(`.filter-pill[data-material="${cat}"]`);
      if (pill) {
        pill.click();
      }
    });
  });

  // Footer collection links
  const footerLinks = document.querySelectorAll('.footer-links a, .footer-brand a.logo');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const viewName = link.dataset.view;
      const cat = link.dataset.category;
      
      if (viewName) {
        switchView(viewName);
        if (viewName === 'shop' && cat) {
          const pill = document.querySelector(`.filter-pill[data-material="${cat}"]`);
          if (pill) pill.click();
        }
      }
    });
  });

  // Handle logo clicks (go to home)
  const logo = document.getElementById('nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('home');
    });
  }

  // Read URL Hash on load
  const hash = window.location.hash.substring(1);
  if (hash === 'shop' || hash === 'about' || hash === 'contact') {
    switchView(hash);
  } else {
    switchView('home');
  }
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');

  if (menuBtn && drawer && overlay) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileDrawer);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileDrawer);
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function setupThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlTag = document.documentElement;

  // Retrieve saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlTag.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlTag.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlTag.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}

function setupNavbarScroll() {
  const header = document.getElementById('app-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (!header) return;

    // Show/hide glass border or background opacity
    if (window.scrollY > 50) {
      header.classList.add('navbar-scrolled');
    } else {
      header.classList.remove('navbar-scrolled');
    }

    // Hide navbar on scroll down, show on scroll up
    if (window.scrollY > lastScrollY && window.scrollY > 200) {
      header.classList.add('nav-hidden');
    } else {
      header.classList.remove('nav-hidden');
    }
    lastScrollY = window.scrollY;
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      alert(`Thank you, ${name}! Your inquiry has been sent to Loom & Thread specialists. We will get back to you within 24 hours.`);
      form.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for subscribing to The Loom Newsletter! Your first fabric swatches update is on the way.');
      newsletterForm.reset();
    });
  }
}
