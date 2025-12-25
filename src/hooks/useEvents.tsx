import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Event {
  id: string;
  user_id: string;
  contact_id: string | null;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  reminder_days: number | null;
  is_recurring: boolean | null;
  recurring_type: string | null;
  created_at: string;
  updated_at: string;
}

export type EventInsert = Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date');

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: '获取事件失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: EventInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setEvents(prev => [...prev, data].sort((a, b) => 
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      toast({ title: '事件已添加' });
      return data;
    } catch (error: any) {
      toast({
        title: '添加事件失败',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventInsert>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setEvents(prev => prev.map(e => e.id === id ? data : e));
      toast({ title: '事件已更新' });
      return data;
    } catch (error: any) {
      toast({
        title: '更新事件失败',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: '事件已删除' });
      return true;
    } catch (error: any) {
      toast({
        title: '删除事件失败',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
