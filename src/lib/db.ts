import { supabase } from './supabase';
import { Category, Product, Profile, Order, Trip } from '@/types';

const logError = (context: string, error: any) => {
    console.error(`DB Error [${context}]:`, error.message || error);
    if (error.details) console.error(`Details:`, error.details);
    if (error.hint) console.error(`Hint:`, error.hint);
};

export const db = {
    // Categories
    getCategories: async (): Promise<Category[]> => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            if (error) {
                logError('getCategories', error);
                throw error;
            }
            if (!data) return [];

            // Fetch product counts per category (active products only)
            const categoriesTotalCounts = await Promise.all(
                data.map(async (cat) => {
                    try {
                        const { count, error } = await supabase
                            .from('products')
                            .select('*', { count: 'exact', head: true })
                            .eq('category_id', cat.id)
                            .eq('status', 'active');
                        if (error) throw error;
                        return { ...cat, count: count || 0 };
                    } catch (err) {
                        console.warn(`Could not fetch count for category ${cat.name}:`, err);
                        return { ...cat, count: 0 };
                    }
                })
            );
            return categoriesTotalCounts;
        } catch (err) {
            console.error('Fetch Categories failed:', err);
            throw err;
        }
    },

    // Products
    getProducts: async (filters?: {
        categorySlug?: string;
        category_id?: string;
        sellerId?: string;
        search?: string;
        status?: string;
        limit?: number;
    }): Promise<Product[]> => {
        let query = supabase
            .from('products')
            .select('*, profiles(*), categories(*)')
            .order('created_at', { ascending: false });

        // categorySlug: resolve slug → id first (can't filter on joined column in PostgREST)
        if (filters?.categorySlug) {
            const { data: cat } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', filters.categorySlug)
                .single();
            if (cat?.id) query = query.eq('category_id', cat.id);
        }
        if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id);
        }
        if (filters?.sellerId) {
            query = query.eq('seller_id', filters.sellerId);
        }
        if (filters?.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }
        // 'all' = no status filter (seller/admin seeing everything)
        // no status + no sellerId = public pages → active only
        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        } else if (!filters?.status && !filters?.sellerId) {
            query = query.eq('status', 'active');
        }
        // if sellerId provided with no status / 'all' → no filter, seller sees their own products

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getProductBySlug: async (slug: string): Promise<Product> => {
        const { data, error } = await supabase
            .from('products')
            .select('*, profiles(*), categories(*)')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return data;
    },

    // Profiles / Sellers
    getSellers: async (limit?: number): Promise<Profile[]> => {
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('user_type', 'seller')
            .eq('status', 'active')
            .eq('anae_verified', true);

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    getProfile: async (id: string): Promise<Profile> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    getEarlyAdopterStats: async (): Promise<{ sellers: number; buyers: number }> => {
        const [
            { count: sellers },
            { count: buyers }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'early_adopter').eq('user_type', 'seller'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'early_adopter').eq('user_type', 'buyer'),
        ]);

        return {
            sellers: sellers || 0,
            buyers: buyers || 0
        };
    },

    // Trips
    getTrips: async (sellerId?: string): Promise<Trip[]> => {
        let query = supabase.from('trips').select('*, profiles(*)');
        if (sellerId) {
            query = query.eq('seller_id', sellerId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    // Orders
    getOrders: async (userId: string, type: 'buyer' | 'seller'): Promise<Order[]> => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                buyer:profiles!orders_buyer_id_fkey(*),
                seller:profiles!orders_seller_id_fkey(*),
                order_items(*, products(*))
            `)
            .eq(type === 'buyer' ? 'buyer_id' : 'seller_id', userId);
        if (error) throw error;
        return data || [];
    },

    getAllOrders: async (): Promise<Order[]> => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                buyer:profiles!orders_buyer_id_fkey(*),
                seller:profiles!orders_seller_id_fkey(*),
                order_items(*, products(*))
            `);
        if (error) throw error;
        return data || [];
    },

    // Reviews
    getReviews: async (productId: string): Promise<any[]> => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles!reviews_author_id_fkey(*)')
            .eq('product_id', productId);
        if (error) throw error;
        return data || [];
    },

    // Favorites
    getFavorites: async (userId: string): Promise<Product[]> => {
        const { data, error } = await supabase
            .from('favorites')
            .select('*, products(*, profiles(*), categories(*))')
            .eq('user_id', userId);
        if (error) throw error;
        return (data || []).map(f => f.products).filter(Boolean) as Product[];
    },

    // Stats
    getReviewCount: async (userId: string): Promise<number> => {
        const { count, error } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userId);
        if (error) throw error;
        return count || 0;
    },

    leaveReview: async (review: {
        order_id: string;
        product_id: string;
        author_id: string;
        target_id: string;
        rating: number;
        comment?: string;
    }): Promise<void> => {
        const { error } = await supabase
            .from('reviews')
            .insert(review);
        if (error) throw error;
    },

    createProduct: async (product: any): Promise<Product> => {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    createTrip: async (trip: any): Promise<Trip> => {
        const { data, error } = await supabase
            .from('trips')
            .insert(trip)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    createOrder: async (order: any, items: any[]): Promise<Order> => {
        // Step 1: Create the order
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert(order)
            .select()
            .single();
        if (orderError) throw orderError;

        // Step 2: Create order items
        const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            title_at_purchase: item.title_at_purchase
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
        if (itemsError) throw itemsError;

        return orderData;
    },

    toggleFavorite: async (productId: string, userId: string): Promise<boolean> => {
        // Check if already favorited
        const { data: existing, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('product_id', productId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            // Unfavorite
            await supabase
                .from('favorites')
                .delete()
                .eq('product_id', productId)
                .eq('user_id', userId);
            return false;
        } else {
            // Favorite
            await supabase
                .from('favorites')
                .insert({ product_id: productId, user_id: userId });
            return true;
        }
    },

    getAllProducts: async (): Promise<Product[]> => {
        const { data, error } = await supabase
            .from('products')
            .select('*, profiles(*), categories(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    updateProductStatus: async (id: string, status: Product['status']): Promise<void> => {
        const { error } = await supabase
            .from('products')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    },

    updateOrderStatus: async (id: string, status: Order['status']): Promise<void> => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    },

    getSearchSuggestions: async (query: string): Promise<{ type: 'product' | 'seller' | 'category'; label: string; slug?: string; id?: string }[]> => {
        if (!query || query.trim().length < 2) return [];

        console.log(`Searching suggestions for: "${query}"`);
        try {
            // Search Products
            const { data: products } = await supabase
                .from('products')
                .select('title, slug')
                .ilike('title', `%${query}%`)
                .eq('status', 'active')
                .limit(4);

            // Search Sellers
            const { data: sellers } = await supabase
                .from('profiles')
                .select('firstName:first_name, lastName:last_name, businessName:business_name, id')
                .eq('user_type', 'seller')
                .eq('status', 'active')
                .eq('anae_verified', true)
                .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,business_name.ilike.%${query}%`)
                .limit(3);

            // Search Categories
            const { data: categories } = await supabase
                .from('categories')
                .select('name, slug')
                .ilike('name', `%${query}%`)
                .limit(3);

            const results: any[] = [];

            categories?.forEach(c => results.push({ type: 'category', label: c.name, slug: c.slug }));
            products?.forEach(p => results.push({ type: 'product', label: p.title, slug: p.slug }));
            sellers?.forEach(s => results.push({ type: 'seller', label: s.businessName || `${s.firstName} ${s.lastName}`, id: s.id }));

            return results;
        } catch (err) {
            console.error('Fetch Suggestions failed:', err);
            return [];
        }
    },

    // Pre-Orders
    createPreOrder: async (data: {
        trip_id: string;
        buyer_id: string;
        seller_id: string;
        product_description: string;
        quantity: number;
        target_price?: number;
        notes?: string;
    }) => {
        const { data: result, error } = await supabase
            .from('pre_orders')
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return result;
    },

    getPreOrdersForTrip: async (tripId: string) => {
        const { data, error } = await supabase
            .from('pre_orders')
            .select('*, buyer:buyer_id(id, first_name, last_name, profile_photo, phone)')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    getBuyerPreOrders: async (buyerId: string) => {
        const { data, error } = await supabase
            .from('pre_orders')
            .select('*, trip:trip_id(id, destination_country, destination_city, flag, departure_date, seller_id, profiles(first_name, last_name, business_name))')
            .eq('buyer_id', buyerId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    updatePreOrderStatus: async (id: string, status: 'accepted' | 'declined', seller_response?: string) => {
        const { error } = await supabase
            .from('pre_orders')
            .update({ status, seller_response })
            .eq('id', id);
        if (error) throw error;
    },

    // ── Platform Settings ─────────────────────────────────────────────────────
    getPlatformSetting: async (key: string): Promise<string | null> => {
        const { data, error } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', key)
            .single();
        if (error) return null;
        return data?.value ?? null;
    },

    updatePlatformSetting: async (key: string, value: string) => {
        const { error } = await supabase
            .from('platform_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);
        if (error) throw error;
    },

    // ── Photo Requests ────────────────────────────────────────────────────────
    createPhotoRequest: async (data: {
        user_id: string;
        target_type: 'profile_photo' | 'cover_photo' | 'product_image';
        target_id?: string;
        description?: string;
        proposed_url?: string;
        path: 'self' | 'email';
    }) => {
        // PATH A (self) — user pasted a URL: auto-approve and apply immediately
        if (data.path === 'self' && data.proposed_url) {
            const url = data.proposed_url;

            // Apply directly
            if (data.target_type === 'product_image' && data.target_id) {
                const { data: product } = await supabase
                    .from('products')
                    .select('images')
                    .eq('id', data.target_id)
                    .single();
                const existing: string[] = product?.images || [];
                const { error: prodErr } = await supabase
                    .from('products')
                    .update({ images: [...existing.filter((i: string) => i !== url), url] })
                    .eq('id', data.target_id);
                if (prodErr) throw prodErr;
            } else {
                const { error: profErr } = await supabase
                    .from('profiles')
                    .update({ [data.target_type]: url })
                    .eq('id', data.user_id);
                if (profErr) throw profErr;
            }

            // Record as auto-approved (best-effort — if table doesn't exist yet, skip)
            try {
                const { error } = await supabase
                    .from('photo_requests')
                    .insert({ ...data, status: 'approved', last_applied_at: new Date().toISOString() })
                    .select()
                    .single();
                if (error) console.warn('Could not log photo request:', error.message);
            } catch { }

            return { status: 'approved', applied: true };
        }

        // PATH B (email) — user will send email, admin pastes URL later
        const { data: result, error } = await supabase
            .from('photo_requests')
            .insert({ ...data, status: 'pending_url' })
            .select()
            .single();
        if (error) throw error;
        return result;
    },

    getMyPhotoRequests: async (userId: string) => {
        const { data, error } = await supabase
            .from('photo_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    getAllPhotoRequests: async (statusFilter?: string) => {
        let query = supabase
            .from('photo_requests')
            .select('*, profiles:user_id(first_name, last_name, business_name, profile_photo, email)')
            .order('created_at', { ascending: false });
        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    approvePhotoRequest: async (id: string, url: string) => {
        // 1. Get the request details
        const { data: req, error: fetchErr } = await supabase
            .from('photo_requests')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchErr || !req) throw fetchErr || new Error('Request not found');

        // 2. Apply the URL to the correct target
        if (req.target_type === 'product_image') {
            // Append URL to product images array
            const { data: product } = await supabase
                .from('products')
                .select('images')
                .eq('id', req.target_id)
                .single();
            const existingImages: string[] = product?.images || [];
            const { error: prodErr } = await supabase
                .from('products')
                .update({ images: [...existingImages.filter((i: string) => i !== url), url] })
                .eq('id', req.target_id);
            if (prodErr) throw prodErr;
        } else {
            // Apply to profile column: profile_photo or cover_photo
            const { error: profErr } = await supabase
                .from('profiles')
                .update({ [req.target_type]: url })
                .eq('id', req.user_id);
            if (profErr) throw profErr;
        }

        // 3. Mark request as approved
        const { error: updateErr } = await supabase
            .from('photo_requests')
            .update({ status: 'approved', proposed_url: url, last_applied_at: new Date().toISOString() })
            .eq('id', id);
        if (updateErr) throw updateErr;
    },

    rejectPhotoRequest: async (id: string, admin_note?: string) => {
        const { error } = await supabase
            .from('photo_requests')
            .update({ status: 'rejected', admin_note })
            .eq('id', id);
        if (error) throw error;
    },

    canChangeProductImages: async (productId: string): Promise<{ allowed: boolean; nextAllowed: Date | null }> => {
        const { data } = await supabase
            .from('photo_requests')
            .select('last_applied_at')
            .eq('target_id', productId)
            .eq('target_type', 'product_image')
            .eq('status', 'approved')
            .order('last_applied_at', { ascending: false })
            .limit(1)
            .single();

        if (!data?.last_applied_at) return { allowed: true, nextAllowed: null };

        const lastChange = new Date(data.last_applied_at);
        const threeDaysLater = new Date(lastChange.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        return {
            allowed: now >= threeDaysLater,
            nextAllowed: now < threeDaysLater ? threeDaysLater : null,
        };
    },

    // ── MONETIZATION & LIMITS ────────────────────────────────────────────────
    checkUserLimits: async (userId: string, action: 'product' | 'trip' | 'chat'): Promise<{ allowed: boolean; reason?: string }> => {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', userId).single();
        if (!profile) return { allowed: false, reason: 'user_not_found' };

        // Pro and Early Adopters have unlimited everything
        if (profile.plan === 'pro' || profile.plan === 'early_adopter') {
            return { allowed: true };
        }

        // --- FREE PLAN LIMITS ---
        if (action === 'product') {
            // Free: max 5 published products
            const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'active');
            if ((count || 0) >= 5) return { allowed: false, reason: 'limit_reached_products' };
        }
        else if (action === 'trip') {
            // Free: 1 trip every 3 months
            const { data: lastTrip } = await supabase.from('trips').select('created_at').eq('seller_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();

            if (lastTrip) {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                const lastTripDate = new Date(lastTrip.created_at);

                if (lastTripDate > threeMonthsAgo) {
                    return { allowed: false, reason: 'limit_reached_trips' };
                }
            }
        }
        else if (action === 'chat') {
            // Free: max 10 initiated conversations
            // To keep it simple, we just count the total conversations they participate in right now.
            // Ideally we check total distinct chats.
            const { count } = await supabase.from('chats').select('*', { count: 'exact', head: true }).or(`user_a.eq.${userId},user_b.eq.${userId}`);
            if ((count || 0) >= 10) return { allowed: false, reason: 'limit_reached_chats' };
        }

        return { allowed: true };
    },

    submitSubscriptionPayment: async (data: { user_id: string; plan_requested: string; proof_image_url: string; amount_paid?: number }) => {
        const { error } = await supabase
            .from('subscription_payments')
            .insert(data);
        if (error) throw error;
    },

    getEarlyAdopterCount: async (type: 'seller' | 'buyer'): Promise<number> => {
        try {
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('user_type', type)
                .eq('plan', 'early_adopter');
            return count || 0;
        } catch {
            return 0;
        }
    },

    // --- Admin Subscription Management ---
    getPendingSubscriptions: async () => {
        const { data, error } = await supabase
            .from('subscription_payments')
            .select('*, profiles(*)')
            .eq('status', 'pending')
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    updateSubscriptionStatus: async (paymentId: string, status: 'approved' | 'rejected', userId: string, durationMonths: number = 1) => {
        // 1. Update the payment proof status
        const { error: paymentError } = await supabase
            .from('subscription_payments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', paymentId);
        if (paymentError) throw paymentError;

        // 2. If approved, upgrade the user's plan to pro and set expiration
        if (status === 'approved') {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    plan: 'pro',
                    plan_expires_at: expiresAt.toISOString()
                })
                .eq('id', userId);
            if (profileError) throw profileError;
        }
    }
};

