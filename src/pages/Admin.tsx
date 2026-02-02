import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, LogOut, Disc3, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAlbums, useDeleteAlbum } from "@/hooks/useAlbums";
import AlbumUploader from "@/components/AlbumUploader";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { data: albums, isLoading: albumsLoading } = useAlbums();
  const deleteAlbum = useDeleteAlbum();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteAlbum.mutateAsync(id);
        toast({
          title: "Album Deleted",
          description: `"${title}" has been removed from the archive.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete album.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-32 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-32 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground text-sm">
                  Signed in as {user?.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Existing Albums */}
        {albums && albums.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
              <Disc3 className="w-5 h-5 text-primary" />
              Uploaded Albums ({albums.length})
            </h3>

            <div className="space-y-3">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc3 className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {album.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {album.tracks?.length || 0} tracks • {album.edition_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/album/${album.id}`}>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlbum(album.id, album.title)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AlbumUploader />
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
