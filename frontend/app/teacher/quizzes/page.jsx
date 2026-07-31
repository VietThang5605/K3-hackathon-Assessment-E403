'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, ArrowLeft, Users, BarChart3, Share2, Eye, Clock, CheckCircle,
  RefreshCw, Copy, QrCode, ExternalLink, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { getBackendUrl } from '../../config';

export default function TeacherQuizzesPage() {
  const backendUrl = getBackendUrl();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  async function fetchQuizzes() {
    try {
      const res = await fetch(`${backendUrl}/api/quizzes`);
      if (res.ok) {
        const data = await res.json();
        if (data.quizzes) {
          setQuizzes(data.quizzes);
        }
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizzes();
    const interval = setInterval(fetchQuizzes, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredQuizzes = quizzes.filter(q => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (q.title || '').toLowerCase().includes(query) ||
           (q.slide_title || '').toLowerCase().includes(query) ||
           (q.id || '').toLowerCase().includes(query);
  });

  function getStudentUrl(quizId) {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}/student/quiz/${quizId}`;
    }
    return `http://localhost:3000/student/quiz/${quizId}`;
  }

  function getQrUrl(quizId) {
    const studentUrl = getStudentUrl(quizId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(studentUrl)}`;
  }

  function handleCopyLink(quizId) {
    navigator.clipboard.writeText(getStudentUrl(quizId));
    setCopiedId(quizId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem',
              fontWeight: 600, padding: '0.4rem 0.8rem', borderRadius: '8px',
              background: '#eef2ff', border: '1px solid #c7d2fe',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} /> Trang chính
          </a>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={22} style={{ color: '#4f46e5' }} />
              Kho Quiz Đã Tạo
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Xem lại quiz, mã QR, link và thống kê sinh viên
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.8rem', color: '#64748b',
            display: 'flex', alignItems: 'center', gap: '0.3rem'
          }}>
            <RefreshCw size={13} /> Tự động cập nhật mỗi 10s
          </div>
          <span style={{
            background: '#eef2ff', color: '#4f46e5', padding: '0.3rem 0.8rem',
            borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
            border: '1px solid #c7d2fe'
          }}>
            {quizzes.length} quiz
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'white', padding: '0.6rem 1rem', borderRadius: '12px',
          border: '1px solid #e2e8f0', marginBottom: '1.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm theo tên quiz, slide, hoặc mã quiz..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem',
              color: '#1e293b', background: 'transparent'
            }}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>Đang tải danh sách quiz...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredQuizzes.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem', background: 'white',
            borderRadius: '16px', border: '1px solid #e2e8f0'
          }}>
            <BookOpen size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 700, marginBottom: '0.5rem' }}>
              {searchQuery ? 'Không tìm thấy quiz phù hợp' : 'Chưa có quiz nào được phát hành'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm.' : 'Quay lại trang chính để tạo và phát hành quiz mới.'}
            </p>
          </div>
        )}

        {/* Quiz Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQuizzes.map((quiz) => {
            const isExpanded = expandedQuiz === quiz.id;
            const studentUrl = getStudentUrl(quiz.id);
            const qrUrl = getQrUrl(quiz.id);

            return (
              <div
                key={quiz.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: isExpanded ? '2px solid #818cf8' : '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: isExpanded ? '0 4px 20px rgba(99,102,241,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Card Header - Always Visible */}
                <div
                  onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s',
                    background: isExpanded ? '#fafafe' : 'white'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{
                        background: '#eef2ff', color: '#4f46e5',
                        padding: '0.15rem 0.5rem', borderRadius: '6px',
                        fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace',
                        border: '1px solid #c7d2fe'
                      }}>
                        {quiz.id}
                      </span>
                      <span style={{
                        background: '#f0fdf4', color: '#16a34a',
                        padding: '0.15rem 0.5rem', borderRadius: '6px',
                        fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem',
                        border: '1px solid #bbf7d0'
                      }}>
                        <CheckCircle size={11} /> Đã phát hành
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.35rem 0' }}>
                      {quiz.title || quiz.slide_title || 'Bài Quiz Đánh Giá'}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BookOpen size={13} /> {quiz.question_count || 0} câu hỏi
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} /> {formatDate(quiz.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Right side: submission badge + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      background: (quiz.submission_count > 0) ? '#eff6ff' : '#f8fafc',
                      color: (quiz.submission_count > 0) ? '#2563eb' : '#94a3b8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: `1px solid ${(quiz.submission_count > 0) ? '#bfdbfe' : '#e2e8f0'}`
                    }}>
                      <Users size={15} />
                      {quiz.submission_count || 0} SV nộp bài
                    </div>
                    {isExpanded ? <ChevronUp size={20} style={{ color: '#94a3b8' }} /> : <ChevronDown size={20} style={{ color: '#94a3b8' }} />}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    background: '#fafbff',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 1fr',
                      gap: '1.5rem',
                      alignItems: 'start'
                    }}>
                      {/* QR Code */}
                      <div style={{
                        background: 'white', padding: '0.75rem',
                        borderRadius: '12px', border: '1px solid #e2e8f0',
                        textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}>
                        <img
                          src={qrUrl}
                          alt={`QR Code - ${quiz.id}`}
                          style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
                        />
                        <div style={{
                          fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700,
                          marginTop: '0.5rem', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '0.3rem'
                        }}>
                          📱 Quét mã để làm bài
                        </div>
                      </div>

                      {/* Link & Actions */}
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                          Đường dẫn công khai (Public Link):
                        </div>
                        <div style={{
                          display: 'flex', gap: '0.5rem',
                          background: 'white', padding: '0.5rem 0.75rem',
                          borderRadius: '8px', border: '1px solid #e2e8f0',
                          marginBottom: '1rem', alignItems: 'center'
                        }}>
                          <code style={{
                            fontSize: '0.78rem', color: '#4f46e5',
                            wordBreak: 'break-all', flex: 1,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                          }}>
                            {studentUrl}
                          </code>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                          <button
                            onClick={() => handleCopyLink(quiz.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              padding: '0.5rem 1rem', borderRadius: '8px',
                              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                              border: '1px solid #c7d2fe',
                              background: copiedId === quiz.id ? '#22c55e' : '#4f46e5',
                              color: 'white',
                              transition: 'all 0.2s'
                            }}
                          >
                            {copiedId === quiz.id ? (
                              <><CheckCircle size={14} /> Đã sao chép!</>
                            ) : (
                              <><Copy size={14} /> Sao chép Link</>
                            )}
                          </button>

                          <a
                            href={`/student/quiz/${quiz.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              padding: '0.5rem 1rem', borderRadius: '8px',
                              fontSize: '0.85rem', fontWeight: 600,
                              border: '1px solid #e2e8f0',
                              background: 'white', color: '#475569',
                              textDecoration: 'none', cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <ExternalLink size={14} /> Mở bài thi
                          </a>
                        </div>

                        {/* Analytics Button */}
                        <a
                          href={`/teacher/analytics/${quiz.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '10px',
                            fontSize: '0.9rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: 'white', textDecoration: 'none',
                            boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <BarChart3 size={18} />
                          Xem Bảng Điểm & Thống Kê ({quiz.submission_count || 0} SV)
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
