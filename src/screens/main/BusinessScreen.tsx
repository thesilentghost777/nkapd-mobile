// screens/main/BusinessScreen.tsx - VERSION AVEC SELECT
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface Produit {
  id: number;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  ville: string;
  images: string[];
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
  };
  statut: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', name: 'Toutes les catégories', icon: 'grid-outline' },
  { id: 'electronique', name: 'Électronique', icon: 'phone-portrait-outline' },
  { id: 'vetements', name: 'Vêtements', icon: 'shirt-outline' },
  { id: 'maison', name: 'Maison', icon: 'home-outline' },
  { id: 'vehicules', name: 'Véhicules', icon: 'car-outline' },
  { id: 'autres', name: 'Autres', icon: 'ellipsis-horizontal-outline' },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;
const IMAGE_HEIGHT = 140;

export const BusinessScreen: React.FC<Props> = ({ navigation }) => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    fetchProduits();
  }, [selectedCategory]);

  const fetchProduits = async () => {
    if (produits.length === 0) {
      setIsLoading(true);
    }
   
    try {
      const categorie = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await api.getProduits(categorie);
    
      let produitsData = [];
      if (response.data.data?.produits) {
        produitsData = response.data.data.produits;
      } else if (response.data.produits) {
        produitsData = response.data.produits;
      } else if (Array.isArray(response.data)) {
        produitsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        produitsData = response.data.data;
      }
    
      const activeProduits = produitsData.filter((p: any) => p.statut === 'actif');
      setProduits(Array.isArray(activeProduits) ? activeProduits : []);
    } catch (error) {
      console.error('Erreur fetch produits:', error);
      setProduits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProduits();
    setRefreshing(false);
  };

  const formatMoney = (amount: number) => amount.toLocaleString('fr-FR') + ' F';

  const getSelectedCategoryName = () => {
    return CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'Toutes les catégories';
  };

  const getSelectedCategoryIcon = () => {
    return CATEGORIES.find(cat => cat.id === selectedCategory)?.icon || 'grid-outline';
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryModal(false);
  };

  const renderProduit = ({ item, index }: { item: Produit; index: number }) => (
    <TouchableOpacity
      style={[
        styles.produitCard,
        index % 2 === 0 ? { marginRight: SPACING.sm } : { marginLeft: SPACING.sm },
      ]}
      onPress={() => navigation.navigate('ProduitDetail', { id: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.produitImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.produitImage} />
        ) : (
          <View style={styles.produitImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={COLORS.gray300} />
          </View>
        )}
      </View>
      <View style={styles.produitInfo}>
        <Text style={styles.produitTitle} numberOfLines={2}>
          {item.titre}
        </Text>
        <Text style={styles.produitPrice}>{formatMoney(item.prix)}</Text>
        <View style={styles.produitMeta}>
          <Ionicons name="location-outline" size={12} color={COLORS.gray400} />
          <Text style={styles.produitLocation}>{item.ville || 'Non spécifié'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={styles.quickActionCard}
        onPress={() => navigation.navigate('AddProduit')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.secondary, COLORS.secondaryLight]}
          style={styles.quickActionGradient}
        >
          <Ionicons name="add-circle" size={22} color={COLORS.white} />
          <Text style={styles.quickActionText}>Publier</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionCard}
        onPress={() => navigation.navigate('MesProduits')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.quickActionGradient}
        >
          <Ionicons name="bag-check" size={22} color={COLORS.white} />
          <Text style={styles.quickActionText}>Mes produits</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCategorySelect = () => (
    <View style={styles.selectContainer}>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setShowCategoryModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectButtonContent}>
          <Ionicons 
            name={getSelectedCategoryIcon() as any} 
            size={20} 
            color={COLORS.primary} 
          />
          <Text style={styles.selectButtonText}>{getSelectedCategoryName()}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={COLORS.gray400} />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choisir une catégorie</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={COLORS.gray500} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.modalItem,
                  selectedCategory === category.id && styles.modalItemActive,
                ]}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.modalItemContent}>
                  <Ionicons
                    name={category.icon as any}
                    size={22}
                    color={selectedCategory === category.id ? COLORS.primary : COLORS.gray500}
                  />
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedCategory === category.id && styles.modalItemTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      );
    }

    if (produits.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color={COLORS.gray300} />
          <Text style={styles.emptyText}>Aucun produit disponible</Text>
          <Text style={styles.emptySubtext}>
            Soyez le premier à publier dans cette catégorie !
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AddProduit')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondaryLight]}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.emptyButtonText}>Publier un produit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={produits}
        renderItem={renderProduit}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.produitsGrid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>Business</Text>
        <Text style={styles.headerSubtitle}>Achetez et vendez entre membres</Text>
      </LinearGradient>

      {renderQuickActions()}
      {renderCategorySelect()}
      {renderCategoryModal()}

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    zIndex: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  quickActionGradient: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  quickActionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  selectContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '30',
    ...SHADOWS.small,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  selectButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    width: '100%',
    maxHeight: '70%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    minHeight: 300,
  },
  produitsGrid: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  produitCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  produitImageContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
  },
  produitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  produitImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  produitInfo: {
    padding: SPACING.sm,
  },
  produitTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  produitPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  produitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  produitLocation: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    minHeight: 300,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    minHeight: 300,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray500,
    marginTop: SPACING.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray400,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  emptyButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});