import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Clock, Plus } from 'lucide-react';
import { calculateWorkHours } from '../utils/work-calculations';
import { toast } from 'sonner';

interface WorkRecordFormProps {
  onSubmit: (record: {
    date: string;
    name: string;
    clockIn: string;
    clockOut: string;
    workHours: number;
    hourlyWage?: number;
  }) => void;
}

export function WorkRecordForm({ onSubmit }: WorkRecordFormProps) {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [name, setName] = useState('');
  const [clockIn, setClockIn] = useState('09:00');
  const [clockOut, setClockOut] = useState('18:00');
  const [hourlyWage, setHourlyWage] = useState('10030');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    if (!clockIn || !clockOut) {
      toast.error('출근시간과 퇴근시간을 입력해주세요');
      return;
    }

    const workHours = calculateWorkHours(clockIn, clockOut);
    const wage = hourlyWage ? parseFloat(hourlyWage) : undefined;

    onSubmit({
      date,
      name: name.trim(),
      clockIn,
      clockOut,
      workHours,
      hourlyWage: wage
    });

    toast.success('근무 기록이 추가되었습니다');
    
    // 이름과 시급은 유지, 시간은 리셋
    setClockIn('09:00');
    setClockOut('18:00');
  };

  return (
    <Card className="p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
            <Clock className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">출퇴근 기록</h2>
            <p className="text-sm text-muted-foreground">근무 시간을 기록하세요</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold">날짜</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-lg border-2 focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">이름</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="h-11 rounded-lg border-2 focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clockIn" className="text-sm font-semibold">출근 시간</Label>
            <Input
              id="clockIn"
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="h-11 rounded-lg border-2 focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clockOut" className="text-sm font-semibold">퇴근 시간</Label>
            <Input
              id="clockOut"
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="h-11 rounded-lg border-2 focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hourlyWage" className="text-sm font-semibold">시급 (기본값: 최저시급 10,030원)</Label>
            <Input
              id="hourlyWage"
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
              placeholder="시급을 입력하세요 (기본값: 10030)"
              className="h-11 rounded-lg border-2 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold text-base"
        >
          <Plus className="size-5 mr-2" />
          기록 추가
        </Button>
      </form>
    </Card>
  );
}