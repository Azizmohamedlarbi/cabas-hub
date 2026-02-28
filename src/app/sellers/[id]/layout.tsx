import type { Metadata, ResolvingMetadata } from 'next';
import { db } from '@/lib/db';

type Props = {
    params: { id: string };
    children: React.ReactNode;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id;

    try {
        const seller = await db.getSellerById(id);

        if (!seller) {
            return {
                title: 'Profil introuvable - CABAS HUB',
            };
        }

        const title = `${seller.business_name || (seller.first_name + ' ' + seller.last_name)} - Vendeur sur CabasHub`;
        const description = seller.bio
            ? seller.bio.substring(0, 160)
            : `Découvrez les produits de ${seller.first_name}, vendeur vérifié sur la marketplace B2B CabasHub Algérie.`;

        const images = seller.profile_photo ? [seller.profile_photo] : [];

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images,
                type: 'profile',
            },
            twitter: {
                card: seller.cover_photo ? 'summary_large_image' : 'summary',
                title,
                description,
                images,
            },
        };
    } catch (e) {
        return {
            title: 'Profil Vendeur - CABAS HUB',
        };
    }
}

export default function SellerProfileLayout({ children }: Props) {
    return <>{children}</>;
}
