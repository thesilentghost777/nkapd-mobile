import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  TouchableOpacity 
} from 'react-native';
import { useTransactionStore } from '../../store/transactionStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const TransactionsScreen = () => {
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTransactions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTransactionConfig = (type: string) => {
    const configs: Record<string, { color: string; icon: string; bgColor: string }> = {
      recharge: { 
        color: COLORS.success, 
        icon: '↓', 
        bgColor: COLORS.success + '15' 
      },
      gain_tontine: { 
        color: COLORS.success, 
        icon: '★', 
        bgColor: COLORS.success + '15' 
      },
      retrait: { 
        color: COLORS.error, 
        icon: '↑', 
        bgColor: COLORS.error + '15' 
      },
      transfert_envoye: { 
        color: COLORS.error, 
        icon: '→', 
        bgColor: COLORS.error + '15' 
      },
      default: { 
        color: COLORS.info, 
        icon: '•', 
        bgColor: COLORS.info + '15' 
      }
    };
    return configs[type] || configs.default;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderItem = ({ item, index }: any) => {
    const config = getTransactionConfig(item.type);
    const itemAnim = new Animated.Value(0);

    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View 
        style={[
          styles.cardWrapper,
          {
            opacity: itemAnim,
            transform: [{
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.card, SHADOWS.small]}
        >
          <View style={styles.cardContent}>
            {/* Icône et type */}
            <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
              <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
            </View>

            {/* Informations principales */}
            <View style={styles.infoContainer}>
              <View style={styles.headerRow}>
                <Text style={[styles.type, { color: config.color }]}>
                  {item.type.replace('_', ' ').toUpperCase()}
                </Text>
                <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
                  <Text style={[styles.badgeText, { color: config.color }]}>
                    {item.type.includes('recharge') || item.type.includes('gain') ? '+' : '-'}
                  </Text>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.footer}>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                <Text style={[styles.amount, { color: config.color }]}>
                  {item.montant.toLocaleString()} FCFA
                </Text>
              </View>
            </View>
          </View>

          {/* Barre latérale colorée */}
          <View style={[styles.sideBar, { backgroundColor: config.color }]} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {transactions.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
          </View>
          <Text style={styles.emptyTitle}>Aucune transaction</Text>
          <Text style={styles.emptySubtitle}>
            Vos transactions apparaîtront ici
          </Text>
        </Animated.View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Historique</Text>
            <Text style={styles.headerSubtitle}>
              {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
            </Text>
          </View>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    fontFamily: FONTS.medium,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontFamily: FONTS.regular,
  },
  listContent: {
    padding: SPACING.lg,
  },
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: FONTS.sizes.xxl,
    fontFamily: FONTS.bold,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  type: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bold,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    fontFamily: FONTS.regular,
  },
  amount: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
  },
  sideBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
});