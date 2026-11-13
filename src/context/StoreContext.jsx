import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../config/themeColors';
import {
  PILLOW_SIZES as DEFAULT_PILLOW_SIZES,
  BLANKET_SIZES as DEFAULT_BLANKET_SIZES,
  AVAILABLE_PRINTS as DEFAULT_PRINTS,
} from '../config/printifySpecs';
import { PRODUCTS_DATA as DEFAULT_PRODUCTS } from '../data/productsData';
import {
  INITIAL_CMS_SETTINGS,
  DEFAULT_MASCOT_PITCHES,
  INITIAL_PROMO_CODES,
  INITIAL_HIGH_SCORES,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_PROOFS,
} from '../data/initialAdminData.js';
import {
  isFirebaseConfigured,
  fetchInitialCloudStore,
  subscribeToCloudStore,
  saveToCloudStore,
} from '../services/firebaseClient';

const StoreContext = createContext(null);
const STORAGE_KEY = 'oddly_cozy_store_v2';

const DEFAULT_WINTER_IDS = new Set([
  'ocb-2',
  'ms-cookies',
  'ms-strawberry',
  'pp-choco-cookies',
  'pp-4',
  'ocp-3',
  'ocp-4',
  'pb-4',
  'pb-gummy-bears',
  'ocb-4',
]);

const DEFAULT_POPULAR_IDS = new Set([
  'pp-french-fries',
  'ocp-1',
  'ocp-2',
  'pb-diet-cola',
  'ocb-1',
  'ms-donut',
  'ms-pizza',
  'rug-pizza',
]);

function enrichDefaultProducts(products) {
  let winterCount = 0;
  let popularCount = 0;

  return products.map((p, idx) => {
    let isWinter = p.isWinter;
    if (isWinter === undefined) {
      isWinter = DEFAULT_WINTER_IDS.has(p.id) || (idx % 3 === 0 && winterCount < 8);
    }
    if (isWinter) winterCount++;

    let isPopular = p.isPopular;
    if (isPopular === undefined) {
      isPopular = DEFAULT_POPULAR_IDS.has(p.id) || (idx % 2 === 0 && popularCount < 8);
    }
    if (isPopular) popularCount++;

    return {
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : true,
      isWinter: Boolean(isWinter),
      isPopular: Boolean(isPopular),
      unitCost:
        p.unitCost !== undefined ? Number(p.unitCost) : Number((p.price * 0.42).toFixed(2)),
      fulfillmentRoute:
        p.fulfillmentRoute ||
        (p.customizable || p.categoryId === 'rugs' || p.categoryId === 'matching-sets'
          ? 'Printify POD'
          : 'Plush/Blanket Supplier'),
    };
  });
}

function mergeCategoriesWithButtons(savedCategories) {
  if (!savedCategories?.length) return DEFAULT_CATEGORIES;
  return DEFAULT_CATEGORIES.map((defCat) => {
    const found = savedCategories.find((c) => c.id === defCat.id);
    return found
      ? {
          ...defCat,
          ...found,
          buttonBaseName: found.buttonBaseName || defCat.buttonBaseName,
          buttonPng: found.buttonPng || defCat.buttonPng,
          buttonFallback: found.buttonFallback || defCat.buttonFallback,
          onHomePage: defCat.onHomePage,
        }
      : defCat;
  });
}

function mergeCmsWithDefaults(savedCms) {
  if (!savedCms) return INITIAL_CMS_SETTINGS;
  return {
    ...INITIAL_CMS_SETTINGS,
    ...savedCms,
    mascotPitches: {
      ...DEFAULT_MASCOT_PITCHES,
      ...(savedCms.mascotPitches || {}),
    },
  };
}

