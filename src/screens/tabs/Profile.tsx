import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { clearUser } from '../../store/slices/userSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { clearCheckoutDetails } from '../../store/slices/checkoutSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigations/AppNav';
import colors from '../../theme/colors';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Tabs'
>;

const Profile = () => {
  const user = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(clearCart());
    dispatch(clearCheckoutDetails());
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.emailLabel}>Logged in as</Text>
        <Text style={styles.emailText}>
          {user.email || 'No user logged in'}
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  emailLabel: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: colors.destructive,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Profile;
