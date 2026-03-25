import { DocTypeMeta } from '../types';

// ============================================================
// NĐ 30/2020/NĐ-CP — 24 loại VB hành chính
// ============================================================
export const DOC_TYPES_ND30: DocTypeMeta[] = [
  // ---- Nhóm 1: VB có tên loại ----
  { id: 'nghi_quyet',       label: 'Nghị quyết',        ky_hieu: 'NQ',  group: 'co_ten_loai' },
  { id: 'quyet_dinh',       label: 'Quyết định',        ky_hieu: 'QĐ',  group: 'co_ten_loai' },
  { id: 'chi_thi',          label: 'Chỉ thị',           ky_hieu: 'CT',  group: 'co_ten_loai' },
  { id: 'quy_che',          label: 'Quy chế',           ky_hieu: 'QC',  group: 'co_ten_loai' },
  { id: 'quy_dinh',         label: 'Quy định',          ky_hieu: 'QĐi', group: 'co_ten_loai' },
  { id: 'thong_bao',        label: 'Thông báo',         ky_hieu: 'TB',  group: 'co_ten_loai' },
  { id: 'huong_dan',        label: 'Hướng dẫn',         ky_hieu: 'HD',  group: 'co_ten_loai' },
  { id: 'chuong_trinh',     label: 'Chương trình',      ky_hieu: 'CTr', group: 'co_ten_loai' },
  { id: 'ke_hoach',          label: 'Kế hoạch',          ky_hieu: 'KH',  group: 'co_ten_loai' },
  { id: 'phuong_an',        label: 'Phương án',         ky_hieu: 'PA',  group: 'co_ten_loai' },
  { id: 'de_an',            label: 'Đề án',             ky_hieu: 'ĐA',  group: 'co_ten_loai' },
  { id: 'du_an',            label: 'Dự án',             ky_hieu: '',     group: 'co_ten_loai' },
  { id: 'bao_cao',          label: 'Báo cáo',           ky_hieu: 'BC',  group: 'co_ten_loai' },
  { id: 'to_trinh',         label: 'Tờ trình',          ky_hieu: 'TTr', group: 'co_ten_loai' },
  { id: 'thong_cao',        label: 'Thông cáo',         ky_hieu: 'TC',  group: 'co_ten_loai' },
  { id: 'giay_moi',         label: 'Giấy mời',          ky_hieu: 'GM',  group: 'co_ten_loai' },
  { id: 'giay_gioi_thieu',  label: 'Giấy giới thiệu',  ky_hieu: 'GGT', group: 'co_ten_loai' },
  { id: 'giay_nghi_phep',   label: 'Giấy nghỉ phép',   ky_hieu: 'GNP', group: 'co_ten_loai' },
  { id: 'giay_uy_quyen',    label: 'Giấy ủy quyền',    ky_hieu: '',     group: 'co_ten_loai' },
  { id: 'hop_dong',         label: 'Hợp đồng',          ky_hieu: 'HĐ',  group: 'co_ten_loai' },
  { id: 'cong_dien',        label: 'Công điện',         ky_hieu: 'CĐ',  group: 'co_ten_loai' },
  { id: 'ban_ghi_nho',      label: 'Bản ghi nhớ',      ky_hieu: '',     group: 'co_ten_loai' },
  // ---- Nhóm 2: Công văn ----
  { id: 'cong_van',         label: 'Công văn',          ky_hieu: '',     group: 'cong_van' },
  // ---- Nhóm 3: Biên bản ----
  { id: 'bien_ban',         label: 'Biên bản',          ky_hieu: 'BB',   group: 'bien_ban' },
];

