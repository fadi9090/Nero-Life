// floating-buttons.js
class FloatingButtons {
  constructor(container) {
    this.container = container;
    this.backToTopBtn = container.querySelector('[id^="backToTop-"]');
    this.floatingCartBtn = container.querySelector('[id^="floatingAddToCart-"]');
    this.addToCartBtn = this.floatingCartBtn?.querySelector('.floating-add-to-cart-btn');
    this.scrollThreshold = parseInt(container.dataset.scrollThreshold) || 300;
    this.isVisible = false;
    
    this.init();
  }
  
  init() {
    if (!this.backToTopBtn || !this.floatingCartBtn) return;
    
    // Event listeners
    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.backToTopBtn.addEventListener('click', this.scrollToTop.bind(this));
    
    if (this.addToCartBtn) {
      this.addToCartBtn.addEventListener('click', this.handleAddToCart.bind(this));
    }
    
    // Initial check
    this.handleScroll();
  }
  
  handleScroll() {
    const scrollY = window.scrollY;
    const shouldShow = scrollY > this.scrollThreshold;
    
    if (shouldShow && !this.isVisible) {
      this.showButtons();
    } else if (!shouldShow && this.isVisible) {
      this.hideButtons();
    }
  }
  
  showButtons() {
    this.isVisible = true;
    
    // Back to top button
    this.backToTopBtn.classList.remove('opacity-0', 'invisible', 'scale-95');
    this.backToTopBtn.classList.add('opacity-100', 'visible', 'scale-100');
    
    // Floating cart button
    this.floatingCartBtn.classList.remove('opacity-0', 'invisible', 'translate-y-4');
    this.floatingCartBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
  }
  
  hideButtons() {
    this.isVisible = false;
    
    // Back to top button
    this.backToTopBtn.classList.remove('opacity-100', 'visible', 'scale-100');
    this.backToTopBtn.classList.add('opacity-0', 'invisible', 'scale-95');
    
    // Floating cart button
    this.floatingCartBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
    this.floatingCartBtn.classList.add('opacity-0', 'invisible', 'translate-y-4');
  }
  
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  handleAddToCart(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const productId = btn.dataset.productId;
    
    if (!productId) {
      // Redirect to product page if no product ID
      window.location.href = '/products/led-skin-therapy-mask'; // Update with your product handle
      return;
    }
    
    // Shopify AJAX Cart API
    const formData = {
      items: [{
        id: productId,
        quantity: 1
      }]
    };
    
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Adding...
    `;
    
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      // Success
      btn.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Added!
      `;
      btn.classList.add('bg-green-600', 'hover:bg-green-700');
      btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      
      // Update cart count
      this.updateCartCount();
      
      // Show success message
      this.showToast('Item added to cart!', 'success');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          ${btn.dataset.originalText || 'Add to Cart'}
        `;
        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      }, 2000);
    })
    .catch(error => {
      console.error('Error:', error);
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || 'Add to Cart';
      this.showToast('Failed to add item. Please try again.', 'error');
    });
  }
  
  updateCartCount() {
    // Update any cart count elements
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      const current = parseInt(el.textContent) || 0;
      el.textContent = current + 1;
    });
    
    // Trigger cart update event
    document.dispatchEvent(new CustomEvent('cart:updated'));
  }
  
  showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.floating-toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `floating-toast fixed top-4 right-4 z-[10000] px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize all floating buttons on page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.floating-buttons-container').forEach(container => {
    if (container.querySelector('[id^="backToTop-"]')) {
      new FloatingButtons(container);
    }
  });
});

// Reinitialize when Shopify sections reload
if (typeof Shopify !== 'undefined') {
  document.addEventListener('shopify:section:load', (e) => {
    const container = e.target.querySelector('.floating-buttons-container');
    if (container) {
      new FloatingButtons(container);
    }
  });
}