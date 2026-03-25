import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  Header, PageNumber, LineRuleType,
  type ITableBordersOptions, type IParagraphOptions, type IRunOptions,
} from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================================================================
// CONSTANTS — Thể thức NĐ30 / HD36
// ================================================================
const FONT = "Times New Roman";

const LAYOUT_ND30 = {
  marginTop: 1134,    // 20mm
  marginBottom: 1134,  // 20mm
  marginLeft: 1701,    // 30mm
  marginRight: 1134,   // 20mm
  colLeft: 3500,       // dxa
  colRight: 5571,      // dxa
  lineSpacing: 340,    // 17pt exact
};

const LAYOUT_HD36 = {
  marginTop: 1134,
  marginBottom: 1134,
  marginLeft: 1701,
  marginRight: 850,    // 15mm (HD36)
  colLeft: 3500,
  colRight: 5571,
  lineSpacing: 360,    // 18pt exact  
};

// Font sizes in half-points (docx-js convention)
const SZ = {
  s11: 22, // 11pt
  s12: 24, // 12pt
  s13: 26, // 13pt
  s14: 28, // 14pt
};

// No borders
const noBorders: ITableBordersOptions = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// Body spacing
const bodySpacing = (isParty: boolean) => ({
  before: 120,  // 6pt
  after: 120,   // 6pt
  line: isParty ? LAYOUT_HD36.lineSpacing : LAYOUT_ND30.lineSpacing,
  lineRule: LineRuleType.EXACT,
});

// Helper: tạo TextRun
const tr = (text: string, opts: Partial<IRunOptions> = {}): TextRun =>
  new TextRun({ text, font: FONT, size: SZ.s14, ...opts });

// Helper: tạo Paragraph giữa
const pCenter = (runs: TextRun[], extra: Partial<IParagraphOptions> = {}): Paragraph =>
  new Paragraph({ children: runs, alignment: AlignmentType.CENTER, ...extra });

// Helper: 4 paragraph rỗng cho khoảng trống chữ ký
const emptyParagraphs = (count = 4): Paragraph[] =>
  Array.from({ length: count }, () =>
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "", font: FONT, size: SZ.s14 })],
    })
  );

// ================================================================
// HEADER TABLE — 2 cột × 2 dòng (quy_tac_the_thuc.md)
// ================================================================
function buildHeaderTable(data: any, isParty: boolean, layout: typeof LAYOUT_ND30) {
  // ---- DÒNG 1 ----
  // Cột trái D1: CQ chủ quản (thường, HOA, 13) + CQ ban hành (ĐẬM, HOA, 13) + gạch ngang 1/3
  const d1Left: Paragraph[] = [];
  if (data.co_quan_chu_quan) {
    d1Left.push(pCenter([tr(data.co_quan_chu_quan.toUpperCase(), { size: SZ.s13, bold: false })]));
  }
  d1Left.push(
    pCenter([tr((data.co_quan_ban_hanh || "TÊN CƠ QUAN BAN HÀNH").toUpperCase(), { size: SZ.s13, bold: true })])
  );
  // Gạch ngang 1/3 cột trái (NĐ30) hoặc dấu sao (Đảng)
  if (isParty) {
    d1Left.push(pCenter([tr("*", { size: SZ.s13, bold: true })]));
  } else {
    d1Left.push(
      new Paragraph({
        spacing: { before: 20, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "000000", space: 1 } },
        indent: { left: 1350, right: 1350 }, // 1/3 of 3500 = ~1170, padded to 1350
      })
    );
  }

  // Cột phải D1: Quốc hiệu (ĐẬM, HOA, 13) + Tiêu ngữ (đậm, 14) + gạch bằng tiêu ngữ
  const d1Right: Paragraph[] = [];
  if (isParty) {
    d1Right.push(pCenter([tr("ĐẢNG CỘNG SẢN VIỆT NAM", { size: SZ.s13, bold: true })]));
    // Gạch dưới bằng chiều dài "ĐẢNG CỘNG SẢN VIỆT NAM"
    d1Right.push(
      new Paragraph({
        spacing: { before: 20, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "000000", space: 1 } },
        indent: { left: 800, right: 800 },
      })
    );
  } else {
    d1Right.push(pCenter([tr("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { size: SZ.s13, bold: true })]));
    d1Right.push(pCenter([tr("Độc lập - Tự do - Hạnh phúc", { size: SZ.s14, bold: true })]));
    // Gạch dưới bằng chiều dài tiêu ngữ (indent 1100 mỗi bên)
    d1Right.push(
      new Paragraph({
        spacing: { before: 20, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "000000", space: 1 } },
        indent: { left: 1100, right: 1100 },
      })
    );
  }

  // ---- DÒNG 2 ----
  // Cột trái D2: Số ký hiệu (13) + V/v (12, chỉ cho công văn)
  const d2Left: Paragraph[] = [
    pCenter([tr(data.so_ky_hieu || "Số      /...", { size: SZ.s13 })]),
  ];
  if (data.docGroup === "cong_van" && data.trich_yeu) {
    d2Left.push(pCenter([tr(`V/v ${data.trich_yeu}`, { size: SZ.s12 })]));
  }

  // Cột phải D2: Địa danh, ngày tháng (nghiêng, 14)
  const diaDanh = data.dia_danh || "...";
  const ngay = data.ngay || "...";
  const thang = data.thang || "...";
  const nam = data.nam || "...";
  const d2Right: Paragraph[] = [
    pCenter([tr(`${diaDanh}, ngày ${ngay} tháng ${thang} năm ${nam}`, { size: SZ.s14, italics: true })]),
  ];

  return new Table({
    columnWidths: [layout.colLeft, layout.colRight],
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: layout.colLeft, type: WidthType.DXA },
            borders: noBorders,
            children: d1Left,
          }),
          new TableCell({
            width: { size: layout.colRight, type: WidthType.DXA },
            borders: noBorders,
            children: d1Right,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: layout.colLeft, type: WidthType.DXA },
            borders: noBorders,
            children: d2Left,
          }),
          new TableCell({
            width: { size: layout.colRight, type: WidthType.DXA },
            borders: noBorders,
            children: d2Right,
          }),
        ],
      }),
    ],
  });
}

