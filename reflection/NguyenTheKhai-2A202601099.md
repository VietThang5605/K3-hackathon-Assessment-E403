# BẢN PHẢN TƯ CÁ NHÂN (PERSONAL REFLECTION LOG)

## I. THÔNG TIN CÁ NHÂN
- **Họ và tên:** Nguyễn Thế Khải
- **Mã học viên / MSSV:** 2A202601099
- **Dự án:** **VLearn Assessment Agent** (AI Tạo Quiz & Phát Hiện Lỗ Hổng Học Tập)
- **Vai trò:** **DevOps & Environment Setup** — đóng gói và dựng môi trường chạy thử (local deployment) cho toàn bộ hệ thống

---

## II. VAI TRÒ & PHẦN VIỆC ĐẢM NHẬN
Trong khi các bạn khác tập trung vào RAG pipeline, prompt engineering, API backend hay giao diện, mình phụ trách phần hạ tầng để cả nhóm có thể **"bấm một lệnh là chạy được"** khi demo tại các checkpoint. Cụ thể:

1. **Viết `docker-compose.yml`** orchestrate 3 service phối hợp với nhau:
   - `postgres` (Postgres 15-alpine, tự khởi tạo schema qua `backend/db/init.sql`).
   - `backend` (Express API, build từ `backend/Dockerfile`).
   - `frontend` (Next.js, build từ `frontend/Dockerfile`, chạy ở chế độ `output: standalone`).
