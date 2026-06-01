import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, studentsAPI, getUserData, isStudent } from '../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const userData = getUserData();

  const fetchEvents = async () => {
    try {
      const eventsRes = await eventsAPI.getAll();
      setEvents(eventsRes.data);
      if (userData?.studentRef) {
        const myEvents = eventsRes.data.filter(event =>
          event.registeredStudents.some(
            reg => reg.student === userData.studentRef || reg.student?._id === userData.studentRef
          )
        );
        setMyRegistrations(myEvents);
      }
    } catch (error) {
      if (error.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error fetching events:', error);
      }
    }
  };

  useEffect(() => {
    if (!userData || !isStudent()) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [userData, navigate]);

  const handleRegister = async (event) => {
    try {
      await studentsAPI.registerSelfForEvent(event._id);
      fetchEvents();
      setShowEventModal(false);
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      }
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const isRegistered = (event) => {
    return myRegistrations.some(e => e._id === event._id);
  };

  const getApprovalStatus = (event) => {
    if (!userData?.studentRef) return null;
    const reg = event.registeredStudents.find(
      rs => rs.student?._id === userData.studentRef || rs.student === userData.studentRef
    );
    return reg?.approvalStatus || null;
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming') {
      return event.status === 'upcoming' || event.status === 'ongoing';
    } else if (filter === 'my') {
      return isRegistered(event);
    }
    return true;
  });

  const getStatusStyles = (status) => {
    if (status === 'upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'ongoing') return 'bg-green-100 text-green-700';
    return 'bg-brand-100 text-brand-600';
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Student Dashboard</h2>
          <p className="text-sm text-brand-500 mt-1 font-medium">Welcome, <span className="text-brand-700">{userData.name}</span></p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'upcoming'
              ? 'bg-ssc-red-600 text-white'
              : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setFilter('my')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'my'
              ? 'bg-ssc-red-600 text-white'
              : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
          }`}
        >
          My Registrations
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-brand-400 font-medium">No events available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${getStatusStyles(event.status)}`}>
                    {event.status || 'upcoming'}
                  </span>
                  {getApprovalStatus(event) && (
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${
                      getApprovalStatus(event) === 'approved' ? 'bg-green-100 text-green-700' :
                      getApprovalStatus(event) === 'disapproved' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getApprovalStatus(event)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-brand-900 text-lg mb-2">{event.title}</h3>
                <p className="text-sm text-brand-600 mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-500">Date</span>
                    <span className="text-brand-900">{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-500">Time</span>
                    <span className="text-brand-900">{event.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-500">Location</span>
                    <span className="text-brand-900">{event.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleEventClick(event)}
                  className="mt-5 w-full px-4 py-2.5 bg-ssc-red-600 hover:bg-ssc-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              {selectedEvent.requiresPayment && (
                <p><strong>Payment:</strong> ₱{selectedEvent.paymentAmount}</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              {isRegistered(selectedEvent) ? (
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleRegister(selectedEvent)}
                    className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;