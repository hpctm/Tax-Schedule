import React from 'react';
import { Calendar, Bell, Bot, Plus, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenAIModal: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenAIModal,
  onOpenNotifications,
  unreadCount,
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
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">사내 세무 일정 관리</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 mr-1" /> 국세청 공인
              </span>
            </div>
            <p className="text-xs text-slate-500">Corporate Tax Filing & Payment Schedule Hub</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAIModal}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
            title="세무 AI 어시스턴트"
          >
            <Bot className="w-4 h-4 mr-1.5 text-emerald-600" />
            <span className="hidden sm:inline">세무 AI 상담</span>
          </button>

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
        </div>
      </div>
    </header>
  );
};
