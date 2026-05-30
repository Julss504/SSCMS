import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, studentsAPI, getUserData, isAdmin, removeToken, removeUserData } from '../services/api';
import Logo from '../components/Logo';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    time: '',
    location: '',
    requiresPayment: false,
    paymentAmount: '',
    department: 'Business Department',
   });
   const [error, setError] = useState('');
   const today = new Date().toISOString().split('T')[0];
  const userData = getUserData();

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

   const fetchData = async () => {
     try {
       const [eventsRes, studentsRes] = await Promise.all([
         eventsAPI.getAll(),
         studentsAPI.getAll(),
       ]);
       setEvents(eventsRes.data);
       setStudents(studentsRes.data);
     } catch (error) {
       // Handle session expired error
       if (error.message === 'Session expired. Please log in again.') {
         // The auth data has been cleared by apiRequest, 
         // ProtectedRoute will redirect to login on next render
         console.warn('Session expired, redirecting to login');
       } else {
         console.error('Error fetching data:', error);
       }
     } finally {
       setLoading(false);
     }
   };

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

   const handleSubmit = async (e) => {
     e.preventDefault();
     setError('');

     try {
       if (editingEvent) {
         await eventsAPI.update(editingEvent._id, formData);
       } else {
         await eventsAPI.create(formData);
       }
       setShowModal(false);
       setEditingEvent(null);
       setFormData({
         title: '',
         description: '',
         startDate: '',
         endDate: '',
         time: '',
         location: '',
         requiresPayment: false,
         paymentAmount: '',
         department: 'Business Department',
       });
       fetchData();
     } catch (err) {
       // Handle session expired error
       if (err.message === 'Session expired. Please log in again.') {
         // The auth data has been cleared by apiRequest, 
         // ProtectedRoute will redirect to login on next render
         console.warn('Session expired, redirecting to login');
       } else {
         setError(err.message || 'Operation failed');
       }
     }
   };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate).toISOString().split('T')[0],
      endDate: new Date(event.endDate).toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      requiresPayment: event.requiresPayment,
      paymentAmount: event.paymentAmount,
      department: event.department || '',
    });
    setShowModal(true);
  };

   const handleDelete = async (id) => {
     if (window.confirm('Are you sure you want to delete this event?')) {
       try {
         await eventsAPI.delete(id);
         // Update state directly by removing the deleted event
         setEvents(events.filter(event => event._id !== id));
       } catch (error) {
         // Handle session expired error
         if (error.message === 'Session expired. Please log in again.') {
           // The auth data has been cleared by apiRequest, 
           // ProtectedRoute will redirect to login on next render
           console.warn('Session expired, redirecting to login');
         } else {
           alert('Error deleting event: ' + error.message);
         }
       }
     }
   };

   const handleRegisterStudent = async () => {
     try {
       await studentsAPI.registerForEvent(selectedStudent, selectedEvent._id);
       setShowRegisterModal(false);
       setSelectedStudent('');
       setSelectedEvent(null);
       fetchData();
     } catch (err) {
       // Handle session expired error
       if (err.message === 'Session expired. Please log in again.') {
         // The auth data has been cleared by apiRequest, 
         // ProtectedRoute will redirect to login on next render
         console.warn('Session expired, redirecting to login');
       } else {
         setError(err.message || 'Registration failed');
       }
     }
   };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      time: '',
      location: '',
      requiresPayment: false,
      paymentAmount: '',
      department: 'Business Department',
    });
    setShowModal(true);
  };

  const openRegisterModal = (event) => {
    setSelectedEvent(event);
    setSelectedStudent('');
    setShowRegisterModal(true);
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
                className="text-ssc-red-600 font-semibold px-3 py-2 rounded-md bg-ssc-red-50"
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
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin() ? 'Event Management' : 'Events'}
          </h2>
          {isAdmin() && (
            <button 
              onClick={openAddModal} 
              className="bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Add New Event
            </button>
          )}
        </div>

        <div className="events-table-container bg-white rounded-lg shadow-md p-6">
          {events.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-lg">No events found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead>
                   <tr className="border-b border-gray-200">
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration (Days)</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered</th>
                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                   </tr>
                 </thead>
                  <tbody>
                   {events.map((event) => {
                     // Calculate event duration in days
                     const start = new Date(event.startDate);
                     const end = new Date(event.endDate);
                     const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                     
                     return (
                     <tr key={event._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                       <td className="py-3 px-4">{event.title}</td>
                       <td className="py-3 px-4">{new Date(event.startDate).toLocaleDateString()}</td>
                       <td className="py-3 px-4">{new Date(event.endDate).toLocaleDateString()}</td>
                       <td className="py-3 px-4">{event.time}</td>
                       <td className="py-3 px-4">{event.location}</td>
                       <td className="py-3 px-4">
                         {event.department}
                       </td>
                       <td className="py-3 px-4">{duration}</td>
                       <td className="py-3 px-4">{event.registeredStudents?.length || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {isAdmin() && (
                            <>
                              <button 
                                onClick={() => handleEdit(event)} 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(event._id)} 
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => openRegisterModal(event)} 
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            Register
                          </button>
                        </div>
                      </td>
                    </tr>
                      );
                    })}
                 </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                   <input
                     type="date"
                     name="startDate"
                     value={formData.startDate}
                     onChange={handleChange}
                     required
                     min={today}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                   <input
                     type="date"
                     name="endDate"
                     value={formData.endDate}
                     onChange={handleChange}
                     required
                     min={today}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                   />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* <input
                  type="checkbox"
                  id="requiresPayment"
                  name="requiresPayment"
                  checked={formData.requiresPayment}
                  onChange={handleChange}
                  className="h-4 w-4 text-ssc-red-600 focus:ring-ssc-red-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresPayment" className="text-sm font-medium text-gray-700">
                  Requires Payment
                </label> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">All Departments</option>
                  <option value="Business Department">Business Department</option>
                  <option value="Information Technology Dept.">Information Technology Dept.</option>
                  <option value="Hospitality Management Dept.">Hospitality Management Dept.</option>
                  <option value="Education Dept.">Education Dept.</option>
                </select>
              </div>

              {formData.requiresPayment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (₱)
                  </label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Register Student for Event</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event
                </label>
                <p className="text-gray-900">{selectedEvent?.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ssc-red-500 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleRegisterStudent} 
                  disabled={!selectedStudent}
                  className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Register
                </button>
                <button 
                  onClick={() => setShowRegisterModal(false)} 
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;