export type TaxCategory = '법인세' | '부가가치세' | '원천세' | '지방세';

export interface TaxSchedule {
  id: string;
  title: string;
  category: TaxCategory;
  dueDate: string; // YYYY-MM-DD
  originalDueDate?: string; // 법정 기준 마감일 (공휴일 이월 전 원래 마감일)
  description: string;
  isOfficial: boolean; // 국세청 공인 일정 여부
  isImportant: boolean; // 중요한 일정 (볼드 처리 등 눈에 띄게 강조)
  reminderDays: number; // 며칠 전에 알림을 줄지 (예: 3일 전, 7일 전)
  status: 'upcoming' | 'due_soon' | 'completed' | 'overdue';
  completed: boolean;
  notes?: string;
  source?: string; // 일정 출처
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  scheduleId: string;
  isRead: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
