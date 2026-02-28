'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BlogPost } from '@/types';
import { blogApi } from '@/lib/blog';
import { Loader2, ArrowLeft, Calendar, User, Lock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils';

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const loadPost = async () => {
            try {
                if (typeof params.slug === 'string') {
                    const data = await blogApi.getPostBySlug(params.slug);
                    setPost(data);
                }
            } catch (err) {
                console.error("Failed to load post:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [params.slug]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Article introuvable</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Cet article a peut-être été supprimé ou l'URL est incorrecte.</p>
                <Link href="/blog" style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}>
                    Retour au blog
                </Link>
            </div>
        );
    }

    // Access control check
    const hasAccess = () => {
        if (post.access_level === 'public') return true;
        if (post.access_level === 'registered' && user) return true;
        if (post.access_level === 'premium' && user && (user.plan === 'early_adopter' || user.plan === 'pro')) return true;
        return false;
    };

    const isAccessible = hasAccess();

    return (
        <article style={{ background: 'white', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header / Cover */}
            <div style={{ position: 'relative', height: '400px', background: 'var(--secondary)' }}>
                {post.cover_image && (
                    <img
                        src={post.cover_image}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                    />
                )}

                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '99px', cursor: 'pointer', marginBottom: '32px', fontSize: '13px', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
                            <ArrowLeft size={16} /> Retour
                        </button>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Article
                            </span>
                            {post.access_level === 'premium' && (
                                <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={12} /> Pro
                                </span>
                            )}
                        </div>

                        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'white', lineHeight: '1.2', marginBottom: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {post.title}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} /> {formatDate(post.created_at)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={16} /> {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'CabasHub Admin'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

                {/* Intro / Extract */}
                {post.extract && (
                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text-secondary)', fontWeight: 500, fontStyle: 'italic', marginBottom: '40px', paddingLeft: '24px', borderLeft: '4px solid var(--primary)' }}>
                        {post.extract}
                    </p>
                )}

                {/* Main Content */}
                {isAccessible ? (
                    <div
                        className="prose"
                        style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-primary)' }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                ) : (
                    <div style={{ position: 'relative' }}>
                        {/* Fake blurred text */}
                        <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-secondary)', userSelect: 'none', overflow: 'hidden', height: '300px', maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            <br /><br />
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                        </div>

                        {/* Gate CTA */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', textAlign: 'center', background: 'white', padding: '40px 32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', zIndex: 10 }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Lock size={28} style={{ color: 'var(--primary)' }} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
                                {post.access_level === 'registered' ? 'Article réservé aux membres' : 'Article Premium Exclusif'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                                {post.access_level === 'registered'
                                    ? "Ce contenu est réservé à la communauté CabasHub. Connectez-vous ou créez un compte gratuitement pour continuer votre lecture."
                                    : "Cet article stratégique est réservé à nos utilisateurs Pro (ou Early Adopters). Mettez à niveau votre compte pour y accéder."}
                            </p>

                            {!user ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link href="/auth/login" style={{ padding: '14px', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', width: '100%', display: 'inline-block' }}>
                                        Se connecter
                                    </Link>
                                    <Link href="/auth/register" style={{ padding: '14px', background: 'white', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', width: '100%', display: 'inline-block' }}>
                                        Créer un compte
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/pricing" style={{ padding: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', width: '100%', display: 'inline-block', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                                    🌟 Découvrir les plans Premium
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
