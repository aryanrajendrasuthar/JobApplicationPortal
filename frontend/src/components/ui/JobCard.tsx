import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { jobsApi } from '../../api/jobs';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  job: Job;
}

const typeColors: Record<string, string> = {
  REMOTE: 'bg-green-100 text-green-700',
  HYBRID: 'bg-yellow-100 text-yellow-700',
  ONSITE: 'bg-blue-100 text-blue-700',
};

export default function JobCard({ job }: Props) {
  const { isSeeker } = useAuthStore();
  const queryClient = useQueryClient();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await jobsApi.toggleSave(job.id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    } catch {
      // ignore
    }
  };

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {job.companyLogoUrl ? (
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
              {job.companyName?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.companyName}</p>
          </div>
        </div>

        {isSeeker() && (
          <button
            onClick={handleSave}
            className="text-gray-400 hover:text-blue-600 flex-shrink-0"
          >
            {job.saved ? <BookmarkCheck size={20} className="text-blue-600" /> : <Bookmark size={20} />}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[job.type]}`}>
          {job.type}
        </span>
        {job.experienceLevel && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {job.experienceLevel}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {job.location}
          </span>
        )}
        {(job.salaryMin || job.salaryMax) && (
          <span className="flex items-center gap-1">
            <DollarSign size={14} />
            {job.salaryMin && `$${(job.salaryMin / 1000).toFixed(0)}k`}
            {job.salaryMin && job.salaryMax && ' – '}
            {job.salaryMax && `$${(job.salaryMax / 1000).toFixed(0)}k`}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users size={14} /> {job.applicationCount} applied
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
        </span>
      </div>

      {job.requiredSkills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {job.requiredSkills.slice(0, 4).map(skill => (
            <span key={skill} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
              +{job.requiredSkills.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
