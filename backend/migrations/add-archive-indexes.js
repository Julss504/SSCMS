const dotenv = require('dotenv');
const path = require('path');
const dotenvResult = dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (dotenvResult.error) {
  console.error('Dotenv error:', dotenvResult.error);
  process.exit(1);
}

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');

const addArchiveIndexes = async () => {
  try {
    await connectDatabase();

    const db = mongoose.connection.db;

    // Add isArchived index to users collection
    try {
      const usersCollection = db.collection('users');
      await usersCollection.createIndex({ isArchived: 1 });
      console.log('Added isArchived index to users collection');
    } catch (err) {
      console.log('Users index may already exist:', err.message);
    }

    // Add isArchived index to students collection
    try {
      const studentsCollection = db.collection('students');
      await studentsCollection.createIndex({ isArchived: 1 });
      console.log('Added isArchived index to students collection');
    } catch (err) {
      console.log('Students index may already exist:', err.message);
    }

    // Add isArchived index to events collection
    try {
      const eventsCollection = db.collection('events');
      await eventsCollection.createIndex({ isArchived: 1 });
      console.log('Added isArchived index to events collection');
    } catch (err) {
      console.log('Events index may already exist:', err.message);
    }

    // Add isArchived index to attendance collection
    try {
      const attendanceCollection = db.collection('attendances');
      await attendanceCollection.createIndex({ isArchived: 1 });
      console.log('Added isArchived index to attendance collection');
    } catch (err) {
      console.log('Attendance index may already exist:', err.message);
    }

    console.log('Archive indexes migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addArchiveIndexes();