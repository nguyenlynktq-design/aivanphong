import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Save, User, Building2, Briefcase, Mail, CheckCircle2, Loader2 } from 'lucide-react';

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
      await updateDoc(docRef, formData);
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
                Tên cơ quan, đơn vị
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Ủy ban nhân dân Thành phố Hà Nội"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
              <p className="text-xs text-slate-400 italic">Thông tin này sẽ tự động điền vào phần Tên cơ quan trong văn bản.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Chức vụ
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Chánh Văn phòng"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
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
