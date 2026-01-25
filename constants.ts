
import type { Product, User, Review, Transaction } from './types';
import { ProductCategory, ProductCondition, ProductStatus, TransactionType, TransactionStatus } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Fatima Zahra', avatarUrl: 'https://picsum.photos/seed/u1/100/100', city: 'Casablanca', rating: 4.8, reviews: 120, memberSince: "Juin 2022", balance: 150.50, isPro: true, proSubscriptionExpires: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'u2', name: 'Youssef El Amrani', avatarUrl: 'https://picsum.photos/seed/u2/100/100', city: 'Rabat', rating: 4.5, reviews: 45, memberSince: "Mars 2023", balance: 25.00, isPro: false },
  { id: 'u3', name: 'Amina Alaoui', avatarUrl: 'https://picsum.photos/seed/u3/100/100', city: 'Marrakech', rating: 5.0, reviews: 88, memberSince: "Janvier 2021", balance: 0.00, isPro: false },
  // Add mock admin user here to be discoverable by login
  { id: 'admin', name: 'Admin User', avatarUrl: 'https://picsum.photos/seed/u4/100/100', city: 'Tanger', rating: 4.9, reviews: 15, memberSince: "Décembre 2023", isAdmin: true, balance: 500.00, isPro: false }
];

// This user is now just for reference if needed, but not part of the initial users list
// to avoid duplication when the admin logs in.
export const mockCurrentUser: User = {
    id: 'admin', name: 'Admin User', avatarUrl: 'https://picsum.photos/seed/u4/100/100', city: 'Tanger', rating: 4.9, reviews: 15, memberSince: "Décembre 2023", isAdmin: true, balance: 500.00, isPro: false
}

