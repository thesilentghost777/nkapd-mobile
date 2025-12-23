import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [identifiant, setIdentifiant] = useState(''); // Email OU téléphone
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!identifiant.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(identifiant.trim(), password);
    } catch (err: any) {
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifiant.trim()) {
      Alert.alert(
        'Identifiant requis',
        'Veuillez entrer votre email ou numéro de téléphone avant de contacter le support.',
        [{ text: 'OK' }]
      );
      return;
    }

    const message = `Bonjour, j'ai oublié mon mot de passe.\n\nEmail/Téléphone de mon compte : ${identifiant.trim()}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=237696087354&text=${encodedMessage}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp non disponible',
          'WhatsApp n\'est pas installé sur votre appareil. Veuillez contacter le support au +237 696 087 354.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir WhatsApp. Veuillez contacter le support au +237 696 087 354.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.appName}>Nkap Dey</Text>
          <Text style={styles.tagline}>L'argent qui rapporte</Text>
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
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour accéder à votre compte
          </Text>

          <Input
            label="Email ou Téléphone"
            placeholder="votre@email.com ou 690000000"
            value={identifiant}
            onChangeText={setIdentifiant}
            autoCapitalize="none"
            leftIcon="person-outline"
          />

          <Input
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            isLoading={isLoading}
            size="lg"
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Créer un compte"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="lg"
          />

          <Text style={styles.infoText}>
            💡 Vous pouvez vous connecter avec votre email ou votre numéro de téléphone
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={showError}
        type="error"
        title="Erreur de connexion"
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
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tagline: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
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
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginBottom: SPACING.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray300,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  infoText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
});