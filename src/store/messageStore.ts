import { create } from 'zustand';
import { api } from '../services/api';

interface Participant {
  id: number;
  nom: string;
  prenom: string;
  avatar?: string;
}

interface Message {
  id: number;
  conversation_id: number;
  expediteur_id: number;
  contenu: string;
  lu: boolean;
  created_at: string;
}

interface Conversation {
  id: number;
  participant: Participant;
  dernier_message: {
    contenu: string;
    created_at: string;
    lu: boolean;
  } | null;
  non_lus: number;
}

interface MessageState {
  conversations: Conversation[];
  currentMessages: Message[];
  currentConversation: Conversation | null;
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number, page?: number) => Promise<void>;
  loadMoreMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, contenu: string) => Promise<boolean>;
  startNewConversation: (destinataireId: number, message: string) => Promise<number | null>;
  fetchUnreadCount: () => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  markAsRead: (conversationId: number) => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentMessages: [],
  currentConversation: null,
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
  currentPage: 1,
  hasMore: true,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getConversations();
      const data = response.data.data || response.data;
      set({ conversations: data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des conversations',
        isLoading: false,
      });
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getMessages(conversationId, page);
      const data = response.data.data || response.data;
      const messages = Array.isArray(data) ? data : data.messages || [];
      
      set({
        currentMessages: messages.reverse(), // Messages are usually returned newest first
        currentPage: page,
        hasMore: messages.length >= 20, // Assuming 20 per page
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des messages',
        isLoading: false,
      });
    }
  },

  loadMoreMessages: async (conversationId) => {
    const { currentPage, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;

    set({ isLoading: true });
    try {
      const response = await api.getMessages(conversationId, currentPage + 1);
      const data = response.data.data || response.data;
      const messages = Array.isArray(data) ? data : data.messages || [];

      set((state) => ({
        currentMessages: [...messages.reverse(), ...state.currentMessages],
        currentPage: currentPage + 1,
        hasMore: messages.length >= 20,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement',
        isLoading: false,
      });
    }
  },

  sendMessage: async (conversationId, contenu) => {
    set({ isSending: true, error: null });
    try {
      const response = await api.envoyerMessage(conversationId, contenu);
      const newMessage = response.data.data || response.data;

      set((state) => ({
        currentMessages: [...state.currentMessages, newMessage],
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                dernier_message: {
                  contenu,
                  created_at: new Date().toISOString(),
                  lu: true,
                },
              }
            : conv
        ),
        isSending: false,
      }));
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors de l\'envoi du message',
        isSending: false,
      });
      return false;
    }
  },

  startNewConversation: async (destinataireId, message) => {
    set({ isSending: true, error: null });
    try {
      const response = await api.nouvelleConversation(destinataireId, message);
      const data = response.data.data || response.data;
      const conversationId = data.conversation_id || data.id;

      // Refresh conversations list
      await get().fetchConversations();

      set({ isSending: false });
      return conversationId;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors de la création de la conversation',
        isSending: false,
      });
      return null;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.getNombreNonLus();
      const count = response.data.count || response.data.non_lus || 0;
      set({ unreadCount: count });
    } catch (error) {
      console.error('Erreur fetch unread count:', error);
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, non_lus: 0 } : conv
      ),
      unreadCount: Math.max(0, state.unreadCount - (state.conversations.find(c => c.id === conversationId)?.non_lus || 0)),
    }));
  },

  clearMessages: () => {
    set({ currentMessages: [], currentPage: 1, hasMore: true });
  },

  clearError: () => set({ error: null }),
}));
