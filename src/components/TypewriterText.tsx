import React, { useState, useEffect } from 'react';
import { Typography } from './Typography';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  style?: any;
  onComplete?: () => void;
}

export function TypewriterText({ text, delay = 30, style, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    let accumulated = '';
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        accumulated += text[currentIndex];
        setDisplayedText(accumulated);
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, delay);

    return () => {
      clearInterval(interval);
      setDisplayedText('');
    };
  }, [text, delay, onComplete]);

  return <Typography style={style}>{displayedText}</Typography>;
}
