import { router, Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Icon, tap, type IconName } from '@/components/ui';
import { colors, shadow } from '@/theme';

const icon = (name: IconName, active: IconName) =>
  function TabIcon({ focused, color }: { focused: boolean; color: unknown }) {
    return <Icon name={focused ? active : name} color={color as string} size={24} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: Platform.OS === 'ios' ? 88 : 68, paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="quotes" options={{ title: 'Quotes', tabBarIcon: icon('file-document-outline', 'file-document') }} />
      <Tabs.Screen
        name="record"
        options={{
          title: 'New quote',
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: 'Talk a new quote',
          tabBarIcon: () => (
            <View style={st.mic}>
              <Icon name="microphone" size={30} color={colors.ink} />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            tap();
            router.push('/new');
          },
        }}
      />
      <Tabs.Screen name="materials" options={{ title: 'Materials', tabBarIcon: icon('cart-outline', 'cart') }} />
      <Tabs.Screen name="tools" options={{ title: 'Van check', tabBarIcon: icon('toolbox-outline', 'toolbox') }} />
    </Tabs>
  );
}

const st = StyleSheet.create({
  mic: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center',
    marginTop: -26, borderWidth: 5, borderColor: colors.card, ...shadow, shadowOpacity: 0.18,
  },
});
