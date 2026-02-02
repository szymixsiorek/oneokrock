import { motion } from "framer-motion";
import { Upload, Shield, Database, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const Admin = () => {
  return (
    <div className="min-h-screen pt-28 pb-32 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage your archive content
              </p>
            </div>
          </div>
        </motion.div>

        {/* Connect Backend Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Backend Required
          </h2>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            To upload and manage albums, you'll need to connect Lovable Cloud. 
            This will enable database storage, authentication, and file uploads.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            {[
              { icon: Database, label: "Database" },
              { icon: Shield, label: "Auth" },
              { icon: Music, label: "Storage" },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-panel rounded-xl p-4 text-center"
              >
                <item.icon className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Ask me to "enable Lovable Cloud" to get started!
          </p>
        </motion.div>

        {/* Upload Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 glass-panel rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Preview
          </h3>
          
          <p className="text-muted-foreground text-sm mb-6">
            Once connected, you'll be able to drag and drop MP3 files here. 
            The system will automatically extract metadata (track names, numbers, duration) 
            and organize your albums.
          </p>

          <div className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center opacity-50">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Drop your MP3 files here
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports batch uploads with automatic metadata extraction
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
