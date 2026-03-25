import { motion } from 'motion/react';
import { 
  Save, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  FileText, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function DesignSystem() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-black text-brand-dark">Design System: AI Soạn thảo VB</h1>
        <p className="text-text-muted text-lg">Hệ thống ngôn ngữ thiết kế tối giản, chuyên nghiệp và tin cậy cho khối hành chính nhà nước.</p>
      </header>

      {/* 1. Colors */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          1. Bảng màu (Color Palette)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorCard color="bg-brand-red" name="Brand Red" hex="#D32F2F" text="text-white" />
          <ColorCard color="bg-brand-orange" name="Brand Orange" hex="#FF5722" text="text-white" />
          <ColorCard color="bg-brand-dark" name="Brand Dark" hex="#1E293B" text="text-white" />
          <ColorCard color="bg-bg-main" name="Background" hex="#F8FAFC" text="text-text-main" border />
          <ColorCard color="bg-surface" name="Surface" hex="#FFFFFF" text="text-text-main" border />
          <ColorCard color="bg-border-light" name="Border" hex="#E2E8F0" text="text-text-main" />
        </div>
      </section>

      {/* 2. Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          2. Typography
        </h2>
        <div className="admin-card p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest">Heading 1 / Black</p>
            <h1 className="text-4xl font-black">Cộng hòa Xã hội Chủ nghĩa Việt Nam</h1>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest">Heading 2 / Bold</p>
            <h2 className="text-2xl font-bold">Quyết định về việc ban hành quy chế</h2>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest">Body / Regular</p>
            <p className="text-text-main leading-relaxed">Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư; Căn cứ chức năng, nhiệm vụ và quyền hạn của đơn vị.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-brand-red uppercase tracking-widest">Label / Muted</p>
            <p className="text-text-muted text-sm italic">Ghi chú: Văn bản này được soạn thảo bởi trợ lý AI.</p>
          </div>
        </div>
      </section>

      {/* 3. Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          3. Nút bấm (Buttons)
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Primary Button
          </button>
          <button className="btn-secondary">
            <Save className="w-4 h-4" />
            Secondary Button
          </button>
          <button className="btn-ghost">
            <Trash2 className="w-4 h-4" />
            Ghost Button
          </button>
          <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
            Success
          </button>
        </div>
      </section>

      {/* 4. Form Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          4. Thành phần Form
        </h2>
        <div className="admin-card p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Tiêu đề văn bản</label>
            <input type="text" className="input-base" placeholder="Nhập tiêu đề..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Loại văn bản</label>
            <div className="relative">
              <select className="input-base appearance-none pr-10">
                <option>Thông báo</option>
                <option>Quyết định</option>
                <option>Công văn</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Ngày ban hành</label>
            <div className="relative">
              <input type="date" className="input-base pl-10" />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-main">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input type="text" className="input-base pl-10" placeholder="Tìm kiếm văn bản..." />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-red rounded-full" />
          5. Bảng dữ liệu (Table)
        </h2>
        <div className="admin-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border-light">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Tên văn bản</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Loại</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 text-brand-red rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Thông báo số 0{i}/TB-UBND</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">Thông báo</td>
                  <td className="px-6 py-4 text-sm text-text-muted">24/03/2026</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-text-muted transition-all">
                      <Filter className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. AI Elements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-2 h-8 bg-brand-orange rounded-full" />
          6. AI & Technology Elements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card p-6 bg-gradient-to-br from-white to-orange-50/30 border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Trợ lý AI soạn thảo</h3>
                <p className="text-xs text-text-muted">Đang xử lý nội dung văn bản...</p>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-orange"
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>

          <div className="admin-card p-6 flex items-center gap-4 border-emerald-100 bg-emerald-50/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <h3 className="font-bold text-emerald-900">Kiểm tra thể thức hoàn tất</h3>
              <p className="text-sm text-emerald-700">Văn bản tuân thủ 100% Nghị định 30/2020/NĐ-CP.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorCard({ color, name, hex, text, border }: { color: string, name: string, hex: string, text: string, border?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl space-y-2 ${border ? 'border border-border-light' : ''}`}>
      <div className={`h-16 w-full rounded-xl ${color}`} />
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{name}</p>
        <p className={`font-mono text-sm ${text}`}>{hex}</p>
      </div>
    </div>
  );
}
