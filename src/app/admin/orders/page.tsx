'use client';
import { useState, useEffect } from 'react';
import { Search, CheckCircle, Lock, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { getAdminOrders, releaseEscrow } from '@/lib/admin';
import { formatDZD, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminOrdersPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrders();
            setOrders(data as any);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRelease = async (id: string) => {
        if (!confirm('Libérer les fonds pour cette commande ?')) return;
        try {
            await releaseEscrow(id);
            await fetchOrders();
        } catch (err) {
            alert('Erreur lors de la libération');
        }
    };

    const filtered = orders.filter(o => {
        const buyerName = `${o.buyer?.first_name || ''} ${o.buyer?.last_name || ''}`;
        const matchSearch = !search ||
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            buyerName.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || o.status === filter;
        return matchSearch && matchFilter;
    });

    const STATUS_TABS = [
        { key: 'all', label: 'Toutes' },
        { key: 'pending', label: '⏳ En attente' },
        { key: 'confirmed', label: '✅ Confirmées' },
        { key: 'shipped', label: '🚚 Expédiées' },
        { key: 'delivered', label: '📦 Livrées' },
        { key: 'cancelled', label: '❌ Annulées' },
    ];

    const badgeClass: Record<string, string> = {
        pending: 'badge-orange', confirmed: 'badge-blue', shipped: 'badge-blue',
        delivered: 'badge-green', completed: 'badge-green', cancelled: 'badge-red',
    };
    const badgeLabel: Record<string, string> = {
        pending: 'En attente', confirmed: 'Confirmé', shipped: 'Expédié',
        delivered: 'Livré', completed: 'Terminé', cancelled: 'Annulé',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, padding: '28px', overflowX: 'auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>🛍️ Toutes les Commandes</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gestion des transactions et libération des fonds (Escrow)</p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {STATUS_TABS.map(t => (
                            <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: '7px 14px', border: '1.5px solid', borderColor: filter === t.key ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', background: filter === t.key ? 'var(--primary-bg)' : 'white', color: filter === t.key ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: filter === t.key ? 600 : 400, whiteSpace: 'nowrap' }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '320px', marginBottom: '20px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher N° commande, acheteur..." className="input-base" style={{ paddingLeft: '34px', fontSize: '13px' }} />
                    </div>

                    {/* Table */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '400px' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        {['N° Commande', 'Acheteur', 'Vendeur', 'Montant', 'Statut', 'Date', 'Escrow'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(order => {
                                        const escrowReleased = order.escrow_released;
                                        const canRelease = order.status === 'delivered' && !escrowReleased;
                                        return (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>#{order.order_number}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <p style={{ fontWeight: 600 }}>{order.buyer?.first_name} {order.buyer?.last_name}</p>
                                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.buyer?.email}</p>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <p style={{ fontWeight: 600 }}>{order.seller?.first_name} {order.seller?.last_name}</p>
                                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.seller?.business_name}</p>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatDZD(order.total_amount)}</span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span className={`badge ${badgeClass[order.status] ?? 'badge-gray'}`}>
                                                        {badgeLabel[order.status] ?? order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                    {formatDate(order.created_at)}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {escrowReleased ? (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>
                                                            <CheckCircle size={13} /> Libéré
                                                        </span>
                                                    ) : canRelease ? (
                                                        <button onClick={() => handleRelease(order.id)} style={{ padding: '5px 10px', background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                                            <CheckCircle size={11} /> Libérer
                                                        </button>
                                                    ) : (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                            <Lock size={11} /> Bloqué
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                        {!loading && filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Aucune commande trouvée</div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
