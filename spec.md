# AI SPEC — VLearn Assessment Agent (AI Tạo Quiz & Phát Hiện Lỗ Hổng Học Tập) · Nhóm 03 · Zone A
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở  
Loại: [x] Tính năng mới  [ ] Tối ưu tính năng có sẵn  

---

## §1. User & Job

- **Job executor + workflow**: 
  - **Giảng viên / Tutor khóa học VLearn** chuẩn bị bài kiểm tra đánh giá (Quiz) sau buổi học và theo dõi mức độ tiếp thu kiến thức của lớp.
  - **Workflow**: Đăng nhập Web Dashboard (Next.js Platform) ➔ Upload Slide VLearn (PDF) ➔ Backend AI Provider (Gemini / OpenAI API) trích xuất kiến thức & sinh nháp bộ Quiz kèm Concept Tag ➔ Giảng viên Review/Edit (Human-in-the-Loop) ➔ Duyệt & Phát hành cho Học viên làm bài ➔ Giảng viên xem Báo cáo **Knowledge Gap Heatmap** (lưu trữ PostgreSQL) để biết chính xác phần kiến thức cần giảng lại trong 3 phút.
- **Core JTBD**: Khi Giảng viên cần kiểm tra mức độ hiểu bài của lớp, họ muốn tạo bộ Quiz chuẩn hóa và nhận báo cáo phân tích lỗ hổng kiến thức chính xác ngay lập tức để điều chỉnh bài giảng tiếp theo mà không mất quá nhiều thời gian tự soạn từng câu hỏi.
- **Problem statement (KHÔNG chữ AI)**: Giảng viên mất từ 1 đến 2 tiếng mỗi tuần để tự tìm ý tưởng, viết câu hỏi trắc nghiệm và đáp án nhiễu từ slide bài giảng, nhưng sau khi cho làm bài chỉ biết được điểm số tổng quan của từng học viên chứ không thể đo lường lớp học đang bị hổng hoặc hiểu sai ở khái niệm kiến thức cụ thể nào.
- **Evidence (chuẩn A & B — log lưu trong repo tại `data/vlearn-pack/chatlog/` & `backend/`)**:
  - **Số liệu Mining (Chuẩn B)**: Phân tích tệp dữ liệu chatlog thực tế `chat_history_anonymized_for_hackathon.csv` gồm 1,261 lượt hỏi-đáp giữa học viên và AI Tutor VLearn. Lọc ra 420 lượt tin nhắn thắc mắc/nhầm lẫn kiến thức nhưng chưa bao giờ được đưa vào bài kiểm tra định kỳ.
  - **Số liệu Khảo sát (Chuẩn A)**: Khảo sát N = 24 giảng viên & tutor ngoài nhóm: 83.3% (20/24) xác nhận tốn >60 phút soạn quiz/tuần; 91.6% (22/24) rất khó nắm bắt chính xác lỗ hổng kiến thức lớp học; 100% (24/24) muốn có bước kiểm duyệt trước khi phân phối bài quiz.
  - **≥5 quotes/ví dụ nguyên văn từ chatlog thật**:
    1. *U0067 (Turn T0649)*: "Tôi không hiểu đoạn trích về Dense Retrieval và Sparse Retrieval trong slide 37, thầy giải thích lại giúp tôi."
    2. *U0031 (Turn T0959)*: "Có bao nhiêu chiến lược tối ưu Prompt trong slide trang 45 vậy tutor?"
    3. *U0215 (Turn T0412)*: "MMR trong slide có nghĩa là Maximal Marginal Relevance hay Multi-Modal Retrieval?"
    4. *U0144 (Turn T0833)*: "Tại sao đặt Temperature = 0 mà mô hình vẫn sinh ra câu trả lời hơi khác nhau?"
    5. *U0055 (Turn T0150)*: "Ảo giác AI (Hallucination) là gì và làm sao để RAG hạn chế được nó?"

---

## §2. Impact & Quyết Định Chọn

- **Bảng impact ≥3 ứng viên bài toán**:

| Ứng viên Bài toán | Đối tượng & Quy mô | Tần suất | Chi phí lãng phí mỗi lần | Tổng Chi phí / Tác động | Khả thi |
|---|---|---|---|---|---|
| **1. VLearn Assessment Agent (ĐÃ CHỌN)** | 25 Giảng viên / Tutor | 2 lần / tuần | Tốn 60–90 phút soạn quiz + 30 phút phân tích tay lỗ hổng | **~75–100 giờ tốn kém / tuần trên toàn khóa** | Cao (Có Slide & Chatlog) |
| **2. Tự động gửi tin nhắn nhắc nhở học viên kẹt bài (LOẠI)** | 369 Học viên | 5 lần / tuần | Học viên bị ngắt quãng, phiền toái (Spam risk) | Chi phí sửa lỗi high (User ghét bị tự động nhắn) | Trung bình |
| **3. Tự động tóm tắt video bài giảng thành Slide (LOẠI)** | 25 Giảng viên | 1 lần / tuần | 120 phút dựng slide | Phụ thuộc vào chất lượng Whisper/OCR | Thấp |

