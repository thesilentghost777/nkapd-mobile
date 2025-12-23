import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    ville: user?.ville || '',
    bio: user?.bio || '',
    sexe: user?.sexe || 'homme',
  });

  const villes = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Ngaoundéré'];

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await api.mettreAJourProfil(formData);
      
      if (response.data.success) {
        updateUser(formData);
        setShowSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={formData.nom}
              onChangeText={(text) => setFormData({ ...formData, nom: text })}
              placeholder="Votre nom"
            />
          </View>

          {/* Prénom */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={formData.prenom}
              onChangeText={(text) => setFormData({ ...formData, prenom: text })}
              placeholder="Votre prénom"
            />
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.telephone}
              onChangeText={(text) => setFormData({ ...formData, telephone: text })}
              placeholder="+237 6XX XX XX XX"
              keyboardType="phone-pad"
            />
          </View>

          {/* Ville */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville</Text>
            <View style={styles.selectContainer}>
              {villes.map((ville) => (
                <TouchableOpacity
                  key={ville}
                  style={[
                    styles.selectOption,
                    formData.ville === ville && styles.selectOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, ville })}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      formData.ville === ville && styles.selectOptionTextActive,
                    ]}
                  >
                    {ville}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sexe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sexe</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  formData.sexe === 'homme' && styles.radioOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, sexe: 'homme' })}
              >
                <View style={styles.radioCircle}>
                  {formData.sexe === 'homme' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Homme</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioOption,
                  formData.sexe === 'femme' && styles.radioOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, sexe: 'femme' })}
              >
                <View style={styles.radioCircle}>
                  {formData.sexe === 'femme' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Femme</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Parlez un peu de vous..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            onPress={handleUpdate}
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Ionicons name="save-outline" size={20} color={COLORS.white} />
              )
            }
          />
        </View>
      </ScrollView>

      <AlertModal
        visible={showSuccess}
        type="success"
        title="Succès"
        message="Votre profil a été mis à jour avec succès"
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  textArea: {
    height: 100,
    paddingTop: SPACING.md,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  selectOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectOptionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
  },
  selectOptionTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  radioOptionActive: {},
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
  },
  buttonContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
});