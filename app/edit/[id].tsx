import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAssetStore, AssetCategory } from '../../store/useAssetStore';
import { fetchStockPriceIdr, fetchCryptoMarketData, fetchReksadanaNAV, getStockLogoUrl } from '../../services/priceService';
import { colors, radius } from '../../constants/theme';
import { formatIdrFull } from '../../utils/format';

const CATS: { key: AssetCategory; label: string; icon: string }[] = [
  { key: 'cash',      label: 'Kas',        icon: '🏦' },
  { key: 'stock',     label: 'Saham',      icon: '📈' },
  { key: 'crypto',    label: 'Kripto',     icon: '₿' },
  { key: 'reksadana', label: 'Reksa Dana', icon: '📄' },
];

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana',
  ADA: 'cardano', DOGE: 'dogecoin', XRP: 'ripple', USDT: 'tether',
};

export default function EditScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id: string; returnTo?: string }>();
  const asset = useAssetStore((s) => s.assets.find((a) => a.id === id));
  const updateAsset = useAssetStore((s) => s.updateAsset);
  const deleteAsset = useAssetStore((s) => s.deleteAsset);
  const usdToIdr = useAssetStore((s) => s.usdToIdr);

  const [category, setCategory] = useState<AssetCategory>(asset?.category ?? 'stock');
  const [name, setName] = useState(asset?.name ?? '');
  const [ticker, setTicker] = useState(asset?.ticker ?? '');
  const [institution, setInstitution] = useState(asset?.institution ?? '');
  const [quantity, setQuantity] = useState(asset?.quantity ? String(asset.quantity) : '');
  const [buyPrice, setBuyPrice] = useState(asset?.buyPrice ? String(asset.buyPrice) : '');
  const [manualValue, setManualValue] = useState(asset?.manualValue ? String(asset.manualValue) : '');
  const [livePrice, setLivePrice] = useState<number | null>(asset?.currentPrice ?? null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(asset?.logoUrl);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setCategory(asset.category);
    setName(asset.name);
    setTicker(asset.ticker);
    setInstitution(asset.institution);
    setQuantity(asset.quantity ? String(asset.quantity) : '');
    setBuyPrice(asset.buyPrice ? String(asset.buyPrice) : '');
    setManualValue(asset.manualValue ? String(asset.manualValue) : '');
    setLivePrice(asset.currentPrice ?? null);
    setLogoUrl(asset.logoUrl);
  }, [id]);

  if (!asset) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Aset tidak ditemukan.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  async function fetchLivePrice() {
    if (!ticker) return;
    setFetching(true);
    try {
      if (category === 'stock') {
        const p = await fetchStockPriceIdr(ticker, usdToIdr);
        setLivePrice(p);
        setLogoUrl(getStockLogoUrl(ticker));
      } else if (category === 'crypto') {
        const coinId = CRYPTO_IDS[ticker.toUpperCase()] ?? ticker.toLowerCase();
        const data = await fetchCryptoMarketData([coinId]);
        if (data[coinId]) {
          setLivePrice(data[coinId].price);
          setLogoUrl(data[coinId].image);
        }
      } else if (category === 'reksadana') {
        const nav = await fetchReksadanaNAV(ticker);
        setLivePrice(nav);
      }
    } finally {
      setFetching(false);
    }
  }

  function computedValue(): number {
    if (category === 'cash') return parseFloat(manualValue.replace(/\D/g, '')) || 0;
    const qty = parseFloat(quantity) || 0;
    const price = (livePrice ?? parseFloat(buyPrice.replace(/\D/g, ''))) || 0;
    if (category === 'stock') return qty * 100 * price;
    return qty * price;
  }

  function handleSave() {
    if (!name) return Alert.alert('Nama aset wajib diisi');
    if (category === 'cash' && !manualValue) return Alert.alert('Masukkan saldo');
    if (category !== 'cash' && !quantity) return Alert.alert('Masukkan jumlah');

    const cryptoId = category === 'crypto'
      ? (CRYPTO_IDS[ticker.toUpperCase()] ?? ticker.toLowerCase())
      : ticker;

    updateAsset(id!, {
      category,
      name,
      ticker: cryptoId,
      institution,
      quantity: parseFloat(quantity) || 0,
      buyPrice: parseFloat(buyPrice.replace(/\D/g, '')) || livePrice || 0,
      manualValue: category === 'cash' ? parseFloat(manualValue.replace(/\D/g, '')) : undefined,
      ...(livePrice !== null ? { currentPrice: livePrice } : {}),
      ...(logoUrl ? { logoUrl } : {}),
    });

    router.navigate((returnTo as string) || '/');
  }

  function handleDelete() {
    Alert.alert(
      'Hapus aset',
      `Yakin ingin menghapus "${asset.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            deleteAsset(id!);
            router.navigate((returnTo as string) || '/');
          },
        },
      ]
    );
  }

  const val = computedValue();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.navigate((returnTo as string) || '/')} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit aset</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Hapus</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.catRow}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.catChip, category === c.key && styles.catChipActive]}
              onPress={() => { setCategory(c.key); setLivePrice(null); setTicker(''); }}
            >
              <Text style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</Text>
              <Text style={[styles.catChipText, category === c.key && styles.catChipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text style={styles.label}>Nama aset</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. BBCA / Bitcoin / BCA Tabungan"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.textMuted}
        />

        {/* Ticker (not for cash) */}
        {category !== 'cash' && (
          <>
            <Text style={styles.label}>
              {category === 'stock' ? 'Kode saham IDX' : category === 'crypto' ? 'Simbol koin' : 'Kode reksa dana'}
            </Text>
            <View style={styles.tickerRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={category === 'stock' ? 'BBCA' : category === 'crypto' ? 'BTC' : 'kode OJK'}
                value={ticker}
                onChangeText={(t) => { setTicker(t.toUpperCase()); setLivePrice(null); }}
                autoCapitalize="characters"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity style={styles.fetchBtn} onPress={fetchLivePrice} disabled={fetching}>
                <Text style={styles.fetchBtnText}>{fetching ? '...' : 'Cek harga'}</Text>
              </TouchableOpacity>
            </View>

            {livePrice !== null && (
              <View style={styles.pricePreview}>
                <Text style={styles.previewLabel}>Harga live</Text>
                <Text style={styles.previewValue}>{formatIdrFull(livePrice)}</Text>
              </View>
            )}
          </>
        )}

        {/* Institution */}
        <Text style={styles.label}>Bank / Broker / Exchange</Text>
        <TextInput
          style={styles.input}
          placeholder="BCA / Stockbit / Indodax"
          value={institution}
          onChangeText={setInstitution}
          placeholderTextColor={colors.textMuted}
        />

        {/* Quantity / Value */}
        {category === 'cash' ? (
          <>
            <Text style={styles.label}>Saldo (IDR)</Text>
            <TextInput
              style={styles.input}
              placeholder="Rp 0"
              keyboardType="numeric"
              value={manualValue}
              onChangeText={setManualValue}
              placeholderTextColor={colors.textMuted}
            />
          </>
        ) : (
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{category === 'stock' ? 'Jumlah lot' : 'Jumlah unit/koin'}</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="decimal-pad"
                value={quantity}
                onChangeText={setQuantity}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Harga beli (IDR)</Text>
              <TextInput
                style={styles.input}
                placeholder="Rp 0"
                keyboardType="numeric"
                value={buyPrice}
                onChangeText={setBuyPrice}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        )}

        {/* Computed total */}
        {val > 0 && (
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Nilai estimasi</Text>
            <Text style={styles.totalValue}>{formatIdrFull(val)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Simpan perubahan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtnLarge} onPress={handleDelete}>
          <Text style={styles.deleteBtnLargeText}>Hapus aset ini</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 14, color: colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingBottom: 16 },
  closeBtn: { width: 32, height: 32, backgroundColor: colors.bgCard, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  closeIcon: { fontSize: 14, color: colors.textPrimary },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.dnBg, borderRadius: radius.md },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: colors.dn },
  label: { fontSize: 10, color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginHorizontal: 16, marginTop: 2 },
  input: { backgroundColor: colors.bgCard, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 11, fontSize: 13, color: colors.textPrimary, marginHorizontal: 16, marginBottom: 12 },
  catRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  catChip: { flex: 1, backgroundColor: colors.bgCard, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 10, alignItems: 'center' },
  catChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  catChipText: { fontSize: 10, color: colors.textSecondary, fontWeight: '500' },
  catChipTextActive: { color: colors.primary, fontWeight: '600' },
  tickerRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 12 },
  fetchBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, justifyContent: 'center' },
  fetchBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pricePreview: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.upBg, borderRadius: radius.md, padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { fontSize: 11, color: colors.up },
  previewValue: { fontSize: 13, fontWeight: '600', color: colors.up },
  twoCol: { flexDirection: 'row', gap: 8, marginHorizontal: 16 },
  totalBox: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 11, color: colors.primary },
  totalValue: { fontSize: 15, fontWeight: '600', color: colors.primary },
  saveBtn: { marginHorizontal: 16, backgroundColor: colors.primary, borderRadius: radius.lg, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  deleteBtnLarge: { marginHorizontal: 16, backgroundColor: colors.dnBg, borderRadius: radius.lg, padding: 14, alignItems: 'center', marginTop: 10 },
  deleteBtnLargeText: { color: colors.dn, fontSize: 14, fontWeight: '600' },
});
