const INITIAL_QUIZ = [
  {
    id: "q1",
    question: "Kỹ thuật Chunking Overlap trong RAG Pipeline có mục đích chính là gì?",
    options: [
      { id: "A", text: "Tăng tốc độ truy vấn trong Vector Database" },
      { id: "B", text: "Duy trì ngữ cảnh liền mạch giữa các đoạn văn bản khi cắt nhỏ" },
      { id: "C", text: "Giảm kích thước file Embedding lưu trên RAM" },
      { id: "D", text: "Tự động phát hiện và loại bỏ các từ vô nghĩa (Stop words)" }
    ],
    correctAnswer: "B",
    explanation: "Chunking Overlap giữ lại một phần ký tự/token của đoạn trước trong đoạn sau để tránh việc ngữ cảnh bị ngắt đứt ở ranh giới đoạn cắt.",
    concept: "RAG Architecture & Chunking",
    confidenceScore: 0.94,
    isLowConfidence: false,
    conceptCode: "C1"
  },
  {
    id: "q2",
    question: "Khi nào nên ưu tiên dùng Hybrid Search (BM25 + Dense Retrieval) thay vì chỉ dùng Vector Search truyền thống?",
    options: [
      { id: "A", text: "Khi tài liệu chỉ chứa toàn bộ là tệp hình ảnh không có văn bản" },
      { id: "B", text: "Khi truy vấn chứa các từ khóa chính xác như mã SKU, tên riêng, thuật ngữ kỹ thuật viết tắt" },
      { id: "C", text: "Khi muốn giảm chi phí API gọi LLM xuống mức tối đa" },
      { id: "D", text: "Khi số lượng document trong kho nhỏ hơn 100 trang" }
    ],
    correctAnswer: "B",
    explanation: "Dense Retrieval (Vector) giỏi hiểu ngữ cảnh nghĩa rộng nhưng kém khi tìm chính xác từ khóa đặc thù (mã hàng, mã lỗi). Hybrid Search kết hợp BM25 giúp cân bằng cả hai.",
    concept: "RAG Architecture & Chunking",
    confidenceScore: 0.72,
    isLowConfidence: true,
    warningNote: "⚠️ AI Confidence 72%: Khái niệm BM25 chỉ được đề cập ngắn trong Slide 14. Giảng viên nên duyệt kỹ.",
    conceptCode: "C1"
  },
  {
    id: "q3",
    question: "Chỉ số Cosine Similarity trong Vector Database đo lường yếu tố nào giữa hai vector embedding?",
    options: [
      { id: "A", text: "Khoảng cách Euclide tuyệt đối giữa 2 điểm" },
      { id: "B", text: "Góc giữa hai vector, phản ánh độ tương đồng về mặt ý nghĩa ngữ nghĩa" },
      { id: "C", text: "Độ dài của chuỗi văn bản đầu vào" },
      { id: "D", text: "Thời gian phản hồi khi thực hiện phép truy vấn nearest neighbor" }
    ],
    correctAnswer: "B",
    explanation: "Cosine Similarity đo góc hướng giữa 2 vector trong không gian nhiều chiều. Góc càng nhỏ (Cosine tiệm cận 1) thì 2 văn bản càng tương đồng ý nghĩa.",
    concept: "Embedding & Vector Database",
    confidenceScore: 0.98,
    isLowConfidence: false,
    conceptCode: "C2"
  },
  {
    id: "q4",
    question: "Hiện tượng Hallucination (Ảo giác) trong LLM xảy ra do nguyên nhân cốt lõi nào?",
    options: [
      { id: "A", text: "LLM hoạt động dựa trên cơ chế dự đoán token tiếp theo theo xác suất chứ không thực sự 'hiểu' tri thức" },
      { id: "B", text: "Máy tính bị quá nhiệt trong quá trình Inference" },
      { id: "C", text: "Người dùng không truyền API Key hợp lệ" },
      { id: "D", text: "File PDF truyền vào bị lỗi font chữ tiếng Việt" }
    ],
    correctAnswer: "A",
    explanation: "LLM bản chất là mô hình xác suất từ vựng (Probabilistic Token Generator), nên nếu thiếu thông tin căn cứ (Grounding), nó sẽ bịa ra các từ nghe có vẻ hợp lý.",
    concept: "Prompt Engineering & Hallucination",
    confidenceScore: 0.96,
    isLowConfidence: false,
    conceptCode: "C3"
  },
  {
    id: "q5",
    question: "Phương pháp Few-Shot Prompting khác gì so với Zero-Shot Prompting?",
    options: [
      { id: "A", text: "Few-shot đưa trực tiếp vài ví dụ minh họa mẫu đầu vào/đầu ra trước khi yêu cầu LLM thực hiện" },
      { id: "B", text: "Few-shot chỉ chạy được trên các mô hình AI mã nguồn mở" },
      { id: "C", text: "Zero-shot bắt buộc phải gọi Fine-tuning mô hình trước" },
      { id: "D", text: "Few-shot là kỹ thuật tăng tốc độ phản hồi của AI gấp 5 lần" }
    ],
    correctAnswer: "A",
    explanation: "Few-shot Prompting định hình định dạng và tư duy cho AI bằng cách cho trước 1-3 cặp ví dụ (Input -> Output) cụ thể trong câu prompt.",
    concept: "Prompt Engineering & Hallucination",
    confidenceScore: 0.91,
    isLowConfidence: false,
    conceptCode: "C3"
  }
];

const ALTERNATIVE_QUESTIONS_POOL = [
  {
    id: "alt-1",
    question: "Kích thước Chunk (Chunk Size) quá lớn trong RAG sẽ dẫn đến hậu quả gì trực tiếp nhất?",
    options: [
      { id: "A", text: "LLM bị nhiễu do thông tin không liên quan (Noise) làm giảm độ chính xác câu trả lời" },
      { id: "B", text: "Vector Database tự động xóa dữ liệu cũ" },
      { id: "C", text: "API gọi Embedding trả về lỗi HTTP 500" },
      { id: "D", text: "Tài liệu bị mất hoàn toàn định dạng bảng biểu" }
    ],
    correctAnswer: "A",
    explanation: "Chunk quá lớn nạp nhiều câu không liên quan vào Prompt Context, khiến LLM bị xao nhãng hoặc bỏ qua thông tin quan trọng.",
    concept: "RAG Architecture & Chunking",
    confidenceScore: 0.95,
    isLowConfidence: false,
    conceptCode: "C1"
  },
  {
    id: "alt-2",
    question: "Mục đích chính của việc sử dụng Reranker (như Cohere Rerank) sau bước Vector Retrieval là gì?",
    options: [
      { id: "A", text: "Sắp xếp lại Top-K đoạn văn bản theo độ liên quan chính xác hơn trước khi đưa vào LLM" },
      { id: "B", text: "Nén dung lượng file PDF xuống 50%" },
      { id: "C", text: "Dịch tự động câu hỏi sang tiếng Anh" },
      { id: "D", text: "Tạo tài khoản học viên tự động trên VLearn" }
    ],
    correctAnswer: "A",
    explanation: "Vector search tìm nhanh candidates, sau đó Reranker dùng mô hình Cross-Encoder để chấm điểm độ tương quan sâu giữa Query và từng Chunk.",
    concept: "Embedding & Vector Database",
    confidenceScore: 0.89,
    isLowConfidence: false,
    conceptCode: "C2"
  }
];

module.exports = { INITIAL_QUIZ, ALTERNATIVE_QUESTIONS_POOL };
