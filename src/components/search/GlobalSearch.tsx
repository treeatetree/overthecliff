import { useState, useMemo, useEffect } from 'react';
import { Search, User, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useEvents, Event } from '@/hooks/useEvents';
import { getGroupLabel, getGroupIcon } from '@/lib/contactGroups';
import { format, parseISO } from 'date-fns';

interface SearchResult {
  type: 'contact' | 'event';
  item: Contact | Event;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { contacts } = useContacts();
  const { events } = useEvents();
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const matchedContacts: SearchResult[] = contacts
      .filter(contact => 
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.relationship?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.phone?.includes(searchTerm) ||
        contact.notes?.toLowerCase().includes(searchTerm)
      )
      .map(contact => ({ type: 'contact' as const, item: contact }));

    const matchedEvents: SearchResult[] = events
      .filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.event_type.toLowerCase().includes(searchTerm)
      )
      .map(event => ({ type: 'event' as const, item: event }));

    return [...matchedContacts, ...matchedEvents];
  }, [query, contacts, events]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    if (result.type === 'contact') {
      navigate('/contacts');
    } else {
      navigate('/events');
    }
  };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    return contacts.find(c => c.id === contactId)?.name || null;
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">搜索...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">全局搜索</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索联系人和事件..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-9"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] p-4 pt-2">
            {!query.trim() ? (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>输入关键词搜索联系人和事件</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>没有找到匹配的结果</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Contact Results */}
                {results.filter(r => r.type === 'contact').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">联系人</span>
                    </div>
                    <div className="space-y-1">
                      {results
                        .filter(r => r.type === 'contact')
                        .map(result => {
                          const contact = result.item as Contact;
                          return (
                            <button
                              key={contact.id}
                              className="w-full p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left flex items-center gap-3"
                              onClick={() => handleSelect(result)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={contact.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {contact.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{contact.name}</p>
                                {contact.relationship && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <span>{getGroupIcon(contact.relationship)}</span>
                                    <span>{getGroupLabel(contact.relationship)}</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Event Results */}
                {results.filter(r => r.type === 'event').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">事件</span>
                    </div>
                    <div className="space-y-1">
                      {results
                        .filter(r => r.type === 'event')
                        .map(result => {
                          const event = result.item as Event;
                          const contactName = getContactName(event.contact_id);
                          return (
                            <button
                              key={event.id}
                              className="w-full p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                              onClick={() => handleSelect(result)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{event.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(parseISO(event.event_date), 'yyyy年M月d日')}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  {event.event_type === 'birthday' ? '生日' :
                                   event.event_type === 'anniversary' ? '纪念日' :
                                   event.event_type === 'meeting' ? '会面' :
                                   event.event_type === 'reminder' ? '提醒' : '其他'}
                                </Badge>
                              </div>
                              {contactName && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  关联: {contactName}
                                </p>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t text-xs text-muted-foreground flex items-center justify-between">
            <span>共 {results.length} 个结果</span>
            <span>按 ESC 关闭</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
