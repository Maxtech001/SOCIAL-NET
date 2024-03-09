CREATE TABLE IF NOT EXISTS group_invitations (
    groupId INTEGER NOT NULL,
    inviterId INTEGER NOT NULL,
    invitedUserId INTEGER NOT NULL,
    FOREIGN KEY (groupId) REFERENCES `groups` (groupId) ON DELETE CASCADE,
    FOREIGN KEY (inviterId) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (invitedUserId) REFERENCES users (userId) ON DELETE CASCADE
);