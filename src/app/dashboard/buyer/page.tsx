'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Star, Package, Loader2, DollarSign } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';
import { formatDZD, formatDate } from '@/lib/utils';
import { Order, Product } from '@/types';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ReviewModal from '@/components/modals/ReviewModal';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';

export default function BuyerDashboardPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewCount, setReviewCount] = useState(0);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [ordersData, productsData, revCount] = await Promise.all([
                    db.getOrders(user.id, 'buyer'),
                    db.getFavorites(user.id),
                    db.getReviewCount(user.id)
                ]);
                setOrders(ordersData);
                setFavorites(productsData);
                setReviewCount(revCount);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
    );

    const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <DashboardSidebar type="buyer" />
            <main style={{ flex: 1 }}>
                <DashboardHeader title="Tableau de bord Acheteur" />
                <div style={{ padding: '28px 24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Bonjour, {user?.firstName} 👋</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>Bienvenue dans votre espace acheteur</p>

                    <SubscriptionStatus />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                        {[
                            { label: 'Dépenses totales', value: formatDZD(totalSpent), icon: <DollarSign size={20} />, color: 'var(--primary)', bg: 'var(--primary-bg)' },
                            { label: 'Commandes totales', value: String(orders.length), icon: <ShoppingBag size={20} />, color: 'var(--accent)', bg: 'var(--accent-bg)' },
                            { label: 'Favoris sauvegardés', value: String(favorites.length), icon: <Heart size={20} />, color: '#ef4444', bg: '#fef2f2' },
                            { label: 'Avis laissés', value: String(reviewCount), icon: <Star size={20} />, color: '#f59e0b', bg: '#fffbeb' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                                <div style={{ width: '40px', height: '40px', background: s.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '12px' }}>{s.icon}</div>
                                <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.value}</p>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Recent orders */}
                        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                <h2 style={{ fontWeight: 700, fontSize: '16px' }}>📦 Commandes récentes</h2>
                                <Link href="/dashboard/buyer/orders" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Voir tout →</Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {orders.slice(0, 4).map(o => (
                                    <div key={o.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '14px' }}>#{o.order_number}</p>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(o.created_at)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{formatDZD(o.total_amount)}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                                <span className={`badge ${o.status === 'delivered' ? 'badge-green' : 'badge-blue'}`}>{o.status === 'delivered' ? 'Livré' : 'En cours'}</span>
                                                {o.status === 'delivered' && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setSelectedOrderForReview(o); }}
                                                        style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                                    >
                                                        Noter
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Pas encore de commandes</p>
                                )}
                            </div>
                        </div>

                        {/* Favorites */}
                        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                <h2 style={{ fontWeight: 700, fontSize: '16px' }}>❤️ Mes Favoris</h2>
                                <Link href="/products" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Explorer →</Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {favorites.slice(0, 4).map(p => (
                                    <Link key={p.id} href={`/products/${p.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit' }}>
                                        {p.images && p.images[0] ? (
                                            <img src={p.images[0]} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                        ) : (
                                            <div style={{ width: '44px', height: '44px', background: '#e2e8f0', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} /></div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDZD(p.price_retail)}</p>
                                        </div>
                                        <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                    </Link>
                                ))}
                                {favorites.length === 0 && (
                                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Aucun favori</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedOrderForReview && (
                    <ReviewModal
                        isOpen={!!selectedOrderForReview}
                        onClose={() => setSelectedOrderForReview(null)}
                        orderId={selectedOrderForReview.id}
                        productId={selectedOrderForReview.order_items?.[0]?.product_id || ''}
                        sellerId={selectedOrderForReview.seller_id}
                        onSuccess={() => {
                            // Refresh review count or stats if needed
                        }}
                    />
                )}
            </main>
        </div>
    );
}
