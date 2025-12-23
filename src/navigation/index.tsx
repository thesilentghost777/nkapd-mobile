import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

// Auth Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Main Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { TontineScreen } from '../screens/main/TontineScreen';
import { BusinessScreen } from '../screens/main/BusinessScreen';
import { RencontreScreen } from '../screens/main/RencontreScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { MessagesScreen } from '../screens/main/MessagesScreen';
import { TontineDetailsScreen } from '../screens/main/TontineDetailsScreen';

// Profile Screens
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { FilleulsScreen } from '../screens/profile/FilleulsScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { FAQScreen } from '../screens/profile/FAQScreen';

// Transaction Screens
import TransactionsScreen from '../screens/transactions/TransactionScreen';
import { RechargeScreen } from '../screens/transactions/RechargeScreen';
import { RetraitScreen } from '../screens/transactions/RetraitScreen';
import { TransfertScreen } from '../screens/transactions/TransfertScreen';

// Business Screens
import AddProductScreen from '../screens/business/AddProductScreen';
import EditProductScreen from '../screens/business/EditProductScreen';
import ProductDetailsScreen from '../screens/business/ProductDetailsScreen';
import MyProductsScreen from '../screens/business/MyProductsScreen';


// Rencontre Screens
import { CreateAnnonceScreen } from '../screens/rencontre/CreateAnnonceScreen';
import { MesAnnoncesScreen } from '../screens/rencontre/MesAnnoncesScreen';
import { ProfilDetailScreen } from '../screens/rencontre/ProfilDetailScreen';

// Types pour la navigation
export type MainStackParamList = {
  MainTabs: undefined;
  
  // Profile
  EditProfile: undefined;
  Filleuls: undefined;
  ChangePassword: undefined;
  FAQ: undefined;
  
  // Transactions
  Recharge: undefined;
  Retrait: undefined;
  Transfert: undefined;
  Transactions: undefined;
  
  // Messages
  Messages: undefined;
  Chat: { 
    conversationId: number; 
    participant: { 
      id: number; 
      nom: string; 
      prenom: string; 
      avatar?: string; 
    } 
  };
  Message: { userId: number };
  
  // Tontines
  TontineDetails: { tontineId: number };
  
  // Business
  AddProduit: undefined;
  EditProduit: { productId: number };
  MesProduits: undefined;
  ProduitDetail: { productId: number };
  
  // Rencontre
  CreateAnnonce: undefined;
  MesAnnonces: undefined;
  ProfilDetail: { userId: number };
  RencontreMain: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createMaterialTopTabNavigator();

// Custom Tab Bar Icon Component
const TabBarIcon = ({ 
  name, 
  focused 
}: { 
  name: keyof typeof Ionicons.glyphMap; 
  focused: boolean;
}) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons
      name={name}
      size={20}
      color={focused ? COLORS.primary : COLORS.gray400}
    />
  </View>
);

// Tab Navigator avec les 5 onglets principaux
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
 
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'none',
          marginTop: -4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingTop: 8,
          marginTop: insets.top + 10,
        },
        tabBarIndicatorStyle: {
          backgroundColor: COLORS.primary,
          height: 3,
          borderRadius: 2,
        },
        tabBarScrollEnabled: true,
        tabBarItemStyle: {
          width: 'auto',
          minWidth: 70,
        },
        tabBarShowIcon: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="TontineTab"
        component={TontineScreen}
        options={{
          tabBarLabel: 'Tontines',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Business"
        component={BusinessScreen}
        options={{
          tabBarLabel: 'Business',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'bag' : 'bag-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Rencontre"
        component={RencontreScreen}
        options={{
          tabBarLabel: 'Rencontre',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Navigator
export const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Welcome"
  >
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Main Navigator avec tous les screens
export const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Tabs principaux */}
    <Stack.Screen name="MainTabs" component={TabNavigator} />
   
    {/* Profile Screens */}
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen 
      name="Filleuls" 
      component={FilleulsScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen 
      name="FAQ" 
      component={FAQScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
   
    {/* Transaction Screens */}
    <Stack.Screen 
      name="Recharge" 
      component={RechargeScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen 
      name="Retrait" 
      component={RetraitScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen 
      name="Transfert" 
      component={TransfertScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen 
      name="Transactions" 
      component={TransactionsScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
   
    {/* Messages Screens */}
    <Stack.Screen 
      name="Messages" 
      component={MessagesScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    
   
    {/* Tontine Screens */}
    <Stack.Screen 
      name="TontineDetails" 
      component={TontineDetailsScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
   
    {/* Business Screens */}
    <Stack.Screen
      name="AddProduit"
      component={AddProductScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="EditProduit"
      component={EditProductScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="MesProduits"
      component={MyProductsScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="ProduitDetail"
      component={ProductDetailsScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />

    {/* Rencontre Screens */}
    <Stack.Screen
      name="CreateAnnonce"
      component={CreateAnnonceScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
    <Stack.Screen
      name="MesAnnonces"
      component={MesAnnoncesScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="ProfilDetail"
      component={ProfilDetailScreen}
      options={{
        animation: 'slide_from_right',
      }}
    />
    
  </Stack.Navigator>
);