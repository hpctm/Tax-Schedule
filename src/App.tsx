import React, { useState, useEffect } from 'react';
import { TaxSchedule, NotificationItem, TaxCategory } from './types';
import { defaultSchedules } from './data/defaultSchedules';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ScheduleFilters } from './components/ScheduleFilters';
import { ScheduleCard } from './components/ScheduleCard';
import { CalendarView } from './components/CalendarView';
import { AddScheduleModal } from './components/AddScheduleModal';
import { NotificationModal } from './components/NotificationModal';
import { LoginModal } from './components/LoginModal';
import { ShieldCheck, AlertCircle, Plus } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<TaxSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('lx_mma_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return defaultSchedules;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'important' | 'upcoming30'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TaxSchedule | null>(null);

  // Fetch initial schedules from server backend (/api/tax-schedules) and auth
  useEffect(() => {
    async function initAuthAndData() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setCurrentUser(session.user);
          } else {
            setIsLoginModalOpen(true);
          }
        } catch (e) {
          console.error('Supabase auth session error:', e);
        }
      } else {
        setCurrentUser({ email: 'lxmma.admin@lx.com', id: 'demo-user' });
      }

      // Generate notifications for initial schedules immediately
      generateNotifications(schedules);

      // Fetch from backend API
      try {
        const res = await fetch('/api/tax-schedules');
        const data = await res.json();
        if (data.success && data.schedules && data.schedules.length > 0) {
          setSchedules(data.schedules);
          generateNotifications(data.schedules);
          localStorage.setItem('lx_mma_schedules', JSON.stringify(data.schedules));
        }
      } catch (e) {
        console.error('Failed to fetch schedules from API (using local/default cache):', e);
      } finally {
        setIsLoading(false);
      }
    }

    initAuthAndData();
  }, []);

  const saveSchedulesToServer = async (updatedSchedules: TaxSchedule[]) => {
    setSchedules(updatedSchedules);
    generateNotifications(updatedSchedules);
    try {
      localStorage.setItem('lx_mma_schedules', JSON.stringify(updatedSchedules));
    } catch (e) {
      // ignore
    }

    try {
      await fetch('/api/tax-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: updatedSchedules }),
      });
    } catch (err) {
      console.error('Failed to save schedules to server (static hosting mode):', err);
    }
  };

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

  const handleToggleComplete = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        return { ...s, completed: !s.completed, status: !s.completed ? 'completed' : 'upcoming' } as TaxSchedule;
      }
      return s;
    });
    saveSchedulesToServer(updated);
  };

  const handleToggleImportant = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        return { ...s, isImportant: !s.isImportant } as TaxSchedule;
      }
      return s;
    });
    saveSchedulesToServer(updated);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('정말 이 세무 일정을 삭제하시겠습니까?')) {
      const updated = schedules.filter((s) => s.id !== id);
      saveSchedulesToServer(updated);
    }
  };

  const handleSaveSchedule = (scheduleData: Partial<TaxSchedule>) => {
    const existingIndex = schedules.findIndex((s) => s.id === scheduleData.id);
    let updated: TaxSchedule[];
    if (existingIndex >= 0) {
      updated = schedules.map((s) => (s.id === scheduleData.id ? ({ ...s, ...scheduleData } as TaxSchedule) : s));
    } else {
      updated = [scheduleData as TaxSchedule, ...schedules];
    }
    saveSchedulesToServer(updated);
    setEditingSchedule(null);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) {
      return false;
    }
    if (
      searchQuery.trim() &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter === 'pending' && s.completed) return false;
    if (statusFilter === 'completed' && !s.completed) return false;
    if (statusFilter === 'important' && !s.isImportant) return false;
    if (statusFilter === 'upcoming30') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(s.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (s.completed || diffDays < 0 || diffDays > 30) return false;
    }

    return true;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!currentUser) {
    return <LoginModal onLoginSuccess={(user) => { setCurrentUser(user); setIsLoginModalOpen(false); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-slate-50 to-emerald-50/20 text-slate-800 font-sans antialiased">
      <Navbar
        onOpenAddModal={() => {
          setEditingSchedule(null);
          setIsAddModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadCount={unreadCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview schedules={schedules} activeFilter={statusFilter} onSelectFilter={setStatusFilter} />

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

        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-emerald-100 shadow-xs">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-600">세무 일정 불러오는 중...</p>
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
            onDelete={handleDeleteSchedule}
            onAddForDate={(dateStr) => {
              setEditingSchedule({ dueDate: dateStr } as any);
              setIsAddModalOpen(true);
            }}
          />
        ) : sortedSchedules.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 shadow-xs p-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">검색 결과가 없습니다</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              선택한 카테고리나 검색어에 해당하는 세무 일정이 없습니다.
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

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 border-t border-emerald-100 text-center text-xs text-slate-500">
        <p>© 2026 LX MMA 세무일정 관리 프로그램. All rights reserved.</p>
      </footer>

      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
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
