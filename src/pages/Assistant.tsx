import { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Sparkles, Calendar, Gift, Heart, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { toast } = useToast();

  const quickActions = [
    { icon: Calendar, label: '分析今日日程', prompt: '请帮我分析今天的日程安排，给出时间管理建议' },
    { icon: Gift, label: '礼物推荐', prompt: '请根据我的联系人信息，为即将过生日的人推荐一些礼物创意' },
    { icon: Heart, label: '关系维护建议', prompt: '请分析我的联系人列表，告诉我最近应该重点关注哪些关系' },
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        contacts: contacts || [],
        events: events || [],
      }),
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.error || '请求失败');
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: '发送失败',
        description: error instanceof Error ? error.message : '请稍后再试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <AppLayout title="AI 助手">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <>
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
                          我可以分析你的联系人和日程，提供个性化的社交建议
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">快捷功能</h3>
                  {quickActions.map((action, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleQuickAction(action.prompt)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <action.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <p className="font-medium text-foreground">{action.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息，与 AI 对话..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assistant;
