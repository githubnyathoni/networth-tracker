import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAssetStore, selectTotalIdr, selectCategoryTotal } from '../store/useAssetStore';
import { refreshAllPrices } from '../services/refreshPrices';
import { AssetCard } from '../components/AssetCard';
import { colors, radius } from '../constants/theme';
import { formatIdrFull, formatUsd } from '../utils/format';

const CATEGORIES = [
  { key: 'cash' as const,      label: 'Kas / Bank',  icon: '🏦', color: colors.cash,      bg: colors.cashBg },
  { key: 'stock' as const,     label: 'Saham IDX',   icon: '📈', color: colors.stock,     bg: colors.stockBg },
  { key: 'crypto' as const,    label: 'Kripto',      icon: '₿',  color: colors.crypto,    bg: colors.cryptoBg },
  { key: 'reksadana' as const, label: 'Reksa Dana',  icon: '📄', color: colors.reksadana, bg: colors.reksadanaBg },
];

export default function HomeScreen() {
  const assets = useAssetStore((s) => s.assets);
  const usdToIdr = useAssetStore((s) => s.usdToIdr);
  const [refreshing, setRefreshing] = React.useState(false);

  const total = selectTotalIdr(assets);
  const topAssets = [...assets]
    .sort((a, b) => {
      const valA = a.category === 'cash' ? (a.manualValue ?? 0) : a.quantity * a.currentPrice;
      const valB = b.category === 'cash' ? (b.manualValue ?? 0) : b.quantity * b.currentPrice;
      return valB - valA;
    })
    .slice(0, 3);

  async function onRefresh() {
    setRefreshing(true);
    await refreshAllPrices();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetSub}>Selamat datang 👋</Text>
            <Text style={styles.greetName}>Ahmad Fathoni</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AF</Text>
          </View>
        </View>

        {/* Net worth card */}
        <View style={styles.nwCard}>
          <Text style={styles.nwLabel}>Total kekayaan bersih</Text>
          <Text style={styles.nwAmount}>{formatIdrFull(total)}</Text>
          <Text style={styles.nwSub}>{formatUsd(total, usdToIdr)}</Text>
          <View style={styles.nwBadge}>
            <Ionicons name="trending-up" size={13} color="#a8ffda" />
            <Text style={styles.nwBadgeText}>Live · Tarik ke bawah untuk refresh</Text>
          </View>
        </View>

        {/* Category grid */}
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => {
            const val = selectCategoryTotal(assets, cat.key);
            return (
              <View key={cat.key} style={[styles.catCard, { flex: 1 }]}>
                <View style={[styles.catIcon, { backgroundColor: cat.bg }]}>
                  <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                </View>
                <Text style={styles.catName}>{cat.label}</Text>
                <Text style={styles.catValue}>{formatIdrFull(val)}</Text>
              </View>
            );
          })}
        </View>

        {/* Top assets */}
        <View style={styles.secRow}>
          <Text style={styles.secTitle}>Aset teratas</Text>
          <Text style={styles.secLink} onPress={() => router.push('/portfolio')}>Lihat semua</Text>
        </View>
        {topAssets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Belum ada aset. Tap + untuk menambahkan.</Text>
          </View>
        ) : (
          topAssets.map((a) => (
            <AssetCard key={a.id} asset={a} totalPortfolioIdr={total} onPress={() => router.push({ pathname: '/edit/[id]', params: { id: a.id, returnTo: '/' } })} />
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  greetSub: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  greetName: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  nwCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20 },
  nwLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4, letterSpacing: 0.4 },
  nwAmount: { fontSize: 28, fontWeight: '600', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  nwSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
  nwBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  nwBadgeText: { fontSize: 11, color: '#fff' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  catCard: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.border, minWidth: '45%' },
  catIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  catName: { fontSize: 10, color: colors.textSecondary, marginBottom: 2 },
  catValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  secTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  secLink: { fontSize: 12, color: colors.primary },
  emptyWrap: { margin: 16, padding: 24, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});
