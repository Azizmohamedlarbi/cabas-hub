'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, FileText, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';

export default function PendingVerification() {
    const [adminEmail, setAdminEmail] = useState('contact@cabashub.dz');

    useEffect(() => {
        db.getPlatformSetting('photo_email').then(email => {
            if (email) setAdminEmail(email);
        });
    }, []);
    return (
        <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                {/* Header Section */}
                <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', padding: '48px 32px', textAlign: 'center', color: 'white' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Clock size={40} />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Dossier en cours d'examen</h1>
                    <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '500px', margin: '0 auto' }}>
                        Bienvenue sur CabasHub ! Nous étudions actuellement votre profil pour garantir la sécurité et la qualité de notre marketplace.
                    </p>
                </div>

                {/* Content Section */}
                <div style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '12px' }}><CheckCircle2 size={32} style={{ margin: '0 auto' }} /></div>
                            <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>1. Inscription</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Compte créé avec succès</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#f59e0b', marginBottom: '12px' }}><Clock size={32} style={{ margin: '0 auto' }} /></div>
                            <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>2. Vérification</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Examen de vos informations ANAE</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--border)', marginBottom: '12px' }}><ShieldCheck size={32} style={{ margin: '0 auto' }} /></div>
                            <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>3. Activation</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Accès complet à votre boutique</p>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={18} style={{ color: 'var(--primary)' }} /> Ce que vous pouvez faire en attendant
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px' }}>
                            {[
                                { title: 'Consulter la charte vendeur', desc: 'Apprenez les bonnes pratiques pour réussir.', href: '#' },
                                { title: 'Envoyer votre Carte Auto-Entrepreneur', desc: 'Obligatoire pour la validation. Envoyez un scan par mail.', href: `mailto:${adminEmail}` },
                                { title: 'Préparer vos listes de produits', desc: 'Ayez vos photos et descriptions prêtes.', href: '#' },
                                { title: 'Contacter le support', desc: 'Une question ? Nous sommes là pour vous aider.', href: '/support' }
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{item.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                                    </div>
                                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ padding: '24px 40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => useAuthStore.getState().refreshProfile()}
                        className="btn-secondary"
                        style={{ padding: '10px 24px', fontSize: '14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', background: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        🔄 Actualiser le statut
                    </button>
                    <Link href="/" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '14px', padding: '10px 24px', background: '#f1f5f9', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Retour à l'accueil</Link>
                    <Link href="/messages" className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={16} /> Nous contacter
                    </Link>
                </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Délai moyen de réponse : <strong>24 à 48 heures</strong> (jours ouvrés).
            </p>
        </div>
    );
}
