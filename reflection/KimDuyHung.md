# Bài Báo Cáo Reflection Cá Nhân — Kim Duy Hưng

- **Họ và tên:** Kim Duy Hưng
- **Vai trò trong nhóm:** Data Evidence & Evaluation Specialist (Phân tích Dữ liệu, Khảo sát Nhu cầu & Kiểm thử AI)
- **Dự án:** VLearn Assessment Agent (AI Tạo Quiz & Phát Hiện Lỗ Hổng Học Tập) — Zone A (Nhóm 03)

---

## 1. Phần Việc Đảm Nhận & Đóng Góp Cụ Thể

Trong suốt 1.5 ngày diễn ra Mini Hackathon AI, tôi chịu trách nhiệm chính về khối lượng công việc liên quan đến **Bằng chứng (Evidence) & Kiểm thử (Evaluation)** để đảm bảo sản phẩm đạt chuẩn chất lượng theo Rubric R1 và R4:

1. **Khai phá Dữ liệu Chatlog (Data Mining - Rubric R1 chuẩn B):**
   - Phân tích tệp dữ liệu chatlog thực tế `chat_history_anonymized_for_hackathon.csv` chứa 1,261 lượt hội thoại giữa học viên và AI Tutor VLearn.
   - Lọc ra 420 lượt tin nhắn thắc mắc/nhầm lẫn kiến thức thực tế của học viên nhưng chưa bao giờ được kiểm tra định kỳ, trích xuất 5 quote nguyên văn đắt giá làm bằng chứng cho `spec.md` §1.

2. **Thiết kế & Thu thập Khảo sát Nhu cầu (Survey Log - Rubric R1 chuẩn A):**
   - Xây dựng bảng hỏi khảo sát gồm 6 câu hỏi định lượng & định tính (Q1-Q6) nhắm vào cả Giảng viên và Học viên ngoài nhóm.
   - Thu thập và lưu vết chi tiết N = 23 mẫu trả lời tại file [`evidence/survey_log.md`](file:///e:/lab/Batch03-K3-AI-Product-Hackathon/evidence/survey_log.md), chứng minh 95.6% người dùng yêu cầu phải có cổng kiểm duyệt (Human-in-the-Loop) và 91.3% xác nhận rất khó nhận biết lỗ hổng kiến thức của lớp học.

3. **Xây dựng Bộ Kiểm Thử Golden Set (Rubric R4):**
   - Biên soạn bộ 20 Test Cases chuẩn tại [`eval/golden_set.json`](file:///e:/lab/Batch03-K3-AI-Product-Hackathon/eval/golden_set.json) kết hợp từ 10 case chatlog thật và 10 case Slide VLearn.
   - Phủ đủ 4 lớp chỗ khó theo taxonomy: ① Nguồn sự thật, ② Mơ hồ/Thiếu thông tin, ③ Ngoài thẩm quyền, và ④ Đặc thù domain.

4. **Đánh giá Lượt 1 & Phân tích Nguyên nhân (Eval Run #1):**
   - Thực thi đánh giá bộ Golden Set, ghi nhận trung thực kết quả 15/20 PASS (75.0%) và **0% Hallucination (Đạt tuyệt đối bar không bịa đáp án)**.
   - Phân tích chi tiết nguyên nhân gốc rễ (Root Cause Analysis) của 5 cases chưa đạt tại [`eval/eval_results.md`](file:///e:/lab/Batch03-K3-AI-Product-Hackathon/eval/eval_results.md) và đề xuất hướng tối ưu Prompt & Pre-processing.

---

## 2. Ứng Dụng AI Trong Quá Trình Làm Việc (AI Co-pilot)

AI đã đóng vai trò là một trợ lý đắc lực giúp tôi tăng tốc tiến độ công việc gấp 3-4 lần:
- **Xử lý & Khai phá Dữ liệu:** Sử dụng AI để hỗ trợ viết nhanh các script Python lọc chatlog, phân loại các chủ đề thắc mắc phổ biến của học viên từ file CSV lớn.
- **Tổng hợp & Thống kê Số liệu:** Dùng AI hỗ trợ tính toán phần trăm khảo sát N=23, định dạng bảng Markdown trực quan cho Survey Log và Spec.
- **Tạo Edge Cases cho Golden Set:** Sử dụng AI để thảo luận, mở rộng các kịch bản lỗi ngoài ý muốn (Edge cases) liên quan đến đặc thù kỹ thuật như Code-switching (Anh-Việt) và công thức toán LaTeX.

---

## 3. Bài Học Đắt Giá Từ Case Fail Của Nhóm (Key Lesson Learned)

### 🔴 Case Fail Tiêu Biểu: TC04 (Slide chỉ có sơ đồ/hình ảnh nhưng ít văn bản)
Trong lượt chạy Eval đầu tiên, hệ thống đã đưa ra kết quả **FAIL ở TC04**. Nguyên nhân là do Slide bài giảng nguồn có mật độ chữ rất mỏng (chủ yếu là sơ đồ kiến trúc), nhưng Prompt đánh giá độ tin cậy (Confidence Score) ban đầu chưa được thiết lập cơ chế phạt nặng cho trường hợp này, dẫn đến việc AI vẫn cố sinh câu hỏi với độ tin cậy đánh giá sai lệch (0.65 thay vì < 0.4).

### 💡 Bài Học Rút Ra:
1. **Ranh giới của RAG & Grounding:** Không thể trông chờ LLM tự biết "khiêm tốn" từ chối nếu ta không cung cấp quy tắc Heuristic kiểm tra độ dài text (word count/text density) của tài liệu trước khi đưa vào Prompt.
2. **Giá trị của việc Đo đạc Trung thực:** Thay vì che giấu 5 case thất bại để lấy điểm đẹp, việc ghi nhận trung thực và phân tích đúng Root Cause giúp nhóm tìm ra ngay điểm gãy của Prompt, từ đó nhanh chóng cải tiến sản phẩm ở mốc Checkpoint 4 và Checkpoint 5.
