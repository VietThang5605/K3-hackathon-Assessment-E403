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
1. **Thiết kế & Lập trình cơ sở dữ liệu dự phòng (Fallback DB):** Xây dựng các lớp truy xuất database PostgreSQL, thiết kế cơ chế failover sang In-Memory Database để tự động chuyển hướng đọc/ghi dữ liệu tạm thời trên RAM khi PostgreSQL mất kết nối, đảm bảo hệ thống hoạt động ổn định khi chạy demo.
2. **Xây dựng hệ thống Web API:**
   - Viết các endpoint tiếp nhận tài liệu slide PDF từ Next.js, bóc tách văn bản thô để lưu trữ metadata vào database.
   - Xây dựng API sinh Quiz tích hợp RAG, xử lý cơ chế tự động chuyển vùng dự phòng AI Provider (Gemini sang OpenAI) khi gặp lỗi giới hạn băng thông.
   - Hiện thực hóa API phê duyệt Quiz phục vụ cổng kiểm duyệt Human-in-the-Loop (HITL) cho giảng viên.
   - Phát triển API thu thập bài làm của học viên và tổng hợp dữ liệu Heatmap lỗ hổng kiến thức nhanh (DB-only) để tối ưu độ trễ cho Frontend.
3. **Kiểm thử tích hợp:** Viết script mô phỏng luồng dữ liệu end-to-end từ lúc upload slide đến lúc sinh heatmap để xác minh hệ thống.

---

## III. SỰ HỖ TRỢ CỦA CÔNG CỤ AI
Tôi đã sử dụng các công cụ trợ lý AI để hỗ trợ đẩy nhanh tiến độ dự án:
- **Tăng tốc sinh Boilerplate Code:** AI giúp sinh nhanh cấu trúc cơ bản cho Express API, cấu hình CORS, xử lý tải file và các truy vấn SQL, tiết kiệm đáng kể thời gian code thủ công.
- **Tối ưu hóa logic Fallback & Heatmap:** AI gợi ý giải pháp xử lý kết nối database dự phòng mượt mà và hỗ trợ tối ưu hóa thuật toán nhóm dữ liệu (group by) theo Concept Tag để tính tỉ lệ làm sai ở backend.

---

## IV. BÀI HỌC KINH NGHIỆM TỪ SỰ CỐ THẤT BẠI CỦA NHÓM
### 1. Sự cố thực tế & Nguyên nhân
- **Sự cố:** Trong đợt kiểm thử lượt 1 ở Checkpoint 3, hệ thống chỉ đạt tỷ lệ **75% PASS** so với cam kết Quality Bar là **85%**. Lỗi xảy ra khi giảng viên tải lên slide hầu như chỉ chứa hình vẽ và rất ít chữ (TC04). AI Generator vẫn cố sinh Quiz mông lung và gán mức độ tin cậy giả tạo là **0.65** thay vì cảnh báo cho giảng viên.
- **Nguyên nhân:** Prompt đánh giá mức độ tin cậy ban đầu chưa phạt nặng trường hợp slide thiếu dữ liệu nguồn văn bản thô.

### 2. Bài học rút ra & Giải pháp khắc phục
- **Bài học:** Không phụ thuộc hoàn toàn vào prompt-engineering để LLM tự phán đoán lượng thông tin. LLM có xu hướng cố gắng sinh kết quả ngay cả khi dữ liệu context đầu vào bị rỗng hoặc thiếu.
- **Giải pháp:** Bổ sung lớp kiểm duyệt lập trình truyền thống (rule-based heuristic check) tại backend. Khi slide trích xuất được dưới 50 ký tự, hệ thống lập tức báo thiếu thông tin nguồn và gắn badge Low Confidence ngay trên giao diện mà không cần gọi LLM. Giải pháp này giúp tối ưu chi phí gọi API và nâng tỷ lệ chạy đúng của Golden Set lên **90.0%** ở lượt chạy sau, vượt qua Quality Bar cam kết.
