"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const upload_1 = require("./routes/upload");
const projects_1 = require("./routes/projects");
const render_1 = require("./routes/render");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve uploaded videos for Remotion's Chrome to access
app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, '../uploads')));
// Serve rendered output videos
app.use('/output', express_1.default.static(path_1.default.resolve(__dirname, '../output')));
app.use('/api/upload', upload_1.uploadRouter);
app.use('/api/projects', projects_1.projectRouter);
app.use('/api/render', render_1.renderRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'shipreel-server' });
});
app.listen(PORT, () => {
    console.log(`ShipReel server running on port ${PORT}`);
    console.log(`  Uploads:  http://localhost:${PORT}/uploads/`);
    console.log(`  Output:   http://localhost:${PORT}/output/`);
    console.log(`  API:      http://localhost:${PORT}/api/health`);
});
