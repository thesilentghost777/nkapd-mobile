import { create } from 'zustand';
import { api } from '../services/api';
interface Transaction {
  id: number;
  type: string;
  montant: number;
  description: string;
  created_at: string;
  statut: string;
}
interface TransactionState {
  solde: number;
  transactions: Transaction[];
  isLoading: boolean;
  fetchSolde: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  recharger: (montant: number, methode: string, reference: string) => Promise<any>;
  retirer: (montant: number, telephone: string, operateur: string) => Promise<any>;
  transferer: (destinataire: string, montant: number) => Promise<void>;
  checkPaymentStatus: (token: string) => Promise<any>;
}
export const useTransactionStore = create<TransactionState>((set, get) => ({
  solde: 0,
  transactions: [],
  isLoading: false,
  fetchSolde: async () => {
    try {
      const response = await api.getSolde();
      set({ solde: response.data?.solde || 0 });
    } catch (error) {
      console.error('Erreur fetch solde:', error);
      set({ solde: 0 });
    }
  },
  fetchTransactions: async (page = 1) => {
    try {
      set({ isLoading: true });
      const response = await api.getHistorique(page);
      const transactions = Array.isArray(response.data?.transactions?.data)
        ? response.data.transactions.data
        : [];
      set({ transactions, isLoading: false });
    } catch (error) {
      console.error('Erreur fetch transactions:', error);
      set({ transactions: [], isLoading: false });
    }
  },
  recharger: async (montant: number, methode: string, reference: string) => {
    try {
      const response = await api.recharger(montant, methode, reference);
     
      if (response.data?.success) {
        return {
          success: true,
          payment_url: response.data.payment_url,
          token: response.data.token,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Erreur de rechargement'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de rechargement'
      };
    }
  },
  retirer: async (montant: number, telephone: string, operateur: string) => {
    try {
      const response = await api.retirer(montant, telephone, operateur);
      const data = response.data;
      if (data?.success) {
        await get().fetchSolde();
        await get().fetchTransactions();
        return {
          success: true,
          message: data.message,
          token: data.token,
          montant_net: data.montant_net,
          frais: data.frais,
        };
      } else {
        return {
          success: false,
          message: data?.message || 'Erreur de retrait'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de retrait'
      };
    }
  },
  transferer: async (destinataire: string, montant: number) => {
    try {
      const response = await api.transferer(destinataire, montant);
     
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Erreur de transfert');
      }
     
      await get().fetchSolde();
      await get().fetchTransactions();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de transfert');
    }
  },
  checkPaymentStatus: async (token: string) => {
    try {
      const response = await api.checkPaymentStatus(token);
      return response.data;
    } catch (error: any) {
      console.error('Erreur vérification statut:', error);
      return null;
    }
  },
}));