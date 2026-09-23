import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface PixelCardProps extends ViewProps {
  backgroundColor?: string;
}

export function PixelCard({
  backgroundColor = Colors.cream,
  style,
  children,
  ...props
}: PixelCardProps) {
  return (
    <View style={[styles.container, { backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 4,
    borderColor: Colors.ink,
    borderRadius: 28, // Matches tailwind rounded-[28px]
    padding: 24, // px-6 py-6 approx
    shadowColor: Colors.ink,
    shadowOffset: { width: 4, height: 4 }, // Replicating pixel box-shadow: 6px 6px 0
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, // for android
  },
});
