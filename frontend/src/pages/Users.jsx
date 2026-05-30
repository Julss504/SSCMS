import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, getUserData, isAdmin, removeToken, removeUserData } from '../services/api';
import Logo from '../components/Logo';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userData = getUserData();

  useEffect(() => {
    if (!userData || !isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

   const fetchUsers = async () => {
     try {
       const response = await authAPI.getUsers();
       setUsers(response.data);
     } catch (err) {
       // Handle session expired error
       if (err.message === 'Session expired. Please log in again.') {
         // The auth data has been cleared by apiRequest, 
         // ProtectedRoute will redirect to login on next render
         console.warn('Session expired, redirecting to login');
       } else {
         setError(err.message || 'Failed to fetch users');
       }
     } finally {
       setLoading(false);
     }
   };

   const handleDeleteUser = async (userId) => {
     if (window.confirm('Are you sure you want to delete this user?')) {
       try {
         await authAPI.deleteUser(userId);
         // Update state directly by removing the deleted user
         setUsers(users.filter(user => user._id !== userId));
       } catch (err) {
         // Handle session expired error
         if (err.message === 'Session expired. Please log in again.') {
           // The auth data has been cleared by apiRequest, 
           // ProtectedRoute will redirect to login on next render
           console.warn('Session expired, redirecting to login');
         } else {
           setError(err.message || 'Failed to delete user');
         }
       }
     }
   };

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
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
              <button 
                onClick={() => navigate('/students')} 
                className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Students
              </button>
              <button 
                onClick={() => navigate('/attendance')} 
                className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Attendance
              </button>
              <button 
                onClick={() => navigate('/users')} 
                className="text-ssc-red-600 font-semibold px-3 py-2 rounded-md bg-ssc-red-50"
              >
                Users
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                className="text-gray-600 hover:text-ssc-red-600 font-medium px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">System Users</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
