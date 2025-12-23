import { create } from 'zustand';
import { api } from '../services/api';

interface Tontine {
  id: number;
  nom: string;
  code: string;
  prix: number;
  nombre_membres: number;
  membres_actuels: number;
  statut: string;
  montant_collecte: number;
  created_at: string;
  createur?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface TontineState {
  mesCreations: Tontine[];
  mesAdhesions: Tontine[];
  tontineRecherchee: Tontine | null;
  isLoading: boolean;

  fetchMesCreations: () => Promise<void>;
  fetchMesAdhesions: () => Promise<void>;
  creerTontine: (nom: string, prix: number, nombreMembres: number) => Promise<any>;
  rejoindreTontine: (code: string) => Promise<void>;
  rechercherTontine: (code: string) => Promise<void>;
  clearRecherche: () => void;
}

// Fonction utilitaire pour parser les nombres
const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

export const useTontineStore = create<TontineState>((set, get) => ({
  mesCreations: [],
  mesAdhesions: [],
  tontineRecherchee: null,
  isLoading: false,

  fetchMesCreations: async () => {
    try {
      set({ isLoading: true });
      const response = await api.getMesCreations();

      const mesCreations = Array.isArray(response.data?.tontines)
        ? response.data.tontines.map((t: any) => ({
            ...t,
            prix: parseNumber(t.prix),
            nombre_membres: parseInt(t.nombre_membres) || 0,
            membres_actuels: parseInt(t.membres_actuels) || 0,
            montant_collecte: parseNumber(t.montant_collecte),
          }))
        : [];

      console.log('Mes créations chargées:', mesCreations);
      set({ mesCreations, isLoading: false });
    } catch (error) {
      console.error('Erreur fetch créations:', error);
      set({ mesCreations: [], isLoading: false });
    }
  },

  fetchMesAdhesions: async () => {
    try {
      set({ isLoading: true });
      const response = await api.getMesAdhesions();

      const mesAdhesions = Array.isArray(response.data?.tontines)
        ? response.data.tontines.map((t: any) => ({
            ...t,
            prix: parseNumber(t.prix),
            nombre_membres: parseInt(t.nombre_membres) || 0,
            membres_actuels: parseInt(t.membres_actuels) || 0,
            montant_collecte: parseNumber(t.montant_collecte),
          }))
        : [];

      console.log('Mes adhésions chargées:', mesAdhesions);
      set({ mesAdhesions, isLoading: false });
    } catch (error) {
      console.error('Erreur fetch adhésions:', error);
      set({ mesAdhesions: [], isLoading: false });
    }
  },

  creerTontine: async (nom: string, prix: number, nombreMembres: number) => {
    try {
      const response = await api.creerTontine(nom, prix, nombreMembres);

      await get().fetchMesCreations();

      return response.data;
    } catch (error: any) {
      console.error('Erreur création tontine:', error);
      throw new Error(error.response?.data?.message || 'Erreur de création');
    }
  },

  rejoindreTontine: async (code: string) => {
    try {
      console.log('🔵 Tentative de rejoindre la tontine:', code);
      const response = await api.rejoindreTontine(code);
      console.log('🟢 Réponse backend rejoindre:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur pour rejoindre');
      }

      await get().fetchMesAdhesions();

      set({ tontineRecherchee: null });
    } catch (error: any) {
      console.error('🔴 Erreur rejoindre tontine:', error);
      console.error('🔴 Erreur complète:', JSON.stringify(error.response?.data || error.message));
      throw new Error(error.response?.data?.message || 'Erreur pour rejoindre');
    }
  },

  rechercherTontine: async (code: string) => {
    try {
      set({ isLoading: true });
      const response = await api.rechercherTontine(code);

      console.log('Réponse recherche brute:', response.data);

      if (response.data.success) {
        const tontineData: Tontine = {
          id: parseInt(response.data.id) || 0,
          nom: response.data.nom || '',
          code: response.data.code || '',
          prix: parseNumber(response.data.prix),
          nombre_membres: parseInt(response.data.nombre_membres) || 0,
          membres_actuels: parseInt(response.data.membres_actuels) || 0,
          statut: response.data.statut || 'inconnu',
          montant_collecte: parseNumber(response.data.montant_collecte),
          createur: response.data.createur,
          created_at: '',
        };

        console.log('Tontine recherchée parsée:', tontineData);
        set({ tontineRecherchee: tontineData, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Tontine non trouvée');
      }
    } catch (error: any) {
      console.error('Erreur recherche tontine:', error);
      set({ isLoading: false, tontineRecherchee: null });
      throw new Error(error.response?.data?.message || 'Tontine non trouvée');
    }
  },

  clearRecherche: () => {
    set({ tontineRecherchee: null });
  },
}));
