import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  role: z.enum(['ROLE_SEEKER', 'ROLE_EMPLOYER']),
  companyName: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyLocation: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ROLE_SEEKER' },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setAuth(res);
      toast.success('Account created!');
      if (res.role === 'ROLE_EMPLOYER') navigate('/employer/dashboard');
      else navigate('/seeker/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Briefcase className="text-blue-600" size={28} />
          <span className="text-2xl font-bold text-gray-900">JobPortal</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-500 mb-6">Join thousands of job seekers and employers</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['ROLE_SEEKER', 'ROLE_EMPLOYER'] as const).map(r => (
              <label key={r} className={`flex items-center justify-center gap-2 border-2 rounded-lg p-3 cursor-pointer transition ${role === r ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <input {...register('role')} type="radio" value={r} className="hidden" />
                <span className="font-medium text-sm">{r === 'ROLE_SEEKER' ? '🔍 Job Seeker' : '🏢 Employer'}</span>
              </label>
            ))}
          </div>

          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                {...register(field.name as keyof FormData)}
                type={field.type}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field.placeholder}
              />
              {errors[field.name as keyof FormData] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name as keyof FormData]?.message}
                </p>
              )}
            </div>
          ))}

          {role === 'ROLE_EMPLOYER' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Company Details</p>
              {[
                { name: 'companyName', label: 'Company Name', placeholder: 'Acme Corp' },
                { name: 'companyIndustry', label: 'Industry', placeholder: 'Technology' },
                { name: 'companyLocation', label: 'Location', placeholder: 'San Francisco, CA' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
                  <input
                    {...register(field.name as keyof FormData)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
