import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#4A1A6B',
  primaryLight: '#6B2D91',
  primaryDark: '#2E0E44',
  secondary: '#D4A017',
  secondaryLight: '#F5C842',
  gold: '#FFD700',
  white: '#FFFFFF',
  background: '#F5F3F7',
};

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const features = [
    {
      icon: 'people',
      title: 'Tontines Rentables',
      description: 'Créez et rejoignez des tontines pour multiplier vos gains',
    },
    {
      icon: 'gift',
      title: 'Bonus de Parrainage',
      description: 'Gagnez 500 FCFA pour chaque membre parrainé actif',
    },
    {
      icon: 'bag',
      title: 'Espace Business',
      description: 'Achetez et vendez vos produits avec visibilité équitable',
    },
    {
      icon: 'heart',
      title: 'Espace Rencontre',
      description: 'Trouvez l\'amour, des partenaires business ou de nouveaux amis',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="cash" size={60} color={COLORS.gold} />
            </View>
            <Text style={styles.appName}>Nkap Dey</Text>
            <Text style={styles.tagline}>
              Gagnez de l'argent ensemble, grandissez ensemble
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* How it works */}
          <View style={styles.howItWorksSection}>
            <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Inscrivez-vous avec ou sans code de parrainage
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Rechargez votre compte et créez votre première tontine
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Invitez des membres et multipliez vos gains
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Retirez vos bénéfices quand vous voulez
              </Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Connexion</Text>
            </TouchableOpacity>
          </View>

         
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.secondaryLight,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
    fontWeight: '500',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    paddingHorizontal: 40,
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});