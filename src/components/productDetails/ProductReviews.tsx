import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { Review } from '../../types/product';
import colors from '../../theme/colors';

interface Props {
  reviews: Review[];
}

const ProductReviews: React.FC<Props> = ({ reviews }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Reviews
        </Text>
        <Text style={[styles.totalText, { color: colors.mutedForeground }]}>
          {reviews.length} total
        </Text>
      </View>

      {reviews.map((review, index) => (
        <View
          key={index}
          style={[styles.reviewCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.reviewHeader}>
            <Text style={[styles.reviewerName, { color: colors.foreground }]}>
              {review.reviewerName}
            </Text>
            <Text
              style={[styles.reviewDate, { color: colors.mutedForeground }]}
            >
              {new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons
                key={star}
                name={star <= review.rating ? 'star' : 'star-outline'}
                size={14}
                color="#FF6347"
              />
            ))}
          </View>
          <Text style={[styles.comment, { color: colors.mutedForeground }]}>
            {review.comment}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 14,
  },
  reviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ProductReviews;
