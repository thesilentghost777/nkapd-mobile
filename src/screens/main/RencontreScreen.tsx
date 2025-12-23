import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const RencontreScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rencontres</Text>
          <Text style={styles.headerSubtitle}>Trouvez l'amour ou des partenaires</Text>
        </View>
      </LinearGradient>

      {/* Coming Soon Content */}
      <View style={styles.comingSoonContainer}>
        <LinearGradient
          colors={[COLORS.primaryFaded, COLORS.secondaryLight]}
          style={styles.iconContainer}
        >
          <Ionicons name="time-outline" size={80} color={COLORS.primary} />
        </LinearGradient>
        
        <Text style={styles.comingSoonTitle}>Bientôt disponible</Text>
        <Text style={styles.comingSoonDescription}>
          La fonctionnalité de rencontres sera disponible très prochainement.
          Nous travaillons activement pour vous offrir la meilleure expérience possible.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Rencontres amoureuses</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="briefcase" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Partenaires business</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Autres connexions</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    ...SHADOWS.medium,
  },
  headerTitle: {
    ...FONTS.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...FONTS.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  comingSoonTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  comingSoonDescription: {
    ...FONTS.body,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  featureText: {
    ...FONTS.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  backButton: {
    width: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  backButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
});