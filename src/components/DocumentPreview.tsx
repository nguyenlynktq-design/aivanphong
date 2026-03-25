import React from 'react';
import { cn } from '../lib/utils';
import { Document, DocType } from '../types';
import { findDocType } from '../config/docTypes';

/*
 * Thông số thể thức theo NĐ30/QĐ4114 & HD36:
 *
 * PAGE:   A4 (210×297mm), lề trái 30mm, phải 20mm (NĐ30) / 15mm (HD36), trên/dưới 20mm
 * HEADER: Table 2 cột: trái 3500 dxa (38.6%), phải 5571 dxa (61.4%), 2 dòng, ẩn viền
 *
 * QUỐC HIỆU     : IN HOA, đậm, cỡ 13
 * TIÊU NGỮ       : đậm, thường, cỡ 14, gạch dưới bằng chiều dài tiêu ngữ
 * CQ CHỦ QUẢN    : IN HOA, thường (KHÔNG đậm), cỡ 13
 * CQ BAN HÀNH    : IN HOA, ĐẬM, cỡ 13, gạch dưới 1/3 cột trái
 * SỐ KÝ HIỆU    : thường + ký hiệu HOA, cỡ 13
 * ĐỊA DANH       : nghiêng, cỡ 14
 * V/v TRÍCH YẾU  : thường, cỡ 12
 *
 * BODY:    cỡ 14, thụt đầu dòng 1cm, căn đều, spacing before/after 6pt, line 17pt (NĐ30) / 18pt (HD36)
 * KÍNH GỬI: cỡ 14, KHÔNG đậm
 * CĂN CỨ : nghiêng, cỡ 14, thụt đầu dòng
 *
 * QUYỀN HẠN KÝ  : IN HOA, đậm, cỡ 13
 * CHỨC VỤ KÝ    : IN HOA, đậm cỡ 13-14 (NĐ30) / KHÔNG đậm (HD36)
 * 4 DÒNG TRỐNG   cho chữ ký
 * TÊN NGƯỜI KÝ  : in thường, đậm, cỡ 14
 *
 * NƠI NHẬN       : "Nơi nhận:" đậm nghiêng cỡ 12 (NĐ30) / gạch chân (HD36), danh sách cỡ 11
 *
 * ĐẢNG: dấu sao * thay gạch ngang, T/M (gạch chéo), lề phải 15mm, line spacing ≥18pt
 */

interface DocumentPreviewProps {
  data: Partial<Document>;
  className?: string;
  scale?: number;
}

