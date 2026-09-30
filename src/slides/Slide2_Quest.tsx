import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Linking } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Typography } from '../components/Typography';
import { PixelCard } from '../components/PixelCard';
import { PixelButton } from '../components/PixelButton';
import { Colors } from '../theme/colors';

const MATERI_LIST = [
  {
    id: 'materi-apa-itu-seni',
    title: 'Apa itu Seni?',
    url: 'https://id.wikipedia.org/wiki/Seni',
    icon: '🎨',
    desc: 'Pengantar memahami hakikat seni, makna keindahan, dan ekspresi visual.',
    color: Colors.gold,
  },
  {
    id: 'materi-lukisan',
    title: 'Lukisan',
    url: 'https://id.wikipedia.org/wiki/Seni_lukis',
    icon: '🖌️',
    desc: 'Pengertian, tujuan berkarya, dan teknik ekspresi visual dalam seni lukis.',
    color: Colors.orange,
  },
  {
    id: 'materi-ilustrasi',
    title: 'Ilustrasi',
    url: 'https://id.wikipedia.org/wiki/Ilustrasi',
    icon: '✏️',
    desc: 'Teknik bercerita dan menyampaikan narasi visual melalui seni gambar ilustrasi.',
    color: '#ff887c',
  },
  {
    id: 'materi-poster',
    title: 'Poster',
    url: 'https://id.wikipedia.org/wiki/Poster',
    icon: '📢',
    desc: 'Merancang pesan grafis yang kuat, tata letak komposisi, dan tipografi poster.',
    color: Colors.purple,
  },
  {
    id: 'materi-fotografi',
    title: 'Fotografi',
    url: 'https://id.wikipedia.org/wiki/Fotografi',
    icon: '📸',
    desc: 'Eksplorasi teknik pencahayaan, sudut pandang kamera, dan komposisi foto.',
    color: Colors.green,
  }
];

export function Slide2_Quest() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;



  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <PixelCard backgroundColor={Colors.cream} style={isMobile ? styles.bannerMobile : styles.banner}>
            <Typography variant="pixel" color={Colors.red} style={styles.kicker}>
              SLIDE 02 · MATERI PEMBELAJARAN
            </Typography>
            <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.titleMobile : styles.title}>
              PILIH MATERI BACAAN DI BAWAH INI
            </Typography>
            <Typography style={isMobile ? styles.copyMobile : styles.copy}>
              Klik materi yang ingin kamu pelajari lebih dalam melalui bahan bacaan lengkap dari Wikipedia.
            </Typography>
          </PixelCard>
        </Animated.View>

        <View style={styles.materiSection}>
          <View style={[styles.materiGrid, isMobile && styles.materiGridMobile]}>
            {MATERI_LIST.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).duration(500)} style={styles.cardWrapper}>
                <PixelCard backgroundColor={item.color} style={styles.videoCard}>
                  <View style={styles.videoHeaderRow}>
                    <Typography style={styles.videoIcon}>{item.icon}</Typography>
                    <View style={styles.videoTextContainer}>
                      <Typography weight="bold" style={styles.videoTitle}>{item.title}</Typography>
                      <Typography style={styles.videoDesc}>{item.desc}</Typography>
                    </View>
                  </View>
                  <PixelButton
                    backgroundColor={Colors.white}
                    style={styles.watchBtn}
                    onPress={() => {
                      Linking.openURL(item.url);
                    }}
                  >
                    <Typography style={[styles.watchBtnText, { color: Colors.ink }]}>
                      📖 BACA MATERI
                    </Typography>
                  </PixelButton>
                </PixelCard>
              </Animated.View>
            ))}
          </View>
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
  materiSection: {
    marginTop: 32,
  },
  materiGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  materiGridMobile: {
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
  },
  videoCard: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    minWidth: 240,
  },
  videoIcon: {
    fontSize: 28,
  },
  videoTextContainer: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    color: Colors.ink,
  },
  videoDesc: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
    lineHeight: 18,
  },
  watchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  watchBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  }
});
