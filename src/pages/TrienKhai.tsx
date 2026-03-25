import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileUp, Sparkles, ChevronRight, ChevronLeft, CheckCircle2,
  FileText, AlertTriangle, ArrowRight, Loader2, ClipboardList,
  Target, Building2, Calendar, Hash, BookOpen, Zap, Database, FileEdit,
  FileSpreadsheet, FileDown, FileType, UploadCloud,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/Card';
import { UserProfile, ExtractedTask, DocType, DocGroup } from '../types';
import { analyzeUpperDocument, generateDerivativeDoc, DERIVATIVE_MAP } from '../services/gemini';

const STEPS = ['Nhập văn bản cấp trên', 'Phân tích & chọn nhiệm vụ', 'Tạo VB triển khai'];

interface AnalysisResult {
  loai_vb: string;
  so_ky_hieu: string;
  co_quan_ban_hanh: string;
  ngay_ban_hanh: string;
  trich_yeu: string;
  vb_goc_ref?: string;
  muc_tieu?: string[];
  nhiem_vu: ExtractedTask[];
}

export default function TrienKhai({ user, profile }: { user: any; profile: UserProfile | null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [sampleDoc, setSampleDoc] = useState('');
  const [soLieu, setSoLieu] = useState('');
  const [promptExtra, setPromptExtra] = useState('');
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf' | 'xlsx'>('docx');
  const [uploading, setUploading] = useState<'upper' | 'sample' | 'data' | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'upper' | 'sample' | 'data') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(target);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to extract text');
      const data = await res.json();
      
      if (target === 'upper') setInputText(data.text);
      if (target === 'sample') setSampleDoc(data.text);
      if (target === 'data') setSoLieu(data.text);
    } catch (err: any) {
      setError(err.message || 'Lỗi bóc tách file. Vui lòng paste chay.');
    }
    setUploading(null);
    e.target.value = ''; // Reset input
  };

  // Suggestions based on VB type
  const suggestions = useMemo(() => {
    if (!analysis) return [];
    return DERIVATIVE_MAP[analysis.loai_vb] || DERIVATIVE_MAP['Nghị quyết'] || [];
  }, [analysis]);

  const selectedTasks = tasks.filter(t => t.selected);

  // ── Step 1: Phân tích VB ──
  const handleAnalyze = async () => {
    if (inputText.length < 100) {
      setError('Nội dung VB quá ngắn. Hãy paste đầy đủ nội dung văn bản cấp trên.');
      return;
    }
    setError('');
    setAnalyzing(true);
    try {
      const result = await analyzeUpperDocument(inputText);
      setAnalysis(result);
      const tasksWithSelection = (result.nhiem_vu || []).map((t: ExtractedTask) => ({
        ...t,
        selected: t.muc_do === 'cao',
      }));
      setTasks(tasksWithSelection);
      setStep(1);
    } catch (err: any) {
      setError(err.message || 'Không thể phân tích văn bản. Thử lại.');
    }
    setAnalyzing(false);
  };

  // ── Step 2: Toggle task selection ──
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };
  const selectAll = () => setTasks(prev => prev.map(t => ({ ...t, selected: true })));
  const deselectAll = () => setTasks(prev => prev.map(t => ({ ...t, selected: false })));

  // ── Step 3: Generate derivative doc ──
  const handleGenerate = async () => {
    if (!selectedDocType || selectedTasks.length === 0) {
      setError('Chọn ít nhất 1 nhiệm vụ và 1 loại VB triển khai.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const suggestion = suggestions.find(s => s.type === selectedDocType);
      const content = await generateDerivativeDoc(
        analysis,
        selectedDocType,
        suggestion?.label || 'Kế hoạch triển khai',
        selectedTasks,
        {
          co_quan_ban_hanh: profile?.department || profile?.organization || '',
          nguoi_ky: profile?.displayName || '',
          sampleDoc: sampleDoc || '',
          soLieu: soLieu || '',
          promptExtra: promptExtra || '',
        }
      );

      const trichYeu = `Triển khai ${analysis?.loai_vb} số ${analysis?.so_ky_hieu} về ${analysis?.trich_yeu || ''}`;
      const canCu = `Căn cứ ${analysis?.loai_vb} số ${analysis?.so_ky_hieu}, ngày ${analysis?.ngay_ban_hanh} của ${analysis?.co_quan_ban_hanh} về ${analysis?.trich_yeu};`;

      if (exportFormat === 'docx') {
        // Navigate to Editor with pre-filled data
        const params = new URLSearchParams({
          type: selectedDocType,
          category: 'party',
          prefill: 'true',
          upperDocRef: analysis?.so_ky_hieu || '',
          trich_yeu: trichYeu,
        });
        sessionStorage.setItem('prefill_content', content);
        sessionStorage.setItem('prefill_can_cu', JSON.stringify([canCu]));
        navigate(`/editor?${params.toString()}`);

      } else if (exportFormat === 'pdf') {
        // Build doc data and export PDF directly
        const docData = {
          type: selectedDocType,
          category: 'party',
          title: trichYeu,
          trich_yeu: trichYeu,
          co_quan_chu_quan: profile?.organization || '',
          don_vi_ban_hanh: profile?.department || '',
          body: content,
          can_cu: [canCu],
          upperDocRef: analysis?.so_ky_hieu || '',
        };
        const res = await fetch('/api/export/docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData),
        });
        if (!res.ok) throw new Error('Export DOCX failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${trichYeu.substring(0, 60)}.docx`;
        a.click();
        URL.revokeObjectURL(url);

      } else if (exportFormat === 'xlsx') {
        // Export Excel with tables
        const docData = {
          title: trichYeu,
          co_quan: profile?.department || profile?.organization || '',
          can_cu: canCu,
          content: content,
          tasks: selectedTasks,
          upperDoc: analysis,
          soLieu: soLieu || '',
        };
        const res = await fetch('/api/export/xlsx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docData),
        });
        if (!res.ok) throw new Error('Export Excel failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${trichYeu.substring(0, 60)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể soạn văn bản triển khai.');
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black text-brand-dark flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-red to-brand-orange rounded-xl flex items-center justify-center shadow-lg">
            <FileUp className="w-5 h-5 text-white" />
          </div>
          Triển khai VB cấp trên
        </h1>
        <p className="text-text-muted mt-1">
          Nhập VB cấp trên → AI phân tích nhiệm vụ → Tự động soạn VB triển khai
        </p>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-1',
              i < step ? 'bg-emerald-100 text-emerald-700' :
              i === step ? 'bg-brand-red text-white shadow-sm' :
              'bg-slate-100 text-text-muted'
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> :
               <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ STEP 0: NHẬP VĂN BẢN ════════ */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <Card className="!p-0 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                <FileText className="w-4 h-4 text-brand-red" />
                Nội dung VB cấp trên
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer text-xs font-bold text-brand-red bg-red-50 hover:bg-red-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border border-red-100">
                  {uploading === 'upper' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  Tải file (PDF/Word/Excel/Ảnh)
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e => handleFileUpload(e, 'upper')} disabled={uploading !== null} />
                </label>
                <span className="text-[10px] font-semibold text-text-muted bg-white px-2 py-0.5 rounded-full border">
                  {inputText.length.toLocaleString()} ký tự
                </span>
              </div>
            </div>
            <textarea
              className="w-full h-[400px] p-5 text-sm leading-relaxed resize-none focus:outline-none font-serif"
              placeholder="Paste toàn bộ nội dung VB cấp trên vào đây...&#10;&#10;Ví dụ: Nghị quyết, Chương trình hành động, Chỉ thị, Kế hoạch của Tỉnh ủy / Đảng ủy xã / UBND cấp trên..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              💡 Paste nội dung đầy đủ từ file PDF/DOCX để AI phân tích chính xác nhất.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={inputText.length < 100 || analyzing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Phân tích VB</>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ════════ STEP 1: PHÂN TÍCH & CHỌN NHIỆM VỤ ════════ */}
      {step === 1 && analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Metadata Card */}
          <Card className="bg-gradient-to-r from-slate-50 to-white">
            <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-red" /> Thông tin VB cấp trên
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: FileText, label: 'Loại VB', value: analysis.loai_vb },
                { icon: Hash, label: 'Số ký hiệu', value: analysis.so_ky_hieu },
                { icon: Building2, label: 'Cơ quan', value: analysis.co_quan_ban_hanh },
                { icon: Calendar, label: 'Ngày', value: analysis.ngay_ban_hanh },
                { icon: Target, label: 'VB gốc', value: analysis.vb_goc_ref || '—' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold mb-0.5">
                    <item.icon className="w-3 h-3" /> {item.label}
                  </div>
                  <p className="text-xs font-bold text-brand-dark truncate">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-100">
              <div className="text-[10px] text-text-muted font-semibold mb-0.5">📋 Trích yếu</div>
              <p className="text-xs text-brand-dark font-semibold">{analysis.trich_yeu}</p>
            </div>
          </Card>

          {/* Mục tiêu */}
          {analysis.muc_tieu && analysis.muc_tieu.length > 0 && (
            <Card>
              <h3 className="text-sm font-bold text-text-main mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-orange" /> Mục tiêu chính
              </h3>
              <ul className="space-y-1">
                {analysis.muc_tieu.map((mt, i) => (
                  <li key={i} className="text-xs text-text-main flex items-start gap-2">
                    <span className="text-brand-orange font-bold mt-0.5">•</span>{mt}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-red" />
                Nhiệm vụ trích xuất ({selectedTasks.length}/{tasks.length} đã chọn)
              </h3>
              <div className="flex gap-1">
                <button onClick={selectAll} className="text-[10px] font-bold text-brand-red hover:underline">Chọn tất cả</button>
                <span className="text-slate-300">|</span>
                <button onClick={deselectAll} className="text-[10px] font-bold text-text-muted hover:underline">Bỏ chọn</button>
              </div>
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    task.selected ? 'bg-red-50/50 border-brand-red/30' : 'bg-white border-slate-100 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      'w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all',
                      task.selected ? 'bg-brand-red border-brand-red' : 'border-slate-300'
                    )}>
                      {task.selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{task.stt}</span>
                        <span className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                          task.muc_do === 'cao' ? 'bg-red-100 text-red-700' :
                          task.muc_do === 'trung_binh' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        )}>
                          {task.muc_do === 'cao' ? '🔴 Cao' : task.muc_do === 'trung_binh' ? '🟡 TB' : '⚪ Thấp'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-brand-dark">{task.noi_dung}</p>
                      {task.chi_tiet && (
                        <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{task.chi_tiet}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {task.don_vi_thuc_hien && (
                          <span className="text-[9px] text-text-muted">🏢 {task.don_vi_thuc_hien}</span>
                        )}
                        {task.han_hoan_thanh && (
                          <span className="text-[9px] text-text-muted">⏰ {task.han_hoan_thanh}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(0)} className="btn-ghost text-sm">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={() => { if (selectedTasks.length > 0) setStep(2); else setError('Chọn ít nhất 1 nhiệm vụ.'); }}
              className="btn-primary"
              disabled={selectedTasks.length === 0}
            >
              Tiếp: Chọn loại VB <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ════════ STEP 2: CHỌN LOẠI VB & TẠO ════════ */}
      {step === 2 && analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Summary */}
          <Card className="bg-slate-50">
            <p className="text-xs text-text-muted">
              Triển khai <strong>{analysis.loai_vb}</strong> số <strong>{analysis.so_ky_hieu}</strong> |{' '}
              <strong>{selectedTasks.length}</strong> nhiệm vụ đã chọn
            </p>
          </Card>

          {/* Gợi ý loại VB */}
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-orange" />
            Chọn loại VB triển khai
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((sug) => (
              <motion.button
                key={sug.type}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDocType(sug.type)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  selectedDocType === sug.type
                    ? 'border-brand-red bg-red-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-brand-dark">{sug.label}</span>
                      {sug.priority === 'high' && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Khuyến nghị</span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Loại: {sug.type} | Nhóm: {sug.group === 'cong_van' ? 'Công văn' : sug.group === 'bien_ban' ? 'Biên bản' : 'Có tên loại'}
                    </p>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                    selectedDocType === sug.type ? 'border-brand-red bg-brand-red' : 'border-slate-300'
                  )}>
                    {selectedDocType === sug.type && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* VB mẫu tham khảo */}
          <Card className="!p-0 overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <FileEdit className="w-4 h-4" />
                VB mẫu tham khảo <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Tùy chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 flex items-center gap-1 px-2.5 py-1 rounded transition-colors border border-emerald-200">
                  {uploading === 'sample' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                  Tải file (File/Ảnh)
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e => handleFileUpload(e, 'sample')} disabled={uploading !== null} />
                </label>
                {sampleDoc && <span className="text-[10px] font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">{sampleDoc.length.toLocaleString()} ký tự</span>}
              </div>
            </div>
            <textarea
              className="w-full h-[160px] p-4 text-xs leading-relaxed resize-none focus:outline-none font-serif"
              placeholder="Paste VB mẫu của cấp mình đã soạn trước đó (nếu có) để AI học cách hành văn, văn phong, cấu trúc phù hợp với đơn vị...&#10;&#10;Ví dụ: CTr 05-CTr/ĐU xã Nhữ Khê — AI sẽ tham khảo cách viết, bố cục, ngôn ngữ từ VB mẫu này."
              value={sampleDoc}
              onChange={(e) => setSampleDoc(e.target.value)}
            />
          </Card>

          {/* Số liệu địa phương */}
          <Card className="!p-0 overflow-hidden">
            <div className="bg-sky-50 px-4 py-2.5 border-b border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-sky-800">
                <Database className="w-4 h-4" />
                Số liệu địa phương <span className="text-[9px] font-semibold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full">Tùy chọn</span>
              </div>
              <label className="cursor-pointer text-[10px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 flex items-center gap-1 px-2.5 py-1 rounded transition-colors border border-sky-200">
                {uploading === 'data' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                Tải file (File/Ảnh)
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={e => handleFileUpload(e, 'data')} disabled={uploading !== null} />
              </label>
            </div>
            <textarea
              className="w-full h-[120px] p-4 text-xs leading-relaxed resize-none focus:outline-none"
              placeholder="Nhập số liệu thực tế của đơn vị để AI cập nhật vào VB triển khai:&#10;&#10;Ví dụ:&#10;- Số DN hiện có: 29, HTX: 20, Hộ KD: 110&#10;- Mục tiêu 2030: tăng 25 DN, 25 HTX, 250 hộ KD&#10;- Thu ngân sách từ KTTN năm 2024: 3,5 tỷ đồng&#10;- Lao động khu vực tư nhân: 2.000 người"
              value={soLieu}
              onChange={(e) => setSoLieu(e.target.value)}
            />
          </Card>

          {/* Yêu cầu bổ sung */}
          <Card className="!p-0 overflow-hidden">
            <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <Sparkles className="w-4 h-4" />
                Yêu cầu bổ sung (Prompt AI) <span className="text-[9px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Tùy chọn</span>
              </div>
            </div>
            <textarea
              className="w-full h-[80px] p-4 text-xs leading-relaxed resize-none focus:outline-none"
              placeholder="Nhập thêm yêu cầu đặc biệt cho AI (VD: 'Viết ngắn gọn dưới 500 từ', 'Nhấn mạnh vào công tác chuyển đổi số', v.v.)"
              value={promptExtra}
              onChange={(e) => setPromptExtra(e.target.value)}
            />
          </Card>

          {/* Định dạng xuất file */}
          <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
            <FileDown className="w-4 h-4 text-violet-500" />
            Định dạng xuất file
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'docx' as const, label: 'Word (.docx)', icon: FileText, bg: '#eff6ff', border: '#3b82f6', desc: 'Mở trong Editor, chỉnh sửa tiếp' },
              { key: 'pdf' as const, label: 'PDF', icon: FileType, bg: '#fef2f2', border: '#ef4444', desc: 'Tải trực tiếp file DOCX→print' },
              { key: 'xlsx' as const, label: 'Excel (.xlsx)', icon: FileSpreadsheet, bg: '#ecfdf5', border: '#10b981', desc: 'Bảng biểu, số liệu, báo cáo' },
            ]).map((fmt) => (
              <button
                key={fmt.key}
                onClick={() => setExportFormat(fmt.key)}
                className="p-3 rounded-xl border-2 text-left transition-all"
                style={exportFormat === fmt.key
                  ? { borderColor: fmt.border, backgroundColor: fmt.bg }
                  : { borderColor: '#e2e8f0', backgroundColor: '#fff' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <fmt.icon className="w-5 h-5" style={{ color: fmt.border }} />
                  <span className="text-sm font-bold text-brand-dark">{fmt.label}</span>
                </div>
                <p className="text-[10px] text-text-muted">{fmt.desc}</p>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(1)} className="btn-ghost text-sm">
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedDocType || generating}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang soạn VB...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> AI Soạn VB triển khai</>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