export const mockProducts: Product[] = [
  { id: 'p1', title: 'Robe d\'été fleurie', description: 'Très belle robe, portée une seule fois. Parfaite pour les sorties estivales.', price: 150, originalPrice: 250, category: ProductCategory.Robes, condition: ProductCondition.TresBonEtat, size: 'M', city: 'Casablanca', images: ['https://picsum.photos/seed/p1a/600/800', 'https://picsum.photos/seed/p1b/600/800'], seller: mockUsers[0], status: ProductStatus.Approved, isFeatured: true, boostedUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'p2', title: 'Chemise en lin homme', description: 'Chemise confortable et élégante. Idéale pour le climat marocain.', price: 200, category: ProductCategory.Chemises, condition: ProductCondition.NeufSansEtiquette, size: 'L', city: 'Rabat', images: ['https://picsum.photos/seed/p2a/600/800', 'https://picsum.photos/seed/p2b/600/800'], seller: mockUsers[1], status: ProductStatus.Approved },
  { id: 'p3', title: 'Ensemble bébé 6 mois', description: 'Ensemble mignon pour bébé, en très bon état.', price: 80, category: ProductCategory.Garcon, condition: ProductCondition.BonEtat, size: '6 mois', city: 'Marrakech', images: ['https://picsum.photos/seed/p3a/600/800'], seller: mockUsers[2], status: ProductStatus.Approved },
  { id: 'p4', title: 'Vase Beldi traditionnel', description: 'Vase en verre recyclé, artisanat marocain. Parfait pour une touche déco.', price: 120, category: ProductCategory.Decoration, condition: ProductCondition.NeufAvecEtiquette, city: 'Casablanca', images: ['https://picsum.photos/seed/p4a/600/800'], seller: mockUsers[0], status: ProductStatus.Pending },
  { id: 'p5', title: 'Jeu PS5 - Spiderman 2', description: 'Jeu en excellent état, presque pas utilisé.', price: 350, originalPrice: 500, category: ProductCategory.JeuxVideoConsoles, condition: ProductCondition.TresBonEtat, city: 'Rabat', images: ['https://picsum.photos/seed/p5a/600/800'], seller: mockUsers[1], status: ProductStatus.Approved, isFeatured: true },
  { id: 'p6', title: 'Sac de transport pour chat', description: 'Sac pratique et sécurisé pour transporter votre animal de compagnie.', price: 100, category: ProductCategory.AccessoiresAnimaux, condition: ProductCondition.Satisfaisant, city: 'Marrakech', images: ['https://picsum.photos/seed/p6a/600/800'], seller: mockUsers[2], status: ProductStatus.Approved },
  { id: 'p7', title: 'Caftan moderne', description: 'Caftan élégant pour les occasions spéciales. Porté une seule fois.', price: 800, category: ProductCategory.CaftansTakchitas, condition: ProductCondition.TresBonEtat, size: 'Taille Unique', city: 'Casablanca', images: ['https://picsum.photos/seed/p7a/600/800', 'https://picsum.photos/seed/p7b/600/800'], seller: mockUsers[0], status: ProductStatus.Approved },
  { id: 'p8', title: 'Babouches en cuir', description: 'Babouches traditionnelles en cuir véritable.', price: 180, category: ProductCategory.ChaussuresHomme, condition: ProductCondition.NeufAvecEtiquette, size: '42', city: 'Marrakech', images: ['https://picsum.photos/seed/p8a/600/800'], seller: mockUsers[2], status: ProductStatus.Approved },
  { id: 'p9', title: 'T-shirt graphique', description: 'T-shirt 100% coton, impression de haute qualité.', price: 120, category: ProductCategory.TshirtsPolos, condition: ProductCondition.NeufAvecEtiquette, size: 'M', city: 'Tanger', images: ['https://picsum.photos/seed/p9a/600/800'], seller: mockUsers[1], status: ProductStatus.Pending },
  { id: 'p10', title: 'Jean slim femme', description: 'Jean bleu délavé, taille haute.', price: 250, category: ProductCategory.JeansFemme, condition: ProductCondition.TresBonEtat, size: '38', city: 'Agadir', images: ['https://picsum.photos/seed/p10a/600/800'], seller: mockUsers[2], status: ProductStatus.Approved, isFeatured: true },
  { id: 'p11', title: 'Jouet en bois enfant', description: 'Puzzle en bois éducatif pour les tout-petits.', price: 90, category: ProductCategory.Jouets, condition: ProductCondition.BonEtat, city: 'Fès', images: ['https://picsum.photos/seed/p11a/600/800'], seller: mockUsers[0], status: ProductStatus.Approved },
  { id: 'p12', title: 'Service à thé marocain', description: 'Service à thé complet avec 6 verres.', price: 300, category: ProductCategory.ArtsDeLaTable, condition: ProductCondition.NeufAvecEtiquette, city: 'Meknès', images: ['https://picsum.photos/seed/p12a/600/800'], seller: mockUsers[1], status: ProductStatus.Approved },
  { id: 'p13', title: 'iPhone 13 Pro', description: 'En parfait état, batterie 92%. Vendu avec boîte et chargeur.', price: 7000, originalPrice: 8500, category: ProductCategory.Smartphones, condition: ProductCondition.TresBonEtat, city: 'Casablanca', images: ['https://picsum.photos/seed/p13a/600/800'], seller: mockUsers[0], status: ProductStatus.Approved },
  { id: 'p14', title: 'Laisse pour chien', description: 'Laisse robuste pour chien de taille moyenne.', price: 50, category: ProductCategory.AccessoiresAnimaux, condition: ProductCondition.NeufSansEtiquette, city: 'Rabat', images: ['https://picsum.photos/seed/p14a/600/800'], seller: mockUsers[1], status: ProductStatus.Approved },
  { id: 'p15', title: 'Sac à main en cuir', description: 'Sac chic, idéal pour le bureau ou une sortie.', price: 350, category: ProductCategory.Sacs, condition: ProductCondition.BonEtat, city: 'Marrakech', images: ['https://picsum.photos/seed/p15a/600/800'], seller: mockUsers[2], status: ProductStatus.Approved },
  { id: 'p16', title: 'Polo Lacoste', description: 'Polo classique, couleur bleu marine.', price: 280, category: ProductCategory.TshirtsPolos, condition: ProductCondition.TresBonEtat, size: 'XL', city: 'Casablanca', images: ['https://picsum.photos/seed/p16a/600/800'], seller: mockUsers[0], status: ProductStatus.Approved },
  { id: 'p17', title: 'Livre "Le Petit Prince"', description: 'Édition classique avec illustrations originales.', price: 40, category: ProductCategory.LivresMagazines, condition: ProductCondition.BonEtat, city: 'Tanger', images: ['https://picsum.photos/seed/p17a/600/800'], seller: mockUsers[2], status: ProductStatus.Pending },
  { id: 'p18', title: 'Ensemble de coussins', description: 'Lot de 3 coussins décoratifs style berbère.', price: 220, category: ProductCategory.LingeDeMaison, condition: ProductCondition.NeufAvecEtiquette, city: 'Agadir', images: ['https://picsum.photos/seed/p18a/600/800'], seller: mockUsers[1], status: ProductStatus.Approved },
  { id: 'p19', title: 'Sandales en cuir', description: 'Sandales artisanales, parfaites pour l\'été.', price: 180, category: ProductCategory.ChaussuresFemme, condition: ProductCondition.NeufSansEtiquette, size: '39', city: 'Essaouira', images: ['https://picsum.photos/seed/p19a/600/800'], seller: mockUsers[0], status: ProductStatus.Approved },
  { id: 'p20', title: 'Jupe plissée', description: 'Jupe mi-longue couleur pastel.', price: 130, category: ProductCategory.Fille, condition: ProductCondition.TresBonEtat, size: '10 ans', city: 'Rabat', images: ['https://picsum.photos/seed/p20a/600/800'], seller: mockUsers[1], status: ProductStatus.Approved },
];

