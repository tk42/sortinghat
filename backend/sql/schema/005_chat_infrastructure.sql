-- +goose Up
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

-- Optimization job tracking
CREATE TABLE OPTIMIZATION_JOBS (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    survey_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    progress INTEGER NOT NULL DEFAULT 0, -- 0-100
    constraints_data JSONB NOT NULL,
    result_data JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES CONVERSATIONS(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES SURVEYS(id) ON DELETE SET NULL
);

-- Prompt versions for A/B testing and version control
CREATE TABLE PROMPT_VERSIONS (
    id BIGSERIAL PRIMARY KEY,
    prompt_type VARCHAR(100) NOT NULL, -- 'csv_conversion', 'constraint_generation', 'optimization_explanation'
    version VARCHAR(50) NOT NULL,
    template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}', -- success_rate, avg_processing_time, user_satisfaction
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (prompt_type, version)
);

-- Conversation step tracking for analytics
CREATE TABLE CONVERSATION_STEPS (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    step_data JSONB DEFAULT '{}',
    success BOOLEAN,
    error_message TEXT,
    FOREIGN KEY (conversation_id) REFERENCES CONVERSATIONS(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_conversations_teacher_id ON CONVERSATIONS(teacher_id);
CREATE INDEX idx_conversations_session_id ON CONVERSATIONS(session_id);
CREATE INDEX idx_conversations_active ON CONVERSATIONS(is_active);
CREATE INDEX idx_chat_messages_conversation_id ON CHAT_MESSAGES(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON CHAT_MESSAGES(created_at);
CREATE INDEX idx_file_processing_jobs_conversation_id ON FILE_PROCESSING_JOBS(conversation_id);
CREATE INDEX idx_file_processing_jobs_status ON FILE_PROCESSING_JOBS(status);
CREATE INDEX idx_optimization_jobs_conversation_id ON OPTIMIZATION_JOBS(conversation_id);
CREATE INDEX idx_optimization_jobs_status ON OPTIMIZATION_JOBS(status);
CREATE INDEX idx_prompt_versions_type_active ON PROMPT_VERSIONS(prompt_type, is_active);
CREATE INDEX idx_conversation_steps_conversation_id ON CONVERSATION_STEPS(conversation_id);

-- +goose Down
DROP INDEX IF EXISTS idx_conversation_steps_conversation_id;
DROP INDEX IF EXISTS idx_prompt_versions_type_active;
DROP INDEX IF EXISTS idx_optimization_jobs_status;
DROP INDEX IF EXISTS idx_optimization_jobs_conversation_id;
DROP INDEX IF EXISTS idx_file_processing_jobs_status;
DROP INDEX IF EXISTS idx_file_processing_jobs_conversation_id;
DROP INDEX IF EXISTS idx_chat_messages_created_at;
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_conversations_active;
DROP INDEX IF EXISTS idx_conversations_session_id;
DROP INDEX IF EXISTS idx_conversations_teacher_id;

DROP TABLE IF EXISTS CONVERSATION_STEPS;
DROP TABLE IF EXISTS PROMPT_VERSIONS;
DROP TABLE IF EXISTS OPTIMIZATION_JOBS;
DROP TABLE IF EXISTS FILE_PROCESSING_JOBS;
DROP TABLE IF EXISTS CHAT_MESSAGES;
DROP TABLE IF EXISTS CONVERSATIONS;