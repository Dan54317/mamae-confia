        // Cart functionality
        let cart = [];
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');
        const overlay = document.getElementById('overlay');
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const checkOutModal = document.getElementById('checkoutModal');
        const closeCheckout = document.getElementById('closeCheckout');
        const backToCart = document.getElementById('backToCart');
        const confirmPayment = document.getElementById('confirmPayment');
        const loading = document.getElementById('loading');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
        // Payment methods
        const paymentMethodCards = document.querySelectorAll('.payment-method-card');
        const paymentForms = {
            pix: document.getElementById('pixForm'),
            credit: document.getElementById('creditForm'),
            boleto: document.getElementById('boletoForm')
        };
        
        // Open cart modal
        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('active');
            overlay.classList.add('active');
        });
        
        // Close cart modal
        closeCart.addEventListener('click', () => {
            cartModal.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Close checkout modal
        closeCheckout.addEventListener('click', () => {
            checkOutModal.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Back to cart from checkout
        backToCart.addEventListener('click', () => {
            checkOutModal.classList.remove('active');
            cartModal.classList.add('active');
        });
        
        // Overlay click
        overlay.addEventListener('click', () => {
            cartModal.classList.remove('active');
            checkOutModal.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Add to cart functionality
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const price = parseFloat(button.getAttribute('data-price'));
                const image = button.getAttribute('data-image');
                
                addToCart(id, name, price, image);
                showNotification(`${name} foi adicionado ao carrinho!`);
            });
        });
        
        // Add item to cart
        function addToCart(id, name, price, image) {
            // Check if item already in cart
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id,
                    name,
                    price,
                    image,
                    quantity: 1
                });
            }
            
            updateCart();
        }
        
        // Update cart UI
        function updateCart() {
            // Update cart count
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelector('.cart-count').textContent = totalItems;
            
            // Update cart items
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart-message">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Seu carrinho está vazio</p>
                        <a href="#products" class="btn">Continuar Comprando</a>
                    </div>
                `;
                cartFooter.style.display = 'none';
            } else {
                cartItems.innerHTML = '';
                cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';
                    itemElement.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                                <button class="remove-item" data-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    cartItems.appendChild(itemElement);
                });
                
                cartFooter.style.display = 'block';
                
                // Calculate totals
                const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                const total = subtotal; // Could add shipping here
                
                cartSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
                cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
                
                // Add event listeners to quantity buttons
                document.querySelectorAll('.quantity-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = button.getAttribute('data-id');
                        const isIncrease = button.classList.contains('increase');
                        const isDecrease = button.classList.contains('decrease');
                        
                        const item = cart.find(item => item.id === id);
                        
                        if (isIncrease) {
                            item.quantity += 1;
                        } else if (isDecrease && item.quantity > 1) {
                            item.quantity -= 1;
                        }
                        
                        updateCart();
                    });
                });
                
                // Add event listeners to quantity inputs
                document.querySelectorAll('.quantity-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const id = input.getAttribute('data-id');
                        const quantity = parseInt(input.value) || 1;
                        
                        const item = cart.find(item => item.id === id);
                        item.quantity = quantity;
                        
                        updateCart();
                    });
                });
                
                // Add event listeners to remove buttons
                document.querySelectorAll('.remove-item').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = button.getAttribute('data-id');
                        cart = cart.filter(item => item.id !== id);
                        
                        updateCart();
                        showNotification('Item removido do carrinho', 'error');
                    });
                });
            }
        }
        
        // Checkout button
        checkoutBtn.addEventListener('click', () => {
            cartModal.classList.remove('active');
            checkOutModal.classList.add('active');
            
            // Reset payment forms
            Object.values(paymentForms).forEach(form => form.style.display = 'none');
            document.querySelectorAll('.payment-method-card').forEach(card => {
                card.classList.remove('selected');
            });
        });
        
        // Payment method selection
        paymentMethodCards.forEach(card => {
            card.addEventListener('click', () => {
                const method = card.getAttribute('data-method');
                
                // Reset all
                paymentMethodCards.forEach(c => c.classList.remove('selected'));
                Object.values(paymentForms).forEach(form => form.style.display = 'none');
                
                // Select current
                card.classList.add('selected');
                paymentForms[method].style.display = 'block';
            });
        });
        
        // Confirm payment
        confirmPayment.addEventListener('click', () => {
            loading.classList.add('active');
            
            // Simulate payment processing
            setTimeout(() => {
                loading.classList.remove('active');
                cart = [];
                updateCart();
                checkOutModal.classList.remove('active');
                overlay.classList.remove('active');
                showNotification('Compra realizada com sucesso! Obrigado.', 'success');
            }, 2000);
        });
        
        // Show notification
        function showNotification(message, type = 'success') {
            notificationText.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type, 'active');
            
            setTimeout(() => {
                notification.classList.remove('active');
            }, 3000);
        }
        
        // Initialize
        updateCart();
        