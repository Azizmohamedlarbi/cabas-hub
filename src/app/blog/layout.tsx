import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Le Blog CabasHub - Actualités & Guides d\'Importation',
    description: 'Actualités e-commerce, trucs et astuces pour réussir son business sur CabasHub, et guides complets sur l\'importation en Algérie (B2B, B2C, ANAE).',
    keywords: 'blog cabashub, guide importation, conseils e-commerce algérie, douanes, transport international'
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
