'use client';
import { useState, useEffect } from 'react';
import { Loader2, LinkIcon, Mail, Camera, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuthStore } from '@/store/auth';

type TargetType = 'profile_photo' | 'cover_photo' | 'product_image';

interface PhotoRequestFormProps {
    targetType: TargetType;
    targetId?: string;
    label?: string;
    onSuccess?: () => void;
}

export default function PhotoRequestForm({ targetType, targetId, label, onSuccess }: PhotoRequestFormProps) {
    const { user } = useAuthStore();
    const [path, setPath] = useState<'self' | 'email'>('self');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [photoEmail, setPhotoEmail] = useState('photos@cabashub.dz');
    const [subjectPrefix, setSubjectPrefix] = useState('Photo -');
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [lockInfo, setLockInfo] = useState<{ allowed: boolean; nextAllowed: Date | null } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [email, prefix] = await Promise.all([
                    db.getPlatformSetting('photo_email'),
                    db.getPlatformSetting('photo_email_subject_prefix'),
                ]);
                if (email) setPhotoEmail(email);
                if (prefix) setSubjectPrefix(prefix);
            } catch {
                // Use defaults if settings table not yet created
            }

            if (user) {
                try {
                    const reqs = await db.getMyPhotoRequests(user.id);
                    setMyRequests(reqs.filter((r: any) =>
                        r.target_type === targetType && (!targetId || r.target_id === targetId)
                    ).slice(0, 3));
                } catch {
                    // Ignore if table doesn't exist yet
                }
            }

            if (targetType === 'product_image' && targetId) {
                try {
                    const info = await db.canChangeProductImages(targetId);
                    setLockInfo(info);
                } catch {
                    // Default: allowed
                }
            }
        };
        load();
    }, [user, targetType, targetId]);

    const handleSubmit = async () => {
        if (!user) {
            setError('Vous devez être connecté pour soumettre une demande.');
            return;
        }
        if (path === 'self' && !url.trim()) { setError('Veuillez entrer un lien.'); return; }
        if (path === 'email' && !description.trim()) { setError('Veuillez décrire la photo.'); return; }

        setLoading(true);
        setError('');
        try {
            await db.createPhotoRequest({
                user_id: user.id,
                target_type: targetType,
                target_id: targetId,
                description: description || undefined,
                proposed_url: url || undefined,
                path,
            });
            setSubmitted(true);
            setUrl('');
            setDescription('');
            onSuccess?.();
        } catch (err: any) {
            // Make error unmissable — full message
            const msg = err?.message || JSON.stringify(err) || 'Erreur inconnue';
            if (msg.includes('relation') || msg.includes('does not exist') || msg.includes('42P01')) {
                setError('⚠️ La table photo_requests n\'existe pas encore. Veuillez exécuter photo_management_schema.sql dans Supabase.');
            } else {
                setError(`Erreur: ${msg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 3-day lock
    if (lockInfo && !lockInfo.allowed && lockInfo.nextAllowed) {
        return (
            <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Clock size={18} style={{ color: '#b45309', flexShrink: 0 }} />
                <div>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: '#92400e' }}>Changement d'image verrouillé (3 jours)</p>
                    <p style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                        Prochain changement possible le <strong>{lockInfo.nextAllowed.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                    </p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '13px', color: '#15803d' }}>Demande envoyée avec succès !</p>
                        <p style={{ fontSize: '12px', color: '#166534', marginTop: '4px', lineHeight: '1.5' }}>
                            {path === 'self'
                                ? 'Votre lien a été soumis. L\'administrateur l\'examinera et l\'appliquera.'
                                : 'Envoyez votre photo par email, l\'administrateur ajoutera l\'URL dès réception.'}
                        </p>
                        <button onClick={() => setSubmitted(false)} style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            Faire une autre demande
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Changer {label || 'la photo'}</span>
            </div>

            <div style={{ padding: '16px' }}>
                {/* Path toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                    <button
                        onClick={() => { setPath('self'); setError(''); }}
                        style={{ padding: '10px 8px', border: `2px solid ${path === 'self' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: path === 'self' ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                    >
                        <LinkIcon size={15} style={{ color: path === 'self' ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: path === 'self' ? 'var(--primary)' : 'var(--text-secondary)' }}>Coller un lien</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Google Drive, imgbb…</span>
                    </button>
                    <button
                        onClick={() => { setPath('email'); setError(''); }}
                        style={{ padding: '10px 8px', border: `2px solid ${path === 'email' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: path === 'email' ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                    >
                        <Mail size={15} style={{ color: path === 'email' ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: path === 'email' ? 'var(--primary)' : 'var(--text-secondary)' }}>Via email</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>L'admin s'en charge</span>
                    </button>
                </div>

                {/* Path A: direct URL */}
                {path === 'self' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Lien de la photo *</label>
                            <input
                                type="url"
                                value={url}
                                onChange={e => { setUrl(e.target.value); setError(''); }}
                                placeholder="https://drive.google.com/... ou https://i.ibb.co/..."
                                className="input-base"
                                style={{ fontSize: '13px' }}
                            />
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                ⚠️ Le lien doit être public (accessible sans connexion).
                            </p>
                        </div>
                        {url && (
                            <img src={url} alt="preview" style={{ maxHeight: '70px', maxWidth: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Description (optionnel)</label>
                            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Photo fond blanc, haute résolution" className="input-base" style={{ fontSize: '13px' }} />
                        </div>
                    </div>
                )}

                {/* Path B: email */}
                {path === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px' }}>
                            <p style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>📧 Envoyez votre photo à :</p>
                            <p style={{ color: '#1d4ed8', fontWeight: 600 }}>{photoEmail}</p>
                            <p style={{ color: '#3b82f6', marginTop: '4px', fontSize: '12px' }}>
                                Objet : <em>{subjectPrefix} [Votre nom] – {label || 'Photo'}</em>
                            </p>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>
                                Décrivez votre photo <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={e => { setDescription(e.target.value); setError(''); }}
                                placeholder="Ex: Portrait professionnel, fond blanc, costume sombre..."
                                className="input-base"
                                rows={2}
                                style={{ fontSize: '13px', resize: 'vertical' }}
                            />
                        </div>
                    </div>
                )}

                {/* Visible error box */}
                {error && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#fee2e2', border: '1.5px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginTop: '10px' }}>
                        <AlertTriangle size={15} style={{ color: '#b91c1c', flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '12px', color: '#b91c1c', lineHeight: '1.5' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || (path === 'self' && !url.trim()) || (path === 'email' && !description.trim())}
                    className="btn-primary"
                    style={{ marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '13px' }}
                >
                    {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                    {loading ? 'Envoi...' : path === 'self' ? 'Soumettre le lien' : 'Confirmer l\'envoi email'}
                </button>

                {/* Recent requests */}
                {myRequests.length > 0 && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Historique récent</p>
                        {myRequests.map((r: any) => {
                            const sMap: Record<string, { color: string; label: string }> = {
                                pending_url: { color: '#f59e0b', label: '⏳ En attente' },
                                pending_review: { color: '#3b82f6', label: '👁 En révision' },
                                approved: { color: '#22c55e', label: '✅ Approuvé' },
                                rejected: { color: '#ef4444', label: '❌ Rejeté' },
                            };
                            const s = sMap[r.status] || { color: '#94a3b8', label: r.status };
                            return (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString('fr-DZ')}</span>
                                    <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>
                                    {r.admin_note && <span style={{ color: '#b91c1c' }}>· {r.admin_note}</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
