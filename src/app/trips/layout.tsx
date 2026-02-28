import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Voyages en Cours & Pré-commandes - CABAS HUB',
    description: 'Consultez les dates de voyage de nos importateurs. Pré-commandez vos articles avant le départ pour économiser jusqu\'à 40% sur des pays comme la Chine, France, Turquie, Emirats, etc.',
    keywords: 'voyages cabashub, pre-commande algérie, importation chine, importation turquie, dubai algérie'
};

export default function TripsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
