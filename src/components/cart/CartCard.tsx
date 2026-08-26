import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { CartItem } from '../../types/product';
import { useDispatch } from 'react-redux';
import {
  addToCart,
  decrementCount,
  removeFromCart,
} from '../../store/slices/cartSlice';
import colors from '../../theme/colors';

interface CartCardProps {
  item: CartItem;
}

const CartCard: React.FC<CartCardProps> = ({ item }) => {
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(addToCart({ ...item, count: 1 }));
  };

  const handleDecrement = () => {
    dispatch(decrementCount(item.id));
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Product',
      'Are you sure you want to delete this product from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(item.id)),
        },
      ],
      { cancelable: true },
    );
  };

  const itemPrice = Math.round(
    item.price * (1 - (item.discountPercentage || 0) / 100),
  );

  return (
    <View style={styles.CartItemCard}>
      <View style={styles.ImageWrapper}>
        <Image source={{ uri: item.thumbnail }} style={styles.ItemImage} />
      </View>
      <View style={styles.ItemDetails}>
        <Text style={styles.BrandText} numberOfLines={1}>
          {item.brand?.toUpperCase() || item.category?.toUpperCase() || 'BRAND'}
        </Text>
        <Text style={styles.TitleText} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.PriceRow}>
          <Text style={styles.PriceText}>${itemPrice}</Text>
          <View style={styles.ActionsRow}>
            <View style={styles.CounterPill}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={styles.CounterButton}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={colors.primaryForeground}
                />
              </TouchableOpacity>
              <Text style={styles.CountText}>{item.count}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={styles.IncrementButton}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color={colors.primaryForeground}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.DeleteButton}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  CartItemCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 0.5,
  },
  ImageWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#F3E1D2', // Matching product card
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ItemImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  ItemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  BrandText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.mutedForeground,
    letterSpacing: 1,
    marginBottom: 4,
  },
  TitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
    lineHeight: 20,
  },
  PriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  PriceText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.foreground,
  },
  ActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  CounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 4,
  },
  CounterButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  CountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.foreground,
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  IncrementButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  DeleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default CartCard;
