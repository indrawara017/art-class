import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Header } from '../components/Header';
import { PixelButton } from '../components/PixelButton';
import { Typography } from '../components/Typography';
import { Slide0_Title } from '../slides/Slide0_Title';
import { Slide1_Map } from '../slides/Slide1_Map';
import { Slide2_Quest } from '../slides/Slide2_Quest';
import { Slide3_Menu } from '../slides/Slide3_Menu';
import { Colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentUser, getLeaderboard, getArtworks } from '../utils/supabase';

export default function AppIndex() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slide?: string }>();
  const totalSlides = 3; 

  const getInitialSlide = () => {
    if (params.slide) {
      const parsed = parseInt(params.slide, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= totalSlides) {
        return parsed;
      }
    }
    return 0;
  };

  const [currentSlide, setCurrentSlide] = useState<number>(getInitialSlide);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [points, setPoints] = useState(0);
  const [liveScore, setLiveScore] = useState(0);

  useEffect(() => {
    if (params.slide !== undefined) {
      const parsed = parseInt(params.slide, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= totalSlides) {
        setCurrentSlide(parsed);
        setIsQuizActive(false); 
        setLiveScore(0);
      }
    }
  }, [params.slide]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchScore = async () => {
        const user = await getCurrentUser();
        if (user) {
          const artworks = await getArtworks();
          const userArtworks = artworks.filter(a => a.user_id === user.id);
          const artworkPoints = userArtworks.length * 50;

          setPoints(artworkPoints);
        }
      };
      fetchScore();
    }, [])
  );

  const handleHomePress = () => {
    if (isQuizActive) {
      setIsQuizActive(false);
      setLiveScore(0);
      return;
    }
    setCurrentSlide(0);
    setIsQuizActive(false);
    setLiveScore(0);
  };
  
  // A simple way to progress linearly for testing, or we can just leave it as handled by the slides.
  // We'll let slide 0 transition to slide 1
  // We should add navigation arrows or let the user scroll if it was a real presentation.
  // Since we are mimicking a single-page app, let's add some basic navigation to switch slides.
  
  // For now, let's just create a next/prev button overlay if we are past slide 0
  
  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
      setIsQuizActive(false);
      setLiveScore(0);
    }
  };
  
  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setIsQuizActive(false);
      setLiveScore(0);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: currentSlide === 0 ? Math.max(insets.top, 16) : 0 }]}>
      <StatusBar style="dark" />
      
      {currentSlide > 0 && (
        <Header 
          currentSlide={currentSlide} 
          totalSlides={totalSlides} 
          points={isQuizActive ? liveScore : points} 
          title={isQuizActive ? '◀ KEMBALI' : 'ART CLASS 🎨'}
          onHomePress={handleHomePress} 
        />
      )}

      <View style={styles.content}>
        {currentSlide === 0 && <Slide0_Title onStart={() => setCurrentSlide(1)} />}
        {currentSlide === 1 && <Slide1_Map />}
        {currentSlide === 2 && <Slide2_Quest />}
        {currentSlide === 3 && (
          <Slide3_Menu 
            isQuizActive={isQuizActive}
            onQuizActiveChange={(active) => {
              setIsQuizActive(active);
              if (!active) setLiveScore(0);
            }} 
            onQuizScoreChange={setLiveScore} 
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      {currentSlide > 0 && !isQuizActive && (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
           {currentSlide > 1 ? (
             <PixelButton backgroundColor={Colors.orange} style={styles.navBtn} onPress={handlePrev}>
               <Typography variant="pixel" style={styles.navText}>◀</Typography>
             </PixelButton>
           ) : <View style={styles.navBtnPlaceholder} />}
           
           <Typography weight="bold" style={styles.navStatus}>
             SLIDE {currentSlide} / {totalSlides}
           </Typography>
           
           {currentSlide < totalSlides ? (
             <PixelButton backgroundColor={Colors.orange} style={styles.navBtn} onPress={handleNext}>
               <Typography variant="pixel" style={styles.navText}>▶</Typography>
             </PixelButton>
           ) : <View style={styles.navBtnPlaceholder} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sky,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    backgroundColor: Colors.cream,
    borderTopWidth: 4,
    borderTopColor: Colors.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Add safe area spacing for iOS if needed
    paddingBottom: 24,
  },
  navBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navBtnPlaceholder: {
    width: 70, // Roughly the size of the button
  },
  navStatus: {
    fontSize: 16,
    color: Colors.ink,
  },
  navText: {
    fontSize: 20,
    color: Colors.ink,
  }
});
