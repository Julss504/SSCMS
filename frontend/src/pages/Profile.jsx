import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, setUserData } from '../services/api';
import { authAPI } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const storedUserData = getUserData();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!storedUserData) {
      navigate('/login');
      return;
    }
    setFormData({
      name: storedUserData.name,
      email: storedUserData.email,
      password: '',
      confirmPassword: '',
    });
  }, [storedUserData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await authAPI.updateProfile(updateData);
      setSuccess('Profile updated successfully');
      setEditing(false);

      setUserData(response.data);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to update profile');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!storedUserData) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Profile</h2>
        <p className="text-sm text-brand-500 mt-1 font-medium">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
        <div className="p-6 border-b border-brand-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 text-3xl font-bold">
                {storedUserData.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-900">{storedUserData.name}</h3>
              <p className="text-sm text-brand-500">{storedUserData.email}</p>
              <span className={`inline-flex mt-2 text-xs font-semibold px-2.5 py-1 rounded-md ${
                storedUserData.role === 'admin' ? 'bg-ssc-red-100 text-ssc-red-700' :
                storedUserData.role === 'officer' ? 'bg-brand-200 text-brand-800' :
                'bg-green-100 text-green-700'
              }`}>
                {storedUserData.role.charAt(0).toUpperCase() + storedUserData.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-6 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl mb-4 text-sm font-medium">
            {success}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: storedUserData.name,
                    email: storedUserData.email,
                    password: '',
                    confirmPassword: '',
                  });
                  setError('');
                  setSuccess('');
                }}
                className="bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2.5 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-brand-100">
                    <span className="text-sm text-brand-500">Name</span>
                    <span className="text-sm font-semibold text-brand-900">{storedUserData.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-100">
                    <span className="text-sm text-brand-500">Email</span>
                    <span className="text-sm font-semibold text-brand-900">{storedUserData.email}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-brand-500">Role</span>
                    <span className="text-sm font-semibold text-brand-900">{storedUserData.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-ssc-red-600 hover:bg-ssc-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;