2. **Viết Dockerfile riêng cho backend và frontend** — backend dùng image `node:18-alpine` đơn giản, frontend dùng **multi-stage build** (`deps` → `builder` → `runner`) để giảm kích thước image production và chạy bằng user không phải root (`nextjs`, uid 1001) cho an toàn hơn.
3. **Chuẩn hoá biến môi trường**: soạn `backend/.env.example` liệt kê đủ key cần thiết (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEFAULT_AI_PROVIDER`...) để bất kỳ ai clone repo cũng biết cần khai báo gì trước khi chạy, tránh commit nhầm API key thật lên GitHub.
4. **Hỗ trợ debug lỗi hạ tầng** phát sinh khi các thành viên tích hợp phần của mình vào Docker: container không kết nối được nhau, sai cổng, biến môi trường không khớp giữa `.env` và `docker-compose.yml`.

---

## III. SỰ HỖ TRỢ CỦA CÔNG CỤ AI
Mình dùng AI Coding Assistant chủ yếu ở vai trò tra cứu và rà soát cấu hình, không phải sinh toàn bộ hạ tầng một cách mù quáng:

- **Sinh khung Dockerfile chuẩn:** AI gợi ý cấu trúc multi-stage build cho Next.js (`deps` / `builder` / `runner`), bao gồm việc tạo user non-root và bật `output: 'standalone'` để image production nhẹ hơn — mình đọc lại và điều chỉnh theo đúng cấu trúc thư mục thật của `frontend/`.
- **Rà soát `docker-compose.yml`:** nhờ AI kiểm tra thứ tự `depends_on`, đặt tên `container_name` nhất quán (`vlearn_postgres`, `vlearn_backend`, `vlearn_frontend`) để các service gọi nhau qua tên DNS nội bộ của Docker network thay vì `localhost`.
- **Giải thích lỗi container** khi log báo `ECONNREFUSED` hoặc `getaddrinfo ENOTFOUND` lúc mới dựng — AI giúp mình phân biệt nhanh đâu là lỗi mạng Docker, đâu là lỗi biến môi trường sai tên.

AI tăng tốc phần viết cấu hình lặp đi lặp lại, nhưng phần quan trọng nhất — hiểu **khi nào một biến môi trường được đọc ở build-time hay runtime** — mình phải tự kiểm chứng lại bằng cách đọc kỹ code, vì đây chính là nguồn gốc của sự cố ở mục IV.

---

## IV. BÀI HỌC KINH NGHIỆM TỪ SỰ CỐ THẤT BẠI CỦA NHÓM

### 1. Sự cố thực tế
Khi rà lại toàn bộ hạ tầng trước một buổi demo, mình phát hiện một lỗi cấu hình tiềm ẩn giữa `frontend/next.config.js`, `frontend/Dockerfile` và `docker-compose.yml`:

- Trong `frontend/next.config.js`, hàm `rewrites()` đọc `process.env.BACKEND_INTERNAL_URL` để quyết định frontend sẽ gọi API backend ở đâu (`/api/:path*` → `${backendHost}/api/:path*`). Với Next.js dùng `output: 'standalone'`, cấu hình này được **đóng băng ngay tại thời điểm `next build`**, không đọc lại được ở runtime.
- Trong `frontend/Dockerfile`, biến này được khai báo đúng là một **build ARG** (`ARG BACKEND_INTERNAL_URL=http://vlearn_backend:8000`) — đúng tinh thần "phải có ở lúc build".
- Nhưng trong `docker-compose.yml`, service `frontend` chỉ truyền `BACKEND_INTERNAL_URL` ở mục `environment:` (biến **runtime**), không hề có mục `build.args` để đẩy giá trị đó vào lúc `docker compose build`.

Hệ quả: nếu ai đó build lại image mà không set `BACKEND_INTERNAL_URL` thủ công ở môi trường build, Next.js sẽ âm thầm dùng giá trị mặc định `http://127.0.0.1:8000` đóng cứng trong image — khiến frontend container gọi vào chính nó thay vì gọi sang container backend, và toàn bộ API sẽ lỗi kết nối dù cấu hình "nhìn có vẻ đúng" trên `docker-compose.yml`.

### 2. Nguyên nhân
Mình thiết kế `docker-compose.yml` theo phản xạ quen thuộc là "khai báo biến môi trường ở `environment:`" cho mọi service như nhau, mà chưa phân biệt rạch ròi giữa hai loại biến hoàn toàn khác nhau trong Docker: **build-time ARG** (chỉ có hiệu lực lúc `docker build`, cần khai báo ở `build.args`) và **runtime ENV** (chỉ có hiệu lực khi container đã chạy). Next.js với chế độ `standalone` lại càng dễ gây nhầm lẫn vì `next.config.js` chạy ở build-time nhưng biến đọc vào trông giống một biến môi trường thông thường.

### 3. Bài học rút ra & Giải pháp khắc phục
- **Bài học:** Không thể coi "biến môi trường" là một khái niệm đồng nhất khi làm việc với Docker multi-stage build. Với các framework có bước build tách riêng (Next.js, Vite...), phải xác định rõ từng biến được đọc ở giai đoạn nào trước khi quyết định khai báo nó ở `ARG` hay `ENV`, ở `build.args` hay `environment` trong compose — sai chỗ này thì mọi thứ vẫn "chạy" nhưng chạy sai âm thầm, rất khó phát hiện nếu không chủ động kiểm thử lại pipeline build từ đầu.
- **Giải pháp:** Mình bổ sung mục `args: - BACKEND_INTERNAL_URL=http://vlearn_backend:8000` vào phần `build` của service `frontend` trong `docker-compose.yml`, đảm bảo giá trị đúng được truyền vào ngay từ lúc build image, đồng thời vẫn giữ `environment:` cho các biến thực sự cần ở runtime. Sau khi sửa, mình build lại toàn bộ stack bằng `docker compose up --build` để xác nhận frontend gọi đúng sang `vlearn_backend:8000` thay vì `127.0.0.1:8000`.
- Qua sự cố này, mình rút ra nguyên tắc áp dụng chung cho phần DevOps của dự án: **luôn build lại từ đầu (clean build) trước khi coi một cấu hình hạ tầng là "xong"**, thay vì chỉ tin vào việc container khởi động không báo lỗi — vì lỗi cấu hình build-time thường không crash, mà chỉ âm thầm cho ra hành vi sai.
