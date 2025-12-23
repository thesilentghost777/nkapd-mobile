import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

// Activer LayoutAnimation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'tontine' | 'paiement' | 'parrainage' | 'business' | 'rencontre';
}

const faqData: FAQItem[] = [
  // Questions Générales
  {
    id: 1,
    question: "Qu'est-ce que Nkap Dey ?",
    answer: "Nkap Dey est une application innovante qui vous permet de gagner de l'argent en parrainant des membres et en participant à des tontines. C'est une plateforme communautaire d'entraide financière.",
    category: 'general'
  },
  {
    id: 2,
    question: "Comment commencer sur Nkap Dey ?",
    answer: "Pour commencer, inscrivez-vous avec un code de parrainage (optionnel). Ensuite, rechargez votre compte et vous pourrez créer ou rejoindre des tontines pour commencer à gagner.",
    category: 'general'
  },
  
  // Questions sur les Tontines
  {
    id: 3,
    question: "Comment créer une tontine ?",
    answer: "Pour créer une tontine : 0) Naviguer jusqu'à la section tontine et cliquez sur le bouton créer 1) Choisissez un nom, 2) Définissez un montant (minimum 1000F, multiples de 100), 3) Indiquez le nombre de membres souhaités. La moitié du montant sera prélevée de votre compte à la création.",
    category: 'tontine'
  },
  {
    id: 4,
    question: "Comment rejoindre une tontine ?",
    answer: "Utilisez le code de tontine partagé par le créateur, recherchez la tontine dans l'application et rejoignez-la. Vous devez avoir au moins le prix de la tontine dans votre compte. La moitié sera prélevée automatiquement.",
    category: 'tontine'
  },
  {
    id: 5,
    question: "Combien de tontines puis-je créer ?",
    answer: "Vous pouvez créer maximum 10 tontines en cours simultanément. Une tontine en cours est une tontine qui n'a pas encore été fermée (nombre de membres non atteint).",
    category: 'tontine'
  },
  {
    id: 6,
    question: "Que se passe-t-il quand ma tontine est complète ?",
    answer: "Lorsque tous les membres ont rejoint votre tontine, elle se ferme automatiquement et le montant total est versé dans votre compte. Vous pouvez alors le retirer ou l'utiliser dans l'application.",
    category: 'tontine'
  },

  // Questions sur le Parrainage
  {
    id: 7,
    question: "Comment fonctionne le parrainage ?",
    answer: "Lors de l'inscription, utilisez un code de parrainage. Si vous n'en avez pas, un code par défaut sera utilisé. En parrainant quelqu'un qui s'inscrit, recharge et participe à sa première tontine, vous recevez 500F de bonus.",
    category: 'parrainage'
  },
  {
    id: 8,
    question: "Combien puis-je gagner avec le parrainage ?",
    answer: "Vous recevez 500F pour chaque filleul qui s'inscrit avec votre code, recharge son compte et participe à sa première tontine. Il n'y a pas de limite au nombre de parrainages.",
    category: 'parrainage'
  },

  // Questions sur les Paiements
  {
    id: 9,
    question: "Comment recharger mon compte ?",
    answer: "Utilisez les méthodes de paiement disponibles dans l'application (Mobile Money, carte bancaire, etc.). Les recharges sont instantanées et sécurisées.",
    category: 'paiement'
  },
  {
    id: 10,
    question: "Quelles sont les conditions de retrait ?",
    answer: "Vous ne pouvez pas retirer si cela laisse votre solde en dessous de 1500F. De plus, 25% du montant retiré sont prélevés comme frais de traitement.",
    category: 'paiement'
  },
  {
    id: 11,
    question: "Puis-je transférer de l'argent à un autre utilisateur ?",
    answer: "Oui, vous pouvez transférer de l'argent entre utilisateurs. Des frais de 5% du montant transféré s'appliquent.",
    category: 'paiement'
  },
  {
    id: 12,
    question: "Y a-t-il des frais mensuels ?",
    answer: "Oui, 500F sont prélevés automatiquement chaque premier du mois sur tous les comptes actifs. Ces frais soutiennent le maintien et l'amélioration de la plateforme.",
    category: 'paiement'
  },

  // Questions sur l'Espace Business
  {
    id: 13,
    question: "Qu'est-ce que l'espace Business ?",
    answer: "C'est un marché exclusif aux membres de Nkap Dey où vous pouvez vendre ou acheter des produits (chaussures, sacs, électroménager, etc.). Tous les vendeurs ont les mêmes chances de visibilité grâce à notre algorithme aléatoire.",
    category: 'business'
  },
  {
    id: 14,
    question: "Comment vendre sur l'espace Business ?",
    answer: "Publiez vos produits avec photos, descriptions et prix. Votre annonce sera affichée de façon aléatoire pour garantir une équité entre tous les vendeurs.",
    category: 'business'
  },

  // Questions sur l'Espace Rencontre
  {
    id: 15,
    question: "Qu'est-ce que l'espace Rencontre ?",
    answer: "C'est un espace pour connecter les membres selon leurs besoins : rencontres amoureuses, partenaires business ou autres types de connexions. Chaque type utilise un système de matching adapté.",
    category: 'rencontre'
  },
  {
    id: 16,
    question: "Comment fonctionne le matching amoureux ?",
    answer: "Définissez vos préférences et critères. Notre système vous proposera automatiquement des profils qui correspondent à vos attentes et vice versa.",
    category: 'rencontre'
  },
];

