-- +goose Up

ALTER TABLE TEACHERS ADD COLUMN last_conversation_id BIGINT;

-- Conversation management for chat interface
CREATE TABLE CONVERSATIONS (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    current_step VARCHAR(100) NOT NULL DEFAULT 'initial', -- 'initial', 'class_setup', 'survey_creation', 'constraint_setting', 'optimization', 'results'
    context_data JSONB DEFAULT '{}', -- Store conversation state and progress
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (teacher_id) REFERENCES TEACHERS(id) ON DELETE CASCADE
);

-- Chat messages within conversations
CREATE TABLE CHAT_MESSAGES (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Store additional data like file references, step indicators
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES CONVERSATIONS(id) ON DELETE CASCADE
);

-- File processing tracking for async uploads
CREATE TABLE FILE_PROCESSING_JOBS (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    processing_type VARCHAR(100) NOT NULL, -- 'csv_import', 'llm_conversion', 'validation'
    progress INTEGER NOT NULL DEFAULT 0, -- 0-100
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES CONVERSATIONS(id) ON DELETE CASCADE
);

ALTER TABLE matching_results
  ADD COLUMN constraints_json jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Indexes for performance
CREATE INDEX idx_conversations_teacher_id ON CONVERSATIONS(teacher_id);
CREATE INDEX idx_conversations_session_id ON CONVERSATIONS(session_id);
CREATE INDEX idx_conversations_active ON CONVERSATIONS(is_active);
CREATE INDEX idx_chat_messages_conversation_id ON CHAT_MESSAGES(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON CHAT_MESSAGES(created_at);
CREATE INDEX idx_file_processing_jobs_conversation_id ON FILE_PROCESSING_JOBS(conversation_id);
CREATE INDEX idx_file_processing_jobs_status ON FILE_PROCESSING_JOBS(status);

-- +goose Down
DROP INDEX IF EXISTS idx_file_processing_jobs_status;
DROP INDEX IF EXISTS idx_file_processing_jobs_conversation_id;
DROP INDEX IF EXISTS idx_chat_messages_created_at;
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_conversations_active;
DROP INDEX IF EXISTS idx_conversations_session_id;
DROP INDEX IF EXISTS idx_conversations_teacher_id;

ALTER TABLE matching_results DROP COLUMN IF EXISTS constraints_json;

DROP TABLE IF EXISTS FILE_PROCESSING_JOBS;
DROP TABLE IF EXISTS CHAT_MESSAGES;
DROP TABLE IF EXISTS CONVERSATIONS;

ALTER TABLE TEACHERS DROP COLUMN IF EXISTS last_conversation_id;
