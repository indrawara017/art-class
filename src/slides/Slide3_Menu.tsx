import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PixelButton } from '../components/PixelButton';
import { PixelCard } from '../components/PixelCard';
import { TypewriterText } from '../components/TypewriterText';
import { Typography } from '../components/Typography';
import { Colors } from '../theme/colors';
import { audioManager } from '../utils/AudioManager';
import { getCurrentUser } from '../utils/supabase';
import { Slide4_Quiz } from './Slide4_Quiz';

const VIDEO_LIST = [
  {
    id: 'apa-itu-seni',
    title: 'Apa itu Seni?',
    url: 'https://youtu.be/VV13G4g3ZhM?si=mjKV_hgu5wYg_L6L',
    icon: '🎨',
    desc: 'Pengantar memahami hakikat seni, makna keindahan, dan ekspresi visual.'
  },
  {
    id: 'lukisan',
    title: 'Lukisan',
    url: 'https://youtu.be/1fTr9f7a9lE?si=ydzxORel5kohpKkq',
    icon: '🖌️',
    desc: 'Pengertian, tujuan berkarya, dan teknik ekspresi visual dalam seni lukis.'
  },
  {
    id: 'ilustrasi',
    title: 'Ilustrasi',
    url: 'https://youtu.be/g-9IITcX9FM?si=cL9jEpvfhpWkK-Vv',
    icon: '✏️',
    desc: 'Teknik bercerita dan menyampaikan narasi visual melalui seni gambar ilustrasi.'
  },
  {
    id: 'poster',
    title: 'Poster',
    url: 'https://youtu.be/8zZNw24DfPo?si=_FMt_bd4jxx8gMf5',
    icon: '📢',
    desc: 'Merancang pesan grafis yang kuat, tata letak komposisi, dan tipografi poster.'
  },
  {
    id: 'fotografi',
    title: 'Fotografi',
    url: 'https://youtu.be/3NZQrvOTL5k?si=PUpAkQgFR-lGaRxw',
    icon: '📸',
    desc: 'Eksplorasi teknik pencahayaan, sudut pandang kamera, dan komposisi foto.'
  }
];

const KAHOOT_LIST = [
  {
    id: 'kahoot-lukisan',
    title: 'Kahoot: Lukisan',
    url: 'https://kahoot.it/challenge/08882705?challenge-id=cb8496ca-b1cf-4cad-b19e-0ba7dd82b05f_1790772591864',
    icon: '🖌️',
    desc: 'Uji pemahamanmu tentang seni lukis, teknik, dan mediumnya.'
  },
  {
    id: 'kahoot-ilustrasi',
    title: 'Kahoot: Ilustrasi',
    url: 'https://kahoot.it/challenge/08139621?challenge-id=cb8496ca-b1cf-4cad-b19e-0ba7dd82b05f_1790771574315',
    icon: '✏️',
    desc: 'Kuis seputar seni gambar ilustrasi dan teknik bercerita visual.'
  },
  {
    id: 'kahoot-poster',
    title: 'Kahoot: Poster',
    url: 'https://kahoot.it/challenge/05056744?challenge-id=cb8496ca-b1cf-4cad-b19e-0ba7dd82b05f_1790770681069',
    icon: '📢',
    desc: 'Tantangan tentang desain grafis, tipografi, dan komposisi poster.'
  },
  {
    id: 'kahoot-fotografi',
    title: 'Kahoot: Fotografi',
    url: 'https://kahoot.it/challenge/01499792?challenge-id=cb8496ca-b1cf-4cad-b19e-0ba7dd82b05f_1790771235795',
    icon: '📸',
    desc: 'Buktikan kemampuanmu tentang teknik pencahayaan dan komposisi foto.'
  }
];


interface Slide3Props {
  isQuizActive?: boolean;
  onQuizActiveChange?: (isActive: boolean) => void;
  onQuizScoreChange?: (score: number) => void;
}

