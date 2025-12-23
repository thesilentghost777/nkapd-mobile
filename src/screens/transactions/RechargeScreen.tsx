import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useTransactionStore } from '../../store/transactionStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const PAYMENT_METHODS = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    image: { uri: 'https://1000logos.net/wp-content/uploads/2021/02/Orange-Money-logo.jpg' }
  },
  {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    image: { uri: 'https://mtn.cm/wp-content/uploads/2023/10/Icon_MoMo-1-1024x812.png' }
  },
];

export const RechargeScreen: React.FC<Props> = ({ navigation }) => {
  const [montant, setMontant] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentToken, setPaymentToken] = useState('');
  const [alert, setAlert] = useState({ show: false, type: 'info' as any, title: '', message: '' });

  const webViewRef = useRef<WebView>(null);
  const { recharger, fetchSolde } = useTransactionStore();

  const handleRecharge = async () => {
    if (!montant || parseInt(montant) < 100) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Le montant minimum est de 100 FCFA',
      });
      return;
    }

    if (!selectedMethod) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner un mode de paiement',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await recharger(parseInt(montant), selectedMethod, '');
      
      if (result.success && result.payment_url) {
        setPaymentUrl(result.payment_url);
        setPaymentToken(result.token);
        setShowWebView(true);
      } else {
        throw new Error(result.message || 'Erreur lors de l\'initialisation du paiement');
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

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    console.log('WebView URL:', url);

    // Détecter la redirection vers la page de retour
    if (url.includes('/payment/return') || url.includes('payment-success')) {
      setShowWebView(false);
      setAlert({
        show: true,
        type: 'info',
        title: 'Paiement en cours',
        message: 'Votre paiement est en cours de traitement. Vous recevrez une notification une fois terminé.',
      });
      
      // Actualiser le solde après quelques secondes
      setTimeout(() => {
        fetchSolde();
        navigation.goBack();
      }, 3000);
    }
  };

  const closeWebView = () => {
    setShowWebView(false);
    setAlert({
      show: true,
      type: 'warning',
      title: 'Paiement annulé',
      message: 'Vous avez fermé la page de paiement.',
    });
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharger</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Montant à recharger</Text>
            <Input
              placeholder="Entrez le montant"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
              leftIcon="cash-outline"
            />
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmount,
                    montant === amount.toString() && styles.quickAmountSelected,
                  ]}
                  onPress={() => setMontant(amount.toString())}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      montant === amount.toString() && styles.quickAmountTextSelected,
                    ]}
                  >
                    {amount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode de paiement</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethod === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Image 
                  source={method.image} 
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentName}>{method.name}</Text>
                {selectedMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Continuer vers le paiement"
            onPress={handleRecharge}
            isLoading={isLoading}
            size="lg"
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* WebView Modal pour le paiement */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={closeWebView}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Paiement sécurisé</Text>
            <TouchableOpacity onPress={closeWebView}>
              <Ionicons name="close" size={28} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          
          {paymentUrl ? (
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              style={styles.webView}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Chargement du portail de paiement...</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        </SafeAreaView>
      </Modal>

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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickAmount: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  quickAmountSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  quickAmountTextSelected: {
    color: COLORS.white,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    marginBottom: SPACING.sm,
  },
  paymentMethodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    marginRight: SPACING.md,
  },
  paymentName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: '500',
  },
  button: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  webViewTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
});