import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Calendar } from "lucide-react";

interface AlbumCardProps {
  id: string;
  title: string;
  coverUrl: string;
  releaseDate: string;
  editionType: "Japanese" | "International" | "Deluxe";
  trackCount?: number;
  index?: number;
}

const AlbumCard = ({
  id,
  title,
  coverUrl,
  releaseDate,
  editionType,
  trackCount = 0,
  index = 0,
}: AlbumCardProps) => {
  const editionColors = {
    Japanese: "bg-primary/20 text-primary border-primary/30",
    International: "bg-accent/20 text-accent border-accent/30",
    Deluxe: "bg-neon-cyan/20 text-cyan-400 border-cyan-400/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/album/${id}`}>
        <div className="album-card group p-4">
          {/* Cover Art */}
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play Button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center neon-glow-red">
                <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </motion.div>

            {/* Edition Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full border ${editionColors[editionType]}`}
              >
                {editionType === "Japanese" ? "JP" : editionType === "International" ? "INT" : "DLX"}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(releaseDate).getFullYear()}</span>
              </div>
              {trackCount > 0 && (
                <span>{trackCount} tracks</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AlbumCard;
