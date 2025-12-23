import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, Input, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useTontineStore } from '../../store/tontineStore';
import { useTransactionStore } from '../../store/transactionStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const TontineScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'creations' | 'adhesions'>('creations');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create form
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [nombreMembres, setNombreMembres] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTontineCode, setNewTontineCode] = useState('');

  // Join form
  const [codeTontine, setCodeTontine] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: 'info' as any, title: '', message: '' });

  const {
    mesCreations,
    mesAdhesions,
    tontineRecherchee,
    fetchMesCreations,
    fetchMesAdhesions,
    creerTontine,
    rejoindreTontine,
    rechercherTontine,
    clearRecherche,
  } = useTontineStore();

  const { fetchSolde } = useTransactionStore();

  // CRITICAL FIX: Safely convert to arrays
  const safeMesCreations = Array.isArray(mesCreations) ? mesCreations : [];
  const safeMesAdhesions = Array.isArray(mesAdhesions) ? mesAdhesions : [];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.allSettled([
        fetchMesCreations(),
        fetchMesAdhesions()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des tontines:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!nom.trim() || !prix || !nombreMembres) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs',
      });
      return;
    }

    const prixNum = parseInt(prix);
    const nombreMembresNum = parseInt(nombreMembres);

    if (isNaN(prixNum) || isNaN(nombreMembresNum)) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez entrer des valeurs numériques valides',
      });
      return;
    }

    if (prixNum < 1000 || prixNum % 100 !== 0) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Le prix doit être au minimum 1000F et multiple de 100',
      });
      return;
    }

    if (nombreMembresNum < 2) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Une tontine doit avoir au moins 2 membres',
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await creerTontine(nom, prixNum, nombreMembresNum);
      await fetchSolde();
      await loadData();
      
      // Sauvegarder le code pour l'afficher
      setNewTontineCode(result.code || '');
      
      setShowCreateModal(false);
      setNom('');
      setPrix('');
      setNombreMembres('');
      
      // Afficher le code avec option de copie
      Alert.alert(
        'Tontine créée !',
        `Code de votre tontine: ${result.code}\n\nPartagez ce code avec les membres.`,
        [
          {
            text: 'Copier le code',
            onPress: () => copyToClipboard(result.code),
          },
          { text: 'OK' },
        ]
      );
    } catch (err: any) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearch = async () => {
    if (!codeTontine.trim()) {
      setAlert({
        show: true,
        type: 'warning',
        title: 'Attention',
        message: 'Veuillez entrer un code de tontine',
      });
      return;
    }

    setIsSearching(true);
    try {
      await rechercherTontine(codeTontine.trim());
    } catch (err: any) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Tontine introuvable',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!tontineRecherchee) {
      setAlert({
        show: true,
        type: 'warning',
        title: 'Attention',
        message: 'Veuillez d\'abord rechercher une tontine',
      });
      return;
    }

    setIsJoining(true);
    try {
      await rejoindreTontine(tontineRecherchee.code);
      await fetchSolde();
      await loadData();
      setShowJoinModal(false);
      setCodeTontine('');
      clearRecherche();
      setAlert({
        show: true,
        type: 'success',
        title: 'Succès',
        message: 'Vous avez rejoint la tontine !',
      });
    } catch (err: any) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Erreur',
        message: err.message || 'Impossible de rejoindre la tontine',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copié !', 'Le code a été copié dans le presse-papier');
  };

  const handleShareTontine = async (tontine: any) => {
    const code = tontine?.code || '';
    const prix = parseFloat(tontine?.prix) || 0;
    const message = `😊 Rejoins ma tontine sur Nkap dey en utilisant le code de tontine ${code}.🤑Le montant de la tontine est de ${formatMoney(prix)}.`;
    
    try {
      const result = await Share.share({
        message: message,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Partagé avec une activité spécifique
          console.log('Partagé via:', result.activityType);
        } else {
          // Partagé
          console.log('Partagé avec succès');
        }
      } else if (result.action === Share.dismissedAction) {
        // Popup de partage fermé
        console.log('Partage annulé');
      }
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de partager la tontine');
      console.error('Erreur de partage:', error);
    }
  };

  const handleTontinePress = (tontine: any) => {
    navigation.navigate('TontineDetails', { tontineId: tontine.id });
  };

  const formatMoney = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0 F';
    return amount.toLocaleString('fr-FR') + ' F';
  };

  const renderTontineItem = ({ item }: { item: any }) => {
    // Safe fallbacks for all item properties
    const nom = item?.nom || 'Tontine sans nom';
    const code = item?.code || '---';
    const statut = item?.statut || 'inconnu';
    const prix = parseFloat(item?.prix) || 0;
    const membresActuels = parseInt(item?.membres_actuels) || 0;
    const nombreMembres = parseInt(item?.nombre_membres) || 1;
    const montantCollecte = parseFloat(item?.montant_collecte) || 0;
    const progress = nombreMembres > 0 ? (membresActuels / nombreMembres) * 100 : 0;
    const isCreation = activeTab === 'creations';

    return (
      <TouchableOpacity onPress={() => handleTontinePress(item)}>
        <Card style={styles.tontineCard}>
          <View style={styles.tontineHeader}>
            <View style={styles.tontineIconContainer}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.tontineInfo}>
              <Text style={styles.tontineName}>{nom}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(code)}>
                <View style={styles.codeContainer}>
                  <Text style={styles.tontineCode}>{code}</Text>
                  <Ionicons name="copy-outline" size={12} color={COLORS.gray500} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statut === 'ouvert' ? COLORS.success + '20' : COLORS.gray300 },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statut === 'ouvert' ? COLORS.success : COLORS.gray500 },
                ]}
              >
                {statut === 'ouvert' ? 'Ouvert' : statut === 'ferme' ? 'Fermé' : 'Inconnu'}
              </Text>
            </View>
          </View>
          <View style={styles.tontineStats}>
            <View style={styles.tontineStat}>
              <Text style={styles.statLabel}>Prix</Text>
              <Text style={styles.statValue}>{formatMoney(prix)}</Text>
            </View>
            <View style={styles.tontineStat}>
              <Text style={styles.statLabel}>Membres</Text>
              <Text style={styles.statValue}>
                {membresActuels}/{nombreMembres}
              </Text>
            </View>
            <View style={styles.tontineStat}>
              <Text style={styles.statLabel}>Collecté</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {formatMoney(montantCollecte)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%` },
              ]}
            />
          </View>
          
          {/* Share button - only for creations */}
          {isCreation && (
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => handleShareTontine(item)}
            >
              <Ionicons name="share-social" size={18} color={COLORS.white} />
              <Text style={styles.shareButtonText}>Partager la tontine</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Appuyez pour voir les membres</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>Mes Tontines</Text>
        <Text style={styles.headerSubtitle}>Gérez vos tontines et gagnez de l'argent</Text>
      </LinearGradient>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Créer"
          onPress={() => setShowCreateModal(true)}
          variant="primary"
          size="md"
          icon={<Ionicons name="add" size={18} color={COLORS.white} />}
          style={{ flex: 1, marginRight: SPACING.sm }}
        />
        <Button
          title="Rejoindre"
          onPress={() => setShowJoinModal(true)}
          variant="secondary"
          size="md"
          icon={<Ionicons name="enter-outline" size={18} color={COLORS.primaryDark} />}
          style={{ flex: 1, marginLeft: SPACING.sm }}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'creations' && styles.tabActive]}
          onPress={() => setActiveTab('creations')}
        >
          <Text style={[styles.tabText, activeTab === 'creations' && styles.tabTextActive]}>
            Mes créations ({safeMesCreations.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'adhesions' && styles.tabActive]}
          onPress={() => setActiveTab('adhesions')}
        >
          <Text style={[styles.tabText, activeTab === 'adhesions' && styles.tabTextActive]}>
            Mes adhésions ({safeMesAdhesions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={activeTab === 'creations' ? safeMesCreations : safeMesAdhesions}
        renderItem={renderTontineItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={COLORS.gray300} />
            <Text style={styles.emptyText}>
              {activeTab === 'creations'
                ? "Vous n'avez pas encore créé de tontine"
                : "Vous n'avez pas encore rejoint de tontine"}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'creations'
                ? "Créez votre première tontine pour commencer"
                : "Rejoignez une tontine existante avec un code"}
            </Text>
          </View>
        }
      />

      {/* Create Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.gray500} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Créer une tontine</Text>
            <Input
              label="Nom de la tontine"
              placeholder="Ex: Tontine Famille 2025"
              value={nom}
              onChangeText={setNom}
              leftIcon="text-outline"
            />
            <Input
              label="Prix (FCFA)"
              placeholder="Minimum 1000, multiple de 100"
              value={prix}
              onChangeText={setPrix}
              keyboardType="numeric"
              leftIcon="cash-outline"
            />
            <Input
              label="Nombre de membres"
              placeholder="Ex: 10"
              value={nombreMembres}
              onChangeText={setNombreMembres}
              keyboardType="numeric"
              leftIcon="people-outline"
            />
            <Text style={styles.feeNote}>
              Note: {prix && !isNaN(parseInt(prix)) ? formatMoney(parseInt(prix) / 2) : '---'} sera débité de votre compte
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Annuler"
                onPress={() => setShowCreateModal(false)}
                variant="outline"
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <Button
                title="Créer"
                onPress={handleCreate}
                isLoading={isCreating}
                disabled={isCreating}
                style={{ flex: 1, marginLeft: SPACING.sm }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowJoinModal(false);
                clearRecherche();
                setCodeTontine('');
              }}
            >
              <Ionicons name="close" size={24} color={COLORS.gray500} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Rejoindre une tontine</Text>
            <Input
              label="Code de la tontine"
              placeholder="Ex: NKAPD-12345"
              value={codeTontine}
              onChangeText={(v) => {
                setCodeTontine(v);
                clearRecherche();
              }}
              leftIcon="search-outline"
              rightIcon="search"
              onRightIconPress={handleSearch}
            />
            {isSearching && (
              <Text style={styles.searchingText}>Recherche en cours...</Text>
            )}
            {tontineRecherchee && (
              <Card variant="outline" style={styles.searchResult}>
                <Text style={styles.resultName}>{tontineRecherchee.nom || 'Sans nom'}</Text>
                <Text style={styles.resultInfo}>
                  Prix: {formatMoney(tontineRecherchee.prix || 0)} • Membres:{' '}
                  {tontineRecherchee.membres_actuels || 0}/{tontineRecherchee.nombre_membres || 0}
                </Text>
                {tontineRecherchee.createur && (
                  <Text style={styles.resultCreator}>
                    Créé par: {tontineRecherchee.createur.prenom || ''} {tontineRecherchee.createur.nom || ''}
                  </Text>
                )}
              </Card>
            )}
            <View style={styles.modalActions}>
              <Button
                title="Annuler"
                onPress={() => {
                  setShowJoinModal(false);
                  clearRecherche();
                  setCodeTontine('');
                }}
                variant="outline"
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <Button
                title="Rejoindre"
                onPress={handleJoin}
                isLoading={isJoining}
                disabled={!tontineRecherchee || isJoining}
                style={{ flex: 1, marginLeft: SPACING.sm }}
              />
            </View>
          </View>
        </View>
      )}

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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.lg,
  },
  tontineCard: {
    marginBottom: SPACING.md,
  },
  tontineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tontineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tontineInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tontineName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tontineCode: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  tontineStats: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  tontineStat: {
    flex: 1,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
  },
  statValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  tapHint: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
    padding: SPACING.xs,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  feeNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warning,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  searchingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  searchResult: {
    marginVertical: SPACING.md,
  },
  resultName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
  },
  resultInfo: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  resultCreator: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
});