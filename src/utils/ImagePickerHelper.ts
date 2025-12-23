// utils/ImagePickerHelper.ts
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ImageFile {
  uri: string;
  type: string;
  fileName: string;
  fileSize?: number;
}

export class ImagePickerHelper {
  /**
   * Demander les permissions
   */
  static async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Nous avons besoin d\'accéder à vos photos pour publier des produits.'
      );
      return false;
    }
    
    return true;
  }

  /**
   * Sélectionner une image
   */
  static async pickImage(): Promise<ImageFile | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Compression pour réduire la taille
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'image/jpeg',
          fileName: `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
      return null;
    }
  }

  /**
   * Sélectionner plusieurs images
   */
  static async pickMultipleImages(maxImages: number = 5): Promise<ImageFile[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages,
      });

      if (!result.canceled) {
        return result.assets.map((asset, index) => ({
          uri: asset.uri,
          type: 'image/jpeg',
          fileName: `photo_${Date.now()}_${index}.jpg`,
          fileSize: asset.fileSize,
        }));
      }

      return [];
    } catch (error) {
      console.error('Erreur sélection images:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner les images');
      return [];
    }
  }

  /**
   * Prendre une photo avec la caméra
   */
  static async takePhoto(): Promise<ImageFile | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Nous avons besoin d\'accéder à votre caméra.'
      );
      return null;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'image/jpeg',
          fileName: `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur prise photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
      return null;
    }
  }

  /**
   * Valider la taille d'une image
   */
  static validateImageSize(image: ImageFile, maxSizeMB: number = 5): boolean {
    if (image.fileSize) {
      const sizeMB = image.fileSize / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        Alert.alert(
          'Image trop volumineuse',
          `L'image ne doit pas dépasser ${maxSizeMB}MB. Taille actuelle: ${sizeMB.toFixed(2)}MB`
        );
        return false;
      }
    }
    return true;
  }
}