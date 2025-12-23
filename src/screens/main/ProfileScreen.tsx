import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button, AlertModal } from '../../components';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { solde } = useTransactionStore();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleShare = async () => {
    try {
      const shareMessage = `😊 Rejoins moi sur Nkap Dey avec mon code de parrainage ${user?.code_parrainage || '---'} et commence à gagner beaucoup d'argent 🤑 en utilisant le système de tontines. Téléchargez l'application Nkap Dey ici 👉🏽`;
      
      const result = await Share.share({
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Partagé avec un type d'activité spécifique
          console.log('Partagé via:', result.activityType);
        } else {
          // Partagé
          console.log('Partagé avec succès');
        }
      } else if (result.action === Share.dismissedAction) {
        // Annulé
        console.log('Partage annulé');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le code de parrainage');
      console.error('Erreur de partage:', error);
    }
  };

  const formatMoney = (amount: number) => amount.toLocaleString('fr-FR') + ' FCFA';

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Modifier le profil',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'wallet-outline',
      label: 'Transactions',
      onPress: () => navigation.navigate('Transactions'),
    },
    {
      icon: 'people-outline',
      label: 'Mes filleuls',
      onPress: () => navigation.navigate('Filleuls'),
    },
    {
      icon: 'bag-outline',
      label: 'Mes produits',
      onPress: () => navigation.navigate('MesProduits'),
    },
  
    {
      icon: 'lock-closed-outline',
      label: 'Changer mot de passe',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      icon: 'help-circle-outline',
      label: 'FAQ / Aide',
      onPress: () => navigation.navigate('FAQ'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.prenom?.charAt(0) || 'N'}
                </Text>
              </View>
            )}
            
          </View>
          <Text style={styles.userName}>
            {user?.prenom} {user?.nom}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Balance Card */}
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceAmount}>{formatMoney(solde)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Parrainage Card */}
        <View style={styles.section}>
          <Card variant="gradient">
            <View style={styles.parrainageRow}>
              <View>
                <Text style={styles.parrainageLabel}>Votre code parrain</Text>
                <Text style={styles.parrainageCode}>{user?.code_parrainage || '---'}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.copyBtn} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Card>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Déconnexion"
            onPress={() => setShowLogoutAlert(true)}
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={20} color={COLORS.primary} />}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AlertModal
        visible={showLogoutAlert}
        type="warning"
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={handleLogout}
        confirmText="Déconnexion"
        cancelText="Annuler"
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
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingBottom: SPACING.xxl + 50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  balanceContainer: {
    position: 'absolute',
    bottom: -40,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
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
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  parrainageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parrainageLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
  },
  parrainageCode: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    fontWeight: '500',
  },
});