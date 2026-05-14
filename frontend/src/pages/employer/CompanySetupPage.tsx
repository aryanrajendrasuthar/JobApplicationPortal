import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import { companiesApi } from '../../api/companies';

const schema = z.object({
  name: z.string().min(1, 'Company name required'),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

interface Props {
  onSaved?: () => void;
  compact?: boolean;
}

export default function CompanySetupPage({ onSaved, compact }: Props) {
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ['my-company'],
    queryFn: companiesApi.getMyCompany,
    retry: false,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        industry: company.industry ?? '',
        companySize: company.companySize ?? '',
        location: company.location ?? '',
        website: company.website ?? '',
        description: company.description ?? '',
      });
    }
  }, [company, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => companiesApi.createOrUpdate(data),
    onSuccess: () => {
      toast.success(company ? 'Company updated!' : 'Company profile created!');
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      onSaved?.();
    },
    onError: () => toast.error('Failed to save company profile'),
  });

  const form = (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
        <input
          {...register('name')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Acme Corp"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input
            {...register('industry')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Technology"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
          <select
            {...register('companySize')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select size</option>
            {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            {...register('location')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="San Francisco, CA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            {...register('website')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://acme.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">About the Company</label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="What does your company do?"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 transition"
      >
        {mutation.isPending ? 'Saving...' : company ? 'Update Company' : 'Create Company Profile'}
      </button>
    </form>
  );

  if (compact) return form;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 size={28} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {company ? 'Edit Company Profile' : 'Set Up Your Company'}
          </h1>
          {!company && (
            <p className="text-gray-500 text-sm mt-0.5">Required before you can post jobs</p>
          )}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">{form}</div>
    </div>
  );
}
