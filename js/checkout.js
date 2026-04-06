/**
 * EBOOK STORE - Checkout com Supabase
 * Fluxo completo: Cliente → Compra → Pedido → Pagamento → Download
 */

// Estado global do checkout
let currentOrder = null;
let currentEbook = null;

/**
 * Inicializar checkout quando a página carregar
 */
document.addEventListener('DOMContentLoaded', function() {
    initCheckoutFlow();
    initPaymentModal();
    loadEbookDetails();
});

/**
 * Carregar detalhes do ebook da URL via Supabase
 */
async function loadEbookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const ebookId = urlParams.get('id');
    
    if (!ebookId) {
        console.log('Nenhum ebook ID na URL');
        return;
    }

    try {
        const result = await window.supabaseClient.fetchEbookById(ebookId);
        
        if (result.success) {
            currentEbook = result.ebook;
            updateProductPage(result.ebook, result.reviews);
        } else {
            console.error('Erro ao carregar ebook:', result.error);
        }
    } catch (error) {
        console.error('Erro ao carregar ebook:', error);
    }
}

/**
 * Atualizar página com dados do ebook
 */
function updateProductPage(ebook, reviews) {
    // Atualizar título
    document.title = `${ebook.title} - EbookStore`;
    
    // Atualizar elementos da página se existirem
    const titleEl = document.querySelector('.product-header h1');
    if (titleEl) titleEl.textContent = ebook.title;
    
    const subtitleEl = document.querySelector('.subtitle');
    if (subtitleEl) subtitleEl.textContent = ebook.description;
    
    const priceEl = document.querySelector('.amount');
    if (priceEl) priceEl.textContent = ebook.price.toFixed(2).replace('.', ',');
    
    const oldPriceEl = document.querySelector('.price-old');
    if (oldPriceEl && ebook.old_price) {
        oldPriceEl.textContent = `MZN ${ebook.old_price.toFixed(2).replace('.', ',')}`;
    }
    
    const coverEl = document.querySelector('.cover-main img');
    if (coverEl) coverEl.src = ebook.cover_image;
    
    const ratingEl = document.querySelector('.rating-value');
    if (ratingEl) ratingEl.textContent = ebook.rating;
    
    const reviewsEl = document.querySelector('.rating-total');
    if (reviewsEl) {
        reviewsEl.textContent = `(${ebook.review_count} avaliações)`;
    }
}

/**
 * Inicializar fluxo de checkout
 */
function initCheckoutFlow() {
    const btnBuy = document.getElementById('btn-buy');
    
    if (btnBuy) {
        btnBuy.addEventListener('click', openCheckoutModal);
    }
}

/**
 * Abrir modal de checkout
 */
function openCheckoutModal() {
    const modal = document.getElementById('modal-compra');
    
    if (!modal) {
        createCheckoutModal();
    }
    
    const modalEl = document.getElementById('modal-compra');
    modalEl.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Preencher dados do ebook no modal
    updateCheckoutModalData();
}

/**
 * Criar modal de checkout dinamicamente
 */
