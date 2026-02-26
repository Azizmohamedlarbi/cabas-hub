import { supabase } from './supabase';

export async function getUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateUserType(id: string, userType: 'buyer' | 'seller' | 'admin') {
    const { error } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', id);

    if (error) throw error;
}

export async function updateUserPlan(id: string, plan: 'free' | 'early_adopter' | 'pro', durationMonths?: number | null) {
    let expiresAt: string | null = null;

    if (plan !== 'free' && durationMonths && durationMonths > 0) {
        const date = new Date();
        date.setMonth(date.getMonth() + durationMonths);
        expiresAt = date.toISOString();
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            plan,
            plan_expires_at: expiresAt
        })
        .eq('id', id);

    if (error) throw error;
}

export async function updateUserFounderStatus(id: string, isFounder: boolean) {
    const { error } = await supabase
        .from('profiles')
        .update({ is_founder: isFounder })
        .eq('id', id);

    if (error) throw error;
}

export async function verifySeller(id: string) {
    console.log('Attempting to verify seller:', id);
    const { data, error, status, statusText } = await supabase
        .from('profiles')
        .update({
            anae_verified: true
        })
        .eq('id', id)
        .select();

    console.log('Verify Seller Response:', { data, error, status, statusText });

    if (error) throw error;
    if (!data || data.length === 0) {
        throw new Error('Update failed: Aucun changement effectué. Vérifiez vos permissions RLS.');
    }
}

export async function updateProfileStatus(id: string, status: 'active' | 'suspended') {
    const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function getAdminProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateProductStatus(id: string, status: string) {
    const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function getAdminOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            buyer:profiles!orders_buyer_id_fkey(*),
            seller:profiles!orders_seller_id_fkey(*),
            order_items(*)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function releaseEscrow(orderId: string) {
    const { error } = await supabase
        .from('orders')
        .update({ escrow_released: true })
        .eq('id', orderId);

    if (error) throw error;
}

export async function getAdminTrips() {
    const { data, error } = await supabase
        .from('trips')
        .select('*, profiles:seller_id(*)')
        .order('departure_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getPlatformStats() {
    const [
        { count: userCount },
        { count: productCount },
        { count: orderCount },
        { data: revenueData }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('status', 'delivered')
    ]);

    const totalRevenue = (revenueData || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

    return {
        userCount: userCount || 0,
        productCount: productCount || 0,
        orderCount: orderCount || 0,
        totalRevenue
    };
}
