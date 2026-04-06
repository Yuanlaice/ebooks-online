/**
 * EBOOK STORE - BUSCA E CARRINHO
 * Funcionalidades de lupa (busca) e carrinho de compras
 */

// Esperar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando busca e carrinho...');
    initSearch();
    initCart();
    loadEbooksFromSupabase();
});

/**
 * CARREGAR EBOOKS DO SUPABASE
 */
async function loadEbooksFromSupabase() {
    try {
        if (!window.supabaseClient) {
            console.log('supabaseClient não disponível, usando dados estáticos');
            window.allEbooks = extractEbooksFromPage();
            return;
        }
        
        const result = await window.supabaseClient.fetchEbooks();
        if (result.success && result.ebooks) {
            window.allEbooks = result.ebooks;
            console.log(`${result.ebooks.length} ebooks carregados do Supabase`);
        } else {
            window.allEbooks = extractEbooksFromPage();
        }
    } catch (error) {
        console.error('Erro ao carregar ebooks:', error);
        window.allEbooks = extractEbooksFromPage();
    }
}

function extractEbooksFromPage() {
    const ebooks = [];
    document.querySelectorAll('.ebook-card').forEach((card, index) => {
        const link = card.querySelector('a');
        const id = link?.href?.match(/id=(\d+)/)?.[1] || (index + 1);
        
        ebooks.push({
            id: id,
            title: card.querySelector('h3')?.textContent || '',
            author: 'EbookStore',
            description: card.querySelector('.ebook-desc')?.textContent || '',
            price: card.querySelector('.price')?.textContent || 'MZN 97,00',
            cover_image: card.querySelector('img')?.src || '',
            gender: 'unissex'
        });
    });
    console.log(`${ebooks.length} ebooks extraídos da página`);
    return ebooks;
}

/**
 * SISTEMA DE BUSCA (LUPA)
 */
function initSearch() {
    console.log('Inicializando busca...');
    const btnSearch = document.querySelector('.btn-search');
    
    if (btnSearch) {
        console.log('Botão de busca encontrado');
        btnSearch.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clicou na lupa');
            openSearchModal();
        });
    } else {
        console.error('Botão .btn-search não encontrado');
    }
}

function openSearchModal() {
    console.log('Abrindo modal de busca');
    
    // Remover modal anterior se existir
    const existingModal = document.getElementById('modal-search');
    if (existingModal) existingModal.remove();
    
    // Adicionar CSS se não existir
    addSearchCartCSS();
    
    const modalHTML = `
        <div id="modal-search" class="modal search-modal show" style="display: flex !important;">
            <div class="modal-content search-modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto; background: white; border-radius: 16px; padding: 30px; position: relative;">
                <button class="modal-close" onclick="closeSearchModal()" style="position: absolute; top: 15px; right: 15px; font-size: 24px; background: none; border: none; cursor: pointer;">&times;</button>
                
                <div class="search-header" style="text-align: center; margin-bottom: 25px;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 5px;">🔍 Buscar Ebooks</h2>
                    <p style="color: #666; font-size: 0.95rem;">Encontre o conteúdo perfeito para você</p>
                </div>
                
                <div class="search-box" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="search-input" placeholder="Digite o nome do ebook, autor ou categoria..." autocomplete="off" 
                        style="flex: 1; padding: 15px 20px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem;">
                    <button class="btn-search-action" onclick="performSearch()" 
                        style="padding: 15px 25px; background: #667eea; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;">Buscar</button>
                </div>
                
                <div class="search-filters" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                    <button class="filter-btn active" data-filter="all" onclick="setSearchFilter(this, 'all')" 
                        style="padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 20px; background: #667eea; color: white; cursor: pointer;">Todos</button>
                    <button class="filter-btn" data-filter="masculino" onclick="setSearchFilter(this, 'masculino')" 
                        style="padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 20px; background: white; cursor: pointer;">Masculino</button>
                    <button class="filter-btn" data-filter="feminino" onclick="setSearchFilter(this, 'feminino')" 
                        style="padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 20px; background: white; cursor: pointer;">Feminino</button>
                    <button class="filter-btn" data-filter="unissex" onclick="setSearchFilter(this, 'unissex')" 
                        style="padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 20px; background: white; cursor: pointer;">Unissex</button>
                </div>
                
                <div class="search-results" id="search-results">
                    <p class="search-placeholder" style="text-align: center; color: #666; padding: 40px;">Digite algo para buscar...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Focar no input
    setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) input.focus();
    }, 100);
    
    // Evento de input com debounce
    const input = document.getElementById('search-input');
    if (input) {
        input.addEventListener('input', debounce(performSearch, 300));
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function setSearchFilter(btn, filter) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'white';
        b.style.color = '#333';
    });
    btn.classList.add('active');
    btn.style.background = '#667eea';
    btn.style.color = 'white';
    performSearch();
}

function closeSearchModal() {
    const modal = document.getElementById('modal-search');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function performSearch() {
    const input = document.getElementById('search-input');
    const query = input ? input.value.toLowerCase().trim() : '';
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const resultsContainer = document.getElementById('search-results');
    
    if (!query) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Digite algo para buscar...</p>';
        return;
    }
    
    // Buscar nos ebooks disponíveis
    let ebooks = window.allEbooks || [];
    
    // Se não tiver do Supabase, buscar nos cards da página
    if (ebooks.length === 0) {
        ebooks = extractEbooksFromPage();
        window.allEbooks = ebooks;
    }
    
    let filtered = ebooks.filter(ebook => {
        const matchQuery = 
            ebook.title?.toLowerCase().includes(query) ||
            ebook.author?.toLowerCase().includes(query) ||
            ebook.category?.toLowerCase().includes(query) ||
            ebook.description?.toLowerCase().includes(query);
        
        const matchFilter = activeFilter === 'all' || ebook.gender === activeFilter;
        
        return matchQuery && matchFilter;
    });
    
    displaySearchResults(filtered, query);
}

function displaySearchResults(ebooks, query) {
    const container = document.getElementById('search-results');
    
    if (ebooks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p style="font-size: 1.1rem; margin-bottom: 10px;">😕 Nenhum ebook encontrado para "${query}"</p>
                <p>Tente buscar por outro termo</p>
            </div>
        `;
        return;
    }
    
    const html = ebooks.map(ebook => `
        <div style="display: flex; gap: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; align-items: center; margin-bottom: 10px;">
            <img src="${ebook.cover_image || 'https://placehold.co/80x110'}" alt="${ebook.title}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
                <h4 style="font-size: 1rem; margin-bottom: 4px;">${highlightText(ebook.title, query)}</h4>
                <p style="color: #666; font-size: 0.85rem; margin-bottom: 4px;">${ebook.author || 'EbookStore'}</p>
                <p style="color: #999; font-size: 0.8rem; margin-bottom: 4px;">${ebook.description?.substring(0, 60) || ''}...</p>
                <span style="color: #48bb78; font-weight: 600;">${ebook.price || 'MZN 97,00'}</span>
            </div>
            <a href="ebook.html?id=${ebook.id}" style="padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;" onclick="closeSearchModal()">Ver</a>
        </div>
    `).join('');
    
    container.innerHTML = `
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">${ebooks.length} resultado(s) encontrado(s)</p>
        <div>${html}</div>
    `;
}

