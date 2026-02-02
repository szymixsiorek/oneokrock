import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import AlbumCard from "@/components/AlbumCard";
import { mockAlbums } from "@/data/mockAlbums";
import { Disc3 } from "lucide-react";

const Index = () => {
  // Get featured albums (latest 4)
  const featuredAlbums = mockAlbums.slice(0, 4);

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
            className="flex items-center gap-4 mb-12"
          >
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
          </motion.div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAlbums.map((album, index) => (
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