// ============================================================
// HD 36-HD/VPTW — 14 loại VB Đảng
// ============================================================
export const DOC_TYPES_HD36: DocTypeMeta[] = [
  { id: 'nghi_quyet',   label: 'Nghị quyết',     ky_hieu: 'NQ',  group: 'co_ten_loai' },
  { id: 'chi_thi',      label: 'Chỉ thị',        ky_hieu: 'CT',  group: 'co_ten_loai' },
  { id: 'ket_luan',     label: 'Kết luận',        ky_hieu: 'KL',  group: 'co_ten_loai' },
  { id: 'quyet_dinh',   label: 'Quyết định',      ky_hieu: 'QĐ',  group: 'co_ten_loai' },
  { id: 'quy_dinh',     label: 'Quy định',        ky_hieu: 'QĐi', group: 'co_ten_loai' },
  { id: 'quy_che',      label: 'Quy chế',         ky_hieu: 'QC',  group: 'co_ten_loai' },
  { id: 'bao_cao',      label: 'Báo cáo',         ky_hieu: 'BC',  group: 'co_ten_loai' },
  { id: 'to_trinh',     label: 'Tờ trình',        ky_hieu: 'TTr', group: 'co_ten_loai' },
  { id: 'thong_bao',    label: 'Thông báo',       ky_hieu: 'TB',  group: 'co_ten_loai' },
  { id: 'huong_dan',    label: 'Hướng dẫn',       ky_hieu: 'HD',  group: 'co_ten_loai' },
  { id: 'chuong_trinh', label: 'Chương trình',    ky_hieu: 'CTr', group: 'co_ten_loai' },
  { id: 'thong_tri',    label: 'Thông tri',       ky_hieu: 'TT',  group: 'co_ten_loai' },
  { id: 'cong_van',     label: 'Công văn',        ky_hieu: 'CV',  group: 'cong_van' },
  { id: 'bien_ban',     label: 'Biên bản',        ky_hieu: 'BB',  group: 'bien_ban' },
];

// ============================================================
// Helpers
// ============================================================
export function getDocTypes(category: 'government' | 'party'): DocTypeMeta[] {
  return category === 'party' ? DOC_TYPES_HD36 : DOC_TYPES_ND30;
}

export function getDocTypeMeta(id: string, category: 'government' | 'party'): DocTypeMeta | undefined {
  return getDocTypes(category).find(t => t.id === id);
}

// ============================================================
// Quyền hạn ký — Options cho UI
// ============================================================
export const SIGNING_OPTIONS_ND30 = [
  { value: '',     label: 'Ký trực tiếp (không ghi quyền hạn)' },
  { value: 'TM.',  label: 'TM. — Thay mặt' },
  { value: 'KT.',  label: 'KT. — Ký thay' },
  { value: 'TL.',  label: 'TL. — Thừa lệnh' },
  { value: 'TUQ.', label: 'TUQ. — Thừa ủy quyền' },
  { value: 'Q.',   label: 'Q. — Quyền' },
];

export const SIGNING_OPTIONS_HD36 = [
  { value: '',    label: 'Ký trực tiếp (không ghi quyền hạn)' },
  { value: 'T/M', label: 'T/M — Thay mặt' },
  { value: 'K/T', label: 'K/T — Ký thay' },
  { value: 'T/L', label: 'T/L — Thừa lệnh' },
];

export function getSigningOptions(category: 'government' | 'party') {
  return category === 'party' ? SIGNING_OPTIONS_HD36 : SIGNING_OPTIONS_ND30;
}

