import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  Modal,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing
} from 'react-native-reanimated';
import { Typography } from '../components/Typography';
import { PixelCard } from '../components/PixelCard';
import { PixelButton } from '../components/PixelButton';
import { audioManager } from '../utils/AudioManager';
import { Colors } from '../theme/colors';
import {
  getCurrentUser,
  signInWithUsername,
  signUpWithUsername,
  signOut,
  Profile,
} from '../utils/supabase';

interface Slide0TitleProps {
  onStart: () => void;
}

const AnimatedCloud = ({ top, delay, duration, scale }: { top: number, delay: number, duration: number, scale: number }) => {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = -200; // Reset starting position
    translateX.value = withDelay(
      delay, 
      withRepeat(
        withTiming(width + 200, { duration, easing: Easing.linear }),
        -1, // infinite
        false // do not reverse, reset to start
      )
    );
  }, [width, delay, duration, translateX]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top,
    left: 0,
    transform: [{ translateX: translateX.value }, { scale }],
    opacity: 0.8,
  }));

  return (
    <Animated.View style={style}>
      <Typography style={{ fontSize: 80 }}>☁️</Typography>
    </Animated.View>
  );
};

export function Slide0_Title({ onStart }: Slide0TitleProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const floatValue = useSharedValue(0);

  // User & Auth States
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Modal Auth States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const loadUser = useCallback(async () => {
    setIsLoadingUser(true);
    const user = await getCurrentUser();
    setCurrentUser(user);
    setIsLoadingUser(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    floatValue.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, [floatValue]);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatValue.value }],
    };
  });

  const handleAuthSubmit = async () => {
    setAuthError(null);
    if (!usernameInput.trim()) {
      setAuthError('Masukkan username!');
      return;
    }
    if (!passwordInput.trim()) {
      setAuthError('Masukkan password!');
      return;
    }

    setAuthLoading(true);
    if (authMode === 'login') {
      const res = await signInWithUsername(usernameInput, passwordInput);
      if (res.error) {
        setAuthError(res.error);
      } else if (res.profile) {
        setCurrentUser(res.profile);
        setShowAuthModal(false);
        setUsernameInput('');
        setPasswordInput('');
      }
    } else {
      const res = await signUpWithUsername(usernameInput, passwordInput);
      if (res.error) {
        setAuthError(res.error);
      } else if (res.profile) {
        setCurrentUser(res.profile);
        setShowAuthModal(false);
        setUsernameInput('');
        setPasswordInput('');
        Alert.alert('Selamat Datang!', `Akun @${res.profile.username} berhasil dibuat!`);
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert('Keluar Akun', 'Apakah kamu yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          setCurrentUser(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Background Clouds */}
      <AnimatedCloud top={20} delay={0} duration={18000} scale={0.9} />
      <AnimatedCloud top={50} delay={8000} duration={15000} scale={1} />
      <AnimatedCloud top={80} delay={3000} duration={22000} scale={0.6} />
      
      <AnimatedCloud top={120} delay={5000} duration={20000} scale={0.7} />
      <AnimatedCloud top={150} delay={12000} duration={16000} scale={0.8} />
      <AnimatedCloud top={180} delay={1000} duration={25000} scale={0.5} />
      
      <AnimatedCloud top={220} delay={9000} duration={19000} scale={0.9} />
      <AnimatedCloud top={260} delay={2000} duration={28000} scale={0.6} />
      <AnimatedCloud top={300} delay={15000} duration={21000} scale={0.8} />
      <AnimatedCloud top={350} delay={6000} duration={30000} scale={0.5} />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        <Animated.View style={[styles.floatingWrapper, floatingStyle]}>
          {/* School Pill */}
          <View style={[styles.pillContainer, isMobile && styles.pillMobile]}>
            <Typography>🎨</Typography>
            <Typography weight="bold" style={isMobile ? styles.schoolTextMobile : styles.schoolText}>
              SMA NEGERI 1 SUMBERASIH
            </Typography>
          </View>

          {/* Main Card */}
          <PixelCard backgroundColor={Colors.cream} style={[styles.mainCard, isMobile && styles.cardMobile]}>
            <Typography variant="pixel" color={Colors.red} style={styles.kicker}>
              SENI BUDAYA · SENI RUPA · KELAS XII
            </Typography>
            
            <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.titleMobile : styles.title}>
              ART CLASS
            </Typography>
            
            <Typography weight="semibold" style={isMobile ? styles.taglineMobile : styles.tagline}>
              Dari Gagasan Menjadi Karya
            </Typography>

            {/* User Account Status Box */}
            {isLoadingUser ? (
              <ActivityIndicator size="small" color={Colors.ink} style={{ marginTop: 20 }} />
            ) : currentUser ? (
              <View style={styles.userBox}>
                <Typography variant="pixel" color={Colors.blue} style={styles.userGreeting}>
                  Halo @{currentUser.username}
                </Typography>
                <Typography style={styles.userSubtext}>
                  Siap berkarya & mencatatkan nilai kuis di papan skor kelas!
                </Typography>
                
                <PixelButton
                  backgroundColor={Colors.gold}
                  style={[styles.startBtn, isMobile && styles.startBtnMobile]}
                  onPress={() => {
                    audioManager.startMainSong();
                    onStart();
                  }}
                >
                  <Typography style={styles.startBtnText}>▶ MULAI BELAJAR</Typography>
                </PixelButton>

                <TouchableOpacity onPress={handleSignOut} style={styles.signOutLink} activeOpacity={0.7}>
                  <Typography style={styles.signOutText}>🚪 Keluar / Ganti Akun</Typography>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.guestActionContainer}>
                <Typography style={styles.guestNoticeText}>
                  Silakan masuk atau buat akun untuk memulai kelas seni:
                </Typography>

                <PixelButton
                  backgroundColor={Colors.blue}
                  style={[styles.authActionBtn, isMobile && styles.startBtnMobile]}
                  onPress={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  <Typography variant="pixel" style={styles.authBtnText}>
                    🔑 MASUK / DAFTAR AKUN
                  </Typography>
                </PixelButton>
              </View>
            )}

            <Typography weight="semibold" style={isMobile ? styles.helperTextMobile : styles.helperText}>
              Jelajahi ide, rencana, proses, hingga pameran karya.
            </Typography>
          </PixelCard>
        </Animated.View>
      </Animated.View>

      {/* Grass floor */}
      <View style={styles.grass} />

      {/* AUTH MODAL (LOGIN / DAFTAR AKUN) */}
      <Modal visible={showAuthModal} transparent animationType="fade" onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <PixelCard backgroundColor={Colors.cream} style={styles.authCard}>
              <Typography variant="pixel" color={Colors.blue} style={styles.modalHeaderTitle}>
                {authMode === 'login' ? 'MASUK KE KELAS 🎨' : 'DAFTAR AKUN BARU ✏️'}
              </Typography>
              <Typography style={styles.modalHeaderSub}>
                {authMode === 'login'
                  ? 'Gunakan username dan password untuk membuka karya & riwayat kuismu.'
                  : 'Daftar mudah dengan nama pengguna tanpa repot verifikasi email!'}
              </Typography>

              {/* Mode Switcher */}
              <View style={styles.authModeSwitcher}>
                <TouchableOpacity
                  style={[styles.authModeBtn, authMode === 'login' && styles.authModeBtnActive]}
                  onPress={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                >
                  <Typography weight="bold">Masuk</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authModeBtn, authMode === 'register' && styles.authModeBtnActive]}
                  onPress={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                >
                  <Typography weight="bold">Daftar Akun</Typography>
                </TouchableOpacity>
              </View>

              {authError && (
                <View style={styles.errorBox}>
                  <Typography style={styles.errorText}>⚠️ {authError}</Typography>
                </View>
              )}

              {/* Inputs */}
              <Typography weight="bold" style={styles.inputLabel}>Username:</Typography>
              <TextInput
                style={styles.pixelInput}
                placeholder="zara_azalia"
                placeholderTextColor="#999"
                value={usernameInput}
                onChangeText={setUsernameInput}
                autoCapitalize="none"
              />

              <Typography weight="bold" style={styles.inputLabel}>Password:</Typography>
              <TextInput
                style={styles.pixelInput}
                placeholder="minimal 6 karakter"
                placeholderTextColor="#999"
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry
              />

              <View style={styles.modalActionRow}>
                <PixelButton
                  backgroundColor={Colors.blue}
                  style={styles.modalSubmitBtn}
                  onPress={handleAuthSubmit}
                >
                  {authLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Typography variant="pixel" style={styles.modalBtnText}>
                      {authMode === 'login' ? 'MASUK' : 'BUAT AKUN'}
                    </Typography>
                  )}
                </PixelButton>

                <PixelButton
                  backgroundColor={Colors.red}
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAuthModal(false)}
                >
                  <Typography variant="pixel" style={styles.modalBtnText}>BATAL</Typography>
                </PixelButton>
              </View>
            </PixelCard>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 896,
    alignItems: 'center',
    zIndex: 10,
  },
  floatingWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.ink,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pillMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  schoolText: {
    fontSize: 16,
  },
  schoolTextMobile: {
    fontSize: 12,
  },
  mainCard: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: '100%',
    alignItems: 'center',
  },
  cardMobile: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  kicker: {
    fontSize: 10,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 46,
    textAlign: 'center',
    marginTop: 16,
  },
  titleMobile: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 12,
  },
  tagline: {
    fontSize: 20,
    marginTop: 16,
    textAlign: 'center',
  },
  taglineMobile: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  userBox: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 480,
  },
  userGreeting: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  userSubtext: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
  },
  signOutLink: {
    marginTop: 12,
    padding: 6,
  },
  signOutText: {
    fontSize: 12,
    color: Colors.red,
    fontWeight: 'bold',
  },
  guestActionContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  guestNoticeText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 14,
  },
  authActionBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  authBtnText: {
    fontSize: 11,
    color: Colors.white,
  },
  startBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  startBtnMobile: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  startBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: Colors.ink,
  },
  helperText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 20,
    textAlign: 'center',
  },
  helperTextMobile: {
    fontSize: 12,
    color: '#475569',
    marginTop: 14,
    textAlign: 'center',
  },
  grass: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: '#35ad5a',
    borderTopWidth: 4,
    borderTopColor: Colors.ink,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 35, 61, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
  },
  authCard: {
    padding: 20,
  },
  modalHeaderTitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  modalHeaderSub: {
    fontSize: 13,
    color: Colors.ink,
    marginBottom: 16,
  },
  authModeSwitcher: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  authModeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  authModeBtnActive: {
    backgroundColor: Colors.orange,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.ink,
    marginBottom: 6,
  },
  pixelInput: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
    marginBottom: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalBtnText: {
    fontSize: 10,
    color: Colors.white,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#ffcdd2',
    borderWidth: 2,
    borderColor: Colors.red,
    padding: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
  },
});
