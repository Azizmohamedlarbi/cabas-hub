'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, Mail, Settings } from 'lucide-react';
import { db } from '@/lib/db';

export default function AdminSettingsPage() {
    const [photoEmail, setPhotoEmail] = useState('');
    const [subjectPrefix, setSubjectPrefix] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [email, prefix] = await Promise.all([
                db.getPlatformSetting('photo_email'),
                db.getPlatformSetting('photo_email_subject_prefix'),
            ]);
            setPhotoEmail(email || '');
            setSubjectPrefix(prefix || '');
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await Promise.all([
                db.updatePlatformSetting('photo_email', photoEmail),
                db.updatePlatformSetting('photo_email_subject_prefix', subjectPrefix),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            alert('Erreur: ' + (err.message || err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
    );

    return (
        <div style={{ padding: '28px 24px', maxWidth: '700px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                    ⚙️ Paramètres de la plateforme
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Configuration globale visible et utilisée par la plateforme
                </p>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {/* Section: Photo email */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Mail size={18} style={{ color: 'var(--primary)' }} />
                        <h2 style={{ fontWeight: 700, fontSize: '15px' }}>Email de réception des photos</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                        Cette adresse est affichée aux utilisateurs qui choisissent d'envoyer leurs photos par email (Option B). Modifiez-la ici si vous changez d'adresse.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Adresse email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    value={photoEmail}
                                    onChange={e => setPhotoEmail(e.target.value)}
                                    className="input-base"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="photos@cabashub.dz"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Préfixe d'objet recommandé</label>
                            <input
                                type="text"
                                value={subjectPrefix}
                                onChange={e => setSubjectPrefix(e.target.value)}
                                className="input-base"
                                placeholder="Ex: Photo -"
                            />
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Les utilisateurs verront : <em>"{subjectPrefix} [Votre nom] – [Type de photo]"</em>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview of how it'll look to users */}
                <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aperçu — ce que voit l'utilisateur</p>
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', fontSize: '13px' }}>
                        <p style={{ marginBottom: '4px' }}>📧 Envoyez votre photo à : <strong style={{ color: 'var(--primary)' }}>{photoEmail || 'photos@cabashub.dz'}</strong></p>
                        <p style={{ color: 'var(--text-muted)' }}>Objet: <em>{subjectPrefix || 'Photo -'} [Votre nom] – Photo profil</em></p>
                    </div>
                </div>

                {/* Save button */}
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                    {saved && <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>✅ Enregistré !</span>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                    >
                        {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}
