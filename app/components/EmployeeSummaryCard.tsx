import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User, Clock, DollarSign, Calendar } from 'lucide-react';
import { EmployeeSummary } from '../types/work-record';
import { formatCurrency } from '../utils/summary-calculations';

interface EmployeeSummaryCardProps {
  summary: EmployeeSummary;
}

export function EmployeeSummaryCard({ summary }: EmployeeSummaryCardProps) {
  return (
    <Card className="p-5 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-md">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{summary.name}</h3>
            <p className="text-sm text-muted-foreground">
              {summary.recordCount}일 근무
            </p>
          </div>
        </div>
        
        {summary.totalPay > 0 && (
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 font-semibold">
            <DollarSign className="size-3.5" />
            급여 계산됨
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span className="font-medium">총 근무시간</span>
          </div>
          <span className="font-bold text-lg">{summary.totalHours.toFixed(1)}<span className="text-sm text-muted-foreground ml-1">시간</span></span>
        </div>

        {summary.hourlyWage > 0 && (
          <>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span className="font-medium">평균 시급(약)</span>
              </div>
              <span className="font-bold">{formatCurrency(summary.hourlyWage)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <DollarSign className="size-5 text-primary" />
                <span>총 급여(약)</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(summary.totalPay)}
              </span>
            </div>
          </>
        )}

        {summary.hourlyWage === 0 && (
          <div className="p-3 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground border border-dashed">
            시급이 설정되지 않았습니다
          </div>
        )}
      </div>
    </Card>
  );
}
