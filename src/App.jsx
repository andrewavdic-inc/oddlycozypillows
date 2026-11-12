import React, { useState, useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { soundFX } from './utils/soundEffects';
import Navbar from './components/layout/Navbar';
import CategoryBubbles from './components/layout/CategoryBubbles';
import FeaturedGridSection from './components/shop/FeaturedGridSection';
import FullCatalogPage from './components/shop/FullCatalogPage';
import ProductLightboxModal from './components/shop/ProductLightboxModal';
import InlineCustomizerSection from './components/customizer/InlineCustomizerSection';
import CustomizerModal from './components/customizer/CustomizerModal';
import CartDrawer from './components/checkout/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import WeatherOverlay from './components/interactive/WeatherOverlay';
import FlashlightGameModal from './components/interactive/FlashlightGameModal';
import Footer from './components/layout/Footer';
import AdminPinModal from './components/admin/AdminPinModal';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const { products, cms, addCustomProof, addOrder } = useStore();

  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [catalogTargetCategory, setCatalogTargetCategory] = useState('all');

  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizerState, setCustomizerState] = useState({
    isOpen: false,
    product: null,
    defaultType: 'pillow',
  });
  const [activeWeather, setActiveWeather] = useState('none');
  const [isMuted, setIsMuted] = useState(false);

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

  // Clicking Buy adds the item AND immediately opens the frameless shopping cart window
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
    setIsCartOpen(true);
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

  const handleSelectCategoryButton = (category) => {
    setCatalogTargetCategory(category.isAllButton ? 'all' : category.id);
    setCurrentPage('catalog');
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

  const winterProducts = [
    ...inStockProducts.filter((p) => p.isWinter),
    ...inStockProducts.filter((p) => !p.isWinter),
  ].slice(0, 8);

  const popularProducts = [
    ...inStockProducts.filter((p) => p.isPopular),
    ...inStockProducts.filter((p) => !p.isPopular),
  ].slice(0, 8);

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
        currentPage={currentPage}
        onNavigateHomeSection={handleNavigateHomeSection}
        onOpenFullCatalog={(catId = 'all') => {
          setCatalogTargetCategory(catId);
          setCurrentPage('catalog');
        }}
      />

      {currentPage === 'home' ? (
        <main className="flex-1">
          <CategoryBubbles onSelectCategory={handleSelectCategoryButton} />

          {/* 1. Winter Collection Section (8 Items) */}
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
            onInspectProduct={(product) => setInspectedProduct(product)}
            onOpenCustomizer={() => handleNavigateHomeSection('customizer-section')}
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
            onInspectProduct={(product) => setInspectedProduct(product)}
          />

          {/* 3. Embedded Interactive Pillow & Blanket Customizer at the Bottom of Home Page */}
          <InlineCustomizerSection
            onAddToCart={(item) => {
              handleAddToCart(item);
              setIsCartOpen(true);
            }}
            onExploreAllCategories={() => {
              setCatalogTargetCategory('all');
              setCurrentPage('catalog');
            }}
          />
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
          onInspectProduct={(product) => setInspectedProduct(product)}
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

      {/* Frameless Full-Photo Merchandise Lightbox */}
      <ProductLightboxModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onBuyAsShown={handleBuyAsShown}
        onCustomizeProduct={(product) =>
          setCustomizerState({
            isOpen: true,
            product,
            defaultType: product.productType || 'pillow',
          })
        }
      />

      {/* Floating Bottom Flashlight Icon & Hidden Room Game */}
      <FlashlightGameModal
        onOpenCustomizer={() => handleNavigateHomeSection('customizer-section')}
      />

      {/* Footer with Vibe FX, Sound Mute & Stealth Admin Lock */}
      <Footer
        onTriggerAdminPin={() => setIsPinModalOpen(true)}
        activeWeather={activeWeather}
        setActiveWeather={setActiveWeather}
        onSelectCategory={handleSelectCategoryButton}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
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

      {/* Frameless Floating Shopping Cart Window */}
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
