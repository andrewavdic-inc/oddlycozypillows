import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wand2,
  Sparkles,
  Settings,
  LogOut,
  Cloud,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { resolveLogoVariant } from '../../utils/publicManifest';
import OverviewTab from './tabs/OverviewTab';
import OrdersManagerTab from './tabs/OrdersManagerTab';
import CustomProofsTab from './tabs/CustomProofsTab';
import InventoryManagerTab from './tabs/InventoryManagerTab';
import PrintsVaultTab from './tabs/PrintsVaultTab';
import FrontPageCmsTab from './tabs/FrontPageCmsTab';

const ADMIN_TABS = [
  { id: 'overview', label: 'Business Overview', icon: LayoutDashboard, color: '#FF595E' },
  { id: 'orders', label: 'Incoming Orders', icon: ShoppingBag, color: '#1982C4' },
  { id: 'proofs', label: 'Custom Order Proofs', icon: Sparkles, color: '#6A4C93' },
  { id: 'inventory', label: 'Inventory & Products', icon: Package, color: '#FF924C' },
  { id: 'prints', label: 'Customizer PNG Vault', icon: Wand2, color: '#8AC926' },
  { id: 'cms', label: 'Front-Page & Settings', icon: Settings, color: '#FFCA3A' },
];

export default function AdminDashboard({ onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('inventory');
  const {
    orders,
    customProofs,
    products,
    isFirebaseConfigured,
    syncStatus,
    syncError,
  } = useStore();

  const whiteLogo = resolveLogoVariant({ theme: 'white', blink: false, withUrl: false });
  const pendingOrdersCount = orders.filter((o) => o.orderStatus !== 'Shipped').length;
  const pendingProofsCount = customProofs.filter((p) => p.status === 'Needs Mockup').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-72 bg-[#1E1E24] text-white border-b-4 lg:border-b-0 lg:border-r-4 border-slate-900 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between lg:justify-start gap-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={whiteLogo}
                onError={(e) => {
                  e.currentTarget.src = '/logo-full-color.svg';
                }}
                alt="Oddly Cozy Admin"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="font-display text-xl font-bold leading-none">
                  Oddly Cozy <span className="text-[#FFCA3A]">HQ</span>
                </h1>
                <span className="text-[11px] text-slate-400 font-bold">
                  Operator Command Center
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onExitAdmin}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold"
            >
              Exit to Store
            </button>
          </div>

          {/* Live Database Diagnostic Badge */}
          <div className="my-4 p-3 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              {isFirebaseConfigured && !syncError ? (
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : syncError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span
                className={`font-extrabold ${
                  isFirebaseConfigured && !syncError
                    ? 'text-emerald-400'
                    : syncError
                    ? 'text-rose-400'
                    : 'text-amber-300'
                }`}
              >
                {syncStatus}
              </span>
            </div>

            {syncError && (
              <p className="text-[11px] text-rose-300 font-semibold leading-snug">
                Error: {syncError}. Check Firestore Database Rules in Firebase Console!
              </p>
            )}

            {!isFirebaseConfigured && (
              <p className="text-[10px] text-slate-400 leading-snug">
                Add VITE_FIREBASE_API_KEY in Vercel Settings & Redeploy to sync across devices.
              </p>
            )}
          </div>

          <nav className="space-y-2">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-[0_4px_0_#FF595E]'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isActive ? '#1E1E24' : tab.color }}
                    />
                    {tab.label}
                  </span>

                  {tab.id === 'orders' && pendingOrdersCount > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#1982C4] text-white font-extrabold">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {tab.id === 'proofs' && pendingProofsCount > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#FF6392] text-white font-extrabold">
                      {pendingProofsCount}
                    </span>
                  )}
                  {tab.id === 'inventory' && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-700 text-slate-200 font-bold">
                      {products.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={onExitAdmin}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-sm border-2 border-white shadow-[0_4px_0_#000] transition-transform hover:-translate-y-0.5 mt-6"
        >
          <LogOut className="w-4 h-4" />
          View Live Storefront
        </button>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        {activeTab === 'overview' && <OverviewTab onNavigateTab={setActiveTab} />}
        {activeTab === 'orders' && <OrdersManagerTab />}
        {activeTab === 'proofs' && <CustomProofsTab />}
        {activeTab === 'inventory' && <InventoryManagerTab />}
        {activeTab === 'prints' && <PrintsVaultTab />}
        {activeTab === 'cms' && <FrontPageCmsTab />}
      </main>
    </div>
  );
}
