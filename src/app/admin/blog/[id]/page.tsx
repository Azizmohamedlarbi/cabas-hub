'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogApi, CreatePostDTO } from '@/lib/blog';
import { Loader2, ArrowLeft, Save, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

export default function BlogEditor({ isNew }: { isNew?: boolean }) {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<CreatePostDTO>({
        title: '',
        slug: '',
        extract: '',
        content: '',
        cover_image: '',
        access_level: 'public',
        is_published: false
    });

    useEffect(() => {
        if (!isNew && params.id) {
            const loadPost = async () => {
                try {
                    const data = await blogApi.getPostById(params.id as string);
                    if (data) {
                        setForm({
                            title: data.title,
                            slug: data.slug,
                            extract: data.extract || '',
                            content: data.content,
                            cover_image: data.cover_image || '',
                            access_level: data.access_level,
                            is_published: data.is_published
                        });
                    }
                } catch (err) {
                    toast.error("Erreur de chargement de l'article");
                } finally {
                    setLoading(false);
                }
            };
            loadPost();
        }
    }, [isNew, params.id]);

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w-]+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const autoSlug = isNew ? generateSlug(title) : form.slug; // Only auto-update slug on creation
        setForm({ ...form, title, slug: autoSlug });
    };

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.content) {
            toast.error("Veuillez remplir le titre, l'URL permaliste, et le contenu.");
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const payload = { ...form, author_id: user?.id };
                await blogApi.createPost(payload);
                toast.success("Post créé avec succès !");
                router.push('/admin/blog');
            } else {
                await blogApi.updatePost(params.id as string, form);
                toast.success("Modifications sauvegardées !");
                router.push('/admin/blog');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message?.includes('duplicate key') ? "Ce Permalien (Slug) existe déjà" : "Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div className="flex flex-col md:flex-row">
                <AdminSidebar />
                <main className="flex-1 p-4 md:p-8 overflow-x-auto pb-24 md:pb-8">

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0, marginBottom: '12px' }}>
                                <ArrowLeft size={16} /> Retour aux articles
                            </button>
                            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {isNew ? 'Créer un article' : 'Éditer l\'article'}
                            </h1>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setForm({ ...form, is_published: !form.is_published })}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: `1px solid ${form.is_published ? '#bbf7d0' : 'var(--border)'}`, color: form.is_published ? '#166534' : 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                            >
                                {form.is_published ? <><Eye size={16} color="#22c55e" /> Publié</> : <><EyeOff size={16} /> Brouillon</>}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer' }}
                            >
                                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px', alignItems: 'start' }} className="grid-cols-1 md:grid-cols-[2fr_1fr]">

                            {/* Left Column (Content) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Titre de l'article *</label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={handleTitleChange}
                                            placeholder="Comment réussir son premier mois avec CabasHub..."
                                            className="input-base"
                                            style={{ fontSize: '18px', fontWeight: 600, padding: '12px 16px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Extrait Court (Affiché sur les cartes)</label>
                                        <textarea
                                            value={form.extract}
                                            onChange={e => setForm({ ...form, extract: e.target.value })}
                                            placeholder="Un court résumé aguicheur pour donner envie de lire..."
                                            className="input-base"
                                            style={{ minHeight: '80px', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Contenu Complet (Supporte le format HTML) *</label>
                                        <textarea
                                            value={form.content}
                                            onChange={e => setForm({ ...form, content: e.target.value })}
                                            placeholder="<h1>Le Grand Titre</h1><p>Le début de l'article...</p>"
                                            className="input-base"
                                            style={{ minHeight: '400px', resize: 'vertical', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6', background: '#f8fafc' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Settings) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Access Settings */}
                                <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <LayoutTemplate size={16} /> Visibilité & Accès
                                    </h3>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Qui peut lire cet article ?</label>
                                        <select
                                            value={form.access_level}
                                            onChange={e => setForm({ ...form, access_level: e.target.value as any })}
                                            className="input-base"
                                        >
                                            <option value="public">🌍 Public (Tout le monde)</option>
                                            <option value="registered">🔒 Inscrits (Doit être connecté)</option>
                                            <option value="premium">⭐ Premium (Plans Pro & Early Adopter)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Permalien (Slug) *</label>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={e => setForm({ ...form, slug: e.target.value })}
                                            className="input-base"
                                            style={{ color: 'var(--text-muted)' }}
                                        />
                                    </div>
                                </div>

                                {/* Media */}
                                <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Média</h3>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Image de couverture (URL)</label>
                                        <input
                                            type="url"
                                            value={form.cover_image}
                                            onChange={e => setForm({ ...form, cover_image: e.target.value })}
                                            placeholder="https://..."
                                            className="input-base"
                                        />
                                        {form.cover_image && (
                                            <div style={{ marginTop: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px', border: '1px solid var(--border)' }}>
                                                <img src={form.cover_image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
