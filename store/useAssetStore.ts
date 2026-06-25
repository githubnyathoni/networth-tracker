import { create } from 'zustand';

export type AssetCategory = 'cash' | 'stock' | 'crypto' | 'reksadana';

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;          // display name, e.g. "BCA Tabungan" / "BBCA" / "Bitcoin"
  ticker: string;        // symbol used to fetch price, e.g. "BBCA.JK" / "bitcoin" / ""
  institution: string;   // bank/broker/exchange name
  // For stocks: quantity in lots; for crypto: coin amount; for cash/reksadana: IDR value
  quantity: number;
  buyPrice: number;      // IDR per unit at time of purchase (0 for cash)
  manualValue?: number;  // override for cash category (IDR)
  currentPrice: number;  // fetched live, IDR
  lastUpdated: string;   // ISO timestamp
  logoUrl?: string;      // remote image URL for the asset icon
}

interface AssetStore {
  assets: Asset[];
  usdToIdr: number;
  addAsset: (asset: Omit<Asset, 'id' | 'currentPrice' | 'lastUpdated'>) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  setPrice: (ticker: string, priceIdr: number) => void;
  setUsdToIdr: (rate: number) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const API = (): string =>
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000';

function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API()}${path}`, options).catch(() => null);
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  usdToIdr: 15800,

  addAsset: (asset) => {
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString(),
      currentPrice: asset.buyPrice,
      lastUpdated: new Date().toISOString(),
    };
    set((s) => ({ assets: [...s.assets, newAsset] }));
    apiFetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset),
    });
  },

  updateAsset: (id, patch) => {
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    const updated = get().assets.find((a) => a.id === id);
    if (updated) {
      apiFetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    }
  },

  deleteAsset: (id) => {
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }));
    apiFetch(`/api/assets/${id}`, { method: 'DELETE' });
  },

  setPrice: (ticker, priceIdr) => {
    set((s) => ({
      assets: s.assets.map((a) =>
        a.ticker === ticker
          ? { ...a, currentPrice: priceIdr, lastUpdated: new Date().toISOString() }
          : a
      ),
    }));
    // Persist updated price for all matching assets
    for (const asset of get().assets.filter((a) => a.ticker === ticker)) {
      apiFetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
    }
  },

  setUsdToIdr: (rate) => {
    set({ usdToIdr: rate });
    apiFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'usd_to_idr', value: rate }),
    });
  },

  loadFromStorage: async () => {
    try {
      const [assetsRes, settingsRes] = await Promise.all([
        apiFetch('/api/assets'),
        apiFetch('/api/settings'),
      ]);
      if (assetsRes?.ok) {
        const assets: Asset[] = await assetsRes.json();
        set({ assets });
      }
      if (settingsRes?.ok) {
        const settings: Record<string, string> = await settingsRes.json();
        if (settings.usd_to_idr) set({ usdToIdr: parseFloat(settings.usd_to_idr) });
      }
    } catch (_) {}
  },

  // No-op: each mutation calls the API directly
  saveToStorage: async () => {},
}));

// Derived selectors
export const selectTotalIdr = (assets: Asset[]) =>
  assets.reduce((sum, a) => {
    if (a.category === 'cash') return sum + (a.manualValue ?? 0);
    if (a.category === 'stock') return sum + a.quantity * 100 * a.currentPrice;
    return sum + a.quantity * a.currentPrice;
  }, 0);

export const selectByCategory = (assets: Asset[], cat: AssetCategory) =>
  assets.filter((a) => a.category === cat);

export const selectCategoryTotal = (assets: Asset[], cat: AssetCategory) =>
  selectTotalIdr(selectByCategory(assets, cat));
