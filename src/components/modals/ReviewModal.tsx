'use client';
import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    productId: string;
    sellerId: string;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, orderId, productId, sellerId, onSuccess }: ReviewModalProps) {
    const { user } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hover, setHover] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            await db.leaveReview({
                order_id: orderId,
                product_id: productId,
                author_id: user.id,
                target_id: sellerId,
                rating,
                comment
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'envoi de votre avis.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '18px' }}>Laisser un avis</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Quelle note donneriez-vous à ce produit/vendeur ?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                                    className="hover-scale"
                                >
                                    <Star
                                        size={32}
                                        style={{
                                            color: (hover || rating) >= star ? '#f59e0b' : '#e2e8f0',
                                            fill: (hover || rating) >= star ? '#f59e0b' : 'none'
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Votre commentaire (optionnel)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Partagez votre expérience avec les autres acheteurs..."
                            style={{ width: '100%', height: '100px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontSize: '14px', resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Annuler</button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Publier l\'avis'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
