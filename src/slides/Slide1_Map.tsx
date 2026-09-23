import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Typography } from '../components/Typography';
import { PixelCard } from '../components/PixelCard';
import { Colors } from '../theme/colors';

export function Slide1_Map() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const stages = [
    { num: 1, title: 'Gagasan', text: 'Temukan isu, cerita, suasana, atau pesan yang ingin kamu sampaikan.', color: Colors.gold },
    { num: 2, title: 'Rencana', text: 'Tentukan media, komposisi, warna, dan langkah kerja.', color: Colors.orange },
    { num: 3, title: 'Berkarya', text: 'Wujudkan sketsa menjadi karya sambil mencatat temuanmu.', color: '#ff887c' },
    { num: 4, title: 'Revisi', text: 'Terima masukan dan perkuat bagian karya yang masih bisa dikembangkan.', color: Colors.purple },
    { num: 5, title: 'Galeri', text: 'Presentasikan karya dan rayakan cerita visualmu.', color: Colors.green },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <PixelCard backgroundColor={Colors.cream} style={isMobile ? styles.bannerMobile : styles.banner}>
            <Typography variant="pixel" color={Colors.red} style={styles.kicker}>
              SLIDE 01 · MULAI PETUALANGAN
            </Typography>
            <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.titleMobile : styles.title}>
              PETA PERJALANAN KREATIF
            </Typography>
            <Typography style={isMobile ? styles.copyMobile : styles.copy}>
              Karya seni yang bermakna lahir dari perjalanan: menemukan gagasan, menyusun rencana, berkarya, menerima masukan, lalu membagikan cerita visual.
            </Typography>
          </PixelCard>
        </Animated.View>

        <View style={styles.stageSection}>
          <Typography variant="pixel" style={styles.sectionTitle}>
            LIMA TAHAP PERJALANAN
          </Typography>
          
          <View style={[styles.stagesGrid, isMobile && styles.stagesGridMobile]}>
            {stages.map((stage, index) => (
              <Animated.View 
                key={stage.num} 
                entering={FadeInRight.delay(index * 100).duration(500)}
                style={styles.cardWrapper}
              >
                <PixelCard backgroundColor={stage.color} style={isMobile ? styles.stageCardMobile : styles.stageCard}>
                  <Typography variant="pixel" style={styles.stageNum}>{stage.num}</Typography>
                  <Typography weight="bold" style={isMobile ? styles.stageTitleMobile : styles.stageTitle}>{stage.title}</Typography>
                  <Typography style={isMobile ? styles.stageTextMobile : styles.stageText}>{stage.text}</Typography>
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
    fontSize: 24,
    lineHeight: 36,
    marginTop: 20,
    maxWidth: 896,
  },
  titleMobile: {
    fontSize: 18,
    lineHeight: 28,
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
  stageSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 28,
    marginBottom: 20,
  },
  stagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  stagesGridMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
    minWidth: 150,
    width: '100%',
  },
  stageCard: {
    padding: 20,
    height: '100%',
  },
  stageCardMobile: {
    padding: 16,
    height: '100%',
  },
  stageNum: {
    fontSize: 12,
  },
  stageTitle: {
    fontSize: 20,
    marginTop: 16,
  },
  stageTitleMobile: {
    fontSize: 16,
    marginTop: 12,
  },
  stageText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  stageTextMobile: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  }
});
