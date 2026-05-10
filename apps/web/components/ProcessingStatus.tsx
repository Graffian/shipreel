import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { ProjectStatus } from '@shipreel/shared-types'

interface ProcessingStatusProps {
  status: ProjectStatus
  message?: string
}

const statusConfig: Record<
  ProjectStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  uploading: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-yellow-400',
    label: 'Uploading',
  },
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-blue-400',
    label: 'Processing',
  },
  transcribing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-purple-400',
    label: 'Transcribing',
  },
  generating: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-cyan-400',
    label: 'Generating',
  },
  rendering: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-orange-400',
    label: 'Rendering',
  },
  complete: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-400',
    label: 'Complete',
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-400',
    label: 'Error',
  },
}

export function ProcessingStatus({ status, message }: ProcessingStatusProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className={config.color}>{config.icon}</div>
      <div>
        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
        {message && <p className="mt-0.5 text-xs text-slate-500">{message}</p>}
      </div>
    </div>
  )
}
