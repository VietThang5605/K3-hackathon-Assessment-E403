const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk').Anthropic;
} catch (e) {
  // Anthropic SDK will be available after npm install
}

async function generateQuiz({ slideTitle, documentContent = '', chatlogContext = '', numQuestions = 5, provider = 'gemini' }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  // System Prompt for structured JSON Quiz output
  const systemPrompt = `Bạn là VLearn Assessment Agent chuyên nghiệp cho Giảng viên.
Nhiệm vụ: Dựa vào tiêu đề bài giảng "${slideTitle}", nội dung tài liệu trích xuất bên dưới, và dữ liệu thắc mắc học viên từ chatlog:
---
NỘI DUNG TÀI LIỆU/SLIDE:
${documentContent ? documentContent.substring(0, 2000) : '(Không có nội dung tài liệu — vui lòng upload slide trước.)'}

BỐI CẢNH CHATLOG HỌC VIÊN:
${chatlogContext ? chatlogContext.substring(0, 1000) : '(Không có chatlog context.)'}
---

Hãy sinh đúng ${numQuestions} câu hỏi trắc nghiệm kiểm tra kiến thức cho học viên.
LƯU Ý QUAN TRỌNG:
- Với câu hỏi có nội dung slide mỏng hoặc dễ bịa/không đủ căn cứ, hãy đặt "confidenceScore": 0.5 đến 0.7 và "isLowConfidence": true, kèm "warningNote": "⚠️ Cần kiểm tra kỹ: slide mỏng nội dung".
- Với câu hỏi rõ ràng, đặt "confidenceScore": 0.95 và "isLowConfidence": false.

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

  const errors = [];

  // 1. Try the requested provider first
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
      errors.push(`Gemini: ${err.message}`);
      console.warn('Gemini API call failed:', err.message);
    }
  }

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
      errors.push(`OpenAI: ${err.message}`);
      console.warn('OpenAI API call failed:', err.message);
    }
  }

  if (provider === 'anthropic' && anthropicKey) {
    try {
      if (!Anthropic) Anthropic = require('@anthropic-ai/sdk').Anthropic;
      if (Anthropic) {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const message = await anthropic.messages.create({
          model: anthropicModel,
          max_tokens: 2048,
          messages: [{ role: 'user', content: systemPrompt }]
        });
        const rawText = message.content[0]?.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const quizArray = Array.isArray(parsed) ? parsed : (parsed.quizList || parsed.questions || null);
        if (Array.isArray(quizArray) && quizArray.length > 0) {
          return quizArray;
        }
      }
    } catch (err) {
      errors.push(`Anthropic: ${err.message}`);
      console.warn('Anthropic API call failed:', err.message);
    }
  }

  // 2. Auto-fallback: try OTHER available providers if the requested one failed
  const fallbackProviders = [
    { name: 'gemini', key: geminiKey },
    { name: 'openai', key: openaiKey },
    { name: 'anthropic', key: anthropicKey }
  ].filter(p => p.name !== provider && p.key);

  for (const fb of fallbackProviders) {
    console.log(`⚡ Auto-fallback: trying ${fb.name}...`);
    try {
      if (fb.name === 'gemini') {
        const genAI = new GoogleGenerativeAI(fb.key);
        const model = genAI.getGenerativeModel({ model: geminiModel });
        const response = await model.generateContent(systemPrompt);
        const rawText = response.response.text() || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      if (fb.name === 'openai') {
        const openai = new OpenAI({ apiKey: fb.key });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }],
          response_format: { type: 'json_object' }
        });
        const raw = completion.choices[0]?.message?.content || '';
        const parsed = JSON.parse(raw);
        const quizArray = parsed.quizList || parsed.questions || (Array.isArray(parsed) ? parsed : null);
        if (Array.isArray(quizArray) && quizArray.length > 0) return quizArray;
      }
      if (fb.name === 'anthropic') {
        if (!Anthropic) Anthropic = require('@anthropic-ai/sdk').Anthropic;
        if (Anthropic) {
          const anthropic = new Anthropic({ apiKey: fb.key });
          const message = await anthropic.messages.create({
            model: anthropicModel,
            max_tokens: 2048,
            messages: [{ role: 'user', content: systemPrompt }]
          });
          const rawText = message.content[0]?.text || '';
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          const quizArray = Array.isArray(parsed) ? parsed : (parsed.quizList || parsed.questions || null);
          if (Array.isArray(quizArray) && quizArray.length > 0) return quizArray;
        }
      }
    } catch (err) {
      errors.push(`${fb.name} (fallback): ${err.message}`);
      console.warn(`${fb.name} fallback also failed:`, err.message);
    }
  }

  // 3. NO mock fallback — throw error so the teacher knows to configure an API key
  throw new Error(
    `Không thể sinh Quiz: tất cả AI providers đều thất bại. ` +
    `Vui lòng kiểm tra API key trong file .env.\n` +
    `Chi tiết lỗi:\n${errors.map(e => `  - ${e}`).join('\n')}`
  );
}

async function generateRecapSuggestion({ quizTitle, redConcepts = [], yellowConcepts = [] }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  const prompt = `Bạn là VLearn Assessment Agent cố vấn cho Giảng viên.
Dựa vào báo cáo lỗ hổng kiến thức bài "${quizTitle}":
- Vùng đỏ (Lỗ hổng nặng): ${redConcepts.join(', ') || '(Chưa có dữ liệu)'}
- Vùng vàng (Cần củng cố): ${yellowConcepts.join(', ') || '(Chưa có dữ liệu)'}

Hãy tạo 1 đề xuất 3 phút giảng lại ngắn gọn, đắt giá, hướng dẫn Giảng viên mở đầu 3 phút buổi sau tập trung đúng điểm học viên nghẽn nhất. Trả về text tiếng Việt thuần túy.`;

  // Try Anthropic
  if (anthropicKey) {
    try {
      if (!Anthropic) Anthropic = require('@anthropic-ai/sdk').Anthropic;
      if (Anthropic) {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const message = await anthropic.messages.create({
          model: anthropicModel,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        });
        const text = message.content[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Anthropic recap failed:', err.message);
    }
  }

  // Try Gemini
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: geminiModel });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text) return text;
    } catch (err) {
      console.warn('Gemini recap failed:', err.message);
    }
  }

  // Try OpenAI
  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      const text = completion.choices[0]?.message?.content;
      if (text) return text;
    } catch (err) {
      console.warn('OpenAI recap failed:', err.message);
    }
  }

  throw new Error(
    'Không thể tạo gợi ý giảng lại: tất cả AI providers đều thất bại. ' +
    'Vui lòng kiểm tra API key trong file .env.'
  );
}

module.exports = { generateQuiz, generateRecapSuggestion };
