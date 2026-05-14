import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Briefcase, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { jobsApi } from '../api/jobs';
import { companiesApi } from '../api/companies';
import JobCard from '../components/ui/JobCard';

const CATEGORIES = [
  { label: 'Engineering', icon: '⚙️', query: 'engineer' },
  { label: 'Design', icon: '🎨', query: 'design' },
  { label: 'Marketing', icon: '📣', query: 'marketing' },
  { label: 'Data Science', icon: '📊', query: 'data' },
  { label: 'Product', icon: '🚀', query: 'product' },
  { label: 'Sales', icon: '💼', query: 'sales' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const { data: latestJobs } = useQuery({
    queryKey: ['latest-jobs'],
    queryFn: jobsApi.getLatest,
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs${keyword ? `?keyword=${keyword}` : ''}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Find Your Dream Job Today
          </h1>
          <p className="text-blue-100 text-xl mb-10">
            Connect with top companies and discover opportunities that match your skills
          </p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Job title, skill, or company..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 text-lg"
            >
              Search
            </button>
          </form>
          <div className="flex items-center justify-center gap-8 mt-8 text-blue-100 text-sm">
            <span className="flex items-center gap-2"><Briefcase size={16} /> {latestJobs?.length ?? 0}+ Jobs</span>
            <span className="flex items-center gap-2"><Building2 size={16} /> {companies?.length ?? 0}+ Companies</span>
            <span className="flex items-center gap-2"><TrendingUp size={16} /> Growing daily</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => navigate(`/jobs?keyword=${cat.query}`)}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
            <Link to="/jobs" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
              View all <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestJobs?.map(job => <JobCard key={job.id} job={job} />)}
            {!latestJobs && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      {companies && companies.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Companies</h2>
              <Link to="/companies" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                View all <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {companies.slice(0, 8).map(company => (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="flex flex-col items-center gap-3 p-5 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition text-center"
                >
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {company.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                    {company.industry && <p className="text-xs text-gray-400">{company.industry}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to hire top talent?</h2>
        <p className="text-blue-100 mb-8">Post jobs and connect with skilled professionals today</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50"
        >
          <Building2 size={20} /> Post a Job
        </Link>
      </section>
    </div>
  );
}
