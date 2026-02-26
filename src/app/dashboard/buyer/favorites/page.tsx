'use client';
import Link from 'next/link';
import { Heart, ShoppingCart, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useCartStore } from '@/store/cart';
import { formatDZD } from '@/lib/utils';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';
import { Product } from '@/types';

export default function BuyerFavoritesPage() {
    const { user } = useAuthStore();
    const addItem = useCartStore(s => s.addItem);
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const data = await db.getFavorites(user!.id);
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (productId: string) => {
        try {
            await db.toggleFavorite(productId, user!.id);
            setFavorites(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex' }}>
                <DashboardSidebar type="buyer" />
                <main style={{ flex: 1, padding: '28px 24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>❤️ Mes Favoris</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{favorites.length} produit(s) sauvegardé(s)</p>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : favorites.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <Heart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Vous n&apos;avez pas encore de favoris</p>
                            <Link href="/products" style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                                Découvrir des produits →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                            {favorites.map(p => (
                                <div key={p.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                                    <button onClick={() => handleRemoveFavorite(p.id)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2, width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: 'var(--shadow-sm)' }}>
                                        <X size={14} />
                                    </button>
                                    <Link href={`/products/${p.slug}`}>
                                        <img src={p.images?.[0]} alt={p.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                    </Link>
                                    <div style={{ padding: '14px' }}>
                                        <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h3>
                                        </Link>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{p.categories?.name} · {p.profiles?.first_name} {p.profiles?.last_name}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div>
                                                <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '16px' }}>{formatDZD(p.price_retail)}</p>
                                                {p.price_wholesale && (p.price_wholesale < p.price_retail) && (
                                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gros: {formatDZD(p.price_wholesale)}</p>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <span style={{ color: '#f59e0b', fontSize: '13px' }}>★</span>
                                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{(p as any).rating_average ?? 0}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({(p as any).rating_count ?? 0})</span>
                                            </div>
                                        </div>
                                        <button onClick={() => addItem(p, 1, 'retail')} style={{ width: '100%', padding: '9px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            <ShoppingCart size={14} /> Ajouter au panier
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
