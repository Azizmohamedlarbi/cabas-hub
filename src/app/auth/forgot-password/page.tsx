'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) setSent(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛒</div>
                        <span style={{ fontSize: '20px', fontWeight: 800 }}>CABAS<span style={{ color: 'var(--primary)' }}>HUB</span></span>
                    </Link>
                </div>

                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
                    {!sent ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ width: '56px', height: '56px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <Mail size={24} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Mot de passe oublié</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                                </p>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Adresse email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="votre@email.dz"
                                        required
                                        className="input-base"
                                    />
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                                    Envoyer le lien de réinitialisation
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle size={32} style={{ color: 'var(--primary)' }} />
                            </div>
                            <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '10px' }}>Email envoyé ! ✉️</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' }}>
                                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. Vérifiez votre boîte de réception (et les spams).
                            </p>
                            <button onClick={() => { setEmail(''); setSent(false); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                                Changer d&apos;adresse email →
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>
                            <ArrowLeft size={15} /> Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
