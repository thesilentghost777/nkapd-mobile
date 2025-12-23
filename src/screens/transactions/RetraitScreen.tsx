import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
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

export const RetraitScreen: React.FC<Props> = ({ navigation }) => {
  const [montant, setMontant] = useState('');
  const [telephone, setTelephone] = useState('');
  const [operateur, setOperateur] = useState<'orange_money' | 'mtn_momo'>('orange_money');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'info' as any, title: '', message: '' });
  
  const { solde, retirer } = useTransactionStore();
  const maxRetrait = Math.max(0, solde - 1500);
  const frais = montant ? Math.ceil(parseInt(montant) * 0.25) : 0;
  const netRecu = montant ? parseInt(montant) - frais : 0;

  const handleRetrait = async () => {
    const montantNum = parseInt(montant);
    
    if (!montant || montantNum < 100) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Le montant minimum de retrait est de 100 FCFA',
      });
      return;
    }

    if (!telephone || telephone.length < 9) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez entrer un numéro de téléphone valide',
      });
      return;
    }

    if (montantNum > maxRetrait) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: `Vous ne pouvez retirer que ${maxRetrait.toLocaleString()} FCFA maximum (solde minimum: 1500 FCFA)`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await retirer(montantNum, telephone, operateur);
      setAlert({
        show: true,
        type: result.success ? 'success' : 'error',
        title: result.success ? 'Retrait en cours' : 'Erreur',
        message: result.success 
          ? `Votre retrait de ${result.montant_net.toLocaleString()} FCFA est en cours de traitement sur le ${telephone}. Vous recevrez une notification une fois terminé.`
          : result.message
      });
      
      if (result.success) {
        setTimeout(() => {
          navigation.goBack();
        }, 3000);
      }
    } catch (err: any) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue',
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
        <Text style={styles.headerTitle}>Retrait</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card variant="gradient" style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>{solde.toLocaleString()} FCFA</Text>
            <Text style={styles.maxRetrait}>
              Retrait max: {maxRetrait.toLocaleString()} FCFA
            </Text>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Montant à retirer</Text>
            <Input
              placeholder="Entrez le montant"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
              leftIcon="cash-outline"
            />
            <TouchableOpacity
              style={styles.maxButton}
              onPress={() => setMontant(maxRetrait.toString())}
            >
              <Text style={styles.maxButtonText}>Retirer le maximum</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Numéro de téléphone</Text>
            <Input
              placeholder="Ex: 690123456"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              maxLength={9}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opérateur</Text>
            <View style={styles.operateurContainer}>
              <TouchableOpacity
                style={[
                  styles.operateurButton,
                  operateur === 'orange_money' && styles.operateurButtonActive,
                ]}
                onPress={() => setOperateur('orange_money')}
              >
                <Image
                  source={{ uri: 'https://1000logos.net/wp-content/uploads/2021/02/Orange-Money-logo.png' }}
                  style={styles.operateurIcon}
                />
                <Text style={[styles.operateurText, operateur === 'orange_money' && styles.operateurTextActive]}>
                  Orange Money
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.operateurButton,
                  operateur === 'mtn_momo' && styles.operateurButtonActive,
                ]}
                onPress={() => setOperateur('mtn_momo')}
              >
              <Image
                  source={{ uri: 'https://mtn.cm/wp-content/uploads/2023/10/Icon_MoMo-1-1024x812.png'}}
                  style={styles.operateurIcon}
                />
                <Text style={[styles.operateurText, operateur === 'mtn_momo' && styles.operateurTextActive]}>
                  Mtn Mobile Money
                </Text>
               
              </TouchableOpacity>
            </View>
          </View>

          {montant && parseInt(montant) > 0 && (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant demandé</Text>
                <Text style={styles.summaryValue}>{parseInt(montant).toLocaleString()} F</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais (25%)</Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                  -{frais.toLocaleString()} F
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Vous recevrez</Text>
                <Text style={styles.totalValue}>{netRecu.toLocaleString()} F</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sur le numéro</Text>
                <Text style={styles.summaryValue}>{telephone || '---'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Via</Text>
                <Text style={styles.summaryValue}>
                  {operateur === 'orange_money' ? 'Orange Money' : 'MTN Mobile Money'}
                </Text>
              </View>
            </Card>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                Le retrait sera traité automatiquement via MoneyFusion. Assurez-vous que le numéro saisi est actif et peut recevoir de l'argent.
              </Text>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Des frais de 25% sont appliqués sur chaque retrait. Le solde minimum de 1500 FCFA doit être maintenu.
            </Text>
          </View>

          <Button
            title="Confirmer le retrait"
            onPress={handleRetrait}
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
    color: COLORS.white + 'CC',
  },
  balanceAmount: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  maxRetrait: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  maxButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  maxButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  operateurContainer: {
    gap: SPACING.md,
  },
  operateurButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  operateurButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  operateurIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: SPACING.sm,
  },
  mtnIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#FFCC00',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mtnIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  operateurText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  operateurTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
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
    color: COLORS.success,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  button: {
    marginBottom: SPACING.xxl,
  },
});