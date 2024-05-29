import express from 'express';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import notesRoutes from './routes/note.route.js';
import cookieParser from 'cookie-parser';
import connectMongoDB from './config/mongoose.js';
import helmet from "helmet";
import cors from "cors";


// Connect to MongoDB
connectMongoDB();

// Create an Express app
const app = express();


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Start the server
app.listen(3000 || process.env.PORT, () => {
  console.log('Server listening on port 3000');
});

// Test route
app.get('/test', (req, res) => {
  return res.json({
    success: true,
    message: 'Test successful!',
  });
});


// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use("/api/note", notesRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const validation = err.validation || [];
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    validation,
  });
});
