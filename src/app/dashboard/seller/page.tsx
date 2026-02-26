'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, TrendingUp, Users, Plus, LayoutDashboard, MessageSquare, Briefcase, Settings, LogOut, Loader2, DollarSign, Star, ShieldCheck, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';
import { formatDZD, formatDate } from '@/lib/utils';
import { Order, Product } from '@/types';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PendingVerification from '@/components/dashboard/PendingVerification';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';

// DashboardSidebar moved to @/components/layout/DashboardSidebar

function OrderBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        pending: { label: 'En attente', cls: 'badge-orange' },
        confirmed: { label: 'Confirmé', cls: 'badge-blue' },
        shipped: { label: 'Expédié', cls: 'badge-blue' },
        delivered: { label: 'Livré', cls: 'badge-green' },
        completed: { label: 'Terminé', cls: 'badge-green' },
        cancelled: { label: 'Annulé', cls: 'badge-red' },
    };
    const m = map[status] ?? { label: status, cls: 'badge-gray' };
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

export default function SellerDashboardPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [ordersData, productsData] = await Promise.all([
                    db.getOrders(user.id, 'seller'),
                    db.getProducts({ sellerId: user.id, status: 'all' })
                ]);
                setOrders(ordersData);
                setProducts(productsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Debug Hook (Must be above any early returns)
    useEffect(() => {
        if (user) {
            console.log('Seller Gate Check:', {
                id: user.id,
                type: user.userType,
                anaeVerified: user.anaeVerified,
                isVerified: !!user.anaeVerified
            });
        }
    }, [user]);

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
    );

    const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);

    const stats = [
        { label: 'Chiffre d\'affaires', value: formatDZD(totalSales), icon: <DollarSign size={20} />, color: 'var(--primary)', bg: 'var(--primary-bg)' },
        { label: 'Commandes totales', value: String(orders.length), icon: <ShoppingBag size={20} />, color: 'var(--accent)', bg: 'var(--accent-bg)' },
        { label: 'Produits actifs', value: String(products.filter(p => p.status === 'active').length), icon: <Package size={20} />, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Note moyenne', value: `${user?.ratingAverage?.toFixed(1) || '0.0'} ⭐`, icon: <Star size={20} />, color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <>
            <DashboardHeader title="Tableau de bord Vendeur" />
            <div style={{ padding: '28px 24px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Bonjour, {user?.firstName} 👋</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gérez votre boutique et vos commandes</p>
                    </div>
                    <Link href="/dashboard/seller/products/new" className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Ajouter un produit
                    </Link>
                </header>

                {/* Abonnement Suivi */}
                <SubscriptionStatus />

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    {stats.map(s => (
                        <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '12px' }}>{s.icon}</div>
                            <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.value}</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                    {/* Recent orders */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '16px' }}>📦 Commandes récentes</h2>
                            <Link href="/dashboard/seller/orders" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Voir tout →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {orders.slice(0, 4).map(order => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '14px' }}>#{order.order_number}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{formatDZD(order.total_amount)}</p>
                                        <OrderBadge status={order.status} />
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && (
                                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Aucune commande</p>
                            )}
                        </div>
                    </div>

                    {/* My products mini list */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '16px' }}>🛍️ Mes produits actifs</h2>
                            <Link href="/dashboard/seller/products" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Gérer →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {products.filter(p => p.status === 'active').slice(0, 4).map(p => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    {p.images && p.images[0] ? (
                                        <img src={p.images[0]} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                    ) : (
                                        <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} /></div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '13px' }}>{p.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stock: {p.quantity}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>{formatDZD(p.price_retail)}</p>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Aucun produit</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
