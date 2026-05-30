import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, getUserData, isAdmin, removeToken, removeUserData } from '../services/api';
import Logo from '../components/Logo';

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedEvent, setSelectedEvent] = useState(null);
   const [showEventModal, setShowEventModal] = useState(false);
   const [modalEvent, setModalEvent] = useState(null);
   const userData = getUserData();

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
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 35 - days.length; // 5 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days.slice(0, 35); // Ensure exactly 5 weeks
  };

  // Get events for specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      return date >= eventStartDate && date <= eventEndDate;
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

const handleEventClick = (event) => {
     setModalEvent(event);
     setShowEventModal(true);
   };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const calendarDays = generateCalendarDays();
  const selectedDateEvents = getEventsForDate(selectedDate);
  const today = new Date();

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
                className="text-ssc-red-600 font-semibold px-3 py-2 rounded-md bg-ssc-red-50"
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
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <div className="text-gray-600">
            Welcome, <span className="font-semibold text-gray-900">{userData.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={prevMonth} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button 
                    onClick={nextMonth} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div 
                    key={day} 
                    className="text-center text-sm font-semibold text-gray-700 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                  const hasEvents = getEventsForDate(date).length > 0;
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isUpcoming = date > today && date.toDateString() !== today.toDateString();

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'bg-ssc-red-50 border-ssc-red-200' : ''}
                        ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                        ${hasEvents ? 'border-l-4 border-l-ssc-red-500' : ''}
                        ${isUpcoming ? 'opacity-60' : ''}
                        hover:bg-gray-50
                      `}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold ${
                          isToday ? 'text-ssc-red-600' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>
                      {hasEvents && (
                        <div className="mt-2 space-y-1">
                          {getEventsForDate(date).slice(0, 2).map(event => (
                            <div
                              key={event._id}
                              className={`text-xs px-2 py-1 rounded cursor-pointer hover:bg-ssc-red-200 ${
                                isUpcoming 
                                  ? 'bg-ssc-red-100/60 text-ssc-red-800/60' 
                                  : 'bg-ssc-red-100 text-ssc-red-800'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {getEventsForDate(date).length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{getEventsForDate(date).length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
         </div>
       </div>
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEventModal(false)}>
         {showEventModal && (
           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
             <h3 className="text-xl font-bold text-gray-900 mb-4">Event Details</h3>
             <div className="space-y-2 text-sm">
               <p><strong>Title:</strong> {modalEvent?.title}</p>
               <p><strong>Description:</strong> {modalEvent?.description}</p>
               <p><strong>Time:</strong> {modalEvent?.time}</p>
               <p><strong>Location:</strong> {modalEvent?.location}</p>
               <p><strong>Department:</strong> {modalEvent?.department === 'all' ? 'All Departments' : modalEvent?.department}</p>
               <p><strong>Registered:</strong> {modalEvent?.registeredStudents?.length || 0}</p>
               <p><strong>Status:</strong> {modalEvent?.status}</p>
             </div>
             <div className="mt-6 flex justify-end">
               <button
                 onClick={() => {
                   setShowEventModal(false);
                   setModalEvent(null);
                 }}
                 className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
               >
                 Close
               </button>
             </div>
           </div>
         )}
       </div>
     </div>

          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No events on this date
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event._id}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-colors
                        ${selectedEvent?._id === event._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                        hover:border-ssc-red-300 hover:bg-ssc-red-50
                      `}
                      onClick={() => handleEventClick(event)}
                    >
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.time}</p>
                      <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {event.department === 'all' ? 'All Departments' : event.department}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        {event.registeredStudents?.length || 0} registered
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedEvent && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {selectedEvent.title}</p>
                    <p><strong>Description:</strong> {selectedEvent.description}</p>
                    <p><strong>Time:</strong> {selectedEvent.time}</p>
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    <p><strong>Department:</strong> {selectedEvent.department === 'all' ? 'All Departments' : selectedEvent.department}</p>
                    <p><strong>Registered:</strong> {selectedEvent.registeredStudents?.length || 0}</p>
                    <p><strong>Status:</strong> {selectedEvent.status}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
