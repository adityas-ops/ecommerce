import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductDetails from '../screens/ProductDetails';
import Checkout from '../screens/Checkout';
import Login from '../screens/Login';
import TabNav from './TabNav';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/store';

export type RootStackParamList = {
  Tabs: undefined;
  productDetail: { id: number };
  checkout: undefined;
  login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const user = useAppSelector(state => state.user);
  const isAuthenticated = Boolean(
    user && user.email && user.email.trim().length > 0,
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Tabs' : 'login'}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Tabs"
              component={TabNav}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Tabs"
              component={TabNav}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="login"
              component={Login}
              options={{ headerShown: false }}
            />
          </>
        )}
        <Stack.Screen
          name="productDetail"
          component={ProductDetails}
          options={{ title: 'Product Details', headerShown: false }}
        />
        <Stack.Screen
          name="checkout"
          component={Checkout}
          options={{ title: 'Checkout', headerShown: false }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default AppNavigator;
