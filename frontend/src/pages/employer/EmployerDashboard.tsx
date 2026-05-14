import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Briefcase, Users, ChevronRight, Building2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsApi } from '../../api/jobs';
import { companiesApi } from '../../api/companies';
import JobPostForm from './JobPostForm';
import KanbanBoard from './KanbanBoard';
import CompanySetupPage from './CompanySetupPage';
import type { Job } from '../../types';

type View = 'jobs' | 'post' | 'kanban' | 'company';

export default function EmployerDashboard() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('jobs');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: jobsApi.getEmployerJobs,
  });

  const { data: company } = useQuery({
    queryKey: ['my-company'],
    queryFn: companiesApi.getMyCompany,
    retry: false,
  });

  const closeMutation = useMutation({
    mutationFn: (jobId: number) => jobsApi.close(jobId),
    onSuccess: () => {
      toast.success('Job closed');
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
    },
  });

  if (view === 'post') {
    return <JobPostForm onBack={() => { setView('jobs'); queryClient.invalidateQueries({ queryKey: ['employer-jobs'] }); }} editJob={null} />;
  }
  if (view === 'kanban' && selectedJob) {
    return <KanbanBoard job={selectedJob} onBack={() => { setView('jobs'); setSelectedJob(null); }} />;
  }
  if (view === 'company') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => setView('jobs')} className="text-gray-500 hover:text-gray-700 text-sm mb-6">
          ← Back to Dashboard
        </button>
        <CompanySetupPage onSaved={() => { queryClient.invalidateQueries({ queryKey: ['my-company'] }); setView('jobs'); }} />
      </div>
    );
  }

  const hasCompany = !!company;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job postings and applications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('company')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-medium"
          >
            <Building2 size={16} /> {hasCompany ? 'Edit Company' : 'Set Up Company'}
          </button>
          <button
            onClick={() => hasCompany ? setView('post') : setView('company')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium"
          >
            <Plus size={18} /> Post a Job
          </button>
        </div>
      </div>

      {!hasCompany && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Company profile required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You need a company profile before posting jobs.{' '}
              <button onClick={() => setView('company')} className="underline font-medium">
                Set it up now →
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Jobs', value: jobs?.filter(j => j.status === 'ACTIVE').length ?? 0, icon: <Briefcase size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Total Applications', value: jobs?.reduce((s, j) => s + j.applicationCount, 0) ?? 0, icon: <Users size={20} className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Company', value: company ? company.name : 'Not set', icon: <Building2 size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} flex-shrink-0`}>{stat.icon}</div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-gray-900 truncate">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Your Job Postings</h2>
        </div>
        {jobs?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No jobs posted yet</p>
            <button
              onClick={() => hasCompany ? setView('post') : setView('company')}
              className="text-blue-600 text-sm hover:underline mt-1"
            >
              {hasCompany ? 'Post your first job →' : 'Set up your company to get started →'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs?.map(job => (
              <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.location} · {job.type}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {job.status}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users size={14} /> {job.applicationCount}
                  </span>
                  <button
                    onClick={() => { setSelectedJob(job); setView('kanban'); }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Review <ChevronRight size={16} />
                  </button>
                  {job.status === 'ACTIVE' && (
                    <button
                      onClick={() => closeMutation.mutate(job.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
