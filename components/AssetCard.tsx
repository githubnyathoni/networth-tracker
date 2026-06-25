import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Asset, selectTotalIdr } from '../store/useAssetStore';
import { CategoryIcon } from './CategoryIcon';
import { colors, radius } from '../constants/theme';
import { formatIdrFull } from '../utils/format';

function assetValueIdr(a: Asset): number {
  if (a.category === 'cash') return a.manualValue ?? 0;
  if (a.category === 'stock') return a.quantity * 100 * a.currentPrice;
  return a.quantity * a.currentPrice;
}

function pctChange(a: Asset): number | null {
  if (a.category === 'cash') return null;
  if (a.buyPrice === 0) return null;
  return ((a.currentPrice - a.buyPrice) / a.buyPrice) * 100;
}

interface Props {
  asset: Asset;
  totalPortfolioIdr: number;
  showBar?: boolean;
  onPress?: () => void;
}

export function AssetCard({ asset, totalPortfolioIdr, showBar = false, onPress }: Props) {
  const value = assetValueIdr(asset);
  const pct = pctChange(asset);
  const portfolioPct = totalPortfolioIdr > 0 ? (value / totalPortfolioIdr) * 100 : 0;
  const isAuto = asset.category !== 'cash';
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        {asset.logoUrl && !imgError ? (
          <Image
            source={{ uri: asset.logoUrl }}
            style={styles.logo}
            onError={() => setImgError(true)}
          />
        ) : (
          <CategoryIcon category={asset.category} size={36} />
        )}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{asset.name}</Text>
            <View style={[styles.badge, isAuto ? styles.badgeAuto : styles.badgeManual]}>
              <Text style={[styles.badgeText, { color: isAuto ? colors.up : colors.textMuted }]}>
                {isAuto ? 'LIVE' : 'MANUAL'}
              </Text>
            </View>
          </View>
          <Text style={styles.sub}>{asset.institution}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.value}>{formatIdrFull(value)}</Text>
          {pct !== null ? (
            <Text style={[styles.pct, { color: pct >= 0 ? colors.up : colors.dn }]}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
            </Text>
          ) : (
            <Text style={styles.pctMuted}>—</Text>
          )}
        </View>
      </View>

      {showBar && (
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(portfolioPct, 100)}%`,
                backgroundColor:
                  asset.category === 'cash' ? colors.cash :
                  asset.category === 'stock' ? colors.stock :
                  asset.category === 'crypto' ? colors.crypto :
                  colors.reksadana,
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  sub: { fontSize: 11, color: colors.textSecondary },
  right: { alignItems: 'flex-end' },
  value: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  pct: { fontSize: 11, marginTop: 2 },
  pctMuted: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badge: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  badgeAuto: { backgroundColor: colors.upBg },
  badgeManual: { backgroundColor: colors.primaryLight },
  badgeText: { fontSize: 8, fontWeight: '600' },
  barTrack: {
    height: 4, backgroundColor: colors.primaryLight,
    borderRadius: 2, marginTop: 10, overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border },
});
