import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssetCategory } from '../store/useAssetStore';
import { colors, radius } from '../constants/theme';

const MAP: Record<AssetCategory, { icon: string; bg: string; color: string }> = {
  cash:      { icon: '🏦', bg: colors.cashBg,      color: colors.cash },
  stock:     { icon: '📈', bg: colors.stockBg,     color: colors.stock },
  crypto:    { icon: '₿',  bg: colors.cryptoBg,    color: colors.crypto },
  reksadana: { icon: '📄', bg: colors.reksadanaBg, color: colors.reksadana },
};

interface Props {
  category: AssetCategory;
  size?: number;
}

export function CategoryIcon({ category, size = 36 }: Props) {
  const { icon, bg } = MAP[category];
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg }]}>
      <Text style={{ fontSize: size * 0.45 }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
