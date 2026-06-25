import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssetStore, selectTotalIdr, selectCategoryTotal } from '../store/useAssetStore';
import { colors, radius } from '../constants/theme';
import { formatIdr } from '../utils/format';

// Snapshot history — in a real app these would be stored daily to AsyncStorage
// For now we show current values and a placeholder chart
const PERIODS = ['1M', '3M', '6M', '1T', 'Semua'];

const CATS = [
  { key: 'stock' as const,     label: 'Saham IDX',  color: colors.stock },
  { key: 'reksadana' as const, label: 'Reksa Dana', color: colors.reksadana },
  { key: 'cash' as const,      label: 'Kas',        color: colors.cash },
  { key: 'crypto' as const,    label: 'Kripto',     color: colors.crypto },
];

export default function HistoryScreen() {
  const assets = useAssetStore((s) => s.assets);
  const [period, setPeriod] = useState('3M');
  const total = selectTotalIdr(assets);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Riwayat</Text>
        </View>

        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Total kekayaan bersih</Text>
          <Text style={styles.totalValue}>{formatIdr(total)}</Text>
          <Text style={styles.totalSub}>Data historis akan terkumpul otomatis setiap hari</Text>
        </View>

        {/* Period tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabsContent}>
          {PERIODS.map((p) => (
            <TouchableOpacity key={p} style={[styles.tab, period === p && styles.tabActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Placeholder chart area */}
        <View style={styles.chartCard}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>📊</Text>
            <Text style={styles.chartPlaceholderSub}>Grafik akan tampil setelah data harian terkumpul</Text>
          </View>
        </View>

        {/* Category breakdown */}
        <Text style={styles.breakdownTitle}>Nilai per kategori</Text>
        <View style={styles.breakdownCard}>
          {CATS.map((cat, i) => {
            const val = selectCategoryTotal(assets, cat.key);
            return (
              <View key={cat.key} style={[styles.breakdownRow, i < CATS.length - 1 && styles.breakdownBorder]}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.breakdownCat}>{cat.label}</Text>
                </View>
                <Text style={styles.breakdownVal}>{formatIdr(val)}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },

  totalBlock: { paddingHorizontal: 16, marginBottom: 16 },
  totalLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  totalValue: { fontSize: 26, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 2 },
  totalSub: { fontSize: 11, color: colors.textMuted },

  tabsWrap: { marginBottom: 12 },
  tabsContent: { paddingHorizontal: 16, gap: 6 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  chartCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  chartPlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center', gap: 8 },
  chartPlaceholderText: { fontSize: 32 },
  chartPlaceholderSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },

  breakdownTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, paddingHorizontal: 16, marginBottom: 8 },
  breakdownCard: { marginHorizontal: 16, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  breakdownBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownCat: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  breakdownVal: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
});
