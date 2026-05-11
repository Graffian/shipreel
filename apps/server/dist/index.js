import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import express from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/upload';
import { projectRouter } from './routes/projects';
import { renderRouter } from './routes/render';
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
// Serve uploaded videos for Remotion's Chrome to access
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
// Serve rendered output videos
app.use('/output', express.static(path.resolve(__dirname, '../output')));
app.use('/api/upload', uploadRouter);
app.use('/api/projects', projectRouter);
app.use('/api/render', renderRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'shipreel-server' });
});
app.listen(PORT, () => {
    console.log(`ShipReel server running on port ${PORT}`);
    console.log(`  Uploads:  http://localhost:${PORT}/uploads/`);
    console.log(`  Output:   http://localhost:${PORT}/output/`);
    console.log(`  API:      http://localhost:${PORT}/api/health`);
});
