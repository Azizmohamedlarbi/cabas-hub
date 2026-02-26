'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, Tag, Loader2 } from 'lucide-react';
// DashboardSidebar moved to @/components/layout/DashboardSidebar
import { WILAYAS } from '@/lib/mock-data';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { useEffect } from 'react';

const CONDITIONS = ['Neuf', 'Neuf en boîte', 'Reconditionné', 'Occasion'];

export default function NewProductPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<any[]>([]);
    const [form, setForm] = useState({
        title: '', description: '', categoryId: '', condition: 'Neuf',
        priceRetail: '', priceWholesale: '', minOrderWholesale: '10',
        stock: '', weight: '', wilayas: [] as string[], tags: '',
        wholesaleOnly: false,
    });
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        db.getCategories().then(setCategories).catch(console.error);
    }, []);

    const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));
    const toggleWilaya = (w: string) => setForm(f => ({ ...f, wilayas: f.wilayas.includes(w) ? f.wilayas.filter(x => x !== w) : [...f.wilayas, w] }));

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const productData = {
                seller_id: user.id,
                category_id: form.categoryId ? parseInt(form.categoryId) : null,
                title: form.title,
                slug: `${slugify(form.title)}-${Date.now().toString(36)}`,
                description: form.description,
                price_retail: parseFloat(form.priceRetail),
                price_wholesale: form.priceWholesale ? parseFloat(form.priceWholesale) : null,
                quantity: parseInt(form.stock),
                min_order_quantity: parseInt(form.minOrderWholesale),
                wholesale_only: form.wholesaleOnly,
                wilaya_coverage: form.wilayas,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: 'pending', // All new products start as pending for admin approval
                images: [],
                specifications: { condition: form.condition, weight: form.weight }
            };

            await db.createProduct(productData);
            setSubmitted(true);
            setTimeout(() => router.push('/dashboard/seller/products'), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erreur lors de la publication du produit');
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', maxWidth: '420px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Produit publié !</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>En cours de validation. Pour ajouter des images :</p>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px', color: '#1d4ed8', textAlign: 'left', lineHeight: '1.6' }}>
                        📸 Allez dans <strong>Mes Produits</strong> → cliquez sur <strong>"Gérer les images"</strong> de ce produit pour soumettre vos photos.
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>Redirection automatique...</p>
                </div>
            </div>
        );
    }

    const STEPS = ['Informations', 'Prix & Stock', 'Livraison', 'Aperçu'];

    return (
        <main style={{ padding: '28px 24px', maxWidth: '760px' }}>
            {/* Back link */}
            <Link href="/dashboard/seller/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px' }}>
                <ArrowLeft size={15} /> Retour aux produits
            </Link>

            <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>➕ Nouveau produit</h1>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '28px' }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {i > 0 && <div style={{ position: 'absolute', left: '-50%', top: '15px', width: '100%', height: '2px', background: i <= step ? 'var(--primary)' : 'var(--border)' }} />}
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i < step ? 'var(--primary)' : i === step ? 'var(--primary)' : 'white', border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, color: i <= step ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>
                            {i < step ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '11px', marginTop: '5px', color: i === step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
                    </div>
                ))}
            </div>

            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                {/* Step 0: Informations */}
                {step === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '17px' }}>📝 Informations générales</h2>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Titre du produit *</label>
                            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: AirPods Pro 2 – Original Apple" className="input-base" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Description *</label>
                            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Décrivez votre produit en détail..." className="input-base" rows={4} style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Catégorie *</label>
                                <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="input-base">
                                    <option value="">Sélectionner</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>État</label>
                                <select value={form.condition} onChange={e => set('condition', e.target.value)} className="input-base">
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Photos section */}
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Photos du produit</label>
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '20px', flexShrink: 0 }}>📸</span>
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>Les images sont ajoutées après la création</p>
                                    <p style={{ fontSize: '12px', color: '#3b82f6', lineHeight: '1.5' }}>
                                        Une fois le produit publié, allez dans <strong>Mes Produits</strong> et cliquez sur <strong>"Gérer les images"</strong> pour soumettre vos photos via lien direct ou par email.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}><Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />Tags (séparés par des virgules)</label>
                            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="apple, airpods, écouteurs, original" className="input-base" />
                        </div>
                    </div>
                )}

                {/* Step 1: Prix & Stock */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '17px' }}>💰 Prix & Stock</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Prix détail (DA) *</label>
                                <input type="number" value={form.priceRetail} onChange={e => set('priceRetail', e.target.value)} placeholder="15000" className="input-base" />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Prix gros (DA)</label>
                                <input type="number" value={form.priceWholesale} onChange={e => set('priceWholesale', e.target.value)} placeholder="12000" className="input-base" />
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="wholesale-only" checked={form.wholesaleOnly} onChange={e => set('wholesaleOnly', e.target.checked)} />
                            <label htmlFor="wholesale-only" style={{ fontSize: '14px', cursor: 'pointer' }}>
                                <strong>Vente en gros uniquement</strong> — masquer le prix détail
                            </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quantité en stock *</label>
                                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="50" className="input-base" />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Min. commande gros</label>
                                <input type="number" value={form.minOrderWholesale} onChange={e => set('minOrderWholesale', e.target.value)} className="input-base" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Livraison */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '17px' }}>🚚 Livraison</h2>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Poids estimé (kg)</label>
                            <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="0.5" className="input-base" />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Wilayas de livraison disponibles</label>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                <button type="button" onClick={() => setForm(f => ({ ...f, wilayas: WILAYAS }))} style={{ padding: '5px 12px', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-full)', background: 'var(--primary-bg)', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                    ✓ Toutes
                                </button>
                                <button type="button" onClick={() => setForm(f => ({ ...f, wilayas: [] }))} style={{ padding: '5px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', background: 'white', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                                    <X size={12} style={{ display: 'inline' }} /> Aucune
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                                {WILAYAS.map(w => (
                                    <button key={w} type="button" onClick={() => toggleWilaya(w)} style={{ padding: '4px 10px', border: '1.5px solid', borderColor: form.wilayas.includes(w) ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', background: form.wilayas.includes(w) ? 'var(--primary-bg)' : 'white', color: form.wilayas.includes(w) ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: form.wilayas.includes(w) ? 600 : 400 }}>
                                        {w}
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{form.wilayas.length} wilaya(s) sélectionnée(s)</p>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '17px' }}>👁 Aperçu avant publication</h2>
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <tbody>
                                    {[
                                        ['Titre', form.title || '—'],
                                        ['Catégorie', categories.find(c => String(c.id) === form.categoryId)?.name || '—'],
                                        ['État', form.condition],
                                        ['Prix détail', form.priceRetail ? `${form.priceRetail} DA` : '—'],
                                        ['Prix gros', form.priceWholesale ? `${form.priceWholesale} DA` : '—'],
                                        ['Stock', form.stock || '—'],
                                        ['Wilayas', form.wilayas.length > 0 ? `${form.wilayas.length} wilaya(s)` : 'Aucune sélectionnée'],
                                    ].map(([k, v]) => (
                                        <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)', width: '40%' }}>{k}</td>
                                            <td style={{ padding: '10px 0', color: 'var(--text-primary)' }}>{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {error && (
                            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px', color: '#b91c1c', marginBottom: '16px' }}>
                                ❌ {error}
                            </div>
                        )}
                        {!form.title && (
                            <div style={{ background: '#fef3cd', border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px', color: '#92400e' }}>
                                ⚠️ Veuillez renseigner au moins le titre et la catégorie avant de publier.
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', gap: '10px' }}>
                    {step > 0 ? (
                        <button onClick={() => setStep(s => s - 1)} disabled={loading} style={{ padding: '11px 24px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
                            ← Retour
                        </button>
                    ) : <div />}
                    {step < STEPS.length - 1 ? (
                        <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
                            Continuer →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!form.title || loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: form.title && !loading ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#d1d5db',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: form.title && !loading ? 'pointer' : 'not-allowed',
                                fontWeight: 700,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <Plus size={16} />
                            )}
                            {loading ? 'Publication...' : 'Publier le produit'}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
