import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, AlertModal, Card } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useTransactionStore } from '../../store/transactionStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const TransfertScreen: React.FC<Props> = ({ navigation }) => {
  const [destinataire, setDestinataire] = useState('');
  const [montant, setMontant] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'info' as any, title: '', message: '' });

  const { solde, transferer } = useTransactionStore();

  const frais = montant ? Math.ceil(parseInt(montant) * 0.05) : 0;
  const totalDebite = montant ? parseInt(montant) + frais : 0;

  const handleTransfert = async () => {
    if (!destinataire.trim()) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez entrer l\'email du destinataire',
      });
      return;
    }

    const montantNum = parseInt(montant);
    if (!montant || montantNum < 100) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Le montant minimum est de 100 FCFA',
      });
      return;
    }

    if (totalDebite > solde) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Solde insuffisant pour ce transfert',
      });
      return;
    }

    setIsLoading(true);
    try {
      await transferer(destinataire.trim(), montantNum);
      setAlert({
        show: true,
        type: 'success',
        title: 'Succès',
        message: `${montantNum.toLocaleString()} FCFA envoyés à ${destinataire}`,
      });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: any) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfert</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Balance Info */}
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Votre solde</Text>
            <Text style={styles.balanceAmount}>{solde.toLocaleString()} FCFA</Text>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destinataire</Text>
            <Input
              placeholder="Email du destinataire"
              value={destinataire}
              onChangeText={setDestinataire}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="person-outline"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Montant à envoyer</Text>
            <Input
              placeholder="Entrez le montant"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
              leftIcon="cash-outline"
            />
          </View>

          {montant && parseInt(montant) > 0 && (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant envoyé</Text>
                <Text style={styles.summaryValue}>{parseInt(montant).toLocaleString()} F</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais (5%)</Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                  +{frais.toLocaleString()} F
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total débité</Text>
                <Text style={styles.totalValue}>{totalDebite.toLocaleString()} F</Text>
              </View>
            </Card>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              Des frais de 5% sont appliqués sur chaque transfert entre utilisateurs.
            </Text>
          </View>

          <Button
            title="Envoyer"
            onPress={handleTransfert}
            isLoading={isLoading}
            size="lg"
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, show: false })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  balanceCard: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  balanceAmount: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  button: {
    marginBottom: SPACING.xxl,
  },
});
