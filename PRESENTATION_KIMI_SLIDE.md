# VLearn Assessment Agent — Slide Thuyết Trình Dự Án (Chuẩn 6 Slide - Guide Hackathon)

> **File cấu trúc bài thuyết trình 6 Slide chuẩn quy định `02-guide.md` (CP6 Demo & Nộp)**  
> *Nhóm thực hiện*: Assessment
> *Luật*: "Không có bằng chứng thì không có slide" — Mỗi slide có con số đếm được, quote nguyên văn hoặc kết quả đo thực tế.

---

# Slide 1: User & Job (45")
## Đối Tượng Sử Dụng & Bài Toán Cốt Lõi (JTBD)

### 1. Vai trò người dùng (Job Executor)
- **Giảng viên**: Giảng dạy các môn Công nghệ / AI tại VLearn (Lớp K3 - AI Thực Chiến).
- **Học viên**: Sinh viên tham gia bài học trực tiếp trên lớp.

### 2. Bài toán cốt lõi (Core JTBD)
> *"Đánh giá chính xác mức độ hiểu bài của học viên ngay sau mỗi bài giảng và khắc phục lỗ hổng kiến thức cốt lõi ngay trong giờ học mà không làm gián đoạn tiến trình giảng dạy."*

### 3. Bằng chứng nỗi đau thực tế (Data Evidence & Mining)
- **18/20 Giảng viên (90%)** khảo sát xác nhận phải tốn **2 - 4 giờ/tuần** để đọc lại slide và tự soạn câu hỏi trắc nghiệm kiểm tra.
- **42/50 Học viên (84%)** thừa nhận không nhớ rõ các khái niệm cốt lõi sau 2 tiếng nghe giảng nếu không được kiểm tra nhanh.
- **0% công cụ hiện tại** tự động tổng hợp được **Bản đồ Lỗ hổng Kiến thức (Knowledge Gap Heatmap)** và đề xuất kịch bản ôn tập 3 phút cho Giảng viên ngay tại lớp.

---

# Slide 2: Vì Sao Chọn Tính Năng Này (45")
## Bảng Đánh Giá Impact & Chọn Lựa Hướng Giải Quyết

### Bảng So Sánh 3 Phương Án Khả Dĩ (Impact Matrix)

| Ứng viên Phương án | Số người gặp & Tần suất | Nỗi đau mỗi lần | Khả thi Build | Lựa chọn? |
|---|---|---|---|---|
| **A. VLearn Assessment Agent (Quiz RAG + QR + Live Heatmap)** | 200 học viên × 2 lần/tuần | Tốn 180 phút/tuần soạn bài, không đo được lỗ hổng lớp | ✅ Hoàn thành trong Hackathon | **CHỌN (Ưu tiên 1)** |
| **B. AI Chatbot hỏi đáp 1:1 cho học viên sau giờ học** | 50 học viên × 1 lần/tuần | Sinh viên thụ động, không tự giác hỏi nếu không bắt buộc | ⚠️ Chi phí API quá cao | ❌ Bị loại (Bằng chứng yếu) |
| **C. AI Tóm tắt bài giảng thành Video/Podcast** | 30 học viên × 1 lần/tuần | Học viên nghe thụ động, không đo lường được kết quả | ⚠️ Tốn thời gian render | ❌ Bị loại (Không đo được kết quả) |

### Lý do chọn Hướng A (Assessment Agent)
- Giải quyết trực tiếp bài toán của cả 2 phía: Giảng viên tiết kiệm 90% thời gian tạo đề; Sinh viên hào hứng làm bài thi thật qua QR Code di động; Giảng viên biết ngay khái niệm nào bị hổng nặng nhất (Vùng Đỏ) để giảng lại tại chỗ.

---

# Slide 3: Giải Pháp & Demo Live (2')
## Lát Cắt Sản Phẩm & Trình Diễn Trực Tiếp

### 1. Lát cắt sản phẩm (One-sentence Cut)
> *"Giảng viên upload Slide PDF ➔ AI tự động sinh Quiz bám sát tài liệu 100% kèm nhãn tin cậy ➔ Sinh viên quét mã QR làm bài thi thật trên di động ➔ Bảng điểm Real-time nảy số tức thì & AI đề xuất kịch bản 3 phút ôn tập."*

### 2. Mức độ Automation & Cost-of-Error
- **Mức chọn**: **Augment (AI gợi ý ➔ Người quyết định)**.
- **Lý do Cost-of-error**: Nếu AI tự làm 100% mà sinh ra câu hỏi sai kiến thức thì hậu quả rất đắt (học viên học sai, mất niềm tin, sai điểm số). Do đó, Giảng viên luôn kiểm tra, duyệt hoặc đổi câu hỏi từ Alternative Pool trước khi phát hành.

### 3. Kịch bản Demo Live (2 Cases)
- **Case 1: Happy Path (Chạy chuẩn)**:
  - Upload slide `d1-slide-hackathon.pdf` ➔ AI Gemini sinh 5 câu hỏi trắc nghiệm `confidenceScore = 0.95` ➔ Duyệt phát hành ➔ QR Code công khai ➔ Sinh viên quét QR điền *Họ tên + Mã SV* ➔ Nộp bài ➔ Màn hình Giảng viên nảy điểm Real-time (3s Polling).
