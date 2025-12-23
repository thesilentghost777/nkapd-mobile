import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Card, Button } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useRencontreStore } from '../../store/rencontreStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface Annonce {
  id: number;
  type: 'amoureuse' | 'business' | 'autre';
  titre: string;
  description: string;
  created_at: string;
  vues?: number;
  reponses?: number;
}

const TYPE_CONFIG = {
  amoureuse: { icon: 'heart', color: COLORS.error, label: 'Amour' },
  business: { icon: 'briefcase', color: COLORS.secondary, label: 'Business' },
  autre: { icon: 'chatbubbles', color: COLORS.info, label: 'Autre' },
};

export const MesAnnoncesScreen: React.FC<Props> = ({ navigation }) => {
  const { mesAnnonces, fetchMesAnnonces, supprimerAnnonce, isLoading } = useRencontreStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMesAnnonces();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMesAnnonces();
    setRefreshing(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await supprimerAnnonce(id);
            if (success) {
              Toast.show({ type: 'success', text1: 'Annonce supprimée' });
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderAnnonce = ({ item }: { item: Annonce }) => {
    const config = TYPE_CONFIG[item.type];

    return (
      <Card style={styles.annonceCard}>
        <View style={styles.annonceHeader}>
          <View style={[styles.typeBadge, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={14} color={config.color} />
            <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.annonceTitle}>{item.titre}</Text>
        <Text style={styles.annonceDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.annonceFooter}>
          <Text style={styles.dateText}>Publié le {formatDate(item.created_at)}</Text>
          <View style={styles.stats}>
            {item.vues !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.statText}>{item.vues}</Text>
              </View>
            )}
            {item.reponses !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.statText}>{item.reponses}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Annonces</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateAnnonce')}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={mesAnnonces}
        renderItem={renderAnnonce}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.gray300} />
            <Text style={styles.emptyText}>Aucune annonce publiée</Text>
            <Text style={styles.emptySubtext}>
              Créez votre première annonce pour commencer à rencontrer des personnes
            </Text>
            <Button
              title="Créer une annonce"
              onPress={() => navigation.navigate('CreateAnnonce')}
              variant="outline"
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        }
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  annonceCard: {
    marginBottom: SPACING.md,
  },
  annonceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  typeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  annonceTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  annonceDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  annonceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  dateText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray500,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xl,
  },
});
