import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, getUserData, isAdmin, removeToken, removeUserData, setUserData } from '../services/api';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userData = getUserData();

  const [newUser, setNewUser] = useState({
    studentId: '',
    password: '',
  });

  useEffect(() => {
    if (!userData || !isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, studentsRes] = await Promise.all([
        authAPI.getUsers(),
        fetch('http://localhost:5000/api/students', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(res => res.json()),
      ]);
      setUsers(usersRes.data);
      if (studentsRes.success) {
        setStudents(studentsRes.data);
      }
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to fetch users');
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await authAPI.updateUserRole(userId, newRole);
      setUsers(users.map(user => user._id === userId ? response.data : user));
      setSuccess(`Role updated to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to update role');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authAPI.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        if (err.message === 'Session expired. Please log in again.') {
          console.warn('Session expired, redirecting to login');
        } else {
          setError(err.message || 'Failed to delete user');
        }
      }
    }
  };

  const handleCreateStudentUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!newUser.studentId || !newUser.password) {
      setError('Student ID and password are required');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await authAPI.createStudentUser(newUser);
      setUsers([...users, response.data]);
      setShowCreateModal(false);
      setNewUser({ studentId: '', password: '' });
      setSuccess('Student account created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to create student account');
      }
    }
  };

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const getAvailableStudents = () => {
    const existingUserStudentIds = users
      .filter(u => u.role === 'student' && u.studentRef)
      .map(u => u.studentRef.toString());
    
    return students.filter(s => !existingUserStudentIds.includes(s._id.toString()));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 tracking-tight">User Management</h2>
          <p className="text-sm text-brand-500 mt-1 font-medium">Manage system users and their roles</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl mb-6 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
        <div className="p-6 border-b border-brand-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-brand-900">System Users ({users.length})</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/15 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            Create Student Account
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-50/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Change Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-brand-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-brand-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${
                      user.role === 'admin'
                        ? 'bg-ssc-red-100 text-ssc-red-700'
                        : user.role === 'officer'
                          ? 'bg-brand-200 text-brand-800'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-sm border border-brand-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                    >
                      <option value="admin">Admin</option>
                      <option value="officer">Officer</option>
                      <option value="student">Student</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-semibold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => {
          setShowCreateModal(false);
          setNewUser({ studentId: '', password: '' });
          setError('');
        }}>
          <div className="bg-white rounded-2xl shadow-dropdown max-w-md w-full p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-brand-900">Create Student Account</h3>
              <button onClick={() => {
                setShowCreateModal(false);
                setNewUser({ studentId: '', password: '' });
                setError('');
              }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateStudentUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Select Student</label>
                <select
                  name="studentId"
                  value={newUser.studentId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">-- Select a student --</option>
                  {getAvailableStudents().map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.studentId}) - {student.email}
                    </option>
                  ))}
                  {getAvailableStudents().length === 0 && (
                    <option value="" disabled>No students available</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="text"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={getAvailableStudents().length === 0}
                  className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ studentId: '', password: '' });
                    setError('');
                  }}
                  className="flex-1 bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;