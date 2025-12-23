import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const MessagesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </LinearGradient>

      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color={COLORS.primary} />
        </View>
        
        <Text style={styles.title}>Bientôt disponible</Text>
        
        <Text style={styles.description}>
          La messagerie sera disponible très prochainement.{'\n'}
          Vous pourrez bientôt échanger avec les autres membres !
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.featureText}>Messages instantanés</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.featureText}>Notifications en temps réel</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.featureText}>Historique des conversations</Text>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  featureList: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  featureText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    marginLeft: SPACING.md,
  },
});