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
  INITIAL_PROMO_CODES,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_PROOFS,
} from '../data/initialAdminData';
import {
  isFirebaseConfigured,
  subscribeToCloudStore,
  saveToCloudStore,
} from '../services/firebaseClient';

const StoreContext = createContext(null);

const STORAGE_KEY = 'oddly_cozy_store_v2';

// Default curated IDs for the 8-item Winter Collection and 8-item Most Popular section
const DEFAULT_WINTER_IDS = new Set([
  'ocb-2',           // Fat Knit Cloud Blanket
  'ms-cookies',      // Cookies & Cream Matching Set
  'ms-strawberry',   // Strawberry Matching Set
  'pp-choco-cookies',// Warm Chocolate Chip Cookie Pillow
  'pp-4',
  'ocp-3',           // Giant Croissant Body Pillow
  'ocp-4',           // Boba Tea Plush Pillow
  'pb-4',            // Reese's Puffs / Sweet Crunch Blanket
  'pb-gummy-bears',  // Gummy Bears Blanket
  'ocb-4',           // Belgian Waffle Blanket
]);

const DEFAULT_POPULAR_IDS = new Set([
  'pp-french-fries', // French Fries Pillow
  'ocp-1',           // Cheeseburger Plush
  'ocp-2',           // Jumbo Sushi Plush
  'pb-diet-cola',    // Fizzy Diet Cola Blanket
  'ocb-1',           // Fried Egg Blanket
  'ms-donut',        // Pink Frosted Donut Set
  'ms-pizza',        // Supreme Pizza Set
  'rug-pizza',       // Pepperoni Pizza Rug
]);

function enrichDefaultProducts(products) {
  let winterCount = 0;
  let popularCount = 0;

  return products.map((p, idx) => {
    // Sync button fields if loaded from older cache
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
      isWinter,
      isPopular,
      unitCost: p.unitCost !== undefined ? p.unitCost : Number((p.price * 0.42).toFixed(2)),
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
    return found ? { ...defCat, ...found, buttonBaseName: defCat.buttonBaseName, buttonPng: defCat.buttonPng, buttonFallback: defCat.buttonFallback, onHomePage: defCat.onHomePage } : defCat;
  });
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cms) setCms((prev) => ({ ...prev, ...parsed.cms }));
        if (parsed.categories?.length) setCategories(mergeCategoriesWithButtons(parsed.categories));
        if (parsed.products?.length) setProducts(enrichDefaultProducts(parsed.products));
        if (parsed.prints?.length) setPrints(parsed.prints);
        if (parsed.pillowSizes?.length) setPillowSizes(parsed.pillowSizes);
        if (parsed.blanketSizes?.length) setBlanketSizes(parsed.blanketSizes);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.customProofs) setCustomProofs(parsed.customProofs);
        if (parsed.promoCodes) setPromoCodes(parsed.promoCodes);
      }
    } catch (e) {
      console.error('Failed to load local store state:', e);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeToCloudStore('mainStore', (data) => {
      if (data.cms) setCms((prev) => ({ ...prev, ...data.cms }));
      if (data.categories) setCategories(mergeCategoriesWithButtons(data.categories));
      if (data.products) setProducts(enrichDefaultProducts(data.products));
      if (data.prints) setPrints(data.prints);
      if (data.pillowSizes) setPillowSizes(data.pillowSizes);
      if (data.blanketSizes) setBlanketSizes(data.blanketSizes);
      if (data.orders) setOrders(data.orders);
      if (data.customProofs) setCustomProofs(data.customProofs);
      if (data.promoCodes) setPromoCodes(data.promoCodes);
    });
    return () => unsub();
  }, []);

  const persistState = (nextState) => {
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
      ...nextState,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPayload));
    } catch (e) {
      console.warn('LocalStorage quota warning:', e);
    }
    if (isFirebaseConfigured) {
      saveToCloudStore('mainStore', fullPayload);
    }
  };

  const updateCms = (updates) => {
    const next = { ...cms, ...updates };
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

  const resetToFactoryDefaults = () => {
    localStorage.removeItem(STORAGE_KEY);
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
        resetToFactoryDefaults,
        isFirebaseConfigured,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
