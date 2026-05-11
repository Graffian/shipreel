"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRouter = void 0;
const express_1 = require("express");
exports.renderRouter = (0, express_1.Router)();
const renderJobs = new Map();
exports.renderRouter.post('/start', async (req, res) => {
    const renderReq = req.body;
    if (!renderReq.projectId || !renderReq.scenePlan) {
        res.status(400).json({ error: 'Missing projectId or scenePlan' });
        return;
    }
    renderJobs.set(renderReq.projectId, {
        frames: 0,
        totalFrames: 100,
        percentage: 0,
    });
    res.json({ message: 'Render started', projectId: renderReq.projectId });
});
exports.renderRouter.get('/progress/:projectId', (req, res) => {
    const progress = renderJobs.get(req.params.projectId);
    if (!progress) {
        res.status(404).json({ error: 'No render job found' });
        return;
    }
    res.json(progress);
});
