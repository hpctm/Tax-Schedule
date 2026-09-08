import React from 'react';
import { TaxSchedule } from '../types';
import { Calendar, Bell, CheckCircle2, Circle, Star, Trash2, Edit3, ShieldCheck, UserCheck, FileText } from 'lucide-react';

interface ScheduleCardProps {
  schedule: TaxSchedule;
  onToggleComplete: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (schedule: TaxSchedule) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  onEdit,
}) => {
  // Calculate D-day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(schedule.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dDayBadge = null;
  if (schedule.completed) {
    dDayBadge = <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">신고완료</span>;
  } else if (diffDays < 0) {
    dDayBadge = <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">기한경과 ({Math.abs(diffDays)}일 지남)</span>;
  } else if (diffDays === 0) {
    dDayBadge = <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg animate-pulse">오늘 마감 (D-Day)</span>;
  } else if (diffDays <= 7) {
    dDayBadge = <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">임박 (D-{diffDays})</span>;
  } else {
    dDayBadge = <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">D-{diffDays}</span>;
  }

  // Category badge color mapping
  const categoryColors: Record<string, string> = {
    '법인세': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    '부가가치세': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '원천세': 'bg-teal-50 text-teal-700 border-teal-200',
    '소득세': 'bg-blue-50 text-blue-700 border-blue-200',
    '4대보험': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    '지방세': 'bg-purple-50 text-purple-700 border-purple-200',
    '기타사내일정': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md relative ${
        schedule.isImportant
          ? 'border-2 border-rose-400 bg-gradient-to-br from-rose-50/20 via-white to-white shadow-sm'
          : schedule.completed
          ? 'border-emerald-200 bg-emerald-50/20 opacity-85'
          : 'border-emerald-100 hover:border-emerald-300'
      }`}
    >
      {/* Top Row: Category, Important Star, Official Tag, D-Day */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              categoryColors[schedule.category] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {schedule.category}
          </span>

          {schedule.isOfficial ? (
            <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> 국세청 공인
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              <UserCheck className="w-3 h-3 mr-1 text-amber-600" /> 사내 고유 일정
            </span>
          )}

          {schedule.isImportant && (
            <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <Star className="w-3 h-3 mr-1 fill-rose-500 text-rose-500" /> 중요 강조
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {dDayBadge}
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <h3
          className={`text-base text-slate-900 mb-1 ${
            schedule.isImportant ? 'font-black tracking-tight text-slate-950 text-lg' : 'font-bold'
          }`}
        >
          {schedule.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
          {schedule.description}
        </p>
      </div>

      {/* Date & Reminder Info */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">마감일: {schedule.dueDate}</span>
          </div>
          <div className="flex items-center text-slate-500">
            <Bell className="w-3.5 h-3.5 mr-1 text-amber-500" />
            <span>D-{schedule.reminderDays} 전 알림</span>
          </div>
        </div>

        {schedule.notes && (
          <div className="flex items-center text-slate-500 bg-slate-50 px-2 py-1 rounded-md max-w-xs truncate" title={schedule.notes}>
            <FileText className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
            <span className="truncate">{schedule.notes}</span>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        {/* Complete Checkbox button */}
        <button
          onClick={() => onToggleComplete(schedule.id)}
          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            schedule.completed
              ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          {schedule.completed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-white" /> 신고완료됨
            </>
          ) : (
            <>
              <Circle className="w-4 h-4 mr-1.5 text-slate-400" /> 완료 처리하기
            </>
          )}
        </button>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          {/* Important toggle star */}
          <button
            onClick={() => onToggleImportant(schedule.id)}
            className={`p-2 rounded-xl transition-colors ${
              schedule.isImportant
                ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                : 'bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
            }`}
            title={schedule.isImportant ? '중요 해제' : '중요 강조 (볼드)'}
          >
            <Star className={`w-4 h-4 ${schedule.isImportant ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Edit button */}
          <button
            onClick={() => onEdit(schedule)}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            title="일정 수정"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete button (only for custom or any schedule) */}
          <button
            onClick={() => onDelete(schedule.id)}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="일정 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
