import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface TypographyProps extends TextProps {
  variant?: 'pixel' | 'normal';
  weight?: 'regular' | 'bold' | 'semibold';
  color?: string;
}

export function Typography({
  variant = 'normal',
  weight = 'regular',
  color = Colors.ink,
  style,
  children,
  ...props
}: TypographyProps) {
  let fontFamily = 'Fredoka_400Regular';
  if (variant === 'pixel') {
    fontFamily = 'PressStart2P_400Regular';
  } else {
    if (weight === 'bold') {
      fontFamily = 'Fredoka_700Bold';
    } else if (weight === 'semibold') {
      fontFamily = 'Fredoka_600SemiBold';
    }
  }

  return (
    <Text
      style={[
        { fontFamily, color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
