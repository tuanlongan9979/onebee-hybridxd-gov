# Vận hành OneBee HybridXD · Khối Nhà nước

## Lưu đăng ký

- Website: https://onebee-hybridxd-gov.vercel.app (dự án Vercel `onebee-hybridxd-gov`, tách riêng khỏi website doanh nghiệp)
- Danh sách đăng ký: https://onebee-hybridxd-gov.vercel.app/admin, nhập mã quản trị trong file `.admin-key.txt` của thư mục này (chỉ nằm trên máy, không upload; khác mã của website doanh nghiệp).
- Đăng ký từ website được ghi thẳng vào Lark Base (`api/lead.js` → `api/_lark.js`). Khi chưa đặt đủ 4 biến `LARK_*` hoặc Lark báo lỗi, đăng ký được lưu tạm vào Vercel Blob để không mất khách (xem tại /admin), rồi chuyển sang Lark sau.
- Dữ liệu cũ (trước khi chuyển sang Lark) nằm trong Vercel Blob `onebee-hybridxd-gov-leads`, mỗi đăng ký là 1 file `leads/<thời gian>-<mã>.json`. Xuất CSV ở /admin trước khi xoá hay đổi gì.
- Trang /admin: đếm theo nghiệp vụ, lọc theo cấp / yêu cầu / cấu hình, nút **Xuất Excel (CSV)**.
- Đổi mã quản trị: Vercel → Project onebee-hybridxd-gov → Settings → Environment Variables → `ADMIN_KEY`, rồi redeploy.
- Cập nhật website: sửa file trong thư mục này, chạy `npx vercel deploy --prod` tại thư mục `hybrid-gov-web`.
- Link sâu từng nghiệp vụ: `#quy-hoach` · `#cap-phep` · `#tham-dinh` · `#giai-ngan` · `#hau-kiem`.

---

# Cấu hình Lark Base

Website gửi đăng ký → hàm `api/lead.js` (chạy trên Vercel) → tạo 1 bản ghi trong Lark Base.

## 1. Tạo bảng trong Lark Base (5 phút)

1. Lark → Base → **Tạo mới → Nhập dữ liệu → CSV**, chọn file `lark-base-template.csv`. Đặt tên bảng: `Đăng ký khảo sát`.
2. Đổi kiểu cột cho đúng:

| Cột | Kiểu trường | Tùy chọn |
|---|---|---|
| Cơ quan / Đơn vị | Văn bản (cột chính) | |
| Họ và tên | Văn bản | |
| Chức vụ | Văn bản | |
| Số điện thoại | Số điện thoại | |
| Email | Văn bản | |
| Cấp quản lý | Chọn một | UBND cấp Xã / Phường · Ban QLDA · Sở chuyên ngành · Cơ quan khác |
| Nghiệp vụ quan tâm | Chọn một | Quy hoạch & Đất đai · Cấp phép & TTHC điện tử · Thẩm định dự án đầu tư công · Thanh quyết toán & Giải ngân · Hậu kiểm, Thanh tra & Lưu trữ · Chưa xác định |
| Yêu cầu | Chọn một | Khảo sát hiện trạng & Demo giải pháp · Tài liệu thuyết minh kiến trúc hệ thống · Biên bản báo giá & Thuyết minh giải pháp · Mẫu Dashboard giám sát đầu tư công · Tài liệu hướng dẫn quy trình hậu kiểm số |
| Cấu hình | Văn bản | Cấp cơ sở · UBND Xã/Phường · Ban QLDA chuyên ngành · Trung tâm điều hành cấp Tỉnh · Tự cấu hình · Chưa chọn |
| Nội dung hỗ trợ | Văn bản (các mục cách nhau bằng dấu phẩy) | Khảo sát hiện trạng liên thông Xã – Sở · Giải pháp kiểm soát tiến độ giải ngân Ban QLDA · Số hóa tài liệu lưu trữ · Yêu cầu làm việc trực tiếp tại đơn vị |
| Nghiệp vụ đã xem | Văn bản | |
| Ghi chú | Văn bản | Cấu hình tự chọn của khách |
| Nguồn đăng ký | Văn bản | |
| Trạng thái | Chọn một | Mới · Đã liên hệ · Đã demo · Đã ký |
| Ngày đăng ký | **Thời gian tạo** (thêm mới) | Lark tự điền |

3. Xóa dòng mẫu.

> Cột kiểu **Chọn một / Chọn nhiều** phải có sẵn đúng các tuỳ chọn ở bảng trên; nếu muốn chắc ăn, để kiểu Văn bản. Tên cột phải viết đúng y hệt bảng trên (kể cả dấu và ký tự `&`), nếu không API sẽ báo lỗi `FieldNameNotFound`.

## 2. Tạo Custom App để website ghi được vào Base

1. Vào https://open.larksuite.com/app → **Create Custom App**.
2. **Permissions & Scopes** → thêm quyền `bitable:app` (Đọc/ghi Base). Tạo phiên bản và phát hành app.
3. Lấy **App ID** và **App Secret** ở mục Credentials.
4. Mở Base vừa tạo → `…` → **Thêm ứng dụng / Add document app** → chọn app vừa tạo, cấp quyền **Có thể chỉnh sửa**.
5. Lấy 2 mã từ URL của Base:
   `https://xxx.larksuite.com/base/`**`bascnXXXXXXXX`**`?table=`**`tblYYYYYYYY`**`&view=...`
   → `LARK_BASE_TOKEN = bascnXXXXXXXX`, `LARK_TABLE_ID = tblYYYYYYYY`

## 3. Đưa website lên Vercel

1. Đẩy cả thư mục `hybrid-gov-web/` lên Vercel (kéo thả hoặc `vercel deploy`).
2. Vercel → Project → **Settings → Environment Variables**, thêm:

| Tên | Giá trị |
|---|---|
| `LARK_APP_ID` | App ID |
| `LARK_APP_SECRET` | App Secret |
| `LARK_BASE_TOKEN` | mã `bascn…` |
| `LARK_TABLE_ID` | mã `tbl…` |
| `LARK_DOMAIN` | bỏ trống (Lark quốc tế). Nếu dùng Feishu: `https://open.feishu.cn` |

3. Redeploy. Mở website, điền form đăng ký khảo sát → kiểm tra Base có dòng mới.

App Secret chỉ nằm trên Vercel, không lộ ra trình duyệt.
