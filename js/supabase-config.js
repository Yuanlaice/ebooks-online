/**
 * SUPABASE CONFIGURATION
 * Configuração do cliente Supabase para EbookStore
 */

// Substitua estas variáveis pelas credenciais do seu projeto Supabase
const SUPABASE_URL = 'https://atgtajnsubisvkpbvoej.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DCqJcSjpvYFykhf8qc05YQ_60PeP70l';

// Inicializar cliente Supabase
let supabase;

try {
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase conectado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao conectar Supabase:', error);
}

// Funções auxiliares para operações comuns

/**
 * Buscar todos os ebooks
 */
async function fetchEbooks() {
    try {
        const { data, error } = await supabase
            .from('ebooks')
            .select('*');
        
        if (error) throw error;
        return { success: true, ebooks: data };
    } catch (error) {
        console.error('Erro ao buscar ebooks:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Buscar ebook por ID com avaliações
 */
async function fetchEbookById(id) {
    try {
        const { data: ebook, error: ebookError } = await supabase
            .from('ebooks')
            .select('*')
            .eq('id', id)
            .single();
        
        if (ebookError) throw ebookError;

        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('ebook_id', id)
            .eq('is_verified', true);

        return { 
            success: true, 
            ebook, 
            reviews: reviews || [] 
        };
    } catch (error) {
        console.error('Erro ao buscar ebook:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Criar novo pedido
 */
async function createOrder(orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer_name: orderData.customer_name,
                email: orderData.email,
                ebook_id: orderData.ebook_id,
                price: orderData.price,
                status: 'pending',
                payment_method: orderData.payment_method,
                download_token: generateToken(),
                order_date: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, order: data };
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Confirmar pagamento do pedido
 */
async function confirmPayment(orderId, paymentData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                payment_date: new Date().toISOString(),
                transaction_id: paymentData.transaction_id
            })
            .eq('id', orderId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, order: data };
    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enviar avaliação
 */
async function submitReview(reviewData) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                ebook_id: reviewData.ebook_id,
                customer_name: reviewData.customer_name,
                email: reviewData.email,
                rating: reviewData.rating,
                comment: reviewData.comment,
                is_verified: false,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, review: data };
    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cadastrar na newsletter
 */
async function subscribeNewsletter(email, name = '') {
    try {
        // Verificar se email já existe
        const { data: existing } = await supabase
            .from('newsletter')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return { success: false, already_subscribed: true };
        }

        const { data, error } = await supabase
            .from('newsletter')
            .insert([{
                email,
                name,
                is_active: true,
                subscribed_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, subscriber: data };
    } catch (error) {
        console.error('Erro ao cadastrar newsletter:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gerar token aleatório
 */
function generateToken() {
    return Math.random().toString(36).substring(2) + 
           Date.now().toString(36) + 
           Math.random().toString(36).substring(2);
}

// Exportar funções para uso global
window.supabaseClient = {
    fetchEbooks,
    fetchEbookById,
    createOrder,
    confirmPayment,
    submitReview,
    subscribeNewsletter
};
