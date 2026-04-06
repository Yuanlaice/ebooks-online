// Estado
let selectedSize = '40';
let selectedColor = 'azul';
let quantity = 1;
let isFavorited = false;

// Elementos
const mainImage = document.getElementById('main-image');
const thumbnails = document.querySelectorAll('.thumbnail');
const sizeBtns = document.querySelectorAll('.size-btn:not(.disabled)');
const colorBtns = document.querySelectorAll('.color-btn');
const qtyInput = document.getElementById('quantity');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const buyBtn = document.getElementById('buy-now');
const addCartBtn = document.getElementById('add-cart');
const wishlistBtn = document.getElementById('add-wishlist');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Galeria - Troca de imagem
const images = [
    'https://placehold.co/600x600/667eea/ffffff?text=Tênis+Premium',
    'https://placehold.co/600x600/764ba2/ffffff?text=Vista+Lateral',
    'https://placehold.co/600x600/f093fb/ffffff?text=Vista+Traseira',
    'https://placehold.co/600x600/4facfe/ffffff?text=Detalhes'
];

thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
        // Remove classe active de todas
        thumbnails.forEach(t => t.classList.remove('active'));
        // Adiciona ao clicado
        thumb.classList.add('active');
        // Troca imagem principal
        mainImage.src = images[index];
        // Animação suave
        mainImage.style.opacity = '0.5';
        setTimeout(() => {
            mainImage.style.opacity = '1';
        }, 150);
    });
});

// Zoom na imagem
const zoomBtn = document.querySelector('.zoom-btn');
zoomBtn.addEventListener('click', () => {
    // Simula zoom - em produção, abriria lightbox
    mainImage.style.transform = mainImage.style.transform === 'scale(1.5)' 
        ? 'scale(1)' 
        : 'scale(1.5)';
    mainImage.style.transition = 'transform 0.3s';
    mainImage.style.cursor = mainImage.style.transform === 'scale(1.5)' 
        ? 'zoom-out' 
        : 'zoom-in';
});

mainImage.addEventListener('click', () => {
    if (mainImage.style.transform === 'scale(1.5)') {
        mainImage.style.transform = 'scale(1)';
    }
});

// Seleção de tamanho
sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
        console.log('Tamanho selecionado:', selectedSize);
    });
});

// Seleção de cor
const colorImages = {
    'azul': 'https://placehold.co/600x600/667eea/ffffff?text=Tênis+Azul',
    'roxo': 'https://placehold.co/600x600/764ba2/ffffff?text=Tênis+Roxo',
    'rosa': 'https://placehold.co/600x600/f093fb/ffffff?text=Tênis+Rosa',
    'ciano': 'https://placehold.co/600x600/4facfe/ffffff?text=Tênis+Ciano',
    'preto': 'https://placehold.co/600x600/333333/ffffff?text=Tênis+Preto'
};

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedColor = btn.dataset.color;
        
        // Atualiza imagem conforme cor
        mainImage.src = colorImages[selectedColor];
        
        // Atualiza thumbnails
        const color = btn.style.background;
        thumbnails.forEach((thumb, i) => {
            // Simula mudança de cor nas thumbs
            thumb.style.filter = 'none';
        });
    });
});

// Quantidade
qtyMinus.addEventListener('click', () => {
    if (quantity > 1) {
        quantity--;
        qtyInput.value = quantity;
    }
});

qtyPlus.addEventListener('click', () => {
    if (quantity < 10) {
        quantity++;
        qtyInput.value = quantity;
    }
});

// Favoritar
wishlistBtn.addEventListener('click', () => {
    isFavorited = !isFavorited;
    wishlistBtn.classList.toggle('favorited', isFavorited);
    wishlistBtn.textContent = isFavorited ? '♥' : '♡';
    
    // Animação
    wishlistBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        wishlistBtn.style.transform = 'scale(1)';
    }, 200);
});

