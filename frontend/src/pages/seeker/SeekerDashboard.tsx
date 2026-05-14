import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Briefcase, Bookmark, Sparkles, Clock, CheckCircle, XCircle,
  MessageSquare, User, Plus, X, Upload, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { applicationsApi } from '../../api/applications';
import { jobsApi } from '../../api/jobs';
import { recommendationsApi } from '../../api/recommendations';
import { useAuthStore } from '../../store/authStore';
import JobCard from '../../components/ui/JobCard';
import api from '../../api/client';
import type { AppStatus } from '../../types';

const statusConfig: Record<AppStatus, { label: string; color: string; icon: React.ReactNode }> = {
  APPLIED:   { label: 'Applied',   color: 'bg-blue-100 text-blue-700',   icon: <Clock size={14} /> },
  SCREENING: { label: 'Screening', color: 'bg-yellow-100 text-yellow-700', icon: <MessageSquare size={14} /> },
  INTERVIEW: { label: 'Interview', color: 'bg-purple-100 text-purple-700', icon: <Briefcase size={14} /> },
  OFFERED:   { label: 'Offered!',  color: 'bg-green-100 text-green-700',  icon: <CheckCircle size={14} /> },
  REJECTED:  { label: 'Rejected',  color: 'bg-red-100 text-red-700',     icon: <XCircle size={14} /> },
};

type Tab = 'applications' | 'saved' | 'recommendations' | 'profile';

export default function SeekerDashboard() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('applications');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get<{ skills?: string[] }>('/users/profile').then(r => r.data),
  });

  useEffect(() => {
    if (profile?.skills) setSkills(profile.skills);
  }, [profile]);

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

  const { data: resume } = useQuery({
    queryKey: ['my-resume'],
    queryFn: () => api.get('/users/resume').then(r => r.data),
    enabled: activeTab === 'profile',
    retry: false,
  });

  const profileMutation = useMutation({
    mutationFn: () => api.put('/users/profile', { skills }).then(r => r.data),
    onSuccess: (data) => {
      toast.success('Profile updated!');
      setAuth({ ...user!, ...data, token: user!.token });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const resumeMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/users/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
    onSuccess: (data) => {
      toast.success(`Resume uploaded! ${data.parsedSkills?.length ?? 0} skills detected.`);
      if (data.parsedSkills?.length) {
        setSkills(prev => Array.from(new Set([...prev, ...data.parsedSkills])));
      }
      queryClient.invalidateQueries({ queryKey: ['my-resume'] });
    },
    onError: () => toast.error('Resume upload failed'),
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Track your applications and discover new opportunities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Applications', value: applications?.length ?? 0, icon: <Briefcase size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Saved Jobs',   value: savedJobs?.length ?? 0,    icon: <Bookmark size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'Interviews',   value: applications?.filter(a => a.status === 'INTERVIEW').length ?? 0, icon: <MessageSquare size={20} className="text-green-600" />, bg: 'bg-green-50' },
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'applications',   label: 'My Applications', icon: <Briefcase size={16} /> },
          { key: 'saved',          label: 'Saved Jobs',       icon: <Bookmark size={16} /> },
          { key: 'recommendations',label: 'For You',          icon: <Sparkles size={16} /> },
          { key: 'profile',        label: 'Profile & Resume', icon: <User size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Applications */}
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

      {/* Saved */}
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

      {/* Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations?.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              <Sparkles size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No recommendations yet</p>
              <p className="text-sm mt-1">Add skills in the Profile tab or upload your resume to get matches</p>
            </div>
          ) : (
            recommendations?.map(job => <JobCard key={job.id} job={job} />)
          )}
        </div>
      )}

      {/* Profile & Resume */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Skills editor */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Skills</h3>
            <p className="text-sm text-gray-500 mb-3">
              Skills are used to match you with relevant job recommendations.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. React, Python, SQL..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No skills added yet</p>
              ) : (
                skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {s}
                    <button onClick={() => setSkills(prev => prev.filter(x => x !== s))}>
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <button
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 text-sm"
            >
              {profileMutation.isPending ? 'Saving...' : 'Save Skills'}
            </button>
          </div>

          {/* Resume upload */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Resume</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload a PDF resume — skills will be automatically extracted and added to your profile.
            </p>

            {resume?.resumeUrl && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <FileText size={18} className="text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-800">Resume on file</p>
                  {resume.parsedSkills?.length > 0 && (
                    <p className="text-xs text-green-600">
                      {resume.parsedSkills.length} skills detected: {resume.parsedSkills.slice(0, 5).join(', ')}
                      {resume.parsedSkills.length > 5 && '...'}
                    </p>
                  )}
                </div>
                <a
                  href={resume.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-sm text-blue-600 hover:underline flex-shrink-0"
                >
                  View
                </a>
              </div>
            )}

            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) resumeMutation.mutate(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => resumeInputRef.current?.click()}
              disabled={resumeMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-60 text-sm font-medium"
            >
              <Upload size={16} />
              {resumeMutation.isPending ? 'Uploading...' : resume?.resumeUrl ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
