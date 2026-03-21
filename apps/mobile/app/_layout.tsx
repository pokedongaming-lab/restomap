import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Peta',
          tabBarIcon: () => '🗺️',
          headerShown: false,
        }}
      />
      <Tabs.Screen 
        name="saved" 
        options={{
          title: 'Tersimpan',
          tabBarIcon: () => '💾',
          headerShown: false,
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profil',
          tabBarIcon: () => '👤',
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
