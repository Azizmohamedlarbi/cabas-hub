'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Star, Package, Plane, MessageCircle, Loader2, Flag } from 'lucide-react';
import { formatDZD } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import TripCard from '@/components/TripCard';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';
import { Profile, Product, Trip } from '@/types';
import ReportModal from '@/components/modals/ReportModal';

export default function SellerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [seller, setSeller] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'products' | 'trips'>('products');
    const [reportModalOpen, setReportModalOpen] = useState(false);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                const [sel, Prods, TRs] = await Promise.all([
                    db.getProfile(params.id as string),
                    db.getProducts({ sellerId: params.id as string, status: 'active' }),
                    db.getTrips(params.id as string)
                ]);
                setSeller(sel);
                setProducts(Prods);
                setTrips(TRs);
            } catch (error) {
                console.error('Failed to fetch seller profile:', error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchSellerData();
    }, [params.id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!seller) return <div className="container">Vendeur non trouvé</div>;

    return (
        <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
            {/* Cover + profile */}
            <div style={{ height: '160px', backgroundImage: `url(${seller.cover_photo || 'https://placehold.co/1200x400?text=Cover'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}></div>
                <div className="container" style={{ position: 'absolute', bottom: '-50px', left: 0, right: 0, display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '0 20px' }}>
                    <img src={seller.profile_photo || 'https://i.pravatar.cc/150'} alt={seller.first_name} style={{ width: '96px', height: '96px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover', background: 'white', boxShadow: 'var(--shadow-md)' }} />
                    <div style={{ paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h1 style={{ color: 'white', fontWeight: 800, fontSize: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{seller.first_name} {seller.last_name}</h1>
                            {seller.anae_verified && <span style={{ background: '#22c55e', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={11} /> ANAE Vérifié</span>}
                        </div>
                        <p style={{ color: 'white', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.3)', opacity: 0.9 }}>{seller.business_name}</p>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border)', marginTop: '60px', padding: '16px 20px' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={async () => {
                            if (!user) { router.push('/auth/login'); return; }
                            try {
                                const convId = await (await import('@/lib/messages')).getOrCreateConversation(user.id, seller.id);
                                router.push(`/messages?conv=${convId}`);
                            } catch (err) {
                                console.error(err);
                                alert('Erreur lors de la création de la conversation');
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                    >
                        <MessageCircle size={15} /> Contacter
                    </button>
                    {user?.id !== seller.id && (
                        <button
                            onClick={() => {
                                if (!user) { router.push('/auth/login'); return; }
                                setReportModalOpen(true);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', border: '1.5px solid #ef4444', background: 'white', color: '#ef4444', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s' }}
                        >
                            <Flag size={15} /> Signaler
                        </button>
                    )}
                </div>
            </div>

            <div className="container grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start" style={{ padding: '24px 20px' }}>
                {/* Sidebar */}
                <aside>
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            {[
                                { label: 'Ventes', value: seller.total_sales.toLocaleString(), icon: <Package size={14} />, color: 'var(--primary)' },
                                { label: 'Note', value: `${seller.rating_average} ⭐`, icon: <Star size={14} />, color: '#f59e0b' },
                                { label: 'Produits', value: String(products.length), icon: <Package size={14} />, color: 'var(--secondary)' },
                                { label: 'Voyages', value: String(trips.length), icon: <Plane size={14} />, color: 'var(--accent)' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                                    <p style={{ fontWeight: 800, fontSize: '18px', color: s.color }}>{s.value}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                        {seller.bio && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>{seller.bio}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {seller.specialties?.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                            {seller.import_countries?.map(c => <span key={c} className="badge badge-blue">{c}</span>)}
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div>
                    <div style={{ display: 'flex', gap: '0', marginBottom: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {(['products', 'trips'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '12px', border: 'none', background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.15s' }}>
                                {t === 'products' ? `🛍️ Produits (${products.length})` : `✈️ Voyages (${trips.length})`}
                            </button>
                        ))}
                    </div>
                    {tab === 'products' && (
                        products.length === 0
                            ? <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text-muted)' }}>Aucun produit publié</p></div>
                            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
                    )}
                    {tab === 'trips' && (
                        trips.length === 0
                            ? <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}><p style={{ color: 'var(--text-muted)' }}>Aucun voyage planifié</p></div>
                            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>{trips.map(t => <TripCard key={t.id} trip={t} />)}</div>
                    )}
                </div>
            </div>

            {reportModalOpen && (
                <ReportModal
                    targetType="profile"
                    targetId={seller.id}
                    reportedId={seller.id}
                    targetName={`${seller.first_name} ${seller.last_name}`}
                    onClose={() => setReportModalOpen(false)}
                />
            )}
        </div>
    );
}
