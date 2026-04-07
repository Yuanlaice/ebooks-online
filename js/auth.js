/**
 * AUTHENTICATION SYSTEM
 * Sistema de login e cadastro com Supabase Auth
 */

// Verificar se supabase está inicializado
let authSupabase = window.supabaseClient || supabase;

// Estado do usuário
let currentUser = null;

/**
 * INICIALIZAR AUTH
 */
function initAuth() {
    console.log('🔐 Inicializando sistema de auth...');
    
    // Verificar sessão atual
    checkSession();
    
    // Atualizar UI baseado no estado de login
    updateAuthUI();
    
    // Adicionar listener para botões de auth
    addAuthListeners();
}

/**
 * VERIFICAR SESSÃO ATUAL
 */
async function checkSession() {
    try {
        const { data: { session }, error } = await authSupabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            console.log('✅ Usuário logado:', currentUser.email);
        } else {
            currentUser = null;
            console.log('ℹ️ Nenhum usuário logado');
        }
        
        updateAuthUI();
    } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
    }
}

/**
 * CADASTRAR USUÁRIO
 */
async function signUp(email, password, name) {
    try {
        console.log('📝 Cadastrando usuário:', email);
        
        const { data, error } = await authSupabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name
                }
            }
        });
        
        if (error) {
            console.error('❌ Erro no cadastro:', error);
            showNotification('Erro: ' + error.message, 'error');
            return false;
        }
        
        console.log('✅ Cadastro realizado:', data);
        showNotification('Cadastro realizado! Verifique seu email.', 'success');
        
        // Criar perfil do usuário na tabela profiles
        if (data.user) {
            await createUserProfile(data.user.id, name, email);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        showNotification('Erro ao cadastrar. Tente novamente.', 'error');
        return false;
    }
}

/**
 * FAZER LOGIN
 */
async function signIn(email, password) {
    try {
        console.log('🔑 Fazendo login:', email);
        
        const { data, error } = await authSupabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('❌ Erro no login:', error);
            showNotification('Email ou senha incorretos', 'error');
            return false;
        }
        
        currentUser = data.user;
        console.log('✅ Login realizado:', currentUser.email);
        showNotification('Login realizado com sucesso!', 'success');
        
        updateAuthUI();
        closeAuthModal();
        
        return true;
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
        return false;
    }
}

/**
 * FAZER LOGOUT
 */
async function signOut() {
    try {
        const { error } = await authSupabase.auth.signOut();
        
        if (error) {
            console.error('❌ Erro no logout:', error);
            return;
        }
        
        currentUser = null;
        console.log('✅ Logout realizado');
        showNotification('Logout realizado!', 'success');
        
        updateAuthUI();
    } catch (error) {
        console.error('❌ Erro no logout:', error);
    }
}

/**
 * CRIAR PERFIL DO USUÁRIO
 */
