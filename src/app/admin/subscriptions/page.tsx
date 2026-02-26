'use client';
import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Search, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { db } from '@/lib/db';
import { formatDZD } from '@/lib/utils';
import Link from 'next/link';

export default function AdminSubscriptionsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [durations, setDurations] = useState<Record<string, number>>({});

    const fetchPayments = async () => {
        try {
            const data = await db.getPendingSubscriptions();
            setPayments(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleAction = async (paymentId: string, status: 'approved' | 'rejected', userId: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir ${status === 'approved' ? 'APPROUVER' : 'REJETER'} cette demande ?`)) return;

        setActionLoading(paymentId);
        try {
            const duration = durations[paymentId] || 1;
            await db.updateSubscriptionStatus(paymentId, status, userId, duration);
            setPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'opération.");
        } finally {
            setActionLoading(null);
        }
    };

    const getPlanName = (planReq: string) => {
        if (planReq === 'pro_seller_monthly') return 'Vendeur Pro (Mois)';
        if (planReq === 'pro_buyer_monthly') return 'Acheteur Pro (Mois)';
        return planReq;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, padding: '28px 28px', overflowX: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <Star size={20} style={{ color: '#d97706' }} />
                                <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Validation des Abonnements</h1>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Vérifiez les preuves de paiement CCP et activez les comptes Pro.</p>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: '#94a3b8' }} />
                                <p style={{ marginTop: '16px', color: '#64748b' }}>Chargement des demandes...</p>
                            </div>
                        ) : payments.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>🎉</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Aucune demande en attente</h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Toutes les vérifications de paiements ont été traitées.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569' }}>Utilisateur</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569' }}>Plan Demandé</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569' }}>Date</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569' }}>Preuve (Reçu)</th>
                                        <th style={{ padding: '16px 20px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img src={payment.profiles?.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Link href={`/sellers/${payment.user_id}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }} target="_blank">
                                                                {payment.profiles?.first_name} {payment.profiles?.last_name}
                                                            </Link>
                                                            {payment.profiles?.anae_verified && <span title="Vérifié ANAE" style={{ display: 'inline-flex', alignItems: 'center' }}><ShieldCheck size={14} style={{ color: '#22c55e' }} /></span>}
                                                        </div>
                                                        <p style={{ fontSize: '12px', color: '#64748b' }}>{payment.profiles?.email}</p>
                                                        <span style={{ display: 'inline-block', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', fontSize: '11px', marginTop: '4px', color: '#475569' }}>Actuel: {payment.profiles?.plan}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ display: 'inline-block', padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                                                    {getPlanName(payment.plan_requested)}
                                                </span>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                                                    Déclaré : <strong>{payment.amount_paid} DA</strong>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#475569' }}>
                                                {new Date(payment.created_at).toLocaleDateString()}
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                    {new Date(payment.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                {payment.proof_image_url === 'sent_by_email' ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '13px', fontWeight: 600 }}>
                                                        📧 Envoyé par email
                                                    </span>
                                                ) : (
                                                    <a href={payment.proof_image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#0f172a', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                                                        📸 Voir le reçu <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleAction(payment.id, 'rejected', payment.user_id)}
                                                        disabled={actionLoading === payment.id}
                                                        style={{ padding: '8px 12px', background: 'white', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                                                        <XCircle size={16} /> Rejeter
                                                    </button>

                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <select
                                                            value={durations[payment.id] || 1}
                                                            onChange={(e) => setDurations({ ...durations, [payment.id]: parseInt(e.target.value) })}
                                                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', cursor: 'pointer', background: 'white' }}
                                                        >
                                                            <option value={1}>1 Mois</option>
                                                            <option value={3}>3 Mois</option>
                                                            <option value={6}>6 Mois</option>
                                                            <option value={12}>1 An</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleAction(payment.id, 'approved', payment.user_id)}
                                                            disabled={actionLoading === payment.id}
                                                            style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                                                            {actionLoading === payment.id ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Approuver (Pro)</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
