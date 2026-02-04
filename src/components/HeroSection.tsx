import { motion } from "framer-motion";
import { Disc3, Music2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32 px-4 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel"
          >
            <Disc3 className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-sm font-medium text-muted-foreground">
              Complete Japanese Discography
            </span>
          </motion.div>

          {/* Main Title */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight"
            >
              <span className="text-foreground">ONE OK </span>
              <span className="gradient-text">ROCK</span>
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-light text-muted-foreground"
            >
              Digital Archive
            </motion.h2>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Experience the complete Japanese discography of ONE OK ROCK. 
            Access original Japanese versions, hidden tracks, and exclusive content 
            unavailable on international streaming platforms.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/albums">
              <Button size="lg" className="gap-2 neon-glow-red">
                <Music2 className="w-5 h-5" />
                Browse Albums
              </Button>
            </Link>
            <Link to="/learn-more">
              <Button variant="outline" size="lg" className="gap-2 glass-panel border-border/50">
                <Globe className="w-5 h-5" />
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-3 gap-8 pt-12 max-w-lg mx-auto relative z-20"
          >
            {[
              { value: "10+", label: "Albums" },
              { value: "100+", label: "Tracks" },
              { value: "2007", label: "Since" },
            ].map((stat) => (
              <div key={stat.label} className="text-center relative z-20">
                <p className="text-3xl sm:text-4xl font-bold gradient-text relative z-20">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1 relative z-20">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Album Covers Preview - lowered z-index */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-4 opacity-20 z-0 pointer-events-none"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-24 h-24 rounded-lg bg-secondary/50 glass-panel"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
