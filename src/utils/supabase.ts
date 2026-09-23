import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Kredensial Supabase (Dapat diisi langsung di sini atau melalui file .env EXPO_PUBLIC_*)
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ztuhrwdlmnkyiizisiag.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0dWhyd2RsbW5reWlpemlzaWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzAzMjksImV4cCI6MjEwNTc0NjMyOX0.8zJCgWqyxB2NdgLtZqjB6h_zoNQB77ghMeByXZThWwE';

export const isSupabaseConfigured = () => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('your-project') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key') &&
    SUPABASE_URL.startsWith('https://')
  );
};

// Safe Storage Adapter untuk mencegah "ReferenceError: window is not defined" di Node SSR / Web
const isServer = typeof window === 'undefined';

export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isServer) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isServer) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isServer) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Artwork {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar_url?: string;
  title: string;
  stage: string;
  notes?: string;
  artwork_url: string;
  liked_by?: string[];
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar_url?: string;
  score: number;
  passed: boolean;
  created_at: string;
}

// Storage Keys untuk Offline Fallback
const LOCAL_STORAGE_KEYS = {
  SESSION_USER: '@artclass_session_user',
  ARTWORKS: '@artclass_local_artworks',
  QUIZ_RESULTS: '@artclass_local_quiz_results',
};

