'use client';
import { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { notificationsApi, Notification } from '@/lib/notifications';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardHeader({ title }: { title: string }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const [data, count] = await Promise.all([
                notificationsApi.getNotifications(user.id),
                notificationsApi.getUnreadCount(user.id)
            ]);
            setNotifications(data);
            setUnreadCount(count);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up real-time subscription for new notifications
        // (Skipping detailed subscription code for now for brevity, but utilities are ready)
    }, [user]);

    const handleMarkRead = async (id: string, link?: string) => {
        try {
            await notificationsApi.markAsRead(id);
            if (link) {
                setShowNotifications(false);
                router.push(link);
            } else {
                fetchNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50 }}>
            <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800 }}>{title}</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px', borderRadius: '50%', transition: 'background 0.2s' }}
                        className="hover-bg"
                    >
                        <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '16px', height: '16px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '320px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ fontWeight: 700, fontSize: '14px' }}>Notifications (Signaux)</p>
                                <button style={{ fontSize: '12px', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }}>Tout marquer lu</button>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: n.is_read ? 'transparent' : 'rgba(34,197,94,0.05)', cursor: 'pointer', display: 'flex', gap: '12px' }}
                                            onClick={() => handleMarkRead(n.id, n.link)}
                                        >
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.is_read ? 'transparent' : 'var(--primary)', marginTop: '6px' }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{n.title}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</p>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{formatDate(n.created_at)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Bell size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                        <p style={{ fontSize: '13px' }}>Aucune notification</p>
                                    </div>
                                )}
                            </div>
                            <Link href="/notifications" style={{ display: 'block', padding: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', background: '#f8fafc' }}>
                                Voir tout
                            </Link>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                        <div style={{ width: '36px', height: '36px', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            {user?.profilePhoto ? <img src={user.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} /> : <User size={20} />}
                        </div>
                        <div style={{ textAlign: 'left', display: 'none' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600 }}>{user?.firstName}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.userType === 'seller' ? 'Vendeur' : 'Acheteur'}</p>
                        </div>
                    </button>

                    {showProfile && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '200px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                            <p style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Mon Compte</p>
                            {user?.userType === 'admin' && (
                                <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, background: 'var(--primary-bg)', borderBottom: '1px solid var(--border)' }}>
                                    🛡️ Retour Panel Admin
                                </Link>
                            )}
                            <Link href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px' }}>
                                <Settings size={15} /> Paramètres
                            </Link>
                            <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>
                                <LogOut size={15} /> Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
