export function initHero() {
  const heroContainer = document.getElementById('hero-carousel');
  if (!heroContainer) return;

  const slidesData = [
    {
      title: 'Artisanal Linen',
      subtitle: 'Organic Belgian Flax',
      description: 'Sourced from eco-conscious heritage fields, slow-woven for a textured hand-feel that softens with every wash.',
      image: '/assets/hero_linen.png',
      link: '#shop',
      category: 'Linen'
    },
    {
      title: 'Royal Silk Weaves',
      subtitle: 'Pure Mulberry Silk',
      description: 'Indulge in liquid elegance. 100% pure organic silk featuring lustrous satins and heritage jacquard patterns.',
      image: '/assets/hero_silk.png',
      link: '#shop',
      category: 'Silk'
    },
    {
      title: 'Cozy Fine Wool',
      subtitle: 'Ethically Sourced Merino',
      description: 'Cruelty-free merino wool and premium cashmere blends crafted for warmth, durability, and a luxurious touch.',
      image: '/assets/hero_wool.png',
      link: '#shop',
      category: 'Wool'
    }
  ];

  // Render slides
  let slidesHTML = '';
  slidesData.forEach((slide, index) => {
    const activeClass = index === 0 ? 'active' : '';
    slidesHTML += `
      <div class="slide ${activeClass}" data-slide-index="${index}">
        <img src="${slide.image}" alt="${slide.title}" class="slide-img" loading="lazy">
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <span class="subtitle">${slide.subtitle}</span>
          <h1>${slide.title}</h1>
          <p>${slide.description}</p>
          <a href="${slide.link}" class="btn btn-primary hero-cta-btn" data-category="${slide.category}">Shop Collection</a>
        </div>
      </div>
    `;
  });

  // Render dots
  slidesHTML += `<div class="slider-dots">`;
  slidesData.forEach((_, index) => {
    const activeClass = index === 0 ? 'active' : '';
    slidesHTML += `<span class="slider-dot ${activeClass}" data-goto-index="${index}"></span>`;
  });
  slidesHTML += `</div>`;

  heroContainer.innerHTML = slidesHTML;

  // Slide state variables
  let currentSlideIndex = 0;
  const slides = heroContainer.querySelectorAll('.slide');
  const dots = heroContainer.querySelectorAll('.slider-dot');
  const totalSlides = slidesData.length;
  let slideTimer;

  function showSlide(index) {
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');

    currentSlideIndex = (index + totalSlides) % totalSlides;

    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
  }

  function startAutoplay() {
    stopAutoplay();
    slideTimer = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, 6000); // change slide every 6s
  }

  function stopAutoplay() {
    if (slideTimer) clearInterval(slideTimer);
  }

  // Event Listeners
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.dataset.gotoIndex);
      showSlide(targetIndex);
      startAutoplay(); // reset timer on user click
    });
  });

  // Add click listener to Hero CTAs to filter catalog
  const ctaButtons = heroContainer.querySelectorAll('.hero-cta-btn');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = btn.dataset.category;
      
      // Navigate to shop view
      const shopNavLink = document.querySelector('.nav-link[data-view="shop"]');
      if (shopNavLink) shopNavLink.click();

      // Set material filter pill active
      const filterPill = document.querySelector(`.filter-pill[data-material="${targetCat}"]`);
      if (filterPill) filterPill.click();
    });
  });

  startAutoplay();

  // Clean up timer when window changes or mouse hovers if desired
  heroContainer.addEventListener('mouseenter', stopAutoplay);
  heroContainer.addEventListener('mouseleave', startAutoplay);
}
