'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Trash2, Plus, Search, Clock, Database, ArrowLeft,
  ChevronDown, ChevronUp, Eye, Download, Sparkles, BookOpen, AlertTriangle
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Load all documents from PostgreSQL DB
  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.warn('Could not fetch documents:', err);
    }
    setIsLoading(false);
  }

  // Upload new document
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const res = await fetch(`${backendUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.document) {
          setDocuments(prev => [data.document, ...prev]);
        }
      }
    } catch (err) {
      console.warn('Upload failed:', err);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Delete document
  async function handleDelete(docId) {
    if (!confirm('Bạn có chắc muốn xoá tài liệu này?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        if (selectedDoc?.id === docId) setSelectedDoc(null);
      }
    } catch (err) {
      // Fallback: remove from local state
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (selectedDoc?.id === docId) setSelectedDoc(null);
    }
  }

  // Filtered & sorted documents
  const filteredDocs = documents
    .filter(d => {
      if (!searchQuery.trim()) return true;
      return d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             d.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             d.author?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortField === 'title') {
        return sortDirection === 'asc'
          ? (a.title || '').localeCompare(b.title || '', 'vi')
          : (b.title || '').localeCompare(a.title || '', 'vi');
      }
      if (sortField === 'created_at') {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

  function toggleSort(field) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept=".pdf,.pptx,.ppt,.txt,.md,.json,.csv"
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
              <h1>Kho Tài Liệu</h1>
              <p>Quản lý toàn bộ Slide & Tài liệu bài giảng đã tải lên PostgreSQL DB</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="/"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)',
                background: 'var(--primary-50)', padding: '0.4rem 0.85rem',
                borderRadius: '20px', border: '1px solid var(--primary-200)',
                textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={16} /> Quay về Trang chính
            </a>
            <span style={{
              fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-text)',
              background: 'var(--green-bg)', padding: '0.35rem 0.75rem',
              borderRadius: '20px', border: '1px solid var(--green-border)'
            }}>
              <Database size={14} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />
              PostgreSQL DB
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-wrapper" style={{ flex: 1 }}>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              {documents.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Tổng tài liệu
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-text)' }}>
              {documents.filter(d => d.content_text && d.content_text.length > 50).length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Đã trích xuất nội dung
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--yellow-text)' }}>
              {documents.filter(d => !d.content_text || d.content_text.length <= 50).length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Chưa có nội dung
            </div>
          </div>
        </div>

        {/* Upload & Search Bar */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '250px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu theo tên, môn học, tác giả..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)', fontSize: '0.9rem',
                  outline: 'none', transition: 'border 0.2s'
                }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isUploading ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang tải...</>
              ) : (
                <><Plus size={16} /> Tải tài liệu mới</>
              )}
            </button>
          </div>
        </div>

        {/* Document Table + Detail Pane */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>

          {/* Document Table */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              <FileText size={20} color="var(--primary-600)" />
              Danh sách tài liệu ({filteredDocs.length})
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 1rem auto' }} />
                Đang tải danh sách từ PostgreSQL DB...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '3rem', color: 'var(--text-muted)',
                border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-md)'
              }}>
                <Upload size={48} style={{ margin: '0 auto 1rem auto', display: 'block', opacity: 0.4 }} />
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Chưa có tài liệu nào</p>
                <p style={{ fontSize: '0.85rem' }}>Bấm "Tải tài liệu mới" để bắt đầu</p>
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.5fr',
                  padding: '0.6rem 0.75rem', background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem',
                  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  <div
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => toggleSort('title')}
                  >
                    Tên tài liệu
                    {sortField === 'title' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                  <div>Môn học</div>
                  <div
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => toggleSort('created_at')}
                  >
                    Ngày tải
                    {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                  <div style={{ textAlign: 'center' }}>Thao tác</div>
                </div>

                {/* Table Rows */}
                {filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.5fr',
                      padding: '0.85rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: selectedDoc?.id === doc.id
                        ? '2px solid var(--primary-500)'
                        : '1px solid var(--border-light)',
                      background: selectedDoc?.id === doc.id ? 'var(--primary-50)' : 'white',
                      marginBottom: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={18} color="var(--primary-600)" />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.file_size || '—'} • {doc.page_count || '?'} trang • {doc.author || 'Giảng viên'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                      {doc.course_name || 'K3-AI Product Architecture'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <Clock size={12} style={{ marginRight: '0.3rem' }} />
                      {formatDate(doc.created_at)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        title="Xem chi tiết"
                        onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                        style={{
                          background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
                          borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', lineHeight: 1
                        }}
                      >
                        <Eye size={14} color="var(--primary-600)" />
                      </button>
                      <button
                        title="Xoá tài liệu"
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                        style={{
                          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
                          borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', lineHeight: 1
                        }}
                      >
                        <Trash2 size={14} color="var(--red-text)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Detail Pane */}
          {selectedDoc && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '1rem' }}>
                <Eye size={20} color="var(--primary-600)" />
                Chi tiết tài liệu
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {selectedDoc.title}
                </h3>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'
                }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                    borderRadius: '12px', background: 'var(--primary-50)', color: 'var(--primary-700)',
                    border: '1px solid var(--primary-200)'
                  }}>
                    📄 {selectedDoc.page_count || '?'} trang
                  </span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                    borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-light)'
                  }}>
                    💾 {selectedDoc.file_size || '—'}
                  </span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                    borderRadius: '12px', background: 'var(--green-bg)', color: 'var(--green-text)',
                    border: '1px solid var(--green-border)'
                  }}>
                    <Database size={10} style={{ marginRight: '0.2rem', verticalAlign: 'text-bottom' }} />
                    PostgreSQL DB
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Môn học:</strong> {selectedDoc.course_name || 'K3-AI Product Architecture'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <strong>Tác giả:</strong> {selectedDoc.author || 'Giảng viên'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Ngày tải lên:</strong> {formatDate(selectedDoc.created_at)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Document ID:</strong>
                </div>
                <code style={{
                  fontSize: '0.8rem', background: 'var(--bg-subtle)', padding: '0.3rem 0.6rem',
                  borderRadius: '4px', display: 'inline-block', color: 'var(--primary-700)',
                  border: '1px solid var(--border-light)', wordBreak: 'break-all'
                }}>
                  {selectedDoc.id}
                </code>
              </div>

              {/* Content Preview */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  📝 Nội dung đã trích xuất
                </h4>
                {selectedDoc.content_text && selectedDoc.content_text.length > 50 ? (
                  <div style={{
                    background: 'var(--bg-subtle)', padding: '1rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)',
                    maxHeight: '300px', overflowY: 'auto', fontSize: '0.85rem',
                    color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap'
                  }}>
                    {selectedDoc.content_text.substring(0, 2000)}
                    {selectedDoc.content_text.length > 2000 && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {'\n\n'}... (còn {selectedDoc.content_text.length - 2000} ký tự)
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--yellow-bg)', padding: '1rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--yellow-border)',
                    fontSize: '0.85rem', color: 'var(--yellow-text)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <AlertTriangle size={16} />
                    Tài liệu chưa có nội dung trích xuất chi tiết.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap'
              }}>
                <a
                  href={`/?documentId=${selectedDoc.id}&slideTitle=${encodeURIComponent(selectedDoc.title)}`}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                >
                  <BookOpen size={16} /> Tạo Quiz từ tài liệu này
                </a>
                <button
                  className="btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'var(--red-bg)', color: 'var(--red-text)',
                    border: '1px solid var(--red-border)'
                  }}
                  onClick={() => handleDelete(selectedDoc.id)}
                >
                  <Trash2 size={14} /> Xoá tài liệu
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border-light)',
        fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-surface)'
      }}>
        VLearn Assessment Agent — Kho Tài Liệu • Dữ liệu lưu trên PostgreSQL Database
      </footer>
    </div>
  );
}
