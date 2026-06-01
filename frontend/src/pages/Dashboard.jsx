import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, getUserData } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const userData = getUserData();

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      if (error.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error fetching events:', error);
      }
    }
  };

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [userData, navigate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days.slice(0, 35);
  };

  const normalizeDate = (d) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getEventsForDate = (date) => {
    const normDate = normalizeDate(date);
    return events.filter(event => {
      const eventStartDate = normalizeDate(new Date(event.startDate));
      const eventEndDate = normalizeDate(new Date(event.endDate));
      return normDate >= eventStartDate && normDate <= eventEndDate;
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


  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Dashboard</h2>
            <p className="text-sm text-brand-500 mt-1 font-medium">
              Welcome back, <span className="text-brand-700">{userData?.name}</span>
            </p>
          </div>
          <div className="text-xs text-brand-400 font-medium bg-white px-3 py-1.5 rounded-lg border border-brand-200 shadow-card">
            {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
            <div className="p-6 border-b border-brand-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ssc-red-50 flex items-center justify-center text-ssc-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-900">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-brand-500 font-medium">Calendar Overview</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={nextMonth}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 border border-brand-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-brand-400 py-2 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                  const hasEvents = getEventsForDate(date).length > 0;
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isUpcoming = date > today && date.toDateString() !== today.toDateString();

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        min-h-[5.5rem] p-2 rounded-xl cursor-pointer transition-all duration-150 border
                        ${!isCurrentMonth
                          ? 'bg-brand-50/50 text-brand-300 border-transparent'
                          : isSelected
                            ? 'bg-ssc-red-50 border-ssc-red-200 shadow-sm'
                            : hasEvents
                              ? 'bg-white border-brand-200 hover:border-brand-300 hover:shadow-card'
                              : 'bg-white border-brand-100 hover:border-brand-300 hover:shadow-card'
                        }
                        ${isToday && !isSelected ? 'ring-2 ring-ssc-red-400/40 ring-offset-1' : ''}
                        ${isUpcoming && isCurrentMonth ? 'opacity-75' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-lg ${
                          isToday
                            ? 'bg-ssc-red-600 text-white'
                            : isSelected
                              ? 'text-ssc-red-700'
                              : 'text-brand-700'
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>
                      {hasEvents && (
                        <div className="mt-1.5 space-y-1">
                          {getEventsForDate(date).slice(0, 2).map(event => (
                            <div
                              key={event._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate cursor-pointer transition-colors ${
                                isUpcoming
                                  ? 'bg-ssc-red-50 text-ssc-red-600/70'
                                  : 'bg-ssc-red-100 text-ssc-red-700'
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {getEventsForDate(date).length > 2 && (
                            <div className="text-[10px] text-brand-400 font-medium pl-1">
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
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card border border-brand-100">
            <div className="p-6 border-b border-brand-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-brand-500 font-medium">
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 max-h-[32rem] overflow-y-auto">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-brand-400 font-medium">No events on this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event._id}
                      onClick={() => handleEventClick(event)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 hover:shadow-card-hover ${
                        selectedEvent?._id === event._id
                          ? 'border-ssc-red-200 bg-ssc-red-50/50 shadow-sm'
                          : 'border-brand-200 hover:border-brand-300 hover:bg-brand-50/30'
                      }`}
                    >
                      <h4 className="font-semibold text-brand-900 text-sm">{event.title}</h4>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-brand-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          event.department === 'all'
                            ? 'bg-brand-100 text-brand-600'
                            : 'bg-ssc-red-50 text-ssc-red-600'
                        }`}>
                          {event.department === 'all' ? 'All Departments' : event.department}
                        </span>
                        <span className="text-[11px] text-brand-400 font-medium">
                          {event.registeredStudents?.length || 0} registered
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedEvent && (
              <div className="p-4 border-t border-brand-100 bg-brand-50/50">
                <h4 className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-3">Event Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-brand-500 w-24 flex-shrink-0 text-xs font-medium">Title</span>
                    <span className="text-brand-800 font-medium">{selectedEvent.title}</span>
                  </div>
                  <div className="flex">
                    <span className="text-brand-500 w-24 flex-shrink-0 text-xs font-medium">Description</span>
                    <span className="text-brand-800 text-xs">{selectedEvent.description}</span>
                  </div>
                  <div className="flex">
                    <span className="text-brand-500 w-24 flex-shrink-0 text-xs font-medium">Time</span>
                    <span className="text-brand-800 text-xs">{selectedEvent.time}</span>
                  </div>
                  <div className="flex">
                    <span className="text-brand-500 w-24 flex-shrink-0 text-xs font-medium">Location</span>
                    <span className="text-brand-800 text-xs">{selectedEvent.location}</span>
                  </div>
                  <div className="flex">
                    <span className="text-brand-500 w-24 flex-shrink-0 text-xs font-medium">Department</span>
                    <span className="text-brand-800 text-xs">
                      {selectedEvent.department === 'all' ? 'All Departments' : selectedEvent.department}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-brand-500 w-24 flex-shrink-0 text-xs font-medium">Status</span>
                    <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      selectedEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      selectedEvent.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-brand-100 text-brand-600'
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowEventModal(false)}>
          <div className="bg-white rounded-2xl shadow-dropdown max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-brand-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ssc-red-50 flex items-center justify-center text-ssc-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Event Details</h3>
                </div>
                <button onClick={() => setShowEventModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Title</span>
                  <p className="text-sm text-brand-900 font-medium mt-1">{modalEvent?.title}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Description</span>
                  <p className="text-sm text-brand-700 mt-1">{modalEvent?.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Start Date</span>
                    <p className="text-sm text-brand-900 font-medium mt-1">{modalEvent?.startDate && new Date(modalEvent.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">End Date</span>
                    <p className="text-sm text-brand-900 font-medium mt-1">{modalEvent?.endDate && new Date(modalEvent.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Time</span>
                    <p className="text-sm text-brand-900 font-medium mt-1">{modalEvent?.time}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Location</span>
                    <p className="text-sm text-brand-900 font-medium mt-1">{modalEvent?.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Department</span>
                    <p className="text-sm text-brand-900 font-medium mt-1">
                      {modalEvent?.department === 'all' ? 'All Departments' : modalEvent?.department}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Registered</span>
                    <p className="text-sm text-brand-900 font-medium mt-1">{modalEvent?.registeredStudents?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-brand-500 uppercase tracking-wider">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${
                      modalEvent?.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      modalEvent?.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-brand-100 text-brand-600'
                    }`}>
                      {modalEvent?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-brand-50/50 border-t border-brand-100 flex justify-end">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setModalEvent(null);
                }}
                className="px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;