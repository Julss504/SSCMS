import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, removeToken, removeUserData, isAdmin, setUserData } from '../services/api';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';

const Profile = () => {
  const navigate = useNavigate();
  const userData = getUserData();
  const [loading, setLoading] = useState(true);
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
    if (!userData) {
      navigate('/login');
      return;
    }
    setFormData({
      name: userData.name,
      email: userData.email,
      password: '',
      confirmPassword: '',
    });
    setLoading(false);
  }, [userData, navigate]);

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
      
      // Update user data in localStorage
      setUserData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-ssc-red-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo className="h-12 w-12" />
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/events')} 
                className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Events
              </button>
              {isAdmin() && (
                <>
                  <button 
                    onClick={() => navigate('/students')} 
                    className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Students
                  </button>
                  <button 
                    onClick={() => navigate('/users')} 
                    className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Users
                  </button>
                </>
              )}
              <button 
                onClick={() => navigate('/attendance')} 
                className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Attendance
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                className="text-ssc-red-600 font-semibold px-3 py-2 rounded-md bg-ssc-red-50"
              >
                Profile
              </button>
              <button 
                onClick={handleLogout} 
                className="bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="page-header flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-ssc-red-100 rounded-full flex items-center justify-center">
              <span className="text-ssc-red-600 text-3xl font-bold">
                {userData.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{userData.name}</h3>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-sm text-gray-500 mt-1">Role: {userData.role}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: userData.name,
                      email: userData.email,
                      password: '',
                      confirmPassword: '',
                    });
                    setError('');
                    setSuccess('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900">{userData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{userData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="text-gray-900">{userData.role}</span>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default Profile;