function highlightText(text, query) {
    if (!text) return '';
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: #fef3c7; padding: 0 2px; border-radius: 2px;">$1</mark>');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * SISTEMA DE CARRINHO
 */
let cart = JSON.parse(localStorage.getItem('ebookCart')) || [];

function initCart() {
    console.log('Inicializando carrinho...');
    updateCartUI();
    
    // Botão do carrinho no header
    const btnCart = document.querySelector('.btn-cart');
    if (btnCart) {
        console.log('Botão do carrinho encontrado');
        btnCart.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clicou no carrinho');
            openCartModal();
        });
    } else {
        console.error('Botão .btn-cart não encontrado');
    }
    
    // Adicionar botões "Adicionar ao Carrinho" nos cards
    setTimeout(addCartButtonsToEbooks, 500);
}

function addCartButtonsToEbooks() {
    console.log('Adicionando botões de carrinho...');
    let count = 0;
    
    document.querySelectorAll('.ebook-card').forEach(card => {
        if (!card.querySelector('.btn-add-cart')) {
            const overlay = card.querySelector('.ebook-overlay');
            if (overlay) {
                const btn = document.createElement('button');
                btn.className = 'btn-add-cart';
                btn.innerHTML = '🛒 Adicionar';
                btn.style.cssText = 'position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: #48bb78; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; z-index: 10; font-size: 0.9rem; transition: all 0.3s;';
                
                btn.onmouseenter = function() {
                    this.style.transform = 'translateX(-50%) scale(1.05)';
                    this.style.background = '#38a169';
                };
                btn.onmouseleave = function() {
                    this.style.transform = 'translateX(-50%) scale(1)';
                    this.style.background = '#48bb78';
                };
                
                btn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const link = card.querySelector('a');
                    const id = link?.href?.match(/id=(\d+)/)?.[1] || Date.now();
                    const ebook = {
                        id: id,
                        title: card.querySelector('h3')?.textContent || 'Ebook',
                        price: card.querySelector('.price')?.textContent || 'MZN 97,00',
                        cover: card.querySelector('img')?.src || ''
                    };
                    addToCart(ebook);
                };
                
                overlay.appendChild(btn);
                count++;
            }
        }
    });
    
    console.log(`${count} botões de carrinho adicionados`);
}

