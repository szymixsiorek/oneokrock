import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { parseBlob } from "music-metadata-browser";
import { supabase } from "@/integrations/supabase/client";
import { useCreateAlbum, useCreateTracks } from "@/hooks/useAlbums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Music, 
  Loader2, 
  Check, 
  X, 
  Clock,
  Disc3,
  Image as ImageIcon
} from "lucide-react";

interface ParsedTrack {
  file: File;
  title: string;
  trackNumber: number;
  duration: string;
  artist: string;
  status: "pending" | "uploading" | "done" | "error";
}

const AlbumUploader = () => {
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [editionType, setEditionType] = useState<"Japanese" | "International" | "Deluxe">("Japanese");
  const [releaseType, setReleaseType] = useState<"Album" | "Single">("Album");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tracks, setTracks] = useState<ParsedTrack[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();
  const createAlbum = useCreateAlbum();
  const createTracks = useCreateTracks();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseTrackFile = async (file: File): Promise<ParsedTrack> => {
    try {
      const metadata = await parseBlob(file);
      const title = metadata.common.title || file.name.replace(/\.[^/.]+$/, "");
      const trackNumber = metadata.common.track.no || 0;
      const duration = metadata.format.duration 
        ? formatDuration(metadata.format.duration) 
        : "0:00";
      const artist = metadata.common.artist || "ONE OK ROCK";

      return {
        file,
        title,
        trackNumber,
        duration,
        artist,
        status: "pending",
      };
    } catch (error) {
      // Fallback if metadata parsing fails
      return {
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        trackNumber: 0,
        duration: "0:00",
        artist: "ONE OK ROCK",
        status: "pending",
      };
    }
  };

  const onDropTracks = useCallback(async (acceptedFiles: File[]) => {
    const mp3Files = acceptedFiles.filter(
      (file) => file.type === "audio/mpeg" || file.name.endsWith(".mp3")
    );

    if (mp3Files.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please upload MP3 files only.",
        variant: "destructive",
      });
      return;
    }

    const parsedTracks = await Promise.all(mp3Files.map(parseTrackFile));
    
    // Sort by track number, then alphabetically
    parsedTracks.sort((a, b) => {
      if (a.trackNumber && b.trackNumber) {
        return a.trackNumber - b.trackNumber;
      }
      return a.title.localeCompare(b.title);
    });

    // Assign track numbers if missing
    parsedTracks.forEach((track, index) => {
      if (!track.trackNumber) {
        track.trackNumber = index + 1;
      }
    });

    setTracks(parsedTracks);
  }, [toast]);

  const onDropCover = useCallback((acceptedFiles: File[]) => {
    const imageFile = acceptedFiles.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      setCoverFile(imageFile);
      setCoverPreview(URL.createObjectURL(imageFile));
    }
  }, []);

  const { getRootProps: getTrackRootProps, getInputProps: getTrackInputProps, isDragActive: isTrackDragActive } = 
    useDropzone({
      onDrop: onDropTracks,
      accept: { "audio/mpeg": [".mp3"] },
    });

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = 
    useDropzone({
      onDrop: onDropCover,
      accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
      maxFiles: 1,
    });

  const uploadAlbum = async () => {
    if (!albumTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter an album title.",
        variant: "destructive",
      });
      return;
    }

    if (tracks.length === 0) {
      toast({
        title: "No Tracks",
        description: "Please add at least one track.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload cover image first
      let coverUrl: string | null = null;
      if (coverFile) {
        const coverPath = `${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverPath, coverFile);

        if (coverError) throw coverError;

        const { data: { publicUrl } } = supabase.storage
          .from("covers")
          .getPublicUrl(coverPath);
        
        coverUrl = publicUrl;
      }

      // Create album record
      const albumData = await createAlbum.mutateAsync({
        title: albumTitle,
        description: albumDescription || null,
        edition_type: editionType,
        release_type: releaseType,
        release_date: releaseDate || null,
        cover_url: coverUrl,
        accent_color: "#ff0033",
      } as any);

      // Upload tracks in batches of 5
      const BATCH_SIZE = 5;
      const trackRecords: any[] = [];

      for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
        const batch = tracks.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(async (track, batchIndex) => {
            const globalIndex = i + batchIndex;
            
            // Update status to uploading
            setTracks((prev) =>
              prev.map((t, idx) =>
                idx === globalIndex ? { ...t, status: "uploading" as const } : t
              )
            );

            try {
              // Upload MP3 file
              const filePath = `${albumData.id}/${track.trackNumber.toString().padStart(2, "0")}-${track.file.name}`;
              const { error: uploadError } = await supabase.storage
                .from("music")
                .upload(filePath, track.file);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from("music")
                .getPublicUrl(filePath);

              trackRecords.push({
                album_id: albumData.id,
                title: track.title,
                track_number: track.trackNumber,
                duration: track.duration,
                artist: track.artist,
                mp3_url: publicUrl,
                lyrics_language: "JA" as const,
              });

              // Update status to done
              setTracks((prev) =>
                prev.map((t, idx) =>
                  idx === globalIndex ? { ...t, status: "done" as const } : t
                )
              );
            } catch (error) {
              // Update status to error
              setTracks((prev) =>
                prev.map((t, idx) =>
                  idx === globalIndex ? { ...t, status: "error" as const } : t
                )
              );
            }
          })
        );

        setUploadProgress(Math.round(((i + batch.length) / tracks.length) * 100));
      }

      // Insert all track records
      if (trackRecords.length > 0) {
        await createTracks.mutateAsync(trackRecords);
      }

      toast({
        title: "Album Uploaded!",
        description: `Successfully uploaded "${albumTitle}" with ${trackRecords.length} tracks.`,
      });

      // Reset form
      setAlbumTitle("");
      setAlbumDescription("");
      setReleaseDate("");
      setCoverFile(null);
      setCoverPreview(null);
      setTracks([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the album.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeTrack = (index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-muted-foreground" />,
    uploading: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
    done: <Check className="w-4 h-4 text-green-500" />,
    error: <X className="w-4 h-4 text-destructive" />,
  };

  return (
    <div className="space-y-8">
      {/* Album Details */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-primary" />
          Album Details
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover Upload */}
          <div
            {...getCoverRootProps()}
            className="aspect-square rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
          >
            <input {...getCoverInputProps()} />
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drop album cover here
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Album Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Ambitions"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseType">Release Type</Label>
              <Select value={releaseType} onValueChange={(v: any) => setReleaseType(v)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Album">Album</SelectItem>
                  <SelectItem value="Single">Single</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition">Edition Type</Label>
              <Select value={editionType} onValueChange={(v: any) => setEditionType(v)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Release Date</Label>
              <Input
                id="date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Album description..."
                value={albumDescription}
                onChange={(e) => setAlbumDescription(e.target.value)}
                className="bg-secondary/50 min-h-[80px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Track Upload */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Tracks
        </h3>

        {/* Drop Zone */}
        <div
          {...getTrackRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isTrackDragActive
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/50"
          }`}
        >
          <input {...getTrackInputProps()} />
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">
            {isTrackDragActive ? "Drop the files here..." : "Drop MP3 files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            Metadata will be extracted automatically
          </p>
        </div>

        {/* Track List */}
        <AnimatePresence>
          {tracks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground px-4 py-2 border-b border-border/50">
                <span>{tracks.length} tracks</span>
                <span>
                  {tracks.filter((t) => t.status === "done").length} uploaded
                </span>
              </div>

              {tracks.map((track, index) => (
                <motion.div
                  key={`${track.file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <span className="w-8 text-center text-muted-foreground font-mono">
                    {track.trackNumber.toString().padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {track.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {track.duration}
                  </span>
                  {statusIcons[track.status]}
                  {!isUploading && (
                    <button
                      onClick={() => removeTrack(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Submit Button */}
        {tracks.length > 0 && (
          <Button
            onClick={uploadAlbum}
            disabled={isUploading || !albumTitle.trim()}
            className="w-full gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {isUploading ? "Uploading..." : "Upload Album"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AlbumUploader;
