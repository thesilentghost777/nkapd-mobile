import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Button, Card } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

export const ProfilDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profil } = route.params || {};

  if (!profil) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profil non trouvé</Text>
          <Button title="Retour" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleContact = () => {
    navigation.navigate('Chat', { userId: profil.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {profil.avatar ? (
            <Image source={{ uri: profil.avatar }} style={styles.coverImage} />
          ) : (
            <LinearGradient
              colors={[COLORS.primaryFaded, COLORS.primary]}
              style={styles.coverImage}
            >
              <Text style={styles.coverInitial}>{profil.prenom?.charAt(0)}</Text>
            </LinearGradient>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <Text style={styles.profilName}>
              {profil.prenom}, {profil.age}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.white} />
              <Text style={styles.locationText}>{profil.ville}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Info Cards */}
        <View style={styles.content}>
          {profil.bio && (
            <Card style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                <Text style={styles.cardTitle}>À propos</Text>
              </View>
              <Text style={styles.bioText}>{profil.bio}</Text>
            </Card>
          )}

          <Card style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Informations</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sexe</Text>
              <Text style={styles.infoValue}>
                {profil.sexe === 'M' ? 'Homme' : 'Femme'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoValue}>{profil.ville}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Âge</Text>
              <Text style={styles.infoValue}>{profil.age} ans</Text>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Envoyer un message"
              onPress={handleContact}
              icon={<Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    height: 400,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: {
    fontSize: 120,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingTop: SPACING.xxl * 2,
  },
  profilName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  locationText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
    marginTop: -SPACING.xl,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
  },
  bioText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: '500',
  },
  actions: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
});
