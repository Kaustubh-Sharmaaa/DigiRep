require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const session = require('express-session');
const app = express();
app.use(express.json());
app.use(cors());
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Helper function to generate prefixed ID
function generatePrefixedId(prefix, id) {
  return `${prefix}${id}`;
}

// Register route
app.post('/api/register', (req, res) => {
  const { firstName, lastName, email, rpassword, role, education } = req.body;

  // Define table and prefix based on role
  let tableName, prefix;
  if (role === "Student") {
    tableName = "students";
    prefix = "s";
  } else if (role === "Advisor") {
    tableName = "advisors";
    prefix = "a";
  } else if (role === "Department Admin") {
    tableName = "departmentadmins";
    prefix = "da";
  } else if (role === "Visitor") {
    tableName = "visitors";
    prefix = "v";
  } else {
    return res.json({ error: "Invalid role" });
  }

  // Check all tables for duplicate email
  const tables = ['students', 'advisors', 'departmentadmins', 'visitors'];
  let emailExists = false;

  const checkEmail = async () => {
    for (const tbl of tables) {
      const [results] = await db.promise().query(`SELECT * FROM ${tbl} WHERE email = ?`, [email]);
      if (results.length > 0) {
        emailExists = true;
        break;
      }
    }
  };

  checkEmail().then(() => {
    if (emailExists) {
      return res.json('Email is already registered in the system.');
    } else {
      // Insert the user into the appropriate table
      db.query(
        `INSERT INTO ${tableName} (firstName, lastName, email, password, role, education) VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, rpassword, role, education],
        (err, result) => {
          if (err) {
            return res.json({ error: err.message });
          }

          // Generate prefixed ID based on the auto-incremented ID
          const prefixedId = generatePrefixedId(prefix, result.insertId);
          db.query(
            `UPDATE ${tableName} SET ${tableName.slice(0, -1)}ID = ? WHERE id = ?`,
            [prefixedId, result.insertId],
            (updateErr) => {
              if (updateErr) {
                return res.json({ error: updateErr.message });
              }
              return res.json('Success');
            }
          );
        }
      );
    }
  }).catch(err => {
    return res.json({ error: err.message });
  });
});

// Login route
app.post('/api/login', (req, res) => {
  const { lemail, lpassword } = req.body;
  const tables = ['students', 'advisors', 'departmentadmins', 'visitors'];
  let found = false;

  tables.forEach((table, index) => {
    db.query(`SELECT * FROM ${table} WHERE email = ?`, [lemail], (err, results) => {
      if (err) {
        if (!found) res.json({ error: err.message });
        return;
      }

      if (results.length > 0 && !found) {
        found = true;
        const user = results[0];
        if (user.password === lpassword) {
          req.session.user = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
          console.log("session val", req.session.user);
          return res.json(user); // Send user details back to frontend
        } else {
          return res.json('Wrong password');
        }
      } else if (index === tables.length - 1 && !found) {
        return res.json('No records found!');
      }
    });
  });
});

// Fetch users to verify (students, advisors, etc.)
app.get('/api/students-pending', (req, res) => {
  
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
      SELECT * FROM students WHERE isVerified = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});

// Fetch users to verify (students, advisors, etc.)
app.get('/api/students-declined', (req, res) => {
 
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
      SELECT * FROM students WHERE isVerified = 'Declined'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});

// Fetch users to verify (students, advisors, etc.)
app.get('/api/students-approved', (req, res) => {
  
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
      SELECT * FROM students WHERE isVerified = 'Approved'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
// Approve a user
app.post('/api/approve-student/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'approved'
  const query = `
      UPDATE students SET isVerified = 'Approved' WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(userId);
    console.log('Query result:', result);
    res.json({ message: 'Student Approved successfully' });
  });
});
// Decline a user
app.post('/api/decline-student/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'declined'
  const query = `
      UPDATE students SET isVerified = 'Declined' WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: 'Student declined successfully' });
  });
});
// Approve a user
app.post('/api/pending-student/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'approved'
  const query = `
      UPDATE students SET isVerified = 'Pending' WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(userId);
    console.log('Query result:', result);
    res.json({ message: 'Student Pending successfully' });
  });
});

// Approve a user
app.post('/api/delete-student/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'approved'
  const query = `
      DELETE FROM students WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(userId);
    console.log('Query result:', result);
    res.json({ message: 'Student Deleted successfully' });
  });
});

// Fetch users to verify (students, advisors, etc.)
app.get('/api/advisors-pending', (req, res) => {
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
      SELECT * FROM advisors WHERE isVerified = 'Pending'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
// Fetch users to verify (students, advisors, etc.)
app.get('/api/advisors-approved', (req, res) => {
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
      SELECT * FROM advisors WHERE isVerified = 'Approved'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
// Fetch users to verify (students, advisors, etc.)
app.get('/api/advisors-declined', (req, res) => {
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
      SELECT * FROM advisors WHERE isVerified = 'Declined'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
// Approve a user
app.post('/api/approve-advisor/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'approved'
  const query = `
      UPDATE advisors SET isVerified = 'Approved' WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(userId);
    console.log('Query result:', result);
    res.json({ message: 'Advisor Approved successfully' });
  });
});
// Decline a user
app.post('/api/decline-advisor/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'declined'
  const query = `
      UPDATE advisors SET isVerified = 'Declined' WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: 'Advisor declined successfully' });
  });
});
// Decline a user
app.post('/api/pending-advisor/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'declined'
  const query = `
      UPDATE advisors SET isVerified = 'Pending' WHERE id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: 'Advisor declined successfully' });
  });
});

