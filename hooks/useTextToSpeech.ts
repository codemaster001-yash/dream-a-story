import { useState, useEffect, useCallback, useRef } from 'react';

export const useTextToSpeech = (onEndCallback: () => void) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const wasCancelled = useRef(false);

  const synth = window.speechSynthesis;

  const speak = useCallback((text: string) => {
    if (synth.speaking) {
      synth.cancel();
    }
    wasCancelled.current = false;
    const utterance = new SpeechSynthesisUtterance(text);

    // Get selected voice from storage
    const savedVoiceURI = localStorage.getItem('selected_voice_uri');
    if (savedVoiceURI) {
        const voices = synth.getVoices();
        const selectedVoice = voices.find(v => v.voiceURI === savedVoiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }

    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (!wasCancelled.current) {
        onEndCallback();
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    synth.speak(utterance);
  }, [synth, onEndCallback]);

  const pause = useCallback(() => {
    if(synth.speaking && !synth.paused) {
        synth.pause();
        setIsPaused(true);
    }
  }, [synth]);

  const resume = useCallback(() => {
    if(synth.paused) {
        synth.resume();
        setIsPaused(false);
    }
  }, [synth]);

  const stop = useCallback(() => {
    if (synth.speaking) {
      wasCancelled.current = true;
      synth.cancel();
      // State updates will be handled by utterance.onend
    }
  }, [synth]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { speak, pause, resume, stop, isSpeaking, isPaused };
};