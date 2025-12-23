import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

const CATEGORIES = [
  { key: 'electronique', label: 'Électronique' },
  { key: 'mode', label: 'Mode & Vêtements' },
  { key: 'maison', label: 'Maison & Jardin' },
  { key: 'vehicules', label: 'Véhicules' },
  { key: 'immobilier', label: 'Immobilier' },
  { key: 'emploi', label: 'Emploi & Services' },
  { key: 'loisirs', label: 'Loisirs & Divertissement' },
  { key: 'autre', label: 'Autre' },
];

interface AddProductScreenProps {
  navigation: any;
}

interface ImageItem {
  localUri: string;
  serverUrl: string | null;
  uploading: boolean;
  error: boolean;
}

export default function AddProductScreen({ navigation }: AddProductScreenProps) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [categorie, setCategorie] = useState('');
  const [ville, setVille] = useState('');
  const [telephoneContact, setTelephoneContact] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 5 images');
      return;
    }

    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      
      // Ajouter l'image avec état "uploading"
      const newImage: ImageItem = {
        localUri,
        serverUrl: null,
        uploading: true,
        error: false,
      };
      
      const newImages = [...images, newImage];
      setImages(newImages);
      
      // Upload immédiatement l'image
      await uploadSingleImage(localUri, newImages.length - 1);
    }
  };

  const uploadSingleImage = async (uri: string, index: number) => {
    try {
      const url = await api.uploadImage(uri);
      
      // Mettre à jour l'état avec l'URL du serveur
      setImages(prevImages => {
        const updated = [...prevImages];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            serverUrl: url,
            uploading: false,
            error: false,
          };
        }
        return updated;
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Marquer l'image comme erreur
      setImages(prevImages => {
        const updated = [...prevImages];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            uploading: false,
            error: true,
          };
        }
        return updated;
      });
      
      Alert.alert(
        'Erreur d\'upload', 
        error.message || 'Impossible d\'uploader l\'image. Veuillez réessayer.'
      );
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Supprimer l\'image',
      'Voulez-vous vraiment supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setImages(images.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const retryUpload = async (index: number) => {
    const image = images[index];
    if (!image) return;

    // Marquer comme "uploading"
    setImages(prevImages => {
      const updated = [...prevImages];
      updated[index] = {
        ...updated[index],
        uploading: true,
        error: false,
      };
      return updated;
    });

    await uploadSingleImage(image.localUri, index);
  };

  const validateForm = () => {
    if (!titre.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description');
      return false;
    }
    if (!prix || parseFloat(prix) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return false;
    }
    if (!categorie) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    
    // Vérifier si des images sont en cours d'upload
    const uploadingImages = images.filter(img => img.uploading);
    if (uploadingImages.length > 0) {
      Alert.alert('Attention', 'Veuillez attendre la fin de l\'upload des images');
      return false;
    }
    
    // Vérifier si des images ont échoué
    const failedImages = images.filter(img => img.error);
    if (failedImages.length > 0) {
      Alert.alert(
        'Images non uploadées',
        'Certaines images n\'ont pas pu être uploadées. Voulez-vous continuer sans ces images ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => submitProduct() },
        ]
      );
      return false;
    }
    
    return true;
  };

  const submitProduct = async () => {
    setLoading(true);
    try {
      // Récupérer uniquement les URLs des images uploadées avec succès
      const uploadedImageUrls = images
        .filter(img => img.serverUrl && !img.error)
        .map(img => img.serverUrl as string);

      const response = await api.creerProduit({
        titre: titre.trim(),
        description: description.trim(),
        prix: parseFloat(prix),
        categorie,
        images: uploadedImageUrls,
        ville: ville.trim() || undefined,
        telephone_contact: telephoneContact.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
      });
      
      if (response.data.success) {
        Alert.alert('Succès', 'Votre produit a été publié avec succès', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erreur', response.data.message || 'Une erreur est survenue');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert(
        'Erreur', 
        error.response?.data?.message || 'Impossible de publier le produit'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await submitProduct();
  };

// Suite du fichier AddProductScreen.tsx

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Produit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos du produit</Text>
          <Text style={styles.sectionSubtitle}>Ajoutez jusqu'à 5 photos</Text>
        
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {images.map((item, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: item.localUri }} style={styles.image} />
                
                {/* Overlay si upload en cours */}
                {item.uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color={COLORS.white} size="small" />
                    <Text style={styles.uploadingText}>Upload...</Text>
                  </View>
                )}
                
                {/* Overlay si erreur */}
                {item.error && (
                  <View style={styles.errorOverlay}>
                    <Ionicons name="warning" size={24} color={COLORS.white} />
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => retryUpload(index)}
                    >
                      <Text style={styles.retryText}>Réessayer</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Indicateur de succès */}
                {item.serverUrl && !item.uploading && !item.error && (
                  <View style={styles.successBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  </View>
                )}
                
                {/* Bouton supprimer */}
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          
            {/* Bouton ajouter image */}
            {images.length < 5 && (
              <TouchableOpacity 
                style={styles.addImageBtn} 
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                <Text style={styles.addImageText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Form Fields - Identiques à avant */}
        <View style={styles.section}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: iPhone 13 Pro Max 256GB"
            placeholderTextColor={COLORS.gray400}
            value={titre}
            onChangeText={setTitre}
            maxLength={255}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre produit en détail..."
            placeholderTextColor={COLORS.gray400}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Prix (FCFA) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 250000"
            placeholderTextColor={COLORS.gray400}
            value={prix}
            onChangeText={setPrix}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Catégorie *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text style={categorie ? styles.selectText : styles.selectPlaceholder}>
              {categorie
                ? CATEGORIES.find((c) => c.key === categorie)?.label
                : 'Sélectionner une catégorie'}
            </Text>
            <Ionicons
              name={showCategories ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.gray500}
            />
          </TouchableOpacity>
        
          {showCategories && (
            <View style={styles.categoriesList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryItem,
                    categorie === cat.key && styles.categoryItemActive,
                  ]}
                  onPress={() => {
                    setCategorie(cat.key);
                    setShowCategories(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      categorie === cat.key && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {categorie === cat.key && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ville</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Douala, Yaoundé..."
            placeholderTextColor={COLORS.gray400}
            value={ville}
            onChangeText={setVille}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Téléphone de contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 6XX XXX XXX"
            placeholderTextColor={COLORS.gray400}
            value={telephoneContact}
            onChangeText={setTelephoneContact}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: +237 6XX XXX XXX"
            placeholderTextColor={COLORS.gray400}
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Publier le produit</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  retryText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  successBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  addImageText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
  selectButton: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  selectText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
  },
  selectPlaceholder: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray400,
  },
  categoriesList: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    ...SHADOWS.medium,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  categoryItemActive: {
    backgroundColor: COLORS.primaryFaded + '20',
  },
  categoryText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  submitButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  bottomSpacer: {
    height: 40,
  },
});