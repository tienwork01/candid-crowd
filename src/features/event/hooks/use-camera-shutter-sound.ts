"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CameraAudioContext = AudioContext;

function createAudioContext() {
  const AudioContextConstructor =
    window.AudioContext ||
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  return AudioContextConstructor ? new AudioContextConstructor() : null;
}

export function useCameraShutterSound(isMutedByEvent = false) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => !isMutedByEvent);
  const audioContextRef = useRef<CameraAudioContext | null>(null);

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    },
    [],
  );

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    audioContextRef.current ??= createAudioContext();

    return audioContextRef.current;
  }, []);

  const playNoiseBurst = useCallback(
    (frequency: number, duration: number, volume: number, startDelay = 0) => {
      if (!isSoundEnabled) return;

      try {
        const context = getAudioContext();

        if (!context) return;

        if (context.state === "suspended") {
          void context.resume();
        }

        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * duration),
          context.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        const source = context.createBufferSource();
        const startAt = context.currentTime + startDelay;

        samples.forEach((_, index) => {
          samples[index] = Math.random() * 2 - 1;
        });

        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(frequency, startAt);
        filter.Q.setValueAtTime(1.1, startAt);
        gain.gain.setValueAtTime(volume, startAt);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start(startAt);
        source.stop(startAt + duration);
      } catch {
        // Audio feedback is an enhancement; capturing must still work if unavailable.
      }
    },
    [getAudioContext, isSoundEnabled],
  );

  const playCountdownTick = useCallback(() => {
    playNoiseBurst(1400, 0.024, 0.025);
  }, [playNoiseBurst]);

  const playShutterSound = useCallback(() => {
    // A two-stage shutter: a soft mechanical body followed by a crisp snap.
    playNoiseBurst(680, 0.058, 0.17);
    playNoiseBurst(3200, 0.028, 0.14, 0.012);
    playNoiseBurst(1750, 0.045, 0.055, 0.032);
  }, [playNoiseBurst]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((isEnabled) => !isEnabled);
  }, []);

  return {
    isSoundEnabled,
    playCountdownTick,
    playShutterSound,
    toggleSound,
  };
}