function addToCart(ebook) {
    console.log('Adicionando ao carrinho:', ebook);
    
    // Verificar se já existe
    const exists = cart.find(item => item.id == ebook.id);
    if (exists) {
        showNotification('Este ebook já está no carrinho!', 'info');
        return;
    }
    
    cart.push(ebook);
    saveCart();
    updateCartUI();
    showNotification('Ebook adicionado ao carrinho! 🛒');
}

function removeFromCart(ebookId) {
    console.log('Removendo do carrinho:', ebookId);
    cart = cart.filter(item => item.id != ebookId);
    saveCart();
    updateCartUI();
    
    // Atualizar modal se estiver aberto
    openCartModal();
}

function saveCart() {
    localStorage.setItem('ebookCart', JSON.stringify(cart));
}

function updateCartUI() {
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => {
        el.textContent = cart.length;
        el.style.animation = 'none';
        setTimeout(() => {
            el.style.animation = 'bounce 0.3s';
        }, 10);
    });
}

function openCartModal() {
    console.log('Abrindo modal do carrinho');
    
    // Remover modal anterior
    const existingModal = document.getElementById('modal-cart');
    if (existingModal) existingModal.remove();
    
    // Adicionar CSS se não existir
    addSearchCartCSS();
    
    const total = cart.reduce((sum, item) => {
        const priceStr = item.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0';
        const price = parseFloat(priceStr) || 0;
        return sum + price;
    }, 0);
    
    const modalHTML = `
        <div id="modal-cart" class="modal cart-modal show" style="display: flex !important;">
            <div class="modal-content cart-modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto; background: white; border-radius: 16px; padding: 30px; position: relative;">
                <button class="modal-close" onclick="closeCartModal()" style="position: absolute; top: 15px; right: 15px; font-size: 24px; background: none; border: none; cursor: pointer;">&times;</button>
                
                <div class="cart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                    <h2 style="font-size: 1.4rem;">🛒 Seu Carrinho</h2>
                    <p style="color: #666; font-size: 0.9rem;">${cart.length} item(s)</p>
                </div>
                
                <div class="cart-items" id="cart-items">
                    ${cart.length === 0 ? `
                        <div style="text-align: center; padding: 50px 20px;">
                            <p style="font-size: 1.1rem; color: #666; margin-bottom: 25px;">🛒 Seu carrinho está vazio</p>
                            <a href="ebook-store.html" class="btn" onclick="closeCartModal()" 
                                style="padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                Continuar Comprando
                            </a>
                        </div>
                    ` : cart.map(item => `
                        <div style="display: flex; gap: 15px; padding: 15px; background: #f7fafc; border-radius: 12px; align-items: center; margin-bottom: 10px;">
                            <img src="${item.cover}" alt="${item.title}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px;">
                            <div style="flex: 1;">
                                <h4 style="font-size: 1rem; margin-bottom: 5px;">${item.title}</h4>
                                <span style="color: #48bb78; font-weight: 600;">${item.price}</span>
                            </div>
                            <button onclick="removeFromCart('${item.id}')" 
                                style="padding: 8px 12px; background: #fee2e2; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">🗑️</button>
                        </div>
                    `).join('')}
                </div>
                
                ${cart.length > 0 ? `
                    <div class="cart-footer" style="padding-top: 20px; border-top: 2px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem; margin-bottom: 20px;">
                            <span>Total:</span>
                            <strong style="color: #48bb78; font-size: 1.4rem;">MZN ${total.toFixed(2).replace('.', ',')}</strong>
                        </div>
                        <button onclick="checkoutCart()" 
                            style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-bottom: 10px;">
                            Finalizar Compra
                        </button>
                        <a href="ebook-store.html" onclick="closeCartModal()" 
                            style="display: block; text-align: center; padding: 12px; color: #666; text-decoration: none; border: 1px solid #e2e8f0; border-radius: 8px;">
                            Continuar Comprando
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    const modal = document.getElementById('modal-cart');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function checkoutCart() {
    if (cart.length === 0) {
        showNotification('Carrinho vazio!', 'error');
        return;
    }
    
    // Se tiver apenas 1 item, vai direto para o checkout
    if (cart.length === 1) {
        closeCartModal();
        window.location.href = `ebook.html?id=${cart[0].id}`;
        return;
    }
    
    // Para múltiplos itens
    showNotification('Funcionalidade de checkout múltiplo em desenvolvimento');
}

/**
 * CSS Dinâmico
 */
function addSearchCartCSS() {
    if (document.getElementById('search-cart-css')) return;
    
    const css = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal.show {
            display: flex !important;
        }
        
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'search-cart-css';
    style.textContent = css;
    document.head.appendChild(style);
}

/**
 * Notificação (se não existir)
 */
if (typeof showNotification !== 'function') {
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span style="font-size: 1.2rem;">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#667eea'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Adicionar animação CSS
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(animStyle);
}

// Exportar funções globais
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.performSearch = performSearch;
window.setSearchFilter = setSearchFilter;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.checkoutCart = checkoutCart;

console.log('Busca e carrinho carregados!');
