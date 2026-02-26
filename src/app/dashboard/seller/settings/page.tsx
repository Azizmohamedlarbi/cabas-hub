'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { Save, Loader2, Upload, Camera } from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PhotoUploadModal from '@/components/photos/PhotoUploadModal';

export default function SellerSettingsPage() {
    const { user, refreshProfile } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        shop_name: '',
        phone: '',
        wilaya: 'Alger',
        bio: '',
        import_countries: [] as string[]
    });
    const [profilePhoto, setProfilePhoto] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    shop_name: data.shop_name || '',
                    phone: data.phone || '',
                    wilaya: data.wilaya || 'Alger',
                    bio: data.bio || '',
                    import_countries: data.import_countries || []
                });
                setProfilePhoto(data.photo_url || '');
                setCoverPhoto(data.cover_photo_url || '');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        setSaveStatus('idle');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    shop_name: formData.shop_name,
                    phone: formData.phone,
                    wilaya: formData.wilaya,
                    bio: formData.bio,
                    import_countries: formData.import_countries,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile();
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setSaveStatus('error');
            setSaveError(err.message || 'Une erreur est survenue');
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
        <div style={{ padding: '28px 24px' }}>
            <DashboardHeader title="Paramètres de la Boutique" />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>Gérez votre identité visuelle et vos informations commerciales</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>

                {/* Photos Section */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>📸 Photos</h2>

                    <div style={{ position: 'relative', height: '150px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', overflow: 'hidden', marginBottom: '40px' }}>
                        <img src={coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '-40px', left: '24px' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white', background: 'white', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                                <img src={profilePhoto || '/default-avatar.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                            <PhotoUploadModal
                                userId={user?.id || ''}
                                type="cover"
                                label="photo de couverture"
                                onSuccess={fetchProfile}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '140px', marginTop: '-20px', marginBottom: '10px' }}>
                        <PhotoUploadModal
                            userId={user?.id || ''}
                            type="profile"
                            label="photo de profil"
                            onSuccess={fetchProfile}
                        />
                    </div>
                </div>

                {/* Info form */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>📝 Informations de la boutique</h2>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Prénom</label>
                                <input type="text" className="input-base" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Nom</label>
                                <input type="text" className="input-base" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Nom Commercial / Boutique</label>
                            <input type="text" className="input-base" value={formData.shop_name} onChange={e => setFormData({ ...formData, shop_name: e.target.value })} placeholder="Ex: Flash Electronics" />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Biographie / Description</label>
                            <textarea className="input-base" rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Dites-en plus sur votre activité..." style={{ resize: 'vertical' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Téléphone</label>
                                <input type="tel" className="input-base" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Wilaya</label>
                                <select className="input-base" value={formData.wilaya} onChange={e => setFormData({ ...formData, wilaya: e.target.value })}>
                                    <option value="Alger">Alger</option>
                                    <option value="Oran">Oran</option>
                                    <option value="Constantine">Constantine</option>
                                    <option value="Sétif">Sétif</option>
                                    <option value="Béjaïa">Béjaïa</option>
                                    <option value="Tlemcen">Tlemcen</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <div>
                                {saveStatus === 'success' && <p style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>✅ Modifications enregistrées</p>}
                                {saveStatus === 'error' && <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>❌ {saveError}</p>}
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 24px' }}>
                                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
