import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Document, DocType, DocCategory, DocGroup, UserProfile } from '../types';
import { generateDocContent, optimizeContent, exportDocument, getSigningOptions, suggestCanCu } from '../services/gemini';
import { getGroupedDocTypes, findDocType, suggestSoKyHieu, getDocLabel, DOC_GROUPS } from '../config/docTypes';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Sparkles, Wand2, Download, ChevronLeft, Loader2, FileText, ChevronRight,
  CheckCircle2, Building2, Send, ClipboardList, Star, FileJson
} from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';
import { DocumentPreview } from '../components/DocumentPreview';
import { Input, Select, TextArea } from '../components/Form';
import { Card } from '../components/Card';

// Icon map cho nhóm VB
const GROUP_ICONS: Record<DocGroup, React.ReactNode> = {
  co_ten_loai: <FileText className="w-5 h-5" />,
  cong_van: <Send className="w-5 h-5" />,
  bien_ban: <ClipboardList className="w-5 h-5" />,
};

const STEP_LABELS = [
  { num: 1, label: 'Thiết lập' },
  { num: 2, label: 'Nội dung' },
  { num: 3, label: 'Ký duyệt' },
];

// ============================================================
// Editor Component
// ============================================================
export default function Editor({ user, profile }: { user: any; profile: UserProfile | null }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- Document state ---
  const [docData, setDocData] = useState<Partial<Document>>({
    title: 'Văn bản không tên',
    type: 'thong_bao',
    category: 'government',
    docGroup: 'co_ten_loai',
    status: 'draft',
    noi_dung: '',
    co_quan_chu_quan: profile?.organization || '',
    co_quan_ban_hanh: profile?.department || '',
    so_ky_hieu: '',
    dia_danh: profile?.location || '',
    ngay: new Date().getDate().toString().padStart(2, '0'),
    thang: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    nam: new Date().getFullYear().toString(),
    trich_yeu: '',
    can_cu: [],
    kinh_gui: [],
    signature: {
      quyen_han_ky: '',
      kt_chuc_vu: '',
      chuc_vu_ky: profile?.position || '',
      nguoi_ky: profile?.displayName || '',
    },
    noi_nhan: ['Như trên;', 'Lưu: VT, .'],
  });

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [step, setStep] = useState(1);
  const [previewScale, setPreviewScale] = useState(0.55);

  // Derived
  const category = (docData.category || 'government') as DocCategory;
  const groupedTypes = useMemo(() => getGroupedDocTypes(category), [category]);
  const signingOptions = useMemo(() => getSigningOptions(category), [category]);
  const isBienBan = docData.docGroup === 'bien_ban';
  const isCongVan = docData.docGroup === 'cong_van';

  // --- Load existing doc ---
  useEffect(() => {
    if (id) {
      const fetchDoc = async () => {
        try {
          const docRef = doc(db, 'documents', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDocData({ id: docSnap.id, ...docSnap.data() } as Document);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `documents/${id}`);
        }
        setLoading(false);
      };
      fetchDoc();
    }
  }, [id]);

  // --- Auto-save ---
  useEffect(() => {
    if (!id || !user || step === 1) return;
    const timer = setTimeout(() => handleSave(), 3000);
    return () => clearTimeout(timer);
  }, [docData, id, user]);

  // --- Handlers ---
  const updateDoc = (updates: Partial<Document>) => {
    setDocData(prev => ({ ...prev, ...updates }));
  };

  const updateSignature = (updates: Partial<Document['signature']>) => {
    setDocData(prev => ({
      ...prev,
      signature: { ...prev.signature!, ...updates },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docId = id || Math.random().toString(36).substring(7);
      const docRef = doc(db, 'documents', docId);
      const payload = {
        ...docData,
        authorUid: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: docData.createdAt || serverTimestamp(),
      };
      await setDoc(docRef, payload);
      setLastSaved(new Date());
      if (!id) navigate(`/editor/${docId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `documents/${id || 'new'}`);
    }
    setSaving(false);
  };

  const handleAiGenerate = async () => {
    if (!prompt) return;
    setAiLoading(true);
    try {
      const content = await generateDocContent(prompt, docData.type || 'thong_bao', {
        category,
        docGroup: docData.docGroup,
        co_quan_chu_quan: docData.co_quan_chu_quan,
        co_quan_ban_hanh: docData.co_quan_ban_hanh,
        so_ky_hieu: docData.so_ky_hieu,
        dia_danh: docData.dia_danh,
        ngay: docData.ngay, thang: docData.thang, nam: docData.nam,
        nguoi_ky: docData.signature?.nguoi_ky,
        chuc_vu_ky: docData.signature?.chuc_vu_ky,
        quyen_han_ky: docData.signature?.quyen_han_ky,
      });
      updateDoc({ noi_dung: content });
      setStep(2);
    } catch (error) {
      console.error('AI Generation failed', error);
    }
    setAiLoading(false);
  };

  const handleAiOptimize = async () => {
    if (!docData.noi_dung) return;
    setAiLoading(true);
    try {
      const optimized = await optimizeContent(docData.noi_dung, category);
      updateDoc({ noi_dung: optimized });
    } catch (error) {
      console.error('AI Optimization failed', error);
    }
    setAiLoading(false);
  };

  const handleSuggestCanCu = async (cat: 'government' | 'party') => {
    if (!docData.trich_yeu) return;
    setAiLoading(true);
    try {
      const suggestStr = await suggestCanCu(docData.type || 'thong_bao', docData.trich_yeu, cat);
      const newCanCu = suggestStr.split('\n').map((x: string) => x.trim()).filter((x: string) => x.startsWith('Căn cứ') || x.length > 10);
      updateDoc({ can_cu: [...(docData.can_cu || []), ...newCanCu] });
    } catch (error) {
      console.error('Suggest căn cứ failed', error);
    }
    setAiLoading(false);
  };

  const handleExport = async (type: 'docx' | 'pdf') => {
    if (!docData.noi_dung) return;
    setExporting(true);
    try {
      await exportDocument(type, docData);
    } catch (error) {
      console.error(`Export ${type} failed`, error);
    }
    setExporting(false);
  };

  // --- Category change: reset type to first available ---
  const handleCategoryChange = (newCat: DocCategory) => {
    const firstType = getGroupedDocTypes(newCat)[0]?.types[0];
    updateDoc({
      category: newCat,
      type: firstType?.id as DocType,
      docGroup: firstType?.group || 'co_ten_loai',
    });
  };

  // --- Type selection ---
  const handleTypeSelect = (typeId: DocType, group: DocGroup) => {
    const meta = findDocType(typeId, category);
    updateDoc({
      type: typeId,
      docGroup: group,
      trich_yeu: docData.trich_yeu || '',
    });
    // Auto-suggest số ký hiệu
    if (meta) {
      const viTat = docData.co_quan_ban_hanh
        ? docData.co_quan_ban_hanh.split(' ').map(w => w[0]).join('').toUpperCase()
        : '...';
      updateDoc({ so_ky_hieu: suggestSoKyHieu(typeId, category, viTat) });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-bold">
        <Loader2 className="w-6 h-6 animate-spin mr-3" /> Đang tải văn bản...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* === HEADER BAR === */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/documents')} className="btn-secondary p-2.5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="space-y-0.5">
            <input
              type="text"
              value={docData.title}
              onChange={e => updateDoc({ title: e.target.value })}
              className="text-xl font-black bg-transparent border-none focus:ring-0 p-0 w-full md:w-80 text-brand-dark"
              placeholder="Tên văn bản..."
            />
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {id ? 'Đang chỉnh sửa' : 'Văn bản mới'} •{' '}
                {docData.status === 'final' ? 'Hoàn thành' : 'Bản nháp'} •{' '}
                {category === 'party' ? 'VB Đảng' : 'VB Chính quyền'}
              </p>
              {lastSaved && (
                <span className="text-[10px] text-emerald-500 font-bold">
                  • Đã lưu lúc {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-secondary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu
          </button>
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => handleExport('docx')}
              disabled={exporting}
              className="px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-slate-50 flex items-center gap-2 transition-colors border-r border-slate-200"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              DOCX
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="px-4 py-2.5 text-sm font-bold text-brand-dark hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* === MAIN LAYOUT: Preview + Form === */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* --- A4 Preview (Left) --- */}
        <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden border border-slate-300 relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-text-muted shadow-sm border border-slate-200">
              XEM TRƯỚC A4
            </div>
            <div className="flex bg-white/90 backdrop-blur rounded-full shadow-sm border border-slate-200 overflow-hidden">
              <button onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.05))} className="p-1.5 hover:bg-slate-100 border-r border-slate-200 text-text-muted">
                −
              </button>
              <div className="px-3 py-1.5 text-[10px] font-bold text-brand-dark min-w-[50px] text-center">
                {Math.round(previewScale * 100)}%
              </div>
              <button onClick={() => setPreviewScale(Math.min(1, previewScale + 0.05))} className="p-1.5 hover:bg-slate-100 text-text-muted">
                +
              </button>
            </div>
          </div>
          <div className="h-full overflow-auto p-12 dot-grid custom-scrollbar">
            <DocumentPreview data={docData} scale={previewScale} />
          </div>
        </div>

        {/* --- Multi-step Form (Right) --- */}
        <div className="w-full lg:w-[480px] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Step Indicator */}
          <div className="flex items-center justify-between px-2">
            {STEP_LABELS.map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(s.num)}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      step === s.num
                        ? 'bg-brand-red text-white shadow-lg shadow-red-100 scale-110'
                        : step > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-text-muted'
                    )}
                  >
                    {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{s.label}</span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={cn('w-14 h-0.5 rounded-full mb-5', step > s.num ? 'bg-emerald-500' : 'bg-slate-200')} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ========================================
                BƯỚC 1: THIẾT LẬP & AI
            ======================================== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* --- Chọn hệ thống: Chính quyền / Đảng --- */}
                <Card title="Hệ thống văn bản" subtitle="Chọn loại hệ thống văn bản cần soạn.">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCategoryChange('government')}
                      className={cn(
                        'p-3.5 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-2',
                        category === 'government'
                          ? 'border-brand-red bg-red-50 text-brand-red shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 text-text-muted'
                      )}
                    >
                      <Building2 className="w-5 h-5" />
                      Chính quyền
                      <span className="text-[10px] font-medium opacity-60">NĐ 30/2020</span>
                    </button>
                    <button
                      onClick={() => handleCategoryChange('party')}
                      className={cn(
                        'p-3.5 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-2',
                        category === 'party'
                          ? 'border-brand-red bg-red-50 text-brand-red shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 text-text-muted'
                      )}
                    >
                      <Star className="w-5 h-5" />
                      Đảng
                      <span className="text-[10px] font-medium opacity-60">HD 36-HD/VPTW</span>
                    </button>
                  </div>
                </Card>

                {/* --- Chọn nhóm VB + loại VB --- */}
                <Card title="Loại văn bản" subtitle={`${category === 'party' ? '14' : '24'} loại • phân 3 nhóm`}>
                  <div className="space-y-4">
                    {groupedTypes.map(({ group, types }) => (
                      <div key={group.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-text-muted">
                            {GROUP_ICONS[group.id]}
                          </div>
                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                            {group.label}
                          </span>
                          <span className="text-[10px] text-text-muted/60 ml-auto">{types.length} loại</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {types.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleTypeSelect(t.id, group.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                                docData.type === t.id && docData.docGroup === group.id
                                  ? 'bg-brand-red text-white border-brand-red shadow-sm'
                                  : 'bg-white border-slate-200 text-text-main hover:border-brand-red/40 hover:text-brand-red'
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* --- Thông tin cơ quan --- */}
                <Card title="Phát hành văn bản" subtitle="Số ký hiệu và chi tiết ngày tháng.">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        label="Số ký hiệu"
                        value={docData.so_ky_hieu || ''}
                        onChange={e => updateDoc({ so_ky_hieu: e.target.value })}
                        placeholder={category === 'party' ? 'Số ..-NQ/TU' : 'Số .../TB-UBND'}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Ngày"
                        value={docData.ngay || ''}
                        onChange={e => updateDoc({ ngay: e.target.value })}
                        placeholder="25"
                      />
                      <Input
                        label="Tháng"
                        value={docData.thang || ''}
                        onChange={e => updateDoc({ thang: e.target.value })}
                        placeholder="03"
                      />
                      <Input
                        label="Năm"
                        value={docData.nam || ''}
                        onChange={e => updateDoc({ nam: e.target.value })}
                        placeholder="2026"
                      />
                    </div>

                    <details className="group border border-slate-200 rounded-xl overflow-hidden mt-2">
                      <summary className="p-3 bg-slate-50 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                        <span>Chi tiết cơ quan (Đã tự động điền)</span>
                        <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                        <Input
                          label="Cơ quan chủ quản"
                          value={docData.co_quan_chu_quan || ''}
                          onChange={e => updateDoc({ co_quan_chu_quan: e.target.value })}
                          placeholder="VD: BỘ TÀI CHÍNH, TỈNH ỦY HÀ GIANG"
                        />
                        <Input
                          label="Cơ quan ban hành"
                          value={docData.co_quan_ban_hanh || ''}
                          onChange={e => updateDoc({ co_quan_ban_hanh: e.target.value })}
                          placeholder="VD: VỤ TỔ CHỨC CÁN BỘ, ĐẢNG ỦY XÃ ĐỒNG VĂN"
                        />
                        <Input
                          label="Địa danh"
                          value={docData.dia_danh || ''}
                          onChange={e => updateDoc({ dia_danh: e.target.value })}
                          placeholder="VD: Hà Nội"
                        />
                      </div>
                    </details>
                  </div>
                </Card>

                {/* --- AI Trợ lý --- */}
                <Card className="bg-red-50/50 border-brand-red/20 shadow-none">
                  <div className="flex items-center gap-3 text-brand-red font-bold mb-4">
                    <Sparkles className="w-5 h-5" />
                    Trợ lý AI soạn thảo
                  </div>
                  <TextArea
                    placeholder={`Nhập yêu cầu nội dung (VD: ${getDocLabel(docData.type as DocType, category)} về việc nghỉ lễ Quốc khánh 2/9)...`}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <button onClick={handleAiGenerate} disabled={aiLoading || !prompt} className="btn-primary w-full mt-3">
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    AI Sinh nội dung
                  </button>
                </Card>

                <button onClick={() => setStep(2)} className="btn-secondary w-full group">
                  Tiếp theo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* ========================================
                BƯỚC 2: NỘI DUNG CHI TIẾT
            ======================================== */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <Card title="Nội dung văn bản" subtitle="Trích yếu, căn cứ pháp lý và nội dung chính.">
                  <div className="space-y-4">
                    {/* Trích yếu */}
                    <Input
                      label={isCongVan ? 'V/v (Trích yếu)' : 'Trích yếu nội dung'}
                      value={docData.trich_yeu || ''}
                      onChange={e => updateDoc({ trich_yeu: e.target.value })}
                      placeholder={isCongVan ? 'V/v triệu tập hội nghị...' : 'về công tác cán bộ năm 2026'}
                    />

                    {/* Kính gửi (chỉ cho Công văn) */}
                    {isCongVan && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-text-main">Kính gửi</label>
                        <TextArea
                          value={(docData.kinh_gui || []).join('\n')}
                          onChange={e => updateDoc({ kinh_gui: e.target.value.split('\n').filter(Boolean) })}
                          placeholder="Mỗi dòng 1 đơn vị nhận:&#10;Ban Bí thư Trung ương Đảng&#10;Thủ tướng Chính phủ"
                          className="min-h-[80px] text-sm"
                        />
                        <p className="text-[10px] text-text-muted">
                          {category === 'party' ? '⚠️ Kính gửi: in thường, cỡ 14' : '⚠️ NĐ30: Kính gửi KHÔNG in đậm'}
                        </p>
                      </div>
                    )}

                    {/* Căn cứ pháp lý */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-text-main">Căn cứ pháp lý</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSuggestCanCu('government')}
                            disabled={aiLoading || !docData.trich_yeu}
                            className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded hover:bg-sky-600 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            Gợi ý (CQ - NĐ30)
                          </button>
                          <button
                            onClick={() => handleSuggestCanCu('party')}
                            disabled={aiLoading || !docData.trich_yeu}
                            className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <Star className="w-3 h-3 inline mr-1" />
                            Gợi ý (Đảng - HD36)
                          </button>
                        </div>
                      </div>
                      <TextArea
                        value={(docData.can_cu || []).join('\n')}
                        onChange={e => updateDoc({ can_cu: e.target.value.split('\n').filter(Boolean) })}
                        placeholder="Mỗi dòng 1 căn cứ:&#10;Căn cứ Luật Tổ chức Chính phủ ngày 19 tháng 6 năm 2015;&#10;Căn cứ Nghị định số 30/2020/NĐ-CP ngày..."
                        className="min-h-[100px] text-sm italic"
                      />
                      <p className="text-[10px] text-text-muted">
                        {category === 'party'
                          ? '⚠️ Căn cứ cuối dùng dấu phẩy (,), các căn cứ khác dùng chấm phẩy (;)'
                          : '⚠️ Mỗi căn cứ kết thúc bằng dấu chấm phẩy (;), căn cứ cuối bằng dấu phẩy (,)'}
                      </p>
                    </div>

                    {/* Nội dung chính */}
                    <TextArea
                      label="Nội dung chính"
                      value={docData.noi_dung || ''}
                      onChange={e => updateDoc({ noi_dung: e.target.value })}
                      className="min-h-[350px] font-serif leading-relaxed"
                      placeholder="Nhập nội dung văn bản..."
                    />

                    {/* AI Optimize */}
                    <button
                      onClick={handleAiOptimize}
                      disabled={aiLoading || !docData.noi_dung}
                      className="btn-secondary w-full text-brand-orange border-brand-orange/20 hover:bg-orange-50"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Tối ưu văn phong {category === 'party' ? '(HD36)' : '(NĐ30)'}
                    </button>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Quay lại
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 group">
                    Tiếp theo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================
                BƯỚC 3: KÝ DUYỆT & NƠI NHẬN
            ======================================== */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* --- Chữ ký (VB thường) --- */}
                {!isBienBan && (
                  <Card title="Ký duyệt" subtitle="Quyền hạn, chức vụ và người ký.">
                    <div className="space-y-4">
                      {/* Quyền hạn ký */}
                      <Select
                        label="Quyền hạn ký"
                        value={docData.signature?.quyen_han_ky || ''}
                        onChange={e => updateSignature({ quyen_han_ky: e.target.value })}
                        options={signingOptions}
                      />

                      {/* Chức vụ người đứng đầu (khi có quyền hạn TM./KT./TL.) */}
                      {docData.signature?.quyen_han_ky && (
                        <Input
                          label={`Chức vụ sau "${docData.signature.quyen_han_ky}"`}
                          value={(() => {
                            // Lấy phần sau "TM. " / "KT. " / "TL. "
                            const qh = docData.signature?.quyen_han_ky || '';
                            const full = qh; // VD: user sẽ nhập "TL. BỘ TRƯỞNG" hoặc "T/M ĐẢNG UỶ XÃ"
                            return full;
                          })()}
                          onChange={e => updateSignature({ quyen_han_ky: e.target.value })}
                          placeholder={
                            category === 'party'
                              ? 'VD: T/M ĐẢNG ỦY XÃ'
                              : 'VD: TL. BỘ TRƯỞNG'
                          }
                        />
                      )}

                      {/* KT chức vụ (khi TL+KT 3 dòng) */}
                      <Input
                        label="KT. Chức vụ (nếu TL+KT 3 dòng)"
                        value={docData.signature?.kt_chuc_vu || ''}
                        onChange={e => updateSignature({ kt_chuc_vu: e.target.value })}
                        placeholder="VD: KT. VỤ TRƯỞNG VỤ TỔ CHỨC CÁN BỘ (bỏ trống nếu không cần)"
                      />

                      {/* Chọn nhanh lãnh đạo */}
                      {profile?.leaders && profile.leaders.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">CHỌN NGƯỜI KÝ NHANH</label>
                          <div className="flex flex-wrap gap-2">
                            {profile.leaders.map((ldr, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => updateSignature({ chuc_vu_ky: ldr.position, nguoi_ky: ldr.name })}
                                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-brand-red rounded-lg transition-all border border-slate-200 hover:border-brand-red/30 shadow-sm"
                              >
                                {ldr.name} - {ldr.position}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {/* Chức vụ ký */}
                        <Input
                          label="Chức vụ người ký"
                          value={docData.signature?.chuc_vu_ky || ''}
                          onChange={e => updateSignature({ chuc_vu_ky: e.target.value })}
                          placeholder={category === 'party' ? 'VD: BÍ THƯ' : 'VD: VỤ TRƯỞNG'}
                        />

                        {/* Tên người ký */}
                        <Input
                          label="Họ tên người ký"
                          value={docData.signature?.nguoi_ky || ''}
                          onChange={e => updateSignature({ nguoi_ky: e.target.value })}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>

                      {/* Gợi ý thể thức */}
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                        <p className="font-bold">💡 Quy tắc thể thức chữ ký:</p>
                        {category === 'party' ? (
                          <>
                            <p>• Quyền hạn: T/M, K/T, T/L (dấu gạch chéo /)</p>
                            <p>• Chức vụ: IN HOA, <strong>không đậm</strong></p>
                            <p>• Họ tên: in thường, <strong>đậm</strong></p>
                            <p>• 4 dòng trống giữa chức vụ và tên</p>
                          </>
                        ) : (
                          <>
                            <p>• Quyền hạn: TM. KT. TL. TUQ. (dấu chấm .)</p>
                            <p>• Chức vụ: IN HOA, <strong>đậm</strong></p>
                            <p>• KT 3 dòng (TL+KT): dòng cuối không đậm</p>
                            <p>• 4 dòng trống (4 Paragraph rỗng) cho chữ ký</p>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* --- Chữ ký biên bản (2 bên) --- */}
                {isBienBan && (
                  <Card title="Chữ ký biên bản" subtitle="Thư ký (trái) + Chủ trì (phải)">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-text-muted uppercase">← Bên trái</p>
                        <Input
                          label="Chức vụ người ghi"
                          value={docData.chuc_vu_nguoi_ghi || ''}
                          onChange={e => updateDoc({ chuc_vu_nguoi_ghi: e.target.value })}
                          placeholder="NGƯỜI GHI BIÊN BẢN"
                        />
                        <Input
                          label="Họ tên"
                          value={docData.nguoi_ghi || ''}
                          onChange={e => updateDoc({ nguoi_ghi: e.target.value })}
                          placeholder="Trần Thị B"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-text-muted uppercase">Bên phải →</p>
                        <Input
                          label="Chức vụ chủ trì"
                          value={docData.chuc_vu_chu_tri || ''}
                          onChange={e => updateDoc({ chuc_vu_chu_tri: e.target.value })}
                          placeholder="CHỦ TRÌ HỘI NGHỊ"
                        />
                        <Input
                          label="Họ tên"
                          value={docData.chu_tri || ''}
                          onChange={e => updateDoc({ chu_tri: e.target.value })}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                    </div>

                    {/* Xác nhận (nếu có) */}
                    {category === 'party' && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                        <p className="text-xs font-bold text-text-muted">XÁC NHẬN (nếu có)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            label="Quyền hạn"
                            value={docData.xac_nhan?.quyen_han || ''}
                            onChange={e => updateDoc({ xac_nhan: { ...docData.xac_nhan!, quyen_han: e.target.value } })}
                            placeholder="T/L BAN TT VỤ"
                          />
                          <Input
                            label="Chức vụ"
                            value={docData.xac_nhan?.chuc_vu || ''}
                            onChange={e => updateDoc({ xac_nhan: { ...docData.xac_nhan!, chuc_vu: e.target.value } })}
                            placeholder="CHÁNH VP"
                          />
                          <Input
                            label="Họ tên"
                            value={docData.xac_nhan?.nguoi_ky || ''}
                            onChange={e => updateDoc({ xac_nhan: { ...docData.xac_nhan!, nguoi_ky: e.target.value } })}
                            placeholder="Lê Văn C"
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* --- Nơi nhận --- */}
                <Card title="Nơi nhận" subtitle={category === 'party' ? '"Nơi nhận:" có gạch chân (HD36)' : '"Nơi nhận:" đậm + nghiêng, cỡ 12 (NĐ30)'}>
                  <div className="space-y-3">
                    <TextArea
                      value={(docData.noi_nhan || []).join('\n')}
                      onChange={e => updateDoc({ noi_nhan: e.target.value.split('\n') })}
                      placeholder="Mỗi dòng 1 mục (bắt đầu bằng -):&#10;- Như trên;&#10;- Thường trực TU;&#10;- Lưu: VT, TC."
                      className="min-h-[120px] text-sm"
                    />
                    <p className="text-[10px] text-text-muted">
                      ⚠️ Mỗi dòng kết thúc bằng dấu chấm phẩy (;), dòng "Lưu:" kết thúc bằng dấu chấm (.)
                    </p>
                  </div>
                </Card>

                {/* --- Trạng thái --- */}
                <Card>
                  <Select
                    label="Trạng thái"
                    value={docData.status}
                    onChange={e => updateDoc({ status: e.target.value as 'draft' | 'final' })}
                    options={[
                      { value: 'draft', label: 'Bản nháp' },
                      { value: 'final', label: 'Hoàn thành' },
                    ]}
                  />
                </Card>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                    Quay lại
                  </button>
                  <button
                    onClick={() => {
                      handleSave();
                      navigate('/documents');
                    }}
                    className="btn-primary flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Hoàn tất
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
