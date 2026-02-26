'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, MessageSquare, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';
import { formatDate, formatDZD } from '@/lib/utils';
import { getOrCreateConversation } from '@/lib/messages';
import { useRouter } from 'next/navigation';

export default function SellerPreOrdersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [trips, setTrips] = useState<any[]>([]);
    const [proposals, setProposals] = useState<Record<string, any[]>>({});
    const [openTrip, setOpenTrip] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [msgLoading, setMsgLoading] = useState<string | null>(null);
    const [responseText, setResponseText] = useState<Record<string, string>>({});
    const [expandedProposal, setExpandedProposal] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const tripData = await db.getTrips(user.id);
            setTrips(tripData);
            const allProposals: Record<string, any[]> = {};
            await Promise.all(
                tripData.map(async (trip: any) => {
                    const p = await db.getPreOrdersForTrip(trip.id);
                    allProposals[trip.id] = p;
                })
            );
            setProposals(allProposals);
            const firstWithPending = tripData.find((t: any) =>
                allProposals[t.id]?.some((p: any) => p.status === 'pending')
            );
            if (firstWithPending) setOpenTrip(firstWithPending.id);
            else if (tripData.length > 0) setOpenTrip(tripData[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    const handleDecision = async (proposalId: string, tripId: string, status: 'accepted' | 'declined') => {
        setActionLoading(proposalId);
        try {
            await db.updatePreOrderStatus(proposalId, status, responseText[proposalId]);
            const updated = await db.getPreOrdersForTrip(tripId);
            setProposals(prev => ({ ...prev, [tripId]: updated }));
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMessageBuyer = async (proposal: any) => {
        if (!user) return;
        setMsgLoading(proposal.id);
        try {
            const convId = await getOrCreateConversation(user.id, proposal.buyer_id);
            router.push(`/messages?conv=${convId}`);
        } catch (err) {
            console.error(err);
            alert('Impossible d\'ouvrir la conversation');
        } finally {
            setMsgLoading(null);
        }
    };

    const totalPending = Object.values(proposals).flat().filter((p: any) => p.status === 'pending').length;
    const totalAccepted = Object.values(proposals).flat().filter((p: any) => p.status === 'accepted').length;
    const totalDeclined = Object.values(proposals).flat().filter((p: any) => p.status === 'declined').length;

    return (
        <div style={{ padding: '28px 24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                    📋 Propositions de Pré-commande
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Examinez, contactez les acheteurs, et répondez à leurs propositions
                </p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { icon: <Package size={20} style={{ color: 'var(--primary)' }} />, count: totalPending, label: 'En attente', color: 'var(--primary)' },
                    { icon: <CheckCircle size={20} style={{ color: '#22c55e' }} />, count: totalAccepted, label: 'Acceptées', color: '#22c55e' },
                    { icon: <XCircle size={20} style={{ color: '#ef4444' }} />, count: totalDeclined, label: 'Refusées', color: '#ef4444' },
                ].map(item => (
                    <div key={item.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.icon}
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '20px', color: item.color }}>{item.count}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                </div>
            ) : trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Aucun voyage publié</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Publiez un voyage pour commencer à recevoir des propositions.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trips.map(trip => {
                        const tripProposals = proposals[trip.id] || [];
                        const pendingCount = tripProposals.filter(p => p.status === 'pending').length;
                        const isOpen = openTrip === trip.id;

                        return (
                            <div key={trip.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                {/* Trip accordion header */}
                                <button
                                    onClick={() => setOpenTrip(isOpen ? null : trip.id)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', border: 'none', background: isOpen ? '#f8fafc' : 'transparent', cursor: 'pointer', textAlign: 'left', borderBottom: isOpen ? '1px solid var(--border)' : 'none' }}
                                >
                                    <span style={{ fontSize: '28px' }}>{trip.flag}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{trip.destination_city}, {trip.destination_country}</h3>
                                            <span className={`badge ${trip.status === 'upcoming' ? 'badge-blue' : trip.status === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>
                                                {trip.status === 'upcoming' ? 'À venir' : trip.status === 'ongoing' ? 'En cours' : 'Terminé'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Départ {formatDate(trip.departure_date)}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {pendingCount > 0 && (
                                            <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                                                {pendingCount} nouvelle{pendingCount > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tripProposals.length} proposition{tripProposals.length !== 1 ? 's' : ''}</span>
                                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                                    </div>
                                </button>

                                {/* Proposals list */}
                                {isOpen && (
                                    <div>
                                        {tripProposals.length === 0 ? (
                                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                                Aucune proposition pour ce voyage pour le moment.
                                            </div>
                                        ) : (
                                            tripProposals.map((proposal, index) => {
                                                const isExpanded = expandedProposal === proposal.id;
                                                return (
                                                    <div key={proposal.id} style={{ borderBottom: index < tripProposals.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                        {/* Proposal summary row */}
                                                        <div style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                                            <img
                                                                src={proposal.buyer?.profile_photo || 'https://i.pravatar.cc/150'}
                                                                alt=""
                                                                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
                                                            />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>
                                                                            {proposal.buyer?.first_name} {proposal.buyer?.last_name}
                                                                        </span>
                                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                                            {new Date(proposal.created_at).toLocaleDateString('fr-DZ')}
                                                                        </span>
                                                                    </div>
                                                                    <span className={`badge ${proposal.status === 'pending' ? 'badge-orange' : proposal.status === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                                                                        {proposal.status === 'pending' ? '⏳ En attente' : proposal.status === 'accepted' ? '✅ Accepté' : '❌ Refusé'}
                                                                    </span>
                                                                </div>

                                                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                                                                    {proposal.product_description}
                                                                </p>

                                                                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', flexWrap: 'wrap' }}>
                                                                    <span>📦 Qté: <strong style={{ color: 'var(--text-primary)' }}>{proposal.quantity}</strong></span>
                                                                    {proposal.target_price && <span>💰 Prix cible: <strong style={{ color: 'var(--text-primary)' }}>{formatDZD(proposal.target_price)}</strong></span>}
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                    <button
                                                                        onClick={() => handleMessageBuyer(proposal)}
                                                                        disabled={msgLoading === proposal.id}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}
                                                                    >
                                                                        {msgLoading === proposal.id
                                                                            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                                                            : <MessageSquare size={13} />
                                                                        }
                                                                        Contacter
                                                                    </button>

                                                                    <button
                                                                        onClick={() => setExpandedProposal(isExpanded ? null : proposal.id)}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
                                                                    >
                                                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                                        {isExpanded ? 'Moins de détails' : 'Voir détails'}
                                                                    </button>

                                                                    {proposal.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleDecision(proposal.id, trip.id, 'accepted')}
                                                                                disabled={actionLoading === proposal.id}
                                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}
                                                                            >
                                                                                {actionLoading === proposal.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                                                                                Accepter
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDecision(proposal.id, trip.id, 'declined')}
                                                                                disabled={actionLoading === proposal.id}
                                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}
                                                                            >
                                                                                <XCircle size={13} />
                                                                                Refuser
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '20px 20px 20px 76px' }}>
                                                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Détails de la proposition</h4>

                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                                                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
                                                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Produit demandé</p>
                                                                        <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.5' }}>{proposal.product_description}</p>
                                                                    </div>
                                                                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
                                                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Quantité</p>
                                                                        <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{proposal.quantity} unité{proposal.quantity > 1 ? 's' : ''}</p>
                                                                    </div>
                                                                    {proposal.target_price && (
                                                                        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
                                                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Prix cible (budget acheteur)</p>
                                                                            <p style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{formatDZD(proposal.target_price)}</p>
                                                                        </div>
                                                                    )}
                                                                    {proposal.notes && (
                                                                        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
                                                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes de l'acheteur</p>
                                                                            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{proposal.notes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {proposal.buyer?.phone && (
                                                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                                                                        📞 {proposal.buyer.phone}
                                                                    </p>
                                                                )}

                                                                {proposal.seller_response && (
                                                                    <div style={{ background: proposal.status === 'accepted' ? '#f0fdf4' : '#fef2f2', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', border: `1px solid ${proposal.status === 'accepted' ? '#bbf7d0' : '#fecaca'}` }}>
                                                                        <strong>Votre réponse :</strong> {proposal.seller_response}
                                                                    </div>
                                                                )}

                                                                {proposal.status === 'pending' && (
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                                        <input
                                                                            value={responseText[proposal.id] || ''}
                                                                            onChange={e => setResponseText(prev => ({ ...prev, [proposal.id]: e.target.value }))}
                                                                            placeholder="Message à envoyer à l'acheteur (optionnel)..."
                                                                            className="input-base"
                                                                            style={{ flex: 1, minWidth: '220px', fontSize: '13px' }}
                                                                        />
                                                                        <button
                                                                            onClick={() => handleDecision(proposal.id, trip.id, 'accepted')}
                                                                            disabled={actionLoading === proposal.id}
                                                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                                                                        >
                                                                            {actionLoading === proposal.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />}
                                                                            Confirmer l&apos;acceptation
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDecision(proposal.id, trip.id, 'declined')}
                                                                            disabled={actionLoading === proposal.id}
                                                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                                                                        >
                                                                            <XCircle size={14} />
                                                                            Refuser
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
