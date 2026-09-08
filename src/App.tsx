import React, { useState, useEffect } from 'react';
import { TaxSchedule, NotificationItem, TaxCategory } from './types';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ScheduleFilters } from './components/ScheduleFilters';
import { ScheduleCard } from './components/ScheduleCard';
import { CalendarView } from './components/CalendarView';
import { AddScheduleModal } from './components/AddScheduleModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { NotificationModal } from './components/NotificationModal';
import { ShieldCheck, Sparkles, AlertCircle, Plus } from 'lucide-react';

export default function App() {
  const [schedules, setSchedules] = useState<TaxSchedule[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'important'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TaxSchedule | null>(null);

  // Load schedules on mount
  useEffect(() => {
    fetch('/api/tax-schedules')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schedules) {
          setSchedules(data.schedules);
          generateNotifications(data.schedules);
        }
      })
      .catch((err) => {
        console.error('Failed to load schedules:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Sync / save schedules to backend
  const saveSchedulesToBackend = async (updatedSchedules: TaxSchedule[]) => {
    setSchedules(updatedSchedules);
    generateNotifications(updatedSchedules);
    try {
      await fetch('/api/tax-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: updatedSchedules }),
      });
    } catch (err) {
      console.error('Failed to save schedules:', err);
    }
  };

  // Generate dynamic notification alerts based on due dates and completion status
  const generateNotifications = (schedList: TaxSchedule[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newNotifs: NotificationItem[] = [];

    schedList.forEach((s) => {
      const due = new Date(s.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (s.completed) {
        newNotifs.push({
          id: `notif-comp-${s.id}`,
          title: `[신고 완료] ${s.title}`,
          message: `성공적으로 신고 및 납부가 완료되었습니다. 관련 증빙 서류를 보관해주세요.`,
          date: s.dueDate,
          type: 'success',
          scheduleId: s.id,
          isRead: false,
        });
      } else if (diffDays < 0) {
        newNotifs.push({
          id: `notif-overdue-${s.id}`,
          title: `[기한 경과] ${s.title}`,
          message: `마감일이 ${Math.abs(diffDays)}일 지났습니다. 가산세 발생 여부를 확인하세요!`,
          date: s.dueDate,
          type: 'urgent',
          scheduleId: s.id,
          isRead: false,
        });
      } else if (diffDays === 0) {
        newNotifs.push({
          id: `notif-today-${s.id}`,
          title: `[오늘 마감] ${s.title}`,
          message: `오늘이 세무신고/납부 마감일(D-Day)입니다. 홈택스 납부를 서둘러주세요.`,
          date: s.dueDate,
          type: 'urgent',
          scheduleId: s.id,
          isRead: false,
        });
      } else if (diffDays <= s.reminderDays) {
        newNotifs.push({
          id: `notif-soon-${s.id}`,
          title: `[마감 임박] ${s.title}`,
          message: `마감일까지 ${diffDays}일 남았습니다 (기한: ${s.dueDate}). 서류를 준비해주세요.`,
          date: s.dueDate,
          type: 'warning',
          scheduleId: s.id,
          isRead: false,
        });
      }
    });

    setNotifications(newNotifs);
  };

  // Toggle complete
  const handleToggleComplete = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        return { ...s, completed: !s.completed, status: !s.completed ? 'completed' : 'upcoming' } as TaxSchedule;
      }
      return s;
    });
    saveSchedulesToBackend(updated);
  };

  // Toggle important
  const handleToggleImportant = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        return { ...s, isImportant: !s.isImportant } as TaxSchedule;
      }
      return s;
    });
    saveSchedulesToBackend(updated);
  };

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('정말 이 세무 일정을 삭제하시겠습니까?')) {
      const updated = schedules.filter((s) => s.id !== id);
      saveSchedulesToBackend(updated);
    }
  };

  // Save schedule (Add or Edit)
  const handleSaveSchedule = (scheduleData: Partial<TaxSchedule>) => {
    const existingIndex = schedules.findIndex((s) => s.id === scheduleData.id);
    let updated: TaxSchedule[];
    if (existingIndex >= 0) {
      updated = schedules.map((s) => (s.id === scheduleData.id ? ({ ...s, ...scheduleData } as TaxSchedule) : s));
    } else {
      updated = [scheduleData as TaxSchedule, ...schedules];
    }
    saveSchedulesToBackend(updated);
    setEditingSchedule(null);
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    // Category filter
    if (selectedCategory !== 'all' && s.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (
      searchQuery.trim() &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Status filter
    if (statusFilter === 'pending' && s.completed) return false;
    if (statusFilter === 'completed' && !s.completed) return false;
    if (statusFilter === 'important' && !s.isImportant) return false;

    return true;
  });

  // Sort by due date ascending
  const sortedSchedules = [...filteredSchedules].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-slate-50 to-emerald-50/20 text-slate-800 font-sans antialiased">
      {/* Navbar */}
      <Navbar
        onOpenAddModal={() => {
          setEditingSchedule(null);
          setIsAddModalOpen(true);
        }}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner / Greeting */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>국세청 공인 및 사내 맞춤 세무 통합 관리</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              정확하고 체계적인 사내 세무 캘린더
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              법인세, 부가가치세, 원천세 및 사내 고유 세무 일정을 관리하고, 기한 전후 알림과 중요 일정 강조 기능으로 신고 누락을 완벽히 방지하세요.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-semibold text-emerald-800 bg-white hover:bg-emerald-50 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              세무 AI 전문가 상담
            </button>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all active:scale-95 border border-emerald-500/40"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 일정 추가
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview schedules={schedules} />

        {/* Filters & Controls */}
        <ScheduleFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Content Section: List or Calendar */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-emerald-100 shadow-xs">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-600">세무 일정을 불러오는 중입니다...</p>
            </div>
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView
            schedules={schedules}
            onEdit={(sched) => {
              setEditingSchedule(sched);
              setIsAddModalOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
          />
        ) : sortedSchedules.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 shadow-xs p-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">검색 결과가 없습니다</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              선택한 카테고리나 검색어에 해당하는 세무 일정이 없습니다. 새로운 일정을 직접 추가하거나 필터를 변경해보세요.
            </p>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />새 일정 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onToggleComplete={handleToggleComplete}
                onToggleImportant={handleToggleImportant}
                onDelete={handleDeleteSchedule}
                onEdit={(sched) => {
                  setEditingSchedule(sched);
                  setIsAddModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 border-t border-emerald-100 text-center text-xs text-slate-500">
        <p>© 2026 사내 세무 일정 관리 프로그램 (Corporate Tax Schedule Hub). All rights reserved.</p>
        <p className="mt-1 text-slate-400">국세청(Hometax) 공인 신고 납부 일정을 기준으로 제공됩니다.</p>
      </footer>

      {/* Modals */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        schedules={schedules}
      />

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        schedules={schedules}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        }}
        onClearAll={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }}
      />
    </div>
  );
}
