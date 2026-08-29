import { store } from '../store/store';
import {
  setPendingDeepLink,
  setInvalidDeepLink,
} from '../store/slices/deepLinkSlice';
import { getCategoriesList, getProductById } from '../api/productApi';
import Toast from 'react-native-toast-message';

export const handleDeepLinkUrl = async (
  url: string | null,
  navigate: (screen: string, params?: any) => void,
) => {
  if (!url) {
    return;
  }

  // Normalize URL string e.g. myapp://category/electronics -> category/electronics
  const cleanUrl = url.replace(/^myapp:\/\//i, '').replace(/^\/+/, '');

  if (!cleanUrl) {
    return;
  }

  const parts = cleanUrl.split('/');
  const routeName = parts[0]?.toLowerCase();
  const routeParam = parts[1];

  const state = store.getState();
  const isAuthenticated = Boolean(
    state.user && state.user.email && state.user.email.trim().length > 0,
  );

  // 1. myapp://product/123
  if (routeName === 'product') {
    const productId = Number(routeParam);
    if (isNaN(productId) || productId <= 0) {
      store.dispatch(
        setInvalidDeepLink({
          url,
          title: 'Invalid Product ID',
          message: `Product ID "${
            routeParam || ''
          }" is invalid. Please specify a valid numeric product ID.`,
        }),
      );
      return;
    }

    try {
      const product = await getProductById(productId);
      if (product && product.id) {
        navigate('productDetail', { id: productId });
        return;
      }
    } catch (error) {
      store.dispatch(
        setInvalidDeepLink({
          url,
          title: 'Product Not Found',
          message: `Product #${productId} was not found or is no longer available in our catalog.`,
        }),
      );
      return;
    }
    return;
  }

  // 2. myapp://category/smartphones
  if (routeName === 'category') {
    if (!routeParam || routeParam.trim().length === 0) {
      store.dispatch(
        setInvalidDeepLink({
          url,
          title: 'Category Not Specified',
          message: 'Please specify a category name in the deep link URL.',
        }),
      );
      return;
    }

    const rawCategoryName = decodeURIComponent(routeParam.trim());
    const categoryName = rawCategoryName.toLowerCase();

    try {
      const availableCategories = await getCategoriesList();
      const matchedCategory = availableCategories.find(
        cat => cat.toLowerCase() === categoryName,
      );

      if (matchedCategory) {
        navigate('Tabs', {
          screen: 'Home',
          params: { category: matchedCategory },
        });
        return;
      } else {
        store.dispatch(
          setInvalidDeepLink({
            url,
            title: 'Category Not Found',
            message: `Category "${rawCategoryName}" was not found in our store catalog.`,
          }),
        );
        return;
      }
    } catch (error) {
      navigate('Tabs', {
        screen: 'Home',
        params: { category: rawCategoryName },
      });
      return;
    }
  }

  // 3. myapp://cart (requires authentication)
  if (routeName === 'cart') {
    if (isAuthenticated) {
      navigate('Tabs', { screen: 'Cart' });
    } else {
      store.dispatch(setPendingDeepLink('cart'));
      Toast.show({
        type: 'info',
        text1: 'Please log in to view your cart',
      });
      navigate('login');
    }
    return;
  }

  // 4. myapp://profile
  if (routeName === 'profile') {
    navigate('Tabs', { screen: 'Profile' });
    return;
  }

  // 4. Invalid or unrecognized URL
  store.dispatch(
    setInvalidDeepLink({
      url,
      title: 'Invalid Deep Link',
      message: `The link "${url}" is invalid or unrecognized.`,
    }),
  );
};
