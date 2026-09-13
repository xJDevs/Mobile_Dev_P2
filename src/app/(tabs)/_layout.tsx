import { Tabs } from 'expo-router/js-tabs';
import { SymbolView } from 'expo-symbols';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mercado',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'chart.line.uptrend.xyaxis', android: 'show_chart' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'star.fill', android: 'star' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
