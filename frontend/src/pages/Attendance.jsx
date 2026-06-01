import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, attendanceAPI, getUserData, isAdmin, isOfficer, removeToken, removeUserData } from '../services/api';

const Attendance = ({ hideNav = false }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const userData = getUserData();
  const isAdminUser = isAdmin();
  const isOfficerUser = isOfficer();
  const departments = ['Business Department', 'Information Technology Dept.', 'Hospitality Management Dept.', 'Education Dept.'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      // Handle session expired error
      if (error.message === 'Session expired. Please log in again.') {
        // The auth data has been cleared by apiRequest, 
        // ProtectedRoute will redirect to login on next render
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error fetching events:', error);
      }
    }
  };

  const fetchAttendance = async (eventId) => {
    try {
      const response = await attendanceAPI.getByEvent(eventId);
      setAttendanceData(response.data);
      setCurrentPage(1);
    } catch (error) {
      // Handle session expired error
      if (error.message === 'Session expired. Please log in again.') {
        // The auth data has been cleared by apiRequest, 
        // ProtectedRoute will redirect to login on next render
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error fetching attendance:', error);
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchAttendance(event._id);
  };

  const handleAttendanceUpdate = async (studentId, present) => {
    try {
      await attendanceAPI.updateByEvent(selectedEvent._id, studentId, { present });
      setAttendanceData(prevData => 
        prevData.map(record => 
          record.student._id === studentId 
            ? { ...record, present } 
            : record
        )
      );
    } catch (error) {
      if (error.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error updating attendance:', error);
      }
    }
  };

  const filteredStudents = attendanceData.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const name = record.student.name?.toLowerCase() || '';
     const studentId = record.student.USN?.toLowerCase() || '';
    const department = record.student.department?.toLowerCase() || '';
    const year = record.student.year?.toLowerCase() || '';
    const section = record.student.section?.toLowerCase() || '';

    const matchesSearch = 
      name.includes(searchLower) ||
      studentId.includes(searchLower) ||
      department.includes(searchLower) ||
      year.includes(searchLower) ||
      section.includes(searchLower);
    
    const matchesDepartment = !filterDepartment || record.student.department === filterDepartment;
    const matchesYear = !filterYear || record.student.year === filterYear;
    const matchesSection = !filterSection || record.student.section === filterSection;

    return matchesSearch && matchesDepartment && matchesYear && matchesSection;
  }).sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.student.name?.toLowerCase() || '';
        bVal = b.student.name?.toLowerCase() || '';
        break;
      case 'department':
        aVal = a.student.department?.toLowerCase() || '';
        bVal = b.student.department?.toLowerCase() || '';
        break;
      case 'year':
        aVal = a.student.year?.toLowerCase() || '';
        bVal = b.student.year?.toLowerCase() || '';
        break;
      case 'section':
        aVal = a.student.section?.toLowerCase() || '';
        bVal = b.student.section?.toLowerCase() || '';
        break;
      default:
        aVal = a.student.name?.toLowerCase() || '';
        bVal = b.student.name?.toLowerCase() || '';
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    if (status === 'upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'ongoing') return 'bg-green-100 text-green-700';
    return 'bg-brand-100 text-brand-600';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">
          {isAdminUser ? 'Attendance Management' : isOfficerUser ? 'Attendance Tracker' : 'Attendance'}
        </h2>
        <p className="text-sm text-brand-500 mt-1 font-medium">
          {isAdminUser
            ? 'Mark and manage attendance for all events'
            : isOfficerUser
              ? 'Track and update attendance for assigned events'
              : 'Select an event to track attendance'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 p-5 mb-6">
        <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Select Event</label>
        <select
          value={selectedEvent?._id || ''}
          onChange={(e) => {
            const event = events.find(ev => ev._id === e.target.value);
            if (event) handleEventSelect(event);
          }}
          className="w-full md:w-96 px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
        >
          <option value="">-- Select an event --</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.title} ({new Date(event.startDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedEvent ? (
        <div className="bg-white rounded-2xl shadow-card border border-brand-100">
          <div className="p-6 border-b border-brand-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">{selectedEvent.title}</h3>
                </div>
                <p className="text-sm text-brand-500">
                  {new Date(selectedEvent.startDate).toLocaleDateString()} at {selectedEvent.time}
                </p>
              </div>
              <span className={`inline-flex text-xs font-semibold px-3 py-1 rounded-lg ${getStatusBadge(selectedEvent.status)}`}>
                {selectedEvent.status}
              </span>
            </div>
          </div>

          <div className="p-5 border-b border-brand-100">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search students by name, ID, department, year, or section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              {['department', 'year', 'section'].map(field => (
                <select
                  key={field}
                  value={field === 'department' ? filterDepartment : field === 'year' ? filterYear : filterSection}
                  onChange={(e) => {
                    if (field === 'department') setFilterDepartment(e.target.value);
                    if (field === 'year') setFilterYear(e.target.value);
                    if (field === 'section') setFilterSection(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">All {field.charAt(0).toUpperCase() + field.slice(1)}s</option>
                </select>
              ))}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                  <option value="year">Sort by Year</option>
                  <option value="section">Sort by Section</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-50 border border-brand-200 text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200 bg-brand-50/50">
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Student</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Student ID</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Year</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Section</th>
                  <th className="text-center py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-brand-400 text-sm font-medium">
                      {searchTerm || filterDepartment || filterYear || filterSection ? 'No students found matching filters' : 'No attendance records for this event'}
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(record => (
                    <tr key={record.student._id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="py-3.5 px-5 text-sm font-semibold text-brand-900">{record.student.name}</td>
                       <td className="py-3.5 px-5 text-sm font-mono font-medium text-brand-800">{record.student.USN}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{record.student.department || 'N/A'}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{record.student.year || 'N/A'}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{record.student.section || 'N/A'}</td>
                       <td className="text-center py-3.5 px-5">
                        {isAdminUser ? (
                          <button
                            onClick={() => handleAttendanceUpdate(record.student._id, !record.present)}
                            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                              record.present
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/15'
                                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/15'
                            }`}
                          >
                            {record.present ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Present
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Absent
                              </>
                            )}
                          </button>
                        ) : (
                          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold ${
                            record.present
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-5 border-t border-brand-100 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-brand-200 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                    currentPage === page
                      ? 'bg-ssc-red-600 text-white shadow-lg shadow-ssc-red-600/15'
                      : 'border border-brand-200 text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-brand-200 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-brand-100 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-brand-900 mb-2">Select an Event</h3>
          <p className="text-sm text-brand-500 max-w-xs mx-auto">Choose an event from the dropdown to start managing attendance records.</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;