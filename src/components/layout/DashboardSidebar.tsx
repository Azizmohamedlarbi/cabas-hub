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
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
                <div className="p-4 px-5 border-b border-slate-200">
                    <Link href="/" className="inline-block">
                        <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" className="h-[52px] w-auto object-contain block" />
                    </Link>
                </div>
                <nav className="flex-1 p-5 px-3 overflow-y-auto">
                    {menuItems.map(item => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.label} href={item.href} className={`flex items-center gap-3 p-3 px-4 rounded-md mb-1 text-sm transition-all ${active ? 'bg-green-50 text-green-600 font-semibold' : 'text-slate-500 font-medium hover:bg-slate-50'}`}>
                                {item.icon} {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-5 border-t border-slate-200">
                    <button onClick={() => logout()} className="flex items-center gap-3 w-full p-3 px-4 border-none bg-transparent text-red-500 cursor-pointer text-sm font-semibold hover:bg-red-50 rounded-md transition-colors">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-x-auto">
                {menuItems.slice(0, 5).map(item => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[64px] ${active ? 'text-green-600' : 'text-slate-500'}`}>
                            {item.icon}
                            <span className="text-[10px] mt-1 font-medium truncate w-full text-center">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    );
}
