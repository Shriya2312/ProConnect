import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postsRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(postsRoutes);
app.use(userRoutes);
app.use(express.static('uploads'));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process if connection fails
  }

    app.listen(5000, () => {
        console.log("Server is running on port 5000");
    });
}

connectDB();