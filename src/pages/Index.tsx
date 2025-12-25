import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Gift, Bell, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  // Mock data for now
  const todayEvents = [
    { id: 1, title: '团队周会', time: '10:00', type: 'meeting' },
    { id: 2, title: '午餐约会 - 小明', time: '12:30', type: 'social' },
  ];

  const upcomingBirthdays = [
    { id: 1, name: '妈妈', days: 3 },
    { id: 2, name: '小红', days: 7 },
  ];

  return (
    <AppLayout title="今天">
      <div className="p-4 space-y-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">你好！</h2>
            <p className="text-muted-foreground">今天是美好的一天</p>
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
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
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
            {upcomingBirthdays.map((birthday) => (
              <div
                key={birthday.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{birthday.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {birthday.days}天后
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">提醒</p>
                <p className="text-xs text-muted-foreground">2个待处理</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">AI 建议</p>
                <p className="text-xs text-muted-foreground">查看分析</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
