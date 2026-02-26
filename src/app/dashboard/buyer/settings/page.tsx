'use client';
import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, User as UserIcon, Phone, MapPin } from 'lucide-react';
import PhotoRequestForm from '@/components/PhotoRequestForm';

export default function BuyerSettingsPage() {
    const { user, initialize } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address_city: '',
        address_wilaya: '',
    });

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.phone || '',
                address_city: data.address_city || '',
                address_wilaya: data.address_wilaya || '',
            });
            setProfilePhoto(data.profile_photo || '');
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setSaveStatus('idle');
        setSaveError('');
        try {
            const { error } = await supabase.from('profiles').update(formData).eq('id', user.id);
            if (error) throw error;
            setSaveStatus('success');
            await initialize();
            setTimeout(() => setSaveStatus('idle'), 4000);
        } catch (err: any) {
            console.error('Buyer settings save error:', err);
            setSaveError(err.message || JSON.stringify(err) || 'Erreur inconnue');
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <DashboardSidebar type="buyer" />
            <main style={{ flex: 1, padding: '28px 24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Paramètres du profil</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>Gérez vos informations personnelles</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>

                    {/* Profile photo section */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>📸 Photo de profil</h2>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <img
                                src={profilePhoto || 'https://i.pravatar.cc/150'}
                                alt="Photo de profil"
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-secondary)', flexShrink: 0 }}
                            />
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', paddingTop: '8px' }}>
                                Votre photo actuelle. Pour la modifier, utilisez le formulaire ci-dessous.
                            </p>
                        </div>
                        <PhotoRequestForm
                            targetType="profile_photo"
                            label="photo de profil"
                            onSuccess={fetchProfile}
                        />
                    </div>

                    {/* Personal info form */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>📝 Informations personnelles</h2>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Prénom</label>
                                    <div style={{ position: 'relative' }}>
                                        <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" className="input-base" style={{ paddingLeft: '40px' }} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Nom</label>
                                    <div style={{ position: 'relative' }}>
                                        <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" className="input-base" style={{ paddingLeft: '40px' }} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Numéro de téléphone</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="tel" className="input-base" style={{ paddingLeft: '40px' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Ville</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" className="input-base" style={{ paddingLeft: '40px' }} value={formData.address_city} onChange={e => setFormData({ ...formData, address_city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Wilaya</label>
                                    <select className="input-base" value={formData.address_wilaya} onChange={e => setFormData({ ...formData, address_wilaya: e.target.value })}>
                                        <option value="">Sélectionner une wilaya</option>
                                        <option value="Alger">Alger</option>
                                        <option value="Oran">Oran</option>
                                        <option value="Constantine">Constantine</option>
                                        <option value="Sétif">Sétif</option>
                                        <option value="Annaba">Annaba</option>
                                        <option value="Blida">Blida</option>
                                    </select>
                                </div>
                            </div>
                            {saveStatus === 'success' && (
                                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: '#15803d', fontWeight: 600, marginBottom: '12px' }}>
                                    ✅ Paramètres enregistrés avec succès !
                                </div>
                            )}
                            {saveStatus === 'error' && (
                                <div style={{ background: '#fee2e2', border: '1.5px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: '#b91c1c', marginBottom: '12px' }}>
                                    ❌ Erreur : {saveError}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 32px' }}>
                                    {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