export const mockReviews: Review[] = [
    {id: 'r1', author: mockUsers[1], rating: 5, comment: "Vendeuse sérieuse et article conforme à la description. Je recommande !", date: "il y a 2 semaines"},
    {id: 'r2', author: mockUsers[2], rating: 4, comment: "Transaction rapide, bon contact. Merci !", date: "il y a 1 mois"},
];

export const mockTransactions: Transaction[] = [
    { id: 't1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), user: mockUsers[0], type: TransactionType.Feature, product: mockProducts[0], amount: 50, status: TransactionStatus.Completed },
    { id: 't2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), user: mockUsers[1], type: TransactionType.Bump, product: mockProducts[1], amount: 10, status: TransactionStatus.Completed },
    { id: 't3', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), user: mockUsers[2], type: TransactionType.Sale, product: mockProducts[2], amount: 80, status: TransactionStatus.Completed },
    { id: 't4', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), user: mockUsers[0], type: TransactionType.Sale, product: mockProducts[6], amount: 800, status: TransactionStatus.Completed },
    { id: 't5', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), user: mockUsers[2], type: TransactionType.Feature, product: mockProducts[9], amount: 50, status: TransactionStatus.Completed },
];


export const moroccanCities: string[] = [
  "Agadir", "Al Hoceïma", "Asilah", "Azemmour", "Béni Mellal", "Berkane", "Berrechid", "Boujdour", "Boulemane", "Casablanca", 
  "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès", "Figuig", "Guelmim", "Ifrane", "Kénitra", "Khemisset", 
  "Khenifra", "Khouribga", "Laâyoune", "Larache", "Marrakech", "Meknès", "Mohammédia", "Nador", "Ouarzazate", "Oujda", "Rabat", 
  "Safi", "Salé", "Sefrou", "Settat", "Sidi Ifni", "Tanger", "Tan-Tan", "Taza", "Tétouan", "Tiznit"
];

