'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Truck, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { formatDZD, formatDate } from '@/lib/utils';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';
import { Order } from '@/types';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const StatusIcon: Record<string, React.ReactNode> = {
    pending: <Clock size={14} />,
    confirmed: <CheckCircle size={14} />,
    shipped: <Truck size={14} />,
    delivered: <Package size={14} />,
    cancelled: <XCircle size={14} />,
};

export default function BuyerOrdersPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        if (user) {
            db.getOrders(user.id, 'buyer').then(setOrders).finally(() => setLoading(false));
        }
    }, [user]);

    const filtered = orders.filter(o => {
        if (tab === 'active') return !['delivered', 'completed', 'cancelled'].includes(o.status);
        if (tab === 'completed') return ['delivered', 'completed'].includes(o.status);
        return true;
    });

    const badgeClass: Record<string, string> = {
        pending: 'badge-orange', confirmed: 'badge-blue', shipped: 'badge-blue',
        delivered: 'badge-green', completed: 'badge-green', cancelled: 'badge-red',
    };
    const badgeLabel: Record<string, string> = {
        pending: 'En attente', confirmed: 'Confirmé', shipped: 'Expédié',
        delivered: 'Livré', completed: 'Terminé', cancelled: 'Annulé',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex' }}>
                <DashboardSidebar type="buyer" />
                <main style={{ flex: 1, padding: '28px 24px', maxWidth: '860px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>🛍️ Mes Commandes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Suivez l&apos;état de vos achats en temps réel</p>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
                        {(['all', 'active', 'completed'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', border: '1.5px solid', borderColor: tab === t ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', background: tab === t ? 'var(--primary-bg)' : 'white', color: tab === t ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t ? 600 : 400 }}>
                                {t === 'all' ? 'Toutes' : t === 'active' ? '⏳ En cours' : '✅ Terminées'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Aucune commande trouvée</p>
                            <Link href="/products" style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                                Commencer mes achats →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filtered.map(order => {
                                const stepIdx = STATUS_STEPS.indexOf(order.status);
                                return (
                                    <div key={order.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                        {/* Header */}
                                        <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {StatusIcon[order.status]}
                                                <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>#{order.order_number}</span>
                                                <span className={`badge ${badgeClass[order.status] ?? 'badge-gray'}`}>{badgeLabel[order.status] ?? order.status}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '16px' }}>{formatDZD(order.total_amount)}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Commandé le {formatDate(order.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Progress bar (not cancelled) */}
                                        {order.status !== 'cancelled' && stepIdx >= 0 && (
                                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                                    {STATUS_STEPS.map((s, i) => (
                                                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i <= stepIdx ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', transition: 'background 0.3s' }}>
                                                                    {i < stepIdx ? '✓' : i === stepIdx ? '●' : '○'}
                                                                </div>
                                                                <span style={{ fontSize: '10px', color: i <= stepIdx ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i === stepIdx ? 600 : 400, whiteSpace: 'nowrap' }}>
                                                                    {s === 'pending' ? 'Reçue' : s === 'confirmed' ? 'Confirmée' : s === 'shipped' ? 'Expédiée' : 'Livrée'}
                                                                </span>
                                                            </div>
                                                            {i < STATUS_STEPS.length - 1 && (
                                                                <div style={{ flex: 1, height: '2px', background: i < stepIdx ? 'var(--primary)' : 'var(--border)', margin: '0 4px', marginBottom: '16px', transition: 'background 0.3s' }} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div style={{ padding: '16px 20px' }}>
                                            {order.order_items?.map((item, i) => (
                                                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: i < (order.order_items?.length || 0) - 1 ? '12px' : 0 }}>
                                                    <Link href={`/products/${item.products?.slug}`}>
                                                        <img src={item.products?.images?.[0]} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                                                    </Link>
                                                    <div style={{ flex: 1 }}>
                                                        <Link href={`/products/${item.products?.slug}`} style={{ textDecoration: 'none' }}>
                                                            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{item.products?.title}</p>
                                                        </Link>
                                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Qté: {item.quantity} × {formatDZD(item.price_at_purchase)}</p>
                                                    </div>
                                                    <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px', flexShrink: 0 }}>{formatDZD(item.quantity * item.price_at_purchase)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', flexWrap: 'wrap', gap: '8px' }}>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {(order.shipping_address as any)?.city}, {(order.shipping_address as any)?.wilaya}</p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {order.status === 'delivered' && (
                                                    <Link href={`/orders/${order.id}/review`} style={{ padding: '7px 16px', background: 'var(--primary-bg)', color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                                                        ⭐ Laisser un avis
                                                    </Link>
                                                )}
                                                <Link href="/products" style={{ padding: '7px 16px', background: 'white', color: 'var(--text-secondary)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
                                                    🔄 Recommander
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
