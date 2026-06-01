import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserData, isAdmin, removeToken, removeUserData } from '../services/api';
import Logo from './Logo';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home', roles: ['admin', 'officer'] },
  { path: '/events', label: 'Events', icon: 'calendar', roles: ['admin', 'officer', 'student'] },
  { path: '/students', label: 'Students', icon: 'users', roles: ['admin'] },
  { path: '/attendance', label: 'Attendance', icon: 'clipboard', roles: ['admin', 'officer'] },
  { path: '/users', label: 'Users', icon: 'shield', roles: ['admin'] },
  { path: '/archive', label: 'Archives', icon: 'archive', roles: ['admin'] },
];

const sidebarLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home', roles: ['admin', 'officer'] },
  { path: '/events', label: 'Events', icon: 'calendar', roles: ['admin', 'officer', 'student'] },
  { path: '/students', label: 'Students', icon: 'users', roles: ['admin'] },
  { path: '/attendance', label: 'Attendance', icon: 'clipboard', roles: ['admin', 'officer'] },
  { path: '/users', label: 'Users', icon: 'shield', roles: ['admin'] },
  { path: '/archive', label: 'Archives', icon: 'archive', roles: ['admin'] },
];

const icons = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l9-8.25 9 8.25M3.75 10.5V21h16.5V10.5M6 21V13.5h12V21" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  archive: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.844 4.25-8.25 4.25S3.75 8.653 3.75 6.375m16.5 0c0-1.163-.185-2.266-.5-3.25M20.25 6.375v13.5m-16.5-13.5v13.5m16.5 0v3.75c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125v-3.75m16.5 0c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125" />
    </svg>
  ),
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = getUserData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => item.roles.some(role => userData?.role === role));

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-brand-900 text-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className={`flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'justify-center'}`}>
            <div className="flex-shrink-0">
              <img src="/src/assets/logo2.png" alt="ssc" className="h-9 w-9 object-contain" />
            </div>
            {sidebarOpen && (
              <div className="transition-opacity duration-300">
                <h1 className="text-sm font-bold text-white leading-tight tracking-tight">SSC Portal</h1>
                <p className="text-[10px] text-brand-400 font-medium">ACLC College Ormoc</p>
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest mb-3 px-2">
              Navigation
            </p>
          </div>
        )}

        <nav className="px-3 space-y-1">
          {sidebarLinks
            .filter(item => item.roles.some(role => userData?.role === role))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-ssc-red-600 text-white shadow-lg shadow-ssc-red-600/20'
                      : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                  } ${!sidebarOpen && 'justify-center'}`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-brand-400 group-hover:text-white'}`}>
                    {icons[item.icon]}
                  </span>
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-400 hover:bg-brand-800 hover:text-white transition-all duration-150 ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="flex-shrink-0">
              {sidebarOpen ? icons.chevronLeft : icons.chevronRight}
            </span>
            {sidebarOpen && <span>Collapse</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-400 hover:bg-red-600/20 hover:text-red-400 transition-all duration-150 mt-1 ${
              !sidebarOpen && 'justify-center'
            }`}
            title="Logout"
          >
            <span className="flex-shrink-0">{icons.logout}</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