export const categoryGroups = {
    "Femmes": [
        ProductCategory.Robes,
        ProductCategory.HautsTshirts,
        ProductCategory.PullsGilets,
        ProductCategory.VestesManteaux,
        ProductCategory.PantalonsShorts,
        ProductCategory.JeansFemme,
        ProductCategory.CaftansTakchitas,
        ProductCategory.ChaussuresFemme,
        ProductCategory.Sacs,
        ProductCategory.Accessoires,
        ProductCategory.Beaute,
    ],
    "Hommes": [
        ProductCategory.TshirtsPolos,
        ProductCategory.Chemises,
        ProductCategory.PullsSweats,
        ProductCategory.VestesManteauxHomme,
        ProductCategory.PantalonsShortsHomme,
        ProductCategory.JeansHomme,
        ProductCategory.ChaussuresHomme,
        ProductCategory.AccessoiresHomme,
    ],
    "Enfants": [
        ProductCategory.Fille,
        ProductCategory.Garcon,
        ProductCategory.Puericulture,
        ProductCategory.Jouets
    ],
    "Maison": [
        ProductCategory.Mobilier,
        ProductCategory.Decoration,
        ProductCategory.LingeDeMaison,
        ProductCategory.ArtsDeLaTable
    ],
    "Divertissement & High-Tech": [
        ProductCategory.LivresMagazines,
        ProductCategory.JeuxVideoConsoles,
        ProductCategory.MusiqueFilms,
        ProductCategory.Smartphones,
        ProductCategory.Informatique,
        ProductCategory.AccessoiresTech,
    ],
    "Animaux": [
        ProductCategory.AccessoiresAnimaux
    ]
};

export const sizeOptionsByCategory: Partial<Record<ProductCategory, string[]>> = {
    // Femmes
    [ProductCategory.Robes]: ["XS", "S", "M", "L", "XL", "XXL", "Taille Unique"],
    [ProductCategory.HautsTshirts]: ["XS", "S", "M", "L", "XL", "XXL"],
    [ProductCategory.PullsGilets]: ["XS", "S", "M", "L", "XL", "XXL"],
    [ProductCategory.VestesManteaux]: ["XS", "S", "M", "L", "XL", "XXL"],
    [ProductCategory.PantalonsShorts]: ["34", "36", "38", "40", "42", "44", "46"],
    [ProductCategory.JeansFemme]: ["34", "36", "38", "40", "42", "44", "46"],
    [ProductCategory.ChaussuresFemme]: ["36", "37", "38", "39", "40", "41", "42"],
    [ProductCategory.CaftansTakchitas]: ["Taille Unique", "S", "M", "L", "XL"],

    // Hommes
    [ProductCategory.TshirtsPolos]: ["S", "M", "L", "XL", "XXL", "XXXL"],
    [ProductCategory.Chemises]: ["S", "M", "L", "XL", "XXL", "XXXL"],
    [ProductCategory.PullsSweats]: ["S", "M", "L", "XL", "XXL", "XXXL"],
    [ProductCategory.VestesManteauxHomme]: ["S", "M", "L", "XL", "XXL", "XXXL"],
    [ProductCategory.PantalonsShortsHomme]: ["28", "30", "32", "34", "36", "38", "40", "42"],
    [ProductCategory.JeansHomme]: ["28", "30", "32", "34", "36", "38", "40", "42"],
    [ProductCategory.ChaussuresHomme]: ["39", "40", "41", "42", "43", "44", "45", "46"],

    // Enfants
    [ProductCategory.Fille]: ["3 mois", "6 mois", "1 an", "2 ans", "4 ans", "6 ans", "8 ans", "10 ans", "12 ans", "14 ans"],
    [ProductCategory.Garcon]: ["3 mois", "6 mois", "1 an", "2 ans", "4 ans", "6 ans", "8 ans", "10 ans", "12 ans", "14 ans"],
};
