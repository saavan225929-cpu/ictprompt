const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas database
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (
      !mongoUri ||
      mongoUri.includes('YOUR_USERNAME') ||
      mongoUri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING')
    ) {
      console.warn('\n===============================================================');
      console.warn('⚠️  MONGODB ATLAS SETUP REQUIRED:');
      console.warn('   Please open backend/.env and replace MONGO_URI with your');
      console.warn('   actual MongoDB Atlas connection string.');
      console.warn('   Example:');
      console.warn('   MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/job_tracker?retryWrites=true&w=majority');
      console.warn('===============================================================\n');
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
