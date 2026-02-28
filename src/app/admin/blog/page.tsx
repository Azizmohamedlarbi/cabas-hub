'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Edit, Trash2, BookOpen, Eye, EyeOff } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { blogApi } from '@/lib/blog';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await blogApi.getAllPosts();
            setPosts(data);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des articles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`T'es sur de vouloir supprimer l'article "${title}" ? Cette action est irréversible.`)) return;

        try {
            await blogApi.deletePost(id);
            toast.success("Article supprimé");
            fetchPosts();
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleTogglePublish = async (post: BlogPost) => {
        try {
            await blogApi.updatePost(post.id, { is_published: !post.is_published });
            toast.success(post.is_published ? "Article masqué (Brouillon)" : "Article publié !");
            fetchPosts();
        } catch (err) {
            toast.error("Erreur de modification");
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div className="flex flex-col md:flex-row">
                <AdminSidebar />
                <main className="flex-1 p-4 md:p-8 overflow-x-auto pb-24 md:pb-8">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen style={{ color: 'var(--primary)' }} /> Gestion du Blog
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Créez et modérez le contenu éditorial de CabasHub</p>
                        </div>
                        <Link href="/admin/blog/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <Plus size={16} /> Nouvel Article
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <BookOpen size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Votre blog est vide</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Rédigez votre premier article pour attirer plus d'utilisateurs.</p>
                            <Link href="/admin/blog/new" style={{ padding: '10px 20px', background: '#f1f5f9', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, border: '1px solid var(--border)' }}>
                                Écrire maintenant
                            </Link>
                        </div>
                    ) : (
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Article</th>
                                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Accès</th>
                                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
                                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Statut</th>
                                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map(post => (
                                            <tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-bg-secondary">
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0 }}>
                                                            {post.cover_image ? (
                                                                <img src={post.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <BookOpen size={20} style={{ color: '#cbd5e1' }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '4px' }}>{post.title}</p>
                                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{post.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    {post.access_level === 'public' && <span className="badge badge-green">Public</span>}
                                                    {post.access_level === 'registered' && <span className="badge badge-gray">Inscrits</span>}
                                                    {post.access_level === 'premium' && <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, border: '1px solid #fde68a' }}>Premium</span>}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    {formatDate(post.created_at)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <button
                                                        onClick={() => handleTogglePublish(post)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, border: `1px solid ${post.is_published ? '#bbf7d0' : 'var(--border)'}`, background: post.is_published ? '#f0fdf4' : '#f8fafc', color: post.is_published ? '#166534' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}
                                                    >
                                                        {post.is_published ? <><Eye size={14} /> Publié</> : <><EyeOff size={14} /> Brouillon</>}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <Link href={`/admin/blog/${post.id}`} style={{ padding: '8px', background: '#eff6ff', color: '#3b82f6', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Modifier">
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(post.id, post.title)} style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Supprimer">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
