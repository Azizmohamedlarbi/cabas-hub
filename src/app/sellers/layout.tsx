import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vendeurs Vérifiés (ANAE) - CABAS HUB',
    description: 'Trouvez, contactez et négociez avec des micro-importateurs certifiés par l\'ANAE de toutes les wilayas d\'Algérie. Partenariats de confiance.',
    keywords: 'vendeurs cabashub, micro importateurs, fournisseurs algérie, auto-entrepreneurs anae'
};

export default function SellersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
