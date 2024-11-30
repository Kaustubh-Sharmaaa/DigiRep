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


const nodemailer = require('nodemailer');
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'digithesisrepo2@gmail.com',
    pass: 'eukx wnbc ivbu hxfv'
  }
});

app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;

  // Define the tables to search for the email
  const tables = ['students', 'visitors', 'departmentadmins', 'advisors'];

  // Function to search for the email in a specific table
  const findEmailInTable = (tableName) => {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM ${tableName} WHERE email = ?`, [email], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result.length > 0); // Return true if the email is found
      });
    });
  };

  // Search for the email in all tables sequentially
  const findEmail = async () => {
    for (const table of tables) {
      const exists = await findEmailInTable(table);
      if (exists) {
        return true; // Email found in one of the tables
      }
    }
    return false; // Email not found in any table
  };

  // Main logic to handle OTP generation and sending
  findEmail()
    .then((emailExists) => {
      if (!emailExists) {
        return res.status(404).send('Email not found in any user table');
      }

      // Generate a 6-digit OTP
      const otp = crypto.randomBytes(3).toString('hex').toUpperCase();

      // Calculate expiration time (15 minutes from now)
      const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Save OTP in the password_resets table with expiration time
      db.query(
        'INSERT INTO password_resets (email, otp, expired_at) VALUES (?, ?, ?)',
        [email, otp, expirationTime],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send('Error saving OTP');
          }

          // Send OTP email
          const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP for resetting your password is: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9;">
                    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #4CAF50; text-align: center;">Password Reset Request</h2>
                        <p>Dear User,</p>
                        <p>You requested to reset your password. Please use the following One-Time Password (OTP) to complete the process:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; background: #f4f4f4; padding: 10px 20px; border-radius: 8px; border: 1px solid #ddd;">
                                ${otp}
                            </span>
                        </div>
                        <p>Please note that this OTP is valid only for a limited time. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
                        <p style="text-align: center; margin-top: 20px;">Thank you,<br/><strong>Digital Thesis Repository System - Group 2</strong></p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message.</p>
                    </div>
                </div>
            `,
          };


          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              console.log(err);
              return res.status(500).send('Error sending email');
            }
            res.status(200).send('OTP sent to your email');
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Database error');
    });
});


