let Pool;
try {
  Pool = require('pg').Pool;
} catch (e) {
  // pg module not installed yet locally
}

let pool = null;
let isPgConnected = false;

// Fallback in-memory DB tables
const memoryDb = {
  courses: [
    { id: 1, code: 'B03-K3', name: 'AI Product Architecture — Batch 03' }
  ],
  documents: [
    {
      id: 'doc-rag-01',
      title: 'Bài 4: RAG Architecture',
      course_name: 'K3-AI Product Architecture',
      author: 'Giảng viên',
      file_size: '2.4 MB',
      page_count: 28,
      content_text: 'Nội dung slide về RAG Architecture, Vector DB, Chunking Strategy, Hybrid Search, Sparse & Dense Retrieval.',
      metadata: { source: 'VLearn Slide' },
      created_at: new Date().toISOString()
    }
  ],
  chat_logs: [],
  quizzes: [],
  quiz_questions: [],
  quiz_submissions: [],
  heatmaps: []
};

function getPool() {
  if (!pool && process.env.POSTGRES_HOST) {
    try {
      pool = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'vlearn_db',
        user: process.env.POSTGRES_USER || 'vlearn_user',
        password: process.env.POSTGRES_PASSWORD || 'vlearn_password',
        connectionTimeoutMillis: 3000
      });

      pool.on('error', (err) => {
        console.warn('⚠️ PostgreSQL Pool Error:', err.message);
        isPgConnected = false;
      });
    } catch (err) {
      console.warn('⚠️ Could not initialize PostgreSQL pool:', err.message);
    }
  }
  return pool;
}

async function query(text, params = []) {
  const p = getPool();
  if (p) {
    try {
      const client = await p.connect();
      try {
        const res = await client.query(text, params);
        isPgConnected = true;
        return res;
      } finally {
        client.release();
      }
    } catch (err) {
      isPgConnected = false;
      // Failover to memory DB silently for resilience
    }
  }
  return null;
}

// Higher-level CRUD operations (PG + Memory DB Fallback)

