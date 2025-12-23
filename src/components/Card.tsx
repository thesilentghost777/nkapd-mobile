import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outline';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'outline') {
    return <View style={[styles.outline, style]}>{children}</View>;
  }

  return <View style={[styles.default, style]}>{children}</View>;
};

interface BalanceCardProps {
  solde: number;
  onRecharge?: () => void;
  onRetrait?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ solde }) => {
  // Utiliser un état local pour forcer la mise à jour
  const [displaySolde, setDisplaySolde] = useState(solde);

  // Mettre à jour l'état local quand la prop change
  useEffect(() => {
    console.log('BalanceCard - solde reçu:', solde);
    setDisplaySolde(solde);
  }, [solde]);

  const formatMoney = (amount: number) => {
    // Assurer que amount est bien un nombre
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return numAmount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' FCFA';
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <View style={styles.balancePattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
      </View>
      <Text style={styles.balanceLabel}>Solde disponible</Text>
      <Text style={styles.balanceAmount}>{formatMoney(displaySolde)}</Text>
      <View style={styles.goldAccent} />
    </LinearGradient>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = COLORS.primary,
}) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  gradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  outline: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  balanceCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.large,
  },
  balancePattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.secondary + '15',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white + '10',
  },
  balanceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  goldAccent: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 60,
    height: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statTitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});