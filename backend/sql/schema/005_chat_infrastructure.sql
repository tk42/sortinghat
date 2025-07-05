-- +goose Up

ALTER TABLE TEACHERS ADD COLUMN last_conversation_id BIGINT;

-- Conversation management for chat interface
CREATE TABLE CONVERSATIONS (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
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

ALTER TABLE matching_results
  ADD COLUMN constraints_json jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE TEACHERS ADD CONSTRAINT teachers_firebase_uid_key UNIQUE (firebase_uid);

-- Indexes for performance
CREATE INDEX idx_conversations_teacher_id ON CONVERSATIONS(teacher_id);
CREATE INDEX idx_conversations_session_id ON CONVERSATIONS(session_id);
CREATE INDEX idx_conversations_active ON CONVERSATIONS(is_active);
CREATE INDEX idx_chat_messages_conversation_id ON CHAT_MESSAGES(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON CHAT_MESSAGES(created_at);

-- +goose Down
DROP INDEX IF EXISTS idx_chat_messages_created_at;
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_conversations_active;
DROP INDEX IF EXISTS idx_conversations_session_id;
DROP INDEX IF EXISTS idx_conversations_teacher_id;

ALTER TABLE matching_results DROP COLUMN IF EXISTS constraints_json;

ALTER TABLE TEACHERS DROP CONSTRAINT IF EXISTS teachers_firebase_uid_key;

DROP TABLE IF EXISTS CHAT_MESSAGES;
DROP TABLE IF EXISTS CONVERSATIONS;

ALTER TABLE TEACHERS DROP COLUMN IF EXISTS last_conversation_id;
