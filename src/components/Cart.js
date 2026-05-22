import { openCheckout } from './Checkout.js';

let cart = [];
let discountPercentage = 0; // 0 to 100
let appliedPromoCode = '';

export function getCart() {
  return cart;
}

export function clearCart() {
  cart = [];
  discountPercentage = 0;
  appliedPromoCode = '';
  const couponInput = document.getElementById('coupon-input');
  if (couponInput) couponInput.value = '';
  
  const discountDisplay = document.getElementById('discount-display');
  if (discountDisplay) discountDisplay.style.display = 'none';

  syncCart();
}

export function initCart() {
  setupCartDrawerListeners();
  syncCart();
}

export function addToCart(product, quantity, selectedColor) {
  // Check if item already exists in cart with same color
  const existingItem = cart.find(item => item.product.id === product.id && item.color === selectedColor);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      product,
      quantity,
      color: selectedColor
    });
  }

  // Trigger bounce animation on cart badge
  triggerBadgeBounce();
  
  // Sync UI
  syncCart();
  
  // Open cart drawer so user sees it added
  toggleCartDrawer(true);
}

function triggerBadgeBounce() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.classList.add('bounce');
    setTimeout(() => {
      badge.classList.remove('bounce');
    }, 400);
  }
}

export function toggleCartDrawer(show) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;

  if (show) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function syncCart() {
  const countBadge = document.getElementById('cart-count');
  const drawerCount = document.getElementById('cart-drawer-count');
  const container = document.getElementById('cart-items-container');
  const summarySection = document.getElementById('cart-summary-section');

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Update counts
  if (countBadge) countBadge.textContent = totalItems;
  if (drawerCount) drawerCount.textContent = totalItems;

  if (totalItems === 0) {
    // Show empty cart state
    container.innerHTML = `
      <div class="empty-cart-state">
        <i data-lucide="shopping-bag" class="huge-icon"></i>
        <p>Your shopping bag is empty.</p>
        <a href="#shop" class="btn btn-outline" id="cart-empty-shop-btn">Browse Fabrics</a>
      </div>
    `;
    if (summarySection) summarySection.style.display = 'none';
    
    // Attach listener to empty state CTA
    const emptyShopBtn = document.getElementById('cart-empty-shop-btn');
    if (emptyShopBtn) {
      emptyShopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartDrawer(false);
        const shopLink = document.querySelector('.nav-link[data-view="shop"]');
        if (shopLink) shopLink.click();
      });
    }

    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Populate Cart Items
  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" data-index="${idx}">
      <div class="cart-item-img">
        <img src="${item.product.image}" alt="${item.product.name}">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.product.name}</h4>
        <div class="cart-item-meta">
          <span>Weave: ${item.product.weave}</span>
          <span class="color-indicator">Color: <span class="dot" style="background-color: ${item.color}" title="${item.color}"></span></span>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-selector-sm">
            <button class="qty-btn minus-qty" data-index="${idx}" aria-label="Decrease quantity"><i data-lucide="minus"></i></button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn plus-qty" data-index="${idx}" aria-label="Increase quantity"><i data-lucide="plus"></i></button>
          </div>
          <button class="remove-item-btn" data-index="${idx}"><i data-lucide="trash-2"></i> Remove</button>
        </div>
      </div>
      <div class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach control event listeners
  container.querySelectorAll('.minus-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (cart[idx].quantity > 1) {
        cart[idx].quantity--;
        syncCart();
      }
    });
  });

  container.querySelectorAll('.plus-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      cart[idx].quantity++;
      syncCart();
    });
  });

  container.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      cart.splice(idx, 1);
      syncCart();
    });
  });

  // Calculate pricing
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  let discountAmount = 0;
  if (discountPercentage > 0) {
    discountAmount = subtotal * (discountPercentage / 100);
  }
  const total = subtotal - discountAmount;

  // Render prices in summary
  const subtotalElem = document.getElementById('cart-subtotal');
  const discountDisplay = document.getElementById('discount-display');
  const discountAmountElem = document.getElementById('discount-amount');
  const totalElem = document.getElementById('cart-total');

  if (subtotalElem) subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
  
  if (discountPercentage > 0 && discountDisplay && discountAmountElem) {
    discountDisplay.style.display = 'flex';
    discountAmountElem.textContent = `-$${discountAmount.toFixed(2)}`;
  } else if (discountDisplay) {
    discountDisplay.style.display = 'none';
  }

  if (totalElem) totalElem.textContent = `$${total.toFixed(2)}`;

  if (summarySection) summarySection.style.display = 'block';
}

function setupCartDrawerListeners() {
  const toggleBtn = document.getElementById('cart-toggle-btn');
  const closeBtn = document.getElementById('cart-close-btn');
  const overlay = document.getElementById('cart-overlay');
  const checkoutBtn = document.getElementById('checkout-btn');
  const applyPromoBtn = document.getElementById('apply-coupon-btn');
  const couponInput = document.getElementById('coupon-input');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => toggleCartDrawer(true));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleCartDrawer(false));
  }

  if (overlay) {
    overlay.addEventListener('click', () => toggleCartDrawer(false));
  }

  // Promo code apply
  if (applyPromoBtn && couponInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === 'ECOWEAVE') {
        discountPercentage = 15;
        appliedPromoCode = code;
        alert('Promo code ECOWEAVE applied successfully! 15% discount has been deducted.');
        syncCart();
      } else {
        alert('Invalid promo code. Try "ECOWEAVE" for 15% off.');
      }
    });
  }

  // Proceed to Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      toggleCartDrawer(false);
      openCheckout(cart, discountPercentage, appliedPromoCode);
    });
  }
}
