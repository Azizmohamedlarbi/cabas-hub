'use client';
import { useAuthStore } from '@/store/auth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import PendingVerification from '@/components/dashboard/PendingVerification';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuthStore();
    const pathname = usePathname();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            </div>
        );
    }

    // Protection gate: if seller is not verified and not on the settings page
    const isSettingsPage = pathname === '/dashboard/seller/settings';
    const isUnverifiedSeller = user?.userType === 'seller' && !user?.anaeVerified;

    if (isUnverifiedSeller && !isSettingsPage) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
                <DashboardSidebar type="seller" />
                <main style={{ flex: 1 }}>
                    <DashboardHeader title="Vérification en cours" />
                    <PendingVerification />
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <DashboardSidebar type="seller" />
            <main style={{ flex: 1 }}>
                {children}
            </main>
        </div>
    );
}
