import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import ProductCard from '../../components/Home/ProductCard';
import FilterBottomSheet, {
  SortOption,
} from '../../components/Home/FilterBottomSheet';
import { FlashList } from '@shopify/flash-list';
import useDebounce from '../../hooks/useDebounce';
import {
  getProducts,
  searchProducts,
  getCategoriesList,
  getProductsByCategory,
} from '../../api/productApi';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Product } from '../../types/product';
import colors from '../../theme/colors';

const LIMIT = 10;

type HomeRouteProp = RouteProp<{ Home: { category?: string } }, 'Home'>;

const Home = () => {
  const route = useRoute<HomeRouteProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<SortOption>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedSort !== 'none' ? 1 : 0);

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catList = await getCategoriesList();
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  const parseSort = (sort: SortOption) => {
    switch (sort) {
      case 'price-asc':
        return { sortBy: 'price', order: 'asc' as const };
      case 'price-desc':
        return { sortBy: 'price', order: 'desc' as const };
      case 'title-asc':
        return { sortBy: 'title', order: 'asc' as const };
      case 'title-desc':
        return { sortBy: 'title', order: 'desc' as const };
      default:
        return { sortBy: undefined, order: undefined };
    }
  };

  const fetchProducts = useCallback(
    async (
      skipOffset: number,
      isRefresh = false,
      search = debouncedSearch,
      category = selectedCategory,
      sort = selectedSort,
    ) => {
      try {
        if (skipOffset === 0 && !isRefresh) {
          setLoading(true);
        } else if (skipOffset > 0) {
          setLoadingMore(true);
        }

        const trimmedQuery = search.trim();
        const { sortBy, order } = parseSort(sort);
        let response;

        if (category) {
          response = await getProductsByCategory({
            category,
            limit: LIMIT,
            skip: skipOffset,
            sortBy,
            order,
          });
        } else if (trimmedQuery) {
          response = await searchProducts({
            query: trimmedQuery,
            limit: LIMIT,
            skip: skipOffset,
            sortBy,
            order,
          });
        } else {
          response = await getProducts({
            limit: LIMIT,
            skip: skipOffset,
            sortBy,
            order,
          });
        }

        setTotal(response.total);

        if (skipOffset === 0 || isRefresh) {
          setProducts(response.products);
        } else {
          setProducts(prev => [...prev, ...response.products]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedSort],
  );

  useEffect(() => {
    fetchProducts(0, false, debouncedSearch, selectedCategory, selectedSort);
  }, [debouncedSearch, selectedCategory, selectedSort, fetchProducts]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && products.length < total) {
      fetchProducts(products.length);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(0, true);
  };

  const handleApplyFilter = (cat: string, sort: SortOption) => {
    setSelectedCategory(cat);
    setSelectedSort(sort);
    setBottomSheetVisible(false);
  };

  const formatCategoryName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.Container}>
      <View style={styles.SafeContainer}>
        {/* Header Section */}
        <View style={styles.HeaderContainer}>
          <View style={styles.HeaderLeft}>
            {/* Avatar */}
            <View style={styles.Avatar}>
              <Text style={styles.AvatarText}>A</Text>
            </View>

            <View style={styles.TitleContainer}>
              <Text style={styles.Title}>E-Commerce</Text>
              <Text style={styles.Subtitle}>Buy products you need</Text>
            </View>
          </View>
        </View>

        <View style={styles.SearchParentContainer}>
          <View style={styles.SearchAndFilterRow}>
            <View style={styles.SearchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.mutedForeground}
                style={styles.SearchIcon}
              />
              <TextInput
                style={styles.SearchInput}
                placeholder="Search products or brands"
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  style={styles.ClearButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              )}
            </View>

            {/* Filter Button with Active Count Badge */}
            <TouchableOpacity
              style={[
                styles.FilterButton,
                activeFilterCount > 0 && styles.FilterButtonActive,
              ]}
              onPress={() => setBottomSheetVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={
                  activeFilterCount > 0
                    ? colors.primaryForeground
                    : colors.foreground
                }
              />
              {activeFilterCount > 0 && (
                <View style={styles.Badge}>
                  <Text style={styles.BadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.ProductContainer}>
          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlashList
              data={products}
              numColumns={2}
              renderItem={({ item }) => (
                <View style={styles.CardWrapper}>
                  <ProductCard product={item} />
                </View>
              )}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() =>
                loadingMore ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                    style={{ marginVertical: 20 }}
                  />
                ) : null
              }
              ListEmptyComponent={() => (
                <Text style={styles.EmptyText}>No products found.</Text>
              )}
            />
          )}
        </View>
      </View>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={isBottomSheetVisible}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        onClose={() => setBottomSheetVisible(false)}
        onApply={handleApplyFilter}
      />
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
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  HeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
  },
  HeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  AvatarText: {
    color: colors.primaryForeground,
    fontSize: 20,
    fontWeight: '900',
  },
  TitleContainer: {
    justifyContent: 'center',
  },
  Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 1,
  },
  Subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  SearchParentContainer: {
    paddingHorizontal: 10,
  },
  SearchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  SearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
  },
  SearchIcon: {
    marginRight: 10,
  },
  SearchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.foreground,
  },
  ClearButton: {
    padding: 4,
  },
  FilterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  FilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  Badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f61313ff',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  BadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  CategoryPillsContainer: {
    marginTop: 12,
    marginBottom: 6,
  },
  CategoryPillsContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  Pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  PillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  PillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  PillTextSelected: {
    color: colors.primaryForeground,
    fontWeight: '700',
  },
  ProductContainer: {
    flex: 1,
    paddingTop: 10,
  },
  CardWrapper: {
    padding: 5,
  },
  EmptyText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    marginTop: 40,
    fontSize: 16,
  },
});

export default Home;
