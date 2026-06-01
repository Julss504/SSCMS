import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, studentsAPI, getUserData, isAdmin } from '../services/api';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);
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
  const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const userData = getUserData();

  const fetchData = async () => {
    try {
      const eventsRes = await eventsAPI.getAll();
      setEvents(eventsRes.data);
      if (isAdmin()) {
        const studentsRes = await studentsAPI.getAll();
        setStudents(studentsRes.data);
      }
    } catch (error) {
      if (error.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [userData, navigate]);

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
        startDate: ((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)(new Date(event.startDate)),
        endDate: ((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)(new Date(event.endDate)),
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
        setEvents(events.filter(event => event._id !== id));
      } catch (error) {
        if (error.message === 'Session expired. Please log in again.') {
          console.warn('Session expired, redirecting to login');
        } else {
          alert('Error deleting event: ' + error.message);
        }
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this event?')) {
      try {
        await eventsAPI.archive(id);
        setEvents(events.filter(event => event._id !== id));
      } catch (error) {
        if (error.message === 'Session expired. Please log in again.') {
          console.warn('Session expired, redirecting to login');
        } else {
          alert('Error archiving event: ' + error.message);
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

  const openRegistrantsModal = (event) => {
    setSelectedEvent(event);
    setShowRegistrantsModal(true);
  };

  const handleApprove = async (studentId) => {
    try {
      await eventsAPI.approveRegistration(selectedEvent._id, studentId);
      setSelectedEvent({
        ...selectedEvent,
        registeredStudents: selectedEvent.registeredStudents.map(rs =>
          rs.student._id === studentId ? { ...rs, approvalStatus: 'approved' } : rs
        ),
      });
      setEvents(events.map(e => e._id === selectedEvent._id ? { ...selectedEvent } : e));
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to approve registration');
      }
    }
  };

  const handleDisapprove = async (studentId) => {
    try {
      await eventsAPI.disapproveRegistration(selectedEvent._id, studentId);
      setSelectedEvent({
        ...selectedEvent,
        registeredStudents: selectedEvent.registeredStudents.map(rs =>
          rs.student._id === studentId ? { ...rs, approvalStatus: 'disapproved' } : rs
        ),
      });
      setEvents(events.map(e => e._id === selectedEvent._id ? { ...selectedEvent } : e));
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Failed to disapprove registration');
      }
    }
  };


  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 tracking-tight">
              {isAdmin() ? 'Event Management' : 'Events'}
            </h2>
            <p className="text-sm text-brand-500 mt-1 font-medium">
              {isAdmin() ? 'Manage and organize all events' : 'Browse and register for upcoming events'}
            </p>
          </div>
          {isAdmin() && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ssc-red-600 hover:bg-ssc-red-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-ssc-red-600/15 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add New Event
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-sm text-brand-400 font-medium">No events found</p>
          </div>
) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200 bg-brand-50/50">
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Title</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Start Date</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">End Date</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Time</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Location</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Registered</th>
                  {isAdmin() && (
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
                  )}
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Register</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {events.map((event) => {
                  const start = new Date(event.startDate);
                  const end = new Date(event.endDate);
                  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={event._id} className="hover:bg-brand-50/50 transition-colors group">
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-brand-900 text-sm">{event.title}</span>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{new Date(event.startDate).toLocaleDateString()}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{new Date(event.endDate).toLocaleDateString()}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{event.time}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{event.location}</td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-md bg-brand-100 text-brand-600">
                          {event.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{duration} day{duration !== 1 ? 's' : ''}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{event.registeredStudents?.length || 0}</td>
{isAdmin() && (
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleEdit(event)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                            <button
                              onClick={() => handleArchive(event._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.844 4.25-8.25 4.25S3.75 8.653 3.75 6.375m16.5 0c0-1.163-.185-2.266-.5-3.25M20.25 6.375v13.5m-16.5-13.5v13.5m16.5 0v3.75c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125v-3.75m16.5 0c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125" />
                              </svg>
                              Archive
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => openRegistrantsModal(event)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Registrants
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-dropdown max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-brand-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {error && (
              <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min={today}
                    className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    min={today}
                    className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
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
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Payment Amount (₱)</label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowRegisterModal(false)}>
          <div className="bg-white rounded-2xl shadow-dropdown max-w-md w-full p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-brand-900">Register Student for Event</h3>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors">
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
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Event</label>
                <p className="text-sm text-brand-900 font-semibold bg-brand-50 px-4 py-2.5 rounded-xl border border-brand-200">{selectedEvent?.title}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                       {student.name} ({student.USN})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRegisterStudent}
                  disabled={!selectedStudent}
                  className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Register Student
                </button>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRegistrantsModal && selectedEvent && (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowRegistrantsModal(false)}>
          <div className="bg-white rounded-2xl shadow-dropdown max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-brand-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Event Registrants: <span className="text-ssc-red-600">{selectedEvent.title}</span></h3>
                </div>
                <button onClick={() => setShowRegistrantsModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {error && (
              <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-2 text-sm font-medium">
                {error}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-200 bg-brand-50/50">
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Name</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Student ID</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Department</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Registered At</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Status</th>
                    {isAdmin() && (
                      <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {selectedEvent.registeredStudents?.map((rs) => (
                    <tr key={rs.student._id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="py-3.5 px-5 text-sm text-brand-900">{rs.student.name}</td>
                       <td className="py-3.5 px-5 text-sm text-brand-600">{rs.student.USN}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{rs.student.email}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{rs.student.department || 'N/A'}</td>
                      <td className="py-3.5 px-5 text-sm text-brand-600">{new Date(rs.registeredAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${
                          rs.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          rs.approvalStatus === 'disapproved' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rs.approvalStatus || 'Pending'}
                        </span>
                      </td>
                      {isAdmin() && (
                        <td className="py-3.5 px-5">
                          <div className="flex gap-2">
                            {rs.approvalStatus !== 'approved' && (
                              <button
                                onClick={() => handleApprove(rs.student._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Approve
                              </button>
                            )}
                            {rs.approvalStatus !== 'disapproved' && (
                              <button
                                onClick={() => handleDisapprove(rs.student._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Disapprove
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {(!selectedEvent.registeredStudents || selectedEvent.registeredStudents.length === 0) && (
                    <tr>
                      <td colSpan={isAdmin() ? 7 : 6} className="py-12 text-center text-brand-400 text-sm font-medium">
                        No registrants yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;