// db.js
require('dotenv').config(); // Load environment variables
const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database and create the users table if it doesn't exist
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');

  // Create the `users` table if it doesn't exist
  const createStudentsTableQuery = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      studentID VARCHAR(10) UNIQUE,
      firstName VARCHAR(50) NOT NULL,
      lastName VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      education VARCHAR(50) NOT NULL,
      isVerified ENUM('PENDING', 'APPROVED', 'DECLINED') DEFAULT 'PENDING',           
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );
  `;

  const createAdvisorsTableQuery = `
  CREATE TABLE IF NOT EXISTS advisors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advisorID VARCHAR(10) UNIQUE,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    education VARCHAR(50) NOT NULL,
    isVerified ENUM('PENDING', 'APPROVED', 'DECLINED') DEFAULT 'PENDING',            
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  );
`;

  const createDepartmentAdminTableQuery = `
CREATE TABLE IF NOT EXISTS departmentadmins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  departmentAdminID VARCHAR(10) UNIQUE,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  education VARCHAR(50) NOT NULL,
  isVerified ENUM('PENDING', 'APPROVED', 'DECLINED') DEFAULT 'PENDING',            
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
`;

  const createVisitorsTableQuery = `
CREATE TABLE IF NOT EXISTS visitors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitorID VARCHAR(10) UNIQUE,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  education VARCHAR(50) NOT NULL,            
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);
`;
  const createThesisTableQuery = `
CREATE TABLE IF NOT EXISTS thesis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesisId VARCHAR(10) UNIQUE,
    studentId VARCHAR(10) NOT NULL, -- Foreign key for student
    title VARCHAR(255) NOT NULL,
    abstract TEXT,
    refAdvisorId VARCHAR(10), -- Reference Advisor ID (Foreign key)
    refAdvisorAcceptance ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    refThesisID JSON,
    req1ReviewAdvisorId VARCHAR(10), -- First Review Advisor ID (Foreign key)
    req1ReviewStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    req2ReviewAdvisorId VARCHAR(10), -- Second Review Advisor ID (Foreign key)
    req2ReviewStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    req3ReviewAdvisorId VARCHAR(10), -- Third Review Advisor ID (Foreign key)
    req3ReviewStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    filePath VARCHAR(255), -- Path to the file (could be a URL or file name)
    likesCount INT DEFAULT 0,
    downloadsCount INT DEFAULT 0,
    submittedDatetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    thesisKeywords JSON,
    publishDatetime DATETIME,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_studentId FOREIGN KEY (studentId) REFERENCES students(studentID),
    CONSTRAINT fk_refAdvisorId FOREIGN KEY (refAdvisorId) REFERENCES advisors(advisorID),
    CONSTRAINT fk_req1ReviewAdvisorId FOREIGN KEY (req1ReviewAdvisorId) REFERENCES advisors(advisorID),
    CONSTRAINT fk_req2ReviewAdvisorId FOREIGN KEY (req2ReviewAdvisorId) REFERENCES advisors(advisorID),
    CONSTRAINT fk_req3ReviewAdvisorId FOREIGN KEY (req3ReviewAdvisorId) REFERENCES advisors(advisorID),
    publishStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'
);
`

  const createPasswordResetTableQuery = `
CREATE TABLE IF NOT EXISTS password_resets (    id INT AUTO_INCREMENT PRIMARY KEY,  
   email VARCHAR(255) NOT NULL,    
    otp VARCHAR(6) NOT NULL,    
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
       expired_at TIMESTAMP,  
           UNIQUE (email, otp) )
