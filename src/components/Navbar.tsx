import React from 'react';
import { Calendar, Bell, Plus, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  currentUser: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenNotifications,
  unreadCount,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">LX MMA 세무일정 관리</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 mr-1" /> Supabase 인증 연동
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-slate-200"
            title="알림 센터"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Add Schedule Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            일정 추가
          </button>

          {/* User profile / Logout */}
          {currentUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold" title={currentUser.email}>
                {currentUser.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
