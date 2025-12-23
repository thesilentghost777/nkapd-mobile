import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
const BASE_URL = 'http://192.168.1.166:8000/api/nkap';
// Variable globale pour le callback de déconnexion
let onUnauthorizedCallback: (() => void) | null = null;
export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};
class ApiService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });
    // Intercepteur de requête
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    // Intercepteur de réponse avec gestion des erreurs d'authentification
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
       
        // Gestion des erreurs d'authentification (401, 403)
        if (status === 401 || status === 403) {
          console.log('Erreur d\'authentification détectée:', status);
         
          // Supprimer le token
          await SecureStore.deleteItemAsync('auth_token');
         
          // Appeler le callback de déconnexion si défini
          if (onUnauthorizedCallback) {
            console.log('Déconnexion de l\'utilisateur...');
            onUnauthorizedCallback();
          }
        }
       
        return Promise.reject(error);
      }
    );
  }
  /**
   * Upload d'une seule image en multipart/form-data
   */
  async uploadImage(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
     
      const filename = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      // @ts-ignore
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      });
      const token = await SecureStore.getItemAsync('auth_token');
     
      const response = await axios.post(
        `${BASE_URL}/business/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );
      if (response.data.success && response.data.url) {
        return response.data.url;
      }
     
      throw new Error(response.data.message || 'Upload failed');
    } catch (error: any) {
      console.error('Error uploading image:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
        'Impossible d\'uploader l\'image. Vérifiez votre connexion.'
      );
    }
  }
  /**
   * Upload de plusieurs images séquentiellement
   */
  async uploadImages(imageUris: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    const errors: string[] = [];
   
    for (let i = 0; i < imageUris.length; i++) {
      try {
        console.log(`Uploading image ${i + 1}/${imageUris.length}...`);
        const url = await this.uploadImage(imageUris[i]);
        uploadedUrls.push(url);
      } catch (error: any) {
        console.error(`Failed to upload image ${i + 1}:`, error.message);
        errors.push(`Image ${i + 1}: ${error.message}`);
      }
    }
   
    if (errors.length > 0 && uploadedUrls.length === 0) {
      throw new Error(`Aucune image n'a pu être uploadée:\n${errors.join('\n')}`);
    }
   
    return uploadedUrls;
  }
  // Auth
  async inscription(data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
    code_parrainage?: string;
    date_naissance: string;
    sexe: string;
    ville: string;
  }) {
    return this.api.post('/inscription', data);
  }
  async connexion(identifiant: string, password: string) {
    return this.api.post('/connexion', {
      identifiant,
      password
    });
  }
  async deconnexion() {
    return this.api.post('/deconnexion');
  }
  async getProfil() {
    return this.api.get('/profil');
  }
  async mettreAJourProfil(data: any) {
    return this.api.put('/profil', data);
  }
  async changerMotDePasse(ancien: string, nouveau: string) {
    return this.api.put('/mot-de-passe', {
      ancien_mot_de_passe: ancien,
      nouveau_mot_de_passe: nouveau,
    });
  }
  // Transactions
  async recharger(montant: number, methode: string, reference: string = '') {
    return this.api.post('/recharger', {
      montant,
      methode_paiement: methode,
      reference_externe: reference,
    });
  }
  async retirer(montant: number, telephone: string, operateur: string) {
    return this.api.post('/retirer', {
      montant,
      telephone,
      operateur
    });
  }
  async transferer(destinataire: string, montant: number) {
    return this.api.post('/transferer', { destinataire, montant });
  }
  async getHistorique(page: number = 1) {
    return this.api.get(`/transactions?page=${page}`);
  }
  async getSolde() {
    return this.api.get('/solde');
  }
  async checkPaymentStatus(token: string) {
    return this.api.post('/payment/check-status', { token });
  }
  // Tontines
  async creerTontine(nom: string, prix: number, nombreMembres: number) {
    return this.api.post('/tontines', {
      nom,
      prix,
      nombre_membres: nombreMembres,
    });
  }
  async rejoindreTontine(code: string) {
    return this.api.post('/tontines/rejoindre', { code });
  }
  async rechercherTontine(code: string) {
    return this.api.get(`/tontines/rechercher/${code}`);
  }
  async getMesCreations() {
    return this.api.get('/tontines/mes-creations');
  }
  async getMesAdhesions() {
    return this.api.get('/tontines/mes-adhesions');
  }
  async getTontineDetails(id: number) {
    return this.api.get(`/tontines/${id}`);
  }
  // Parrainage
  async verifierCodeParrainage(code: string) {
    return this.api.post('/verifier-code-parrainage', { code });
  }
  async getStatistiquesParrainage() {
    return this.api.get('/parrainage/statistiques');
  }
  async getFilleuls() {
    return this.api.get('/parrainage/filleuls');
  }
  // Business
  async getProduits(categorie?: string) {
    const params = categorie ? `?categorie=${categorie}` : '';
    return this.api.get(`/business/produits${params}`);
  }
  async creerProduit(data: any) {
    return this.api.post('/business/produits', data);
  }
  async getProduitDetails(id: number) {
    return this.api.get(`/business/produits/${id}`);
  }
  async modifierProduit(id: number, data: any) {
    return this.api.put(`/business/produits/${id}`, data);
  }
  async supprimerProduit(id: number) {
    return this.api.delete(`/business/produits/${id}`);
  }
  async getMesProduits() {
    return this.api.get('/business/mes-produits');
  }
  async marquerVendu(id: number) {
    return this.api.post(`/business/produits/${id}/vendu`);
  }
  // Rencontre
  async creerAnnonce(data: any) {
    return this.api.post('/rencontre/annonces', data);
  }
  async getMesAnnonces() {
    return this.api.get('/rencontre/mes-annonces');
  }
  async getProfilsAmoureuse(page: number = 1) {
    return this.api.get(`/rencontre/amoureuse?page=${page}`);
  }
  async getAnnoncesBusiness() {
    return this.api.get('/rencontre/business');
  }
  async getAnnoncesAutre() {
    return this.api.get('/rencontre/autre');
  }
  async contacter(userId: number, message: string) {
    return this.api.post(`/rencontre/contacter/${userId}`, { message });
  }
  // Messages
  async getConversations() {
    return this.api.get('/messages/conversations');
  }
  async getMessages(conversationId: number, page: number = 1) {
    return this.api.get(`/messages/conversations/${conversationId}?page=${page}`);
  }
  async envoyerMessage(conversationId: number, contenu: string) {
    return this.api.post(`/messages/conversations/${conversationId}`, { contenu });
  }
  async nouvelleConversation(destinataireId: number, message: string) {
    return this.api.post('/messages/nouvelle', {
      destinataire_id: destinataireId,
      message,
    });
  }
  async getNombreNonLus() {
    return this.api.get('/messages/non-lus');
  }
  // FAQ
  async poserQuestion(question: string) {
    return this.api.post('/faq/question', { question });
  }
  async getFaq(categorie?: string) {
    const params = categorie ? `?categorie=${categorie}` : '';
    return this.api.get(`/faq${params}`);
  }
}
export const api = new ApiService();