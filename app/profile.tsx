import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssetStore, selectTotalIdr } from '../store/useAssetStore';
import { colors, radius } from '../constants/theme';
import { formatIdr } from '../utils/format';

const API_INTEGRATIONS = [
  { label: 'Saham IDX',   source: 'Yahoo Finance', color: colors.stock,     bg: colors.stockBg,     status: true },
  { label: 'Kripto',      source: 'CoinGecko',     color: colors.crypto,    bg: colors.cryptoBg,    status: true },
  { label: 'Reksa Dana',  source: 'OJK NAV',       color: colors.reksadana, bg: colors.reksadanaBg, status: true },
  { label: 'Kurs USD/IDR',source: 'ExchangeRate',  color: colors.cash,      bg: colors.cashBg,      status: true },
];

export default function ProfileScreen() {
  const assets = useAssetStore((s) => s.assets);
  const usdToIdr = useAssetStore((s) => s.usdToIdr);
  const total = selectTotalIdr(assets);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.editLink}>Edit</Text>
        </View>

        {/* Avatar + info */}
        <View style={styles.profileBlock}>
          <View style={styles.avatar}><Text style={styles.avatarText}>AF</Text></View>
          <Text style={styles.name}>Ahmad Fathoni</Text>
          <Text style={styles.email}>ahmad.fathoni50@gmail.com</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Terverifikasi</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{formatIdr(total)}</Text>
            <Text style={styles.statLabel}>Kekayaan</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: colors.up }]}>+17.4%</Text>
            <Text style={styles.statLabel}>Semua waktu</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{assets.length}</Text>
            <Text style={styles.statLabel}>Aset</Text>
          </View>
        </View>

        {/* API integrations */}
        <Text style={styles.sectionTitle}>Integrasi harga</Text>
        <View style={styles.menuGroup}>
          {API_INTEGRATIONS.map((item) => (
            <View key={item.label} style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 14 }}>🔗</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={[styles.apiChip, { backgroundColor: '#e8f5fe' }]}>
                <Text style={styles.apiChipText}>{item.source}</Text>
              </View>
              <View style={styles.statusDot} />
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
              <Text>🔔</Text>
            </View>
            <Text style={styles.menuLabel}>Notifikasi</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.cashBg }]}>
              <Text>🔒</Text>
            </View>
            <Text style={styles.menuLabel}>Ubah password</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
              <Text>🎨</Text>
            </View>
            <Text style={styles.menuLabel}>Tampilan</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        {/* Rate info */}
        <Text style={styles.rateInfo}>Kurs saat ini: 1 USD = Rp {usdToIdr.toLocaleString('id-ID')}</Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
  editLink: { fontSize: 13, color: colors.primary },

  profileBlock: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  email: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  verifiedBadge: { backgroundColor: colors.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  verifiedText: { fontSize: 11, color: colors.primary, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statVal: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 9, color: colors.textSecondary },

  sectionTitle: { fontSize: 10, color: colors.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },
  menuGroup: { marginHorizontal: 16, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  chevron: { fontSize: 18, color: colors.textMuted },
  apiChip: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  apiChipText: { fontSize: 9, color: colors.cash, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.up, marginLeft: 4 },

  logoutBtn: { marginHorizontal: 16, borderRadius: radius.lg, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.dn, marginBottom: 12 },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.dn },
  rateInfo: { textAlign: 'center', fontSize: 11, color: colors.textMuted },
});
