import { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {title ? (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          ) : (
            <div />
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-lg mx-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
