'use client';

import { useAuthStore } from '@/store/auth';
import { Crown, ShieldCheck, Zap, Calendar, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SubscriptionStatus() {
    const { user } = useAuthStore();

    if (!user) return null;

    const isSeller = user.userType === 'seller';
    const plan = user.plan || 'free';
    const isFounder = !!user.isFounder;

    // Define plan properties based on current user plan
    const getPlanDetails = () => {
        if (isFounder) {
            return {
                title: 'Early Adopter (Membre Fondateur)',
                icon: <Crown size={24} style={{ color: '#eab308' }} />,
                bg: 'linear-gradient(135deg, #fefce8, #fef08a)',
                border: '#fde047',
                textColor: '#ca8a04',
                benefits: isSeller
                    ? ['Produits illimités', 'Voyages illimités', 'Pré-commandes', 'Messagerie illimitée']
                    : ['Accès complet au catalogue', 'Accès prioritaire voyages', 'Pré-commandes prioritaires', 'Alertes Radar'],
                cta: null,
            };
        }

        if (plan === 'pro') {
            return {
                title: 'Plan Pro',
                icon: <Zap size={24} style={{ color: '#3b82f6' }} />,
                bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                border: '#bfdbfe',
                textColor: '#2563eb',
                benefits: isSeller
                    ? ['Produits illimités', 'Voyages illimités', 'Badge Vérifié Premium', 'Priorité SEO', 'Pré-commandes']
                    : ['Accès prioritaire voyages', 'Pré-commandes prioritaires', 'Alertes Radar'],
                cta: null,
            };
        }

        return {
            title: 'Plan Gratuit (Standard)',
            icon: <ShieldCheck size={24} style={{ color: '#64748b' }} />,
            bg: '#f8fafc',
            border: 'var(--border)',
            textColor: '#475569',
            benefits: isSeller
                ? ['Limite : 5 produits actifs', 'Limite : 1 voyage / 3 mois', '10 conversations max.']
                : ['Accès standard au catalogue', 'Messagerie directe', "Liste d'attente (pré-commandes)"],
            cta: (
                <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginTop: '12px' }}>
                    Passer Pro <ArrowRight size={14} />
                </Link>
            ),
        };
    };

    const details = getPlanDetails();

    // Live Expiration Timer
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        if (!user.planExpiresAt) return;

        const calculateTimeLeft = () => {
            const expiryDate = new Date(user.planExpiresAt!).getTime();
            const now = new Date().getTime();
            const diff = expiryDate - now;

            if (diff <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [user.planExpiresAt]);

    const isExpiringSoon = timeLeft && timeLeft.days <= 5;

    return (
        <div style={{ background: details.bg, border: `1px solid ${details.border}`, borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {details.icon}
                    </div>
                    <div>
                        <p style={{ fontSize: '13px', color: details.textColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Votre Abonnement actuel</p>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{details.title}</h2>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: details.cta ? '0' : '0' }}>
                    {details.benefits.map((b, i) => (
                        <span key={i} style={{ fontSize: '12px', fontWeight: 500, color: '#334155', background: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: details.textColor }}></span>
                            {b}
                        </span>
                    ))}
                </div>
                {details.cta && <div>{details.cta}</div>}
            </div>

            {/* Expiration Tracking module */}
            {(user.planExpiresAt || plan === 'pro') && !isFounder && (
                <div style={{ background: 'white', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748b' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Expiration du Plan</span>
                    </div>

                    {timeLeft !== null ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                                {/* Days */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: isExpiringSoon ? '#ef4444' : '#0f172a', lineHeight: 1 }}>
                                        {timeLeft.days.toString().padStart(2, '0')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>Jours</span>
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1', alignSelf: 'flex-start' }}>:</span>
                                {/* Hours */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                                        {timeLeft.hours.toString().padStart(2, '0')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>Heures</span>
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1', alignSelf: 'flex-start' }}>:</span>
                                {/* Minutes */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                                        {timeLeft.minutes.toString().padStart(2, '0')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>Min</span>
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1', alignSelf: 'flex-start' }}>:</span>
                                {/* Seconds */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>
                                        {timeLeft.seconds.toString().padStart(2, '0')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>Sec</span>
                                </div>
                            </div>

                            {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                                <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                                    Votre abonnement a expiré.
                                </p>
                            ) : (
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    Valide jusqu'au {new Date(user.planExpiresAt!).toLocaleDateString('fr-FR')} à {new Date(user.planExpiresAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Date d'expiration non définie pour ce forfait.</p>
                    )}
                </div>
            )}
        </div>
    );
}
