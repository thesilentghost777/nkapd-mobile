// Couleurs inspirées du billet de 10 000 FCFA camerounais
export const COLORS = {
  // Violets (couleur principale du billet)
  primary: '#4A1A6B',
  primaryLight: '#6B2D91',
  primaryDark: '#2E0E44',
  primaryFaded: '#8B5FB0',
  
  // Jaunes/Dorés (accents du billet)
  secondary: '#D4A017',
  secondaryLight: '#F5C842',
  secondaryDark: '#A67C00',
  gold: '#FFD700',
  
  // Neutres
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray100: '#F7F7F7',
  gray200: '#E8E8E8',
  gray300: '#D1D1D1',
  gray400: '#9E9E9E',
  gray500: '#6B6B6B',
  gray600: '#4A4A4A',
  
  // États
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  
  // Backgrounds
  background: '#F5F3F7',
  card: '#FFFFFF',
  overlay: 'rgba(74, 26, 107, 0.8)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