// Verify OTP and reset password
app.post('/api/verify-otp', (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validate OTP
  db.query('SELECT * FROM password_resets WHERE email = ? AND otp = ?', [email, otp], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Database error');
    }

    if (result.length === 0) {
      return res.status(400).send('Invalid OTP');
    }
    // Update password in the users table (store as plain text)
    db.query('UPDATE students SET password = ? WHERE email = ?', [newPassword, email], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error updating password');
      }

      // Optionally delete the OTP entry after successful reset
      db.query('DELETE FROM password_resets WHERE email = ?', [email], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Error deleting OTP');
        }

        res.status(200).send('Password reset successfully');
      });
    });
  });
});
app.post('/api/reset-password', (req, res) => {
  const { email, newPassword } = req.body;

  // Define the tables to update the password
  const tables = ['students', 'visitors', 'departmentadmins', 'advisors'];

  // Function to update the password in a specific table
  const updatePasswordInTable = (tableName) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE ${tableName} SET password = ? WHERE email = ?`,
        [newPassword, email],
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result.affectedRows > 0); // Return true if a row was updated
        }
      );
    });
  };

  // Try updating the password in all tables sequentially
  const updatePassword = async () => {
    for (const table of tables) {
      const updated = await updatePasswordInTable(table);
      if (updated) {
        return true; // Password updated in one of the tables
      }
    }
    return false; // Password not updated in any table
  };

  // Main logic
  updatePassword()
    .then((passwordUpdated) => {
      if (!passwordUpdated) {
        return res.status(404).json({ message: 'Email not found in any user table' });
      }

      // Clean up OTP records after successful update
      db.query('DELETE FROM password_resets WHERE email = ?', [email], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: 'Failed to clean up OTP records' });
        }

        res.status(200).json({ message: 'Password reset successful' });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Database error' });
    });
});

app.post('/api/answer-inquiry', (req, res) => {
  const { id, firstName, lastName, email, type, reply } = req.body;
  const mailOptions = {
    from: 'digithesisrepo2@gmail.com',
    to: email,
    subject: `Reply to your Inquiry - ${id}, Type - ${type}`,
    text: `Hello ${firstName} ${lastName}, \n\nHere is your resolution: ${reply}\n\nThanks,Digital Thesis Repository System - Group2`,
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #4CAF50; text-align: center;">Digital Thesis Repository System</h2>
                    <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                    <p>We have reviewed your inquiry with the following details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Inquiry ID:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Inquiry Type:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${type}</td>
                        </tr>
                    </table>
                    <p><strong>Resolution:</strong></p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
                        ${reply}
                    </div>
                    <p>We hope this addresses your concern. If you have any further questions, feel free to reach out to us.</p>
                    <p style="text-align: center; margin-top: 20px;">Thank you,<br/><strong>Digital Thesis Repository System - Group 2</strong></p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message.</p>
                </div>
            </div>
        `,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error sending email');
    }
    const query = `
            UPDATE contact_submissions SET isAnswered='ANSWERED', answer=?
      WHERE id = ?;
        `;

    db.query(query, [reply, id], (err, result) => {
      if (err) {
        return res.json({ error: err.message });
      }
    });
    res.status(200).json({ message: 'Reply Email Sent' });
  });
});
app.post('/api/answer-other-inquiry', (req, res) => {
  const { id, firstName, lastName, email, type, reply } = req.body;
  const mailOptions = {
    from: 'digithesisrepo2@gmail.com',
    to: email,
    subject: `Reply to your Inquiry - ${id}, Type - ${type}`,
    text: `Hello ${firstName} ${lastName}, \n\nHere is your resolution: ${reply}\n\nThanks,Digital Thesis Repository System - Group2`,
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #4CAF50; text-align: center;">Digital Thesis Repository System</h2>
                    <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                    <p>We have reviewed your inquiry with the following details:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Inquiry ID:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Inquiry Type:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${type}</td>
                        </tr>
                    </table>
                    <p><strong>Resolution:</strong></p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
                        ${reply}
                    </div>
                    <p>We hope this addresses your concern. If you have any further questions, feel free to reach out to us.</p>
                    <p style="text-align: center; margin-top: 20px;">Thank you,<br/><strong>Digital Thesis Repository System - Group 2</strong></p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message.</p>
                </div>
            </div>
        `,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error sending email');
    }
    const query = `
            UPDATE contact_submissions SET isAnswered='ANSWERED', answer=?
      WHERE id = ?;
        `;

    db.query(query, [reply, id], (err, result) => {
      if (err) {
        return res.json({ error: err.message });
      }
    });
    res.status(200).json({ message: 'Reply Email Sent' });
  });
});
app.get('/api/users', (req, res) => {
  const excludeUserId = req.query.excludeUserId; // Get the userId to exclude from query parameters
console.log("idexc:",excludeUserId);
  // Define the query with the exclusion logic
  const query = `
    SELECT 
      firstname, 
      lastname, 
      email, 
      studentId AS userId 
    FROM 
      students 
    WHERE 
      isVerified = "APPROVED" AND studentId != ?

    UNION

    SELECT 
      firstname, 
      lastname, 
      email, 
      advisorId AS userId 
    FROM 
      advisors 
    WHERE 
      isVerified = "APPROVED" AND advisorId != ?

    UNION

    SELECT 
      firstname, 
      lastname, 
      email, 
      visitorId AS userId 
    FROM 
      visitors 
    WHERE 
      visitorId != ?;
  `;

  // Execute the query with the excludeUserId parameter
  db.query(query, [excludeUserId, excludeUserId, excludeUserId], (err, results) => {
    if (err) {
      console.error('Error retrieving users:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }

    // Send the combined results
    res.status(200).json(results);
  });
});

// Route to mark messages as READ
app.put('/api/messages/read', (req, res) => {
  const { fromUser, toUser } = req.body;

  // Ensure both fromUser and toUser are provided in the request body
  if (!fromUser || !toUser) {
    return res.status(400).json({ message: 'Both fromUser and toUser are required' });
  }

  // Update readReceipt for the appropriate field based on the direction of the message
  const query = `
    UPDATE chat
    SET 
      user1readReceipt = CASE 
        WHEN fromUser = ? AND toUser = ? THEN 'READ' 
        ELSE user1readReceipt 
      END,
      user2readReceipt = CASE 
        WHEN fromUser = ? AND toUser = ? THEN 'READ' 
        ELSE user2readReceipt 
      END
    WHERE 
      (fromUser = ? AND toUser = ?) OR 
      (fromUser = ? AND toUser = ?)
  `;

  db.query(
    query, 
    [fromUser, toUser, toUser, fromUser, fromUser, toUser, toUser, fromUser], 
    (err, result) => {
      if (err) {
        console.error('Error updating messages:', err);
        return res.status(500).json({ message: 'Failed to mark messages as READ' });
      }

      // If no rows were affected, no messages were found
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No messages found to mark as READ' });
      }

      // Successfully updated messages
      return res.status(200).json({ message: 'Messages marked as READ' });
    }
  );
});


app.post('/api/messages', (req, res) => {
  const { fromUser, toUser, message } = req.body;

  const query = `
      INSERT INTO chat (fromUser, toUser, message, user1readReceipt)
      VALUES (?, ?, ?,'READ')
  `;
  
  db.query(query, [fromUser, toUser, message], (err, result) => {
      if (err) {
          console.error('Error inserting message:', err.message);
          return res.status(500).json({ error: 'Failed to send message' });
      }
      res.status(200).json({ success: true, message: 'Message sent successfully' });
  });
});
app.get('/api/unreadMessages', (req, res) => {
  const { userId } = req.query; // `userId` is the logged-in user's ID

  const query = `
      SELECT 
          fromUser, 
          COUNT(*) AS unreadCount, 
          MAX(sentAt) AS latestSentAt 
      FROM chat 
      WHERE toUser = ? AND user2readReceipt = 'PENDING'
      GROUP BY fromUser
      ORDER BY latestSentAt DESC;
  `;

  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Error fetching unread messages:', err);
          res.status(500).json({ error: 'Failed to fetch unread messages' });
      } else {
          res.json(results);
      }
  });
});
app.get('/api/unreadMessagesCount', (req, res) => {
  const { userId } = req.query; 
  // Validate input
  if (!userId) {
      return res.status(400).json({ error: 'toUser is required' });
  }

  // SQL query to count unread messages for the user
  const query = `
      SELECT COUNT(*) AS unreadCount
      FROM chat
      WHERE toUser = ? AND user2readReceipt = 'PENDING';
  `;

  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Error fetching unread messages count:', err);
          return res.status(500).json({ error: 'Failed to fetch unread messages count' });
      }

      // Send the unread count as JSON response
      res.json({ unreadCount: results[0].unreadCount });
  });
});


app.get('/api/getmessages', (req, res) => {
  const { fromUser, toUser } = req.query; // Get the user IDs from the query params

  // Validate input
  if (!fromUser || !toUser) {
      return res.status(400).json({ error: 'Both fromUser and toUser are required' });
  }

  // SQL query to fetch messages between the two users
  const query = `
      SELECT * FROM chat
      WHERE (fromUser = ? AND toUser = ?) OR (fromUser = ? AND toUser = ?)
      ORDER BY sentAt ASC;
  `;

  db.query(query, [fromUser, toUser, toUser, fromUser], (err, results) => {
      if (err) {
          console.error('Error fetching messages:', err);
          return res.status(500).json({ error: 'Failed to fetch messages' });
      }

      res.json(results); // Send the messages as JSON response
  });
});

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

app.post('/api/thesis-review-acceptance', (req, res) => {
  const { studentId, thesisId, advisorId, date, comment } = req.body;

  // Step 1: Insert into ThesisReviewAcceptance
  const insertQuery = `
        INSERT INTO ThesisReviewAcceptance (studentId, thesisId, advisorId, date, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(insertQuery, [studentId, thesisId, advisorId, date, comment], (err, result) => {
    if (err) {
      console.error('Error inserting thesis review acceptance:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // Step 2: Select the matching advisor
    const selectQuery = `
            SELECT 
        thesisId,
        CASE 
            WHEN req1ReviewAdvisorId = advisorId THEN 'req1ReviewAdvisorId'
            WHEN req2ReviewAdvisorId = advisorId THEN 'req2ReviewAdvisorId'
            WHEN req3ReviewAdvisorId = advisorId THEN 'req3ReviewAdvisorId'
            ELSE NULL
        END AS matchingAdvisor
    FROM 
        thesis
        CROSS JOIN (SELECT ? AS advisorId) param
    WHERE 
        thesisId = ? AND
        (req1ReviewAdvisorId = advisorId OR 
         req2ReviewAdvisorId = advisorId OR 
         req3ReviewAdvisorId = advisorId);
        `;

    db.query(selectQuery, [advisorId, thesisId,], (err, results) => {
      if (err) {
        console.error('Error fetching thesis:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        const matchingAdvisor = results[0].matchingAdvisor; // Get the matching advisor column

        // Step 3: Prepare the update query based on the matching advisor
        let updateQuery = '';
        if (matchingAdvisor === 'req1ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req1ReviewStatus = 'APPROVED' WHERE thesisId = ?`;
        } else if (matchingAdvisor === 'req2ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req2ReviewStatus = 'APPROVED' WHERE thesisId = ?`;
        } else if (matchingAdvisor === 'req3ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req3ReviewStatus = 'APPROVED' WHERE thesisId = ?`;
        }

        // Step 4: Execute the update query if a matching advisor was found
        if (updateQuery) {
          db.query(updateQuery, [thesisId], (updateErr) => {
            if (updateErr) {
              console.error('Error updating thesis status:', updateErr.message);
              return res.status(500).json({ error: 'Database error during update' });
            }
            res.json({ message: 'Thesis status updated successfully', thesisId });
          });
        } else {
          res.json({ message: 'No matching advisor found, no status updated', thesisId });
        }
      } else {
        res.status(404).json({ message: 'No thesis found for the given advisor and thesis ID' });
      }
    });
  });
});


//Send notifications
app.post('/api/sendNotifications', (req, res) => {
  const { userId, message } = req.body;

  const query = `
    INSERT INTO notifications (user_id, message, timestamp, \`read\`)
    VALUES (?, ?, CURRENT_TIMESTAMP, false);
  `;

  db.query(query, [userId, message], (err, result) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: 'Notification sent successfully.', notificationId: result.insertId });
  });
});





// Fetch users to verify (students, advisors, etc.)
app.post('/api/updateProfile', (req, res) => {
  const userData = req.body;
  const keys = Object.keys(userData);
  const userid = userData[keys[1]]
  let query = "";
  const firstName = userData.firstName;
  const lastName = userData.lastName;
  const education = userData.education;
  // console.log("da".includes(userid));
  if (userid.includes("s")) {
    query = `UPDATE students
SET firstName = ?, lastName = ?, education = ?
WHERE studentId = ?;`
  }
  else if (userid.includes("da")) {
    query = `UPDATE departmentadmins
SET firstName = ?, lastName = ?, education = ?
WHERE departmentAdminId = ?;`
  }
  else if (userid.includes("v")) {
    query = `UPDATE visitors
SET firstName = ?, lastName = ?, education = ?
WHERE visitorId = ?;`
  }
  else if (userid.includes("a")) {
    query = `UPDATE advisors
SET firstName = ?, lastName = ?, education = ?
WHERE advisorId = ?;`
  }
  console.log(query)
  db.query(query, [firstName, lastName, education, userid], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: "update successful" }); // Send the user data as a JSON response
  });

});
app.delete('/api/delete-comment/:id', (req, res) => {
  const { id } = req.params; // Get the ID of the comment to delete
  const deleteQuery = "DELETE FROM comments WHERE id = ?";

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No comment found with the provided ID." });
    }
    // Successfully deleted the comment
    res.status(200).json({ message: "Comment deleted successfully." });
  });
});
app.get('/api/theses-approved/:userid', (req, res) => {

  const { userid } = req.params;
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
  SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.studentId = ?
  AND t.refAdvisorAcceptance = 'APPROVED'
      AND t.req1ReviewStatus = 'APPROVED'
      AND t.req2ReviewStatus = 'APPROVED'
      AND t.req3ReviewStatus = 'APPROVED'
      AND t.publishStatus = 'PENDING'
  ;
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
app.get('/api/theses-declined/:userid', (req, res) => {

  const { userid } = req.params;
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
  SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.studentId = ?
  AND (
      t.refAdvisorAcceptance = 'REJECTED'
      OR t.req1ReviewStatus = 'REJECTED'
      OR t.req2ReviewStatus = 'REJECTED'
      OR t.req3ReviewStatus = 'REJECTED'
  );
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
app.get('/api/theses-pending/:userid', (req, res) => {

  const { userid } = req.params;
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
  SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.studentId = ?
  AND (
      t.refAdvisorAcceptance = 'PENDING'
      OR t.req1ReviewStatus = 'PENDING'
      OR t.req2ReviewStatus = 'PENDING'
      OR t.req3ReviewStatus = 'PENDING'
  );
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
app.get('/api/theses-published/:userid', (req, res) => {

  const { userid } = req.params;
  // SQL query to get users whose status is "pending" or "not verified"
  const query = `
  SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.studentId = ?
  AND t.publishStatus = 'APPROVED' ;
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});
app.get('/api/notifications/:userid', (req, res) => {
  const { userid } = req.params;

  const query = `
    SELECT id, message, timestamp, \`read\`
    FROM notifications
    WHERE user_id = ?
    ORDER BY timestamp DESC;
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results); // Send the notifications as a JSON response
  });
});


//clear notifications
app.post('/api/clearNotifications/:userid', (req, res) => {

  const { userid } = req.params;

  const query = `
      DELETE from notifications WHERE user_id=?
  `;

  db.query(query, [userid], (err) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ message: "successful" }); // Send the user data as a JSON response
  });
});


// unread notifications

app.get('/api/unreadNotifications/:userId', (req, res) => {
  const { userId } = req.params;

  // Validate the input
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing user ID.' });
  }

  const query = `
    SELECT COUNT(*) AS unreadCount
    FROM notifications
    WHERE user_id = ? AND \`read\` = false;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(`Error fetching unread notifications for user_id: ${userId}`, err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`Unread notifications fetched for user_id: ${userId}`);
    res.status(200).json({ unreadCount: results[0].unreadCount });
  });
});


//read notifi

app.put('/api/markNotificationsRead/:userId', (req, res) => {
  const { userId } = req.params;

  // Validate input
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing user ID.' });
  }

  const query = `
    UPDATE notifications
    SET \`read\` = true
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error(`Error marking notifications as read for user_id: ${userId}`, err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`Marked ${result.affectedRows} notifications as read for user_id: ${userId}`);
    res.status(200).json({
      message: 'All notifications marked as read.',
      updatedCount: result.affectedRows,
    });
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

app.post('/api/publish-thesis/:thesisId', (req, res) => {
  const { thesisId } = req.params;

  // Step 1: Fetch thesis and student details
  const fetchDetailsQuery = `
    SELECT t.title, s.firstName, s.lastName 
    FROM thesis t 
    JOIN students s ON t.studentId = s.studentID 
    WHERE t.thesisId = ?;
  `;

  db.query(fetchDetailsQuery, [thesisId], (err, detailsResult) => {
    if (err) {
      return res.json({ error: `Failed to fetch details: ${err.message}` });
    }

    if (detailsResult.length === 0) {
      return res.json({ error: 'Thesis not found' });
    }

    const { title, firstName, lastName } = detailsResult[0];

    // Step 2: Update publish status
    const updateThesisQuery = `
      UPDATE thesis 
      SET publishStatus = 'Approved', publishDateTime = CURRENT_TIMESTAMP 
      WHERE thesisId = ?;
    `;

    db.query(updateThesisQuery, [thesisId], (err, updateResult) => {
      if (err) {
        return res.json({ error: `Failed to update thesis: ${err.message}` });
      }

      // Step 3: Insert into updates table
      const updateMessage = `${firstName} ${lastName} has published thesis - ${title}`;
      const insertUpdateQuery = `
        INSERT INTO updates (updateMessage, thesisId) 
        VALUES (?, ?);
      `;

      db.query(insertUpdateQuery, [updateMessage, thesisId], (err, insertResult) => {
        if (err) {
          return res.json({ error: `Failed to insert update: ${err.message}` });
        }

        console.log('Query result:', insertResult);
        res.json({ message: 'thesis published successfully' });
      });
    });
  });
});

app.get('/api/getLatestUpdates', (req, res) => {
 

  const query = `
      SELECT 
          * 
      FROM updates
      ORDER BY updateAt DESC;
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching latest updates:', err);
          res.status(500).json({ error: 'Failed to fetch latest updates' });
      } else {
          res.json(results);
      }
  });
});

app.get('/api/student-published-thesis-search/:id', (req, res) => {
  const { id } = req.params; // User's ID
  const { searchTerm } = req.query; // Search term from query parameter

  // Validate that the search term exists
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to allow partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve published theses for the given student ID with the search term
  const query = `
    SELECT *
    FROM thesis
    WHERE studentId = ? 
    AND publishStatus = 'APPROVED'
    AND (
        title LIKE ? 
        OR abstract LIKE ? 
        OR JSON_CONTAINS(thesisKeywords, JSON_ARRAY(?))
    )
  `;

  // Execute the query with the search term and student ID
  db.query(
    query,
    [id, likeSearchTerm, likeSearchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error retrieving published theses for user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Send the results as a JSON response
      res.json(results);
    }
  );
});

//pending

app.get('/api/student-pending-thesis-search/:id', (req, res) => {
  const { id } = req.params; // User's ID
  const { searchTerm } = req.query; // Search term from query parameter

  // Validate that the search term exists
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to allow partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve published theses for the given student ID with the search term
  const query = `
    SELECT *
    FROM thesis
    WHERE studentId = ? 
    AND (
    refAdvisorAcceptance = 'PENDING'
     OR req1ReviewStatus = 'PENDING'
     OR req2ReviewStatus = 'PENDING'
     OR req3ReviewStatus = 'PENDING')
    AND (
        title LIKE ? 
        OR abstract LIKE ? 
        OR JSON_CONTAINS(thesisKeywords, JSON_ARRAY(?))
    )
  `;

  // Execute the query with the search term and student ID
  db.query(
    query,
    [id, likeSearchTerm, likeSearchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error retrieving published theses for user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Send the results as a JSON response
      res.json(results);
    }
  );
});

//readytopublish
app.get('/api/student-approved-thesis-search/:id', (req, res) => {
  const { id } = req.params; // User's ID
  const { searchTerm } = req.query; // Search term from query parameter

  // Validate that the search term exists
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to allow partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve published theses for the given student ID with the search term
  const query = `
    SELECT *
    FROM thesis
    WHERE studentId = ? 
    AND (
    refAdvisorAcceptance = 'APPROVED'
     AND req1ReviewStatus = 'APPROVED'
     AND req2ReviewStatus = 'APPROVED'
     AND req3ReviewStatus = 'APPROVED')
    AND (
        title LIKE ? 
        OR abstract LIKE ? 
        OR JSON_CONTAINS(thesisKeywords, JSON_ARRAY(?))
    )
  `;

  // Execute the query with the search term and student ID
  db.query(
    query,
    [id, likeSearchTerm, likeSearchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error retrieving ready to publish theses for user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Send the results as a JSON response
      res.json(results);
    }
  );
});

//declined

app.get('/api/student-declined-thesis-search/:id', (req, res) => {
  const { id } = req.params; // User's ID
  const { searchTerm } = req.query; // Search term from query parameter

  // Validate that the search term exists
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to allow partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve published theses for the given student ID with the search term
  const query = `
    SELECT *
    FROM thesis
    WHERE studentId = ? 
    AND (
    refAdvisorAcceptance = 'REJECTED'
     OR req1ReviewStatus = 'REJECTED'
     OR req2ReviewStatus = 'REJECTED'
     OR req3ReviewStatus = 'REJECTED')
    AND (
        title LIKE ? 
        OR abstract LIKE ? 
        OR JSON_CONTAINS(thesisKeywords, JSON_ARRAY(?))
    )
  `;

  // Execute the query with the search term and student ID
  db.query(
    query,
    [id, likeSearchTerm, likeSearchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error retrieving published theses for user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Send the results as a JSON response
      res.json(results);
    }
  );
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
    thesisKeywords = [],
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
  const thesisKeywordsJSON = JSON.stringify(thesisKeywords);


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
          filePath,
          thesisKeywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    fileName,
    thesisKeywordsJSON
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
    console.log("check me:", req.body);
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
  fs.exists(filePath, (exists) => {
    if (!exists) {
      return res.status(404).json({ error: "File not found" });
    }

    // Increment download count in database
    const query = "UPDATE thesis SET downloadsCount = downloadsCount + 1 WHERE thesisId = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error updating download count:", err.message);
        // Consider how to handle this case, e.g., log the error and proceed
      }

      // Proceed to send the file
      res.download(filePath, `${id}.pdf`, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          return res.status(500).json({ error: "Error serving file" });
        }
      });
    });
  });
});

