import { products } from '../data/products.js';
import { addToCart } from './Cart.js';

export function openProductDetail(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const modal = document.getElementById('product-detail-modal');
  const container = document.getElementById('product-modal-content');
  if (!modal || !container) return;

  let selectedColor = product.swatches[0];
  let quantity = 1; // Default yards is 1

  const starsHTML = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 !== 0 ? '☆' : '');

  // Render modal content
  container.innerHTML = `
    <div class="modal-image-wrapper">
      <img src="${product.image}" alt="${product.name}" class="modal-product-img">
    </div>
    <div class="modal-info-wrapper">
      <span class="product-category">${product.category} • ${product.weave} Weave</span>
      <h2 class="modal-title">${product.name}</h2>
      
      <div class="modal-rating">
        <span class="stars">${starsHTML}</span>
        <span class="rating-value">${product.rating.toFixed(1)} / 5.0</span>
      </div>

      <div class="modal-price">
        $${product.price.toFixed(2)} <span class="unit">per yard</span>
      </div>

      <p class="modal-description">${product.description}</p>

      <div class="modal-options">
        <div class="option-group">
          <span class="option-label">Select Color/Swatch</span>
          <div class="color-options-swatches">
            ${product.swatches.map((color, idx) => `
              <button class="color-swatch-btn ${idx === 0 ? 'active' : ''}" 
                      style="background-color: ${color}" 
                      data-color="${color}" 
                      title="${color}">
              </button>
            `).join('')}
          </div>
        </div>

        <div class="option-group">
          <span class="option-label">Quantity (Yards)</span>
          <div class="quantity-selector">
            <button class="quantity-adjust-btn minus" aria-label="Decrease quantity">
              <i data-lucide="minus"></i>
            </button>
            <input type="number" class="quantity-input" value="1" min="1" max="100">
            <button class="quantity-adjust-btn plus" aria-label="Increase quantity">
              <i data-lucide="plus"></i>
            </button>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-block modal-add-btn">
        <i data-lucide="shopping-bag"></i> Add to Shopping Bag
      </button>

      <div class="modal-features mt-4">
        <div class="feature-item"><i data-lucide="truck"></i> Free Shipping globally</div>
        <div class="feature-item"><i data-lucide="rotate-ccw"></i> 30-Day Swatch returns</div>
      </div>
    </div>
  `;

  // Create Lucide Icons
  if (window.lucide) window.lucide.createIcons();

  // Show Modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scroll

  // Event Listeners for Swatches
  const swatchBtns = container.querySelectorAll('.color-swatch-btn');
  swatchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      swatchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  // Event Listeners for Quantity adjusting
  const qtyInput = container.querySelector('.quantity-input');
  const plusBtn = container.querySelector('.plus');
  const minusBtn = container.querySelector('.minus');

  plusBtn.addEventListener('click', () => {
    quantity = parseInt(qtyInput.value) + 1;
    qtyInput.value = quantity;
  });

  minusBtn.addEventListener('click', () => {
    if (quantity > 1) {
      quantity = parseInt(qtyInput.value) - 1;
      qtyInput.value = quantity;
    }
  });

  qtyInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) {
      val = 1;
    }
    quantity = val;
    qtyInput.value = quantity;
  });

  // Add to Bag action button
  const addToBagBtn = container.querySelector('.modal-add-btn');
  addToBagBtn.addEventListener('click', () => {
    addToCart(product, quantity, selectedColor);
    // Close modal
    closeModal();
  });

  // Close modal logic
  const closeBtn = document.getElementById('product-modal-close');
  closeBtn.addEventListener('click', closeModal);

  // Close when clicking overlay background
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
  }
}
