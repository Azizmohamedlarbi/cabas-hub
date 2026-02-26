'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, ChevronDown, MessageCircle, Package, MapPin, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { db } from '@/lib/db';
import { CATEGORIES } from '@/lib/mock-data';

export default function Navbar() {
    const { user, isLoggedIn, logout } = useAuthStore();
    const totalItems = useCartStore((s) => s.totalItems);
    const [menuOpen, setMenuOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    const fetchSuggestions = async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const results = await db.getSearchSuggestions(q);
            setSuggestions(results);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => {
            if (searchQuery) fetchSuggestions(searchQuery);
            else setSuggestions([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {/* Top bar */}
            <div style={{ background: 'var(--text-primary)', padding: '6px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>🇩🇿 Marketplace pour Micro-Importateurs Algériens</span>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>📞 Aide : +213 770 000 000</span>
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '64px' }}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
                    <img src="/Cabas_Hub_logo.png" alt="Cabas Hub" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
                </Link>

                {/* Search - Hide on mobile, show on Desktop */}
                <div className="hidden sm:block" style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit, vendeur..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                        style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '14px', outline: 'none', background: 'var(--bg-secondary)', transition: 'border-color 0.15s' }}
                        onFocus={() => { if (searchQuery.length >= 2) fetchSuggestions(searchQuery); }}
                        onKeyDown={e => { if (e.key === 'Enter' && searchQuery) window.location.href = `/search?q=${searchQuery}`; }}
                    />

                    {suggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', zIndex: 1000 }}>
                            {suggestions.map((s, i) => (
                                <Link
                                    key={i}
                                    href={s.type === 'product' ? `/products/${s.slug}` : s.type === 'seller' ? `/sellers/${s.id}` : `/products?category=${s.slug}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid var(--border)', fontSize: '13px' }}
                                    className="hover-bg-secondary"
                                >
                                    <span style={{ fontSize: '16px' }}>{s.type === 'product' ? '📦' : s.type === 'seller' ? '👤' : '🏷️'}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600 }}>{s.label}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.type}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Categories dropdown */}
                <div style={{ position: 'relative' }} onMouseEnter={() => setCategoryOpen(true)} onMouseLeave={() => setCategoryOpen(false)}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        <Package size={15} /> Catégories <ChevronDown size={14} />
                    </button>
                    {categoryOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: '8px', minWidth: '220px', zIndex: 200 }}>
                            {CATEGORIES.map(cat => (
                                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="hover-bg-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', transition: 'background 0.1s' }}>
                                    <span>{cat.icon} {cat.name}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.count.toLocaleString()}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <Link href="/trips" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <MapPin size={15} /> Voyages
                </Link>

                <Link href="/pricing" className="hidden sm:flex" style={{ alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#d97706', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '16px' }}>⭐</span> Abonnements
                </Link>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Cart */}
                    <Link
                        href={mounted && isLoggedIn ? "/checkout" : "/auth/login"}
                        className="hover-border-primary"
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'border-color 0.15s, background 0.15s' }}
                    >
                        <ShoppingCart size={18} />
                        {mounted && isLoggedIn && totalItems() > 0 && (
                            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--primary)', color: 'white', fontSize: '11px', fontWeight: 700, borderRadius: 'var(--radius-full)', padding: '1px 5px', minWidth: '18px', textAlign: 'center' }}>{totalItems()}</span>
                        )}
                    </Link>

                    {/* Messages */}
                    {mounted && isLoggedIn && (
                        <Link href="/messages" className="hover-border-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.15s', position: 'relative' }}>
                            <MessageCircle size={18} />
                            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
                        </Link>
                    )}

                    {/* Auth */}
                    {mounted ? (
                        isLoggedIn && user ? (
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 6px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', background: 'white', cursor: 'pointer' }}>
                                    <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.firstName}&background=22c55e&color=fff`} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{user.firstName}</span>
                                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                </button>
                                {profileOpen && (
                                    <div onClick={() => setProfileOpen(false)} style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: '8px', minWidth: '200px', zIndex: 200 }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px' }}>{user.firstName} {user.lastName}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
                                            {user.anaeVerified && <span className="badge badge-green" style={{ marginTop: '4px' }}><ShieldCheck size={10} /> ANAE Vérifié</span>}
                                        </div>
                                        {user.userType === 'admin' ? (
                                            <>
                                                <NavItem href="/admin" icon="🛡️" label="Panel Admin" />
                                                <NavItem href="/admin/products" icon="📦" label="Gestion Produits" />
                                                <NavItem href="/admin/users" icon="👥" label="Utilisateurs" />
                                                <NavItem href="/admin/orders" icon="🛍️" label="Commandes (Escrow)" />
                                            </>
                                        ) : user.userType === 'seller' ? (
                                            <>
                                                <NavItem href="/dashboard/seller" icon="📊" label="Mon Dashboard" />
                                                <NavItem href="/dashboard/seller/products" icon="📦" label="Mes Produits" />
                                                <NavItem href="/dashboard/seller/orders" icon="🛍️" label="Commandes" />
                                                <NavItem href="/dashboard/seller/trips" icon="✈️" label="Mes Voyages" />
                                            </>
                                        ) : (
                                            <>
                                                <NavItem href="/dashboard/buyer" icon="📊" label="Mon Tableau de bord" />
                                                <NavItem href="/dashboard/buyer/orders" icon="🛍️" label="Mes Commandes" />
                                                <NavItem href="/dashboard/buyer/favorites" icon="❤️" label="Favoris" />
                                            </>
                                        )}
                                        <NavItem href="/messages" icon="💬" label="Messages" />
                                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                                            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', width: '100%', borderRadius: 'var(--radius-md)', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', fontWeight: 500 }}>
                                                🚪 Se déconnecter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link href="/auth/login" className="hover-border-primary" style={{ padding: '8px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', transition: 'all 0.15s' }}>
                                    Connexion
                                </Link>
                                <Link href="/auth/register/seller" className="hover-opacity" style={{ padding: '8px 16px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: 'white', transition: 'opacity 0.15s' }}>
                                    Vendre
                                </Link>
                            </div>
                        )
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', opacity: 0 }}>
                            {/* Skeleton matches logged-out state structure temporarily */}
                            <div style={{ width: '80px', height: '38px' }} />
                            <div style={{ width: '70px', height: '38px' }} />
                        </div>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer' }}>
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu Content */}
            {menuOpen && (
                <div className="sm:hidden" style={{ background: 'white', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Search inside Mobile Menu */}
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '14px', outline: 'none', background: 'var(--bg-secondary)' }}
                            onKeyDown={e => { if (e.key === 'Enter' && searchQuery) window.location.href = `/search?q=${searchQuery}`; }}
                        />
                        {suggestions.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', zIndex: 1000 }}>
                                {suggestions.map((s, i) => (
                                    <Link key={i} href={s.type === 'product' ? `/products/${s.slug}` : s.type === 'seller' ? `/sellers/${s.id}` : `/products?category=${s.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', fontSize: '13px' }} onClick={() => setMenuOpen(false)}>
                                        {s.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link href="/trips" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', padding: '8px 0', borderBottom: '1px solid var(--border)' }} onClick={() => setMenuOpen(false)}>
                        <MapPin size={18} /> Voyages
                    </Link>
                    <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: '#d97706', textDecoration: 'none', padding: '8px 0' }} onClick={() => setMenuOpen(false)}>
                        <span style={{ fontSize: '18px' }}>⭐</span> Abonnements Max
                    </Link>
                </div>
            )}
        </header>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link href={href} className="hover-bg-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px', transition: 'background 0.1s' }}>
            <span>{icon}</span> {label}
        </Link>
    );
}