// ================================================================
// TITLE SECTION (Tên loại VB + Trích yếu)
// ================================================================
function buildTitle(data: any, tenLoaiVB: string, isParty: boolean): Paragraph[] {
  const result: Paragraph[] = [];

  if (data.docGroup !== "cong_van") {
    // VB có tên loại: IN HOA, đậm, cỡ 14, căn giữa
    result.push(pCenter([tr(tenLoaiVB, { size: SZ.s14, bold: true })], { spacing: { before: 360 } }));

    if (data.trich_yeu) {
      result.push(pCenter([tr(data.trich_yeu, { size: SZ.s14, bold: true })]));
      // Gạch ngang dưới trích yếu
      result.push(
        new Paragraph({
          spacing: { before: 20, after: 0 },
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: "000000", space: 1 } },
          indent: { left: 3200, right: 3200 },
        })
      );
    }
  }
  return result;
}

// ================================================================
// KÍNH GỬI (Công văn — KHÔNG đậm, cỡ 14)
// ================================================================
function buildKinhGui(data: any): Paragraph[] {
  if (data.docGroup !== "cong_van") return [];
  const result: Paragraph[] = [];

  const kinhGui: string[] = data.kinh_gui || [];
  if (kinhGui.length === 0) return result;

  if (kinhGui.length === 1) {
    result.push(pCenter([
      tr("Kính gửi: ", { size: SZ.s14, bold: false }),
      tr(kinhGui[0], { size: SZ.s14, bold: false }),
    ], { spacing: { before: 360, after: 120 } }));
  } else {
    // Nhiều đơn vị: dòng đầu "Kính gửi:", dòng sau thụt lùi với dấu -
    kinhGui.forEach((kg, i) => {
      if (i === 0) {
        result.push(pCenter([
          tr("Kính gửi: ", { size: SZ.s14, bold: false }),
          tr(`- ${kg};`, { size: SZ.s14, bold: false }),
        ], { spacing: { before: 360 } }));
      } else {
        const ending = i < kinhGui.length - 1 ? ";" : ".";
        result.push(pCenter([
          tr(`\t\t- ${kg}${ending}`, { size: SZ.s14, bold: false }),
        ]));
      }
    });
  }
  return result;
}

// ================================================================
// CĂN CỨ (nghiêng, cỡ 14, thụt đầu dòng)
// ================================================================
function buildCanCu(data: any, isParty: boolean): Paragraph[] {
  const canCu: string[] = data.can_cu || [];
  if (canCu.length === 0) return [];

  return canCu.map((cc) =>
    new Paragraph({
      children: [tr(cc, { size: SZ.s14, italics: true })],
      indent: { firstLine: 567 }, // 1cm = 567 twips
      alignment: AlignmentType.JUSTIFIED,
      spacing: bodySpacing(isParty),
    })
  );
}

