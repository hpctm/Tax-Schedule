import React, { useState } from 'react';
import { TaxSchedule, AIChatMessage } from '../types';
import { Bot, X, Send, Sparkles, User, HelpCircle, AlertCircle } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: TaxSchedule[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  schedules,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: '안녕하세요! 사내 세무 AI 어시스턴트입니다. 국세청 세무 일정, 법인세, 부가가치세, 원천세 신고에 대해 궁금한 점을 물어보세요.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-tax-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, schedulesContext: schedules }),
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: AIChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: data.error || '답변을 가져오는 중 오류가 발생했습니다. API 키 설정을 확인해주세요.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (e) {
      const errorMsg: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '서버 통신 중 오류가 발생했습니다.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetQuestions = [
    '법인세 신고 시 주요 제출 서류는 무엇인가요?',
    '부가가치세 예정신고와 확정신고의 차이점은?',
    '원천세 신고 및 납부 기한은 언제인가요?',
    '기한 내 세무신고를 누락했을 때 가산세는?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center">
                세무 AI 어시스턴트 <Sparkles className="w-4 h-4 ml-1.5 text-amber-300" />
              </h3>
              <p className="text-xs text-emerald-100">국세청 기준 세무 일정 및 실무 가이드 상담</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset suggestions */}
        <div className="px-6 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-xs font-semibold text-emerald-800 shrink-0">추천 질문:</span>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 bg-white border border-emerald-200/80 rounded-full text-xs text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-emerald-100 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-emerald-100 rounded-2xl px-4 py-3 text-sm text-slate-500 shadow-xs flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2 text-xs font-medium">세무 전문가 AI가 답변을 작성 중입니다...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="세무 일정이나 관련 규정에 대해 무엇이든 물어보세요..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-600/30 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
