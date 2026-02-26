'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, LayoutDashboard, MessageSquare, Briefcase, Settings, LogOut, ShieldCheck, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function DashboardSidebar({ type = 'seller' }: { type?: 'seller' | 'buyer' }) {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();

    const menuItems = type === 'seller' ? [
        { icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', href: '/dashboard/seller' },
        { icon: <Package size={18} />, label: 'Mes Produits', href: '/dashboard/seller/products' },
        { icon: <ShoppingBag size={18} />, label: 'Mes Commandes', href: '/dashboard/seller/orders' },
        { icon: <Briefcase size={18} />, label: 'Mes Voyages', href: '/dashboard/seller/trips' },
        { icon: <ClipboardList size={18} />, label: 'Propositions Voyages', href: '/dashboard/seller/pre-orders' },
        { icon: <MessageSquare size={18} />, label: 'Messages', href: '/messages' },
        { icon: <Settings size={18} />, label: 'Paramètres', href: '/dashboard/seller/settings' },
    ] : [
        { icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', href: '/dashboard/buyer' },
        { icon: <ShoppingBag size={18} />, label: 'Mes Commandes', href: '/dashboard/buyer/orders' },
        { icon: <MessageSquare size={18} />, label: 'Messages', href: '/messages' },
        { icon: <Settings size={18} />, label: 'Paramètres', href: '/dashboard/buyer/settings' },
    ];

    // Add Admin Panel link if user is admin
    if (user?.userType === 'admin') {
        menuItems.unshift({
            icon: <ShieldCheck size={18} />,
            label: '🛡️ Panel Admin',
            href: '/admin'
        });
    }

    const isActive = (href: string) => {
        if (href === '/dashboard/seller' || href === '/dashboard/buyer') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside style={{ width: '260px', background: 'white', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '52px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                </Link>
            </div>
            <nav style={{ flex: 1, padding: '20px 12px' }}>
                {menuItems.map(item => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', textDecoration: 'none', color: active ? 'var(--primary)' : 'var(--text-secondary)', background: active ? 'var(--primary-bg)' : 'transparent', borderRadius: 'var(--radius-md)', marginBottom: '4px', fontWeight: active ? 600 : 500, fontSize: '14px', transition: 'all 0.2s' }}>
                            {item.icon} {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <LogOut size={18} /> Déconnexion
                </button>
            </div>
        </aside>
    );
}