const categories = [
  { key: 'all', label: 'Toutes les questions', icon: 'apps' },
  { key: 'general', label: 'Questions générales', icon: 'information-circle' },
  { key: 'tontine', label: 'Tontines', icon: 'people' },
  { key: 'paiement', label: 'Paiements', icon: 'wallet' },
  { key: 'parrainage', label: 'Parrainage', icon: 'share-social' },
  { key: 'business', label: 'Espace Business', icon: 'storefront' },
  { key: 'rencontre', label: 'Espace Rencontre', icon: 'heart' },
];

export const FAQScreen: React.FC<Props> = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDropdownOpen(!dropdownOpen);
  };

  const selectCategory = (key: string) => {
    setSelectedCategory(key);
    setDropdownOpen(false);
  };

  const openWhatsApp = () => {
    const phoneNumber = '237696087354';
    const message = 'Bonjour, j\'ai besoin d\'aide concernant Nkap Dey.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback vers le lien web WhatsApp
          const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => console.error('Erreur lors de l\'ouverture de WhatsApp:', err));
  };

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ / Aide</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Menu déroulant pour les catégories */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={toggleDropdown}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownButtonContent}>
            <Ionicons 
              name={selectedCategoryData?.icon as any} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={styles.dropdownButtonText}>
              {selectedCategoryData?.label}
            </Text>
          </View>
          <Ionicons 
            name={dropdownOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={COLORS.gray600} 
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.dropdownItem,
                  selectedCategory === cat.key && styles.dropdownItemActive
                ]}
                onPress={() => selectCategory(cat.key)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={20} 
                  color={selectedCategory === cat.key ? COLORS.primary : COLORS.gray600} 
                />
                <Text style={[
                  styles.dropdownItemText,
                  selectedCategory === cat.key && styles.dropdownItemTextActive
                ]}>
                  {cat.label}
                </Text>
                {selectedCategory === cat.key && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="bulb" size={24} color={COLORS.warning} />
          <Text style={styles.infoText}>
            Cliquez sur une question pour voir la réponse détaillée
          </Text>
        </View>

        {filteredFAQ.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.faqItem}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.questionRow}>
              <View style={styles.questionIcon}>
                <Ionicons 
                  name="help-circle" 
                  size={24} 
                  color={COLORS.primary} 
                />
              </View>
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons 
                name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.gray600} 
              />
            </View>
            
            {expandedId === item.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.contactCard}>
          <Ionicons name="logo-whatsapp" size={40} color="#25D366" />
          <Text style={styles.contactTitle}>Besoin d'aide supplémentaire ?</Text>
          <Text style={styles.contactDescription}>
            Notre équipe est là pour vous aider. Contactez-nous directement sur WhatsApp.
          </Text>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={openWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
            <Text style={styles.contactBtnText}>Nous contacter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xl }} />
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    ...FONTS.h3,
    color: COLORS.black,
  },
  dropdownContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  dropdownButtonText: {
    ...FONTS.body,
    color: COLORS.black,
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownItemText: {
    ...FONTS.body,
    color: COLORS.gray700,
    flex: 1,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  infoText: {
    ...FONTS.small,
    color: COLORS.gray700,
    flex: 1,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  questionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.black,
    flex: 1,
  },
  answerContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingLeft: 40,
  },
  answer: {
    ...FONTS.body,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  contactDescription: {
    ...FONTS.body,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  contactBtnText: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});