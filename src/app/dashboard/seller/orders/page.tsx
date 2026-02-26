'use client';
import { useState, useEffect } from 'react';
import { Package, Check, Truck, XCircle, Loader2, MessageSquare, Mail, Phone, User as UserIcon, MapPin } from 'lucide-react';
import { formatDZD, formatDate } from '@/lib/utils';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';
import { Order } from '@/types';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '@/lib/messages';

const STATUS_TABS = ['Tous', 'En attente', 'Confirmé', 'Expédié', 'Livré', 'Annulé'];
const STATUS_MAP: Record<string, string> = {
    'Tous': 'all', 'En attente': 'pending', 'Confirmé': 'confirmed',
    'Expédié': 'shipped', 'Livré': 'delivered', 'Annulé': 'cancelled',
};

export default function SellerOrdersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tous');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const data = await db.getOrders(user!.id, 'seller');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetStatus = async (orderId: string, status: Order['status']) => {
        setUpdatingId(orderId);
        try {
            await db.updateOrderStatus(orderId, status);
            await fetchOrders();
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut. Vérifiez vos permissions.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleContactBuyer = async (buyerId: string) => {
        if (!user) return;
        try {
            const convId = await getOrCreateConversation(user.id, buyerId);
            router.push(`/messages?conv=${convId}`);
        } catch (error: any) {
            console.group('Error Starting Conversation');
            console.error('Full Error Object:', error);
            console.error('Error Message:', error.message);
            console.error('Error Code:', error.code);
            console.groupEnd();
            alert(`Erreur: ${error.message || 'Impossible d’ouvrir la messagerie. Vérifiez votre console (F12).'}`);
        }
    };

    const filtered = orders.filter(o => {
        return STATUS_MAP[activeTab] === 'all' || o.status === STATUS_MAP[activeTab];
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
        <div style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>🛍️ Mes Commandes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{orders.length} commandes reçues au total</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)' }}>
                {STATUS_TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', border: '1.5px solid', borderColor: activeTab === tab ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', background: activeTab === tab ? 'var(--primary-bg)' : 'white', color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400, whiteSpace: 'nowrap' }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Aucune commande dans cette catégorie</p>
                        </div>
                    )}
                    {filtered.map(order => {
                        const buyer = order.buyer as any;
                        const shipping = order.shipping_address as any;

                        return (
                            <div key={order.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.2s' }}>
                                {/* Order Header */}
                                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', borderTop: `4px solid ${order.status === 'pending' ? '#f59e0b' : 'var(--primary)'}` }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>Commande #{order.order_number}</span>
                                            <span className={`badge ${badgeClass[order.status] ?? 'badge-gray'}`}>{badgeLabel[order.status] ?? order.status}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{formatDate(order.created_at)}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>{formatDZD(order.total_amount)}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{order.payment_method === 'cib' ? '💳 CIB/Satim' : '💵 Cash à la livraison'}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0' }}>
                                    {/* Left Column: Items & Shipping */}
                                    <div style={{ padding: '20px', borderRight: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} /> Articles commandés</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                            {order.order_items?.map((item) => (
                                                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                                                    <img src={item.products?.images?.[0] ?? 'https://placehold.co/100'} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                                                    <div style={{ flex: 1, fontSize: '13px' }}>
                                                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.products?.title || item.title_at_purchase}</p>
                                                        <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Qté: {item.quantity} × {formatDZD(item.price_at_purchase)}</p>
                                                    </div>
                                                    <p style={{ fontWeight: 800, fontSize: '14px' }}>{formatDZD(item.quantity * item.price_at_purchase)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Adresse de livraison</h3>
                                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', fontSize: '14px' }}>
                                            <p style={{ fontWeight: 600 }}>{shipping?.street}</p>
                                            <p style={{ color: 'var(--text-secondary)' }}>{shipping?.city || 'Ville non spécifiée'}, {shipping?.wilaya || 'Wilaya non spécifiée'}</p>
                                        </div>
                                    </div>

                                    {/* Right Column: Buyer Info & Actions */}
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><UserIcon size={16} /> Informations Client</h3>

                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                <img src={buyer?.profile_photo || 'https://i.pravatar.cc/100'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{buyer?.first_name} {buyer?.last_name}</p>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {order.buyer_id.slice(0, 8)}</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                                                    {buyer?.email || 'N/A'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                                                    {buyer?.phone || 'Non renseigné'}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleContactBuyer(order.buyer_id)}
                                            style={{ width: '100%', padding: '10px', background: 'white', color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', transition: 'all 0.2s' }}
                                        >
                                            <MessageSquare size={16} /> Contacter l&apos;acheteur
                                        </button>

                                        <div style={{ marginTop: 'auto' }}>
                                            {/* Action buttons */}
                                            {order.status === 'pending' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <button
                                                        disabled={updatingId === order.id}
                                                        onClick={() => handleSetStatus(order.id, 'confirmed')}
                                                        style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: updatingId === order.id ? 0.7 : 1 }}
                                                    >
                                                        {updatingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                                                        Confirmer la commande
                                                    </button>
                                                    <button
                                                        disabled={updatingId === order.id}
                                                        onClick={() => handleSetStatus(order.id, 'cancelled')}
                                                        style={{ width: '100%', padding: '10px', background: 'transparent', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                                                    >
                                                        Annuler la commande
                                                    </button>
                                                </div>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <button
                                                    disabled={updatingId === order.id}
                                                    onClick={() => handleSetStatus(order.id, 'shipped')}
                                                    style={{ width: '100%', padding: '12px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <Truck size={18} /> Marquer comme expédié
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button
                                                    disabled={updatingId === order.id}
                                                    onClick={() => handleSetStatus(order.id, 'delivered')}
                                                    style={{ width: '100%', padding: '12px', background: 'white', color: 'var(--green)', border: '2px solid var(--green)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <Check size={18} /> Confirmer la livraison
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
