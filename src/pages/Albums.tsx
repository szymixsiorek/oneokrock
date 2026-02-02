import { motion } from "framer-motion";
import AlbumCard from "@/components/AlbumCard";
import { mockAlbums } from "@/data/mockAlbums";
import { Disc3, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type EditionFilter = "all" | "Japanese" | "International" | "Deluxe";

const Albums = () => {
  const [filter, setFilter] = useState<EditionFilter>("all");

  const filteredAlbums = filter === "all" 
    ? mockAlbums 
    : mockAlbums.filter((album) => album.editionType === filter);

  const filters: { value: EditionFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "Japanese", label: "Japanese" },
    { value: "International", label: "International" },
    { value: "Deluxe", label: "Deluxe" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-32 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Disc3 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Discography
              </h1>
              <p className="text-muted-foreground">
                Complete ONE OK ROCK album collection
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-2 mb-8 flex-wrap"
        >
          <Filter className="w-4 h-4 text-muted-foreground mr-2" />
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? "" : "glass-panel border-border/50"}
            >
              {f.label}
            </Button>
          ))}
        </motion.div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlbums.map((album, index) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              coverUrl={album.coverUrl}
              releaseDate={album.releaseDate}
              editionType={album.editionType}
              trackCount={album.tracks.length}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAlbums.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground">
              No albums found with the selected filter.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Albums;
