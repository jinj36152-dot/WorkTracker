'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { WorkRecordForm } from './components/WorkRecordForm';
import { WorkRecordTable } from './components/WorkRecordTable';
import { WeeklySummary } from './components/WeeklySummary';
import { MonthlySummary } from './components/MonthlySummary';
import { CalendarView } from './components/CalendarView';
import { useWorkRecords } from './hooks/useWorkRecords';
import { Briefcase, Moon, Sun, Cloud, CloudOff } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

export default function Home() {
  const { records, isLoading, isSyncing, addRecord, updateRecord, deleteRecord } = useWorkRecords();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // GitHub 연동 여부 확인
  const isGitHubConnected = !!(
    process.env.NEXT_PUBLIC_GITHUB_OWNER &&
    process.env.NEXT_PUBLIC_GITHUB_REPO &&
    process.env.NEXT_PUBLIC_GITHUB_TOKEN
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Toaster />
      
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="size-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Briefcase className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                WorkTracker
              </h1>
              <p className="text-sm text-muted-foreground">개인용 근태 관리 시스템</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 동기화 상태 */}
            {isSyncing && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-primary/20 bg-primary/5">
                <Cloud className="size-3.5 animate-pulse text-primary" />
                <span className="font-medium">동기화 중...</span>
              </Badge>
            )}
            
            {isGitHubConnected && !isSyncing && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-green-500/20 bg-green-500/5">
                <Cloud className="size-3.5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">GitHub 연동</span>
              </Badge>
            )}
            
            {!isGitHubConnected && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <CloudOff className="size-3.5" />
                <span className="font-medium">로컬 저장</span>
              </Badge>
            )}

            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-lg hover:bg-accent transition-all hover:scale-105"
            >
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* 입력 폼 */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <WorkRecordForm onSubmit={addRecord} />
          </div>

          {/* 탭 네비게이션 */}
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 rounded-xl p-1">
              <TabsTrigger 
                value="table" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                근무 기록
              </TabsTrigger>
              <TabsTrigger 
                value="weekly"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                주간 요약
              </TabsTrigger>
              <TabsTrigger 
                value="monthly"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                월별 요약
              </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                캘린더
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-6 mt-6 animate-in fade-in duration-300">
              <WorkRecordTable
                records={records}
                onUpdate={updateRecord}
                onDelete={deleteRecord}
              />
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6 mt-6 animate-in fade-in duration-300">
              <WeeklySummary records={records} />
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6 mt-6 animate-in fade-in duration-300">
              <MonthlySummary records={records} />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6 mt-6 animate-in fade-in duration-300">
              <CalendarView records={records} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t mt-16 bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            © 2025 WorkTracker. 개인용 근태 관리 앱
          </p>
          <p className="text-xs text-muted-foreground/70">
            {isGitHubConnected 
              ? '🔒 GitHub에 안전하게 저장됩니다' 
              : '💾 현재 로컬 스토리지에 저장됩니다'}
          </p>
        </div>
      </footer>
    </div>
  );
}

