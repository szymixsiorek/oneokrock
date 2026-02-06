import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat, 
  Shuffle,
  ChevronDown,
  ListMusic,
  X,
  BookOpen,
  Loader2
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useState, useEffect } from "react";
import { fetchLyrics } from "@/services/LyricsService";

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const FullscreenPlayer = ({ isOpen, onClose }: FullscreenPlayerProps) => {
  const {
    currentTrack,
    priorityQueue,
    albumContext,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffled,
    isRepeating,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    play,
    removeFromQueue,
  } = useAudioPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Fetch lyrics when track changes or lyrics panel opens
  useEffect(() => {
    if (!showLyrics || !currentTrack) {
      return;
    }

    let cancelled = false;
    setLyricsLoading(true);
    setLyrics(null);
    setLyricsError(null);

    fetchLyrics(currentTrack.artist, currentTrack.title).then((result) => {
      if (cancelled) return;
      setLyricsLoading(false);
      if (result.lyrics) {
        setLyrics(result.lyrics);
      } else {
        setLyricsError(result.error || "Lyrics not available");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showLyrics, currentTrack?.id]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleProgressChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleQueueTrackClick = (track: typeof currentTrack, isFromPriorityQueue: boolean) => {
    if (track?.mp3_url) {
      play(track);
      if (isFromPriorityQueue) {
        removeFromQueue(track.id);
      }
    }
  };

  const handleRemoveFromQueue = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    removeFromQueue(trackId);
  };

  if (!currentTrack) return null;

  // Get current position in album
  const currentAlbumIndex = albumContext.findIndex(t => t.id === currentTrack.id);
  const upcomingAlbumTracks = currentAlbumIndex >= 0 
    ? albumContext.slice(currentAlbumIndex + 1) 
    : [];

  const playerContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[9999] bg-background"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Background gradient */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at center top, hsl(var(--primary)) 0%, transparent 70%)`,
            }}
          />

          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Now Playing
                </p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {currentTrack.albumTitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Lyrics Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowLyrics(!showLyrics); if (!showLyrics) setShowQueue(false); }}
                  className={`p-2 rounded-full transition-colors ${
                    showLyrics ? "bg-primary text-primary-foreground" : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                </motion.button>

                {/* Queue Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowQueue(!showQueue); if (!showQueue) setShowLyrics(false); }}
                  className={`p-2 rounded-full transition-colors relative ${
                    showQueue ? "bg-primary text-primary-foreground" : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <ListMusic className="w-6 h-6" />
                  {priorityQueue.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium border-2 border-background">
                      {priorityQueue.length}
                    </span>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:px-8 overflow-hidden">
              {/* Album Art or Lyrics */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`flex-shrink-0 transition-all duration-300 ${
                  showQueue || showLyrics ? "w-48 h-48 md:w-64 md:h-64" : "w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
                }`}
              >
                {showLyrics ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden glass-panel p-4">
                    {lyricsLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : lyricsError ? (
                      <div className="w-full h-full flex items-center justify-center text-center">
                        <p className="text-muted-foreground text-sm">{lyricsError}</p>
                      </div>
                    ) : (
                      <div className="w-full h-full overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-[Inter,'Noto_Sans_JP',sans-serif]">
                          {lyrics}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
                    <img
                      src={currentTrack.albumCover || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop"}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </motion.div>

              {/* Queue Panel */}
              <AnimatePresence>
                {showQueue && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="w-full md:w-80 lg:w-96 h-64 md:h-80 overflow-hidden"
                  >
                    <div className="glass-panel rounded-2xl h-full p-4 overflow-y-auto">
                      {/* Priority Queue Section */}
                      {priorityQueue.length > 0 && (
                        <>
                          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                            Up Next • {priorityQueue.length} {priorityQueue.length === 1 ? 'track' : 'tracks'}
                          </h3>
                          <div className="space-y-1 mb-4">
                            {priorityQueue.map((track, index) => (
                              <motion.div
                                key={`pq-${track.id}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleQueueTrackClick(track, true)}
                                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer bg-primary/10 hover:bg-primary/20 transition-colors group"
                              >
                                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={track.albumCover || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"}
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-foreground">
                                    {track.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {track.artist}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleRemoveFromQueue(e, track.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                                  title="Remove from queue"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Album Context Section */}
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        From Album • {upcomingAlbumTracks.length} remaining
                      </h3>
                      <div className="space-y-1">
                        {upcomingAlbumTracks.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            End of album
                          </p>
                        ) : (
                          upcomingAlbumTracks.slice(0, 10).map((track, index) => (
                            <motion.div
                              key={`ac-${track.id}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (priorityQueue.length + index) * 0.03 }}
                              onClick={() => handleQueueTrackClick(track, false)}
                              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                            >
                              <span className="w-6 text-center text-sm text-muted-foreground">
                                {currentAlbumIndex + index + 2}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">
                                  {track.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {track.artist}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Track Info & Controls */}
            <div className="p-4 md:p-8 space-y-6">
              {/* Track Info */}
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-lg text-muted-foreground mt-1">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-2xl mx-auto space-y-2">
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={duration || 100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-6 md:gap-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleShuffle}
                  className={`p-3 rounded-full transition-colors ${
                    isShuffled ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={previous}
                  className="p-3 text-foreground hover:text-primary transition-colors"
                >
                  <SkipBack className="w-8 h-8" fill="currentColor" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayPause}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={next}
                  className="p-3 text-foreground hover:text-primary transition-colors"
                >
                  <SkipForward className="w-8 h-8" fill="currentColor" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleRepeat}
                  className={`p-3 rounded-full transition-colors ${
                    isRepeating ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                )}
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(playerContent, document.body);
};

export default FullscreenPlayer;
