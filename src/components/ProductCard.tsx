'use client';
import Link from 'next/link';
import { Heart, Star, ShieldCheck, Package, Truck } from 'lucide-react';
import { useState } from 'react';
import { formatDZD } from '@/lib/utils';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: Product;
    view?: 'grid' | 'list';
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [favorited, setFavorited] = useState(false);
    const [imgError, setImgError] = useState(false);
    const addItem = useCartStore(s => s.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        addItem(product, 1, 'retail');
    };

    if (view === 'list') {
        return (
            <Link href={`/products/${product.slug}`} style={{ display: 'flex', gap: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.2s', overflow: 'hidden' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <img src={imgError ? 'https://placehold.co/120x120?text=Image' : product.images[0]} alt={product.title} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} onError={() => setImgError(true)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.description}</p>
                    <Stars rating={product.rating_average} count={product.rating_count} />
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{formatDZD(product.price_retail)}</span>
                        {!product.retail_only && product.price_wholesale && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gros: {formatDZD(product.price_wholesale)}</span>}
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

            {/* Image */}
            <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block', position: 'relative', paddingTop: '75%', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                <img
                    src={imgError ? 'https://placehold.co/400x300?text=Image' : product.images[0]}
                    alt={product.title}
                    onError={() => setImgError(true)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                {/* Badges */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {product.wholesale_only && <span className="badge badge-blue">Grossiste</span>}
                    {product.pre_order && <span className="badge badge-orange">Pré-commande</span>}
                    {product.negotiable && <span className="badge badge-gray">Négociable</span>}
                </div>
                {/* Favorite button */}
                <button onClick={e => { e.preventDefault(); setFavorited(!favorited); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <Heart size={15} fill={favorited ? '#ef4444' : 'none'} color={favorited ? '#ef4444' : '#94a3b8'} />
                </button>
            </Link>

            {/* Content */}
            <div style={{ padding: '14px' }}>
                {/* Category + country */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{product.categories?.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🌍 {product.origin_country}</span>
                </div>

                {/* Title */}
                <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4', minHeight: '40px' }}>
                        {product.title}
                    </h3>
                </Link>

                {/* Rating */}
                <Stars rating={product.rating_average} count={product.rating_count} />

                {/* Price */}
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)' }}>{formatDZD(product.price_retail)}</span>
                        {!product.retail_only && product.price_wholesale && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gros: {formatDZD(product.price_wholesale)}</span>
                        )}
                    </div>
                </div>

                {/* Seller + shipping */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Link href={`/sellers/${product.seller_id}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                        <img src={product.profiles?.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{product.profiles?.first_name}</span>
                        {product.profiles?.anae_verified && <span title="ANAE Vérifié" style={{ display: 'inline-flex', alignItems: 'center' }}><ShieldCheck size={12} style={{ color: 'var(--primary)' }} /></span>}
                        {product.profiles?.plan === 'pro' && <span title="Vendeur Pro" style={{ background: 'linear-gradient(135deg, #0f172a, #334155)', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>PRO</span>}
                        {product.profiles?.is_founder && <span title="Membre Fondateur" style={{ background: 'linear-gradient(135deg, #eab308, #d97706)', color: 'white', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>FONDATEUR</span>}
                    </Link>
                    <span style={{ fontSize: '11px', color: product.shipping_included ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <Truck size={11} style={{ display: 'inline' }} /> {product.shipping_included ? 'Livraison incluse' : `+${formatDZD(product.shipping_cost || 0)}`}
                    </span>
                </div>

                {/* Add to cart */}
                <button onClick={handleAddToCart} style={{ width: '100%', padding: '9px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s, transform 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                    <Package size={13} /> Ajouter au panier
                </button>
            </div>
        </div>
    );
}

export function Stars({ rating, count }: { rating: number; count: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={12} fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} color={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rating.toFixed(1)} ({count})</span>
        </div>
    );
}
