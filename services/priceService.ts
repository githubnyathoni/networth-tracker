import axios from 'axios';
import { Platform } from 'react-native';

const COINGECKO = 'https://api.coingecko.com/api/v3';
const EXCHANGE_RATE = 'https://api.exchangerate-api.com/v4/latest/USD';

const YAHOO_DIRECT = 'https://query1.finance.yahoo.com/v8/finance/chart';

// On web the Express server serves both the static app and the API on the
// same origin, so relative URLs work in production without any env var.
// In dev (Expo on :8081, Express on :3000) set EXPO_PUBLIC_API_URL=http://localhost:3000.
const API_BASE = (): string => {
  const env = (typeof process !== 'undefined' && (process.env as any)?.EXPO_PUBLIC_API_URL) || '';
  if (env) return env;
  if (typeof window !== 'undefined') return ''; // web production: same origin
  return 'http://localhost:3000'; // native dev fallback
};

const IDX_DOMAINS: Record<string, string> = {
  BBCA: 'bca.co.id',
  BBRI: 'bri.co.id',
  BMRI: 'bankmandiri.co.id',
  BBNI: 'bni.co.id',
  BBTN: 'btn.co.id',
  BRIS: 'bankbsi.co.id',
  BJBR: 'bankbjb.co.id',
  MEGA: 'bankmega.com',
  BTPS: 'bankbtpn.co.id',
  TLKM: 'telkom.co.id',
  EXCL: 'xl.co.id',
  ISAT: 'indosatooredoo.id',
  MTEL: 'mitratel.co.id',
  TOWR: 'towerbersama.com',
  ASII: 'astra.co.id',
  GOTO: 'gotogroup.com',
  UNVR: 'unilever.co.id',
  INDF: 'indofood.com',
  ICBP: 'indofoodcbp.co.id',
  KLBF: 'kalbefarma.com',
  CPIN: 'charoenpokhpand.co.id',
  JPFA: 'japfacomfeed.co.id',
  GGRM: 'gudanggaramtbk.com',
  HMSP: 'sampoerna.com',
  SMGR: 'semenindonesia.com',
  INTP: 'indocement.co.id',
  ADMF: 'adira.co.id',
  ACES: 'acehardware.co.id',
  AMRT: 'alfamidi.co.id',
  MAPI: 'map.co.id',
  LPPF: 'matahari.com',
  RALS: 'ramayana.co.id',
  EMTK: 'emtek.co.id',
  MNCN: 'mncgroup.com',
  SCMA: 'surya-citra.com',
  ANTM: 'antam.com',
  TINS: 'timah.com',
  INCO: 'vale.com',
  ADRO: 'adaro.com',
  PTBA: 'bukit-asam.co.id',
  ITMG: 'itmg.co.id',
  HRUM: 'harum-energy.com',
  BYAN: 'bayanresources.com',
  MEDC: 'medcoenergi.com',
  PGAS: 'pgn.co.id',
  PTPP: 'ptpp.co.id',
  WIKA: 'wika.co.id',
  WSKT: 'waskita.co.id',
  INKP: 'asiapulppaper.com',
  SMBR: 'semenibubaru.com',
  PWON: 'pakuwon.com',
  BSDE: 'bsdcity.com',
  SMRA: 'summarecon.com',
  CTRA: 'ciputra.com',
  ELSA: 'elnusa.co.id',
  AKRA: 'akr.co.id',
  SIDO: 'sidomuncul.co.id',
  MYOR: 'mayora.co.id',
  ULTJ: 'ultrajaya.co.id',
  UNTR: 'unitedtractors.com',
};

export function getStockLogoUrl(ticker: string): string | undefined {
  const domain = IDX_DOMAINS[ticker.toUpperCase().replace('.JK', '')];
  if (!domain) return undefined;
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
}

export async function fetchStockPriceIdr(ticker: string, _usdToIdr: number): Promise<number | null> {
  try {
    if (Platform.OS === 'web') {
      // On web, route through our own Express server to avoid CORS restrictions
      const { data } = await axios.get(`${API_BASE()}/api/price/stock/${ticker}`, { timeout: 8000 });
      return data.price ?? null;
    }
    // On native, call Yahoo Finance directly
    const symbol = ticker.includes('.') ? ticker : `${ticker}.JK`;
    const { data } = await axios.get(`${YAHOO_DIRECT}/${symbol}`, {
      params: { interval: '1d', range: '1d' },
      timeout: 8000,
    });
    return data.chart.result[0].meta.regularMarketPrice;
  } catch {
    return null;
  }
}

export async function fetchCryptoPricesIdr(coinIds: string[]): Promise<Record<string, number>> {
  try {
    const { data } = await axios.get(`${COINGECKO}/simple/price`, {
      params: {
        ids: coinIds.join(','),
        vs_currencies: 'idr',
      },
      timeout: 8000,
    });
    const result: Record<string, number> = {};
    for (const id of coinIds) {
      if (data[id]?.idr) result[id] = data[id].idr;
    }
    return result;
  } catch {
    return {};
  }
}

export async function fetchCryptoMarketData(
  coinIds: string[]
): Promise<Record<string, { price: number; image: string }>> {
  try {
    const { data } = await axios.get(`${COINGECKO}/coins/markets`, {
      params: {
        ids: coinIds.join(','),
        vs_currency: 'idr',
        per_page: 100,
      },
      timeout: 8000,
    });
    const result: Record<string, { price: number; image: string }> = {};
    for (const coin of data) {
      result[coin.id] = { price: coin.current_price, image: coin.image };
    }
    return result;
  } catch {
    return {};
  }
}

export async function fetchUsdToIdr(): Promise<number | null> {
  try {
    const { data } = await axios.get(EXCHANGE_RATE, { timeout: 8000 });
    return data.rates?.IDR ?? null;
  } catch {
    return null;
  }
}

// OJK NAV — daily update, scrape from public endpoint
// Returns NAV per unit in IDR for a given fund code
export async function fetchReksadanaNAV(fundCode: string): Promise<number | null> {
  try {
    const { data } = await axios.get(
      `https://data.ojk.go.id/api/reksa-dana/${fundCode}/nav`,
      { timeout: 10000 }
    );
    return data?.nav ?? null;
  } catch {
    // OJK API is unreliable — fall back to null, user updates manually
    return null;
  }
}