// ============================================================
// CẤU TRÚC MẪU theo loại VB — dùng cho AI prompt
// ============================================================
const STRUCTURE_TEMPLATES: Record<string, string> = {
  // Quyết định: Có "QUYẾT ĐỊNH:", Điều 1, Điều 2...
  quyet_dinh: `Cấu trúc:
QUYẾT ĐỊNH:
Điều 1. [Nội dung điều 1]
Điều 2. [Nội dung điều 2]
...
Điều cuối. Quyết định này có hiệu lực kể từ ngày ký./.`,

  // Nghị quyết: Có phần "QUYẾT NGHỊ:" hoặc "NGHỊ QUYẾT:", Điều khoản
  nghi_quyet: `Cấu trúc:
[Các căn cứ pháp lý]
QUYẾT NGHỊ:
Điều 1. [Nội dung]
Điều 2. [Nội dung]
.../.`,

  // Chỉ thị: Yêu cầu giao nhiệm vụ, đánh số 1., 2., 3.
  chi_thi: `Cấu trúc:
[Phần mở đầu: tình hình, lý do ban hành]
[Thủ trưởng cơ quan] yêu cầu:
1. [Nhiệm vụ 1]
2. [Nhiệm vụ 2]
.../.`,

  // Thông báo: Đoạn văn, không chia Điều
  thong_bao: `Cấu trúc: viết thành các đoạn văn mạch lạc. KHÔNG chia theo Điều, khoản.
Đoạn 1: Nêu nội dung cần thông báo.
Đoạn 2: Chi tiết, yêu cầu cụ thể.
Đoạn cuối: Kết luận./.`,

  // Báo cáo: I., II., III. + 1., 2., 3.
  bao_cao: `Cấu trúc:
I. TÌNH HÌNH CHUNG
1. [Nội dung]
2. [Nội dung]
II. KẾT QUẢ THỰC HIỆN
1. [Kết quả 1]
2. [Kết quả 2]
III. KHÓ KHĂN, HẠN CHẾ
IV. PHƯƠNG HƯỚNG, NHIỆM VỤ
V. KIẾN NGHỊ, ĐỀ XUẤT./.`,

  // Tờ trình: Kính trình, Phần I-III
  to_trinh: `Cấu trúc:
Kính trình: [Người/cơ quan nhận]
I. SỰ CẦN THIẾT
II. NỘI DUNG ĐỀ XUẤT
III. TỔ CHỨC THỰC HIỆN
Kính trình [cơ quan] xem xét, quyết định./.`,

  // Công văn: Có Kính gửi, đoạn văn
  cong_van: `Cấu trúc: mở đầu → nội dung → đề nghị.
Đoạn 1: Nêu vấn đề.
Đoạn 2-3: Nội dung chi tiết.
Đoạn cuối: Đề nghị cụ thể hoặc yêu cầu phối hợp./.`,

  // Kế hoạch: I-V
  ke_hoach: `Cấu trúc:
I. MỤC ĐÍCH, YÊU CẦU
1. Mục đích
2. Yêu cầu
II. NỘI DUNG THỰC HIỆN
III. TỔ CHỨC THỰC HIỆN
1. Phân công trách nhiệm
2. Kinh phí
IV. TIẾN ĐỘ THỰC HIỆN./.`,

  // Biên bản: Thời gian, địa điểm, nội dung họp
  bien_ban: `Cấu trúc:
Thời gian: [ngày giờ]
Địa điểm: [nơi họp]
Thành phần tham dự: [danh sách]
Nội dung:
I. [Nội dung 1]
II. [Nội dung 2]
Kết luận: [Các kết luận chính]
Biên bản kết thúc vào hồi ... giờ ..., ngày ... tháng ... năm .../.`,

  // Giấy mời
  giay_moi: `Cấu trúc:
[Cơ quan] trân trọng kính mời:
[Đại diện/Đơn vị]
Đến dự: [tên cuộc họp/hội nghị]
Thời gian: ...
Địa điểm: ...
Nội dung: ...
Rất mong [quý cơ quan/đồng chí] tham dự đầy đủ và đúng giờ./.`,

  // Hướng dẫn
  huong_dan: `Cấu trúc:
I. PHẠM VI, ĐỐI TƯỢNG ÁP DỤNG
II. NỘI DUNG HƯỚNG DẪN
1. [Nội dung 1]
2. [Nội dung 2]
III. TỔ CHỨC THỰC HIỆN./.`,
};

