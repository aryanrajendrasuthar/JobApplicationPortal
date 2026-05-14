import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, Bookmark, Sparkles, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { jobsApi } from '../../api/jobs';
import { recommendationsApi } from '../../api/recommendations';
import { useAuthStore } from '../../store/authStore';
import JobCard from '../../components/ui/JobCard';
import { formatDistanceToNow } from 'date-fns';
import type { AppStatus } from '../../types';

const statusConfig: Record<AppStatus, { label: string; color: string; icon: React.ReactNode }> = {
  APPLIED: { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: <Clock size={14} /> },
  SCREENING: { label: 'Screening', color: 'bg-yellow-100 text-yellow-700', icon: <MessageSquare size={14} /> },
  INTERVIEW: { label: 'Interview', color: 'bg-purple-100 text-purple-700', icon: <Briefcase size={14} /> },
  OFFERED: { label: 'Offered!', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
};

export default function SeekerDashboard() {
  const { user } = useAuthStore();

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationsApi.getMyApplications,
  });

  const { data: savedJobs } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: jobsApi.getSaved,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: recommendationsApi.get,
  });

  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'recommendations'>('applications');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Track your applications and discover new opportunities</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Applications', value: applications?.length ?? 0, icon: <Briefcase size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Saved Jobs', value: savedJobs?.length ?? 0, icon: <Bookmark size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Interviews', value: applications?.filter(a => a.status === 'INTERVIEW').length ?? 0, icon: <MessageSquare size={20} className="text-green-600" />, bg: 'bg-green-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'applications', label: 'My Applications', icon: <Briefcase size={16} /> },
          { key: 'saved', label: 'Saved Jobs', icon: <Bookmark size={16} /> },
          { key: 'recommendations', label: 'For You', icon: <Sparkles size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'applications' && (
        <div className="space-y-3">
          {applications?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No applications yet</p>
              <Link to="/jobs" className="text-blue-600 text-sm hover:underline mt-1 block">Browse jobs →</Link>
            </div>
          ) : (
            applications?.map(app => {
              const s = statusConfig[app.status];
              return (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {app.companyLogoUrl ? (
                      <img src={app.companyLogoUrl} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                        {app.companyName?.[0] ?? '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{app.jobTitle}</p>
                      <p className="text-sm text-gray-500">{app.companyName} · {app.jobLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                      {s.icon} {s.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs?.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              <Bookmark size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No saved jobs</p>
              <Link to="/jobs" className="text-blue-600 text-sm hover:underline mt-1 block">Browse jobs →</Link>
            </div>
          ) : (
            savedJobs?.map(job => <JobCard key={job.id} job={job} />)
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations?.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              <Sparkles size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No recommendations yet</p>
              <p className="text-sm">Upload your resume to get skill-based recommendations</p>
            </div>
          ) : (
            recommendations?.map(job => <JobCard key={job.id} job={job} />)
          )}
        </div>
      )}
    </div>
  );
}

