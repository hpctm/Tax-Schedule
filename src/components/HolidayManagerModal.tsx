import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, RotateCcw } from 'lucide-react';
import { getCustomHolidays, saveCustomHolidays } from '../utils/taxUtils';

interface HolidayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHolidaysChanged: () => void;
}

export const HolidayManagerModal: React.FC<HolidayManagerModalProps> = ({ isOpen, onClose, onHolidaysChanged }) => {
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHolidays(getCustomHolidays().sort());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    if (holidays.includes(newDate)) {
      alert('이미 등록된 휴일 날짜입니다.');
      return;
    }
    const updated = [...holidays, newDate].sort();
    setHolidays(updated);
    saveCustomHolidays(updated);
    setNewDate('');
    setNewName('');
    onHolidaysChanged();
  };

  const handleDeleteHoliday = (dateToDelete: string) => {
    if (window.confirm(`${dateToDelete} 휴일 설정을 삭제하시겠습니까?`)) {
      const updated = holidays.filter((d) => d !== dateToDelete);
      setHolidays(updated);
      saveCustomHolidays(updated);
      onHolidaysChanged();
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('기본 공휴일 목록으로 초기화하시겠습니까? (사용자 지정 추가/삭제가 초기화됩니다)')) {
      localStorage.removeItem('lx_mma_custom_holidays');
      const defaults = getCustomHolidays().sort();
      setHolidays(defaults);
      onHolidaysChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">법정 공휴일 및 휴일 관리</h2>
              <p className="text-xs text-emerald-100">마감일 자동 이월에 적용되는 공휴일을 추가하거나 수정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Plus className="w-4 h-4 text-emerald-600 mr-1.5" />새 휴일 추가하기
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">날짜 (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">휴일 명칭 (선택)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 회사 창립기념일 / 임시공휴일"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                휴일 추가
              </button>
            </div>
          </form>

          {/* Holiday List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                등록된 공휴일 목록 <span className="text-emerald-600 ml-1">({holidays.length}일)</span>
              </h3>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> 기본값으로 초기화
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white">
              {holidays.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">등록된 공휴일이 없습니다.</div>
              ) : (
                holidays.map((date) => {
                  const [y, m, d] = date.split('-').map(Number);
                  const dateObj = new Date(y, m - 1, d);
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const dayOfWeek = dayNames[dateObj.getDay()];
                  return (
                    <div key={date} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                          {d}일
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {y}년 {m}월 {d}일 ({dayOfWeek})
                          </p>
                          <p className="text-[10px] text-slate-400">법정공휴일 / 주말 제외 대상</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(date)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="휴일 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            확인 및 완료
          </button>
        </div>
      </div>
    </div>
  );
};
