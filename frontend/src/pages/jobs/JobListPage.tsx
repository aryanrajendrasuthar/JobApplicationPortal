import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import JobCard from '../../components/ui/JobCard';
import type { JobSearchParams } from '../../types';

const JOB_TYPES = ['REMOTE', 'HYBRID', 'ONSITE'];
const EXP_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];

export default function JobListPage() {
  const [params, setParams] = useState<JobSearchParams>({ page: 0, size: 12 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.search(params),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(p => ({ ...p, keyword: keyword || undefined, page: 0 }));
  };

  const toggleType = (type: string) =>
    setParams(p => ({ ...p, type: p.type === type ? undefined : type, page: 0 }));

  const toggleExp = (exp: string) =>
    setParams(p => ({ ...p, experienceLevel: p.experienceLevel === exp ? undefined : exp, page: 0 }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
        <p className="text-gray-500">{data?.totalElements ?? 0} jobs available</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Job title, skill, or company..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(f => !f)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
        >
          Search
        </button>
      </form>

      {filtersOpen && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Job Type</p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${params.type === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Experience Level</p>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map(e => (
                <button
                  key={e}
                  onClick={() => toggleExp(e)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${params.experienceLevel === e ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Salary Range</p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min ($k)"
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setParams(p => ({ ...p, salaryMin: e.target.value ? +e.target.value * 1000 : undefined, page: 0 }))}
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="Max ($k)"
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setParams(p => ({ ...p, salaryMax: e.target.value ? +e.target.value * 1000 : undefined, page: 0 }))}
              />
            </div>
          </div>

          {(params.type || params.experienceLevel || params.salaryMin || params.keyword) && (
            <div className="md:col-span-3">
              <button
                onClick={() => { setParams({ page: 0, size: 12 }); setKeyword(''); }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
              >
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Search size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.content.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={params.page === 0}
                onClick={() => setParams(p => ({ ...p, page: (p.page ?? 0) - 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {(params.page ?? 0) + 1} of {data?.totalPages}
              </span>
              <button
                disabled={(params.page ?? 0) + 1 >= (data?.totalPages ?? 1)}
                onClick={() => setParams(p => ({ ...p, page: (p.page ?? 0) + 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
