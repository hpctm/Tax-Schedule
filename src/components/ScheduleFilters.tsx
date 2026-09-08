import React from 'react';
import { TaxCategory } from '../types';
import { Search, ListFilter, LayoutGrid, List, X } from 'lucide-react';

interface ScheduleFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'pending' | 'completed' | 'important' | 'upcoming30';
  onStatusFilterChange: (status: 'all' | 'pending' | 'completed' | 'important' | 'upcoming30') => void;
  viewMode: 'list' | 'calendar';
  onViewModeChange: (mode: 'list' | 'calendar') => void;
}

const categories: { label: string; value: string }[] = [
  { label: '전체 카테고리', value: 'all' },
  { label: '법인세', value: '법인세' },
  { label: '부가가치세', value: '부가가치세' },
  { label: '원천세', value: '원천세' },
  { label: '지방세', value: '지방세' },
];

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 border border-emerald-100 shadow-xs space-y-4">
      {/* Top bar: Search & View Mode */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="세무 일정, 설명 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status filters & View mode toggles */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => onStatusFilterChange('upcoming30')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'upcoming30'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold ring-1 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏳ 30일내임박
            </button>
            <button
              onClick={() => onStatusFilterChange('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              진행예정
            </button>
            <button
              onClick={() => onStatusFilterChange('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              완료됨
            </button>
            <button
              onClick={() => onStatusFilterChange('important')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'important'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐ 중요강조
            </button>
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
              title="목록형 보기"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('calendar')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'calendar' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
              title="캘린더형 보기"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Banner if upcoming30 or specific filters */}
      {statusFilter === 'upcoming30' && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl text-xs text-amber-800">
          <span className="font-medium">⚡ 현재 '30일 내 임박 일정' 카드 필터가 적용되어 있습니다.</span>
          <button
            onClick={() => onStatusFilterChange('all')}
            className="inline-flex items-center text-amber-900 hover:text-amber-950 font-semibold bg-amber-100/80 px-2.5 py-1 rounded-lg transition-all"
          >
            <X className="w-3.5 h-3.5 mr-1" /> 필터 해제
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <ListFilter className="w-4 h-4 text-emerald-600 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelectCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat.value
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
