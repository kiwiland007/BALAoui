export enum ProductCategory {
  // Femmes
  Robes = "Robes",
  HautsTshirtsFemme = "Hauts & T-shirts",
  // FIX: Made enum value unique to avoid duplicate keys in object literals.
  PantalonsJeansFemme = "Pantalons & Jeans Femme",
  ChaussuresFemme = "Chaussures Femme",
  SacsAccessoires = "Sacs & Accessoires",
  CaftansTakchitas = "Caftans & Takchitas",

  // Hommes
  TshirtsPolosHomme = "T-shirts & Polos",
  ChemisesHomme = "Chemises",
  // FIX: Made enum value unique to avoid duplicate keys in object literals.
  PantalonsJeansHomme = "Pantalons & Jeans Homme",
  ChaussuresHomme = "Chaussures Homme",

  // Enfants
  VetementsFille = "Vêtements Fille",
  VetementsGarcon = "Vêtements Garçon",
  Jouets = "Jouets & Jeux",

  // Maison
  Decoration = "Décoration",
  LingeDeMaison = "Linge de maison",
  ArtsDeLaTable = "Arts de la table",

  // Divertissement
  LivresMagazines = "Livres & Magazines",
  JeuxVideoConsoles = "Jeux vidéo & Consoles",
  MusiqueFilms = "Musique & Films",
  
  // High-Tech
  Smartphones = "Smartphones",
  Informatique = "Informatique",
  AccessoiresTech = "Accessoires Tech",

  // Animaux
  AccessoiresAnimaux = "Accessoires pour animaux",
}

export enum ProductCondition {
  NeufAvecEtiquette = "Neuf avec étiquette",
  NeufSansEtiquette = "Neuf sans étiquette",
  TresBonEtat = "Très bon état",
  BonEtat = "Bon état",
  Satisfaisant = "Satisfaisant",
}

export enum ProductStatus {
    Pending = "En attente",
    Approved = "Approuvé",
    Rejected = "Rejeté",
}

export enum TransactionType {
    Bump = "Bump d'article",
    Feature = "Mise à la une",
    Sale = "Vente finalisée",
    // FIX: Added missing transaction types to align with the application's functionality.
    Deposit = "Dépôt de solde",
    Subscription = "Abonnement Pro",
}

export enum TransactionStatus {
    Completed = "Terminée",
    Pending = "En attente",
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  city: string;
  rating: number;
  reviews: number;
  memberSince: string;
  isAdmin?: boolean;
  // FIX: Added missing fields to the User interface to match the data model.
  balance: number;
  isPro: boolean;
  proSubscriptionExpires?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  condition: ProductCondition;
  size?: string;
  city: string;
  images: string[];
  seller: User;
  status: ProductStatus;
  isFeatured?: boolean;
  boostedUntil?: string;
}

export interface Review {
    id: string;
    author: User;
    rating: number;
    comment: string;
    date: string;
}

export interface Transaction {
    id: string;
    date: string;
    user: User;
    type: TransactionType;
    // FIX: Made product optional as some transactions (e.g., Deposit) do not have an associated product.
    product?: Product;
    amount: number;
    status: TransactionStatus;
}

export type View = 
  | { name: 'home' }
  | { name: 'productDetail', product: Product }
  | { name: 'addItem' }
  | { name: 'profile', user: User }
  | { name: 'saved' }
  | { name: 'search', query: string }
  | { name: 'admin' };
