'use client';

import { useState } from 'react';
import { Star, Smile, Meh, Frown, Send, CheckCircle2 } from 'lucide-react';
import { feedbackApi } from '@/lib/feedback';
import { useAuthStore } from '@/store/auth';

interface InlineFeedbackProps {
    feature: string;
    title?: string;
    type?: 'stars' | 'emotes';
}

export default function InlineFeedback({ feature, title, type = 'emotes' }: InlineFeedbackProps) {
    const { user } = useAuthStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleRatingSelect = async (selectedRating: number) => {
        setRating(selectedRating);
        setStep(2);

        // Immediately silently save the rating without waiting for the comment
        try {
            await feedbackApi.submitFeedback({
                user_id: user?.id,
                feature,
                rating: selectedRating
            });
        } catch (e) {
            console.error("Silent rating fail", e);
        }
    };

    const handleCommentSubmit = async () => {
        if (!comment.trim()) {
            setStep(3);
            return;
        }

        setSubmitting(true);
        try {
            // We just insert a new row with the comment and same rating for simplicity
            // or we could track the ID. For Lean PMF, a duplicate row with the comment is fine 
            // but to keep it clean, let's just push a fresh one and the admin can group.
            // A more robust way would be an UPDATE, but INSERT is safer for RLS 'insert only' rules.
            await feedbackApi.submitFeedback({
                user_id: user?.id,
                feature,
                rating,
                comment
            });
            setStep(3);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 3) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-md)', color: '#16a34a', fontSize: '14px', fontWeight: 600, width: 'fit-content' }}>
                <CheckCircle2 size={18} /> Merci pour votre retour !
            </div>
        );
    }

    return (
        <div style={{ padding: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', maxWidth: '400px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {title || 'Comment évaluez-vous cette fonctionnalité ?'}
            </p>

            {step === 1 && (
                <div style={{ display: 'flex', gap: '12px' }}>
                    {type === 'stars' ? (
                        [1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => handleRatingSelect(star)}
                                className="hover-lift"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#cbd5e1', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#eab308'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                            >
                                <Star fill="currentColor" size={28} />
                            </button>
                        ))
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                            <FeedbackBtn icon={<Frown size={24} />} label="Mauvais" val={1} onClick={() => handleRatingSelect(1)} color="#ef4444" />
                            <FeedbackBtn icon={<Meh size={24} />} label="Moyen" val={3} onClick={() => handleRatingSelect(3)} color="#f59e0b" />
                            <FeedbackBtn icon={<Smile size={24} />} label="Super" val={5} onClick={() => handleRatingSelect(5)} color="#22c55e" />
                        </div>
                    )}
                </div>
            )}

            {step === 2 && (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {rating >= 4 ? "Qu'avez-vous particulièrement apprécié ?" : "Que pouvons-nous améliorer ?"} (Optionnel)
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Votre commentaire..."
                            onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
                            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', outline: 'none' }}
                            autoFocus
                        />
                        <button
                            onClick={handleCommentSubmit}
                            disabled={submitting}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: submitting ? 'wait' : 'pointer' }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeedbackBtn({ icon, label, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', border: '1px solid transparent', padding: '10px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => {
                e.currentTarget.style.background = `${color}15`;
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.color = color;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'inherit';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{label}</span>
        </button>
    );
}
