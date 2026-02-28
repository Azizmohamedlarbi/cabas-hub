import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tous les Produits - CABAS HUB',
    description: 'Découvrez notre catalogue complet de produits importés, vérifiés par l\'ANAE. Filtrez par catégories, wilayas et prix pour trouver les meilleures offres B2B et B2C en Algérie.',
    keywords: 'catalogue produits, importation algérie, cabashub produits, électronique, vêtements, cosmétiques en gros'
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
