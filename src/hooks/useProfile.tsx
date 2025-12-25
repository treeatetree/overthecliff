import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  nickname: string | null;
  avatar_url: string | null;
  preferences: unknown;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNickname = async (nickname: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, nickname } : null);
      toast({ title: '昵称已更新' });
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast({ title: '更新失败', variant: 'destructive' });
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: '头像已更新' });
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: '上传失败', variant: 'destructive' });
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateNickname,
    uploadAvatar,
    refetch: fetchProfile,
  };
};
