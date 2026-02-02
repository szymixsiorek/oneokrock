import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Album = Tables<"albums"> & {
  tracks?: Tables<"tracks">[];
};

export type AlbumInsert = TablesInsert<"albums">;
export type TrackInsert = TablesInsert<"tracks">;

export const useAlbums = () => {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select(`
          *,
          tracks (*)
        `)
        .order("release_date", { ascending: false });

      if (error) throw error;
      return data as Album[];
    },
  });
};

export const useAlbum = (id: string) => {
  return useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select(`
          *,
          tracks (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Sort tracks by track number
      if (data.tracks) {
        data.tracks.sort((a, b) => a.track_number - b.track_number);
      }
      
      return data as Album;
    },
    enabled: !!id,
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (album: AlbumInsert) => {
      const { data, error } = await supabase
        .from("albums")
        .insert(album)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
};

export const useCreateTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tracks: TrackInsert[]) => {
      const { data, error } = await supabase
        .from("tracks")
        .insert(tracks)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
};
