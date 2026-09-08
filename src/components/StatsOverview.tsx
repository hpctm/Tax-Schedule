import React from 'react';
import { TaxSchedule } from '../types';
import { Calendar, Clock, CheckCircle2, AlertCircle, Star } from 'lucide-react';

interface StatsOverviewProps {
  schedules: TaxSchedule[];
  activeFilter: string;
  onSelectFilter: (filter: 'all' | 'upcoming30' | 'completed' | 'important') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ schedules, activeFilter, onSelectFilter }) => {
  const total = schedules.length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
      <div 
        onClick={() => onSelectFilter('all')}
        className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
          activeFilter === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30' : 'border-emerald-100 hover:border-emerald-300'
        } shadow-xs flex items-center justify-between`}
      >
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">전체 세무 일정</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{total}건</p>
          <span className="inline-block mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
            전체 보기 (클릭)
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Upcoming (30 days) */}
      <div 
        onClick={() => onSelectFilter('upcoming30')}
        className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
          activeFilter === 'upcoming30' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30' : 'border-emerald-100 hover:border-amber-300'
        } shadow-xs flex items-center justify-between`}
      >
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">30일 내 임박 일정</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{upcomingCount}건</p>
          <span className="inline-block mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
            임박 일정만 보기 (클릭)
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Completed */}
      <div 
        onClick={() => onSelectFilter('completed')}
        className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
          activeFilter === 'completed' ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/30' : 'border-emerald-100 hover:border-emerald-300'
        } shadow-xs flex items-center justify-between`}
      >
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">신고/납부 완료</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}건</p>
          <span className="inline-block mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
            완료 내역만 보기 (클릭)
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Important */}
      <div 
        onClick={() => onSelectFilter('important')}
        className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
          activeFilter === 'important' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30' : 'border-emerald-100 hover:border-rose-300'
        } shadow-xs flex items-center justify-between`}
      >
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">중요 강조 일정</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{importantCount}건</p>
          <span className="inline-block mt-2 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-medium">
            중요 내역만 보기 (클릭)
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Star className="w-6 h-6 fill-rose-500 text-rose-500" />
        </div>
      </div>
    </div>
  );
};