// Decline a user
app.post('/api/delete-advisor/:userId', (req, res) => {
  const { userId } = req.params;

  // Update status of user to 'declined'
  const query = `
      DELETE FROM advisors WHERE id = ?;

  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: 'Advisor declined successfully' });
  });
});


app.get('/api/approved-theses', (req, res) => {
  const query = `
     SELECT *
        FROM thesis
        WHERE refAdvisorAcceptance = 'APPROVED'
        AND req1ReviewStatus = 'APPROVED'
        AND req2ReviewStatus = 'APPROVED'
        AND req3ReviewStatus = 'APPROVED';

  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
app.post('/api/submit-thesis', (req, res) => {
  const {
      title,
      abstract,
      studentId,
      refadvisorIds,
      requestedAdvisorIds = [],
      referencedThesisIds = [],
      fileName
  } = req.body;

  // Set dynamic values for advisor IDs based on requestedAdvisorIds
  const req1ReviewAdvisorId = requestedAdvisorIds[0] || null;
  const req2ReviewAdvisorId = requestedAdvisorIds[1] || null;
  const req3ReviewAdvisorId = requestedAdvisorIds[2] || null;

  // Convert referencedThesisIds to JSON format
  const refThesisID = JSON.stringify(referencedThesisIds);

  // Insert query with placeholders
  const insertQuery = `
      INSERT INTO thesis (
          studentId,
          title,
          abstract,
          refAdvisorId,
          refThesisID,
          req1ReviewAdvisorId,
          req2ReviewAdvisorId,
          req3ReviewAdvisorId,
          filePath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Execute the insert query
  db.query(insertQuery, [
      studentId,
      title,
      abstract,
      refadvisorIds,
      refThesisID,
      req1ReviewAdvisorId,
      req2ReviewAdvisorId,
      req3ReviewAdvisorId,
      fileName
  ], (error, results) => {
      if (error) {
          console.error('Error inserting thesis:', error);
          return res.status(500).json({ message: 'Error inserting thesis' });
      }

      // Update thesisId to be 't' + id (concatenated string)
      const updateQuery = `
          UPDATE thesis
          SET thesisId = CONCAT('t', id)
          WHERE id = ?
      `;

      // Execute the update query
      db.query(updateQuery, [results.insertId], (updateError) => {
          if (updateError) {
              console.error('Error updating thesisId:', updateError);
              return res.status(500).json({ message: 'Error updating thesisId' });
          }

          // Send success response
          res.json({
              message: 'Thesis submitted successfully!',
              thesisId: `t${results.insertId}`
          });
      });
  });
});
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Define storage options with a destination path and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where files will be saved
    const uploadDir = 'uploads/'; 
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create the folder if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log("check me:",req.body);
    cb(null, file.originalname);
  }
});

// Set up the file upload limits (300MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
}).single('file');
app.get('/api/download/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(__dirname, 'uploads/', `${id}.pdf`);

  // Check if file exists
  res.download(filePath, `${id}.pdf`, (err) => {
      if (err) {
          console.error("Error downloading file:", err);
          res.status(404).json({ error: "File not found" });
      }
  });
});
// Handle the file upload route
app.post('/api/upload-file', (req, res) => {
  console.log("first:",req.body);
  upload(req, res, (err) => {
    console.log("here:",req.body);
    if (err) {
      // Handle multer errors like file size or file type issues
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 300MB.' });
      } else {
        return res.status(500).json({ message: 'File upload failed.', error: err.message });
      }
    }
    if (req.file) {
      
      // Respond with success and the uploaded file details
      return res.status(200).json({
        message: 'File uploaded successfully!',
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          path: req.file.path, // Path where the file is stored on the server
          size: req.file.size, // Size of the uploaded file
        }
      });
    } else {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
  });
});

app.post('/api/pending-ref-theses', (req, res) => {
  const { advisorId } = req.body;
  console.log("ADid:",advisorId);
  const query = `
     SELECT *
        FROM thesis
        WHERE refAdvisorAcceptance = 'PENDING'
        AND refAdvisorId =?;

  `;

  db.query(query,[advisorId], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(results);
    res.json(results); // Send the user data as a JSON response
  });
});
app.post('/api/pending-req-theses', (req, res) => {
  const { advisorId } = req.body;

  if (!advisorId) {
      return res.status(400).json({ error: 'Advisor ID is required' });
  }

  // MySQL query to find theses with the advisorId in any of the specified columns
  const query = `
      SELECT *
      FROM thesis
      WHERE req1ReviewAdvisorId = ? OR req2ReviewAdvisorId = ? OR req3ReviewAdvisorId = ?
  `;

  db.query(query, [advisorId, advisorId, advisorId], (err, results) => {
      if (err) {
          console.error("Error retrieving theses:", err);
          return res.status(500).json({ error: 'An error occurred while retrieving theses' });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'No theses found for the specified advisor' });
      }

      // Send the results back to the client
      res.status(200).json(results);
  });
});
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Optional: Clear the session cookie
    res.status(200).json({ message: 'Logout successful' });
  });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