// ============================================================
// AI Generate — với prompt thể thức chi tiết
// ============================================================
export async function generateDocContent(prompt: string, type: string, metadata: any) {
  const isParty = metadata.category === 'party';
  const docMeta = getDocTypeMeta(type, metadata.category);
  const structureHint = STRUCTURE_TEMPLATES[type] || '';

  const systemInstruction = `Bạn là một chuyên gia soạn thảo văn bản hành chính Việt Nam cấp cao.

HỆ THỐNG: ${isParty ? 'Văn bản Đảng Cộng sản Việt Nam (Hướng dẫn 36-HD/VPTW)' : 'Văn bản hành chính nhà nước (Nghị định 30/2020/NĐ-CP)'}.
LOẠI VĂN BẢN: "${docMeta?.label || type}".
NHÓM: ${metadata.docGroup === 'cong_van' ? 'Công văn (không có tên loại, có Kính gửi)' : metadata.docGroup === 'bien_ban' ? 'Biên bản (có Thư ký + Chủ trì)' : 'VB có tên loại'}.

THÔNG TIN HÀNH CHÍNH:
- Cơ quan chủ quản: ${metadata.co_quan_chu_quan || '(chưa điền)'}
- Cơ quan ban hành: ${metadata.co_quan_ban_hanh || '(chưa điền)'}
- Số ký hiệu: ${metadata.so_ky_hieu || '(chưa điền)'}
- Địa danh: ${metadata.dia_danh || '(chưa điền)'}
- Ngày ${metadata.ngay || '...'} tháng ${metadata.thang || '...'} năm ${metadata.nam || '...'}
- Người ký: ${metadata.nguoi_ky || '(chưa điền)'}
- Chức vụ: ${metadata.chuc_vu_ky || '(chưa điền)'}
- Quyền hạn: ${metadata.quyen_han_ky || 'Ký trực tiếp'}

${structureHint ? `MẪU CẤU TRÚC CHO LOẠI "${docMeta?.label}":\n${structureHint}` : ''}

QUY TẮC BẮT BUỘC:
1. CHỈ trả về PHẦN NỘI DUNG CHÍNH — KHÔNG bao gồm: header, quốc hiệu, tiêu ngữ, số ký hiệu, tên loại VB, trích yếu, chữ ký, nơi nhận.
2. Văn phong: trang trọng, chính xác, súc tích, chuẩn mực hành chính nhà nước Việt Nam.
3. ${isParty ? 'VB ĐẢNG: khoản trong Điều đánh số 1., 2., 3. (TUYỆT ĐỐI KHÔNG dùng a, b, c hay a), b), c)).' : 'VB NĐ30: khoản đánh số 1., 2., 3. hoặc a), b), c).'}
4. ${isParty ? 'Mục dùng: 1.1., 1.2., 2.1. (KHÔNG dùng dấu chấm phẩy).' : 'Điểm trong khoản dùng a), b), c).'}
5. Kết thúc VĂN BẢN bằng dấu ./. (chấm gạch chéo chấm), KHÔNG phải dấu chấm đơn.
6. Trả về PLAIN TEXT thuần — KHÔNG dùng markdown (**, ##, -, *, v.v.).
7. Sử dụng đúng thuật ngữ pháp lý và hành chính.
8. Nếu có căn cứ, mỗi căn cứ bắt đầu bằng "Căn cứ" và kết thúc bằng dấu chấm phẩy (;), căn cứ cuối kết thúc bằng dấu phẩy (,).`;

  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  if (!response.ok) throw new Error("Failed to generate content");
  const data = await response.json();
  return data.text;
}

// ============================================================
// AI Optimize — tối ưu văn phong theo NĐ30/HD36
// ============================================================
export async function optimizeContent(content: string, category: 'government' | 'party' = 'government') {
  const isParty = category === 'party';

  const systemInstruction = `Bạn là chuyên gia biên tập văn bản hành chính Việt Nam.
Nhiệm vụ: Tối ưu hóa văn phong cho đoạn văn bản dưới đây.

QUY TẮC:
1. Văn phong trang trọng, súc tích, đúng thuật ngữ ${isParty ? 'văn bản Đảng (HD 36-HD/VPTW)' : 'hành chính nhà nước (NĐ 30/2020/NĐ-CP)'}.
2. Giữ nguyên cấu trúc Điều, khoản, mục, điểm.
3. ${isParty ? 'Khoản trong Điều: 1., 2., 3. (KHÔNG dùng a, b, c).' : 'Khoản: 1., 2., 3. Điểm: a), b), c).'}
4. Loại bỏ từ thừa, câu dài dòng. Dùng câu ngắn gọn, rõ ràng.
5. Sử dụng đúng thuật ngữ pháp lý: "ban hành", "thực hiện", "chỉ đạo", "triển khai".
6. Kết thúc bằng ./. (chấm gạch chéo chấm).
7. Trả về PLAIN TEXT thuần — KHÔNG markdown.`;

  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: `Tối ưu văn phong:\n\n${content}`, systemInstruction }),
  });

  if (!response.ok) throw new Error("Failed to optimize content");
  const data = await response.json();
  return data.text;
}

// ============================================================
// AI Suggest Căn cứ — gợi ý căn cứ pháp lý
// ============================================================
export async function suggestCanCu(type: string, trichYeu: string, category: 'government' | 'party' = 'government') {
  const isParty = category === 'party';
  const docMeta = getDocTypeMeta(type, category);

  const prompt = `Gợi ý các căn cứ pháp lý phù hợp cho ${docMeta?.label || 'văn bản'} ${isParty ? '(VB Đảng)' : '(VB hành chính nhà nước)'} với nội dung: "${trichYeu}".

Yêu cầu:
- Liệt kê 3-5 căn cứ phổ biến nhất, chính xác.
- Mỗi căn cứ bắt đầu bằng "Căn cứ" và kết thúc bằng dấu chấm phẩy (;).
- Căn cứ cuối kết thúc bằng dấu phẩy (,).
- Ghi đầy đủ: tên luật/nghị định, số hiệu, ngày ban hành.
- Trả về plain text, mỗi căn cứ 1 dòng.`;

  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error("Failed to suggest căn cứ");
  const data = await response.json();
  return data.text;
}