async function createUserProfile(userId, name, email) {
    try {
        const { error } = await authSupabase
            .from('profiles')
            .insert([
                {
                    id: userId,
                    full_name: name,
                    email: email,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            console.error('❌ Erro ao criar perfil:', error);
        } else {
            console.log('✅ Perfil criado');
        }
    } catch (error) {
        console.error('❌ Erro ao criar perfil:', error);
    }
}

/**
 * ATUALIZAR UI BASEADO NO ESTADO DE LOGIN
 */
function updateAuthUI() {
    const authContainer = document.querySelector('.auth-container');
    
    if (!authContainer) return;
    
    if (currentUser) {
        // Usuário logado
        const userName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0];
        
        authContainer.innerHTML = `
            <div class="user-menu">
                <span class="user-name">👤 ${userName}</span>
                <button class="btn-logout" onclick="signOut()">Sair</button>
            </div>
        `;
    } else {
        // Usuário não logado
        authContainer.innerHTML = `
            <button class="btn-auth" onclick="openAuthModal()">
                <span>🔐 Login / Cadastrar</span>
            </button>
        `;
    }
    
    // Atualizar formulário de avaliação se existir
    updateReviewForm();
}

/**
 * ABRIR MODAL DE AUTH
 */
function openAuthModal() {
    // Remover modal anterior se existir
    const existingModal = document.getElementById('modal-auth');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="modal-auth" class="modal auth-modal" style="display: flex; z-index: 10000;">
            <div class="modal-content auth-modal-content" style="max-width: 450px; width: 90%; background: white; border-radius: 16px; padding: 0; overflow: hidden; position: relative;">
                
                <div class="auth-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; position: relative;">
                    <button onclick="closeAuthModal()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
                    <h2 style="font-size: 1.5rem; margin-bottom: 5px;">🔐 Acesso</h2>
                    <p style="opacity: 0.9; font-size: 0.9rem;">Entre ou cadastre-se para avaliar ebooks</p>
                </div>
                
                <div class="auth-tabs" style="display: flex; border-bottom: 1px solid #e2e8f0;">
                    <button class="auth-tab active" data-tab="login" onclick="switchAuthTab('login')" style="flex: 1; padding: 15px; border: none; background: #667eea; color: white; font-weight: 600; cursor: pointer;">Login</button>
                    <button class="auth-tab" data-tab="signup" onclick="switchAuthTab('signup')" style="flex: 1; padding: 15px; border: none; background: white; color: #667eea; font-weight: 600; cursor: pointer;">Cadastro</button>
                </div>
                
                <div class="auth-body" style="padding: 30px;">
                    
                    <!-- Formulário de Login -->
                    <div id="auth-login" class="auth-form" style="display: block;">
                        <form onsubmit="handleLogin(event)">
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500;">Email</label>
                                <input type="email" id="login-email" required placeholder="seu@email.com"
                                    style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500;">Senha</label>
                                <input type="password" id="login-password" required placeholder="••••••••"
                                    style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-sizing: border-box;">
                            </div>
                            <button type="submit" 
                                style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                                Entrar
                            </button>
                        </form>
                    </div>
                    
                    <!-- Formulário de Cadastro -->
                    <div id="auth-signup" class="auth-form" style="display: none;">
                        <form onsubmit="handleSignUp(event)">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500;">Nome completo</label>
                                <input type="text" id="signup-name" required placeholder="Seu nome"
                                    style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500;">Email</label>
                                <input type="email" id="signup-email" required placeholder="seu@email.com"
                                    style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500;">Senha</label>
                                <input type="password" id="signup-password" required minlength="6" placeholder="Mínimo 6 caracteres"
                                    style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; box-sizing: border-box;">
                            </div>
                            <button type="submit" 
                                style="width: 100%; padding: 15px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                                Cadastrar
                            </button>
                        </form>
                    </div>
                    
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

/**
 * FECHAR MODAL DE AUTH
 */
function closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * TROCAR ABA DE AUTH
 */
function switchAuthTab(tab) {
    // Atualizar botões
    document.querySelectorAll('.auth-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
            btn.style.background = '#667eea';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'white';
            btn.style.color = '#667eea';
        }
    });
    
    // Mostrar formulário correto
    document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('auth-signup').style.display = tab === 'signup' ? 'block' : 'none';
}

/**
 * HANDLE LOGIN
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const success = await signIn(email, password);
    
    if (success) {
        // Recarregar a página para atualizar tudo
        window.location.reload();
    }
}

/**
 * HANDLE CADASTRO
 */
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const success = await signUp(email, password, name);
    
    if (success) {
        // Limpar formulário
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
        
        // Voltar para login
        switchAuthTab('login');
    }
}

/**
 * VERIFICAR SE USUÁRIO ESTÁ LOGADO
 */
function isLoggedIn() {
    return currentUser !== null;
}

/**
 * ATUALIZAR FORMULÁRIO DE AVALIAÇÃO
 * Mostra formulário se logado, ou mensagem de login se não
 */
function updateReviewForm() {
    const loginMessage = document.getElementById('login-required-message');
    const reviewForm = document.getElementById('review-form-content');
    
    if (!loginMessage || !reviewForm) return;
    
    if (currentUser) {
        // Usuário logado - mostrar formulário
        loginMessage.style.display = 'none';
        reviewForm.style.display = 'block';
    } else {
        // Usuário não logado - mostrar mensagem de login
        loginMessage.style.display = 'block';
        reviewForm.style.display = 'none';
    }
}

/**
 * OBTER USUÁRIO ATUAL
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * ADICIONAR LISTENERS
 */
function addAuthListeners() {
    // Listener para mudanças de auth
    authSupabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            updateAuthUI();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateAuthUI();
        }
    });
}

// Adicionar CSS para auth
function addAuthCSS() {
    if (document.getElementById('auth-css')) return;
    
    const css = `
        .auth-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .btn-auth {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 8px 16px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            color: white;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        
        .btn-auth:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .user-menu {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .user-name {
            color: white;
            font-size: 0.9rem;
        }
        
        .btn-logout {
            padding: 6px 12px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            color: white;
            cursor: pointer;
            font-size: 0.8rem;
        }
        
        .btn-logout:hover {
            background: rgba(229,62,62,0.8);
        }
        
        .auth-modal {
            background: rgba(0,0,0,0.8);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
        }
        
        @media (max-width: 480px) {
            .user-name {
                display: none;
            }
            
            .auth-modal-content {
                max-width: 95% !important;
                margin: 20px;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'auth-css';
    style.textContent = css;
    document.head.appendChild(style);
}

// Exportar funções globais
window.initAuth = initAuth;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleSignUp = handleSignUp;
window.signOut = signOut;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.updateReviewForm = updateReviewForm;

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    addAuthCSS();
    initAuth();
});

console.log('🔐 Sistema de autenticação carregado!');
