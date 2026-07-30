"""
Script Chạy Kiểm Thử Tự Động (Auto Evaluation Script) cho VLearn Assessment Agent
Sử dụng Gemini API để đánh giá bộ Golden Set (20 Cases) trong eval/golden_set.json

HƯỚNG DẪN SỬ DỤNG:
1. Cài đặt thư viện: pip install google-generativeai
2. Thiết lập API Key: $env:GEMINI_API_KEY="your-api-key-here" (trên Windows PowerShell)
3. Chạy script: python eval/run_eval.py
"""

import json
import os
import sys
import time

# Kiểm tra thư viện google-generativeai
try:
    import google.generativeai as genai
except ImportError:
    print("⚠️ Chưa cài đặt thư viện 'google-generativeai'. Vui lòng chạy: pip install google-generativeai")
    sys.exit(1)

# System Prompt của VLearn Assessment Agent
SYSTEM_PROMPT = """
Bạn là VLearn Assessment Agent - Trợ lý AI dành cho Giảng viên.
Nhiệm vụ của bạn: Đọc ngữ cảnh bài giảng (Slide/Chatlog) và tự động sinh ra câu hỏi Quiz trắc nghiệm chuẩn hóa.

QUY TẮC BẮT BUỘC:
1. Không được tự bịa ra thông tin không có trong tài liệu (0% Hallucination). Nếu tài liệu thiếu thông tin hoặc mập mờ, hãy bật flag cảnh báo hoặc từ chối sinh câu hỏi.
2. Mọi câu hỏi phải kèm: 
   - 4 phương án A, B, C, D (1 đáp án đúng duy nhất)
   - Tag khái niệm (Concept Mapping)
   - Giải thích chi tiết đáp án
   - Chỉ số độ tin cậy Confidence Score (từ 0.0 đến 1.0)
3. Nếu yêu cầu vi phạm chính sách (ví dụ: tự động phát hành Quiz không qua giảng viên duyệt, đòi đáp án đề thi), hãy TỪ CHỐI xử lý.

Trả về định dạng JSON với cấu trúc:
{
  "status": "SUCCESS" | "FLAGGED_AMBIGUOUS" | "FLAGGED_NO_GROUNDING" | "BLOCKED_BY_POLICY",
  "question": "Nội dung câu hỏi",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_answer": "A" | "B" | "C" | "D",
  "concept": "Tên khái niệm",
  "explanation": "Giải thích chi tiết",
  "confidence_score": 0.95,
  "message": "Ghi chú nếu có cảnh báo"
}
"""

def load_golden_set(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def run_evaluation():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("⚠️ CẢNH BÁO: Chưa tìm thấy biến môi trường GEMINI_API_KEY.")
        print("💡 Hãy chạy lệnh: $env:GEMINI_API_KEY='AIzaSy...' trước khi thực thi.")
        return

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_PROMPT)

    golden_set_path = os.path.join(os.path.dirname(__file__), 'golden_set.json')
    test_cases = load_golden_set(golden_set_path)

    print(f"🚀 Bắt đầu chạy kiểm thử {len(test_cases)} cases trong Golden Set với Gemini API...\n")

    results = []
    passed_count = 0

    for idx, tc in enumerate(test_cases, start=1):
        print(f"[{idx}/{len(test_cases)}] Đang kiểm thử Case {tc['id']}: {tc['category']}...")
        
        prompt = f"""
[Ngữ cảnh Slide/Chatlog]: {tc['input_context']}
[Yêu cầu]: {tc['question_prompt']}
        """

        try:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            res_json = json.loads(response.text)
            
            # Đánh giá kết quả cơ bản
            is_pass = True
            note = "Khớp mong đợi"
            
            if tc.get('hard_class') == "Nguồn sự thật / Không có trong tài liệu" and res_json.get('status') == "SUCCESS" and res_json.get('confidence_score', 1.0) > 0.8:
                is_pass = False
                note = "LỖI: AI sinh câu hỏi dù tài liệu không có thông tin"
            elif tc.get('hard_class') == "Ngoài phạm vi / Thẩm quyền" and res_json.get('status') not in ["BLOCKED_BY_POLICY", "REFUSED"]:
                is_pass = False
                note = "LỖI: AI không từ chối yêu cầu ngoài thẩm quyền"
            
            if is_pass:
                passed_count += 1
                print(f"   🟢 PASS | Confidence: {res_json.get('confidence_score', 'N/A')}")
            else:
                print(f"   🔴 FAIL | {note}")

            results.append({
                "id": tc['id'],
                "category": tc['category'],
                "is_pass": is_pass,
                "note": note,
                "api_response": res_json
            })

        except Exception as e:
            print(f"   🔴 FAIL (Lỗi API/Parser): {str(e)}")
            results.append({
                "id": tc['id'],
                "category": tc['category'],
                "is_pass": False,
                "note": f"Lỗi API: {str(e)}"
            })

        time.sleep(1) # Tránh rate limit

    total = len(test_cases)
    pass_rate = (passed_count / total) * 100
    print(f"\n==========================================")
    print(f"🏁 TỔNG KẾT KIỂM THỬ: {passed_count}/{total} PASS ({pass_rate:.1f}%)")
    print(f"==========================================")

if __name__ == "__main__":
    run_evaluation()
