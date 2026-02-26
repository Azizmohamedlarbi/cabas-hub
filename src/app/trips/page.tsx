'use client';
import { useState, useEffect, useMemo } from 'react';
import TripCard from '@/components/TripCard';
import { IMPORT_COUNTRIES } from '@/lib/mock-data';
import { MapPin, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Trip } from '@/types';

export default function TripsPage() {
    const [country, setCountry] = useState('');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const data = await db.getTrips();
                setTrips(data);
            } catch (error) {
                console.error('Failed to fetch trips:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const filtered = useMemo(() => {
        return country ? trips.filter(t => t.destination_country === country) : trips;
    }, [trips, country]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '48px 20px', textAlign: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
                    ✈️ Voyages en Cours
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '560px', margin: '0 auto' }}>
                    Pré-commandez des produits avant le départ de nos vendeurs certifiés. Économisez jusqu&apos;à 40% sur les prix du marché.
                </p>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
                <div className="container" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination:</span>
                    <button onClick={() => setCountry('')} style={{ padding: '6px 14px', border: `1.5px solid ${!country ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: !country ? 'var(--primary-bg)' : 'white', color: !country ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                        🌍 Tous pays
                    </button>
                    {IMPORT_COUNTRIES.slice(0, 5).map(c => (
                        <button key={c.code} onClick={() => setCountry(c.name)} style={{ padding: '6px 14px', border: `1.5px solid ${country === c.name ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: country === c.name ? 'var(--primary-bg)' : 'white', color: country === c.name ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                            {c.flag} {c.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="container" style={{ padding: '28px 20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}><strong>{filtered.length}</strong> voyage(s) planifié(s)</p>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
                        <h3 style={{ fontWeight: 700 }}>Aucun voyage trouvé</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Essayez un autre filtre</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {filtered.map(trip => <TripCard key={trip.id} trip={trip} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
