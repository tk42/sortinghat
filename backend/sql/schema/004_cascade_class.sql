-- +goose Up
BEGIN;

-- クラス削除時に紐づくアンケートを自動削除
ALTER TABLE surveys
  DROP CONSTRAINT IF EXISTS surveys_class_id_fkey,
  ADD CONSTRAINT surveys_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

-- アンケート削除時に紐づく学生の回答を自動削除
ALTER TABLE student_preferences
  DROP CONSTRAINT IF EXISTS student_preferences_survey_id_fkey,
  ADD CONSTRAINT student_preferences_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;

-- 学生削除時に紐づく回答を自動削除
ALTER TABLE student_preferences
  DROP CONSTRAINT IF EXISTS student_preferences_student_id_fkey,
  ADD CONSTRAINT student_preferences_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

-- 回答削除時に紐づくNG指定を自動削除
ALTER TABLE student_dislikes
  DROP CONSTRAINT IF EXISTS student_dislikes_preference_id_fkey,
  ADD CONSTRAINT student_dislikes_preference_id_fkey FOREIGN KEY (preference_id) REFERENCES student_preferences(id) ON DELETE CASCADE;

-- 学生削除時に紐づくNG指定を自動削除
ALTER TABLE student_dislikes
  DROP CONSTRAINT IF EXISTS student_dislikes_student_id_fkey,
  ADD CONSTRAINT student_dislikes_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

-- クラス削除時に学生を自動削除
ALTER TABLE students
  DROP CONSTRAINT IF EXISTS students_class_id_fkey,
  ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

COMMIT;

-- +goose Down
BEGIN;

-- surveys 外部キーをCASCADEなしに戻す
ALTER TABLE surveys
  DROP CONSTRAINT IF EXISTS surveys_class_id_fkey,
  ADD CONSTRAINT surveys_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id);

-- student_preferences.survey_id 外部キーをCASCADEなしに戻す
ALTER TABLE student_preferences
  DROP CONSTRAINT IF EXISTS student_preferences_survey_id_fkey,
  ADD CONSTRAINT student_preferences_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES surveys(id);

-- student_preferences.student_id 外部キーをCASCADEなしに戻す
ALTER TABLE student_preferences
  DROP CONSTRAINT IF EXISTS student_preferences_student_id_fkey,
  ADD CONSTRAINT student_preferences_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);

-- student_dislikes.preference_id 外部キーをCASCADEなしに戻す
ALTER TABLE student_dislikes
  DROP CONSTRAINT IF EXISTS student_dislikes_preference_id_fkey,
  ADD CONSTRAINT student_dislikes_preference_id_fkey FOREIGN KEY (preference_id) REFERENCES student_preferences(id);

-- student_dislikes.student_id 外部キーをCASCADEなしに戻す
ALTER TABLE student_dislikes
  DROP CONSTRAINT IF EXISTS student_dislikes_student_id_fkey,
  ADD CONSTRAINT student_dislikes_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id);

-- students.class_id 外部キーをCASCADEなしに戻す
ALTER TABLE students
  DROP CONSTRAINT IF EXISTS students_class_id_fkey,
  ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id);

COMMIT;