// ================================================================
// NỘI DUNG — cỡ 14, thụt đầu dòng 1cm, căn đều, spacing chuẩn
// ================================================================
function buildContent(data: any, isParty: boolean): Paragraph[] {
  const content = data.noi_dung || data.content || "";
  if (!content) return [];

  return content.split("\n").map((line: string) =>
    new Paragraph({
      children: [tr(line, { size: SZ.s14 })],
      indent: { firstLine: line.trim() ? 567 : 0 }, // 1cm thụt đầu dòng
      alignment: AlignmentType.JUSTIFIED,
      spacing: bodySpacing(isParty),
    })
  );
}

// ================================================================
// CHỮ KÝ — VB thường (Nơi nhận trái + Chữ ký phải)
// ================================================================
function buildSignatureTable(data: any, isParty: boolean, layout: typeof LAYOUT_ND30): Table {
  const sig = data.signature || {};

  // ---- Nơi nhận (trái) ----
  const noiNhanChildren: Paragraph[] = [];
  // "Nơi nhận:" — NĐ30: đậm nghiêng cỡ 12 | HD36: gạch chân cỡ 12
  noiNhanChildren.push(
    new Paragraph({
      children: [tr("Nơi nhận:", {
        size: SZ.s12,
        bold: !isParty,
        italics: !isParty,
        underline: isParty ? { type: "single" } : undefined,
      } as any)],
    })
  );
  // Danh sách: cỡ 11
  const noiNhan: string[] = data.noi_nhan || ["- Như trên;", "- Lưu: VT, ."];
  noiNhan.forEach((nn) => {
    const text = nn.startsWith("-") ? nn : `- ${nn}`;
    noiNhanChildren.push(new Paragraph({ children: [tr(text, { size: SZ.s11 })] }));
  });

  // ---- Chữ ký (phải) ----
  const chuKyChildren: Paragraph[] = [];

  // Quyền hạn ký: IN HOA, đậm, cỡ 13
  if (sig.quyen_han_ky) {
    chuKyChildren.push(
      pCenter([tr(sig.quyen_han_ky.toUpperCase(), { size: SZ.s13, bold: true })])
    );
  }

  // KT chức vụ (TL+KT 3 dòng): đậm, cỡ 13
  if (sig.kt_chuc_vu) {
    chuKyChildren.push(
      pCenter([tr(sig.kt_chuc_vu.toUpperCase(), { size: SZ.s13, bold: true })])
    );
  }

  // Chức vụ ký
  // NĐ30: IN HOA, ĐẬM, cỡ 14 (nếu TL+KT → dòng cuối KHÔNG đậm)
  // HD36: IN HOA, KHÔNG đậm
  const chucVuBold = isParty ? false : (sig.kt_chuc_vu ? false : true);
  chuKyChildren.push(
    pCenter([tr((sig.chuc_vu_ky || "CHỨC VỤ NGƯỜI KÝ").toUpperCase(), {
      size: SZ.s14,
      bold: chucVuBold,
    })])
  );

  // 4 dòng trống — PHẢI dùng 4 Paragraph rỗng (KHÔNG dùng spacing: before)
  chuKyChildren.push(...emptyParagraphs(4));

  // Tên người ký: in thường, ĐẬM, cỡ 14
  chuKyChildren.push(
    pCenter([tr(sig.nguoi_ky || "Họ và tên người ký", { size: SZ.s14, bold: true })])
  );

  return new Table({
    columnWidths: [layout.colLeft + 500, layout.colRight - 500],
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: layout.colLeft + 500, type: WidthType.DXA },
            borders: noBorders,
            children: noiNhanChildren,
          }),
          new TableCell({
            width: { size: layout.colRight - 500, type: WidthType.DXA },
            borders: noBorders,
            children: chuKyChildren,
          }),
        ],
      }),
    ],
  });
}