export function StoreProvider({ children }) {
  const [cms, setCms] = useState(INITIAL_CMS_SETTINGS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(() => enrichDefaultProducts(DEFAULT_PRODUCTS));
  const [prints, setPrints] = useState(DEFAULT_PRINTS);
  const [pillowSizes, setPillowSizes] = useState(DEFAULT_PILLOW_SIZES);
  const [blanketSizes, setBlanketSizes] = useState(DEFAULT_BLANKET_SIZES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [customProofs, setCustomProofs] = useState(INITIAL_CUSTOM_PROOFS);
  const [promoCodes, setPromoCodes] = useState(INITIAL_PROMO_CODES);
  const [highScores, setHighScores] = useState(INITIAL_HIGH_SCORES);

  const [syncStatus, setSyncStatus] = useState(
    isFirebaseConfigured ? 'Connecting to Firebase...' : 'Local Mode (Missing API Key)'
  );
  const [syncError, setSyncError] = useState(null);

  const applyStoreData = (data) => {
    if (!data) return;
    if (data.cms) setCms(mergeCmsWithDefaults(data.cms));
    if (data.categories?.length) setCategories(mergeCategoriesWithButtons(data.categories));
    if (data.products?.length) setProducts(enrichDefaultProducts(data.products));
    if (data.prints?.length) setPrints(data.prints);
    if (data.pillowSizes?.length) setPillowSizes(data.pillowSizes);
    if (data.blanketSizes?.length) setBlanketSizes(data.blanketSizes);
    if (data.orders) setOrders(data.orders);
    if (data.customProofs) setCustomProofs(data.customProofs);
    if (data.promoCodes) setPromoCodes(data.promoCodes);
    if (data.highScores?.length) setHighScores(data.highScores);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        applyStoreData(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    if (!isFirebaseConfigured) return;

    fetchInitialCloudStore('mainStore')
      .then((cloudData) => {
        if (cloudData) {
          applyStoreData(cloudData);
          setSyncStatus('Synced with Firebase Cloud ✅');
          setSyncError(null);
        } else {
          setSyncStatus('Connected (Ready for first save)');
        }
      })
      .catch((err) => {
        setSyncStatus('Firestore Permission/Connection Error ❌');
        setSyncError(err.code || err.message);
      });

    const unsub = subscribeToCloudStore(
      'mainStore',
      (cloudData) => {
        applyStoreData(cloudData);
        setSyncStatus('Synced with Firebase Cloud ✅');
        setSyncError(null);
      },
      (err) => {
        setSyncStatus('Firestore Blocked ❌');
        setSyncError(err.code || err.message);
      }
    );

    return () => unsub();
  }, []);

  const persistState = async (nextPartialState = {}) => {
    const fullPayload = {
      cms,
      categories,
      products,
      prints,
      pillowSizes,
      blanketSizes,
      orders,
      customProofs,
      promoCodes,
      highScores,
      ...nextPartialState,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPayload));
    } catch (e) {
      console.warn('LocalStorage quota full (using Cloud Firestore instead):', e);
    }

    if (isFirebaseConfigured) {
      setSyncStatus('Saving to Firebase Cloud...');
      const res = await saveToCloudStore('mainStore', fullPayload);
      if (res.ok) {
        setSyncStatus('Saved to Firebase Cloud ✅');
        setSyncError(null);
      } else {
        setSyncStatus('Cloud Save Failed ❌');
        setSyncError(res.reason);
      }
    }
  };

  const forceCloudSync = async () => {
    await persistState({});
  };

  const updateCms = (updates) => {
    const next = mergeCmsWithDefaults({ ...cms, ...updates });
    setCms(next);
    persistState({ cms: next });
  };

  const updateCategory = (catId, updates) => {
    const next = categories.map((c) => (c.id === catId ? { ...c, ...updates } : c));
    setCategories(next);
    persistState({ categories: next });
  };

  const saveProduct = (productData) => {
    const exists = products.some((p) => p.id === productData.id);
    const next = exists
      ? products.map((p) => (p.id === productData.id ? { ...p, ...productData } : p))
      : [productData, ...products];
    setProducts(next);
    persistState({ products: next });
  };

  const deleteProduct = (productId) => {
    const next = products.filter((p) => p.id !== productId);
    setProducts(next);
    persistState({ products: next });
  };

  // Reorders products inside the 8-slot Winter or Most Popular tray
  const reorderFeaturedProduct = (productId, direction, flagKey) => {
    const featuredIndices = [];
    products.forEach((p, idx) => {
      if (p[flagKey]) featuredIndices.push(idx);
    });

    const posInFeatured = featuredIndices.findIndex(
      (prodIdx) => products[prodIdx].id === productId
    );
    if (posInFeatured === -1) return;

    const targetPos = direction === 'left' ? posInFeatured - 1 : posInFeatured + 1;
    if (targetPos < 0 || targetPos >= featuredIndices.length) return;

    const idxA = featuredIndices[posInFeatured];
    const idxB = featuredIndices[targetPos];

    const next = [...products];
    const temp = next[idxA];
    next[idxA] = next[idxB];
    next[idxB] = temp;

    setProducts(next);
    persistState({ products: next });
  };

  const addOrder = (newOrder) => {
    const next = [newOrder, ...orders];
    setOrders(next);
    persistState({ orders: next });
  };

  const updateOrder = (orderId, updates) => {
    const next = orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    setOrders(next);
    persistState({ orders: next });
  };

  const addCustomProof = (proof) => {
    const next = [proof, ...customProofs];
    setCustomProofs(next);
    persistState({ customProofs: next });
  };

  const updateCustomProof = (proofId, updates) => {
    const next = customProofs.map((p) => (p.id === proofId ? { ...p, ...updates } : p));
    setCustomProofs(next);
    persistState({ customProofs: next });
  };

  const savePrintsList = (nextPrints) => {
    setPrints(nextPrints);
    persistState({ prints: nextPrints });
  };

  const saveSizePricing = (type, nextSizes) => {
    if (type === 'pillow') {
      setPillowSizes(nextSizes);
      persistState({ pillowSizes: nextSizes });
    } else {
      setBlanketSizes(nextSizes);
      persistState({ blanketSizes: nextSizes });
    }
  };

  const savePromoCodes = (nextCodes) => {
    setPromoCodes(nextCodes);
    persistState({ promoCodes: nextCodes });
  };

  const addHighScore = (newEntry) => {
    const cleanName = (newEntry.name || 'COZY_PAL')
      .toUpperCase()
      .replace(/[^A-Z0-9_ -]/g, '')
      .slice(0, 12);
    const entry = {
      id: `hs-${Date.now()}`,
      name: cleanName || 'COZY_PAL',
      score: Math.round(newEntry.score || 0),
      survivalSec: Math.round(newEntry.survivalSec || 0),
      date: new Date().toISOString().split('T')[0],
    };
    const next = [...highScores, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
    setHighScores(next);
    persistState({ highScores: next });
  };

  const deleteHighScore = (scoreId) => {
    const next = highScores.filter((h) => h.id !== scoreId);
    setHighScores(next);
    persistState({ highScores: next });
  };

  const resetHighScores = () => {
    setHighScores(INITIAL_HIGH_SCORES);
    persistState({ highScores: INITIAL_HIGH_SCORES });
  };

  const importBackupData = async (parsedData) => {
    applyStoreData(parsedData);
    await persistState(parsedData);
  };

  const resetToFactoryDefaults = async () => {
    localStorage.removeItem(STORAGE_KEY);
    if (isFirebaseConfigured) {
      await saveToCloudStore('mainStore', {
        cms: INITIAL_CMS_SETTINGS,
        categories: DEFAULT_CATEGORIES,
        products: enrichDefaultProducts(DEFAULT_PRODUCTS),
        prints: DEFAULT_PRINTS,
        pillowSizes: DEFAULT_PILLOW_SIZES,
        blanketSizes: DEFAULT_BLANKET_SIZES,
        orders: INITIAL_ORDERS,
        customProofs: INITIAL_CUSTOM_PROOFS,
        promoCodes: INITIAL_PROMO_CODES,
        highScores: INITIAL_HIGH_SCORES,
      });
    }
    window.location.reload();
  };

  return (
    <StoreContext.Provider
      value={{
        cms,
        updateCms,
        categories,
        updateCategory,
        products,
        saveProduct,
        deleteProduct,
        reorderFeaturedProduct,
        prints,
        savePrintsList,
        pillowSizes,
        blanketSizes,
        saveSizePricing,
        orders,
        addOrder,
        updateOrder,
        customProofs,
        addCustomProof,
        updateCustomProof,
        promoCodes,
        savePromoCodes,
        highScores,
        addHighScore,
        deleteHighScore,
        resetHighScores,
        forceCloudSync,
        importBackupData,
        resetToFactoryDefaults,
        isFirebaseConfigured,
        syncStatus,
        syncError,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