// Tabs
const tabContents = {
    'description': document.getElementById('description'),
    'specs': document.getElementById('specs'),
    'reviews': document.getElementById('reviews'),
    'shipping': document.getElementById('shipping')
};

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Remove active de todos os botões
        tabBtns.forEach(b => b.classList.remove('active'));
        // Adiciona ao clicado
        btn.classList.add('active');
        
        // Esconde todos os painéis
        Object.values(tabContents).forEach(panel => {
            if (panel) panel.classList.remove('active');
        });
        
        // Mostra o painel selecionado
        if (tabContents[tabName]) {
            tabContents[tabName].classList.add('active');
        }
    });
});

// Comprar Agora
buyBtn.addEventListener('click', () => {
    const productData = {
        id: 1,
        name: 'Tênis Esportivo Premium',
        price: 299.90,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
    };
    
    // Salva no localStorage para checkout
    localStorage.setItem('buyNowProduct', JSON.stringify(productData));
    
    // Redireciona para checkout (poderia ser um modal)
    showNotification('Redirecionando para o checkout...');
    
    // Simula redirecionamento
    setTimeout(() => {
        // window.location.href = '/checkout';
        alert(`Produto: ${productData.name}\nTamanho: ${productData.size}\nCor: ${productData.color}\nQuantidade: ${productData.quantity}\n\nTotal: R$ ${(productData.price * productData.quantity).toFixed(2).replace('.', ',')}`);
    }, 500);
});

// Adicionar ao Carrinho
addCartBtn.addEventListener('click', () => {
    const cartItem = {
        id: 1,
        name: 'Tênis Esportivo Premium',
        price: 299.90,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        image: mainImage.src
    };
    
    // Recupera carrinho existente
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verifica se já existe no carrinho
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.size === cartItem.size && 
        item.color === cartItem.color
    );
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    // Salva carrinho
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Atualiza badge
    updateCartBadge();
    
    // Feedback
    showNotification(`${cartItem.name} adicionado ao carrinho!`);
    
    // Animação no botão
    addCartBtn.textContent = '✓ Adicionado!';
    addCartBtn.style.background = '#48bb78';
    addCartBtn.style.color = 'white';
    
    setTimeout(() => {
        addCartBtn.textContent = 'Adicionar ao Carrinho';
        addCartBtn.style.background = '';
        addCartBtn.style.color = '';
    }, 2000);
});

// Atualizar badge do carrinho
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

