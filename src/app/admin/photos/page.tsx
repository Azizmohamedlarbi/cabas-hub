'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Image as ImageIcon, Clock, Link as LinkIcon, Mail } from 'lucide-react';
import { db } from '@/lib/db';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    pending_url: { label: '⏳ Attente URL', cls: 'badge-orange' },
    pending_review: { label: '👁 En révision', cls: 'badge-blue' },
    approved: { label: '✅ Approuvé', cls: 'badge-green' },
    rejected: { label: '❌ Rejeté', cls: 'badge-red' },
};

const TYPE_LABELS: Record<string, string> = {
    profile_photo: '👤 Photo profil',
    cover_photo: '🖼 Photo couverture',
    product_image: '📦 Image produit',
};

export default function AdminPhotosPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
    const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await db.getAllPhotoRequests(filter);
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [filter]);

    const handleApprove = async (req: any) => {
        const url = urlInputs[req.id]?.trim() || req.proposed_url;
        if (!url) { alert('Veuillez coller l\'URL de la photo avant d\'approuver.'); return; }
        setActionLoading(req.id);
        try {
            await db.approvePhotoRequest(req.id, url);
            await fetchRequests();
        } catch (err: any) {
            alert('Erreur: ' + (err.message || err));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (req: any) => {
        setActionLoading(req.id + '_reject');
        try {
            await db.rejectPhotoRequest(req.id, noteInputs[req.id]);
            await fetchRequests();
        } catch (err: any) {
            alert('Erreur: ' + (err.message || err));
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending_url' || r.status === 'pending_review').length;

    return (
        <div style={{ padding: '28px 24px', maxWidth: '1100px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                    📸 Gestion des Photos
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Approuvez les demandes de changement de photo et ajoutez les URLs
                </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'pending_url', label: `⏳ Attente URL` },
                    { key: 'pending_review', label: '👁 En révision' },
                    { key: 'approved', label: '✅ Approuvées' },
                    { key: 'rejected', label: '❌ Rejetées' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{ padding: '7px 16px', borderRadius: 'var(--radius-full)', border: '1.5px solid', borderColor: filter === tab.key ? 'var(--primary)' : 'var(--border)', background: filter === tab.key ? 'var(--primary)' : 'white', color: filter === tab.key ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    >
                        {tab.label}
                        {tab.key === 'all' && pendingCount > 0 && (
                            <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', borderRadius: '999px', padding: '0 7px', fontSize: '11px' }}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                </div>
            ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <ImageIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Aucune demande pour ce filtre.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {requests.map(req => {
                        const profile = req.profiles;
                        const statusInfo = STATUS_LABELS[req.status] ?? { label: req.status, cls: 'badge-gray' };
                        const isProcessing = actionLoading === req.id || actionLoading === req.id + '_reject';
                        const isPending = req.status === 'pending_url' || req.status === 'pending_review';

                        return (
                            <div key={req.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                {/* Avatar */}
                                <img
                                    src={profile?.profile_photo || 'https://i.pravatar.cc/150'}
                                    alt=""
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
                                />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* Row 1: name + type + status + date */}
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>
                                            {profile?.first_name} {profile?.last_name}
                                            {profile?.business_name && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px', fontSize: '13px' }}>· {profile.business_name}</span>}
                                        </span>
                                        <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} /> {new Date(req.created_at).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Row 2: type + path badge */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                        <span className="badge badge-blue">{TYPE_LABELS[req.target_type] ?? req.target_type}</span>
                                        <span className={`badge ${req.path === 'self' ? 'badge-green' : 'badge-orange'}`}>
                                            {req.path === 'self' ? <><LinkIcon size={10} /> Lien direct</> : <><Mail size={10} /> Via email</>}
                                        </span>
                                    </div>

                                    {/* Description (email path) */}
                                    {req.description && (
                                        <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>
                                            <strong>Description :</strong> {req.description}
                                        </div>
                                    )}

                                    {/* Existing URL (self-path preview) */}
                                    {req.proposed_url && req.status !== 'approved' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                            <img src={req.proposed_url} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            <a href={req.proposed_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--primary)', wordBreak: 'break-all' }}>{req.proposed_url}</a>
                                        </div>
                                    )}

                                    {/* Approved: show final URL preview */}
                                    {req.status === 'approved' && req.proposed_url && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={req.proposed_url} alt="applied" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid #22c55e' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            <span style={{ fontSize: '12px', color: '#15803d' }}>Photo appliquée ✅</span>
                                        </div>
                                    )}

                                    {/* Rejected note */}
                                    {req.status === 'rejected' && req.admin_note && (
                                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: '#b91c1c' }}>
                                            Note admin : {req.admin_note}
                                        </div>
                                    )}

                                    {/* Action area for pending requests */}
                                    {isPending && (
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '10px' }}>
                                            <input
                                                value={urlInputs[req.id] || (req.proposed_url || '')}
                                                onChange={e => setUrlInputs(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                placeholder="Coller l'URL de la photo ici..."
                                                className="input-base"
                                                style={{ flex: 1, minWidth: '220px', fontSize: '13px' }}
                                            />
                                            <input
                                                value={noteInputs[req.id] || ''}
                                                onChange={e => setNoteInputs(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                placeholder="Note (optionnel)..."
                                                className="input-base"
                                                style={{ flex: 1, minWidth: '160px', fontSize: '13px' }}
                                            />
                                            <button
                                                onClick={() => handleApprove(req)}
                                                disabled={isProcessing}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}
                                            >
                                                {actionLoading === req.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                                                Approuver & Appliquer
                                            </button>
                                            <button
                                                onClick={() => handleReject(req)}
                                                disabled={isProcessing}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}
                                            >
                                                <XCircle size={13} />
                                                Rejeter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
