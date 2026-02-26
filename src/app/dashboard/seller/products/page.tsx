'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Edit3, Trash2, Eye, ToggleLeft, ToggleRight, Search, Loader2, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';
import { formatDZD } from '@/lib/utils';
import PhotoRequestForm from '@/components/PhotoRequestForm';

export default function SellerProductsPage() {
    const { user } = useAuthStore();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
    // Track which product's image panel is open
    const [openImagePanel, setOpenImagePanel] = useState<string | null>(null);

    const fetchProducts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await db.getProducts({ sellerId: user.id, status: 'all' });
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const filtered = products.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.categories?.name?.toLowerCase().includes(search.toLowerCase());

        if (filter === 'active') return matchSearch && p.status === 'active';
        if (filter === 'paused') return matchSearch && p.status === 'flagged';
        return matchSearch;
    });

    const togglePause = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'flagged' : 'active';
            await db.updateProductStatus(id, newStatus as any);
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
        try {
            await db.updateProductStatus(id, 'rejected' as any);
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
    );

    return (
        <div style={{ padding: '28px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>📦 Mes Produits</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{filtered.length} produit(s) dans votre catalogue</p>
                </div>
                <Link href="/dashboard/seller/products/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                    <Plus size={16} /> Ajouter un produit
                </Link>
            </div>
            {/* ... rest of the file ... */}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '340px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un produit..."
                        className="input-base" style={{ paddingLeft: '34px', fontSize: '13px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {(['all', 'active', 'paused'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', border: '1.5px solid', borderColor: filter === f ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-md)', background: filter === f ? 'var(--primary-bg)' : 'white', color: filter === f ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: filter === f ? 600 : 400 }}>
                            {f === 'all' ? 'Tous' : f === 'active' ? '✅ Actifs' : '⏸️ En pause'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.length === 0 && (
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px', textAlign: 'center' }}>
                        <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '16px' }}>Aucun produit trouvé</p>
                        <Link href="/dashboard/seller/products/new" style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                            + Ajouter mon premier produit
                        </Link>
                    </div>
                )}
                {filtered.map(p => {
                    const isPaused = p.status === 'flagged';
                    const isImageOpen = openImagePanel === p.id;
                    return (
                        <div key={p.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: isPaused ? 0.85 : 1 }}>
                            {/* Main product row */}
                            <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <img src={p.images?.[0] || '/placeholder-product.png'} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                        <h3 style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{p.title}</h3>
                                        <span className={`badge ${isPaused ? 'badge-gray' : 'badge-green'}`}>{isPaused ? 'En pause' : 'Actif'}</span>
                                        {p.wholesale_only && <span className="badge badge-blue">Gros</span>}
                                        {(!p.images || p.images.length === 0) && (
                                            <span style={{ background: '#fef9c3', color: '#b45309', border: '1px solid #fde68a', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
                                                📷 Sans image
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                        <span>📦 Stock: <strong style={{ color: p.quantity < 5 ? '#ef4444' : 'var(--text-primary)' }}>{p.quantity}</strong></span>
                                        <span>💰 Détail: <strong style={{ color: 'var(--primary)' }}>{formatDZD(p.price_retail)}</strong></span>
                                        <span>🏭 Gros: <strong>{formatDZD(p.price_wholesale)}</strong></span>
                                        <span>👁 {p.views || 0} vues</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {/* Image manager button */}
                                    <button
                                        onClick={() => setOpenImagePanel(isImageOpen ? null : p.id)}
                                        title="Gérer les images"
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: `1.5px solid ${isImageOpen ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: isImageOpen ? 'var(--primary-bg)' : 'white', cursor: 'pointer', color: isImageOpen ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}
                                    >
                                        <ImageIcon size={14} />
                                        <span>Images</span>
                                        {isImageOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <Link href={`/products/${p.slug}`} title="Voir" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                                        <Eye size={15} />
                                    </Link>
                                    <button onClick={() => togglePause(p.id, p.status)} title={isPaused ? 'Activer' : 'Mettre en pause'} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', color: isPaused ? 'var(--primary)' : 'var(--accent)' }}>
                                        {isPaused ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} title="Supprimer" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fecaca', borderRadius: 'var(--radius-sm)', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Expandable image request panel */}
                            {isImageOpen && (
                                <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: '#f8fafc' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
                                        📸 Soumettez une photo pour ce produit. Elle sera vérifiée par l'admin avant d'être affichée. <strong>Délai minimum : 3 jours entre chaque changement.</strong>
                                    </p>
                                    {/* Current images preview */}
                                    {p.images && p.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                            {p.images.map((img: string, i: number) => (
                                                <img key={i} src={img} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--border)' }} />
                                            ))}
                                        </div>
                                    )}
                                    <PhotoRequestForm
                                        targetType="product_image"
                                        targetId={p.id}
                                        label={`image de "${p.title}"`}
                                        onSuccess={fetchProducts}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
