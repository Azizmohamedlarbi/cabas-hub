'use client';
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ArrowLeft, Loader2, Mail, ShoppingBag, AlertTriangle, Info } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { notificationsApi, Notification } from '@/lib/notifications';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await notificationsApi.getNotifications(user.id);
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const handleMarkRead = async (id: string, link?: string) => {
        try {
            await notificationsApi.markAsRead(id);
            if (link) {
                router.push(link);
            } else {
                fetchNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag size={18} />;
            case 'success': return <Check size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            default: return <Info size={18} />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'order': return '#eff6ff';
            case 'success': return '#f0fdf4';
            case 'warning': return '#fffbeb';
            default: return '#f8fafc';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'order': return '#3b82f6';
            case 'success': return '#22c55e';
            case 'warning': return '#f59e0b';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ padding: '8px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Mes Notifications</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Retrouvez tous vos signaux et mises à jour</p>
                    </div>
                </div>

                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '100px', textAlign: 'center' }}>
                            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {notifications.map((n, i) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleMarkRead(n.id, n.link)}
                                    style={{
                                        padding: '20px',
                                        borderBottom: i === notifications.length - 1 ? 'none' : '1px solid var(--border)',
                                        background: n.is_read ? 'transparent' : 'rgba(34,197,94,0.03)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: '16px',
                                        transition: 'background 0.2s'
                                    }}
                                    className="hover-bg"
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-md)',
                                        background: getIconBg(n.type),
                                        color: getIconColor(n.type),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <p style={{ fontWeight: 700, fontSize: '15px' }}>{n.title}</p>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(n.created_at)}</span>
                                        </div>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                                        {!n.is_read && (
                                            <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Nouveau
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 20px' }}>
                                <Bell size={32} />
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Aucune notification</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                                Vous n'avez pas encore reçu de signaux. Ils apparaîtront ici.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
