import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * Wraps the browser's SpeechRecognition API (webkit prefixed in Chrome).
 * Returns null/no ops on unsupported browsers (e.g. Firefox) rather than
 * throwing, so callers can just hide the mic button when `isSupported` is
 * false.
 */
export const useSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = Boolean(SpeechRecognition);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [isSupported, SpeechRecognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setTranscript('');
    setError(null);
    setIsListening(true);
    recognitionRef.current.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, transcript, error, startListening, stopListening, setTranscript };
};
