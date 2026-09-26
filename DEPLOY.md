# DEPLOY.md — trạng thái triển khai & các bước tiếp theo

> Tài liệu cho chủ repo (đọc để biết đang ở đâu) và cho Claude (đọc để làm tiếp).
> Cập nhật: 2026-09-26 (đã gắn tên miền `chilonthon.com`, SES đã xác minh tên miền). Quy tắc làm việc và Hard rules nằm trong `CLAUDE.md` — vẫn áp dụng.
>
> Cách dùng: mở Claude trong repo này và gõ, ví dụ:
> **"Đọc DEPLOY.md rồi làm Bước A"** (hoặc bước nào bạn muốn). Claude sẽ hỏi từng việc một.

---

## 1. Đang chạy ở đâu (đã xong)

| | Trang IT | Trang Ảnh |
|---|---|---|
| **Tên miền** | **https://chilonthon.com** (và https://www.chilonthon.com) | **https://photo.chilonthon.com** |
| Địa chỉ Amplify (vẫn dùng được) | https://main.d21kdgth3ccglp.amplifyapp.com | https://main.d9tbb9ql4bwpu.amplifyapp.com |
| Trang quản trị | `/admin/login` | `/admin/login` |
| Amplify app ID | `d21kdgth3ccglp` | `d9tbb9ql4bwpu` |
| Bảng DynamoDB | `portfolio-it` | `portfolio-photo` |
| Ảnh/file (S3 → CloudFront) | `it/…` | `photo/…` |

- Tài khoản AWS `677276113002`, vùng **Singapore (ap-southeast-1)**, hạ tầng trong stack CloudFormation `portfolio-infra`
  (file `infra/template.yaml`).
- Tên miền `chilonthon.com` mua qua Route 53 (tự gia hạn, hết hạn 2027-09-26), hosted zone `Z0587891YUXNJL0MMKU8`.
  HTTPS do Amplify cấp và tự gia hạn (miễn phí).
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
| Gắn tên miền riêng | **Xong** (2026-09-26) | Bước A–D ở mục 3. |
| Gửi email trả lời trực tiếp cho khách | **Chưa** | Xem mục 3 (Bước E–F). |
| Dọn dịch vụ cũ | **Chưa** | Xem mục 4. Chỉ làm **sau khi** tên miền mới chạy ổn. |
| Repo cũ `AlecVOV/chilonthon-portfolio-site` | **Chưa** | Chuyển sang Private hoặc xóa — lịch sử của nó chứa `.env` và `dev_log.txt`. |

## 3. Tên miền + email (A–D xong; E–F còn lại)

Mục tiêu: **1 tên miền dùng chung cho 2 trang**, DNS trên **Route 53 hosted zone**, và **Amazon SES** gửi email
trả lời khách từ địa chỉ của tên miền.

| Địa chỉ | Trỏ tới |
|---|---|
| `chilonthon.com` và `www.chilonthon.com` | Trang IT (Amplify `d21kdgth3ccglp`). Cả 2 cùng hiển thị trang IT; thẻ canonical trỏ về `https://chilonthon.com`. |
| `photo.chilonthon.com` | Trang Ảnh (Amplify `d9tbb9ql4bwpu`) |
| `contact@chilonthon.com` | (Bước F) địa chỉ **gửi** email qua SES. Khách bấm Reply → thư về outlook của bạn (Reply-To). |

### Chi phí dự kiến (thêm vào hiện tại)
- Tên miền: khoảng **13–15 USD/năm** cho `.com` nếu mua qua Route 53 (đuôi khác giá khác — xem lúc mua).
- Route 53 hosted zone: **0,50 USD/tháng** (đây là khoản phí cố định duy nhất; truy vấn DNS gần như 0).
- Chứng chỉ HTTPS cho tên miền (ACM qua Amplify): **miễn phí**.
- SES: 0,10 USD / 1.000 email.
- Tổng vẫn nằm dưới Budget 5 USD/tháng; phí tên miền trả 1 lần/năm nên tháng mua có thể vượt cảnh báo 80%.

### Bước A — Mua tên miền — **XONG** (bạn làm, 2026-09-26)
- `chilonthon.com` qua Route 53; hosted zone tạo tự động; nameserver đăng ký khớp với hosted zone.

