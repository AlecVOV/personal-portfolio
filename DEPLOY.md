# DEPLOY.md — trạng thái triển khai & các bước tiếp theo

> Tài liệu cho chủ repo (đọc để biết đang ở đâu) và cho Claude (đọc để làm tiếp).
> Cập nhật: 2026-09-26. Quy tắc làm việc và Hard rules nằm trong `CLAUDE.md` — vẫn áp dụng.
>
> Cách dùng: mở Claude trong repo này và gõ, ví dụ:
> **"Đọc DEPLOY.md rồi làm Bước A"** (hoặc bước nào bạn muốn). Claude sẽ hỏi từng việc một.

---

## 1. Đang chạy ở đâu (đã xong)

| | Trang IT | Trang Ảnh |
|---|---|---|
| Địa chỉ hiện tại | https://main.d21kdgth3ccglp.amplifyapp.com | https://main.d9tbb9ql4bwpu.amplifyapp.com |
| Trang quản trị | `/admin/login` | `/admin/login` |
| Amplify app ID | `d21kdgth3ccglp` | `d9tbb9ql4bwpu` |
| Bảng DynamoDB | `portfolio-it` | `portfolio-photo` |
| Ảnh/file (S3 → CloudFront) | `it/…` | `photo/…` |

- Tài khoản AWS `677276113002`, vùng **Singapore (ap-southeast-1)**, hạ tầng trong stack CloudFormation `portfolio-infra`
  (file `infra/template.yaml`).
- Ảnh/file phục vụ qua CloudFront: `https://dfpws93hyi7js.cloudfront.net`.
- Đăng nhập admin (cả 2 trang dùng chung 1 tài khoản): email `lhtthong.forwork@outlook.com` + mật khẩu bạn đã đặt.
  Có thể bật mã xác thực 2 lớp (TOTP) sau.
- Email: form liên hệ lưu tin nhắn vào DynamoDB **và** gửi email báo về `lhtthong.forwork@outlook.com` qua Amazon SES.
- Cảnh báo chi phí: Budget `portfolio-monthly-5usd` gửi email khi chi phí thực > 4 USD hoặc dự báo > 5 USD/tháng.
- CDN đã cache trang công khai (đã kiểm tra `x-cache: Hit from cloudfront`).

**Lưu ý:** mỗi lần `git push` lên `main`, **cả 2 app đều build lại** (vài phút build mỗi app, tốn rất ít tiền).
Gom thay đổi rồi push một lần.

## 2. Việc còn lại trong checklist (Phase 6 của CLAUDE.md)

| Việc | Trạng thái | Ghi chú |
|---|---|---|
| Chuyển dữ liệu lần cuối | Trang Ảnh: **không cần** (không có nội dung mới). Trang IT: **chưa chạy lại** | Chỉ cần nếu bạn đã sửa nội dung trên trang IT cũ sau 2026-09-25. Nói với Claude: "chạy lại migrate cho it". Chạy lại sẽ **ghi đè** dữ liệu trên trang mới bằng dữ liệu Supabase. |
| Bạn tự thử trang mới | **Chưa** | Đăng nhập `/admin/login` trên cả 2 trang; thêm/sửa/xóa thử 1 mục; tải thử 1 ảnh; gửi thử form liên hệ và kiểm tra hộp thư outlook. |
| Gắn tên miền riêng | **Chưa** | Xem mục 3 (Bước A–D). |
| Gửi email trả lời trực tiếp cho khách | **Chưa** | Xem mục 3 (Bước E–F). |
| Dọn dịch vụ cũ | **Chưa** | Xem mục 4. Chỉ làm **sau khi** tên miền mới chạy ổn. |
| Repo cũ `AlecVOV/chilonthon-portfolio-site` | **Chưa** | Chuyển sang Private hoặc xóa — lịch sử của nó chứa `.env` và `dev_log.txt`. |

## 3. Kế hoạch tên miền + email (chưa làm — hỏi Claude từng bước)

Mục tiêu: **mua 1 tên miền dùng chung cho 2 trang**, quản lý DNS bằng **Route 53 hosted zone**, và dùng **Amazon SES**
để gửi email trả lời khách từ địa chỉ của tên miền (ví dụ `contact@tenmien.com`).

