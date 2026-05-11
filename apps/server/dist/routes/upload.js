"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const node_crypto_1 = require("node:crypto");
const projects_1 = require("./projects");
const pipeline_1 = require("../services/pipeline");
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.resolve(__dirname, '../../uploads'));
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, node_crypto_1.randomUUID)()}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported file type: ${ext}`));
        }
    },
});
exports.uploadRouter = (0, express_1.Router)();
exports.uploadRouter.post('/screen-recording', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
    }
    const { changelog, title } = req.body;
    const project = (0, projects_1.createProject)({
        title: title || 'Untitled Project',
        changelog,
        screenRecordingUrl: req.file.path,
        status: 'uploading',
    });
    // Return immediately — pipeline runs async
    res.json({
        projectId: project.id,
        filePath: req.file.path,
        fileName: req.file.originalname,
        size: req.file.size,
    });
    (0, pipeline_1.runPipeline)(project, req.file.path, (status, data) => {
        Object.assign(project, { status, ...data }, { updatedAt: new Date().toISOString() });
    });
});
exports.uploadRouter.post('/inspiration-video', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
    }
    res.json({
        filePath: req.file.path,
        fileName: req.file.originalname,
        size: req.file.size,
    });
});
