'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function SearchRedirector() {
    const params = useSearchParams();
    const router = useRouter();
    const q = params.get('q') ?? '';

    useEffect(() => {
        if (q) {
            router.replace(`/products?search=${encodeURIComponent(q)}`);
        } else {
            router.replace('/products');
        }
    }, [q, router]);

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Redirection vers les produits...
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>}>
            <SearchRedirector />
        </Suspense>
    );
}
