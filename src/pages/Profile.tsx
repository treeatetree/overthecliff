import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Settings, Bell, Moon, LogOut, Camera, Loader2, Pencil } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateNickname, uploadAvatar } = useProfile();
  const [nicknameInput, setNicknameInput] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = profile?.nickname || '用户';
  const avatarUrl = profile?.avatar_url;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) return;
    
    setIsSaving(true);
    try {
      await updateNickname(nicknameInput.trim());
      setIsEditingNickname(false);
    } finally {
      setIsSaving(false);
    }
  };

  const openNicknameDialog = () => {
    setNicknameInput(profile?.nickname || '');
    setIsEditingNickname(true);
  };

  const menuItems = [
    { icon: Bell, label: '通知设置', description: '管理提醒方式' },
    { icon: Moon, label: '主题设置', description: '深色/浅色模式' },
    { icon: Settings, label: '偏好设置', description: '语言、时区等' },
  ];

  return (
    <AppLayout title="我的">
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name and Email */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <p className="font-semibold text-foreground text-xl">{displayName}</p>
                  <Dialog open={isEditingNickname} onOpenChange={setIsEditingNickname}>
                    <DialogTrigger asChild>
                      <button
                        onClick={openNicknameDialog}
                        className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>修改昵称</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="nickname">昵称</Label>
                          <Input
                            id="nickname"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            placeholder="请输入昵称"
                            maxLength={20}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingNickname(false)}
                          >
                            取消
                          </Button>
                          <Button
                            onClick={handleSaveNickname}
                            disabled={isSaving || !nicknameInput.trim()}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            保存
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
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
