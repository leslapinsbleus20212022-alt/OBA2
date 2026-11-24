import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ShoppingBag } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { CatalogView } from './components/CatalogView';
import { CheckoutView } from './components/CheckoutView';
import { ConfirmationView } from './components/ConfirmationView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OBA_WHATSAPP_CONFIG } from './config/obaConfig';
import { db, handleFirestoreError, OperationType } from './firebase';
import { OFFICIAL_PRODUCTS, Order, Product, StoreSettings } from './types';
import {
  enforceOfficialCatalogProducts,
  normalizeOfficialWhatsappNumber,
} from './utils/format';

type AppView = 'catalog' | 'checkout' | 'confirmation' | 'admin';

export default function App() {
  const [view, setView] = useState<AppView>('catalog');
  const [firestoreProducts, setFirestoreProducts] = useState<Partial<Product>[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [firestoreWhatsapp, setFirestoreWhatsapp] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [preparedOrder, setPreparedOrder] = useState<Order | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Détection de dépassement de quota Google Maps
  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  // Écoute temps réel du catalogue Firestore (filtré sur les 2 références officielles)
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('sortOrder', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Partial<Product>[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Partial<Product>),
        }));
        setFirestoreProducts(list);
        setProductsLoading(false);
      },
      () => {
        // En cas d'indisponibilité réseau, conserver le catalogue officiel local
        setProductsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Écoute temps réel de la configuration WhatsApp officielle
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'whatsapp'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<StoreSettings>;
          setFirestoreWhatsapp(
            normalizeOfficialWhatsappNumber(data.whatsappNumber || '')
          );
        }
      },
      (error) => {
        // Ignorer silencieusement si le document n'existe pas encore
        if (error && 'code' in error && error.code === 'permission-denied') {
          handleFirestoreError(error, OperationType.GET, 'settings/whatsapp');
        }
      }
    );

    return () => unsub();
  }, []);

  const catalogProducts: Product[] =
    firestoreProducts.length > 0
      ? enforceOfficialCatalogProducts(firestoreProducts)
      : OFFICIAL_PRODUCTS;

  const officialWhatsappNumber =
    firestoreWhatsapp ||
    normalizeOfficialWhatsappNumber(OBA_WHATSAPP_CONFIG.officialWhatsappNumber);

  // Calcul strict du nombre total de packs sélectionnés sur les 2 produits officiels
  const totalSelectedCount = catalogProducts.reduce((sum, prod) => {
    const pack = prod.packOptions[0];
    if (!pack || !prod.active) return sum;
    return sum + (quantities[`${prod.id}::${pack.id}`] || 0);
  }, 0);

  const handleChangeQuantity = (
    productId: string,
    packId: string,
    delta: number
  ) => {
    const key = `${productId}::${packId}`;
    setQuantities((prev) => {
      const current = prev[key] || 0;
      const next = Math.max(0, Math.min(999, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const handleOrderPrepared = (order: Order) => {
    setPreparedOrder(order);
    setView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (target: AppView) => {
    setView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#0B0908] text-[#FAF7F0]">
        {/* Bannière quota Google Maps Platform */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Le quota d&apos;affichage Google Maps Platform est atteint. Si vous êtes le propriétaire de l&apos;application, consultez le{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                portail développeur Google Maps
              </a>{' '}
              pour mettre à niveau votre compte.
            </span>
          </div>
        )}

        {/* Barre de navigation supérieure (3 zones) */}
        <header className="sticky top-0 z-30 bg-[#0B0908]/95 backdrop-blur-md border-b border-[#A97142]/25">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-8">
            <button
              type="button"
              onClick={() => navigateTo('catalog')}
              className="font-display text-base sm:text-2xl font-bold tracking-[0.12em] sm:tracking-[0.14em] text-[#FAF7F0] whitespace-nowrap shrink-0 cursor-pointer"
            >
              OBA IMPÉRIAL
            </button>

            <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-[#EFE8DA]/80">
              <button
                type="button"
                onClick={() => navigateTo('catalog')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF7F0] cursor-pointer ${
                  view === 'catalog' ? 'text-[#D4AF37] underline underline-offset-4' : ''
                }`}
              >
                Produits
              </button>
              <button
                type="button"
                onClick={() => navigateTo('checkout')}
                className={`hidden sm:inline whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF7F0] cursor-pointer ${
                  view === 'checkout' ? 'text-[#D4AF37] underline underline-offset-4' : ''
                }`}
              >
                Commande
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#FAF7F0] cursor-pointer ${
                  view === 'admin' ? 'text-[#D4AF37] underline underline-offset-4' : ''
                }`}
              >
                <span className="sm:hidden">Gestion</span>
                <span className="hidden sm:inline">Administration</span>
              </button>
            </nav>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (totalSelectedCount > 0) {
                    navigateTo('checkout');
                  } else {
                    navigateTo('catalog');
                  }
                }}
                className="min-h-[40px] sm:min-h-[42px] px-3 sm:px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0908] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>
                  {totalSelectedCount > 0
                    ? `Panier (${totalSelectedCount})`
                    : 'Commander'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1">
          {view === 'catalog' && (
            <CatalogView
              products={catalogProducts}
              loading={productsLoading}
              quantities={quantities}
              onChangeQuantity={handleChangeQuantity}
              onContinue={() => navigateTo('checkout')}
            />
          )}

          {view === 'checkout' && (
            <CheckoutView
              products={catalogProducts}
              quantities={quantities}
              quotaExceeded={quotaExceeded}
              onBackToCatalog={() => navigateTo('catalog')}
              onOrderPrepared={handleOrderPrepared}
            />
          )}

          {view === 'confirmation' && preparedOrder && (
            <ConfirmationView
              order={preparedOrder}
              officialWhatsappNumber={officialWhatsappNumber}
              onEditOrder={() => navigateTo('checkout')}
              onNewOrder={() => {
                setPreparedOrder(null);
                setQuantities({});
                navigateTo('catalog');
              }}
            />
          )}

          {view === 'admin' && (
            <AdminDashboard
              products={catalogProducts}
              officialWhatsappNumber={officialWhatsappNumber}
            />
          )}
        </main>

        {/* Pied de page */}
        <footer className="border-t border-[#A97142]/20 bg-[#0B0908] py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EFE8DA]/65">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="font-display text-base font-bold tracking-widest text-[#FAF7F0]">
                OBA IMPÉRIAL
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span className="tracking-wider text-[#D4AF37]">
                BORN FROM AFRICA ROYALTIES
              </span>
            </div>
            <p className="text-center sm:text-right">
              Livraison assurée par OBA IMPÉRIAL · Paiement à la livraison
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
