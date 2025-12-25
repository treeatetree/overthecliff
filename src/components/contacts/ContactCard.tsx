import { Contact } from '@/hooks/useContacts';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Cake, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactCard = ({ contact, onEdit, onDelete }: ContactCardProps) => {
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const formatBirthday = (birthday: string | null) => {
    if (!birthday) return null;
    return format(new Date(birthday), 'M月d日');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={contact.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate">{contact.name}</h3>
                {contact.relationship && (
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(contact)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(contact.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 space-y-1">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.birthday && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cake className="h-3.5 w-3.5" />
                  {formatBirthday(contact.birthday)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
