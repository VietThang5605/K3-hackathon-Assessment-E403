const dbClient = require('../db/dbClient');
const { mineChatlogs } = require('./chatlogMiner');
const { generateQuiz, generateRecapSuggestion } = require('./aiProvider');

class TeacherAgent {
  // Phase 1: Upload Slide / Document & Store in DB
  async uploadDocument({ title, course_name, author, file_size, page_count, content_text, metadata }) {
    const id = `doc-${Date.now()}`;
    const doc = {
      id,
      title: title || 'Tài liệu bài giảng VLearn',
      course_name: course_name || 'K3-AI Product Architecture',
      author: author || 'Giảng viên',
      file_size: file_size || '1.5 MB',
      page_count: page_count || 20,
      content_text: content_text || `Slide bài giảng ${title}`,
      metadata: metadata || { uploadedBy: 'Giảng viên' }
    };

    const inserted = await dbClient.insertDocument(doc);
    return inserted;
  }

  // Phase 2: RAG Pipeline + Chatlog Mining -> Draft Quiz Generation
  async generateDraftQuiz({ documentId, slideTitle, numQuestions = 5, provider = 'gemini' }) {
    let docContent = '';
    if (documentId) {
      const doc = await dbClient.getDocumentById(documentId);
      if (doc) docContent = doc.content_text;
    }

    // Mine student chatlogs for misconceptions
    const { minedConceptPains } = mineChatlogs();
    const chatlogSummary = minedConceptPains.map(p => `- ${p.concept}: ${p.painDescription}`).join('\n');

    // Generate raw quiz questions via LLM
    const rawQuestions = await generateQuiz({
      slideTitle: slideTitle || 'Bài 4: RAG Architecture',
      documentContent: docContent,
      chatlogContext: chatlogSummary,
      numQuestions,
      provider
    });

    const quizId = `quiz-${Date.now()}`;
    const draftQuiz = {
      id: quizId,
      document_id: documentId || 'doc-rag-01',
      title: `Quiz Đánh Giá — ${slideTitle || 'Bài 4: RAG Architecture'}`,
      slide_title: slideTitle || 'Bài 4: RAG Architecture',
      question_count: rawQuestions.length,
      is_published: false,
      questions: rawQuestions
    };

    // Store draft in DB
    await dbClient.saveQuiz(draftQuiz);
    return draftQuiz;
  }

  // Phase 3: Teacher Approval & Publishing
  async publishQuiz({ quizId, title, questions }) {
    const existing = await dbClient.getQuizById(quizId) || { id: quizId, slide_title: title };
    const updatedQuiz = {
      ...existing,
      title: title || existing.title,
      is_published: true,
      questions: questions || existing.questions
    };

    await dbClient.saveQuiz(updatedQuiz);
    return {
      success: true,
      quizId,
      shareableLink: `/quiz/${quizId}`,
      publishedQuiz: updatedQuiz
    };
  }

  // Phase 4: Student Quiz Submission & Grading
  async submitQuizAnswers({ quizId, studentId, studentName, answers }) {
    const quiz = await dbClient.getQuizById(quizId);
    if (!quiz || !quiz.questions) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const gradedAnswers = {};

    quiz.questions.forEach(q => {
      const studentAns = answers[q.id];
      const isCorrect = studentAns === q.correctAnswer;
      if (isCorrect) correctCount++;
      gradedAnswers[q.id] = {
        selected: studentAns,
        correct: q.correctAnswer,
        isCorrect,
        concept: q.concept || 'Kiến thức chung'
      };
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const submissionId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const submission = await dbClient.saveSubmission({
      id: submissionId,
      quiz_id: quizId,
      student_id: studentId || `std-${Date.now()}`,
      student_name: studentName || 'Học viên VLearn',
      score: scorePercentage,
      answers: gradedAnswers
    });

    return {
      submissionId,
      score: scorePercentage,
      correctCount,
      totalQuestions,
      submission
    };
  }

  // Phase 5: Knowledge Gap Heatmap & AI 3-min Recap Suggestion
  async getKnowledgeGapHeatmap(quizId) {
    const quiz = await dbClient.getQuizById(quizId);
    const submissions = await dbClient.getSubmissionsByQuizId(quizId);

    // Concept stats accumulator
    const conceptStats = {};

    if (quiz && quiz.questions) {
      quiz.questions.forEach(q => {
        const c = q.concept || 'Kiến thức chung';
        if (!conceptStats[c]) {
          conceptStats[c] = { concept: c, totalAttempts: 0, wrongCount: 0 };
        }
      });
    }

    submissions.forEach(sub => {
      const ansObj = sub.answers || {};
      Object.keys(ansObj).forEach(qId => {
        const item = ansObj[qId];
        const concept = item.concept || 'Kiến thức chung';
        if (!conceptStats[concept]) {
          conceptStats[concept] = { concept, totalAttempts: 0, wrongCount: 0 };
        }
        conceptStats[concept].totalAttempts++;
        if (!item.isCorrect) {
          conceptStats[concept].wrongCount++;
        }
      });
    });

    // Categorize into Heatmap Zones
    const redConcepts = [];
    const yellowConcepts = [];
    const greenConcepts = [];

    Object.values(conceptStats).forEach(st => {
      const errorRate = st.totalAttempts > 0 ? (st.wrongCount / st.totalAttempts) * 100 : 0;
      const conceptItem = {
        concept: st.concept,
        errorRate: Math.round(errorRate),
        wrongCount: st.wrongCount,
        totalAttempts: st.totalAttempts
      };

      if (errorRate >= 40 || st.totalAttempts === 0) {
        redConcepts.push(conceptItem);
      } else if (errorRate >= 15) {
        yellowConcepts.push(conceptItem);
      } else {
        greenConcepts.push(conceptItem);
      }
    });

    // Generate AI 3-min recap advice
    const aiRecapSuggestion = await generateRecapSuggestion({
      quizTitle: quiz ? quiz.title : 'Bài 4: RAG Architecture',
      redConcepts: redConcepts.map(c => c.concept),
      yellowConcepts: yellowConcepts.map(c => c.concept)
    });

    return {
      quizId,
      totalSubmissions: submissions.length,
      redConcepts,
      yellowConcepts,
      greenConcepts,
      aiRecapSuggestion
    };
  }
}

module.exports = new TeacherAgent();