Ví dụ bố trí (thay `tenmien.com` bằng tên bạn mua):

| Địa chỉ | Trỏ tới |
|---|---|
| `tenmien.com` và `www.tenmien.com` | Trang IT (Amplify `d21kdgth3ccglp`) |
| `photo.tenmien.com` | Trang Ảnh (Amplify `d9tbb9ql4bwpu`) |
| `contact@tenmien.com` | Địa chỉ **gửi** email (SES). Khách bấm Reply → thư về outlook của bạn (Reply-To). |

### Chi phí dự kiến (thêm vào hiện tại)
- Tên miền: khoảng **13–15 USD/năm** cho `.com` nếu mua qua Route 53 (đuôi khác giá khác — xem lúc mua).
- Route 53 hosted zone: **0,50 USD/tháng** (đây là khoản phí cố định duy nhất; truy vấn DNS gần như 0).
- Chứng chỉ HTTPS cho tên miền (ACM qua Amplify): **miễn phí**.
- SES: 0,10 USD / 1.000 email.
- Tổng vẫn nằm dưới Budget 5 USD/tháng; phí tên miền trả 1 lần/năm nên tháng mua có thể vượt cảnh báo 80%.

### Bước A — Mua tên miền (bạn làm, tốn tiền)
1. AWS Console → **Route 53** → **Registered domains** → **Register domains**, tìm tên, thanh toán.
2. Route 53 **tự tạo hosted zone** cho tên miền. Chờ trạng thái đăng ký thành công (vài phút tới vài giờ),
   và xác nhận email từ AWS/ICANN gửi về (nếu có) — nếu không xác nhận, tên miền có thể bị tạm khóa.
3. (Nếu mua ở nơi khác như Namecheap/GoDaddy: tạo hosted zone trong Route 53 rồi đổi 4 nameserver ở nơi mua
   sang nameserver của Route 53. Claude sẽ hướng dẫn.)

### Bước B — Gắn tên miền vào 2 app Amplify (Claude làm được bằng CLI, bạn chỉ xác nhận)
- Trang IT: domain `tenmien.com`, subdomain `@` và `www` → branch `main`.
- Trang Ảnh: domain `photo.tenmien.com` → branch `main`.
  (Amplify cho phép gắn subdomain làm domain của app thứ hai; Claude kiểm tra lại lúc làm.)
- Amplify tự tạo bản ghi DNS trong hosted zone và cấp HTTPS; chờ trạng thái `AVAILABLE` (thường 15–30 phút).

### Bước C — Cập nhật cấu hình theo tên miền mới (Claude làm, cần bạn gõ "deploy" cho bước hạ tầng)
- Biến `NUXT_PUBLIC_SITE_URL` của trang IT → `https://tenmien.com`, rồi build lại.
- Tham số stack `AllowedOrigins` (CORS cho tải ảnh lên S3) → thêm `https://tenmien.com`, `https://www.tenmien.com`,
  `https://photo.tenmien.com`, rồi deploy lại stack (miễn phí).
- Cognito không cần sửa (không dùng hosted UI/callback URL).

### Bước D — Xác minh tên miền cho SES (Claude làm, cần "deploy")
- Thêm vào `infra/template.yaml`: SES email identity cho **tên miền** (Easy DKIM) + các bản ghi Route 53:
  3 CNAME DKIM, MAIL FROM `mail.tenmien.com` (MX + TXT SPF `v=spf1 include:amazonses.com ~all`),
  DMARC `_dmarc.tenmien.com` (TXT `v=DMARC1; p=none; rua=mailto:lhtthong.forwork@outlook.com`).
- Chờ SES báo domain **Verified** (vài phút tới 72 giờ).

### Bước E — Xin ra khỏi SES sandbox (bạn làm trên web, AWS duyệt ~24 giờ)
- Hiện SES đang ở **sandbox**: chỉ gửi được tới địa chỉ đã xác minh (outlook của bạn). Muốn gửi thẳng cho khách
  phải xin **production access**: SES console (Singapore) → **Account dashboard** → **Request production access**.
