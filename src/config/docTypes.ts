import { DocType, DocCategory, DocGroup, DocTypeMeta } from '../types';
import { DOC_TYPES_ND30, DOC_TYPES_HD36 } from '../services/gemini';

// ============================================================
// Nhóm VB — Metadata cho UI
// ============================================================
export interface DocGroupMeta {
  id: DocGroup;
  label: string;
  description: string;
  icon: string; // lucide icon name
}

export const DOC_GROUPS: DocGroupMeta[] = [
  {
    id: 'co_ten_loai',
    label: 'VB có tên loại',
    description: 'Nghị quyết, Quyết định, Thông báo, Báo cáo, Tờ trình...',
    icon: 'FileText',
  },
  {
    id: 'cong_van',
    label: 'Công văn',
    description: 'Văn bản không có tên loại, có Kính gửi, V/v dưới số ký hiệu',
    icon: 'Send',
  },
  {
    id: 'bien_ban',
    label: 'Biên bản',
    description: 'Biên bản hội nghị, họp — 2 chữ ký: Thư ký (trái) + Chủ trì (phải)',
    icon: 'ClipboardList',
  },
];

// ============================================================
// Lấy danh sách loại VB theo category + group
// ============================================================
export function getDocTypesByCategory(category: DocCategory): DocTypeMeta[] {
  return category === 'party' ? DOC_TYPES_HD36 : DOC_TYPES_ND30;
}

export function getDocTypesByGroup(category: DocCategory, group: DocGroup): DocTypeMeta[] {
  return getDocTypesByCategory(category).filter(t => t.group === group);
}

export function getGroupedDocTypes(category: DocCategory): { group: DocGroupMeta; types: DocTypeMeta[] }[] {
  const allTypes = getDocTypesByCategory(category);
  return DOC_GROUPS.map(group => ({
    group,
    types: allTypes.filter(t => t.group === group.id),
  })).filter(g => g.types.length > 0);
}

// ============================================================
// Lookup helpers
// ============================================================
export function findDocType(id: DocType, category: DocCategory): DocTypeMeta | undefined {
  return getDocTypesByCategory(category).find(t => t.id === id);
}

export function getDocLabel(id: DocType, category: DocCategory): string {
  return findDocType(id, category)?.label || id;
}

export function getDocKyHieu(id: DocType, category: DocCategory): string {
  return findDocType(id, category)?.ky_hieu || '';
}

export function getDocGroup(id: DocType, category: DocCategory): DocGroup {
  return findDocType(id, category)?.group || 'co_ten_loai';
}

// ============================================================
// Gợi ý số ký hiệu tự động
// ============================================================
export function suggestSoKyHieu(
  type: DocType,
  category: DocCategory,
  viTatCoQuan: string // VD: "UBND", "TU", "BTCTU"
): string {
  const meta = findDocType(type, category);
  if (!meta) return 'Số      /...';

  if (category === 'party') {
    // VB Đảng: Số XX-NQ/TU (dấu gạch nối + gạch chéo)
    if (meta.group === 'cong_van') {
      return `Số      -CV/${viTatCoQuan}`;
    }
    return `Số      -${meta.ky_hieu || 'XX'}/${viTatCoQuan}`;
  } else {
    // NĐ30: Số XX/TB-UBND (gạch chéo + gạch nối)
    if (meta.group === 'cong_van') {
      return `Số      /${viTatCoQuan}`;
    }
    return `Số      /${meta.ky_hieu || 'XX'}-${viTatCoQuan}`;
  }
}

// ============================================================
// Tên loại VB viết hoa (cho tiêu đề VB)
// ============================================================
export function getTenLoaiVBHoa(id: DocType, category: DocCategory): string {
  const meta = findDocType(id, category);
  if (!meta) return '';
  return meta.label.toUpperCase(); // VD: "NGHỊ QUYẾT", "QUYẾT ĐỊNH"
}
