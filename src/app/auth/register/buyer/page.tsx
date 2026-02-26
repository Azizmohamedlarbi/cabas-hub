'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, Mail, Star } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';

const STEPS = ['Compte', 'Préférences'];

export default function RegisterBuyerPage() {
    const router = useRouter();
    const { signUp } = useAuthStore();
    const [step, setStep] = useState(0);
    const [earlyAdopterCount, setEarlyAdopterCount] = useState<number | null>(null);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '',
        wilaya: '', buyerType: '' as 'individual' | 'business' | '',
        cgAccepted: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        db.getEarlyAdopterCount('buyer').then(setEarlyAdopterCount);
    }, []);

    const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const handleFinish = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await signUp(form.email, form.password, {
                first_name: form.firstName,
                last_name: form.lastName,
                user_type: 'buyer',
                buyer_type: form.buyerType,
            });
            if (res.success) {
                if (res.needsEmailConfirmation) {
                    setSubmitted(true); // Show check-email screen
                } else {
                    router.push('/dashboard/buyer'); // Email confirmation disabled, logged in immediately
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

    // ── Post-signup: ask user to check their email ─────────────────
    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ maxWidth: '460px', width: '100%', background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--radius-xl)', padding: '48px 36px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '24px' }}>
                        <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <div style={{ width: '76px', height: '76px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}>
                        <Mail size={36} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>Confirmez votre email 📧</h1>
                    <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '10px' }}>
                        Un email de confirmation a été envoyé à :
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#1d4ed8', marginBottom: '20px', wordBreak: 'break-all' }}>{form.email}</p>
                    <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                        <p style={{ fontWeight: 700, fontSize: '13px', color: '#1e40af', marginBottom: '10px' }}>📋 Étapes à suivre :</p>
                        {['Ouvrez votre boîte mail', 'Cherchez un email de Cabas Hub', 'Cliquez sur le lien « Confirmer mon compte »', 'Vous serez redirigé vers la plateforme', 'Connectez-vous avec vos identifiants'].map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ width: '22px', height: '22px', background: '#1d4ed8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{i + 1}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#374151' }}>{step}</p>
                            </div>
                        ))}
                    </div>
                    <Link href="/auth/login" style={{ display: 'block', padding: '13px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
                        🔑 J&apos;ai confirmé → Me connecter
                    </Link>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Vérifiez aussi dans vos spams si vous ne trouvez pas l&apos;email.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
                        <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Créer un compte acheteur</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Accédez à +1000 produits importés</p>

                    {earlyAdopterCount !== null && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(29,78,216,0.15))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-full)', color: '#1d4ed8', fontSize: '14px', fontWeight: 600 }}>
                            <Star size={16} fill="currentColor" />
                            {Math.max(0, 500 - earlyAdopterCount)} / 500 places Early Adopter restantes
                        </div>
                    )}
                </div>

                {/* Step bar */}
                <div style={{ display: 'flex', marginBottom: '24px' }}>
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

                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-md)' }}>
                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px' }}>Informations personnelles</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Field label="Prénom" value={form.firstName} onChange={v => set('firstName', v)} placeholder="Salima" />
                                <Field label="Nom" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Bouali" />
                            </div>
                            <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="salima@exemple.dz" />
                            <Field label="Téléphone" value={form.phone} onChange={v => set('phone', v)} placeholder="+213550001122" />
                            <Field label="Mot de passe" type="password" value={form.password} onChange={v => set('password', v)} placeholder="••••••••" />
                            <button onClick={() => setStep(1)} style={{ padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '4px' }}>
                                Continuer →
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '18px' }}>Préférences</h2>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Je suis un(e):</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[{ id: 'individual', label: '👤 Particulier', desc: 'Achats personnels' }, { id: 'business', label: '🏢 Professionnel', desc: 'Revendeur / commerçant' }].map(opt => (
                                        <button key={opt.id} onClick={() => set('buyerType', opt.id)} style={{ padding: '14px', border: `2px solid ${form.buyerType === opt.id ? 'var(--secondary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: form.buyerType === opt.id ? 'var(--secondary-bg)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{opt.label}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.cgAccepted} onChange={e => set('cgAccepted', e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--primary)' }} />
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>J&apos;accepte les <Link href="#" style={{ color: 'var(--primary)' }}>CGU</Link> et la <Link href="#" style={{ color: 'var(--primary)' }}>Politique de confidentialité</Link></span>
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setStep(0)} style={{ flex: '0 0 auto', padding: '12px 20px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>← Retour</button>
                                <button onClick={handleFinish} disabled={!form.cgAccepted || loading} style={{ flex: 1, padding: '12px', background: form.cgAccepted && !loading ? 'var(--primary)' : '#d1d5db', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', cursor: form.cgAccepted && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {loading ? 'Création...' : '🚀 Créer mon compte'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <ShieldCheck size={12} style={{ color: 'var(--primary)' }} /> Inscription sécurisée
                </div>
                <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Vous êtes vendeur? <Link href="/auth/register/seller" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inscrivez-vous ici</Link>
                </p>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-base" />
        </div>
    );
}
