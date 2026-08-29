import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import Toast from 'react-native-toast-message';
import colors from '../theme/colors';

const NoInternetModal = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      // Determine if connected. Treat null/undefined state.isConnected as true initially to prevent false alerts.
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
    });

    // Run an initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    if (isChecking) {
      return;
    }
    setIsChecking(true);

    try {
      // Fetch latest network state on demand
      const state = await NetInfo.fetch();
      const connected = state.isConnected ?? false;
      
      // Artificial delay to simulate check and provide visual feedback to user
      await new Promise<void>(resolve => setTimeout(resolve, 800));

      setIsConnected(connected);

      if (connected) {
        Toast.show({
          type: 'success',
          text1: 'Connected back online!',
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Still offline',
          text2: 'Please verify your internet connection and try again.',
          position: 'top',
          visibilityTime: 2500,
        });
      }
    } catch (error) {
      console.error('Error checking network connection:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Do not render anything if connection status is undetermined or connected
  if (isConnected === null || isConnected) {
    return null;
  }

  return (
    <Modal
      visible={!isConnected}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="cloud-offline-outline"
              size={54}
              color={colors.destructive}
            />
          </View>

          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.subtitle}>
            Please check your Wi-Fi or mobile data settings. Tap retry to reconnect.
          </Text>

          <TouchableOpacity
            style={[styles.button, isChecking ? styles.disabledButton : null]}
            onPress={handleRetry}
            activeOpacity={0.8}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons
                  name="refresh"
                  size={18}
                  color={colors.primaryForeground}
                  style={styles.refreshIcon}
                />
                <Text style={styles.buttonText}>Retry Connection</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
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
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default NoInternetModal;
