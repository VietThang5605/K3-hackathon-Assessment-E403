# Reflection cá nhân - Nguyễn Đức Thiện-2A202601415

## 1. Vai trò của tôi trong nhóm

Trong hackathon này, tôi phụ trách chính phần **Prompt Engineering & Concept Mapping** cho VLearn Assessment Agent. Vai trò của tôi là thiết kế cách AI đọc nội dung slide, sinh câu hỏi quiz, tạo đáp án đúng/sai, viết giải thích ngắn cho từng câu và gán concept tag để sau này hệ thống có thể tổng hợp thành Knowledge Gap Heatmap cho giảng viên.

Tôi cũng phối hợp với phần Evaluation để đọc lại các case fail trong golden set, đặc biệt là các lỗi liên quan đến hallucination, low confidence và nhầm lẫn domain. Mục tiêu của tôi không chỉ là làm AI sinh ra câu hỏi nghe có vẻ hợp lý, mà phải kiểm soát được câu hỏi đó có bám sát slide hay không và khi nào AI cần báo không chắc chắn.

## 2. Phần tôi đã làm

Các phần tôi trực tiếp tham gia gồm:

- Viết prompt sinh quiz từ nội dung slide theo format có cấu trúc: câu hỏi, 4 lựa chọn, đáp án đúng, giải thích, concept tag, độ khó và confidence score.
- Thiết kế rule cho AI không được bịa thêm kiến thức ngoài slide. Nếu slide quá mỏng, thiếu chữ hoặc chủ yếu là hình ảnh, AI phải gắn `isLowConfidence: true` thay vì cố sinh câu hỏi như bình thường.
- Xây dựng danh sách concept tag cho các chủ đề hay gặp trong dữ liệu VLearn như RAG, Embedding, Vector Search, Prompt Engineering, Context Window, Hallucination và Evaluation Metrics.
- Cùng nhóm kiểm tra kết quả golden set, phân tích các case fail như `CASE-12`, `CASE-14`, `CASE-16`, `CASE-17`, `CASE-18` để đề xuất chỉnh prompt và thêm bước kiểm tra đầu vào.
- Viết lại một số mô tả lỗi theo hướng dễ hiểu cho giảng viên, ví dụ khi AI không đủ căn cứ thì thông báo phải nói rõ cần upload lại slide hoặc bổ sung ngữ cảnh, không chỉ báo lỗi chung chung.

Kết quả ban đầu của nhóm đạt khoảng **15/20 case pass trong một lượt eval**, trong đó happy path hoạt động khá tốt nhưng các case low-confidence và out-of-scope còn yếu. Phần này giúp tôi nhìn rõ hơn giới hạn của prompt: prompt tốt có thể giảm lỗi, nhưng không thể thay thế hoàn toàn validation ở tầng backend.

## 3. AI đã hỗ trợ tôi như thế nào

Tôi dùng AI như một công cụ hỗ trợ suy nghĩ và tăng tốc, không dùng để thay thế việc hiểu bài toán. Cụ thể:

- Nhờ AI gợi ý nhiều phiên bản prompt khác nhau cho cùng một yêu cầu sinh quiz, sau đó tôi chọn và chỉnh lại theo rubric của nhóm.
- Dùng AI để rà soát xem output JSON của quiz có thiếu field nào không, ví dụ `conceptTag`, `confidenceScore`, `explanation` hoặc `isLowConfidence`.
- Dùng AI để giả lập một số input khó như slide quá ít chữ, thuật ngữ mơ hồ hoặc nội dung ngoài phạm vi bài học.
- Nhờ AI gợi ý cách diễn đạt feedback lỗi thân thiện hơn cho giảng viên.

Tuy vậy, tôi nhận ra AI thường có xu hướng làm cho câu trả lời "đẹp" hơn là trung thực hơn. Vì vậy khi làm prompt, tôi phải thêm rule rất rõ: nếu thiếu căn cứ thì phải báo không chắc chắn hoặc từ chối sinh câu hỏi, thay vì cố hoàn thành nhiệm vụ bằng suy đoán.

## 4. Bài học từ case fail của nhóm

Case fail tôi nhớ nhất là `CASE-14`: slide chỉ có nội dung rất mỏng, gần như chỉ ghi "BM25 + Hybrid", nhưng AI vẫn sinh câu hỏi khá dài dựa trên kiến thức nền về retrieval. Về mặt đọc qua thì câu hỏi không sai hoàn toàn, nhưng nó **không còn bám sát nguồn slide**, nên không đạt mục tiêu của sản phẩm.

Bài học của tôi là với sản phẩm AI cho giáo dục, câu trả lời "nghe đúng" chưa đủ. Điều quan trọng hơn là hệ thống phải biết **đâu là giới hạn bằng chứng của nó**. Nếu AI tự suy diễn quá rộng, giảng viên có thể vô tình phát hành quiz không phản ánh đúng nội dung buổi học, làm học viên bị kiểm tra những kiến thức chưa được dạy.

Sau case đó, tôi đề xuất siết prompt theo hướng:

- Nếu nội dung slide dưới một ngưỡng ký tự nhất định thì tự động bật low confidence.
- Nếu câu hỏi cần kiến thức ngoài slide để trả lời thì không sinh câu hỏi đó.
- Mỗi câu hỏi nên có dấu vết concept/source rõ hơn để giảng viên dễ kiểm tra.

Qua hackathon, tôi học được rằng làm sản phẩm AI không chỉ là gọi model và lấy output. Phần khó hơn là thiết kế ranh giới: khi nào AI được tự động, khi nào cần con người duyệt, khi nào phải nói "tôi không đủ thông tin". Đây là bài học quan trọng nhất tôi rút ra từ phần việc của mình.
