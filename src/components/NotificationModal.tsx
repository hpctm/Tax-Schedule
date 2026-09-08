import React from 'react';
import { TaxSchedule, NotificationItem } from '../types';
import { Bell, X, CheckCircle2, AlertTriangle, Clock, Info, ShieldCheck } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: TaxSchedule[];
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  schedules,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[80vh] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">세무 일정 알림 센터</h3>
              <p className="text-xs text-slate-500">기한 전 사전 알림 및 완료 후 후속 리마인더</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-2.5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-800">
            총 {notifications.length}개의 알림 항목
          </span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              모두 읽음/지우기
            </button>
          )}
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">새로운 알림이 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">세무 마감일이 임박하거나 완료된 일정이 있으면 여기에 표시됩니다.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const iconMap = {
                urgent: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />,
                warning: <Clock className="w-5 h-5 text-amber-600 shrink-0" />,
                success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
                info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
              };

              const bgMap = {
                urgent: 'bg-rose-50/80 border-rose-200',
                warning: 'bg-amber-50/80 border-amber-200',
                success: 'bg-emerald-50/80 border-emerald-200',
                info: 'bg-blue-50/80 border-blue-200',
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                    bgMap[notif.type] || 'bg-white border-slate-200'
                  } ${notif.isRead ? 'opacity-60 bg-white' : 'shadow-xs'}`}
                >
                  <div className="mt-0.5">{iconMap[notif.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{notif.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" title="안 읽은 알림"></span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 text-center shrink-0">
          <p className="text-xs text-slate-400">
            사내 세무 일정 알림은 설정된 D-day 기준 및 완료 후 자동 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
