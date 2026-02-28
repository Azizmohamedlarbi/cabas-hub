import type { Metadata, ResolvingMetadata } from 'next';
import { db } from '@/lib/db';

type Props = {
    params: { slug: string };
    children: React.ReactNode;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.slug;

    try {
        const product = await db.getProductBySlug(slug);

        if (!product) {
            return {
                title: 'Produit introuvable - CABAS HUB',
            };
        }

        const title = `${product.name} en Algérie | CABAS HUB`;
        const description = product.description.substring(0, 160) + '...';
        const images = product.images?.[0] ? [product.images[0]] : [];

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images,
            },
        };
    } catch (e) {
        return {
            title: 'Détails du Produit - CABAS HUB',
        };
    }
}

export default function ProductDetailLayout({ children }: Props) {
    return <>{children}</>;
}
