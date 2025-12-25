import { useState } from 'react';
import { Plus, UserPlus, CalendarPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  onAddContact: () => void;
  onAddEvent: () => void;
}

export const QuickActionButton = ({ onAddContact, onAddEvent }: QuickActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col-reverse items-end gap-3">
      {/* Sub-actions */}
      <div className={cn(
        "flex flex-col-reverse gap-2 transition-all duration-200",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <Button
          size="lg"
          className="rounded-full h-12 w-12 shadow-lg"
          variant="secondary"
          onClick={() => handleAction(onAddContact)}
        >
          <UserPlus className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          className="rounded-full h-12 w-12 shadow-lg"
          variant="secondary"
          onClick={() => handleAction(onAddEvent)}
        >
          <CalendarPlus className="h-5 w-5" />
        </Button>
      </div>

      {/* Labels */}
      <div className={cn(
        "absolute right-16 bottom-0 flex flex-col-reverse gap-2 transition-all duration-200",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <span className="h-12 flex items-center text-sm font-medium text-foreground bg-background/90 px-3 rounded-lg shadow border">
          添加联系人
        </span>
        <span className="h-12 flex items-center text-sm font-medium text-foreground bg-background/90 px-3 rounded-lg shadow border">
          添加事件
        </span>
      </div>

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "rounded-full h-14 w-14 shadow-lg transition-transform duration-200",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};