// ================================================================
// CHỮ KÝ — BIÊN BẢN (Thư ký trái + Chủ trì phải)
// ================================================================
function buildBienBanSignature(data: any, isParty: boolean, layout: typeof LAYOUT_ND30): Paragraph[] {
  const result: Paragraph[] = [];

  // Table: Thư ký (trái) + Chủ trì (phải)
  const leftChildren: Paragraph[] = [
    pCenter([tr((data.chuc_vu_nguoi_ghi || "NGƯỜI GHI BIÊN BẢN").toUpperCase(), { size: SZ.s13, bold: true })]),
    ...emptyParagraphs(4),
    pCenter([tr(data.nguoi_ghi || "Họ tên", { size: SZ.s14, bold: true })]),
  ];

  const rightChildren: Paragraph[] = [
    pCenter([tr((data.chuc_vu_chu_tri || "CHỦ TRÌ HỘI NGHỊ").toUpperCase(), { size: SZ.s13, bold: true })]),
    ...emptyParagraphs(4),
    pCenter([tr(data.chu_tri || "Họ tên", { size: SZ.s14, bold: true })]),
  ];

  result.push(new Paragraph({ spacing: { before: 360 } }));

  const sigTable = new Table({
    columnWidths: [4500, 4500],
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: noBorders, children: leftChildren }),
          new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: noBorders, children: rightChildren }),
        ],
      }),
    ],
  });

  // Xác nhận (nếu có)
  if (data.xac_nhan?.nguoi_ky) {
    const xnChildren: Paragraph[] = [];
    if (data.xac_nhan.quyen_han) {
      xnChildren.push(pCenter([tr(data.xac_nhan.quyen_han.toUpperCase(), { size: SZ.s13, bold: true })]));
    }
    xnChildren.push(
      pCenter([tr(data.xac_nhan.chuc_vu?.toUpperCase() || "", {
        size: SZ.s14,
        bold: isParty ? false : true,
      })])
    );
    xnChildren.push(...emptyParagraphs(4));
    xnChildren.push(pCenter([tr(data.xac_nhan.nguoi_ky, { size: SZ.s14, bold: true })]));
    // Push as separate paragraphs after the table
    return [sigTable as any, ...xnChildren];
  }

  return [sigTable as any];
}

// ================================================================
// PAGE NUMBER HEADER (trang 2 trở đi)
// ================================================================
function buildPageNumberHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            font: FONT,
            size: SZ.s14,
          }),
        ],
      }),
    ],
  });
}

// ================================================================
// DOC TYPE LABEL MAPPING
// ================================================================
const DOC_TYPE_LABELS: Record<string, string> = {
  nghi_quyet: "NGHỊ QUYẾT", quyet_dinh: "QUYẾT ĐỊNH", chi_thi: "CHỈ THỊ",
  quy_che: "QUY CHẾ", quy_dinh: "QUY ĐỊNH", thong_bao: "THÔNG BÁO",
  huong_dan: "HƯỚNG DẪN", chuong_trinh: "CHƯƠNG TRÌNH", ke_hoach: "KẾ HOẠCH",
  phuong_an: "PHƯƠNG ÁN", de_an: "ĐỀ ÁN", du_an: "DỰ ÁN",
  bao_cao: "BÁO CÁO", to_trinh: "TỜ TRÌNH", thong_cao: "THÔNG CÁO",
  giay_moi: "GIẤY MỜI", giay_gioi_thieu: "GIẤY GIỚI THIỆU",
  giay_nghi_phep: "GIẤY NGHỈ PHÉP", giay_uy_quyen: "GIẤY UỶ QUYỀN",
  hop_dong: "HỢP ĐỒNG", cong_dien: "CÔNG ĐIỆN", ban_ghi_nho: "BẢN GHI NHỚ",
  cong_van: "CÔNG VĂN", bien_ban: "BIÊN BẢN",
  ket_luan: "KẾT LUẬN", thong_tri: "THÔNG TRI",
};

// ================================================================
// MAIN EXPORT FUNCTION
// ================================================================
function generateDocx(data: any): Document {
  const isParty = data.category === "party";
  const layout = isParty ? LAYOUT_HD36 : LAYOUT_ND30;
  const tenLoaiVB = DOC_TYPE_LABELS[data.type] || "VĂN BẢN";
  const isBienBan = data.docGroup === "bien_ban";

  // Build all sections
  const children: any[] = [];

  // 1. Header Table (2×2)
  children.push(buildHeaderTable(data, isParty, layout));

  // 2. Title / Kính gửi
  children.push(...buildTitle(data, tenLoaiVB, isParty));
  children.push(...buildKinhGui(data));

  // 3. Căn cứ
  children.push(...buildCanCu(data, isParty));

  // 4. Nội dung
  children.push(...buildContent(data, isParty));

  // 5. Spacing trước chữ ký
  children.push(new Paragraph({ spacing: { before: 240 } }));

  // 6. Chữ ký
  if (isBienBan) {
    children.push(...buildBienBanSignature(data, isParty, layout));
    // Nơi nhận cho biên bản
    const noiNhan: string[] = data.noi_nhan || ["- Lưu: VT."];
    children.push(new Paragraph({ spacing: { before: 240 } }));
    children.push(new Paragraph({
      children: [tr("Nơi nhận:", {
        size: SZ.s12,
        bold: !isParty,
        italics: !isParty,
        underline: isParty ? { type: "single" } : undefined,
      } as any)],
    }));
    noiNhan.forEach((nn) => {
      const text = nn.startsWith("-") ? nn : `- ${nn}`;
      children.push(new Paragraph({ children: [tr(text, { size: SZ.s11 })] }));
    });
  } else {
    children.push(buildSignatureTable(data, isParty, layout));
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: layout.marginTop,
              bottom: layout.marginBottom,
              left: layout.marginLeft,
              right: layout.marginRight,
            },
          },
          titlePage: true, // Trang 1 không đánh số
        },
        headers: {
          default: buildPageNumberHeader(),
        },
        children,
      },
    ],
  });
}

