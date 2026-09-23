import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Typography } from '../components/Typography';
import { PixelCard } from '../components/PixelCard';
import { PixelButton } from '../components/PixelButton';
import { audioManager } from '../utils/AudioManager';
import { saveQuizResult } from '../utils/supabase';
import { Colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUIZ_QUESTIONS = [
  {
    question: "Apa saja yang termasuk dalam warna primer?",
    options: ["Merah, Kuning, Biru", "Hijau, Oranye, Ungu", "Hitam, Putih, Abu-abu", "Merah, Hijau, Kuning"],
    correctAnswer: 0
  },
  {
    question: "Campuran warna merah dan kuning akan menghasilkan warna apa?",
    options: ["Hijau", "Coklat", "Oranye", "Ungu"],
    correctAnswer: 2
  },
  {
    question: "Unsur seni rupa yang paling sederhana dan mendasar adalah...",
    options: ["Garis", "Titik", "Bidang", "Bentuk"],
    correctAnswer: 1
  },
  {
    question: "Teknik membuat karya seni rupa dengan menempelkan kepingan bahan kecil disebut?",
    options: ["Aquarel", "Plakat", "Kolase", "Mozaik"],
    correctAnswer: 3
  },
  {
    question: "Campuran warna biru dan kuning akan menghasilkan warna apa?",
    options: ["Hijau", "Ungu", "Oranye", "Merah Muda"],
    correctAnswer: 0
  },
  {
    question: "Tahap awal dalam peta perjalanan kreatif untuk menemukan ide atau pesan adalah...",
    options: ["Revisi", "Galeri", "Gagasan", "Berkarya"],
    correctAnswer: 2
  },
  {
    question: "Karya seni rupa yang memiliki ukuran panjang, lebar, dan bervolume (ruang) disebut karya...",
    options: ["1 Dimensi", "2 Dimensi", "3 Dimensi", "4 Dimensi"],
    correctAnswer: 2
  },
  {
    question: "Teknik melukis dengan sapuan warna tipis dan transparan menggunakan cat air disebut teknik...",
    options: ["Aquarel", "Plakat", "Pointilis", "Siluet"],
    correctAnswer: 0
  },
  {
    question: "Unsur seni rupa yang menunjukkan sifat permukaan benda (halus, kasar, licin) adalah...",
    options: ["Ruang", "Bentuk", "Tekstur", "Gelap Terang"],
    correctAnswer: 2
  },
  {
    question: "Tahap akhir dalam perjalanan berkarya untuk mempresentasikan dan merayakan karya adalah...",
    options: ["Rencana", "Revisi", "Galeri", "Gagasan"],
    correctAnswer: 2
  },
  {
    question: "Campuran warna merah dan biru dalam proporsi seimbang akan menghasilkan warna apa?",
    options: ["Hijau", "Ungu", "Coklat", "Abu-abu"],
    correctAnswer: 1
  },
  {
    question: "Warna yang sering dikategorikan sebagai warna netral dalam seni rupa adalah...",
    options: ["Merah dan Biru", "Hitam dan Putih", "Kuning dan Hijau", "Coklat dan Oranye"],
    correctAnswer: 1
  },
  {
    question: "Goresan nyata atau batas dari suatu benda yang memanjang dan berarah disebut...",
    options: ["Garis", "Titik", "Ruang", "Volume"],
    correctAnswer: 0
  },
  {
    question: "Teknik menempelkan berbagai bahan berbeda (kertas, kain, foto) pada satu permukaan gambar disebut...",
    options: ["Mozaik", "Montase", "Kolase", "Aquarel"],
    correctAnswer: 2
  },
  {
    question: "Pada tahap 'Rencana' dalam proses kreatif, kegiatan utama yang dilakukan adalah...",
    options: ["Menjual karya seni", "Menentukan media, komposisi, dan langkah kerja", "Menerima masukan akhir", "Membeli pigura"],
    correctAnswer: 1
  },
  {
    question: "Bentuk dua dimensi yang dibatasi oleh garis dan hanya memiliki panjang serta lebar disebut...",
    options: ["Titik", "Bidang", "Ruang", "Tekstur"],
    correctAnswer: 1
  },
  {
    question: "Teknik melukis dengan sapuan cat yang tebal, pekat, dan menutup permukaan secara padat disebut...",
    options: ["Aquarel", "Plakat", "Arsir", "Dussel"],
    correctAnswer: 1
  },
  {
    question: "Tahap menerima masukan untuk menyempurnakan bagian karya yang masih kurang adalah tahap...",
    options: ["Gagasan", "Rencana", "Berkarya", "Revisi"],
    correctAnswer: 3
  },
  {
    question: "Unsur seni rupa yang memanfaatkan perbedaan intensitas cahaya untuk menciptakan kesan kedalaman disebut...",
    options: ["Gelap Terang", "Tekstur", "Garis", "Gagasan"],
    correctAnswer: 0
  },
  {
    question: "Lukisan, gambar di atas kanvas, dan poster adalah contoh karya seni rupa...",
    options: ["1 Dimensi", "2 Dimensi", "3 Dimensi", "4 Dimensi"],
    correctAnswer: 1
  }
];

interface Slide4QuizProps {
  onFinish: (score: number) => void;
}

export function Slide4_Quiz({ onFinish }: Slide4QuizProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const scoreRef = React.useRef(0);

  const pointsPerQuestion = Math.round(100 / QUIZ_QUESTIONS.length);

  useEffect(() => {
    scoreRef.current = 0;
    audioManager.startQuizMode();
    return () => {
      audioManager.stopQuizSong();
    };
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return; // Prevent multiple clicks

    setSelectedOption(index);
    const isCorrect = index === QUIZ_QUESTIONS[currentIndex].correctAnswer;
    
    if (isCorrect) {
      scoreRef.current += pointsPerQuestion;
      setScore(scoreRef.current);
    }

    setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex < QUIZ_QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const finalScore = scoreRef.current;
        const isWin = finalScore >= 75;
        audioManager.playResultSong(isWin);
        setIsFinished(true);
        saveQuizResult(finalScore, isWin);
      }
    }, 800);
  };

  if (isFinished) {
    return (
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <PixelCard backgroundColor={Colors.cream} style={styles.resultCard}>
            <Typography variant="pixel" color={Colors.red} style={styles.kicker}>
              KUIS SELESAI
            </Typography>
            <Typography variant="pixel" color={Colors.blue} style={styles.title}>
              NILAI KAMU:
            </Typography>
            <Typography style={styles.scoreText}>
              {score} / 100
            </Typography>
            <Typography style={styles.feedbackText}>
              {score === 100 ? 'Sempurna! Kamu maestro seni sejati!' : score >= 75 ? 'Kerja bagus! Sedikit lagi mencapai kesempurnaan.' : 'Jangan menyerah! Ayo pelajari materi lagi dan coba lagi.'}
            </Typography>
            
            <View style={{ gap: 12, width: '100%', alignItems: 'center' }}>
              <PixelButton 
                backgroundColor={Colors.gold} 
                onPress={() => {
                  audioManager.returnToMainSong();
                  onFinish(score);
                  router.push('/gallery?tab=leaderboard');
                }} 
                style={styles.btn}
              >
                <Typography style={[styles.btnText, { color: Colors.ink }]}>🏆 LIHAT PAPAN SKOR KELAS</Typography>
              </PixelButton>

              <PixelButton 
                backgroundColor={Colors.green} 
                onPress={() => {
                  audioManager.returnToMainSong();
                  onFinish(score);
                }} 
                style={styles.btn}
              >
                <Typography style={styles.btnText}>KEMBALI KE MENU</Typography>
              </PixelButton>
            </View>
          </PixelCard>
        </Animated.View>
      </ScrollView>
    );
  }

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]} 
      showsVerticalScrollIndicator={false}
    >
      <Animated.View key={currentIndex} entering={SlideInRight.duration(400)} style={styles.content}>
        <PixelCard backgroundColor={Colors.white} style={styles.questionCard}>
          <Typography variant="pixel" color={Colors.blue} style={isMobile ? styles.qCountMobile : styles.qCount}>
            SOAL {currentIndex + 1} / {QUIZ_QUESTIONS.length}
          </Typography>
          <Typography style={isMobile ? styles.qTextMobile : styles.qText}>
            {currentQ.question}
          </Typography>
        </PixelCard>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, idx) => {
            let bgColor = Colors.cream;
            if (selectedOption !== null) {
              if (idx === currentQ.correctAnswer) bgColor = Colors.green; // Show correct answer
              else if (idx === selectedOption) bgColor = Colors.red; // Show wrong answer if selected
            }

            return (
              <Animated.View key={idx} entering={FadeInUp.delay(idx * 100).duration(300)}>
                <PixelButton 
                  backgroundColor={bgColor} 
                  onPress={() => handleAnswer(idx)}
                  style={styles.optionBtn}
                >
                  <Typography style={isMobile ? styles.optionTextMobile : styles.optionText}>
                    {option}
                  </Typography>
                </PixelButton>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
  },
  questionCard: {
    padding: 24,
    marginBottom: 24,
  },
  qCount: {
    fontSize: 16,
    marginBottom: 12,
  },
  qCountMobile: {
    fontSize: 14,
    marginBottom: 8,
  },
  qText: {
    fontSize: 24,
    lineHeight: 32,
  },
  qTextMobile: {
    fontSize: 18,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 16,
  },
  optionBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 18,
    color: Colors.ink,
  },
  optionTextMobile: {
    fontSize: 15,
  },
  resultCard: {
    padding: 40,
    alignItems: 'center',
    maxWidth: 500,
  },
  kicker: {
    fontSize: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.ink,
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  btnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  }
});
