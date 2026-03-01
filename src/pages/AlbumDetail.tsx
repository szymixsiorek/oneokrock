import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAlbumBySlug } from "@/hooks/useAlbums";
import { useAudioPlayer, Track } from "@/contexts/AudioPlayerContext";
import { getTrackDuration } from "@/data/trackDurations";
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Clock, 
  Shuffle, 
  Heart,
  
  Mic2,
  Loader2,
  ListPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AlbumDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: album, isLoading, error } = useAlbumBySlug(slug || "");
  const { play, currentTrack, isPlaying, togglePlayPause, toggleShuffle, addToQueue } = useAudioPlayer();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-32 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen pt-28 pb-32 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Album not found
          </h1>
          <Link to="/albums">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Albums
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalDuration = album.tracks?.reduce((acc, track) => {
    if (!track.duration) return acc;
    const [mins, secs] = track.duration.split(":").map(Number);
    return acc + (mins || 0) * 60 + (secs || 0);
  }, 0) || 0;

  const formatTotalDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const languageColors: Record<string, string> = {
    JA: "bg-primary/20 text-primary",
    EN: "bg-accent/20 text-accent",
    Mixed: "bg-muted text-muted-foreground",
  };

  const accentColor = album.accent_color || "#ff0033";

  // Build queue from album tracks
  const buildQueue = (): Track[] => {
    if (!album.tracks) return [];
    return album.tracks
      .filter(t => t.mp3_url)
      .map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        duration: t.duration,
        mp3_url: t.mp3_url,
        albumCover: album.cover_url,
        albumId: album.id,
        albumTitle: album.title,
      }));
  };

  const handlePlayTrack = (trackId: string) => {
    const queue = buildQueue();
    const track = queue.find(t => t.id === trackId);
    if (track) {
      // If clicking on currently playing track, toggle play/pause
      if (currentTrack?.id === trackId) {
        togglePlayPause();
      } else {
        play(track, queue);
      }
    }
  };

  const handlePlayAll = () => {
    const queue = buildQueue();
    if (queue.length > 0) {
      play(queue[0], queue);
    }
  };

  const handleShufflePlay = () => {
    toggleShuffle();
    handlePlayAll();
  };

  const isTrackPlaying = (trackId: string) => {
    return currentTrack?.id === trackId && isPlaying;
  };

  const handleAddToQueue = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation(); // Prevent track from playing
    const queue = buildQueue();
    const track = queue.find(t => t.id === trackId);
    if (track) {
      addToQueue(track);
      toast.success(`Added "${track.title}" to queue`);
    }
  };

  // Get display duration - use lookup table first, then database value
  const getDisplayDuration = (track: { title: string; duration: string | null }) => {
    const lookupDuration = getTrackDuration(track.title);
    if (lookupDuration) return lookupDuration;
    if (track.duration && track.duration !== "0:00") return track.duration;
    return "-";
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Blur */}
        <div 
          className="absolute inset-0 h-[500px] opacity-30 blur-3xl"
          style={{
            background: `linear-gradient(180deg, ${accentColor}40 0%, transparent 100%)`,
          }}
        />

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link to="/albums">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </motion.div>

          {/* Album Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover Art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-72 flex-shrink-0"
            >
              <div className="aspect-square rounded-2xl overflow-hidden glass-panel p-2">
                <img
                  src={album.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop"}
                  alt={album.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </motion.div>

            {/* Album Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 space-y-6"
            >
              {/* Edition Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  album.edition_type === "Japanese" 
                    ? "bg-primary/20 text-primary" 
                    : album.edition_type === "International"
                    ? "bg-accent/20 text-accent"
                    : "bg-cyan-400/20 text-cyan-400"
                }`}>
                  {album.edition_type} Edition
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
                  {album.title}
                </h1>
                <p className="text-xl text-muted-foreground">ONE OK ROCK</p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {album.release_date && (
                  <>
                    <span>{new Date(album.release_date).getFullYear()}</span>
                    <span>•</span>
                  </>
                )}
                <span>{album.tracks?.length || 0} tracks</span>
                {totalDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatTotalDuration(totalDuration)}</span>
                  </>
                )}
              </div>

              {/* Description */}
              {album.description && (
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  {album.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button size="lg" className="gap-2 neon-glow-red" onClick={handlePlayAll}>
                  <Play className="w-5 h-5" fill="currentColor" />
                  Play
                </Button>
                <Button size="lg" variant="outline" className="gap-2 glass-panel border-border/50" onClick={handleShufflePlay}>
                  <Shuffle className="w-5 h-5" />
                  Shuffle
                </Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="container mx-auto max-w-6xl px-4 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel rounded-2xl p-6"
        >
          {/* Tracklist Header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 pb-4 border-b border-border/50">
            <span className="w-10 text-center">#</span>
            <span className="flex-1">Title</span>
            <span className="w-20 hidden sm:block">Language</span>
            <Clock className="w-4 h-4" />
          </div>

          {/* Tracks */}
          {album.tracks && album.tracks.length > 0 ? (
            <div className="divide-y divide-border/30">
              {album.tracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isCurrentlyPlaying = isTrackPlaying(track.id);
                const hasAudio = !!track.mp3_url;

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.03 }}
                    onClick={() => hasAudio && handlePlayTrack(track.id)}
                    className={`track-row flex items-center gap-2 group ${hasAudio ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  >
                    {/* Track Number / Play */}
                    <div className="w-10 text-center">
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <>
                          <span className={`group-hover:hidden ${isCurrentTrack ? "text-primary" : "text-muted-foreground"}`}>
                            {track.track_number}
                          </span>
                          {hasAudio && <Play className="w-4 h-4 text-primary hidden group-hover:block mx-auto" />}
                        </>
                      )}
                    </div>

                    {/* Title & Artist */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate transition-colors ${isCurrentTrack ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                          {track.title}
                        </p>
                        {track.is_hidden_track && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                            Hidden
                          </span>
                        )}
                        {!hasAudio && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                            No audio
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{track.artist}</span>
                        {track.featured_artist && (
                          <>
                            <Mic2 className="w-3 h-3" />
                            <span className="text-primary/80">{track.featured_artist}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="w-20 hidden sm:block">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${languageColors[track.lyrics_language] || languageColors.Mixed}`}>
                        {track.lyrics_language}
                      </span>
                    </div>

                    {/* Duration */}
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {getDisplayDuration(track)}
                    </span>

                    {/* Add to Queue */}
                    {hasAudio && (
                      <button 
                        onClick={(e) => handleAddToQueue(e, track.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        title="Add to queue"
                      >
                        <ListPlus className="w-5 h-5" />
                      </button>
                    )}

                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No tracks available
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AlbumDetail;
