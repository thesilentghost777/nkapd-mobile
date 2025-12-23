import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator, MainNavigator } from '../nkapd/src/navigation';
import { useAuthStore } from '../nkapd/src/store/authStore';
import { setUnauthorizedCallback } from '../nkapd/src/services/api';
import { COLORS } from '../nkapd/src/constants/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    // Configuration du callback de déconnexion pour l'API
    setUnauthorizedCallback(() => {
      console.log('Callback de déconnexion appelé - Session expirée');
      // Appeler logout sans message
      logout();
    });

    // Vérifier l'authentification au démarrage
    const initApp = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setIsReady(true);
      }
    };

    initApp();
  }, []);

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}