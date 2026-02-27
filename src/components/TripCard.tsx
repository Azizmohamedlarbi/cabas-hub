'use client';
import Link from 'next/link';
import { ShieldCheck, Star, Loader2, Flag } from 'lucide-react';
import type { Trip } from '@/types';
import { formatDZD, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';
import { useRouter } from 'next/navigation';
import ReportModal from '@/components/modals/ReportModal';

export default function TripCard({ trip }: { trip: Trip }) {
    const [preOrderOpen, setPreOrderOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const { user } = useAuthStore();

    const departureDate = trip.departure_date;
    const returnDate = trip.return_date || '';
    const daysLeft = Math.max(0, Math.ceil((new Date(departureDate).getTime() - Date.now()) / 86400000));

    return (
        <>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

                {/* Header banner */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '80px', opacity: 0.15 }}>{trip.flag}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '28px' }}>{trip.flag}</span>
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>Destination</p>
                                    <h3 style={{ color: 'white', fontWeight: 700, fontSize: '17px' }}>{trip.destination_city}</h3>
                                </div>
                            </div>
                        </div>
                        {daysLeft <= 7 && (
                            <span style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                                🔥 {daysLeft}j restants
                            </span>
                        )}
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                            <span style={{ color: '#4ade80' }}>✈️ Départ</span> {formatDate(departureDate)}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                            <span style={{ color: '#60a5fa' }}>🛬 Retour</span> {returnDate ? formatDate(returnDate) : '-'}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '16px' }}>
                    {/* Seller */}
                    <Link href={`/sellers/${trip.seller_id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '12px' }}>
                        <img src={trip.profiles?.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{trip.profiles?.first_name} {trip.profiles?.last_name}</span>
                                {trip.profiles?.anae_verified && <ShieldCheck size={13} style={{ color: 'var(--primary)' }} />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trip.profiles?.rating_average} · {trip.profiles?.business_name}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Report Trip Button */}
                    <button
                        disabled={user?.id === trip.seller_id}
                        onClick={(e) => {
                            e.preventDefault();
                            if (!user) { window.location.href = '/auth/login'; return; }
                            setReportModalOpen(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, marginBottom: '16px' }}
                    >
                        <Flag size={12} /> Signaler le voyage
                    </button>

                    {/* Notes */}
                    {trip.notes && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>{trip.notes}</p>}

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
                            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{formatDZD(trip.budget_available || 0)}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Budget disponible</p>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center' }}>
                            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--secondary)' }}>{trip.pre_orders_count}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pré-commandes</p>
                        </div>
                    </div>

                    {/* Specialties */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        {trip.profiles?.specialties?.map(s => (
                            <span key={s} className="badge badge-green">{s}</span>
                        ))}
                    </div>

                    {/* CTA */}
                    {trip.accept_pre_orders && (
                        <button
                            onClick={() => {
                                if (!useAuthStore.getState().user) {
                                    window.location.href = '/auth/login?redirect=/trips';
                                    return;
                                }
                                setPreOrderOpen(true);
                            }}
                            style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                            📦 Faire une pré-commande
                        </button>
                    )}
                </div>
            </div>

            {/* PreOrder Modal */}
            {preOrderOpen && <PreOrderModal trip={trip} onClose={() => setPreOrderOpen(false)} />}

            {/* Report Modal */}
            {reportModalOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                    <ReportModal
                        targetType="trip"
                        targetId={trip.id}
                        reportedId={trip.seller_id}
                        targetName={`Voyage vers ${trip.destination_city} (${formatDate(trip.departure_date)})`}
                        onClose={() => setReportModalOpen(false)}
                    />
                </div>
            )}
        </>
    );
}

function PreOrderModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [request, setRequest] = useState('');
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        if (!request.trim()) return;

        setLoading(true);
        setError('');
        try {
            await db.createPreOrder({
                trip_id: trip.id,
                buyer_id: user.id,
                seller_id: trip.seller_id,
                product_description: request,
                quantity: qty,
                target_price: price ? parseFloat(price) : undefined,
                notes: notes || undefined,
            });
            setSubmitted(true);
            setTimeout(onClose, 2500);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '28px', maxWidth: '460px', width: '100%', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>Proposition envoyée !</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Le vendeur examinera votre demande et vous contactera.</p>
                    </div>
                ) : (
                    <>
                        <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>📦 Proposer une pré-commande</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                            {trip.flag} {trip.destination_city} – Départ {formatDate(trip.departure_date)}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                                    Produit souhaité <span style={{ color: 'red' }}>*</span>
                                </label>
                                <textarea
                                    placeholder="Ex: AirPods Pro 2 couleur blanc, avec boîte originale..."
                                    value={request}
                                    onChange={e => setRequest(e.target.value)}
                                    rows={3}
                                    className="input-base"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Quantité</label>
                                    <input type="number" value={qty} onChange={e => setQty(+e.target.value)} min={1} className="input-base" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Prix cible (DA)</label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="30 000" className="input-base" />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Notes supplémentaires</label>
                                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Couleur, taille, specs particulières..." className="input-base" />
                            </div>
                            {error && (
                                <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '10px', color: '#b91c1c', fontSize: '13px' }}>
                                    ❌ {error}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={onClose} style={{ flex: 1, padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Annuler</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!request || loading}
                                    style={{ flex: 2, padding: '10px 20px', background: request && !loading ? 'var(--primary)' : '#d1d5db', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: request && !loading ? 'pointer' : 'not-allowed', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {loading ? 'Envoi...' : !user ? 'Se connecter pour proposer' : 'Envoyer la proposition'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
