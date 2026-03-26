import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, ChevronDown, Phone, Mail, Send } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', website: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    // Tạo cấu trúc link mailto:
    const subject = encodeURIComponent(`[AI VĂN PHÒNG] Thư liên hệ mới từ ${formData.name}`);
    const body = encodeURIComponent(`Họ và tên: ${formData.name}\nEmail: ${formData.email}\nWebsite: ${formData.website || "Không có"}\n\nNội dung:\n${formData.message}`);
    
    // Mở hòm thư mặc định của thiết bị
    window.location.href = `mailto:nguyenlynktq@gmail.com?subject=${subject}&body=${body}`;
    
    // Cập nhật trạng thái thành công
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', website: '', message: '' });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white dot-grid font-sans overflow-x-hidden relative flex flex-col text-gray-800">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-16 h-16 bg-[#b91c1c] rounded-full flex flex-col items-center justify-center shadow-lg border-[3px] border-white ring-1 ring-red-900/10">
              <span className="text-yellow-400 font-serif font-black text-[24px] leading-none mb-0.5 tracking-tight">AI</span>
              <span className="text-yellow-400 font-bold text-[9px] leading-none text-center tracking-widest">VĂN PHÒNG</span>
            </div>
            <div className="hidden sm:block font-bold text-xl text-[#0a2540]">AI VĂN PHÒNG</div>
          </div>
          
          {/* Menu */}
          <div className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-[#0a2540] tracking-wide uppercase">
            <a href="#san-pham" className="hover:text-blue-600 transition-colors flex items-center gap-1">Sản phẩm <ChevronDown className="w-4 h-4" /></a>
            <a href="#chinh-sach" className="hover:text-blue-600 transition-colors cursor-pointer">Chính sách</a>
            <a href="#hop-tac" className="hover:text-blue-600 transition-colors cursor-pointer">Hợp tác - Affiliate</a>
            <a href="#huong-dan" className="hover:text-blue-600 transition-colors cursor-pointer">Hướng dẫn</a>
            <a href="#tin-tuc" className="hover:text-blue-600 transition-colors cursor-pointer">Tin tức</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-sm">
              <span className="font-bold text-[#0a2540] flex items-center gap-1"><Phone className="w-4 h-4 text-[#d32f2f]"/> Hotline:</span>
              <a href="tel:0962859488" className="text-[#d32f2f] font-black text-lg">0962.859.488</a>
            </div>
            <button onClick={() => navigate('/login')} className="bg-[#0a2540] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-900 transition-colors">
              Đăng nhập
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6" id="san-pham">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-full shadow-sm mb-10">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-blue-700 font-bold text-[13px]">Văn phòng AI chuyên dụng cho khối hành chính</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-r from-[#d32f2f] to-[#f57c00] bg-clip-text text-transparent">
            AI VĂN PHÒNG
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Trợ lý thông minh giúp Cán bộ, Công chức tối ưu hóa quy trình làm việc. Soạn thảo văn bản, tra cứu pháp luật và hỗ trợ nghiệp vụ chính xác, bảo mật.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-8 mb-14 text-gray-600 font-medium text-sm">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Soạn thảo tự động</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Nghiệp vụ chuyên sâu</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> An toàn bảo mật</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <button onClick={() => navigate('/login')} className="bg-[#d32f2f] text-white px-10 py-4 rounded-full text-[15px] font-bold hover:bg-[#b71c1c] transition-all shadow-xl shadow-red-900/20 active:scale-95">
              Đăng ký miễn phí ngay
            </button>
          </motion.div>
        </div>
      </section>

      {/* Partnership Policy */}
      <section className="py-20 px-6 bg-gray-50/50 border-y border-gray-100" id="chinh-sach">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10 text-[#0a2540] leading-tight uppercase">AI VĂN PHÒNG CÔNG BỐ CHÍNH SÁCH ĐỐI TÁC:<br/><span className="text-[#d32f2f]">THU NHẬP ĐỘT PHÁ ĐẾN 30% DOANH THU</span></h2>
          <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="font-bold text-lg text-[#0a2540]">Bạn đang tìm kiếm một cơ hội gia tăng thu nhập bền vững trong kỷ nguyên AI? Bạn mong muốn cộng tác cùng một hệ thống minh bạch, hiện đại và không rào cản?</p>
            <p>Với triết lý "Hợp tác cùng phát triển", chúng tôi không chỉ mang đến giải pháp công nghệ vượt trội mà còn xây dựng một hệ sinh thái thu nhập hấp dẫn nhất thị trường hiện nay.</p>
            
            <h3 className="text-xl font-bold font-serif text-[#0a2540] mt-10">1. KHÔNG RÀO CẢN: Mọi thành viên đều là Đối tác</h3>
            <p>Khác với các chương trình truyền thống yêu cầu ký kết phức tạp, tại <strong>AI VĂN PHÒNG</strong>, chúng tôi tin rằng mỗi người dùng đều có thể trở thành một đại sứ thương hiệu.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cấp độ mặc định:</strong> Ngay khi đăng ký tài khoản, bạn nghiễm nhiên trở thành Đối tác Cấp 1.</li>
              <li><strong>Hoa hồng khởi điểm:</strong> Nhận ngay <strong>10%</strong> doanh thu trên mỗi đơn hàng thành công.</li>
              <li><strong>Điều kiện:</strong> Không áp số, không yêu cầu kinh nghiệm, không cần xét duyệt.</li>
            </ul>

            <h3 className="text-xl font-bold font-serif text-[#0a2540] mt-10">2. CƠ CHẾ "LEVEL-UP" TỰ ĐỘNG: Bán càng nhiều, hưởng càng cao</h3>
            <p>Hệ thống tự động theo dõi hiệu suất của bạn. Khi doanh thu trong tháng đạt các ngưỡng mục tiêu, hệ thống sẽ tự động nâng cấp mức hoa hồng:</p>
            
            <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Cấp bậc</th>
                    <th className="px-6 py-3">Doanh thu thực tế/tháng</th>
                    <th className="px-6 py-3">Mức Hoa hồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white"><td className="px-6 py-3 font-semibold">Cấp 1</td><td className="px-6 py-3">Dưới 10 Triệu</td><td className="px-6 py-3 font-bold text-blue-600">10%</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-3 font-semibold">Cấp 2</td><td className="px-6 py-3">Từ 10 Triệu - 20 Triệu</td><td className="px-6 py-3 font-bold text-blue-600">15%</td></tr>
                  <tr className="bg-white"><td className="px-6 py-3 font-semibold">Cấp 3</td><td className="px-6 py-3">Từ 20 Triệu - 50 Triệu</td><td className="px-6 py-3 font-bold text-blue-600">20%</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-3 font-semibold">Cấp 4</td><td className="px-6 py-3">Từ 50 Triệu - 100 Triệu</td><td className="px-6 py-3 font-bold text-blue-600">25%</td></tr>
                  <tr className="bg-red-50"><td className="px-6 py-3 font-semibold text-red-700">Cấp 5</td><td className="px-6 py-3 text-red-700 font-medium">Từ 100 Triệu trở lên</td><td className="px-6 py-3 font-black text-red-600 text-lg">CHẠM MỐC 30%</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold font-serif text-[#0a2540]">3. THANH TOÁN MINH BẠCH – CHUẨN PHÁP LÝ</h3>
            <p>Chúng tôi hiểu rằng niềm tin đến từ sự sòng phẳng. Hệ thống thiết lập quy trình rút tiền đơn giản, bảo mật và đúng quy định pháp luật:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ngưỡng rút tiền:</strong> Chỉ từ <strong>1.000.000 VNĐ</strong> số dư hoa hồng.</li>
              <li><strong>Nghĩa vụ Thuế:</strong> AI VĂN PHÒNG thay mặt bạn khấu trừ 10% Thuế TNCN nộp Ngân sách Nhà nước.</li>
              <li><strong>Tốc độ xử lý:</strong> Tiền về tài khoản trong vòng <strong>07 ngày làm việc</strong>.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-[#0a2540] mb-4">Các gói dịch vụ</h2>
             <p className="text-gray-500">Lựa chọn gói phù hợp nhất với nhu cầu của bạn</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            
            {/* Free Tier */}
            <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Star className="w-5 h-5 text-emerald-600"/></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">Dùng thử <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase">Đang dùng</span></h3>
              <p className="text-sm text-gray-500 mb-4">30 ngày trải nghiệm</p>
              <div className="mb-6"><span className="text-3xl font-black">đ0</span><span className="text-gray-500 text-sm"> / Mãi mãi</span></div>
              <ul className="space-y-3 mb-8 text-[13px] text-gray-600 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"/> <b>10 credits miễn phí</b></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Soạn thảo văn bản: 8 - 10 văn bản</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Upload file tham khảo: 2 files</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Dung lượng file tham khảo: 10 MB</li>
              </ul>
              <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50">Mua thêm Credits</button>
            </div>

            {/* Basic Tier */}
            <div className="border border-gray-200 bg-white rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4"><Star className="w-5 h-5 text-indigo-500"/></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Cá nhân</h3>
              <p className="text-sm text-gray-500 mb-4">Dành cho nhu cầu cá nhân</p>
              <div className="mb-6"><span className="text-3xl font-black">đ99.000</span><span className="text-gray-500 text-sm"> / tháng</span></div>
              <ul className="space-y-3 mb-8 text-[13px] text-gray-600 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5"/> <b>45 credits / tháng</b></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Soạn thảo văn bản: 40 - 50 văn bản/tháng</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Upload file tham khảo: 5 files</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Trợ lý cá nhân: 20 trợ lý</li>
              </ul>
              <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50">Mua thêm Credits</button>
            </div>

            {/* Standard Tier */}
            <div className="border border-gray-200 bg-white rounded-2xl p-6 flex flex-col shadow-sm relative">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4"><Star className="w-5 h-5 text-green-500"/></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Cơ bản</h3>
              <p className="text-sm text-gray-500 mb-4">Dành cho nhu cầu vừa phải</p>
              <div className="mb-6"><span className="text-3xl font-black">đ199.000</span><span className="text-gray-500 text-sm"> / tháng</span></div>
              <ul className="space-y-3 mb-8 text-[13px] text-gray-600 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5"/> <b>100 credits / tháng</b></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Soạn thảo văn bản: 80 - 100 văn bản/tháng</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Upload file tham khảo: 5 files</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Trợ lý cá nhân: 20 trợ lý</li>
              </ul>
              <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50">Nâng cấp ngay</button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="border-2 border-[#d32f2f] bg-rose-50/20 rounded-2xl p-6 flex flex-col shadow-xl shadow-red-900/5 relative transform md:-translate-y-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#d32f2f] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Khuyên dùng</div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4"><Star className="w-5 h-5 text-red-600 fill-red-600"/></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Chuyên nghiệp</h3>
              <p className="text-sm text-gray-500 mb-4">Tối ưu cho hiệu suất cao</p>
              <div className="mb-6"><span className="text-3xl font-black">đ499.000</span><span className="text-gray-500 text-sm"> / tháng</span></div>
              <ul className="space-y-3 mb-8 text-[13px] text-gray-600 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5"/> <b>100 credits / tháng</b></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Soạn thảo văn bản: 290 - 300 văn bản/tháng</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Upload file tham khảo: 10 files</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Dung lượng file tham khảo: 30 MB</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"/> Truy cập kho tài liệu số: không giới hạn</li>
              </ul>
              <button className="w-full bg-[#d32f2f] text-white py-3 rounded-xl font-bold hover:bg-[#b71c1c] shadow-lg shadow-red-600/30">Nâng cấp ngay</button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100" id="lien-he">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-black text-[#0a2540] mb-2 flex items-center gap-2">Để lại thông tin nhận tư vấn</h2>
          <p className="text-sm text-gray-500 mb-8 flex items-center gap-2"><Mail className="w-4 h-4"/> Sẽ được gửi thẳng đến <b>nguyenlynktq@gmail.com</b></p>
          
          {submitStatus === 'success' ? (
            <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">Gửi thông tin thành công!</h3>
              <p className="text-sm opacity-80">Cảm ơn bạn đã liên hệ, AI VĂN PHÒNG sẽ sớm liên lạc lại với bạn.</p>
              <button onClick={() => setSubmitStatus('idle')} className="mt-4 text-green-700 text-sm font-semibold underline">Gửi phản hồi khác</button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung / Comment <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none transition-all resize-none"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Họ & Tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                  <input 
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none transition-all"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>
              
              {submitStatus === 'error' && (
                <p className="text-red-600 text-sm font-semibold bg-red-50 p-3 rounded-lg border border-red-100">Đã có lỗi xảy ra. Hãy chắc chắn Server đang mở và đã tải biến môi trường.</p>
              )}

              <button 
                type="submit" 
                disabled={submitStatus === 'loading'}
                className="bg-[#466185] text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-[#324560] transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
              >
                {submitStatus === 'loading' ? 'ĐANG GỬI...' : 'GỬI THÔNG TIN'} <Send className="w-4 h-4 ml-1" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a2540] py-8 border-t border-gray-800 text-white/50 text-center text-sm">
        <p>&copy; 2026 AI VĂN PHÒNG. Trợ lý thông minh dành cho khối hành chính.</p>
      </footer>
    </div>
  );
}