app.get('/api/viewfile/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(__dirname, 'uploads/', `${id}.pdf`);

  // Check if file exists
  fs.exists(filePath, (exists) => {
    if (!exists) {
      return res.status(404).json({ error: "File not found" });
    }

    // Proceed to send the file
    res.download(filePath, `${id}.pdf`, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res.status(500).json({ error: "Error serving file" });
      }
    });
  });
});

// Handle the file upload route
app.post('/api/upload-file', (req, res) => {
  console.log("first:", req.body);
  upload(req, res, (err) => {
    console.log("here:", req.body);
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
  console.log("ADid:", advisorId);
  const query = `
     SELECT *
        FROM thesis
        WHERE refAdvisorAcceptance = 'PENDING'
        AND refAdvisorId =?;

  `;

  db.query(query, [advisorId], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(results);
    res.json(results); // Send the user data as a JSON response
  });
});
// app.post('/api/pending-req-theses', (req, res) => {
//   const { advisorId } = req.body;

//   if (!advisorId) {
//     return res.status(400).json({ error: 'Advisor ID is required' });
//   }

//   // MySQL query to find theses with the advisorId in any of the specified columns
//   const query = `
//       SELECT *
//       FROM thesis
//       WHERE req1ReviewAdvisorId = ? OR req2ReviewAdvisorId = ? OR req3ReviewAdvisorId = ?
//   `;

//   db.query(query, [advisorId, advisorId, advisorId], (err, results) => {
//     if (err) {
//       console.error("Error retrieving theses:", err);
//       return res.status(500).json({ error: 'An error occurred while retrieving theses' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No theses found for the specified advisor' });
//     }

//     // Send the results back to the client
//     res.status(200).json(results);
//   });
// });

app.post('/api/pending-req-theses', (req, res) => {
  const { advisorId } = req.body;

  if (!advisorId) {
    return res.status(400).json({ error: 'Advisor ID is required' });
  }

  // MySQL query to find theses with the advisorId in any of the specified columns
  const query = `
      SELECT *
      FROM thesis
      WHERE
        ((req1ReviewAdvisorId = ? AND req1ReviewStatus = 'PENDING') OR
        (req2ReviewAdvisorId = ? AND req2ReviewStatus = 'PENDING') OR
        (req3ReviewAdvisorId = ? AND req3ReviewStatus = 'PENDING'))
        AND refAdvisorAcceptance = 'APPROVED';
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

app.get('/api/students-approved-search/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to include wildcards for partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve students who are approved and where any of the columns match the search term
  const query = `
      SELECT *
      FROM students
      WHERE isVerified = 'approved'
      AND (
          firstName LIKE ? 
          OR lastName LIKE ?
          OR email LIKE ?
      )
  `;

  // Execute the query with the search term bound to each LIKE condition
  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send the retrieved data as JSON response
    res.json(results);
  });
});

app.get('/api/students-declined-search/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to include wildcards for partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve students who are approved and where any of the columns match the search term
  const query = `
      SELECT *
      FROM students
      WHERE isVerified = 'declined'
      AND (
          firstName LIKE ? 
          OR lastName LIKE ?
          OR email LIKE ?
      )
  `;

  // Execute the query with the search term bound to each LIKE condition
  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send the retrieved data as JSON response
    res.json(results);
  });
});

app.get('/api/students-pending-search/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to include wildcards for partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve students who are approved and where any of the columns match the search term
  const query = `
      SELECT *
      FROM students
      WHERE isVerified = 'pending'
      AND (
          firstName LIKE ? 
          OR lastName LIKE ?
          OR email LIKE ?
      )
  `;

  // Execute the query with the search term bound to each LIKE condition
  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send the retrieved data as JSON response
    res.json(results);
  });
});
//here
app.get('/api/advisors-approved-search/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to include wildcards for partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve students who are approved and where any of the columns match the search term
  const query = `
      SELECT *
      FROM advisors
      WHERE isVerified = 'approved'
      AND (
          firstName LIKE ? 
          OR lastName LIKE ?
          OR email LIKE ?
      )
  `;

  // Execute the query with the search term bound to each LIKE condition
  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send the retrieved data as JSON response
    res.json(results);
  });
});

app.get('/api/advisors-declined-search/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to include wildcards for partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve students who are approved and where any of the columns match the search term
  const query = `
      SELECT *
      FROM advisors
      WHERE isVerified = 'declined'
      AND (
          firstName LIKE ? 
          OR lastName LIKE ?
          OR email LIKE ?
      )
  `;

  // Execute the query with the search term bound to each LIKE condition
  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send the retrieved data as JSON response
    res.json(results);
  });
});

app.get('/api/advisors-pending-search/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  // Format the search term to include wildcards for partial matching
  const likeSearchTerm = `%${searchTerm}%`;

  // MySQL query to retrieve students who are approved and where any of the columns match the search term
  const query = `
      SELECT *
      FROM advisors
      WHERE isVerified = 'pending'
      AND (
          firstName LIKE ? 
          OR lastName LIKE ?
          OR email LIKE ?
      )
  `;

  // Execute the query with the search term bound to each LIKE condition
  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send the retrieved data as JSON response
    res.json(results);
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


app.post('/api/thesis-review-acceptance', (req, res) => {
  const { studentId, thesisId, advisorId, date, comment } = req.body;

  // Step 1: Insert into ThesisReviewAcceptance
  const insertQuery = `
        INSERT INTO ThesisReviewAcceptance (studentId, thesisId, advisorId, date, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(insertQuery, [studentId, thesisId, advisorId, date, comment], (err, result) => {
    if (err) {
      console.error('Error inserting thesis review acceptance:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // Step 2: Select the matching advisor
    const selectQuery = `
            SELECT 
        thesisId,
        CASE 
            WHEN req1ReviewAdvisorId = advisorId THEN 'req1ReviewAdvisorId'
            WHEN req2ReviewAdvisorId = advisorId THEN 'req2ReviewAdvisorId'
            WHEN req3ReviewAdvisorId = advisorId THEN 'req3ReviewAdvisorId'
            ELSE NULL
        END AS matchingAdvisor
    FROM 
        thesis
        CROSS JOIN (SELECT ? AS advisorId) param
    WHERE 
        thesisId = ? AND
        (req1ReviewAdvisorId = advisorId OR 
         req2ReviewAdvisorId = advisorId OR 
         req3ReviewAdvisorId = advisorId);
        `;

    db.query(selectQuery, [advisorId, thesisId,], (err, results) => {
      if (err) {
        console.error('Error fetching thesis:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        const matchingAdvisor = results[0].matchingAdvisor; // Get the matching advisor column

        // Step 3: Prepare the update query based on the matching advisor
        let updateQuery = '';
        if (matchingAdvisor === 'req1ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req1ReviewStatus = 'APPROVED' WHERE thesisId = ?`;
        } else if (matchingAdvisor === 'req2ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req2ReviewStatus = 'APPROVED' WHERE thesisId = ?`;
        } else if (matchingAdvisor === 'req3ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req3ReviewStatus = 'APPROVED' WHERE thesisId = ?`;
        }

        // Step 4: Execute the update query if a matching advisor was found
        if (updateQuery) {
          db.query(updateQuery, [thesisId], (updateErr) => {
            if (updateErr) {
              console.error('Error updating thesis status:', updateErr.message);
              return res.status(500).json({ error: 'Database error during update' });
            }
            res.json({ message: 'Thesis status updated successfully', thesisId });
          });
        } else {
          res.json({ message: 'No matching advisor found, no status updated', thesisId });
        }
      } else {
        res.status(404).json({ message: 'No thesis found for the given advisor and thesis ID' });
      }
    });
  });
});

app.post('/api/thesis-review-decline', (req, res) => {
  const { studentId, thesisId, advisorId, date, comment } = req.body;

  // Step 1: Insert into ThesisReviewAcceptance
  const insertQuery = `
        INSERT INTO ThesisReviewDecline (studentId, thesisId, advisorId, date, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(insertQuery, [studentId, thesisId, advisorId, date, comment], (err, result) => {
    if (err) {
      console.error('Error inserting thesis review decline:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // Step 2: Select the matching advisor
    const selectQuery = `
            SELECT 
        thesisId,
        CASE 
            WHEN req1ReviewAdvisorId = advisorId THEN 'req1ReviewAdvisorId'
            WHEN req2ReviewAdvisorId = advisorId THEN 'req2ReviewAdvisorId'
            WHEN req3ReviewAdvisorId = advisorId THEN 'req3ReviewAdvisorId'
            ELSE NULL
        END AS matchingAdvisor
    FROM 
        thesis
        CROSS JOIN (SELECT ? AS advisorId) param
    WHERE 
        thesisId = ? AND
        (req1ReviewAdvisorId = advisorId OR 
         req2ReviewAdvisorId = advisorId OR 
         req3ReviewAdvisorId = advisorId);
        `;

    db.query(selectQuery, [advisorId, thesisId,], (err, results) => {
      if (err) {
        console.error('Error fetching thesis:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        const matchingAdvisor = results[0].matchingAdvisor; // Get the matching advisor column

        // Step 3: Prepare the update query based on the matching advisor
        let updateQuery = '';
        if (matchingAdvisor === 'req1ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req1ReviewStatus = 'REJECTED' WHERE thesisId = ?`;
        } else if (matchingAdvisor === 'req2ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req2ReviewStatus = 'REJECTED' WHERE thesisId = ?`;
        } else if (matchingAdvisor === 'req3ReviewAdvisorId') {
          updateQuery = `UPDATE thesis SET req3ReviewStatus = 'REJECTED' WHERE thesisId = ?`;
        }

        // Step 4: Execute the update query if a matching advisor was found
        if (updateQuery) {
          db.query(updateQuery, [thesisId], (updateErr) => {
            if (updateErr) {
              console.error('Error updating thesis status:', updateErr.message);
              return res.status(500).json({ error: 'Database error during update' });
            }
            res.json({ message: 'Thesis status updated successfully', thesisId });
          });
        } else {
          res.json({ message: 'No matching advisor found, no status updated', thesisId });
        }
      } else {
        res.status(404).json({ message: 'No thesis found for the given advisor and thesis ID' });
      }
    });
  });
});


