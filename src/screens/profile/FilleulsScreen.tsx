import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface Filleul {
  id: number;
  nom_complet: string;
  date_inscription: string;
  a_participe_tontine: boolean;
  photo_profil: string | null;
}

interface Stats {
  nombre_filleuls: number;
  filleuls_actifs: number;
  total_bonus: number;
  bonus_par_filleul: number;
  code_parrainage: string;
}

export const FilleulsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [filleuls, setFilleuls] = useState<Filleul[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filleulsRes, statsRes] = await Promise.all([
        api.getFilleuls(),
        api.getStatistiquesParrainage(),
      ]);
     
      // Log pour déboguer
      console.log('Filleuls response:', filleulsRes.data);
      console.log('Stats response:', statsRes.data);
     
      setFilleuls(filleulsRes.data.filleuls || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Load filleuls error:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (stats?.code_parrainage || user?.code_parrainage) {
      Clipboard.setString(stats?.code_parrainage || user?.code_parrainage);
      alert('Code copié dans le presse-papier !');
    }
  };

  const handleShare = async () => {
    try {
      const code = stats?.code_parrainage || user?.code_parrainage;
      await Share.share({
        message: `Rejoignez Nkap D avec mon code parrain: ${code}\n\nTéléchargez l'application et profitez de tous nos services !`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Fonction améliorée pour formater la date (en supposant format DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
   
    try {
      // Split DD/MM/YYYY
      const parts = dateString.split('/');
      if (parts.length !== 3) {
        return 'Date invalide';
      }
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
     
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Format date error:', error);
      return 'Date invalide';
    }
  };

  const formatMoney = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0 FCFA';
    }
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  // Fonction pour obtenir les initiales à partir de nom_complet
  const getInitials = (nom_complet?: string) => {
    if (nom_complet && nom_complet.length > 0) {
      const words = nom_complet.trim().split(/\s+/);
      return words[0].charAt(0).toUpperCase();
    }
    return '?';
  };

  // Fonction pour formater le nom complet
  const getFullName = (nom_complet?: string) => {
    if (!nom_complet) {
      return 'Utilisateur inconnu';
    }
    return nom_complet.trim();
  };

  // Déterminer le statut
  const getStatut = (a_participe_tontine: boolean) => {
    return a_participe_tontine ? 'actif' : 'inactif';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Filleuls</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Filleuls</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Code Parrainage Card */}
        <Card variant="gradient">
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Votre code parrain</Text>
            <Text style={styles.codeValue}>{stats?.code_parrainage || user?.code_parrainage || 'N/A'}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeBtn} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={18} color={COLORS.white} />
                <Text style={styles.codeBtnText}>Copier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.codeBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={18} color={COLORS.white} />
                <Text style={styles.codeBtnText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="people" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{stats.nombre_filleuls || 0}</Text>
                <Text style={styles.statLabel}>Total filleuls</Text>
              </Card>
              <Card style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
                <Text style={styles.statValue}>{stats.filleuls_actifs || 0}</Text>
                <Text style={styles.statLabel}>Actifs</Text>
              </Card>
            </View>
            <Card style={styles.gainsCard}>
              <View style={styles.gainsRow}>
                <View style={styles.gainsItem}>
                  <Text style={styles.gainsLabel}>Gains totaux</Text>
                  <Text style={styles.gainsValue}>{formatMoney(stats.total_bonus)}</Text>
                </View>
                <View style={styles.gainsDivider} />
                <View style={styles.gainsItem}>
                  <Text style={styles.gainsLabel}>Ce mois</Text>
                  <Text style={[styles.gainsValue, { color: COLORS.success }]}>
                    {formatMoney(stats.gains_ce_mois || 0)} {/* Ajout d'une valeur par défaut si absent */}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
        {/* Liste des filleuls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Liste des filleuls ({filleuls.length})
          </Text>
          {filleuls.length === 0 ? (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={60} color={COLORS.gray400} />
                <Text style={styles.emptyText}>Aucun filleul pour le moment</Text>
                <Text style={styles.emptySubtext}>
                  Partagez votre code pour commencer à parrainer
                </Text>
              </View>
            </Card>
          ) : (
            filleuls.map((filleul) => (
              <Card key={filleul.id} style={styles.filleulCard}>
                <View style={styles.filleulHeader}>
                  <View style={styles.filleulAvatar}>
                    <Text style={styles.filleulInitial}>
                      {getInitials(filleul.nom_complet)}
                    </Text>
                  </View>
                  <View style={styles.filleulInfo}>
                    <Text style={styles.filleulName}>
                      {getFullName(filleul.nom_complet)}
                    </Text>
                    
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      getStatut(filleul.a_participe_tontine) === 'actif' && styles.statusBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        getStatut(filleul.a_participe_tontine) === 'actif' && styles.statusTextActive,
                      ]}
                    >
                      {getStatut(filleul.a_participe_tontine)}
                    </Text>
                  </View>
                </View>
                <View style={styles.filleulFooter}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.gray500} />
                  <Text style={styles.filleulDate}>
                    Inscrit le {formatDate(filleul.date_inscription)}
                  </Text>
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
  shareBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  codeCard: {
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginBottom: SPACING.xs,
  },
  codeValue: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 4,
    marginBottom: SPACING.lg,
  },
  codeActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  codeBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  gainsCard: {
    padding: SPACING.lg,
  },
  gainsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gainsItem: {
    flex: 1,
    alignItems: 'center',
  },
  gainsDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray200,
  },
  gainsLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  gainsValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  filleulCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  filleulHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  filleulAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  filleulInitial: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  filleulInfo: {
    flex: 1,
  },
  filleulName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  filleulEmail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  filleulPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray200,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.success + '20',
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray600,
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: COLORS.success,
  },
  filleulFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    gap: SPACING.xs,
  },
  filleulDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
  },
});