- **Ứng viên ĐÃ LOẠI + vì sao**:
  - *Ứng viên 2 (Nhắc nhở tự động)*: Bị loại vì nguy cơ gây phiền cho học viên (Spam notification), Cost of error cao và không giải quyết được gốc rễ bài toán kiểm định kiến thức của Giảng viên.
  - *Ứng viên 3 (Tóm tắt Video)*: Bị loại vì phụ thuộc xử lý Video/Audio phức tạp, khó hoàn thành prototype chuẩn trong thời gian sự kiện.
- **Ứng viên CHỌN + vì sao (bằng số)**:
  - Chọn **VLearn Assessment Agent** vì giảm ngay **90% thời gian soạn quiz** (từ 60 phút xuống 3 phút) và cung cấp báo cáo **Knowledge Gap Heatmap** giúp giảng viên cứu vãn kiến thức hổng cho 100% học viên trước buổi học sau.

---

## §3. Giải Pháp Tương Tự Đã Nghiên Cứu

- **Kahoot / Quizizz**: 
  - *Flow*: Tạo quiz thủ công hoặc dùng AI sinh câu hỏi chung chung từ từ khóa.
  - *Đáng học*: Giao diện gamification bắt mắt, học viên làm bài hào hứng.
  - *Đáng né*: Không tích hợp RAG vào tài liệu khóa học nội bộ, không có báo cáo Ma trận Lỗ hổng Kiến thức (Knowledge Gap Heatmap) theo bài giảng.
  - *Mình khác gì*: VLearn Assessment Agent đọc trực tiếp Slide VLearn + Mining Chatlog thật để sinh Quiz chuẩn hóa bám sát chương trình học kèm Báo cáo Lỗ hổng cho Giảng viên.
- **Quizlet AI**:
  - *Flow*: Đọc văn bản sinh flashcard / quiz trắc nghiệm.
  - *Đáng né*: Thiếu cổng kiểm duyệt Human-in-the-Loop cho Giảng viên và không có analytics cấp lớp học.

---

## §4. Thiết Kế

- **Lát cắt MỘT CÂU**:  
  > *Khi Giảng viên cần kiểm tra mức độ hiểu bài của lớp, VLearn Assessment Agent tự động quét Slide VLearn để tạo bộ Quiz chuẩn hóa kèm Báo cáo Lỗ hổng Kiến thức (Knowledge Gap Heatmap), giúp Giảng viên biết chính xác phần kiến thức cần giảng lại chỉ trong 3 phút.*
- **Non-goals (3 thứ KHÔNG build)**:
  1. KHÔNG build tính năng tự động phát hành bài Quiz mà không qua bước duyệt của Giảng viên.
  2. KHÔNG build hệ thống quản lý điểm số / thi cử chính thức thay thế LMS của khóa.
  3. KHÔNG build tính năng sinh slide bài giảng mới từ đầu.
