import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Disc3, 
  Globe, 
  Music2, 
  Sparkles, 
  Heart,
  Users,
  Clock,
  MapPin,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LearnMore = () => {
  const bandMembers = [
    { name: "Taka", role: "Vocals", image: "🎤" },
    { name: "Toru", role: "Guitar", image: "🎸" },
    { name: "Ryota", role: "Bass", image: "🎸" },
    { name: "Tomoya", role: "Drums", image: "🥁" },
  ];

  const milestones = [
    { year: "2005", event: "Band formed in Tokyo, Japan" },
    { year: "2007", event: "Debut album 'Zeitakubyou' released" },
    { year: "2010", event: "Major breakthrough with 'Niche Syndrome'" },
    { year: "2013", event: "International expansion begins" },
    { year: "2017", event: "'Ambitions' world tour sells out arenas globally" },
    { year: "2022", event: "'Luxury Disease' continues global dominance" },
    { year: "2024", event: "'DETOX' marks new era of experimentation" },
  ];

  const features = [
    {
      icon: <Disc3 className="w-6 h-6" />,
      title: "Japanese Editions",
      description: "Access original Japanese versions with bonus tracks and exclusive content unavailable on international streaming platforms.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Hidden Tracks",
      description: "Discover secret tracks hidden at the end of albums — a beloved ONE OK ROCK tradition since their early days.",
    },
    {
      icon: <Music2 className="w-6 h-6" />,
      title: "Lossless Audio",
      description: "Experience high-fidelity audio quality with preserved metadata and original mastering.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Complete Discography",
      description: "From 'Zeitakubyou' to 'DETOX' — every album, every track, every version in one place.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="absolute inset-0 h-[400px] opacity-30 blur-3xl"
          style={{
            background: "linear-gradient(180deg, hsl(var(--primary) / 0.4) 0%, transparent 100%)",
          }}
        />

        <div className="container mx-auto max-w-5xl px-4 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                About the Archive
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black">
              <span className="text-foreground">The </span>
              <span className="gradient-text">ONE OK ROCK</span>
              <span className="text-foreground"> Story</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From underground Tokyo venues to sold-out stadiums worldwide — 
              ONE OK ROCK has become Japan's most internationally successful rock band.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Band Members */}
      <section className="container mx-auto max-w-5xl px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">The Band</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bandMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-6 text-center"
              >
                <div className="text-5xl mb-4">{member.image}</div>
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto max-w-5xl px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Journey</h2>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="text-lg font-bold gradient-text">{milestone.year}</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary mt-2 flex-shrink-0 shadow-lg shadow-primary/50" />
                  <p className="text-muted-foreground flex-1">{milestone.event}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Archive Features */}
      <section className="container mx-auto max-w-5xl px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Archive Features</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-2xl p-8 md:p-12 text-center"
        >
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start Exploring
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Dive into the complete Japanese discography of ONE OK ROCK. 
            Experience the music as it was meant to be heard.
          </p>
          <Link to="/albums">
            <Button size="lg" className="gap-2 neon-glow-red">
              <Music2 className="w-5 h-5" />
              Browse All Albums
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Spacer for player bar */}
      <div className="h-24" />
    </div>
  );
};

export default LearnMore;
