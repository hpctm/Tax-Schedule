import React, { useState } from 'react';
import { TaxSchedule } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, CheckCircle2, Plus, Trash2, Edit3, X } from 'lucide-react';

interface CalendarViewProps {
  schedules: TaxSchedule[];
  onEdit: (schedule: TaxSchedule) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddForDate: (dateString: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedules,
  onEdit,
  onToggleComplete,
  onDelete,
  onAddForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

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
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({ day: null, dateString: '' });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;
    calendarDays.push({ day: d, dateString });
  }

  const selectedDateSchedules = selectedDateModal
    ? schedules.filter((s) => s.dueDate === selectedDateModal)
    : [];

  const getHolidayName = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const mmmdd = `${mm}-${dd}`;
    const map: Record<string, string> = {
      '01-01': '신정',
      '02-16': '설날연휴',
      '02-17': '설날',
      '02-18': '설날연휴',
      '03-01': '삼일절',
      '03-02': '대체공휴일',
      '05-05': '어린이날',
      '05-24': '부처님오신날',
      '05-25': '대체공휴일',
      '06-06': '현충일',
      '08-15': '광복절',
      '09-24': '추석연휴',
      '09-25': '추석',
      '09-26': '추석연휴',
      '09-28': '대체공휴일',
      '10-03': '개천절',
      '10-09': '한글날',
      '12-25': '크리스마스'
    };
    return year === 2026 ? map[mmmdd] || '' : '';
  };

  const isWeekendOrHoliday = (d: number) => {
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    return !!getHolidayName(d);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-6">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {year}년 {monthNames[month]} 세무 일정 캘린더
            </h2>
            <p className="text-xs text-slate-400">날짜를 클릭하여 해당 일자의 일정을 확인하고 추가·수정하세요.</p>
          </div>
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
            return <div key={`empty-${index}`} className="min-h-[120px] bg-slate-50/50 rounded-xl border border-transparent"></div>;
          }

          const daySchedules = schedules.filter((s) => s.dueDate === item.dateString);
          const isToday =
            new Date().toISOString().split('T')[0] === item.dateString;

          return (
            <div
              key={item.dateString}
              onClick={() => setSelectedDateModal(item.dateString)}
              className={`min-h-[120px] p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group hover:shadow-md ${
                isToday
                  ? 'border-emerald-500 bg-emerald-50/35 ring-2 ring-emerald-200'
                  : 'border-slate-100 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : isWeekendOrHoliday(item.day!)
                        ? 'bg-rose-50 text-rose-600 font-extrabold border border-rose-200'
                        : 'text-slate-700 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                    }`}
                  >
                    {item.day}
                  </span>
                  {getHolidayName(item.day!) && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md truncate max-w-[70px]" title={getHolidayName(item.day!)}>
                      {getHolidayName(item.day!)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {daySchedules.length > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      {daySchedules.length}건
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddForDate(item.dateString);
                    }}
                    className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="이 날짜에 일정 추가"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Schedules in this cell */}
              <div className="space-y-1 mt-1.5 overflow-y-auto max-h-[80px] scrollbar-none">
                {daySchedules.map((sched) => (
                  <div
                    key={sched.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(sched);
                    }}
                    className={`text-[11px] px-1.5 py-1 rounded-md truncate transition-all flex items-center justify-between ${
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

      {/* Selected Date Detail Modal */}
      {selectedDateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-600" />
                  <span>{selectedDateModal} 세무 일정 상세</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">해당 일자의 모든 세무 신고 및 납부 일정을 관리합니다.</p>
              </div>
              <button
                onClick={() => setSelectedDateModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {selectedDateSchedules.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  등록된 일정이 없습니다. 아래 버튼을 눌러 일정을 추가하세요.
                </div>
              ) : (
                selectedDateSchedules.map((sched) => (
                  <div
                    key={sched.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                          {sched.category}
                        </span>
                        {sched.isImportant && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold flex items-center">
                            <Star className="w-2.5 h-2.5 fill-rose-500 text-rose-500 mr-1" /> 중요
                          </span>
                        )}
                        {sched.completed && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold">
                            완료됨
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-bold ${sched.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {sched.title}
                      </h4>
                      <p className="text-xs text-slate-500">{sched.description}</p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onToggleComplete(sched.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          sched.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                        }`}
                        title={sched.completed ? '완료 취소' : '완료 처리'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDateModal(null);
                          onEdit(sched);
                        }}
                        className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        title="수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          onDelete(sched.id);
                        }}
                        className="p-2 rounded-xl bg-slate-200 text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const dateStr = selectedDateModal;
                  setSelectedDateModal(null);
                  onAddForDate(dateStr);
                }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{selectedDateModal}에 새 일정 추가하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
