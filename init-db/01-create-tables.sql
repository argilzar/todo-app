-- Create todo table
CREATE TABLE IF NOT EXISTS todo (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the done column for faster filtering
CREATE INDEX IF NOT EXISTS idx_todo_done ON todo(done);

-- Create an index on the title column for faster sorting
CREATE INDEX IF NOT EXISTS idx_todo_title ON todo(title);

-- Insert some sample data for testing
INSERT INTO todo (id, title, description, done) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Welcome to your Todo App!', 'This is your first todo item. You can edit or delete it.', false),
('550e8400-e29b-41d4-a716-446655440001', 'Learn about Flowcore Pathways', 'Explore how event-driven architecture works with Flowcore.', false),
('550e8400-e29b-41d4-a716-446655440002', 'Try the frontend features', 'Test adding, editing, completing, and deleting todos.', true)
ON CONFLICT (id) DO NOTHING;