import { Event } from '@/hooks/useEvents';
import { Contact } from '@/hooks/useContacts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cake, Calendar, Heart, Bell, MoreVertical, Pencil, Trash2, User, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  contact?: Contact;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

const eventTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  birthday: { icon: Cake, color: 'text-pink-500', label: '生日' },
  anniversary: { icon: Heart, color: 'text-red-500', label: '纪念日' },
  meeting: { icon: Calendar, color: 'text-blue-500', label: '会面' },
  reminder: { icon: Bell, color: 'text-yellow-500', label: '提醒' },
  other: { icon: Calendar, color: 'text-muted-foreground', label: '其他' },
};

export const EventCard = ({ event, contact, onEdit, onDelete }: EventCardProps) => {
  const config = eventTypeConfig[event.event_type] || eventTypeConfig.other;
  const Icon = config.icon;
  
  const eventDate = parseISO(event.event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = differenceInDays(eventDate, today);

  const getDaysText = () => {
    if (daysUntil === 0) return '今天';
    if (daysUntil === 1) return '明天';
    if (daysUntil === -1) return '昨天';
    if (daysUntil > 0) return `${daysUntil}天后`;
    return `${Math.abs(daysUntil)}天前`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full bg-muted ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(eventDate, 'yyyy年M月d日', { locale: zhCN })}
                  <span className={`ml-2 ${daysUntil <= 7 && daysUntil >= 0 ? 'text-primary font-medium' : ''}`}>
                    ({getDaysText()})
                  </span>
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(event)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(event.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-muted">
                {config.label}
              </span>
              {event.is_recurring && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted">
                  <RefreshCw className="h-3 w-3" />
                  每年重复
                </span>
              )}
              {contact && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted">
                  <User className="h-3 w-3" />
                  {contact.name}
                </span>
              )}
            </div>

            {event.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
