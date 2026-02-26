'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck, Mail, AlertCircle, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export default function PricingPage() {
    const { user } = useAuthStore();
    const [selectedPlan, setSelectedPlan] = useState<'seller' | 'buyer'>('seller');
    const [showModal, setShowModal] = useState(false);
    const [planRequested, setPlanRequested] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isSeller = user?.userType === 'seller';
    const isBuyer = user?.userType === 'buyer';

    const handleUpgradeClick = (planName: string) => {
        if (!user) {
            window.location.href = '/auth/login';
            return;
        }
        setPlanRequested(planName);
        setShowModal(true);
        setSuccess(false);
        setError(null);
    };

    const handleSubmitProof = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // Save to database
            await db.submitSubscriptionPayment({
                user_id: user.id,
                plan_requested: planRequested,
                proof_image_url: 'sent_by_email',
                amount_paid: parseFloat(amountPaid) || 0,
            });

            setSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setSuccess(false);
                setAmountPaid('');
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    const sellerPlans = [
        {
            name: "Free",
            price: "Gratuit",
            desc: "Pour débuter et tester la plateforme",
            features: [
                "5 produits publiés maximum",
                "1 voyage publié par 3 mois",
                "10 conversations",
                "Statistiques basiques"
            ],
            missing: [
                "Pré-commandes",
                "Badge Vérifié Premium",
                "Priorité dans les résultats"
            ],
            cta: "Plan actuel",
            action: null
        },
        {
            name: "Early Adopter",
            price: "Gratuit (à vie)",
            desc: "Réservé aux 200 premiers inscrits",
            features: [
                "Produits illimités",
                "Voyages illimités",
                "Pré-commandes incluses",
                "Messagerie illimitée",
                "Badge permanent « Membre Fondateur »"
            ],
            missing: [],
            cta: "Limité (200 places)",
            action: null,
            highlight: true
        },
        {
            name: "Pro",
            price: "8 000 DA",
            period: "/ mois",
            desc: "Pour les micro-importateurs très actifs",
            features: [
                "Produits illimités",
                "Voyages illimités",
                "Pré-commandes incluses",
                "Messagerie illimitée",
                "Priorité dans les résultats (SEO)",
                "Badge Vérifié Premium",
                "Statistiques complètes"
            ],
            missing: [],
            cta: "Passer Pro",
            action: () => handleUpgradeClick('pro_seller_monthly')
        }
    ];

    const buyerPlans = [
        {
            name: "Free",
            price: "Gratuit",
            desc: "Accès standard au catalogue",
            features: [
                "Accès complet au catalogue",
                "Messagerie directe",
                "Liste d'attente pour pré-commandes"
            ],
            missing: [
                "Accès prioritaire aux voyages",
                "Alertes Radar"
            ],
            cta: "Plan actuel",
            action: null
        },
        {
            name: "Early Adopter",
            price: "Gratuit (à vie)",
            desc: "Réservé aux 500 premiers acheteurs",
            features: [
                "Accès complet au catalogue",
                "Accès prioritaire voyages",
                "Pré-commandes (Priorité 1)",
                "Alertes Radar"
            ],
            missing: [],
            cta: "Limité (500 places)",
            action: null,
            highlight: true
        },
        {
            name: "Pro",
            price: "3 000 DA",
            period: "/ mois",
            desc: "Pour ne jamais rater une bonne affaire",
            features: [
                "Accès complet au catalogue",
                "Accès prioritaire voyages",
                "Pré-commandes (Priorité 1)",
                "Alertes Radar"
            ],
            missing: [],
            cta: "Passer Pro",
            action: () => handleUpgradeClick('pro_buyer_monthly')
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)', padding: '80px 20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                    Boostez vos affaires sur <span style={{ color: '#4ade80' }}>Cabas Hub</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px' }}>
                    Choisissez le plan qui correspond à vos besoins d'achat ou de vente. Sans engagement.
                </p>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: 'var(--radius-full)', maxWidth: '280px', margin: '0 auto' }}>
                    <button
                        onClick={() => setSelectedPlan('seller')}
                        style={{ flex: 1, padding: '10px 20px', borderRadius: 'var(--radius-full)', background: selectedPlan === 'seller' ? '#22c55e' : 'transparent', color: selectedPlan === 'seller' ? 'white' : '#cbd5e1', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Je suis Vendeur
                    </button>
                    <button
                        onClick={() => setSelectedPlan('buyer')}
                        style={{ flex: 1, padding: '10px 20px', borderRadius: 'var(--radius-full)', background: selectedPlan === 'buyer' ? '#3b82f6' : 'transparent', color: selectedPlan === 'buyer' ? 'white' : '#cbd5e1', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Je suis Acheteur
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="container" style={{ marginTop: '-40px', padding: '0 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                    {(selectedPlan === 'seller' ? sellerPlans : buyerPlans).map((plan, i) => (
                        <div key={i} style={{ flex: '1 1 300px', maxWidth: '380px', background: 'white', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: plan.highlight ? '0 20px 40px rgba(34,197,94,0.15)' : '0 10px 30px rgba(0,0,0,0.05)', border: plan.highlight ? '2px solid #22c55e' : '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            {plan.highlight && (
                                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: '#22c55e', color: 'white', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    Plus Populaire
                                </div>
                            )}

                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{plan.name}</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', minHeight: '42px' }}>{plan.desc}</p>

                            <div style={{ margin: '24px 0', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a' }}>{plan.price}</span>
                                {plan.period && <span style={{ color: '#64748b', fontSize: '16px' }}>{plan.period}</span>}
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1 }}>
                                {plan.features.map((f, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#334155' }}>
                                        <Check size={18} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                                {plan.missing.map((m, idx) => (
                                    <li key={`m-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px', fontSize: '14px', color: '#94a3b8' }}>
                                        <div style={{ width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                                            <div style={{ width: '8px', height: '1px', background: '#cbd5e1' }} />
                                        </div>
                                        <span style={{ textDecoration: 'line-through' }}>{m}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={plan.action || undefined}
                                disabled={!plan.action}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', border: 'none',
                                    background: plan.highlight ? '#dcfce7' : plan.name === 'Pro' ? '#0f172a' : '#f1f5f9',
                                    color: plan.highlight ? '#16a34a' : plan.name === 'Pro' ? 'white' : '#64748b',
                                    cursor: plan.action ? 'pointer' : 'default', transition: 'all 0.2s'
                                }}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Offline Payment Information Section */}
            <div className="container" style={{ marginTop: '80px', maxWidth: '800px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '32px' }}>Comment payer son abonnement ?</h2>

                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px', padding: '32px', background: '#f8fafc', borderRight: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={20} style={{ color: '#2563eb' }} /> Paiement Manuel
                        </h3>
                        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
                            Cabas Hub utilise un système de paiement hors ligne pour les plans professionnels afin d'éviter les frais bancaires inutiles.
                        </p>

                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>💳 Compte CCP / Baridimob</p>
                            <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '1px' }}>0000 1234 5678 90</p>
                            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>Nom: CABAS HUB EURL</p>
                        </div>

                        <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', display: 'flex', gap: '10px' }}>
                            <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                            <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                                Veuillez conserver une photo ou capture d'écran de votre reçu. Elle vous sera demandée pour activer votre plan.
                            </p>
                        </div>
                    </div>

                    <div style={{ flex: '1 1 300px', padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Étapes d'activation :</h3>
                        <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                                <strong>Effectuez le paiement</strong> du montant correspondant à votre plan (8 000 DA ou 3 000 DA).
                            </li>
                            <li style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                                <strong>Cliquez sur "Passer Pro"</strong> ci-dessus pour envoyer votre demande.
                            </li>
                            <li style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                                <strong>Envoyez-nous votre reçu</strong> par email à <a href="mailto:contact@cabashub.dz" style={{ color: '#2563eb', fontWeight: 600 }}>contact@cabashub.dz</a>. Notre équipe vérifiera manuellement.
                            </li>
                            <li style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                                <strong>Compte activé !</strong> Vos limites sont levées instantanément (sous 24-48h).
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* UPGRADE MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Demande de plan Pro</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {success ? (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <Check size={32} style={{ color: '#16a34a' }} />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Preuve envoyée !</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                                        Notre équipe vérifiera votre paiement sous 24-48h pour activer votre plan Pro. Merci de votre confiance !
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitProof}>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Plan sélectionné :</p>
                                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{planRequested === 'pro_seller_monthly' ? 'Vendeur Pro (8 000 DA)' : 'Acheteur Pro (3 000 DA)'}</p>
                                    </div>

                                    {error && <div style={{ color: '#b91c1c', fontSize: '13px', background: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>{error}</div>}

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Montant payé (DA)</label>
                                        <input
                                            type="number"
                                            required
                                            value={amountPaid}
                                            onChange={e => setAmountPaid(e.target.value)}
                                            placeholder="Ex: 8000"
                                            className="input-base"
                                        />
                                    </div>

                                    <div style={{ marginBottom: '24px', background: '#e0f2fe', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                                        <p style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.5' }}>
                                            <strong>Rappel :</strong> Après avoir cliqué sur Envoyer, n'oubliez pas d'envoyer la photo de votre reçu à l'adresse <strong>contact@cabashub.dz</strong> pour que nous puissions valider votre paiement.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{ width: '100%', padding: '14px', background: loading ? '#cbd5e1' : '#0f172a', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {loading ? 'Envoi en cours...' : 'Envoyer la demande'} <ArrowRight size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
