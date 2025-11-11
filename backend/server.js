import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { connectDB } from './utils/db.js';
import { createIndexes } from './utils/createIndexes.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.set('trust proxy', 1);

// CORS must allow the exact frontend origin and credentials
app.use(
  cors({
    origin: 'http://localhost:3000', // your React dev server
    credentials: true, // allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
  })
);

// Handle preflight quickly (helps some proxies/tools)
app.options(
  '*',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my-super-secret-session-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ServiceHub API is running' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await createIndexes();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
