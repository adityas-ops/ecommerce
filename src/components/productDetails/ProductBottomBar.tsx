import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../theme/colors';

interface Props {
  price: number;
  discountPercentage: number;
  onAddToCart: () => void;
  isAdded?: boolean;
}

const ProductBottomBar: React.FC<Props> = ({
  price,
  discountPercentage,
  onAddToCart,
  isAdded,
}) => {
  const discountedPrice = Math.round(
    price * (1 - (discountPercentage || 0) / 100),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isAdded ? '#4CAF50' : colors.primary },
        ]}
        activeOpacity={0.8}
        onPress={onAddToCart}
        disabled={isAdded} // Disable if already added to avoid redundant additions
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
          {isAdded ? 'Added' : `Add to Cart · $${discountedPrice}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  button: {
    height: 45,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductBottomBar;
