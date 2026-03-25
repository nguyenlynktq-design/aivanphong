import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Document, DocType, DocCategory } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Search, Filter, Trash2, Edit3, Plus, ChevronDown,
  Building2, Star, Send, ClipboardList, Download,
} from 'lucide-react';
import { formatDate, cn, handleFirestoreError, OperationType } from '../lib/utils';
import { Table, TableRow, TableCell } from '../components/Table';
import { Input } from '../components/Form';
import { DOC_TYPES_ND30, DOC_TYPES_HD36, exportDocument } from '../services/gemini';
import { getDocLabel } from '../config/docTypes';

// Tab filters
const CATEGORY_TABS = [
  { id: 'all',        label: 'Tất cả',       icon: FileText },
  { id: 'government', label: 'Chính quyền',  icon: Building2 },
  { id: 'party',      label: 'Đảng',         icon: Star },
];

export default function DocumentList({ user }: { user: any }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortField, setSortField] = useState<'updatedAt' | 'title'>('updatedAt');
  const navigate = useNavigate();

  const fetchDocs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'documents'),
        where('authorUid', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Document));
      setDocuments(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa văn bản này?")) {
      try {
        await deleteDoc(doc(db, 'documents', id));
        setDocuments(documents.filter(d => d.id !== id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `documents/${id}`);
      }
    }
  };

  const handleExport = async (e: React.MouseEvent, docData: Document, type: 'docx' | 'pdf') => {
    e.stopPropagation();
    try { await exportDocument(type, docData); } catch (err) { console.error(err); }
  };

  // Filtered + sorted
  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.trich_yeu || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || d.type === filterType;
      const matchCat = filterCategory === 'all' || (d.category || 'government') === filterCategory;
      return matchSearch && matchType && matchCat;
    });
  }, [documents, searchTerm, filterType, filterCategory]);

  // Stats
  const docStats = useMemo(() => ({
    total: documents.length,
    gov: documents.filter(d => (d.category || 'government') === 'government').length,
    party: documents.filter(d => d.category === 'party').length,
    draft: documents.filter(d => d.status === 'draft').length,
    final: documents.filter(d => d.status === 'final').length,
  }), [documents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark">Văn bản của tôi</h1>
          <p className="text-text-muted">
            {docStats.total} văn bản •{' '}
            <span className="text-sky-600 font-semibold">{docStats.gov} CQ</span> •{' '}
            <span className="text-amber-600 font-semibold">{docStats.party} Đảng</span> •{' '}
            <span className="text-emerald-600 font-semibold">{docStats.final} hoàn thành</span>
          </p>
        </div>
        <Link to="/editor" className="btn-primary">
          <Plus className="w-5 h-5" />
          Tạo văn bản mới
        </Link>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {CATEGORY_TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'all' ? docStats.total : tab.id === 'government' ? docStats.gov : docStats.party;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border',
                filterCategory === tab.id
                  ? 'bg-brand-red text-white border-brand-red shadow-sm'
                  : 'bg-white border-slate-200 text-text-muted hover:border-brand-red/30 hover:text-brand-red'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                filterCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-text-muted'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Type Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label="Tìm kiếm"
            placeholder="Tên văn bản hoặc trích yếu..."
            icon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 space-y-1.5">
          <label className="text-sm font-bold text-text-main flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            Loại văn bản
          </label>
          <div className="relative">
            <select
              className="input-base appearance-none pr-10"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              {filterCategory !== 'party' && (
                <optgroup label="VB Hành chính (NĐ30)">
                  {DOC_TYPES_ND30.map(t => (
                    <option key={`nd30-${t.id}`} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              )}
              {filterCategory !== 'government' && (
                <optgroup label="VB Đảng (HD36)">
                  {DOC_TYPES_HD36.filter(t => filterCategory === 'party' || !DOC_TYPES_ND30.find(n => n.id === t.id)).map(t => (
                    <option key={`hd36-${t.id}`} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-text-muted">
        <p className="font-semibold">
          {filteredDocs.length} kết quả
          {searchTerm && ` cho "${searchTerm}"`}
          {filterType !== 'all' && ` • Loại: ${getDocLabel(filterType as DocType, filterCategory === 'party' ? 'party' : 'government')}`}
        </p>
      </div>

      {/* Documents Table */}
      <Table headers={['Tên văn bản', 'Loại', 'Hệ thống', 'Trạng thái', 'Ngày', 'Thao tác']}>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-text-muted">Đang tải danh sách...</TableCell>
          </TableRow>
        ) : filteredDocs.length > 0 ? (
          filteredDocs.map((d) => (
            <TableRow key={d.id} onClick={() => navigate(`/editor/${d.id}`)}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    d.category === 'party' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-brand-red'
                  )}>
                    {d.docGroup === 'cong_van' ? <Send className="w-4 h-4" /> :
                     d.docGroup === 'bien_ban' ? <ClipboardList className="w-4 h-4" /> :
                     <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-brand-dark block truncate max-w-[220px]">{d.title}</span>
                    {d.trich_yeu && (
                      <span className="text-[10px] text-text-muted truncate block max-w-[220px]">{d.trich_yeu}</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-text-main">
                  {getDocLabel(d.type as DocType, d.category || 'government')}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold',
                  (d.category || 'government') === 'party'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-sky-100 text-sky-700'
                )}>
                  {d.category === 'party' ? 'Đảng' : 'CQ'}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  d.status === 'final' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {d.status === 'final' ? 'Xong' : 'Nháp'}
                </span>
              </TableCell>
              <TableCell className="text-text-muted text-xs">{formatDate(d.updatedAt?.toDate() || new Date())}</TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/editor/${d.id}`); }}
                    className="p-1.5 hover:bg-white rounded-lg border border-border-light text-text-muted hover:text-brand-red shadow-sm transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleExport(e, d, 'docx')}
                    className="p-1.5 hover:bg-blue-50 rounded-lg border border-border-light text-text-muted hover:text-blue-600 shadow-sm transition-all"
                    title="Xuất DOCX"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, d.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg border border-border-light text-text-muted hover:text-red-600 shadow-sm transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-24 text-text-muted">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-lg font-bold text-brand-dark">Không tìm thấy văn bản nào</p>
              <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc tạo văn bản mới.</p>
            </TableCell>
          </TableRow>
        )}
      </Table>
    </div>
  );
}
