import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';
import { PatinhasIcon } from '../components/Icons';
import { DogLoadingContent } from '../components/DogLoadingScreen';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import AnimaisScreen from '../screens/AnimaisScreen';
import MapaScreen from '../screens/MapaScreen';
import PerdidosScreen from '../screens/PerdidosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import NovoAvistamentoScreen from '../screens/NovoAvistamentoScreen';
import DetalhesAnimalScreen from '../screens/DetalhesAnimalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Mapa"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.brandOrange,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          if (route.name === 'Animais') {
            return (
              <PatinhasIcon
                size={24}
                color={focused ? COLORS.brandOrange : COLORS.gray400}
              />
            );
          }
          if (route.name === 'Mapa') {
            return <Ionicons name="location" size={24} color={color} />;
          }
          if (route.name === 'Perdidos') {
            return <Ionicons name="megaphone" size={24} color={color} />;
          }
          if (route.name === 'Perfil') {
            return <Ionicons name="person" size={24} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Animais" component={AnimaisScreen} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Perdidos" component={PerdidosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, carregandoSessao } = useAuth();
  const [exibindoSplashInicial, setExibindoSplashInicial] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExibindoSplashInicial(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (carregandoSessao || exibindoSplashInicial) {
    return <DogLoadingContent />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="NovoAvistamento" component={NovoAvistamentoScreen} />
            <Stack.Screen name="DetalhesAnimal" component={DetalhesAnimalScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
