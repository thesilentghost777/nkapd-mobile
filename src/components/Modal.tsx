import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';
import { Button } from './Button';

interface AlertModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.info;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
            <Ionicons name={getIconName()} size={48} color={getIconColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {onConfirm ? (
              <>
                <Button
                  title={cancelText}
                  onPress={onClose}
                  variant="outline"
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <Button
                  title={confirmText}
                  onPress={onConfirm}
                  variant="primary"
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                />
              </>
            ) : (
              <Button title="OK" onPress={onClose} variant="primary" style={{ flex: 1 }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  message = 'Chargement...',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: SPACING.lg,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
  },
});
