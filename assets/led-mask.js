// Main JavaScript functionality for LED Mask sections

// Enhanced Fly-to-Cart Animation - Flies to cart icon in header
function flyPackageToCart() {
    const selectedPackageElement = document.querySelector('.mask-option.border-\\[\\#FA8072\\]');
    
    if (!selectedPackageElement) {
        console.log('No package selected for animation');
        return;
    }
    
    const packageImage = selectedPackageElement.querySelector('.package-image');
    
    if (!packageImage) {
        console.error('Animation failed: Missing package image element.');
        return;
    }

    // 1. Try to find your specific cart button with class .cart-icon-btn
    let cart = document.querySelector('.cart-icon-btn');
    
    // 2. If not found, try Alpine.js cart buttons
    if (!cart) {
        cart = document.querySelector('[x-ref="CartDrawer"] button, [@click*="open"], button[onclick*="cart"]');
    }
    
    // 3. If still not found, try common cart selectors
    if (!cart) {
        const selectors = [
            'a[href="/cart"]',
            'a[href*="cart"]',
            '.cart-icon',
            '.header-cart',
            '.site-header__cart',
            '.cart-link',
            '[data-cart-icon]',
            '[data-cart-drawer-toggle]'
        ];
        
        for (const selector of selectors) {
            cart = document.querySelector(selector);
            if (cart) break;
        }
    }
    
    // 4. If cart is still not found, create a virtual target at top-right corner
    if (!cart) {
        console.log('Cart icon not found by selectors. Using top right corner of viewport.');
        
        // Try to find header for better positioning
        const header = document.querySelector('header, .site-header, .header');
        if (header) {
            const headerRect = header.getBoundingClientRect();
            cart = {
                getBoundingClientRect: () => ({
                    left: headerRect.right - 60,
                    top: headerRect.top + 30,
                    width: 40,
                    height: 40
                })
            };
        } else {
            // Fallback to viewport top-right corner
            cart = { 
                getBoundingClientRect: () => ({ 
                    left: window.innerWidth - 80, 
                    top: 70, 
                    width: 40, 
                    height: 40 
                }) 
            };
        }
    } else {
        console.log('Cart icon found:', cart);
    }

    // Get positions
    const startRect = packageImage.getBoundingClientRect();
    const endRect = cart.getBoundingClientRect();
    
    // Add scroll position to coordinates
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Create flying element
    const flyingElement = packageImage.cloneNode(true);
    
    // Make sure the flying element is visible
    flyingElement.style.position = 'fixed';
    flyingElement.style.width = startRect.width + 'px';
    flyingElement.style.height = startRect.height + 'px';
    flyingElement.style.left = (startRect.left + scrollX) + 'px';
    flyingElement.style.top = (startRect.top + scrollY) + 'px';
    flyingElement.style.zIndex = '99999';
    flyingElement.style.pointerEvents = 'none';
    flyingElement.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    flyingElement.style.borderRadius = '8px';
    flyingElement.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    flyingElement.style.backgroundColor = '#FA8072';
    flyingElement.style.border = '2px solid white';
    flyingElement.style.overflow = 'hidden';
    
    // Ensure content is visible
    const textElement = flyingElement.querySelector('.text-lg');
    if (textElement) {
        textElement.style.color = 'white';
        textElement.style.fontWeight = 'bold';
    }
    
    document.body.appendChild(flyingElement);
    
    // Force reflow
    flyingElement.offsetHeight;
    
    const finalSize = 35;

    // Animate to cart icon
    setTimeout(() => {
        // Calculate end position to center on cart icon
        const endX = endRect.left + (endRect.width / 2) - (finalSize / 2) + scrollX;
        const endY = endRect.top + (endRect.height / 2) - (finalSize / 2) + scrollY;
        
        console.log('Animating to:', endX, endY);
        
        flyingElement.style.left = endX + 'px';
        flyingElement.style.top = endY + 'px';
        flyingElement.style.width = finalSize + 'px';
        flyingElement.style.height = finalSize + 'px';
        flyingElement.style.opacity = '0.9';
        flyingElement.style.transform = 'rotate(360deg) scale(0.9)';
        flyingElement.style.boxShadow = '0 5px 15px rgba(250, 128, 114, 0.7)';
    }, 50);

    // Add bounce effect to cart icon if it's a real DOM element
    if (cart.classList && typeof cart.classList.add === 'function') {
        cart.classList.add('cart-bounce');
        setTimeout(() => {
            if (cart.classList && typeof cart.classList.remove === 'function') {
                cart.classList.remove('cart-bounce');
            }
        }, 1000);
    }

    // Clean up
    setTimeout(() => {
        if (flyingElement.parentNode) {
            flyingElement.parentNode.removeChild(flyingElement);
        }
        console.log('Animation completed');
    }, 1200);
}

