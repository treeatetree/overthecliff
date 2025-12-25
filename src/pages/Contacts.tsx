import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useContacts, Contact } from '@/hooks/useContacts';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RELATIONSHIP_GROUPS, getGroupLabel, getGroupIcon } from '@/lib/contactGroups';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Contacts = () => {
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Group contacts by relationship
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    
    contacts.forEach(contact => {
      const group = contact.relationship || 'ungrouped';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(contact);
    });

    // Sort groups by predefined order
    const orderedGroups: Record<string, Contact[]> = {};
    RELATIONSHIP_GROUPS.forEach(g => {
      if (groups[g.value]) {
        orderedGroups[g.value] = groups[g.value];
      }
    });
    // Add ungrouped last
    if (groups['ungrouped']) {
      orderedGroups['ungrouped'] = groups['ungrouped'];
    }
    // Add any custom groups
    Object.keys(groups).forEach(key => {
      if (!orderedGroups[key]) {
        orderedGroups[key] = groups[key];
      }
    });

    return orderedGroups;
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.relationship?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected group
    if (selectedGroup) {
      if (selectedGroup === 'ungrouped') {
        filtered = filtered.filter(contact => !contact.relationship);
      } else {
        filtered = filtered.filter(contact => contact.relationship === selectedGroup);
      }
    }

    return filtered;
  }, [contacts, searchQuery, selectedGroup]);

  // Get filtered grouped contacts
  const filteredGroupedContacts = useMemo(() => {
    if (selectedGroup) {
      return { [selectedGroup]: filteredContacts };
    }

    const groups: Record<string, Contact[]> = {};
    filteredContacts.forEach(contact => {
      const group = contact.relationship || 'ungrouped';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(contact);
    });

    // Sort groups by predefined order
    const orderedGroups: Record<string, Contact[]> = {};
    RELATIONSHIP_GROUPS.forEach(g => {
      if (groups[g.value]) {
        orderedGroups[g.value] = groups[g.value];
      }
    });
    if (groups['ungrouped']) {
      orderedGroups['ungrouped'] = groups['ungrouped'];
    }
    Object.keys(groups).forEach(key => {
      if (!orderedGroups[key]) {
        orderedGroups[key] = groups[key];
      }
    });

    return orderedGroups;
  }, [filteredContacts, selectedGroup]);

  // Get group stats
  const groupStats = useMemo(() => {
    const stats: Record<string, number> = { all: contacts.length };
    Object.entries(groupedContacts).forEach(([key, list]) => {
      stats[key] = list.length;
    });
    return stats;
  }, [contacts, groupedContacts]);

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingContact) {
      return updateContact(editingContact.id, data);
    }
    return addContact(data);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteContact(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <AppLayout title="联系人">
      <div className="p-4 space-y-4">
        {/* Search and Add */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索联系人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedGroup ? 'secondary' : 'outline'} size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedGroup(null)}>
                <span className="flex items-center gap-2">
                  <span>📋</span>
                  <span>全部</span>
                  <Badge variant="secondary" className="ml-auto">{groupStats.all}</Badge>
                </span>
              </DropdownMenuItem>
              {RELATIONSHIP_GROUPS.map(group => (
                <DropdownMenuItem
                  key={group.value}
                  onClick={() => setSelectedGroup(group.value)}
                >
                  <span className="flex items-center gap-2 w-full">
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                    {groupStats[group.value] && (
                      <Badge variant="secondary" className="ml-auto">{groupStats[group.value]}</Badge>
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
              {groupStats['ungrouped'] && (
                <DropdownMenuItem onClick={() => setSelectedGroup('ungrouped')}>
                  <span className="flex items-center gap-2 w-full">
                    <span>📌</span>
                    <span>未分组</span>
                    <Badge variant="secondary" className="ml-auto">{groupStats['ungrouped']}</Badge>
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="icon" onClick={() => { setEditingContact(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected filter badge */}
        {selectedGroup && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <span>{getGroupIcon(selectedGroup)}</span>
              <span>{getGroupLabel(selectedGroup)}</span>
              <button
                onClick={() => setSelectedGroup(null)}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          </div>
        )}

        {/* Contact list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedGroup ? '没有找到匹配的联系人' : '还没有联系人'}
              </p>
              {!searchQuery && !selectedGroup && (
                <p className="text-sm text-muted-foreground">点击右上角添加你的第一个联系人</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredGroupedContacts).map(([group, groupContacts]) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getGroupIcon(group)}</span>
                  <h3 className="font-medium text-foreground">{getGroupLabel(group)}</h3>
                  <Badge variant="outline" className="text-xs">{groupContacts.length}</Badge>
                </div>
                <div className="space-y-3">
                  {groupContacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={editingContact}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个联系人吗？此操作无法撤销。
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

export default Contacts;
