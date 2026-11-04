import React, { useState, useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { soundFX } from './utils/soundEffects';
import Navbar from './components/layout/Navbar';
import HeroBanner from './components/layout/HeroBanner';
import CategoryBubbles from './components/layout/CategoryBubbles';
import CategorySection from './components/shop/CategorySection';
import CustomOrderSection from './components/shop/CustomOrderSection';
import CustomizerModal from './components/customizer/CustomizerModal';
import CartDrawer from './components/checkout/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import WeatherOverlay from './components/interactive/WeatherOverlay';
import Footer from './components/layout/Footer';
import AdminPinModal from './components/admin/AdminPinModal';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const { categories, products, cms, addCustomProof } = useStore();

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizerState, setCustomizerState] = useState({
    isOpen: false,
    product: null,
    defaultType: 'pillow',
  });
  const [activeWeather, setActiveWeather] = useState(cms.defaultWeather || 'confetti');
  const [isMuted, setIsMuted] = useState(false);

  // Admin Portal States
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Secret Keyboard Shortcut: Shift + Alt + A opens the Admin PIN Pad
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

  // Switch to Full-Screen Admin Command Center when unlocked
  if (isAdminUnlocked) {
    return <AdminDashboard onExitAdmin={() => setIsAdminUnlocked(false)} />;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Optional Storewide Promo Bar Controlled from Admin CMS */}
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
        activeWeather={activeWeather}
        setActiveWeather={setActiveWeather}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      <main className="flex-1">
        <HeroBanner
          onOpenCustomizer={() =>
            setCustomizerState({ isOpen: true, product: products[0], defaultType: 'pillow' })
          }
        />

        <CategoryBubbles />

        {categories.map((category) => {
          const categoryProducts = products.filter(
            (p) => p.categoryId === category.id && p.inStock !== false
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

        <CustomOrderSection
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
      </main>

      <Footer onTriggerAdminPin={() => setIsPinModalOpen(true)} />

      {/* Stealth Operator PIN Modal */}
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
