import React, { useState } from 'react';
import { TaxSchedule } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  schedules: TaxSchedule[];
  onEdit: (schedule: TaxSchedule) => void;
  onToggleComplete: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ schedules, onEdit, onToggleComplete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // First day of month
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build grid days
  const calendarDays = [];
  // Padding for previous month days
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({ day: null, dateString: '' });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;
    calendarDays.push({ day: d, dateString });
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-6">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {year}년 {monthNames[month]} 세무 일정 캘린더
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            title="이전 달"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            이번 달
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            title="다음 달"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {dayNames.map((d, idx) => (
          <div
            key={d}
            className={`text-xs font-bold py-2 ${
              idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-slate-600'
            }`}
          >
            {d}요일
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((item, index) => {
          if (!item.day) {
            return <div key={`empty-${index}`} className="min-h-[110px] bg-slate-50/50 rounded-xl border border-transparent"></div>;
          }

          const daySchedules = schedules.filter((s) => s.dueDate === item.dateString);
          const isToday =
            new Date().toISOString().split('T')[0] === item.dateString;

          return (
            <div
              key={item.dateString}
              className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                isToday
                  ? 'border-emerald-500 bg-emerald-50/35 ring-2 ring-emerald-200'
                  : 'border-slate-100 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 bg-slate-100'
                  }`}
                >
                  {item.day}
                </span>
                {daySchedules.length > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                    {daySchedules.length}건
                  </span>
                )}
              </div>

              {/* Schedules in this cell */}
              <div className="space-y-1 mt-1.5 overflow-y-auto max-h-[75px] scrollbar-none">
                {daySchedules.map((sched) => (
                  <div
                    key={sched.id}
                    onClick={() => onEdit(sched)}
                    className={`text-[11px] px-1.5 py-1 rounded-md truncate cursor-pointer transition-all flex items-center justify-between ${
                      sched.completed
                        ? 'bg-emerald-100/70 text-emerald-800 line-through'
                        : sched.isImportant
                        ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                        : 'bg-slate-100 text-slate-800 hover:bg-emerald-100 hover:text-emerald-900'
                    }`}
                    title={sched.title}
                  >
                    <span className="truncate">{sched.title}</span>
                    {sched.isImportant && <Star className="w-2.5 h-2.5 fill-rose-500 text-rose-500 shrink-0 ml-1" />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