// ================================================================
// SERVER
// ================================================================

export const app = express();
const PORT = 3000;

async function startServer() {

  app.use(express.json({ limit: "10mb" }));

  // AI Generation API
  app.post("/api/ai/generate", async (req, res) => {
    const { prompt, systemInstruction } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "Bạn là một chuyên gia soạn thảo văn bản hành chính Việt Nam.",
        },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // ================================================================
  // ANALYZE UPPER DOCUMENT — Phân tích VB cấp trên
  // ================================================================
  app.post("/api/ai/analyze-upper", async (req, res) => {
    const { text } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }
    if (!text || text.length < 50) {
      return res.status(400).json({ error: "Nội dung VB quá ngắn" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemInstruction = `Bạn là chuyên gia phân tích văn bản hành chính Việt Nam. 
Nhiệm vụ: Phân tích văn bản cấp trên và trích xuất thông tin cấu trúc.

BẮT BUỘC trả về ĐÚNG JSON format sau (KHÔNG có markdown, KHÔNG có \`\`\`):
{
  "loai_vb": "Nghị quyết | Chương trình hành động | Chỉ thị | Quyết định | Kế hoạch | Kết luận | Thông báo | Công điện | Hướng dẫn",
  "so_ky_hieu": "06-CTr/TU",
  "co_quan_ban_hanh": "TỈNH ỦY TUYÊN QUANG",
  "ngay_ban_hanh": "11/8/2025",
  "trich_yeu": "Thực hiện Nghị quyết số 68-NQ/TW...",
  "vb_goc_ref": "68-NQ/TW" (nếu VB này triển khai một VB khác),
  "muc_tieu": ["Mục tiêu 1", "Mục tiêu 2"],
  "nhiem_vu": [
    {
      "id": "nv1",
      "stt": "1",
      "noi_dung": "Tóm tắt nhiệm vụ chính (1-2 câu)",
      "chi_tiet": "Chi tiết bổ sung nếu có",
      "han_hoan_thanh": "Năm 2030",
      "don_vi_thuc_hien": "UBND tỉnh, các Sở",
      "muc_do": "cao | trung_binh | thap"
    }
  ]
}

QUY TẮC:
1. Trích xuất TẤT CẢ nhiệm vụ/giải pháp chính (mỗi mục lớn I, II, III... = 1 nhiệm vụ cấp cao).
2. Các mục con 1.1, 2.1... = nhiệm vụ chi tiết, gộp vào chi_tiet.
3. Mức độ: "cao" = trọng tâm/cấp bách, "trung_binh" = thường xuyên, "thap" = dài hạn.
4. TRẢ VỀ THUẦN JSON — KHÔNG markdown, KHÔNG giải thích.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Phân tích văn bản sau:\n\n${text.substring(0, 15000)}`,
        config: { systemInstruction },
      });

      let jsonStr = (response.text || "").trim();
      // Strip markdown code fences if any
      jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

      try {
        const parsed = JSON.parse(jsonStr);
        res.json(parsed);
      } catch {
        console.error("Failed to parse AI JSON:", jsonStr.substring(0, 200));
        res.status(500).json({ error: "AI trả về format không hợp lệ", raw: jsonStr.substring(0, 500) });
      }
    } catch (error) {
      console.error("Analyze Upper Doc Error:", error);
      res.status(500).json({ error: "Không thể phân tích văn bản" });
    }
  });

  // ================================================================
  // GENERATE DERIVATIVE DOC — Soạn VB triển khai từ VB cấp trên
  // ================================================================
  app.post("/api/ai/generate-derivative", async (req, res) => {
    const { upperDoc, targetType, targetLabel, selectedTasks, metadata } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const tasksStr = selectedTasks.map((t: any, i: number) =>
        `${i + 1}. ${t.noi_dung}${t.chi_tiet ? ` (${t.chi_tiet})` : ""}${t.han_hoan_thanh ? ` — Hạn: ${t.han_hoan_thanh}` : ""}`
      ).join("\n");

      // Build optional sections
      const sampleSection = metadata?.sampleDoc
        ? `\nVĂN BẢN MẪU THAM KHẢO (học văn phong, cấu trúc, cách hành văn từ VB này):
---
${metadata.sampleDoc.substring(0, 8000)}
---
QUY TẮC VỀ VB MẪU: Học theo cách hành văn, bố cục, ngôn ngữ, thuật ngữ địa phương từ VB mẫu trên. Sử dụng cấu trúc tương tự (ví dụ: I-Đặc điểm tình hình, II-Quan điểm, III-Mục tiêu, IV-Nhiệm vụ, V-Tổ chức thực hiện). Giữ nguyên văn phong và cách diễn đạt phù hợp với cấp đơn vị.`
        : "";

      const dataSection = metadata?.soLieu
        ? `\nSỐ LIỆU ĐỊA PHƯƠNG (BẮT BUỘC sử dụng các số liệu thực tế này trong VB):
${metadata.soLieu}
QUY TẮC VỀ SỐ LIỆU: Phải đưa các số liệu trên vào đúng chỗ trong VB triển khai (phần đặc điểm tình hình, mục tiêu, hoặc nhiệm vụ cụ thể). KHÔNG tự bịa thêm số liệu khác.`
        : "";

      const systemInstruction = `Bạn là chuyên gia soạn thảo văn bản hành chính Việt Nam.

NHIỆM VỤ: Soạn "${targetLabel}" để triển khai VB cấp trên.

VĂN BẢN CẤP TRÊN:
- Loại: ${upperDoc.loai_vb}
- Số ký hiệu: ${upperDoc.so_ky_hieu}
- Cơ quan: ${upperDoc.co_quan_ban_hanh}
- Ngày: ${upperDoc.ngay_ban_hanh}
- Trích yếu: ${upperDoc.trich_yeu}

CÁC NHIỆM VỤ CẦN TRIỂN KHAI:
${tasksStr}

THÔNG TIN CƠ QUAN SOẠN (cấp dưới):
- Cơ quan: ${metadata?.co_quan_ban_hanh || "(chưa điền)"}
- Người ký: ${metadata?.nguoi_ky || "(chưa điền)"}
${sampleSection}
${dataSection}

QUY TẮC:
1. BẮT ĐẦU bằng căn cứ trích dẫn VB cấp trên: "Căn cứ ${upperDoc.loai_vb} số ${upperDoc.so_ky_hieu}, ngày ${upperDoc.ngay_ban_hanh} của ${upperDoc.co_quan_ban_hanh} về ${upperDoc.trich_yeu};"
2. Nội dung phải bám sát các nhiệm vụ đã chọn, cụ thể hóa cho cấp cơ sở.
3. Văn phong trang trọng, chuẩn mực hành chính.
4. Kết thúc bằng ./.
5. Trả về PLAIN TEXT — KHÔNG markdown.
6. CHỈ trả về phần NỘI DUNG CHÍNH — KHÔNG header, chữ ký, nơi nhận.
7. Nếu có VB mẫu: theo sát cấu trúc và văn phong từ VB mẫu.
8. Nếu có số liệu: đưa số liệu thực tế vào đúng vị trí trong VB.`;

      const prompt = `Soạn ${targetLabel} triển khai ${upperDoc.loai_vb} số ${upperDoc.so_ky_hieu}.\nCác nhiệm vụ trọng tâm:\n${tasksStr}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { systemInstruction },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Generate Derivative Error:", error);
      res.status(500).json({ error: "Không thể soạn văn bản triển khai" });
    }
  });

  // ================================================================
  // EXPORT DOCX — Pixel-perfect NĐ30 / HD36
  // ================================================================
  app.post("/api/export/docx", async (req, res) => {
    const data = req.body;

    try {
      const doc = generateDocx(data);
      const buffer = await Packer.toBuffer(doc);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(data.title || "van-ban")}.docx`);
      res.send(buffer);
    } catch (error) {
      console.error("DOCX Export Error:", error);
      res.status(500).json({ error: "Failed to export DOCX", details: String(error) });
    }
  });

  // ================================================================
  // EXPORT PDF (basic — giữ nguyên, cải thiện sau)
  // ================================================================
  app.post("/api/export/pdf", async (req, res) => {
    const data = req.body;

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      const isParty = data.category === "party";

      // Header Left
      page.drawText((data.co_quan_chu_quan || "TÊN CƠ QUAN CHỦ QUẢN").substring(0, 40), { x: 85, y: height - 57, size: 10, font });
      page.drawText((data.co_quan_ban_hanh || "TÊN CƠ QUAN BAN HÀNH").substring(0, 40), { x: 85, y: height - 72, size: 10, font: boldFont });

      // Header Right
      if (isParty) {
        const motto = "ĐẢNG CỘNG SẢN VIỆT NAM";
        const mw = boldFont.widthOfTextAtSize(motto, 10);
        page.drawText(motto, { x: width - mw - 57, y: height - 57, size: 10, font: boldFont });
      } else {
        const motto = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
        const mw = boldFont.widthOfTextAtSize(motto, 10);
        page.drawText(motto, { x: width - mw - 57, y: height - 57, size: 10, font: boldFont });

        const sub = "Độc lập - Tự do - Hạnh phúc";
        const sw = boldFont.widthOfTextAtSize(sub, 11);
        page.drawText(sub, { x: width - sw - 85, y: height - 72, size: 11, font: boldFont });
      }

      // Date
      const diaDanh = data.dia_danh || "...";
      const dateText = `${diaDanh}, ngày ${data.ngay || "..."} tháng ${data.thang || "..."} năm ${data.nam || "..."}`;
      const dateWidth = italicFont.widthOfTextAtSize(dateText, 10);
      page.drawText(dateText, { x: width - dateWidth - 57, y: height - 90, size: 10, font: italicFont });

      // Title
      const tenLoai = DOC_TYPE_LABELS[data.type] || "VĂN BẢN";
      const titleWidth = boldFont.widthOfTextAtSize(tenLoai, 14);
      page.drawText(tenLoai, { x: width / 2 - titleWidth / 2, y: height - 135, size: 14, font: boldFont });

      if (data.trich_yeu) {
        const subW = boldFont.widthOfTextAtSize(data.trich_yeu, 12);
        page.drawText(data.trich_yeu, { x: width / 2 - subW / 2, y: height - 155, size: 12, font: boldFont });
      }

      // Content
      const content = data.noi_dung || data.content || "";
      const lines = content.split("\n");
      let yOffset = height - 195;
      for (const line of lines) {
        if (yOffset < 100) break;
        const words = line.split(" ");
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine + word + " ";
          const testWidth = font.widthOfTextAtSize(testLine, 11);
          if (testWidth > width - 142) {
            page.drawText(currentLine, { x: 85, y: yOffset, size: 11, font });
            yOffset -= 16;
            currentLine = word + " ";
          } else {
            currentLine = testLine;
          }
        }
        page.drawText(currentLine, { x: 85, y: yOffset, size: 11, font });
        yOffset -= 20;
      }

      // Signature
      const sig = data.signature || {};
      const chucVu = (sig.chuc_vu_ky || "CHỨC VỤ NGƯỜI KÝ").toUpperCase();
      const chucVuW = boldFont.widthOfTextAtSize(chucVu, 11);
      page.drawText(chucVu, { x: width - chucVuW - 85, y: 130, size: 11, font: boldFont });

      const nguoiKy = sig.nguoi_ky || "Họ và tên";
      const nguoiKyW = boldFont.widthOfTextAtSize(nguoiKy, 12);
      page.drawText(nguoiKy, { x: width - nguoiKyW - 85, y: 65, size: 12, font: boldFont });

      const pdfBytes = await pdfDoc.save();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(data.title || "van-ban")}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("PDF Export Error:", error);
      res.status(500).json({ error: "Failed to export PDF" });
    }
  });

  // ================================================================
  // EXPORT XLSX — Excel with tables for reports
  // ================================================================
  app.post("/api/export/xlsx", async (req, res) => {
    const data = req.body;

    try {
      // Dynamic import ExcelJS
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "AI Hành Chính";
      workbook.created = new Date();

      // ── Sheet 1: Nội dung VB ──
      const ws = workbook.addWorksheet("Nội dung VB");

      // Title
      ws.mergeCells("A1:F1");
      const titleCell = ws.getCell("A1");
      titleCell.value = data.title || "Văn bản triển khai";
      titleCell.font = { size: 14, bold: true, name: "Times New Roman" };
      titleCell.alignment = { wrapText: true, vertical: "middle" };
      ws.getRow(1).height = 40;

      // Metadata
      ws.mergeCells("A2:F2");
      ws.getCell("A2").value = data.can_cu || "";
      ws.getCell("A2").font = { size: 11, italic: true, name: "Times New Roman" };
      ws.getCell("A2").alignment = { wrapText: true };
      ws.getRow(2).height = 30;

      // Empty row
      ws.addRow([]);

      // Content paragraphs
      const contentLines = (data.content || "").split("\n").filter((l: string) => l.trim());
      contentLines.forEach((line: string) => {
        const row = ws.addRow([line]);
        ws.mergeCells(`A${row.number}:F${row.number}`);
        row.getCell(1).font = { size: 12, name: "Times New Roman" };
        row.getCell(1).alignment = { wrapText: true };
        row.height = Math.max(20, Math.ceil(line.length / 80) * 18);
      });

      // ── Sheet 2: Bảng nhiệm vụ ──
      if (data.tasks && data.tasks.length > 0) {
        const ws2 = workbook.addWorksheet("Bảng nhiệm vụ");

        // Header row
        const headers = ["STT", "Nhiệm vụ", "Chi tiết", "Đơn vị thực hiện", "Hạn hoàn thành", "Mức độ"];
        const headerRow = ws2.addRow(headers);
        headerRow.eachCell((cell: any) => {
          cell.font = { bold: true, size: 11, name: "Times New Roman", color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFc0392b" } };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          cell.border = {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" },
          };
        });
        headerRow.height = 28;

        // Data rows
        data.tasks.forEach((task: any, i: number) => {
          const row = ws2.addRow([
            task.stt || `${i + 1}`,
            task.noi_dung || "",
            task.chi_tiet || "",
            task.don_vi_thuc_hien || "",
            task.han_hoan_thanh || "",
            task.muc_do === "cao" ? "Cao" : task.muc_do === "trung_binh" ? "Trung bình" : "Thấp",
          ]);
          row.eachCell((cell: any) => {
            cell.font = { size: 11, name: "Times New Roman" };
            cell.alignment = { wrapText: true, vertical: "top" };
            cell.border = {
              top: { style: "thin" }, bottom: { style: "thin" },
              left: { style: "thin" }, right: { style: "thin" },
            };
          });
          // Color mức độ
          const mucDoCell = row.getCell(6);
          if (task.muc_do === "cao") {
            mucDoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfce4ec" } };
            mucDoCell.font = { size: 11, name: "Times New Roman", color: { argb: "FFc0392b" }, bold: true };
          } else if (task.muc_do === "trung_binh") {
            mucDoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfff8e1" } };
          }
          row.height = Math.max(25, Math.ceil((task.noi_dung || "").length / 50) * 18);
        });

        // Column widths
        ws2.getColumn(1).width = 7;
        ws2.getColumn(2).width = 45;
        ws2.getColumn(3).width = 40;
        ws2.getColumn(4).width = 25;
        ws2.getColumn(5).width = 18;
        ws2.getColumn(6).width = 14;
      }

      // ── Sheet 3: Số liệu (if provided) ──
      if (data.soLieu) {
        const ws3 = workbook.addWorksheet("Số liệu địa phương");
        ws3.mergeCells("A1:B1");
        ws3.getCell("A1").value = "SỐ LIỆU ĐỊA PHƯƠNG";
        ws3.getCell("A1").font = { size: 13, bold: true, name: "Times New Roman" };
        ws3.getRow(1).height = 30;

        const lines = data.soLieu.split("\n").filter((l: string) => l.trim());
        lines.forEach((line: string) => {
          const parts = line.replace(/^[-•*]\s*/, "").split(/:\s*/);
          const row = ws3.addRow(parts.length > 1 ? [parts[0], parts.slice(1).join(": ")] : [line, ""]);
          row.getCell(1).font = { size: 11, name: "Times New Roman", bold: parts.length > 1 };
          row.getCell(2).font = { size: 11, name: "Times New Roman" };
          row.eachCell((cell: any) => {
            cell.border = { bottom: { style: "thin", color: { argb: "FFe0e0e0" } } };
          });
        });

        ws3.getColumn(1).width = 35;
        ws3.getColumn(2).width = 40;
      }

      // Set column widths for sheet 1
      ws.getColumn(1).width = 100;

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(data.title || "van-ban")}.xlsx`);
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Excel Export Error:", error);
      res.status(500).json({ error: "Failed to export Excel" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen to port if NOT running on Vercel (Vercel uses serverless functions)
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export the Express app for Vercel Serverless Functions
export default app;
