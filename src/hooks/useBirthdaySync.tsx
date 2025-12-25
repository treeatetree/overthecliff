import { supabase } from '@/integrations/supabase/client';

export const syncBirthdayEvent = async (
  userId: string,
  contactId: string,
  contactName: string,
  birthday: string | null,
  oldBirthday?: string | null
): Promise<boolean> => {
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
        return true; // New event created
      }
    } else if (!birthday && existingEvents) {
      // Remove birthday event if birthday is cleared
      await supabase
        .from('events')
        .delete()
        .eq('id', existingEvents.id);
    }
    return false;
  } catch (error: any) {
    console.error('Error syncing birthday event:', error);
    return false;
  }
};

export const deleteBirthdayEvent = async (contactId: string) => {
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
