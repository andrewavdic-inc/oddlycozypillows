import React, { useState, useEffect } from 'react';
import { LayoutGrid, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from './context/StoreContext';
import { soundFX } from './utils/soundEffects';
import Navbar from './components/layout/Navbar';
import CategoryBubbles from './components/layout/CategoryBubbles';
import FeaturedGridSection from './components/shop/FeaturedGridSection';
import CategorySection from './components/shop/CategorySection';
import FullCatalogPage from './components/shop/FullCatalogPage';
import CustomizerModal from './components/customizer/CustomizerModal';
import CartDrawer from './components/checkout/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import WeatherOverlay from './components/interactive/WeatherOverlay';
import FlashlightGameModal from './components/interactive/FlashlightGameModal';
import Footer from './components/layout/Footer';
import AdminPinModal from './components/admin/AdminPinModal';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const { categories, products, cms, addCustomProof } = useStore();

  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'catalog'
  const [catalogTargetCategory, setCatalogTargetCategory] = useState('all');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizerState, setCustomizerState] = useState({
    isOpen: false,
    product: null,
    defaultType: 'pillow',
  });
  const [activeWeather, setActiveWeather] = useState('none');
  const [isMuted, setIsMuted] = useState(false);

  // Admin Portal States
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsPinModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddToCart = (newItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.name === newItem.name &&
          i.sizeLabel === newItem.sizeLabel &&
          i.modeLabel === newItem.modeLabel
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const handleBuyAsShown = (product) => {
    handleAddToCart({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      sizeLabel: product.subtitle,
      modeLabel: product.customizable ? 'As Shown (1-Click Order)' : 'Standard Edition',
      price: product.price,
      unitCost: product.unitCost,
      fulfillmentRoute: product.fulfillmentRoute,
      quantity: 1,
      image: product.image || product.fallbackImage,
    });
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  // Smart routing when clicking any of the 7 rotating PNG category buttons
  const handleSelectCategoryButton = (category) => {
    if (category.onHomePage && currentPage === 'home') {
      const el = document.getElementById(category.id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setCatalogTargetCategory(category.id);
      setCurrentPage('catalog');
    }
  };

  const handleNavigateHomeSection = (sectionId) => {
    soundFX.playPop();
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    } else if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAdminUnlocked) {
    return <AdminDashboard onExitAdmin={() => setIsAdminUnlocked(false)} />;
  }

  const inStockProducts = products.filter((p) => p.inStock !== false);

  // Guarantee 8 items in Winter Collection & 8 items in Most Popular
  const winterProducts = [
    ...inStockProducts.filter((p) => p.isWinter),
    ...inStockProducts.filter((p) => !p.isWinter),
  ].slice(0, 8);

  const popularProducts = [
    ...inStockProducts.filter((p) => p.isPopular),
    ...inStockProducts.filter((p) => !p.isPopular),
  ].slice(0, 8);

  const homePillowCategories = categories.filter(
    (c) => c.id === 'printed-pillows' || c.id === 'oddly-cozy-pillows'
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="top" className="min-h-screen flex flex-col relative">
      {cms.announcementEnabled && (
        <div
          style={{ backgroundColor: cms.announcementBg || '#1E1E24' }}
          className="text-amber-300 text-center py-2 px-4 text-xs font-extrabold tracking-wide border-b-2 border-slate-900"
        >
          {cms.announcementText}
        </div>
      )}

      <WeatherOverlay activeWeather={activeWeather} />

      <Navbar
        cartCount={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBlankCustomizer={() =>
          setCustomizerState({ isOpen: true, product: products[0], defaultType: 'pillow' })
        }
        currentPage={currentPage}
        onNavigateHomeSection={handleNavigateHomeSection}
        onOpenFullCatalog={(catId = 'all') => {
          setCatalogTargetCategory(catId);
          setCurrentPage('catalog');
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {currentPage === 'home' ? (
        <main className="flex-1">
          {/* 7 Borderless Rotating Transparent PNG Category Buttons */}
          <CategoryBubbles onSelectCategory={handleSelectCategoryButton} />

          {/* 1. Winter Collection Section (8 Items — First Thing Customers See) */}
          <FeaturedGridSection
            id="winter-collection"
            theme="winter"
            title={cms.winterTitle || 'Winter & Holiday Collection'}
            subtitle={
              cms.winterSubtitle ||
              'Limited-edition cozy bundles, chunky throws, and gift-ready pillows for everyone on your list.'
            }
            products={winterProducts}
            onBuyAsShown={handleBuyAsShown}
            onCustomizeProduct={(product) =>
              setCustomizerState({
                isOpen: true,
                product,
                defaultType: product.productType || 'pillow',
              })
            }
            onOpenCustomizer={() =>
              setCustomizerState({ isOpen: true, product: products[0], defaultType: 'pillow' })
            }
          />

          {/* 2. Most Popular Section (8 Items) */}
          <FeaturedGridSection
            id="most-popular"
            theme="popular"
            title={cms.popularTitle || 'Most Popular Favorites'}
            subtitle={
              cms.popularSubtitle ||
              'Our 8 highest-rated pillows, plushies, and cozy room essentials.'
            }
            products={popularProducts}
            onBuyAsShown={handleBuyAsShown}
            onCustomizeProduct={(product) =>
              setCustomizerState({
                isOpen: true,
                product,
                defaultType: product.productType || 'pillow',
              })
            }
          />

          {/* 3. All Printed Pillows & 4. All Oddly Cozy Pillows */}
          {homePillowCategories.map((category) => {
            const categoryProducts = inStockProducts.filter(
              (p) => p.categoryId === category.id
            );
            return (
              <CategorySection
                key={category.id}
                category={category}
                products={categoryProducts}
                onBuyAsShown={handleBuyAsShown}
                onCustomizeProduct={(product) =>
                  setCustomizerState({
                    isOpen: true,
                    product,
                    defaultType: product.productType || 'pillow',
                  })
                }
                onOpenUploadCustomizer={(type) =>
                  setCustomizerState({
                    isOpen: true,
                    product: null,
                    defaultType: type,
                  })
                }
              />
            );
          })}

          {/* End of Home Page CTA -> Directs to Full Catalog Page */}
          <section className="py-16 bg-[#1E1E24] text-white border-t-4 border-slate-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Blankets • Matching Sets • Rugs • Squishies • Custom Orders
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold">
                Want to See All 7 Categories & Our Full Catalog?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
                Explore our Printed Blankets, Fried Egg & Chunky Knit Blankets, Matching Sets, Round Floor Rugs, Slow-Rise Squishies, and Totally Custom Orders on our full catalog page!
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playSparkleChime();
                    setCatalogTargetCategory('all');
                    setCurrentPage('catalog');
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#8AC926] hover:bg-lime-400 text-slate-900 font-display text-xl font-bold border-3 border-white shadow-[0_6px_0_#000] transition-transform hover:-translate-y-1"
                >
                  <LayoutGrid className="w-6 h-6" />
                  <span>See All Categories & All Products</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <FullCatalogPage
          initialCategoryId={catalogTargetCategory}
          onBackToHome={() => setCurrentPage('home')}
          onBuyAsShown={handleBuyAsShown}
          onCustomizeProduct={(product) =>
            setCustomizerState({
              isOpen: true,
              product,
              defaultType: product.productType || 'pillow',
            })
          }
          onOpenUploadCustomizer={(type) =>
            setCustomizerState({
              isOpen: true,
              product: null,
              defaultType: type,
            })
          }
          onAddCustomRequestToCart={(customItem) => {
            addCustomProof({
              id: `PRF-${Math.floor(100 + Math.random() * 900)}`,
              createdAt: new Date().toLocaleString(),
              customerEmail: customItem.notes?.split('to: ')[1]?.replace(')', '') || 'Customer',
              itemType: customItem.name.toLowerCase().includes('blanket') ? 'blanket' : 'pillow',
              sizeLabel: customItem.sizeLabel,
              price: customItem.price,
              description: customItem.notes,
              referenceImage: customItem.image,
              mockupProofImage: '',
              status: 'Needs Mockup',
            });
            handleAddToCart(customItem);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* Floating Bottom Flashlight Icon & Hidden Room Game */}
      <FlashlightGameModal
        onOpenCustomizer={() =>
          setCustomizerState({ isOpen: true, product: products[0], defaultType: 'pillow' })
        }
      />

      {/* Footer with Vibe FX Controls & Stealth Admin Lock */}
      <Footer
        onTriggerAdminPin={() => setIsPinModalOpen(true)}
        activeWeather={activeWeather}
        setActiveWeather={setActiveWeather}
        onSelectCategory={handleSelectCategoryButton}
      />

      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => setIsAdminUnlocked(true)}
      />

      <CustomizerModal
        isOpen={customizerState.isOpen}
        onClose={() => setCustomizerState((prev) => ({ ...prev, isOpen: false }))}
        initialProduct={customizerState.product}
        initialType={customizerState.defaultType}
        onAddToCart={(item) => {
          handleAddToCart(item);
          setIsCartOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={(id) => handleUpdateQty(id, 0)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
