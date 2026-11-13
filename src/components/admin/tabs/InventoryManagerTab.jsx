import React, { useState } from 'react';
import {
  Plus,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  Snowflake,
  Flame,
  Star,
  Wand2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Scissors,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadImageFile } from '../../../services/firebaseClient';
import { getFolderImages, getPublicPrintFiles } from '../../../utils/publicManifest';

export default function InventoryManagerTab() {
  const {
    products,
    categories,
    prints,
    savePrintsList,
    saveProduct,
    reorderFeaturedProduct,
    deleteProduct,
  } = useStore();

  const [filterCat, setFilterCat] = useState('all');
  const [activeTray, setActiveTray] = useState('winter');
  const [editingItem, setEditingItem] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingPrint, setIsUploadingPrint] = useState(false);

  const winterProducts = products.filter((p) => p.isWinter);
  const popularProducts = products.filter((p) => p.isPopular);
  const customShapeProducts = products.filter(
    (p) => p.isCustomShape || p.productType === 'custom-shape'
  );
  const trayProducts = activeTray === 'winter' ? winterProducts : popularProducts;

  const publicPrintUrls = getPublicPrintFiles();
  const allAvailablePrints = [...prints];
  publicPrintUrls.forEach((url) => {
    if (!allAvailablePrints.some((p) => p.pngPath === url)) {
      const fileName = url.split('/').pop().replace(/\.(png|webp|jpg)$/i, '');
      allAvailablePrints.push({
        id: fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: fileName,
        pngPath: url,
        fallbackPath: url,
      });
    }
  });

  const visibleProducts =
    filterCat === 'all'
      ? products
      : filterCat === 'winter'
      ? winterProducts
      : filterCat === 'popular'
      ? popularProducts
      : filterCat === 'custom-shape'
      ? customShapeProducts
      : filterCat === 'unlinked'
      ? products.filter(
          (p) =>
            p.customizable &&
            !allAvailablePrints.some(
              (pr) => pr.pngPath === p.assignedPrintUrl || pr.id === p.printId
            )
        )
      : products.filter((p) => p.categoryId === filterCat);

  const unlinkedCount = products.filter(
    (p) =>
      p.customizable &&
      !allAvailablePrints.some(
        (pr) => pr.pngPath === p.assignedPrintUrl || pr.id === p.printId
      )
  ).length;

  const openEditModal = (item) => {
    const existingGallery =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : item.image
        ? [item.image]
        : [];

    setEditingItem({
      ...item,
      isCustomShape: Boolean(item.isCustomShape || item.productType === 'custom-shape'),
      image: item.image || existingGallery[0] || '/icons/printed-pillow.svg',
      images: existingGallery,
      printId: item.printId || '',
      assignedPrintUrl: item.assignedPrintUrl || '',
    });
  };

  const handleStartAdd = (startAsCustomShape = false) => {
    const defaultCat =
      filterCat === 'all' ||
      filterCat === 'winter' ||
      filterCat === 'popular' ||
      filterCat === 'custom-shape' ||
      filterCat === 'unlinked'
        ? 'printed-pillows'
        : filterCat;
    const isCustomCat =
      defaultCat === 'printed-pillows' || defaultCat === 'printed-blankets';

    setEditingItem({
      id: `prod-${Date.now()}`,
      categoryId: defaultCat,
      name: '',
      subtitle: startAsCustomShape
        ? '18" Custom-Shaped Contour Pillow'
        : '16" × 16" Signature Cozy Edition',
      price: startAsCustomShape ? 38.99 : 28.99,
      unitCost: startAsCustomShape ? 15.5 : 11.5,
      badge: startAsCustomShape ? 'Custom Cutout' : 'New Arrival',
      description: '',
      image: '/icons/printed-pillow.svg',
      images: [],
      printId: allAvailablePrints[0]?.id || '',
      assignedPrintUrl: allAvailablePrints[0]?.pngPath || '',
      customizable: isCustomCat,
      isCustomShape: startAsCustomShape,
      productType: startAsCustomShape
        ? 'custom-shape'
        : defaultCat === 'printed-blankets'
        ? 'blanket'
        : 'pillow',
      inStock: true,
      isWinter: filterCat === 'winter',
      isPopular: filterCat === 'popular',
      fulfillmentRoute: startAsCustomShape
        ? 'Custom Die-Cut POD'
        : isCustomCat
        ? 'Printify POD'
        : 'Plush/Blanket Supplier',
    });
  };

  const handleProductPhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editingItem) return;
    setIsUploadingPhoto(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadImageFile(file, `inventory/${editingItem.categoryId}`);
        uploadedUrls.push(url);
      }
      setEditingItem((prev) => {
        const nextImages = [...(prev.images || []), ...uploadedUrls];
        const nextPrimary =
          !prev.image || prev.image.includes('/icons/')
            ? uploadedUrls[0]
            : prev.image;
        return {
          ...prev,
          image: nextPrimary,
          fallbackImage: nextPrimary,
          images: nextImages,
        };
      });
    } catch (err) {
      alert('Could not upload product photo.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddFolderPhotoToGallery = (folderUrl) => {
    setEditingItem((prev) => {
      const exists = (prev.images || []).includes(folderUrl);
      const nextImages = exists ? prev.images : [...(prev.images || []), folderUrl];
      return {
        ...prev,
        image: folderUrl,
        fallbackImage: folderUrl,
        images: nextImages,
      };
    });
  };

  const handleSetPrimaryPhoto = (photoUrl) => {
    setEditingItem((prev) => ({
      ...prev,
      image: photoUrl,
      fallbackImage: photoUrl,
    }));
  };

  const handleRemovePhotoFromGallery = (photoUrl) => {
    setEditingItem((prev) => {
      const nextImages = (prev.images || []).filter((img) => img !== photoUrl);
      const nextPrimary =
        prev.image === photoUrl
          ? nextImages[0] || '/icons/printed-pillow.svg'
          : prev.image;
      return {
        ...prev,
        image: nextPrimary,
        fallbackImage: nextPrimary,
        images: nextImages,
      };
    });
  };

  const handleUploadNewTransparentPrint = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    setIsUploadingPrint(true);
    try {
      const uploadedUrl = await uploadImageFile(file, 'prints');
      const cleanName = file.name.replace(/\.(png|webp|jpg|jpeg)$/i, '');
      const newPrintObj = {
        id: `print-${Date.now()}`,
        name: cleanName,
        pngPath: uploadedUrl,
        fallbackPath: uploadedUrl,
      };
      savePrintsList([newPrintObj, ...prints]);
      setEditingItem((prev) => ({
        ...prev,
        customizable: true,
        printId: newPrintObj.id,
        assignedPrintUrl: newPrintObj.pngPath,
      }));
    } catch (err) {
      alert('Could not upload transparent PNG print.');
    } finally {
      setIsUploadingPrint(false);
      e.target.value = '';
    }
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!editingItem.name) return;

    const finalGallery =
      editingItem.images?.length > 0
        ? editingItem.images
        : editingItem.image
        ? [editingItem.image]
        : [];

    const primaryImage = finalGallery.includes(editingItem.image)
      ? editingItem.image
      : finalGallery[0] || editingItem.image;

    saveProduct({
      ...editingItem,
      image: primaryImage,
      fallbackImage: primaryImage,
      images: finalGallery,
      price: Number(editingItem.price),
      unitCost: Number(editingItem.unitCost),
    });
    setEditingItem(null);
  };

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
          <h2 className="font-display text-3xl font-bold">
            Inventory, Custom-Shaped Pillows & 8-Slot Trays
          </h2>
          <p className="text-sm text-slate-600">
            Add square or <strong>✂️ Custom-Shaped</strong> pillows, reorder your 8 front-page items, and link transparent PNG prints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleStartAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#FFCA3A] hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24]"
          >
            <Scissors className="w-4 h-4" />
            + Add Custom-Shaped Pillow
          </button>

          <button
            type="button"
            onClick={() => handleStartAdd(false)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF595E] hover:bg-[#e0484d] text-white font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24]"
          >
            <Plus className="w-4 h-4" />
            + Add Product
          </button>
        </div>
      </div>

      {/* VISUAL 8-SLOT FRONT-PAGE CURATION TRAY */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-5 shadow-[0_6px_0_#1E1E24] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTray('winter')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 transition-all ${
                activeTray === 'winter'
                  ? 'bg-sky-500 text-white shadow-[0_3px_0_#1E1E24]'
                  : 'bg-sky-50 text-sky-900'
              }`}
            >
              <Snowflake className="w-4 h-4" />
              Winter Collection Tray ({winterProducts.length}/8)
            </button>

            <button
              type="button"
              onClick={() => setActiveTray('popular')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 transition-all ${
                activeTray === 'popular'
                  ? 'bg-amber-400 text-slate-900 shadow-[0_3px_0_#1E1E24]'
                  : 'bg-amber-50 text-amber-900'
              }`}
            >
              <Flame className="w-4 h-4" />
              Most Popular Tray ({popularProducts.length}/8)
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">
            Use <strong>◀ ▶</strong> to reorder how these 8 items appear on the front page!
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {Array.from({ length: 8 }).map((_, slotIdx) => {
            const item = trayProducts[slotIdx];
            if (!item) {
              return (
                <div
                  key={`empty-${slotIdx}`}
                  className="h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-2 text-center"
                >
                  <span className="text-xs font-extrabold text-slate-400">
                    Slot #{slotIdx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Click ❄️ or 🔥 below to fill
                  </span>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="relative h-36 rounded-2xl border-2 border-slate-900 overflow-hidden bg-slate-100 flex flex-col justify-between group shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-10 flex items-center justify-between p-1.5 bg-gradient-to-b from-black/70 to-transparent text-white">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-300">
                    #{slotIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      saveProduct({
                        ...item,
                        [activeTray === 'winter' ? 'isWinter' : 'isPopular']: false,
                      })
                    }
                    className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative z-10 p-1.5 bg-slate-950/80 backdrop-blur-sm text-white">
                  <p className="text-[10px] font-bold truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <button
                      type="button"
                      disabled={slotIdx === 0}
                      onClick={() =>
                        reorderFeaturedProduct(item.id, activeTray, 'left')
                      }
                      className="p-0.5 rounded bg-white/15 hover:bg-white/30 disabled:opacity-25"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="text-[9px] font-extrabold text-amber-300 underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={slotIdx >= trayProducts.length - 1}
                      onClick={() =>
                        reorderFeaturedProduct(item.id, activeTray, 'right')
                      }
                      className="p-0.5 rounded bg-white/15 hover:bg-white/30 disabled:opacity-25"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category & Custom-Shape Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterCat('all')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
            filterCat === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
          }`}
        >
          All ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCat('custom-shape')}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
            filterCat === 'custom-shape'
              ? 'bg-[#FFCA3A] text-slate-900 shadow-[0_2px_0_#1E1E24]'
              : 'bg-amber-50 text-slate-900'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          Custom-Shaped Pillows ({customShapeProducts.length})
        </button>

        {unlinkedCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterCat('unlinked')}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
              filterCat === 'unlinked'
                ? 'bg-rose-600 text-white'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Print Link ({unlinkedCount})
          </button>
        )}

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCat(cat.id)}
            style={
              filterCat === cat.id
                ? { backgroundColor: cat.color, color: cat.textColor }
                : {}
            }
            className={`px-3.5 py-2 rounded-full text-xs font-extrabold border-2 border-slate-900 ${
              filterCat === cat.id
                ? 'shadow-[0_2px_0_#1E1E24]'
                : 'bg-white text-slate-700'
            }`}
          >
            {cat.shortName} ({products.filter((p) => p.categoryId === cat.id).length})
          </button>
        ))}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleSaveForm}
            className="bg-white rounded-3xl border-4 border-slate-900 shadow-[0_12px_0_#1E1E24] max-w-3xl w-full p-5 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div>
                <h3 className="font-display text-2xl font-bold">
                  {products.some((p) => p.id === editingItem.id)
                    ? `Edit Product: ${editingItem.name}`
                    : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Choose Square vs. Custom-Shaped Cutout, upload photos, and link the transparent PNG print.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 border-2 border-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PILLOW CUT STYLE SELECTOR (Square vs Custom-Shaped Cutout) */}
            {editingItem.categoryId === 'printed-pillows' && (
              <div className="p-4 rounded-2xl bg-slate-100 border-2 border-slate-900 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  Pillow Cut & Shape Style
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem((prev) => ({
                        ...prev,
                        isCustomShape: false,
                        productType: 'pillow',
                        subtitle:
                          prev.subtitle === '18" Custom-Shaped Contour Pillow'
                            ? '16" × 16" Signature Cozy Edition'
                            : prev.subtitle,
                      }))
                    }
                    className={`p-3 rounded-xl border-2 text-left font-extrabold text-xs transition-all ${
                      !editingItem.isCustomShape
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    ⬜ Standard Square / Lumbar Pillow
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                      Opens the 5-layout Square Customizer (Centered, Checkered, Chaotic)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem((prev) => ({
                        ...prev,
                        isCustomShape: true,
                        customizable: true,
                        productType: 'custom-shape',
                        subtitle: '18" Custom-Shaped Contour Pillow',
                        badge: prev.badge === 'New Arrival' ? 'Custom Shape' : prev.badge,
                      }))
                    }
                    className={`p-3 rounded-xl border-2 text-left font-extrabold text-xs transition-all ${
                      editingItem.isCustomShape
                        ? 'bg-[#FFCA3A] text-slate-900 border-slate-900 shadow'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    ✂️ Custom-Shaped Cutout Pillow
                    <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                      Contour-cut around the graphic! Opens the Cutout Size & Seam Studio
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 1. PRODUCT PHOTOS & PRIMARY SELECTOR */}
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border-2 border-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#FF595E]" />
                    1. Product Photos & Primary Photo Selector
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Click any photo below to make it the <strong>★ Primary Photo</strong> shown on the storefront.
                  </span>
                </div>

                <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1982C4] hover:bg-[#146ca3] text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>
                    {isUploadingPhoto ? 'Uploading...' : 'Upload Product Photo(s)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductPhotosUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {editingItem.images && editingItem.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {editingItem.images.map((imgUrl, idx) => {
                    const isPrimary = editingItem.image === imgUrl;
                    return (
                      <div
                        key={`${imgUrl}-${idx}`}
                        onClick={() => handleSetPrimaryPhoto(imgUrl)}
                        className={`relative group rounded-2xl overflow-hidden border-3 cursor-pointer transition-all bg-white ${
                          isPrimary
                            ? 'border-[#FF595E] ring-4 ring-[#FF595E]/30 shadow-md'
                            : 'border-slate-300 hover:border-slate-900'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Product view ${idx + 1}`}
                          className="w-full h-28 object-cover"
                        />
                        <div
                          className={`px-2 py-1 text-[10px] font-extrabold flex items-center justify-center gap-1 ${
                            isPrimary
                              ? 'bg-[#FF595E] text-white'
                              : 'bg-slate-900/80 text-slate-200 group-hover:bg-slate-900'
                          }`}
                        >
                          <Star
                            className={`w-3 h-3 ${
                              isPrimary ? 'fill-amber-300 text-amber-300' : ''
                            }`}
                          />
                          <span>{isPrimary ? 'Primary Photo' : 'Set as Primary'}</span>
                        </div>

                        {editingItem.images.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhotoFromGallery(imgUrl);
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No photos added yet. Upload a photo or pick one from your public folder below.
                </p>
              )}

              {localFolderFiles.length > 0 && (
                <div className="pt-2 border-t border-amber-200/80">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    Or click to add photos from <code className="font-mono">public/images/{folderMap[editingItem.categoryId]}</code>:
                  </span>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                    {localFolderFiles.map((fUrl) => {
                      const isPrimary = editingItem.image === fUrl;
                      return (
                        <button
                          key={fUrl}
                          type="button"
                          onClick={() => handleAddFolderPhotoToGallery(fUrl)}
                          className={`w-12 h-12 rounded-xl border-2 overflow-hidden shrink-0 transition-transform ${
                            isPrimary
                              ? 'border-[#FF595E] scale-105 ring-2 ring-[#FF595E]'
                              : 'border-slate-300 hover:border-slate-900'
                          }`}
                        >
                          <img src={fUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. ASSIGN TRANSPARENT PNG PRINT */}
            <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50/90 border-2 border-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem.customizable)}
                      onChange={(e) =>
                        setEditingItem((p) => ({ ...p, customizable: e.target.checked }))
                      }
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <Wand2 className="w-4 h-4 text-indigo-600" />
                    <span>
                      2. Enable "Customize this" & Assign Transparent PNG Print
                    </span>
                  </label>
                </div>

                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isUploadingPrint ? 'Uploading PNG...' : 'Upload New Transparent PNG'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/webp"
                    onChange={handleUploadNewTransparentPrint}
                    className="hidden"
                  />
                </label>
              </div>

              {editingItem.customizable && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1.5 bg-white/80 rounded-2xl border border-indigo-200">
                  {allAvailablePrints.map((p) => {
                    const isAssigned =
                      editingItem.assignedPrintUrl === p.pngPath ||
                      (editingItem.printId && editingItem.printId === p.id);
                    return (
                      <button
                        key={p.id + p.pngPath}
                        type="button"
                        onClick={() =>
                          setEditingItem((prev) => ({
                            ...prev,
                            printId: p.id,
                            assignedPrintUrl: p.pngPath,
                          }))
                        }
                        className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                          isAssigned
                            ? 'bg-amber-200 border-slate-900 ring-2 ring-indigo-600 scale-105 shadow'
                            : 'bg-white border-slate-200 hover:border-slate-900'
                        }`}
                      >
                        <img
                          src={p.pngPath}
                          onError={(e) => {
                            if (p.fallbackPath) e.currentTarget.src = p.fallbackPath;
                          }}
                          alt={p.name}
                          className="w-11 h-11 object-contain"
                        />
                        <span className="text-[10px] font-bold truncate w-full text-center mt-1 text-slate-800">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. PRODUCT DETAILS & PRICING */}
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
                      customizable:
                        catId === 'printed-pillows' || catId === 'printed-blankets'
                          ? true
                          : prev.customizable,
                      productType:
                        catId === 'printed-blankets'
                          ? 'blanket'
                          : prev.isCustomShape
                          ? 'custom-shape'
                          : 'pillow',
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
                  onChange={(e) =>
                    setEditingItem((p) => ({ ...p, badge: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setEditingItem((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
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
                  onChange={(e) =>
                    setEditingItem((p) => ({ ...p, price: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Internal Unit Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.unitCost}
                  onChange={(e) =>
                    setEditingItem((p) => ({ ...p, unitCost: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
                  Description (Shown in Expanded Full-Photo View)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-slate-200">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-1.5 text-xs font-extrabold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.inStock}
                    onChange={(e) =>
                      setEditingItem((p) => ({ ...p, inStock: e.target.checked }))
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>In Stock</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isWinter)}
                    onChange={(e) =>
                      setEditingItem((p) => ({ ...p, isWinter: e.target.checked }))
                    }
                    className="w-4 h-4 accent-sky-600"
                  />
                  <span>❄️ Winter Collection</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isPopular)}
                    onChange={(e) =>
                      setEditingItem((p) => ({ ...p, isPopular: e.target.checked }))
                    }
                    className="w-4 h-4 accent-rose-600"
                  />
                  <span>🔥 Most Popular</span>
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#8AC926] hover:bg-lime-500 text-slate-900 font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Product Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleProducts.map((item) => {
          const profit = (item.price - (item.unitCost || item.price * 0.42)).toFixed(2);
          const assignedPrint = allAvailablePrints.find(
            (p) => p.pngPath === item.assignedPrintUrl || p.id === item.printId
          );
          const isShape = Boolean(item.isCustomShape || item.productType === 'custom-shape');

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border-3 border-slate-900 p-4 shadow-[0_6px_0_#1E1E24] flex flex-col justify-between gap-3"
            >
              <div className="flex gap-4 items-center">
                <div className="relative shrink-0">
                  <img
                    src={item.image}
                    onError={(e) => {
                      e.currentTarget.src =
                        item.fallbackImage || '/icons/printed-pillow.svg';
                    }}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border-2 border-slate-900"
                  />
                  {item.images?.length > 1 && (
                    <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[9px] font-extrabold">
                      {item.images.length} photos
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.inStock
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.inStock ? 'In Stock' : 'Sold Out'}
                    </span>

                    {isShape && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-slate-900">
                        ✂️ Custom Shape
                      </span>
                    )}

                    {item.customizable &&
                      (assignedPrint ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 truncate max-w-[140px]">
                          🎨 {assignedPrint.name}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 hover:bg-amber-300 text-amber-950"
                        >
                          ⚠️ Link Print PNG
                        </button>
                      ))}
                  </div>

                  <h4 className="font-display font-bold text-base truncate mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-xs font-extrabold text-slate-800">
                    ${Number(item.price).toFixed(2)}{' '}
                    <span className="text-emerald-600 font-bold text-[11px]">
                      (+${profit} profit)
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => saveProduct({ ...item, isWinter: !item.isWinter })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors ${
                      item.isWinter
                        ? 'bg-sky-500 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    ❄️ Winter
                  </button>
                  <button
                    type="button"
                    onClick={() => saveProduct({ ...item, isPopular: !item.isPopular })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors ${
                      item.isPopular
                        ? 'bg-amber-400 text-slate-900 border-slate-900'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    🔥 Popular
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
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
