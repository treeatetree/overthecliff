import { useState } from 'react';
import { Bell, BellRing, Calendar, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications, EventWithNextDate } from '@/hooks/useNotifications';
import { useContacts } from '@/hooks/useContacts';
import { format, differenceInDays } from 'date-fns';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { permission, requestPermission, upcomingReminders } = useNotifications();
  const { contacts } = useContacts();

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    return contacts.find(c => c.id === contactId)?.name || null;
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    return differenceInDays(eventDate, today);
  };

  const getTimeLabel = (daysUntil: number) => {
    if (daysUntil === 0) return '今天';
    if (daysUntil === 1) return '明天';
    return `${daysUntil}天后`;
  };

  const getRecurringLabel = (event: EventWithNextDate) => {
    if (!event.is_recurring) return null;
    switch (event.recurring_type) {
      case 'weekly': return '每周';
      case 'monthly': return '每月';
      case 'yearly': return '每年';
      default: return null;
    }
  };

  const hasReminders = upcomingReminders.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasReminders ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasReminders && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {upcomingReminders.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">事件提醒</h4>
            {permission !== 'granted' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestPermission}
              >
                开启通知
              </Button>
            )}
          </div>
          {permission === 'granted' && (
            <p className="text-xs text-muted-foreground mt-1">
              桌面通知已开启
            </p>
          )}
        </div>
        
        <ScrollArea className="max-h-[300px]">
          {hasReminders ? (
            <div className="p-2 space-y-2">
              {upcomingReminders.map(event => {
                const daysUntil = getDaysUntil(event.nextOccurrence);
                const contactName = getContactName(event.contact_id);
                const isToday = daysUntil === 0;
                const isTomorrow = daysUntil === 1;
                const recurringLabel = getRecurringLabel(event);

                return (
                  <div 
                    key={event.id}
                    className={`p-3 rounded-lg border ${
                      isToday 
                        ? 'bg-destructive/10 border-destructive/20' 
                        : isTomorrow 
                          ? 'bg-warning/10 border-warning/20' 
                          : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(event.nextOccurrence, 'MM月dd日')}</span>
                        </div>
                        {contactName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <User className="h-3 w-3" />
                            <span>{contactName}</span>
                          </div>
                        )}
                        {recurringLabel && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <RefreshCw className="h-3 w-3" />
                            <span>{recurringLabel}重复</span>
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant={isToday ? 'destructive' : isTomorrow ? 'secondary' : 'outline'}
                        className="shrink-0"
                      >
                        {getTimeLabel(daysUntil)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无即将到来的事件</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
