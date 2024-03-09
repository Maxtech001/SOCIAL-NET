CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT,
    dateOfBirth DATE NOT NULL,
    password TEXT NOT NULL,
    profilePic TEXT DEFAULT "defaultProfilePic.png",
    aboutMe TEXT,
    public BOOLEAN DEFAULT TRUE,
    online BOOLEAN DEFAULT FALSE
);