
import { supabase } from './supabase';
import type { Product, User, Review, Transaction, Conversation, Message, Order, Report } from '../types';
import { ProductStatus, OrderStatus, TransactionType, TransactionStatus, ReportStatus } from '../types';

// Utility to convert Supabase row to our app types
const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    avatarUrl: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/100/100`,
    city: profile.city || 'Inconnue',
    rating: Number(profile.rating) || 0,
    reviews: profile.reviews || 0,
    memberSince: new Date(profile.member_since).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    isAdmin: profile.is_admin,
    balance: Number(profile.balance) || 0,
    isPro: profile.is_pro,
    proSubscriptionExpires: profile.pro_subscription_expires,
    isBanned: profile.is_banned
});

const mapProductToApp = (p: any): Product => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category as any,
    condition: p.condition as any,
    size: p.size,
    city: p.city,
    images: p.images || [],
    seller: p.profiles ? mapProfileToUser(p.profiles) : (p.seller ? mapProfileToUser(p.seller) : {} as User),
    status: p.status as ProductStatus,
    isFeatured: p.is_featured,
    boostedUntil: p.boosted_until
});

const mapReportToApp = (r: any): Report => ({
    id: r.id,
    product: mapProductToApp(r.product),
    reporter: mapProfileToUser(r.reporter),
    reason: r.reason,
    details: r.details,
    status: r.status as ReportStatus,
    createdAt: r.created_at
});

const api = {
    // SETTINGS API
    getSettings: async <T>(key: 'app_settings' | 'app_content'): Promise<T> => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single();
        if (error) throw error;
        return data.value;
    },

    updateSettings: async (key: 'app_settings' | 'app_content', value: any): Promise<void> => {
        const { error } = await supabase
            .from('site_settings')
            .update({ value })
            .eq('key', key);
        if (error) throw error;
    },

    // STORAGE API
    uploadImage: async (file: File, folder: string = 'products'): Promise<string> => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id || 'anonymous';
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(folder)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(folder)
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // PRODUCT API
    getProducts: async (): Promise<Product[]> => {
        const { data, error } = await supabase
            .from('products')
            .select('*, profiles(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapProductToApp);
    },

    addProduct: async (productData: Omit<Product, 'id' | 'seller' | 'status'>, sellerId: string): Promise<Product> => {
        const { data, error } = await supabase
            .from('products')
            .insert({
                title: productData.title,
                description: productData.description,
                price: productData.price,
                original_price: productData.originalPrice,
                category: productData.category,
                condition: productData.condition,
                size: productData.size,
                city: productData.city,
                images: productData.images,
                seller_id: sellerId,
                status: ProductStatus.Pending
            })
            .select('*, profiles(*)')
            .single();

        if (error) throw error;
        return mapProductToApp(data);
    },

    updateProduct: async (product: Product): Promise<Product> => {
        const { data, error } = await supabase
            .from('products')
            .update({
                title: product.title,
                description: product.description,
                price: product.price,
                original_price: product.originalPrice,
                category: product.category,
                condition: product.condition,
                size: product.size,
                city: product.city,
                images: product.images,
                status: product.status,
                is_featured: product.isFeatured,
                boosted_until: product.boostedUntil
            })
            .eq('id', product.id)
            .select('*, profiles(*)')
            .single();

        if (error) throw error;
        return mapProductToApp(data);
    },

    deleteProduct: async (productId: string): Promise<void> => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        if (error) throw error;
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;
        return (data || []).map(mapProfileToUser);
    },

    updateProfile: async (userId: string, updates: Partial<any>): Promise<User> => {
        // Map camelCase to snake_case if necessary, profile fields are snake_case in DB
        const dbUpdates: any = {};
        if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.city) dbUpdates.city = updates.city;
        if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
        if (updates.isPro !== undefined) dbUpdates.is_pro = updates.isPro;
        if (updates.proSubscriptionExpires) dbUpdates.pro_subscription_expires = updates.proSubscriptionExpires;
        if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;

        const { data, error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return mapProfileToUser(data);
    },

    // AUTH API
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) return null;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) return null;
            return mapProfileToUser(profile);
        } catch (e) {
            return null;
        }
    },

    login: async (email: string, password: string): Promise<User> => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            if (authError.message === 'Invalid login credentials') {
                throw new Error("Email ou mot de passe incorrect.");
            }
            throw authError;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw new Error("Profil non trouvé. Veuillez contacter le support.");
        return mapProfileToUser(profile);
    },

    signup: async (name: string, email: string, password: string): Promise<User> => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (authError) {
            if (authError.message.includes('User already registered')) {
                throw new Error("Cet email est déjà utilisé.");
            }
            throw authError;
        }

        if (!authData.user) throw new Error("Erreur lors de la création du compte.");

        // Wait for profile trigger (Supabase is usually fast but sometimes needs a beat)
        let profile = null;
        for (let i = 0; i < 5; i++) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (data && !error) {
                profile = data;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!profile) throw new Error("Le profil n'a pas pu être créé. Essayez de vous connecter.");
        return mapProfileToUser(profile);
    },

    logout: async () => {
        await supabase.auth.signOut();
    },

    getOrders: async (): Promise<Order[]> => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, product:products(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(o => ({
            id: o.id,
            product: mapProductToApp(o.product),
            buyer: mapProfileToUser(o.buyer),
            seller: mapProfileToUser(o.seller),
            status: o.status as OrderStatus,
            totalAmount: Number(o.total_amount),
            shippingFee: Number(o.shipping_fee),
            buyerProtectionFee: Number(o.buyer_protection_fee),
            createdAt: o.created_at,
            updatedAt: o.updated_at
        }));
    },

    createOrder: async (product: Product, buyer: User, buyerProtectionFee: number, shippingFee: number, totalAmount: number): Promise<Order> => {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                product_id: product.id,
                buyer_id: buyer.id,
                seller_id: product.seller.id,
                total_amount: totalAmount,
                shipping_fee: shippingFee,
                buyer_protection_fee: buyerProtectionFee,
                status: OrderStatus.Paid
            })
            .select('*, product:products(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
            .single();

        if (error) throw error;

        await supabase
            .from('products')
            .update({ status: ProductStatus.Sold })
            .eq('id', product.id);

        return {
            id: data.id,
            product: mapProductToApp(data.product),
            buyer: mapProfileToUser(data.buyer),
            seller: mapProfileToUser(data.seller),
            status: data.status as OrderStatus,
            totalAmount: Number(data.total_amount),
            shippingFee: Number(data.shipping_fee),
            buyerProtectionFee: Number(data.buyer_protection_fee),
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    // Transaction History (Simulation/Read from Orders for now or separate table if needs complex accounting)
    getTransactions: async (): Promise<Transaction[]> => {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, product:products!inner(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const txs: Transaction[] = [];
        (orders || []).forEach(o => {
            // Sale transaction for seller
            txs.push({
                id: `sale-${o.id}`,
                date: o.created_at,
                user: mapProfileToUser(o.seller),
                type: TransactionType.Sale,
                product: mapProductToApp(o.product),
                amount: Number(o.product.price),
                status: TransactionStatus.Completed
            });
            // Buyer Protection fee for buyer
            txs.push({
                id: `fee-${o.id}`,
                date: o.created_at,
                user: mapProfileToUser(o.buyer),
                type: TransactionType.BuyerProtection,
                product: mapProductToApp(o.product),
                amount: Number(o.buyer_protection_fee) + Number(o.shipping_fee),
                status: TransactionStatus.Completed
            });
        });
        return txs;
    },

    // CHAT API
    getConversationsForUser: async (userId: string): Promise<Conversation[]> => {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                product:products(*, profiles(*)),
                participants:conversation_participants(profiles(*)),
                messages(*)
            `)
            .order('last_message_timestamp', { ascending: false });

        if (error) throw error;

        return (data || []).map(c => ({
            id: c.id,
            product: mapProductToApp(c.product),
            participants: c.participants.map((p: any) => mapProfileToUser(p.profiles)),
            messages: (c.messages || []).map((m: any) => ({
                id: m.id,
                senderId: m.sender_id,
                text: m.text,
                timestamp: m.timestamp
            })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
            lastMessageTimestamp: c.last_message_timestamp
        }));
    },

    sendMessage: async (conversationId: string, text: string, senderId: string): Promise<Message> => {
        const { data, error } = await supabase
            .from('messages')
            .insert({ conversation_id: conversationId, sender_id: senderId, text })
            .select()
            .single();

        if (error) throw error;

        await supabase
            .from('conversations')
            .update({ last_message_timestamp: data.timestamp })
            .eq('id', conversationId);

        return {
            id: data.id,
            senderId: data.sender_id,
            text: data.text,
            timestamp: data.timestamp
        };
    },

    findOrCreateConversation: async (currentUser: User, recipient: User, product: Product): Promise<Conversation> => {
        const { data: existingConvs, error: findError } = await supabase
            .from('conversations')
            .select(`
                id,
                product_id,
                participants:conversation_participants!inner(user_id)
            `)
            .eq('product_id', product.id);

        if (findError) throw findError;

        const conversation = (existingConvs || []).find(c =>
            c.participants.some(p => p.user_id === currentUser.id) &&
            c.participants.some(p => p.user_id === recipient.id)
        );

        if (conversation) {
            const convs = await api.getConversationsForUser(currentUser.id);
            return convs.find(c => c.id === conversation.id)!;
        }

        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ product_id: product.id })
            .select()
            .single();

        if (createError) throw createError;

        await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConv.id, user_id: currentUser.id },
                { conversation_id: newConv.id, user_id: recipient.id }
            ]);

        const convs = await api.getConversationsForUser(currentUser.id);
        return convs.find(c => c.id === newConv.id)!;
    },

    // REPORTS API
    getReports: async (): Promise<Report[]> => {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                product:products(*, profiles(*)),
                reporter:profiles!reporter_id(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapReportToApp);
    },

    addReport: async (productId: string, reporterId: string, reason: string, details?: string): Promise<Report> => {
        const { data, error } = await supabase
            .from('reports')
            .insert({ product_id: productId, reporter_id: reporterId, reason, details })
            .select(`
                *,
                product:products(*, profiles(*)),
                reporter:profiles!reporter_id(*)
            `)
            .single();

        if (error) throw error;
        return mapReportToApp(data);
    },

    updateReportStatus: async (reportId: string, status: ReportStatus): Promise<Report> => {
        const { data, error } = await supabase
            .from('reports')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', reportId)
            .select(`
                *,
                product:products(*, profiles(*)),
                reporter:profiles!reporter_id(*)
            `)
            .single();

        if (error) throw error;
        return mapReportToApp(data);
    },

    toggleUserBan: async (userId: string, isBanned: boolean): Promise<User> => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ is_banned: isBanned })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return mapProfileToUser(data);
    }
};

export default api;
