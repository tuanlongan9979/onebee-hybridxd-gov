// POST /api/lead — nhận đăng ký khảo sát của cơ quan nhà nước, ghi thẳng vào Lark Base (xem _lark.js).
// Nếu chưa cấu hình Lark hoặc Lark báo lỗi, lưu tạm thành file JSON riêng tư trên Vercel Blob để không mất khách
// (cần BLOB_READ_WRITE_TOKEN, Vercel tự thêm khi kết nối Blob store với project).
const crypto = require('crypto');
const { put } = require('@vercel/blob');
const lark = require('./_lark');
const { INTERESTS, LEVELS, REQUESTS, PACKAGES, SUPPORTS, PREFIX, parseBody } = require('./_shared');

const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const pick = (v, list, fallback) => (list.includes(v) ? v : fallback);

// Tên cột phải trùng y hệt tên cột trong bảng Lark (xem LARK-BASE-SETUP.md)
const toLarkFields = (l) => ({
  'Cơ quan / Đơn vị': l.org,
  'Họ và tên': l.name,
  'Chức vụ': l.position,
  'Số điện thoại': l.phone,
  'Email': l.email,
  'Cấp quản lý': l.level,
  'Nghiệp vụ quan tâm': l.interest,
  'Yêu cầu': l.request,
  'Cấu hình': l.package,
  'Nội dung hỗ trợ': l.supports.join(', '),
  'Nghiệp vụ đã xem': l.viewed.join(', '),
  'Ghi chú': l.note,
  'Nguồn đăng ký': l.source,
  'Trạng thái': l.status,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Chỉ nhận POST' });
  }

  const b = parseBody(req);
  if (!b) return res.status(400).json({ ok: false, error: 'Dữ liệu không hợp lệ' });

  // Bẫy bot: trường ẩn "website" phải để trống
  if (b.website) return res.status(200).json({ ok: true });

  const lead = {
    createdAt: new Date().toISOString(),
    org: clean(b.org, 200),
    name: clean(b.name, 100),
    position: clean(b.position, 120),
    phone: clean(b.phone, 20).replace(/[\s.]/g, ''),
    email: clean(b.email, 120),
    level: pick(b.level, LEVELS, 'Cơ quan khác'),
    interest: pick(b.interest, INTERESTS, 'Chưa xác định'),
    request: pick(b.request, REQUESTS, REQUESTS[0]),
    package: pick(b.package, PACKAGES, 'Chưa chọn'),
    supports: Array.isArray(b.supports) ? b.supports.filter((s) => SUPPORTS.includes(s)) : [],
    note: clean(b.note, 500),
    viewed: Array.isArray(b.viewed) ? b.viewed.filter((v) => INTERESTS.includes(v)) : [],
    source: clean(b.source, 80) || 'Đăng ký khảo sát',
    status: 'Mới',
  };

  const emailOk = !lead.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  if (lead.org.length < 3 || lead.name.length < 2 || lead.position.length < 2 || !emailOk ||
      !/^(\+84|0)\d{9,10}$/.test(lead.phone)) {
    return res.status(400).json({ ok: false, error: 'Thiếu hoặc sai thông tin bắt buộc' });
  }

  if (lark.isConfigured()) {
    try {
      const id = await lark.addRecord(toLarkFields(lead));
      return res.status(200).json({ ok: true, id });
    } catch (err) {
      console.error('Lark write failed, saving to Blob', err.message);
    }
  }

  const id = `${lead.createdAt.replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
  try {
    await put(`${PREFIX}${id}.json`, JSON.stringify(lead), {
      access: 'private',
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
    });
    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('Blob put failed', err);
    return res.status(502).json({ ok: false, error: 'Không lưu được đăng ký' });
  }
};
