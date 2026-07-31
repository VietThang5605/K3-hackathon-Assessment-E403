# BẢN PHẢN TƯ CÁ NHÂN (PERSONAL REFLECTION LOG)

## I. THÔNG TIN CÁ NHÂN
- **Họ và tên:** Nguyễn Việt Thắng
- **Mã học viên / MSSV:** 2A202601321
- **Khóa:** 3
- **Nhóm:** Assessment
- **Dự án:** **VLearn Assessment Agent** (AI Tạo Quiz & Phát Hiện Lỗ Hổng Học Tập)

---

## II. VAI TRÒ & PHẦN VIỆC ĐẢM NHẬN
Trong dự án này, tôi đảm nhận vai trò **Integration & API Developer** (Lập trình viên tích hợp Backend API, kết nối Frontend với RAG Engine). Cụ thể, các công việc thực tế tôi đã hoàn thành bao gồm:
1. **Thiết kế & Lập trình DB Client (`dbClient.js`):** 
   - Xây dựng các lớp truy xuất cơ sở dữ liệu PostgreSQL.
   - Thiết kế cơ chế dự phòng hoạt động (**Fallback/Failover In-Memory Database**). Khi PostgreSQL gặp lỗi kết nối hoặc trễ trong môi trường Docker, hệ thống sẽ tự động chuyển hướng đọc/ghi dữ liệu tạm thời trên RAM mà không làm sập luồng API. Điều này đảm bảo tính bền vững (resilience) của ứng dụng khi demo trực tiếp.
2. **Xây dựng hệ thống Web API (`server.js`):**
   - Viết các endpoint tiếp nhận tài liệu slide bài giảng PDF từ giao diện Next.js, sử dụng thư viện `pdf-parse` để bóc tách văn bản thô (text extraction) rồi lưu trữ metadata an toàn vào cơ sở dữ liệu.
   - Viết API `/api/generate-quiz` để tích hợp với module `teacherAgent`. API này hỗ trợ thay đổi cấu hình AI Provider linh hoạt (Gemini-1.5-flash / Gemini-3-flash) và cơ chế tự động chuyển vùng dự phòng (fallback sang OpenAI/GPT-4o-mini) nếu API key chính bị giới hạn băng thông.
   - Hiện thực hóa cổng kiểm duyệt **Human-in-the-Loop (HITL)** qua API `/api/quizzes/publish` để giảng viên phê duyệt, chỉnh sửa câu hỏi nháp trước khi chính thức phát hành.
   - Xây dựng bộ API thu thập bài làm của sinh viên (`/api/quizzes/:id/submit`) và tổng hợp dữ liệu Heatmap lỗ hổng kiến thức (`/api/quizzes/:id/heatmap` & `/api/quizzes/:id/heatmap-fast` - sử dụng kỹ thuật tính toán nhanh DB-only không gọi lại LLM để giảm thiểu độ trễ cho frontend).
3. **Phối hợp Tích hợp & Kiểm thử Hệ thống:**
   - Viết script kiểm thử tích hợp tự động `test_agent.js` để kiểm chứng toàn bộ luồng dữ liệu từ lúc upload slide đến lúc sinh heatmap.

---

## III. SỰ HỖ TRỢ CỦA CÔNG CỤ AI
Công cụ AI (như các trợ lý AI Coding, Antigravity IDE) đã đóng góp đáng kể vào tiến trình phát triển và hoàn thiện mã nguồn backend của tôi:
- **Tăng tốc sinh Boilerplate Code:** AI hỗ trợ đắc lực trong việc viết nhanh khung sườn Express API, cấu hình CORS, xử lý upload file qua `multer`, và các câu lệnh truy vấn SQL phức tạp (INSERT/SELECT/RETURNING) giúp tiết kiệm 70% thời gian gõ code lặp đi lặp lại.
- **Tối ưu hóa thuật toán Fallback DB:** Trợ lý AI gợi ý cách cài đặt cơ chế kiểm tra `isPgConnected` thông qua `connectionTimeoutMillis` và cấu trúc đối tượng `memoryDb` đồng bộ để làm mịn trải nghiệm chuyển mạch khi database offline.
- **Tính toán Heatmap hiệu quả:** AI đã giúp tôi định hình thuật toán nhóm (group by) và tổng hợp tỷ lệ làm sai dựa trên các Concept Tag gán kèm câu hỏi một cách tối ưu nhất ở backend để gửi cấu trúc JSON sạch cho frontend Next.js vẽ biểu đồ.

---

## IV. BÀI HỌC KINH NGHIỆM TỪ SỰ CỐ THẤT BẠI CỦA NHÓM
### 1. Sự cố thực tế
Trong giai đoạn kiểm thử chạy thử lượt 1 ở Checkpoint 3 (CP3), nhóm chúng tôi đã vấp phải một thất bại thực tế:
- **Kết quả kiểm thử lượt 1:** Chỉ đạt **15 / 20 câu ĐẠT (75.0%)**, trong khi cam kết Quality Bar là **85.0%**.
- **Lỗi cụ thể (TC04):** Khi giảng viên tải lên một slide bài giảng hầu như chỉ chứa sơ đồ khối và hình vẽ mà rất ít chữ (text density cực thấp), AI Generator vẫn cố gắng sinh ra đủ số câu hỏi trắc nghiệm chuyên sâu và gán mức độ tin cậy (**Confidence Score**) giả tạo là **0.65** (đáng lẽ phải thấp hơn 0.4 để kích hoạt badge cảnh báo ⚠️ Low Confidence cho giảng viên). Hệ quả là câu hỏi sinh ra bị mông lung, thậm chí có phần ảo giác kiến thức ngoài lề.

### 2. Nguyên nhân
Prompt kiểm duyệt độ tin cậy (Confidence Calibration Prompt) ban đầu chỉ tập trung đánh giá mặt ngữ nghĩa câu hỏi mà chưa phạt nặng trường hợp slide thiếu dữ liệu nguồn (low word count).

### 3. Bài học rút ra & Giải pháp khắc phục
- **Bài học:** Chúng tôi rút ra bài học sâu sắc là **không thể phụ thuộc hoàn toàn 100% vào việc prompt-engineering để LLM tự phán đoán lượng thông tin**. AI có xu hướng cố gắng chiều lòng người dùng và sinh ra kết quả dù context đầu vào bị rỗng/thiếu.
- **Giải pháp:** Đối với các bài toán RAG, cần có một lớp kiểm duyệt lập trình truyền thống (rule-based validation / heuristic check) chạy ở backend trước khi gọi API của LLM. Trong trường hợp TC04, tôi đã bổ sung code kiểm tra độ dài văn bản trích xuất từ slide PDF (nếu độ dài nhỏ hơn 50 ký tự, hệ thống lập tức đánh giá là không đủ dữ liệu nguồn, bật badge Low Confidence hoặc yêu cầu bổ sung context ngay tại giao diện mà không cần chờ LLM tính toán). Bài học này giúp tối ưu hóa đáng kể Cost of error và nâng tỷ lệ chạy đúng của Golden Set lên **90.0%** ở lượt chạy sau, vượt qua Quality Bar cam kết.
