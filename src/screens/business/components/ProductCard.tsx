import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

interface ProductCardProps {
  id: number;
  titre: string;
  prix: number;
  images: string[];
  ville?: string;
  categorie: string;
  vendeur: {
    nom: string;
    prenom: string;
  };
  onPress: (id: number) => void;
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

export default function ProductCard({
  id,
  titre,
  prix,
  images,
  ville,
  categorie,
  vendeur,
  onPress,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const imageUri = images?.[0] || 'https://via.placeholder.com/200x150?text=No+Image';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {CATEGORIES[categorie] || categorie}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {titre}
        </Text>
        
        <Text style={styles.price}>{formatPrice(prix)} FCFA</Text>
        
        <View style={styles.footer}>
          {ville && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color={COLORS.gray400} />
              <Text style={styles.locationText} numberOfLines={1}>
                {ville}
              </Text>
            </View>
          )}
          
          <View style={styles.sellerContainer}>
            <Ionicons name="person-outline" size={12} color={COLORS.gray400} />
            <Text style={styles.sellerText} numberOfLines={1}>
              {vendeur.prenom}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary + 'E6',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    maxWidth: '80%',
  },
  categoryText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  price: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  locationText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
    flex: 1,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sellerText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
  },
});
