import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI, eventsAPI, attendanceAPI, getUserData, isAdmin } from '../services/api';

const Archive = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [archivedAttendance, setArchivedAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const userData = getUserData();
  const isAdminUser = isAdmin();

  useEffect(() => {
    if (!userData || !isAdminUser) {
      navigate('/login');
      return;
    }
    fetchArchivedData();
  }, []);

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const [studentsRes, eventsRes] = await Promise.all([
        studentsAPI.getAll(true),
        eventsAPI.getAll(true),
      ]);
      const students = (studentsRes?.data || []).filter(s => s.isArchived);
      const events = (eventsRes?.data || []).filter(e => e.isArchived);
      setArchivedStudents(students);
      setArchivedEvents(events);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to fetch archived data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getAll(true);
      setArchivedAttendance((response?.data || []).filter(a => a.isArchived));
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to fetch archived attendance');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type, id) => {
    if (!window.confirm(`Are you sure you want to restore this ${type}?`)) return;

    try {
      if (type === 'student') {
        await studentsAPI.restore(id);
        setArchivedStudents(archivedStudents.filter(s => s._id !== id));
      } else if (type === 'event') {
        await eventsAPI.restore(id);
        setArchivedEvents(archivedEvents.filter(e => e._id !== id));
      } else if (type === 'attendance') {
        await attendanceAPI.restore(id);
        setArchivedAttendance(archivedAttendance.filter(a => a._id !== id));
      }
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} restored successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || `Failed to restore ${type}`);
      }
    }
  };

  const handleDeletePermanent = async (type, id) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${type}? This action cannot be undone.`)) return;

    try {
      if (type === 'student') {
        await studentsAPI.delete(id);
        setArchivedStudents(archivedStudents.filter(s => s._id !== id));
      } else if (type === 'event') {
        await eventsAPI.delete(id);
        setArchivedEvents(archivedEvents.filter(e => e._id !== id));
      } else if (type === 'attendance') {
        await attendanceAPI.delete(id);
        setArchivedAttendance(archivedAttendance.filter(a => a._id !== id));
      }
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} permanently deleted`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || `Failed to delete ${type}`);
      }
    }
  };

  const filteredStudents = archivedStudents.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      s.name?.toLowerCase().includes(searchLower) ||
      s.USN?.toLowerCase().includes(searchLower) ||
      s.email?.toLowerCase().includes(searchLower);
    const matchesDepartment = !filterDepartment || s.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const filteredEvents = archivedEvents.filter(e => {
    const searchLower = searchTerm.toLowerCase();
    return (
      e.title?.toLowerCase().includes(searchLower) ||
      e.location?.toLowerCase().includes(searchLower) ||
      e.department?.toLowerCase().includes(searchLower)
    );
  });

  const filteredAttendance = archivedAttendance.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    return (
      a.student?.name?.toLowerCase().includes(searchLower) ||
      a.student?.USN?.toLowerCase().includes(searchLower) ||
      a.event?.title?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Archive Management</h2>
        <p className="text-sm text-brand-500 mt-1 font-medium">Manage archived and historical records</p>
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
        <div className="flex border-b border-brand-200 bg-brand-50/50">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'students'
                ? 'text-ssc-red-600 border-b-2 border-ssc-red-600 bg-white'
                : 'text-brand-500 hover:text-brand-700 hover:bg-brand-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Archived Students ({archivedStudents.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'events'
                ? 'text-ssc-red-600 border-b-2 border-ssc-red-600 bg-white'
                : 'text-brand-500 hover:text-brand-700 hover:bg-brand-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Archived Events ({archivedEvents.length})
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('attendance');
              fetchArchivedAttendance();
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'attendance'
                ? 'text-ssc-red-600 border-b-2 border-ssc-red-600 bg-white'
                : 'text-brand-500 hover:text-brand-700 hover:bg-brand-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Archived Records ({archivedAttendance.length})
            </div>
          </button>
        </div>

        <div className="p-5 border-b border-brand-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder={`Search archived ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              />
            </div>
            {activeTab === 'students' && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
              >
                <option value="">All Departments</option>
                <option value="Business Department">Business Department</option>
                <option value="Information Technology Dept.">Information Technology Dept.</option>
                <option value="Hospitality Management Dept.">Hospitality Management Dept.</option>
                <option value="Education Dept.">Education Dept.</option>
              </select>
            )}
            {loading && (
              <div className="flex items-center text-sm text-brand-500">
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="4" />
                </svg>
                Loading...
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[60vh]">
          {activeTab === 'students' && (
            <table className="w-full">
              <thead className="bg-brand-50/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">USN</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Archived Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-brand-400 text-sm font-medium">
                      {searchTerm || filterDepartment ? 'No archived students match your filters' : 'No archived students found'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-brand-900">{student.name}</td>
                      <td className="px-6 py-4 text-sm font-mono text-brand-600">{student.USN}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{student.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">
                        {student.archivedAt ? formatDate(student.archivedAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore('student', student._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6m0 0l6-6m-6 6h12" />
                            </svg>
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeletePermanent('student', student._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'events' && (
            <table className="w-full">
              <thead className="bg-brand-50/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Archived Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-brand-400 text-sm font-medium">
                      {searchTerm ? 'No archived events match your search' : 'No archived events found'}
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-brand-900">{event.title}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{formatDate(event.startDate)}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{formatDate(event.endDate)}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{event.location}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{event.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">
                        {event.archivedAt ? formatDate(event.archivedAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore('event', event._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6m0 0l6-6m-6 6h12" />
                            </svg>
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeletePermanent('event', event._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'attendance' && (
            <table className="w-full">
              <thead className="bg-brand-50/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Archived Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-brand-400 text-sm font-medium">
                      {searchTerm ? 'No archived records match your search' : 'No archived attendance records found'}
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-brand-900">{record.student?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-mono text-brand-600">{record.student?.USN || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-brand-600">{record.event?.title || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-600">
                        {record.archivedAt ? formatDate(record.archivedAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore('attendance', record._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6m0 0l6-6m-6 6h12" />
                            </svg>
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeletePermanent('attendance', record._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;