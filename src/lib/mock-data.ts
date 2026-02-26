// Mock data for CABAS HUB - all pages use this data in dev mode

export const CATEGORIES = [
    { id: 1, name: 'Électronique', icon: '📱', slug: 'electronique', count: 1240 },
    { id: 2, name: 'Textile & Mode', icon: '👗', slug: 'textile-mode', count: 876 },
    { id: 3, name: 'Cosmétiques', icon: '💄', slug: 'cosmetiques', count: 654 },
    { id: 4, name: 'Maison & Déco', icon: '🏠', slug: 'maison-deco', count: 432 },
    { id: 5, name: 'Alimentation', icon: '🥗', slug: 'alimentation', count: 321 },
    { id: 6, name: 'Sport & Loisirs', icon: '⚽', slug: 'sport-loisirs', count: 289 },
    { id: 7, name: 'Beauté & Santé', icon: '💊', slug: 'beaute-sante', count: 543 },
    { id: 8, name: 'Jouets & Enfants', icon: '🧸', slug: 'jouets-enfants', count: 198 },
];

export const WILAYAS = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tlemcen',
    'Béjaïa', 'Batna', 'Biskra', 'Tizi Ouzou', 'Boumerdès', 'Msila', 'Chlef',
    'Médéa', 'Mostaganem', 'Skikda', 'Djelfa', 'Guelma', 'Jijel',
];

