import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin, Briefcase, DollarSign, Users, Clock, Bookmark, BookmarkCheck, ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { jobsApi } from '../../api/jobs';
import { applicationsApi } from '../../api/applications';
import { useAuthStore } from '../../store/authStore';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSeeker } = useAuthStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { data: job, isLoading, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(Number(id)),
  });

  const applyMutation = useMutation({
    mutationFn: () => applicationsApi.apply({ jobId: Number(id), coverLetter }),
    onSuccess: () => {
      toast.success('Application submitted!');
      setShowApplyModal(false);
      refetch();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to apply');
    },
  });

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    await jobsApi.toggleSave(Number(id));
    refetch();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!job) return <div className="text-center py-16 text-gray-500">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {job.companyLogoUrl ? (
              <img src={job.companyLogoUrl} alt={job.companyName} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {job.companyName?.[0] ?? '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500 mt-1">{job.companyName}</p>
              {job.companyIndustry && <p className="text-sm text-gray-400">{job.companyIndustry}</p>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {isSeeker() && (
              <button onClick={handleSave} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                {job.saved ? <BookmarkCheck size={20} className="text-blue-600" /> : <Bookmark size={20} />}
              </button>
            )}
            {isSeeker() && job.status === 'ACTIVE' && (
              <button
                onClick={() => user ? setShowApplyModal(true) : navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-6">
          {job.location && <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>}
          <span className="flex items-center gap-1"><Briefcase size={14} />{job.type}</span>
          {(job.salaryMin || job.salaryMax) && (
            <span className="flex items-center gap-1">
              <DollarSign size={14} />
              {job.salaryMin && `$${(job.salaryMin / 1000).toFixed(0)}k`}
              {job.salaryMin && job.salaryMax && ' – '}
              {job.salaryMax && `$${(job.salaryMax / 1000).toFixed(0)}k`}
            </span>
          )}
          <span className="flex items-center gap-1"><Users size={14} />{job.applicationCount} applicants</span>
          <span className="flex items-center gap-1">
            <Clock size={14} />{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </span>
        </div>

        {job.requiredSkills?.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map(s => (
                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {(job.fullDescription || job.aboutRole || job.requirements || job.responsibilities || job.benefits) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
          {job.aboutRole && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About the Role</h2>
              <p className="text-gray-600 leading-relaxed">{job.aboutRole}</p>
            </section>
          )}
          {job.fullDescription && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.fullDescription}</p>
            </section>
          )}
          {(job.responsibilities?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {job.responsibilities?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}
          {(job.requirements?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {job.requirements?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}
          {job.benefits && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h2>
              <p className="text-gray-600 leading-relaxed">{job.benefits}</p>
            </section>
          )}
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Apply to {job.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{job.companyName}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Tell them why you're a great fit..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
