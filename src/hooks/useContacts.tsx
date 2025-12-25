import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useBirthdaySync } from './useBirthdaySync';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  notes: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactInsert = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { syncBirthdayEvent, deleteBirthdayEvent } = useBirthdaySync();

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: '获取联系人失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contact: ContactInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contact, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: '联系人已添加' });
      
      // Auto-create birthday event if birthday is set
      if (data.birthday) {
        await syncBirthdayEvent(user.id, data.id, data.name, data.birthday);
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: '添加联系人失败',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateContact = async (id: string, updates: Partial<ContactInsert>) => {
    if (!user) return null;
    
    try {
      const oldContact = contacts.find(c => c.id === id);
      
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => prev.map(c => c.id === id ? data : c));
      toast({ title: '联系人已更新' });
      
      // Sync birthday event if birthday changed
      if (oldContact?.birthday !== data.birthday || oldContact?.name !== data.name) {
        await syncBirthdayEvent(user.id, data.id, data.name, data.birthday, oldContact?.birthday);
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: '更新联系人失败',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      // Delete associated birthday event first
      await deleteBirthdayEvent(id);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContacts(prev => prev.filter(c => c.id !== id));
      toast({ title: '联系人已删除' });
      return true;
    } catch (error: any) {
      toast({
        title: '删除联系人失败',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
};
