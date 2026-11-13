import React from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Package,
  Trophy,
  Snowflake,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { getPublicPrintFiles } from '../../../utils/publicManifest';

export default function OverviewTab({ onNavigateTab }) {
  const { orders, customProofs, products, prints, highScores } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const totalCost = orders.reduce((sum, o) => {
    const orderCost = (o.items || []).reduce(
      (iSum, item) =>
        iSum + Number(item.unitCost || item.price * 0.42) * item.quantity,
      0
    );
    return sum + orderCost;
  }, 0);

  const netProfit = totalRevenue - totalCost;
  const pendingOrders = orders.filter((o) => o.orderStatus !== 'Shipped').length;
  const pendingProofs = customProofs.filter((p) => p.status === 'Needs Mockup').length;

  const winterCount = products.filter((p) => p.isWinter).length;
  const popularCount = products.filter((p) => p.isPopular).length;

  const allPrintUrls = new Set([
    ...prints.map((p) => p.pngPath),
    ...getPublicPrintFiles(),
  ]);
  const allPrintIds = new Set(prints.map((p) => p.id));

  const unlinkedCustomProducts = products.filter(
    (p) =>
      p.customizable &&
      !allPrintUrls.has(p.assignedPrintUrl) &&
      !allPrintIds.has(p.printId)
  ).length;

  const topScore = highScores[0] || { name: 'NONE', score: 0 };

  const cards = [
    {
      title: 'Gross Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      sub: `${orders.length} total store orders`,
      icon: DollarSign,
      bg: '#8AC926',
      text: '#1E1E24',
      targetTab: 'orders',
    },
    {
      title: 'Estimated Net Profit',
      value: `$${netProfit.toFixed(2)}`,
      sub: `After $${totalCost.toFixed(2)} POD/Plush costs`,
      icon: TrendingUp,
      bg: '#FFCA3A',
      text: '#1E1E24',
      targetTab: 'orders',
    },
    {
      title: 'Orders to Fulfill',
      value: pendingOrders,
      sub: 'Awaiting Printify / Supplier dispatch',
      icon: ShoppingBag,
      bg: '#1982C4',
      text: '#FFFFFF',
      targetTab: 'orders',
    },
    {
      title: 'Custom Mockup Queue',
      value: pendingProofs,
      sub: 'Customer uploads awaiting proof',
      icon: Sparkles,
      bg: '#6A4C93',
      text: '#FFFFFF',
      targetTab: 'proofs',
    },
    {
      title: 'Front-Page 8-Slot Trays',
      value: `${winterCount}/8 • ${popularCount}/8`,
      sub: 'Winter & Most Popular slots active',
      icon: Snowflake,
      bg: '#0284C7',
      text: '#FFFFFF',
      targetTab: 'inventory',
    },
    {
      title: 'Top Cloud Dash Score',
      value: `${topScore.score} pts`,
      sub: `Held by ${topScore.name} (${highScores.length} scores)`,
      icon: Trophy,
      bg: '#FF924C',
      text: '#FFFFFF',
      targetTab: 'mascot-arcade',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">
            Executive Storefront Overview
          </h2>
          <p className="text-sm text-slate-600">
            Real-time snapshot of revenue, 8-slot front-page collections, customizer print links, and Cloud Dash arcade activity.
          </p>
        </div>

        {unlinkedCustomProducts > 0 && (
          <button
            type="button"
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2.5 rounded-2xl bg-amber-300 hover:bg-amber-400 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>
              {unlinkedCustomProducts} Customizable Products Need a Print Link — Click to Fix
            </span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              onClick={() => onNavigateTab(c.targetTab)}
              style={{ backgroundColor: c.bg, color: c.text }}
              className="p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] cursor-pointer hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider opacity-85">
                  {c.title}
                </span>
                <Icon className="w-6 h-6 opacity-90" />
              </div>
              <div className="font-display text-4xl font-bold mt-2">{c.value}</div>
              <div className="text-xs font-bold mt-1 opacity-85">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Inventory Quick Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold">Latest Customer Orders</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-extrabold text-[#FF595E] underline"
            >
              Manage All Orders →
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm">{ord.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-slate-900">
                      {ord.paymentStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                      {ord.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    {ord.customerName} • {ord.items?.length || 0} item(s)
                  </p>
                </div>
                <div className="font-display text-lg font-bold">
                  ${Number(ord.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24] p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FF924C]" />
              Storefront & Arcade Quick Actions
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              You have <strong>{products.length} products</strong>,{' '}
              <strong>{prints.length} customizer prints</strong>, and{' '}
              <strong>{highScores.length} arcade high scores</strong> synced.
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="w-full py-3 px-4 rounded-2xl bg-[#FF924C] text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24]"
            >
              Curate 8 Winter & 8 Popular Products
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('mascot-arcade')}
              className="w-full py-3 px-4 rounded-2xl bg-[#FF6392] text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24]"
            >
              Edit Puff’s Dialogue & Cloud Dash Arcade
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('prints')}
              className="w-full py-3 px-4 rounded-2xl bg-[#8AC926] text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24]"
            >
              Upload Transparent PNGs to Customizer Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
