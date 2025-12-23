import { create } from 'zustand';
import { api } from '../services/api';

interface Profil {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  ville: string;
  bio?: string;
  avatar?: string;
  sexe: string;
}

interface Annonce {
  id: number;
  type: 'amoureuse' | 'business' | 'autre';
  titre: string;
  description: string;
  utilisateur: Profil;
  created_at: string;
}

interface RencontreState {
  profils: Profil[];
  annoncesBusiness: Annonce[];
  annoncesAutre: Annonce[];
  mesAnnonces: Annonce[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfilsAmoureuse: (page?: number) => Promise<void>;
  fetchAnnoncesBusiness: () => Promise<void>;
  fetchAnnoncesAutre: () => Promise<void>;
  fetchMesAnnonces: () => Promise<void>;
  creerAnnonce: (data: { type: string; titre: string; description: string }) => Promise<boolean>;
  supprimerAnnonce: (id: number) => Promise<boolean>;
  nextProfil: () => void;
  resetIndex: () => void;
  clearError: () => void;
}

export const useRencontreStore = create<RencontreState>((set, get) => ({
  profils: [],
  annoncesBusiness: [],
  annoncesAutre: [],
  mesAnnonces: [],
  currentIndex: 0,
  isLoading: false,
  error: null,

  fetchProfilsAmoureuse: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getProfilsAmoureuse(page);
      console.log('Response profils amoureuse:', response.data);
      
      // Gestion flexible de la structure de données
      let data = [];
      if (response.data.data) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log('Profils extraits:', data.length);
      set({ profils: data, currentIndex: 0, isLoading: false });
    } catch (error: any) {
      console.error('Erreur fetch profils:', error);
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des profils',
        isLoading: false,
      });
    }
  },

  fetchAnnoncesBusiness: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getAnnoncesBusiness();
      console.log('Response annonces business:', response.data);
      
      let data = [];
      if (response.data.data) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log('Annonces business extraites:', data.length);
      set({ annoncesBusiness: data, isLoading: false });
    } catch (error: any) {
      console.error('Erreur fetch annonces business:', error);
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des annonces',
        isLoading: false,
      });
    }
  },

  fetchAnnoncesAutre: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getAnnoncesAutre();
      console.log('Response annonces autre:', response.data);
      
      let data = [];
      if (response.data.data) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log('Annonces autre extraites:', data.length);
      set({ annoncesAutre: data, isLoading: false });
    } catch (error: any) {
      console.error('Erreur fetch annonces autre:', error);
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des annonces',
        isLoading: false,
      });
    }
  },

  fetchMesAnnonces: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getMesAnnonces();
      console.log('Response mes annonces:', response.data);
      
      let data = [];
      if (response.data.data) {
        data = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log('Mes annonces extraites:', data.length);
      set({ mesAnnonces: data, isLoading: false });
    } catch (error: any) {
      console.error('Erreur fetch mes annonces:', error);
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement de vos annonces',
        isLoading: false,
      });
    }
  },

  creerAnnonce: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.creerAnnonce(data);
      await get().fetchMesAnnonces();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Erreur création annonce:', error);
      set({
        error: error.response?.data?.message || 'Erreur lors de la création de l\'annonce',
        isLoading: false,
      });
      return false;
    }
  },

  supprimerAnnonce: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.supprimerProduit(id); // Utilise l'API existante
      set((state) => ({
        mesAnnonces: state.mesAnnonces.filter((a) => a.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      console.error('Erreur suppression annonce:', error);
      set({
        error: error.response?.data?.message || 'Erreur lors de la suppression',
        isLoading: false,
      });
      return false;
    }
  },

  nextProfil: () => {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.profils.length - 1),
    }));
  },

  resetIndex: () => set({ currentIndex: 0 }),

  clearError: () => set({ error: null }),
}));