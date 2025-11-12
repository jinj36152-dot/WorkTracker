export interface WorkRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  clockIn: string; // HH:MM
  clockOut: string; // HH:MM
  workHours: number; // 근무시간 (시간 단위)
  hourlyWage?: number; // 시급 (선택)
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  qualifiesForWeeklyAllowance: boolean; // 주휴수당 자격
}

export interface EmployeeSummary {
  name: string;
  totalHours: number;
  totalPay: number;
  hourlyWage: number;
  recordCount: number;
}