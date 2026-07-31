-- Interview Simulator Database Schema

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    resume_text TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    score INTEGER,
    rating TEXT,
    feedback TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Interview questions table
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    category TEXT,
    difficulty TEXT,
    order_num INTEGER,
    model_answer TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interview answers table
CREATE TABLE IF NOT EXISTS interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    question_id UUID REFERENCES interview_questions(id) ON DELETE CASCADE,
    answer TEXT,
    score INTEGER,
    feedback TEXT,
    answered_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id ON interview_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id ON interview_answers(question_id);
