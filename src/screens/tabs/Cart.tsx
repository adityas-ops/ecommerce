import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import CartCard from '../../components/cart/CartCard';
import colors from '../../theme/colors';

const Cart = () => {
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ScrollContent}
        >
          {cartItems.length > 0 ? (
            cartItems.map(item => <CartCard key={item.id} item={item} />)
          ) : (
            <View style={styles.EmptyState}>
              <Text style={styles.EmptyText}>Your cart is empty.</Text>
            </View>
          )}

          {cartItems.length > 0 && (
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
          )}
        </ScrollView>

        {cartItems.length > 0 && (
          <View style={styles.Footer}>
            <TouchableOpacity style={styles.CheckoutButton} activeOpacity={0.8}>
              <Text style={styles.CheckoutText}>Checkout</Text>
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
  EmptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  EmptyText: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
});

export default Cart;
