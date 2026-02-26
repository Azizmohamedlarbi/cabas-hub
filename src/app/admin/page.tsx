'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingBag, TrendingUp, ShieldCheck, DollarSign, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { getPlatformStats } from '@/lib/admin';
import { formatDZD } from '@/lib/utils';

export default function AdminPage() {
    const [stats, setStats] = useState({ userCount: 0, productCount: 0, orderCount: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getPlatformStats();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Utilisateurs inscrits', value: stats.userCount.toLocaleString(), icon: <Users size={22} />, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Produits actifs', value: stats.productCount.toLocaleString(), icon: <Package size={22} />, color: '#22c55e', bg: '#f0fdf4' },
        { label: 'Commandes totales', value: stats.orderCount.toLocaleString(), icon: <ShoppingBag size={22} />, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'GMV total (DA)', value: formatDZD(stats.totalRevenue), icon: <DollarSign size={22} />, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, padding: '28px 28px', overflowX: 'hidden' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <ShieldCheck size={20} style={{ color: '#ef4444' }} />
                            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Tableau de bord Admin</h1>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Bienvenue. Voici l&apos;état de la plateforme CabasHub en temps réel.</p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                        {statCards.map(stat => (
                            <div key={stat.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ width: '44px', height: '44px', background: stat.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                    <TrendingUp size={14} style={{ color: '#22c55e' }} />
                                </div>
                                <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{stat.value}</p>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', flexWrap: 'wrap' }}>
                        {/* Quick actions */}
                        <div>
                            <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Actions rapides</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                {[
                                    { href: '/admin/users', icon: '👤', title: 'Gérer les utilisateurs', desc: 'Vérifier les cartes ANAE', color: '#3b82f6' },
                                    { href: '/admin/products', icon: '📦', title: 'Modérer les produits', desc: 'Approuver / rejeter', color: '#22c55e' },
                                    { href: '/admin/orders', icon: '🛍️', title: 'Voir les commandes', desc: 'Libérer les escrows', color: '#f59e0b' },
                                    { href: '/admin/trips', icon: '✈️', title: 'Gérer les voyages', desc: 'Modération trajets', color: '#8b5cf6' },
                                ].map(a => (
                                    <Link key={a.href} href={a.href} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.15s' }}>
                                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{a.icon}</div>
                                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>{a.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.desc}</p>
                                    </Link>
                                ))}
                            </div>

                            {/* Pending alerts */}
                            <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>⚠️ Points d&apos;attention</h2>
                            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                {[
                                    { icon: <ShieldCheck size={15} style={{ color: '#f59e0b' }} />, text: 'Vendeurs en attente de vérification ANAE', href: '/admin/users' },
                                    { icon: <Package size={15} style={{ color: '#3b82f6' }} />, text: 'Nouveaux produits à examiner', href: '/admin/products' },
                                    { icon: <ShoppingBag size={15} style={{ color: '#22c55e' }} />, text: 'Escrows à libérer pour livraisons terminées', href: '/admin/orders' },
                                ].map((alert, i) => (
                                    <Link key={i} href={alert.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px' }}>
                                        {alert.icon}
                                        <span style={{ flex: 1 }}>{alert.text}</span>
                                        <span style={{ color: 'var(--primary)', fontSize: '12px' }}>→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Note feed */}
                        <div>
                            <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>📝 Notes de modération</h2>
                            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Zone de notes administratives (Bientôt disponible)</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
