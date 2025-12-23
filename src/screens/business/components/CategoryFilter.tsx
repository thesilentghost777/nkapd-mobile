import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../constants/theme';

interface Category {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: Category[] = [
  { key: '', label: 'Tout', icon: 'grid-outline' },
  { key: 'electronique', label: 'Électronique', icon: 'phone-portrait-outline' },
  { key: 'mode', label: 'Mode', icon: 'shirt-outline' },
  { key: 'maison', label: 'Maison', icon: 'home-outline' },
  { key: 'vehicules', label: 'Véhicules', icon: 'car-outline' },
  { key: 'immobilier', label: 'Immobilier', icon: 'business-outline' },
  { key: 'emploi', label: 'Emploi', icon: 'briefcase-outline' },
  { key: 'loisirs', label: 'Loisirs', icon: 'game-controller-outline' },
  { key: 'autre', label: 'Autre', icon: 'ellipsis-horizontal-outline' },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.key;
          return (
            <TouchableOpacity
              key={category.key}
              style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
              onPress={() => onSelectCategory(category.key)}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={isSelected ? COLORS.white : COLORS.primary}
                />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  categoryItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  categoryItemSelected: {},
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryFaded + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
