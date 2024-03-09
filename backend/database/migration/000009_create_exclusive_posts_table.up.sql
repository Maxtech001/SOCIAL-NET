CREATE TABLE IF NOT EXISTS exclusive_posts (
    postId INTEGER NOT NULL,
    selectedUserId INTEGER NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts (postId) ON DELETE CASCADE,
    FOREIGN KEY (selectedUserId) REFERENCES users (userId) ON DELETE CASCADE
);