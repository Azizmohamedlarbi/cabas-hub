'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, ShoppingBag, BarChart3, Settings, Shield, LogOut, Plane, Image as ImageIcon, Star } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const NAV = [
    { href: '/admin', icon: <LayoutDashboard size={17} />, label: 'Vue d\'ensemble' },
    { href: '/admin/users', icon: <Users size={17} />, label: 'Utilisateurs' },
    { href: '/admin/products', icon: <Package size={17} />, label: 'Produits' },
    { href: '/admin/orders', icon: <ShoppingBag size={17} />, label: 'Commandes' },
    { href: '/admin/trips', icon: <Plane size={17} />, label: 'Voyages' },
    { href: '/admin/photos', icon: <ImageIcon size={17} />, label: 'Photos' },
    { href: '/admin/subscriptions', icon: <Star size={17} />, label: 'Abonnements' },
    { href: '/admin/reports', icon: <Shield size={17} />, label: 'Signalements' },
    { href: '/admin/blog', icon: <BarChart3 size={17} />, label: 'Blog' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuthStore();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[230px] shrink-0 bg-slate-900 min-h-screen sticky top-0 h-screen overflow-y-auto border-r border-slate-800">
                {/* Logo */}
                <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} style={{ color: 'white' }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, color: 'white', fontSize: '20px' }}>CabasHub</p>
                            <p style={{ fontSize: '11px', color: '#64748b' }}>Administration</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: '12px 10px', flex: 1 }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', marginBottom: '4px' }}>Navigation</p>
                    {NAV.map(item => {
                        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: active ? 'white' : '#94a3b8', background: active ? 'rgba(239,68,68,0.2)' : 'transparent', fontWeight: active ? 600 : 400, fontSize: '14px', marginBottom: '2px', borderLeft: active ? '2px solid #ef4444' : '2px solid transparent', transition: 'all 0.15s' }}>
                                {item.icon} {item.label}
                            </Link>
                        );
                    })}

                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px', marginTop: '16px', marginBottom: '4px' }}>Outils</p>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#94a3b8', fontSize: '14px', marginBottom: '2px' }}>
                        <BarChart3 size={17} /> Voir le site
                    </Link>
                    <Link href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: pathname === '/admin/settings' ? 'white' : '#94a3b8', background: pathname === '/admin/settings' ? 'rgba(239,68,68,0.2)' : 'transparent', fontSize: '14px', marginBottom: '2px' }}>
                        <Settings size={17} /> Paramètres
                    </Link>
                </nav>

                {/* Footer */}
                <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', width: '100%', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}>
                        <LogOut size={17} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 flex items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] overflow-x-auto">
                {NAV.slice(0, 5).map(item => {
                    const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[64px] ${active ? 'text-red-400' : 'text-slate-400'}`}>
                            {item.icon}
                            <span className="text-[10px] mt-1 font-medium truncate w-full text-center">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    );
}
