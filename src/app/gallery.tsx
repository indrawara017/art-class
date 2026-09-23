import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Typography } from '../components/Typography';
import { PixelCard } from '../components/PixelCard';
import { PixelButton } from '../components/PixelButton';
import { Colors } from '../theme/colors';
import {
  getCurrentUser,
  signInWithUsername,
  signUpWithUsername,
  signOut,
  getArtworks,
  createArtwork,
  deleteArtwork,
  getLeaderboard,
  Artwork,
  QuizResult,
  Profile,
  isSupabaseConfigured,
  uploadArtworkImage,
  toggleLikeArtwork,
  uploadAvatarImage,
  updateUserAvatar,
} from '../utils/supabase';

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  // Tabs: 'artworks' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'artworks' | 'leaderboard'>(tab === 'leaderboard' ? 'leaderboard' : 'artworks');

  // User State
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Data States
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadImageUri, setUploadImageUri] = useState<string | null>(null);
  const [uploadImageName, setUploadImageName] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const loadUser = React.useCallback(async () => {
    setIsLoadingUser(true);
    const user = await getCurrentUser();
    setCurrentUser(user);
    setIsLoadingUser(false);
  }, []);

  const loadArtworksData = React.useCallback(async () => {
    setIsRefreshing(true);
    const list = await getArtworks();
    setArtworks(list);
    setIsRefreshing(false);
  }, []);

  const loadLeaderboardData = React.useCallback(async () => {
    const list = await getLeaderboard();
    setLeaderboard(list);
  }, []);

  // Initial load
  useEffect(() => {
    loadUser();
    loadArtworksData();
    loadLeaderboardData();
  }, [loadUser, loadArtworksData, loadLeaderboardData]);

  // Auth Handlers
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

  const handlePickAvatar = async () => {
    if (!currentUser) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarLoading(true);
      const uri = result.assets[0].uri;
      const res = await uploadAvatarImage(uri, 'avatar.jpg');
      if (res.error || !res.publicUrl) {
        Alert.alert('Gagal Upload', res.error || 'Gagal mengunggah avatar');
      } else {
        const updateRes = await updateUserAvatar(currentUser.id, res.publicUrl);
        if (updateRes.success) {
          setCurrentUser({ ...currentUser, avatar_url: res.publicUrl });
          Alert.alert('Sukses', 'Foto profil berhasil diperbarui!');
          loadArtworksData(); // Refresh to update cards
        } else {
          Alert.alert('Gagal', updateRes.error || 'Gagal memperbarui profil');
        }
      }
      setAvatarLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Keluar Akun', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          setCurrentUser(null);
          setShowProfileModal(false);
        },
      },
    ]);
  };

  // Upload Handler
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadImageUri(result.assets[0].uri);
      const uriParts = result.assets[0].uri.split('/');
      setUploadImageName(uriParts[uriParts.length - 1] || 'image.jpg');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadTitle.trim()) {
      Alert.alert('Perhatian', 'Judul karya wajib diisi!');
      return;
    }
    if (!uploadImageUri) {
      Alert.alert('Perhatian', 'Silakan pilih gambar karya terlebih dahulu!');
      return;
    }

    setUploadLoading(true);
    let finalUrl = '';
    
    // 1. Upload Image to Supabase
    const uploadRes = await uploadArtworkImage(uploadImageUri, uploadImageName);
    if (uploadRes.error || !uploadRes.publicUrl) {
      setUploadLoading(false);
      Alert.alert('Gagal Upload', uploadRes.error || 'Gagal mengunggah gambar');
      return;
    }
    finalUrl = uploadRes.publicUrl;

    // 2. Create Artwork Entry
    const res = await createArtwork({
      title: uploadTitle,
      stage: 'Karya', // Hardcoded fallback for DB schema
      notes: uploadNotes,
      artwork_url: finalUrl,
    });
    setUploadLoading(false);

    if (res.error) {
      Alert.alert('Gagal Unggah', res.error);
    } else {
      Alert.alert('Sukses!', 'Karya kamu berhasil diunggah ke Galeri Kelas 🎉');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadNotes('');
      setUploadImageUri(null);
      setUploadImageName('');
      loadArtworksData();
    }
  };

  const handleDeleteArtwork = (art: Artwork) => {
    Alert.alert('Hapus Karya', `Hapus karya "${art.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const res = await deleteArtwork(art.id);
          if (res.success) {
            loadArtworksData();
          } else {
            Alert.alert('Gagal', res.error || 'Gagal menghapus karya');
          }
        },
      },
    ]);
  };

  const handleLikeArtwork = async (art: Artwork) => {
    if (!currentUser) {
      Alert.alert('Perhatian', 'Kamu harus masuk (login) terlebih dahulu untuk menyukai karya!');
      return;
    }
    
    // Optimistic Update
    const currentLikedBy = art.liked_by || [];
    const isLiked = currentLikedBy.includes(currentUser.id);
    const newLikedBy = isLiked 
      ? currentLikedBy.filter(id => id !== currentUser.id)
      : [...currentLikedBy, currentUser.id];
      
    setArtworks(prev => prev.map(a => a.id === art.id ? { ...a, liked_by: newLikedBy } : a));

    const res = await toggleLikeArtwork(art.id, currentUser.id, currentLikedBy);
    if (!res.success) {
      Alert.alert('Gagal', res.error || 'Gagal menyukai karya.');
      loadArtworksData(); // Revert
    }
  };

  const openArtworkUrl = (url: string) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    Linking.openURL(cleanUrl).catch(() => {
      Alert.alert('Error', 'Tidak dapat membuka tautan link karya ini.');
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* TOP HEADER */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 10) }]}>
        <PixelButton backgroundColor={Colors.orange} style={styles.backBtn} onPress={() => router.replace('/')}>
          <Typography variant="pixel" style={styles.backBtnText}>◀ KELAS</Typography>
        </PixelButton>

        <Typography variant="pixel" color={Colors.ink} style={isMobile ? styles.headerTitleMobile : styles.headerTitle}>
          RUANG KARYA 🎨
        </Typography>

        {isLoadingUser ? (
          <ActivityIndicator size="small" color={Colors.ink} />
        ) : currentUser ? (
          <TouchableOpacity style={styles.userBadge} onPress={() => setShowProfileModal(true)} activeOpacity={0.8}>
            {currentUser.avatar_url ? (
              <Image source={{ uri: currentUser.avatar_url }} style={styles.headerAvatar} />
            ) : (
              <Typography style={{ fontSize: 16 }}>👤</Typography>
            )}
            <View style={{ marginLeft: 6 }}>
              <Typography variant="pixel" style={styles.userBadgeText}>@{currentUser.username}</Typography>
              <Typography style={styles.userBadgeSub}>Profil</Typography>
            </View>
          </TouchableOpacity>
        ) : (
          <PixelButton
            backgroundColor={Colors.blue}
            style={styles.loginHeaderBtn}
            onPress={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
          >
            <Typography variant="pixel" style={styles.loginHeaderText}>MASUK</Typography>
          </PixelButton>
        )}
      </View>

      {/* CLOUD / LOCAL STORAGE STATUS NOTIFICATION */}
      {!isSupabaseConfigured() && (
        <View style={styles.noticeBar}>
          <Typography style={styles.noticeText}>
            💡 Mode Penyimpanan Lokal aktif. Sambungkan Supabase URL & Key di <Typography weight="bold">src/utils/supabase.ts</Typography> untuk sinkronisasi cloud penuh!
          </Typography>
        </View>
      )}

      {/* TABS SWITCHER */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'artworks' && styles.tabButtonActive]}
          onPress={() => setActiveTab('artworks')}
          activeOpacity={0.8}
        >
          <Typography
            variant="pixel"
            color={activeTab === 'artworks' ? Colors.white : Colors.ink}
            style={styles.tabText}
          >
            🖼️ GALERI KARYA ({artworks.length})
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'leaderboard' && styles.tabButtonActive]}
          onPress={() => setActiveTab('leaderboard')}
          activeOpacity={0.8}
        >
          <Typography
            variant="pixel"
            color={activeTab === 'leaderboard' ? Colors.white : Colors.ink}
            style={styles.tabText}
          >
            🏆 SKOR KUIS ({leaderboard.length})
          </Typography>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT AREA */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'artworks' ? (
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Banner & Upload Trigger */}
            <PixelCard backgroundColor={Colors.cream} style={styles.actionCard}>
              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="pixel" color={Colors.blue} style={styles.bannerHeadline}>
                    PAMERAN KARYA SISWA
                  </Typography>
                  <Typography style={styles.bannerSub}>
                    Kumpulkan karyamu, tulis catatan refleksi, dan nikmati inspirasi dari karya teman sekelasmu!
                  </Typography>
                </View>
                <PixelButton
                  backgroundColor={Colors.green}
                  style={styles.uploadBtn}
                  onPress={() => {
                    if (!currentUser) {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    } else if (!currentUser.avatar_url) {
                      Alert.alert('Perhatian', 'Kamu wajib mengunggah foto profil terlebih dahulu sebelum bisa membagikan karya.');
                      setShowProfileModal(true);
                    } else {
                      setShowUploadModal(true);
                    }
                  }}
                >
                  <Typography variant="pixel" style={styles.uploadBtnText}>➕ UNGGAH</Typography>
                </PixelButton>
              </View>

            </PixelCard>

            {/* Artwork List */}
            {isRefreshing ? (
              <ActivityIndicator size="large" color={Colors.blue} style={{ marginTop: 30 }} />
            ) : artworks.length === 0 ? (
              <PixelCard backgroundColor={Colors.white} style={styles.emptyCard}>
                <Typography style={styles.emptyIcon}>🎨</Typography>
                <Typography variant="pixel" color={Colors.ink} style={styles.emptyTitle}>
                  BELUM ADA KARYA
                </Typography>
                <Typography style={styles.emptyText}>
                  Jadilah yang pertama mengunggah karya dan catatan proses kreatif!
                </Typography>
              </PixelCard>
            ) : (
              artworks.map((art, index) => {
                const isOwner = currentUser && (currentUser.id === art.user_id || currentUser.username === art.author_name);
                return (
                  <Animated.View key={art.id} entering={FadeInUp.delay(index * 60).duration(400)}>
                    <PixelCard backgroundColor={Colors.white} style={styles.artCard}>
                      <View style={styles.artCardHeader}>
                        <View style={styles.artMetaLeft}>
                          {art.author_avatar_url ? (
                            <Image source={{ uri: art.author_avatar_url }} style={styles.cardAvatar} />
                          ) : (
                            <Typography style={{ fontSize: 16, marginRight: 6 }}>👤</Typography>
                          )}
                          <Typography variant="pixel" color={Colors.blue} style={styles.authorName}>
                            @{art.author_name}
                          </Typography>
                        </View>
                        {isOwner && (
                          <TouchableOpacity onPress={() => handleDeleteArtwork(art)} style={styles.deleteBtn}>
                            <Typography style={styles.deleteBtnText}>🗑 Hapus</Typography>
                          </TouchableOpacity>
                        )}
                      </View>

                      <Typography variant="pixel" color={Colors.ink} style={styles.artTitle}>
                        {art.title}
                      </Typography>

                      {art.artwork_url ? (
                        <Image source={{ uri: art.artwork_url }} style={styles.artworkImage} />
                      ) : null}

                      {art.notes ? (
                        <Typography style={styles.artNotes}>
                          {art.notes}
                        </Typography>
                      ) : null}

                      <View style={styles.artCardFooter}>
                        <Typography style={styles.artDate}>
                          📅 {new Date(art.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>

                        <TouchableOpacity 
                          style={[styles.likeBtn, art.liked_by?.includes(currentUser?.id || '') && styles.likeBtnActive]}
                          onPress={() => handleLikeArtwork(art)}
                          activeOpacity={0.8}
                        >
                          <Typography style={[styles.likeBtnText, art.liked_by?.includes(currentUser?.id || '') && styles.likeBtnTextActive]}>
                            {art.liked_by?.includes(currentUser?.id || '') ? '❤️' : '🤍'} Suka ({art.liked_by?.length || 0})
                          </Typography>
                        </TouchableOpacity>
                      </View>

                    </PixelCard>
                  </Animated.View>
                );
              })
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Leaderboard Header Banner */}
            <PixelCard backgroundColor={Colors.gold} style={styles.actionCard}>
              <Typography variant="pixel" color={Colors.ink} style={styles.leaderboardTitle}>
                🏆 PAPAN PERINGKAT KUIS SENI
              </Typography>
              <Typography style={styles.leaderboardSub}>
                Daftar skor siswa dari pengerjaan Kuis 20 Soal Seni Rupa. Capai nilai ≥ 75 untuk status Juara / Lulus!
              </Typography>
            </PixelCard>

            {/* Leaderboard Entries */}
            {leaderboard.length === 0 ? (
              <PixelCard backgroundColor={Colors.white} style={styles.emptyCard}>
                <Typography style={styles.emptyIcon}>🧩</Typography>
                <Typography variant="pixel" color={Colors.ink} style={styles.emptyTitle}>
                  BELUM ADA DATA KUIS
                </Typography>
                <Typography style={styles.emptyText}>
                  Mainkan kuis di Slide 4 untuk mencatatkan namamu di papan peringkat kelas!
                </Typography>
              </PixelCard>
            ) : (
              leaderboard.map((item, index) => {
                const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                const isPassed = item.passed || item.score >= 75;

                return (
                  <Animated.View key={item.id} entering={FadeInUp.delay(index * 50).duration(400)}>
                    <PixelCard
                      backgroundColor={index === 0 ? Colors.cream : Colors.white}
                      style={styles.leaderCard}
                    >
                      <View style={styles.leaderRow}>
                        <View style={styles.rankCol}>
                          <Typography variant="pixel" color={Colors.ink} style={styles.rankText}>
                            {rankBadge}
                          </Typography>
                        </View>

                        <View style={styles.userCol}>
                          {item.author_avatar_url ? (
                            <Image source={{ uri: item.author_avatar_url }} style={styles.cardAvatar} />
                          ) : (
                            <Typography style={{ fontSize: 16, marginRight: 6 }}>👤</Typography>
                          )}
                          <View>
                            <Typography weight="bold" style={styles.leaderAuthor}>
                              @{item.author_name}
                            </Typography>
                            <Typography style={styles.leaderDate}>
                              {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </Typography>
                          </View>
                        </View>

                        <View style={styles.scoreCol}>
                          <View style={[styles.scoreBadge, { backgroundColor: isPassed ? Colors.green : Colors.orange }]}>
                            <Typography variant="pixel" style={styles.scoreText}>
                              {item.score} POIN
                            </Typography>
                          </View>
                          <Typography style={styles.statusSub}>
                            {isPassed ? '🏆 LULUS' : '💪 COBA LAGI'}
                          </Typography>
                        </View>
                      </View>
                    </PixelCard>
                  </Animated.View>
                );
              })
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* PROFILE MODAL */}
      <Modal visible={showProfileModal} transparent animationType="fade" onRequestClose={() => setShowProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <PixelCard backgroundColor={Colors.cream} style={styles.authCard}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={styles.profileAvatarContainer}>
                  {currentUser?.avatar_url ? (
                    <Image source={{ uri: currentUser.avatar_url }} style={styles.profileAvatarLarge} />
                  ) : (
                    <Typography style={{ fontSize: 40 }}>👤</Typography>
                  )}
                </View>
                <Typography variant="pixel" color={Colors.blue} style={{ fontSize: 18, marginTop: 10 }}>
                  @{currentUser?.username}
                </Typography>
              </View>

              <PixelButton
                backgroundColor={Colors.green}
                style={[styles.modalSubmitBtn, { marginBottom: 10 }]}
                onPress={handlePickAvatar}
              >
                {avatarLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Typography variant="pixel" style={styles.modalBtnText}>GANTI FOTO</Typography>
                )}
              </PixelButton>

              <PixelButton
                backgroundColor={Colors.red}
                style={[styles.modalCancelBtn, { marginBottom: 10 }]}
                onPress={handleSignOut}
              >
                <Typography variant="pixel" style={styles.modalBtnText}>LOGOUT</Typography>
              </PixelButton>

              <TouchableOpacity onPress={() => setShowProfileModal(false)} style={{ padding: 10, alignItems: 'center' }}>
                <Typography style={{ color: Colors.ink, textDecorationLine: 'underline' }}>Tutup</Typography>
              </TouchableOpacity>
            </PixelCard>
          </View>
        </View>
      </Modal>

      {/* AUTH MODAL (LOGIN / DAFTAR) */}
      <Modal visible={showAuthModal} transparent animationType="fade" onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <PixelCard backgroundColor={Colors.cream} style={styles.authCard}>
              <Typography variant="pixel" color={Colors.blue} style={styles.modalHeaderTitle}>
                {authMode === 'login' ? 'MASUK KE KELAS 🎨' : 'DAFTAR AKUN BARU ✏️'}
              </Typography>
              <Typography style={styles.modalHeaderSub}>
                {authMode === 'login'
                  ? 'Gunakan username dan password untuk mengunggah karya & kuis.'
                  : 'Buat nama pengguna tanpa repot verifikasi email!'}
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
                placeholder="contoh: budi_seniman"
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

      {/* UPLOAD ARTWORK MODAL */}
      <Modal visible={showUploadModal} transparent animationType="fade" onRequestClose={() => setShowUploadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <PixelCard backgroundColor={Colors.cream} style={styles.authCard}>
              <Typography variant="pixel" color={Colors.ink} style={styles.modalHeaderTitle}>
                UNGGAH KARYA SENI 🎨
              </Typography>
              <Typography style={styles.modalHeaderSub}>
                Karya akan disimpan dan dapat dilihat oleh seluruh teman sekelas.
              </Typography>

              {/* Title */}
              <Typography weight="bold" style={styles.inputLabel}>Judul Karya / Tugas:</Typography>
              <TextInput
                style={styles.pixelInput}
                placeholder="misal: Sketsa Daun & Karakter Monster"
                placeholderTextColor="#999"
                value={uploadTitle}
                onChangeText={setUploadTitle}
              />

              {/* Gambar Karya */}
              <Typography weight="bold" style={styles.inputLabel}>Gambar Karya:</Typography>
              <View style={styles.imagePickerContainer}>
                {uploadImageUri ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: uploadImageUri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.imageChangeBtn} onPress={handlePickImage} activeOpacity={0.8}>
                      <Typography style={styles.imageChangeBtnText}>Ganti Gambar</Typography>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage} activeOpacity={0.8}>
                    <Typography style={styles.imagePickerBtnText}>📷 Pilih Gambar dari Galeri</Typography>
                  </TouchableOpacity>
                )}
              </View>

              {/* Notes */}
              <Typography weight="bold" style={styles.inputLabel}>Catatan Proses / Refleksi (Opsional):</Typography>
              <TextInput
                style={[styles.pixelInput, styles.pixelTextArea]}
                placeholder="Tuliskan pengalamanmu, teknik yang kamu coba, atau kendala saat berkarya..."
                placeholderTextColor="#999"
                value={uploadNotes}
                onChangeText={setUploadNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActionRow}>
                <PixelButton
                  backgroundColor={Colors.green}
                  style={styles.modalSubmitBtn}
                  onPress={handleUploadSubmit}
                >
                  {uploadLoading ? (
                    <ActivityIndicator color={Colors.ink} />
                  ) : (
                    <Typography variant="pixel" style={styles.modalBtnText}>
                      SIMPAN KARYA
                    </Typography>
                  )}
                </PixelButton>

                <PixelButton
                  backgroundColor={Colors.red}
                  style={styles.modalCancelBtn}
                  onPress={() => setShowUploadModal(false)}
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
    backgroundColor: Colors.sky,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.cream,
    borderBottomWidth: 4,
    borderBottomColor: Colors.ink,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtnText: {
    fontSize: 10,
    color: Colors.ink,
  },
  headerTitle: {
    fontSize: 14,
  },
  headerTitleMobile: {
    fontSize: 11,
  },
  loginHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loginHeaderText: {
    fontSize: 9,
    color: Colors.white,
  },
  userBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: Colors.ink,
    alignItems: 'center',
  },
  userBadgeText: {
    fontSize: 9,
    color: Colors.blue,
  },
  userBadgeSub: {
    fontSize: 10,
    color: Colors.red,
    marginTop: 2,
  },
  noticeBar: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ink,
  },
  noticeText: {
    fontSize: 11,
    color: Colors.ink,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 4,
    borderBottomColor: Colors.ink,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  tabButtonActive: {
    backgroundColor: Colors.blue,
  },
  tabText: {
    fontSize: 10,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  actionCard: {
    padding: 16,
    marginBottom: 16,
    zIndex: 10,
    elevation: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  bannerHeadline: {
    fontSize: 12,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: Colors.ink,
  },
  uploadBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  uploadBtnText: {
    fontSize: 10,
    color: Colors.ink,
  },
  filterScrollView: {
    marginTop: 14,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.ink,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.orange,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.ink,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  artCard: {
    padding: 16,
    marginBottom: 14,
  },
  artCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  artMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 11,
  },
  stageBadge: {
    backgroundColor: Colors.cream,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stageBadgeText: {
    fontSize: 11,
    color: Colors.ink,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    color: Colors.red,
  },
  artTitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  artNotes: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.ink,
    backgroundColor: Colors.cream,
    padding: 10,
    borderWidth: 2,
    borderColor: Colors.ink,
    marginBottom: 12,
  },
  artCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  artDate: {
    fontSize: 12,
    color: '#666',
  },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkBtnText: {
    fontSize: 9,
    color: Colors.white,
  },
  leaderboardTitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  leaderboardSub: {
    fontSize: 13,
    color: Colors.ink,
  },
  leaderCard: {
    padding: 14,
    marginBottom: 10,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankCol: {
    width: 44,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
  },
  userCol: {
    flex: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderAuthor: {
    fontSize: 15,
    color: Colors.ink,
  },
  leaderDate: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  scoreText: {
    fontSize: 10,
    color: Colors.ink,
  },
  statusSub: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    color: Colors.ink,
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
    maxWidth: 500,
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
  pixelTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stageChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.ink,
    marginRight: 8,
  },
  stageChipActive: {
    backgroundColor: Colors.gold,
  },
  stageChipText: {
    fontSize: 11,
    color: Colors.ink,
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
  imagePickerContainer: {
    marginBottom: 14,
  },
  imagePickerBtn: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.ink,
    borderStyle: 'dashed',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerBtnText: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: 'bold',
  },
  imagePreviewWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderWidth: 3,
    borderColor: Colors.ink,
    resizeMode: 'cover',
  },
  imageChangeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageChangeBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  artworkImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: Colors.ink,
    marginVertical: 12,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  likeBtnActive: {
    backgroundColor: '#ffebee',
    borderColor: Colors.red,
  },
  likeBtnText: {
    fontSize: 12,
    color: Colors.ink,
    fontWeight: 'bold',
  },
  likeBtnTextActive: {
    color: Colors.red,
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dropdownToggleText: {
    color: Colors.ink,
    fontSize: 12,
  },
  dropdownToggleIcon: {
    color: Colors.ink,
    fontSize: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.ink,
    zIndex: 20,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: Colors.white,
  },
  dropdownItemActive: {
    backgroundColor: Colors.gold,
  },
  dropdownItemText: {
    color: Colors.ink,
    fontSize: 12,
  },
  headerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  cardAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink,
    marginRight: 8,
  },
  profileAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileAvatarLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
