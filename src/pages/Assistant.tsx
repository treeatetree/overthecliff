import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Assistant = () => {
  const quickActions = [
    { icon: Calendar, label: '分析今日日程', description: '获取时间优化建议' },
    { icon: TrendingUp, label: '本周总结', description: '查看时间分配报告' },
    { icon: Sparkles, label: '礼物建议', description: '为即将到来的生日推荐礼物' },
  ];

  return (
    <AppLayout title="AI 助手">
      <div className="p-4 space-y-4">
        {/* AI Welcome */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">你好！我是你的 AI 助手</p>
                <p className="text-sm text-muted-foreground mt-1">
                  我可以帮你分析日程、提供建议、记住重要事项
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">快捷功能</h3>
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <action.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Input Placeholder */}
        <Card className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-2 text-muted-foreground">
                输入消息，与 AI 对话...
              </div>
              <Button size="icon" variant="default">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Assistant;
