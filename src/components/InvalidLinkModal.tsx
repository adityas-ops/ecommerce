import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useAppDispatch, useAppSelector } from '../store/store';
import { clearInvalidDeepLink } from '../store/slices/deepLinkSlice';
import colors from '../theme/colors';

interface InvalidLinkModalProps {
  onNavigateHome: () => void;
}

const InvalidLinkModal: React.FC<InvalidLinkModalProps> = ({
  onNavigateHome,
}) => {
  const dispatch = useAppDispatch();
  const { isInvalidModalOpen, invalidUrl, invalidTitle, invalidMessage } =
    useAppSelector(state => state.deepLink);

  if (!isInvalidModalOpen) {
    return null;
  }

  const handleGoHome = () => {
    dispatch(clearInvalidDeepLink());
    onNavigateHome();
  };

  return (
    <Modal
      visible={isInvalidModalOpen}
      transparent
      animationType="fade"
      onRequestClose={handleGoHome}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="alert-circle-outline"
              size={54}
              color={colors.destructive}
            />
          </View>

          <Text style={styles.title}>{invalidTitle || 'Invalid Link'}</Text>
          <Text style={styles.subtitle}>
            {invalidMessage ||
              `The link (${invalidUrl || 'you opened'}) is invalid or no longer available.`}
          </Text>

          {invalidUrl ? (
            <View style={styles.urlBadge}>
              <Text style={styles.urlText} numberOfLines={1}>
                {invalidUrl}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  urlBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    maxWidth: '90%',
  },
  urlText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InvalidLinkModal;
