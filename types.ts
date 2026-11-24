export type OrderStatus =
  | 'nouvelle'
  | 'confirmee'
  | 'en_preparation'
  | 'en_livraison'
  | 'livree'
  | 'refusee';

export type PaymentStatus = 'en_attente' | 'partiel' | 'paye';

export type DeliveryDateStatus = 'en_attente' | 'confirmee' | 'autre_date_proposee';

export type DeliveryTiming = 'asap' | 'today' | 'tomorrow' | 'scheduled';

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PackOption {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  unit: string;
  packOptions: PackOption[];
  imageUrl: string;
  active: boolean;
  available: boolean;
  isDemoPrice: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderItem {
  productId: string;
  productName: string;
  packId?: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryEntry {
  status: string;
  changedAt: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryDateStatus: DeliveryDateStatus;
  confirmedDeliveryDate?: string;
  deliveryScheduleNote?: string;
  customerName: string;
  phone: string;
  recipientName: string;
  addressText: string;
  district: string;
  city: string;
  cityDistrict: string;
  landmark: string;
  hasGps: boolean;
  latitude?: number | null;
  longitude?: number | null;
  deliveryTiming: DeliveryTiming;
  requestedDate: string;
  notes: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  statusHistory: OrderStatusHistoryEntry[];
  adminNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
  createdAt?: unknown;
}

export interface StoreSettings {
  whatsappNumber: string;
  updatedBy?: string;
  updatedAt?: unknown;
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    shortLabel: string;
    textColor: string;
    surfaceBg: string;
    borderColor: string;
  }
> = {
  nouvelle: {
    label: 'Nouvelle commande',
    shortLabel: 'Nouvelle',
    textColor: 'text-amber-300',
    surfaceBg: 'bg-amber-950/50',
    borderColor: 'border-amber-700/50',
  },
  confirmee: {
    label: 'Confirmée',
    shortLabel: 'Confirmée',
    textColor: 'text-sky-300',
    surfaceBg: 'bg-sky-950/50',
    borderColor: 'border-sky-700/50',
  },
  en_preparation: {
    label: 'En préparation',
    shortLabel: 'Préparation',
    textColor: 'text-orange-300',
    surfaceBg: 'bg-orange-950/50',
    borderColor: 'border-orange-700/50',
  },
  en_livraison: {
    label: 'En livraison',
    shortLabel: 'En livraison',
    textColor: 'text-yellow-300',
    surfaceBg: 'bg-yellow-950/50',
    borderColor: 'border-yellow-700/50',
  },
  livree: {
    label: 'Livrée',
    shortLabel: 'Livrée',
    textColor: 'text-emerald-300',
    surfaceBg: 'bg-emerald-950/50',
    borderColor: 'border-emerald-700/50',
  },
  refusee: {
    label: 'Refusée',
    shortLabel: 'Refusée',
    textColor: 'text-rose-300',
    surfaceBg: 'bg-rose-950/50',
    borderColor: 'border-rose-700/50',
  },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  {
    label: string;
    textColor: string;
    surfaceBg: string;
    borderColor: string;
  }
> = {
  en_attente: {
    label: 'Paiement à la livraison (en attente)',
    textColor: 'text-amber-200',
    surfaceBg: 'bg-amber-950/50',
    borderColor: 'border-amber-700/50',
  },
  partiel: {
    label: 'Paiement partiel',
    textColor: 'text-sky-200',
    surfaceBg: 'bg-sky-950/50',
    borderColor: 'border-sky-700/50',
  },
  paye: {
    label: 'Payée',
    textColor: 'text-emerald-200',
    surfaceBg: 'bg-emerald-900/60',
    borderColor: 'border-emerald-600/60',
  },
};

export const DELIVERY_DATE_STATUS_META: Record<
  DeliveryDateStatus,
  { label: string }
> = {
  en_attente: { label: 'À confirmer par OBA IMPÉRIAL' },
  confirmee: { label: 'Date de livraison confirmée' },
  autre_date_proposee: { label: 'Nouvelle date proposée par OBA' },
};

export const DELIVERY_TIMING_LABELS: Record<DeliveryTiming, string> = {
  asap: 'Dès que possible',
  today: "Aujourd'hui",
  tomorrow: 'Demain',
  scheduled: 'Date choisie',
};

// Visuels officiels OBA IMPÉRIAL fournis
export const REAL_OBA_JIN_BOTTLE =
  '/assets/aistudio/Image_ChatGPT_17_nov._2026__15_08_32_02097962.png';
export const REAL_OBA_SAVOUR_IMAGE =
  '/assets/aistudio/Image_ChatGPT_17_nov._2026__15_08_21_0127a061.png';
export const REAL_OBA_HERO_IMAGE =
  '/assets/aistudio/Image_ChatGPT_17_nov._2026__15_08_09_eb94ce29.png';

export const OFFICIAL_WHISKY_EMBLEM = 'official-whisky-emblem';

export const HERO_IMAGE_PATH = REAL_OBA_HERO_IMAGE;

export const STUDIO_IMAGE_PRESETS = [
  {
    label: 'OBA IMPÉRIAL GIN (Visuel officiel)',
    url: REAL_OBA_JIN_BOTTLE,
  },
  {
    label: 'OBA IMPÉRIAL WHISKY (Emblème officiel)',
    url: OFFICIAL_WHISKY_EMBLEM,
  },
  {
    label: 'OBA Dégustation & Ambiance',
    url: REAL_OBA_HERO_IMAGE,
  },
  {
    label: 'OBA 3 Façons de Savourer',
    url: REAL_OBA_SAVOUR_IMAGE,
  },
];

/**
 * CATALOGUE OFFICIEL OBA IMPÉRIAL — DEUX PRODUITS UNIQUEMENT.
 * Aucun autre produit, aucune variante, aucun conditionnement supplémentaire.
 */
export const OFFICIAL_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'oba-imperial-gin',
    name: 'OBA IMPÉRIAL GIN',
    description: 'Pack de 10 unités',
    categoryId: 'officiel',
    categoryName: 'Catalogue officiel',
    price: 2750,
    unit: 'Pack de 10 unités',
    packOptions: [{ id: 'pack-10', label: 'Pack de 10 unités', price: 2750 }],
    imageUrl: REAL_OBA_JIN_BOTTLE,
    active: true,
    available: true,
    isDemoPrice: false,
    sortOrder: 1,
  },
  {
    id: 'oba-imperial-whisky',
    name: 'OBA IMPÉRIAL WHISKY',
    description: 'Pack de 10 unités',
    categoryId: 'officiel',
    categoryName: 'Catalogue officiel',
    price: 3500,
    unit: 'Pack de 10 unités',
    packOptions: [{ id: 'pack-10', label: 'Pack de 10 unités', price: 3500 }],
    imageUrl: OFFICIAL_WHISKY_EMBLEM,
    active: true,
    available: true,
    isDemoPrice: false,
    sortOrder: 2,
  },
];
