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

const STORAGE_KEY = 'oddly_cozy_store_v1';

function enrichDefaultProducts(products) {
  return products.map((p) => ({
    ...p,
    inStock: p.inStock !== undefined ? p.inStock : true,
    unitCost: p.unitCost !== undefined ? p.unitCost : Number((p.price * 0.42).toFixed(2)),
    fulfillmentRoute:
      p.fulfillmentRoute ||
      (p.customizable || p.categoryId === 'rugs' || p.categoryId === 'matching-sets'
        ? 'Printify POD'
        : 'Plush/Blanket Supplier'),
  }));
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

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cms) setCms((prev) => ({ ...prev, ...parsed.cms }));
        if (parsed.categories?.length) setCategories(parsed.categories);
        if (parsed.products?.length) setProducts(parsed.products);
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

  // Optional real-time subscription if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeToCloudStore('mainStore', (data) => {
      if (data.cms) setCms(data.cms);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.prints) setPrints(data.prints);
      if (data.pillowSizes) setPillowSizes(data.pillowSizes);
      if (data.blanketSizes) setBlanketSizes(data.blanketSizes);
      if (data.orders) setOrders(data.orders);
      if (data.customProofs) setCustomProofs(data.customProofs);
      if (data.promoCodes) setPromoCodes(data.promoCodes);
    });
    return () => unsub();
  }, []);

  // Persist changes to localStorage & Firebase
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
