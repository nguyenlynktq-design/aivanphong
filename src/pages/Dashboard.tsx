import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Document, DocType, DocCategory, UserProfile } from '../types';
import { motion } from 'motion/react';
import {
  FileText, Clock, Plus, ChevronRight, Sparkles, TrendingUp,
  Users, ArrowUpRight, FileCheck, Building2, Star, Send,
  ClipboardList, BarChart3, FileUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, cn, handleFirestoreError, OperationType } from '../lib/utils';
import { Card, StatCard } from '../components/Card';
import { Table, TableRow, TableCell } from '../components/Table';
import { getDocLabel } from '../config/docTypes';

// Loại VB phổ biến cho quick-create
const QUICK_CREATE = [
  { type: 'thong_bao',   label: 'Thông báo',   icon: FileText,      cat: 'government' as DocCategory },
  { type: 'quyet_dinh',  label: 'Quyết định',   icon: FileCheck,     cat: 'government' as DocCategory },
  { type: 'cong_van',    label: 'Công văn',     icon: Send,          cat: 'government' as DocCategory },
  { type: 'bao_cao',     label: 'Báo cáo',      icon: BarChart3,     cat: 'government' as DocCategory },
  { type: 'to_trinh',    label: 'Tờ trình',     icon: TrendingUp,    cat: 'government' as DocCategory },
  { type: 'ke_hoach',    label: 'Kế hoạch',     icon: ClipboardList, cat: 'government' as DocCategory },
];

