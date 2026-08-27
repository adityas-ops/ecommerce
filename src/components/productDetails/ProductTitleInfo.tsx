import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import colors from '../../theme/colors';

interface Props {
  brand?: string;
  title: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  tags: string[];
}

const ProductTitleInfo: React.FC<Props> = ({
  brand,
  title,
  rating,
  reviewsCount,
  stock,
  tags,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.brand, { color: colors.mutedForeground }]}>
        {(brand || 'BRAND').toUpperCase()}
      </Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

      <View style={styles.ratingRow}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <Ionicons
              key={star}
              name={star <= Math.round(rating) ? 'star' : 'star-outline'}
              size={16}
              color="#6C5CE7"
            />
          ))}
        </View>
        <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
          {rating.toFixed(1)} · {reviewsCount} reviews
        </Text>
      </View>

      <View style={styles.tagsContainer}>
        <View style={[styles.tagBadge, { backgroundColor: '#6C5CE720' }]}>
          <Text style={[styles.tagText, { color: '#6C5CE7' }]}>
            {stock > 0 ? `In Stock · ${stock} left` : 'Out of Stock'}
          </Text>
        </View>
        {tags.map(tag => (
          <View
            key={tag}
            style={[styles.tagBadge, { backgroundColor: colors.border }]}
          >
            <Text style={[styles.tagText, { color: colors.foreground }]}>
              #{tag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  brand: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductTitleInfo;
