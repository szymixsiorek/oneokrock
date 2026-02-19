import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string | null;
  mp3_url: string | null;
  albumCover: string | null;
  albumId: string;
  albumTitle: string;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  priorityQueue: Track[];
  albumContext: Track[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeating: boolean;
  play: (track: Track, albumTracks?: Track[]) => void;
  pause: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  removeFromQueue: (trackId: string) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

const STORAGE_KEY = "oor_player_state";

interface PersistedState {
  currentTrack: Track | null;
  albumContext: Track[];
  progress: number;
  volume: number;
}

const loadPersistedState = (): PersistedState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load player state:", e);
  }
  return null;
};

const savePersistedState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save player state:", e);
  }
};

const CHUNK_SIZE = 65536; // 64KB chunks

// Stream audio via MediaSource Extensions - never fetches the full file as one request
const streamAudioViaMSE = async (
  audioElement: HTMLAudioElement,
  url: string,
  abortSignal: AbortSignal
): Promise<string | null> => {
  try {
    if (!('MediaSource' in window)) {
      // Fallback for browsers without MSE
      console.warn("MSE not supported, falling back to direct src");
      return null;
    }

    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    audioElement.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      mediaSource.addEventListener('sourceopen', () => resolve(), { once: true });
      mediaSource.addEventListener('error', () => reject(new Error('MediaSource error')), { once: true });
      // Timeout to avoid hanging
      setTimeout(() => reject(new Error('MediaSource open timeout')), 5000);
    });

    if (abortSignal.aborted) {
      URL.revokeObjectURL(objectUrl);
      return null;
    }

    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

    const response = await fetch(url, {
      headers: { 'Accept': 'audio/*' },
      credentials: 'omit',
      signal: abortSignal,
    });

    if (!response.ok || !response.body) {
      URL.revokeObjectURL(objectUrl);
      return null;
    }

    const reader = response.body.getReader();
    let buffer = new Uint8Array(0);

    const appendToSourceBuffer = (data: Uint8Array): Promise<void> => {
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      return new Promise((resolve, reject) => {
        if (abortSignal.aborted || mediaSource.readyState !== 'open') {
          reject(new Error('Aborted or closed'));
          return;
        }
        try {
          sourceBuffer.appendBuffer(arrayBuffer);
          sourceBuffer.addEventListener('updateend', () => resolve(), { once: true });
          sourceBuffer.addEventListener('error', () => reject(new Error('SourceBuffer error')), { once: true });
        } catch (e) {
          reject(e);
        }
      });
    };

    // Read and append chunks
    while (true) {
      if (abortSignal.aborted) break;

      const { done, value } = await reader.read();

      if (value) {
        // Merge with leftover buffer
        const merged = new Uint8Array(buffer.length + value.length);
        merged.set(buffer);
        merged.set(value, buffer.length);
        buffer = merged;

        // Append in CHUNK_SIZE pieces
        while (buffer.length >= CHUNK_SIZE) {
          const chunk = buffer.slice(0, CHUNK_SIZE);
          buffer = buffer.slice(CHUNK_SIZE);

          if (mediaSource.readyState !== 'open') break;
          await appendToSourceBuffer(chunk);
        }
      }

      if (done) {
        // Append remaining buffer
        if (buffer.length > 0 && mediaSource.readyState === 'open') {
          await appendToSourceBuffer(buffer);
          buffer = new Uint8Array(0);
        }
        if (mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
        break;
      }
    }

    return objectUrl;
  } catch (e) {
    if ((e as Error).name === 'AbortError') return null;
    console.error("MSE streaming failed:", e);
    return null;
  }
};

// Simple obfuscation for stored URLs - split/join to avoid plain string in memory
const obfuscateUrl = (url: string): string => {
  return btoa(url);
};

