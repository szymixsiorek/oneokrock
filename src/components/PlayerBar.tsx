import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Repeat, 
  Shuffle,
  ListMusic
} from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface PlayerBarProps {
  currentTrack?: {
    title: string;
    artist: string;
    albumCover: string;
    duration: string;
  };
}

const PlayerBar = ({ currentTrack }: PlayerBarProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([30]);
  const [volume, setVolume] = useState([70]);

  // Placeholder track if none is playing
  const track = currentTrack || {
    title: "Wherever You Are",
    artist: "ONE OK ROCK",
    albumCover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    duration: "5:24",
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
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={track.albumCover}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {track.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {track.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </motion.button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10 text-right">
                1:42
              </span>
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {track.duration}
              </span>
            </div>
          </div>

          {/* Volume & Queue */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <ListMusic className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 w-28 hidden sm:flex">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerBar;
