import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAssetStore, selectTotalIdr, selectCategoryTotal } from '../store/useAssetStore';
import { AssetCard } from '../components/AssetCard';
import { colors, radius } from '../constants/theme';
import { formatIdrFull } from '../utils/format';

const CATS = [
  { key: 'stock' as const,     label: 'Saham IDX',  color: colors.stock },
  { key: 'reksadana' as const, label: 'Reksa Dana', color: colors.reksadana },
  { key: 'cash' as const,      label: 'Kas',        color: colors.cash },
  { key: 'crypto' as const,    label: 'Kripto',     color: colors.crypto },
];

export default function PortfolioScreen() {
  const assets = useAssetStore((s) => s.assets);
  const total = selectTotalIdr(assets);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Portofolio</Text>
          <Text style={styles.updated}>Diperbarui barusan · <Text style={{ color: colors.up }}>Live</Text></Text>
        </View>

        {/* Simple allocation bars instead of SVG donut */}
        <View style={styles.allocCard}>
          <Text style={styles.allocTotal}>{formatIdrFull(total)}</Text>
          <Text style={styles.allocSub}>Total kekayaan bersih</Text>
          <View style={styles.stackBar}>
            {CATS.map((cat) => {
              const val = selectCategoryTotal(assets, cat.key);
              const pct = total > 0 ? (val / total) * 100 : 0;
              return pct > 0 ? (
                <View key={cat.key} style={[styles.stackSegment, { flex: pct, backgroundColor: cat.color }]} />
              ) : null;
            })}
          </View>
          <View style={styles.legendRow}>
            {CATS.map((cat) => {
              const val = selectCategoryTotal(assets, cat.key);
              const pct = total > 0 ? (val / total) * 100 : 0;
              return (
                <View key={cat.key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.legendLabel}>{cat.label}</Text>
                  <Text style={styles.legendPct}>{pct.toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.secRow}>
          <Text style={styles.secTitle}>Semua aset</Text>
        </View>

        {assets.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Belum ada aset. Tap + untuk menambahkan.</Text>
          </View>
        ) : (
          assets.map((a) => (
            <AssetCard key={a.id} asset={a} totalPortfolioIdr={total} showBar onPress={() => router.push({ pathname: '/edit/[id]', params: { id: a.id, returnTo: '/portfolio' } })} />
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
  updated: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  allocCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: colors.border },
  allocTotal: { fontSize: 26, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.5 },
  allocSub: { fontSize: 11, color: colors.textSecondary, marginBottom: 16 },
  stackBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  stackSegment: { height: 8 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: colors.textSecondary },
  legendPct: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },

  secRow: { paddingHorizontal: 16, marginBottom: 10 },
  secTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  empty: { margin: 16, padding: 24, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.textSecondary },
});
