/**
 * EBOOK STORE - JavaScript Funcionalidades
 * Sistema completo para loja de ebooks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas as funcionalidades
    initTabs();
    initStarRating();
    initModal();
    initSmoothScroll();
    initHeaderScroll();
    initCoverThumbnails();
    initSearch();
    initCart();
    initCategoryFilters();
    loadEbooksFromSupabase();
});

/**
 * Sistema de Abas (Tabs)
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // Remover active de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Adicionar active ao botão clicado
            this.classList.add('active');

            // Mostrar painel correspondente
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/**
 * Sistema de Avaliação com Estrelas
 */
function initStarRating() {
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        // Hover effect
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });

        // Click para selecionar
        star.addEventListener('click', function() {
            selectedRating = index + 1;
            highlightStars(selectedRating);
            
            // Adicionar classe active
            stars.forEach((s, i) => {
                if (i < selectedRating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });

            // Feedback visual
            showNotification(`Você avaliou com ${selectedRating} estrela(s)!`);
        });
    });

    // Reset ao sair da área de estrelas
    const starsContainer = document.querySelector('.stars-select');
    if (starsContainer) {
        starsContainer.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });
    }
}

function highlightStars(count) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.style.color = '#ffc107';
            star.textContent = '★';
        } else {
            star.style.color = '#ddd';
            star.textContent = '☆';
        }
    });
}

/**
 * Modal de Compra
 */
function initModal() {
    const modal = document.getElementById('modal-compra');
    const btnBuy = document.getElementById('btn-buy');
    const btnClose = document.querySelector('.modal-close');
    const form = document.querySelector('.checkout-form');

    if (btnBuy && modal) {
        btnBuy.addEventListener('click', function() {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener('click', closeModal);
    }

    if (modal) {
        // Fechar ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular processamento
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Processando...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = '✓ Compra Realizada!';
                showNotification('Compra realizada com sucesso! Verifique seu email.');
                
                setTimeout(() => {
                    closeModal();
                    btn.textContent = originalText;
                    btn.disabled = false;
                    form.reset();
                }, 2000);
            }, 1500);
        });
    }
}

function closeModal() {
    const modal = document.getElementById('modal-compra');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Scroll Suave para Links Internos
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Efeito Header ao Scroll
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }

        lastScroll = currentScroll;
    });
}

/**
 * Troca de Imagens de Capa
 */
function initCoverThumbnails() {
    const thumbnails = document.querySelectorAll('.cover-thumbnails img');
    const mainCover = document.querySelector('.cover-main img');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remover active de todas
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Adicionar active na clicada
            this.classList.add('active');

            // Trocar imagem principal
            if (mainCover) {
                const newSrc = this.src;
                mainCover.style.opacity = '0';
                
                setTimeout(() => {
                    mainCover.src = newSrc;
                    mainCover.style.opacity = '1';
                }, 200);
            }
        });
    });
}

/**
 * Sistema de Notificações
 */
function showNotification(message, type = 'success') {
    // Remover notificação anterior se existir
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Criar elemento
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
        <span class="notification-text">${message}</span>
    `;

    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#667eea'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;

    // Adicionar ao body
    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Animação CSS para notificação
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { 
            transform: translateX(100%); 
            opacity: 0; 
        }
        to { 
            transform: translateX(0); 
            opacity: 1; 
        }
    }
`;
document.head.appendChild(style);

/**
 * Contador de Carrinho
 */
let cartCount = 0;

function updateCartCount() {
    cartCount++;
    const cartElements = document.querySelectorAll('.cart-count');
    cartElements.forEach(el => {
        el.textContent = cartCount;
        el.style.animation = 'bounce 0.3s';
        setTimeout(() => {
            el.style.animation = '';
        }, 300);
    });
}

// Animação bounce para carrinho
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(bounceStyle);

// Adicionar aos favoritos
function toggleWishlist(btn) {
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        btn.innerHTML = '♥ Adicionado aos Favoritos';
        btn.style.background = '#e74c3c';
        btn.style.color = 'white';
        btn.style.borderColor = '#e74c3c';
        showNotification('Adicionado aos favoritos!');
    } else {
        btn.innerHTML = '♡ Adicionar aos Favoritos';
        btn.style.background = '#f8fafc';
        btn.style.color = '#4a5568';
        btn.style.borderColor = '#e2e8f0';
    }
}

// Inicializar botão de favoritos
const wishlistBtn = document.querySelector('.btn-wishlist');
if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function() {
        toggleWishlist(this);
    });
}

// Formulário de newsletter
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            showNotification('Cadastro realizado! Bem-vindo à EbookStore!');
            this.reset();
        }
    });
}

// Efeito parallax suave no hero
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    }
});

// Lazy loading para imagens
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.onload = () => {
                    img.style.transition = 'opacity 0.5s';
                    img.style.opacity = '1';
                };
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('.ebook-cover img').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * FILTROS DE CATEGORIA - VERSÃO CORRIGIDA
 */
function initCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            
            // Atualizar botão ativo
            categoryBtns.forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Filtrar ebooks
            filterEbooksByCategory(category);
            
            // Rolagem suave para a seção
            const bestsellersSection = document.getElementById('bestsellers');
            if (bestsellersSection) {
                bestsellersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function filterEbooksByCategory(category) {
    const allCards = document.querySelectorAll('.ebook-card');
    
    allCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
            return;
        }
        
        // Verificar pelo atributo data-category
        const cardCategories = card.dataset.category || '';
        const cardClasses = card.className || '';
        
        let shouldShow = false;
        
        switch(category) {
            case 'bestsellers':
                shouldShow = cardCategories.includes('bestsellers') || cardClasses.includes('bestseller');
                break;
            case 'masculino':
                shouldShow = cardCategories.includes('masculino') || cardClasses.includes('masculino');
                break;
            case 'feminino':
                shouldShow = cardCategories.includes('feminino') || cardClasses.includes('feminino');
                break;
            case 'top-rated':
                shouldShow = cardClasses.includes('top-rated');
                break;
            default:
                shouldShow = true;
        }
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Atualizar título da seção
    const sectionTitle = document.querySelector('#bestsellers .section-header h2');
    const sectionDesc = document.querySelector('#bestsellers .section-header p');
    if (sectionTitle) {
        const titles = {
            'all': '📚 Todos os Ebooks',
            'bestsellers': '🔥 Mais Vendidos',
            'masculino': '👔 Ebooks Masculinos',
            'feminino': '💄 Ebooks Femininos',
            'top-rated': '⭐ Top Avaliados'
        };
        sectionTitle.textContent = titles[category] || '📚 Todos os Ebooks';
    }
    if (sectionDesc) {
        const descriptions = {
            'all': 'Escolha entre nossa coleção premium de ebooks',
            'bestsellers': 'Os ebooks mais populares do momento',
            'masculino': 'Desenvolvimento pessoal, carreira e relacionamentos',
            'feminino': 'Empoderamento, bem-estar e realização pessoal',
            'top-rated': 'Os ebooks melhor avaliados pelos leitores'
        };
        sectionDesc.textContent = descriptions[category] || 'Escolha entre nossa coleção premium de ebooks';
    }
}