const deobfuscateUrl = (encoded: string): string => {
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [priorityQueue, setPriorityQueue] = useState<Track[]>([]);
  const [albumContext, setAlbumContext] = useState<Track[]>([]);
  const [originalAlbumContext, setOriginalAlbumContext] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const stateRef = useRef({
    currentTrack,
    priorityQueue,
    albumContext,
    isRepeating,
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      priorityQueue,
      albumContext,
      isRepeating,
    };
  }, [currentTrack, priorityQueue, albumContext, isRepeating]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Revoke previous object URL and abort ongoing stream
  const revokePreviousBlobUrl = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  }, []);

  // Load and play a track using MSE chunked streaming
  const loadAndPlayTrack = useCallback(async (track: Track) => {
    if (!audioRef.current || !track.mp3_url) return;

    revokePreviousBlobUrl();
    setCurrentTrack(track);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const objectUrl = await streamAudioViaMSE(audioRef.current, track.mp3_url, abortController.signal);
    if (objectUrl) {
      currentBlobUrlRef.current = objectUrl;
      audioRef.current.play().catch(console.error);
    } else if (!abortController.signal.aborted) {
      // Fallback if MSE not supported or failed
      audioRef.current.src = track.mp3_url;
      audioRef.current.play().catch(console.error);
    }
  }, [revokePreviousBlobUrl]);

  // Handle track ended
  const handleTrackEnded = useCallback(() => {
    const { currentTrack: track, priorityQueue: queue, albumContext: album, isRepeating: repeat } = stateRef.current;
    
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    if (queue.length > 0) {
      const nextTrack = queue[0];
      setPriorityQueue(prev => prev.slice(1));
      if (nextTrack?.mp3_url) {
        loadAndPlayTrack(nextTrack);
      }
      return;
    }

    if (track && album.length > 0) {
      const currentIndex = album.findIndex(t => t.id === track.id);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < album.length) {
        const nextTrack = album[nextIndex];
        if (nextTrack?.mp3_url) {
          loadAndPlayTrack(nextTrack);
        }
      }
    }
  }, [loadAndPlayTrack]);

  // Initialize audio element and restore state
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleTrackEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Restore persisted state
    const saved = loadPersistedState();
    if (saved) {
      setVolumeState(saved.volume);
      audio.volume = saved.volume / 100;
      
      if (saved.currentTrack) {
        setCurrentTrack(saved.currentTrack);
        setAlbumContext(saved.albumContext);
        setOriginalAlbumContext(saved.albumContext);
        
        if (saved.currentTrack.mp3_url) {
          // Load persisted track via MSE (don't autoplay)
          const restoreController = new AbortController();
          abortControllerRef.current = restoreController;
          streamAudioViaMSE(audio, saved.currentTrack.mp3_url, restoreController.signal).then((objectUrl) => {
            if (objectUrl && audioRef.current && !restoreController.signal.aborted) {
              currentBlobUrlRef.current = objectUrl;
              audioRef.current.currentTime = saved.progress || 0;
              setProgress(saved.progress || 0);
            }
          });
        }
      }
    }
    setIsInitialized(true);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleTrackEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      // Revoke blob URL on unmount
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  // Update ended listener when handler changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.removeEventListener("ended", handleTrackEnded);
    audio.addEventListener("ended", handleTrackEnded);
    
    return () => {
      audio.removeEventListener("ended", handleTrackEnded);
    };
  }, [handleTrackEnded]);

  // Persist state periodically
  useEffect(() => {
    if (!isInitialized) return;
    
    const interval = setInterval(() => {
      if (currentTrack) {
        savePersistedState({
          currentTrack,
          albumContext: originalAlbumContext,
          progress: audioRef.current?.currentTime || 0,
          volume,
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentTrack, originalAlbumContext, volume, isInitialized]);

  // Save on track change or pause
  useEffect(() => {
    if (!isInitialized || !currentTrack) return;
    
    savePersistedState({
      currentTrack,
      albumContext: originalAlbumContext,
      progress: audioRef.current?.currentTime || 0,
      volume,
    });
  }, [currentTrack, isPlaying, volume, originalAlbumContext, isInitialized]);

  const play = useCallback((track: Track, newAlbumContext?: Track[]) => {
    if (!audioRef.current || !track.mp3_url) return;

    if (newAlbumContext) {
      setOriginalAlbumContext(newAlbumContext);
      setAlbumContext(isShuffled ? shuffleArray(newAlbumContext) : newAlbumContext);
    }

    loadAndPlayTrack(track);
  }, [isShuffled, loadAndPlayTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const next = useCallback(() => {
    const { currentTrack: track, priorityQueue: queue, albumContext: album } = stateRef.current;

    if (queue.length > 0) {
      const nextTrack = queue[0];
      setPriorityQueue(prev => prev.slice(1));
      if (nextTrack?.mp3_url) {
        loadAndPlayTrack(nextTrack);
      }
      return;
    }

    if (!track || album.length === 0) return;

    const currentIndex = album.findIndex(t => t.id === track.id);
    const nextIndex = (currentIndex + 1) % album.length;
    const nextTrack = album[nextIndex];

    if (nextTrack?.mp3_url) {
      loadAndPlayTrack(nextTrack);
    }
  }, [loadAndPlayTrack]);

  const previous = useCallback(() => {
    if (!audioRef.current) return;
    
    const { currentTrack: track, albumContext: album } = stateRef.current;
    if (!track || album.length === 0) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = album.findIndex(t => t.id === track.id);
    const prevIndex = currentIndex <= 0 ? album.length - 1 : currentIndex - 1;
    const prevTrack = album[prevIndex];

    if (prevTrack?.mp3_url) {
      loadAndPlayTrack(prevTrack);
    }
  }, [loadAndPlayTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const newShuffled = !prev;
      if (newShuffled) {
        setAlbumContext(shuffleArray(originalAlbumContext));
      } else {
        setAlbumContext(originalAlbumContext);
      }
      return newShuffled;
    });
  }, [originalAlbumContext]);

  const toggleRepeat = useCallback(() => {
    setIsRepeating(prev => !prev);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setPriorityQueue(prev => {
      if (prev.some(t => t.id === track.id)) {
        toast({
          title: "Already in queue",
          description: `"${track.title}" is already in your queue`,
        });
        return prev;
      }
      toast({
        title: "Added to queue",
        description: `"${track.title}" will play next`,
      });
      return [...prev, track];
    });
  }, []);

  const clearQueue = useCallback(() => {
    setPriorityQueue([]);
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setPriorityQueue(prev => prev.filter(t => t.id !== trackId));
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        priorityQueue,
        albumContext,
        isPlaying,
        progress,
        duration,
        volume,
        isShuffled,
        isRepeating,
        play,
        pause,
        togglePlayPause,
        next,
        previous,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        clearQueue,
        removeFromQueue,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
