import React from 'react';
import { Tabs } from 'expo-router';
import { Activity, BookOpen, HeartPulse, User, Wind } from 'lucide-react-native'; // On utilise tes icônes
import { Colors } from '../../constants/Colors'; // Attention : Import nommé avec les accolades !

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.zen.sage,
        tabBarInactiveTintColor: Colors.zen.sky,
        tabBarStyle: {
          backgroundColor: Colors.zen.cream,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: Colors.zen.dark,
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        headerStyle: {
          backgroundColor: Colors.zen.cream,
        },
        headerTintColor: Colors.zen.dark,
        headerShadowVisible: false,
        headerShown: false,
      }}>

      {/* Onglet 1 : Module Informations (Obligatoire) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Articles',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />

      {/* Onglet 2 : Module Tracker d'émotions (Au choix) */}
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Mon Journal',
          tabBarIcon: ({ color }) => <HeartPulse size={24} color={color} />,
        }}
      />

      {/* Onglet 3 : Module de Respiration (Au choix) */}
      <Tabs.Screen
        name="breathe"
        options={{
          title: 'Respiration',
          tabBarIcon: ({ color }) => <Wind size={24} color={color} />,
        }}
      />

      {/* Onglet 4 : Module de Diagnostics (Au choix) */}
      <Tabs.Screen
        name="diagnostics/index"
        options={{
          title: 'Évaluations',
          tabBarIcon: ({ color }) => <Activity color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="diagnostics/[id]"
        options={{
          href: null,
        }}
      />

      {/* Onglet 5 : Profil et Paramètres */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />


    </Tabs>
  );
}