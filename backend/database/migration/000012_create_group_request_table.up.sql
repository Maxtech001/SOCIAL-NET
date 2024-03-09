CREATE TABLE IF NOT EXISTS group_request (
    groupId INTEGER NOT NULL,
    requesterId INTEGER NOT NULL,
    FOREIGN KEY (groupId) REFERENCES `groups` (groupId) ON DELETE CASCADE,
    FOREIGN KEY (requesterId) REFERENCES users (userId) ON DELETE CASCADE
);