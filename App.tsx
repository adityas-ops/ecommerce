import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigations/AppNav';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import Toast from 'react-native-toast-message';

const App = () => {
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

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
