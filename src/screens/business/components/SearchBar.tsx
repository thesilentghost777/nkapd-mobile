import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  onFilter: (filters: FilterOptions) => void;
  placeholder?: string;
}

interface FilterOptions {
  ville?: string;
  prix_min?: number;
  prix_max?: number;
}

const VILLES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Bamenda',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Kribi',
  'Limbé',
];

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  onFilter,
  placeholder = 'Rechercher...',
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVille, setSelectedVille] = useState('');
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');

  const handleApplyFilters = () => {
    onFilter({
      ville: selectedVille || undefined,
      prix_min: prixMin ? parseInt(prixMin) : undefined,
      prix_max: prixMax ? parseInt(prixMax) : undefined,
    });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSelectedVille('');
    setPrixMin('');
    setPrixMax('');
    onFilter({});
    setShowFilters(false);
  };

  const hasActiveFilters = selectedVille || prixMin || prixMax;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.gray400} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons
          name="options-outline"
          size={20}
          color={hasActiveFilters ? COLORS.white : COLORS.primary}
        />
      </TouchableOpacity>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Ville Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Ville</Text>
                <View style={styles.villesGrid}>
                  {VILLES.map((ville) => (
                    <TouchableOpacity
                      key={ville}
                      style={[
                        styles.villeChip,
                        selectedVille === ville && styles.villeChipSelected,
                      ]}
                      onPress={() =>
                        setSelectedVille(selectedVille === ville ? '' : ville)
                      }
                    >
                      <Text
                        style={[
                          styles.villeChipText,
                          selectedVille === ville && styles.villeChipTextSelected,
                        ]}
                      >
                        {ville}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Fourchette de prix (FCFA)</Text>
                <View style={styles.priceInputs}>
                  <TextInput
                    style={styles.priceInput}
                    value={prixMin}
                    onChangeText={setPrixMin}
                    placeholder="Min"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="numeric"
                  />
                  <View style={styles.priceSeparator}>
                    <Text style={styles.priceSeparatorText}>à</Text>
                  </View>
                  <TextInput
                    style={styles.priceInput}
                    value={prixMax}
                    onChangeText={setPrixMax}
                    placeholder="Max"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    paddingVertical: SPACING.xs,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryFaded + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  villesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  villeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  villeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  villeChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
  },
  villeChipTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    textAlign: 'center',
  },
  priceSeparator: {
    paddingHorizontal: SPACING.sm,
  },
  priceSeparatorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  resetButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
