'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Search, ShieldCheck, Star, MapPin, Filter, Loader2 } from 'lucide-react';
import { IMPORT_COUNTRIES } from '@/lib/mock-data';
import { db } from '@/lib/db';
import { Profile, Category } from '@/types';
import InlineFeedback from '@/components/feedback/InlineFeedback';

export default function SellersPage() {
    const [search, setSearch] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<'rating' | 'sales' | 'newest'>('rating');
    const [sellers, setSellers] = useState<Profile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [selData, catData] = await Promise.all([
                    db.getSellers(),
                    db.getCategories()
                ]);
                setSellers(selData);
                setCategories(catData);
            } catch (error) {
                console.error('Failed to fetch sellers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const filtered = useMemo(() => {
        return sellers.filter(s => {
            const matchSearch = !search ||
                `${s.first_name} ${s.last_name} ${s.business_name}`.toLowerCase().includes(search.toLowerCase()) ||
                s.specialties?.some(sp => sp.toLowerCase().includes(search.toLowerCase()));
            const matchCountry = !selectedCountry || s.import_countries?.includes(selectedCountry);
            const matchCategory = !selectedCategory || s.specialties?.includes(selectedCategory);
            return matchSearch && matchCountry && matchCategory;
        }).sort((a, b) => {
            if (sortBy === 'rating') return b.rating_average - a.rating_average;
            if (sortBy === 'sales') return b.total_sales - a.total_sales;
            return 0;
        });
    }, [sellers, search, selectedCountry, selectedCategory, sortBy]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            {/* Hero header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '48px 20px 40px' }}>
                <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
                        🌍 Vendeurs Certifiés
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '28px' }}>
                        {sellers.length} vendeurs vérifiés ANAE, spécialistes de l&apos;importation algérienne
                    </p>
                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un vendeur, spécialité..."
                            style={{ width: '100%', padding: '13px 16px 13px 40px', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '28px 20px' }}>
                {/* Filters row */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Filter size={14} /> Filtrer par:
                    </div>
                    <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'white', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <option value="">🌍 Tous les pays</option>
                        {IMPORT_COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                    </select>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'white', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <option value="">📦 Toutes catégories</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                    </select>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                        {(['rating', 'sales'] as const).map(s => (
                            <button key={s} onClick={() => setSortBy(s)} style={{ padding: '7px 14px', border: '1.5px solid', borderColor: sortBy === s ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', background: sortBy === s ? 'var(--primary-bg)' : 'white', color: sortBy === s ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: sortBy === s ? 600 : 400 }}>
                                {s === 'rating' ? '⭐ Note' : '🛒 Ventes'}
                            </button>
                        ))}
                    </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>{filtered.length} vendeur(s)</p>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {filtered.map(seller => (
                        <Link key={seller.id} href={`/sellers/${seller.id}`} className="hover-lift" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                            {/* Cover */}
                            <div style={{ height: '90px', backgroundImage: `url(${seller.cover_photo || 'https://placehold.co/800x200?text=Cover'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                {seller.anae_verified && (
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: 'var(--radius-full)', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--primary)' }}>
                                        <ShieldCheck size={11} /> ANAE
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '16px', paddingTop: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '-28px', marginBottom: '12px' }}>
                                    <img src={seller.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }} />
                                    <div style={{ paddingBottom: '4px' }}>
                                        <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{seller.first_name} {seller.last_name}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{seller.business_name}</p>
                                    </div>
                                </div>
                                {/* Rating & sales */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{seller.rating_average}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({seller.rating_count} avis)</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>🛒 {seller.total_sales} ventes</span>
                                </div>
                                {/* Location */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                    <MapPin size={12} />
                                    <span>{seller.address_city}, {seller.address_wilaya}</span>
                                </div>
                                {/* Specialties */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                                    {seller.specialties?.slice(0, 3).map(sp => (
                                        <span key={sp} className="badge badge-green">{sp}</span>
                                    ))}
                                    {seller.specialties && seller.specialties.length > 3 && <span className="badge badge-gray">+{seller.specialties.length - 3}</span>}
                                </div>
                                {/* Countries */}
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {seller.import_countries?.map(c => (
                                        <span key={c} className="badge badge-gray">🌍 {c}</span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Aucun vendeur ne correspond à votre recherche</p>
                        <button onClick={() => { setSearch(''); setSelectedCountry(''); setSelectedCategory(''); }} style={{ marginTop: '16px', padding: '9px 20px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer' }}>
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
                    <InlineFeedback feature="sellers" title="Que pensez-vous de l'annuaire des Vendeurs ?" type="emotes" />
                </div>
            </div>
        </div>
    );
}
