const dotenv = require('dotenv');
const path = require('path');
const dotenvResult = dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (dotenvResult.error) {
  console.error('Dotenv error:', dotenvResult.error);
  process.exit(1);
}
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const mongoose = require('mongoose');
const connectDatabase = require('../config/database');

const fixNullUsernameIndex = async () => {
  try {
    await connectDatabase();
    
    // Drop the username_1 index since it conflicts with null values
    // and the field doesn't exist in the schema
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    try {
      await collection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } catch (err) {
      console.log('Index may not exist or already dropped:', err.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

fixNullUsernameIndex();