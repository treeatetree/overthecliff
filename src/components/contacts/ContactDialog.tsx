import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Contact, ContactInsert } from '@/hooks/useContacts';
import { RELATIONSHIP_GROUPS } from '@/lib/contactGroups';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSave: (data: ContactInsert) => Promise<any>;
}

export const ContactDialog = ({ open, onOpenChange, contact, onSave }: ContactDialogProps) => {
  const [formData, setFormData] = useState<ContactInsert>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    birthday: '',
    notes: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        relationship: contact.relationship || '',
        phone: contact.phone || '',
        email: contact.email || '',
        birthday: contact.birthday || '',
        notes: contact.notes || '',
        avatar_url: contact.avatar_url || '',
      });
    } else {
      setFormData({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        birthday: '',
        notes: '',
        avatar_url: '',
      });
    }
  }, [contact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    const result = await onSave({
      ...formData,
      birthday: formData.birthday || null,
    });
    setSaving(false);

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? '编辑联系人' : '添加联系人'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">分组</Label>
            <Select
              value={formData.relationship || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="选择分组" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_GROUPS.map(group => (
                  <SelectItem key={group.value} value={group.value}>
                    <span className="flex items-center gap-2">
                      <span>{group.icon}</span>
                      <span>{group.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">电话</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="电话号码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">生日</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="电子邮箱"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="添加一些备注..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" disabled={saving || !formData.name.trim()} className="flex-1">
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
