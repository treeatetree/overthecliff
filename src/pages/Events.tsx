import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents, Event } from '@/hooks/useEvents';
import { useContacts } from '@/hooks/useContacts';
import { EventCard } from '@/components/events/EventCard';
import { EventDialog } from '@/components/events/EventDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Events = () => {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useEvents();
  const { contacts } = useContacts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const eventDates = useMemo(() => {
    return events.map(e => parseISO(e.event_date));
  }, [events]);

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(event => isSameDay(parseISO(event.event_date), selectedDate));
  }, [events, selectedDate]);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingEvent) {
      return updateEvent(editingEvent.id, data);
    }
    return addEvent(data);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      setDeleteId(null);
    }
  };

  const getContactById = (id: string | null) => {
    if (!id) return undefined;
    return contacts.find(c => c.id === id);
  };

  return (
    <AppLayout title="日历">
      <div className="p-4 space-y-4">
        {/* Calendar */}
        <Card>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={zhCN}
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--primary))',
                  textUnderlineOffset: '4px',
                },
              }}
              className="w-full pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* Events List Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              {selectedDate 
                ? format(selectedDate, 'M月d日', { locale: zhCN })
                : '本月事件'
              }
            </h2>
            <p className="text-sm text-muted-foreground">
              {eventsForSelectedDate.length} 个事件
            </p>
          </div>
          <Button size="sm" onClick={handleAddNew} className="gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : eventsForSelectedDate.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {selectedDate ? '这一天没有事件' : '还没有添加事件'}
              </p>
              <Button variant="link" onClick={handleAddNew} className="mt-2">
                添加第一个事件
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {eventsForSelectedDate.map(event => (
              <EventCard
                key={event.id}
                event={event}
                contact={getContactById(event.contact_id)}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        contacts={contacts}
        onSave={handleSave}
        defaultDate={selectedDate}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个事件吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Events;
