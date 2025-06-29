-- +goose Up
-- Teacher に最後の会話IDを保持するカラムを追加
ALTER TABLE TEACHERS
ADD COLUMN last_conversation_id BIGINT;

-- +goose Down
ALTER TABLE TEACHERS
DROP COLUMN IF EXISTS last_conversation_id;