// Add to Cart with Shopify Integration and Animation
function setupAddToCart() {
    const addToCartButton = document.getElementById('addToCartButton');
    
    if (!addToCartButton) return;
    
    addToCartButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const button = this;
        const variantId = button.getAttribute('data-variant-id');
        const originalText = button.innerHTML;
        
        if (!variantId || variantId === '') {
            console.error('No variant ID found on button');
            alert('Please select a product option first');
            return;
        }
        
        // Get selected quantity
        const selectedOption = document.querySelector('.mask-option.border-\\[\\#FA8072\\]');
        const quantity = selectedOption ? parseInt(selectedOption.getAttribute('data-quantity')) : 1;
        
        // Show loading state
        button.innerHTML = 'Adding to Cart...';
        button.disabled = true;
        
        // Trigger fly-to-cart animation
        flyPackageToCart();
        
        // Prepare cart data
        const cartData = {
            items: [{
                id: parseInt(variantId),
                quantity: quantity
            }]
        };
        
        // Add to cart via Shopify AJAX API
        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartData)
        })
        .then(response => response.json())
        .then(data => {
            // Success
            console.log('Product added to cart:', data);
            
            // Update cart count
            updateCartCount(data.item_count || (parseInt(document.querySelector('.cart-count')?.textContent || 0) + quantity));
            
            // Trigger cart drawer to open
            openCartDrawer();
            
            // Show success message on button
            setTimeout(() => {
                button.innerHTML = '✓ Added to Cart!';
                button.style.backgroundColor = '#10B981';
            }, 800);
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 2800);
            
        })
        .catch(error => {
            // Error handling
            console.error('Error adding to cart:', error);
            button.innerHTML = 'Error - Try Again';
            button.style.backgroundColor = '#EF4444';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 2000);
        });
    });
}

// Open Cart Drawer
function openCartDrawer() {
    console.log('Opening cart drawer...');
    
    // Try to call the global function from cart-drawer.liquid
    if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer();
        return;
    }
    
    // Fallback: try to find and click cart button
    const cartButton = document.querySelector('.cart-icon-btn, [onclick*="cart"], button');
    if (cartButton) {
        cartButton.click();
    } else {
        console.error('Could not open cart drawer - no function or button found');
    }
}

// Update cart count in header
function updateCartCount(count) {
    // Try multiple selectors for cart count
    const cartCountSelectors = [
        '.cart-count',
        '.cart-bubble',
        '.cart-item-count',
        '[data-cart-count]',
        '.js-cart-count',
        '.header-cart-count',
        '.site-header__cart-count'
    ];
    
    cartCountSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.textContent = count;
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup add to cart button
    setupAddToCart();
    
    // Listen for cart drawer open events
    document.addEventListener('open-cart-drawer', function() {
        console.log('Received open-cart-drawer event');
        openCartDrawer();
    });
});

// Add scrollbar hiding styles and animations
function addGlobalStyles() {
    if (!document.getElementById('led-mask-styles')) {
        const style = document.createElement('style');
        style.id = 'led-mask-styles';
        style.innerHTML = `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            
            /* Cart bounce animation */
            .cart-bounce {
                animation: cartBounce 0.6s ease-in-out;
            }
            
            @keyframes cartBounce {
                0%, 20%, 60%, 100% { transform: scale(1); }
                40% { transform: scale(1.3); }
                80% { transform: scale(1.1); }
            }
            
            /* Animation for the flying element */
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(250, 128, 114, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(250, 128, 114, 0); }
                100% { box-shadow: 0 0 0 0 rgba(250, 128, 114, 0); }
            }
            
            .flying-element {
                animation: pulse 2s infinite;
            }
            
            /* Smooth transitions */
            .media-thumbnail {
                transition: all 0.3s ease;
            }
            
            .mask-option {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
addGlobalStyles();