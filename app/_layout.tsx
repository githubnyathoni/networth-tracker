import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { useAssetStore } from '../store/useAssetStore';
import { refreshAllPrices } from '../services/refreshPrices';

export default function RootLayout() {
  const loadFromStorage = useAssetStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage().then(() => refreshAllPrices());
    // Refresh prices every 5 minutes
    const interval = setInterval(refreshAllPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 16,
          paddingTop: 8,
          height: 68,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portofolio',
          tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="add" size={28} color="#fff" style={{
              backgroundColor: colors.primary,
              borderRadius: 22,
              width: 44, height: 44,
              textAlign: 'center',
              lineHeight: 44,
              marginBottom: 12,
            }} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="edit/[id]" options={{ href: null }} />
    </Tabs>
  );
}