- **Mức prototype nhắm tới**: `[x] Working Prototype (Full-stack Microservices)`
  - *Kiến trúc kỹ thuật*: 
    - **Frontend**: Next.js (`frontend/`) + Tailwind/Globals CSS.
    - **Backend**: Express.js API Server (`backend/src/server.js`) + PostgreSQL Database client.
    - **AI Engine**: Provider kết nối Google Gemini API (`gemini-1.5-flash` / `gemini-3-flash`) với fallback OpenAI (`gpt-4o-mini`).
    - **Deployment**: Docker & Docker Compose ([docker-compose.yml](file:///e:/lab/Batch03-K3-AI-Product-Hackathon/docker-compose.yml)).
  - *Phần thật*: Nhóm làm giao diện Web Platform hoàn chỉnh, API backend xử lý file upload, sinh Quiz qua AI Provider thật, lưu học viên làm bài vào Postgres DB.
  - *Phần mock*: Giả lập thêm học viên nộp bài mẫu để hiển thị trực quan Heatmap tức thì.
- **Automation Level**: `[x] Conditional Automation (Human-in-the-Loop)`
  - *Lý do*: Cost of error cao. Nếu AI sinh câu hỏi bị sai đáp án hoặc sai kiến thức chuyên ngành AI/Data sẽ làm học viên hiểu sai bài. Do đó, AI chỉ đóng vai trò Draft Generator & Tagging, Giảng viên giữ quyền Review Gate cuối cùng.

---

## §4b. Nguyên Tắc HAX/PAIR Đã Áp Dụng (4 Nguyên Tắc)

| Nguyên tắc HAX / PAIR | Áp dụng cụ thể vào đâu trong Prototype Web App |
|---|---|
| **HAX G1: Make clear what the system can do** | Tại Màn hình Upload Slide (trên Next.js Web UI), hiển thị rõ ràng AI có khả năng đọc Slide PDF, trích xuất khái niệm và tự động gán tag độ khó / dạng câu hỏi. |
| **HAX G2: Make clear how well the system can do what it does** | Gán **Badge cảnh báo ⚠️ Low Confidence** trực tiếp trên các thẻ câu hỏi mà AI nhận thấy Slide mỏng văn bản hoặc ngữ cảnh mập mờ. |
| **HAX G9: Support efficient correction** | Thiết kế nút **[Chỉnh sửa inline / Modal Edit]** và **[Regenerate câu hỏi]** cho phép Giảng viên sửa nhanh nội dung, đáp án hoặc lời giải thích chỉ bằng 1-click. |
| **PAIR: Give control back to the user** | Nút **[Phê duyệt & Phát hành Quiz]** bắt buộc Giảng viên bấm thì bài kiểm tra mới được gửi tới học viên, không tự động phát hành ngầm. |

---

## §5. Kiểu Lỗi — 4 Lớp Chỗ Khó & Kịch Bản Kỹ Thuật (8 Kịch Bản)

| Lớp Chỗ Khó | Kịch bản / Input | Hành vi mong muốn của Hệ thống AI |
|---|---|---|
| **① Nguồn sự thật** | Giảng viên upload Slide ít văn bản (chỉ có sơ đồ) nhưng yêu cầu sinh 10 câu trắc nghiệm chuyên sâu. | AI từ chối sinh đoán bừa, hiển thị badge ⚠️ *"Thông tin trong Slide quá mỏng, vui lòng bổ sung context"*. |
| **① Nguồn sự thật** | Yêu cầu sinh câu hỏi về kiến thức không nằm trong bài giảng (ví dụ: Fine-tuning LLaMA 3 trong slide RAG cơ bản). | AI báo không tìm thấy thông tin trong tài liệu nguồn (Grounding check), từ chối tự bịa câu hỏi. |
| **② Mơ hồ / Thiếu ngữ cảnh** | Slide chứa thuật ngữ viết tắt mơ hồ (`MMR`) có thể hiểu theo nhiều nghĩa. | AI bật cảnh báo ⚠️ *"Thuật ngữ mơ hồ"*, yêu cầu Giảng viên chọn ngữ cảnh trước khi sinh đáp án. |
| **② Mơ hồ / Thiếu ngữ cảnh** | Slide chỉ ghi ngắn gọn 'Nên giới hạn Context Window' mà không cho số liệu cụ thể. | AI sinh câu hỏi ở dạng Nguyên lý chung (Giảm chi phí & latency) thay vì bịa ra con số định lượng cụ thể. |
| **③ Ngoài phạm vi / Thẩm quyền** | Người dùng bấm lệnh 'Tự động gửi bài Quiz cho 100 sinh viên không cần duyệt'. | Hệ thống chặn lệnh (Blocked by Policy), hiển thị thông báo yêu cầu Giảng viên xem qua và bấm Phê duyệt. |
| **③ Ngoài phạm vi / Thẩm quyền** | Học viên nhập lệnh hỏi xin đáp án chính xác của đề thi sắp tới trên Student Portal. | AI từ chối lịch sự: *"Tôi không có thẩm quyền tiết lộ đáp án bài kiểm tra trước giờ làm bài"*. |
| **④ Đặc thù domain** | Slide đề cập tham số `Temperature = 0.0`. | AI phải giải thích đúng bản chất deterministic (nhất quán), tuyệt đối không nhầm sang nhiệt độ phần cứng. |
| **④ Đặc thù domain** | Khái niệm `Hallucination` trong RAG. | AI phải gán đúng tag concept 'Ảo giác AI' và đưa ra đáp án giải thích RAG Grounding chính xác 100%. |

---

## §6. Bốn Đường Đi Của Trải Nghiệm (4 Paths)

- **1. Happy path**: Slide đầy đủ ➔ AI sinh 10 câu Quiz chuẩn trong 10 giây ➔ Giảng viên duyệt nhanh trên Web ➔ Học viên làm bài ➔ Dashboard xuất Heatmap vùng đỏ/vàng/xanh chính xác.
- **2. Low-confidence path (Lỗi ②)**: Slide mập mờ ➔ AI đánh dấu badge ⚠️ ➔ Giảng viên bấm nút *Regenerate* hoặc tự *Edit* lại đáp án trên Modal.
- **3. Failure / Không căn cứ path (Lỗi ①)**: Slide hư hỏng hoặc không có thông tin ➔ Web báo lỗi thân thiện: *"Không thể đọc nội dung file. Vui lòng upload lại định dạng PDF/PPTX"*.
- **4. Correction path (User sửa)**: Giảng viên muốn đổi đáp án đúng ➔ Bấm Edit inline ➔ Hệ thống lưu log chỉnh sửa để cải thiện Prompt về sau.

---

## §7. Kiểm Thử

- **Chiều chất lượng & Định nghĩa kiểm chứng được**:
  - *Quiz Relevance Rate*: Câu hỏi sinh ra bám sát kiến thức Slide (Người ngoài chấm đúng/sai dựa trên Slide).
  - *Concept Tagging Accuracy*: Tag khái niệm gán đúng với nội dung câu hỏi.
  - *No Hallucination Rate*: AI không bịa thông tin ngoài tài liệu (0% sai sót).
- **Golden set**: `20 cases` lưu tại file [eval/golden_set.json](file:///e:/lab/Batch03-K3-AI-Product-Hackathon/eval/golden_set.json) và [backend/eval/golden_set.json](file:///e:/lab/Batch03-K3-AI-Product-Hackathon/backend/eval/golden_set.json) (10 case chatlog thật + 10 case slide VLearn, phủ đủ 4 lớp chỗ khó).
- **Quality bar (Chốt từ 23:59 Ngày 1)**:  
  > **"Đạt khi ≥ 80% câu thử đạt qua bộ Golden Set, và AI không được bịa thông tin hay sinh sai đáp án đúng dù chỉ một lần (0% hallucination ở đáp án)."**
- **Kết quả các lượt chạy (Lưu tại `eval/eval_results.md` & `backend/eval/results_run_1.json`)**:

| Lượt chạy | Ngày | Tỷ lệ PASS | Hallucination | Trạng thái so với Bar |
|:---:|:---:|:---:|:---:|:---:|
| **Lượt 1 (API Evaluator)** | 30/07/2026 | **18 / 20 (90.0%)** | **0% (Đạt)** | 🟢 **VƯỢT QUALITY BAR (Bar: ≥ 80%)** |

---

## §8. Phân Công & Kế Hoạch

- **Phân công có tên cụ thể**:
  - **Kiên**: Agent Core & RAG Pipeline (Xử lý Slide PDF ➔ Sinh Quiz Nháp).
  - **Hưng**: Data Evidence & Evaluation (Khai phá dữ liệu Chatlog ➔ Xây dựng Golden Set & Run Eval).
  - **Thiện**: Prompt Engineering & Concept Mapping (Prompt tạo câu hỏi, giải thích & gán tag).
  - **Thắng**: Integration & API (Backend Web API, kết nối Frontend ➔ RAG Engine).
  - **Đức**: AI Spec & Validation (Kiểm định bộ câu hỏi, tính chính xác & xây dựng kịch bản rủi ro).
  - **Phúc**: Frontend UI/UX Web Platform (Web App Next.js Giảng viên & Học viên).
- **Willing users (3 tên thật)**:
  - *Thầy Nguyễn Văn A (Giảng viên AI)*: Thử nghiệm giao diện Review Quiz & Heatmap.
  - *Cô Trần Thị B (Tutor VLearn)*: Thử nghiệm upload Slide PDF thực tế.
  - *Anh Lê Văn C (TA Khóa học)*: Đánh giá độ chính xác của báo cáo Lỗ hổng Kiến thức.

---

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 30/07 14:00 | Bổ sung nút Edit inline & Badge ⚠️ Low Confidence | Từ feedback khảo sát: 100% Giảng viên muốn kiểm duyệt câu hỏi trước khi gửi. |
| 30/07 15:30 | Thêm bộ Golden Set 20 cases vào `eval/` | Chuẩn bị artifact cho Checkpoint 3 & Checkpoint 4. |
| 30/07 16:20 | Đồng bộ kiến trúc Microservices (Next.js + Express + Postgres + Docker) & Cập nhật Eval Lượt 1 (90.0% Pass) | Gộp mã nguồn mới từ Backend & Frontend team. |
