import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BalanceCard, Card, StatCard, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useTontineStore } from '../../store/tontineStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
 
  const { user, loadUser } = useAuthStore();
  const { solde, fetchSolde, transactions, fetchTransactions } = useTransactionStore();
  const { mesCreations, mesAdhesions, fetchMesCreations, fetchMesAdhesions } = useTontineStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingError(null);
 
    try {
      const criticalResults = await Promise.allSettled([
        fetchSolde(),
        fetchTransactions(),
        loadUser(),
      ]);

      console.log('Après fetchSolde(), solde store:', solde);

      await Promise.allSettled([
        fetchMesCreations(),
        fetchMesAdhesions(),
      ]);

      console.log('--- DEBUG STORES ---');
      console.log('User:', user);
      console.log('Code de parrainage:', user?.code_parrainage);
      console.log('Solde:', solde);
      console.log('Transactions:', transactions);
      console.log('Mes Creations:', mesCreations);
      console.log('Mes Adhesions:', mesAdhesions);

      const criticalFailed = criticalResults.some(result => result.status === 'rejected');
      if (criticalFailed) {
        setLoadingError('Certaines données n\'ont pas pu être chargées');
      }

      criticalResults.forEach((result, index) => {
        const names = ['fetchSolde', 'fetchTransactions', 'loadUser'];
        if (result.status === 'rejected') {
          console.error(`${names[index]} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Erreur critique lors du chargement:', error);
      setLoadingError('Erreur de connexion au serveur');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' F';
  };

  // Fonction pour déterminer si une transaction est une entrée ou une sortie
  const isTransactionCredit = (transactionType: string): boolean => {
    const creditTypes = [
      'recharge',
      'transfert_recu',
      'gain_tontine',
      'bonus_parrainage',
      'frais_admin' // Pour le fondateur
    ];
    
    return creditTypes.includes(transactionType);
  };

  // Fonction pour obtenir la couleur selon le type de transaction
  const getTransactionColor = (transactionType: string): string => {
    return isTransactionCredit(transactionType) ? COLORS.success : COLORS.error;
  };

  // Fonction pour obtenir l'icône selon le type de transaction
  const getTransactionIcon = (transactionType: string): 'arrow-down' | 'arrow-up' => {
    return isTransactionCredit(transactionType) ? 'arrow-down' : 'arrow-up';
  };

  // Fonction pour obtenir le préfixe du montant
  const getAmountPrefix = (transactionType: string): string => {
    return isTransactionCredit(transactionType) ? '+' : '-';
  };

  const handleTFSPress = () => {
    Linking.openURL('https://techforgesolutions237.com');
  };

  const handleShareReferralCode = async () => {
    const code = user?.code_parrainage;
    
    if (!code) {
      Alert.alert('Erreur', 'Code de parrainage non disponible');
      return;
    }

    try {
      const message = `Rejoignez-moi sur l'application NkapD disponible sur playstore avec mon code de parrainage : ${code}\n\nGagnez 500 FCFA en participant à votre première tontine !`;
      
      const result = await Share.share({
        message: message,
        title: 'Code de parrainage',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Partagé via:', result.activityType);
        } else {
          console.log('Code partagé avec succès');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Partage annulé');
      }
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de partager le code');
      console.error('Erreur lors du partage:', error);
    }
  };

  const quickActions = [
    {
      icon: 'add-circle-outline',
      label: 'Recharger',
      color: COLORS.success,
      onPress: () => navigation.navigate('Recharge'),
    },
    {
      icon: 'arrow-up-circle-outline',
      label: 'Retirer',
      color: COLORS.error,
      onPress: () => navigation.navigate('Retrait'),
    },
    {
      icon: 'swap-horizontal-outline',
      label: 'Transférer',
      color: COLORS.info,
      onPress: () => navigation.navigate('Transfert'),
    },
    {
      icon: 'people-outline',
      label: 'Tontine',
      color: COLORS.secondary,
      onPress: () => navigation.navigate('TontineTab'),
    },
  ];

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeMesCreations = Array.isArray(mesCreations) ? mesCreations : [];
  const safeMesAdhesions = Array.isArray(mesAdhesions) ? mesAdhesions : [];
  const safeSolde = typeof solde === 'number'
      ? solde
      : (parseFloat(solde) || 0);

  console.log('Render BalanceCard avec solde:', safeSolde);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.userName}>
                {user?.prenom || ''} {user?.nom || ''}
              </Text>
            </View>
          </View>
          <BalanceCard solde={safeSolde} />
        </LinearGradient>

        {/* Error Banner */}
        {loadingError && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning-outline" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{loadingError}</Text>
            <TouchableOpacity onPress={loadData}>
              <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionItem}
              onPress={action.onPress}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsRow}>
            <StatCard
              title="Tontines créées"
              value={safeMesCreations.length}
              icon={<Ionicons name="create-outline" size={20} color={COLORS.primary} />}
            />
            <View style={{ width: SPACING.md }} />
            <StatCard
              title="Tontines rejointes"
              value={safeMesAdhesions.length}
              icon={<Ionicons name="people-outline" size={20} color={COLORS.secondary} />}
              color={COLORS.secondary}
            />
          </View>
        </View>

        {/* Code de parrainage */}
        <View style={styles.section}>
          <Card variant="gradient">
            <View style={styles.parrainageContent}>
              <View>
                <Text style={styles.parrainageTitle}>Votre code de parrainage</Text>
                <Text style={styles.parrainageCode}>{user?.code_parrainage || '---'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.shareBtn}
                onPress={handleShareReferralCode}
                disabled={!user?.code_parrainage}
              >
                <Ionicons name="share-social-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.parrainageHint}>
              Gagnez 500 FCFA pour chaque filleul qui participe à sa première tontine !
            </Text>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {safeTransactions.length > 0 ? (
            safeTransactions.slice(0, 3).map((transaction, index) => {
              const isCredit = isTransactionCredit(transaction.type);
              const transactionColor = getTransactionColor(transaction.type);
              
              return (
                <Card key={transaction.id || index} style={styles.transactionCard}>
                  <View style={styles.transactionItem}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: transactionColor + '20' },
                      ]}
                    >
                      <Ionicons
                        name={getTransactionIcon(transaction.type)}
                        size={20}
                        color={transactionColor}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDesc}>
                        {transaction.description || 'Transaction'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {transaction.created_at || 'Date inconnue'}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: transactionColor },
                      ]}
                    >
                      {getAmountPrefix(transaction.type)}
                      {formatMoney(transaction.montant || 0)}
                    </Text>
                  </View>
                </Card>
              );
            })
          ) : (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={COLORS.gray400} />
                <Text style={styles.emptyText}>Aucune transaction récente</Text>
                <Text style={styles.emptySubtext}>
                  Vos transactions apparaîtront ici
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Footer - Made by TFS237 */}
        <TouchableOpacity
          style={styles.footer}
          onPress={handleTFSPress}
          activeOpacity={0.7}
        >
          <Text style={styles.footerText}>
            Powered by{' '}
            <Text style={styles.tfsText}>TFS237</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl + 60,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white + 'CC',
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: -50,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    ...SHADOWS.medium,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
  },
  parrainageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  parrainageTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
  },
  parrainageCode: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parrainageHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white + 'AA',
  },
  transactionCard: {
    marginBottom: SPACING.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  transactionDesc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray600,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    marginTop: SPACING.md,
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.gray500,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xs,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  heartIcon: {
    color: COLORS.error,
  },
  tfsText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});