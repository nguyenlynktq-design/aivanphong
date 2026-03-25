import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { LayoutDashboard, FileText, PlusCircle, User as UserIcon, LogOut, Menu, X, Sparkles, FileCheck, Send, Info, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/DocumentList';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import DesignSystem from './pages/DesignSystem';
import TrienKhai from './pages/TrienKhai';

import { handleFirestoreError, OperationType } from './lib/utils';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: 'user',
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          
          <Route element={<ProtectedRoute user={user} />}>
            <Route element={<AppLayout profile={profile} />}>
              <Route path="/dashboard" element={<Dashboard user={user} profile={profile} />} />
              <Route path="/documents" element={<DocumentList user={user} />} />
              <Route path="/trien-khai" element={<TrienKhai user={user} profile={profile} />} />
              <Route path="/editor" element={<Editor user={user} profile={profile} />} />
              <Route path="/editor/:id" element={<Editor user={user} profile={profile} />} />
              <Route path="/profile" element={<Profile user={user} profile={profile} setProfile={setProfile} />} />
              <Route path="/design-system" element={<DesignSystem />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

function ProtectedRoute({ user }: { user: User | null }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} />;
  return <Outlet />;
}

import { Outlet } from 'react-router-dom';

function AppLayout({ profile }: { profile: UserProfile | null }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Văn bản của tôi', path: '/documents', icon: FileText },
    { name: 'Tạo văn bản mới', path: '/editor', icon: PlusCircle },
    { name: 'Triển khai VB', path: '/trien-khai', icon: FileUp },
    { name: 'Cá nhân', path: '/profile', icon: UserIcon },
    { name: 'Design System', path: '/design-system', icon: Sparkles },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-neutral-900 text-white transition-all duration-300 flex flex-col z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800 shrink-0">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center shrink-0 shadow-lg shadow-primary-900/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight truncate">AI Soạn thảo</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                location.pathname.startsWith(item.path) 
                  ? "bg-primary-600 text-white shadow-md shadow-primary-900/20" 
                  : "hover:bg-neutral-800 text-neutral-400 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="truncate font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              {isSidebarOpen ? <X className="w-5 h-5 text-neutral-500" /> : <Menu className="w-5 h-5 text-neutral-500" />}
            </button>
            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider hidden sm:block">
              {navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Hệ thống'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-neutral-900">{auth.currentUser?.displayName}</p>
              <p className="text-xs text-neutral-500 font-medium">{profile?.organization || 'Chưa cấu hình cơ quan'}</p>
            </div>
            <div className="relative">
              <img
                src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName}`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-neutral-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}


function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed", err);
      let errorMsg = "Đăng nhập thất bại. Vui lòng thử lại.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = "Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMsg = "Tên miền này chưa được cấp quyền đăng nhập. Vui lòng thêm vào Firebase Console.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = "Google Sign-in chưa được bật trên Firebase Console (Authentication > Sign-in method).";
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5c0f1e] via-[#4a0a16] to-[#36050e] p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full dot-grid opacity-20 pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-900/30 rounded-full blur-3xl opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-rose-950/80 max-w-md w-full text-center border border-rose-500/10 relative z-10"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-900/50 ring-1 ring-white/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-white">Chào mừng trở lại</h1>
        <p className="text-rose-100/70 mb-8 text-lg">Đăng nhập để vào hệ thống AI Hành Chính Cấp Xã.</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="mb-6 bg-red-500/20 border border-red-500/30 text-rose-100 text-sm p-4 rounded-xl text-left flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all font-semibold text-white shadow-lg shadow-black/20 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full"
            />
          ) : (
            <div className="bg-white p-1 rounded-full">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
          )}
          {isLoading ? "Đang xử lý..." : "Tiếp tục với Google"}
        </button>
        
        <p className="mt-10 text-sm text-rose-200/50 font-medium tracking-wide">
          Bằng cách đăng nhập, bạn đồng ý với <a href="#" className="text-rose-100/80 hover:text-white hover:underline transition-colors">Điều khoản dịch vụ</a> và <a href="#" className="text-rose-100/80 hover:text-white hover:underline transition-colors">Chính sách bảo mật</a> của chúng tôi.
        </p>
      </motion.div>
    </div>
  );
}