// Helper: Format username ke identifier Supabase (menggunakan domain TLD standar agar valid di Supabase Auth)
export const usernameToEmail = (username: string): string => {
  const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${sanitized || 'student'}@artclass.com`;
};

// Helper: Ubah pesan error teknis Supabase agar ramah dan fokus pada username
const cleanErrorMessage = (msg: string): string => {
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'Username ini sudah terdaftar! Silakan pilih "Masuk" atau buat username lain.';
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Username atau password salah! Silakan periksa kembali.';
  }
  if (msg.includes('Email') && msg.includes('invalid')) {
    return 'Username tidak valid. Gunakan huruf kecil, angka, atau tanda underscore (_).';
  }
  return msg.replace(/email address|email/gi, 'username');
};

// --- AUTHENTICATION ---

export const getCurrentUser = async (): Promise<Profile | null> => {
  if (isServer) return null;
  try {
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) return profile;

      return {
        id: session.user.id,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Siswa',
      };
    } else {
      // Local fallback
      const stored = await safeStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_USER);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (err) {
    console.warn('Error fetching current user:', err);
    return null;
  }
};

export const signUpWithUsername = async (username: string, password: string): Promise<{ profile?: Profile; error?: string }> => {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return { error: 'Username minimal 3 karakter (hanya huruf, angka, atau _)' };
  }
  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter!' };
  }

  const email = usernameToEmail(cleanUsername);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: cleanUsername },
        },
      });

      if (error) return { error: cleanErrorMessage(error.message) };
      if (!data.user) return { error: 'Gagal membuat akun' };

      // Simpan profile ke tabel profiles
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: cleanUsername,
      });

      const profile: Profile = {
        id: data.user.id,
        username: cleanUsername,
      };

      return { profile };
    } else {
      // Local fallback
      const mockProfile: Profile = {
        id: 'local_' + Date.now(),
        username: cleanUsername,
        created_at: new Date().toISOString(),
      };
      await safeStorage.setItem(LOCAL_STORAGE_KEYS.SESSION_USER, JSON.stringify(mockProfile));
      return { profile: mockProfile };
    }
  } catch (err: any) {
    return { error: cleanErrorMessage(err.message || 'Terjadi kesalahan saat pendaftaran') };
  }
};

export const signInWithUsername = async (username: string, password: string): Promise<{ profile?: Profile; error?: string }> => {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const email = usernameToEmail(cleanUsername);

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: cleanErrorMessage(error.message) };
      if (!data.user) return { error: 'Login gagal' };

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userProfile: Profile = profile || {
        id: data.user.id,
        username: data.user.user_metadata?.username || cleanUsername,
      };

      return { profile: userProfile };
    } else {
      // Local fallback
      const mockProfile: Profile = {
        id: 'local_' + cleanUsername,
        username: cleanUsername,
        created_at: new Date().toISOString(),
      };
      await safeStorage.setItem(LOCAL_STORAGE_KEYS.SESSION_USER, JSON.stringify(mockProfile));
      return { profile: mockProfile };
    }
  } catch (err: any) {
    return { error: cleanErrorMessage(err.message || 'Gagal login') };
  }
};

export const signOut = async (): Promise<void> => {
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    await safeStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_USER);
  } catch (err) {
    console.warn('Error signing out:', err);
  }
};

// --- ARTWORKS (KARYA SISWA) ---

export const getArtworks = async (): Promise<Artwork[]> => {
  if (isServer) return [];
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const artworksList = (data as Artwork[]) || [];
      if (artworksList.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, avatar_url');
        if (profiles) {
          const profileMap = new Map(profiles.map((p) => [p.id, p.avatar_url]));
          artworksList.forEach((art) => {
            art.author_avatar_url = profileMap.get(art.user_id);
          });
        }
      }
      return artworksList;
    } else {
      // Local storage (Hanya data riil yang diunggah pengguna, tanpa data demo)
      const stored = await safeStorage.getItem(LOCAL_STORAGE_KEYS.ARTWORKS);
      if (!stored) return [];
      const list: Artwork[] = JSON.parse(stored);
      return list.filter((item) => !item.id.startsWith('demo-'));
    }
  } catch (err) {
    console.warn('Error fetching artworks:', err);
    return [];
  }
};

export const createArtwork = async (data: {
  title: string;
  stage: string;
  notes?: string;
  artwork_url: string;
}): Promise<{ artwork?: Artwork; error?: string }> => {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Silakan login terlebih dahulu untuk mengunggah karya!' };
  }

  if (!data.title.trim()) {
    return { error: 'Judul karya wajib diisi!' };
  }
  if (!data.artwork_url.trim()) {
    return { error: 'Link karya wajib diisi!' };
  }

  try {
    if (isSupabaseConfigured()) {
      const newArtwork = {
        user_id: user.id,
        author_name: user.username,
        title: data.title.trim(),
        stage: data.stage,
        notes: data.notes?.trim() || '',
        artwork_url: data.artwork_url.trim(),
      };

      const { data: inserted, error } = await supabase
        .from('artworks')
        .insert([newArtwork])
        .select()
        .single();

      if (error) return { error: error.message };
      return { artwork: inserted as Artwork };
    } else {
      // Local fallback
      const current = await getArtworks();
      const newArtwork: Artwork = {
        id: 'local_art_' + Date.now(),
        user_id: user.id,
        author_name: user.username,
        title: data.title.trim(),
        stage: data.stage,
        notes: data.notes?.trim() || '',
        artwork_url: data.artwork_url.trim(),
        created_at: new Date().toISOString(),
      };
      const updated = [newArtwork, ...current];
      await safeStorage.setItem(LOCAL_STORAGE_KEYS.ARTWORKS, JSON.stringify(updated));
      return { artwork: newArtwork };
    }
  } catch (err: any) {
    return { error: err.message || 'Gagal menyimpan karya' };
  }
};

export const deleteArtwork = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('artworks').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const current = await getArtworks();
      const filtered = current.filter((item) => item.id !== id);
      await safeStorage.setItem(LOCAL_STORAGE_KEYS.ARTWORKS, JSON.stringify(filtered));
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus karya' };
  }
};

// --- QUIZ RESULTS & LEADERBOARD ---

export const saveQuizResult = async (score: number, passed: boolean): Promise<{ success: boolean; error?: string }> => {
  const user = await getCurrentUser();
  const authorName = user?.username || 'Anonim';
  const userId = user?.id || 'guest_' + Date.now();

  try {
    if (isSupabaseConfigured() && user) {
      const { error } = await supabase.from('quiz_results').insert([
        {
          user_id: user.id,
          author_name: authorName,
          score,
          passed,
        },
      ]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      // Local fallback
      const stored = await safeStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_RESULTS);
      const current: QuizResult[] = stored ? JSON.parse(stored) : [];
      const newResult: QuizResult = {
        id: 'local_quiz_' + Date.now(),
        user_id: userId,
        author_name: authorName,
        score,
        passed,
        created_at: new Date().toISOString(),
      };
      const updated = [newResult, ...current];
      await safeStorage.setItem(LOCAL_STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(updated));
      return { success: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan nilai kuis' };
  }
};

export const getLeaderboard = async (): Promise<QuizResult[]> => {
  if (isServer) return [];
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const results = (data as QuizResult[]) || [];
      if (results.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, avatar_url');
        if (profiles) {
          const profileMap = new Map(profiles.map((p) => [p.id, p.avatar_url]));
          results.forEach((res) => {
            res.author_avatar_url = profileMap.get(res.user_id);
          });
        }
      }
      return results;
    } else {
      // Local storage (Hanya data riil pengerjaan kuis, tanpa data demo)
      const stored = await safeStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_RESULTS);
      if (!stored) return [];
      const list: QuizResult[] = JSON.parse(stored);
      const realList = list.filter((item) => !item.id.startsWith('quiz-demo-'));
      return realList.sort((a, b) => b.score - a.score);
    }
  } catch (err) {
    console.warn('Error fetching leaderboard:', err);
    return [];
  }
};

export const uploadArtworkImage = async (uri: string, fileName: string): Promise<{ publicUrl?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { error: 'Mode lokal aktif. Sambungkan ke Supabase untuk mengunggah gambar.' };
  }

  try {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    
    // Create unique filename
    const extMatch = uri.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${ext}`;
    
    const { error } = await supabase.storage
      .from('artworks')
      .upload(`public/${uniqueFileName}`, arrayBuffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.warn('Supabase Storage Error:', error);
      return { error: `Storage Error: ${error.message || 'Unknown 400/403'}` };
    }

    const { data: publicData } = supabase.storage
      .from('artworks')
      .getPublicUrl(`public/${uniqueFileName}`);

    return { publicUrl: publicData.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Gagal mengunggah gambar' };
  }
};

