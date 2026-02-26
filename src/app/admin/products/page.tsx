'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Check, X, Flag, Loader2, Image as ImageIcon, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { formatDZD } from '@/lib/utils';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'active' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    // Image management per product
    const [openImagePanel, setOpenImagePanel] = useState<string | null>(null);
    const [imageInputs, setImageInputs] = useState<Record<string, string>>({});
    const [imageLoading, setImageLoading] = useState<string | null>(null);
    const [imageMsg, setImageMsg] = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({});

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await db.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await db.updateProductStatus(id, status as any);
            await fetchProducts();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddImage = async (p: Product) => {
        const url = (imageInputs[p.id] || '').trim();
        if (!url) return;
        setImageLoading(p.id);
        setImageMsg(m => ({ ...m, [p.id]: { type: 'ok', text: '' } }));
        try {
            const existing: string[] = p.images || [];
            const newImages = [...existing.filter(i => i !== url), url];
            const { error } = await supabase.from('products').update({ images: newImages }).eq('id', p.id);
            if (error) throw error;
            setImageMsg(m => ({ ...m, [p.id]: { type: 'ok', text: '✅ Image ajoutée !' } }));
            setImageInputs(v => ({ ...v, [p.id]: '' }));
            await fetchProducts();
        } catch (err: any) {
            setImageMsg(m => ({ ...m, [p.id]: { type: 'err', text: `❌ ${err.message}` } }));
        } finally {
            setImageLoading(null);
        }
    };

    const handleRemoveImage = async (p: Product, imgUrl: string) => {
        setImageLoading(p.id);
        try {
            const newImages = (p.images || []).filter(i => i !== imgUrl);
            await supabase.from('products').update({ images: newImages }).eq('id', p.id);
            await fetchProducts();
        } catch (err: any) {
            setImageMsg(m => ({ ...m, [p.id]: { type: 'err', text: `❌ ${err.message}` } }));
        } finally {
            setImageLoading(null);
        }
    };

    const filtered = products.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.profiles?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' ? true : p.status === filter;
        return matchSearch && matchFilter;
    });

    const statusBadge: Record<string, { cls: string; label: string }> = {
        pending: { cls: 'badge-orange', label: '⏳ En attente' },
        active: { cls: 'badge-green', label: '✅ Actif' },
        rejected: { cls: 'badge-red', label: '❌ Rejeté' },
        flagged: { cls: 'badge-orange', label: '🚩 Signalé' },
    };

    const counts = {
        all: products.length,
        pending: products.filter(p => p.status === 'pending').length,
        flagged: products.filter(p => p.status === 'flagged').length,
        active: products.filter(p => p.status === 'active').length,
        rejected: products.filter(p => p.status === 'rejected').length
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, padding: '28px', overflowX: 'auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>📦 Modération des Produits</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Approuvez, rejetez ou signalez les produits — et gérez leurs images directement</p>
                    </div>

                    {/* Status tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {(['all', 'pending', 'flagged', 'active', 'rejected'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f as any)} style={{ padding: '7px 14px', border: '1.5px solid', borderColor: filter === f ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', background: filter === f ? 'var(--primary-bg)' : 'white', color: filter === f ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: filter === f ? 600 : 400 }}>
                                {f === 'all' ? `Tous (${counts.all})` : f === 'pending' ? `⏳ Attente (${counts.pending})` : f === 'flagged' ? `🚩 Signalés (${counts.flagged})` : f === 'active' ? `✅ Actifs (${counts.active})` : `❌ Rejetés (${counts.rejected})`}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '320px', marginBottom: '20px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="input-base" style={{ paddingLeft: '34px', fontSize: '13px' }} />
                    </div>

                    {/* Product list */}
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filtered.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'white', borderRadius: 'var(--radius-lg)' }}>Aucun produit trouvé</div>
                            )}
                            {filtered.map(p => {
                                const badge = statusBadge[p.status] || { cls: 'badge-gray', label: p.status };
                                const isImageOpen = openImagePanel === p.id;
                                const msg = imageMsg[p.id];
                                return (
                                    <div key={p.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                        {/* Main row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', flexWrap: 'wrap' }}>
                                            <img src={p.images?.[0] ?? 'https://placehold.co/400x400?text=No+Image'} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: '150px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{p.title}</p>
                                                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                                    {(!p.images || p.images.length === 0) && (
                                                        <span style={{ background: '#fef9c3', color: '#b45309', border: '1px solid #fde68a', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>📷 Sans image</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {p.profiles?.first_name} {p.profiles?.last_name} · {p.categories?.name} · {formatDZD(p.price_retail)}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                                                {/* Image management */}
                                                <button onClick={() => setOpenImagePanel(isImageOpen ? null : p.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: `1.5px solid ${isImageOpen ? '#3b82f6' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: isImageOpen ? '#eff6ff' : 'white', cursor: 'pointer', color: isImageOpen ? '#1d4ed8' : 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>
                                                    <ImageIcon size={13} /> Images {isImageOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                </button>
                                                <Link href={`/products/${p.slug}`} title="Voir" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                                                    <Eye size={13} />
                                                </Link>
                                                {p.status !== 'active' && (
                                                    <button onClick={() => handleUpdateStatus(p.id, 'active')} title="Approuver" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bbf7d0', borderRadius: 'var(--radius-sm)', background: '#f0fdf4', cursor: 'pointer', color: '#22c55e' }}>
                                                        <Check size={13} />
                                                    </button>
                                                )}
                                                {p.status !== 'flagged' && (
                                                    <button onClick={() => handleUpdateStatus(p.id, 'flagged')} title="Signaler" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fed7aa', borderRadius: 'var(--radius-sm)', background: '#fff7ed', cursor: 'pointer', color: '#f97316' }}>
                                                        <Flag size={13} />
                                                    </button>
                                                )}
                                                {p.status !== 'rejected' && (
                                                    <button onClick={() => handleUpdateStatus(p.id, 'rejected')} title="Rejeter" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fecaca', borderRadius: 'var(--radius-sm)', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>
                                                        <X size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expandable image panel */}
                                        {isImageOpen && (
                                            <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: '#f8fafc' }}>
                                                <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#1e40af' }}>📸 Gestion des images du produit</p>

                                                {/* Current images */}
                                                {p.images && p.images.length > 0 ? (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                                        {p.images.map((img, i) => (
                                                            <div key={i} style={{ position: 'relative' }}>
                                                                <img src={img} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)' }} />
                                                                <button
                                                                    onClick={() => handleRemoveImage(p, img)}
                                                                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', border: '2px solid white', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                                                                    title="Supprimer cette image"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Aucune image pour ce produit.</p>
                                                )}

                                                {/* Add image URL */}
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input
                                                        type="url"
                                                        placeholder="https://... coller le lien de la photo"
                                                        value={imageInputs[p.id] || ''}
                                                        onChange={e => setImageInputs(v => ({ ...v, [p.id]: e.target.value }))}
                                                        className="input-base"
                                                        style={{ flex: 1, fontSize: '13px' }}
                                                        onKeyDown={e => { if (e.key === 'Enter') handleAddImage(p); }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddImage(p)}
                                                        disabled={imageLoading === p.id || !imageInputs[p.id]?.trim()}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: imageLoading === p.id ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', opacity: imageLoading === p.id || !imageInputs[p.id]?.trim() ? 0.6 : 1 }}
                                                    >
                                                        {imageLoading === p.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                                                        Ajouter
                                                    </button>
                                                </div>
                                                {/* Preview of typed URL */}
                                                {imageInputs[p.id] && (
                                                    <img src={imageInputs[p.id]} alt="preview" style={{ marginTop: '8px', height: '60px', width: 'auto', maxWidth: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                )}
                                                {msg?.text && (
                                                    <p style={{ marginTop: '8px', fontSize: '13px', color: msg.type === 'ok' ? '#16a34a' : '#b91c1c', fontWeight: 600 }}>{msg.text}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