- Mô tả gợi ý: *transactional email only — replies to visitors who contacted me through my personal portfolio contact
  form; low volume (< 100/month); no marketing; bounces/complaints handled manually.*

### Bước F — Sửa code gửi email trả lời (Claude làm, sau khi E được duyệt)
- Hiện nút **Reply** trong `/admin/messages` (trang IT) gửi bản nháp **về outlook của bạn** (Reply-To = khách),
  bạn bấm Reply trong hộp thư để gửi cho khách — do SES sandbox.
- Sau khi có production access: `server/api/messages/send-reply.post.ts` gửi **thẳng cho khách**
  từ `contact@tenmien.com`, Reply-To = outlook của bạn; đổi `SES_FROM_EMAIL` = `contact@tenmien.com` cho cả 2 app;
  cập nhật IAM `ses:SendEmail` trong template sang identity của tên miền; build lại 2 app.
- Nhận email **tại** `contact@tenmien.com` là không cần thiết (khách trả lời sẽ về outlook qua Reply-To).
  Nếu sau này muốn hộp thư riêng cho tên miền thì cần dịch vụ chuyển tiếp email — hỏi Claude.

## 4. Dọn dẹp dịch vụ cũ (chỉ sau khi tên miền mới chạy ổn — xóa là không hoàn tác)
1. Nếu trang cũ trên Vercel có tên miền riêng: gỡ tên miền khỏi Vercel (hoặc trỏ về tên miền mới).
2. Xóa 2 project trên Vercel.
3. Supabase: **xuất bản sao lưu lần cuối** (Claude chạy `scripts/migrate export`, dữ liệu nằm ở
   `scripts/migrate/data/` trên máy bạn), rồi xóa **2 project** Supabase (IT và Ảnh là 2 project riêng).
4. Cloudinary: tải về nếu cần, rồi xóa tài khoản/ảnh (ảnh đã nằm trên S3).
5. Resend, Web3Forms: xóa API key / tài khoản.
6. Repo cũ `AlecVOV/chilonthon-portfolio-site`: Settings → chuyển **Private** hoặc **Delete**.
7. Xóa các biến cũ trong file `.env` trên máy (Supabase/Resend/Web3Forms/Cloudinary) — chúng không còn dùng.

## 5. Bảo mật — việc cần nhớ
- Mật khẩu cũ (dùng cho Supabase DB và admin cũ) **đã bị lộ** (trong `dev_log.txt`, repo cũ và lịch sử chat).
  Không dùng lại ở bất kỳ đâu; nếu còn dùng cho tài khoản khác thì đổi ngay.
- Các key đã từng nằm trong repo cũ (Supabase service key, Resend, Web3Forms): coi như lộ. Chúng sẽ hết tác dụng
  khi xóa dịch vụ ở mục 4; nếu chưa xóa ngay thì đổi (rotate) key.
- Trang mới không dùng access key nào: server lấy quyền AWS qua IAM compute role của Amplify.
- Không bao giờ dán mật khẩu/key vào chat. Khi cần nhập, Claude sẽ đưa lệnh có ô nhập ẩn hoặc chỉ chỗ dán vào file `.env`.

## 6. Tra cứu nhanh cho Claude
- Output của stack: `aws cloudformation describe-stacks --stack-name portfolio-infra --region ap-southeast-1 --query 'Stacks[0].Outputs'`
- Biến môi trường Amplify đặt bằng CLI từ output của stack (xem mục "Live resources" trong CLAUDE.md);
  `update-app --environment-variables` **thay toàn bộ** danh sách — luôn gộp với danh sách hiện có, không in giá trị.
- Build lại một app: `aws amplify start-job --app-id <id> --branch-name main --job-type RELEASE --region ap-southeast-1`
- Deploy hạ tầng luôn cần chủ repo gõ đồng ý trong phiên (Hard rule 3); nhớ truyền lại `OwnerEmail` và `AllowedOrigins`.
- Trên Windows Git Bash: đặt `MSYS_NO_PATHCONV=1` khi lệnh AWS có đường dẫn bắt đầu bằng `/aws/...`.
