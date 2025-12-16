// Product Page JavaScript - CLEAN VERSION
// This version has NO flying animation and prevents double adds

(function() {
    'use strict';
    
    // State variables
    let isAdding = false;
    let buttonClickCount = 0;
    
    // --- 1. Initialize on page load ---
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Product page loaded - clean version');
        
        // Set default mask option
        setDefaultMaskOption();
        
        // Set up event listeners
        setupEventListeners();
    });
    
    // --- 2. Set default mask option ---
    function setDefaultMaskOption() {
        const defaultOption = document.getElementById('singleMaskOption');
        if (defaultOption) {
            selectMaskOption(defaultOption, 1);
        }
    }
    
    // --- 3. Setup all event listeners ---
    function setupEventListeners() {
        // Add to Cart button
        const addToCartBtn = document.getElementById('addToCartButton');
        if (addToCartBtn) {
            // Remove any existing listeners first
            const newBtn = addToCartBtn.cloneNode(true);
            addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
            
            // Add fresh listener
            document.getElementById('addToCartButton').addEventListener('click', handleAddToCart);
        }
        
        // Mask options
        document.querySelectorAll('.mask-option').forEach(option => {
            option.addEventListener('click', function() {
                const quantity = this.getAttribute('data-quantity');
                selectMaskOption(this, parseInt(quantity));
            });
        });
    }
    
    // --- 4. Package Selection Logic ---
    function selectMaskOption(element, quantity) {
        // Remove active class from all options
        document.querySelectorAll('.mask-option').forEach(opt => {
            opt.classList.remove('border-[#FA8072]', 'bg-rose-50');
            opt.classList.add('border-gray-200');
            const indicator = opt.querySelector('.selection-indicator');
            if (indicator) indicator.classList.add('hidden');
        });
        
        // Add active class to selected option
        element.classList.add('border-[#FA8072]', 'bg-rose-50');
        element.classList.remove('border-gray-200');
        const indicator = element.querySelector('.selection-indicator');
        if (indicator) indicator.classList.remove('hidden');
        
        // Update button
        updateAddToCartButton(quantity, element.getAttribute('data-package-name'));
    }
    
    // --- 5. Update Add to Cart Button ---
    function updateAddToCartButton(quantity, packageName) {
        const addToCartBtn = document.getElementById('addToCartButton');
        if (!addToCartBtn) return;
        
        addToCartBtn.setAttribute('data-quantity', quantity);
        addToCartBtn.setAttribute('data-package-name', packageName || 'Single Mask');
        
        const quantityText = addToCartBtn.querySelector('.quantity-text');
        if (quantityText) {
            quantityText.textContent = quantity + ' ' + (quantity > 1 ? 'Masks' : 'Mask');
        }
        
        // Reset button to normal state
        resetButtonToNormal();
    }
    
    // --- 6. Reset Button to Normal State ---
    function resetButtonToNormal() {
        const addToCartBtn = document.getElementById('addToCartButton');
        if (!addToCartBtn) return;
        
        const quantity = addToCartBtn.getAttribute('data-quantity') || '1';
        
        // Reset styles
        addToCartBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        addToCartBtn.classList.add('bg-[#FA8072]', 'hover:bg-[#E57365]');
        addToCartBtn.disabled = false;
        
        // Reset text
        const buttonContent = addToCartBtn.querySelector('.button-content');
        if (buttonContent) {
            buttonContent.innerHTML = `Add to Cart - <span class="quantity-text">${quantity} ${quantity > 1 ? 'Masks' : 'Mask'}</span>`;
        }
        
        isAdding = false;
    }
    
    // --- 7. Show Success State ---
    function showSuccessState() {
        const addToCartBtn = document.getElementById('addToCartButton');
        if (!addToCartBtn) return;
        
        // Change to green
        addToCartBtn.classList.remove('bg-[#FA8072]', 'hover:bg-[#E57365]');
        addToCartBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        addToCartBtn.disabled = true;
        
        // Show checkmark and "Added to Cart"
        const buttonContent = addToCartBtn.querySelector('.button-content');
        if (buttonContent) {
            buttonContent.innerHTML = `
                <span class="flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    Added to Cart
                </span>
            `;
        }
        
        // Reset after 3 seconds
        setTimeout(() => {
            resetButtonToNormal();
        }, 3000);
    }
    
    // --- 8. Bounce Cart Icon ---
    function bounceCartIcon() {
        // Try multiple selectors to find cart icon
        const selectors = [
            'a[href*="/cart"]',
            '.cart-icon-btn',
            '[aria-label*="cart"]',
            '[aria-label*="Cart"]'
        ];
        
        for (const selector of selectors) {
            const cartIcon = document.querySelector(selector);
            if (cartIcon) {
                cartIcon.classList.add('cart-bounce');
                setTimeout(() => {
                    cartIcon.classList.remove('cart-bounce');
                }, 600);
                break;
            }
        }
    }
    
    // --- 9. Update Cart Count ---
    async function updateCartCount() {
        try {
            const response = await fetch('/cart.js');
            const cart = await response.json();
            
            // Update cart count badge
            let cartCount = document.getElementById('CartCount');
            const cartCountWrapper = document.getElementById('CartCountWrapper');
            
            if (cart.item_count > 0) {
                if (cartCount) {
                    cartCount.textContent = cart.item_count;
                } else if (cartCountWrapper) {
                    // Create badge if it doesn't exist
                    cartCountWrapper.innerHTML = `
                        <span id="CartCount" class="cart-count text-xs font-bold text-white bg-red-600 rounded-full w-5 h-5 flex items-center justify-center absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                            ${cart.item_count}
                        </span>
                    `;
                }
            } else if (cartCount) {
                cartCount.remove();
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }
    
    // --- 10. MAIN Add to Cart Handler ---
    async function handleAddToCart(event) {
        event.preventDefault();
        event.stopPropagation();
        
        buttonClickCount++;
        console.log('Button clicked, count:', buttonClickCount, 'Is already adding?', isAdding);
        
        // Prevent double clicks
        if (isAdding) {
            console.log('Already adding to cart, skipping');
            return;
        }
        
        isAdding = true;
        
        const button = event.currentTarget;
        const variantId = button.getAttribute('data-variant-id');
        const quantity = parseInt(button.getAttribute('data-quantity'), 10) || 1;
        const packageName = button.getAttribute('data-package-name');
        
        if (!variantId) {
            alert('Error: Product variant not found');
            isAdding = false;
            return;
        }
        
        // Show loading state
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = 'Adding...';
        
        // Prepare cart data
        const cartData = {
            items: [{
                id: variantId,
                quantity: quantity,
                properties: {
                    'Package': packageName || 'Single Mask'
                }
            }]
        };
        
        try {
            console.log('Sending cart request for quantity:', quantity);
            
            // Add to cart
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(cartData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('Cart add successful:', result);
                
                // Show success
                showSuccessState();
                
                // Bounce cart icon
                bounceCartIcon();
                
                // Update cart count
                await updateCartCount();
                
            } else {
                console.error('Cart add failed:', result);
                alert(`Error: ${result.message || 'Failed to add to cart'}`);
                
                // Reset button on error
                button.disabled = false;
                button.innerHTML = originalContent;
                isAdding = false;
            }
            
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. Please check your connection and try again.');
            
            // Reset button on error
            button.disabled = false;
            button.innerHTML = originalContent;
            isAdding = false;
        }
    }
    
    // --- 11. Thumbnail Swap (if needed) ---
    window.swapMedia = function(thumbnail, fullUrl) {
        document.querySelectorAll('.media-thumbnail').forEach(t => {
            t.classList.remove('border-blue-600', 'border-2', 'ring-2', 'ring-blue-600/50', 'shadow-md');
            t.classList.add('border-gray-300', 'border', 'opacity-75');
        });
        
        thumbnail.classList.add('border-blue-600', 'border-2', 'ring-2', 'ring-blue-600/50', 'shadow-md');
        thumbnail.classList.remove('border-gray-300', 'border', 'opacity-75');
        
        const mediaDisplay = document.getElementById('media-display');
        if (mediaDisplay) {
            mediaDisplay.style.opacity = '0.5';
            setTimeout(() => {
                mediaDisplay.src = fullUrl;
                mediaDisplay.style.opacity = '1';
            }, 200);
        }
    };
    
    // Make selectMaskOption available globally for inline onclick
    window.selectMaskOption = function(element, quantity) {
        selectMaskOption(element, quantity);
    };
    
})();