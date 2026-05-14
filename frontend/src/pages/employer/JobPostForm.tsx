import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { jobsApi } from '../../api/jobs';
import type { Job } from '../../types';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  location: z.string().min(1, 'Location required'),
  type: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  experienceLevel: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  fullDescription: z.string().optional(),
  aboutRole: z.string().optional(),
  benefits: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  onBack: () => void;
  editJob: Job | null;
}

export default function JobPostForm({ onBack, editJob }: Props) {
  const [skills, setSkills] = useState<string[]>(editJob?.requiredSkills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editJob ? {
      title: editJob.title,
      location: editJob.location,
      type: editJob.type,
      experienceLevel: editJob.experienceLevel,
      salaryMin: editJob.salaryMin,
      salaryMax: editJob.salaryMax,
    } : { type: 'REMOTE' },
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (value.trim()) setter(prev => [...prev, value.trim()]);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = { ...data, requiredSkills: skills, responsibilities, requirements };
      if (editJob) await jobsApi.update(editJob.id, payload);
      else await jobsApi.create(payload);
      toast.success(editJob ? 'Job updated!' : 'Job posted!');
      onBack();
    } catch {
      toast.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={18} /> Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{editJob ? 'Edit Job' : 'Post a New Job'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input {...register('title')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Senior React Developer" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input {...register('location')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="San Francisco, CA" />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select {...register('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select {...register('experienceLevel')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Any</option>
                {['Junior', 'Mid', 'Senior', 'Lead'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary ($)</label>
              <input {...register('salaryMin')} type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="80000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary ($)</label>
              <input {...register('salaryMax')} type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="120000" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Required Skills</h2>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React"
            />
            <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {s}
                <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Description</h2>
          {[
            { label: 'About the Role', name: 'aboutRole', placeholder: 'Brief overview of the role...' },
            { label: 'Full Description', name: 'fullDescription', placeholder: 'Detailed job description...' },
            { label: 'Benefits', name: 'benefits', placeholder: 'Health insurance, 401k, PTO...' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <textarea
                {...register(f.name as keyof FormData)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {[
            { label: 'Responsibilities', state: responsibilities, setter: setResponsibilities },
            { label: 'Requirements', state: requirements, setter: setRequirements },
          ].map(({ label, state, setter }) => {
            return (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addListItem(setter, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Add ${label.toLowerCase().slice(0, -1)}...`}
                  />
                </div>
                <ul className="space-y-1">
                  {state.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {item}
                      <button type="button" onClick={() => setter(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 ml-auto">
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-60">
            {loading ? 'Saving...' : editJob ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
