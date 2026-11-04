import React from 'react';
import { DollarSign, TrendingUp, PackageCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export default function OverviewTab({ onNavigateTab }) {
  const { orders, products, customProofs } = useStore();

  const grossRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalCost = orders.reduce((sum, o) => {
    const orderCost = (o.items || []).reduce(
      (c, i) => c + Number(i.unitCost || i.price * 0.42) * Number(i.quantity || 1),
      0
    );
    return sum + orderCost;
  }, 0);
  const netProfit = grossRevenue - totalCost;
  const marginPct = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  const awaitingEtransfer = orders.filter((o) => o.paymentStatus === 'Awaiting e-Transfer');
  const needsMockup = customProofs.filter((p) => p.status === 'Needs Mockup');
  const outOfStock = products.filter((p) => !p.inStock);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Business Overview</h2>
        <p className="text-sm text-slate-600">
          Real-time revenue, fulfillment costs (Printify POD & Plush Suppliers), and operator action items.
        </p>
      </div>

      {/* Financial & Fulfillment KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase">
            <span>Gross Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="font-display text-3xl font-bold mt-2">${grossRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Across {orders.length} total orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase">
            <span>Fulfillment COGS</span>
            <PackageCheck className="w-5 h-5 text-sky-500" />
          </div>
          <p className="font-display text-3xl font-bold mt-2">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Printify + Plushie base costs</p>
        </div>

        <div className="bg-[#8AC926] text-slate-900 p-5 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24]">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase">
            <span>Estimated Net Profit</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="font-display text-3xl font-bold mt-2">${netProfit.toFixed(2)}</p>
          <p className="text-xs font-bold mt-1">{marginPct}% Net Margin</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24]">
          <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase">
            <span>Active Catalog</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-3xl font-bold mt-2">
            {products.length - outOfStock.length} / {products.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {outOfStock.length} items marked Sold Out
          </p>
        </div>
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold">
              Pending e-Transfers ({awaitingEtransfer.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-extrabold text-sky-600 flex items-center gap-1 hover:underline"
            >
              Manage Orders <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {awaitingEtransfer.length === 0 ? (
            <p className="text-xs text-slate-500">All Interac e-Transfer orders are verified!</p>
          ) : (
            <div className="space-y-2.5">
              {awaitingEtransfer.map((o) => (
                <div
                  key={o.id}
                  className="p-3 rounded-2xl bg-amber-50 border-2 border-slate-900 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-extrabold">{o.id}</span> — {o.customerName}
                    <span className="block text-slate-500">{o.customerEmail}</span>
                  </div>
                  <span className="font-display font-bold text-base">${o.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border-3 border-slate-900 shadow-[0_6px_0_#1E1E24]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold">
              Bespoke Proofs Needed ({needsMockup.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('proofs')}
              className="text-xs font-extrabold text-purple-600 flex items-center gap-1 hover:underline"
            >
              Open Proofing Desk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {needsMockup.length === 0 ? (
            <p className="text-xs text-slate-500">All custom order mockups have been sent!</p>
          ) : (
            <div className="space-y-2.5">
              {needsMockup.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-purple-50 border-2 border-slate-900 flex items-center justify-between text-xs"
                >
                  <div className="pr-3">
                    <span className="font-extrabold">{p.customerEmail}</span> ({p.sizeLabel})
                    <p className="text-slate-600 truncate max-w-xs">{p.description}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-bold shrink-0">
                    Needs Proof
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
