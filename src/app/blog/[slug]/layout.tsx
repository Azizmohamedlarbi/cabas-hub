import type { Metadata, ResolvingMetadata } from 'next';
import { blogApi } from '@/lib/blog';

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
        const post = await blogApi.getPostBySlug(slug);

        if (!post) {
            return {
                title: 'Article introuvable - CABAS HUB',
            };
        }

        const title = `${post.title} | Blog CABAS HUB`;
        const description = (post.extract || 'Découvrez cet article stratégique sur le blog CabasHub.').substring(0, 160);
        const images = post.cover_image ? [post.cover_image] : [];

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images,
                type: 'article',
                publishedTime: post.created_at,
                authors: post.author ? [`${post.author.first_name} ${post.author.last_name}`] : undefined,
            },
            twitter: {
                card: post.cover_image ? 'summary_large_image' : 'summary',
                title,
                description,
                images,
            },
        };
    } catch (e) {
        return {
            title: 'Article Blog - CABAS HUB',
        };
    }
}

export default function BlogPostLayout({ children }: Props) {
    return <>{children}</>;
}
