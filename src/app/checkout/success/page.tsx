'use client';
import Link from 'next/link';
import { useState } from 'react';
import InlineFeedback from '@/components/feedback/InlineFeedback';

export default function CheckoutSuccessPage() {
    const [orderNum] = useState(() => 'CH-' + Math.random().toString(36).toUpperCase().slice(2, 10));
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
                <div style={{ width: '72px', height: '72px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px' }}>✅</div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Commande confirmée!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
                    Votre commande a été passée avec succès. Vous recevrez un SMS et un email de confirmation. Le vendeur sera notifié immédiatement.
                </p>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Numéro de commande</p>
                    <p style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)', fontFamily: 'monospace' }}>{orderNum}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <Link href="/dashboard/buyer/orders" style={{ padding: '13px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '15px', transition: 'opacity 0.15s' }}>
                        📦 Suivre ma commande
                    </Link>
                    <Link href="/products" style={{ padding: '12px', border: '1.5px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                        Continuer mes achats
                    </Link>
                </div>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                    <InlineFeedback feature="checkout" title="Comment s'est passé votre paiement ?" type="emotes" />
                </div>
            </div>
        </div>
    );
}
