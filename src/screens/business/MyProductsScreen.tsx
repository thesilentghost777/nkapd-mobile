import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

interface Produit {
  id: number;
  titre: string;
  description: string;
  prix: number;
  categorie: string;
  images: string[];
  ville: string;
  statut: string;
  vues: number;
  created_at: string;
}

interface MyProductsScreenProps {
  navigation: any;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  actif: { label: 'En ligne', color: COLORS.success },
  inactif: { label: 'Hors ligne', color: COLORS.gray500 },
  vendu: { label: 'Vendu', color: COLORS.secondary },
  refuse: { label: 'Refusé', color: COLORS.error },
};

export default function MyProductsScreen({ navigation }: MyProductsScreenProps) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      const response = await api.getMesProduits();
      if (response.data.success) {
        setProduits(response.data.data.produits);
      }
    } catch (error) {
      console.log('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  };

  const handleMarkAsSold = (productId: number) => {
    Alert.alert(
      'Marquer comme vendu',
      'Voulez-vous marquer ce produit comme vendu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const response = await api.marquerVendu(productId);
              if (response.data.success) {
                loadProducts();
                Alert.alert('Succès', 'Produit marqué comme vendu');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de modifier le statut');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (productId: number) => {
    Alert.alert(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.supprimerProduit(productId);
              if (response.data.success) {
                loadProducts();
                Alert.alert('Succès', 'Produit supprimé');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Produit }) => {
    const status = STATUS_LABELS[item.statut] || { label: item.statut, color: COLORS.gray500 };
    const imageUri = item.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProduitDetail', { productId: item.id })}
      >
        <Image source={{ uri: imageUri }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.titre}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          
          <Text style={styles.productPrice}>{formatPrice(item.prix)}</Text>
          
          <View style={styles.productMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={14} color={COLORS.gray400} />
              <Text style={styles.metaText}>{item.vues}</Text>
            </View>
            {item.ville && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.metaText}>{item.ville}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProduit', { productId: item.id })}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          {item.statut === 'actif' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsSold(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="basket-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptySubtitle}>
        Vous n'avez pas encore publié de produit
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduit')}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>Publier un produit</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes produits</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProduit')}
          style={styles.headerAddButton}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      {produits.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{produits.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {produits.filter((p) => p.statut === 'actif').length}
            </Text>
            <Text style={styles.statLabel}>En ligne</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {produits.filter((p) => p.statut === 'vendu').length}
            </Text>
            <Text style={styles.statLabel}>Vendus</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {produits.reduce((acc, p) => acc + p.vues, 0)}
            </Text>
            <Text style={styles.statLabel}>Vues</Text>
          </View>
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={produits}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyList}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerAddButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: SPACING.md,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  productTitle: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  productMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
  },
  productActions: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray400,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});
