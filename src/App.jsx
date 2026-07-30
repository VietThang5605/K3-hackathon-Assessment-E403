import React, { useState, useRef, useMemo } from 'react';
import { 
  FileText, Upload, Sparkles, CheckCircle, RefreshCw, Edit3, Trash2, Plus, 
  Share2, BarChart3, AlertTriangle, Download, Clock, Users, Award, BookOpen, 
  ArrowRight, ArrowLeft, Check, HelpCircle, Eye, Search, ArrowUpDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  SAMPLE_SLIDES, INITIAL_QUIZ, ALTERNATIVE_QUESTIONS_POOL, MOCK_CLASS_ANALYTICS 
} from './data/mockData';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [slideList, setSlideList] = useState(SAMPLE_SLIDES);
  const [selectedSlide, setSelectedSlide] = useState(SAMPLE_SLIDES[0]);
  const [quizList, setQuizList] = useState(INITIAL_QUIZ);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [studentSubmitted, setStudentSubmitted] = useState(false);
  const [altPoolIndex, setAltPoolIndex] = useState(0);

  // File Upload Ref
  const fileInputRef = useRef(null);

  // Student Roster Controls (Step 5)
  const [showStudentList, setShowStudentList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('asc'); // asc: low score first
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Stepper labels
  const steps = [
    { number: 1, label: "Upload & Thiết lập" },
    { number: 2, label: "Review Quiz (AI Nháp)" },
    { number: 3, label: "Phát hành & Chia sẻ" },
    { number: 4, label: "Làm thử (Giao diện Học viên)" },
    { number: 5, label: "Heatmap Lỗ hổng (Báo cáo)" }
  ];

  // Handler: Real File Upload simulation
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newSlide = {
      id: `uploaded-${Date.now()}`,
      title: file.name,
      pages: Math.floor(Math.random() * 20) + 15,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadTime: "Vừa tải lên",
      course: "K3-AI Product Architecture",
      author: "Giảng viên"
    };
    setSlideList(prev => [newSlide, ...prev]);
    setSelectedSlide(newSlide);
    alert(`Đã tải lên thành công file: "${file.name}"! Slide đã được chọn để sinh Quiz.`);
  };

  // Handler: Start AI Generation
  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(2);
    }, 800);
  };

  // Handler: Edit question
  const handleSaveEdit = (updatedQ) => {
    setQuizList(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
    setEditingQuestion(null);
  };

  // Handler: Delete question
  const handleDeleteQuestion = (id) => {
    if (quizList.length <= 1) {
      alert("Bộ Quiz cần giữ lại ít nhất 1 câu hỏi!");
      return;
    }
    setQuizList(prev => prev.filter(q => q.id !== id));
  };

  // Handler: Regenerate individual question
  const handleRegenerateQuestion = (targetId) => {
    const replacement = ALTERNATIVE_QUESTIONS_POOL[altPoolIndex % ALTERNATIVE_QUESTIONS_POOL.length];
    setAltPoolIndex(prev => prev + 1);
    
    setQuizList(prev => prev.map(q => {
      if (q.id === targetId) {
        return {
          ...replacement,
          id: targetId
        };
      }
      return q;
    }));
  };

  // Handler: Add new custom question
  const handleAddQuestion = () => {
    const newId = `q${Date.now()}`;
    const newQ = {
      id: newId,
      question: "Câu hỏi mới tự tạo: Thuật ngữ RAG viết tắt của từ gì?",
      options: [
        { id: "A", text: "Retrieval-Augmented Generation" },
        { id: "B", text: "Random-Access Generation" },
        { id: "C", text: "Recurrent Automated Grouping" },
        { id: "D", text: "Read-And-Generate" }
      ],
      correctAnswer: "A",
      explanation: "RAG là viết tắt của Retrieval-Augmented Generation (Truy xuất thông tin hỗ trợ sinh văn bản).",
      concept: "RAG Architecture & Chunking",
      confidenceScore: 1.0,
      isLowConfidence: false,
      conceptCode: "C1"
    };
    setQuizList(prev => [...prev, newQ]);
  };

  // Handler: Export CSV Report
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "STT,Khai niem / Concept,Muc do Lo hong,Ty le Lam Sai (%),So SV Sai,Top Cau Hoi Sai\n";
    
    MOCK_CLASS_ANALYTICS.conceptHeatmap.forEach((item, index) => {
      const topWrongStr = item.topWrongQuestions.join(" | ") || "Khong co";
      csvContent += `${index + 1},"${item.name}",${item.statusLabel},${item.errorRate}%,${item.errorCount}/${MOCK_CLASS_ANALYTICS.completedStudents},"${topWrongStr}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_Lo_Hong_Kien_Thuc_K3_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Student List for Step 5
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...MOCK_CLASS_ANALYTICS.studentsList];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'score') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'name') {
        return sortDirection === 'asc' ? valA.localeCompare(valB, 'vi') : valB.localeCompare(valA, 'vi');
      }
      if (sortField === 'time') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });

    return result;
  }, [searchQuery, statusFilter, sortField, sortDirection]);

  // Paginated Students
  const totalPages = Math.ceil(filteredAndSortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedStudents.slice(start, start + pageSize);
  }, [filteredAndSortedStudents, currentPage, pageSize]);

  // Sort toggle handler
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".pdf,.pptx,.ppt" 
        style={{ display: 'none' }} 
      />

      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-group">
            <div className="logo-badge">
              <Sparkles size={20} /> VLearn
            </div>
            <div className="logo-text">
              <h1>Assessment Agent</h1>
              <p>AI Tạo Quiz & Phát hiện Lỗ hổng Học tập cho Giảng viên</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid var(--primary-200)' }}>
              🎯 Lớp: K3 - AI Product Architecture
            </span>
          </div>
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="stepper-bar">
        <div className="stepper-container">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            return (
              <button 
                key={step.number}
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.number)}
              >
                <div className="step-number">
                  {isCompleted ? <Check size={16} /> : step.number}
                </div>
                <span className="step-label">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="main-wrapper" style={{ flex: 1 }}>
        
        {/* STEP 1: UPLOAD & CONFIG */}
        {currentStep === 1 && (
          <div>
            <div className="card">
              <div className="card-title">
                <Upload size={22} color="var(--primary-600)" />
                Bước 1: Chọn Tài Liệu Bài Giảng (Slide vLearn)
              </div>
              <div className="card-subtitle">
                Hệ thống RAG sẽ tự động quét Slide để trích xuất tri thức và tạo bộ Quiz kiểm tra.
              </div>

              {/* Sample Slide Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {slideList.map((slide) => (
                  <div 
                    key={slide.id}
                    onClick={() => setSelectedSlide(slide)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${selectedSlide.id === slide.id ? 'var(--primary-600)' : 'var(--border-light)'}`,
                      background: selectedSlide.id === slide.id ? 'var(--primary-50)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', background: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--primary-200)' }}>
                        {slide.course}
                      </span>
                      {selectedSlide.id === slide.id && <CheckCircle size={18} color="var(--primary-600)" />}
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      {slide.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📄 {slide.pages} trang • 💾 {slide.size} • 🕒 {slide.uploadTime}
                    </p>
                  </div>
                ))}
              </div>

              {/* Upload Button Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--primary-200)',
                  background: 'var(--primary-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Upload size={36} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                <p style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Bấm vào đây để Chọn & Tải Slide từ máy tính
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Hỗ trợ các định dạng PDF, PPTX (Dung lượng tối đa 50MB)
                </p>
                <button 
                  className="btn btn-primary"
                  style={{ marginTop: '0.75rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Plus size={14} /> Tải Slide lên thật
                </button>
              </div>

              {/* Quiz Generation Parameters (Simplified: Removed Nguon thac mac bo sung) */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                  ⚙️ Cấu hình bộ Quiz nháp:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Số lượng câu hỏi</label>
                    <select className="form-select" defaultValue="5">
                      <option value="5">5 câu (Khuyên dùng - Kiểm tra nhanh 3 phút)</option>
                      <option value="10">10 câu (Bài kiểm tra 15 phút)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Mức độ khó</label>
                    <select className="form-select" defaultValue="medium">
                      <option value="medium">Cân bằng (Thông hiểu + Vận dụng)</option>
                      <option value="easy">Cơ bản (Nhận biết)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  style={{ fontSize: '1rem', padding: '0.75rem 1.75rem' }}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Đang RAG & Sinh Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Sinh Quiz Tự Động (AI Simulation) <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW QUIZ (HUMAN IN THE LOOP) */}
        {currentStep === 2 && (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div className="card-title">
                    <CheckCircle size={22} color="var(--primary-600)" />
                    Bước 2: Giảng Viên Review & Phê Duyệt Bộ Quiz Nháp
                  </div>
                  <p className="card-subtitle">
                    AI đã tự động sinh {quizList.length} câu hỏi từ slide <strong style={{ color: 'var(--primary-700)' }}>"{selectedSlide.title}"</strong>. Bạn có thể chỉnh sửa, đổi câu khác hoặc phê duyệt.
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={handleAddQuestion}>
                  <Plus size={16} /> Thêm câu hỏi mới
                </button>
              </div>

              {/* Warning Notice (Removed "Quy trinh Human-in-the-loop:" prefix) */}
              <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', padding: '0.85rem 1.2rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={24} color="var(--yellow-text)" />
                <div style={{ fontSize: '0.875rem', color: 'var(--yellow-text)', fontWeight: 500 }}>
                  Vui lòng xem kỹ các câu hỏi được đánh dấu badge <span className="warning-badge">⚠️ Low Confidence</span> trước khi bấm Phát hành cho sinh viên.
                </div>
              </div>

              {/* Question Cards List */}
              {quizList.map((q, index) => (
                <div key={q.id} className={`question-card ${q.isLowConfidence ? 'low-confidence' : ''}`}>
                  <div className="question-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.95rem' }}>
                        Câu {index + 1}:
                      </span>
                      <span className="concept-badge">{q.concept}</span>
                      {q.isLowConfidence && (
                        <span className="warning-badge">
                          <AlertTriangle size={14} /> {q.warningNote || "⚠️ Cần kiểm tra kỹ"}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        title="Tải câu hỏi khác từ AI"
                        onClick={() => handleRegenerateQuestion(q.id)}
                      >
                        <RefreshCw size={14} /> Đổi câu khác
                      </button>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => setEditingQuestion(q)}
                      >
                        <Edit3 size={14} /> Sửa
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0.5rem 0' }}>
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="option-list">
                    {q.options.map((opt) => (
                      <div 
                        key={opt.id} 
                        className={`option-item ${opt.id === q.correctAnswer ? 'correct' : ''}`}
                      >
                        <strong>{opt.id}.</strong> {opt.text}
                        {opt.id === q.correctAnswer && <span style={{ marginLeft: '0.5rem' }}>✓ (Đáp án đúng)</span>}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    💡 <strong>Giải thích AI:</strong> {q.explanation}
                  </div>
                </div>
              ))}

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={16} /> Quay lại Upload
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setCurrentStep(3)}
                  style={{ fontSize: '1rem', padding: '0.75rem 1.75rem' }}
                >
                  <CheckCircle size={18} /> Phê Duyệt & Phát Hành Quiz ({quizList.length} câu) <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PUBLISH & SHARE */}
        {currentStep === 3 && (
          <div>
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--primary-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--primary-600)' }}>
                <CheckCircle size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Bộ Quiz Đã Được Phê Duyệt & Phát Hành!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                Bộ kiểm tra đã sẵn sàng cho sinh viên lớp <strong>K3-AI Product Architecture</strong> trên VLearn Student Web Portal.
              </p>

              <div style={{ background: 'var(--primary-50)', border: '1px dashed var(--primary-300)', padding: '1.5rem', borderRadius: 'var(--radius-md)', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Mã truy cập bài Quiz của lớp:
                </p>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '3px', color: 'var(--primary-700)', marginBottom: '0.75rem' }}>
                  VLEARN-K3-8899
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => alert("Đã sao chép link Quiz Web vào clipboard!")}>
                    <Share2 size={16} /> Sao chép Link Web Quiz
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setCurrentStep(4)}>
                  <Eye size={16} /> Xem Giao diện Học viên Làm bài
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(5)} style={{ padding: '0.75rem 1.5rem' }}>
                  <BarChart3 size={18} /> Giả lập 24 SV Nộp bài ➔ Xem Heatmap Lỗ hổng <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: STUDENT VIEW DEMO */}
        {currentStep === 4 && (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', background: 'var(--text-main)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                    STUDENT WEB PORTAL DEMO
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.3rem' }}>
                    Bài Kiểm Tra: {selectedSlide.title}
                  </h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} /> Thời gian làm bài: 03:45
                </div>
              </div>

              {quizList.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    Câu {idx + 1}: {q.question}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {q.options.map((opt) => {
                      const isSelected = studentAnswers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setStudentAnswers({ ...studentAnswers, [q.id]: opt.id })}
                          style={{
                            padding: '0.65rem 0.85rem',
                            textAlign: 'left',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                            background: isSelected ? 'var(--primary-50)' : 'white',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <strong>{opt.id}.</strong> {opt.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft size={16} /> Quay lại Màn hình Giảng viên
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setStudentSubmitted(true);
                    alert("Đã nộp bài Quiz! Chuyển tới Màn hình Báo cáo Heatmap cho Giảng viên.");
                    setCurrentStep(5);
                  }}
                >
                  <CheckCircle size={16} /> Nộp bài Quiz Học viên ➔ Xem Báo cáo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: KNOWLEDGE GAP HEATMAP (ANALYTICS) */}
        {currentStep === 5 && (
          <div>
            {/* Overview Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TỔNG SV HOÀN THÀNH</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-700)', margin: '0.2rem 0' }}>
                  24/25 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>(96%)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--green-text)' }}>✓ Đã nộp bài đủ</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ĐIỂM TRUNG BÌNH LỚP</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  6.8 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 10</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cao nhất: 10 • Thấp nhất: 2</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TỈ LỆ ĐẠT (PASS RATE)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-600)', margin: '0.2rem 0' }}>
                  72%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>18/25 SV đạt &ge; 6.0 điểm</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', marginBottom: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>KHÁI NIỆM HỔNG NẶNG NẤT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red-text)', margin: '0.4rem 0' }}>
                  RAG & Chunking
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--red-text)', fontWeight: 600 }}>🔴 48% sinh viên sai</div>
              </div>
            </div>

            {/* Knowledge Gap Heatmap Section */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div className="card-title">
                    <BarChart3 size={22} color="var(--primary-600)" />
                    Báo Cáo Lỗ Hổng Kiến Thức (Knowledge Gap Heatmap)
                  </div>
                  <p className="card-subtitle">
                    Thống kê tự động từ 24 bài nộp của học viên, phân loại trực quan theo 3 mức độ lỗ hổng khái niệm.
                  </p>
                </div>
                <button 
                  className="btn btn-secondary"
                  onClick={handleExportCSV}
                  title="Xuất file báo cáo CSV cho Giảng viên"
                >
                  <Download size={16} /> Xuất Báo Cáo (CSV)
                </button>
              </div>

              {/* Heatmap Cards Grid */}
              <div className="heatmap-grid">
                {MOCK_CLASS_ANALYTICS.conceptHeatmap.map((item) => (
                  <div key={item.code} className={`concept-card ${item.status}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        {item.code}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: item.status === 'RED' ? 'var(--red-text)' : item.status === 'YELLOW' ? 'var(--yellow-text)' : 'var(--green-text)'
                      }}>
                        {item.statusLabel}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      {item.name}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span>Tỉ lệ làm sai:</span>
                      <span style={{ color: item.status === 'RED' ? 'var(--red-text)' : 'inherit' }}>
                        {item.errorRate}% ({item.errorCount}/{MOCK_CLASS_ANALYTICS.completedStudents} SV)
                      </span>
                    </div>

                    <div className="progress-bar-bg">
                      <div className={`progress-bar-fill ${item.status}`} style={{ width: `${item.errorRate}%` }}></div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                      {item.description}
                    </p>

                    {item.topWrongQuestions.length > 0 && (
                      <div style={{ fontSize: '0.75rem', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        <strong>Câu hỏi sai nhiều:</strong> {item.topWrongQuestions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI 3-Minute Recommendation Box */}
              <div className="ai-recommendation-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles size={20} color="var(--primary-700)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    {MOCK_CLASS_ANALYTICS.aiRecommendation.title}
                  </h3>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <p>{MOCK_CLASS_ANALYTICS.aiRecommendation.recapPoint1}</p>
                  <p>{MOCK_CLASS_ANALYTICS.aiRecommendation.recapPoint2}</p>
                  <div style={{ marginTop: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-200)', fontWeight: 600, color: 'var(--primary-800)', fontSize: '0.85rem' }}>
                    💡 <strong>Hành động đề xuất:</strong> {MOCK_CLASS_ANALYTICS.aiRecommendation.suggestedAction}
                  </div>
                </div>
              </div>

              {/* Detailed Student Roster Section with Controls */}
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={20} color="var(--primary-600)" />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Danh Sách Chi Tiết Học Viên ({filteredAndSortedStudents.length} kết quả)
                    </h4>
                  </div>
                  
                  {/* Toggle Show/Hide Student List */}
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setShowStudentList(prev => !prev)}
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  >
                    {showStudentList ? (
                      <> <ChevronUp size={16} /> Ẩn Danh Sách </>
                    ) : (
                      <> <ChevronDown size={16} /> Hiện Danh Sách Chi Tiết </>
                    )}
                  </button>
                </div>

                {showStudentList && (
                  <div>
                    {/* Controls Bar: Search, Status Filter, Items per Page */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '1rem', marginBottom: '1rem', background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                      {/* Search Bar */}
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: '2.2rem' }}
                          placeholder="Tìm kiếm theo tên sinh viên..."
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <select 
                          className="form-select"
                          value={statusFilter}
                          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="ALL">Tất cả trạng thái (24 SV)</option>
                          <option value="Nguy cơ cao">🔴 Nguy cơ cao</option>
                          <option value="Cần hỗ trợ">🟡 Cần hỗ trợ</option>
                          <option value="Trung bình">🔵 Trung bình</option>
                          <option value="Khá">🟢 Khá</option>
                          <option value="Xuất sắc">⭐ Xuất sắc</option>
                        </select>
                      </div>

                      {/* Items Per Page */}
                      <div>
                        <select 
                          className="form-select"
                          value={pageSize}
                          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        >
                          <option value={5}>5 SV / trang</option>
                          <option value={10}>10 SV / trang</option>
                          <option value={25}>Xem tất cả (24 SV)</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive Table with Sorting */}
                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                              Họ & Tên Sinh Viên <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                            </th>
                            <th onClick={() => toggleSort('score')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                              Điểm Số <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                            </th>
                            <th onClick={() => toggleSort('time')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                              Thời Gian <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                            </th>
                            <th>Khái Niệm Làm Sai</th>
                            <th>Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((st) => (
                              <tr key={st.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{st.name}</td>
                                <td>
                                  <strong style={{ color: st.score < 5 ? 'var(--red-text)' : st.score >= 8 ? 'var(--green-text)' : 'inherit' }}>
                                    {st.score.toFixed(1)} / 10
                                  </strong>
                                </td>
                                <td>{st.time}</td>
                                <td>
                                  {st.wrongConcepts.length > 0 ? (
                                    st.wrongConcepts.map(c => (
                                      <span key={c} style={{ fontSize: '0.75rem', background: 'var(--red-bg)', color: 'var(--red-text)', padding: '0.15rem 0.4rem', borderRadius: '4px', marginRight: '0.3rem', border: '1px solid var(--red-border)' }}>
                                        {c}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', background: 'var(--green-bg)', color: 'var(--green-text)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--green-border)' }}>
                                      Không sai câu nào
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '12px',
                                    background: st.status.includes('hỗ trợ') || st.status.includes('Nguy cơ') ? 'var(--red-bg)' : st.status === 'Xuất sắc' ? 'var(--green-bg)' : 'var(--bg-subtle)',
                                    color: st.status.includes('hỗ trợ') || st.status.includes('Nguy cơ') ? 'var(--red-text)' : st.status === 'Xuất sắc' ? 'var(--green-text)' : 'var(--text-secondary)',
                                    border: `1px solid ${st.status.includes('hỗ trợ') || st.status.includes('Nguy cơ') ? 'var(--red-border)' : st.status === 'Xuất sắc' ? 'var(--green-border)' : 'var(--border-light)'}`
                                  }}>
                                    {st.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                Không tìm thấy học viên nào phù hợp với bộ lọc.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 0' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Hiển thị trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Tổng <strong>{filteredAndSortedStudents.length}</strong> sinh viên)
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          >
                            <ChevronLeft size={16} /> Trang trước
                          </button>
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          >
                            Trang sau <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal for Editing Question (Human-in-the-Loop) */}
      {editingQuestion && (
        <div className="modal-overlay" onClick={() => setEditingQuestion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              ✏️ Chỉnh Sửa Câu Hỏi Quiz
            </h3>
            
            <div className="form-group">
              <label className="form-label">Nội dung câu hỏi</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Khái niệm (Concept Mapping)</label>
              <input 
                className="form-input" 
                value={editingQuestion.concept}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, concept: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Đáp án đúng</label>
              <select 
                className="form-select"
                value={editingQuestion.correctAnswer}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
              >
                {editingQuestion.options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    Đáp án {opt.id}: {opt.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Giải thích chi tiết (AI Explanation)</label>
              <textarea 
                className="form-textarea" 
                rows="2" 
                value={editingQuestion.explanation}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setEditingQuestion(null)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveEdit(editingQuestion)}>
                Lưu chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
