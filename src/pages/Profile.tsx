import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, Bell, Moon, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: User, label: '个人信息', description: '修改昵称、头像' },
    { icon: Bell, label: '通知设置', description: '管理提醒方式' },
    { icon: Moon, label: '主题设置', description: '深色/浅色模式' },
    { icon: Settings, label: '偏好设置', description: '语言、时区等' },
  ];

  return (
    <AppLayout title="我的">
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">用户</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
