import { useState, useEffect } from 'react';
import { WorkRecord } from '../types/work-record';
import { createGitHubStorage } from '../services/github-storage';
import { toast } from 'sonner';

const STORAGE_KEY = 'work-tracker-records';
const githubStorage = createGitHubStorage();

export function useWorkRecords() {
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // GitHub 또는 로컬 스토리지에서 불러오기
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      if (githubStorage) {
        // GitHub에서 불러오기
        const data = await githubStorage.getRecords();
        setRecords(data);
        
        // 로컬 스토리지에도 백업
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        // 로컬 스토리지에서 불러오기
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecords(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load records:', error);
      toast.error('데이터를 불러오는데 실패했습니다. 로컬 데이터를 사용합니다.');
      
      // GitHub 실패 시 로컬 스토리지 사용
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecords(parsed);
        }
      } catch (localError) {
        console.error('Failed to load from local storage:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 오래된 데이터 필터링 (당월 기준 전전달까지만 유지)
  const filterOldRecords = (records: WorkRecord[]): WorkRecord[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // 전전달 계산 (2개월 전)
    const cutoffDate = new Date(currentYear, currentMonth - 2, 1);
    const cutoffString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return records.filter(record => record.date >= cutoffString);
  };

  // GitHub 또는 로컬 스토리지에 저장
  const saveRecords = async (newRecords: WorkRecord[]) => {
    try {
      setIsSyncing(true);
      
      // 오래된 데이터 필터링 (3개월 이상 된 데이터 삭제)
      const filteredRecords = filterOldRecords(newRecords);
      
      if (githubStorage) {
        // GitHub에 저장
        await githubStorage.saveRecords(filteredRecords);
        
        // 로컬 스토리지에도 백업
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
      } else {
        // 로컬 스토리지에만 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
      }
      
      setRecords(filteredRecords);
    } catch (error) {
      console.error('Failed to save records:', error);
      toast.error('저장에 실패했습니다. 다시 시도해주세요.');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const addRecord = async (record: Omit<WorkRecord, 'id'>) => {
    const newRecord: WorkRecord = {
      ...record,
      id: Date.now().toString()
    };
    const updated = [...records, newRecord].sort((a, b) => 
      b.date.localeCompare(a.date)
    );
    await saveRecords(updated);
  };

  const updateRecord = async (id: string, updates: Partial<WorkRecord>) => {
    const updated = records.map(record =>
      record.id === id ? { ...record, ...updates } : record
    );
    await saveRecords(updated);
  };

  const deleteRecord = async (id: string) => {
    const updated = records.filter(record => record.id !== id);
    await saveRecords(updated);
  };

  return {
    records,
    isLoading,
    isSyncing,
    addRecord,
    updateRecord,
    deleteRecord
  };
}