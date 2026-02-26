'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.success) {
                const { user } = useAuthStore.getState();
                if (user?.userType === 'admin') router.push('/admin');
                else if (user?.userType === 'seller') router.push('/dashboard/seller');
                else router.push('/dashboard/buyer');
            } else {
                setError(res.error || 'Identifiants invalides');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                        <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '85px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <h1 style={{ marginTop: '20px', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Connexion</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Accédez à votre compte</p>
                </div>

                <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
                    {/* Demo quick login */}
                    <div style={{ background: 'var(--primary-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '8px' }}>🧪 Comptes démo disponibles</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setEmail('karim@ktech.dz'); setPassword('Demo1234'); }} style={{ flex: 1, padding: '7px', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                                🏪 Vendeur Demo
                            </button>
                            <button onClick={() => { setEmail('salima@gmail.com'); setPassword('Demo1234'); }} style={{ flex: 1, padding: '7px', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                                🛍️ Acheteur Demo
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Email ou Téléphone</label>
                            <input type="text" value={email} onChange={e => setEmail(e.target.value)} required className="input-base" placeholder="karim@ktech.dz ou +213770001122" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input-base" placeholder="••••••••" style={{ paddingRight: '40px' }} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {error && <p style={{ color: 'var(--error)', fontSize: '13px', background: '#fef2f2', padding: '10px', borderRadius: 'var(--radius-md)' }}>⚠️ {error}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Link href="/auth/forgot-password" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>Mot de passe oublié?</Link>
                        </div>
                        <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: loading ? '#d1d5db' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s' }}>
                            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Connexion...</> : 'Se connecter'}
                        </button>
                    </form>

                    <div className="divider-text" style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span>Pas encore membre?</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Link href="/auth/register/seller" className="hover-border-primary" style={{ padding: '10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', transition: 'border-color 0.15s' }}>
                            🏪 Devenir Vendeur
                        </Link>
                        <Link href="/auth/register/buyer" className="hover-border-secondary" style={{ padding: '10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', transition: 'border-color 0.15s' }}>
                            🛍️ Créer un compte
                        </Link>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <ShieldCheck size={13} style={{ color: 'var(--primary)' }} /> Connexion sécurisée SSL – CABAS HUB 🇩🇿
                </div>
            </div>
        </div>
    );
}
