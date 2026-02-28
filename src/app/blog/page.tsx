'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { blogApi } from '@/lib/blog';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

export default function BlogIndexPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await blogApi.getPublishedPosts();
                setPosts(data);
            } catch (err) {
                console.error("Failed to load blog posts:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    // Helper definition to see if user has access to a post
    const hasAccess = (level: string) => {
        if (level === 'public') return true;
        if (level === 'registered' && user) return true;
        if (level === 'premium' && user && (user.plan === 'early_adopter' || user.plan === 'pro')) return true;
        return false;
    };

    return (
        <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f8fafc' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '24px', marginBottom: '16px' }}>
                        <BookOpen size={28} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>Le Blog CabasHub</h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Découvrez nos conseils, actualités et guides complets pour réussir vos importations.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                        <BookOpen size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Aucun article disponible</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Revenez plus tard pour lire notre contenu exclusif !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => {
                            const canAccess = hasAccess(post.access_level);

                            return (
                                <Link
                                    href={`/blog/${post.slug}`}
                                    key={post.id}
                                    style={{
                                        textDecoration: 'none',
                                        background: 'white',
                                        borderRadius: 'var(--radius-lg)',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border)',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                        position: 'relative',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    className="hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Badges Overlay */}
                                    <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                        {post.access_level === 'premium' && (
                                            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <ShieldCheck size={12} /> Exclusif Pro
                                            </span>
                                        )}
                                        {post.access_level === 'registered' && (
                                            <span style={{ background: 'var(--secondary)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <Lock size={12} /> Membres
                                            </span>
                                        )}
                                    </div>

                                    {/* Cover */}
                                    <div style={{ height: '200px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                                        {post.cover_image ? (
                                            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                                                <BookOpen size={48} style={{ color: '#cbd5e1' }} />
                                            </div>
                                        )}
                                        {/* Overlay if not accessible */}
                                        {!canAccess && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                                                    <Lock size={20} style={{ color: 'var(--text-primary)' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
                                            <Calendar size={13} /> {formatDate(post.created_at)}
                                        </div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.4' }}>
                                            {post.title}
                                        </h2>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
                                            {post.extract || "Découvrez le contenu de cet article détaillé en le consultant dès maintenant."}
                                        </p>

                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={post.author?.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.first_name || 'A')}&background=e2e8f0&color=475569`}
                                                alt=""
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Admin'}
                                                </p>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: canAccess ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                                                {canAccess ? 'Lire →' : 'Verrouillé'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
