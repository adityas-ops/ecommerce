import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { Product } from '../../types/product';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import Toast from 'react-native-toast-message';
import colors from '../../theme/colors';
import { RootStackParamList } from '../../navigations/AppNav';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  // Calculate prices based on discount
  const originalPrice = product.price;
  const discountedPrice =
    originalPrice * (1 - (product.discountPercentage || 0) / 100);

  const handlePressCard = () => {
    navigation.navigate('productDetail', { id: product.id });
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, count: 1 }));
    Toast.show({
      type: 'success',
      text1: 'Product added',
      position: 'top',
      topOffset: 60,
      visibilityTime: 1000,
      autoHide: true,
    });
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 8,
      }}
    >
      <TouchableOpacity
        style={styles.CardContainer}
        activeOpacity={0.9}
        onPress={handlePressCard}
      >
        <View style={styles.InnerContainer}>
          <View style={styles.ImageWrapper}>
            <Image source={{ uri: product.thumbnail }} style={styles.Image} />
            {product.discountPercentage > 0 && (
              <View style={styles.Badge}>
                <Text style={styles.BadgeText}>
                  {Math.round(product.discountPercentage)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.InfoContainer}>
            <Text numberOfLines={1} style={styles.BrandText}>
              {product.brand?.toUpperCase() || 'BRAND'}
            </Text>
            <Text style={styles.TitleText} numberOfLines={1}>
              {product.title}
            </Text>

            <View style={styles.BottomRow}>
              <View style={styles.PriceContainer}>
                <Text style={styles.DiscountedPriceText}>
                  ${Math.round(discountedPrice)}
                </Text>
                {product.discountPercentage > 0 && (
                  <Text style={styles.OriginalPriceText}>
                    ${Math.round(originalPrice)}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.AddButton}
                activeOpacity={0.7}
                onPress={handleAddToCart}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  CardContainer: {
    backgroundColor: colors.card,
    borderRadius: 18,
    height: 250,
    borderWidth: 0.5,
  },
  InnerContainer: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  ImageWrapper: {
    height: 135,
    width: '100%',
    backgroundColor: '#F3E1D2', // Peach background
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  Image: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  Badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.badgeColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  BadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  InfoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  BrandText: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  TitleText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  BottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  PriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  DiscountedPriceText: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 4,
  },
  OriginalPriceText: {
    color: colors.mutedForeground,
    fontSize: 11,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  AddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;
