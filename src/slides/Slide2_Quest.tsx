import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Typography } from '../components/Typography';
import { PixelCard } from '../components/PixelCard';
import { Colors } from '../theme/colors';

export function Slide2_Quest() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const questItems = [
    { num: 1, text: '1 · Gagasan', icon: '💡', color: Colors.gold },
    { num: 2, text: '2 · Rencana', icon: '🗒️', color: Colors.orange },
    { num: 3, text: '3 · Berkarya', icon: '🎨', color: '#ff887c' },
    { num: 4, text: '4 · Revisi', icon: '🔎', color: Colors.purple },
    { num: 5, text: '5 · Galeri', icon: '🖼️', color: Colors.green },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <PixelCard backgroundColor={Colors.cream} style={isMobile ? styles.bannerMobile : styles.banner}>
            <Typography variant="pixel" color={Colors.red} style={styles.kicker}>
              SLIDE 02 · CREATIVE QUEST
            </Typography>
            <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.titleMobile : styles.title}>
              Selesaikan perjalanan kreatif dari ide pertama sampai pameran.
            </Typography>
            <Typography style={isMobile ? styles.copyMobile : styles.copy}>
              Setiap tahap membantu kamu melihat karya seni bukan hanya sebagai hasil akhir, tetapi sebagai proses berpikir, mencoba, memperbaiki, dan berbagi.
            </Typography>
          </PixelCard>
        </Animated.View>

        <View style={[styles.questGrid, isMobile && styles.questGridMobile]}>
          {questItems.map((item, index) => (
            <Animated.View 
              key={item.num} 
              entering={FadeInUp.delay(index * 100).duration(500)}
              style={styles.cardWrapper}
            >
              <PixelCard backgroundColor={item.color} style={isMobile ? styles.questCardMobile : styles.questCard}>
                <Typography style={isMobile ? styles.iconMobile : styles.icon}>{item.icon}</Typography>
                <Typography weight="bold" style={isMobile ? styles.questTextMobile : styles.questText}>{item.text}</Typography>
              </PixelCard>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxWidth: 1280, // max-w-7xl
    alignSelf: 'center',
    width: '100%',
  },
  banner: {
    padding: 28,
  },
  bannerMobile: {
    padding: 16,
  },
  kicker: {
    fontSize: 10,
    lineHeight: 24,
  },
  title: {
    fontSize: 20,
    lineHeight: 34,
    marginTop: 20,
    maxWidth: 1024,
  },
  titleMobile: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 12,
  },
  copy: {
    fontSize: 18,
    lineHeight: 28,
    marginTop: 24,
    maxWidth: 896,
  },
  copyMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  questGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 32,
  },
  questGridMobile: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
  },
  cardWrapper: {
    flex: 1,
    minWidth: 150,
    width: '100%',
  },
  questCard: {
    padding: 20,
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  questCardMobile: {
    padding: 16,
    height: '100%',
  },
  icon: {
    fontSize: 36,
  },
  iconMobile: {
    fontSize: 28,
  },
  questText: {
    fontSize: 16,
    marginTop: 16,
  },
  questTextMobile: {
    fontSize: 14,
    marginTop: 12,
  }
});
