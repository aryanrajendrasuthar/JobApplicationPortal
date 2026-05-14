import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../api/applications';
import type { Application, AppStatus } from '../../types';

interface Job { id: number; title: string; applicationCount: number; }

const COLUMNS: { status: AppStatus; label: string; color: string }[] = [
  { status: 'APPLIED', label: 'Applied', color: 'bg-blue-50 border-blue-200' },
  { status: 'SCREENING', label: 'Screening', color: 'bg-yellow-50 border-yellow-200' },
  { status: 'INTERVIEW', label: 'Interview', color: 'bg-purple-50 border-purple-200' },
  { status: 'OFFERED', label: 'Offered', color: 'bg-green-50 border-green-200' },
  { status: 'REJECTED', label: 'Rejected', color: 'bg-red-50 border-red-200' },
];

const NEXT_STATUSES: Record<AppStatus, AppStatus[]> = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFERED', 'REJECTED'],
  OFFERED: [],
  REJECTED: [],
};

interface Props {
  job: Job;
  onBack: () => void;
}

export default function KanbanBoard({ job, onBack }: Props) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['job-applications', job.id],
    queryFn: () => applicationsApi.getJobApplications(job.id, 0, 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppStatus }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['job-applications', job.id] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const applications = data?.content ?? [];

  const byStatus = (status: AppStatus) => applications.filter(a => a.status === status);

  return (
    <div className="max-w-full px-4 py-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-gray-500">{applications.length} total applications</p>
        </div>

        <div className="flex gap-4 min-w-max">
          {COLUMNS.map(col => (
            <div key={col.status} className={`w-72 rounded-xl border-2 ${col.color} flex flex-col`}>
              <div className="px-4 py-3 border-b border-current border-opacity-20">
                <h3 className="font-semibold text-gray-700 flex items-center justify-between">
                  {col.label}
                  <span className="text-xs bg-white bg-opacity-70 px-2 py-0.5 rounded-full">
                    {byStatus(col.status).length}
                  </span>
                </h3>
              </div>
              <div className="p-3 space-y-3 flex-1 min-h-32">
                {byStatus(col.status).map(app => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onMove={(status) => updateMutation.mutate({ id: app.id, status })}
                    nextStatuses={NEXT_STATUSES[col.status]}
                    loading={updateMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({
  app, onMove, nextStatuses, loading,
}: {
  app: Application;
  onMove: (s: AppStatus) => void;
  nextStatuses: AppStatus[];
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div className="flex items-start gap-2 mb-2">
        {app.seekerAvatarUrl ? (
          <img src={app.seekerAvatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
            {app.seekerName?.[0] ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{app.seekerName}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
            <Mail size={10} /> {app.seekerEmail}
          </p>
        </div>
      </div>

      {app.seekerSkills && app.seekerSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {app.seekerSkills.slice(0, 3).map(s => (
            <span key={s} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{s}</span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 mt-2">
        {app.resumeUrl && (
          <a href={app.resumeUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <FileText size={12} /> Resume
          </a>
        )}
        {nextStatuses.map(s => (
          <button
            key={s}
            onClick={() => onMove(s)}
            disabled={loading}
            className={`text-xs px-2 py-1 rounded font-medium transition ${s === 'REJECTED' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} disabled:opacity-50`}
          >
            → {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
