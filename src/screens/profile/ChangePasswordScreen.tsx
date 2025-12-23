import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validatePassword = () => {
    if (!formData.currentPassword) {
      setError('Veuillez entrer votre mot de passe actuel');
      return false;
    }

    if (!formData.newPassword) {
      setError('Veuillez entrer un nouveau mot de passe');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    setError('');

    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      
      // Appel API pour changer le mot de passe
      const response = await api.changerMotDePasse(
        formData.currentPassword, 
        formData.newPassword
      );

      console.log('Changement de mot de passe réussi:', response.data);

      // Afficher le message de succès
      setShowSuccess(true);

      // Attendre 2 secondes puis déconnecter l'utilisateur
      setTimeout(async () => {
        try {
          // Déconnecter l'utilisateur
          await logout();
          
          // Rediriger vers la page de connexion
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });

          // Afficher un message informatif
          Alert.alert(
            'Mot de passe modifié',
            'Votre mot de passe a été changé avec succès. Veuillez vous reconnecter avec votre nouveau mot de passe.',
            [{ text: 'OK' }]
          );
        } catch (logoutError) {
          console.error('Erreur lors de la déconnexion:', logoutError);
          // Même en cas d'erreur de déconnexion, rediriger vers la connexion
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }, 2000);

    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error.response?.data);
      
      // Gérer les différents types d'erreurs
      let errorMessage = 'Erreur lors du changement de mot de passe';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'Mot de passe actuel incorrect';
      } else if (error.response?.status === 422) {
        errorMessage = 'Données invalides. Vérifiez vos informations.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;
    if (!password) return null;

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Faible', color: COLORS.error, width: '33%' };
    if (strength <= 3) return { label: 'Moyen', color: COLORS.warning, width: '66%' };
    return { label: 'Fort', color: COLORS.success, width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changer mot de passe</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card>
            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={COLORS.info} />
              <Text style={styles.infoText}>
                Après le changement, vous serez déconnecté et devrez vous reconnecter avec votre nouveau mot de passe.
              </Text>
            </View>

            {/* Mot de passe actuel */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.currentPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, currentPassword: text })
                  }
                  placeholder="Entrez votre mot de passe actuel"
                  secureTextEntry={!showPasswords.current}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                  disabled={loading}
                >
                  <Ionicons
                    name={showPasswords.current ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nouveau mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.newPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, newPassword: text })
                  }
                  placeholder="Entrez votre nouveau mot de passe"
                  secureTextEntry={!showPasswords.new}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() =>
                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                  }
                  disabled={loading}
                >
                  <Ionicons
                    name={showPasswords.new ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        { backgroundColor: passwordStrength.color, width: passwordStrength.width },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirmer mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  placeholder="Confirmez votre nouveau mot de passe"
                  secureTextEntry={!showPasswords.confirm}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  disabled={loading}
                >
                  <Ionicons
                    name={showPasswords.confirm ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              </View>

              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
                  </View>
                )}
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}
          </Card>

          {/* Security Tips */}
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Conseils de sécurité</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Utilisez au moins 8 caractères</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Mélangez lettres majuscules et minuscules</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Incluez des chiffres et caractères spéciaux</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Évitez les informations personnelles</Text>
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Changement en cours...' : 'Changer le mot de passe'}
              onPress={handleChangePassword}
              disabled={loading}
              icon={
                loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Ionicons name="lock-closed" size={20} color={COLORS.white} />
                )
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={showSuccess}
        type="success"
        title="Succès"
        message="Votre mot de passe a été modifié avec succès. Vous allez être déconnecté..."
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    lineHeight: 20,
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
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    paddingRight: 50,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  strengthContainer: {
    marginTop: SPACING.sm,
  },
  strengthBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  errorMessage: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
  },
  tipsCard: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
  },
  buttonContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
});

export default ChangePasswordScreen;