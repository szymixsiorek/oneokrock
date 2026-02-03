import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Repeat, 
  Shuffle,
  VolumeX,
  Maximize2
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import FullscreenPlayer from "./FullscreenPlayer";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const PlayerBar = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const {
    currentTrack,
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
  } = useAudioPlayer();

  // If no track, show minimal placeholder
  if (!currentTrack) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 player-bar"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-4 h-16">
            <p className="text-muted-foreground text-sm">Select a track to play</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleProgressChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 player-bar"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info - clickable to expand */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={() => setIsFullscreen(true)}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group-hover:ring-2 ring-primary/50 transition-all">
              <img
                src={currentTrack.albumCover || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                {currentTrack.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleShuffle}
                className={`transition-colors ${isShuffled ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button 
                onClick={previous}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </motion.button>
              <button 
                onClick={next}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleRepeat}
                className={`transition-colors ${isRepeating ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(progress)}
              </span>
              <Slider
                value={[progress]}
                onValueChange={handleProgressChange}
                max={duration || 100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Expand */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="flex items-center gap-2 w-28 hidden sm:flex">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              )}
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Expand player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Player */}
      <FullscreenPlayer 
        isOpen={isFullscreen} 
        onClose={() => setIsFullscreen(false)} 
      />
    </motion.div>
  );
};

export default PlayerBar;
