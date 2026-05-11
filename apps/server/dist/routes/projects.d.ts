import type { Project, ProjectStatus } from '@shipreel/shared-types';
export declare const projectRouter: import("express-serve-static-core").Router;
export declare function createProject(data: {
    title: string;
    changelog?: string;
    screenRecordingUrl?: string;
    inspirationVideoUrl?: string;
    status?: ProjectStatus;
}): Project;
