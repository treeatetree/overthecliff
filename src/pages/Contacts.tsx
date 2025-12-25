import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contacts = () => {
  return (
    <AppLayout title="联系人">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">管理你的重要关系</p>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">还没有联系人</p>
            <p className="text-sm text-muted-foreground">点击右上角添加你的第一个联系人</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Contacts;
