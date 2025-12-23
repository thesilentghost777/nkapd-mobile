import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Card, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../services/api';
import { MainStackParamList } from '../../navigation';

type Props = NativeStackScreenProps<MainStackParamList, 'TontineDetails'>;

interface Membre {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  montant_paye: number;
  date_adhesion: string;
}

interface TontineDetails {
  id: number;
  nom: string;
  code: string;
  prix: number;
  nombre_membres: number;
  membres_actuels: number;
  montant_collecte: number;
  statut: string;
  createur: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export const TontineDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { tontineId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tontine, setTontine] = useState<TontineDetails | null>(null);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [estCreateur, setEstCreateur] = useState(false);
  const [estMembre, setEstMembre] = useState(false);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getTontineDetails(tontineId);
      
      if (response.data.success) {
        setTontine(response.data.tontine);
        setMembres(response.data.membres || []);
        setEstCreateur(response.data.est_createur);
        setEstMembre(response.data.est_membre);
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la tontine');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetails();
    setRefreshing(false);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copié !', 'Le code a été copié dans le presse-papier');
  };

  const formatMoney = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof numAmount !== 'number' || isNaN(numAmount)) return '0 F';
  return numAmount.toLocaleString('fr-FR') + ' F';
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tontine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray300} />
          <Text style={styles.errorText}>Tontine introuvable</Text>
          <Button title="Retour" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const progress = parseInt(tontine.nombre_membres) > 0 
  ? (parseInt(tontine.membres_actuels) / parseInt(tontine.nombre_membres)) * 100 
  : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{tontine.nom}</Text>
          <TouchableOpacity 
            onPress={() => copyToClipboard(tontine.code)}
            style={styles.codeButton}
          >
            <Text style={styles.headerCode}>{tontine.code}</Text>
            <Ionicons name="copy-outline" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Prix</Text>
              <Text style={styles.infoValue}>{formatMoney(tontine.prix)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Statut</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      tontine.statut === 'ouvert' ? COLORS.success + '20' : COLORS.gray300,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: tontine.statut === 'ouvert' ? COLORS.success : COLORS.gray500 },
                  ]}
                >
                  {tontine.statut === 'ouvert' ? 'Ouvert' : 'Fermé'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progression</Text>
              <Text style={styles.progressValue}>
                {tontine.membres_actuels}/{tontine.nombre_membres} membres
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Montant collecté</Text>
            <Text style={styles.amountValue}>{formatMoney(tontine.montant_collecte)}</Text>
          </View>

          <View style={styles.creatorSection}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.gray500} />
            <Text style={styles.creatorText}>
              Créé par {tontine.createur.prenom} {tontine.createur.nom}
            </Text>
          </View>
        </Card>

        {/* Membres List */}
        <View style={styles.membresSection}>
          <View style={styles.membresSectionHeader}>
            <Text style={styles.membresTitle}>
              Membres ({membres.length})
            </Text>
            {estCreateur && (
              <View style={styles.creatorBadge}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.creatorBadgeText}>Créateur</Text>
              </View>
            )}
            {estMembre && !estCreateur && (
              <View style={[styles.creatorBadge, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                <Text style={[styles.creatorBadgeText, { color: COLORS.primary }]}>Membre</Text>
              </View>
            )}
          </View>

          {membres.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>Aucun membre pour le moment</Text>
            </Card>
          ) : (
            membres.map((membre) => (
              <Card key={membre.id} style={styles.membreCard}>
                <View style={styles.membreHeader}>
                  <View style={styles.membreAvatar}>
                    <Text style={styles.membreAvatarText}>
                      {membre.prenom.charAt(0)}{membre.nom.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.membreInfo}>
                    <Text style={styles.membreName}>
                      {membre.prenom} {membre.nom}
                    </Text>
                    <Text style={styles.membrePhone}>{membre.telephone}</Text>
                  </View>
                  <View style={styles.membreAmount}>
                    <Text style={styles.membreAmountValue}>
                      {formatMoney(membre.montant_paye)}
                    </Text>
                    <Text style={styles.membreDate}>{formatDate(membre.date_adhesion)}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray500,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  headerCode: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    margin: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  progressValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.black,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  amountSection: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    marginBottom: SPACING.md,
  },
  amountLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  creatorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  creatorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  membresSection: {
    padding: SPACING.lg,
  },
  membresSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  membresTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  creatorBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  membreCard: {
    marginBottom: SPACING.md,
  },
  membreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membreAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membreAvatarText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  membreInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  membreName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
  },
  membrePhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  membreAmount: {
    alignItems: 'flex-end',
  },
  membreAmountValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  membreDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
});