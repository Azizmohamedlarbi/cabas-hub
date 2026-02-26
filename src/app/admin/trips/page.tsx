'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Plane, Loader2, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { getAdminTrips } from '@/lib/admin';
import { formatDate } from '@/lib/utils';
import { Trip } from '@/types';
import { supabase } from '@/lib/supabase';

export default function AdminTripsPage() {
    const [search, setSearch] = useState('');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const data = await getAdminTrips();
            setTrips(data as any);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer définitivement ce voyage ?')) return;
        try {
            const { error } = await supabase.from('trips').delete().eq('id', id);
            if (error) throw error;
            await fetchTrips();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const filtered = trips.filter(t => {
        const sellerName = `${t.profiles?.first_name || ''} ${t.profiles?.last_name || ''}`.toLowerCase();
        return !search ||
            t.destination_country.toLowerCase().includes(search.toLowerCase()) ||
            t.destination_city.toLowerCase().includes(search.toLowerCase()) ||
            sellerName.includes(search.toLowerCase());
    });

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, padding: '28px', overflowX: 'auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>✈️ Modération des Voyages</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Surveillez les trajets prévus par les vendeurs</p>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '320px', marginBottom: '20px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher pays, ville, vendeur..." className="input-base" style={{ paddingLeft: '34px', fontSize: '13px' }} />
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
                                        {['Destination', 'Vendeur', 'Dates', 'Statut', 'Pré-commandes', 'Actions'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '20px' }}>{t.flag || '🌍'}</span>
                                                    <div>
                                                        <p style={{ fontWeight: 600 }}>{t.destination_country}</p>
                                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.destination_city}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <p style={{ fontWeight: 600 }}>{t.profiles?.first_name} {t.profiles?.last_name}</p>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.profiles?.business_name}</p>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                    <Calendar size={12} />
                                                    {formatDate(t.departure_date)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span className={`badge ${t.status === 'upcoming' ? 'badge-blue' : t.status === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>
                                                    {t.status === 'upcoming' ? 'À venir' : t.status === 'ongoing' ? 'En cours' : 'Terminé'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ fontWeight: 600 }}>{t.pre_orders_count}</span>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.accept_pre_orders ? 'Acceptées' : 'Fermées'}</p>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <button onClick={() => handleDelete(t.id)} title="Supprimer" style={{ padding: '6px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Aucun voyage trouvé</div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