async function insertDocument(doc) {
  const sql = `
    INSERT INTO documents (id, title, course_name, author, file_size, page_count, content_text, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    doc.id,
    doc.title,
    doc.course_name || 'K3-AI Product Architecture',
    doc.author || 'Giảng viên',
    doc.file_size || '1.0 MB',
    doc.page_count || 1,
    doc.content_text || '',
    JSON.stringify(doc.metadata || {})
  ];

  const pgRes = await query(sql, values);
  if (pgRes && pgRes.rows.length > 0) {
    return pgRes.rows[0];
  }

  // Fallback memory insert
  const memoryDoc = {
    ...doc,
    created_at: new Date().toISOString()
  };
  const existingIdx = memoryDb.documents.findIndex(d => d.id === doc.id);
  if (existingIdx >= 0) {
    memoryDb.documents[existingIdx] = memoryDoc;
  } else {
    memoryDb.documents.unshift(memoryDoc);
  }
  return memoryDoc;
}

async function getAllDocuments() {
  const sql = `SELECT * FROM documents ORDER BY created_at DESC;`;
  const pgRes = await query(sql);
  if (pgRes && pgRes.rows) {
    return pgRes.rows;
  }
  return memoryDb.documents;
}

async function getDocumentById(id) {
  const sql = `SELECT * FROM documents WHERE id = $1;`;
  const pgRes = await query(sql, [id]);
  if (pgRes && pgRes.rows && pgRes.rows.length > 0) {
    return pgRes.rows[0];
  }
  return memoryDb.documents.find(d => d.id === id) || null;
}

async function saveQuiz({ id, document_id, title, slide_title, question_count, is_published, questions }) {
  const sqlQuiz = `
    INSERT INTO quizzes (id, document_id, title, slide_title, question_count, is_published)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, is_published = EXCLUDED.is_published, question_count = EXCLUDED.question_count
    RETURNING *;
  `;
  await query(sqlQuiz, [id, document_id, title, slide_title, question_count, is_published]);

  // Insert questions with unique IDs per quiz
  if (Array.isArray(questions)) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qUniqueId = (q.id && q.id.includes(id)) ? q.id : `${id}-${q.id || (i + 1)}`;
      const sqlQ = `
        INSERT INTO quiz_questions (id, quiz_id, question, options_json, correct_answer, explanation, concept, confidence_score, is_low_confidence, warning_note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET quiz_id = EXCLUDED.quiz_id, question = EXCLUDED.question, options_json = EXCLUDED.options_json, correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation, concept = EXCLUDED.concept;
      `;
      await query(sqlQ, [
        qUniqueId,
        id,
        q.question,
        JSON.stringify(q.options),
        q.correctAnswer,
        q.explanation || '',
        q.concept || 'Kiến thức chung',
        q.confidenceScore || 0.95,
        q.isLowConfidence || false,
        q.warningNote || ''
      ]);
    }
  }

  const quizObj = { id, document_id, title, slide_title, question_count, is_published, questions, created_at: new Date().toISOString() };
  const idx = memoryDb.quizzes.findIndex(q => q.id === id);
  if (idx >= 0) memoryDb.quizzes[idx] = quizObj;
  else memoryDb.quizzes.unshift(quizObj);
  return quizObj;
}

async function getQuizById(id) {
  const sqlQuiz = `SELECT * FROM quizzes WHERE id = $1;`;
  const pgRes = await query(sqlQuiz, [id]);
  if (pgRes && pgRes.rows && pgRes.rows.length > 0) {
    const quiz = pgRes.rows[0];
    const sqlQuestions = `SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY id ASC;`;
    const qRes = await query(sqlQuestions, [id]);
    quiz.questions = (qRes && qRes.rows) ? qRes.rows.map(q => ({
      ...q,
      options: typeof q.options_json === 'string' ? JSON.parse(q.options_json) : q.options_json,
      correctAnswer: q.correct_answer,
      confidenceScore: q.confidence_score,
      isLowConfidence: q.is_low_confidence,
      warningNote: q.warning_note
    })) : [];

    // Fallback: If DB questions is empty, check memoryDb fallback
    if (quiz.questions.length === 0) {
      const memQuiz = memoryDb.quizzes.find(q => q.id === id);
      if (memQuiz && memQuiz.questions && memQuiz.questions.length > 0) {
        quiz.questions = memQuiz.questions;
      }
    }
    return quiz;
  }

  return memoryDb.quizzes.find(q => q.id === id) || null;
}

async function saveSubmission({ id, quiz_id, student_id, student_name, student_code, score, answers }) {
  const codeVal = student_code || student_id || `SV-${Math.floor(100000 + Math.random() * 900000)}`;
  const sql = `
    INSERT INTO quiz_submissions (id, quiz_id, student_id, student_name, score, answers_json)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  await query(sql, [id, quiz_id, codeVal, student_name, score, JSON.stringify(answers)]);

  const subObj = {
    id,
    quiz_id,
    student_id: codeVal,
    student_name,
    student_code: codeVal,
    score,
    answers,
    submitted_at: new Date().toISOString()
  };
  memoryDb.quiz_submissions.unshift(subObj);
  return subObj;
}

async function getSubmissionsByQuizId(quiz_id) {
  const sql = `SELECT * FROM quiz_submissions WHERE quiz_id = $1 ORDER BY submitted_at DESC;`;
  const pgRes = await query(sql, [quiz_id]);
  if (pgRes && pgRes.rows) {
    return pgRes.rows.map(r => ({
      ...r,
      student_code: r.student_id,
      answers: typeof r.answers_json === 'string' ? JSON.parse(r.answers_json) : r.answers_json
    }));
  }
  return memoryDb.quiz_submissions.filter(s => s.quiz_id === quiz_id);
}

async function deleteDocument(id) {
  const sql = `DELETE FROM documents WHERE id = $1;`;
  await query(sql, [id]);
  // Also remove from memory fallback
  memoryDb.documents = memoryDb.documents.filter(d => d.id !== id);
}

module.exports = {
  query,
  insertDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  saveQuiz,
  getQuizById,
  saveSubmission,
  getSubmissionsByQuizId,
  isPgConnected: () => isPgConnected
};
