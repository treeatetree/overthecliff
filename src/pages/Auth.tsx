import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Heart, Users } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('请输入有效的邮箱地址');
const passwordSchema = z.string().min(6, '密码至少需要6个字符');

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateInputs = (isSignUp: boolean) => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: '输入错误',
          description: error.errors[0].message,
          variant: 'destructive'
        });
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(false)) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: '登录失败',
        description: error.message === 'Invalid login credentials' 
          ? '邮箱或密码错误' 
          : error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(true)) return;
    
    setIsLoading(true);
    const { error } = await signUp(email, password, nickname);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = '该邮箱已被注册';
      }
      toast({
        title: '注册失败',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: '注册成功',
        description: '欢迎使用日程助手！'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">日程助手</h1>
        </div>
        <p className="text-muted-foreground max-w-md">
          智能管理你的日程、维护重要关系、让 AI 帮你记住每一个重要时刻
        </p>
      </div>

      {/* Features */}
      <div className="flex gap-6 mb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>智能日程</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>关系管理</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>生日提醒</span>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>开始使用</CardTitle>
          <CardDescription>登录或创建账户</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">邮箱</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">密码</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nickname">昵称</Label>
                  <Input
                    id="signup-nickname"
                    type="text"
                    placeholder="你的昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">邮箱</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="至少6个字符"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '注册中...' : '创建账户'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