// Notificação
function showNotification(message) {
    // Remove notificação anterior se existir
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        ">${message}</div>
    `;
    
    // Adiciona estilo de animação se não existir
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // Animação de entrada
    document.querySelector('.product-layout').style.opacity = '0';
    document.querySelector('.product-layout').style.transform = 'translateY(20px)';
    document.querySelector('.product-layout').style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
        document.querySelector('.product-layout').style.opacity = '1';
        document.querySelector('.product-layout').style.transform = 'translateY(0)';
    }, 100);
});

// Swipe para mobile na galeria
let touchStartX = 0;
let touchEndX = 0;
let currentImageIndex = 0;

mainImage.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

mainImage.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - próxima imagem
            currentImageIndex = (currentImageIndex + 1) % images.length;
        } else {
            // Swipe right - imagem anterior
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        }
        
        mainImage.src = images[currentImageIndex];
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnails[currentImageIndex].classList.add('active');
    }
}

// Scroll suave para tabs em mobile
if (window.innerWidth < 600) {
    const tabsHeader = document.querySelector('.tabs-header');
    let isDown = false;
    let startX;
    let scrollLeft;

    tabsHeader.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - tabsHeader.offsetLeft;
        scrollLeft = tabsHeader.scrollLeft;
    });

    tabsHeader.addEventListener('mouseleave', () => {
        isDown = false;
    });

    tabsHeader.addEventListener('mouseup', () => {
        isDown = false;
    });

    tabsHeader.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabsHeader.offsetLeft;
        const walk = (x - startX) * 2;
        tabsHeader.scrollLeft = scrollLeft - walk;
    });
}

// ==================== CHECKOUT MODAL ====================

// Elementos do Checkout
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-overlay');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const successModal = document.getElementById('success-modal');
const closeSuccessBtn = document.getElementById('close-success');

// Elementos do formulário
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const whatsappInput = document.getElementById('whatsapp');

// Abrir modal de checkout
function openCheckoutModal() {
    // Atualiza informações do produto no checkout
    document.getElementById('checkout-product-details').textContent = 
        `Tamanho: ${selectedSize} | Cor: ${capitalize(selectedColor)} | Qtd: ${quantity}`;
    
    const totalPrice = 299.90 * quantity;
    document.getElementById('checkout-subtotal').textContent = `R$ ${formatPrice(totalPrice)}`;
    document.getElementById('checkout-total-price').textContent = `R$ ${formatPrice(totalPrice)}`;
    document.getElementById('checkout-product-price').textContent = `R$ ${formatPrice(totalPrice)}`;
    
    // Mostra modal
    checkoutModal.classList.add('show');
    checkoutOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Foca no primeiro campo
    setTimeout(() => fullnameInput.focus(), 100);
}

// Fechar modal de checkout
function closeCheckoutModal() {
    checkoutModal.classList.remove('show');
    checkoutOverlay.classList.remove('show');
    document.body.style.overflow = '';
    resetForm();
}

// Resetar formulário
function resetForm() {
    checkoutForm.reset();
    clearAllErrors();
    [fullnameInput, emailInput, whatsappInput].forEach(input => {
        input.classList.remove('error', 'valid');
    });
}

// Mostrar erro
function showError(input, message) {
    input.classList.add('error');
    input.classList.remove('valid');
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Limpar erro
function clearError(input) {
    input.classList.remove('error');
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Marcar como válido
function setValid(input) {
    input.classList.remove('error');
    input.classList.add('valid');
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Limpar todos os erros
function clearAllErrors() {
    ['fullname', 'email', 'whatsapp'].forEach(id => {
        const errorElement = document.getElementById(`${id}-error`);
        if (errorElement) errorElement.textContent = '';
    });
}

// Validar nome completo
function validateFullname(value) {
    if (!value || value.trim().length === 0) {
        return 'Nome completo é obrigatório';
    }
    if (value.trim().length < 3) {
        return 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        return 'Nome deve conter apenas letras';
    }
    const names = value.trim().split(/\s+/);
    if (names.length < 2) {
        return 'Digite nome e sobrenome';
    }
    return null;
}

// Validar email
function validateEmail(value) {
    if (!value || value.trim().length === 0) {
        return 'E-mail é obrigatório';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return 'E-mail inválido (ex: nome@email.com)';
    }
    return null;
}

// Validar WhatsApp
function validateWhatsapp(value) {
    if (!value || value.trim().length === 0) {
        return 'WhatsApp é obrigatório';
    }
    // Remove caracteres não numéricos para validação
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length < 11) {
        return 'WhatsApp inválido (precisa de DDD + 9 dígitos)';
    }
    if (numbersOnly.length > 11) {
        return 'WhatsApp inválido (muitos dígitos)';
    }
    const ddd = numbersOnly.substring(0, 2);
    if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
        return 'DDD inválido';
    }
    return null;
}

// Formatar WhatsApp (máscara)
function formatWhatsapp(value) {
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length <= 2) {
        return numbersOnly;
    }
    if (numbersOnly.length <= 7) {
        return `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2)}`;
    }
    return `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2, 7)}-${numbersOnly.substring(7, 11)}`;
}

// Capitalizar string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Formatar preço
function formatPrice(price) {
    return Number(price).toFixed(2).replace('.', ',');
}

// Event Listeners para validação em tempo real
fullnameInput.addEventListener('blur', () => {
    const error = validateFullname(fullnameInput.value);
    if (error) {
        showError(fullnameInput, error);
    } else {
        setValid(fullnameInput);
    }
});

fullnameInput.addEventListener('input', () => {
    clearError(fullnameInput);
});

emailInput.addEventListener('blur', () => {
    const error = validateEmail(emailInput.value);
    if (error) {
        showError(emailInput, error);
    } else {
        setValid(emailInput);
    }
});

emailInput.addEventListener('input', () => {
    clearError(emailInput);
});

whatsappInput.addEventListener('input', (e) => {
    // Aplica máscara
    e.target.value = formatWhatsapp(e.target.value);
    clearError(whatsappInput);
});

whatsappInput.addEventListener('blur', () => {
    const error = validateWhatsapp(whatsappInput.value);
    if (error) {
        showError(whatsappInput, error);
    } else {
        setValid(whatsappInput);
    }
});

// Submissão do formulário
const API_URL = '/api';

// Notificação melhorada
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const colors = {
        success: '#48bb78',
        error: '#f56565',
        info: '#667eea'
    };

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
            max-width: 300px;
        ">${message}</div>
    `;

    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Elementos do Modal de Pagamento
