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
    likesCount JSON,
    downloadsCount INT DEFAULT 0,
    submittedDatetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_studentId FOREIGN KEY (studentId) REFERENCES students(studentID),
    CONSTRAINT fk_refAdvisorId FOREIGN KEY (refAdvisorId) REFERENCES advisors(advisorID),
    CONSTRAINT fk_req1ReviewAdvisorId FOREIGN KEY (req1ReviewAdvisorId) REFERENCES advisors(advisorID),
    CONSTRAINT fk_req2ReviewAdvisorId FOREIGN KEY (req2ReviewAdvisorId) REFERENCES advisors(advisorID),
    CONSTRAINT fk_req3ReviewAdvisorId FOREIGN KEY (req3ReviewAdvisorId) REFERENCES advisors(advisorID),
    publishStatus ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'
);
`

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
  connection.query(createThesisTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating Thesis table:', err.message);
    } else {
      console.log('Thesis table ready');
    }
  });
});

module.exports = connection;
