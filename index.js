import express from 'express';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import notesRoutes from './routes/note.route.js';
import todoRoutes from './routes/todo.route.js';
import treeRoutes from './routes/tree.route.js';
import calenderRoutes from './routes/calendar.route.js';
import mainRoutes from './routes/main.route.js';
import cookieParser from 'cookie-parser';
import connectMongoDB from './config/mongoose.js';
import helmet from "helmet";
import cors from "cors";
import { createTransporter } from './config/nodemailer.js';
import bodyParser from 'body-parser';


// Connect to MongoDB
connectMongoDB();

// Create a nodemailer transporter
createTransporter();

// Create an Express app
const app = express();


// Middleware
app.use(bodyParser.json({ limit: '20kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: 'https://voidnote-frontend.onrender.com/',
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


// Routes middleware
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use("/api/note", notesRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/tree", treeRoutes);
app.use("/api/calendar", calenderRoutes);

app.use("/api/main", mainRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const validation = err.validation || [];
  const data = err.data || [];
  return res.status(status).json({
    success: false,
    message,
    status,
    data,
    validation,
  });
});
