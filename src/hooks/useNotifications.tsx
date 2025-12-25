import { useEffect, useCallback, useState } from 'react';
import { useEvents, Event } from './useEvents';
import { useContacts } from './useContacts';
import { useToast } from './use-toast';
import { differenceInDays, parseISO, format, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';

// Calculate next occurrence for recurring events
const getNextOccurrence = (event: Event, today: Date): Date => {
  const eventDate = parseISO(event.event_date);
  
  if (!event.is_recurring || !event.recurring_type) {
    return eventDate;
  }

  let nextDate = new Date(eventDate);
  
  // Find the next occurrence that is on or after today
  while (isBefore(nextDate, today)) {
    switch (event.recurring_type) {
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
      default:
        return eventDate;
    }
  }
  
  return nextDate;
};

export interface EventWithNextDate extends Event {
  nextOccurrence: Date;
}

export const useNotifications = () => {
  const { events } = useEvents();
  const { contacts } = useContacts();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [upcomingReminders, setUpcomingReminders] = useState<EventWithNextDate[]>([]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: '浏览器不支持通知',
        description: '您的浏览器不支持桌面通知功能',
        variant: 'destructive',
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast({ title: '通知权限已开启' });
      return true;
    } else if (result === 'denied') {
      toast({
        title: '通知权限被拒绝',
        description: '请在浏览器设置中允许通知',
        variant: 'destructive',
      });
      return false;
    }
    return false;
  }, [toast]);

  // Send browser notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }, [permission]);

  // Get contact name by ID
  const getContactName = useCallback((contactId: string | null) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || null;
  }, [contacts]);

  // Check for upcoming events and generate reminders
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders = events
      .map(event => {
        const nextOccurrence = getNextOccurrence(event, today);
        return { ...event, nextOccurrence };
      })
      .filter(event => {
        const daysUntil = differenceInDays(event.nextOccurrence, today);
        const reminderDays = event.reminder_days ?? 7;
        
        // Include events that are within reminder period (including today)
        return daysUntil >= 0 && daysUntil <= reminderDays;
      })
      .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime());

    setUpcomingReminders(reminders);
  }, [events]);

  // Show in-app reminder toast
  const showInAppReminder = useCallback((event: EventWithNextDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntil = differenceInDays(event.nextOccurrence, today);
    const contactName = getContactName(event.contact_id);
    
    let timeText = '';
    if (daysUntil === 0) {
      timeText = '今天';
    } else if (daysUntil === 1) {
      timeText = '明天';
    } else {
      timeText = `${daysUntil}天后`;
    }

    const recurringText = event.is_recurring 
      ? ` (${event.recurring_type === 'weekly' ? '每周' : event.recurring_type === 'monthly' ? '每月' : '每年'})`
      : '';

    const description = contactName 
      ? `${timeText} - ${format(event.nextOccurrence, 'MM月dd日')}${recurringText} - ${contactName}`
      : `${timeText} - ${format(event.nextOccurrence, 'MM月dd日')}${recurringText}`;

    toast({
      title: `📅 ${event.title}`,
      description,
    });
  }, [getContactName, toast]);

  // Show browser notification for event
  const showBrowserNotification = useCallback((event: EventWithNextDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntil = differenceInDays(event.nextOccurrence, today);
    const contactName = getContactName(event.contact_id);
    
    let timeText = '';
    if (daysUntil === 0) {
      timeText = '今天';
    } else if (daysUntil === 1) {
      timeText = '明天';
    } else {
      timeText = `${daysUntil}天后`;
    }

    const recurringText = event.is_recurring 
      ? ` [${event.recurring_type === 'weekly' ? '每周' : event.recurring_type === 'monthly' ? '每月' : '每年'}]`
      : '';

    const body = contactName 
      ? `${timeText} (${format(event.nextOccurrence, 'MM月dd日')})${recurringText} - ${contactName}`
      : `${timeText} (${format(event.nextOccurrence, 'MM月dd日')})${recurringText}`;

    sendNotification(event.title, body);
  }, [getContactName, sendNotification]);

  // Check and show all upcoming reminders
  const checkReminders = useCallback(() => {
    upcomingReminders.forEach(event => {
      showInAppReminder(event);
      if (permission === 'granted') {
        showBrowserNotification(event);
      }
    });
  }, [upcomingReminders, permission, showInAppReminder, showBrowserNotification]);

  return {
    permission,
    requestPermission,
    upcomingReminders,
    checkReminders,
    showInAppReminder,
    showBrowserNotification,
    sendNotification,
  };
};