const paymentModal = document.getElementById('payment-modal');
const paymentOverlay = document.getElementById('payment-overlay');
const closePaymentBtn = document.getElementById('close-payment');
const copyPixBtn = document.getElementById('copy-pix-code');

let currentOrderId = null;
let paymentTimer = null;
let currentOrderData = null;

// Abrir modal de pagamento com dados da API
async function openPaymentModal(orderId, paymentData, orderData) {
    currentOrderId = orderId;
    currentOrderData = orderData;

    // Atualiza informações do pagamento
    document.getElementById('payment-ref-code').textContent = paymentData.reference_code;
    document.getElementById('payment-amount').textContent = `R$ ${formatPrice(paymentData.amount)}`;
    document.getElementById('pix-copy-paste').value = paymentData.copy_paste;

    // Mostra modal
    paymentModal.classList.add('show');
    paymentOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Inicia contador regressivo
    startPaymentTimer(paymentData.expires_at);

    // Inicia polling para verificar status do pagamento
    startPaymentPolling(orderId);
}

// Fechar modal de pagamento
function closePaymentModal() {
    paymentModal.classList.remove('show');
    paymentOverlay.classList.remove('show');
    document.body.style.overflow = '';

    // Limpa timers
    if (paymentTimer) clearInterval(paymentTimer);
}

