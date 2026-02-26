'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, Upload, Mail, Star } from 'lucide-react';
import { CATEGORIES, IMPORT_COUNTRIES, WILAYAS } from '@/lib/mock-data';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';

const STEPS = ['Compte', 'Adresse', 'Carte ANAE', 'Spécialités'];

export default function RegisterSellerPage() {
    const router = useRouter();
    const { signUp } = useAuthStore();
    const [step, setStep] = useState(0);
    const [earlyAdopterCount, setEarlyAdopterCount] = useState<number | null>(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '',
        street: '', city: '', wilaya: '', postal: '',
        anaeCard: '', anaePhoto: null as File | null,
        specialties: [] as string[], countries: [] as string[],
        cgAccepted: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        db.getEarlyAdopterCount('seller').then(setEarlyAdopterCount);
    }, []);

    const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const toggleArr = (k: 'specialties' | 'countries', v: string) => {
        setForm(f => ({
            ...f,
            [k]: (f[k] as string[]).includes(v) ? (f[k] as string[]).filter(x => x !== v) : [...(f[k] as string[]), v],
        }));
    };

    const handleFinish = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await signUp(form.email, form.password, {
                first_name: form.firstName,
                last_name: form.lastName,
                user_type: 'seller',
                phone: form.phone,
                address_city: form.city,
                address_wilaya: form.wilaya,
                anae_card: form.anaeCard,
                specialties: form.specialties,
                import_countries: form.countries,
            });

            if (res.success) {
                if (res.needsEmailConfirmation) {
                    setSubmitted(true); // Show check-email screen
                } else {
                    router.push('/dashboard/seller'); // Email confirmation disabled
                }
            } else {
                setError(res.error || 'Une erreur est survenue');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    // ── Post-signup: ask seller to check their email ─────────────────
    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ maxWidth: '480px', width: '100%', background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--radius-xl)', padding: '48px 36px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '24px' }}>
                        <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <div style={{ width: '76px', height: '76px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(34,197,94,0.4)' }}>
                        <Mail size={36} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>Confirmez votre email 📧</h1>
                    <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' }}>Un email de confirmation a été envoyé à :</p>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#16a34a', marginBottom: '20px', wordBreak: 'break-all' }}>{form.email}</p>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                        <p style={{ fontWeight: 700, fontSize: '13px', color: '#15803d', marginBottom: '10px' }}>📋 Étapes à suivre :</p>
                        {['Ouvrez votre boîte mail', 'Cherchez un email de Cabas Hub', 'Cliquez sur « Confirmer mon compte »', 'Revenez ici et connectez-vous'].map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ width: '22px', height: '22px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{i + 1}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#374151' }}>{step}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
                            ⏳ <strong>Vérification ANAE :</strong> Votre numéro de carte ANAE sera vérifié sous <strong>24-48h</strong> par notre équipe. Vous serez notifié par email.
                        </p>
                    </div>
                    <Link href="/auth/login" style={{ display: 'block', padding: '13px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
                        🔑 J&apos;ai confirmé → Me connecter
                    </Link>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Vérifiez aussi vos spams si vous ne trouvez pas l&apos;email.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
                        <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Inscription Vendeur</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Rejoignez 42 000+ micro-importateurs algériens</p>

                    {earlyAdopterCount !== null && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(245,158,11,0.15))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-full)', color: '#d97706', fontSize: '14px', fontWeight: 600 }}>
                            <Star size={16} fill="currentColor" />
                            {Math.max(0, 200 - earlyAdopterCount)} / 200 places Early Adopter restantes
                        </div>
                    )}
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', marginBottom: '28px', gap: '0' }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {i > 0 && <div style={{ position: 'absolute', left: '-50%', top: '15px', width: '100%', height: '2px', background: i <= step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i < step ? 'var(--primary)' : i === step ? 'var(--primary)' : 'white', border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 0.3s', fontSize: '13px', fontWeight: 700, color: i <= step ? 'white' : 'var(--text-muted)' }}>
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>{s}</span>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}
                    {/* Step 0: Account */}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>Informations de compte</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Field label="Prénom" value={form.firstName} onChange={v => set('firstName', v)} placeholder="Karim" required />
                                <Field label="Nom" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Bensalem" required />
                            </div>
                            <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="karim@exemple.dz" required />
                            <Field label="Téléphone (+213)" value={form.phone} onChange={v => set('phone', v)} placeholder="+213770001122" required />
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Mot de passe</label>
                                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 car, 1 maj, 1 chiffre" className="input-base" />
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Minimum 8 caractères, 1 majuscule, 1 chiffre</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Address */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>Adresse</h2>
                            <Field label="Rue / Adresse" value={form.street} onChange={v => set('street', v)} placeholder="12 Rue des Fleurs" />
                            <Field label="Ville" value={form.city} onChange={v => set('city', v)} placeholder="Alger" />
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Wilaya</label>
                                <select value={form.wilaya} onChange={e => set('wilaya', e.target.value)} className="input-base">
                                    <option value="">Sélectionner une wilaya</option>
                                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                            <Field label="Code Postal" value={form.postal} onChange={v => set('postal', v)} placeholder="16000" />
                        </div>
                    )}

                    {/* Step 2: ANAE */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>Carte ANAE 080100</h2>
                            <div style={{ background: 'var(--primary-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', gap: '10px' }}>
                                <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>Vérification ANAE obligatoire</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Votre numéro de carte sera vérifié sous 24-48h. Vous pourrez publier des produits après validation.</p>
                                </div>
                            </div>
                            <Field label="Numéro Carte ANAE (XXXX-XXXX-XXXX)" value={form.anaeCard} onChange={v => set('anaeCard', v)} placeholder="0801-XXXX-XXXX" />
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Photo de la Carte ANAE</label>
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '28px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'border-color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                                    <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        {form.anaePhoto ? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>✅ {form.anaePhoto.name}</span> : 'Cliquez pour uploader JPG/PNG (max 5MB)'}
                                    </p>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => set('anaePhoto', e.target.files?.[0] ?? null)} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Specialties */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>Spécialités & Pays</h2>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Catégories importées</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {CATEGORIES.map(cat => {
                                        const sel = form.specialties.includes(cat.name);
                                        return (
                                            <button key={cat.id} type="button" onClick={() => toggleArr('specialties', cat.name)} style={{ padding: '7px 14px', border: `1.5px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: sel ? 'var(--primary-bg)' : 'white', color: sel ? 'var(--primary-dark)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: sel ? 600 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                {cat.icon} {cat.name} {sel && <Check size={12} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Pays d&apos;importation</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {IMPORT_COUNTRIES.map(c => {
                                        const sel = form.countries.includes(c.name);
                                        return (
                                            <button key={c.code} type="button" onClick={() => toggleArr('countries', c.name)} style={{ padding: '7px 14px', border: `1.5px solid ${sel ? 'var(--secondary)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', background: sel ? 'var(--secondary-bg)' : 'white', color: sel ? 'var(--secondary-dark)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: sel ? 600 : 400, transition: 'all 0.15s' }}>
                                                {c.flag} {c.name} {sel && <Check size={12} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '8px' }}>
                                <input type="checkbox" checked={form.cgAccepted} onChange={e => set('cgAccepted', e.target.checked)} style={{ marginTop: '3px' }} />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>J&apos;accepte les <Link href="#" style={{ color: 'var(--primary)' }}>Conditions Générales d&apos;Utilisation</Link> et la <Link href="#" style={{ color: 'var(--primary)' }}>Politique de Confidentialité</Link></span>
                            </label>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
                        {step > 0 ? (
                            <button onClick={() => setStep(s => s - 1)} style={{ flex: '0 0 auto', padding: '11px 24px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                                ← Retour
                            </button>
                        ) : <div />}
                        {step < STEPS.length - 1 ? (
                            <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                                Continuer →
                            </button>
                        ) : (
                            <button onClick={handleFinish} disabled={!form.cgAccepted || loading} style={{ flex: 1, padding: '12px', background: form.cgAccepted && !loading ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#d1d5db', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: form.cgAccepted && !loading ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {loading ? 'Création...' : '🚀 Créer mon compte vendeur'}
                            </button>
                        )}
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Déjà inscrit? <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Se connecter</Link>
                </p>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
    return (
        <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="input-base" />
        </div>
    );
}
