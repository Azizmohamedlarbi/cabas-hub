'use client';
import Link from 'next/link';
import { Search, ArrowRight, ShieldCheck, TrendingUp, Users, Star, Package, Zap, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import TripCard from '@/components/TripCard';
import { db } from '@/lib/db';
import { Product, Profile, Trip, Category } from '@/types';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [heroSuggestions, setHeroSuggestions] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [earlyAdopterStats, setEarlyAdopterStats] = useState({ sellers: 0, buyers: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          const results = await db.getSearchSuggestions(query);
          setHeroSuggestions(results);
        } catch { setHeroSuggestions([]); }
      } else {
        setHeroSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodData, selData, tripData, catData, eaStats] = await Promise.all([
          db.getProducts({ limit: 8 }),
          db.getSellers(6),
          db.getTrips(),
          db.getCategories(),
          db.getEarlyAdopterStats()
        ]);
        setProducts(prodData.filter(p => p.profiles?.anae_verified === true));
        setSellers(selData);
        setTrips(tripData.filter(t => t.profiles?.anae_verified === true));
        setCategories(catData);
        setEarlyAdopterStats(eaStats);
      } catch (error: any) {
        console.error('Failed to fetch home data:', error.message || error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = () => {
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  // No more full-page blocking loader. 
  // We handle empty states/skeletons inside the sections.

  return (
    <div>
      {/* ──────── HERO ──────── */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)', padding: '40px 16px 60px 16px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)', borderRadius: '50%' }} />

        <div className="container" style={{ maxWidth: '800px', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: '24px' }}>
            <ShieldCheck size={14} style={{ color: '#4ade80' }} />
            <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>Partenaire ANAE – Carte 080100 – Micro-Importateur Certifié</span>
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 6vw, 52px)', fontWeight: 900, color: 'white', lineHeight: '1.15', marginBottom: '16px' }}>
            La Marketplace des<br />
            <span style={{ background: 'linear-gradient(90deg, #22c55e, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Micro-Importateurs
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', marginBottom: '36px', maxWidth: '600px', margin: '0 auto 36px' }}>
            Connectez-vous avec des vendeurs vérifiés ANAE, achetez en gros ou au détail, et paiements sécurisés. Plus de 42 000 auto-entrepreneurs vous font confiance.
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%' }} className="sm:flex-row sm:rounded-full">
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                <Search size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="AirPods, robes turques, cosmétiques..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  onBlur={() => setTimeout(() => setHeroSuggestions([]), 200)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', padding: '8px 12px', color: 'var(--text-primary)', background: 'transparent' }}
                />
              </div>
              <button onClick={handleSearch} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s', width: '100%' }}
                className="sm:w-auto sm:rounded-full"
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Rechercher
              </button>
            </div>
            {heroSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 100, textAlign: 'left' }}>
                {heroSuggestions.map((s, i) => (
                  <Link
                    key={i}
                    href={s.type === 'product' ? `/products/${s.slug}` : s.type === 'seller' ? `/sellers/${s.id}` : `/products?category=${s.slug}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: i === heroSuggestions.length - 1 ? 'none' : '1px solid #f1f5f9', fontSize: '14px' }}
                  >
                    <span style={{ fontSize: '18px' }}>{s.type === 'product' ? '📦' : s.type === 'seller' ? '👤' : '🏷️'}</span>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '1px' }}>{s.label}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {['📱 Électronique', '👗 Mode', '💄 Cosmétiques', '🏠 Maison', '🇹🇷 Turquie', '🇨🇳 Chine'].map(tag => (
              <button key={tag} onClick={() => { setQuery(tag.split(' ').slice(1).join(' ')); }} style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-full)', padding: '5px 14px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.color = '#4ade80'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── EARLY ADOPTER VIP BANNER ──────── */}
      <section style={{ background: '#f8fafc', padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '24px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            {/* Glow effects */}
            <div style={{ position: 'absolute', top: 0, left: '20%', width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, #22c55e, transparent)', opacity: 0.8 }} />
            <div style={{ position: 'absolute', bottom: '-80px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

            <div style={{ position: 'relative', zIndex: 1 }} className="flex flex-col md:flex-row gap-8 md:items-center">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span> LIVE
                  </span>
                  <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: '#fbbf24' }} /> Accès VIP Early Adopter
                  </h2>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>Sécurisez votre compte avec des avantages à vie : réductions, badge prestige et accès prioritaire. Les places partent très vite !</p>
                <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', transition: 'opacity 0.2s' }} className="hover-opacity">
                  Devenir Early Adopter <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                {/* Sellers Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Vendeurs Pros</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>{Math.max(200 - earlyAdopterStats.sellers, 0)} places restantes</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((earlyAdopterStats.sellers / 200) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                  </div>
                </div>

                {/* Buyers Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Acheteurs VIP</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>{Math.max(500 - earlyAdopterStats.buyers, 0)} places restantes</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((earlyAdopterStats.buyers / 500) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── STATS ──────── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 16px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {[
              { value: '420+', label: 'Auto-entrepreneurs vérifiés', icon: <Users size={20} style={{ color: 'var(--primary)' }} /> },
              { value: '450K DA+', label: 'Volume transactions hebdomadaire', icon: <TrendingUp size={20} style={{ color: 'var(--secondary)' }} /> },
              { value: String(products.length || 100) + '+', label: 'Produits actifs', icon: <Package size={20} style={{ color: 'var(--accent)' }} /> },
              { value: '4.9/5', label: 'Note moyenne vendeurs', icon: <Star size={20} style={{ color: '#f59e0b' }} /> },
              { value: '2-4 Jours', label: 'Délai de livraison moyen', icon: <Zap size={20} style={{ color: 'var(--primary)' }} /> },
              { value: '58 Wilayas', label: 'Service disponible partout', icon: <ShieldCheck size={20} style={{ color: 'var(--secondary)' }} /> },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stat.icon}</div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1' }}>{stat.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.3', marginTop: '3px' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── CATEGORIES ──────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <SectionHeader title="Parcourir par Catégorie" subtitle="Trouvez les meilleurs produits importés dans votre secteur" action={{ label: 'Voir tous les produits', href: '/products' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', minHeight: '100px', position: 'relative' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', zIndex: 1 }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            )}
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className="hover-border-primary hover-lift-sm" style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 12px', textAlign: 'center', textDecoration: 'none', transition: 'all 0.2s', display: 'block' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{cat.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.count?.toLocaleString() || 0} produits</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── FEATURED PRODUCTS ──────── */}
      <section className="section">
        <div className="container">
          <SectionHeader title="Produits en Vedette" subtitle="Les meilleures offres de nos vendeurs certifiés ANAE" action={{ label: 'Voir tous', href: '/products' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', minHeight: '200px', position: 'relative' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', zIndex: 1 }}>
                <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
              </div>
            )}
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ──────── HOW IT WORKS ──────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <SectionHeader title="Comment ça fonctionne?" subtitle="Simple, sécurisé et professionnel" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', icon: '🔍', title: 'Cherchez un produit', desc: 'Utilisez notre recherche avancée ou parcourez par catégorie.' },
              { step: '02', icon: '🤝', title: 'Contactez le vendeur', desc: 'Chaque vendeur est vérifié ANAE. Discutez et négociez directement.' },
              { step: '03', icon: '💳', title: 'Paiement sécurisé', desc: 'Payez par CIB ou cash à la livraison. Escrow protège votre argent.' },
              { step: '04', icon: '📦', title: 'Recevez votre commande', desc: 'Livraison dans 58 wilayas. Confirmez pour libérer le paiement.' },
            ].map(item => (
              <div key={item.step} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '36px', fontWeight: 900, color: 'var(--bg-tertiary)', lineHeight: '1' }}>{item.step}</div>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── TOP SELLERS ──────── */}
      <section className="section">
        <div className="container">
          <SectionHeader title="Vendeurs Certifiés" subtitle="Nos meilleurs vendeurs vérifiés ANAE" action={{ label: 'Voir tous les vendeurs', href: '/sellers' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {sellers.map(seller => (
              <Link key={seller.id} href={`/sellers/${seller.id}`} className="hover-lift" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s, box-shadow 0.2s', display: 'block' }}>
                <div style={{ height: '80px', backgroundImage: `url(${seller.cover_photo || 'https://placehold.co/800x200?text=Cover'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '16px', paddingTop: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '-24px', marginBottom: '12px' }}>
                    <img src={seller.profile_photo || 'https://i.pravatar.cc/150'} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: 'var(--shadow-sm)' }} />
                    <div style={{ paddingBottom: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{seller.first_name} {seller.last_name}</h3>
                        {seller.anae_verified && <span title="ANAE Vérifié" style={{ display: 'inline-flex', alignItems: 'center' }}><ShieldCheck size={14} style={{ color: 'var(--primary)' }} /></span>}
                        {seller.plan === 'pro' && <span title="Vendeur Pro" style={{ background: 'linear-gradient(135deg, #0f172a, #334155)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>PRO</span>}
                        {seller.is_founder && <span title="Membre Fondateur" style={{ background: 'linear-gradient(135deg, #eab308, #d97706)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>FONDATEUR</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{seller.business_name}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{seller.rating_average}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({seller.rating_count} avis)</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{seller.total_sales} ventes</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {seller.specialties?.slice(0, 3).map(s => <span key={s} className="badge badge-green">{s}</span>)}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                    {seller.import_countries?.map(c => <span key={c} className="badge badge-gray">🌍 {c}</span>)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── UPCOMING TRIPS ──────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <SectionHeader title="Voyages en Cours" subtitle="Pré-commandez avant le départ et économisez jusqu'à 40%" action={{ label: 'Voir tous les voyages', href: '/trips' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {trips.slice(0, 3).map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        </div>
      </section>

      {/* ──────── CTA VENDEUR ──────── */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '60px 16px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Vous êtes Micro-Importateur?</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            Rejoignez CABAS HUB et connectez-vous avec des milliers d&apos;acheteurs B2B et B2C à travers toute l&apos;Algérie. Inscription gratuite, paiement sécurisé, dashboard professionnel.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }} className="sm:flex-row">
            <Link href="/auth/register" className="hover-opacity" style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.15s', width: '100%' }}>
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
            <Link href="/products" className="hover-opacity" style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'flex', justifyContent: 'center', transition: 'opacity 0.15s', width: '100%' }}>
              Explorer les produits
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: { label: string; href: string } }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="hover-lift-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', transition: 'gap 0.15s' }}>
          {action.label} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
