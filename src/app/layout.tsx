import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import AuthProvider from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'CABAS HUB – Marketplace B2B/B2C pour Micro-Importateurs Algériens',
  description: 'La marketplace qui connecte micro-importateurs algériens avec acheteurs B2B et B2C. Produits vérifiés, paiement sécurisé, messagerie intégrée.',
  keywords: 'marketplace algérie, micro-importateur, ANAE, achat en gros, produits importés, B2B B2C',
  icons: {
    icon: '/Cabas_Hub_logo.png',
    shortcut: '/Cabas_Hub_logo.png',
    apple: '/Cabas_Hub_logo.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
        <AuthProvider>
          <Toaster position="bottom-center" toastOptions={{ duration: 3000, style: { background: '#22c55e', color: '#fff', fontWeight: 600 } }} />
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
