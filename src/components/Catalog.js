import { products } from '../data/products.js';
import { openProductDetail } from './ProductDetail.js';
import { addToCart } from './Cart.js';

let activeCategory = 'all';
let searchQuery = '';
let maxPrice = 150;
let selectedWeaves = ['Plain', 'Twill', 'Satin', 'Jacquard'];
let currentSort = 'featured';

export function initCatalog() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  setupCatalogListeners();
  renderCatalog();
}

export function renderCatalog() {
  const grid = document.getElementById('product-grid');
  const countLabel = document.getElementById('results-count');
  if (!grid) return;

  // Filter products
  let filtered = products.filter(product => {
    // Category match
    const categoryMatch = activeCategory === 'all' || product.category.toLowerCase() === activeCategory.toLowerCase();
    
    // Search query match
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price match
    const priceMatch = product.price <= maxPrice;
    
    // Weave match
    const weaveMatch = selectedWeaves.includes(product.weave);

    return categoryMatch && searchMatch && priceMatch && weaveMatch;
  });

  // Sort products
  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'alphabetical') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Featured (default)
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  // Update count label
  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} fabric${filtered.length === 1 ? '' : 's'}`;
  }

  // Render product cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results container text-center my-5">
        <i data-lucide="info" class="huge-icon mb-3"></i>
        <h3>No fabrics match your criteria</h3>
        <p class="text-muted">Try adjusting your filters, search terms, or clearing filters.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 !== 0 ? '☆' : '');
    const badgeHTML = product.featured ? `<span class="product-badge">Featured</span>` : '';
    
    // Render swatches
    const swatchesHTML = product.swatches.map(color => `
      <span class="swatch" style="background-color: ${color}" title="${color}"></span>
    `).join('');

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-card-img">
          ${badgeHTML}
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-quick-view" data-quick-view="${product.id}">
            <button class="btn btn-sm btn-outline">Quick View</button>
          </div>
        </div>
        <div class="product-card-info">
          <span class="product-category">${product.category} • ${product.weave}</span>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">$${product.price.toFixed(2)} <span class="price-unit">/ yd</span></div>
          <div class="product-swatches">
            ${swatchesHTML}
          </div>
          <div class="product-card-action">
            <button class="btn btn-primary add-to-cart-quick" data-add-id="${product.id}">
              <i data-lucide="shopping-bag"></i> Add To Bag
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach card event listeners
  const quickViewBtns = grid.querySelectorAll('.product-quick-view');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.quickView;
      openProductDetail(id);
    });
  });

  const addToCartBtns = grid.querySelectorAll('.add-to-cart-quick');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.addId;
      const product = products.find(p => p.id === id);
      if (product) {
        addToCart(product, 1, product.swatches[0]); // default quantity 1, first color swatch
      }
    });
  });
}

function setupCatalogListeners() {
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }

  // Material category pills
  const materialFilters = document.getElementById('material-filters');
  if (materialFilters) {
    const pills = materialFilters.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.dataset.material;
        renderCatalog();
      });
    });
  }

  // Price range slider
  const priceRange = document.getElementById('price-range');
  const priceMaxLabel = document.getElementById('price-max-label');
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      maxPrice = parseInt(e.target.value);
      if (priceMaxLabel) {
        priceMaxLabel.textContent = `Max: $${maxPrice}`;
      }
      renderCatalog();
    });
  }

  // Weave checkboxes
  const weaveFilters = document.getElementById('weave-filters');
  if (weaveFilters) {
    const checkboxes = weaveFilters.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        selectedWeaves = Array.from(checkboxes)
          .filter(c => c.checked)
          .map(c => c.value);
        renderCatalog();
      });
    });
  }

  // Sort selector
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog();
    });
  }

  // Clear filters
  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      
      activeCategory = 'all';
      const pills = document.querySelectorAll('.filter-pill');
      pills.forEach(p => {
        if (p.dataset.material === 'all') p.classList.add('active');
        else p.classList.remove('active');
      });

      maxPrice = 150;
      if (priceRange) {
        priceRange.value = 150;
        if (priceMaxLabel) priceMaxLabel.textContent = 'Max: $150';
      }

      selectedWeaves = ['Plain', 'Twill', 'Satin', 'Jacquard'];
      if (weaveFilters) {
        const checkboxes = weaveFilters.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(c => c.checked = true);
      }

      currentSort = 'featured';
      if (sortSelect) sortSelect.value = 'featured';

      renderCatalog();
    });
  }
}
