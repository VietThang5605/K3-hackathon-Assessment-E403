# Reflection — Đức

**Vai trò:** Tôi là Đức — chịu trách nhiệm `AI Spec & Validation` (kiểm định bộ câu hỏi, đảm bảo chất lượng và xây dựng kịch bản rủi ro).

**Phần mình làm:** Soạn và hoàn thiện `AI spec`, định nghĩa tiêu chí chất lượng (Golden Set, Quiz Relevance Rate, No Hallucination Rate), thiết kế các kịch bản lỗi (nguồn sự thật, mơ hồ, ngoài phạm vi, đặc thù domain) và kiểm định bộ câu hỏi do hệ thống sinh ra trước khi đưa qua bước review của giảng viên.

**AI hỗ trợ thế nào:** Hệ thống dùng AI (Gemini / OpenAI) làm Draft Generator để đọc slide, trích xuất khái niệm, sinh câu hỏi trắc nghiệm nháp và gán tag/độ tin cậy. AI giúp rút ngắn thời gian soạn quiz từ ~60 phút xuống còn vài phút, đồng thời cung cấp metadata (confidence badge, grounding info) để chúng tôi rà soát nhanh.

**Một bài học từ case fail của nhóm:** Kết quả kiểm thử Golden Set Run 2 cho thấy hệ thống đạt **75.0% (15/20)** nhưng vẫn còn lỗi tập trung ở lớp *Low Confidence* và *Out-of-Scope* (ví dụ: CASE-12, CASE-14, CASE-16, CASE-17, CASE-18). Trong một lần thử nội bộ, AI sinh câu hỏi trông hợp lý nhưng tham chiếu sai ngữ cảnh hoặc thiếu nhãn `isLowConfidence`, làm tăng thời gian review. Bài học rút ra: (1) giữ nguyên tắc Human-in-the-Loop; (2) siết prompt để bắt buộc gắn `isLowConfidence` khi nguồn mỏng/hình ảnh; (3) thêm bước pre-validation loại file trước khi sinh quiz; (4) đưa Golden Set vào sớm hơn trong pipeline để phát hiện lỗi sớm.



