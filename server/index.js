import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/auth.js';
import progressRoutes      from './routes/progress.js';
import phraseRoutes        from './routes/phraseProgress.js';
import numberRoutes        from './routes/numberProgress.js';
import writingRoutes       from './routes/writingProgress.js';
import usersRoutes         from './routes/users.js';
import feedbackRoutes      from './routes/feedback.js';

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/progress',         requireAuth, progressRoutes);
app.use('/api/phrase-progress',  requireAuth, phraseRoutes);
app.use('/api/number-progress',  requireAuth, numberRoutes);
app.use('/api/writing-progress', requireAuth, writingRoutes);
app.use('/api/users',            requireAuth, usersRoutes);
app.use('/api/feedback',         feedbackRoutes); // no blanket requireAuth: uses optionalAuth internally

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
