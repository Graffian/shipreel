"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
exports.createProject = createProject;
const node_crypto_1 = require("node:crypto");
const express_1 = require("express");
exports.projectRouter = (0, express_1.Router)();
const projects = new Map();
function createProject(data) {
    const id = (0, node_crypto_1.randomUUID)();
    const project = {
        id,
        title: data.title || 'Untitled Project',
        status: data.status || 'uploading',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        screenRecordingUrl: data.screenRecordingUrl,
        changelog: data.changelog,
        inspirationVideoUrl: data.inspirationVideoUrl,
    };
    projects.set(id, project);
    return project;
}
exports.projectRouter.post('/', (req, res) => {
    const { title, changelog, screenRecordingUrl, inspirationVideoUrl } = req.body;
    const project = createProject({
        title,
        changelog,
        screenRecordingUrl,
        inspirationVideoUrl,
    });
    res.status(201).json(project);
});
exports.projectRouter.get('/', (_req, res) => {
    const list = Array.from(projects.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
});
exports.projectRouter.get('/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json(project);
});
exports.projectRouter.patch('/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
    res.json(project);
});
