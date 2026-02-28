import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { blogApi } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cabashub.com';

    // 1. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/sellers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/trips`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    // 2. Fetch dynamic content
    let products: any[] = [];
    let sellers: any[] = [];
    let trips: any[] = [];
    let blogPosts: any[] = [];

    try {
        products = await db.getProducts({ limit: 1000 }); // In production, consider pagination
        sellers = await db.getSellers(1000);
        trips = await db.getTrips();
        blogPosts = await blogApi.getPublishedPosts();
    } catch (e) {
        console.error("Sitemap generation error:", e);
    }

    // 3. Map dynamic routes
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(product.updated_at || product.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const sellerRoutes: MetadataRoute.Sitemap = sellers.map((seller) => ({
        url: `${baseUrl}/sellers/${seller.id}`,
        lastModified: new Date(seller.updated_at || seller.created_at || new Date()),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const tripRoutes: MetadataRoute.Sitemap = trips.map((trip) => ({
        url: `${baseUrl}/trips`, // Currently trips don't have individual pages, points to index
        lastModified: new Date(trip.updated_at || trip.created_at),
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...sellerRoutes, ...tripRoutes, ...blogRoutes];
}
