'use client';
import { useState } from 'react';
import { ShieldAlert, X, Loader2 } from 'lucide-react';
import { reportsApi, ReportTargetType } from '@/lib/reports';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

interface ReportModalProps {
    targetType: ReportTargetType;
    targetId: string;
    reportedId?: string; // Optional: ID of the user responsible for the target
    targetName: string;
    onClose: () => void;
}

const REASONS = [
    'Contenu inapproprié ou offensant',
    'Arnaque ou fraude suspectée',
    'Produit interdit ou illégal',
    'Faux profil ou usurpation d\'identité',
    'Spam ou publicité abusive',
    'Autre (Veuillez préciser)'
];

export default function ReportModal({ targetType, targetId, reportedId, targetName, onClose }: ReportModalProps) {
    const { user } = useAuthStore();
    const [reason, setReason] = useState(REASONS[0]);
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Vous devez être connecté pour signaler un contenu.");
            return;
        }

        if (reason === REASONS[REASONS.length - 1] && !details.trim()) {
            toast.error("Veuillez préciser la raison du signalement.");
            return;
        }

        setSubmitting(true);
        try {
            await reportsApi.createReport({
                reporter_id: user.id,
                reported_id: reportedId,
                target_type: targetType,
                target_id: targetId,
                reason,
                details: details.trim() || undefined
            });
            toast.success("Signalement envoyé avec succès. Merci !");
            onClose();
        } catch (err: any) {
            console.error('Error submitting report:', err);
            toast.error(err.message || "Erreur lors de l'envoi du signalement.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '450px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626' }}>
                        <ShieldAlert size={20} />
                        <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Signaler un contenu</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Vous signalez actuellement : <strong style={{ color: 'var(--text-primary)' }}>{targetName}</strong>.
                        Nos modérateurs examineront cette requête dans les plus brefs délais.
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Raison du signalement *</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="input-base"
                            style={{ width: '100%' }}
                        >
                            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                            Détails supplémentaires {(reason === REASONS[REASONS.length - 1]) && '*'}
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="input-base"
                            placeholder="Fournissez un maximum de contexte pour aider nos modérateurs..."
                            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                            required={reason === REASONS[REASONS.length - 1]}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} disabled={submitting} style={{ padding: '10px 16px', border: '1px solid var(--border)', background: 'white', borderRadius: 'var(--radius-md)', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px' }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={submitting} style={{ padding: '10px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                            {submitting ? 'Envoi...' : 'Envoyer le signalement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
