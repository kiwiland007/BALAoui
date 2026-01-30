export enum ProductCategory {
  // --- FEMME ---
  // Vêtements
  Robes = "Robes",
  HautsTshirts = "Hauts & T-shirts",
  PullsGilets = "Pulls & Gilets",
  VestesManteaux = "Vestes & Manteaux",
  PantalonsShorts = "Pantalons & Shorts",
  JeansFemme = "Jeans",
  CaftansTakchitas = "Caftans & Takchitas",
  // Chaussures
  ChaussuresFemme = "Chaussures Femme",
  // Sacs & Accessoires
  Sacs = "Sacs",
  Accessoires = "Accessoires",
  // Beauté
  Beaute = "Beauté",

  // --- HOMME ---
  // Vêtements
  TshirtsPolos = "T-shirts & Polos",
  Chemises = "Chemises",
  PullsSweats = "Pulls & Sweats",
  VestesManteauxHomme = "Vestes & Manteaux Homme",
  PantalonsShortsHomme = "Pantalons & Shorts Homme",
  JeansHomme = "Jeans Homme",
  // Chaussures
  ChaussuresHomme = "Chaussures Homme",
  // Accessoires
  AccessoiresHomme = "Accessoires Homme",

  // --- ENFANTS ---
  Fille = "Fille (0-14 ans)",
  Garcon = "Garçon (0-14 ans)",
  Puericulture = "Puériculture",
  Jouets = "Jouets & Jeux",

  // --- MAISON ---
  Mobilier = "Mobilier",
  Decoration = "Décoration",
  LingeDeMaison = "Linge de maison",
  ArtsDeLaTable = "Arts de la table",

  // --- DIVERTISSEMENT & HIGH-TECH ---
  LivresMagazines = "Livres & Magazines",
  JeuxVideoConsoles = "Jeux vidéo & Consoles",
  MusiqueFilms = "Musique & Films",
  Smartphones = "Smartphones",
  Informatique = "Informatique",
  AccessoiresTech = "Accessoires Tech",

  // --- ANIMAUX ---
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
  Sold = "Vendu",
}

export enum TransactionType {
  Bump = "Bump d'article",
  Feature = "Mise à la une",
  Sale = "Vente finalisée",
  Deposit = "Dépôt de solde",
  Subscription = "Abonnement Pro",
  BuyerProtection = "Protection Acheteurs",
}

export enum TransactionStatus {
  Completed = "Terminée",
  Pending = "En attente",
}

export enum OrderStatus {
  PendingPayment = "Paiement en attente",
  Paid = "Payée",
  Shipped = "Expédiée",
  Delivered = "Livrée",
  Completed = "Terminée",
  Cancelled = "Annulée",
  Disputed = "En litige",
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
  balance: number;
  isPro: boolean;
  proSubscriptionExpires?: string;
  isBanned?: boolean;
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
  product?: Product;
  amount: number;
  status: TransactionStatus;
}

export interface Order {
  id: string;
  product: Product;
  buyer: User;
  seller: User;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  buyerProtectionFee: number;
  trackingNumber?: string;
  shippingProvider?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  product: Product;
  messages: Message[];
  lastMessageTimestamp: string;
}


export enum ReportStatus {
  Pending = "En attente",
  Resolved = "Résolu",
  Dismissed = "Rejeté",
}

export enum DisputeStatus {
  Open = "Ouvert",
  Resolved = "Résolu",
  Closed = "Fermé",
}

export interface Dispute {
  id: string;
  orderId: string;
  initiator: User;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  product: Product;
  reporter: User;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export type View =
  | { name: 'home' }
  | { name: 'productDetail', product: Product }
  | { name: 'addItem' }
  | { name: 'editItem', product: Product }
  | { name: 'profile', user: User }
  | { name: 'saved' }
  | { name: 'search', query: string }
  | { name: 'admin' }
  | { name: 'reports' }
  | { name: 'auth' }
  | { name: 'orders' }
  | { name: 'cart' }
  | { name: 'chat', conversationId?: string, recipient?: User, product?: Product };