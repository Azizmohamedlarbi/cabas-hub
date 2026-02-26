'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Star, Heart, MessageCircle, Truck, Package, ChevronLeft, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { REVIEWS } from '@/lib/mock-data';
import { formatDZD, formatDate } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { Stars } from '@/components/ProductCard';
import { db } from '@/lib/db';
import { Product } from '@/types';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [imgIndex, setImgIndex] = useState(0);
    const [priceType, setPriceType] = useState<'wholesale' | 'retail'>('retail');
    const [qty, setQty] = useState(1);
    const [favorited, setFavorited] = useState(false);
    const addItem = useCartStore(s => s.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await db.getProductBySlug(params.slug as string);
                setProduct(data);
                setQty(data.min_order_quantity || 1);

                // Fetch reviews
                const revs = await db.getReviews(data.id);
                setReviews(revs);

                // Fetch favorite status if user is logged in
                if (user) {
                    const favorites = await db.getFavorites(user.id);
                    setFavorited(favorites.some(f => f.id === data.id));
                }
            } catch (error) {
                console.error('Product not found:', error);
            } finally {
                setLoading(false);
            }
        };
        if (params.slug) fetchProduct();
    }, [params.slug, user]);

    const handleToggleFavorite = async () => {
        if (!user || !product) {
            router.push('/auth/login');
            return;
        }
        try {
            const newState = await db.toggleFavorite(product.id, user.id);
            setFavorited(newState);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!product) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center', fontWeight: 600 }}>Produit non trouvé</div>;

    // Reject regular buyers from viewing non-active products
    if (product.status !== 'active') {
        const isOwner = user?.id === product.seller_id;
        const isAdmin = user?.userType === 'admin';

        if (!isOwner && !isAdmin) {
            return (
                <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '20px' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border)', maxWidth: '400px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Produit indisponible</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Ce produit est en cours de vérification ou n'est plus disponible.</p>
                        <button onClick={() => router.push('/products')} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Retour aux produits</button>
                    </div>
                </div>
            );
        }
    }

    const price = priceType === 'wholesale' ? (product.price_wholesale || product.price_retail) : product.price_retail;

    return (
        <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
            {/* Breadcrumb */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 20px' }}>
                <div className="container" style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</Link>
                    <span>›</span>
                    <Link href="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Produits</Link>
                    <span>›</span>
                    <Link href={`/products?category=${product.category_id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{product.categories?.name}</Link>
                    <span>›</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.title}</span>
                </div>
            </div>

            <div className="container" style={{ padding: '24px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
                    {/* Left: Images */}
                    <div>
                        {/* Main image */}
                        <div style={{ position: 'relative', background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1', marginBottom: '12px' }}>
                            <img
                                src={product.images[imgIndex] ?? 'https://placehold.co/600x600?text=Image'}
                                alt={product.title}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }}
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=Image'; }}
                            />
                            {product.images.length > 1 && (
                                <>
                                    <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={() => setImgIndex(i => Math.min(product.images.length - 1, i + 1))} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                        {/* Thumbnails */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {product.images.slice(0, 5).map((img, i) => (
                                <button key={i} onClick={() => setImgIndex(i)} style={{ width: '72px', height: '72px', border: `2px solid ${imgIndex === i ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', background: 'white', padding: '4px', flexShrink: 0 }}>
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <span className="badge badge-gray">🌍 {product.origin_country}</span>
                            {product.negotiable && <span className="badge badge-orange">Négociable</span>}
                            {product.pre_order && <span className="badge badge-blue">Pré-commande</span>}
                            {product.quantity > 0 ? <span className="badge badge-green">✅ En stock ({product.quantity})</span> : <span className="badge badge-red">❌ Rupture</span>}
                        </div>

                        <h1 style={{ fontSize: '22px', fontWeight: 800, lineHeight: '1.3', marginBottom: '12px' }}>{product.title}</h1>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Stars rating={product.rating_average} count={product.rating_count} />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{product.views.toLocaleString()} vues</span>
                            <button onClick={handleToggleFavorite} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '5px 12px', background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: favorited ? '#ef4444' : 'var(--text-secondary)', borderColor: favorited ? '#ef4444' : 'var(--border)', transition: 'all 0.15s' }}>
                                <Heart size={13} fill={favorited ? '#ef4444' : 'none'} color={favorited ? '#ef4444' : 'currentColor'} /> {favorited ? 'Sauvegardé' : 'Sauvegarder'}
                            </button>
                        </div>

                        {/* Price tabs */}
                        {!product.retail_only && product.price_wholesale && (
                            <div style={{ display: 'flex', gap: '0', marginBottom: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <button onClick={() => setPriceType('retail')} style={{ flex: 1, padding: '10px', border: 'none', background: priceType === 'retail' ? 'var(--primary)' : 'white', color: priceType === 'retail' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.15s' }}>
                                    Prix Détail
                                </button>
                                <button onClick={() => setPriceType('wholesale')} style={{ flex: 1, padding: '10px', border: 'none', background: priceType === 'wholesale' ? 'var(--secondary)' : 'white', color: priceType === 'wholesale' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.15s' }}>
                                    Prix Gros
                                </button>
                            </div>
                        )}

                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                            <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', lineHeight: '1' }}>{formatDZD(price)}</p>
                            {priceType === 'wholesale' && product.min_order_quantity > 1 && (
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Min. commande : {product.min_order_quantity} pièces</p>
                            )}
                        </div>

                        {/* Quantity + cart */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <button onClick={() => setQty(q => Math.max(product.min_order_quantity || 1, q - 1))} style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>−</button>
                                <span style={{ padding: '0 16px', fontWeight: 700, fontSize: '16px' }}>{qty}</span>
                                <button onClick={() => setQty(q => q + 1)} style={{ padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}>+</button>
                            </div>
                            <button
                                onClick={() => {
                                    if (!user) { router.push('/auth/login'); return; }
                                    addItem(product, qty, priceType);
                                }}
                                className="hover-opacity"
                                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.15s' }}
                            >
                                <Package size={16} /> Ajouter au panier
                            </button>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
                            Total: {formatDZD(price * qty)}
                        </div>

                        {/* Contact seller */}
                        <button
                            disabled={user?.id === product.seller_id}
                            onClick={async () => {
                                if (!user) { router.push('/auth/login'); return; }
                                try {
                                    const convId = await (await import('@/lib/messages')).getOrCreateConversation(user.id, product.seller_id);
                                    router.push(`/messages?conv=${convId}`);
                                } catch (err) {
                                    console.error(err);
                                    alert('Erreur lors de la création de la conversation');
                                }
                            }}
                            className="hover-bg-secondary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', border: '1.5px solid var(--secondary)', borderRadius: 'var(--radius-md)', background: 'white', color: 'var(--secondary)', fontWeight: 600, fontSize: '14px', marginBottom: '20px', transition: 'all 0.15s', cursor: 'pointer' }}
                        >
                            <MessageCircle size={16} /> Contacter le vendeur
                        </button>

                        {/* Shipping info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                <Truck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                <span><strong>Livraison:</strong> {product.shipping_included ? '✅ Gratuite incluse' : `${formatDZD(product.shipping_cost || 0)}`}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                <Package size={14} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                                <span><strong>Délai:</strong> {product.delivery_time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                                <MapPin size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                                <span><strong>Wilayas:</strong> {product.wilaya_coverage?.join(', ')}</span>
                            </div>
                        </div>

                        {/* Seller */}
                        <Link href={`/sellers/${product.seller_id}`} className="hover-border-primary" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}>
                            <img src={product.profiles?.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{product.profiles?.first_name} {product.profiles?.last_name}</span>
                                    {product.profiles?.anae_verified && <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{product.profiles?.business_name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{product.profiles?.rating_average}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({product.profiles?.rating_count} avis) · {product.profiles?.total_sales} ventes</span>
                                </div>
                            </div>
                            <span style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>Voir profil →</span>
                        </Link>
                    </div>
                </div>

                {/* Description */}
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginTop: '24px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>📝 Description</h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{product.description}</p>
                    {product.tags && product.tags.length > 0 && (
                        <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {product.tags.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', marginTop: '16px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>⭐ Avis Clients ({reviews.length})</h2>
                    {reviews.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aucun avis pour ce produit.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {reviews.map(rev => (
                                <div key={rev.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <img src={rev.profiles?.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{rev.profiles?.first_name} {rev.profiles?.last_name}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(rev.created_at)}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px', marginTop: '4px', marginBottom: '8px' }}>
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} fill={s <= rev.rating ? '#f59e0b' : 'none'} color={s <= rev.rating ? '#f59e0b' : '#d1d5db'} />)}
                                            </div>
                                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{rev.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
