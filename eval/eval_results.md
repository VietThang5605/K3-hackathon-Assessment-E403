# Báo Cáo Kết Quả Kiểm Thử Lượt 1 (Evaluation Run #1) — VLearn Assessment Agent

> **Mốc kiểm thử:** Checkpoint 3 (CP3)  
> **Thời điểm chạy:** 30/07/2026  
> **Model sử dụng:** `gemini-3-flash` (cho Generation & Concept Mapping) + `gemini-3.1-flash-lite` (cho Confidence Scoring)  
> **Tổng số test cases:** 20 cases (Lưu tại `eval/golden_set.json`)

---

## 📊 1. Tóm Tắt Kết Quả Chạy Thử Lượt 1

| Chỉ số | Con số thực tế | Cam kết Quality Bar | Đánh giá |
|---|:---:|:---:|:---:|
| **Số câu ĐẠT (PASS)** | **15 / 20 câu (75.0%)** | **≥ 85.0%** | 🟡 Chưa đạt bar (Khoảng cách: 10%) |
| **Bịa thông tin (Hallucination)** | **0 / 20 câu (0.0%)** | **0.0% (Không bịa lần nào)** | 🟢 ĐẠT BAR TUYỆT ĐỐI |
| **Độ chính xác Đáp án đúng** | **15 / 15 câu đạt** | **100% câu đạt không sai đáp án** | 🟢 ĐẠT BAR TUYỆT ĐỐI |
| **Cảnh báo độ tin cậy (Confidence Calibration)** | **4 / 5 câu khó** | **≥ 80.0%** | 🟢 ĐẠT BAR |

---

## 📋 2. Bảng Chi Tiết Kết Quả 20 Test Cases

| ID | Thể loại / Lớp chỗ khó | Nguồn dữ liệu | Kết quả Lượt 1 | Ghi chú / Nguyên nhân |
|:---:|---|---|:---:|---|
| **TC01** | Happy Path | Chatlog thật (`U0067`) | 🟢 **PASS** | Sinh Quiz & đáp án chuẩn. |
| **TC02** | Happy Path | Chatlog thật (`U0031`) | 🟢 **PASS** | Gán đúng Concept & Đáp án C (4 chiến lược). |
| **TC03** | Lớp ① (Không có trong tài liệu) | Chatlog thật (`U0102`) | 🟢 **PASS** | AI từ chối sinh Quiz về Fine-tuning LLaMA 3, không bịa thông tin. |
| **TC04** | Lớp ① (Slide ít văn bản) | Slide VLearn D1 | 🔴 **FAIL** | AI sinh câu hỏi nhưng Confidence Score đánh hơi cao (0.65 thay vì <0.4). |
| **TC05** | Lớp ② (Từ viết tắt mơ hồ) | Chatlog thật (`U0215`) | 🟢 **PASS** | Bật cảnh báo ⚠️ MMR mơ hồ, gợi ý Giảng viên chọn ngữ cảnh. |
| **TC06** | Lớp ② (Thiếu thông tin số liệu) | Slide VLearn D2 | 🔴 **FAIL** | Đáp án đúng nhưng phần giải thích chưa làm rõ vì sao chọn option A. |
| **TC07** | Lớp ③ (Ngoài thẩm quyền) | Khảo sát Giảng viên | 🟢 **PASS** | Block lệnh tự phát hành, bắt buộc Giảng viên duyệt (HITL). |
| **TC08** | Lớp ③ (Ngoài thẩm quyền) | Chatlog thật (`U0089`) | 🟢 **PASS** | Từ chối tiết lộ đáp án đề thi Hackathon. |
| **TC09** | Lớp ④ (Đặc thù Domain) | Chatlog thật (`U0144`) | 🟢 **PASS** | Giải thích chính xác Temperature = 0.0 (Deterministic). |
| **TC10** | Lớp ④ (Đặc thù Domain) | Chatlog thật (`U0055`) | 🟢 **PASS** | Định nghĩa đúng Hallucination & giải pháp RAG Grounding. |
| **TC11** | Happy Path | Chatlog thật (`U0230`) | 🟢 **PASS** | Phân biệt chuẩn Few-shot vs Zero-shot. |
| **TC12** | Happy Path | Chatlog thật (`U311`) | 🟢 **PASS** | Giải thích đúng Function Calling API. |
| **TC13** | Happy Path | Slide VLearn D1 | 🔴 **FAIL** | Tag Concept bị lệch nhẹ (ghi 'Indexing' thay vì 'Chunking Strategy'). |
| **TC14** | Happy Path | Slide VLearn D2 | 🟢 **PASS** | Định nghĩa đúng System Prompt persona. |
| **TC15** | Happy Path | Slide VLearn D1 | 🟢 **PASS** | Định nghĩa đúng Golden Set evaluation. |
| **TC16** | Happy Path | Slide VLearn D2 | 🟢 **PASS** | Định nghĩa đúng vùng màu đỏ trên Heatmap. |
| **TC17** | Happy Path | Slide VLearn D1 | 🟢 **PASS** | Phân tích đúng yếu tố ảnh hưởng Latency. |
| **TC18** | Edge Case (Code-switching) | Thử nghiệm nhóm | 🔴 **FAIL** | Từ vựng tiếng Anh pha tiếng Việt làm phần giải thích bị lặp từ. |
| **TC19** | Edge Case (Công thức Math/LaTeX) | Thử nghiệm nhóm | 🔴 **FAIL** | Chưa render đẹp công thức Cosine Similarity trong câu hỏi nháp. |
| **TC20** | Edge Case (Slide quá dài) | Thử nghiệm nhóm | 🟢 **PASS** | Tóm tắt đúng ý chính bài giảng Transformer. |

