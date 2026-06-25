import { useAssetStore } from '../store/useAssetStore';
import {
  fetchStockPriceIdr,
  fetchCryptoPricesIdr,
  fetchReksadanaNAV,
  fetchUsdToIdr,
} from './priceService';

export async function refreshAllPrices() {
  const { assets, usdToIdr, setPrice, setUsdToIdr } = useAssetStore.getState();

  // 1. Update USD/IDR rate
  const rate = await fetchUsdToIdr();
  if (rate) setUsdToIdr(rate);
  const effectiveRate = rate ?? usdToIdr;

  // 2. Fetch IDX stock prices
  const stockAssets = assets.filter((a) => a.category === 'stock' && a.ticker);
  await Promise.all(
    stockAssets.map(async (a) => {
      const price = await fetchStockPriceIdr(a.ticker, effectiveRate);
      if (price) setPrice(a.ticker, price);
    })
  );

  // 3. Fetch crypto prices (batch)
  const cryptoAssets = assets.filter((a) => a.category === 'crypto' && a.ticker);
  if (cryptoAssets.length > 0) {
    const tickers = [...new Set(cryptoAssets.map((a) => a.ticker))];
    const prices = await fetchCryptoPricesIdr(tickers);
    for (const [ticker, price] of Object.entries(prices)) {
      setPrice(ticker, price);
    }
  }

  // 4. Fetch reksa dana NAV
  const rdAssets = assets.filter((a) => a.category === 'reksadana' && a.ticker);
  await Promise.all(
    rdAssets.map(async (a) => {
      const nav = await fetchReksadanaNAV(a.ticker);
      if (nav) setPrice(a.ticker, nav);
    })
  );
}
