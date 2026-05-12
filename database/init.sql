CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(50) NOT NULL UNIQUE,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS household_members (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(household_id, user_id),
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS expense_participants (
    id SERIAL PRIMARY KEY,
    expense_id INT NOT NULL,
    user_id INT NOT NULL,
    share_amount DECIMAL(10,2) NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    assigned_to_user_id INT NULL,
    status VARCHAR(20) DEFAULT 'open',
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS groceries (
    id SERIAL PRIMARY KEY,
    household_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    quantity VARCHAR(100) NULL,
    added_by_user_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);
