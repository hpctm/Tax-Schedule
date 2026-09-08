import React, { useState, useEffect } from 'react';
import { TaxSchedule, NotificationItem, TaxCategory } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { ScheduleFilters } from './components/ScheduleFilters';
import { ScheduleCard } from './components/ScheduleCard';
import { CalendarView } from './components/CalendarView';
import { AddScheduleModal } from './components/AddScheduleModal';
import { NotificationModal } from './components/NotificationModal';
import { CsvUploadModal } from './components/CsvUploadModal';
import { LoginModal } from './components/LoginModal';
import { ShieldCheck, AlertCircle, Plus, Upload } from 'lucide-react';

const defaultSchedules: TaxSchedule[] = [
  {
    id: "sched-1",
    title: "1월 원천세 신고 및 납부",
    category: "원천세",
    dueDate: "2026-02-10",
    description: "전년도 12월분 소상공인/근로소득 원천징수세액 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "국세청 홈택스 전자신고 필수"
  },
  {
    id: "sched-2",
    title: "법인세 확정 신고 및 납부 (12월 결산법인)",
    category: "법인세",
    dueDate: "2026-03-31",
    description: "전기분 법인세 신고 및 납부 (재무제표, 세무조정계산서 제출)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 7,
    status: "upcoming",
    completed: false,
    notes: "회계법인 감사보고서 첨부 확인 필요"
  },
  {
    id: "sched-3",
    title: "4대사회보험 보수총액 통보 및 신고",
    category: "4대보험",
    dueDate: "2026-03-10",
    description: "전년도 보수총액 기준 고용/산재보험 정산 및 건강보험 연말정산",
    isOfficial: true,
    isImportant: false,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "국민건강보험공단 / 고용산재토탈서비스 신고"
  },
  {
    id: "sched-4",
    title: "1분기(1기) 부가가치세 예정신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-04-25",
    description: "1월 1일 ~ 3월 31일 기간에 대한 부가가치세 예정신고 (법인사업자 필수)",
    isOfficial: true,
    isImportant: true,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "예정고지 대상자는 고지서 납부"
  },
  {
    id: "sched-5",
    title: "종합소득세 확정 신고 및 납부",
    category: "소득세",
    dueDate: "2026-05-31",
    description: "개인사업자 및 프리랜서 등 종합소득세 확정신고",
    isOfficial: true,
    isImportant: true,
    reminderDays: 7,
    status: "upcoming",
    completed: false,
    notes: "성실신고확인대상자는 6월 30일까지"
  },
  {
    id: "sched-6",
    title: "1기 부가가치세 확정신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-07-25",
    description: "1기(1월 1일 ~ 6월 30일) 확정 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "신용카드발행세액공제 등 세무 대리인 검토"
  },
  {
    id: "sched-7",
    title: "법인세 중간예납 신고 및 납부",
    category: "법인세",
    dueDate: "2026-08-31",
    description: "상반기(1월 1일 ~ 6월 30일) 실적에 대한 법인세 중간예납",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "직전 사업년도 산출세액 기준 또는 가결산 선택"
  },
  {
    id: "sched-8",
    title: "2분기(2기) 부가가치세 예정신고 및 납부",
    category: "부가가치세",
    dueDate: "2026-10-25",
    description: "7월 1일 ~ 9월 30일 기간에 대한 부가가치세 예정신고",
    isOfficial: true,
    isImportant: false,
    reminderDays: 3,
    status: "upcoming",
    completed: false,
    notes: "법인사업자 예정신고 대상"
  },
  {
    id: "sched-9",
    title: "2기 부가가치세 확정신고 및 납부",
    category: "부가가치세",
    dueDate: "2027-01-25",
    description: "2기(7월 1일 ~ 12월 31일) 확정 부가가치세 신고 및 납부",
    isOfficial: true,
    isImportant: true,
    reminderDays: 5,
    status: "upcoming",
    completed: false,
    notes: "연말 세무마감과 연계하여 철저한 자료 준비"
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<TaxSchedule[]>(defaultSchedules);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'important'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TaxSchedule | null>(null);

  // Check Supabase session on mount
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

          // Fetch schedules from Supabase DB
          const { data, error } = await supabase.from('tax_schedules').select('*');
          if (!error && data && data.length > 0) {
            const formatted = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              dueDate: item.due_date,
              description: item.description,
              isOfficial: item.is_official,
              isImportant: item.is_important,
              reminderDays: item.reminder_days,
              status: item.status,
              completed: item.completed,
              notes: item.notes,
            }));
            setSchedules(formatted);
            generateNotifications(formatted);
          } else {
            generateNotifications(defaultSchedules);
          }
        } catch (e) {
          console.error('Supabase init error:', e);
          generateNotifications(defaultSchedules);
        }
      } else {
        // If not configured, allow demo user bypass
        setCurrentUser({ email: 'lxmma.admin@lx.com', id: 'demo-user' });
        generateNotifications(defaultSchedules);
      }
      setIsLoading(false);
    }

    initAuthAndData();
  }, []);

  const saveSchedulesToSupabaseOrLocal = async (updatedSchedules: TaxSchedule[]) => {
    setSchedules(updatedSchedules);
    generateNotifications(updatedSchedules);

    if (isSupabaseConfigured && supabase && currentUser) {
      try {
        for (const s of updatedSchedules) {
          await supabase.from('tax_schedules').upsert({
            id: s.id,
            title: s.title,
            category: s.category,
            due_date: s.dueDate,
            description: s.description,
            is_official: s.isOfficial,
            is_important: s.isImportant,
            reminder_days: s.reminderDays,
            status: s.status,
            completed: s.completed,
            notes: s.notes,
            user_id: currentUser.id !== 'demo-user' ? currentUser.id : null,
          });
        }
      } catch (err) {
        console.error('Failed to sync with Supabase:', err);
      }
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
    saveSchedulesToSupabaseOrLocal(updated);
  };

  const handleToggleImportant = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        return { ...s, isImportant: !s.isImportant } as TaxSchedule;
      }
      return s;
    });
    saveSchedulesToSupabaseOrLocal(updated);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('정말 이 세무 일정을 삭제하시겠습니까?')) {
      const updated = schedules.filter((s) => s.id !== id);
      saveSchedulesToSupabaseOrLocal(updated);

      if (isSupabaseConfigured && supabase) {
        await supabase.from('tax_schedules').delete().eq('id', id);
      }
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
    saveSchedulesToSupabaseOrLocal(updated);
    setEditingSchedule(null);
  };

  const handleImportCsvSchedules = (newSchedules: TaxSchedule[]) => {
    const combined = [...newSchedules, ...schedules];
    saveSchedulesToSupabaseOrLocal(combined);
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
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        unreadCount={unreadCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>접속 사용자: {currentUser.email} (Supabase 인증됨)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              LX MMA 정확하고 체계적인 세무 캘린더
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              법인세, 부가가치세, 원천세 및 CSV 데이터 누적 저장을 Supabase와 연동하여 안전하게 관리하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-3 rounded-2xl text-sm font-semibold text-emerald-800 bg-white hover:bg-emerald-50 shadow-md transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 mr-2 text-emerald-600" />
              CSV 데이터 누적 업로드
            </button>
          </div>
        </div>

        <StatsOverview schedules={schedules} />

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
              <p className="text-sm font-medium text-slate-600">Supabase 데이터 동기화 중...</p>
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
        <p>© 2026 LX MMA 세무일정 관리 프로그램 (Supabase Auth & Database Integrated). All rights reserved.</p>
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

      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSchedules={handleImportCsvSchedules}
        currentUser={currentUser}
      />
    </div>
  );
}
