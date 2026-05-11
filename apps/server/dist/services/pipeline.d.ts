import type { Project, ProjectStatus } from '@shipreel/shared-types';
type StatusUpdate = (status: ProjectStatus, data?: Partial<Project>) => void;
export declare function runPipeline(project: Project, videoPath: string, onStatus: StatusUpdate): Promise<void>;
export {};
