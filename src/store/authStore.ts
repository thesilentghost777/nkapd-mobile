import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { Alert } from 'react-native';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville: string;
  sexe: string;
  date_naissance: string;
  code_parrainage: string;
  solde: number;
  bio?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (identifiant: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (identifiant: string, password: string) => {
    try {
      const response = await api.connexion(identifiant, password);
      const { token, user } = response.data;
      
      await SecureStore.setItemAsync('auth_token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const status = error.response?.status;
      
      // Si erreur d'authentification, nettoyer le state
      if (status === 401 || status === 403) {
        await SecureStore.deleteItemAsync('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
      
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  register: async (data: any) => {
    try {
      const response = await api.inscription(data);
      const { token, user } = response.data;
      
      await SecureStore.setItemAsync('auth_token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
    }
  },

  logout: async (showMessage: boolean = false) => {
    console.log('Déconnexion en cours...');
    
    try {
      // Tenter d'appeler l'endpoint de déconnexion
      await api.deconnexion();
    } catch (error) {
      // Ignorer les erreurs de déconnexion côté serveur
      console.log('Erreur lors de la déconnexion côté serveur (ignorée):', error);
    } finally {
      // Toujours nettoyer le state local et le token
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (error) {
        console.error('Erreur lors de la suppression du token:', error);
      }
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Afficher un message si demandé (lors d'erreur d'authentification)
      if (showMessage) {
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [{ text: 'OK' }]
        );
      }
      
      console.log('Déconnexion terminée');
    }
  },

  loadUser: async () => {
    try {
      const response = await api.getProfil();
      const userData = response.data.user || response.data;
      
      console.log('loadUser - userData final:', userData);
      console.log('loadUser - code_parrainage:', userData.code_parrainage);
      
      set({ user: userData, isLoading: false });
    } catch (error: any) {
      console.error('loadUser error:', error);
      
      const status = error.response?.status;
      
      // Si erreur d'authentification, déclencher la déconnexion
      if (status === 401 || status === 403) {
        console.log('Erreur d\'authentification lors du chargement du profil');
        await get().logout();
      }
      
      set({ isLoading: false });
    }
  },

  updateUser: (data: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return false;
      }
      
      set({ token, isAuthenticated: true });
      await get().loadUser();
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      
      const status = error.response?.status;
      
      // Si erreur d'authentification, nettoyer tout
      if (status === 401 || status === 403) {
        await SecureStore.deleteItemAsync('auth_token');
      }
      
      set({ isLoading: false, isAuthenticated: false });
      return false;
    }
  },
}));