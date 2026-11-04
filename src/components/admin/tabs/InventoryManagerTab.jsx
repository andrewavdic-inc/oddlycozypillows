import React, { useState } from 'react';
import { Plus, Upload, Trash2, Edit3, Check, X, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadImageFile } from '../../../services/firebaseClient';
import { getFolderImages } from '../../../utils/publicManifest';

export default function InventoryManagerTab() {
  const { products, categories, saveProduct, deleteProduct } = useStore();
  const [filterCat, setFilterCat] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const visibleProducts =
    filterCat === 'all'
      ? products
      : products.filter((p) => p.categoryId === filterCat);

  const handleStartAdd = () => {
    const defaultCat = filterCat === 'all' ? 'printed-pillows' : filterCat;
    setEditingItem({
      id: `prod-${Date.now()}`,
      categoryId: defaultCat,
      name: '',
      subtitle: '16" × 16" Signature Cozy Edition',
      price: 28.99,
      unitCost: 11.5,
      badge: 'New Arrival',
      description: '',
      image: '/icons/printed-pillow.svg',
      customizable: defaultCat === 'printed-pillows' || defaultCat === 'printed-blankets',
      productType: defaultCat === 'printed-blankets' ? 'blanket' : 'pillow',
      inStock: true,
      fulfillmentRoute:
        defaultCat === 'printed-pillows' || defaultCat === 'printed-blankets'
          ? 'Printify POD'
          : 'Plush/Blanket Supplier',
    });
  };

  // Direct Button File Upload Handler (No URL Link Needed)
  const handleFileButtonUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageFile(file, `inventory/${editingItem.categoryId}`);
      setEditingItem((prev) => ({
        ...prev,
        image: uploadedUrl,
        fallbackImage: uploadedUrl,
      }));
    } catch (err) {
      alert('Could not process image file. Please try another PNG/JPG.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!editingItem.name) return;
    saveProduct({
      ...editingItem,
      price: Number(editingItem.price),
      unitCost: Number(editingItem.unitCost),
    });
    setEditingItem(null);
  };

  // Discover existing public folder images for the selected category as a bonus quick-select
  const folderMap = {
    'printed-pillows': 'printed pillows',
    'oddly-cozy-pillows': 'oddly cozy pillows',
    'printed-blankets': 'printed blankets',
    'oddly-cozy-blankets': 'oddly cozy blankets',
    'matching-sets': 'matching sets',
    rugs: 'rugs',
    toys: 'toys',
  };
  const localFolderFiles = editingItem
    ? getFolderImages(folderMap[editingItem.categoryId] || '')
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Inventory & Product Manager</h2>
          <p className="text-sm text-slate-600">
            Upload product photos with one click, adjust prices & internal costs, or toggle stock across all 7 categories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24]"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCat('all')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
            filterCat === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
          }`}
        >
          All Categories ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCat(cat.id)}
            style={filterCat === cat.id ? { backgroundColor: cat.color, color: cat.textColor } : {}}
            className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
              filterCat === cat.id ? 'shadow-[0_2px_0_#1E1E24]' : 'bg-white text-slate-700'
            }`}
          >
            {cat.shortName} ({products.filter((p) => p.categoryId === cat.id).length})
          </button>
        ))}
      </div>

      {/* Add / Edit Product Modal with File Upload Button */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveForm}
            className="bg-white rounded-3xl border-4 border-slate-900 shadow-[0_12px_0_#1E1E24] max-w-2xl w-full p-6 sm:p-8 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <h3 className="font-display text-2xl font-bold">
                {products.some((p) => p.id === editingItem.id) ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-full bg-slate-100 border-2 border-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Image Upload Button Section */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-slate-900 flex flex-col sm:flex-row items-center gap-5">
              <img
                src={editingItem.image}
                alt="Preview"
                className="w-28 h-28 rounded-2xl object-cover bg-white border-2 border-slate-900 shrink-0 shadow"
              />
              <div className="space-y-2.5 flex-1 text-center sm:text-left">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
                  Product Photo
                </span>

                <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1982C4] hover:bg-[#146ca3] text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] cursor-pointer transition-transform active:translate-y-0.5">
                  <Upload className="w-4 h-4" />
                  <span>
                    {isUploading ? 'Uploading & Optimizing...' : 'Upload Image from Computer'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileButtonUpload}
                    className="hidden"
                  />
                </label>

                {localFolderFiles.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Or click a photo already in your public folder:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {localFolderFiles.map((fUrl) => (
                        <button
                          key={fUrl}
                          type="button"
                          onClick={() =>
                            setEditingItem((prev) => ({ ...prev, image: fUrl, fallbackImage: fUrl }))
                          }
                          className={`w-10 h-10 rounded-lg border-2 overflow-hidden ${
                            editingItem.image === fUrl ? 'border-rose-500 scale-105' : 'border-slate-300'
                          }`}
                        >
                          <img src={fUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={editingItem.categoryId}
                  onChange={(e) => {
                    const catId = e.target.value;
                    setEditingItem((prev) => ({
                      ...prev,
                      categoryId: catId,
                      customizable: catId === 'printed-pillows' || catId === 'printed-blankets',
                      productType: catId === 'printed-blankets' ? 'blanket' : 'pillow',
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 font-bold text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={editingItem.badge || ''}
                  onChange={(e) => setEditingItem((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="e.g., Bestseller"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Giant Stuffed Waffle Pillow"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Subtitle / Size Spec
                </label>
                <input
                  type="text"
                  value={editingItem.subtitle}
                  onChange={(e) => setEditingItem((p) => ({ ...p, subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Retail Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingItem.price}
                  onChange={(e) => setEditingItem((p) => ({ ...p, price: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Internal Unit Cost ($) (Admin Only)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.unitCost}
                  onChange={(e) => setEditingItem((p) => ({ ...p, unitCost: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-extrabold cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.inStock}
                  onChange={(e) => setEditingItem((p) => ({ ...p, inStock: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>Product is In Stock</span>
              </label>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#8AC926] text-slate-900 font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Product to Storefront
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleProducts.map((item) => {
          const profit = (item.price - (item.unitCost || item.price * 0.42)).toFixed(2);
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border-3 border-slate-900 p-4 shadow-[0_6px_0_#1E1E24] flex gap-4 items-center"
            >
              <img
                src={item.image}
                onError={(e) => {
                  e.currentTarget.src = item.fallbackImage || '/icons/printed-pillow.svg';
                }}
                alt={item.name}
                className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border-2 border-slate-900 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.inStock
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.inStock ? 'In Stock' : 'Sold Out'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 truncate">
                    {item.fulfillmentRoute}
                  </span>
                </div>

                <h4 className="font-display font-bold text-base truncate mt-0.5">{item.name}</h4>
                <p className="text-xs font-extrabold text-slate-800">
                  ${item.price.toFixed(2)}{' '}
                  <span className="text-emerald-600 font-bold text-[11px]">
                    (+${profit} profit)
                  </span>
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-900 font-extrabold text-xs border border-slate-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit / Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      saveProduct({ ...item, inStock: !item.inStock })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold border border-slate-300"
                  >
                    {item.inStock ? 'Mark Sold Out' : 'Restock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
