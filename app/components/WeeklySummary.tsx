import { useMemo, useState } from 'react';
import { WorkRecord } from '../types/work-record';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Download } from 'lucide-react';
import { getWeekStart } from '../utils/work-calculations';
import { calculateEmployeeSummaries, formatDateRange } from '../utils/summary-calculations';
import { calculateEmployeeWorkPeriods, exportToExcel } from '../utils/excel-export';
import { toast } from 'sonner';
import { EmployeeSummaryCard } from './EmployeeSummaryCard';

interface WeeklySummaryProps {
  records: WorkRecord[];
}

export function WeeklySummary({ records }: WeeklySummaryProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const { weekStart, weekEnd, summaries } = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + currentWeekOffset * 7);
    const weekStart = getWeekStart(today);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    const summaries = calculateEmployeeSummaries(records, startStr, endStr);

    return { weekStart: startStr, weekEnd: endStr, summaries };
  }, [records, currentWeekOffset]);

  const goToPreviousWeek = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  const totalHours = summaries.reduce((sum, s) => sum + s.totalHours, 0);
  const totalPay = summaries.reduce((sum, s) => sum + s.totalPay, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 shadow-lg bg-gradient-to-br from-card to-card/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <TrendingUp className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">주간 근무 요약</h2>
              <p className="text-sm text-muted-foreground">이번 주 근무 현황</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPreviousWeek}
              className="rounded-lg hover:bg-accent transition-all"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {currentWeekOffset !== 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToCurrentWeek}
                className="rounded-lg hover:bg-accent transition-all"
              >
                이번 주
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToNextWeek}
              className="rounded-lg hover:bg-accent transition-all"
            >
              <ChevronRight className="size-4" />
            </Button>

            {summaries.length > 0 && (
              <Button 
                onClick={() => {
                  try {
                    const periods = calculateEmployeeWorkPeriods(records, weekStart, weekEnd);
                    if (periods.length === 0) {
                      toast.error('내보낼 데이터가 없습니다.');
                      return;
                    }
                    const year = new Date(weekStart).getFullYear();
                    const month = new Date(weekStart).getMonth() + 1;
                    exportToExcel(periods, year, month, records, { start: weekStart, end: weekEnd });
                    toast.success(`${year}년 ${month}월 근무 기록이 다운로드되었습니다.`);
                  } catch (e) {
                    console.error(e);
                    toast.error('엑셀 생성 중 오류가 발생했습니다.');
                  }
                }}
                className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all ml-2"
              >
                <Download className="size-4 mr-2" />
                엑셀 다운로드
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border">
            <div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">주간 기간</p>
              <p className="text-lg font-bold">{formatDateRange(weekStart, weekEnd)}</p>
            </div>
            {currentWeekOffset === 0 && (
              <Badge variant="outline" className="px-3 py-1 font-semibold">이번 주</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border hover:shadow-md transition-all">
              <p className="text-sm text-muted-foreground mb-2 font-medium">전체 근무시간</p>
              <p className="text-3xl font-bold">{totalHours.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">시간</span></p>
            </div>

            {totalPay > 0 && (
              <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 hover:shadow-lg transition-all">
                <p className="text-sm text-muted-foreground mb-2 font-medium">전체 급여 합계(약)</p>
                <p className="text-3xl font-bold text-primary">{totalPay.toLocaleString()}<span className="text-lg text-primary/70 ml-1">원</span></p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 알바생별 요약 */}
      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((summary) => (
            <EmployeeSummaryCard key={summary.name} summary={summary} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          이번 주에 등록된 근무 기록이 없습니다
        </Card>
      )}
    </div>
  );
}