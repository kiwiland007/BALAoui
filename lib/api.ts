
import { supabase } from './supabase';
import type { Product, User, Review, Transaction, Conversation, Message, Order } from '../types';
import { ProductStatus, OrderStatus, TransactionType, TransactionStatus } from '../types';

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
    proSubscriptionExpires: profile.pro_subscription_expires
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

const api = {
    // STORAGE API
    uploadImage: async (file: File, userId: string): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('products')
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

    // AUTH API
    getCurrentUser: async (): Promise<User | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error) return null;
        return mapProfileToUser(profile);
    },

    login: async (email: string, password: string): Promise<User> => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;
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
        if (authError) throw authError;
        if (!authData.user) throw new Error("Erreur lors de la création du compte.");

        // Wait for profile trigger
        await new Promise(r => setTimeout(r, 1000));

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;
        return mapProfileToUser(profile);
    },

    logout: async () => {
        await supabase.auth.signOut();
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
    }
};

export default api;