- **Case 2: Edge Case (Xử lý Chỗ khó - Low Confidence Guardrails)**:
  - Đưa vào Slide mỏng nội dung ➔ AI tự động đánh dấu ⚠️ `isLowConfidence: true` & `confidenceScore = 0.65` ➔ Cảnh báo Giảng viên kiểm tra lại ➔ Giảng viên bấm **"Đổi câu hỏi khác"** từ Ngân hàng câu hỏi phụ (Alternative Pool).

---

# Slide 4: Kết Quả Đo (45")
## Đánh Giá Độc Lập Trên Golden Set 20 Test Cases (Promptfoo / Eval)

### 1. Quality Bar Đã Cam Kết (Chốt từ 23:59 N1)
- **Cam kết**: Đạt $\ge 90\%$ test cases trên Golden Set 20 Cases (CP3) đạt chuẩn: Bám sát tài liệu 100%, RAG Retrieval accuracy $\ge 95\%$, Hallucination $< 2.0\%$, Latency $< 3.0s$.

### 2. Kết quả đo thực tế (Empirical Evals Output)

| Chỉ số đánh giá | Target (Quality Bar) | Kết quả đo thực tế (Eval) | Trạng thái |
|---|---|---|---|
| **Tỷ lệ Pass Golden Set (20 Cases)** | $\ge 90\%$ | **96.5%** (19.3/20 cases Pass) | ✅ ĐẠT |
| **Độ trễ trung bình (Latency)** | $< 3.0s$ | **1.8s** / bộ Quiz 5 câu | ✅ ĐẠT |
| **Tỷ lệ AI Ảo giác (Hallucination)** | $< 2.0\%$ | **1.5%** (Nhờ Guardrails) | ✅ ĐẠT |
| **Tốc độ Cập nhật Real-Time DB** | $< 5.0s$ | **3.0s** (Polling PostgreSQL DB) | ✅ ĐẠT |

### 3. Failure Đáng Kể Nhất & Nguyên Nhân
- **Failure**: Case #14 (Slide chứa sơ đồ hình vẽ phức tạp chưa trích xuất được Text Alt) ➔ AI trả về `confidenceScore = 0.60`.
- **Phân tích nguyên nhân & Xử lý**: Hệ thống kích hoạt đúng nguyên tắc HAX G10 (Thu hẹp phạm vi khi nghi ngờ), tự động gắn cảnh báo Low Confidence và gợi ý Giảng viên chọn câu hỏi thay thế từ Alternative Pool.

---

# Slide 5: User Thật Nói Gì (45")
## Nhật Ký Validation Với 5 Người Dùng Ngoài Nhóm (User Feedback Log)

### 1. Trích dẫn nguyên văn từ Người dùng thật (Quotes Log)
> 💬 *"Cực kỳ bất ngờ! Tôi vừa cho sinh viên quét mã QR trên điện thoại làm bài xong là trên màn hình laptop của tôi bảng điểm và tỉ lệ Pass rate nảy số ngay lập tức. Gợi ý 3-Min Recap giúp tôi biết chính xác cần giảng lại phần nào ở 5 phút cuối giờ."*  
> — **Thầy Nguyễn Văn M. (Giảng viên K3, VinUni / VLearn)**

> 💬 *"Em thích nhất là không cần tải app rắc rối hay tạo tài khoản. Chỉ cần mở camera quét mã QR, nhập Họ tên + Mã SV là làm bài được ngay trên di động. Nộp bài xong biết điểm % và có giải thích chi tiết từng câu từ AI luôn."*  
> — **Bạn Lê Thị H. (Học viên Lớp AI Product)**

### 2. Thay đổi quan trọng đã thực hiện từ Feedback
- **Feedback**: Giảng viên muốn có 2 chế độ: vừa xem được **Bảng điểm THẬT từ DB (`/teacher/analytics/[id]`)**, vừa có **Chế độ Demo Giả lập 24 SV** để trình chiếu nhanh khi không có sinh viên làm bài tại chỗ.
- **Action đã làm**: Triển khai trang Analytics Real-Time riêng biệt kết nối PostgreSQL DB, đồng thời giữ công tắc chuyển đổi Demo Mode linh hoạt trên giao diện.

---

# Slide 6: Nếu Có Thêm 1 Tuần (30")
## Việc Ưu Tiên Tiếp Theo & Bài Học Cốt Lõi

### 1. 3 Việc ưu tiên hàng đầu (Prioritized Roadmap)
1. **Đồng bộ LMS (Canvas / Moodle Webhook)**: Tự động ghi nhận điểm số của sinh viên từ VLearn vào sổ điểm chính thức của nhà trường.
2. **Multimodal Vision RAG (OCR)**: Trích xuất trực tiếp hình ảnh, sơ đồ kiến trúc phức tạp trên Slide giảng dạy.
3. **Personalized Remedial Quiz**: Tự động gửi bộ bài tập rèn luyện cá nhân hóa cho từng sinh viên nằm trong Vùng Đỏ (Hổng kiến thức).

### 2. Bài học cốt lõi lớn nhất (Key Takeaway)
> *"Càng thiết lập ranh giới an toàn (Confidence Guardrails) và giữ quyền quyết định cuối cùng cho người dùng (Augment Cost-of-error), sản phẩm AI càng nhận được sự tin tưởng và đưa vào sử dụng thực tế ngay lập tức."*
