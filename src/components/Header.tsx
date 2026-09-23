import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from './Typography';
import { PixelButton } from './PixelButton';
import { audioManager } from '../utils/AudioManager';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  currentSlide: number;
  totalSlides: number;
  points: number;
  title?: string;
  onHomePress: () => void;
  onMusicPress?: () => void;
}

export function Header({
  currentSlide,
  totalSlides,
  points,
  title,
  onHomePress,
  onMusicPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [isMusicPlaying, setIsMusicPlaying] = useState(audioManager.isMusicPlaying);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(setIsMusicPlaying);
    return unsubscribe;
  }, []);

  const handleMusicPress = () => {
    audioManager.toggleMainSong();
    if (onMusicPress) onMusicPress();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={[styles.innerContainer, isMobile ? styles.innerContainerMobile : undefined]}>
        {/* Home Button */}
        <PixelButton 
          backgroundColor={Colors.blue} 
          style={[styles.homeBtn, isMobile ? styles.btnMobile : undefined]}
          onPress={onHomePress}
        >
          <Typography variant="pixel" style={[styles.homeText, isMobile ? styles.textMobile : undefined]}>
            {title || 'ART CLASS 🎨'}
          </Typography>
        </PixelButton>

        <View style={[styles.rightGroup, isMobile ? styles.rightGroupMobile : undefined]}>
          {/* Points Indicator */}
          <View style={[styles.pointsIndicator, isMobile ? styles.indicatorMobile : undefined]}>
            <Typography weight="bold" style={isMobile ? styles.textMobile : {}}>
              ⭐ {points} POIN
            </Typography>
          </View>

          {/* Music Button */}
          <PixelButton 
            backgroundColor={Colors.purple} 
            style={[styles.musicBtn, isMobile ? styles.btnMobile : undefined]}
            onPress={handleMusicPress}
          >
            <Typography style={[styles.musicText, isMobile ? styles.textMobile : undefined]}>
              {isMusicPlaying ? '♫ MUSIK: ON' : '♫ MUSIK: OFF'}
            </Typography>
          </PixelButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cream,
    borderBottomWidth: 4,
    borderBottomColor: Colors.ink,
    zIndex: 30,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 1280, // max-w-7xl approx
    width: '100%',
    alignSelf: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  homeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  homeText: {
    color: Colors.white,
    fontSize: 12,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightGroupMobile: {
    gap: 4,
  },
  slideIndicator: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pointsIndicator: {
    backgroundColor: Colors.gold,
    borderWidth: 3,
    borderColor: Colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  indicatorMobile: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
  },
  musicBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  musicText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  innerContainerMobile: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-between',
    gap: 4,
  },
  btnMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 6,
  },
  textMobile: {
    fontSize: 10,
  }
});