### Bước B — Gắn tên miền vào 2 app Amplify — **XONG** (Claude, CLI)
- Trang IT: domain `chilonthon.com`, subdomain `@` và `www` → branch `main`.
- Trang Ảnh: domain `photo.chilonthon.com` → branch `main` (Amplify chấp nhận subdomain làm domain của app thứ hai).
- Amplify tự tạo bản ghi DNS trong hosted zone và cấp chứng chỉ HTTPS (Amazon, `AMPLIFY_MANAGED`, tự gia hạn).
- `www` và tên miền gốc cùng hiển thị trang IT (không có chuyển hướng 301). Muốn `www` tự chuyển về
  `chilonthon.com` thì hỏi Claude — tùy chọn, không bắt buộc.

### Bước C — Cập nhật cấu hình theo tên miền mới — **XONG** (Claude)
- `NUXT_PUBLIC_SITE_URL` của trang IT = `https://chilonthon.com` (đã build lại).
- Tham số stack `AllowedOrigins` (CORS tải ảnh lên S3) giờ gồm: `http://localhost:3000`, 2 địa chỉ `*.amplifyapp.com`,
  `https://chilonthon.com`, `https://www.chilonthon.com`, `https://photo.chilonthon.com`.
- Cognito không cần sửa (không dùng hosted UI/callback URL).

### Bước D — Xác minh tên miền cho SES — **XONG** (Claude, qua stack)
- `infra/template.yaml` có thêm SES identity cho `chilonthon.com` (Easy DKIM 2048-bit) và các bản ghi trong hosted zone:
  3 CNAME DKIM, MAIL FROM `mail.chilonthon.com` (MX `feedback-smtp.ap-southeast-1.amazonses.com` + TXT SPF
  `v=spf1 include:amazonses.com ~all`), DMARC `_dmarc.chilonthon.com` = `v=DMARC1; p=none`.
- Kết quả: SES báo domain **Verified**, DKIM **SUCCESS**, MAIL FROM **SUCCESS**.
- DMARC để `p=none` (chỉ theo dõi) và không có `rua`: địa chỉ outlook không nhận báo cáo DMARC của tên miền khác.
  Khi thư từ `contact@chilonthon.com` đã gửi ổn định (sau Bước F), có thể siết lên `p=quarantine`.
- Tham số stack mới: `DomainName=chilonthon.com`, `HostedZoneId=Z0587891YUXNJL0MMKU8`.

### Bước E — Xin ra khỏi SES sandbox (bạn làm trên web, AWS duyệt ~24 giờ)
- Hiện SES đang ở **sandbox**: chỉ gửi được tới địa chỉ đã xác minh (outlook của bạn). Muốn gửi thẳng cho khách
  phải xin **production access**: SES console (Singapore) → **Account dashboard** → **Request production access**.
- Mô tả gợi ý: *transactional email only — replies to visitors who contacted me through my personal portfolio contact
  form; low volume (< 100/month); no marketing; bounces/complaints handled manually.*

### Bước F — Sửa code gửi email trả lời (Claude làm, sau khi E được duyệt)
- Hiện nút **Reply** trong `/admin/messages` (trang IT) gửi bản nháp **về outlook của bạn** (Reply-To = khách),
  bạn bấm Reply trong hộp thư để gửi cho khách — do SES sandbox.
- Sau khi có production access: `server/api/messages/send-reply.post.ts` gửi **thẳng cho khách**
  từ `contact@chilonthon.com`, Reply-To = outlook của bạn; đổi `SES_FROM_EMAIL` = `contact@chilonthon.com` cho cả 2 app;
  cập nhật IAM `ses:SendEmail` trong template sang identity `chilonthon.com` (ARN `…:identity/chilonthon.com`,
  điều kiện `ses:FromAddress`); deploy stack; build lại 2 app.
- Nhận email **tại** `contact@chilonthon.com` là không cần thiết (khách trả lời sẽ về outlook qua Reply-To).
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
- Deploy hạ tầng luôn cần chủ repo gõ đồng ý trong phiên (Hard rule 3). Luôn truyền **đủ** tham số:
  ```bash
  aws cloudformation deploy --template-file infra/template.yaml --stack-name portfolio-infra \
    --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1 --parameter-overrides \
    OwnerEmail=lhtthong.forwork@outlook.com DomainName=chilonthon.com HostedZoneId=Z0587891YUXNJL0MMKU8 \
    "AllowedOrigins=http://localhost:3000,https://main.d21kdgth3ccglp.amplifyapp.com,https://main.d9tbb9ql4bwpu.amplifyapp.com,https://chilonthon.com,https://www.chilonthon.com,https://photo.chilonthon.com"
  ```
- Tên miền Amplify: `aws amplify list-domain-associations --app-id <id> --region ap-southeast-1`.
- Trên Windows Git Bash: đặt `MSYS_NO_PATHCONV=1` khi lệnh AWS có đường dẫn bắt đầu bằng `/aws/...`.
