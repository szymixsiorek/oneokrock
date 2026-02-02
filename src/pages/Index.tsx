import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import AlbumCard from "@/components/AlbumCard";
import { useAlbums } from "@/hooks/useAlbums";
import { Disc3, Loader2 } from "lucide-react";

const Index = () => {
  const { data: albums, isLoading } = useAlbums();

  // Get featured albums (latest 4)
  const featuredAlbums = albums?.slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Albums Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  Featured Albums
                </h2>
                <p className="text-muted-foreground">
                  Japanese editions with exclusive content
                </p>
              </div>
            </div>
            {albums && albums.length > 4 && (
              <Link
                to="/albums"
                className="text-primary hover:underline text-sm font-medium"
              >
                View all →
              </Link>
            )}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* Albums Grid */}
          {!isLoading && featuredAlbums.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAlbums.map((album, index) => (
                <AlbumCard
                  key={album.id}
                  id={album.id}
                  title={album.title}
                  coverUrl={album.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop"}
                  releaseDate={album.release_date || new Date().toISOString()}
                  editionType={album.edition_type}
                  trackCount={album.tracks?.length || 0}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && featuredAlbums.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-panel rounded-2xl"
            >
              <Disc3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Albums Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                The archive is empty. Sign in to start uploading albums.
              </p>
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  Sign In to Upload
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel rounded-2xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Japanese Editions",
                  description: "Access the original Japanese versions with exclusive tracks unavailable internationally.",
                  icon: "🇯🇵",
                },
                {
                  title: "Hidden Tracks",
                  description: "Discover secret tracks hidden at the end of albums, a ONE OK ROCK tradition.",
                  icon: "🔮",
                },
                {
                  title: "HD Audio",
                  description: "Experience high-fidelity audio quality with metadata preservation.",
                  icon: "🎧",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Spacer for player bar */}
      <div className="h-24" />
    </div>
  );
};

export default Index;