function createCheckoutModal() {
    const modalHTML = `
        <div id="modal-compra" class="modal">
            <div class="modal-content checkout-modal-content">
                <button class="modal-close">&times;</button>
                
                <div class="checkout-header">
                    <h2>🛒 Finalizar Compra</h2>
                    <p>Preencha seus dados para receber o ebook</p>
                </div>
                
                <div class="checkout-product-summary">
                    <img src="" alt="Ebook" id="checkout-cover">
                    <div class="checkout-product-info">
                        <h4 id="checkout-title">Título do Ebook</h4>
                        <p id="checkout-author">Autor</p>
                        <span class="checkout-price" id="checkout-price">MZN 0,00</span>
                    </div>
                </div>
                
                <form class="checkout-form" id="checkout-form">
                    <div class="form-group">
                        <label for="customer-name">Nome Completo *</label>
                        <input type="text" id="customer-name" required placeholder="Digite seu nome">
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-email">Email *</label>
                        <input type="email" id="customer-email" required placeholder="seu@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-phone">WhatsApp (opcional)</label>
                        <input type="tel" id="customer-phone" placeholder="(11) 99999-9999">
                    </div>
                    
                    <div class="payment-methods">
                        <label>Forma de Pagamento</label>
                        <div class="payment-options">
                            <label class="payment-option active">
                                <input type="radio" name="payment" value="pix" checked>
                                <span class="payment-icon">📱</span>
                                <span>PIX</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card">
                                <span class="payment-icon">💳</span>
                                <span>Cartão</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-buy btn-checkout">
                        Confirmar Pedido
                    </button>
                </form>
                
                <p class="secure-payment">
                    🔒 Pagamento 100% seguro • Dados protegidos
                </p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar eventos
    const modal = document.getElementById('modal-compra');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('checkout-form');
    
    closeBtn.addEventListener('click', closeCheckoutModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeCheckoutModal();
    });
    
    form.addEventListener('submit', handleCheckoutSubmit);
    
    // Payment option selection
    const paymentOptions = modal.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            this.querySelector('input').checked = true;
        });
    });
}

/**
 * Atualizar dados no modal de checkout
 */
function updateCheckoutModalData() {
    const ebook = currentEbook || {
        title: document.querySelector('.product-header h1')?.textContent || 'Ebook',
        author: 'Autor',
        price: parseFloat(document.querySelector('.amount')?.textContent?.replace(',', '.') || 0),
        cover_image: document.querySelector('.cover-main img')?.src || ''
    };
    
    const coverEl = document.getElementById('checkout-cover');
    const titleEl = document.getElementById('checkout-title');
    const authorEl = document.getElementById('checkout-author');
    const priceEl = document.getElementById('checkout-price');
    
    if (coverEl) coverEl.src = ebook.cover_image;
    if (titleEl) titleEl.textContent = ebook.title;
    if (authorEl) authorEl.textContent = ebook.author || 'EbookStore';
    if (priceEl) priceEl.textContent = `MZN ${ebook.price.toFixed(2).replace('.', ',')}`;
}

/**
 * Fechar modal de checkout
 */
function closeCheckoutModal() {
    const modal = document.getElementById('modal-compra');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Submeter checkout - Criar pedido no Supabase
 */
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('.btn-checkout');
    btn.textContent = 'Processando...';
    btn.disabled = true;
    
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Pegar ID do ebook da URL
    const urlParams = new URLSearchParams(window.location.search);
    const ebookId = urlParams.get('id') || 1;
    
    // Pegar preço do ebook atual
    const price = currentEbook?.price || 97.00;
    
    const orderData = {
        customer_name: name,
        email: email,
        ebook_id: parseInt(ebookId),
        price: price,
        payment_method: paymentMethod
    };
    
    try {
        // Criar pedido no Supabase
        const result = await window.supabaseClient.createOrder(orderData);
        
        if (result.success) {
            currentOrder = result.order;
            
            // Fechar checkout e abrir pagamento
            closeCheckoutModal();
            openPaymentModal(result.order, paymentMethod);
            
            showNotification('Pedido criado! Aguardando pagamento...');
        } else {
            throw new Error(result.error || 'Erro ao criar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification(error.message, 'error');
        btn.textContent = 'Tentar Novamente';
        btn.disabled = false;
    }
}

/**
 * Modal de Pagamento (PIX/Cartão)
 */
function initPaymentModal() {
    // Modal será criado dinamicamente quando necessário
}

function openPaymentModal(order, paymentMethod) {
    // Remover modal anterior se existir
    const existingModal = document.getElementById('modal-pagamento');
    if (existingModal) existingModal.remove();
    
    const isPix = paymentMethod === 'pix';
    
    const modalHTML = `
        <div id="modal-pagamento" class="modal payment-modal">
            <div class="modal-content payment-modal-content">
                <div class="payment-header">
                    <h2>${isPix ? '📱 Pagar com PIX' : '💳 Pagar com Cartão'}</h2>
                    <p>Pedido #${order.id}</p>
                </div>
                
                ${isPix ? `
                <div class="pix-payment">
                    <div class="pix-qr-section">
                        <div class="qr-placeholder">
                            <div class="qr-code-mock"></div>
                            <p>QR Code PIX</p>
                        </div>
                    </div>
                    
                    <div class="pix-code-section">
                        <label>Código PIX (copie e cole):</label>
                        <div class="pix-code-box">
                            <input type="text" id="pix-code" readonly 
                                value="00020126580014BR.GOV.BCB.PIX0114+5511999999999520400005303986${(order.price * 100).toFixed(0)}5802BR5913EbookStore6009SAO PAULO62140510PED${Date.now()}6304">
                            <button class="btn-copy" onclick="copyPixCode()">📋 Copiar</button>
                        </div>
                    </div>
                    
                    <div class="payment-timer">
                        <p>⏱️ Expira em: <span id="timer">30:00</span></p>
                    </div>
                </div>
                ` : `
                <div class="card-payment">
                    <form id="card-form">
                        <div class="form-group">
                            <label>Número do Cartão</label>
                            <input type="text" placeholder="0000 0000 0000 0000" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Validade</label>
                                <input type="text" placeholder="MM/AA" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nome no Cartão</label>
                            <input type="text" placeholder="Como aparece no cartão">
                        </div>
                        <button type="button" class="btn btn-buy" onclick="simulateCardPayment()">
                            Pagar MZN ${order.price.toFixed(2).replace('.', ',')}
                        </button>
                    </form>
                </div>
                `}
                
                <div class="payment-status" id="payment-status">
                    <span class="status-badge pending">⏳ Aguardando pagamento...</span>
                </div>
                
                <div class="payment-actions">
                    <button class="btn btn-secondary" onclick="closePaymentModal()">Cancelar</button>
                    
                    ${isPix ? `
                    <button class="btn btn-primary" onclick="simulatePixConfirmation()">
                        Simular Pagamento Recebido
                    </button>
                    ` : ''}
                </div>
                
                <p class="payment-help">
                    Dúvidas? <a href="https://wa.me/5511999999999" target="_blank">Fale conosco</a>
                </p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('modal-pagamento');
    modal.classList.add('show');
    
    if (isPix) {
        startPaymentTimer();
    }
}