export function Slide3_Menu({ isQuizActive = false, onQuizActiveChange, onQuizScoreChange }: Slide3Props = {}) {
  const [activeDetail, setActiveDetail] = useState<string | null>(null);


  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const menuItems = [
    {
      id: 'video', icon: '🎬', title: 'Video', color: '#ff887c',
      copy: 'Tonton 5 video seni: Seni, Lukisan, Ilustrasi, Poster, & Fotografi.',
      detail: 'Tonton video pembelajaran seni rupa: Apa Itu Seni, Lukisan, Ilustrasi, Poster, dan Fotografi untuk memperkaya wawasan serta teknik berkaryamu.'
    },
    {
      id: 'kahoot', icon: '📱', title: 'Kahoot Quiz', color: Colors.purple,
      copy: 'Mainkan kuis Kahoot seru bersama teman sekelasmu!',
      detail: 'Uji pengetahuanmu dengan cara yang menyenangkan melalui Kahoot! Bersainglah untuk mendapatkan posisi teratas secara langsung.'
    },
    {
      id: 'quiz', icon: '🧩', title: 'Art Quiz', color: Colors.green,
      copy: 'Uji pengetahuan senimu dan raih skor sempurna!',
      detail: 'Siap menghadapi tantangan terakhir? Buktikan pemahamanmu tentang teori warna, unsur dasar, dan teknik seni rupa melalui kuis interaktif ini. Hanya seniman sejati yang mampu meraih nilai 100!'
    },
    {
      id: 'gallery', icon: '🖼️', title: 'Galery', color: Colors.orange,
      copy: 'Pamerkan karyamu & lihat karya teman sekelas!',
      detail: 'Masuk ke Ruang Karya Komunal! Unggah hasil sketsa, lukisan, atau karyamu beserta catatan proses kreatif, dan nikmati karya inspiratif dari teman-teman sekelasmu.'
    },
    {
      id: 'leaderboard', icon: '🏆', title: 'Leaderboard Art Quizz', color: Colors.gold,
      copy: 'Lihat peringkat tertinggi dari skor Art Quiz!',
      detail: 'Pantau posisi klasemen sementara! Pemain dengan skor tertinggi dan waktu tercepat akan menduduki puncak Leaderboard Art Quiz.'
    },
  ];

  if (isQuizActive) {
    return <Slide4_Quiz onFinish={(score) => onQuizActiveChange?.(false)} onScoreChange={onQuizScoreChange} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <PixelCard backgroundColor={Colors.cream} style={isMobile ? styles.bannerMobile : styles.banner}>
            <Typography variant="pixel" color={Colors.red} style={styles.kicker}>
              SLIDE 03 · PILIH MISI
            </Typography>
            <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.titleMobile : styles.title}>
              RUANG BELAJAR KREATIF
            </Typography>
            <Typography style={isMobile ? styles.copyMobile : styles.copy}>
              Klik satu kotak untuk membuka bagian pembelajaran. Setiap bagian dapat dicetak sebagai lembar belajar.
            </Typography>
          </PixelCard>
        </Animated.View>

        <View style={[styles.menuGrid, isMobile && styles.menuGridMobile]}>
          {menuItems.map((item, index) => {
            const isInactive = activeDetail && activeDetail !== item.id;
            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 100).duration(500)}
                style={[styles.cardWrapper, { opacity: isInactive ? 0.4 : 1 }]}
              >
                <PixelButton
                  backgroundColor={item.color}
                  style={isMobile ? styles.menuCardMobile : styles.menuCard}
                  onPress={() => setActiveDetail(activeDetail === item.id ? null : item.id)}
                >
                  <View style={styles.menuCardInner}>
                    <Typography style={isMobile ? styles.iconMobile : styles.icon}>{item.icon}</Typography>
                    <Typography weight="bold" style={isMobile ? styles.menuTitleMobile : styles.menuTitle}>{item.title}</Typography>
                    <Typography style={isMobile ? styles.menuCopyMobile : styles.menuCopy}>{item.copy}</Typography>
                    <Typography weight="bold" style={isMobile ? styles.menuPrintMobile : styles.menuPrint}>🖨 Buka & cetak</Typography>
                  </View>
                </PixelButton>
              </Animated.View>
            );
          })}
        </View>

        {/* Popup Detail View */}
        <Modal
          visible={!!activeDetail}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
              <PixelCard backgroundColor={Colors.white} style={isMobile ? styles.bannerMobile : undefined}>
                <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.detailTitleMobile : styles.detailTitle}>
                  {activeDetail === 'video' ? 'VIDEO PEMBELAJARAN SENI' : activeDetail === 'kahoot' ? 'KAHOOT QUIZ SENI' : menuItems.find(i => i.id === activeDetail)?.title.toUpperCase()}
                </Typography>

                {activeDetail === 'video' || activeDetail === 'kahoot' ? (
                  <View style={styles.videoSection}>
                    <Typography style={isMobile ? styles.detailCopyMobile : styles.detailCopy}>
                      {activeDetail === 'video'
                        ? 'Pilih video pembelajaran di bawah ini untuk ditonton langsung di YouTube:'
                        : 'Pilih kuis Kahoot di bawah ini untuk memainkannya secara langsung:'}
                    </Typography>

                    <ScrollView style={styles.videoScrollList} showsVerticalScrollIndicator={false}>
                      {(activeDetail === 'video' ? VIDEO_LIST : KAHOOT_LIST).map((item) => (
                        <View key={item.id} style={styles.videoCardWrapper}>
                          <PixelCard backgroundColor={Colors.cream} style={styles.videoCard}>
                            <View style={styles.videoHeaderRow}>
                              <Typography style={styles.videoIcon}>{item.icon}</Typography>
                              <View style={styles.videoTextContainer}>
                                <Typography weight="bold" style={styles.videoTitle}>{item.title}</Typography>
                                <Typography style={styles.videoDesc}>{item.desc}</Typography>
                              </View>
                            </View>
                            <PixelButton
                              backgroundColor={activeDetail === 'video' ? Colors.red : Colors.purple}
                              style={styles.watchBtn}
                              onPress={() => {
                                Linking.openURL(item.url);
                              }}
                            >
                              <Typography style={styles.watchBtnText}>
                                {activeDetail === 'video' ? '▶ TONTON DI YOUTUBE' : '📱 BUKA KAHOOT'}
                              </Typography>
                            </PixelButton>
                          </PixelCard>
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.detailActionRow}>
                      <PixelButton
                        backgroundColor={Colors.red}
                        style={styles.closeBtn}
                        onPress={() => setActiveDetail(null)}
                      >
                        <Typography style={styles.closeBtnText}>TUTUP</Typography>
                      </PixelButton>
                    </View>
                  </View>
                ) : (
                  <>
                    <TypewriterText
                      text={menuItems.find(i => i.id === activeDetail)?.detail || ''}
                      style={isMobile ? styles.detailCopyMobile : styles.detailCopy}
                    />
                    <View style={styles.detailActionRow}>
                      {activeDetail === 'gallery' ? (
                        <PixelButton
                          backgroundColor={Colors.green}
                          style={styles.actionBtn}
                          onPress={() => {
                            setActiveDetail(null);
                            router.push('/gallery');
                          }}
                        >
                          <Typography style={styles.actionBtnText}>🎨 BUKA RUANG KARYA</Typography>
                        </PixelButton>
                      ) : activeDetail === 'leaderboard' ? (
                        <PixelButton
                          backgroundColor={Colors.gold}
                          style={styles.actionBtn}
                          onPress={() => {
                            setActiveDetail(null);
                            router.push('/leaderboard');
                          }}
                        >
                          <Typography style={[styles.actionBtnText, { color: Colors.ink }]}>🏆 SKOR KELAS</Typography>
                        </PixelButton>
                      ) : activeDetail === 'quiz' ? (
                        <PixelButton
                          backgroundColor={Colors.blue}
                          style={styles.actionBtn}
                          onPress={async () => {
                            const user = await getCurrentUser();
                            if (!user) {
                              Alert.alert('Perhatian', 'Kamu harus masuk (login) terlebih dahulu sebelum bisa mengikuti kuis.');
                              router.push('/?slide=2');
                              return;
                            }
                            if (!user.avatar_url) {
                              Alert.alert('Perhatian', 'Kamu wajib mengatur foto profil terlebih dahulu sebelum bisa mengikuti kuis.');
                              router.push('/?slide=2');
                              return;
                            }
                            setActiveDetail(null);
                            audioManager.playQuizStart();
                            setTimeout(() => { onQuizActiveChange?.(true); }, 300);
                          }}
                        >
                          <Typography style={styles.actionBtnText}>▶ MULAI KUIS</Typography>
                        </PixelButton>
                      ) : (
                        <PixelButton
                          backgroundColor={Colors.blue}
                          style={styles.actionBtn}
                          onPress={() => {
                            setActiveDetail(null);
                            setTimeout(() => {
                              Alert.alert('Misi Dimulai!', `Kamu telah memilih misi: ${menuItems.find(i => i.id === activeDetail)?.title}`);
                            }, 300);
                          }}
                        >
                          <Typography style={styles.actionBtnText}>▶ MULAI MISI</Typography>
                        </PixelButton>
                      )}

                      <PixelButton
                        backgroundColor={Colors.red}
                        style={styles.closeBtn}
                        onPress={() => setActiveDetail(null)}
                      >
                        <Typography style={styles.closeBtnText}>TUTUP</Typography>
                      </PixelButton>
                    </View>
                  </>
                )}
              </PixelCard>
            </Animated.View>
          </View>
        </Modal>
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
    fontSize: 22,
    lineHeight: 36,
    marginTop: 20,
    maxWidth: 1024,
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginTop: 32,
  },
  menuGridMobile: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
  },
  cardWrapper: {
    flex: 1,
    minWidth: 160,
    width: '100%',
  },
  menuCard: {
    padding: 24,
    height: '100%',
    minHeight: 210,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  menuCardMobile: {
    padding: 16,
    height: '100%',
    minHeight: 180,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  menuCardInner: {
    flex: 1,
    width: '100%',
  },
  icon: {
    fontSize: 48,
  },
  iconMobile: {
    fontSize: 36,
  },
  menuTitle: {
    fontSize: 20,
    marginTop: 20,
  },
  menuTitleMobile: {
    fontSize: 16,
    marginTop: 12,
  },
  menuCopy: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  menuCopyMobile: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  menuPrint: {
    fontSize: 14,
    marginTop: 20,
  },
  menuPrintMobile: {
    fontSize: 12,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
  },
  detailTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  detailTitleMobile: {
    fontSize: 18,
    marginBottom: 12,
  },
  detailCopy: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailCopyMobile: {
    fontSize: 14,
    lineHeight: 22,
  },
  detailActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  videoSection: {
    marginTop: 8,
  },
  videoScrollList: {
    maxHeight: 380,
    marginVertical: 12,
  },
  videoCardWrapper: {
    marginBottom: 12,
  },
  videoCard: {
    padding: 14,
  },
  videoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
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
    alignSelf: 'flex-start',
  },
  watchBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
