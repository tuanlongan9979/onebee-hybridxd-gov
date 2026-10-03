// Dùng chung cho api/lead.js và api/leads.js (file bắt đầu bằng "_" không thành endpoint trên Vercel)

const INTERESTS = [
  'Quy hoạch & Đất đai',
  'Cấp phép & TTHC điện tử',
  'Thẩm định dự án đầu tư công',
  'Thanh quyết toán & Giải ngân',
  'Hậu kiểm, Thanh tra & Lưu trữ',
  'Chưa xác định',
];
const LEVELS = ['UBND cấp Xã / Phường', 'Ban QLDA', 'Sở chuyên ngành', 'Cơ quan khác'];
const REQUESTS = [
  'Khảo sát hiện trạng & Demo giải pháp',
  'Tài liệu thuyết minh kiến trúc hệ thống',
  'Biên bản báo giá & Thuyết minh giải pháp',
  'Mẫu Dashboard giám sát đầu tư công',
  'Tài liệu hướng dẫn quy trình hậu kiểm số',
];
const PACKAGES = [
  'Chưa chọn',
  'Cấp cơ sở · UBND Xã/Phường',
  'Ban QLDA chuyên ngành',
  'Trung tâm điều hành cấp Tỉnh',
  'Tự cấu hình',
];
const SUPPORTS = [
  'Khảo sát hiện trạng liên thông Xã – Sở',
  'Giải pháp kiểm soát tiến độ giải ngân Ban QLDA',
  'Số hóa tài liệu lưu trữ',
  'Yêu cầu làm việc trực tiếp tại đơn vị',
];

// Mỗi đăng ký là 1 file JSON riêng tư: leads/<thời gian ISO>-<ngẫu nhiên>.json
const PREFIX = 'leads/';

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return null; }
}

module.exports = { INTERESTS, LEVELS, REQUESTS, PACKAGES, SUPPORTS, PREFIX, parseBody };