export const toggleLikeArtwork = async (artworkId: string, userId: string, currentLikedBy: string[] = []): Promise<{ success: boolean; newLikedBy?: string[]; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Fitur Like hanya tersedia saat terhubung ke cloud (Supabase).' };
  }

  try {
    const isLiked = currentLikedBy.includes(userId);
    let newLikedBy = [...currentLikedBy];

    if (isLiked) {
      newLikedBy = newLikedBy.filter((id) => id !== userId);
    } else {
      newLikedBy.push(userId);
    }

    const { error } = await supabase
      .from('artworks')
      .update({ liked_by: newLikedBy })
      .eq('id', artworkId);

    if (error) throw error;
    return { success: true, newLikedBy };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyukai karya.' };
  }
};

export const uploadAvatarImage = async (uri: string, name: string): Promise<{ publicUrl?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { error: 'Hanya bisa upload foto jika Supabase dikonfigurasi!' };
  }
  
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Harus login untuk mengunggah foto profil' };

    const extMatch = uri.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const uniqueFileName = `${user.id}_${Date.now()}.${ext}`;

    const res = await fetch(uri);
    const arrayBuffer = await res.arrayBuffer();

    const { error } = await supabase.storage
      .from('avatars')
      .upload(`public/${uniqueFileName}`, arrayBuffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Avatar Storage Error:', error);
      return { error: `Storage Error: ${error.message}` };
    }

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`public/${uniqueFileName}`);

    return { publicUrl: publicData.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Gagal mengunggah foto profil' };
  }
};

export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase belum dikonfigurasi' };
  try {
    const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan URL avatar' };
  }
};
