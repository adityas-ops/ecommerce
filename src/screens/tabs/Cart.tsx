import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { RootState } from '../../store/store';
import { RootStackParamList } from '../../navigations/AppNav';
import CartCard from '../../components/cart/CartCard';
import colors from '../../theme/colors';

const Cart = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Math.round(item.price * (1 - (item.discountPercentage || 0) / 100)) *
        item.count,
    0,
  );

  const shipping = cartItems.length > 0 ? 6 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    navigation.navigate('checkout');
  };

  const handleStartShopping = () => {
    navigation.navigate('Home' as any);
  };

  return (
    <View style={styles.Container}>
      <View style={styles.SafeContainer}>
        <View style={styles.Header}>
          <Text style={styles.HeaderTitle}>Your Cart</Text>
          <Text style={styles.HeaderSubtitle}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready
            to go
          </Text>
        </View>

        {cartItems.length > 0 ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ScrollContent}
            >
              {cartItems.map(item => (
                <CartCard key={item.id} item={item} />
              ))}

              <View style={styles.SummaryCard}>
                <View style={styles.SummaryRow}>
                  <Text style={styles.SummaryLabel}>Subtotal</Text>
                  <Text style={styles.SummaryValue}>${subtotal}</Text>
                </View>
                <View style={styles.SummaryRow}>
                  <Text style={styles.SummaryLabel}>Shipping</Text>
                  <Text style={styles.SummaryValue}>${shipping}</Text>
                </View>
                <View style={styles.Divider} />
                <View style={styles.SummaryRow}>
                  <Text style={styles.TotalLabel}>Total</Text>
                  <Text style={styles.TotalValue}>${total}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.Footer}>
              <TouchableOpacity
                style={styles.CheckoutButton}
                activeOpacity={0.8}
                onPress={handleCheckout}
              >
                <Text style={styles.CheckoutText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.EmptyContainer}>
            <View style={styles.EmptyIconCircle}>
              <Ionicons name="cart-outline" size={60} color={colors.primary} />
            </View>
            <Text style={styles.EmptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.EmptySubtitle}>
              Looks like you haven't added anything to your cart yet. Explore
              our products and add your favorite items!
            </Text>

            <TouchableOpacity
              style={styles.ShopNowButton}
              onPress={handleStartShopping}
              activeOpacity={0.85}
            >
              <Text style={styles.ShopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  SafeContainer: {
    flex: 1,
  },
  Header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  HeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.foreground,
    marginBottom: 0,
  },
  HeaderSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  ScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  SummaryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  SummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  SummaryLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  SummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  Divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  TotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  TotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  Footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  CheckoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  CheckoutText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: 'bold',
  },
  EmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  EmptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  EmptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  EmptySubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  ShopNowButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 25,
    alignItems: 'center',
  },
  ShopNowButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Cart;
