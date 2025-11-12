import * as XLSX from 'xlsx';
import { WorkRecord } from '../types/work-record';
import { calculateEmployeeSummaries, getThisWeekRange, formatDateRange } from './summary-calculations';

interface EmployeeWorkPeriod {
  name: string;
  workDays: number;
  totalHours: number;
  records: WorkRecord[]; // 날짜별 상세 기록
}

/**
 * 근무자별 근무 기간 계산
 */
export function calculateEmployeeWorkPeriods(
  records: WorkRecord[],
  monthStart: string,
  monthEnd: string
): EmployeeWorkPeriod[] {
  // 해당 월의 기록만 필터링
  const monthlyRecords = records.filter(
    (r) => r.date >= monthStart && r.date <= monthEnd
  );

  // 근무자별로 그룹화
  const employeeMap = new Map<string, WorkRecord[]>();

  monthlyRecords.forEach((record) => {
    const existing = employeeMap.get(record.name) || [];
    existing.push(record);
    employeeMap.set(record.name, existing);
  });

  // 각 근무자의 근무 기간 계산
  const periods: EmployeeWorkPeriod[] = [];

  employeeMap.forEach((employeeRecords, name) => {
    // 날짜순 정렬
    const sortedRecords = [...employeeRecords].sort((a, b) => 
      a.date.localeCompare(b.date)
    );

  // 날짜 목록 추출
  const dates = sortedRecords.map(r => r.date);
  const workDays = dates.length;

    // 총 근무시간 계산
    const totalHours = sortedRecords.reduce((sum, r) => sum + r.workHours, 0);

    periods.push({
      name,
      workDays,
      totalHours,
      records: sortedRecords, // 날짜별 상세 기록 저장
    });
  });

  // 이름순 정렬
  return periods.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 날짜와 시간 포맷팅 (YYYY-MM-DD + HH:MM -> YYYY년 MM월 DD일 (HH:MM-HH:MM))
 */
function formatDateWithTime(record: WorkRecord): string {
  const dateStr = formatDate(record.date);
  return `${dateStr} (${record.clockIn}-${record.clockOut})`;
}

/**
 * 엑셀 파일 생성 및 다운로드
 */
export function exportToExcel(
  periods: EmployeeWorkPeriod[],
  year: number,
  month: number,
  allRecords?: WorkRecord[],
  weekRange?: { start: string; end: string }
): void {
  // 워크북 생성
  const wb = XLSX.utils.book_new();

  // 데이터 준비
  // 각 근무 기록을 별도 행으로 변환
  const excelData: Array<Record<string, any>> = [];

  periods.forEach((period, idx) => {
    // 각 근무 레코드를 한 행씩 추가
    period.records.forEach((r) => {
      excelData.push({
        '근무자 이름': period.name,
        '근무 날짜': formatDate(r.date),
        '출근': r.clockIn,
        '퇴근': r.clockOut,
        '근무시간': `${r.workHours.toFixed(1)}시간`,
        '근무자 총 근무시간': '',
      });
    });

    // 직원별 합계 행 추가 (세부 컬럼은 비워두고 마지막 컬럼에 총시간 표시)
    excelData.push({
      '근무자 이름': '',
      '근무 날짜': '',
      '출근': '',
      '퇴근': '',
      '근무시간': '',
      '근무자 총 근무시간': `${period.totalHours.toFixed(1)}시간`,
    });

    // 직원 블록 사이에 빈 행 삽입 (마지막 직원 다음에는 추가하지 않음)
    if (idx < periods.length - 1) {
      excelData.push({
        '근무자 이름': '',
        '근무 날짜': '',
        '출근': '',
        '퇴근': '',
        '근무시간': '',
        '근무자 총 근무시간': '',
      });
    }
  });

  // 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 15 }, // 근무자 이름
    { wch: 18 }, // 근무 날짜
    { wch: 8 },  // 출근
    { wch: 8 },  // 퇴근
    { wch: 12 }, // 근무시간
    { wch: 15 }, // 근무자 총 근무시간
  ];

  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(wb, ws, `${year}년 ${month}월`);

  // 선택적으로 주간 상세 시트 추가 (allRecords가 주어지면 해당 주(일~토) 데이터로 월별과 같은 형식의 시트를 생성)
  if (allRecords && allRecords.length > 0) {
    try {
  const { start, end } = weekRange ?? getThisWeekRange();

  // 주간 기간에 해당하는 직원별 기간 계산
  const weeklyPeriods = calculateEmployeeWorkPeriods(allRecords, start, end);

      // 월별 시트와 동일한 형식: 각 레코드 행 + 직원별 합계 행 + 블록 구분 행
      const excelWeekData: Array<Record<string, any>> = [];

      weeklyPeriods.forEach((period, idx) => {
        period.records.forEach((r) => {
          excelWeekData.push({
            '근무자 이름': period.name,
            '근무 날짜': formatDate(r.date),
            '출근': r.clockIn,
            '퇴근': r.clockOut,
            '근무시간': `${r.workHours.toFixed(1)}시간`,
            '근무자 총 근무시간': '',
          });
        });

        // 직원별 합계 행
        excelWeekData.push({
          '근무자 이름': '',
          '근무 날짜': '',
          '출근': '',
          '퇴근': '',
          '근무시간': '',
          '근무자 총 근무시간': `${period.totalHours.toFixed(1)}시간`,
        });

        // 직원 블록 사이의 빈 행 (마지막 직원 뒤에는 추가하지 않음)
        if (idx < weeklyPeriods.length - 1) {
          excelWeekData.push({
            '근무자 이름': '',
            '근무 날짜': '',
            '출근': '',
            '퇴근': '',
            '근무시간': '',
            '근무자 총 근무시간': '',
          });
        }
      });

      const wsWeek = XLSX.utils.json_to_sheet(excelWeekData);
      wsWeek['!cols'] = [
        { wch: 15 }, // 근무자 이름
        { wch: 18 }, // 근무 날짜
        { wch: 8 },  // 출근
        { wch: 8 },  // 퇴근
        { wch: 12 }, // 근무시간
        { wch: 15 }, // 근무자 총 근무시간
      ];

      XLSX.utils.book_append_sheet(wb, wsWeek, `주간 ${start}~${end}`);
    } catch (e) {
      // 시트 생성 실패 시에도 메인 시트 다운로드는 계속됨
      console.error('주간 상세 시트 생성 중 오류:', e);
    }
  }

  // 파일명 생성
  const fileName = `근무기록_${year}년_${month}월.xlsx`;

  // 파일 다운로드
  XLSX.writeFile(wb, fileName);
}