import React, { useEffect, useRef, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import AppNavigator, { RootStackParamList } from './src/navigations/AppNav';
import { Text, TouchableOpacity, View, Linking } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import Toast from 'react-native-toast-message';
import { handleDeepLinkUrl } from './src/utils/deepLinkHandler';
import InvalidLinkModal from './src/components/InvalidLinkModal';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

const AppContent = () => {
  const initialUrlRef = useRef<string | null>(null);
  const processedInitialUrlRef = useRef<string | null>(null);

  const toastConfig = {
    success: (props: any) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#10B981',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 999,
          width: '90%',
          maxWidth: 400,
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="#FFF"
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
            {props.text1}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => Toast.hide()}
          style={{ padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    ),
  };

  const processUrl = useCallback((url: string | null, isInitial = false) => {
    if (!url) {
      return;
    }

    // Skip re-processing cached initial launch intent URL on reload/refresh
    if (isInitial && processedInitialUrlRef.current === url) {
      return;
    }

    if (navigationRef.isReady()) {
      if (isInitial) {
        processedInitialUrlRef.current = url;
      }
      handleDeepLinkUrl(url, (screen, params) => {
        navigationRef.navigate(screen as any, params);
      });
    } else {
      initialUrlRef.current = url;
    }
  }, []);

  useEffect(() => {
    // 1. Warm start listener (App running in background or open)
    const subscription = Linking.addEventListener('url', event => {
      processUrl(event.url, false);
    });

    // 2. Cold start check (App launched from closed state)
    Linking.getInitialURL().then(url => {
      if (url) {
        processUrl(url, true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [processUrl]);

  const handleContainerReady = () => {
    if (initialUrlRef.current) {
      const pendingUrl = initialUrlRef.current;
      initialUrlRef.current = null;

      if (processedInitialUrlRef.current === pendingUrl) {
        return;
      }
      processedInitialUrlRef.current = pendingUrl;

      setTimeout(() => {
        handleDeepLinkUrl(pendingUrl, (screen, params) => {
          if (navigationRef.isReady()) {
            navigationRef.navigate(screen as any, params);
          }
        });
      }, 100);
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={handleContainerReady}>
        <AppNavigator />
      </NavigationContainer>
      <InvalidLinkModal
        onNavigateHome={() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Tabs' as any);
          }
        }}
      />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;
