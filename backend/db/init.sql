-- Database Schema Initialization for VLearn Assessment Agent (PostgreSQL)

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) DEFAULT 'K3-AI Product Architecture',
    author VARCHAR(255) DEFAULT 'Giảng viên',
    file_size VARCHAR(50),
    page_count INT DEFAULT 1,
    content_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(100),
    question_text TEXT NOT NULL,
    concept_tag VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(100) PRIMARY KEY,
    document_id VARCHAR(100) REFERENCES documents(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slide_title VARCHAR(255),
    question_count INT DEFAULT 5,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(100) PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options_json JSONB NOT NULL,
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT,
    concept VARCHAR(100),
    confidence_score FLOAT DEFAULT 0.95,
    is_low_confidence BOOLEAN DEFAULT FALSE,
    warning_note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id VARCHAR(100) PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    score FLOAT NOT NULL,
    answers_json JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS heatmaps (
    id VARCHAR(100) PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES quizzes(id) ON DELETE CASCADE,
    total_submissions INT DEFAULT 0,
    red_concepts JSONB DEFAULT '[]'::jsonb,
    yellow_concepts JSONB DEFAULT '[]'::jsonb,
    green_concepts JSONB DEFAULT '[]'::jsonb,
    ai_recap_suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed data
INSERT INTO courses (code, name) VALUES ('B03-K3', 'AI Product Architecture — Batch 03') ON CONFLICT DO NOTHING;

INSERT INTO documents (id, title, course_name, author, file_size, page_count, content_text) 
VALUES ('doc-rag-01', 'Bài 4: RAG Architecture', 'K3-AI Product Architecture', 'Giảng viên', '2.4 MB', 28, 'Nội dung slide về RAG Architecture, Vector DB, Chunking Strategy, Hybrid Search, Sparse & Dense Retrieval.') 
ON CONFLICT DO NOTHING;
