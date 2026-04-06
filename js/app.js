// Estado da aplicação
let products = [];
let cart = [];
const API_URL = '/api';

// Elementos do DOM
const productsGrid = document.getElementById('products-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const successModal = document.getElementById('success-modal');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
});

// Carregar produtos da API
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        products = data.products;
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productsGrid.innerHTML = '<p class="error">Erro ao carregar produtos. Tente novamente.</p>';
    }
}

// Renderizar produtos
function renderProducts() {
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="empty">Nenhum produto disponível.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">📦</div>
            <div class="product-info">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.description || 'Sem descrição')}</p>
                <div class="product-price">R$ ${formatPrice(product.price)}</div>
                <p class="product-stock">${product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}</p>
                <button 
                    onclick="addToCart(${product.id})" 
                    class="btn btn-primary btn-full"
                    ${product.stock === 0 ? 'disabled' : ''}
                >
                    ${product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
                </button>
            </div>
        </div>
    `).join('');
}

// Carrinho - LocalStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Adicionar ao carrinho
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Quantidade máxima em estoque atingida!');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.name} adicionado ao carrinho!`);
}

// Remover do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Alterar quantidade
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;

    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > product.stock) {
        alert('Quantidade máxima em estoque atingida!');
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    updateCartUI();
}

// Atualizar UI do carrinho
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Seu carrinho está vazio</p></div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">📦</div>
                <div class="cart-item-info">
                    <h4>${escapeHtml(item.name)}</h4>
                    <div class="cart-item-price">R$ ${formatPrice(item.price)}</div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <span class="remove-btn" onclick="removeFromCart(${item.id})">Remover</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Toggle carrinho
function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

// Abrir checkout
function openCheckout() {
    if (cart.length === 0) {
        alert('Adicione itens ao carrinho primeiro!');
        return;
    }

    toggleCart();
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${escapeHtml(item.name)} x ${item.quantity}</span>
            <span>R$ ${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    checkoutTotal.textContent = formatPrice(totalPrice);
    
    checkoutModal.classList.add('show');
}

// Fechar checkout
function closeCheckout() {
    checkoutModal.classList.remove('show');
}

// Fechar modal de sucesso
function closeSuccessModal() {
    successModal.classList.remove('show');
}

// Submeter pedido
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;

    const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            // Limpar carrinho
            cart = [];
            saveCart();
            updateCartUI();

            // Mostrar sucesso
            closeCheckout();
            document.getElementById('order-number').textContent = result.orderId;
            successModal.classList.add('show');

            // Recarregar produtos (estoque atualizado)
            loadProducts();
        } else {
            alert(result.error || 'Erro ao criar pedido');
        }
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao processar pedido. Tente novamente.');
    }
});

// Notificação
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 400;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Utilitários
function formatPrice(price) {
    return Number(price).toFixed(2).replace('.', ',');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fechar modais com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCheckout();
        closeSuccessModal();
        if (cartSidebar.classList.contains('open')) {
            toggleCart();
        }
    }
});
