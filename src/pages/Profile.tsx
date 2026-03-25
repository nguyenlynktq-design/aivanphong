import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Save, User, Building2, Briefcase, Mail, CheckCircle2, Loader2, MapPin, Users, Trash2 } from 'lucide-react';

import { handleFirestoreError, OperationType } from '../lib/utils';

export default function Profile({ user, profile, setProfile }: { user: any, profile: UserProfile | null, setProfile: (p: UserProfile) => void }) {
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile || {});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, formData, { merge: true });
      setProfile({ ...profile, ...formData } as UserProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt cá nhân</h1>
        <p className="text-slate-500">Quản lý thông tin cá nhân và cấu hình cơ quan soạn thảo.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl border border-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-xl font-bold">{user?.displayName}</h2>
              <p className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Họ và tên hiển thị
              </label>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.displayName || ''}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                Cơ quan chủ quản
              </label>
              <input
                type="text"
                placeholder="Ví dụ: BỘ TÀI CHÍNH, TỈNH ỦY HÀ GIANG"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
              <p className="text-xs text-slate-400 italic">Dòng chữ phía trên, góc trái văn bản.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                Cơ quan ban hành
              </label>
              <input
                type="text"
                placeholder="Ví dụ: VỤ TỔ CHỨC CÁN BỘ, ĐẢNG ỦY XÃ ĐỒNG VĂN"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <p className="text-xs text-slate-400 italic">Dòng chữ in mờ phía dưới, góc trái văn bản.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Địa danh
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Hà Nội"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <p className="text-xs text-slate-400 italic">Tên địa phương nơi ban hành văn bản.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Chức vụ của bạn
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Chuyên viên, Chánh Văn phòng..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-6 mt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    Danh sách Lãnh đạo ký duyệt
                  </label>
                  <p className="text-xs text-slate-400 mt-1">Tạo sẵn danh sách các lãnh đạo thường ký văn bản để chọn nhanh.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, leaders: [...(formData.leaders || []), { name: '', position: '' }] })}
                  className="text-xs font-bold text-brand-red bg-red-50 border border-red-100 px-3 py-2 rounded-lg hover:bg-brand-red hover:text-white transition-colors"
                >
                  + Thêm lãnh đạo
                </button>
              </div>
              
              <div className="space-y-3">
                {(formData.leaders || []).map((leader, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <input
                      placeholder="Chức vụ (VD: Giám đốc)"
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      value={leader.position}
                      onChange={e => {
                        const newLeaders = [...(formData.leaders || [])];
                        newLeaders[idx] = { ...newLeaders[idx], position: e.target.value };
                        setFormData({ ...formData, leaders: newLeaders });
                      }}
                    />
                    <input
                      placeholder="Họ tên (VD: Nguyễn Văn A)"
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      value={leader.name}
                      onChange={e => {
                        const newLeaders = [...(formData.leaders || [])];
                        newLeaders[idx] = { ...newLeaders[idx], name: e.target.value };
                        setFormData({ ...formData, leaders: newLeaders });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLeaders = formData.leaders?.filter((_, i) => i !== idx);
                        setFormData({ ...formData, leaders: newLeaders });
                      }}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {(!formData.leaders || formData.leaders.length === 0) && (
                  <div className="text-sm text-slate-400 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Chưa có danh sách lãnh đạo. Bấm "+ Thêm lãnh đạo" để tạo.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {success && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-emerald-600 text-sm font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Đã cập nhật thành công
              </motion.span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
        <h3 className="font-bold text-amber-800 mb-2">Lưu ý về thể thức</h3>
        <p className="text-sm text-amber-700 leading-relaxed">
          Thông tin cơ quan và chức vụ sẽ được sử dụng để chuẩn hóa phần tiêu đề và chữ ký của văn bản theo Nghị định 30/2020/NĐ-CP. Hãy đảm bảo thông tin chính xác để văn bản có giá trị pháp lý cao nhất.
        </p>
      </div>
    </div>
  );
}
