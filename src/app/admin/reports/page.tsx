'use client';
import { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, CheckCircle, XCircle, MessageSquare, ExternalLink } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { reportsApi, Report, ReportStatusType } from '@/lib/reports';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { getOrCreateConversation } from '@/lib/messages';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
    const { user } = useAuthStore();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportsApi.getAdminReports();
            setReports(data);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des signalements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleMessageUser = async (userId: string | undefined) => {
        if (!user) return;
        if (!userId) {
            toast.error("Cet utilisateur n'existe plus.");
            return;
        }

        try {
            const convId = await getOrCreateConversation(user.id, userId);
            window.location.href = `/messages?conv=${convId}`;
        } catch (err: any) {
            console.error(err);
            toast.error("Erreur lors de l'ouverture de la conversation");
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: ReportStatusType) => {
        try {
            await reportsApi.updateReportStatus(id, newStatus);
            toast.success(`Statut mis à jour : ${newStatus}`);
            fetchReports();
        } catch (err: any) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const filteredReports = reports.filter(r => statusFilter === 'all' || r.status === statusFilter);

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
            <div className="flex flex-col md:flex-row">
                <AdminSidebar />
                <main className="flex-1 p-4 md:p-8 overflow-x-auto pb-24 md:pb-8">
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert style={{ color: '#ef4444' }} /> Signalements
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gérez les plaintes et les requêtes de modération de la plateforme</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', background: 'white', cursor: 'pointer' }}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente d'action</option>
                            <option value="resolved">Résolu (Sanction appliqué)</option>
                            <option value="dismissed">Rejeté / Faux signalement</option>
                        </select>
                        <button onClick={fetchReports} style={{ padding: '9px', border: '1px solid var(--border)', background: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>🔄</button>
                        <p style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>{filteredReports.length} rapport(s)</p>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <ShieldAlert size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Aucun signalement</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>La plateforme est saine pour le moment !</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            {filteredReports.map(report => (
                                <div key={report.id} style={{ background: 'white', border: `1px solid ${report.status === 'pending' ? '#fca5a5' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: report.status === 'pending' ? '#fef2f2' : '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'white', border: '1px solid var(--border)' }}>
                                                {report.target_type === 'product' && '🛍️ Produit'}
                                                {report.target_type === 'trip' && '✈️ Voyage'}
                                                {report.target_type === 'profile' && '👤 Profil'}
                                                {report.target_type === 'other' && 'Autre'}
                                            </span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signalé le {formatDate(report.created_at)}</span>
                                        </div>
                                        <div>
                                            {report.status === 'pending' && <span className="badge badge-red">En attente</span>}
                                            {report.status === 'resolved' && <span className="badge badge-green">Résolu</span>}
                                            {report.status === 'dismissed' && <span className="badge badge-gray">Rejeté</span>}
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px' }} className="flex flex-col md:flex-row gap-6">
                                        {/* Report Details */}
                                        <div className="flex-1">
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>{report.reason}</h3>
                                            {report.details && (
                                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', borderLeft: '3px solid #dc2626' }}>
                                                    {report.details}
                                                </div>
                                            )}

                                            {/* Entity Links */}
                                            {report.target_id && (
                                                <div style={{ marginTop: '12px' }}>
                                                    {report.target_type === 'product' && (
                                                        <a href={`/products/${report.target_id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                                            <ExternalLink size={14} /> Voir le produit incriminé
                                                        </a>
                                                    )}
                                                    {/* We can't link directly to trips by ID easily without making a trip view, but we can link the profile */}
                                                    {(report.target_type === 'profile' || report.target_type === 'trip') && report.reported_id && (
                                                        <a href={`/sellers/${report.reported_id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                                            <ExternalLink size={14} /> Voir le profil incriminé
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Users Details */}
                                        <div className="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 space-y-4">
                                            {/* Reporter */}
                                            <div>
                                                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Plaignant (Celui qui signale)</p>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <img src={report.reporter?.profile_photo || 'https://i.pravatar.cc/150'} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />
                                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{report.reporter?.first_name} {report.reporter?.last_name}</span>
                                                    </div>
                                                    <button onClick={() => handleMessageUser(report.reporter_id)} style={{ padding: '6px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Contacter le plaignant">
                                                        <MessageSquare size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Reported Person */}
                                            {report.reported && (
                                                <div>
                                                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Vendeur / Utilisateur Accusé</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <img src={report.reported?.profile_photo || 'https://i.pravatar.cc/150'} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />
                                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>{report.reported?.first_name} {report.reported?.last_name}</span>
                                                        </div>
                                                        <button onClick={() => handleMessageUser(report.reported_id)} style={{ padding: '6px', background: 'white', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer' }} title="Contacter l'accusé">
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action bar */}
                                    <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        {report.status !== 'dismissed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <XCircle size={14} /> Rejeter le signalement
                                            </button>
                                        )}
                                        {report.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: 'none', background: '#22c55e', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <CheckCircle size={14} /> Marquer comme Résolu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
