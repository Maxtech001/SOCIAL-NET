CREATE TABLE IF NOT EXISTS events_attendance (
    eventId INTEGER, 
    userId INTEGER NOT NULL,  
    status TEXT NOT NULL DEFAULT "Invited", 
    FOREIGN KEY (userId) REFERENCES users (userId),
    FOREIGN KEY (eventId) REFERENCES events (eventId) ON DELETE CASCADE
);