export const IMPORT_COUNTRIES = [
    { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
    { code: 'CN', name: 'Chine', flag: '🇨🇳' },
    { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪' },
    { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: 'IN', name: 'Inde', flag: '🇮🇳' },
];

export const SELLERS: Seller[] = [
    {
        id: 'sel-001',
        firstName: 'Karim',
        lastName: 'Bensalem',
        businessName: 'K-Tech Import',
        email: 'karim@ktech.dz',
        phone: '+213770001122',
        profilePhoto: 'https://i.pravatar.cc/150?img=11',
        coverPhoto: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
        bio: 'Spécialiste en électronique et gadgets depuis 5 ans. 2 voyages/mois en Turquie et Chine.',
        address: { city: 'Alger', wilaya: 'Alger' },
        specialties: ['Électronique', 'Gadgets', 'Téléphones'],
        importCountries: ['Turquie', 'Chine'],
        anaeVerified: true,
        ratingAverage: 4.8,
        ratingCount: 127,
        totalSales: 342,
        joinedAt: '2023-03-15',
        status: 'active',
    },
    {
        id: 'sel-002',
        firstName: 'Yasmine',
        lastName: 'Hadj',
        businessName: 'Yasmine Fashion',
        email: 'yasmine@fashion.dz',
        phone: '+213661223344',
        profilePhoto: 'https://i.pravatar.cc/150?img=5',
        coverPhoto: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
        bio: 'Mode et textile premium importés directement de Turquie et Italie.',
        address: { city: 'Oran', wilaya: 'Oran' },
        specialties: ['Textile', 'Mode', 'Accessoires'],
        importCountries: ['Turquie', 'Italie'],
        anaeVerified: true,
        ratingAverage: 4.9,
        ratingCount: 89,
        totalSales: 218,
        joinedAt: '2023-06-20',
        status: 'active',
    },
    {
        id: 'sel-003',
        firstName: 'Amine',
        lastName: 'Cherif',
        businessName: 'Amine Cosmétics',
        email: 'amine@cosm.dz',
        phone: '+213555667788',
        profilePhoto: 'https://i.pravatar.cc/150?img=33',
        coverPhoto: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
        bio: 'Cosmétiques et produits de beauté authentiques — toujours originaux.',
        address: { city: 'Constantine', wilaya: 'Constantine' },
        specialties: ['Cosmétiques', 'Parfums', 'Soins'],
        importCountries: ['France', 'Émirats Arabes Unis'],
        anaeVerified: true,
        ratingAverage: 4.7,
        ratingCount: 64,
        totalSales: 156,
        joinedAt: '2024-01-10',
        status: 'active',
    },
    {
        id: 'sel-004',
        firstName: 'Fatima',
        lastName: 'Belkadi',
        businessName: 'Casa Deco Import',
        email: 'fatima@casadeco.dz',
        phone: '+213699887766',
        profilePhoto: 'https://i.pravatar.cc/150?img=47',
        coverPhoto: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        bio: 'Décoration intérieure et mobilier importé — des pièces uniques pour votre maison.',
        address: { city: 'Blida', wilaya: 'Blida' },
        specialties: ['Maison', 'Décoration', 'Mobilier'],
        importCountries: ['Chine', 'Turquie'],
        anaeVerified: true,
        ratingAverage: 4.6,
        ratingCount: 42,
        totalSales: 98,
        joinedAt: '2024-04-05',
        status: 'active',
    },
];

export const PRODUCTS: Product[] = [
    {
        id: 'prod-001',
        slug: 'airpods-pro-2-apple-original',
        sellerId: 'sel-001',
        seller: SELLERS[0],
        title: 'AirPods Pro 2 – Apple Original',
        description: 'AirPods Pro 2ème génération avec réduction de bruit active. Garantie 1 an. Importé directement de Turquie avec tous les accessoires originaux.',
        categoryId: 1,
        categoryName: 'Électronique',
        priceWholesale: 28000,
        priceRetail: 32000,
        currency: 'DZD',
        quantity: 45,
        minOrderQuantity: 1,
        originCountry: 'Turquie',
        images: [
            'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&q=80',
            'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
        ],
        specifications: { brand: 'Apple', model: 'AirPods Pro 2', colors: ['Blanc'], warranty: '1 an' },
        wholesaleOnly: false,
        retailOnly: false,
        negotiable: true,
        preOrder: false,
        shippingIncluded: true,
        wilayaCoverage: ['Alger', 'Oran', 'Constantine', 'Blida'],
        deliveryTime: '2-3 jours',
        tags: ['apple', 'airpods', 'écouteurs', 'sans-fil'],
        status: 'active',
        views: 1243,
        favoritesCount: 87,
        ratingAverage: 4.8,
        ratingCount: 34,
        createdAt: '2025-12-01',
    },
    {
        id: 'prod-002',
        slug: 'samsung-galaxy-s24-ultra',
        sellerId: 'sel-001',
        seller: SELLERS[0],
        title: 'Samsung Galaxy S24 Ultra – 256GB',
        description: 'Smartphone flagship Samsung Galaxy S24 Ultra, 256Go, Titanium Black. Débloqué, toutes les bandes 4G/5G. Importé de Turquie avec facture.',
        categoryId: 1,
        categoryName: 'Électronique',
        priceWholesale: 145000,
        priceRetail: 165000,
        currency: 'DZD',
        quantity: 12,
        minOrderQuantity: 1,
        originCountry: 'Turquie',
        images: [
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
            'https://images.unsplash.com/photo-1595941069915-4ebc5197c14a?w=600&q=80',
        ],
        specifications: { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '256GB', colors: ['Titanium Black', 'Titanium Gray'] },
        wholesaleOnly: false,
        retailOnly: false,
        negotiable: true,
        preOrder: false,
        shippingIncluded: false,
        shippingCost: 500,
        wilayaCoverage: ['Alger', 'Oran', 'Sétif'],
        deliveryTime: '3-5 jours',
        tags: ['samsung', 's24', 'smartphone', '5g'],
        status: 'active',
        views: 2187,
        favoritesCount: 156,
        ratingAverage: 4.9,
        ratingCount: 28,
        createdAt: '2025-11-15',
    },
    {
        id: 'prod-003',
        slug: 'robe-de-soiree-turque-premium',
        sellerId: 'sel-002',
        seller: SELLERS[1],
        title: 'Collection Robes de Soirée 2025 – Turquie',
        description: 'Collection exclusive de robes de soirée importées directement des ateliers turcs. Tissu satin de qualité, disponible en plusieurs couleurs et tailles.',
        categoryId: 2,
        categoryName: 'Textile & Mode',
        priceWholesale: 8500,
        priceRetail: 14000,
        currency: 'DZD',
        quantity: 80,
        minOrderQuantity: 3,
        originCountry: 'Turquie',
        images: [
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
        ],
        specifications: { material: 'Satin', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Rouge', 'Bleu Marine', 'Or', 'Noir'] },
        wholesaleOnly: false,
        retailOnly: false,
        negotiable: true,
        preOrder: true,
        shippingIncluded: true,
        wilayaCoverage: ['Oran', 'Tlemcen', 'Mostaganem', 'Alger'],
        deliveryTime: '5-7 jours',
        tags: ['robe', 'soirée', 'turquie', 'mode', 'fashion'],
        status: 'active',
        views: 987,
        favoritesCount: 64,
        ratingAverage: 4.7,
        ratingCount: 19,
        createdAt: '2025-12-10',
    },
    {
        id: 'prod-004',
        slug: 'parfum-chanel-no5-original',
        sellerId: 'sel-003',
        seller: SELLERS[2],
        title: 'Parfum Chanel N°5 – 100ml EDP Original',
        description: 'Chanel N°5 Eau de Parfum 100ml, 100% original avec emballage d\'origine. Importé de France via achat en boutique officielle.',
        categoryId: 3,
        categoryName: 'Cosmétiques',
        priceWholesale: 22000,
        priceRetail: 27000,
        currency: 'DZD',
        quantity: 20,
        minOrderQuantity: 1,
        originCountry: 'France',
        images: [
            'https://images.unsplash.com/photo-1588514904771-a4a3bed71e5e?w=600&q=80',
            'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80',
        ],
        specifications: { brand: 'Chanel', model: 'N°5', size: '100ml', type: 'EDP' },
        wholesaleOnly: false,
        retailOnly: false,
        negotiable: false,
        preOrder: false,
        shippingIncluded: true,
        wilayaCoverage: ['Constantine', 'Annaba', 'Sétif', 'Alger'],
        deliveryTime: '2-4 jours',
        tags: ['chanel', 'parfum', 'france', 'luxe'],
        status: 'active',
        views: 756,
        favoritesCount: 43,
        ratingAverage: 5.0,
        ratingCount: 12,
        createdAt: '2026-01-05',
    },
    {
        id: 'prod-005',
        slug: 'xiaomi-robot-vacuum-s10',
        sellerId: 'sel-001',
        seller: SELLERS[0],
        title: 'Xiaomi Robot Aspirateur S10+',
        description: 'Robot aspirateur et laveur de sol Xiaomi S10+. Navigation intelligente LDS, aspiration 4000Pa, compatible avec l\'application Mi Home.',
        categoryId: 4,
        categoryName: 'Maison & Déco',
        priceWholesale: 42000,
        priceRetail: 52000,
        currency: 'DZD',
        quantity: 8,
        minOrderQuantity: 1,
        originCountry: 'Turquie',
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
            'https://images.unsplash.com/photo-1604760048892-5bfe86cbdd9e?w=600&q=80',
        ],
        specifications: { brand: 'Xiaomi', model: 'S10+', suction: '4000Pa', battery: '5200mAh' },
        wholesaleOnly: false,
        retailOnly: false,
        negotiable: true,
        preOrder: false,
        shippingIncluded: false,
        shippingCost: 800,
        wilayaCoverage: ['Alger', 'Blida', 'Boumerdès'],
        deliveryTime: '3-5 jours',
        tags: ['xiaomi', 'robot', 'aspirateur', 'maison'],
        status: 'active',
        views: 543,
        favoritesCount: 31,
        ratingAverage: 4.6,
        ratingCount: 9,
        createdAt: '2026-01-20',
    },
    {
        id: 'prod-006',
        slug: 'collection-tshirts-premium-import',
        sellerId: 'sel-002',
        seller: SELLERS[1],
        title: 'T-Shirts Premium Homme – Lot de 12',
        description: 'Lot de 12 T-shirts homme premium, coton 100%, différentes couleurs et tailles. Idéal pour la revente en boutique.',
        categoryId: 2,
        categoryName: 'Textile & Mode',
        priceWholesale: 9600,
        priceRetail: 15600,
        currency: 'DZD',
        quantity: 25,
        minOrderQuantity: 2,
        originCountry: 'Turquie',
        images: [
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
        ],
        specifications: { material: '100% Coton', quantity: 12, sizes: ['S', 'M', 'L', 'XL'], colors: ['Blanc', 'Noir', 'Gris', 'Navy'] },
        wholesaleOnly: true,
        retailOnly: false,
        negotiable: true,
        preOrder: false,
        shippingIncluded: true,
        wilayaCoverage: ['Oran', 'Alger', 'Tlemcen'],
        deliveryTime: '4-6 jours',
        tags: ['tshirt', 'lot', 'grossiste', 'homme'],
        status: 'active',
        views: 423,
        favoritesCount: 27,
        ratingAverage: 4.5,
        ratingCount: 15,
        createdAt: '2026-01-12',
    },
    {
        id: 'prod-007',
        slug: 'set-soins-visage-korean-beauty',
        sellerId: 'sel-003',
        seller: SELLERS[2],
        title: 'Set Soins Visage Korean Beauty – 7 pièces',
        description: 'Kit complet de soins visage style coréen. Comprend : nettoyant, tonique, sérum vitamine C, crème hydratante, masque, contour yeux et SPF50.',
        categoryId: 3,
        categoryName: 'Cosmétiques',
        priceWholesale: 6500,
        priceRetail: 11000,
        currency: 'DZD',
        quantity: 35,
        minOrderQuantity: 1,
        originCountry: 'Émirats Arabes Unis',
        images: [
            'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
            'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&q=80',
        ],
        specifications: { pieces: 7, skinType: 'Tous types', contains: ['Nettoyant', 'Tonique', 'Sérum', 'Crème', 'Masque', 'Contour yeux', 'SPF50'] },
        wholesaleOnly: false,
        retailOnly: false,
        negotiable: false,
        preOrder: false,
        shippingIncluded: true,
        wilayaCoverage: ['Toutes les wilayas'],
        deliveryTime: '3-6 jours',
        tags: ['korean', 'beauté', 'soins', 'visage', 'cosmétiques'],
        status: 'active',
        views: 876,
        favoritesCount: 54,
        ratingAverage: 4.8,
        ratingCount: 22,
        createdAt: '2026-01-28',
    },
    {
        id: 'prod-008',
        slug: 'canape-salon-design-turc',
        sellerId: 'sel-004',
        seller: SELLERS[3],
        title: 'Canapé Salon Design Moderne – 3+2+1',
        description: 'Ensemble canapé salon 3+2+1 places, tissu velours de haute qualité, design moderne. Production turque, livraison en 15 jours ouvrables.',
        categoryId: 4,
        categoryName: 'Maison & Déco',
        priceWholesale: 145000,
        priceRetail: 195000,
        currency: 'DZD',
        quantity: 6,
        minOrderQuantity: 1,
        originCountry: 'Turquie',
        images: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
        ],
        specifications: { material: 'Velours', configuration: '3+2+1', colors: ['Gris', 'Vert Sauge', 'Bleu Canard', 'Beige'] },
        wholesaleOnly: false,
        retailOnly: true,
        negotiable: true,
        preOrder: true,
        shippingIncluded: false,
        shippingCost: 3000,
        wilayaCoverage: ['Blida', 'Alger', 'Médéa'],
        deliveryTime: '15-20 jours',
        tags: ['canapé', 'salon', 'mobilier', 'turc', 'design'],
        status: 'active',
        views: 312,
        favoritesCount: 18,
        ratingAverage: 4.4,
        ratingCount: 7,
        createdAt: '2026-02-01',
    },
];

export const TRIPS: Trip[] = [
    {
        id: 'trip-001',
        sellerId: 'sel-001',
        seller: SELLERS[0],
        destinationCountry: 'Turquie',
        destinationCity: 'Istanbul',
        flag: '🇹🇷',
        departureDate: '2026-03-05',
        returnDate: '2026-03-10',
        budgetAvailable: 1200000,
        acceptPreOrders: true,
        notes: 'Spécialisé dans l\'électronique et gadgets. Grand Bazaar + Mall of Istanbul.',
        preOrdersCount: 7,
        status: 'upcoming',
    },
    {
        id: 'trip-002',
        sellerId: 'sel-002',
        seller: SELLERS[1],
        destinationCountry: 'Turquie',
        destinationCity: 'Istanbul + Bursa',
        flag: '🇹🇷',
        departureDate: '2026-03-12',
        returnDate: '2026-03-18',
        budgetAvailable: 1500000,
        acceptPreOrders: true,
        notes: 'Marché du textile de Bursa. Robes, tissus, accessoires mode. Prix usine.',
        preOrdersCount: 14,
        status: 'upcoming',
    },
    {
        id: 'trip-003',
        sellerId: 'sel-003',
        seller: SELLERS[2],
        destinationCountry: 'Émirats Arabes Unis',
        destinationCity: 'Dubaï',
        flag: '🇦🇪',
        departureDate: '2026-03-20',
        returnDate: '2026-03-25',
        budgetAvailable: 900000,
        acceptPreOrders: true,
        notes: 'Cosmétiques et parfums de luxe. Dragon Mart. Best prices guaranteed.',
        preOrdersCount: 9,
        status: 'upcoming',
    },
    {
        id: 'trip-004',
        sellerId: 'sel-004',
        seller: SELLERS[3],
        destinationCountry: 'Chine',
        destinationCity: 'Guangzhou',
        flag: '🇨🇳',
        departureDate: '2026-04-02',
        returnDate: '2026-04-10',
        budgetAvailable: 1800000,
        acceptPreOrders: true,
        notes: 'Canton Fair Spring Edition. Mobilier, décoration, articles maison.',
        preOrdersCount: 3,
        status: 'upcoming',
    },
];

export const REVIEWS: Review[] = [
    {
        id: 'rev-001',
        productId: 'prod-001',
        buyerId: 'buy-001',
        buyerName: 'Salima B.',
        buyerPhoto: 'https://i.pravatar.cc/50?img=21',
        rating: 5,
        comment: 'Produit 100% original, exactement comme décrit. Livraison rapide à Oran en 48h. Je recommande vivement Karim!',
        images: [],
        createdAt: '2026-01-15',
        helpful: 12,
        reply: 'Merci Salima! Un plaisir de travailler avec vous. N\'hésitez pas à revenir! 🙏',
    },
    {
        id: 'rev-002',
        productId: 'prod-001',
        buyerId: 'buy-002',
        buyerName: 'Omar K.',
        buyerPhoto: 'https://i.pravatar.cc/50?img=56',
        rating: 5,
        comment: 'Excellent vendeur, très sérieux et professionnel. Qualité irréprochable.',
        images: [],
        createdAt: '2026-01-28',
        helpful: 8,
    },
    {
        id: 'rev-003',
        productId: 'prod-002',
        buyerId: 'buy-003',
        buyerName: 'Nadia M.',
        buyerPhoto: 'https://i.pravatar.cc/50?img=44',
        rating: 4,
        comment: 'Bon produit mais livraison un peu lente (5 jours au lieu de 3). Sinon qualité parfaite.',
        images: [],
        createdAt: '2026-02-05',
        helpful: 4,
        reply: 'Merci pour votre retour Nadia! On va améliorer les délais.',
    },
];

export const ORDERS: Order[] = [
    {
        id: 'ord-001',
        orderNumber: 'CH-MVT7K3',
        buyerId: 'buy-001',
        buyerName: 'Salima Benali',
        items: [{ product: PRODUCTS[0], quantity: 2, priceType: 'retail', priceUnit: 32000 }],
        status: 'delivered',
        paymentMethod: 'cib',
        paymentStatus: 'paid',
        subtotal: 64000,
        shippingTotal: 0,
        total: 64000,
        shippingAddress: { street: '12 Rue des Roses', city: 'Oran', wilaya: 'Oran', postalCode: '31000', phone: '+213661223344' },
        createdAt: '2026-01-10',
        deliveredAt: '2026-01-13',
    },
    {
        id: 'ord-002',
        orderNumber: 'CH-XPQ9R1',
        buyerId: 'buy-001',
        buyerName: 'Salima Benali',
        items: [{ product: PRODUCTS[2], quantity: 3, priceType: 'wholesale', priceUnit: 8500 }],
        status: 'shipped',
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        subtotal: 25500,
        shippingTotal: 0,
        total: 25500,
        shippingAddress: { street: '12 Rue des Roses', city: 'Oran', wilaya: 'Oran', postalCode: '31000', phone: '+213661223344' },
        createdAt: '2026-01-28',
    },
];

export const CONVERSATIONS = [
    {
        id: 'conv-001',
        participant: SELLERS[0],
        lastMessage: 'Oui bien sûr, je peux faire un prix pour 10 pièces. 28 000 DA l\'unité.',
        lastMessageAt: '2026-02-20T14:30:00',
        unreadCount: 2,
        product: PRODUCTS[0],
        messages: [
            { id: 'm1', senderId: 'buy-001', text: 'Bonjour, vous avez les AirPods Pro 2 en stock?', sentAt: '2026-02-20T14:00:00' },
            { id: 'm2', senderId: 'sel-001', text: 'Bonjour! Oui j\'en ai 45 en stock. Vous en voulez combien?', sentAt: '2026-02-20T14:05:00' },
            { id: 'm3', senderId: 'buy-001', text: 'Je voudrais commander 10 pièces, vous faites prix grossiste?', sentAt: '2026-02-20T14:20:00' },
            { id: 'm4', senderId: 'sel-001', text: 'Oui bien sûr, je peux faire un prix pour 10 pièces. 28 000 DA l\'unité.', sentAt: '2026-02-20T14:30:00' },
        ],
    },
    {
        id: 'conv-002',
        participant: SELLERS[1],
        lastMessage: 'La collection arrive la semaine prochaine!',
        lastMessageAt: '2026-02-19T11:15:00',
        unreadCount: 0,
        product: PRODUCTS[2],
        messages: [
            { id: 'm5', senderId: 'buy-001', text: 'Bonjour Yasmine, les robes 2025 sont disponibles?', sentAt: '2026-02-19T11:00:00' },
            { id: 'm6', senderId: 'sel-002', text: 'La collection arrive la semaine prochaine!', sentAt: '2026-02-19T11:15:00' },
        ],
    },
];

// Types
export interface Seller {
    id: string;
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    phone: string;
    profilePhoto: string;
    coverPhoto: string;
    bio: string;
    address: { city: string; wilaya: string };
    specialties: string[];
    importCountries: string[];
    anaeVerified: boolean;
    ratingAverage: number;
    ratingCount: number;
    totalSales: number;
    joinedAt: string;
    status: string;
}

export interface Product {
    id: string;
    slug: string;
    sellerId: string;
    seller: Seller;
    title: string;
    description: string;
    categoryId: number;
    categoryName: string;
    priceWholesale: number;
    priceRetail: number;
    currency: string;
    quantity: number;
    minOrderQuantity: number;
    originCountry: string;
    images: string[];
    specifications: Record<string, unknown>;
    wholesaleOnly: boolean;
    retailOnly: boolean;
    negotiable: boolean;
    preOrder: boolean;
    shippingIncluded: boolean;
    shippingCost?: number;
    wilayaCoverage: string[];
    deliveryTime: string;
    tags: string[];
    status: string;
    views: number;
    favoritesCount: number;
    ratingAverage: number;
    ratingCount: number;
    createdAt: string;
}

export interface Trip {
    id: string;
    sellerId: string;
    seller: Seller;
    destinationCountry: string;
    destinationCity: string;
    flag: string;
    departureDate: string;
    returnDate: string;
    budgetAvailable: number;
    acceptPreOrders: boolean;
    notes: string;
    preOrdersCount: number;
    status: string;
}

export interface Review {
    id: string;
    productId: string;
    buyerId: string;
    buyerName: string;
    buyerPhoto: string;
    rating: number;
    comment: string;
    images: string[];
    createdAt: string;
    helpful: number;
    reply?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    buyerId: string;
    buyerName: string;
    items: { product: Product; quantity: number; priceType: string; priceUnit: number }[];
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    shippingTotal: number;
    total: number;
    shippingAddress: { street: string; city: string; wilaya: string; postalCode: string; phone: string };
    createdAt: string;
    deliveredAt?: string;
}
