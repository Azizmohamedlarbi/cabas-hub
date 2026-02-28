'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid, List, Search, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import InlineFeedback from '@/components/feedback/InlineFeedback';
import { IMPORT_COUNTRIES } from '@/lib/mock-data';
import { db } from '@/lib/db';
import { Category, Product } from '@/types';

function ProductsPageInner() {
    const searchParams = useSearchParams();
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || ''; // can be category_id or slug

    const [search, setSearch] = useState(urlSearch);
    const [category, setCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(999999);
    const [country, setCountry] = useState('');
    const [wholesaleOnly, setWholesaleOnly] = useState(false);
    const [sort, setSort] = useState('newest');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(true);

    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);
            setFetchError('');
            try {
                const [cats, prods] = await Promise.all([
                    db.getCategories(),
                    db.getProducts()           // public page: active products only
                ]);
                setCategories(cats);
                setProducts(prods.filter(p => p.profiles?.anae_verified === true));

                // Pre-select category from URL param
                if (urlCategory && cats.length > 0) {
                    const matched = cats.find(c =>
                        String(c.id) === urlCategory || c.slug === urlCategory
                    );
                    if (matched) setCategory(matched);
                }
            } catch (error: any) {
                console.error('Failed to fetch data:', error);
                setFetchError(error?.message || JSON.stringify(error) || 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []); // eslint-disable-line

    const filtered = useMemo(() => {
        let p = [...products];
        if (search) {
            p = p.filter(x =>
                x.title?.toLowerCase().includes(search.toLowerCase()) ||
                x.description?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (category) p = p.filter(x => String(x.category_id) === String(category.id));
        if (wholesaleOnly) p = p.filter(x => !x.retail_only);
        if (country) p = p.filter(x => x.origin_country === country);
        if (priceMax < 999999) p = p.filter(x => x.price_retail >= priceMin && x.price_retail <= priceMax);

        if (sort === 'price_asc') p.sort((a, b) => a.price_retail - b.price_retail);
        if (sort === 'price_desc') p.sort((a, b) => b.price_retail - a.price_retail);
        if (sort === 'popular') p.sort((a, b) => (b.views || 0) - (a.views || 0));
        if (sort === 'rating') p.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
        return p;
    }, [products, search, category, priceMin, priceMax, country, wholesaleOnly, sort]);

    // No full-page block

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px' }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: '36px' }} />
                        </div>
                        <select value={sort} onChange={e => setSort(e.target.value)} className="input-base" style={{ width: 'auto' }}>
                            <option value="newest">Plus récents</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="popular">Populaires</option>
                            <option value="rating">Mieux notés</option>
                        </select>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                            <button onClick={() => setView('grid')} style={{ padding: '8px', border: `1.5px solid ${view === 'grid' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: view === 'grid' ? 'var(--primary-bg)' : 'white', color: view === 'grid' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}><Grid size={16} /></button>
                            <button onClick={() => setView('list')} style={{ padding: '8px', border: `1.5px solid ${view === 'list' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: view === 'list' ? 'var(--primary-bg)' : 'white', color: view === 'list' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}><List size={16} /></button>
                            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                <SlidersHorizontal size={15} /> Filtres
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container flex flex-col md:flex-row items-start gap-6" style={{ padding: '24px 16px' }}>
                {/* Sidebar filters */}
                {showFilters && (
                    <aside className="w-full md:w-[240px]" style={{ flexShrink: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', position: 'sticky', top: '90px', zIndex: 10 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '20px' }}>🔍 Filtres</h3>

                        {/* Category */}
                        <FilterSection title="Catégorie">
                            <button onClick={() => setCategory(null)} style={{ width: '100%', textAlign: 'left', padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: !category ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: !category ? 600 : 400 }}>Toutes les catégories</button>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setCategory(cat)} style={{ width: '100%', textAlign: 'left', padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: category?.id === cat.id ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: category?.id === cat.id ? 600 : 400 }}>
                                    {cat.icon} {cat.name} {(cat as any).count !== undefined ? `(${(cat as any).count})` : ''}
                                </button>
                            ))}
                        </FilterSection>

                        {/* Price range */}
                        <FilterSection title="Prix (DA)">
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <input type="number" value={priceMin} onChange={e => setPriceMin(+e.target.value)} placeholder="Min" className="input-base" style={{ padding: '7px 10px', fontSize: '13px' }} />
                                <input type="number" value={priceMax === 999999 ? '' : priceMax} onChange={e => setPriceMax(+e.target.value || 999999)} placeholder="Max" className="input-base" style={{ padding: '7px 10px', fontSize: '13px' }} />
                            </div>
                            <input type="range" min={0} max={300000} value={Math.min(priceMax, 300000)} onChange={e => setPriceMax(+e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span>0 DA</span><span>300 000 DA</span>
                            </div>
                        </FilterSection>

                        {/* Origin country */}
                        <FilterSection title="Pays d'origine">
                            <button onClick={() => setCountry('')} style={{ width: '100%', textAlign: 'left', padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: !country ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: !country ? 600 : 400 }}>Tous les pays</button>
                            {IMPORT_COUNTRIES.map(c => (
                                <button key={c.code} onClick={() => setCountry(c.name)} style={{ width: '100%', textAlign: 'left', padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: country === c.name ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: country === c.name ? 600 : 400 }}>
                                    {c.flag} {c.name}
                                </button>
                            ))}
                        </FilterSection>

                        {/* Type */}
                        <FilterSection title="Type">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                <input type="checkbox" checked={wholesaleOnly} onChange={e => setWholesaleOnly(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                                Grossiste uniquement
                            </label>
                        </FilterSection>

                        <button onClick={() => { setCategory(null); setPriceMin(0); setPriceMax(999999); setCountry(''); setWholesaleOnly(false); setSearch(''); }} style={{ width: '100%', padding: '9px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '32px' }}>
                            🔄 Réinitialiser filtres
                        </button>

                        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginTop: 'auto' }}>
                            <InlineFeedback feature="catalog" title="Trouvez-vous facilement ce que vous cherchez ?" type="stars" />
                        </div>
                    </aside>
                )}

                {/* Products grid */}
                <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}><strong>{filtered.length}</strong> produits trouvés{category ? ` dans "${category.name}"` : ''}{search ? ` pour "${search}"` : ''}</p>
                    </div>

                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
                            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
                        </div>
                    )}

                    {/* Error display */}
                    {fetchError && (
                        <div style={{ background: '#fee2e2', border: '1.5px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <AlertTriangle size={18} style={{ color: '#b91c1c', flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '13px' }}>Erreur lors du chargement des produits :</p>
                                <p style={{ color: '#b91c1c', fontSize: '12px', marginTop: '4px' }}>{fetchError}</p>
                            </div>
                        </div>
                    )}

                    {/* Products pending approval notice */}
                    {!fetchError && products.length === 0 && !loading && (
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
                            💡 Aucun produit actif trouvé. Si vous venez d'ajouter des produits, allez dans <strong>Admin → Produits</strong> et approuvez-les (cliquez le ✓ vert).
                        </div>
                    )}

                    {filtered.length === 0 && products.length > 0 && !loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Aucun produit trouvé</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Essayez de modifier vos filtres ou votre recherche</p>
                        </div>
                    ) : view === 'grid' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', opacity: loading ? 0.4 : 1 }}>
                            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: loading ? 0.4 : 1 }}>
                            {filtered.map(p => <ProductCard key={p.id} product={p} view="list" />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: '0 0 8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                {title} <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
            </button>
            {open && children}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} /></div>}>
            <ProductsPageInner />
        </Suspense>
    );
}
