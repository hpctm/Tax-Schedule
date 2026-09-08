import React, { useState, useEffect } from 'react';
import { TaxSchedule, TaxCategory } from '../types';
import { getNextBusinessDay } from '../utils/taxUtils';
import { X, Calendar, Star, Bell, ShieldCheck } from 'lucide-react';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: Partial<TaxSchedule>) => void;
  editingSchedule?: TaxSchedule | null;
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaxCategory>('법인세');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingSchedule) {
      setTitle(editingSchedule.title);
      setCategory(editingSchedule.category);
      setDueDate(editingSchedule.dueDate);
      setDescription(editingSchedule.description);
      setIsOfficial(editingSchedule.isOfficial);
      setIsImportant(editingSchedule.isImportant);
      setReminderDays(editingSchedule.reminderDays);
      setNotes(editingSchedule.notes || '');
    } else {
      setTitle('');
      setCategory('법인세');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setDescription('');
      setIsOfficial(false);
      setIsImportant(false);
      setReminderDays(3);
      setNotes('');
    }
  }, [editingSchedule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      alert('일정 제목과 마감일을 입력해주세요.');
      return;
    }

    const { adjustedDate, wasShifted, originalDate } = getNextBusinessDay(dueDate);
    let finalDesc = description;
    if (wasShifted) {
      finalDesc += ` (원래 마감일인 ${originalDate}이 주말/공휴일이므로 익영업일인 ${adjustedDate}로 자동 이월됨)`;
    }

    onSave({
      id: editingSchedule ? editingSchedule.id : `sched-custom-${Date.now()}`,
      title,
      category,
      dueDate: adjustedDate,
      originalDueDate: originalDate,
      description: finalDesc,
      isOfficial,
      isImportant,
      reminderDays: Number(reminderDays),
      status: editingSchedule ? editingSchedule.status : 'upcoming',
      completed: editingSchedule ? editingSchedule.completed : false,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingSchedule ? '세무 일정 수정' : '세무 일정 추가'}
              </h3>
              <p className="text-xs text-slate-500">법인세, 부가가치세, 원천세, 지방세 일정을 관리합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              일정 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 월별 부가가치세 신고 및 납부"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaxCategory)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                <option value="법인세">법인세</option>
                <option value="부가가치세">부가가치세</option>
                <option value="원천세">원천세</option>
                <option value="지방세">지방세</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                마감일 (신고/납부 기한) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              상세 설명
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="신고 대상 기간, 제출 서류 및 담당 부서 안내"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            ></textarea>
          </div>

          {/* Reminder Days & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                <Bell className="w-3.5 h-3.5 mr-1 text-amber-500" /> 사전 알림 설정
              </label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                <option value={1}>1일 전 알림</option>
                <option value={3}>3일 전 알림</option>
                <option value={5}>5일 전 알림</option>
                <option value={7}>7일 전 알림</option>
                <option value={14}>14일 전 알림</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                메모 / 비고
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 홈택스 전자신고 필수"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className={`w-4 h-4 ${isImportant ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">중요 일정 강조</span>
                  <span className="text-[11px] text-slate-500">캘린더 및 목록에서 강조 표시됩니다.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all"
            >
              {editingSchedule ? '수정 완료' : '일정 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
