'use client';

import { useState, useEffect } from 'react';
import { feedbackApi, Feedback } from '@/lib/feedback';
import { Loader2, Search, Filter, Download, Star, MessageSquare } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [featureFilter, setFeatureFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');

    useEffect(() => {
        loadFeedbacks();
    }, [featureFilter, ratingFilter]);

    const loadFeedbacks = async () => {
        setLoading(true);
        try {
            let minRating = undefined;
            let maxRating = undefined;

            if (ratingFilter === 'promoters') {
                minRating = 4;
            } else if (ratingFilter === 'detractors') {
                maxRating = 3;
            }

            const data = await feedbackApi.getFeedbacks({
                feature: featureFilter,
                minRating,
                maxRating
            });
            setFeedbacks(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des feedbacks");
        } finally {
            setLoading(false);
        }
    };

    const deleteFeedback = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce feedback ?')) return;
        try {
            await feedbackApi.deleteFeedback(id);
            setFeedbacks(prev => prev.filter(f => f.id !== id));
            toast.success("Feedback supprimé");
        } catch (e) {
            toast.error("Erreur suppression");
        }
    };

    const handleExportCSV = () => {
        if (feedbacks.length === 0) return toast.error("Rien à exporter");

        const headers = ["ID", "Utilisateur", "Type", "Fonctionnalite", "Note", "Commentaire", "Date"];
        const rows = feedbacks.map(f => [
            f.id,
            f.user ? `${f.user.first_name} ${f.user.last_name}` : 'Anonyme',
            f.user?.user_type || 'Visiteur',
            f.feature,
            f.rating,
            `"${(f.comment || '').replace(/"/g, '""')}"`, // Escape quotes for CSV
            new Date(f.created_at).toLocaleString()
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        // Add BOM for Excel UTF-8 reading
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cabashub_pmf_feedback_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Mesure PMF & Retours</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Analysez les retours utilisateurs pour atteindre le Product-Market Fit.</p>
                </div>

                <button
                    onClick={handleExportCSV}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                >
                    <Download size={18} /> Exporter Excel (CSV)
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'white', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Fonctionnalité</label>
                    <select
                        value={featureFilter}
                        onChange={e => setFeatureFilter(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    >
                        <option value="all">Toutes les fonctionnalités</option>
                        <option value="catalog">Catalogue / Recherche (Products)</option>
                        <option value="checkout">Processus d'Achat (Checkout)</option>
                        <option value="messaging">Messagerie / Chat</option>
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Sentiment (Notes)</label>
                    <select
                        value={ratingFilter}
                        onChange={e => setRatingFilter(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    >
                        <option value="all">Tous les retours (1-5)</option>
                        <option value="promoters">Promoteurs (4-5 Étoiles) 😍</option>
                        <option value="detractors">Détracteurs (1-3 Étoiles) 😡</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
                </div>
            ) : feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Aucun retour récent</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Modifiez vos filtres ou attendez que les utilisateurs interagissent avec la plateforme.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {feedbacks.map(fb => (
                        <div key={fb.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ background: fb.rating >= 4 ? '#dcfce7' : fb.rating === 3 ? '#fef3c7' : '#fee2e2', color: fb.rating >= 4 ? '#16a34a' : fb.rating === 3 ? '#d97706' : '#dc2626', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontWeight: 800, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star fill="currentColor" size={14} /> {fb.rating}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '4px' }}>
                                        {fb.feature}
                                    </span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatRelativeDate(fb.created_at)}</span>
                            </div>

                            {fb.comment ? (
                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '16px', flex: 1 }}>"{fb.comment}"</p>
                            ) : (
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px', flex: 1 }}>Sans commentaire...</p>
                            )}

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                        {fb.user ? fb.user.first_name[0] : '?'}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>{fb.user ? `${fb.user.first_name} ${fb.user.last_name}` : 'Utilisateur Anonyme'}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{fb.user?.user_type || 'Visiteur'}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteFeedback(fb.id)} style={{ padding: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Supprimer">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
