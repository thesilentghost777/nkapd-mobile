import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Input, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    code_parrainage: '',
    date_naissance: '',
    sexe: '',
    ville: '',
  });

  const [parrainInfo, setParrainInfo] = useState<{ prenom: string; nom: string } | null>(null);
  const { register } = useAuthStore();

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      updateForm('date_naissance', formatDate(date));
    }
  };

  const verifyParrainCode = async () => {
    if (!formData.code_parrainage.trim()) {
      setParrainInfo(null);
      return;
    }

    try {
      const response = await api.verifierCodeParrainage(formData.code_parrainage);
      if (response.data.success) {
        setParrainInfo(response.data.parrain);
      } else {
        setParrainInfo(null);
      }
    } catch (err) {
      setParrainInfo(null);
    }
  };

  const validateStep1 = () => {
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError('Veuillez entrer votre nom et prénom');
      setShowError(true);
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Veuillez entrer un email valide');
      setShowError(true);
      return false;
    }
    if (!formData.telephone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone');
      setShowError(true);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setShowError(true);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setShowError(true);
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.date_naissance.trim()) {
      setError('Veuillez entrer votre date de naissance');
      setShowError(true);
      return false;
    }
    if (!formData.sexe) {
      setError('Veuillez sélectionner votre sexe');
      setShowError(true);
      return false;
    }
    if (!formData.ville.trim()) {
      setError('Veuillez entrer votre ville');
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        password: formData.password,
        code_parrainage: formData.code_parrainage || undefined,
        date_naissance: formData.date_naissance,
        sexe: formData.sexe,
        ville: formData.ville,
      });
    } catch (err: any) {
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Input
        label="Nom"
        placeholder="Votre nom"
        value={formData.nom}
        onChangeText={(v) => updateForm('nom', v)}
        leftIcon="person-outline"
      />
      <Input
        label="Prénom"
        placeholder="Votre prénom"
        value={formData.prenom}
        onChangeText={(v) => updateForm('prenom', v)}
        leftIcon="person-outline"
      />
      <Input
        label="Email"
        placeholder="votre@email.com"
        value={formData.email}
        onChangeText={(v) => updateForm('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
      />
      <Input
        label="Téléphone"
        placeholder="+237 6XX XXX XXX"
        value={formData.telephone}
        onChangeText={(v) => updateForm('telephone', v)}
        keyboardType="phone-pad"
        leftIcon="call-outline"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Input
        label="Mot de passe"
        placeholder="Minimum 6 caractères"
        value={formData.password}
        onChangeText={(v) => updateForm('password', v)}
        isPassword
        leftIcon="lock-closed-outline"
      />
      <Input
        label="Confirmer le mot de passe"
        placeholder="Confirmez votre mot de passe"
        value={formData.confirmPassword}
        onChangeText={(v) => updateForm('confirmPassword', v)}
        isPassword
        leftIcon="lock-closed-outline"
      />
      <Input
        label="Code de parrainage (optionnel)"
        placeholder="Code parrain (ex: ABC123)"
        value={formData.code_parrainage}
        onChangeText={(v) => {
          updateForm('code_parrainage', v);
          setParrainInfo(null);
        }}
        onBlur={verifyParrainCode}
        leftIcon="gift-outline"
      />
      {parrainInfo && (
        <View style={styles.parrainInfo}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.parrainText}>
            Parrainé par: {parrainInfo.prenom} {parrainInfo.nom}
          </Text>
        </View>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.fieldLabel}>Date de naissance</Text>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={[
          styles.datePickerText,
          !formData.date_naissance && styles.datePickerPlaceholder
        ]}>
          {formData.date_naissance || 'Sélectionner une date'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.gray400} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          locale="fr-FR"
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <TouchableOpacity
          style={styles.datePickerConfirm}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.datePickerConfirmText}>Confirmer</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.fieldLabel}>Sexe</Text>
      <View style={styles.sexeContainer}>
        <TouchableOpacity
          style={[
            styles.sexeOption,
            formData.sexe === 'homme' && styles.sexeSelected,
          ]}
          onPress={() => updateForm('sexe', 'homme')}
        >
          <Ionicons
            name="male"
            size={24}
            color={formData.sexe === 'homme' ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.sexeText,
              formData.sexe === 'homme' && styles.sexeTextSelected,
            ]}
          >
            Homme
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sexeOption,
            formData.sexe === 'femme' && styles.sexeSelected,
          ]}
          onPress={() => updateForm('sexe', 'femme')}
        >
          <Ionicons
            name="female"
            size={24}
            color={formData.sexe === 'femme' ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.sexeText,
              formData.sexe === 'femme' && styles.sexeTextSelected,
            ]}
          >
            Femme
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Ville"
        placeholder="Votre ville"
        value={formData.ville}
        onChangeText={(v) => updateForm('ville', v)}
        leftIcon="location-outline"
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inscription</Text>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.stepDot, s <= step && styles.stepDotActive]}
            />
          ))}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.stepTitle}>
            {step === 1 && 'Informations personnelles'}
            {step === 2 && 'Sécurité'}
            {step === 3 && 'Détails supplémentaires'}
          </Text>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <Button
            title={step < 3 ? 'Continuer' : "S'inscrire"}
            onPress={step < 3 ? handleNextStep : handleRegister}
            isLoading={isLoading}
            size="lg"
            style={styles.button}
          />

          {step === 1 && (
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginLinkText}>
                Déjà un compte ?{' '}
                <Text style={styles.loginLinkBold}>Connectez-vous</Text>
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={showError}
        type="error"
        title="Erreur"
        message={error}
        onClose={() => setShowError(false)}
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
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stepDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white + '40',
  },
  stepDotActive: {
    backgroundColor: COLORS.secondary,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.xl,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  stepTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.xl,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  datePickerText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray800,
  },
  datePickerPlaceholder: {
    color: COLORS.gray400,
  },
  datePickerConfirm: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  datePickerConfirmText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  sexeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  sexeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  sexeSelected: {
    backgroundColor: COLORS.primary,
  },
  sexeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.primary,
  },
  sexeTextSelected: {
    color: COLORS.white,
  },
  parrainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  parrainText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  button: {
    marginTop: SPACING.lg,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginLinkText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});