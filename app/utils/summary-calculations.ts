import { WorkRecord, EmployeeSummary } from '../types/work-record';

/**
 * 알바생별 요약 계산
 */
export function calculateEmployeeSummaries(
  records: WorkRecord[],
  startDate?: string,
  endDate?: string
): EmployeeSummary[] {
  // 날짜 필터링
  let filteredRecords = records;
  if (startDate && endDate) {
    filteredRecords = records.filter(
      (r) => r.date >= startDate && r.date <= endDate
    );
  }

  // 알바생별로 그룹화
  const employeeMap = new Map<string, {
    hours: number[];
    wages: number[];
    recordCount: number;
  }>();

  filteredRecords.forEach((record) => {
    const existing = employeeMap.get(record.name) || {
      hours: [],
      wages: [],
      recordCount: 0,
    };

    existing.hours.push(record.workHours);
    if (record.hourlyWage) {
      existing.wages.push(record.hourlyWage);
    }
    existing.recordCount++;

    employeeMap.set(record.name, existing);
  });

  // 요약 데이터 생성
  const summaries: EmployeeSummary[] = [];

  employeeMap.forEach((data, name) => {
    const totalHours = data.hours.reduce((sum, h) => sum + h, 0);
    
    // 평균 시급 계산 (시급이 있는 기록만)
    const avgWage = data.wages.length > 0
      ? data.wages.reduce((sum, w) => sum + w, 0) / data.wages.length
      : 0;

    const totalPay = avgWage * totalHours;

    summaries.push({
      name,
      totalHours,
      totalPay,
      hourlyWage: avgWage,
      recordCount: data.recordCount,
    });
  });

  // 총 근무시간 내림차순 정렬
  return summaries.sort((a, b) => b.totalHours - a.totalHours);
}

/**
 * 이번 주 시작/종료일 계산
 */
export function getThisWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (일요일) ~ 6 (토요일)
  // 이번 주를 일요일 시작(일요일 ~ 토요일)으로 계산
  const sundayOffset = -dayOfWeek; // if today is Sunday (0), offset 0

  const sunday = new Date(now);
  sunday.setDate(now.getDate() + sundayOffset);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return {
    start: sunday.toISOString().split('T')[0],
    end: saturday.toISOString().split('T')[0],
  };
}

/**
 * 이번 달 시작/종료일 계산
 */
export function getThisMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}

/**
 * 날짜 범위 문자열 포맷
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}월 ${startDay}일 - ${endDay}일`;
  }

  return `${startMonth}월 ${startDay}일 - ${endMonth}월 ${endDay}일`;
}

/**
 * 금액 포맷 (천 단위 콤마)
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}
