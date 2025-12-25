import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useContacts, ContactInsert } from '@/hooks/useContacts';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Gift, Bell, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays, parseISO, isSameDay, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { QuickActionButton } from '@/components/quick-actions/QuickActionButton';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { EventDialog } from '@/components/events/EventDialog';
import { EventInsert } from '@/hooks/useEvents';

const Index = () => {
  const { user, loading } = useAuth();
  const { events, loading: eventsLoading, addEvent } = useEvents();
  const { contacts, loading: contactsLoading, addContact } = useContacts();
  const navigate = useNavigate();
  
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const todayEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => isSameDay(parseISO(event.event_date), today));
  }, [events]);

  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = addDays(today, 30);
    
    return contacts
      .filter(contact => {
        if (!contact.birthday) return false;
        const birthday = parseISO(contact.birthday);
        // Get this year's birthday
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        // If already passed, check next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        return thisYearBirthday <= nextWeek;
      })
      .map(contact => {
        const birthday = parseISO(contact.birthday!);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        return {
          ...contact,
          daysUntil: differenceInDays(thisYearBirthday, today),
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [contacts]);

  const handleSaveContact = async (data: ContactInsert) => {
    return addContact(data);
  };

  const handleSaveEvent = async (data: EventInsert) => {
    return addEvent(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isDataLoading = eventsLoading || contactsLoading;

  return (
    <AppLayout title="今天">
      <div className="p-4 space-y-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">你好！</h2>
            <p className="text-muted-foreground">
              {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              今日日程
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isDataLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate('/events')}
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.event_type === 'birthday' ? '生日' : 
                       event.event_type === 'anniversary' ? '纪念日' : 
                       event.event_type === 'meeting' ? '会面' : '事件'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                今天没有日程安排
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4" />
              即将到来的生日
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isDataLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : upcomingBirthdays.length > 0 ? (
              upcomingBirthdays.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => navigate('/contacts')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{contact.name}</span>
                      {contact.relationship && (
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm ${contact.daysUntil <= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {contact.daysUntil === 0 ? '今天' : `${contact.daysUntil}天后`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                暂无即将到来的生日
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/events')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">事件</p>
                <p className="text-xs text-muted-foreground">{events.length}个</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/assistant')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">AI 助手</p>
                <p className="text-xs text-muted-foreground">获取建议</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action FAB */}
      <QuickActionButton
        onAddContact={() => setContactDialogOpen(true)}
        onAddEvent={() => setEventDialogOpen(true)}
      />

      {/* Dialogs */}
      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSave={handleSaveContact}
      />

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        contacts={contacts}
        onSave={handleSaveEvent}
        defaultDate={new Date()}
      />
    </AppLayout>
  );
};

export default Index;
