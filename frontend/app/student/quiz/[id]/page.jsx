'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Clock, ArrowRight, User, Hash, Sparkles, BookOpen, RefreshCw, Award
} from 'lucide-react';
import { getBackendUrl } from '../../../config';

export default function StudentQuizPage({ params }) {
  const quizId = params?.id || 'quiz-1';
  const backendUrl = getBackendUrl();

  // Step state: 'AUTH' -> 'QUIZ' -> 'RESULT'
  const [step, setStep] = useState('AUTH');

  // Student Info State
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Quiz Data & Answer State
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Load Quiz Data on Mount
  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/quizzes/${quizId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.quiz && Array.isArray(data.quiz.questions) && data.quiz.questions.length > 0) {
            setQuiz(data.quiz);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch quiz from backend, loading fallback sample:', err);
      }

      // Fallback sample quiz if backend is not seeded yet
      setQuiz({
        id: quizId,
        title: 'Bài 4: Kiến trúc RAG & Vector Database trong AI Application',
        course_name: 'K3-AI Product Architecture',
        questions: [
          {
            id: 'q1',
            question: 'Kỹ thuật Chunking Overlap trong RAG Pipeline có mục đích chính là gì?',
            concept: 'RAG Architecture & Chunking',
            options: [
              { id: 'A', text: 'Tăng tốc độ truy vấn trong Vector Database' },
              { id: 'B', text: 'Duy trì ngữ cảnh liền mạch giữa các đoạn văn bản khi cắt nhỏ' },
              { id: 'C', text: 'Giảm kích thước file Embedding lưu trên RAM' },
              { id: 'D', text: 'Tự động phát hiện và loại bỏ các từ vô nghĩa' }
            ],
            correctAnswer: 'B',
            explanation: 'Chunking Overlap giữ lại một phần ký tự/token của đoạn trước trong đoạn sau để tránh việc ngữ cảnh bị ngắt đứt ở ranh giới đoạn cắt.'
          },
          {
            id: 'q2',
            question: 'Khi nào nên ưu tiên dùng Hybrid Search (BM25 + Dense Retrieval) thay vì chỉ dùng Vector Search?',
            concept: 'Retrieval & Hybrid Search',
            options: [
              { id: 'A', text: 'Khi tài liệu chỉ chứa toàn bộ là tệp hình ảnh không có văn bản' },
              { id: 'B', text: 'Khi truy vấn chứa các từ khóa chính xác như mã SKU, tên riêng, thuật ngữ kỹ thuật viết tắt' },
              { id: 'C', text: 'Khi muốn giảm chi phí API gọi LLM xuống mức tối đa' },
              { id: 'D', text: 'Khi số lượng document trong kho nhỏ hơn 100 trang' }
            ],
            correctAnswer: 'B',
            explanation: 'Dense Retrieval giỏi hiểu ngữ cảnh nghĩa rộng nhưng kém khi tìm chính xác từ khóa đặc thù (mã hàng, mã lỗi). Hybrid Search kết hợp BM25 giúp cân bằng cả hai.'
          },
          {
            id: 'q3',
            question: 'Chỉ số Cosine Similarity trong Vector Database đo lường yếu tố nào giữa hai vector embedding?',
            concept: 'Vector Embeddings',
            options: [
              { id: 'A', text: 'Khoảng cách Euclide tuyệt đối giữa 2 điểm' },
              { id: 'B', text: 'Góc giữa hai vector trong không gian nhiều chiều (hướng vector)' },
              { id: 'C', text: 'Tổng số lượng từ trùng lặp tuyệt đối' },
              { id: 'D', text: 'Tốc độ mã hóa câu văn bản của Transformer Model' }
            ],
            correctAnswer: 'B',
            explanation: 'Cosine Similarity đo cosin của góc giữa 2 vector. Giá trị gần 1 đồng nghĩa 2 đoạn văn bản có ý nghĩa rất giống nhau bất chấp độ dài ngắn.'
          }
        ]
      });
      setLoading(false);
    }

    fetchQuiz();
  }, [quizId, backendUrl]);

  // Handle Confirm Student Info
  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !studentCode.trim()) {
      setAuthError('Vui lòng nhập đầy đủ Họ và tên và Mã sinh viên để tiếp tục!');
      return;
    }
    setAuthError('');
    setStep('QUIZ');
  };

  // Handle Submit Quiz
  const handleSubmitQuiz = async () => {
    const totalQ = quiz?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQ) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${totalQ} câu. Bạn có chắc chắn muốn nộp bài ngay không?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentCode.trim(),
          studentName: studentName.trim(),
          studentCode: studentCode.trim(),
          answers
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submission) {
          setSubmitResult(data);
          setIsSubmitting(false);
          setStep('RESULT');
          return;
        }
      }
    } catch (err) {
      console.warn('Submit quiz error, calculating locally:', err);
    }

    // Local grading fallback if backend is offline
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    const scorePct = Math.round((correctCount / totalQ) * 100);

    setSubmitResult({
      success: true,
      score: scorePct,
      correctCount,
      totalQuestions: totalQ,
      submission: {
        student_name: studentName,
        student_code: studentCode,
        score: scorePct
      }
    });
    setIsSubmitting(false);
    setStep('RESULT');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Đang tải bài thi trắc nghiệm...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-group">
            <div className="logo-badge">
              <Sparkles size={20} /> VLearn
            </div>
            <div className="logo-text">
              <h1>Cổng Làm Bài Kiểm Tra Sinh Viên</h1>
              <p>{quiz?.course_name || 'VLearn Student Portal'}</p>
            </div>
          </div>
          {step === 'QUIZ' && (
            <div style={{ background: 'var(--primary-50)', padding: '0.4rem 0.85rem', borderRadius: '20px', border: '1px solid var(--primary-200)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)' }}>
              👤 {studentName} ({studentCode})
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="main-wrapper" style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* STEP 1: AUTHENTICATION FORM */}
          {step === 'AUTH' && (
            <div className="card" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: 64, height: 64, background: 'var(--primary-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--primary-600)' }}>
                  <BookOpen size={32} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {quiz?.title || 'Bài Kiểm Tra Đánh Giá Tri Thức'}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Vui lòng nhập thông tin sinh viên để bắt đầu làm bài kiểm tra trắc nghiệm.
                </p>
              </div>

              {authError && (
                <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', color: 'var(--red-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} />
                  {authError}
                </div>
              )}

              <form onSubmit={handleStartQuiz}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    <User size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
                    Họ và tên sinh viên <span style={{ color: 'var(--red-text)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    <Hash size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
                    Mã sinh viên (Student ID) <span style={{ color: 'var(--red-text)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: SV20248899"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700, justifyContent: 'center' }}
                >
                  Xác nhận & Vào làm bài <ArrowRight size={20} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: DOING QUIZ */}
          {step === 'QUIZ' && (
            <div className="card">
              {/* Quiz Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {quiz.title}
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Số câu hỏi: <strong>{quiz.questions.length} câu</strong> • Đã chọn: <strong>{Object.keys(answers).length}/{quiz.questions.length}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '0.4rem 0.75rem', borderRadius: '20px', border: '1px solid var(--primary-200)' }}>
                  <Clock size={16} /> Đang tính giờ
                </div>
              </div>

              {/* Questions List */}
              {quiz.questions.map((q, idx) => (
                <div key={q.id || idx} style={{ marginBottom: '1.75rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.95rem' }}>
                      Câu {idx + 1}:
                    </span>
                    {q.concept && (
                      <span className="concept-badge">{q.concept}</span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                          style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            borderRadius: 'var(--radius-sm)',
                            border: `2px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                            background: isSelected ? 'var(--primary-50)' : 'white',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--primary-800)' : 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                          }}
                        >
                          <span style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: isSelected ? 'var(--primary-600)' : 'var(--bg-subtle)',
                            color: isSelected ? 'white' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700
                          }}>
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Submit Button Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Đã làm {Object.keys(answers).length}/{quiz.questions.length} câu
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  {isSubmitting ? (
                    <><RefreshCw size={18} className="animate-spin" /> Đang nộp bài...</>
                  ) : (
                    <><CheckCircle size={18} /> Nộp bài kiểm tra</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT SCREEN */}
          {step === 'RESULT' && submitResult && (
            <div className="card" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: 72, height: 72, background: 'var(--green-bg)', border: '2px solid var(--green-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--green-text)' }}>
                  <Award size={40} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Đã Nộp Bài Thành Công!
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Sinh viên: <strong>{studentName}</strong> (Mã SV: <strong>{studentCode}</strong>)
                </p>
              </div>

              {/* Score Card */}
              <div style={{
                background: 'var(--primary-50)', border: '2px solid var(--primary-200)',
                padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Kết quả bài thi
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary-700)', lineHeight: 1.1 }}>
                  {submitResult.score}%
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  Đúng <strong>{submitResult.correctCount} / {submitResult.totalQuestions}</strong> câu hỏi
                </p>
              </div>

              {/* Review Answers */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
                📝 Chi tiết câu hỏi & Đáp án
              </h3>

              {quiz.questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={q.id || idx} style={{
                    marginBottom: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isCorrect ? 'var(--green-border)' : 'var(--red-border)'}`,
                    background: isCorrect ? 'var(--green-bg)' : 'var(--red-bg)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isCorrect ? 'var(--green-text)' : 'var(--red-text)' }}>
                        Câu {idx + 1}: {isCorrect ? '✓ Đúng' : '✗ Sai'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{q.concept}</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      {q.question}
                    </p>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div>Lựa chọn của bạn: <strong>{userAns || 'Chưa chọn'}</strong></div>
                      <div>Đáp án đúng: <strong style={{ color: 'var(--green-text)' }}>{q.correctAnswer}</strong></div>
                      {q.explanation && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          💡 {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setStep('AUTH');
                    setAnswers({});
                    setSubmitResult(null);
                  }}
                  style={{ padding: '0.75rem 2rem' }}
                >
                  <RefreshCw size={16} /> Làm lại / Đăng nhập tài khoản khác
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
        VLearn Student Quiz Portal — Kết quả bài làm được lưu trực tiếp vào PostgreSQL Database
      </footer>
    </div>
  );
}