export default function Dashboard({ user, profile }: { user: any; profile: UserProfile | null }) {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      try {
        // Recent 5
        const q = query(
          collection(db, 'documents'),
          where('authorUid', '==', user.uid),
          orderBy('updatedAt', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        setRecentDocs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Document)));

        // All docs for stats
        const allQ = query(collection(db, 'documents'), where('authorUid', '==', user.uid));
        const allSnap = await getDocs(allQ);
        setAllDocs(allSnap.docs.map(d => ({ id: d.id, ...d.data() } as Document)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'documents');
      }
      setLoading(false);
    };
    fetchDocs();
  }, [user]);

  // Stats
  const stats = useMemo(() => {
    const total = allDocs.length;
    const draft = allDocs.filter(d => d.status === 'draft').length;
    const final = allDocs.filter(d => d.status === 'final').length;
    const gov = allDocs.filter(d => (d.category || 'government') === 'government').length;
    const party = allDocs.filter(d => d.category === 'party').length;

    // Top 3 loại VB phổ biến
    const typeCounts: Record<string, number> = {};
    allDocs.forEach(d => {
      const key = `${d.type}|${d.category || 'government'}`;
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    });
    const topTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, count]) => {
        const [type, cat] = key.split('|');
        return { type, category: cat as DocCategory, count, label: getDocLabel(type as DocType, cat as DocCategory) };
      });

    return { total, draft, final, gov, party, topTypes };
  }, [allDocs]);

  // Greeting based on time
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark">
            {getGreeting()}, {profile?.displayName || user?.displayName || 'Bạn'}
          </h1>
          <p className="text-text-muted">
            {profile?.organization ? `${profile.organization} • ` : ''}
            Hôm nay bạn muốn soạn thảo văn bản gì?
          </p>
        </div>
        <Link to="/editor" className="btn-primary">
          <Plus className="w-5 h-5" />
          Tạo văn bản mới
        </Link>
      </header>

      {/* Stats Grid — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng văn bản"
          value={stats.total.toString()}
          icon={<FileText className="w-6 h-6" />}
        />
        <StatCard
          title="Đang soạn"
          value={stats.draft.toString()}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="VB Chính quyền"
          value={stats.gov.toString()}
          icon={<Building2 className="w-6 h-6" />}
        />
        <StatCard
          title="VB Đảng"
          value={stats.party.toString()}
          icon={<Star className="w-6 h-6" />}
        />
      </div>

      {/* Quick Create — Grid cards */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 bg-brand-orange rounded-full" />
          Tạo nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_CREATE.map(qc => {
            const Icon = qc.icon;
            return (
              <motion.button
                key={qc.type}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/editor?type=${qc.type}&category=${qc.cat}`)}
                className="admin-card p-4 flex flex-col items-center gap-2.5 hover:border-brand-red/30 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-red-50 text-brand-red rounded-xl flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-main group-hover:text-brand-red transition-colors">
                  {qc.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="w-1.5 h-6 bg-brand-red rounded-full" />
              Văn bản gần đây
            </h2>
            <Link to="/documents" className="btn-ghost text-sm font-bold">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Table headers={['Tên văn bản', 'Loại', 'Hệ thống', 'Trạng thái', 'Ngày']}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-text-muted">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <TableRow key={doc.id} onClick={() => navigate(`/editor/${doc.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 text-brand-red rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-brand-dark block truncate max-w-[200px]">{doc.title}</span>
                        {doc.trich_yeu && (
                          <span className="text-[10px] text-text-muted truncate block max-w-[200px]">{doc.trich_yeu}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-text-main">
                      {getDocLabel(doc.type as DocType, doc.category || 'government')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      doc.category === 'party'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    )}>
                      {doc.category === 'party' ? 'Đảng' : 'CQ'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      doc.status === 'final' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {doc.status === 'final' ? 'Xong' : 'Nháp'}
                    </span>
                  </TableCell>
                  <TableCell className="text-text-muted text-xs">
                    {formatDate(doc.updatedAt?.toDate() || new Date())}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-text-muted">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold">Bạn chưa có văn bản nào.</p>
                  <Link to="/editor" className="text-brand-red font-bold mt-2 inline-block hover:underline">Tạo ngay</Link>
                </TableCell>
              </TableRow>
            )}
          </Table>
        </div>

        {/* Sidebar — AI + Stats */}
        <div className="space-y-6">
          {/* AI Card */}
          <Card className="bg-gradient-to-br from-brand-dark to-slate-800 text-white border-none shadow-xl shadow-slate-200">
            <div className="w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-900/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Soạn thảo</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Tự động soạn nội dung, tối ưu văn phong, gợi ý căn cứ pháp lý — chuẩn NĐ30 và HD36.
            </p>
            <Link to="/editor" className="w-full btn-primary bg-brand-orange hover:bg-orange-600 shadow-orange-900/20">
              Bắt đầu soạn <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Card>

          {/* Top VB types */}
          {stats.topTypes.length > 0 && (
            <Card title="Loại VB phổ biến" icon={<BarChart3 className="w-5 h-5" />}>
              <div className="space-y-3">
                {stats.topTypes.map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        i === 0 ? 'bg-brand-red' : i === 1 ? 'bg-brand-orange' : 'bg-slate-300'
                      )} />
                      <span className="text-sm font-semibold text-text-main">{t.label}</span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold',
                        t.category === 'party' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                      )}>
                        {t.category === 'party' ? 'Đảng' : 'CQ'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-brand-dark">{t.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {/* Triển khai VB cấp trên */}
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-xl shadow-emerald-200">
            <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-4">
              <FileUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Triển khai VB cấp trên</h3>
            <p className="text-emerald-200 text-sm mb-5 leading-relaxed">
              Paste VB cấp trên → AI trích xuất nhiệm vụ → Tự động soạn KH, CV, BC triển khai.
            </p>
            <Link to="/trien-khai" className="w-full btn-primary bg-white/20 hover:bg-white/30 border-0">
              Bắt đầu <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Card>

          {/* Cấu hình cơ quan */}
          <Card title="Cấu hình cơ quan" icon={<Users className="w-5 h-5" />}>
            <p className="text-sm text-text-muted mb-4">Cập nhật thông tin cơ quan để tự động điền vào VB mới.</p>
            {profile?.organization && (
              <p className="text-xs font-semibold text-brand-dark bg-slate-50 p-2 rounded-lg mb-4 truncate">
                🏛️ {profile.organization}
              </p>
            )}
            <Link to="/profile" className="btn-secondary w-full">
              Cài đặt
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
