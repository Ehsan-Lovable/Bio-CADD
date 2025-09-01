-- Create upcoming_sessions table for managing live and recorded course sessions
CREATE TABLE IF NOT EXISTS upcoming_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    course_type TEXT NOT NULL CHECK (course_type IN ('live', 'recorded')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    instructor TEXT NOT NULL,
    seats INTEGER,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration TEXT NOT NULL,
    sessions_per_week INTEGER,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upcoming_sessions_course_type ON upcoming_sessions(course_type);
CREATE INDEX IF NOT EXISTS idx_upcoming_sessions_start_date ON upcoming_sessions(start_date);
CREATE INDEX IF NOT EXISTS idx_upcoming_sessions_status ON upcoming_sessions(status);
CREATE INDEX IF NOT EXISTS idx_upcoming_sessions_course_id ON upcoming_sessions(course_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_upcoming_sessions_updated_at 
    BEFORE UPDATE ON upcoming_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE upcoming_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage all sessions
CREATE POLICY "Admins can manage all upcoming sessions" ON upcoming_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for users to view upcoming sessions
CREATE POLICY "Users can view upcoming sessions" ON upcoming_sessions
    FOR SELECT USING (true);

-- Insert some sample data
INSERT INTO upcoming_sessions (
    title, 
    course_id, 
    course_type, 
    start_date, 
    end_date, 
    instructor, 
    seats, 
    price, 
    description, 
    topics, 
    level, 
    duration, 
    sessions_per_week, 
    status
) VALUES 
(
    'Advanced Bioinformatics Analysis',
    (SELECT id FROM courses LIMIT 1),
    'live',
    '2024-02-15T10:00:00Z',
    '2024-02-15T12:00:00Z',
    'Dr. Sarah Chen',
    25,
    299.00,
    'Master advanced genomic data analysis techniques with hands-on projects.',
    ARRAY['Genomic Analysis', 'Statistical Methods', 'Data Visualization'],
    'advanced',
    '8 weeks',
    2,
    'upcoming'
),
(
    'Python for Bioinformatics',
    (SELECT id FROM courses LIMIT 1),
    'recorded',
    '2024-02-25T00:00:00Z',
    NULL,
    'Dr. Alex Thompson',
    NULL,
    199.00,
    'Complete Python programming course designed specifically for biologists.',
    ARRAY['Python Basics', 'BioPython', 'Data Processing'],
    'beginner',
    '6 weeks',
    NULL,
    'upcoming'
);