// Contador regressivo para expiração do PIX
function startPaymentTimer(expiresAt) {
    const timerElement = document.getElementById('payment-timer');
    const endTime = new Date(expiresAt).getTime();

    paymentTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            clearInterval(paymentTimer);
            timerElement.textContent = 'EXPIRADO';
            timerElement.style.color = '#e53e3e';
            document.getElementById('payment-status').innerHTML =
                '<span class="status-badge" style="background: #fee; color: #c53030;">❌ QR Code Expirado</span>';
            return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Polling para verificar status do pagamento
function startPaymentPolling(orderId) {
    const checkPayment = async () => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/payment`);
            if (response.ok) {
                const data = await response.json();

                if (data.payment.status === 'paid') {
                    // Pagamento confirmado!
                    closePaymentModal();
                    showSuccessModal(orderId, true);

                    // Atualiza estoque
                    if (currentOrderData) {
                        updateProductStock(currentOrderData.items[0].quantity);
                    }

                    // Limpa formulário
                    resetForm();

                    // Para o polling
                    return;
                }
            }

            // Continua verificando a cada 5 segundos se o modal ainda estiver aberto
            if (paymentModal.classList.contains('show')) {
                setTimeout(() => checkPayment(), 5000);
            }
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
        }
    };

    // Inicia verificação após 5 segundos
    setTimeout(() => checkPayment(), 5000);
}

// Copiar código PIX
function copyPixCode() {
    const textarea = document.getElementById('pix-copy-paste');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // Para mobile

    navigator.clipboard.writeText(textarea.value).then(() => {
        copyPixBtn.textContent = '✓ Copiado!';
        copyPixBtn.classList.add('copied');

        showNotification('Código PIX copiado!', 'success');

        setTimeout(() => {
            copyPixBtn.textContent = '📋 Copiar';
            copyPixBtn.classList.remove('copied');
        }, 2000);
    });
}

// Mostrar modal de sucesso
function showSuccessModal(orderId, isPaid = false) {
    const successMessage = successModal.querySelector('.success-message');

    if (isPaid) {
        successMessage.innerHTML = `
            <div style="color: #48bb78; font-size: 1.2rem; margin-bottom: 10px;">✓ Pagamento confirmado!</div>
            Pedido <strong>#${orderId}</strong> pago com sucesso.<br>
            Você receberá um email de confirmação em breve.
        `;
    } else {
        successMessage.innerHTML = `
            Pedido <strong>#${orderId}</strong> criado com sucesso!<br>
            Complete o pagamento via PIX para confirmar sua compra.
        `;
    }

    successModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Atualizar submissão do formulário para usar nova rota e mostrar pagamento
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida todos os campos
    const fullnameError = validateFullname(fullnameInput.value);
    const emailError = validateEmail(emailInput.value);
    const whatsappError = validateWhatsapp(whatsappInput.value);

    let hasError = false;

    if (fullnameError) {
        showError(fullnameInput, fullnameError);
        hasError = true;
    } else {
        setValid(fullnameInput);
    }

    if (emailError) {
        showError(emailInput, emailError);
        hasError = true;
    } else {
        setValid(emailInput);
    }

    if (whatsappError) {
        showError(whatsappInput, whatsappError);
        hasError = true;
    } else {
        setValid(whatsappInput);
    }

    if (hasError) {
        const firstError = checkoutForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
    }

    // Prepara dados do pedido no formato esperado pela API
    const orderData = {
        customer_name: fullnameInput.value.trim(),
        customer_email: emailInput.value.trim(),
        customer_whatsapp: whatsappInput.value.replace(/\D/g, ''),
        items: [{
            product_id: 1,
            quantity: quantity,
            price: 299.90,
            size: selectedSize,
            color: selectedColor
        }]
    };

    const submitBtn = checkoutForm.querySelector('.btn-checkout');
    const originalText = submitBtn.innerHTML;

    // Estado de loading
    submitBtn.innerHTML = '<span class="spinner"></span> Processando...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
        // Envia requisição real para o backend
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            // Sucesso - fecha checkout e mostra pagamento
            closeCheckoutModal();

            // Salva ID do pedido para referência
            currentOrderId = result.order.id;

            // Abre modal de pagamento com dados da API
            openPaymentModal(
                result.order.id,
                result.payment,
                orderData
            );

            // Notificação
            showNotification(`Pedido #${result.order.id} criado! Aguardando pagamento...`, 'success');

        } else {
            // Erro retornado pela API
            throw new Error(result.error || 'Erro ao criar pedido');
        }

    } catch (error) {
        console.error('Erro na requisição:', error);

        // Mostra erro na interface
        const errorDiv = document.createElement('div');
        errorDiv.className = 'api-error';
        errorDiv.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 0.9rem;
        `;
        errorDiv.innerHTML = `<strong>Erro:</strong> ${error.message}`;

        // Remove erro anterior se existir
        const existingError = checkoutForm.querySelector('.api-error');
        if (existingError) existingError.remove();

        checkoutForm.insertBefore(errorDiv, checkoutForm.firstChild);

        // Remove erro após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) errorDiv.remove();
        }, 5000);

    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
});

// Event Listeners do modal de pagamento
closePaymentBtn.addEventListener('click', closePaymentModal);
paymentOverlay.addEventListener('click', closePaymentModal);
copyPixBtn.addEventListener('click', copyPixCode);

// Fechar com ESC - atualizar para incluir modal de pagamento
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (paymentModal.classList.contains('show')) {
            closePaymentModal();
        } else if (successModal.classList.contains('show')) {
            successModal.classList.remove('show');
            document.body.style.overflow = '';
        } else if (checkoutModal.classList.contains('show')) {
            closeCheckoutModal();
        }
    }
});

// Event Listeners dos botões principais
buyBtn.addEventListener('click', openCheckoutModal);
closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
checkoutOverlay.addEventListener('click', closeCheckoutModal);

closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('show');
    document.body.style.overflow = '';
});

// Previne scroll quando modal está aberto
checkoutModal.addEventListener('wheel', (e) => {
    e.stopPropagation();
});

// Previne scroll no modal de pagamento
paymentModal.addEventListener('wheel', (e) => {
    e.stopPropagation();
});
