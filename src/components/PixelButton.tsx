import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { audioManager } from '../utils/AudioManager';

interface PixelButtonProps extends PressableProps {
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PixelButton({
  backgroundColor = Colors.gold,
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}: PixelButtonProps) {
  const translateY = useSharedValue(0);
  const shadowHeight = useSharedValue(5);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      shadowOffset: { width: 0, height: shadowHeight.value },
    };
  });

  const handlePressIn = (e: any) => {
    audioManager.playButtonEffect();
    translateY.value = withTiming(3, { duration: 50 });
    shadowHeight.value = withTiming(2, { duration: 50 });
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    translateY.value = withSpring(0, { mass: 0.5 });
    shadowHeight.value = withSpring(5, { mass: 0.5 });
    if (onPressOut) onPressOut(e);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        { backgroundColor },
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 3,
    borderColor: Colors.ink,
    borderRadius: 14,
    shadowColor: Colors.ink,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3, // For Android
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});
