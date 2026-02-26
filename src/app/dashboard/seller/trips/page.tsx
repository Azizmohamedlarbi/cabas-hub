'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Package, X, Plane, Loader2 } from 'lucide-react';
import { IMPORT_COUNTRIES } from '@/lib/mock-data';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils';
import { db } from '@/lib/db';

export default function SellerTripsPage() {
    const { user } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ destination: '', country: '', departure: '', return: '', budget: '', notes: '' });
    const [localTrips, setLocalTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTrips = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await db.getTrips(user.id);
            setLocalTrips(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [user]);

    const handleSubmit = async () => {
        if (!user || !form.destination || !form.country || !form.departure) return;

        setSubmitLoading(true);
        setError('');
        try {
            const selectedCountry = IMPORT_COUNTRIES.find(c => c.name === form.country);
            const tripData = {
                seller_id: user.id,
                destination_country: form.country,
                destination_city: form.destination,
                flag: selectedCountry?.flag || '✈️',
                departure_date: form.departure,
                return_date: form.return || null,
                budget_available: form.budget ? parseFloat(form.budget) : null,
                notes: form.notes,
                status: 'upcoming'
            };

            await db.createTrip(tripData);
            await fetchTrips();
            setForm({ destination: '', country: '', departure: '', return: '', budget: '', notes: '' });
            setShowModal(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erreur lors de la publication du voyage');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>✈️ Mes Voyages</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Publiez vos voyages d&apos;importation pour accepter des pré-commandes</p>
                </div>
                <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
                    <Plus size={16} /> Nouveau voyage
                </button>
            </div>

            {/* All trips from DB */}
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Tous mes voyages</p>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                </div>
            ) : (
                <>
                    {localTrips.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <Plane size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Aucun voyage planifié</p>
                            <button onClick={() => setShowModal(true)} style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
                                + Planifier mon premier voyage
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {localTrips.map(trip => (
                            <div key={trip.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                <div style={{ height: '100px', background: `linear-gradient(135deg, #0f172a, #1e3a5f)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                                    {trip.flag}
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{trip.destination_city}</h3>
                                        <span className={`badge ${trip.status === 'upcoming' ? 'badge-blue' : trip.status === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>
                                            {trip.status === 'upcoming' ? 'À venir' : trip.status === 'ongoing' ? 'En cours' : 'Terminé'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                        <span><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />{formatDate(trip.departure_date)} {trip.return_date && `→ ${formatDate(trip.return_date)}`}</span>
                                        <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{trip.destination_country}</span>
                                        <span><Package size={12} style={{ display: 'inline', marginRight: '4px' }} />Pré-commandes: {trip.pre_orders_count || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Link href={`/dashboard/seller/pre-orders`} style={{ flex: 1, padding: '8px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
                                            Voir pré-commandes
                                        </Link>
                                        <Link href={`/trips/${trip.id}`} style={{ flex: 1, padding: '8px', background: 'var(--primary-bg)', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                                            Vue publique
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px' }}>✈️ Nouveau voyage</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Ville de destination *</label>
                                <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Istanbul, Shanghai, Dubai..." className="input-base" />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Pays *</label>
                                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="input-base">
                                    <option value="">Sélectionner</option>
                                    {IMPORT_COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Date de départ *</label>
                                    <input type="date" value={form.departure} onChange={e => setForm(f => ({ ...f, departure: e.target.value }))} className="input-base" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Date de retour</label>
                                    <input type="date" value={form.return} onChange={e => setForm(f => ({ ...f, return: e.target.value }))} className="input-base" />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Budget max pré-commandes (DA)</label>
                                <input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="500 000 DA" className="input-base" />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Notes pour les acheteurs</label>
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Produits que vous allez ramener, conditions..." className="input-base" rows={3} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setShowModal(false)} disabled={submitLoading} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: submitLoading ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '14px', opacity: submitLoading ? 0.7 : 1 }}>
                                Annuler
                            </button>
                            <button onClick={handleSubmit} disabled={submitLoading} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: submitLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {submitLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                                {submitLoading ? 'Publication...' : '🚀 Publier le voyage'}
                            </button>
                        </div>
                        {error && (
                            <div style={{ marginTop: '12px', padding: '10px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '12px' }}>
                                ❌ {error}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
