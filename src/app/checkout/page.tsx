'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, Truck, CreditCard, MapPin, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatDZD, generateOrderNumber } from '@/lib/utils';
import { WILAYAS } from '@/lib/mock-data';
import { db } from '@/lib/db';

const STEPS = ['Panier', 'Adresse', 'Paiement'];

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clear, removeItem, updateQuantity } = useCartStore();
    const { user } = useAuthStore();
    const [step, setStep] = useState(0);
    const [address, setAddress] = useState({ street: '', city: '', wilaya: '', postal: '', phone: user?.phone ?? '' });
    const [payMethod, setPayMethod] = useState<'cib' | 'cash'>('cib');
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    const shipping = items.some(i => !i.product.shipping_included) ? 500 : 0;
    const total = totalPrice() + shipping;

    useEffect(() => {
        if (!user) {
            router.push('/auth/login?redirect=/checkout');
        }
    }, [user, router]);

    const handlePlaceOrder = async () => {
        if (!user || items.length === 0) return;
        setPlacing(true);
        setError('');
        try {
            // Group items by seller
            const itemsBySeller: Record<string, typeof items> = {};
            items.forEach(item => {
                const sId = item.product.seller_id;
                if (!itemsBySeller[sId]) itemsBySeller[sId] = [];
                itemsBySeller[sId].push(item);
            });

            // Create an order for each seller
            for (const sellerId in itemsBySeller) {
                const sellerItems = itemsBySeller[sellerId];
                const sellerSubtotal = sellerItems.reduce((sum, i) => {
                    const price = i.priceType === 'wholesale' ? (i.product.price_wholesale || i.product.price_retail) : i.product.price_retail;
                    return sum + price * i.quantity;
                }, 0);
                const sellerShipping = sellerItems.some(i => !i.product.shipping_included) ? 500 : 0;

                const orderData = {
                    order_number: generateOrderNumber(),
                    buyer_id: user.id,
                    seller_id: sellerId,
                    total_amount: sellerSubtotal + sellerShipping,
                    payment_method: payMethod,
                    shipping_address: address,
                    status: 'pending'
                };

                const orderItems = sellerItems.map(i => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    price_at_purchase: i.priceType === 'wholesale' ? (i.product.price_wholesale || i.product.price_retail) : i.product.price_retail,
                    title_at_purchase: i.product.title
                }));

                await db.createOrder(orderData, orderItems);
            }

            clear();
            router.push('/checkout/success');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erreur lors de la validation de la commande');
            setPlacing(false);
        }
    };

    if (items.length === 0 && step === 0) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ fontSize: '64px' }}>🛒</div>
                <h2 style={{ fontWeight: 700, fontSize: '22px' }}>Votre panier est vide</h2>
                <Link href="/products" style={{ padding: '12px 28px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}>Découvrir les produits</Link>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', padding: '28px 20px' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Steps */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {i > 0 && <div style={{ position: 'absolute', left: '-50%', top: '15px', width: '100%', height: '2px', background: i <= step ? 'var(--primary)' : 'var(--border)' }} />}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i <= step ? 'var(--primary)' : 'white', border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, color: i <= step ? 'white' : 'var(--text-muted)', fontSize: '13px', fontWeight: 700 }}>
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6 items-start">
                    {/* Main panel */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px' }}>
                        {/* Step 0: Cart review */}
                        {step === 0 && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontWeight: 700, fontSize: '18px' }}>🛒 Récapitulatif du panier</h2>
                                    <button
                                        onClick={() => { if (confirm('Vider tout le panier ?')) clear(); }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Trash2 size={14} /> Vider le panier
                                    </button>
                                </div>
                                {items.map(item => (
                                    <div key={item.product.id} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px', alignItems: 'center' }}>
                                        <img src={item.product.images[0]} alt="" style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.product.title}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.priceType === 'wholesale' ? 'Gros' : 'Détail'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2px 8px', gap: '8px' }}>
                                                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
                                                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
                                                </div>
                                                <button onClick={() => removeItem(item.product.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover-text-danger">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>
                                            {formatDZD((item.priceType === 'wholesale' ? (item.product.price_wholesale || item.product.price_retail) : item.product.price_retail) * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                                <button onClick={() => setStep(1)} style={{ width: '100%', padding: '13px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
                                    Continuer → Adresse livraison
                                </button>
                            </>
                        )}

                        {/* Step 1: Address */}
                        {step === 1 && (
                            <>
                                <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>📍 Adresse de livraison</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <Field label="Rue / Adresse complète" value={address.street} onChange={v => setAddress(a => ({ ...a, street: v }))} placeholder="12 Rue des Acacias, Hydra" />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <Field label="Ville" value={address.city} onChange={v => setAddress(a => ({ ...a, city: v }))} placeholder="Alger" />
                                        <div>
                                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Wilaya</label>
                                            <select value={address.wilaya} onChange={e => setAddress(a => ({ ...a, wilaya: e.target.value }))} className="input-base">
                                                <option value="">Choisir</option>
                                                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <Field label="Téléphone contact" value={address.phone} onChange={v => setAddress(a => ({ ...a, phone: v }))} placeholder="+213770001122" />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                        <button onClick={() => setStep(0)} style={{ flex: '0 0 auto', padding: '12px 24px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>← Retour</button>
                                        <button onClick={() => setStep(2)} style={{ flex: 1, padding: '13px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Continuer → Paiement</button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <>
                                <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>💳 Mode de paiement</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    {[
                                        { id: 'cib', icon: <CreditCard size={20} />, title: 'Paiement CIB (Satim)', desc: 'Carte interbancaire algérienne – Sécurisé et instantané', color: 'var(--secondary)' },
                                        { id: 'cash', icon: <Truck size={20} />, title: 'Paiement à la livraison', desc: 'Payez cash lors de la réception de votre commande', color: 'var(--accent)' },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setPayMethod(opt.id as 'cib' | 'cash')} style={{ display: 'flex', gap: '12px', padding: '16px', border: `2px solid ${payMethod === opt.id ? opt.color : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', background: payMethod === opt.id ? (opt.id === 'cib' ? 'var(--secondary-bg)' : 'var(--accent-bg)') : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: payMethod === opt.id ? opt.color : 'var(--bg-secondary)', color: payMethod === opt.id ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{opt.icon}</div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '15px' }}>{opt.title}</p>
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</p>
                                            </div>
                                            {payMethod === opt.id && <Check size={18} style={{ color: opt.color, marginLeft: 'auto', alignSelf: 'center' }} />}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ background: 'var(--primary-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                                    <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Votre paiement est protégé par le système <strong>Escrow CABAS HUB</strong>. Votre argent n&apos;est libéré qu&apos;à la confirmation de livraison.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setStep(1)} disabled={placing} style={{ flex: '0 0 auto', padding: '12px 24px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: placing ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: placing ? 0.7 : 1 }}>← Retour</button>
                                    <button onClick={handlePlaceOrder} disabled={placing} style={{ flex: 1, padding: '13px', background: placing ? '#d1d5db' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', cursor: placing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {placing && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                                        {placing ? 'Confirmation...' : `✅ Confirmer la commande · ${formatDZD(total)}`}
                                    </button>
                                </div>
                                {error && (
                                    <div style={{ marginTop: '16px', padding: '12px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '13px' }}>
                                        ❌ {error}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Order summary */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '20px', position: 'sticky', top: '90px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>📋 Récapitulatif</h3>
                        {items.map(i => (
                            <div key={i.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '8px' }}>{i.product.title.slice(0, 25)}... ×{i.quantity}</span>
                                <span style={{ fontWeight: 600, flexShrink: 0 }}>{formatDZD((i.priceType === 'wholesale' ? (i.product.price_wholesale || i.product.price_retail) : i.product.price_retail) * i.quantity)}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                <span>Sous-total</span><span>{formatDZD(totalPrice())}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                <span>Livraison</span><span style={{ color: shipping === 0 ? 'var(--primary)' : 'inherit' }}>{shipping === 0 ? 'Gratuite' : formatDZD(shipping)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '17px' }}>
                                <span>Total</span><span style={{ color: 'var(--primary)' }}>{formatDZD(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-base" />
        </div>
    );
}
