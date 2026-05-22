import { clearCart } from './Cart.js';

let currentItems = [];
let currentDiscount = 0;
let currentPromo = '';

export function openCheckout(cartItems, discountPercent, promoCode) {
  currentItems = cartItems;
  currentDiscount = discountPercent;
  currentPromo = promoCode;

  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Reset checkout flow to step 1
  showStep(1);

  // Populate order review
  renderOrderReview();

  // Show checkout modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showStep(stepNum) {
  // Update step navigation indicators
  const stepNavs = document.querySelectorAll('.step-nav');
  stepNavs.forEach(nav => {
    const stepVal = parseInt(nav.dataset.step);
    if (stepVal === stepNum) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  // Update visible step sections
  const stepSections = document.querySelectorAll('.checkout-step');
  stepSections.forEach(section => {
    section.classList.remove('active');
  });

  const activeSection = document.getElementById(`checkout-step-${stepNum}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Handle sidebar visibility - hide sidebar on success step
  const sidebar = document.getElementById('checkout-review-sidebar');
  if (sidebar) {
    sidebar.style.display = stepNum === 3 ? 'none' : 'block';
  }
}

function renderOrderReview() {
  const container = document.getElementById('checkout-review-items');
  const subtotalLabel = document.getElementById('checkout-review-subtotal');
  const discountRow = document.getElementById('checkout-review-discount-row');
  const discountLabel = document.getElementById('checkout-review-discount');
  const totalLabel = document.getElementById('checkout-review-total');
  const payBtnAmount = document.getElementById('payment-btn-amount');

  if (!container) return;

  // Render items
  container.innerHTML = currentItems.map(item => `
    <div class="review-item">
      <div class="review-item-img">
        <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
      </div>
      <div class="review-item-details" style="flex: 1; padding-left: 1rem;">
        <h5 style="margin: 0; font-size: 0.9rem; font-weight: 600;">${item.product.name}</h5>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Qty: ${item.quantity} yds • Weave: ${item.product.weave}</div>
      </div>
      <div class="review-item-price" style="font-weight: 500;">$${(item.product.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  // Calculate prices
  const subtotal = currentItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  let discountVal = 0;
  if (currentDiscount > 0) {
    discountVal = subtotal * (currentDiscount / 100);
  }
  const total = subtotal - discountVal;

  if (subtotalLabel) subtotalLabel.textContent = `$${subtotal.toFixed(2)}`;

  if (currentDiscount > 0 && discountRow && discountLabel) {
    discountRow.style.display = 'flex';
    discountLabel.textContent = `-$${discountVal.toFixed(2)}`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }

  if (totalLabel) totalLabel.textContent = `$${total.toFixed(2)}`;
  if (payBtnAmount) payBtnAmount.textContent = `($${total.toFixed(2)})`;
}

export function initCheckout() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('checkout-modal-close');
  const shippingForm = document.getElementById('shipping-form');
  const paymentForm = document.getElementById('payment-form');
  const backBtn = document.getElementById('payment-back-btn');
  const successShopBtn = document.getElementById('success-shop-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCheckout);
  }

  // Overlay click to close
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCheckout();
    });
  }

  // Shipping Form Submit -> step 2
  if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showStep(2);
    });
  }

  // Payment Back -> step 1
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showStep(1);
    });
  }

  // Payment Form Submit -> step 3 (Success)
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Generate mock order details
      const orderRef = document.getElementById('success-order-ref');
      const deliveryDate = document.getElementById('success-delivery-date');
      
      if (orderRef) {
        orderRef.textContent = `LT-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      
      if (deliveryDate) {
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + 5); // 5 days from now
        deliveryDate.textContent = estDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      showStep(3);

      // Clear the shopping cart
      clearCart();
    });
  }

  // Success Shop CTA
  if (successShopBtn) {
    successShopBtn.addEventListener('click', () => {
      closeCheckout();
      
      // Direct user to Shop view
      const shopNavLink = document.querySelector('.nav-link[data-view="shop"]');
      if (shopNavLink) shopNavLink.click();
    });
  }
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
