import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Input, Card } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useRencontreStore } from '../../store/rencontreStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type AnnonceType = 'amoureuse' | 'business' | 'autre';

const ANNONCE_TYPES = [
  {
    id: 'amoureuse' as AnnonceType,
    label: 'Amour',
    icon: 'heart',
    description: 'Recherche de l\'âme sœur',
    color: COLORS.error,
  },
  {
    id: 'business' as AnnonceType,
    label: 'Business',
    icon: 'briefcase',
    description: 'Partenariats professionnels',
    color: COLORS.secondary,
  },
  {
    id: 'autre' as AnnonceType,
    label: 'Autre',
    icon: 'chatbubbles',
    description: 'Discussions ouvertes',
    color: COLORS.info,
  },
];

export const CreateAnnonceScreen: React.FC<Props> = ({ navigation }) => {
  const [type, setType] = useState<AnnonceType | null>(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { creerAnnonce } = useRencontreStore();

  const handleSubmit = async () => {
    console.log('🔵 handleSubmit appelé');
    console.log('Type:', type);
    console.log('Titre:', titre);
    console.log('Description:', description);

    try {
      // Validation du type
      if (!type) {
        console.log('❌ Pas de type sélectionné');
        Toast.show({ type: 'error', text1: 'Veuillez sélectionner un type d\'annonce' });
        Alert.alert('Erreur', 'Veuillez sélectionner un type d\'annonce');
        return;
      }

      // Validation du titre
      if (!titre.trim()) {
        console.log('❌ Pas de titre');
        Toast.show({ type: 'error', text1: 'Veuillez entrer un titre' });
        Alert.alert('Erreur', 'Veuillez entrer un titre');
        return;
      }

      // Validation de la description
      if (!description.trim()) {
        console.log('❌ Pas de description');
        Toast.show({ type: 'error', text1: 'Veuillez entrer une description' });
        Alert.alert('Erreur', 'Veuillez entrer une description');
        return;
      }

      if (description.length < 20) {
        console.log('❌ Description trop courte');
        Toast.show({ type: 'error', text1: 'La description doit contenir au moins 20 caractères' });
        Alert.alert('Erreur', 'La description doit contenir au moins 20 caractères');
        return;
      }

      console.log('✅ Validation passée, création de l\'annonce...');
      setLoading(true);

      const success = await creerAnnonce({ 
        type, 
        titre: titre.trim(), 
        description: description.trim() 
      });

      console.log('Résultat creerAnnonce:', success);

      if (success) {
        console.log('✅ Annonce créée avec succès');
        Toast.show({ type: 'success', text1: 'Annonce créée avec succès!' });
        Alert.alert('Succès', 'Annonce créée avec succès!');
        navigation.goBack();
      } else {
        console.log('❌ Échec de la création');
        Toast.show({ type: 'error', text1: 'Erreur lors de la création de l\'annonce' });
        Alert.alert('Erreur', 'Erreur lors de la création de l\'annonce');
      }
    } catch (error) {
      console.error('❌ Erreur dans handleSubmit:', error);
      Toast.show({ type: 'error', text1: 'Une erreur est survenue' });
      Alert.alert('Erreur', 'Une erreur est survenue: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testButton = () => {
    console.log('🟢 Test bouton cliqué!');
    Alert.alert('Test', 'Le bouton fonctionne!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Annonce</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Selection */}
          <Text style={styles.sectionTitle}>Type d'annonce</Text>
          <View style={styles.typesContainer}>
            {ANNONCE_TYPES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.typeCard,
                  type === item.id && { borderColor: item.color, borderWidth: 2 },
                ]}
                onPress={() => {
                  console.log('Type sélectionné:', item.id);
                  setType(item.id);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.typeLabel}>{item.label}</Text>
                <Text style={styles.typeDescription}>{item.description}</Text>
                {type === item.id && (
                  <View style={[styles.checkMark, { backgroundColor: item.color }]}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <Card style={styles.formCard}>
            <Input
              label="Titre de l'annonce"
              placeholder="Ex: À la recherche d'un partenaire..."
              value={titre}
              onChangeText={(text) => {
                console.log('Titre changé:', text);
                setTitre(text);
              }}
              maxLength={100}
            />
            <Text style={styles.charCount}>{titre.length}/100</Text>

            <Input
              label="Description"
              placeholder="Décrivez ce que vous recherchez..."
              value={description}
              onChangeText={(text) => {
                console.log('Description changée:', text.length, 'caractères');
                setDescription(text);
              }}
              multiline
              numberOfLines={6}
              style={styles.textArea}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            <View style={styles.tips}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.tipsText}>
                Soyez précis et honnête dans votre description pour attirer les bonnes personnes.
              </Text>
            </View>
          </Card>

        
          {/* Bouton principal - Version simple */}
          <TouchableOpacity
            style={styles.submitBtnSimple}
            onPress={() => {
              console.log('🔴 Bouton cliqué directement');
              handleSubmit();
            }}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>PUBLIER L'ANNONCE</Text>
            )}
          </TouchableOpacity>

        
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    position: 'relative',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  typeLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  typeDescription: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  checkMark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
    textAlign: 'right',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.secondary + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  tipsText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  testBtn: {
    backgroundColor: '#FF6B00',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  testBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtnSimple: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 56,
  },
  submitBtn: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    minHeight: 56,
  },
  submitBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});