import { useState } from 'react';
import { WorkRecord } from '../types/work-record';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { calculateWorkHours } from '../utils/work-calculations';
import { toast } from 'sonner';

interface WorkRecordTableProps {
  records: WorkRecord[];
  onUpdate: (id: string, updates: Partial<WorkRecord>) => void;
  onDelete: (id: string) => void;
}

export function WorkRecordTable({ records, onUpdate, onDelete }: WorkRecordTableProps) {
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    name: '',
    clockIn: '',
    clockOut: ''
  });

  const handleEdit = (record: WorkRecord) => {
    setEditingRecord(record);
    setEditForm({
      date: record.date,
      name: record.name,
      clockIn: record.clockIn,
      clockOut: record.clockOut
    });
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    const workHours = calculateWorkHours(editForm.clockIn, editForm.clockOut);

    onUpdate(editingRecord.id, {
      date: editForm.date,
      name: editForm.name,
      clockIn: editForm.clockIn,
      clockOut: editForm.clockOut,
      workHours
    });

    toast.success('기록이 수정되었습니다');
    setEditingRecord(null);
  };

  const handleDelete = (record: WorkRecord) => {
    if (confirm(`${record.date} ${record.name}의 기록을 삭제하시겠습니까?`)) {
      onDelete(record.id);
      toast.success('기록이 삭제되었습니다');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };

  if (records.length === 0) {
    return (
      <Card className="p-16 text-center border-2 border-dashed bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="size-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Calendar className="size-10 text-primary/60" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">아직 근무 기록이 없습니다</h3>
            <p className="text-muted-foreground text-sm">
              위에서 기록을 추가해보세요
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-2 shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">날짜</TableHead>
                <TableHead className="font-semibold">이름</TableHead>
                <TableHead className="font-semibold">출근</TableHead>
                <TableHead className="font-semibold">퇴근</TableHead>
                <TableHead className="font-semibold">근무시간</TableHead>
                <TableHead className="text-right font-semibold">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, index) => (
                <TableRow 
                  key={record.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer border-b"
                >
                  <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                  <TableCell>
                    <span className="font-semibold">{record.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{record.clockIn}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{record.clockOut}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-semibold">
                      {record.workHours}시간
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기록 수정</DialogTitle>
            <DialogDescription>
              근무 기록을 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">날짜</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-clockIn">출근 시간</Label>
                <Input
                  id="edit-clockIn"
                  type="time"
                  value={editForm.clockIn}
                  onChange={(e) => setEditForm({ ...editForm, clockIn: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-clockOut">퇴근 시간</Label>
                <Input
                  id="edit-clockOut"
                  type="time"
                  value={editForm.clockOut}
                  onChange={(e) => setEditForm({ ...editForm, clockOut: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecord(null)}>
              취소
            </Button>
            <Button onClick={handleSaveEdit}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
