'use client';
import { useState } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import PhotoRequestForm from '@/components/PhotoRequestForm';

interface PhotoUploadModalProps {
    userId: string;
    type: 'profile_photo' | 'cover_photo' | 'product_image' | 'profile' | 'cover';
    targetId?: string;
    label?: string;
    onSuccess?: () => void;
}

export default function PhotoUploadModal({ userId, type, targetId, label, onSuccess }: PhotoUploadModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Map short names to target types expected by PhotoRequestForm
    const targetType = type === 'profile' || type === 'profile_photo' ? 'profile_photo' :
        type === 'cover' || type === 'cover_photo' ? 'cover_photo' :
            'product_image';

    const handleSuccess = () => {
        onSuccess?.();
        // We don't necessarily close immediately because they might want to see the "success" state in the form
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-secondary"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    background: 'white',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <Camera size={16} />
                Modifier {label}
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Upload size={20} style={{ color: 'var(--primary)' }} />
                                Modification {label}
                            </h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <PhotoRequestForm
                                targetType={targetType}
                                targetId={targetId}
                                label={label}
                                onSuccess={handleSuccess}
                            />

                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="btn-secondary"
                                    style={{ padding: '8px 20px', fontSize: '14px' }}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
