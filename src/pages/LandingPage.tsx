import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DA251D] text-white font-serif overflow-x-hidden relative">
      {/* Cờ Đảng / Cờ Tổ quốc overlay text/shapes */}
      <div className="absolute top-[-10%] right-[-5%] opacity-10 pointer-events-none">
        <Star className="w-[800px] h-[800px] text-yellow-400 fill-yellow-400" />
      </div>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#DA251D]/90 backdrop-blur-md z-50 border-b border-red-800">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-14 h-14 bg-[#DA251D] rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-yellow-400">
              <span className="text-yellow-400 font-black text-[14px] leading-none">AI</span>
              <span className="text-yellow-400 font-bold text-[6px] leading-none mt-0.5 text-center">SOẠN THẢO<br/>VĂN BẢN<br/>NHÀ NƯỚC</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-yellow-100 tracking-wide">
            <div className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors">
              SẢN PHẨM <ChevronDown className="w-4 h-4" />
            </div>
            <a href="#" className="hover:text-yellow-400 transition-colors">CHÍNH SÁCH</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">HỢP TÁC – AFFILIATE</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">HƯỚNG DẪN</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">TIN TỨC</a>
          </div>

          <div className="w-14"></div> {/* Spacer for symmetry if needed, or login button */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#b51f18] border border-red-700 px-5 py-2.5 rounded-full shadow-sm mb-12"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-100 font-bold text-sm">Hệ thống AI chuyên dụng khối Đảng và Nhà nước</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-10 text-yellow-400"
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            AI SOẠN THẢO VĂN BẢN NHÀ NƯỚC
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-yellow-50 max-w-3xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Trợ lý thông minh giúp Cán bộ, Công chức tối ưu hóa quy trình làm việc. Soạn thảo văn bản, tra cứu pháp luật và hỗ trợ nghiệp vụ chính xác, bảo mật.
          </motion.p>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-8 mb-14 text-white font-semibold text-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-yellow-400 stroke-[3]" />
              Chuẩn thể thức NĐ 30 & HD 36
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-yellow-400 stroke-[3]" />
              Bảo mật dữ liệu tuyệt đối
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-yellow-400 stroke-[3]" />
              Triển khai VB cấp trên thông minh
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/login')}
              className="bg-yellow-400 text-[#DA251D] px-12 py-5 rounded-full text-lg font-black hover:bg-yellow-300 transition-all shadow-xl shadow-red-900/50 active:scale-95"
            >
              Vào nền tảng soạn thảo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto border-t border-red-800 pt-12">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-yellow-200/50 tracking-[0.2em] uppercase">
              ĐƠN VỊ ĐANG TRIỂN KHAI:
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 text-yellow-100 font-bold text-sm opacity-80">
            <span className="hover:opacity-100 transition-opacity cursor-default">Tỉnh ủy Tuyên Quang</span>
            <span className="hover:opacity-100 transition-opacity cursor-default">Đảng ủy xã Nhữ Khê</span>
            <span className="hover:opacity-100 transition-opacity cursor-default">Bộ Nội vụ</span>
            <span className="hover:opacity-100 transition-opacity cursor-default">Văn phòng Trung ương Đảng</span>
          </div>
        </div>
      </section>
    </div>
  );
}
