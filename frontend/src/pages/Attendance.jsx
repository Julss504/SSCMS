import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, attendanceAPI, getUserData, isAdmin, removeToken, removeUserData } from '../services/api';
import Logo from '../components/Logo';

const Attendance = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const userData = getUserData();
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
     } finally {
       setLoading(false);
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
       // Handle session expired error
       if (error.message === 'Session expired. Please log in again.') {
         // The auth data has been cleared by apiRequest, 
         // ProtectedRoute will redirect to login on next render
         console.warn('Session expired, redirecting to login');
       } else {
         console.error('Error updating attendance:', error);
       }
     }
   };

  const filteredStudents = attendanceData.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const name = record.student.name?.toLowerCase() || '';
    const studentId = record.student.studentId?.toLowerCase() || '';
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
                className="text-ssc-red-600 font-semibold px-3 py-2 rounded-md bg-ssc-red-50"
              >
                Attendance
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
        <div className="page-header flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700">Select Event:</label>
            <select
              value={selectedEvent?._id || ''}
              onChange={(e) => {
                const event = events.find(ev => ev._id === e.target.value);
                if (event) handleEventSelect(event);
              }}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none"
            >
              <option value="">-- Select an event --</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} - {new Date(event.startDate).toLocaleDateString()} at {event.time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedEvent ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
              <p className="text-gray-600">
                {new Date(selectedEvent.startDate).toLocaleDateString()} at {selectedEvent.time}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search students by name, ID, department, year, or section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none"
                />
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filterSection}
                onChange={(e) => { setFilterSection(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none"
              >
                <option value="">All Sections</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="department">Sort by Department</option>
                  <option value="year">Sort by Year</option>
                  <option value="section">Sort by Section</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Section</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Present</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        {searchTerm || filterDepartment || filterYear || filterSection ? 'No students found matching filters' : 'No attendance records for this event'}
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map(record => (
                      <tr key={record.student._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{record.student.name}</td>
                        <td className="py-3 px-4">{record.student.studentId}</td>
                        <td className="py-3 px-4">{record.student.department || 'N/A'}</td>
                        <td className="py-3 px-4">{record.student.year || 'N/A'}</td>
                        <td className="py-3 px-4">{record.student.section || 'N/A'}</td>
                        <td className="text-center py-3 px-4">
                          <button
                            onClick={() => handleAttendanceUpdate(record.student._id, !record.present)}
                            className={`
                              px-4 py-2 rounded-lg font-medium transition-colors
                              ${record.present 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'}
                            `}
                          >
                            {record.present ? 'Present' : 'Absent'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-4 py-2 rounded-lg transition-colors
                      ${currentPage === page ? 'bg-ssc-red-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select an Event</h3>
            <p className="text-gray-600">
              Choose an event from the dropdown to manage attendance
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
