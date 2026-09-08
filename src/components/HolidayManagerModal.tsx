import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Calendar, RotateCcw, Edit2, Check, Search, Filter, AlertCircle, Sparkles } from 'lucide-react';
import { HolidayRecord, HolidayType, DEFAULT_HOLIDAYS } from '../utils/taxUtils';

interface HolidayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: HolidayRecord[];
  onSaveHolidays: (updated: HolidayRecord[]) => void;
}

export const HolidayManagerModal: React.FC<HolidayManagerModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onSaveHolidays,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New holiday form
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<HolidayType>('substitute');

  // Inline editing state
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ date: string; name: string; type: HolidayType }>({
    date: '',
    name: '',
    type: 'legal',
  });

  if (!isOpen) return null;

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    if (holidays.some((h) => h.date === newDate)) {
      alert(`이미 ${newDate} 날짜에 등록된 휴일이 있습니다.`);
      return;
    }
    const record: HolidayRecord = {
      date: newDate,
      name: newName.trim() || (newType === 'substitute' ? '대체공휴일' : '공휴일'),
      type: newType,
    };
    const updated = [...holidays, record].sort((a, b) => a.date.localeCompare(b.date));
    onSaveHolidays(updated);
    setNewDate('');
    setNewName('');
  };

  const handleQuickAddSept28 = () => {
    if (holidays.some((h) => h.date === '2026-09-28')) {
      alert('2026-09-28은 이미 휴일 목록에 등록되어 있습니다.');
      return;
    }
    const record: HolidayRecord = {
      date: '2026-09-28',
      name: '추석 대체공휴일',
      type: 'substitute',
    };
    const updated = [...holidays, record].sort((a, b) => a.date.localeCompare(b.date));
    onSaveHolidays(updated);
  };

  const handleDeleteHoliday = (dateToDelete: string, name: string) => {
    if (window.confirm(`[${dateToDelete} ${name}] 휴일을 삭제하시겠습니까?\n세무 일정 마감일 계산에서 이 날짜는 평일(영업일)로 처리됩니다.`)) {
      const updated = holidays.filter((h) => h.date !== dateToDelete);
      onSaveHolidays(updated);
    }
  };

  const handleStartEdit = (item: HolidayRecord) => {
    setEditingDate(item.date);
    setEditFormData({
      date: item.date,
      name: item.name,
      type: item.type || (item.name.includes('대체') ? 'substitute' : 'legal'),
    });
  };

  const handleSaveEdit = (originalDate: string) => {
    if (!editFormData.date) return;
    // Check if changed date conflicts with an existing date other than itself
    if (editFormData.date !== originalDate && holidays.some((h) => h.date === editFormData.date)) {
      alert(`이미 ${editFormData.date} 날짜에 다른 휴일이 등록되어 있습니다.`);
      return;
    }

    const updated = holidays.map((h) => {
      if (h.date === originalDate) {
        return {
          date: editFormData.date,
          name: editFormData.name.trim() || '공휴일',
          type: editFormData.type,
        };
      }
      return h;
    }).sort((a, b) => a.date.localeCompare(b.date));

    onSaveHolidays(updated);
    setEditingDate(null);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        '법정 공휴일 및 대체공휴일 기본 목록으로 초기화하시겠습니까?\n(사용자가 수정한 모든 휴일 추가/삭제 내역이 초기화됩니다)'
      )
    ) {
      onSaveHolidays(DEFAULT_HOLIDAYS);
      setEditingDate(null);
    }
  };

  // Filtered holidays list
  const filteredHolidays = holidays.filter((h) => {
    // Year filter
    if (selectedYear !== 'all' && !h.date.startsWith(selectedYear)) {
      return false;
    }

    // Type filter
    const itemType = h.type || (h.name.includes('대체') ? 'substitute' : 'legal');
    if (selectedTypeFilter === 'substitute' && itemType !== 'substitute') return false;
    if (selectedTypeFilter === 'legal' && itemType !== 'legal') return false;
    if (selectedTypeFilter === 'company' && itemType !== 'company' && itemType !== 'custom') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return h.date.toLowerCase().includes(q) || h.name.toLowerCase().includes(q);
    }

    return true;
  });

  const isSept28Registered = holidays.some((h) => h.date === '2026-09-28');
  const substituteCount = holidays.filter((h) => (h.type || (h.name.includes('대체') ? 'substitute' : 'legal')) === 'substitute').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">휴일 관리</h2>
                <span className="text-[11px] bg-emerald-500/50 px-2 py-0.5 rounded-full font-semibold border border-white/20">
                  전체 {holidays.length}일 등록됨
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                법정 공휴일, 대체휴일 및 임시휴일을 직접 수정·삭제·추가할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Action Suggestion for 2026-09-28 */}
          {!isSept28Registered && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">2026년 9월 28일 안내</p>
                  <p className="text-[11px] text-amber-700">
                    현재 9월 28일은 대체공휴일에서 제외되어 정상 평일로 세무일정이 적용됩니다. 만약 사내 지정 대체휴일로 설정하려면 등록하세요.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickAddSept28}
                className="shrink-0 ml-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>9월 28일 대체휴일 추가</span>
              </button>
            </div>
          )}

          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center">
                <Plus className="w-4 h-4 text-emerald-600 mr-1.5" /> 새 휴일 직접 등록하기
              </h3>
              <span className="text-[11px] text-slate-500">대체휴일, 창립기념일, 임시공휴일 등</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">날짜</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">휴일 명칭</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 추석 대체공휴일"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">휴일 분류</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as HolidayType)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="substitute">대체공휴일 / 대체휴일</option>
                  <option value="legal">법정 공휴일</option>
                  <option value="company">회사 지정 / 임시공휴일</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>휴일 등록</span>
              </button>
            </div>
          </form>

          {/* Filters & Search */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Type Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTypeFilter === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체 ({holidays.length})
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('substitute')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                    selectedTypeFilter === 'substitute'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-700 hover:bg-amber-100/60'
                  }`}
                >
                  <span>대체휴일 ({substituteCount})</span>
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('legal')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedTypeFilter === 'legal'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-100/60'
                  }`}
                >
                  법정공휴일
                </button>
              </div>

              {/* Year Selector & Reset */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="2026">2026년</option>
                  <option value="2027">2027년</option>
                  <option value="all">전체 연도</option>
                </select>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                  title="기본 공휴일 설정으로 초기화"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> 기본값 복원
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="휴일 명칭 또는 날짜 검색 (예: 대체, 09, 설날, 추석)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Holiday List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white">
            {filteredHolidays.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                조건에 일치하는 휴일이 없습니다.
              </div>
            ) : (
              filteredHolidays.map((h) => {
                const [y, m, d] = h.date.split('-').map(Number);
                const dateObj = new Date(y, m - 1, d);
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayOfWeek = dayNames[dateObj.getDay()];
                const isEditing = editingDate === h.date;
                const itemType = h.type || (h.name.includes('대체') ? 'substitute' : 'legal');

                return (
                  <div
                    key={h.date}
                    className={`px-4 py-3 flex items-center justify-between transition-colors ${
                      isEditing ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold shrink-0 ${
                          itemType === 'substitute'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span className="text-[9px] uppercase leading-none">{m}월</span>
                        <span className="text-sm font-extrabold leading-none">{d}일</span>
                      </div>

                      <div className="flex-1">
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                            <input
                              type="date"
                              value={editFormData.date}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, date: e.target.value })
                              }
                              className="px-2 py-1 text-xs border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, name: e.target.value })
                              }
                              placeholder="휴일 명칭"
                              className="px-2 py-1 text-xs border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <select
                              value={editFormData.type}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  type: e.target.value as HolidayType,
                                })
                              }
                              className="px-2 py-1 text-xs border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="substitute">대체공휴일</option>
                              <option value="legal">법정공휴일</option>
                              <option value="company">회사/임시휴일</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-bold text-slate-800">
                                {y}년 {m}월 {d}일 ({dayOfWeek}요일)
                              </p>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  itemType === 'substitute'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : itemType === 'company'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {itemType === 'substitute'
                                  ? '대체공휴일'
                                  : itemType === 'company'
                                  ? '회사/임시'
                                  : '법정공휴일'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">{h.name}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-3 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(h.date)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                            title="저장"
                          >
                            <Check className="w-3.5 h-3.5 mr-0.5" /> 저장
                          </button>
                          <button
                            onClick={() => setEditingDate(null)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(h)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="날짜/명칭 수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(h.date, h.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="휴일 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            휴일 변경 사항은 세무 일정 마감일 및 캘린더 화면에 실시간 자동 반영됩니다.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
