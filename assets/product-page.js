// Product Page JavaScript - product-page.js

let isAddingToCart = false; // Prevent double clicks

// --- 1. Package Selection Logic ---
function selectMaskOption(element, quantity) {
    document.querySelectorAll('.mask-option').forEach(opt => {
        opt.classList.remove('border-[#FA8072]', 'bg-rose-50');
        opt.classList.add('border-gray-200');
        const indicator = opt.querySelector('.selection-indicator');
        if (indicator) indicator.classList.add('hidden');
    });

    element.classList.add('border-[#FA8072]', 'bg-rose-50');
    element.classList.remove('border-gray-200');
    const indicator = element.querySelector('.selection-indicator');
    if (indicator) indicator.classList.remove('hidden');

    const packageName = element.getAttribute('data-package-name');
    const discountedPrice = element.getAttribute('data-discounted-price');
    const originalPrice = element.getAttribute('data-original-price');

    const addToCartButton = document.getElementById('addToCartButton');
    if (addToCartButton) {
        addToCartButton.setAttribute('data-quantity', quantity);
        addToCartButton.setAttribute('data-package-name', packageName);
        const quantityText = addToCartButton.querySelector('.quantity-text');
        if (quantityText) {
            quantityText.textContent = quantity + ' ' + (quantity > 1 ? 'Masks' : 'Mask');
        }
        
        // Reset button to normal state when changing option
        resetAddToCartButton();
    }

    // Update price displays if they exist
    const priceDisplay = document.getElementById('price-display');
    const comparePriceDisplay = document.getElementById('compare-price-display');
    if (priceDisplay) priceDisplay.textContent = discountedPrice;
    if (comparePriceDisplay) comparePriceDisplay.textContent = originalPrice;
}

// --- 2. Reset Button to Normal State ---
function resetAddToCartButton() {
    const addToCartButton = document.getElementById('addToCartButton');
    if (!addToCartButton) return;
    
    const quantity = addToCartButton.getAttribute('data-quantity') || '1';
    
    // Reset to original color and text
    addToCartButton.classList.remove('bg-green-500', 'hover:bg-green-600');
    addToCartButton.classList.add('bg-[#FA8072]', 'hover:bg-[#E57365]');
    addToCartButton.disabled = false;
    
    const buttonContent = addToCartButton.querySelector('.button-content');
    if (buttonContent) {
        buttonContent.innerHTML = `Add to Cart - <span class="quantity-text">${quantity} ${quantity > 1 ? 'Masks' : 'Mask'}</span>`;
    }
    
    isAddingToCart = false;
}

// --- 3. Show Success State on Button ---
function showAddToCartSuccess() {
    const addToCartButton = document.getElementById('addToCartButton');
    if (!addToCartButton) return;
    
    // Change button to green success state
    addToCartButton.classList.remove('bg-[#FA8072]', 'hover:bg-[#E57365]');
    addToCartButton.classList.add('bg-green-500', 'hover:bg-green-600');
    addToCartButton.disabled = true;
    
    // Update button text with checkmark
    const buttonContent = addToCartButton.querySelector('.button-content');
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
    
    // Reset button after 3 seconds
    setTimeout(() => {
        resetAddToCartButton();
    }, 3000);
}

// --- 4. Simple Cart Bounce ---
function triggerCartBounce() {
    // Find cart icon by common selectors
    const cartIcon = document.querySelector('a[href*="/cart"], .cart-icon-btn');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('cart-bounce');
        }, 600);
    }
}

// --- 5. Update Cart Count ---
async function updateCartCount() {
    try {
        const cartResponse = await fetch('/cart.js');
        if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            
            // Update cart count badge
            const cartCount = document.getElementById('CartCount');
            const cartCountWrapper = document.getElementById('CartCountWrapper');
            
            if (cartData.item_count > 0) {
                if (cartCount) {
                    cartCount.textContent = cartData.item_count;
                } else if (cartCountWrapper) {
                    // Create count badge if it doesn't exist
                    cartCountWrapper.innerHTML = `
                        <span id="CartCount" class="cart-count text-xs font-bold text-white bg-red-600 rounded-full w-5 h-5 flex items-center justify-center absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                            ${cartData.item_count}
                        </span>
                    `;
                }
            } else {
                // Remove count badge if cart is empty
                if (cartCount) {
                    cartCount.remove();
                }
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// --- 6. Add to Cart Handler ---
async function handleAddToCart(event) {
    event.preventDefault();
    
    // Prevent double clicks
    if (isAddingToCart) return;
    isAddingToCart = true;
    
    const button = event.currentTarget;
    const variantId = button.getAttribute('data-variant-id');
    const quantity = parseInt(button.getAttribute('data-quantity'), 10) || 1;
    const packageName = button.getAttribute('data-package-name');

    if (!variantId) {
        console.error('Missing Variant ID');
        isAddingToCart = false;
        return;
    }

    // Show loading state
    const buttonContent = button.querySelector('.button-content');
    const originalContent = buttonContent ? buttonContent.innerHTML : '';
    
    button.disabled = true;
    if (buttonContent) {
        buttonContent.textContent = 'Adding...';
    }

    const formData = {
        items: [{
            id: variantId,
            quantity: quantity,
            properties: {
                'Package': packageName 
            }
        }]
    };

    try {
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Show success state
            showAddToCartSuccess();
            
            // Bounce cart icon
            triggerCartBounce();
            
            // Update cart count
            await updateCartCount();
            
            console.log('Product added to cart successfully');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
            
            // Reset button on error
            if (buttonContent) {
                buttonContent.innerHTML = originalContent;
            }
            button.disabled = false;
            isAddingToCart = false;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An unexpected error occurred. Please try again.');
        
        // Reset button on error
        if (buttonContent) {
            buttonContent.innerHTML = originalContent;
        }
        button.disabled = false;
        isAddingToCart = false;
    }
}

// --- 7. Thumbnail swap logic ---
function swapMedia(thumbnail, fullUrl) {
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
}

// --- Initialize on DOM Load ---
document.addEventListener('DOMContentLoaded', function() {
    // Set default option
    const defaultOption = document.getElementById('singleMaskOption');
    if (defaultOption) {
        selectMaskOption(defaultOption, 1);
    }
    
    // Attach add to cart event
    const addToCartButton = document.getElementById('addToCartButton');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', handleAddToCart);
    }
    
    // Make functions available globally
    window.selectMaskOption = selectMaskOption;
    window.swapMedia = swapMedia;
});