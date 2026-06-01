import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    year: '',
    section: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const departments = ['Business Department', 'Information Technology Dept.', 'Hospitality Management Dept.', 'Education Dept.'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (registrationComplete && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (registrationComplete && countdown === 0) {
      navigate('/login');
    }
  }, [registrationComplete, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.studentId || !formData.name || !formData.email) {
      setError('Student ID, Name, and Email are required');
      return;
    }

    try {
      const { confirmPassword, studentId, ...rest } = formData;
      const registerData = {
        USN: studentId,
        ...rest,
      };
      await authAPI.registerStudent(registerData);
      setRegistrationComplete(true);
      setCountdown(3);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900 to-ssc-red-900/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-ssc-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ssc-red-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-5 shadow-2xl">
              <img src="src/assets/logo2.png" alt="SSC" className="h-16 w-16 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SSC</h1>
            <p className="text-brand-300 text-sm mt-2 font-medium">Registration Complete!</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8 border border-brand-100 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-brand-900 mb-4">Registration Complete!</h2>
            <p className="text-sm text-brand-500 mb-2">Your student account has been successfully created.</p>
            <p className="text-sm text-brand-500 mb-4">Redirecting to login in {countdown} seconds...</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-ssc-red-600/15"
            >
              Go to Login Now
            </button>
          </div>

          <p className="text-center text-xs text-brand-500 mt-6">
            Powered by SSC &middot; ACLC College Ormoc
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900 to-ssc-red-900/30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-ssc-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ssc-red-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-5 shadow-2xl">
            <img src="src/assets/logo2.png" alt="SSC" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SSC</h1>
          <p className="text-brand-300 text-sm mt-2 font-medium">Create your student account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8 border border-brand-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="studentId" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Student ID
              </label>
              <input
                minLength={11}
                maxLength={11}
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                placeholder="Enter your student ID"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@email.com"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Phone
              </label>
              <input
                maxLength={11}
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="section" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Section
              </label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              >
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-400 hover:text-brand-600 text-xs font-semibold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-400 hover:text-brand-600 text-xs font-semibold"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={false} // We don't have a loading state for registration, but we can add if needed
              className="w-full bg-ssc-red-600 hover:bg-ssc-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-ssc-red-600/15 mt-2"
            >
              Register
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-brand-500">
              Already have an account?{' '}
              <Link to="/login" className="text-ssc-red-600 hover:text-ssc-red-700 font-semibold transition-colors">
                Login here
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-brand-500 mt-6">
            Powered by SSC &middot; ACLC College Ormoc
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;