import { useEffect, useCallback, useState } from 'react';
import { useEvents, Event } from './useEvents';
import { useContacts } from './useContacts';
import { useToast } from './use-toast';
import { differenceInDays, parseISO, format } from 'date-fns';

export const useNotifications = () => {
  const { events } = useEvents();
  const { contacts } = useContacts();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [upcomingReminders, setUpcomingReminders] = useState<Event[]>([]);

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

    const reminders = events.filter(event => {
      const eventDate = parseISO(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const daysUntil = differenceInDays(eventDate, today);
      const reminderDays = event.reminder_days ?? 7;
      
      // Include events that are within reminder period (including today)
      return daysUntil >= 0 && daysUntil <= reminderDays;
    }).sort((a, b) => 
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    setUpcomingReminders(reminders);
  }, [events]);

  // Show in-app reminder toast
  const showInAppReminder = useCallback((event: Event) => {
    const eventDate = parseISO(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const daysUntil = differenceInDays(eventDate, today);
    const contactName = getContactName(event.contact_id);
    
    let timeText = '';
    if (daysUntil === 0) {
      timeText = '今天';
    } else if (daysUntil === 1) {
      timeText = '明天';
    } else {
      timeText = `${daysUntil}天后`;
    }

    const description = contactName 
      ? `${timeText} - ${format(eventDate, 'MM月dd日')} - ${contactName}`
      : `${timeText} - ${format(eventDate, 'MM月dd日')}`;

    toast({
      title: `📅 ${event.title}`,
      description,
    });
  }, [getContactName, toast]);

  // Show browser notification for event
  const showBrowserNotification = useCallback((event: Event) => {
    const eventDate = parseISO(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const daysUntil = differenceInDays(eventDate, today);
    const contactName = getContactName(event.contact_id);
    
    let timeText = '';
    if (daysUntil === 0) {
      timeText = '今天';
    } else if (daysUntil === 1) {
      timeText = '明天';
    } else {
      timeText = `${daysUntil}天后`;
    }

    const body = contactName 
      ? `${timeText} (${format(eventDate, 'MM月dd日')}) - 关联: ${contactName}`
      : `${timeText} (${format(eventDate, 'MM月dd日')})`;

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
