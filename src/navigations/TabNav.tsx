import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from '../screens/tabs/Home';
import Cart from '../screens/tabs/Cart';
import Profile from '../screens/tabs/Profile';
import Ionicons, {
  IoniconsIconName,
} from '@react-native-vector-icons/ionicons/static';
import { StyleSheet } from 'react-native';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabNav = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, focused, size }) => {
          let iconName: IoniconsIconName = 'home';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}

        // options={{ animation: 'shift' }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarBadgeStyle: {
            backgroundColor: colors.destructive,
            color: colors.primaryForeground,
            fontSize: 8,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        // options={{ animation: 'shift' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default TabNav;
