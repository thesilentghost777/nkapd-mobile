import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;  // ✅ Après
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isDisabled = disabled || isLoading;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'lg':
        return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl };
      default:
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return FONTS.sizes.sm;
      case 'lg':
        return FONTS.sizes.lg;
      default:
        return FONTS.sizes.md;
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.buttonBase, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isDisabled ? [COLORS.gray400, COLORS.gray500] : [COLORS.primary, COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, getSizeStyles()]}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              {icon}
              <Text style={[styles.textPrimary, { fontSize: getTextSize() }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.buttonBase, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isDisabled ? [COLORS.gray300, COLORS.gray400] : [COLORS.secondary, COLORS.secondaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, getSizeStyles()]}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.primaryDark} />
          ) : (
            <>
              {icon}
              <Text style={[styles.textSecondary, { fontSize: getTextSize() }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.outline,
          getSizeStyles(),
          isDisabled && styles.outlineDisabled,
          style,
        ]}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.textOutline,
                { fontSize: getTextSize() },
                isDisabled && styles.textDisabled,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.ghost, getSizeStyles(), style]}
      activeOpacity={0.6}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textGhost,
              { fontSize: getTextSize() },
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  outlineDisabled: {
    borderColor: COLORS.gray400,
  },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'transparent',
  },
  textPrimary: {
    color: COLORS.white,
    fontWeight: '600',
  },
  textSecondary: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  textOutline: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textGhost: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  textDisabled: {
    color: COLORS.gray400,
  },
});