function closePaymentModal() {
    const modal = document.getElementById('modal-pagamento');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Copiar código PIX
 */
function copyPixCode() {
    const codeInput = document.getElementById('pix-code');
    codeInput.select();
    document.execCommand('copy');
    showNotification('Código PIX copiado!');
}

/**
 * Timer do pagamento
 */
function startPaymentTimer() {
    let timeLeft = 30 * 60; // 30 minutos em segundos
    const timerEl = document.getElementById('timer');
    
    const timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (timerEl) timerEl.textContent = 'Expirado';
        }
    }, 1000);
}

/**
 * Simular confirmação de pagamento PIX via Supabase
 */
async function simulatePixConfirmation() {
    if (!currentOrder) return;
    
    const btn = document.querySelector('#modal-pagamento .btn-primary');
    if (btn) {
        btn.textContent = 'Confirmando...';
        btn.disabled = true;
    }
    
    try {
        // Confirmar pagamento no Supabase
        const result = await window.supabaseClient.confirmPayment(currentOrder.id, {
            payment_method: 'pix',
            transaction_id: `PIX-${Date.now()}`
        });
        
        if (result.success) {
            // Atualizar status na tela
            const statusEl = document.getElementById('payment-status');
            if (statusEl) {
                statusEl.innerHTML = '<span class="status-badge success">✓ Pagamento Confirmado!</span>';
            }
            
            showNotification('Pagamento confirmado! Preparando seu download...');
            
            // Fechar modal e mostrar sucesso
            setTimeout(() => {
                closePaymentModal();
                showOrderSuccess(result.order);
            }, 2000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao confirmar pagamento', 'error');
        if (btn) {
            btn.textContent = 'Simular Pagamento Recebido';
            btn.disabled = false;
        }
    }
}

/**
 * Simular pagamento com cartão
 */
async function simulateCardPayment() {
    if (!currentOrder) return;
    
    const btn = document.querySelector('#card-form .btn-buy');
    btn.textContent = 'Processando...';
    btn.disabled = true;
    
    // Simular delay de processamento
    await new Promise(r => setTimeout(r, 2000));
    
    simulatePixConfirmation();
}

/**
 * Mostrar tela de sucesso com link de download (via Supabase Storage)
 */
function showOrderSuccess(order) {
    // Remover modal anterior
    const existingModal = document.getElementById('modal-sucesso');
    if (existingModal) existingModal.remove();
    
    // URL do ebook no Supabase Storage (ou link externo)
    const downloadUrl = currentEbook?.file_url || 
        `https://atgtajnsubisvkpbvoej.supabase.co/storage/v1/object/public/ebooks/ebook-${order.ebook_id}.pdf?download=${order.download_token}`;
    
    const modalHTML = `
        <div id="modal-sucesso" class="modal success-modal show">
            <div class="modal-content success-modal-content">
                <div class="success-icon">🎉</div>
                <h2>Pagamento Confirmado!</h2>
                <p>Seu ebook está pronto para download.</p>
                
                <div class="order-details">
                    <p><strong>Pedido:</strong> #${order.id}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                </div>
                
                <div class="download-section">
                    <a href="${downloadUrl}" 
                       class="btn btn-buy btn-download" target="_blank" download>
                        📥 Baixar Ebook Agora
                    </a>
                    <p class="download-note">
                        Link válido por 24 horas<br>
                        Você também recebeu o link no email
                    </p>
                </div>
                
                <div class="success-actions">
                    <a href="ebook-store.html" class="btn btn-secondary">
                        ← Voltar para a Loja
                    </a>
                    <button class="btn btn-primary" onclick="closeSuccessModal()">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const modal = document.getElementById('modal-sucesso');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Enviar avaliação para Supabase
 */
async function submitReview(ebookId, rating, comment) {
    const name = prompt('Seu nome:');
    const email = prompt('Seu email:');
    
    if (!name || !email) return;
    
    try {
        const result = await window.supabaseClient.submitReview({
            ebook_id: ebookId,
            customer_name: name,
            email: email,
            rating: rating,
            comment: comment
        });
        
        if (result.success) {
            showNotification('Avaliação enviada com sucesso!');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showNotification('Erro ao enviar avaliação', 'error');
    }
}

/**
 * Inscrever na newsletter via Supabase
 */
async function subscribeNewsletter(email, name) {
    try {
        const result = await window.supabaseClient.subscribeNewsletter(email, name);
        
        if (result.success) {
            showNotification('Cadastrado na newsletter!');
            return true;
        } else if (result.already_subscribed) {
            showNotification('Email já cadastrado!');
            return false;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showNotification('Erro ao cadastrar', 'error');
        return false;
    }
}

// Exportar funções para uso global
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.copyPixCode = copyPixCode;
window.simulatePixConfirmation = simulatePixConfirmation;
window.simulateCardPayment = simulateCardPayment;
window.closePaymentModal = closePaymentModal;
window.closeSuccessModal = closeSuccessModal;
