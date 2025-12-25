import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useBirthdaySync = () => {
  const { toast } = useToast();

  const syncBirthdayEvent = async (
    userId: string,
    contactId: string,
    contactName: string,
    birthday: string | null,
    oldBirthday?: string | null
  ) => {
    try {
      // Check if birthday event already exists for this contact
      const { data: existingEvents } = await supabase
        .from('events')
        .select('*')
        .eq('contact_id', contactId)
        .eq('event_type', 'birthday')
        .maybeSingle();

      if (birthday) {
        // Create or update birthday event
        const eventData = {
          title: `${contactName}的生日`,
          event_date: birthday,
          event_type: 'birthday',
          is_recurring: true,
          recurring_type: 'yearly',
          reminder_days: 7,
          contact_id: contactId,
          description: `${contactName}的生日提醒`,
        };

        if (existingEvents) {
          // Update existing event
          await supabase
            .from('events')
            .update(eventData)
            .eq('id', existingEvents.id);
        } else {
          // Create new event
          await supabase
            .from('events')
            .insert({ ...eventData, user_id: userId });
          
          toast({ title: `已为${contactName}创建生日提醒` });
        }
      } else if (!birthday && existingEvents) {
        // Remove birthday event if birthday is cleared
        await supabase
          .from('events')
          .delete()
          .eq('id', existingEvents.id);
      }
    } catch (error: any) {
      console.error('Error syncing birthday event:', error);
    }
  };

  const deleteBirthdayEvent = async (contactId: string) => {
    try {
      await supabase
        .from('events')
        .delete()
        .eq('contact_id', contactId)
        .eq('event_type', 'birthday');
    } catch (error: any) {
      console.error('Error deleting birthday event:', error);
    }
  };

  return { syncBirthdayEvent, deleteBirthdayEvent };
};