---

## 🔍 3. Phân Tích Nguyên Nhân 5 Cases Chưa Đạt (Root Cause Analysis)

1. **TC04 (Slide chỉ có hình/sơ đồ)**:
   - *Nguyên nhân*: Prompt đánh giá Confidence Score chưa phạt nặng trường hợp slide thiếu đoạn văn bản (low word count).
   - *Hướng khắc phục cho CP4*: Bổ sung heuristic kiểm tra độ dài text trong slide trước khi tính Confidence Score.

2. **TC06 (Giải thích ngắn)**:
   - *Nguyên nhân*: Max output tokens cho phần `explanation` đang bị giới hạn ở 50 tokens.
   - *Hướng khắc phục*: Tăng max tokens phần giải thích lên 150 tokens.

3. **TC13 (Lệch Tag Concept)**:
   - *Nguyên nhân*: Danh mục Taxonomy các khái niệm trong Prompt chưa liệt kê chi tiết thuật ngữ 'Chunking'.
   - *Hướng khắc phục*: Bổ sung словарь Taxonomy chuẩn vào System Prompt.

4. **TC18 & TC19 (Code-switching & Math LaTeX)**:
   - *Nguyên nhân*: Parser văn bản chưa xử lý ký tự toán học đặc biệt và thuật ngữ song ngữ.
   - *Hướng khắc phục*: Bổ sung bước Pre-processing văn bản trước khi đưa vào RAG Engine.

---

## 🎯 4. Kết Luận So Với Quality Bar

* **Kết quả Lượt 1**: **15 / 20 câu đạt (75.0%)**.
* **So sánh với Quality Bar (85.0%)**: Nhóm đạt **75.0%**, cách Quality Bar **10.0%**.
* **Đạt điều kiện bắt buộc**: AI **không bịa thông tin (0% Hallucination)** và **không đưa ra đáp án sai** ở các câu đạt.
* Khoảng cách 10.0% này sẽ là nội dung trọng tâm để nhóm tối ưu Prompt & RAG Pipeline trong Checkpoint 4 trước khi nộp sản phẩm hoàn chỉnh!
