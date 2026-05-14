import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Globe, Building2, Briefcase } from 'lucide-react';
import { companiesApi } from '../api/companies';
import JobCard from '../components/ui/JobCard';
import type { Job } from '../types';

export function CompaniesPage() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
      <p className="text-gray-500 mb-8">{companies?.length ?? 0} companies hiring</p>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies?.map(company => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition"
            >
              <div className="flex items-start gap-4 mb-3">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {company.name[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
                </div>
              </div>
              {company.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>
              )}
              <div className="flex gap-4 text-xs text-gray-400">
                {company.location && <span className="flex items-center gap-1"><MapPin size={12} />{company.location}</span>}
                {company.companySize && <span className="flex items-center gap-1"><Building2 size={12} />{company.companySize}</span>}
                {company.website && <span className="flex items-center gap-1"><Globe size={12} />Website</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['company-profile', id],
    queryFn: () => companiesApi.getProfile(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-16 text-gray-500">Company not found</div>;

  const { company, openJobCount, openJobs } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-6 mb-6">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl">
              {company.name[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            {company.industry && <p className="text-gray-500 mt-1">{company.industry}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {company.location && <span className="flex items-center gap-1"><MapPin size={14} />{company.location}</span>}
              {company.companySize && <span className="flex items-center gap-1"><Building2 size={14} />{company.companySize} employees</span>}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Globe size={14} />{company.website}
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{openJobCount}</p>
            <p className="text-sm text-gray-500">Open positions</p>
          </div>
        </div>
        {company.description && (
          <p className="text-gray-600 leading-relaxed">{company.description}</p>
        )}
      </div>

      {(openJobs as Job[]).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={20} /> Open Positions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(openJobs as Job[]).map((job: Job) => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      )}
    </div>
  );
}
