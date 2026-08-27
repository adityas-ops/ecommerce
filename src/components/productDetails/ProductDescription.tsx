import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

interface Props {
  description: string;
}

const ProductDescription: React.FC<Props> = ({ description }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Description
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default ProductDescription;
