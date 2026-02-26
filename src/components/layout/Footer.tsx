'use client';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ background: 'var(--text-primary)', color: '#94a3b8', marginTop: 'auto' }}>
            <div className="container" style={{ padding: '60px 20px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>La marketplace B2B/B2C dédiée aux micro-importateurs algériens. Sécurisé, vérifié, professionnel.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <ShieldCheck size={16} style={{ color: '#22c55e' }} />
                            <span style={{ fontSize: '13px' }}>Partenaire ANAE – Carte 080100</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                                    <Icon size={16} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marketplace */}
                    <div>
                        <h4 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Marketplace</h4>
                        {['Tous les produits', 'Électronique', 'Textile & Mode', 'Cosmétiques', 'Maison & Déco', 'Voyages en cours'].map(item => (
                            <Link key={item} href="/products" className="hover-color-green" style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', fontSize: '14px', marginBottom: '10px', transition: 'color 0.15s' }}>
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Vendeurs */}
                    <div>
                        <h4 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Vendeurs</h4>
                        {['Devenir vendeur', 'Carte ANAE 080100', 'Guide importation', 'Calendrier voyages', 'Tableau de bord', 'Programme fidélité'].map(item => (
                            <Link key={item} href="/auth/register/seller" className="hover-color-green" style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', fontSize: '14px', marginBottom: '10px', transition: 'color 0.15s' }}>
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>Contact & Support</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                <Phone size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                                <span>+213 770 000 000</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                <Mail size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                                <span>contact@cabashub.dz</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 600, marginBottom: '4px' }}>🕐 Support disponible</p>
                            <p style={{ fontSize: '12px' }}>Dim-Jeu : 8h00 – 18h00</p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <p style={{ fontSize: '13px' }}>© 2026 CabasHub. Tous droits réservés. 🇩🇿 Made in Algeria</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link href="/cgu" style={{ color: '#475569', textDecoration: 'none', fontSize: '9px', fontWeight: 300, opacity: 0.6, letterSpacing: '0.2px' }}>Conditions Générales d'Utilisation</Link>
                        <Link href="/politique-confidentialite" style={{ color: '#475569', textDecoration: 'none', fontSize: '9px', fontWeight: 300, opacity: 0.6, letterSpacing: '0.2px' }}>Politique de Confidentialité</Link>
                        <Link href="/mentions-legales" style={{ color: '#475569', textDecoration: 'none', fontSize: '9px', fontWeight: 300, opacity: 0.6, letterSpacing: '0.2px' }}>Mentions Légales</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
