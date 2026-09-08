import React from 'react';
import { TaxSchedule } from '../types';
import { Calendar, Clock, CheckCircle2, AlertCircle, Star } from 'lucide-react';

interface StatsOverviewProps {
  schedules: TaxSchedule[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ schedules }) => {
  const total = schedules.length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  let upcomingCount = 0;
  let completedCount = 0;
  let importantCount = 0;

  schedules.forEach((s) => {
    if (s.completed) {
      completedCount++;
    }
    if (s.isImportant) {
      importantCount++;
    }
    const due = new Date(s.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (!s.completed && diffDays >= 0 && diffDays <= 30) {
      upcomingCount++;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Total Card */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">전체 세무 일정</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{total}건</p>
          <span className="inline-block mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
            공인 및 사내 일정 포함
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Upcoming (30 days) */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">30일 내 임박 일정</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{upcomingCount}건</p>
          <span className="inline-block mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
            사전 알림 대상
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">신고/납부 완료</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}건</p>
          <span className="inline-block mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
            완료 후 알림 완료
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Important */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">중요 강조 일정</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{importantCount}건</p>
          <span className="inline-block mt-2 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-medium">
            볼드 및 강조 표시
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Star className="w-6 h-6 fill-rose-500 text-rose-500" />
        </div>
      </div>
    </div>
  );
};
