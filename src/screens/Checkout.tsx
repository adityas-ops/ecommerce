import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import ConfettiCannon from 'react-native-confetti-cannon';
import { RootState, useAppSelector } from '../store/store';
import { RootStackParamList } from '../navigations/AppNav';
import { clearCart } from '../store/slices/cartSlice';
import colors from '../theme/colors';

import { setCheckoutDetails } from '../store/slices/checkoutSlice';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'checkout'
>;

type PaymentMethod = 'cod' | 'card' | 'upi';

const Checkout = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const dispatch = useDispatch();

  const user = useAppSelector(state => state.user);
  const savedCheckout = useAppSelector(state => state.checkout);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [fullName, setFullName] = useState(savedCheckout.fullName || '');
  const [phone, setPhone] = useState(savedCheckout.phone || '');
  const [address, setAddress] = useState(savedCheckout.address || '');
  const [city, setCity] = useState(savedCheckout.city || '');
  const [postalCode, setPostalCode] = useState(savedCheckout.postalCode || '');
  const [email, setEmail] = useState(savedCheckout.email || user.email || '');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    savedCheckout.paymentMethod || 'cod',
  );
  const [cardNumber, setCardNumber] = useState(savedCheckout.cardNumber || '');
  const [cardExpiry, setCardExpiry] = useState(savedCheckout.cardExpiry || '');
  const [cardCvv, setCardCvv] = useState(savedCheckout.cardCvv || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderId, setOrderId] = useState('');

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Math.round(item.price * (1 - (item.discountPercentage || 0) / 100)) *
        item.count,
    0,
  );
  const shipping = cartItems.length > 0 ? 6 : 0;
  const total = subtotal + shipping;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (paymentMethod === 'card') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Valid 16-digit card number required';
      }
      if (!cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry required (MM/YY)';
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        newErrors.cardCvv = 'Valid CVV required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) {
      return;
    }
    dispatch(
      setCheckoutDetails({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        paymentMethod,
        cardNumber,
        cardExpiry,
        cardCvv,
      }),
    );

    // Generate random Order ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newOrderId = `SE-${randomNum}`;
    setOrderId(newOrderId);

    // Open modal instantly & clear cart
    setShowConfetti(false);
    setOrderSuccess(true);
    dispatch(clearCart());

    // Trigger smooth 60fps confetti cannon 150ms after modal transition
    setTimeout(() => {
      setShowConfetti(true);
    }, 150);
  };

  const handleFinishCheckout = () => {
    setOrderSuccess(false);
    setShowConfetti(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Order Items Brief */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Items ({cartItems.reduce((acc, item) => acc + item.count, 0)})
              </Text>
              <Text style={styles.summaryValue}>${subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>${shipping}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>${total}</Text>
            </View>
          </View>

          {/* Shipping & Delivery Address Form */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.fullName ? styles.inputError : null,
                ]}
                placeholder="e.g. John Doe"
                placeholderTextColor={colors.mutedForeground}
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  if (errors.fullName) {
                    setErrors(prev => ({ ...prev, fullName: '' }));
                  }
                }}
              />
              {errors.fullName ? (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              ) : null}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="e.g. +1 234 567 8900"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  if (errors.phone) {
                    setErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. john@example.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Delivery Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.address ? styles.inputError : null,
                ]}
                placeholder="e.g. 123 Main Street, Apt 4B"
                placeholderTextColor={colors.mutedForeground}
                value={address}
                onChangeText={text => {
                  setAddress(text);
                  if (errors.address) {
                    setErrors(prev => ({ ...prev, address: '' }));
                  }
                }}
              />
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}
            </View>

            {/* City & Postal Code Row */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[styles.input, errors.city ? styles.inputError : null]}
                  placeholder="City"
                  placeholderTextColor={colors.mutedForeground}
                  value={city}
                  onChangeText={text => {
                    setCity(text);
                    if (errors.city) {
                      setErrors(prev => ({ ...prev, city: '' }));
                    }
                  }}
                />
                {errors.city ? (
                  <Text style={styles.errorText}>{errors.city}</Text>
                ) : null}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Postal Code *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.postalCode ? styles.inputError : null,
                  ]}
                  placeholder="Zip code"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  value={postalCode}
                  onChangeText={text => {
                    setPostalCode(text);
                    if (errors.postalCode) {
                      setErrors(prev => ({ ...prev, postalCode: '' }));
                    }
                  }}
                />
                {errors.postalCode ? (
                  <Text style={styles.errorText}>{errors.postalCode}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Payment Method Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            {/* Option 1: COD */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cod' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('cod')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={
                    paymentMethod === 'cod'
                      ? colors.primary
                      : colors.mutedForeground
                  }
                />
                <Text style={styles.paymentOptionText}>
                  Cash on Delivery (COD)
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === 'cod' && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === 'cod' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* Option 2: Card */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('card')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={
                    paymentMethod === 'card'
                      ? colors.primary
                      : colors.mutedForeground
                  }
                />
                <Text style={styles.paymentOptionText}>
                  Credit / Debit Card
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === 'card' && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === 'card' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
            </TouchableOpacity>

            {/* Card Inputs if Card Selected */}
            {paymentMethod === 'card' && (
              <View style={styles.cardFieldsContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Card Number *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.cardNumber ? styles.inputError : null,
                    ]}
                    placeholder="1234 5678 9101 1121"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChangeText={text => {
                      setCardNumber(text);
                      if (errors.cardNumber) {
                        setErrors(prev => ({ ...prev, cardNumber: '' }));
                      }
                    }}
                  />
                  {errors.cardNumber ? (
                    <Text style={styles.errorText}>{errors.cardNumber}</Text>
                  ) : null}
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Expiry Date *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.cardExpiry ? styles.inputError : null,
                      ]}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.mutedForeground}
                      maxLength={5}
                      value={cardExpiry}
                      onChangeText={text => {
                        setCardExpiry(text);
                        if (errors.cardExpiry) {
                          setErrors(prev => ({ ...prev, cardExpiry: '' }));
                        }
                      }}
                    />
                    {errors.cardExpiry ? (
                      <Text style={styles.errorText}>{errors.cardExpiry}</Text>
                    ) : null}
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>CVV *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.cardCvv ? styles.inputError : null,
                      ]}
                      placeholder="123"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={4}
                      value={cardCvv}
                      onChangeText={text => {
                        setCardCvv(text);
                        if (errors.cardCvv) {
                          setErrors(prev => ({ ...prev, cardCvv: '' }));
                        }
                      }}
                    />
                    {errors.cardCvv ? (
                      <Text style={styles.errorText}>{errors.cardCvv}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            )}

            {/* Option 3: UPI */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'upi' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('upi')}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadioRow}>
                <Ionicons
                  name="qr-code-outline"
                  size={20}
                  color={
                    paymentMethod === 'upi'
                      ? colors.primary
                      : colors.mutedForeground
                  }
                />
                <Text style={styles.paymentOptionText}>UPI / Net Banking</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === 'upi' && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === 'upi' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          activeOpacity={0.85}
        >
          <Text style={styles.placeOrderText}>Place Order · ${total}</Text>
        </TouchableOpacity>
      </View>

      {/* Order Success & Celebration Modal */}
      <Modal
        visible={orderSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleFinishCheckout}
      >
        <View style={styles.modalOverlay}>
          {/* Fast, lag-free 60fps celebration confetti */}
          {showConfetti && (
            <ConfettiCannon
              count={90}
              origin={{ x: 180, y: -20 }}
              fallSpeed={3000}
              fadeOut
            />
          )}

          <View style={styles.modalCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>

            <Text style={styles.successTitle}>Order Placed! 🎉</Text>
            <Text style={styles.successSubtitle}>
              Thank you for your order, {fullName || 'Valued Customer'}!
            </Text>

            <View style={styles.orderIdBadge}>
              <Text style={styles.orderIdLabel}>Order Reference:</Text>
              <Text style={styles.orderIdValue}>{orderId}</Text>
            </View>

            <Text style={styles.deliveryNotice}>
              We are preparing your package for delivery to{' '}
              {city || 'your address'}.
            </Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleFinishCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Back to Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.foreground,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.foreground,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  paymentRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  cardFieldsContainer: {
    backgroundColor: colors.secondary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  shopNowButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 25,
    alignItems: 'center',
  },
  shopNowButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.foreground,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  orderIdLabel: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  orderIdValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  deliveryNotice: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Checkout;
