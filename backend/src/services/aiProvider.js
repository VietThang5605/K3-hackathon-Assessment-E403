const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { INITIAL_QUIZ, ALTERNATIVE_QUESTIONS_POOL } = require('../data/mockData');

async function generateQuiz({ slideTitle, numQuestions = 5, provider = 'gemini' }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // System Prompt for structured JSON Quiz output
  const systemPrompt = `Bạn là VLearn Assessment Agent chuyên nghiệp.
Nhiệm vụ: Dựa vào slide bài giảng "${slideTitle}", sinh chính xác ${numQuestions} câu hỏi trắc nghiệm kiểm tra kiến thức cho học viên.
Yêu cầu bắt buộc trả về định dạng JSON thuần hợp lệ (không chứa markdown code block) là một mảng object gồm đúng ${numQuestions} phần tử có cấu trúc:
[
  {
    "id": "q1",
    "question": "Nội dung câu hỏi...",
    "options": [
      { "id": "A", "text": "Phương án A" },
      { "id": "B", "text": "Phương án B" },
      { "id": "C", "text": "Phương án C" },
      { "id": "D", "text": "Phương án D" }
    ],
    "correctAnswer": "A",
    "explanation": "Giải thích chi tiết ngắn gọn...",
    "concept": "Tên khái niệm (ví dụ: RAG Architecture & Chunking)",
    "confidenceScore": 0.95,
    "isLowConfidence": false,
    "warningNote": ""
  }
]`;

  // 1. Try Gemini API if requested & key available
  if (provider === 'gemini' && geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: geminiModel });
      const response = await model.generateContent(systemPrompt);
      
      const rawText = response.response.text() || '';
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err.message);
    }
  }

  // 2. Try OpenAI API if requested & key available
  if (provider === 'openai' && openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        response_format: { type: 'json_object' }
      });

      const raw = completion.choices[0]?.message?.content || '';
      const parsed = JSON.parse(raw);
      const quizArray = parsed.quizList || parsed.questions || (Array.isArray(parsed) ? parsed : null);
      if (Array.isArray(quizArray) && quizArray.length > 0) {
        return quizArray;
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back:', err.message);
    }
  }

  // 3. Fallback Mock Quiz Data generator
  let result = [...INITIAL_QUIZ];
  if (numQuestions < result.length) {
    result = result.slice(0, numQuestions);
  } else if (numQuestions > result.length) {
    const extraNeeded = numQuestions - result.length;
    for (let i = 0; i < extraNeeded; i++) {
      const alt = ALTERNATIVE_QUESTIONS_POOL[i % ALTERNATIVE_QUESTIONS_POOL.length];
      result.push({ ...alt, id: `q-extra-${i+1}` });
    }
  }

  return result;
}

module.exports = { generateQuiz };
