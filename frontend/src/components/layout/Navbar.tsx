import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, logout, isSeeker, isEmployer } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Briefcase size={24} />
            JobPortal
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 font-medium">
              Find Jobs
            </Link>
            <Link to="/companies" className="text-gray-600 hover:text-blue-600 font-medium">
              Companies
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isSeeker() && (
                  <Link
                    to="/seeker/dashboard"
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium"
                  >
                    <User size={16} />
                    Dashboard
                  </Link>
                )}
                {isEmployer() && (
                  <Link
                    to="/employer/dashboard"
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium"
                  >
                    <Building2 size={16} />
                    Dashboard
                  </Link>
                )}
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
