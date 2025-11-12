import { WorkRecord, WeeklySummary } from "../types/work-record";

/**
 * 시간 문자열(HH:MM)을 분으로 변환
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 근무시간 계산 (시간 단위)
 */
export function calculateWorkHours(clockIn: string, clockOut: string): number {
  const startMinutes = timeToMinutes(clockIn);
  const endMinutes = timeToMinutes(clockOut);
  
  let diffMinutes = endMinutes - startMinutes;
  
  // 자정을 넘긴 경우
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }
  
  return Math.round((diffMinutes / 60) * 10) / 10; // 소수점 1자리
}

/**
 * 주의 시작일 구하기 (일요일 기준 — 주: 일요일 ~ 토요일)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // day: 0 (Sun) .. 6 (Sat)
  const diff = d.getDate() - day; // 일요일로 조정
  return new Date(d.setDate(diff));
}

/**
 * 주간 근무 기록 필터링
 */
export function getWeeklyRecords(records: WorkRecord[], weekStart: Date): WorkRecord[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });
}

/**
 * 주간 요약 계산
 */
export function calculateWeeklySummary(records: WorkRecord[], weekStart: Date): WeeklySummary {
  const weeklyRecords = getWeeklyRecords(records, weekStart);
  const totalHours = weeklyRecords.reduce((sum, record) => sum + record.workHours, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  // 주휴수당 자격: 주 15시간 이상 근무
  const qualifiesForWeeklyAllowance = totalHours >= 15;
  
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    totalHours: Math.round(totalHours * 10) / 10,
    qualifiesForWeeklyAllowance
  };
}

/**
 * 월별 근무 기록 그룹화
 */
export function groupByMonth(records: WorkRecord[]): Record<string, WorkRecord[]> {
  const grouped: Record<string, WorkRecord[]> = {};
  
  records.forEach(record => {
    const month = record.date.substring(0, 7); // YYYY-MM
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(record);
  });
  
  return grouped;
}
