// Product Page JavaScript - product-page.js

// Set up global elements
let addToCartButton, mediaDisplay, cartIconElement;
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

    if (addToCartButton) {
        addToCartButton.setAttribute('data-quantity', quantity);
        addToCartButton.setAttribute('data-package-name', packageName);
        const quantityText = addToCartButton.querySelector('.quantity-text');
        if (quantityText) {
            quantityText.textContent = quantity + ' ' + (quantity > 1 ? 'Masks' : 'Mask');
        }
        
        // Reset button state when changing quantity
        resetAddToCartButton();
    }

    // Update price displays if they exist
    const priceDisplay = document.getElementById('price-display');
    const comparePriceDisplay = document.getElementById('compare-price-display');
    if (priceDisplay) priceDisplay.textContent = discountedPrice;
    if (comparePriceDisplay) comparePriceDisplay.textContent = originalPrice;
}

// --- 2. Reset Add to Cart Button to Original State ---
function resetAddToCartButton() {
    if (!addToCartButton) return;
    
    const quantity = addToCartButton.getAttribute('data-quantity');
    addToCartButton.classList.remove('bg-green-500', 'bg-green-600');
    addToCartButton.classList.add('bg-[#FA8072]', 'hover:bg-[#E57365]');
    addToCartButton.disabled = false;
    
    const buttonText = document.getElementById('buttonText');
    const successIcon = document.getElementById('successIcon');
    
    if (buttonText) {
        buttonText.innerHTML = 'Add to Cart - <span class="quantity-text">' + quantity + ' ' + (quantity > 1 ? 'Masks' : 'Mask') + '</span>';
    }
    
    if (successIcon) {
        successIcon.classList.add('hidden');
    }
}

// --- 3. Show Success State on Button ---
function showAddToCartSuccess() {
    if (!addToCartButton) return;
    
    // Change button to success state
    addToCartButton.classList.remove('bg-[#FA8072]', 'hover:bg-[#E57365]');
    addToCartButton.classList.add('bg-green-500', 'hover:bg-green-600');
    addToCartButton.disabled = true;
    
    // Update button text and show checkmark
    const buttonText = document.getElementById('buttonText');
    const successIcon = document.getElementById('successIcon');
    
    if (buttonText) {
        buttonText.textContent = 'Added to Cart';
    }
    
    if (successIcon) {
        successIcon.classList.remove('hidden');
    }
    
    // Reset button after 3 seconds
    setTimeout(() => {
        resetAddToCartButton();
    }, 3000);
}

// --- 4. Trigger Cart Icon Bounce ---
function triggerCartBounce() {
    if (cartIconElement) {
        cartIconElement.classList.add('cart-bounce');
        setTimeout(() => {
            cartIconElement.classList.remove('cart-bounce');
        }, 600);
    }
}

// --- 5. AJAX Add to Cart Handler ---
async function handleAddToCart(event) {
    event.preventDefault();
    
    // Prevent double clicks
    if (isAddingToCart) return;
    isAddingToCart = true;
    
    const button = event.currentTarget;
    const variantId = button.getAttribute('data-variant-id');
    const quantity = parseInt(button.getAttribute('data-quantity'), 10);
    const packageName = button.getAttribute('data-package-name');

    if (!variantId || isNaN(quantity) || quantity <= 0) {
        console.error('Missing Variant ID or invalid quantity.');
        isAddingToCart = false;
        return;
    }

    // Show loading state
    button.disabled = true;
    const originalHTML = button.innerHTML;
    button.innerHTML = 'Adding...';

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
            // Show success state on button
            showAddToCartSuccess();
            
            // Trigger cart icon bounce
            triggerCartBounce();
            
            // Update cart count
            await updateCartCount();
            
            console.log('Product added successfully.');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message} - ${errorData.description}`);
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An unexpected error occurred. Please try again.');
        button.disabled = false;
        button.innerHTML = originalHTML;
    } finally {
        isAddingToCart = false;
    }
}

// --- 6. Update Cart Count ---
async function updateCartCount() {
    try {
        const cartResponse = await fetch('/cart.js');
        if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            
            // Dispatch event for any components listening to cart updates
            document.dispatchEvent(new CustomEvent('cart:updated', {
                detail: { item_count: cartData.item_count }
            }));
            
            // If you have a cart count element in your header
            const cartCountElements = document.querySelectorAll('.cart-count, .cart-item-count, [data-cart-count]');
            cartCountElements.forEach(element => {
                element.textContent = cartData.item_count;
                element.classList.remove('hidden');
            });
        }
    } catch (error) {
        console.error('Error fetching cart data:', error);
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
    // Initialize global elements
    addToCartButton = document.getElementById('addToCartButton');
    mediaDisplay = document.getElementById('media-display');
    cartIconElement = document.querySelector('.cart-icon-btn');
    
    // Set default option
    const defaultOption = document.getElementById('singleMaskOption');
    if (defaultOption) {
        selectMaskOption(defaultOption, 1);
    }
    
    // Attach event listeners
    if (addToCartButton) {
        // Remove any existing event listeners first
        addToCartButton.replaceWith(addToCartButton.cloneNode(true));
        addToCartButton = document.getElementById('addToCartButton');
        
        // Attach fresh event listener
        addToCartButton.addEventListener('click', handleAddToCart);
        
        // Also reset button if user clicks elsewhere on the page
        document.addEventListener('click', function(event) {
            if (!addToCartButton.contains(event.target) && 
                !event.target.closest('.mask-option')) {
                // Reset button if clicked outside of button or mask options
                resetAddToCartButton();
            }
        });
    }
    
    // Make functions available globally (for inline onclick handlers)
    window.selectMaskOption = selectMaskOption;
    window.swapMedia = swapMedia;
});