app.post('/api/thesis-reference-acceptance', (req, res) => {
  const { studentId, thesisId, advisorId, date, comment } = req.body;

  // Step 1: Insert into ThesisReviewAcceptance
  const insertQuery = `
        INSERT INTO ThesisReferenceAcceptance (studentId, thesisId, advisorId, date, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(insertQuery, [studentId, thesisId, advisorId, date, comment], (err, result) => {
    if (err) {
      console.error('Error inserting thesis reference acceptance:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // Step 2: Select the matching thesis and update refAdvisorAcceptance
    const updateQuery = `
        UPDATE thesis
        SET refAdvisorAcceptance = 'APPROVED'
        WHERE refAdvisorId = ? AND thesisId = ?
    `;

    db.query(updateQuery, [advisorId, thesisId], (err, result) => {
      if (err) {
        console.error('Error updating thesis acceptance:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Thesis reference acceptance recorded and updated successfully' });
    });
  });
});

app.post('/api/thesis-reference-decline', (req, res) => {
  const { studentId, thesisId, advisorId, date, comment } = req.body;

  // Step 1: Insert into ThesisReviewAcceptance
  const insertQuery = `
        INSERT INTO ThesisReferenceDecline (studentId, thesisId, advisorId, date, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(insertQuery, [studentId, thesisId, advisorId, date, comment], (err, result) => {
    if (err) {
      console.error('Error inserting thesis reference decline:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // Step 2: Select the matching thesis and update refAdvisorAcceptance
    const updateQuery = `
        UPDATE thesis
        SET refAdvisorAcceptance = 'REJECTED'
        WHERE refAdvisorId = ? AND thesisId = ?
    `;

    db.query(updateQuery, [advisorId, thesisId], (err, result) => {
      if (err) {
        console.error('Error updating thesis decline:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Thesis reference decline recorded and updated successfully' });
    });
  });
});

app.post('/api/approved-ref-theses', (req, res) => {
  const { advisorId } = req.body;
  const query = `
     SELECT *
        FROM thesis
        WHERE refAdvisorAcceptance = 'APPROVED'
        AND refAdvisorId =?;
 
  `;

  db.query(query, [advisorId], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});

app.post('/api/approved-req-theses', (req, res) => {
  const { advisorId } = req.body;

  if (!advisorId) {
    return res.status(400).json({ error: 'Advisor ID is required' });
  }

  const query = `
      SELECT *
      FROM thesis
      WHERE
        ((req1ReviewAdvisorId = ? AND req1ReviewStatus = 'APPROVED') OR
        (req2ReviewAdvisorId = ? AND req2ReviewStatus = 'APPROVED') OR
        (req3ReviewAdvisorId = ? AND req3ReviewStatus = 'APPROVED'))
        AND refAdvisorAcceptance = 'APPROVED';
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

app.get('/api/searchThesis/:searchTerm', (req, res) => {
  const { searchTerm } = req.params;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const likeSearchTerm = `%${searchTerm}%`;

  const query = `SELECT t.*, s.firstName,s.lastName
  FROM
    thesis t
  INNER JOIN
    students s ON t.studentId = s.studentId where t.publishStatus='APPROVED' AND (t.title LIKE ? OR t.publishDatetime LIKE ? OR t.abstract LIKE ? OR t.thesisKeywords LIKE ?)`;

  db.query(query, [likeSearchTerm, likeSearchTerm, likeSearchTerm, likeSearchTerm], (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

app.get('/api/searchThesis/byTitle/:topic', (req, res) => {
  const { topic } = req.params;

  if (!topic) {
    return res.status(400).json({ error: 'Search term is required' });
  }


  const query = `SELECT t.*, s.firstName,s.lastName
  FROM
    thesis t
  INNER JOIN
    students s ON t.studentId = s.studentId where t.publishStatus='APPROVED' AND t.title = ? `;
  // const query = `SELECT * FROM thesis where publishStatus='APPROVED' AND title = ? `;

  db.query(query, [topic], (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});


app.get('/api/searchThesis/getTitle/:', (req, res) => {

  const query = `SELECT distinct title FROM thesis where publishStatus='APPROVED'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

app.get('/api/searchThesis/byAuthor/:author', (req, res) => {
  const { author } = req.params;

  if (!author) {
    return res.status(400).json({ error: 'Search term is required' });
  }


  const query = `SELECT t.*, s.firstName,s.lastName FROM thesis t JOIN students s ON t.studentId = s.studentID WHERE t.publishStatus = 'APPROVED' AND s.firstName = ?; `;

  // const query = `SELECT t.* FROM thesis t JOIN students s ON t.studentId = s.studentID WHERE t.publishStatus = 'APPROVED' AND s.firstName = ?; `;

  db.query(query, [author], (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});


app.get('/api/searchThesis/getAuthor/:', (req, res) => {

  // const query = `SELECT distinct studentId FROM thesis `;
  const query = `SELECT distinct s.firstName, s.studentID FROM students s JOIN thesis t ON s.studentID = t.studentId where publishStatus='APPROVED'`;


  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});


app.get('/api/searchThesis/byYear/:year', (req, res) => {
  const { year } = req.params;

  if (!year) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const query = ` SELECT t.*, s.firstName,s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId where t.publishStatus='APPROVED' AND YEAR(t.publishDatetime) = ? `;





  // const query = ` SELECT * FROM thesis where publishStatus='APPROVED' AND YEAR(publishDatetime) = ? `;

  db.query(query, [year], (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

app.get('/api/searchThesis/getYear/:', (req, res) => {

  const query = `SELECT distinct YEAR(publishDatetime) as year FROM thesis where publishStatus='APPROVED'`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});


app.get('/api/searchThesis/byKeyword/:thesisKeyword', (req, res) => {
  const { thesisKeyword } = req.params;

  if (!thesisKeyword) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const jsonFormattedKeyword = `"${thesisKeyword}"`;
  const query = `SELECT t.*, s.firstName,s.lastName FROM thesis t JOIN students s ON t.studentId = s.studentID WHERE JSON_CONTAINS(t.thesisKeywords, ?) AND t.publishStatus='APPROVED'`;

  db.query(query, [jsonFormattedKeyword], (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});


app.get('/api/searchThesis/getKeywords/:', (req, res) => {

  const query = `SELECT DISTINCT keywords
                  FROM thesis, 
                  JSON_TABLE(thesisKeywords, '$[*]' COLUMNS(keywords VARCHAR(255) PATH '$')) AS jt
                 WHERE keywords IS NOT NULL AND keywords != '' AND publishStatus='APPROVED';`

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving thesis:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);

  });
});


//Kaustubh's Additions:
app.post('/api/post-comment', (req, res) => {
  const { userId, name, thesisId, commenttext } = req.body;
  const query = "INSERT INTO comments (userId, name, thesisId, commenttext) VALUES (?, ?, ?, ?)";

  db.query(query, [userId, name, thesisId, commenttext], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Return the newly created comment
    const newComment = {
      id: result.insertId,
      userId,
      name,
      thesisId,
      commenttext
    };
    res.status(201).json(newComment);
  });
});

app.get('/api/get-comments/:thesisId', (req, res) => {
  const { thesisId } = req.params;
  const query = "SELECT * FROM comments WHERE thesisId = ?";

  db.query(query, [thesisId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


app.get('/api/gettopthesisdetails', (req, res) => {

  const query = `SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.publishStatus = 'APPROVED'
ORDER BY
  t.likesCount DESC
LIMIT 5;`;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  })
});

app.get('/api/gettopdownloadeddetails', (req, res) => {
  const query = `SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.publishStatus = 'APPROVED'
ORDER BY
  t.downloadsCount DESC
LIMIT 5;`;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  })
});
app.get('/api/getmostrecentdetails', (req, res) => {
  const query = `
  SELECT
    t.*,
    s.firstName,
    s.lastName
FROM
    thesis t
INNER JOIN
    students s ON t.studentId = s.studentId
WHERE
    t.publishStatus = 'APPROVED'
ORDER BY
    t.publishDateTime DESC
LIMIT 5;
`;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  })
});

app.post('/api/contact', (req, res) => {
  const { firstName, lastName, email, inquiryType, thesisId, briefIssue, message } = req.body;

  const allowedInquiryTypes = ['thesis', 'technical', 'other'];
  if (!allowedInquiryTypes.includes(inquiryType)) {
    return res.status(400).json({ message: 'Invalid inquiry type' });
  }

  const query = `
      INSERT INTO contact_submissions
      (first_name, last_name, email, inquiry_type, thesis_id, brief_issue, message)
      VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const queryParams = [
    firstName,
    lastName,
    email,
    inquiryType,
    inquiryType === 'thesis' ? thesisId : null,
    inquiryType === 'other' ? briefIssue : null,
    message,
  ];

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error inserting contact form data:', error);
      return res.status(500).json({ message: 'Error saving contact form data', error: error.message });
    }
    res.json({ message: 'Contact form submitted successfully', id: results.insertId });
  });
});
app.get('/api/theses-inquiries-pending', (req, res) => {


  const query = "SELECT * from contact_submissions where inquiry_type='thesis' and isAnswered='PENDING'";

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/theses-inquiries-answered', (req, res) => {


  const query = "SELECT * from contact_submissions where inquiry_type='thesis' and isAnswered='ANSWERED'";

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});
//other inquiries
app.get('/api/other-inquiries-pending', (req, res) => {


  const query = "SELECT * from contact_submissions where inquiry_type!='thesis' and isAnswered='PENDING'";

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/other-inquiries-answered', (req, res) => {


  const query = "SELECT * from contact_submissions where inquiry_type!='thesis' and isAnswered='ANSWERED'";

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});
app.get('/api/inquirydetail/:id', (req, res) => {

  id = req.params.id;
  const query = "SELECT * from contact_submissions where inquiry_type='thesis' and isAnswered='PENDING' and id=?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/otherinquirydetail/:id', (req, res) => {

  id = req.params.id;
  const query = "SELECT * from contact_submissions where inquiry_type!='thesis' and isAnswered='PENDING' and id=?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/otherinquiryanswereddetail/:id', (req, res) => {

  id = req.params.id;
  const query = "SELECT * from contact_submissions where inquiry_type!='thesis' and isAnswered='PENDING' and id=?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/inquiryanswereddetail/:id', (req, res) => {

  id = req.params.id;
  const query = "SELECT * from contact_submissions where isAnswered='ANSWERED' and id=?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/getauthorthesis/:authorid', (req, res) => {
  const authorId = req.params.authorid;

  const query = "SELECT thesisId, title from thesis where studentId = ? and publishStatus = 'APPROVED'";

  db.query(query, [authorId], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/get-references/:ids', (req, res) => {
  const ids = req.params.ids.split(',');
  const query = 'SELECT title FROM thesis WHERE thesisId IN (?)';
  db.query(query, [ids], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(results); // Send back an array of titles
  });
});



app.get('/api/view-thesis/:id', (req, res) => {
  id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'Invalid thesis ID' });
  }
  id = id.slice(1);
  console.log(id);
  const query = "SELECT t.thesisId, t.title, t.abstract, t.studentId, t.refThesisID, t.thesisKeywords, t.likesCount as likes, CONCAT(s.firstName, ' ', s.lastName) AS authors FROM thesis t JOIN students s ON t.studentId = s.studentID WHERE t.id = ?;";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results[0]); // Send the user data as a JSON response
  });
});

app.get('/api/gettopthesis', (req, res) => {
  const query = `
  SELECT
  t.*,
  s.firstName,
  s.lastName
FROM
  thesis t
INNER JOIN
  students s ON t.studentId = s.studentId
WHERE
  t.publishStatus = 'APPROVED'
ORDER BY
  t.likesCount DESC
LIMIT 5;`;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  })
});

app.get('/api/check-like/:thesisId/:userId', (req, res) => {
  const { thesisId, userId } = req.params;
  const query = 'SELECT 1 FROM userhasliked WHERE userId = ? AND thesisId = ?';

  db.query(query, [userId, thesisId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const liked = results.length > 0;
    res.json({ liked });
  });
});

app.post('/api/toggle-like', (req, res) => {
  const { userId, thesisId, liked } = req.body;

  if (liked) {
    // Attempt to insert a like entry and increment the likes count
    const insertQuery = 'INSERT INTO userhasliked (userId, thesisId) VALUES (?, ?) ON DUPLICATE KEY UPDATE thesisId=thesisId';
    db.query(insertQuery, [userId, thesisId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Increment likes count in thesis table
      const incrementLikesQuery = 'UPDATE thesis SET likesCount = likesCount + 1 WHERE thesisId = ?';
      db.query(incrementLikesQuery, [thesisId], (likesErr) => {
        if (likesErr) {
          return res.status(500).json({ error: likesErr.message });
        }
        res.json({ message: "Like added and count incremented successfully" });
      });
    });
  } else {
    // Attempt to delete a like entry and decrement the likes count
    const deleteQuery = 'DELETE FROM userhasliked WHERE userId = ? AND thesisId = ?';
    db.query(deleteQuery, [userId, thesisId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows > 0) {
        // Decrement likes count in thesis table
        const decrementLikesQuery = 'UPDATE thesis SET likesCount = GREATEST(likesCount - 1, 0) WHERE thesisId = ?;';
        db.query(decrementLikesQuery, [thesisId], (likesErr) => {
          if (likesErr) {
            return res.status(500).json({ error: likesErr.message });
          }
          res.json({ message: "Like removed and count decremented successfully" });
        });
      } else {
        res.json({ message: "No like found to remove, no count decremented" });
      }
    });
  }
});

app.get('/api/chat/users', (req, res) => {
  const query = `
    SELECT 
      CONCAT('s', id) AS id, firstName, lastName, email, 'Student' AS role, isVerified
    FROM students 
    WHERE isVerified = 'Approved'
    UNION
    SELECT 
      CONCAT('a', id) AS id, firstName, lastName, email, 'Advisor' AS role, isVerified
    FROM advisors 
    WHERE isVerified = 'Approved'
    UNION
    SELECT 
      CONCAT('da', id) AS id, firstName, lastName, email, 'Department Admin' AS role, NULL AS isVerified
    FROM departmentadmins
    ORDER BY role, firstName, lastName;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

app.get('/api/chat/users/order', (req, res) => {
  // Retrieve the dynamic user ID from the query parameter
  const userId = req.query.id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing required parameter: userId' });
  }

  const query = `
   WITH LatestMessages AS (
    SELECT 
        CASE 
            WHEN m.senderId = ? THEN m.receiverId
            ELSE m.senderId
        END AS userId,
        m.*
    FROM messages m
    WHERE ? IN (m.senderId, m.receiverId)
      AND m.timestamp = (
          SELECT MAX(m2.timestamp)
          FROM messages m2
          WHERE (m2.senderId = m.senderId AND m2.receiverId = m.receiverId)
             OR (m2.senderId = m.receiverId AND m2.receiverId = m.senderId)
      )
)
SELECT 
    u.*, 
    lm.* 
FROM users u
LEFT OUTER JOIN LatestMessages lm
ON u.userId = lm.userId
ORDER BY lm.timestamp DESC;
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// Fetch chat history between two users
app.get('/api/chat/history', (req, res) => {
  const { senderId, receiverId } = req.query;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Both senderId and receiverId are required' });
  }

  const query = `
    SELECT senderId, receiverId, message, timestamp, status
    FROM messages
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    ORDER BY timestamp;
  `;

  db.query(query, [senderId, receiverId, receiverId, senderId], (err, results) => {
    if (err) {
      console.error('Error fetching chat history:', err);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }
    res.json(results);
  });
});


// Send a new message
app.post('/api/chat/send', async (req, res) => {


  const { senderId, receiverId, message } = req.body;

  const query = `
     INSERT INTO messages (senderId, receiverId, message) VALUES (?, ?, ?)

  `;
  console.log("entered into server.js");
  console.log(senderId, receiverId, message);
  db.query(query, [senderId, receiverId, message], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    console.log(results);
    res.json(results); // Send the user data as a JSON response
  });
});


app.get('/api/published-theses', (req, res) => {
  const query = `
     SELECT *
     FROM thesis
     WHERE publishStatus = 'APPROVED';
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results); // Send the user data as a JSON response
  });
});






const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