// ============================================================
// TRIỂN KHAI VB CẤP TRÊN — Phân tích VB
// ============================================================

/** Ma trận gợi ý VB triển khai theo loại VB cấp trên */
export const DERIVATIVE_MAP: Record<string, Array<{ type: string; label: string; group: string; priority: 'high' | 'medium' }>> = {
  'Nghị quyết': [
    { type: 'ke_hoach', label: 'Kế hoạch triển khai', group: 'co_ten_loai', priority: 'high' },
    { type: 'chuong_trinh', label: 'Chương trình hành động', group: 'co_ten_loai', priority: 'high' },
    { type: 'cong_van', label: 'Công văn chỉ đạo triển khai', group: 'cong_van', priority: 'medium' },
    { type: 'bao_cao', label: 'Báo cáo kết quả thực hiện', group: 'co_ten_loai', priority: 'medium' },
  ],
  'Chương trình hành động': [
    { type: 'ke_hoach', label: 'Kế hoạch triển khai chi tiết', group: 'co_ten_loai', priority: 'high' },
    { type: 'cong_van', label: 'Công văn triển khai', group: 'cong_van', priority: 'high' },
    { type: 'bao_cao', label: 'Báo cáo kết quả thực hiện', group: 'co_ten_loai', priority: 'medium' },
    { type: 'to_trinh', label: 'Tờ trình đề xuất giải pháp', group: 'co_ten_loai', priority: 'medium' },
  ],
  'Chỉ thị': [
    { type: 'ke_hoach', label: 'Kế hoạch thực hiện', group: 'co_ten_loai', priority: 'high' },
    { type: 'cong_van', label: 'Công văn triển khai', group: 'cong_van', priority: 'high' },
    { type: 'bao_cao', label: 'Báo cáo kết quả', group: 'co_ten_loai', priority: 'medium' },
  ],
  'Kết luận': [
    { type: 'ke_hoach', label: 'Kế hoạch triển khai', group: 'co_ten_loai', priority: 'high' },
    { type: 'cong_van', label: 'Công văn thông báo', group: 'cong_van', priority: 'medium' },
  ],
  'Quyết định': [
    { type: 'ke_hoach', label: 'Kế hoạch thực hiện', group: 'co_ten_loai', priority: 'high' },
    { type: 'huong_dan', label: 'Hướng dẫn thực hiện', group: 'co_ten_loai', priority: 'high' },
    { type: 'cong_van', label: 'Công văn phổ biến', group: 'cong_van', priority: 'medium' },
  ],
  'Kế hoạch': [
    { type: 'ke_hoach', label: 'Kế hoạch chi tiết cấp cơ sở', group: 'co_ten_loai', priority: 'high' },
    { type: 'cong_van', label: 'Công văn triển khai', group: 'cong_van', priority: 'high' },
    { type: 'bao_cao', label: 'Báo cáo kết quả', group: 'co_ten_loai', priority: 'medium' },
  ],
  'Công điện': [
    { type: 'cong_van', label: 'Công văn triển khai', group: 'cong_van', priority: 'high' },
    { type: 'ke_hoach', label: 'Kế hoạch ứng phó', group: 'co_ten_loai', priority: 'high' },
  ],
};

/** Phân tích VB cấp trên — trả về metadata + nhiệm vụ */
export async function analyzeUpperDocument(text: string): Promise<any> {
  const response = await fetch("/api/ai/analyze-upper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error("Failed to analyze document");
  const data = await response.json();
  return data;
}

/** Soạn VB triển khai từ VB cấp trên */
export async function generateDerivativeDoc(
  upperDoc: any,
  targetType: string,
  targetLabel: string,
  selectedTasks: any[],
  metadata: any
): Promise<string> {
  const response = await fetch("/api/ai/generate-derivative", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upperDoc, targetType, targetLabel, selectedTasks, metadata }),
  });

  if (!response.ok) throw new Error("Failed to generate derivative document");
  const data = await response.json();
  return data.text;
}

// ============================================================
// Export Document (DOCX/PDF)
// ============================================================
export async function exportDocument(type: 'docx' | 'pdf', docData: any) {
  const response = await fetch(`/api/export/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(docData),
  });

  if (!response.ok) throw new Error(`Failed to export ${type}`);

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docData.title || 'van-ban'}.${type}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

