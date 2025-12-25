import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Event, EventInsert } from '@/hooks/useEvents';
import { Contact } from '@/hooks/useContacts';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  contacts: Contact[];
  onSave: (data: EventInsert) => Promise<any>;
  defaultDate?: Date;
}

const EVENT_TYPES = [
  { value: 'birthday', label: '生日' },
  { value: 'anniversary', label: '纪念日' },
  { value: 'meeting', label: '会面' },
  { value: 'reminder', label: '提醒' },
  { value: 'other', label: '其他' },
];

const RECURRING_TYPES = [
  { value: 'weekly', label: '每周', icon: '📅' },
  { value: 'monthly', label: '每月', icon: '📆' },
  { value: 'yearly', label: '每年', icon: '🔄' },
];

export const EventDialog = ({ open, onOpenChange, event, contacts, onSave, defaultDate }: EventDialogProps) => {
  const [formData, setFormData] = useState<EventInsert>({
    contact_id: null,
    title: '',
    description: '',
    event_date: '',
    event_type: 'other',
    reminder_days: 7,
    is_recurring: false,
    recurring_type: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        contact_id: event.contact_id,
        title: event.title,
        description: event.description || '',
        event_date: event.event_date,
        event_type: event.event_type,
        reminder_days: event.reminder_days || 7,
        is_recurring: event.is_recurring || false,
        recurring_type: event.recurring_type,
      });
    } else {
      setFormData({
        contact_id: null,
        title: '',
        description: '',
        event_date: defaultDate ? defaultDate.toISOString().split('T')[0] : '',
        event_type: 'other',
        reminder_days: 7,
        is_recurring: false,
        recurring_type: null,
      });
    }
  }, [event, open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event_date) return;

    setSaving(true);
    const result = await onSave(formData);
    setSaving(false);

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? '编辑事件' : '添加事件'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="事件标题"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">日期 *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type">类型</Label>
              <Select 
                value={formData.event_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">关联联系人</Label>
            <Select 
              value={formData.contact_id || 'none'} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                contact_id: value === 'none' ? null : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择联系人（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不关联</SelectItem>
                {contacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="添加描述..."
              rows={2}
            />
          </div>

          <div className="space-y-3 py-2 border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">重复事件</Label>
              <Switch
                id="recurring"
                checked={formData.is_recurring || false}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_recurring: checked,
                  recurring_type: checked ? 'yearly' : null
                }))}
              />
            </div>
            
            {formData.is_recurring && (
              <div className="space-y-2">
                <Label>重复频率</Label>
                <div className="grid grid-cols-3 gap-2">
                  {RECURRING_TYPES.map(type => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={formData.recurring_type === type.value ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setFormData(prev => ({ ...prev, recurring_type: type.value }))}
                    >
                      <span className="mr-1">{type.icon}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">提前提醒天数</Label>
            <Select 
              value={String(formData.reminder_days || 7)} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, reminder_days: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1天</SelectItem>
                <SelectItem value="3">3天</SelectItem>
                <SelectItem value="7">7天</SelectItem>
                <SelectItem value="14">14天</SelectItem>
                <SelectItem value="30">30天</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" disabled={saving || !formData.title.trim() || !formData.event_date} className="flex-1">
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
