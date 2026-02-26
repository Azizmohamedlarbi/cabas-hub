'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ConfirmPageInner() {
    const params = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
    const [firstName, setFirstName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const run = async () => {
            try {
                // Supabase puts token_hash + type in the URL for email OTP
                const token_hash = params.get('token_hash');
                const type = params.get('type') as any;

                if (token_hash && type) {
                    // Exchange OTP token for session
                    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
                    if (error) throw error;

                    if (data?.user) {
                        // Fetch profile to get name + type
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('first_name, user_type')
                            .eq('id', data.user.id)
                            .single();
                        setFirstName(profile?.first_name || '');
                        setUserType(profile?.user_type || 'buyer');
                        setStatus('success');
                        return;
                    }
                }

                // Fallback: check if there's already a session (user clicked link and was auto-confirmed)
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('first_name, user_type')
                        .eq('id', session.user.id)
                        .single();
                    setFirstName(profile?.first_name || '');
                    setUserType(profile?.user_type || 'buyer');
                    setStatus('success');
                    return;
                }

                // No token and no session — show waiting state as success
                // (could happen if email confirmation is disabled in project settings)
                setStatus('success');
            } catch (err: any) {
                setErrorMsg(err.message || 'Lien de confirmation invalide ou expiré.');
                setStatus('error');
            }
        };
        run();
    }, []); // eslint-disable-line

    if (status === 'loading') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Vérification en cours…</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '20px' }}>
                <div style={{ maxWidth: '440px', width: '100%', background: 'white', borderRadius: 'var(--radius-xl)', padding: '40px 32px', boxShadow: 'var(--shadow-lg)', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <XCircle size={64} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>Lien invalide</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{errorMsg}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Le lien de confirmation a peut-être expiré. Essayez de vous connecter directement, votre compte est peut-être déjà activé.
                    </p>
                    <Link href="/auth/login" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
                        Se connecter
                    </Link>
                    <div style={{ marginTop: '12px' }}>
                        <Link href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>← Retour à l&apos;accueil</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '480px', width: '100%', background: 'rgba(255,255,255,0.97)', borderRadius: 'var(--radius-xl)', padding: '48px 36px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', textAlign: 'center', position: 'relative' }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '28px' }}>
                    <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                </Link>

                {/* Success icon */}
                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(34,197,94,0.4)' }}>
                    <CheckCircle size={44} style={{ color: 'white' }} />
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                    🎉 Compte activé !
                </h1>

                {firstName && (
                    <p style={{ fontSize: '18px', color: '#22c55e', fontWeight: 700, marginBottom: '8px' }}>
                        Bienvenue, {firstName} !
                    </p>
                )}

                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                    {userType === 'seller'
                        ? 'Votre compte vendeur Cabas Hub est maintenant activé. Connectez-vous pour commencer à publier vos produits.'
                        : "Votre compte acheteur est activé. Connectez-vous pour explorer les offres de nos vendeurs certifiés ANAE."}
                </p>

                {/* CTA */}
                <Link
                    href="/auth/login"
                    style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 800, fontSize: '16px', boxShadow: '0 4px 14px rgba(34,197,94,0.4)', marginBottom: '14px', transition: 'opacity 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                    🔑 Se connecter à la plateforme
                </Link>

                <Link href="/" style={{ display: 'block', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: '#64748b', fontSize: '14px', fontWeight: 500, transition: 'all 0.15s' }}>
                    ← Retour à l&apos;accueil
                </Link>

                <div style={{ marginTop: '24px', padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                        {userType === 'seller'
                            ? '⏳ Votre carte ANAE sera vérifiée sous 24-48h. Vous pourrez publier des produits après validation.'
                            : '✅ Votre compte est pleinement actif. Bonne navigation !'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            </div>
        }>
            <ConfirmPageInner />
        </Suspense>
    );
}
