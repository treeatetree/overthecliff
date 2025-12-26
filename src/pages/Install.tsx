import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>已安装成功!</CardTitle>
            <CardDescription>
              应用已添加到您的主屏幕
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              开始使用
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 mb-4">
            <img src="/app-icon.png" alt="App Icon" className="w-full h-full rounded-2xl" />
          </div>
          <CardTitle>安装 OverTheCliff</CardTitle>
          <CardDescription>
            将应用添加到主屏幕，获得更好的体验
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  iOS 安装步骤
                </h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>点击浏览器底部的 <strong>分享</strong> 按钮</li>
                  <li>向下滚动并点击 <strong>"添加到主屏幕"</strong></li>
                  <li>点击右上角的 <strong>"添加"</strong></li>
                </ol>
              </div>
            </div>
          ) : deferredPrompt ? (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              安装应用
            </Button>
          ) : (
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                安装步骤
              </h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>点击浏览器菜单（通常是右上角的三个点）</li>
                <li>选择 <strong>"安装应用"</strong> 或 <strong>"添加到主屏幕"</strong></li>
              </ol>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">安装后的优势</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ 从主屏幕快速启动</li>
              <li>✓ 全屏体验，无浏览器地址栏</li>
              <li>✓ 离线访问已缓存的内容</li>
              <li>✓ 更快的加载速度</li>
            </ul>
          </div>

          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            暂不安装，继续使用
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
