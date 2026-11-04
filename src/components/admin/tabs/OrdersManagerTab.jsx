import React, { useState } from 'react';
import { CheckCircle2, Truck, Download, ExternalLink } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export default function OrdersManagerTab() {
  const { orders, updateOrder } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered =
    statusFilter === 'All'
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter);

  const handleDownloadArtwork = (dataUrl, orderId) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${orderId}-print-file.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Incoming Orders Pipeline</h2>
          <p className="text-sm text-slate-600">
            Verify Interac e-Transfers, download customizer PNG print files for Printify, and dispatch tracking numbers.
          </p>
        </div>

        <div className="flex gap-2">
          {['All', 'Processing', 'In Production', 'Shipped'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
                statusFilter === st ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border-3 border-slate-900 p-5 sm:p-6 shadow-[0_6px_0_#1E1E24] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold">{order.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 border border-slate-900">
                    {order.paymentMethod.toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-200 text-slate-900'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {order.createdAt} • <strong>{order.customerName}</strong> ({order.customerEmail})
                </p>
                <p className="text-xs text-slate-600 font-semibold">{order.shippingAddress}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {order.paymentStatus !== 'Paid' && (
                  <button
                    type="button"
                    onClick={() => updateOrder(order.id, { paymentStatus: 'Paid' })}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold border-2 border-slate-900 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm e-Transfer Received
                  </button>
                )}

                <select
                  value={order.orderStatus}
                  onChange={(e) => updateOrder(order.id, { orderStatus: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 border-2 border-slate-900 text-xs font-extrabold"
                >
                  <option value="Processing">Status: Processing</option>
                  <option value="In Production">Status: In Production</option>
                  <option value="Shipped">Status: Shipped</option>
                </select>
              </div>
            </div>

            {/* Order Line Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(order.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-extrabold text-[10px]">
                      {item.fulfillmentRoute || 'Printify / Supplier'}
                    </span>
                    <h4 className="font-bold text-slate-900 truncate mt-0.5">{item.name}</h4>
                    <p className="text-slate-500">{item.sizeLabel}</p>
                    <p className="text-rose-600 font-bold">{item.modeLabel}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-sm block">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadArtwork(item.image, order.id)}
                      className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-rose-600"
                    >
                      <Download className="w-3 h-3" /> Print File
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tracking Number Input & Order Total */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={order.trackingNumber || ''}
                  onChange={(e) => updateOrder(order.id, { trackingNumber: e.target.value })}
                  placeholder="Paste Canada Post / UPS Tracking Number..."
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="font-display text-xl font-bold">
                Order Total: ${Number(order.total).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
