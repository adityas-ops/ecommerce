import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById } from '../api/productApi';
import { Product } from '../types/product';
import { RootStackParamList } from '../navigations/AppNav';
import { RootState } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import Toast from 'react-native-toast-message';
import colors from '../theme/colors';
import ProductHeaderImage from '../components/productDetails/ProductHeaderImage';
import ProductTitleInfo from '../components/productDetails/ProductTitleInfo';
import ProductPriceBox from '../components/productDetails/ProductPriceBox';
import ProductDescription from '../components/productDetails/ProductDescription';
import ProductInfoList from '../components/productDetails/ProductInfoList';
import ProductSpecifications from '../components/productDetails/ProductSpecifications';
import ProductReviews from '../components/productDetails/ProductReviews';
import ProductBottomBar from '../components/productDetails/ProductBottomBar';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'productDetail'>;

const ProductDetails = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const { id } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isAdded = cartItems.some(item => item.id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ ...product, count: 1 }));
      Toast.show({
        type: 'success',
        text1: 'Product added to cart',
        position: 'top',
        bottomOffset: 80,
        visibilityTime: 1500,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProductHeaderImage images={product.images || [product.thumbnail]} />
        <ProductTitleInfo
          brand={product.brand}
          title={product.title}
          rating={product.rating}
          reviewsCount={product.reviews?.length || 0}
          stock={product.stock}
          tags={product.tags || []}
        />
        <ProductPriceBox
          price={product.price}
          discountPercentage={product.discountPercentage}
        />
        <ProductDescription description={product.description} />
        <ProductInfoList
          shippingInformation={
            product.shippingInformation || 'Standard Shipping'
          }
          warrantyInformation={product.warrantyInformation || '1 Year Warranty'}
          returnPolicy={product.returnPolicy || '30-Day Return Policy'}
          minimumOrderQuantity={product.minimumOrderQuantity || 1}
        />
        <ProductSpecifications
          category={product.category}
          sku={product.sku || 'N/A'}
          weight={product.weight || 0}
          dimensions={product.dimensions || { width: 0, height: 0, depth: 0 }}
          minimumOrderQuantity={product.minimumOrderQuantity || 1}
          barcode={product.meta?.barcode || 'N/A'}
        />
        {product.reviews && product.reviews.length > 0 && (
          <ProductReviews reviews={product.reviews} />
        )}
      </ScrollView>

      <ProductBottomBar
        price={product.price}
        discountPercentage={product.discountPercentage}
        onAddToCart={handleAddToCart}
        isAdded={isAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
});

export default ProductDetails;
