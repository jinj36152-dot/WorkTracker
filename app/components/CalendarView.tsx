import { useMemo, useState } from 'react';
import { WorkRecord } from '../types/work-record';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface CalendarViewProps {
  records: WorkRecord[];
}

export function CalendarView({ records }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 해당 월의 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 달력 시작일 (이전 달의 날짜 포함)
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - firstDay.getDay());

    // 달력 종료일 (다음 달의 날짜 포함)
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - lastDay.getDay()));

    // 날짜별 근무 기록 맵 생성 (직원별 상세정보 포함)
    const recordMap: Record<string, WorkRecord[]> = {};
    records.forEach(record => {
      if (!recordMap[record.date]) {
        recordMap[record.date] = [];
      }
      recordMap[record.date].push(record);
    });

    // 각 날짜의 기록을 직원 이름순으로 정렬
    Object.keys(recordMap).forEach(dateKey => {
      recordMap[dateKey].sort((a, b) => a.name.localeCompare(b.name));
    });

    // 주 단위로 날짜 생성
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    const current = new Date(startDay);

    while (current <= endDay) {
      currentWeek.push(new Date(current));
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, recordMap, year, month };
  }, [currentDate, records]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === calendarData.month;
  };

  const getDateString = (date: Date) => {
    // 한국 시간(UTC+9) 기준으로 변환
    const koreaDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const year = koreaDate.getUTCFullYear();
    const month = String(koreaDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(koreaDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const monthlyTotal = useMemo(() => {
    return records
      .filter(record => {
        // YYYY-MM-DD 형식의 문자열을 직접 파싱하여 로컬 시간대 기준으로 해석
        const [yearStr, monthStr, dayStr] = record.date.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;
        return year === calendarData.year && month === calendarData.month;
      })
      .reduce((sum, record) => sum + record.workHours, 0);
  }, [records, calendarData.month, calendarData.year]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          <h2>월별 근무 현황</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            오늘
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg">
          {calendarData.year}년 {calendarData.month + 1}월
        </p>
        <Badge variant="outline">
          총 {monthlyTotal.toFixed(1)}시간
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-muted/50">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center text-sm ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        {calendarData.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-t">
            {week.map((date, dayIndex) => {
              const dateString = getDateString(date);
              const dayRecords = calendarData.recordMap[dateString] || [];
              const totalHours = dayRecords.reduce((sum, r) => sum + r.workHours, 0);
              const isCurrent = isCurrentMonth(date);
              const isDateToday = isToday(date);

              return (
                <div
                  key={dateString}
                  className={`min-h-20 p-2 border-l ${
                    dayIndex === 0 ? 'border-l-0' : ''
                  } ${
                    !isCurrent ? 'bg-muted/20' : ''
                  } ${
                    isDateToday ? 'bg-primary/10' : ''
                  }`}
                >
                  <div
                    className={`text-sm mb-1 ${
                      !isCurrent ? 'text-muted-foreground' : ''
                    } ${
                      dayIndex === 0 ? 'text-red-600' : dayIndex === 6 ? 'text-blue-600' : ''
                    } ${
                      isDateToday ? 'font-bold' : ''
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  {dayRecords.length > 0 && (
                    <div className="space-y-1">
                      {dayRecords.map((record, idx) => (
                        <div
                          key={`${record.name}-${idx}`}
                          className="text-xs p-1 bg-primary/20 rounded border border-primary/30"
                        >
                          <div className="font-semibold text-primary truncate">
                            {record.name}
                          </div>
                          <div className="text-muted-foreground text-[10px]">
                            {record.clockIn} ~ {record.clockOut}
                          </div>
                          <div className="text-muted-foreground text-[10px]">
                            {record.workHours}시간
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
