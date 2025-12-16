// Product Page JavaScript - product-page.js

// Set up global elements
let addToCartButton, mediaDisplay, cartIconElement;

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
        addToCartButton.textContent = 'Add to Cart - ' + quantity + ' ' + (quantity > 1 ? 'Masks' : 'Mask');
    }

    // Update price displays if they exist
    const priceDisplay = document.getElementById('price-display');
    const comparePriceDisplay = document.getElementById('compare-price-display');
    if (priceDisplay) priceDisplay.textContent = discountedPrice;
    if (comparePriceDisplay) comparePriceDisplay.textContent = originalPrice;
}

// --- 2. Fly to Cart Animation Logic ---
function flyToCartAnimation(imageElement, cartElement) {
    if (!imageElement || !cartElement) {
        console.warn('Animation elements missing.');
        return;
    }
    
    const startRect = imageElement.getBoundingClientRect();
    const endRect = cartElement.getBoundingClientRect();
    
    const flyingItem = document.createElement('img');
    flyingItem.src = imageElement.src;
    flyingItem.classList.add('flying-item');
    flyingItem.style.width = startRect.width + 'px';
    flyingItem.style.height = startRect.height + 'px';
    flyingItem.style.left = startRect.left + 'px';
    flyingItem.style.top = startRect.top + 'px';

    document.body.appendChild(flyingItem);
    void flyingItem.offsetWidth;

    flyingItem.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    flyingItem.style.left = (endRect.left + endRect.width / 2 - 20) + 'px';
    flyingItem.style.top = (endRect.top + endRect.height / 2 - 20) + 'px';
    flyingItem.style.width = '40px';
    flyingItem.style.height = '40px';
    flyingItem.style.opacity = '0';
    
    setTimeout(() => {
        flyingItem.remove();
        
        if (cartIconElement) {
            cartIconElement.classList.add('cart-bounce');
            setTimeout(() => {
                cartIconElement.classList.remove('cart-bounce');
            }, 600);
        }

        document.dispatchEvent(new CustomEvent('cart:add-success', {
            detail: { item_count: 'Updating...' }
        }));
    }, 800);
}

// --- 3. AJAX Add to Cart Handler ---
async function handleAddToCart(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const variantId = button.getAttribute('data-variant-id');
    const quantity = parseInt(button.getAttribute('data-quantity'), 10);
    const packageName = button.getAttribute('data-package-name');

    if (!variantId || isNaN(quantity) || quantity <= 0) {
        console.error('Missing Variant ID or invalid quantity.');
        return;
    }

    const originalButtonText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';

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
            flyToCartAnimation(mediaDisplay, cartIconElement);
            console.log('Product added successfully.');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message} - ${errorData.description}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An unexpected error occurred. Please try again.');
    } finally {
        button.disabled = false;
        button.textContent = originalButtonText;
    }
}

// --- 4. Thumbnail swap logic ---
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
        addToCartButton.addEventListener('click', handleAddToCart);
    }
    
    // Make functions available globally (for inline onclick handlers)
    window.selectMaskOption = selectMaskOption;
    window.flyToCartAnimation = flyToCartAnimation;
    window.swapMedia = swapMedia;
});