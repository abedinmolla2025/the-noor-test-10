-- Add multi-language support to quiz_questions table
ALTER TABLE public.quiz_questions 
ADD COLUMN question_bn TEXT,
ADD COLUMN question_en TEXT,
ADD COLUMN options_bn JSONB,
ADD COLUMN options_en JSONB;

-- Migrate existing data to English fields
UPDATE public.quiz_questions 
SET question_en = question,
    options_en = options
WHERE question_en IS NULL;

-- Add comment explaining the language fields
COMMENT ON COLUMN public.quiz_questions.question IS 'Legacy question field (deprecated, use question_en or question_bn)';
COMMENT ON COLUMN public.quiz_questions.options IS 'Legacy options field (deprecated, use options_en or options_bn)';
COMMENT ON COLUMN public.quiz_questions.question_bn IS 'Question text in Bangla';
COMMENT ON COLUMN public.quiz_questions.question_en IS 'Question text in English';
COMMENT ON COLUMN public.quiz_questions.options_bn IS 'Answer options array in Bangla (4 items)';
COMMENT ON COLUMN public.quiz_questions.options_en IS 'Answer options array in English (4 items)';