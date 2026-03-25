// ============================================================
// Loại văn bản hành chính (NĐ 30/2020/NĐ-CP) — 24 loại
// ============================================================
export type DocTypeND30 =
  | 'nghi_quyet' | 'quyet_dinh' | 'chi_thi' | 'quy_che' | 'quy_dinh'
  | 'thong_bao' | 'huong_dan' | 'chuong_trinh' | 'ke_hoach' | 'phuong_an'
  | 'de_an' | 'du_an' | 'bao_cao' | 'to_trinh' | 'thong_cao'
  | 'giay_moi' | 'giay_gioi_thieu' | 'giay_nghi_phep' | 'giay_uy_quyen'
  | 'hop_dong' | 'cong_dien' | 'ban_ghi_nho' | 'cong_van' | 'bien_ban';

// ============================================================
// Loại văn bản Đảng (HD 36-HD/VPTW) — 14 loại
// ============================================================
export type DocTypeHD36 =
  | 'nghi_quyet' | 'chi_thi' | 'ket_luan' | 'quyet_dinh' | 'quy_dinh'
  | 'quy_che' | 'bao_cao' | 'to_trinh' | 'thong_bao' | 'huong_dan'
  | 'chuong_trinh' | 'thong_tri' | 'cong_van' | 'bien_ban';

export type DocType = DocTypeND30 | DocTypeHD36;
export type DocCategory = 'government' | 'party';
export type DocGroup = 'co_ten_loai' | 'cong_van' | 'bien_ban';

// ============================================================
// Quyền hạn ký
// ============================================================
export type SigningAuthorityND30 = 'TM.' | 'KT.' | 'TL.' | 'TUQ.' | 'Q.' | '';
export type SigningAuthorityHD36 = 'T/M' | 'K/T' | 'T/L' | '';

export interface SignatureBlock {
  quyen_han_ky: string;     // VD: "TL. BỘ TRƯỞNG" hoặc "T/M HUYỆN UỶ"
  kt_chuc_vu?: string;      // VD: "KT. VỤ TRƯỞNG VỤ TCCB" (khi TL+KT 3 dòng)
  chuc_vu_ky: string;       // VD: "VỤ TRƯỞNG" hoặc "BÍ THƯ"
  nguoi_ky: string;         // VD: "Nguyễn Văn A"
}

// ============================================================
// Document — Cấu trúc chính
// ============================================================
export interface Document {
  id: string;
  authorUid: string;
  title: string;
  type: DocType;
  category: DocCategory;
  docGroup: DocGroup;
  status: 'draft' | 'final';

  // ---- Header ----
  co_quan_chu_quan?: string;    // Cơ quan chủ quản (VD: BỘ TÀI CHÍNH)
  co_quan_ban_hanh?: string;    // Cơ quan ban hành (VD: VỤ TỔ CHỨC CÁN BỘ)
  so_ky_hieu?: string;          // Số ký hiệu (VD: Số 15/TB-UBND)
  dia_danh?: string;            // Địa danh (VD: Hà Nội)
  ngay?: string;                // Ngày
  thang?: string;               // Tháng
  nam?: string;                 // Năm

  // ---- Trích yếu ----
  trich_yeu?: string;           // Trích yếu nội dung

  // ---- Body ----
  can_cu?: string[];            // Các căn cứ pháp lý
  kinh_gui?: string[];          // Kính gửi (dùng cho công văn)
  noi_dung?: string;            // Nội dung chính (markdown)

  // ---- Chữ ký ----
  signature?: SignatureBlock;

  // ---- Biên bản (2 chữ ký) ----
  nguoi_ghi?: string;           // Thư ký / Người ghi biên bản (trái)
  chuc_vu_nguoi_ghi?: string;   // Chức vụ người ghi
  chu_tri?: string;             // Chủ trì hội nghị (phải)
  chuc_vu_chu_tri?: string;     // Chức vụ chủ trì

  // ---- Xác nhận biên bản (nếu có) ----
  xac_nhan?: {
    quyen_han: string;
    chuc_vu: string;
    nguoi_ky: string;
  };

  // ---- Nơi nhận ----
  noi_nhan?: string[];          // Danh sách nơi nhận

  // ---- Liên kết VB cấp trên ----
  upperDocId?: string;          // ID của UpperDocument gốc
  upperDocRef?: string;         // Số ký hiệu VB cấp trên (hiển thị)

  // ---- AI ----
  aiGeneratedContent?: string;
  editedContent?: string;

  // ---- Timestamps ----
  createdAt: any;
  updatedAt: any;
}

// ============================================================
// DocType Metadata — Dùng để hiển thị UI
// ============================================================
export interface DocTypeMeta {
  id: DocType;
  label: string;
  ky_hieu: string;
  group: DocGroup;
  icon?: string;
}

// ============================================================
// UserProfile
// ============================================================
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  organization?: string;       // Cơ quan chủ quản
  department?: string;         // Đơn vị ban hành
  position?: string;           // Chức vụ
  role?: 'user' | 'admin' | 'super-admin';
  createdAt?: any;
  updatedAt?: any;
}

// ============================================================
// Triển khai VB cấp trên
// ============================================================

/** Nhiệm vụ trích xuất từ VB cấp trên */
export interface ExtractedTask {
  id: string;
  stt: string;                 // "1", "2.1", "3.3"
  noi_dung: string;            // "Đẩy mạnh cải cách thủ tục hành chính..."
  chi_tiet?: string;           // Chi tiết phụ
  han_hoan_thanh?: string;     // "Quý II/2025", "Năm 2030"
  don_vi_thuc_hien?: string;   // "UBND tỉnh", "Sở KH&ĐT"
  muc_do: 'cao' | 'trung_binh' | 'thap';
  selected?: boolean;          // User chọn để triển khai
}

/** VB cấp trên đã phân tích */
export interface UpperDocument {
  id: string;
  authorUid: string;
  originalText: string;        // Nội dung gốc
  // Trích xuất bởi AI:
  loai_vb: string;             // "Chương trình hành động"
  so_ky_hieu: string;          // "06-CTr/TU"
  co_quan_ban_hanh: string;    // "TỈNH ỦY TUYÊN QUANG"
  ngay_ban_hanh: string;       // "11/8/2025"
  trich_yeu: string;           // Trích yếu
  vb_goc_ref?: string;         // NQ/CT gốc: "68-NQ/TW"
  nhiem_vu: ExtractedTask[];   // Danh sách nhiệm vụ
  muc_tieu?: string[];         // Mục tiêu chính
  createdAt: any;
}

/** Gợi ý VB triển khai từ VB cấp trên */
export interface DerivativeDocSuggestion {
  loai_vb: DocType;
  label: string;               // "Kế hoạch triển khai"
  docGroup: DocGroup;
  mo_ta: string;               // Mô tả ngắn
  nhiem_vu_ids: string[];      // IDs nhiệm vụ liên quan
  priority: 'high' | 'medium';
}

