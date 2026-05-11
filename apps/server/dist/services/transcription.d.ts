import type { TranscriptionResult } from '@shipreel/shared-types';
export declare function transcribeAudio(audioPath: string, duration?: number): Promise<TranscriptionResult>;
