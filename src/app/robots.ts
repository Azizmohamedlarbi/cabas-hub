import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/messages/', '/checkout/', '/settings/'],
        },
        sitemap: 'https://cabashub.com/sitemap.xml',
    };
}
