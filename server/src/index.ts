import express from 'express';
import cors from 'cors';
import scenarioRoutes from './routes/scenarios.js';
import defaultRoutes from './routes/defaults.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/scenarios', scenarioRoutes);
app.use('/api/defaults', defaultRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Vizor server running on port ${PORT}`);
});

export default app;
