import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Events = () => {
  return (
    <AppLayout title="纪念日">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">记录重要的日子</p>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">还没有纪念日</p>
            <p className="text-sm text-muted-foreground">添加生日、纪念日等重要日期</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Events;