export const DocumentPreview = ({ data, className, scale = 1 }: DocumentPreviewProps) => {
  const category = data.category || 'government';
  const isParty = category === 'party';
  const isCongVan = data.docGroup === 'cong_van';
  const isBienBan = data.docGroup === 'bien_ban';
  const docMeta = findDocType(data.type as DocType, category);
  const tenLoaiVB = docMeta ? docMeta.label.toUpperCase() : '';

  const dateStr = data.dia_danh
    ? `${data.dia_danh}, ngày ${data.ngay || '...'} tháng ${data.thang || '...'} năm ${data.nam || '...'}`
    : `..., ngày ${data.ngay || '...'} tháng ${data.thang || '...'} năm ${data.nam || '...'}`;

  // CSS variables cho thể thức
  const COL_LEFT = '38.6%';   // 3500 / (3500+5571)
  const COL_RIGHT = '61.4%';  // 5571 / (3500+5571)

  return (
    <div
      className={cn('bg-white shadow-2xl mx-auto origin-top transition-transform duration-300', className)}
      style={{
        transform: `scale(${scale})`,
        width: '210mm',
        minHeight: '297mm',
        fontFamily: '"Times New Roman", "Times", serif',
        color: '#000',
        /* Lề */
        paddingTop: '20mm',
        paddingBottom: '20mm',
        paddingLeft: '30mm',
        paddingRight: isParty ? '15mm' : '20mm',
      }}
    >
      {/* ================================================================
          DÒNG 1 HEADER: CƠ QUAN (trái) + QUỐC HIỆU / ĐẢNG HIỆU (phải)
      ================================================================ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* ---- CỘT TRÁI: Cơ quan ---- */}
        <div style={{ width: COL_LEFT, textAlign: 'center' }}>
          {/* Cơ quan chủ quản: IN HOA, thường (KHÔNG đậm), cỡ 13 */}
          <p style={{ fontSize: '13pt', textTransform: 'uppercase', margin: 0, lineHeight: '1.3' }}>
            {data.co_quan_chu_quan || 'TÊN CƠ QUAN CHỦ QUẢN'}
          </p>
          {/* Cơ quan ban hành: IN HOA, ĐẬM, cỡ 13 */}
          <p style={{ fontSize: '13pt', textTransform: 'uppercase', fontWeight: 'bold', margin: 0, lineHeight: '1.3' }}>
            {data.co_quan_ban_hanh || 'TÊN CƠ QUAN BAN HÀNH'}
          </p>
          {/* Gạch ngang 1/3 cột trái (NĐ30) hoặc Dấu sao (Đảng) */}
          {isParty ? (
            <p style={{ fontSize: '13pt', fontWeight: 'bold', margin: '2px 0 0 0' }}>*</p>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '3px 0 0 0' }}>
              <div style={{ width: '33%', borderBottom: '1px solid #000' }} />
            </div>
          )}
        </div>

        {/* ---- CỘT PHẢI: Quốc hiệu / Đảng hiệu ---- */}
        <div style={{ width: COL_RIGHT, textAlign: 'center' }}>
          {isParty ? (
            <>
              {/* ĐẢNG HIỆU: IN HOA, đậm, cỡ 13 */}
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, lineHeight: '1.3' }}>
                ĐẢNG CỘNG SẢN VIỆT NAM
              </p>
              {/* Gạch dưới bằng chiều dài "ĐẢNG CỘNG SẢN VIỆT NAM" */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '3px 0 0 0' }}>
                <div style={{ width: '75%', borderBottom: '1px solid #000' }} />
              </div>
            </>
          ) : (
            <>
              {/* QUỐC HIỆU: IN HOA, đậm, cỡ 13 */}
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, lineHeight: '1.3' }}>
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              {/* TIÊU NGỮ: đậm, thường, cỡ 14 */}
              <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0, lineHeight: '1.3' }}>
                Độc lập - Tự do - Hạnh phúc
              </p>
              {/* Gạch dưới bằng chiều dài tiêu ngữ (~60% cột phải) */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '3px 0 0 0' }}>
                <div style={{ width: '60%', borderBottom: '1px solid #000' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================================================================
          DÒNG 2 HEADER: SỐ KÝ HIỆU (trái) + ĐỊA DANH NGÀY THÁNG (phải)
      ================================================================ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '6px' }}>
        {/* Cột trái: Số ký hiệu + V/v */}
        <div style={{ width: COL_LEFT, textAlign: 'center' }}>
          {/* Số ký hiệu: cỡ 13, thường */}
          <p style={{ fontSize: '13pt', margin: 0 }}>
            {data.so_ky_hieu || 'Số      /...'}
          </p>
          {/* V/v trích yếu cho Công văn: cỡ 12, thường */}
          {isCongVan && data.trich_yeu && (
            <p style={{ fontSize: '12pt', margin: '2px 0 0 0' }}>
              V/v {data.trich_yeu}
            </p>
          )}
        </div>
        {/* Cột phải: Địa danh, ngày tháng: nghiêng, cỡ 14 */}
        <div style={{ width: COL_RIGHT, textAlign: 'center' }}>
          <p style={{ fontSize: '14pt', fontStyle: 'italic', margin: 0 }}>
            {dateStr}
          </p>
        </div>
      </div>

      {/* ================================================================
          TÊN LOẠI VB + TRÍCH YẾU (cho VB có tên loại)
      ================================================================ */}
      {!isCongVan && (
        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '16px' }}>
          {/* Tên loại VB: IN HOA, đậm, cỡ 14 */}
          <p style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, lineHeight: '1.4' }}>
            {tenLoaiVB || 'TÊN LOẠI VĂN BẢN'}
          </p>
          {/* Trích yếu: đậm, cỡ 14 */}
          {data.trich_yeu && (
            <>
              <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                {data.trich_yeu}
              </p>
              {/* Gạch ngang dưới trích yếu */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <div style={{ width: '80px', borderBottom: '1px solid #000' }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ================================================================
          KÍNH GỬI (Công văn) — CỠ 14, KHÔNG ĐẬM, căn giữa
      ================================================================ */}
      {isCongVan && (
        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '16px', fontSize: '14pt' }}>
          {(data.kinh_gui || []).length > 0 ? (
            data.kinh_gui!.length === 1 ? (
              <p style={{ margin: 0 }}>
                Kính gửi: {data.kinh_gui![0]}
              </p>
            ) : (
              <div>
                {data.kinh_gui!.map((kg, i) => (
                  <p key={i} style={{ margin: 0, lineHeight: '1.4' }}>
                    {i === 0 ? 'Kính gửi: ' : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                    - {kg}{i < data.kinh_gui!.length - 1 ? ';' : '.'}
                  </p>
                ))}
              </div>
            )
          ) : (
            <p style={{ margin: 0, color: '#999' }}>Kính gửi: ...</p>
          )}
        </div>
      )}

      {/* ================================================================
          CĂN CỨ — Nghiêng, cỡ 14, thụt đầu dòng 1cm
      ================================================================ */}
      {(data.can_cu || []).length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {data.can_cu!.map((cc, i) => (
            <p key={i} style={{
              fontSize: '14pt',
              fontStyle: 'italic',
              textIndent: '1cm',
              margin: 0,
              paddingTop: '3pt',
              paddingBottom: '3pt',
              lineHeight: isParty ? '18pt' : '17pt',
              textAlign: 'justify',
            }}>
              {cc}
            </p>
          ))}
        </div>
      )}

      {/* ================================================================
          NỘI DUNG — Cỡ 14, thụt đầu dòng 1cm, căn đều 2 bên
          Spacing: before 6pt, after 6pt, line 17pt (NĐ30) / 18pt (HD36)
      ================================================================ */}
      <div style={{ minHeight: '150px', marginBottom: '20px' }}>
        {(data.noi_dung || '').split('\n').map((line, i) => (
          <p key={i} style={{
            fontSize: '14pt',
            textIndent: line.trim() ? '1cm' : '0',
            margin: 0,
            paddingTop: '6pt',
            paddingBottom: '6pt',
            lineHeight: isParty ? '18pt' : '17pt',
            textAlign: 'justify',
          }}>
            {line || '\u00A0'}
          </p>
        ))}
        {!data.noi_dung && (
          <p style={{
            fontSize: '14pt',
            color: '#bbb',
            textIndent: '1cm',
            paddingTop: '6pt',
            paddingBottom: '6pt',
            lineHeight: isParty ? '18pt' : '17pt',
          }}>
            Nội dung văn bản sẽ hiển thị tại đây...
          </p>
        )}
      </div>

      {/* ================================================================
          CHỮ KÝ — VB THƯỜNG (nơi nhận trái + chữ ký phải)
      ================================================================ */}
      {!isBienBan && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* ---- NƠI NHẬN (trái) ---- */}
          <div style={{ width: '40%' }}>
            {/* "Nơi nhận:" — NĐ30: đậm nghiêng cỡ 12 | HD36: gạch chân cỡ 12 */}
            <p style={{
              fontSize: '12pt',
              fontWeight: isParty ? 'normal' : 'bold',
              fontStyle: isParty ? 'normal' : 'italic',
              textDecoration: isParty ? 'underline' : 'none',
              margin: '0 0 2px 0',
            }}>
              Nơi nhận:
            </p>
            {/* Danh sách: cỡ 11, thường */}
            {(data.noi_nhan || ['- Như trên;', '- Lưu: VT, .']).map((nn, i) => (
              <p key={i} style={{ fontSize: '11pt', margin: 0, lineHeight: '1.4' }}>
                {nn.startsWith('-') ? nn : `- ${nn}`}
              </p>
            ))}
          </div>

          {/* ---- CHỮ KÝ (phải) ---- */}
          <div style={{ width: '50%', textAlign: 'center' }}>
            {/* Quyền hạn ký: IN HOA, đậm, cỡ 13 */}
            {data.signature?.quyen_han_ky && (
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                {data.signature.quyen_han_ky}
              </p>
            )}

            {/* KT chức vụ (TL+KT 3 dòng): đậm, cỡ 13 */}
            {data.signature?.kt_chuc_vu && (
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                {data.signature.kt_chuc_vu}
              </p>
            )}

            {/* Chức vụ ký:
                NĐ30: IN HOA, ĐẬM, cỡ 14 (nếu TL+KT 3 dòng → dòng cuối KHÔNG đậm)
                HD36: IN HOA, KHÔNG đậm */}
            <p style={{
              fontSize: '14pt',
              textTransform: 'uppercase',
              fontWeight: (() => {
                if (isParty) return 'normal'; // HD36: chức vụ KHÔNG đậm
                if (data.signature?.kt_chuc_vu) return 'normal'; // TL+KT 3 dòng: dòng cuối không đậm
                return 'bold'; // NĐ30 mặc định: đậm
              })(),
              margin: 0,
            }}>
              {data.signature?.chuc_vu_ky || 'CHỨC VỤ NGƯỜI KÝ'}
            </p>

            {/* 4 dòng trống — mô phỏng bằng 4 paragraphs rỗng */}
            <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
            <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
            <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
            <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>

            {/* Tên người ký: in thường, ĐẬM, cỡ 14 */}
            <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0 }}>
              {data.signature?.nguoi_ky || 'Họ và tên người ký'}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          CHỮ KÝ — BIÊN BẢN (Thư ký trái + Chủ trì phải)
      ================================================================ */}
      {isBienBan && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px' }}>
            {/* Thư ký (trái) */}
            <div style={{ width: '45%', textAlign: 'center' }}>
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                {data.chuc_vu_nguoi_ghi || 'NGƯỜI GHI BIÊN BẢN'}
              </p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0 }}>
                {data.nguoi_ghi || 'Họ tên người ghi'}
              </p>
            </div>

            {/* Chủ trì (phải) */}
            <div style={{ width: '45%', textAlign: 'center' }}>
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                {data.chuc_vu_chu_tri || 'CHỦ TRÌ HỘI NGHỊ'}
              </p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0 }}>
                {data.chu_tri || 'Họ tên chủ trì'}
              </p>
            </div>
          </div>

          {/* Xác nhận biên bản (nếu có — VB Đảng) */}
          {data.xac_nhan?.nguoi_ky && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                {data.xac_nhan.quyen_han}
              </p>
              <p style={{
                fontSize: '14pt',
                textTransform: 'uppercase',
                fontWeight: isParty ? 'normal' : 'bold',
                margin: 0,
              }}>
                {data.xac_nhan.chuc_vu}
              </p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', margin: 0 }}>&nbsp;</p>
              <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: 0 }}>
                {data.xac_nhan.nguoi_ky}
              </p>
            </div>
          )}

          {/* Nơi nhận biên bản */}
          <div style={{ marginTop: '16px' }}>
            <p style={{
              fontSize: '12pt',
              fontWeight: isParty ? 'normal' : 'bold',
              fontStyle: isParty ? 'normal' : 'italic',
              textDecoration: isParty ? 'underline' : 'none',
              margin: '0 0 2px 0',
            }}>
              Nơi nhận:
            </p>
            {(data.noi_nhan || ['- Lưu: VT.']).map((nn, i) => (
              <p key={i} style={{ fontSize: '11pt', margin: 0, lineHeight: '1.4' }}>
                {nn.startsWith('-') ? nn : `- ${nn}`}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
