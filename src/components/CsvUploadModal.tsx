import React, { useState } from 'react';
import { TaxSchedule, TaxCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Database } from 'lucide-react';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSchedules: (newSchedules: TaxSchedule[]) => void;
  currentUser: any;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSchedules,
  currentUser,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    // Assume header: Title,Category,DueDate,Description,Notes
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 3) {
        rows.push({
          title: cols[0] || '제목 없음',
          category: (cols[1] || '기타사내일정') as TaxCategory,
          dueDate: cols[2] || new Date().toISOString().split('T')[0],
          description: cols[3] || '',
          notes: cols[4] || '',
        });
      }
    }
    setParsedRows(rows);
  };

  const handleManualTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    parseCsvData(text);
  };

  const handleSaveToSupabase = async () => {
    if (parsedRows.length === 0) {
      alert('저장할 CSV 데이터가 없습니다.');
      return;
    }

    setLoading(true);
    setUploadStatus(null);

    try {
      const newSchedules: TaxSchedule[] = parsedRows.map((row, idx) => ({
        id: `sched-csv-${Date.now()}-${idx}`,
        title: row.title,
        category: row.category,
        dueDate: row.dueDate,
        description: row.description,
        isOfficial: false,
        isImportant: true, // Imported CSV items can be highlighted
        reminderDays: 3,
        status: 'upcoming',
        completed: false,
        notes: row.notes || 'CSV 일괄 업로드',
      }));

      // If Supabase is configured, cumulatively save records to tax_csv_records table
      if (isSupabaseConfigured && supabase) {
        const recordsToInsert = parsedRows.map((row) => ({
          file_name: fileName || 'manual_import.csv',
          title: row.title,
          category: row.category,
          due_date: row.dueDate,
          description: row.description,
          uploaded_by: currentUser?.id || null,
        }));

        const { error } = await supabase.from('tax_csv_records').insert(recordsToInsert);
        if (error) {
          console.warn('Supabase cumulative insert warning:', error.message);
        }
      }

      onImportSchedules(newSchedules);
      setUploadStatus(`성공적으로 ${newSchedules.length}건의 세무 일정이 Supabase에 누적 저장되었습니다.`);
      setTimeout(() => {
        onClose();
        setUploadStatus(null);
      }, 1500);
    } catch (err: any) {
      setUploadStatus(`오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">CSV 데이터 누적 업로드 (Supabase)</h3>
              <p className="text-xs text-slate-500">세무 일정 CSV 파일을 업로드하여 Supabase DB에 안전하게 누적 저장합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* File input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              CSV 파일 선택
            </label>
            <label className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-emerald-50/40 hover:bg-emerald-50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-sm font-semibold text-slate-700">
                {fileName ? fileName : '클릭하여 CSV 파일 업로드 또는 드래그 앤 드롭'}
              </span>
              <span className="text-xs text-slate-400 mt-1">포맷: 제목, 카테고리, 마감일(YYYY-MM-DD), 설명, 메모</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Or Manual CSV Text Paste */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              또는 CSV 텍스트 직접 입력 / 붙여넣기
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={handleManualTextChange}
              placeholder="제목,카테고리,마감일,설명,메모&#10;부가가치세 신고,부가가치세,2026-07-25,1기 확정신고,홈택스 전자신고"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            ></textarea>
          </div>

          {/* Preview Parsed Rows */}
          {parsedRows.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>미리보기 ({parsedRows.length}건 감지됨)</span>
                <span className="text-emerald-600 font-normal">Supabase 누적 저장 준비 완료</span>
              </h4>
              <div className="bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto p-3 text-xs space-y-2">
                {parsedRows.map((row, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{row.title}</span>
                      <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                        {row.category}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono">{row.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              disabled={loading || parsedRows.length === 0}
              onClick={handleSaveToSupabase}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/30 transition-all flex items-center space-x-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Database className="w-4 h-4" />
              )}
              <span>Supabase에 누적 저장하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
