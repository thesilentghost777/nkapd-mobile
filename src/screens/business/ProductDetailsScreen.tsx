import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
  Share,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
interface ProductDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      id: number;
    };
  };
}
interface Produit {
  id: number;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  images: string[];
  ville: string;
  telephone_contact: string;
  whatsapp: string;
  statut: string;
  vues: number;
  created_at: string;
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    photo_profil?: string;
  };
}
const CATEGORIES: Record<string, string> = {
  electronique: 'Électronique',
  mode: 'Mode & Vêtements',
  maison: 'Maison & Jardin',
  vehicules: 'Véhicules',
  immobilier: 'Immobilier',
  emploi: 'Emploi & Services',
  loisirs: 'Loisirs & Divertissement',
  autre: 'Autre',
};
export default function ProductDetailsScreen({ navigation, route }: ProductDetailsScreenProps) {
  const { id } = route.params;
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    loadProduct();
  }, [id]);
  const loadProduct = async () => {
    try {
      const response = await api.getProduitDetails(id);
      let produitData = null;
      if (response.data.success && response.data.data?.produit) {
        produitData = response.data.data.produit;
      } else if (response.data.produit) {
        produitData = response.data.produit;
      } else if (response.data.data && typeof response.data.data === 'object') {
        produitData = response.data.data;
      } else if (typeof response.data === 'object') {
        produitData = response.data;
      }
      if (produitData) {
        setProduit(produitData);
      } else {
        Alert.alert('Erreur', 'Produit introuvable');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      Alert.alert('Erreur', 'Impossible de charger le produit');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  const handleCall = () => {
    const phone = produit?.telephone_contact || produit?.vendeur.telephone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };
  const handleWhatsApp = () => {
    const whatsapp = produit?.whatsapp || produit?.telephone_contact || produit?.vendeur.telephone;
    if (whatsapp) {
      const message = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce sur Nkap Dey"${produit?.titre}"`);
      Linking.openURL(`whatsapp://send?phone=${whatsapp}&text=${message}`);
    }
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez cette annonce: ${produit?.titre} - ${formatPrice(produit?.prix || 0)} sur Nkap Dey! Téléchargez l'application ici si vous ne l'avez pas: https://nkapdey.com/download`,
        title: produit?.titre,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };
  const handleContactSeller = () => {
    if (produit?.vendeur) {
      navigation.navigate('Messages', {
        screen: 'Conversation',
        params: {
          userId: produit.vendeur.id,
          userName: `${produit.vendeur.prenom} ${produit.vendeur.nom}`,
        },
      });
    }
  };
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }
  if (!produit) {
    return null;
  }
  const images = produit.images?.length > 0
    ? produit.images
    : ['https://via.placeholder.com/400x300?text=Pas+d\'image'];
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.productImage} resizeMode="cover" />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
          {/* Status Badge */}
          {produit.statut === 'vendu' && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>VENDU</Text>
            </View>
          )}
        </View>
        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{CATEGORIES[produit.categorie] || produit.categorie}</Text>
          </View>
          <Text style={styles.title}>{produit.titre}</Text>
          <Text style={styles.price}>{formatPrice(produit.prix)}</Text>
          <View style={styles.metaRow}>
            {produit.ville && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={COLORS.gray500} />
                <Text style={styles.metaText}>{produit.ville}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={16} color={COLORS.gray500} />
              <Text style={styles.metaText}>{produit.vues} vues</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.gray500} />
              <Text style={styles.metaText}>{formatDate(produit.created_at)}</Text>
            </View>
          </View>
        </View>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{produit.description}</Text>
        </View>
        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendeur</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              {produit.vendeur.photo_profil ? (
                <Image source={{ uri: produit.vendeur.photo_profil }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={32} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {produit.vendeur.prenom} {produit.vendeur.nom}
              </Text>
              <Text style={styles.sellerMember}>Membre Nkap</Text>
            </View>
            <TouchableOpacity onPress={handleContactSeller} style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
      {/* Contact Actions */}
      {produit.statut !== 'vendu' && (
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.callButtonText}>Contacter le vendeur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
            <Text style={styles.whatsappButtonText}>Ecrire au vendeur</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  imageCarousel: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    position: 'relative',
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white + '80',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  soldBadge: {
    position: 'absolute',
    top: 80,
    right: SPACING.lg,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    transform: [{ rotate: '15deg' }],
  },
  soldBadgeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.sizes.md,
  },
  productInfo: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryFaded + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    lineHeight: 24,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryFaded + '30',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  sellerName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
  },
  sellerMember: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  bottomSpacer: {
    height: 100,
  },
  contactActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
    ...SHADOWS.large,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#25D366',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
});