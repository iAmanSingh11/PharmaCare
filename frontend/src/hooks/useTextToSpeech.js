import { useCallback, useEffect, useState } from 'react';

/* Wraps window.speechSynthesis for reading assistant replies aloud. */
export const useTextToSpeech = () => {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isSupported) return undefined;
    return () => window.speechSynthesis.cancel();
  }, [isSupported]);

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text) return;
      window.speechSynthesis.cancel(); // interrupt any prior utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop };
};