;
`
  connection.query(createPasswordResetTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating PasswordReset table:', err.message);
    } else {
      console.log('PasswordReset table ready');
    }
  });
  connection.query(createThesisTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating Thesis table:', err.message);
    } else {
      console.log('Thesis table ready');
    }
  });
  const notificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
    user_id VARCHAR(255) NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp DATETIME,
    PRIMARY KEY (user_id, message)

);
`

  const createThesisReviewAcceptanceTableQuery = `
CREATE TABLE IF NOT EXISTS ThesisReviewAcceptance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(10) NOT NULL, -- Foreign key for students
    thesisId VARCHAR(10) NOT NULL, -- Foreign key for thesis
    advisorId VARCHAR(10) NOT NULL, -- Foreign key for advisors
    date DATETIME DEFAULT CURRENT_TIMESTAMP, -- Date of review
    comment TEXT, -- Comments from the advisor

    -- Foreign Key Constraints
    CONSTRAINT fk_thesisReview_studentId FOREIGN KEY (studentId) REFERENCES students(studentID),
    CONSTRAINT fk_thesisReview_thesisId FOREIGN KEY (thesisId) REFERENCES thesis(thesisId),
    CONSTRAINT fk_thesisReview_advisorId FOREIGN KEY (advisorId) REFERENCES advisors(advisorID)
);
`
  const createThesisReviewDeclineTableQuery = `
CREATE TABLE IF NOT EXISTS ThesisReviewDecline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId VARCHAR(10) NOT NULL, -- Foreign key for students
  thesisId VARCHAR(10) NOT NULL, -- Foreign key for thesis
  advisorId VARCHAR(10) NOT NULL, -- Foreign key for advisors
  date DATETIME DEFAULT CURRENT_TIMESTAMP, -- Date of review
  comment TEXT, -- Comments from the advisor regarding the decline

  -- Foreign Key Constraints
  CONSTRAINT fk_thesisDecline_studentId FOREIGN KEY (studentId) REFERENCES students(studentID),
  CONSTRAINT fk_thesisDecline_thesisId FOREIGN KEY (thesisId) REFERENCES thesis(thesisId),
  CONSTRAINT fk_thesisDecline_advisorId FOREIGN KEY (advisorId) REFERENCES advisors(advisorID)
);
`

  // Kaustubh's Additions:
  const createContactUsQuery = `
CREATE TABLE IF NOT EXISTS contact_submissions  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    inquiry_type ENUM('thesis', 'technical', 'other') NOT NULL,
    thesis_id VARCHAR(50) DEFAULT NULL,
    brief_issue VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isAnswered ENUM('PENDING', 'ANSWERED') DEFAULT 'PENDING',
    answer TEXT DEFAULT NULL
);

`
  const createChatTableQuery = `CREATE TABLE IF NOT EXISTS chat (
    id INT AUTO_INCREMENT PRIMARY KEY,   
    fromUser VARCHAR(255) NOT NULL,      
    toUser VARCHAR(255) NOT NULL,        
    message VARCHAR(1000) NOT NULL,      
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
    user1readReceipt ENUM('PENDING', 'READ') DEFAULT 'PENDING',
    user2readReceipt ENUM('PENDING', 'READ') DEFAULT 'PENDING'
);`
  const createLikedTableQuery = `CREATE TABLE IF NOT EXISTS userhasliked (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    thesisId VARCHAR(255) NOT NULL,

    FOREIGN KEY (thesisId) REFERENCES thesis(thesisId)
);`

  const createCommentsTableQuery = `CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    thesisId VARCHAR(255) NOT NULL,
    commenttext TEXT NOT NULL,

    FOREIGN KEY (thesisId) REFERENCES thesis(thesisId)
  );`
  connection.query(createChatTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating chat table:', err.message);
    } else {
      console.log('Chat table ready');
    }
  });
  connection.query(createLikedTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Students table ready');
    }
  });

  connection.query(createContactUsQuery, (err, result) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Students table ready');
    }
  });

  connection.query(createCommentsTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Students table ready');
    }
  });


  // ... existing code ...
  const createThesisReferenceAcceptanceTableQuery = `
CREATE TABLE IF NOT EXISTS ThesisReferenceAcceptance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(10) NOT NULL, -- Foreign key for students
    thesisId VARCHAR(10) NOT NULL, -- Foreign key for thesis
    advisorId VARCHAR(10) NOT NULL, -- Foreign key for advisors
    date DATETIME DEFAULT CURRENT_TIMESTAMP, -- Date of reference acceptance
    comment TEXT, -- Comments from the advisor
    -- Foreign Key Constraints
    CONSTRAINT fk_referenceAcceptance_studentId FOREIGN KEY (studentId) REFERENCES students(studentID),
    CONSTRAINT fk_referenceAcceptance_thesisId FOREIGN KEY (thesisId) REFERENCES thesis(thesisId),
    CONSTRAINT fk_referenceAcceptance_advisorId FOREIGN KEY (advisorId) REFERENCES advisors(advisorID)
);
`
  // ... existing code ...
  const createThesisReferenceDeclineTableQuery = `
CREATE TABLE IF NOT EXISTS ThesisReferenceDecline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(10) NOT NULL, -- Foreign key for students
    thesisId VARCHAR(10) NOT NULL, -- Foreign key for thesis
    advisorId VARCHAR(10) NOT NULL, -- Foreign key for advisors
    date DATETIME DEFAULT CURRENT_TIMESTAMP, -- Date of reference decline
    comment TEXT, -- Comments from the advisor regarding the decline
    -- Foreign Key Constraints
    CONSTRAINT fk_referenceDecline_studentId FOREIGN KEY (studentId) REFERENCES students(studentID),
    CONSTRAINT fk_referenceDecline_thesisId FOREIGN KEY (thesisId) REFERENCES thesis(thesisId),
    CONSTRAINT fk_referenceDecline_advisorId FOREIGN KEY (advisorId) REFERENCES advisors(advisorID)
);
`
  const createMessagesTableQuery = `
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId VARCHAR(10) NOT NULL,
  receiverId VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('SENT', 'SEEN') DEFAULT 'SENT',
  FOREIGN KEY (senderId) REFERENCES students(studentID),
  FOREIGN KEY (receiverId) REFERENCES students(studentID)
);

`;


  connection.query(notificationsTable, (err, result) => {
    if (err) {
      console.error('Error creating notifications table:', err.message);
    } else {
      console.log('notifications table ready');
    }
  });



  connection.query(createStudentsTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Students table ready');
    }
  });
  connection.query(createAdvisorsTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating Advisors table:', err.message);
    } else {
      console.log('Advisors table ready');
    }
  });
  connection.query(createDepartmentAdminTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating Department Admins table:', err.message);
    } else {
      console.log('Department Admins table ready');
    }
  });
  connection.query(createVisitorsTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating Visitors table:', err.message);
    } else {
      console.log('Visitors table ready');
    }
  });

  connection.query(createThesisReviewAcceptanceTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating ThesisReviewAcceptance table:', err.message);
    } else {
      console.log('ThesisReviewAcceptance table ready');
    }
  });
  connection.query(createThesisReviewDeclineTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating ThesisReviewDecline table:', err.message);
    } else {
      console.log('ThesisReviewDecline table ready');
    }
  });
  connection.query(createThesisReferenceAcceptanceTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating ThesisReferenceAcceptance table:', err.message);
    } else {
      console.log('ThesisReferenceAcceptance table ready');
    }
  });
  connection.query(createThesisReferenceDeclineTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating ThesisReferenceDecline table:', err.message);
    } else {
      console.log('ThesisReferenceDecline table ready');
    }
  });
  connection.query(createMessagesTableQuery, (err) => {
    if (err) console.error('Error creating Messages table:', err.message);
    else console.log('Messages table ready');
  });
});




module.exports = connection;
