export type UserType = 'buyer' | 'seller' | 'admin';

export interface Profile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    business_name?: string;
    user_type: UserType;
    phone?: string;
    address_city?: string;
    address_wilaya?: string;
    bio?: string;
    plan: 'free' | 'early_adopter' | 'pro';
    is_founder: boolean;
    plan_expires_at?: string;
    anae_verified: boolean;
    rating_average: number;
    rating_count: number;
    total_sales: number;
    profile_photo?: string;
    cover_photo?: string;
    specialties?: string[];
    import_countries?: string[];
    status: 'active' | 'suspended';
    created_at: string;
}

export interface SubscriptionPayment {
    id: string;
    user_id: string;
    plan_requested: string;
    proof_image_url: string;
    amount_paid?: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    profiles?: Profile;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    count?: number;
    parent_id?: string | null;
}

export interface Product {
    id: string;
    seller_id: string;
    category_id: number;
    title: string;
    slug: string;
    description: string;
    price_wholesale?: number;
    price_retail: number;
    currency: string;
    quantity: number;
    min_order_quantity: number;
    origin_country: string;
    images: string[];
    specifications: Record<string, any>;
    wholesale_only: boolean;
    retail_only: boolean;
    negotiable: boolean;
    pre_order: boolean;
    shipping_included: boolean;
    shipping_cost: number;
    wilaya_coverage: string[];
    delivery_time: string;
    tags: string[];
    status: 'active' | 'pending' | 'rejected' | 'flagged';
    views: number;
    favorites_count: number;
    rating_average: number;
    rating_count: number;
    created_at: string;
    profiles?: Profile; // Joined seller
    categories?: Category; // Joined category
}

export interface Order {
    id: string;
    order_number: string;
    buyer_id: string;
    seller_id: string;
    total_amount: number;
    payment_method: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address: any;
    escrow_released: boolean;
    created_at: string;
    buyer?: Profile;
    seller?: Profile;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    title_at_purchase: string;
    products?: Product;
}

export interface Trip {
    id: string;
    seller_id: string;
    destination_country: string;
    destination_city: string;
    flag: string;
    departure_date: string;
    return_date?: string;
    budget_available?: number;
    accept_pre_orders: boolean;
    pre_orders_count: number;
    notes?: string;
    status: 'upcoming' | 'ongoing' | 'completed';
    profiles?: Profile;
}

export interface Review {
    id: string;
    order_id?: string;
    product_id?: string;
    author_id: string;
    target_id?: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: Profile; // Author
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    extract?: string;
    content: string;
    cover_image?: string;
    access_level: 'public' | 'registered' | 'premium';
    is_published: boolean;
    author_id?: string;
    created_at: string;
    updated_at: string;
    author?: Profile;
}
